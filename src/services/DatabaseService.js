// DatabaseService.js - Comprehensive Fix
// Replace your current DatabaseService.js with this improved version

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

class DatabaseService {
  sqlite = null;
  db = null;
  initialized = false;
  dbName = "dental_health.db";
  isInitializing = false;
  
  // Add debugMode for logging
  debugMode = true;
  
  constructor() {
    this.log("DatabaseService constructor");
    if (Capacitor.isNativePlatform()) {
      this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }
  }

  log(message, data) {
    if (this.debugMode) {
      console.log(`[DatabaseService] ${message}`, data || '');
    }
  }

  logError(message, error) {
    console.error(`[DatabaseService ERROR] ${message}`, error);
  }

  async resetDatabase() {
    if (!Capacitor.isNativePlatform()) {
      this.log("Not on native platform, skipping resetDatabase");
      return true;
    }
    
    try {
      this.log("Resetting database connections");
      this.initialized = false;
      this.db = null;
      
      // Check if connection exists
      const result = await this.sqlite.isConnection(this.dbName, false);
      if (result.result) {
        this.log("Closing existing connection");
        await this.sqlite.closeConnection(this.dbName, false);
      }
      
      // Create a new connection
      this.log("Creating fresh connection");
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
      this.log("Database reset successful");
      return true;
    } catch (error) {
      this.logError("Failed to reset database:", error);
      return false;
    }
  }

  async executeWithFallback(databaseOperation, fallbackOperation) {
    try {
      if (Capacitor.isNativePlatform() && this.db && this.initialized) {
        this.log("Executing database operation");
        return await databaseOperation();
      } else {
        throw new Error('Using fallback operation - DB not initialized or not on native platform');
      }
    } catch (error) {
      this.logError('Database operation failed, using fallback:', error);
      return await fallbackOperation();
    }
  }

