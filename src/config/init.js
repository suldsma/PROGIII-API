// Importo la función de prueba de conexión desde el archivo 'database.js'
import { testConnection } from './database.js';

// Función principal para inicializar la aplicación (asíncrona)
const initializeApp = async () => {
  try {
    console.log('🔄 Inicializando PROGIII API...');
    
    // Ejecuto la prueba de conexión a la base de datos
    await testConnection();
    
    console.log('✅ Inicialización completada exitosamente');
    return true; // Indica éxito
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error.message);
    process.exit(1); // Salgo de la aplicación si falla la inicialización
  }
};

// Exporto la función para que pueda ser usada en el punto de entrada
export { initializeApp };