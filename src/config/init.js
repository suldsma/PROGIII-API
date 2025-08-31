const { testConnection } = require('./database');

// Función para inicializar la aplicación
const initializeApp = async () => {
  try {
    console.log('🔄 Inicializando PROGIII API...');
    
    // Test de conexión a la base de datos
    await testConnection();
    
    console.log('✅ Inicialización completada exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error.message);
    process.exit(1);
  }
};

module.exports = { initializeApp };