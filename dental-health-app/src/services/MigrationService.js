// src/services/MigrationService.js
import DatabaseService from './DatabaseService';

class MigrationService {
  async migrateLocalStorageToDatabase() {
    try {
      // 1. Check if migration has been run already
      const migrationCompleted = localStorage.getItem('dbMigrationCompleted');
      if (migrationCompleted === 'true') {
        console.log('Migration already completed');
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
          
          console.log(`Migrated user ${userAuthData.username} to database with ID ${userId}`);
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
            console.log(`Created child ${childName} with ID ${childId}`);
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
      console.log('Database migration completed successfully');
      return true;
    } catch (error) {
      console.error('Error during database migration:', error);
      return false;
    }
  }

  async migrateCaretakerDataToDatabase() {
    try {
      // Check if caretaker migration has been run already
      const caretakerMigrationCompleted = localStorage.getItem('dbCaretakerMigrationCompleted');
      if (caretakerMigrationCompleted === 'true') {
        console.log('Caretaker migration already completed');
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

          console.log(`Migrated caretaker ${userAuthData.username} to database with ID ${userId}`);
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

            console.log(`Migrated school ${school.name} with ID ${schoolId}`);

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

                console.log(`Migrated student ${student.name} with ID ${studentId}`);

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

                  console.log(`Migrated ${student.healthRecords.length} health records for student ${student.name}`);
                }
              }
            }
          }
        }
      }

      // Mark migration as completed
      localStorage.setItem('dbCaretakerMigrationCompleted', 'true');
      console.log('Caretaker database migration completed successfully');
      return true;
    } catch (error) {
      console.error('Error during caretaker database migration:', error);
      return false;
    }
  }

  // Add this method for parent data migration
  async migrateParentDataToDatabase() {
    try {
      // Check if parent migration has been run already
      const parentMigrationCompleted = localStorage.getItem('dbParentMigrationCompleted');
      if (parentMigrationCompleted === 'true') {
        console.log('Parent migration already completed');
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

          console.log(`Migrated parent ${userAuthData.username} to database with ID ${userId}`);
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
            console.log(`Created child with ID ${childId}`);
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
      console.log('Parent database migration completed successfully');
      return true;
    } catch (error) {
      console.error('Error during parent database migration:', error);
      return false;
    }
  }
}

export default new MigrationService();