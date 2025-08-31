# PROGIII API - Sistema de Reservas de Salones de Cumpleaños

API REST desarrollada con Node.js y Express para la gestión de reservas de salones de cumpleaños, implementando autenticación JWT, autorización por roles y documentación con Swagger.

## 🚀 Características Principales

- **Autenticación y Autorización**: JWT con roles de usuario (Administrador, Empleado, Cliente)
- **BREAD Completo**: Browse, Read, Edit, Add, Delete para servicios
- **Validación de Datos**: Express-validator para validación robusta
- **Documentación**: Swagger/OpenAPI 3.0 integrado
- **Base de Datos**: MySQL con pool de conexiones
- **Soft Delete**: Eliminación lógica de registros
- **Manejo de Errores**: Middleware centralizado para errores
- **Seguridad**: Helmet, CORS y validaciones de seguridad


5. **Ejecutar la aplicación**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Documentación API

Una vez que la aplicación esté corriendo, visita:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## 🔐 Autenticación

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "nombre_usuario": "alblop@correo.com",
  "contrasenia": "password123"
}
```

### Usuarios de prueba disponibles:

| Email | Contraseña | Tipo | Rol |
|-------|------------|------|-----|
| alblop@correo.com | password123 | 3 | Cliente |
| pamgom@correo.com | password123 | 3 | Cliente |
| estcir@correo.com | password123 | 3 | Cliente |
| oscram@correo.com | password123 | 1 | Administrador |
| clajua@correo.com | password123 | 1 | Administrador |
| wilcor@correo.com | password123 | 2 | Empleado |
| anaflo@correo.com | password123 | 2 | Empleado |

**Nota**: Las contraseñas reales están hasheadas con MD5 en la base de datos.

## 🛡️ Autorización por Roles

### Tipos de Usuario:
- **1 - Administrador**: Acceso completo a todos los recursos
- **2 - Empleado**: BREAD completo para servicios, salones y turnos
- **3 - Cliente**: Solo lectura de servicios, salones y turnos

### Permisos para Servicios:
- **Listar/Ver servicios**: Todos los roles
- **Crear servicios**: Administrador y Empleado
- **Actualizar servicios**: Administrador y Empleado  
- **Eliminar servicios**: Administrador y Empleado
- **Restaurar servicios**: Solo Administrador

## 📊 Endpoints de Servicios

### GET /api/servicios
Obtener lista de servicios con paginación y filtros.

**Query Parameters:**
- `page` (opcional): Página (default: 1)
- `limit` (opcional): Items por página (default: 10, max: 100)
- `search` (opcional): Buscar por descripción
- `includeInactive` (opcional): Incluir inactivos (solo admin)

### GET /api/servicios/:id
Obtener un servicio específico por ID.

### POST /api/servicios
Crear un nuevo servicio.

**Body:**
```json
{
  "descripcion": "Nuevo servicio",
  "importe": 15000.50
}
```

### PUT /api/servicios/:id
Actualizar un servicio existente.

### DELETE /api/servicios/:id
Eliminar un servicio (soft delete).

### PATCH /api/servicios/:id/restore
Restaurar un servicio eliminado (solo administradores).

## 🔧 Estructura del Proyecto

```
src/
├── app.js                 # Configuración principal de Express
├── config/
│   ├── database.js        # Configuración de MySQL
│   └── swagger.js         # Configuración de Swagger
├── controllers/
│   ├── authController.js  # Controlador de autenticación
│   └── serviciosController.js # Controlador de servicios
├── middlewares/
│   ├── auth.js           # Middleware de autenticación
│   ├── errorHandler.js   # Manejo de errores
│   └── validation.js     # Validaciones con express-validator
├── models/
│   └── Servicio.js       # Modelo de servicio
└── routes/
    ├── auth.js           # Rutas de autenticación
    └── servicios.js      # Rutas de servicios
```

## 🧪 Testing

Para probar la API puedes usar herramientas como:
- **Postman**: Importa la documentación desde `/api-docs`
- **Thunder Client** (VS Code)
- **Insomnia**
- **curl**

### Ejemplo con curl:

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombre_usuario":"oscram@correo.com","contrasenia":"admin"}'

# 2. Usar el token obtenido
TOKEN="your_jwt_token_here"

# 3. Listar servicios
curl -X GET http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN"

# 4. Crear servicio
curl -X POST http://localhost:3000/api/servicios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"descripcion":"Servicio de prueba","importe":25000.00}'
```

## 🚦 Estados de Respuesta

### Códigos de Estado HTTP:
- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos o error de validación
- **401 Unauthorized**: No autenticado o token inválido
- **403 Forbidden**: No autorizado para esta operación
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto (ej: recurso ya existe)
- **500 Internal Server Error**: Error interno del servidor

### Formato de Respuesta Estándar:

**Éxito:**
```json
{
  "status": "success",
  "message": "Operación completada exitosamente",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": "error", 
  "message": "Descripción del error",
  "errors": [
    {
      "field": "campo_con_error",
      "message": "Mensaje específico del error"
    }
  ]
}
```

## 🔒 Seguridad Implementada

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de recursos cruzados
- **JWT**: Tokens seguros con expiración
- **Validación de entrada**: express-validator
- **SQL Injection**: Queries parametrizadas
- **Rate limiting**: Preparado para implementación
- **Sanitización**: Limpieza de datos de entrada

## 📝 Buenas Prácticas Implementadas

### Código:
- **Separación de responsabilidades**: MVC pattern
- **Middleware reutilizable**: Auth, validation, error handling
- **Configuración por variables de entorno**
- **Logging estructurado**: Morgan para HTTP requests
- **Manejo centralizado de errores**
- **Validación robusta de datos**

### Base de Datos:
- **Pool de conexiones**: Mejor rendimiento
- **Transacciones**: Para operaciones complejas
- **Soft delete**: Preservación de datos
- **Indices apropiados**: Ya definidos en el schema
- **Constraints de integridad referencial**

### API:
- **RESTful endpoints**: Siguiendo convenciones REST
- **Paginación**: Para grandes conjuntos de datos
- **Filtrado y búsqueda**: Query parameters estándar
- **Documentación automática**: Swagger integrado
- **Versionado preparado**: Estructura escalable

## 🚀 Próximos Pasos (Para entregas futuras)

1. **Implementar entidades restantes**:
   - Salones (BREAD completo)
   - Turnos (BREAD completo)  
   - Reservas (BREAD completo)
   - Usuarios (BREAD completo)

2. **Funcionalidades avanzadas**:
   - Generación de reportes PDF/CSV
   - Procedimientos almacenados para estadísticas
   - Sistema de notificaciones
   - Upload de imágenes

3. **Mejoras técnicas**:
   - Tests unitarios e integración
   - Rate limiting
   - Caching (Redis)
   - Monitoreo y logs avanzados

## 🐛 Troubleshooting

### Error de conexión a MySQL:
```bash
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solución**: Verificar que MySQL esté corriendo y las credenciales en `.env` sean correctas.

### Error de JWT:
```bash
JsonWebTokenError: invalid token
```
**Solución**: Verificar que el token se esté enviando correctamente en el header `Authorization: Bearer <token>`.

### Error de validación:
```bash
ValidationError: descripcion is required
```
**Solución**: Verificar que todos los campos requeridos estén presentes en el request body.

## 👥 Contribución

1. Fork del proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE.md` para detalles.

## 📞 Contacto

**Grupo X - PROGIII**
- Email: grupo@example.com
- Universidad: UNER - Facultad de Ciencias de la Administración

---

*Desarrollado como Trabajo Final Integrador (PRIMERA ENTREGA)- Programación III 2025*