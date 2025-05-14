// src/services/MigrationService.js - Improved Version
import DatabaseService from './DatabaseService';

class MigrationService {
  // Add debugging
  static debug = true;
  
  static log(message, data) {
    if (this.debug) {
      console.log(`[MigrationService] ${message}`, data || '');
    }
  }

  static logError(message, error) {
    console.error(`[MigrationService ERROR] ${message}`, error);
  }

  static async migrateLocalStorageToDatabase() {
    try {
      // 1. Check if migration has been run already
      const migrationCompleted = localStorage.getItem('dbMigrationCompleted');
      if (migrationCompleted === 'true') {
        this.log('Migration already completed');
        return true;
      }
      
      // 2. Initialize database
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }
      
      // 3. Migrate user data
      const userAuthData = JSON.parse(localStorage.getItem('userAuth') || '{}');
      let userId = null;
      
      if (userAuthData.username) {
        // Check if user already exists in DB
        const existingUser = await DatabaseService.getUserByUsername(userAuthData.username);
        
        if (!existingUser) {
          // Create user in database
          userId = await DatabaseService.createUser(
            userAuthData.username, 
            userAuthData.role || 'parent'
          );
          
          this.log(`Migrated user ${userAuthData.username} to database with ID ${userId}`);
        } else {
          userId = existingUser.id;
        }
        
        // 4. Migrate children data if parent
        if (userAuthData.role === 'parent' && userId) {
          // Get or create child
          let childId = null;
          const childName = localStorage.getItem('childName') || "کودک";
          
          const children = await DatabaseService.getChildrenByParentId(userId);
          if (children.length === 0) {
            childId = await DatabaseService.createChild(
              userId,
              childName,
              null, // age
              null, // gender
              null  // avatarUrl
            );
            this.log(`Created child ${childName} with ID ${childId}`);
          } else {
            childId = children[0].id;
          }
          
          if (childId) {
            // 5. Migrate brushing records
            const brushingRecords = JSON.parse(localStorage.getItem('parentBrushingRecord') || '{}');
            
            for (const [dateKey, record] of Object.entries(brushingRecords)) {
              if (record.morning && record.morning.brushed) {
                await DatabaseService.createBrushingRecord(
                  childId,
                  dateKey,
                  'morning',
                  record.morning.time || '',
                  true
                );
              }
              
              if (record.evening && record.evening.brushed) {
                await DatabaseService.createBrushingRecord(
                  childId,
                  dateKey,
                  'evening',
                  record.evening.time || '',
                  true
                );
              }
            }
            
            // 6. Migrate achievements
            const achievements = JSON.parse(localStorage.getItem('childAchievements') || '{}');
            
            for (const [type, count] of Object.entries(achievements)) {
              if (type !== 'lastUpdated' && typeof count === 'number') {
                await DatabaseService.updateAchievement(childId, type, count);
              }
            }
          }
          
          // 7. Migrate reminders
          const reminderData = JSON.parse(localStorage.getItem('parentReminders') || '{}');
          
          if (reminderData.brushMorning) {
            await DatabaseService.createReminder(
              userId,
              'brushMorning',
              reminderData.brushMorning.time || '07:30',
              reminderData.brushMorning.message || 'یادآوری مسواک صبح',
              reminderData.brushMorning.enabled !== false
            );
          }
          
          if (reminderData.brushEvening) {
            await DatabaseService.createReminder(
              userId,
              'brushEvening',
              reminderData.brushEvening.time || '20:00',
              reminderData.brushEvening.message || 'یادآوری مسواک شب',
              reminderData.brushEvening.enabled !== false
            );
          }
        }
      }
      
      // 8. Mark migration as completed
      localStorage.setItem('dbMigrationCompleted', 'true');
      this.log('Database migration completed successfully');
      return true;
    } catch (error) {
      this.logError('Error during database migration:', error);
      return false;
    }
  }

  async migrateCaretakerDataToDatabase() {
    try {
      // Check if caretaker migration has been run already
      const caretakerMigrationCompleted = localStorage.getItem('dbCaretakerMigrationCompleted');
      if (caretakerMigrationCompleted === 'true') {
        this.log('Caretaker migration already completed');
        return true;
      }

      // Initialize database if needed
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }

      // Get current user data
      const userAuthData = JSON.parse(localStorage.getItem('userAuth') || '{}');
      let userId = null;

      if (userAuthData.username && userAuthData.role === 'teacher') {
        // Check if user already exists in DB
        const existingUser = await DatabaseService.getUserByUsername(userAuthData.username);

        if (!existingUser) {
          // Create user in database
          userId = await DatabaseService.createUser(
            userAuthData.username,
            'teacher'
          );

          this.log(`Migrated caretaker ${userAuthData.username} to database with ID ${userId}`);
        } else {
          userId = existingUser.id;
        }

        if (userId) {
          // Migrate schools and students
          const caretakerSchools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');

          for (const school of caretakerSchools) {
            // Create school
            const schoolId = await DatabaseService.createSchool(
              userId,
              school.name,
              school.type,
              school.activityDays || []
            );

            this.log(`Migrated school ${school.name} with ID ${schoolId}`);

            // Migrate students
            if (school.students && Array.isArray(school.students)) {
              for (const student of school.students) {
                // Create student
                const studentId = await DatabaseService.createStudent(
                  schoolId,
                  student.name,
                  student.age,
                  student.grade
                );

                this.log(`Migrated student ${student.name} with ID ${studentId}`);

                // Migrate health records
                if (student.healthRecords && Array.isArray(student.healthRecords)) {
                  for (const record of student.healthRecords) {
                    await DatabaseService.createHealthRecord(studentId, {
                      date: record.date,
                      hasBrushed: record.hasBrushed,
                      hasCavity: record.hasCavity,
                      hasHealthyGums: record.hasHealthyGums !== false, // Default to true if not specifically false
                      score: record.score || 5,
                      notes: record.notes || '',
                      warningFlags: record.warningFlags || {},
                      needsReferral: record.needsReferral || false,
                      referralNotes: record.referralNotes || '',
                      resolved: record.resolved || false
                    });
                  }

                  this.log(`Migrated ${student.healthRecords.length} health records for student ${student.name}`);
                }
              }
            }
          }
        }
      }

      // Mark migration as completed
      localStorage.setItem('dbCaretakerMigrationCompleted', 'true');
      this.log('Caretaker database migration completed successfully');
      return true;
    } catch (error) {
      this.logError('Error during caretaker database migration:', error);
      return false;
    }
  }

  // Add this method for parent data migration
  async migrateParentDataToDatabase() {
    try {
      // Check if parent migration has been run already
      const parentMigrationCompleted = localStorage.getItem('dbParentMigrationCompleted');
      if (parentMigrationCompleted === 'true') {
        this.log('Parent migration already completed');
        return true;
      }

      // Initialize database if needed
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }

      // Get current user data
      const userAuthData = JSON.parse(localStorage.getItem('userAuth') || '{}');
      let userId = null;

      if (userAuthData.username && userAuthData.role === 'parent') {
        // Check if user already exists in DB
        const existingUser = await DatabaseService.getUserByUsername(userAuthData.username);

        if (!existingUser) {
          // Create user in database
          userId = await DatabaseService.createUser(
            userAuthData.username,
            'parent'
          );

          this.log(`Migrated parent ${userAuthData.username} to database with ID ${userId}`);
        } else {
          userId = existingUser.id;
        }

        if (userId) {
          // Migrate child data
          const childProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
          let childId = null;

          const children = await DatabaseService.getChildrenByParentId(userId);
          if (children.length === 0) {
            childId = await DatabaseService.createChild(
              userId,
              childProfile.fullName || 'کودک',
              childProfile.age || null,
              childProfile.gender || null,
              childProfile.avatarUrl || null
            );
            this.log(`Created child with ID ${childId}`);
          } else {
            childId = children[0].id;
          }

          if (childId) {
            // Migrate brushing records
            const brushingRecords = JSON.parse(localStorage.getItem('parentBrushingRecord') || '{}');

            for (const [dateKey, record] of Object.entries(brushingRecords)) {
              if (record.morning && record.morning.brushed) {
                await DatabaseService.createBrushingRecord(
                  childId,
                  dateKey,
                  'morning',
                  record.morning.time || '',
                  true
                );
              }

              if (record.evening && record.evening.brushed) {
                await DatabaseService.createBrushingRecord(
                  childId,
                  dateKey,
                  'evening',
                  record.evening.time || '',
                  true
                );
              }
            }

            // Migrate achievements
            const achievements = JSON.parse(localStorage.getItem('childAchievements') || '{}');

            for (const [type, count] of Object.entries(achievements)) {
              if (type !== 'lastUpdated' && typeof count === 'number') {
                await DatabaseService.updateAchievement(childId, type, count);
              }
            }
          }

          // Migrate reminders
          const reminderData = JSON.parse(localStorage.getItem('parentReminders') || '{}');

          if (reminderData.brushMorning) {
            await DatabaseService.createReminder(
              userId,
              'brushMorning',
              reminderData.brushMorning.time || '07:30',
              reminderData.brushMorning.message || 'یادآوری مسواک صبح',
              reminderData.brushMorning.enabled !== false
            );
          }

          if (reminderData.brushEvening) {
            await DatabaseService.createReminder(
              userId,
              'brushEvening',
              reminderData.brushEvening.time || '20:00',
              reminderData.brushEvening.message || 'یادآوری مسواک شب',
              reminderData.brushEvening.enabled !== false
            );
          }

          // Migrate parent profile
          const parentProfile = JSON.parse(localStorage.getItem('parentProfile') || '{}');
          if (Object.keys(parentProfile).length > 0) {
            await DatabaseService.updateParentProfile(userId, parentProfile);
          }
        }
      }

      // Mark migration as completed
      localStorage.setItem('dbParentMigrationCompleted', 'true');
      this.log('Parent database migration completed successfully');
      return true;
    } catch (error) {
      this.logError('Error during parent database migration:', error);
      return false;
    }
  }

  // Add this method for child data migration
  async migrateChildDataToDatabase() {
    try {
      // Check if migration already completed
      const childMigrationCompleted = localStorage.getItem('dbChildMigrationCompleted');
      if (childMigrationCompleted === 'true') {
        this.log('Child migration already completed');
        return true;
      }
      
      // Initialize database if needed
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }
      
      // Get current user data
      const userAuthData = JSON.parse(localStorage.getItem('userAuth') || '{}');
      
      if (userAuthData.username && userAuthData.role === 'child') {
        let userId = null;
        
        // Check if user exists
        const existingUser = await DatabaseService.getUserByUsername(userAuthData.username);
        
        if (!existingUser) {
          // Create user
          userId = await DatabaseService.createUser(
            userAuthData.username, 
            'child'
          );
          this.log(`Created child user with ID ${userId}`);
        } else {
          userId = existingUser.id;
          this.log(`Found existing child user with ID ${userId}`);
        }
        
        if (userId) {
          // Migrate child profile
          const childProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
          if (Object.keys(childProfile).length > 0) {
            await DatabaseService.updateUserProfile(userId, childProfile);
            this.log('Migrated child profile data');
          }
          
          // Migrate achievements
          const achievements = JSON.parse(localStorage.getItem('childAchievements') || '{}');
          
          for (const [type, count] of Object.entries(achievements)) {
            if (type !== 'lastUpdated' && typeof count === 'number') {
              await DatabaseService.updateAchievement(userId, type, count);
              this.log(`Migrated achievement ${type} with count ${count}`);
            }
          }
          
          // Migrate brush alarms
          const alarms = JSON.parse(localStorage.getItem('brushAlarms') || '{}');
          
          if (Object.keys(alarms).length > 0) {
            // Morning alarm
            if (alarms.morning) {
              const morningTime = `${alarms.morning.hour.toString().padStart(2, '0')}:${alarms.morning.minute.toString().padStart(2, '0')}`;
              
              await DatabaseService.createReminder(
                userId,
                'brushMorning',
                morningTime,
                'یادآوری مسواک صبح',
                alarms.morning.enabled !== false
              );
              this.log(`Migrated morning alarm: ${morningTime}`);
            }
            
            // Evening alarm
            if (alarms.evening) {
              const eveningTime = `${alarms.evening.hour.toString().padStart(2, '0')}:${alarms.evening.minute.toString().padStart(2, '0')}`;
              
              await DatabaseService.createReminder(
                userId,
                'brushEvening',
                eveningTime,
                'یادآوری مسواک شب',
                alarms.evening.enabled !== false
              );
              this.log(`Migrated evening alarm: ${eveningTime}`);
            }
          }
          
          // Migrate game scores
          const healthySnackScore = localStorage.getItem('healthySnackScore');
          if (healthySnackScore) {
            await DatabaseService.saveGameScore(userId, 'healthySnacks', parseInt(healthySnackScore, 10));
            this.log(`Migrated healthy snack score: ${healthySnackScore}`);
          }
        }
      }
      
      // Mark migration as completed
      localStorage.setItem('dbChildMigrationCompleted', 'true');
      this.log('Child database migration completed successfully');
      return true;
    } catch (error) {
      this.logError('Error during child database migration:', error);
      return false;
    }
  }

  // Force reset all migration flags - useful for debugging
  static resetMigrationFlags() {
    localStorage.removeItem('dbMigrationCompleted');
    localStorage.removeItem('dbCaretakerMigrationCompleted');
    localStorage.removeItem('dbParentMigrationCompleted');
    localStorage.removeItem('dbChildMigrationCompleted');
    this.log('All migration flags have been reset');
    return true;
  }
}

export default new MigrationService();