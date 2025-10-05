import { todoApi, categoryApi, healthApi } from '../services/api';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const health = await healthApi.checkHealth();
    console.log('Health check:', health);
    
    // Test todos endpoint
    const todos = await todoApi.getAllTodos();
    console.log('Todos count:', todos.length);
    
    // Test categories endpoint  
    const categories = await categoryApi.getAllCategories();
    console.log('Categories count:', categories.length);
    
    // Test stats endpoint
    const stats = await todoApi.getStats();
    console.log('Stats:', stats);
    
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

// You can call testApiConnection() to test the API connection manually
