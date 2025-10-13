# 🎉 PROGIII API - Sistema de Reservas de Salones de Cumpleaños

API REST desarrollada con **Node.js** y **Express** para la gestión de reservas de salones de cumpleaños, implementando **autenticación JWT**, **autorización por roles** y **documentación con Swagger**.
---

## 🚀 Ejecución de la aplicación

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
---

✨ Características
- Primera Entrega - BREAD Completo de Servicios
- Browse - Listar servicios con paginación y búsqueda
- Read - Obtener servicio por ID
- Edit - Actualizar servicio (PUT y PATCH)
- Add - Crear nuevo servicio
- Delete - Eliminación lógica (soft delete)
- Restore - Restauración de servicios eliminados
---

⚙️ Funcionalidades Técnicas
- Autenticación con JWT
- Autorización por roles (Administrador, Empleado, Cliente)
- Validación de datos con express-validator
- Documentación completa con Swagger
- Soft delete en todas las entidades
- Endpoints de estadísticas
- Manejo robusto de errores
- Búsqueda y filtrado avanzado
- Paginación en listados
---

⚙️ Configuración de variables de entorno
El archivo .env ya está incluido con la siguiente configuración:

# Puerto del servidor
PORT=3000

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=api_app
DB_PASSWORD=progiii2025
DB_NAME=reservas

# JWT Secret
JWT_SECRET=hYolwxgcFFCXr1gbhGZ3nBN9iJ4sS1cpKfxrFCRkqZglx3NH0TSET1MP1oRbyHLf6EMVfgkl8dLCfMUoJo7MGQ
JWT_EXPIRES_IN=24h

# Entorno
NODE_ENV=development

# Configuración adicional
APP_NAME=PROGIII-API
APP_VERSION=1.0.0
---

📘 Documentación API
Una vez que la aplicación esté corriendo, podés acceder a:
Swagger UI: http://localhost:3000/api-docs
Health Check: http://localhost:3000/api/health
---

🔐 Usuarios de Prueba
Las contraseñas corresponden a la parte antes del @ en el email.

Administradores (tipo_usuario = 1)
Email: oscram@correo.com
 | Contraseña: oscram
Email: clajua@correo.com
 | Contraseña: clajua
 
 Empleados (tipo_usuario = 2)
Email: wilcor@correo.com
 | Contraseña: wilcor
Email: anaflo@correo.com
 | Contraseña: anaflo

Clientes (tipo_usuario = 3)
Email: alblop@correo.com
 | Contraseña: alblop
Email: pamgom@correo.com
 | Contraseña: pamgom
Email: estcir@correo.com
 | Contraseña: estcir
 ---

  Implementación Adelantada (Entrega Final)
Sistema de Notificaciones
Como funcionalidad extra elegida para la entrega final, se adelantó la implementación del sistema de notificaciones con templates HTML:

-NotificationService.js → Servicio para generar y registrar notificaciones
-handlebarsCompiler.js → Compilador de plantillas Handlebars
-reservaConfirmada.hbs → Template HTML para confirmación de reservas
---

👥 Integrantes del Grupo A - PROGIII

-José Benjamín Fibiger

-Rita María Victoria Lobos

-Susana Ester Ledesma

-Hugo Leonel García (no continuó en el proyecto)
---

📄 Trabajo Final Integrador (Primera Entrega) - Programación III 2025