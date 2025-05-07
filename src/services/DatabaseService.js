import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbName = 'dental_health_db';
    this.dbVersion = 1;
  }

  async initialize() {
    try {
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      this.db = await sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        this.dbVersion,
        false
      );

      await this.db.open();
      await this.createTables();
      return true;
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }

  async createTables() {
    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Child profiles table
      `CREATE TABLE IF NOT EXISTS child_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (parent_id) REFERENCES users (id)
      )`,

      // Parent profiles table
      `CREATE TABLE IF NOT EXISTS parent_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Teacher profiles table
      `CREATE TABLE IF NOT EXISTS teacher_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        specialization TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Dental records table
      `CREATE TABLE IF NOT EXISTS dental_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER,
        teacher_id INTEGER,
        record_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        status TEXT,
        FOREIGN KEY (child_id) REFERENCES child_profiles (id),
        FOREIGN KEY (teacher_id) REFERENCES teacher_profiles (id)
      )`,

      // Appointments table
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER,
        teacher_id INTEGER,
        appointment_date DATETIME,
        status TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES child_profiles (id),
        FOREIGN KEY (teacher_id) REFERENCES teacher_profiles (id)
      )`,

      // Educational content table
      `CREATE TABLE IF NOT EXISTS educational_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        teacher_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teacher_profiles (id)
      )`
    ];

    for (const query of queries) {
      await this.db.execute(query);
    }
  }

  // User operations
  async createUser(username, password, role) {
    const query = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
    return await this.db.run(query, [username, password, role]);
  }

  async getUserByUsername(username) {
    const query = `SELECT * FROM users WHERE username = ?`;
    return await this.db.query(query, [username]);
  }

  // Child profile operations
  async createChildProfile(userId, firstName, lastName, age, gender, parentId) {
    const query = `INSERT INTO child_profiles (user_id, first_name, last_name, age, gender, parent_id) 
                  VALUES (?, ?, ?, ?, ?, ?)`;
    return await this.db.run(query, [userId, firstName, lastName, age, gender, parentId]);
  }

  // Parent profile operations
  async createParentProfile(userId, firstName, lastName, phone, email) {
    const query = `INSERT INTO parent_profiles (user_id, first_name, last_name, phone, email) 
                  VALUES (?, ?, ?, ?, ?)`;
    return await this.db.run(query, [userId, firstName, lastName, phone, email]);
  }

  // Teacher profile operations
  async createTeacherProfile(userId, firstName, lastName, specialization) {
    const query = `INSERT INTO teacher_profiles (user_id, first_name, last_name, specialization) 
                  VALUES (?, ?, ?, ?)`;
    return await this.db.run(query, [userId, firstName, lastName, specialization]);
  }

  // Dental records operations
  async createDentalRecord(childId, teacherId, notes, status) {
    const query = `INSERT INTO dental_records (child_id, teacher_id, notes, status) 
                  VALUES (?, ?, ?, ?)`;
    return await this.db.run(query, [childId, teacherId, notes, status]);
  }

  // Appointment operations
  async createAppointment(childId, teacherId, appointmentDate, status, notes) {
    const query = `INSERT INTO appointments (child_id, teacher_id, appointment_date, status, notes) 
                  VALUES (?, ?, ?, ?, ?)`;
    return await this.db.run(query, [childId, teacherId, appointmentDate, status, notes]);
  }

  // Educational content operations
  async createEducationalContent(title, content, teacherId) {
    const query = `INSERT INTO educational_content (title, content, teacher_id) 
                  VALUES (?, ?, ?)`;
    return await this.db.run(query, [title, content, teacherId]);
  }

  // Close database connection
  async closeConnection() {
    if (this.db) {
      await this.db.close();
    }
  }
}

export default new DatabaseService(); 