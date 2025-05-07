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
}

export default new MigrationService();