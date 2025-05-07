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

  async init() {
    if (this.initialized) {
      return;
    }

    try {
      if (!Capacitor.isNativePlatform()) {
        // For web development - use localStorage as fallback
        console.log("Not running on native platform, using localStorage fallback");
        this.initialized = true;
        return;
      }

      // Create connection
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        1,
        false
      );

      // Open database
      await this.db.open();

      // Create tables
      await this.createTables();
      
      this.initialized = true;
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  async createTables() {
    const statements = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK(role IN ('child', 'parent', 'teacher')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS children (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER,
        name TEXT NOT NULL,
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
        FOREIGN KEY (child_id) REFERENCES children(id)
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        time TEXT NOT NULL,
        message TEXT,
        enabled BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        count INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES children(id)
      );
    `;

    try {
      await this.db.execute({ statements });
      console.log("Tables created successfully");
    } catch (error) {
      console.error("Error creating tables:", error);
    }
  }

  // USER OPERATIONS
  async createUser(username, role) {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
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
      const values = [username, role];
      const result = await this.db.run(statement, values);
      return result.changes.lastId;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  async getUserByUsername(username) {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const users = JSON.parse(localStorage.getItem('db_users') || '[]');
      return users.find(user => user.username === username) || null;
    }

    try {
      const statement = `
        SELECT * FROM users WHERE username = ?
      `;
      const result = await this.db.query(statement, [username]);
      return result.values && result.values.length > 0 ? result.values[0] : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getUserById(id) {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const users = JSON.parse(localStorage.getItem('db_users') || '[]');
      return users.find(user => user.id === id) || null;
    }

    try {
      const statement = `
        SELECT * FROM users WHERE id = ?
      `;
      const result = await this.db.query(statement, [id]);
      return result.values && result.values.length > 0 ? result.values[0] : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  // CHILD OPERATIONS
  async createChild(parentId, name, age, gender, avatarUrl) {
    if (!Capacitor.isNativePlatform()) {
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
    
    if (!Capacitor.isNativePlatform()) {
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
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const children = JSON.parse(localStorage.getItem('db_children') || '[]');
      return children.filter(child => child.parent_id === parentId);
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
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const children = JSON.parse(localStorage.getItem('db_children') || '[]');
      return children.find(child => child.id === childId) || null;
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
    if (!Capacitor.isNativePlatform()) {
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
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const records = JSON.parse(localStorage.getItem('db_brushing_records') || '[]');
      return records.find(
        record => record.child_id === childId && 
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
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const records = JSON.parse(localStorage.getItem('db_brushing_records') || '[]');
      const index = records.findIndex(record => record.id === recordId);
      
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
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const records = JSON.parse(localStorage.getItem('db_brushing_records') || '[]');
      let filtered = records.filter(record => record.child_id === childId);
      
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
    if (!Capacitor.isNativePlatform()) {
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
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const reminders = JSON.parse(localStorage.getItem('db_reminders') || '[]');
      return reminders.filter(reminder => reminder.user_id === userId);
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
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const reminders = JSON.parse(localStorage.getItem('db_reminders') || '[]');
      const index = reminders.findIndex(reminder => reminder.id === id);
      
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
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const achievements = JSON.parse(localStorage.getItem('db_achievements') || '[]');
      const achievement = achievements.find(a => a.child_id === childId && a.type === type);
      
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
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web development
      const achievements = JSON.parse(localStorage.getItem('db_achievements') || '[]');
      return achievements.filter(achievement => achievement.child_id === childId);
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

  // UTILITY FUNCTIONS
  // Helper method to format date as YYYY-MM-DD
  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Close the database connection
  async close() {
    if (Capacitor.isNativePlatform() && this.db) {
      await this.sqlite.closeConnection(this.dbName);
      this.initialized = false;
    }
  }
}

// Export as singleton
export default new DatabaseService();