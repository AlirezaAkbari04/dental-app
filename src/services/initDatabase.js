import DatabaseService from './DatabaseService';

export const initializeDatabase = async () => {
  try {
    const isInitialized = await DatabaseService.initialize();
    if (isInitialized) {
      console.log('Database initialized successfully');
    } else {
      console.error('Failed to initialize database');
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}; 