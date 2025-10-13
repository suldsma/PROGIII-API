// Importo el módulo mysql2 con soporte para Promises
import mysql from 'mysql2/promise';

// Configuración de la base de datos, usando variables de entorno o valores por defecto
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'reservas',
  waitForConnections: true,  // Esperar si no hay conexiones disponibles
  connectionLimit: 10,     // Máximo de conexiones en el pool
  queueLimit: 0,         // Sin límite de peticiones en cola (0 = ilimitado)
  connectTimeout: 60000   // Tiempo máximo para conectar
 
};

// Creo el pool de conexiones usando la configuración
const pool = mysql.createPool(dbConfig);

// Función asíncrona para verificar la conexión inicial
const testConnection = async () => {
  try {
    const connection = await pool.getConnection(); // Obtengo una conexión de prueba
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release(); // Libero la conexión
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    throw error; // Relanzo el error para detener si falla
  }
};

// Función para ejecutar queries SQL con parámetros (seguridad)
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params); // Ejecuto y obtengo las filas
    return rows;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  }
};

// Función para ejecutar un conjunto de operaciones como una transacción
const transaction = async (callback) => {
  const connection = await pool.getConnection(); // Obtengo una conexión exclusiva
  try {
    await connection.beginTransaction(); // Inicio la transacción
    const result = await callback(connection); // Ejecuto las operaciones
    await connection.commit(); // Confirmo los cambios
    return result;
  } catch (error) {
    await connection.rollback(); // Deshago si hay error
    throw error;
  } finally {
    connection.release(); // Siempre libero la conexión
  }
};

// Exporto el pool y las funciones principales
export {
  pool,
  query,
  transaction,
  testConnection
};