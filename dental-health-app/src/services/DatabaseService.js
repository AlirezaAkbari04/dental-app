// src/services/DatabaseService.js
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

class DatabaseService {
  sqlite = null;
  db = null;
  initialized = false;
  dbName = "dental_health.db";
  
  constructor() {
    if (Capacitor.isNativePlatform()) {
      this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }
  }

  async resetDatabase() {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }
    
    try {
      console.log("Resetting database connections");
      this.initialized = false;
      this.db = null;
      
      // Check if connection exists
      const result = await this.sqlite.isConnection(this.dbName, false);
      if (result.result) {
        console.log("Closing existing connection");
        await this.sqlite.closeConnection(this.dbName, false);
      }
      
      // Create a new connection
      console.log("Creating fresh connection");
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        1,
        false
      );
      
      // Open and initialize
      await this.db.open();
      await this.createTables();
      this.initialized = true;
      console.log("Database reset successful");
      return true;
    } catch (error) {
      console.error("Failed to reset database:", error);
      return false;
    }
  }

  async ensureInitialized() {
    if (this.initialized) {
      return true;
    }

    try {
      await this.init();
      await this.createChildTables();
      await this.createParentTables();
      return true;
    } catch (error) {
      console.error('Error ensuring database is initialized:', error);
      return false;
    }
  }

  async init() {
    if (this.initialized) {
      console.log("Database already initialized, skipping");
      return;
    }

    try {
      console.log("Starting database initialization");
      if (!Capacitor.isNativePlatform()) {
        // For web development - use localStorage as fallback
        console.log("Not running on native platform, using localStorage fallback");
        this.initialized = true;
        return;
      }

      // First, check if connection already exists
      console.log("Checking for existing connections");
      try {
        const connections = await this.sqlite.isConnection(this.dbName, false);
        if (connections.result) {
          console.log("Connection already exists, retrieving it");
          this.db = await this.sqlite.retrieveConnection(this.dbName, false);
        } else {
          console.log("Creating new SQLite connection");
          this.db = await this.sqlite.createConnection(
            this.dbName,
            false,
            'no-encryption',
            1,
            false
          );
        }
        console.log("SQLite connection established");
      } catch (connError) {
        console.error("Error with connection:", connError);
        // Try creating a connection anyway if retrieving failed
        console.log("Attempting to create new connection as fallback");
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          1,
          false
        );
      }

      // Open database
      console.log("Opening database");
      await this.db.open();
      console.log("Database opened successfully");

      // Ensure tables are created
      console.log("Creating database tables");
      await this.createTables(); // Make sure this method exists and is called
      
      this.initialized = true;
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      // On error, try to use localStorage fallback even on native platforms
      console.log("Falling back to localStorage due to error");
      this.initialized = true;
    }
  }

  async createTables() {
    if (!Capacitor.isNativePlatform() || !this.db) {
      console.log("Skipping createTables for non-native platform or no db connection");
      return;
    }

    const statements = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK(role IN ('child', 'parent', 'teacher')),
        profile_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS children (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER,
        name TEXT,
        age INTEGER,
        gender TEXT,
        avatar_url TEXT,
        FOREIGN KEY (parent_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS brushing_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time_of_day TEXT NOT NULL CHECK(time_of_day IN ('morning', 'evening')),
        duration_minutes TEXT,
        brushed BOOLEAN DEFAULT 0,
        FOREIGN KEY (child_id) REFERENCES children(id),
        UNIQUE(child_id, date, time_of_day)
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        time TEXT NOT NULL,
        message TEXT,
        enabled BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, type)
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        count INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES children(id),
        UNIQUE(child_id, type)
      );

      CREATE TABLE IF NOT EXISTS game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER NOT NULL,
        game_type TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES children(id),
        UNIQUE(child_id, game_type)
      );

      CREATE TABLE IF NOT EXISTS video_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER NOT NULL,
        video_id TEXT NOT NULL,
        progress REAL DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES children(id),
        UNIQUE(child_id, video_id)
      );
      
      CREATE TABLE IF NOT EXISTS schools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caretaker_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT,
        activity_days TEXT,
        FOREIGN KEY (caretaker_id) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        age INTEGER,
        grade TEXT,
        FOREIGN KEY (school_id) REFERENCES schools(id)
      );
      
      CREATE TABLE IF NOT EXISTS health_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        record_type TEXT NOT NULL,
        details TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id)
      );
    `;

    try {
      console.log("Executing table creation statements");
      await this.db.execute({ statements });
      console.log("Tables created successfully");
    } catch (error) {
      console.error("Error creating tables:", error);
      throw error; // Rethrow to be caught by the caller
    }
  }

  // USER OPERATIONS
  async createUser(username, role) {
    console.log(`Creating user: ${username} with role: ${role}`);
    
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development or when database is not available
      console.log("Using localStorage fallback for createUser");
      const users = JSON.parse(localStorage.getItem('db_users') || '[]');
      const newUser = {
        id: users.length + 1,
        username,
        role,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('db_users', JSON.stringify(users));
      return newUser.id;
    }

    try {
      const statement = `
        INSERT INTO users (username, role)
        VALUES (?, ?)
      `;
      console.log("Executing statement:", statement, "with values:", [username, role]);
      const result = await this.db.run(statement, [username, role]);
      console.log("Insert result:", result);
      return result.changes.lastId;
    } catch (error) {
      console.error("Error creating user:", error);
      
      // Fallback to localStorage
      console.log("Using localStorage fallback due to error");
      const users = JSON.parse(localStorage.getItem('db_users') || '[]');
      const newUser = {
        id: users.length + 1,
        username,
        role,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('db_users', JSON.stringify(users));
      return newUser.id;
    }
  }
  async getUserByUsername(username) {
    console.log(`Getting user by username: ${username}`);
    
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development or when database is not available
      console.log("Using localStorage fallback for getUserByUsername");
      const users = JSON.parse(localStorage.getItem('db_users') || '[]');
      return users.find(user => user.username === username) || null;
    }

    try {
      const statement = `
        SELECT * FROM users WHERE username = ?
      `;
      console.log("Executing query:", statement, "with value:", username);
      const result = await this.db.query(statement, [username]);
      console.log("Query result:", result);
      return result.values && result.values.length > 0 ? result.values[0] : null;
    } catch (error) {
      console.error("Error getting user:", error);
      // Still provide a fallback
      const users = JSON.parse(localStorage.getItem('db_users') || '[]');
      return users.find(user => user.username === username) || null;
    }
  }

  async updateUserRole(userId, role) {
    console.log(`Updating user role: userID ${userId} to role ${role}`);
    
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      console.log("Using localStorage fallback for updateUserRole");
      const users = JSON.parse(localStorage.getItem('db_users') || '[]');
      const updatedUsers = users.map(user => {
        if (user.id === userId || user.id === parseInt(userId)) {
          console.log(`Found user ${user.id}, updating role from ${user.role} to ${role}`);
          return { ...user, role };
        }
        return user;
      });
      localStorage.setItem('db_users', JSON.stringify(updatedUsers));
      
      // Also update the currentUser in localStorage if it exists
      const currentUserString = localStorage.getItem('currentUser');
      if (currentUserString) {
        try {
          const currentUser = JSON.parse(currentUserString);
          if (currentUser.id === userId || currentUser.id === parseInt(userId)) {
            currentUser.role = role;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log("Updated role in currentUser localStorage");
          }
        } catch (e) {
          console.error("Error parsing currentUser from localStorage:", e);
        }
      }
      
      return true;
    }
  
    try {
      const statement = `
        UPDATE users SET role = ? WHERE id = ?
      `;
      await this.db.run(statement, [role, userId]);
      console.log(`Successfully updated user ${userId} role to ${role} in database`);
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      return false;
    }
  }
  async getUserById(id) {
    console.log(`Getting user by ID: ${id}`);
    
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development or when database is not available
      console.log("Using localStorage fallback for getUserById");
      const users = JSON.parse(localStorage.getItem('db_users') || '[]');
      return users.find(user => user.id === parseInt(id) || user.id === id) || null;
    }

    try {
      const statement = `
        SELECT * FROM users WHERE id = ?
      `;
      console.log("Executing query:", statement, "with value:", id);
      const result = await this.db.query(statement, [id]);
      console.log("Query result:", result);
      return result.values && result.values.length > 0 ? result.values[0] : null;
    } catch (error) {
      console.error("Error getting user:", error);
      // Still provide a fallback
      const users = JSON.parse(localStorage.getItem('db_users') || '[]');
      return users.find(user => user.id === parseInt(id) || user.id === id) || null;
    }
  }

  // CHILD OPERATIONS
  async createChild(parentId, name, age, gender, avatarUrl) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const children = JSON.parse(localStorage.getItem('db_children') || '[]');
      const newChild = {
        id: children.length + 1,
        parent_id: parentId,
        name,
        age,
        gender,
        avatar_url: avatarUrl
      };
      children.push(newChild);
      localStorage.setItem('db_children', JSON.stringify(children));
      
      // Initialize achievements
      await this.initializeChildAchievements(newChild.id);
      
      return newChild.id;
    }

    try {
      const statement = `
        INSERT INTO children (parent_id, name, age, gender, avatar_url)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [parentId, name, age, gender, avatarUrl];
      const result = await this.db.run(statement, values);
      
      // Create default achievements for the child
      if (result.changes.lastId) {
        await this.initializeChildAchievements(result.changes.lastId);
      }
      
      return result.changes.lastId;
    } catch (error) {
      console.error("Error creating child:", error);
      return null;
    }
  }

  async initializeChildAchievements(childId) {
    const achievementTypes = ['stars', 'regularBrushing', 'diamonds', 'cleanedAreas', 'healthySnacks'];
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const achievements = JSON.parse(localStorage.getItem('db_achievements') || '[]');
      
      for (const type of achievementTypes) {
        achievements.push({
          id: achievements.length + 1,
          child_id: childId,
          type,
          count: 0,
          last_updated: new Date().toISOString()
        });
      }
      
      localStorage.setItem('db_achievements', JSON.stringify(achievements));
      return;
    }
    
    try {
      for (const type of achievementTypes) {
        await this.db.run(`
          INSERT INTO achievements (child_id, type, count)
          VALUES (?, ?, 0)
        `, [childId, type]);
      }
      console.log(`Initialized achievements for child ID ${childId}`);
    } catch (error) {
      console.error("Error initializing achievements:", error);
    }
  }

  async getChildrenByParentId(parentId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const children = JSON.parse(localStorage.getItem('db_children') || '[]');
      return children.filter(child => child.parent_id === parentId || child.parent_id === parseInt(parentId));
    }

    try {
      const statement = `
        SELECT * FROM children WHERE parent_id = ?
      `;
      const result = await this.db.query(statement, [parentId]);
      return result.values || [];
    } catch (error) {
      console.error("Error getting children:", error);
      return [];
    }
  }

  async getChildById(childId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const children = JSON.parse(localStorage.getItem('db_children') || '[]');
      return children.find(child => child.id === childId || child.id === parseInt(childId)) || null;
    }

    try {
      const statement = `
        SELECT * FROM children WHERE id = ?
      `;
      const result = await this.db.query(statement, [childId]);
      return result.values && result.values.length > 0 ? result.values[0] : null;
    } catch (error) {
      console.error("Error getting child:", error);
      return null;
    }
  }

  // BRUSHING RECORD OPERATIONS
  async createBrushingRecord(childId, date, timeOfDay, durationMinutes, brushed) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const records = JSON.parse(localStorage.getItem('db_brushing_records') || '[]');
      const newRecord = {
        id: records.length + 1,
        child_id: childId,
        date,
        time_of_day: timeOfDay,
        duration_minutes: durationMinutes,
        brushed: brushed ? 1 : 0
      };
      records.push(newRecord);
      localStorage.setItem('db_brushing_records', JSON.stringify(records));
      
      // Update achievements if completed
      if (brushed) {
        await this.updateAchievement(childId, 'regularBrushing', 1);
        await this.updateAchievement(childId, 'stars', 1);
      }
      
      return newRecord.id;
    }

    try {
      // Check if record already exists
      const existingRecord = await this.getBrushingRecord(childId, date, timeOfDay);
      
      if (existingRecord) {
        // Update existing record
        return await this.updateBrushingRecord(
          existingRecord.id, 
          durationMinutes, 
          brushed
        );
      } else {
        // Create new record
        const statement = `
          INSERT INTO brushing_records (child_id, date, time_of_day, duration_minutes, brushed)
          VALUES (?, ?, ?, ?, ?)
        `;
        const values = [childId, date, timeOfDay, durationMinutes, brushed ? 1 : 0];
        const result = await this.db.run(statement, values);
        
        // Update achievements if completed
        if (brushed) {
          await this.updateAchievement(childId, 'regularBrushing', 1);
          await this.updateAchievement(childId, 'stars', 1);
        }
        
        return result.changes.lastId;
      }
    } catch (error) {
      console.error("Error creating brushing record:", error);
      return null;
    }
  }
  async getBrushingRecord(childId, date, timeOfDay) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const records = JSON.parse(localStorage.getItem('db_brushing_records') || '[]');
      return records.find(
        record => (record.child_id === childId || record.child_id === parseInt(childId)) && 
                 record.date === date && 
                 record.time_of_day === timeOfDay
      ) || null;
    }

    try {
      const statement = `
        SELECT * FROM brushing_records 
        WHERE child_id = ? AND date = ? AND time_of_day = ?
      `;
      const result = await this.db.query(statement, [childId, date, timeOfDay]);
      return result.values && result.values.length > 0 ? result.values[0] : null;
    } catch (error) {
      console.error("Error getting brushing record:", error);
      return null;
    }
  }

  async updateBrushingRecord(recordId, durationMinutes, brushed) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const records = JSON.parse(localStorage.getItem('db_brushing_records') || '[]');
      const index = records.findIndex(record => record.id === recordId || record.id === parseInt(recordId));
      
      if (index !== -1) {
        records[index].duration_minutes = durationMinutes;
        records[index].brushed = brushed ? 1 : 0;
        localStorage.setItem('db_brushing_records', JSON.stringify(records));
        return recordId;
      }
      return null;
    }

    try {
      const statement = `
        UPDATE brushing_records
        SET duration_minutes = ?, brushed = ?
        WHERE id = ?
      `;
      const values = [durationMinutes, brushed ? 1 : 0, recordId];
      await this.db.run(statement, values);
      return recordId;
    } catch (error) {
      console.error("Error updating brushing record:", error);
      return null;
    }
  }

  async getBrushingRecordsByChildId(childId, startDate = null, endDate = null) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const records = JSON.parse(localStorage.getItem('db_brushing_records') || '[]');
      let filtered = records.filter(record => record.child_id === childId || record.child_id === parseInt(childId));
      
      if (startDate) {
        filtered = filtered.filter(record => record.date >= startDate);
      }
      
      if (endDate) {
        filtered = filtered.filter(record => record.date <= endDate);
      }
      
      return filtered.sort((a, b) => {
        // Sort by date (desc) and then by time_of_day
        const dateComparison = new Date(b.date) - new Date(a.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time_of_day === 'morning' ? -1 : 1;
      });
    }

    try {
      let statement = `
        SELECT * FROM brushing_records 
        WHERE child_id = ?
      `;
      
      const params = [childId];
      
      if (startDate) {
        statement += ` AND date >= ?`;
        params.push(startDate);
      }
      
      if (endDate) {
        statement += ` AND date <= ?`;
        params.push(endDate);
      }
      
      statement += ` ORDER BY date DESC, time_of_day ASC`;
      
      const result = await this.db.query(statement, params);
      return result.values || [];
    } catch (error) {
      console.error("Error getting brushing records:", error);
      return [];
    }
  }

  async getBrushingRecordsForCalendar(childId, year, month) {
    // Format: convert to object with date keys like 2023-05-01
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
    
    const records = await this.getBrushingRecordsByChildId(childId, startDate, endDate);
    
    // Convert to format matching current localStorage structure
    const result = {};
    
    records.forEach(record => {
      if (!result[record.date]) {
        result[record.date] = {
          morning: { brushed: false, time: '' },
          evening: { brushed: false, time: '' }
        };
      }
      
      result[record.date][record.time_of_day] = {
        brushed: record.brushed === 1,
        time: record.duration_minutes || ''
      };
    });
    
    return result;
  }

  // REMINDER OPERATIONS
  async createReminder(userId, type, time, message, enabled = true) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const reminders = JSON.parse(localStorage.getItem('db_reminders') || '[]');
      const newReminder = {
        id: reminders.length + 1,
        user_id: userId,
        type,
        time,
        message,
        enabled: enabled ? 1 : 0
      };
      reminders.push(newReminder);
      localStorage.setItem('db_reminders', JSON.stringify(reminders));
      return newReminder.id;
    }

    try {
      const statement = `
        INSERT INTO reminders (user_id, type, time, message, enabled)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [userId, type, time, message, enabled ? 1 : 0];
      const result = await this.db.run(statement, values);
      return result.changes.lastId;
    } catch (error) {
      console.error("Error creating reminder:", error);
      return null;
    }
  }

  async getRemindersByUserId(userId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const reminders = JSON.parse(localStorage.getItem('db_reminders') || '[]');
      return reminders.filter(reminder => reminder.user_id === userId || reminder.user_id === parseInt(userId));
    }

    try {
      const statement = `
        SELECT * FROM reminders WHERE user_id = ?
      `;
      const result = await this.db.query(statement, [userId]);
      return result.values || [];
    } catch (error) {
      console.error("Error getting reminders:", error);
      return [];
    }
  }

  async updateReminder(id, type, time, message, enabled) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const reminders = JSON.parse(localStorage.getItem('db_reminders') || '[]');
      const index = reminders.findIndex(reminder => reminder.id === id || reminder.id === parseInt(id));
      
      if (index !== -1) {
        reminders[index].type = type;
        reminders[index].time = time;
        reminders[index].message = message;
        reminders[index].enabled = enabled ? 1 : 0;
        localStorage.setItem('db_reminders', JSON.stringify(reminders));
        return true;
      }
      return false;
    }

    try {
      const statement = `
        UPDATE reminders
        SET type = ?, time = ?, message = ?, enabled = ?
        WHERE id = ?
      `;
      const values = [type, time, message, enabled ? 1 : 0, id];
      await this.db.run(statement, values);
      return true;
    } catch (error) {
      console.error("Error updating reminder:", error);
      return false;
    }
  }
  // ACHIEVEMENT OPERATIONS
  async updateAchievement(childId, type, incrementBy = 1) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const achievements = JSON.parse(localStorage.getItem('db_achievements') || '[]');
      const achievement = achievements.find(a => (a.child_id === childId || a.child_id === parseInt(childId)) && a.type === type);
      
      if (achievement) {
        achievement.count += incrementBy;
        achievement.last_updated = new Date().toISOString();
        localStorage.setItem('db_achievements', JSON.stringify(achievements));
        return true;
      }
      return false;
    }

    try {
      const statement = `
        UPDATE achievements
        SET count = count + ?, last_updated = CURRENT_TIMESTAMP
        WHERE child_id = ? AND type = ?
      `;
      const values = [incrementBy, childId, type];
      await this.db.run(statement, values);
      return true;
    } catch (error) {
      console.error("Error updating achievement:", error);
      return false;
    }
  }

  async getAchievementsByChildId(childId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const achievements = JSON.parse(localStorage.getItem('db_achievements') || '[]');
      return achievements.filter(achievement => achievement.child_id === childId || achievement.child_id === parseInt(childId));
    }

    try {
      const statement = `
        SELECT * FROM achievements WHERE child_id = ?
      `;
      const result = await this.db.query(statement, [childId]);
      return result.values || [];
    } catch (error) {
      console.error("Error getting achievements:", error);
      return [];
    }
  }

  // School Operations for Caretaker
  async getSchoolsByCaretakerId(caretakerId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      return JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
    }

    try {
      const statement = `
        SELECT * FROM schools 
        WHERE caretaker_id = ?
      `;
      const result = await this.db.query(statement, [caretakerId]);
      return result.values || [];
    } catch (error) {
      console.error("Error getting schools:", error);
      return JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
    }
  }

  async createSchool(caretakerId, name, type, activityDays) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const schools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
      const newSchool = {
        id: Date.now().toString(),
        caretaker_id: caretakerId,
        name,
        type,
        activityDays,
        students: []
      };
      schools.push(newSchool);
      localStorage.setItem('caretakerSchools', JSON.stringify(schools));
      return newSchool.id;
    }

    try {
      const statement = `
        INSERT INTO schools (caretaker_id, name, type, activity_days)
        VALUES (?, ?, ?, ?)
      `;
      const activityDaysJson = JSON.stringify(activityDays);
      const values = [caretakerId, name, type, activityDaysJson];
      const result = await this.db.run(statement, values);
      return result.changes.lastId;
    } catch (error) {
      console.error("Error creating school:", error);
      return null;
    }
  }

  async updateSchool(schoolId, name, type, activityDays) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const schools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
      const index = schools.findIndex(school => school.id === schoolId || school.id === parseInt(schoolId));
      if (index !== -1) {
        schools[index].name = name;
        schools[index].type = type;
        schools[index].activityDays = activityDays;
        localStorage.setItem('caretakerSchools', JSON.stringify(schools));
        return true;
      }
      return false;
    }

    try {
      const statement = `
        UPDATE schools
        SET name = ?, type = ?, activity_days = ?
        WHERE id = ?
      `;
      const activityDaysJson = JSON.stringify(activityDays);
      const values = [name, type, activityDaysJson, schoolId];
      await this.db.run(statement, values);
      return true;
    } catch (error) {
      console.error("Error updating school:", error);
      return false;
    }
  }

  async deleteSchool(schoolId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const schools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
      const updatedSchools = schools.filter(school => school.id !== schoolId && school.id !== parseInt(schoolId));
      localStorage.setItem('caretakerSchools', JSON.stringify(updatedSchools));
      return true;
    }

    try {
      // First delete associated students
      await this.db.run(`DELETE FROM students WHERE school_id = ?`, [schoolId]);
      // Then delete the school
      await this.db.run(`DELETE FROM schools WHERE id = ?`, [schoolId]);
      return true;
    } catch (error) {
      console.error("Error deleting school:", error);
      return false;
    }
  }
  // Student Operations for Caretaker
  async getStudentsBySchoolId(schoolId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const schools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
      const school = schools.find(s => s.id === schoolId || s.id === parseInt(schoolId));
      return school ? school.students || [] : [];
    }

    try {
      const statement = `
        SELECT * FROM students WHERE school_id = ?
      `;
      const result = await this.db.query(statement, [schoolId]);
      return result.values || [];
    } catch (error) {
      console.error("Error getting students:", error);
      return [];
    }
  }

  async createStudent(schoolId, name, age, grade) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const schools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
      const newStudent = {
        id: Date.now().toString(),
        name,
        age,
        grade
      };
      const updatedSchools = schools.map(school => {
        if (school.id === schoolId || school.id === parseInt(schoolId)) {
          return {
            ...school,
            students: [...(school.students || []), newStudent]
          };
        }
        return school;
      });
      localStorage.setItem('caretakerSchools', JSON.stringify(updatedSchools));
      return newStudent.id;
    }

    try {
      const statement = `
        INSERT INTO students (school_id, name, age, grade)
        VALUES (?, ?, ?, ?)
      `;
      const values = [schoolId, name, age, grade];
      const result = await this.db.run(statement, values);
      return result.changes.lastId;
    } catch (error) {
      console.error("Error creating student:", error);
      return null;
    }
  }

  async deleteStudent(studentId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const schools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
      const updatedSchools = schools.map(school => {
        if (school.students && school.students.some(s => s.id === studentId || s.id === parseInt(studentId))) {
          return {
            ...school,
            students: school.students.filter(s => s.id !== studentId && s.id !== parseInt(studentId))
          };
        }
        return school;
      });
      localStorage.setItem('caretakerSchools', JSON.stringify(updatedSchools));
      return true;
    }

    try {
      // First delete associated health records
      await this.db.run(`DELETE FROM health_records WHERE student_id = ?`, [studentId]);
      // Then delete the student
      await this.db.run(`DELETE FROM students WHERE id = ?`, [studentId]);
      return true;
    } catch (error) {
      console.error("Error deleting student:", error);
      return false;
    }
  }
  
  // Parent Dashboard specific methods
  
  // Get child data for the current parent
  async getChildForParent(parentId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      const children = JSON.parse(localStorage.getItem('db_children') || '[]');
      return children.find(child => child.parent_id === parentId || child.parent_id === parseInt(parentId)) || null;
    }

    try {
      const statement = `
        SELECT * FROM children 
        WHERE parent_id = ?
        LIMIT 1
      `;
      const result = await this.db.query(statement, [parentId]);
      return result.values && result.values.length > 0 ? result.values[0] : null;
    } catch (error) {
      console.error("Error getting child for parent:", error);
      return null;
    }
  }

  // Create the child profile if it doesn't exist
  async ensureChildExists(parentId, childName) {
    await this.ensureInitialized();
    
    try {
      // Check if child exists
      const child = await this.getChildForParent(parentId);
      
      if (!child) {
        // Create new child
        const childId = await this.createChild(
          parentId,
          childName || "کودک",
          null, // age
          null, // gender
          null  // avatarUrl
        );
        
        return childId;
      }
      
      return child.id;
    } catch (error) {
      console.error("Error ensuring child exists:", error);
      return null;
    }
  }

  // Get all reminders specific to this parent
  async getParentReminders(parentId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      return JSON.parse(localStorage.getItem('parentReminders') || '{}');
    }

    try {
      const reminders = await this.getRemindersByUserId(parentId);
      
      // Convert to the format expected by the component
      const reminderData = {
        brushMorning: null,
        brushEvening: null
      };
      
      reminders.forEach(reminder => {
        if (reminder.type === 'brushMorning') {
          reminderData.brushMorning = {
            id: reminder.id,
            enabled: reminder.enabled === 1,
            time: reminder.time,
            message: reminder.message
          };
        } else if (reminder.type === 'brushEvening') {
          reminderData.brushEvening = {
            id: reminder.id,
            enabled: reminder.enabled === 1,
            time: reminder.time,
            message: reminder.message
          };
        }
      });
      
      return reminderData;
    } catch (error) {
      console.error("Error getting parent reminders:", error);
      return {
        brushMorning: null,
        brushEvening: null
      };
    }
  }

  // Save parent profile data
  async updateParentProfile(parentId, profileData) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      localStorage.setItem('parentProfile', JSON.stringify(profileData));
      return true;
    }

    try {
      // For now, we'll just create a minimal users table update
      const statement = `
        UPDATE users
        SET profile_data = ?
        WHERE id = ?
      `;
      
      await this.db.run(statement, [JSON.stringify(profileData), parentId]);
      return true;
    } catch (error) {
      console.error("Error updating parent profile:", error);
      return false;
    }
  }
  // Get asset data (for future use - loading infographics from database)
  async getInfographicAssets() {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // For web development, we'll just return the hardcoded assets
      return null;
    }

    try {
      // In a real implementation, you would have an assets table
      // For now, we'll just return null to indicate using built-in assets
      return null;
    } catch (error) {
      console.error("Error getting infographic assets:", error);
      return null;
    }
  }

  // Track user interaction with infographics (for future analytics)
  async trackInfoGraphicView(userId, infographicId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // For web development, we'll just log it
      console.log(`User ${userId} viewed infographic ${infographicId}`);
      return true;
    }

    try {
      // In a real implementation, you would log this to an analytics table
      // For now, we'll just log it
      console.log(`User ${userId} viewed infographic ${infographicId}`);
      return true;
    } catch (error) {
      console.error("Error tracking infographic view:", error);
      return false;
    }
  }

  // Create tables for parent dashboard
  async createParentTables() {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      return;
    }
    
    const statements = `
      -- Create table for infographic assets if needed in the future
      CREATE TABLE IF NOT EXISTS infographic_assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        image_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create table for tracking user interactions with infographics
      CREATE TABLE IF NOT EXISTS infographic_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        infographic_id INTEGER NOT NULL,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    try {
      // Execute the SQL to create tables
      await this.db.execute({ statements });
      
      // Check if profile_data column exists in users table
      const result = await this.db.query('PRAGMA table_info(users);');
      const columns = result.values || [];
      
      // If profile_data column doesn't exist, add it
      if (!columns.some(column => column.name === 'profile_data')) {
        await this.db.execute({
          statements: 'ALTER TABLE users ADD COLUMN profile_data TEXT;'
        });
      }
      
      console.log("Parent tables created successfully");
    } catch (error) {
      console.error("Error creating parent tables:", error);
    }
  }

  // Child Dashboard specific methods
  
  // Get child achievements
  async getChildAchievements(childId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      return JSON.parse(localStorage.getItem('childAchievements') || '{}');
    }

    try {
      const statement = `
        SELECT * FROM achievements 
        WHERE child_id = ?
      `;
      const result = await this.db.query(statement, [childId]);
      
      // Convert to expected format
      const achievements = {
        stars: 0,
        diamonds: 0,
        regularBrushing: 0,
        cleanedAreas: 0,
        healthySnacks: 0
      };
      
      if (result.values && result.values.length > 0) {
        result.values.forEach(row => {
          if (achievements.hasOwnProperty(row.type)) {
            achievements[row.type] = row.count;
          }
        });
      }
      
      return achievements;
    } catch (error) {
      console.error("Error getting child achievements:", error);
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('childAchievements') || '{}');
    }
  }

  // Get child profile
  async getChildProfile(childId) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      return JSON.parse(localStorage.getItem('childProfile') || '{}');
    }

    try {
      const statement = `
        SELECT * FROM children 
        WHERE id = ?
      `;
      const result = await this.db.query(statement, [childId]);
      
      if (result.values && result.values.length > 0) {
        return {
          id: result.values[0].id,
          fullName: result.values[0].name,
          age: result.values[0].age,
          gender: result.values[0].gender,
          avatarUrl: result.values[0].avatar_url
        };
      }
      
      return {};
    } catch (error) {
      console.error("Error getting child profile:", error);
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('childProfile') || '{}');
    }
  }
  
  // Save game scores
  async saveGameScore(childId, gameType, score) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      localStorage.setItem(`${gameType}Score`, score.toString());
      
      // Update achievements
      await this.updateAchievement(childId, gameType, score);
      return true;
    }

    try {
      const statement = `
        SELECT * FROM game_scores
        WHERE child_id = ? AND game_type = ?
      `;
      const result = await this.db.query(statement, [childId, gameType]);
      
      if (result.values && result.values.length > 0) {
        // Update existing score
        await this.db.run(`
          UPDATE game_scores
          SET score = ?, updated_at = CURRENT_TIMESTAMP
          WHERE child_id = ? AND game_type = ?
        `, [score, childId, gameType]);
      } else {
        // Insert new score
        await this.db.run(`
          INSERT INTO game_scores (child_id, game_type, score)
          VALUES (?, ?, ?)
        `, [childId, gameType, score]);
      }
      
      // Update achievements
      await this.updateAchievement(childId, gameType, score);
      return true;
    } catch (error) {
      console.error("Error saving game score:", error);
      return false;
    }
  }

  // Update child alarms
  async saveChildAlarms(childId, alarms) {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      // Fallback for web development
      localStorage.setItem('brushAlarms', JSON.stringify(alarms));
      return true;
    }

    try {
      // Convert time to HH:MM format
      const morningTime = `${alarms.morning.hour.toString().padStart(2, '0')}:${alarms.morning.minute.toString().padStart(2, '0')}`;
      const eveningTime = `${alarms.evening.hour.toString().padStart(2, '0')}:${alarms.evening.minute.toString().padStart(2, '0')}`;
      
      // Check if reminders exist
      const statement = `
        SELECT * FROM reminders
        WHERE user_id = ? AND (type = 'brushMorning' OR type = 'brushEvening')
      `;
      const result = await this.db.query(statement, [childId]);
      
      const existingReminders = result.values || [];
      
      // Handle morning reminder
      const morningReminder = existingReminders.find(r => r.type === 'brushMorning');
      if (morningReminder) {
        // Update existing
        await this.updateReminder(
          morningReminder.id,
          'brushMorning',
          morningTime,
          'یادآوری مسواک صبح',
          alarms.morning.enabled
        );
      } else {
        // Create new
        await this.createReminder(
          childId,
          'brushMorning',
          morningTime,
          'یادآوری مسواک صبح',
          alarms.morning.enabled
        );
      }
      
      // Handle evening reminder
      const eveningReminder = existingReminders.find(r => r.type === 'brushEvening');
      if (eveningReminder) {
        // Update existing
        await this.updateReminder(
          eveningReminder.id,
          'brushEvening',
          eveningTime,
          'یادآوری مسواک شب',
          alarms.evening.enabled
        );
      } else {
        // Create new
        await this.createReminder(
          childId,
          'brushEvening',
          eveningTime,
          'یادآوری مسواک شب',
          alarms.evening.enabled
        );
      }
      
      return true;
    } catch (error) {
      console.error("Error saving child alarms:", error);
      return false;
    }
  }
  
  // Create tables for child dashboard
  async createChildTables() {
    await this.ensureInitialized();
    
    if (!Capacitor.isNativePlatform() || !this.db) {
      return;
    }
    
    const statements = `
      CREATE TABLE IF NOT EXISTS game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER NOT NULL,
        game_type TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES children(id)
      );
      
      CREATE TABLE IF NOT EXISTS video_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER NOT NULL,
        video_id TEXT NOT NULL,
        progress REAL DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES children(id)
      );
    `;

    try {
      await this.db.execute({ statements });
      console.log("Child tables created successfully");
    } catch (error) {
      console.error("Error creating child tables:", error);
    }
  }

  // UTILITY FUNCTIONS
  // Helper method to format date as YYYY-MM-DD
  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Close the database connection
  async close() {
    if (Capacitor.isNativePlatform() && this.db) {
      try {
        console.log("Closing database connection");
        await this.db.close();
        await this.sqlite.closeConnection(this.dbName, false);
        this.initialized = false;
        this.db = null;
        console.log("Database connection closed successfully");
      } catch (error) {
        console.error("Error closing database connection:", error);
      }
    }
  }
}

// Export as singleton
export default new DatabaseService();