  async ensureInitialized() {
    if (this.initialized) {
      this.log("Database already initialized");
      return true;
    }

    if (this.isInitializing) {
      this.log("Database initialization already in progress, waiting...");
      // Wait for initialization to complete
      let attempts = 0;
      while (this.isInitializing && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        attempts++;
      }
      return this.initialized;
    }

    try {
      this.isInitializing = true;
      this.log("Starting database initialization");
      
      if (!Capacitor.isNativePlatform()) {
        // For web development - use localStorage as fallback
        this.log("Not running on native platform, using localStorage fallback");
        this.initialized = true;
        this.isInitializing = false;
        return true;
      }

      // First, check if connection already exists
      this.log("Checking for existing connections");
      try {
        const connections = await this.sqlite.isConnection(this.dbName, false);
        if (connections.result) {
          this.log("Connection already exists, retrieving it");
          this.db = await this.sqlite.retrieveConnection(this.dbName, false);
        } else {
          this.log("Creating new SQLite connection");
          this.db = await this.sqlite.createConnection(
            this.dbName,
            false,
            'no-encryption',
            1,
            false
          );
        }
        this.log("SQLite connection established");
      } catch (connError) {
        this.logError("Error with connection:", connError);
        // Try creating a connection anyway if retrieving failed
        this.log("Attempting to create new connection as fallback");
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          1,
          false
        );
      }

      // Open database
      this.log("Opening database");
      await this.db.open();
      this.log("Database opened successfully");

      // Ensure tables are created
      this.log("Creating database tables");
      await this.createTables();
      
      this.initialized = true;
      this.log("Database initialized successfully");
      return true;
    } catch (error) {
      this.logError("Error initializing database:", error);
      // On error, try to use localStorage fallback even on native platforms
      this.log("Falling back to localStorage due to error");
      this.initialized = true;
      return true;
    } finally {
      this.isInitializing = false;
    }
  }

  async createTables() {
    if (!Capacitor.isNativePlatform() || !this.db) {
      this.log("Skipping createTables for non-native platform or no db connection");
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

      CREATE TABLE IF NOT EXISTS survey_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id TEXT NOT NULL,
        child_name TEXT,
        timestamp TEXT NOT NULL,
        consent TEXT,
        respondent TEXT,
        grade TEXT,
        brushing_frequency TEXT,
        snack_frequency TEXT,
        toothpaste_usage TEXT,
        brushing_help TEXT,
        brushing_helper TEXT,
        brushing_check TEXT,
        brushing_checker TEXT,
        snack_limit TEXT,
        snack_limiter TEXT
      )
    `;

    try {
      this.log("Executing table creation statements");
      await this.db.execute({ statements });
      this.log("Tables created successfully");
    } catch (error) {
      this.logError("Error creating tables:", error);
      throw error; // Rethrow to be caught by the caller
    }
  }

  // USER OPERATIONS
  async createUser(username, role) {
    this.log(`Creating user: ${username} with role: ${role}`);
    
    await this.ensureInitialized();
    
    return this.executeWithFallback(
      // Database operation
      async () => {
        const statement = `
          INSERT INTO users (username, role)
          VALUES (?, ?)
        `;
        this.log("Executing statement:", statement, "with values:", [username, role]);
        const result = await this.db.run(statement, [username, role]);
        this.log("Insert result:", result);
        return result.changes.lastId;
      },
      // Fallback operation
      async () => {
        // Fallback for web development or when database is not available
        this.log("Using localStorage fallback for createUser");
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
    );
  }

  async getUserByUsername(username) {
    this.log(`Getting user by username: ${username}`);
    
    await this.ensureInitialized();
    
    return this.executeWithFallback(
      // Database operation
      async () => {
        const statement = `
          SELECT * FROM users WHERE username = ?
        `;
        this.log("Executing query:", statement, "with value:", username);
        const result = await this.db.query(statement, [username]);
        this.log("Query result:", result);
        return result.values && result.values.length > 0 ? result.values[0] : null;
      },
      // Fallback operation
      async () => {
        // Fallback for web development or when database is not available
        this.log("Using localStorage fallback for getUserByUsername");
        const users = JSON.parse(localStorage.getItem('db_users') || '[]');
        return users.find(user => user.username === username) || null;
      }
    );
  }

  async updateUserRole(userId, role) {
    this.log(`Updating user role: userID ${userId} to role ${role}`);
    
    await this.ensureInitialized();
    
    return this.executeWithFallback(
      // Database operation
      async () => {
        const statement = `
          UPDATE users SET role = ? WHERE id = ?
        `;
        await this.db.run(statement, [role, userId]);
        this.log(`Successfully updated user ${userId} role to ${role} in database`);
        return true;
      },
      // Fallback operation
      async () => {
        // Fallback for web development
        this.log("Using localStorage fallback for updateUserRole");
        const users = JSON.parse(localStorage.getItem('db_users') || '[]');
        const updatedUsers = users.map(user => {
          if (user.id === userId || user.id === parseInt(userId)) {
            this.log(`Found user ${user.id}, updating role from ${user.role} to ${role}`);
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
              this.log("Updated role in currentUser localStorage");
            }
          } catch (e) {
            this.logError("Error parsing currentUser from localStorage:", e);
          }
        }
        
        return true;
      }
    );
  }

  async getUserById(id) {
    this.log(`Getting user by ID: ${id}`);
    
    await this.ensureInitialized();
    
    return this.executeWithFallback(
      // Database operation
      async () => {
        const statement = `
          SELECT * FROM users WHERE id = ?
        `;
        this.log("Executing query:", statement, "with value:", id);
        const result = await this.db.query(statement, [id]);
        this.log("Query result:", result);
        return result.values && result.values.length > 0 ? result.values[0] : null;
      },
      // Fallback operation
      async () => {
        // Fallback for web development or when database is not available
        this.log("Using localStorage fallback for getUserById");
        const users = JSON.parse(localStorage.getItem('db_users') || '[]');
        return users.find(user => user.id === parseInt(id) || user.id === id) || null;
      }
    );
  }

  // ACHIEVEMENT OPERATIONS
  async updateAchievement(childId, type, incrementBy = 1) {
    await this.ensureInitialized();
    
    return this.executeWithFallback(
      // Database operation
      async () => {
        const statement = `
          UPDATE achievements
          SET count = count + ?, last_updated = CURRENT_TIMESTAMP
          WHERE child_id = ? AND type = ?
        `;
        const values = [incrementBy, childId, type];
        await this.db.run(statement, values);
        this.log(`Achievement updated: ${type} for child ${childId} by ${incrementBy}`);
        return true;
      },
      // Fallback operation
      async () => {
        // Fallback for web development
        this.log("Using localStorage fallback for updateAchievement");
        const achievements = JSON.parse(localStorage.getItem('db_achievements') || '[]');
        const achievement = achievements.find(a => 
          (a.child_id === childId || a.child_id === parseInt(childId)) && 
          a.type === type
        );
        
        if (achievement) {
          achievement.count += incrementBy;
          achievement.last_updated = new Date().toISOString();
          localStorage.setItem('db_achievements', JSON.stringify(achievements));
          return true;
        }
        
        // If achievement doesn't exist, create it
        achievements.push({
          id: achievements.length + 1,
          child_id: childId,
          type,
          count: incrementBy,
          last_updated: new Date().toISOString()
        });
        localStorage.setItem('db_achievements', JSON.stringify(achievements));
        return true;
      }
    );
  }

  async getChildAchievements(childId) {
    await this.ensureInitialized();
    
    return this.executeWithFallback(
      // Database operation
      async () => {
        const statement = `
          SELECT * FROM achievements WHERE child_id = ?
        `;
        const result = await this.db.query(statement, [childId]);
        this.log(`Retrieved ${result.values?.length || 0} achievements for child ${childId}`);
        
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
      },
      // Fallback operation
      async () => {
        // Fallback to localStorage
        this.log("Using localStorage fallback for getChildAchievements");
        // First try to get from db_achievements
        const allAchievements = JSON.parse(localStorage.getItem('db_achievements') || '[]');
        const childAchievements = allAchievements.filter(a => 
          a.child_id === childId || a.child_id === parseInt(childId)
        );
        
        if (childAchievements.length > 0) {
          // Convert to expected format
          const achievements = {
            stars: 0,
            diamonds: 0,
            regularBrushing: 0,
            cleanedAreas: 0,
            healthySnacks: 0
          };
          
          childAchievements.forEach(row => {
            if (achievements.hasOwnProperty(row.type)) {
              achievements[row.type] = row.count;
            }
          });
          
          return achievements;
        }
        
        // If not found in db_achievements, try the direct childAchievements
        return JSON.parse(localStorage.getItem('childAchievements') || '{}');
      }
    );
  }
  
  // GAME OPERATIONS
  async saveGameScore(childId, gameType, score) {
    await this.ensureInitialized();
    
    return this.executeWithFallback(
      // Database operation
      async () => {
        // Check if score exists
        const checkStatement = `
          SELECT * FROM game_scores 
          WHERE child_id = ? AND game_type = ?
        `;
        const checkResult = await this.db.query(checkStatement, [childId, gameType]);
        
        if (checkResult.values && checkResult.values.length > 0) {
          // Update existing score
          const updateStatement = `
            UPDATE game_scores
            SET score = ?, updated_at = CURRENT_TIMESTAMP
            WHERE child_id = ? AND game_type = ?
          `;
          await this.db.run(updateStatement, [score, childId, gameType]);
          this.log(`Updated game score for ${gameType} to ${score} for child ${childId}`);
        } else {
          // Insert new score
          const insertStatement = `
            INSERT INTO game_scores (child_id, game_type, score)
            VALUES (?, ?, ?)
          `;
          await this.db.run(insertStatement, [childId, gameType, score]);
          this.log(`Inserted new game score for ${gameType}: ${score} for child ${childId}`);
        }
        
        // Also update achievement
        await this.updateAchievement(childId, gameType, 1);
        return true;
      },
      // Fallback operation
      async () => {
        // Fallback to localStorage
        this.log("Using localStorage fallback for saveGameScore");
        localStorage.setItem(`${gameType}Score`, score.toString());
        
        // Also update achievement
        await this.updateAchievement(childId, gameType, 1);
        
        // Store in game_scores format too
        const gameScores = JSON.parse(localStorage.getItem('db_game_scores') || '[]');
        const existingScoreIndex = gameScores.findIndex(s => 
          (s.child_id === childId || s.child_id === parseInt(childId)) && 
          s.game_type === gameType
        );
        
        if (existingScoreIndex !== -1) {
          gameScores[existingScoreIndex].score = score;
          gameScores[existingScoreIndex].updated_at = new Date().toISOString();
        } else {
          gameScores.push({
            id: gameScores.length + 1,
            child_id: childId,
            game_type: gameType,
            score,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        
        localStorage.setItem('db_game_scores', JSON.stringify(gameScores));
        return true;
      }
    );
  }

  // SURVEY OPERATIONS
  async saveSurveyResponse(parentId, surveyData) {
    await this.ensureInitialized();
    
    return this.executeWithFallback(
      // Database operation
      async () => {
        try {
          const statement = `
            INSERT INTO survey_responses (
              parent_id, child_name, timestamp, consent, respondent, grade, 
              brushing_frequency, snack_frequency, toothpaste_usage, 
              brushing_help, brushing_helper, brushing_check, 
              brushing_checker, snack_limit, snack_limiter
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          const values = [
            parentId,
            surveyData.childName || '',
            surveyData.timestamp,
            surveyData.consent || '',
            surveyData.respondent || '',
            surveyData.grade || '',
            surveyData.brushingFrequency || '',
            surveyData.snackFrequency || '',
            surveyData.toothpasteUsage || '',
            surveyData.brushingHelp || '',
            surveyData.brushingHelper || '',
            surveyData.brushingCheck || '',
            surveyData.brushingChecker || '',
            surveyData.snackLimit || '',
            surveyData.snackLimiter || ''
          ];
          
          // Using standard run pattern which is more reliable
          await this.db.run(statement, values);
          this.log("Survey response saved to database successfully");
          return true;
        } catch (error) {
          this.logError('Error in database operation:', error);
          throw error;
        }
      },
      // Fallback operation
      async () => {
        // Fallback to localStorage
        this.log("Using localStorage fallback for saveSurveyResponse");
        const surveyResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
        surveyResponses.push({
          id: surveyResponses.length + 1,
          parent_id: parentId,
          child_name: surveyData.childName || '',
          timestamp: surveyData.timestamp,
          consent: surveyData.consent || '',
          respondent: surveyData.respondent || '',
          grade: surveyData.grade || '',
          brushing_frequency: surveyData.brushingFrequency || '',
          snack_frequency: surveyData.snackFrequency || '',
          toothpaste_usage: surveyData.toothpasteUsage || '',
          brushing_help: surveyData.brushingHelp || '',
          brushing_helper: surveyData.brushingHelper || '',
          brushing_check: surveyData.brushingCheck || '',
          brushing_checker: surveyData.brushingChecker || '',
          snack_limit: surveyData.snackLimit || '',
          snack_limiter: surveyData.snackLimiter || ''
        });
        localStorage.setItem('surveyResponses', JSON.stringify(surveyResponses));
        this.log("Survey response saved to localStorage successfully");
        return true;
      }
    );
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
        this.log("Closing database connection");
        await this.db.close();
        await this.sqlite.closeConnection(this.dbName, false);
        this.initialized = false;
        this.db = null;
        this.log("Database connection closed successfully");
      } catch (error) {
        this.logError("Error closing database connection:", error);
      }
    }
  }
}

// Export as singleton
export default new DatabaseService();