# PROGIII API - Sistema de Reservas de Salones de Cumpleaños
---

API REST desarrollada con Node.js y Express para la gestión de reservas de salones de cumpleaños, implementando autenticación JWT, autorización por roles y documentación con Swagger.
---

 **Ejecutar la aplicación**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```
---
## ✨ Características

### Primera Entrega - BREAD Completo de Servicios

- ✅ **Browse** - Listar servicios con paginación y búsqueda
- ✅ **Read** - Obtener servicio por ID
- ✅ **Edit** - Actualizar servicio (PUT y PATCH)
- ✅ **Add** - Crear nuevo servicio
- ✅ **Delete** - Eliminación lógica (soft delete)
- ✅ **Restore** - Restauración de servicios eliminados

### Funcionalidades Técnicas

- 🔐 Autenticación con JWT
- 🛡️ Autorización por roles (Administrador, Empleado, Cliente)
- ✅ Validación de datos con express-validator
- 📚 Documentación completa con Swagger
- 🔄 Soft delete en todas las entidades
- 📊 Endpoints de estadísticas
- 🎯 Manejo robusto de errores
- 🔍 Búsqueda y filtrado avanzado
- 📄 Paginación en listados

---

##  Documentación API

Una vez que la aplicación esté corriendo, visita:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health
---

## 🔐 Usuarios de Prueba

Las contraseñas corresponden a la parte antes del `@` en el email:

### Administradores (tipo_usuario = 1)
- **Email:** oscram@correo.com | **Contraseña:** oscram
- **Email:** clajua@correo.com | **Contraseña:** clajua

### Empleados (tipo_usuario = 2)
- **Email:** wilcor@correo.com | **Contraseña:** wilcor
- **Email:** anaflo@correo.com | **Contraseña:** anaflo

### Clientes (tipo_usuario = 3)
- **Email:** alblop@correo.com | **Contraseña:** alblop
- **Email:** pamgom@correo.com | **Contraseña:** pamgom
- **Email:** estcir@correo.com | **Contraseña:** estcir
---

## 🎯 Implementación Adelantada (Para Entrega Final)

### Sistema de Notificaciones
Como funcionalidad extra elegida para la entrega final, hemos adelantado la implementación del sistema de notificaciones con templates HTML:

- **NotificationService.js**: Servicio para generar y registrar notificaciones
- **handlebarsCompiler.js**: Compilador de plantillas Handlebars
- **reservaConfirmada.hbs**: Template HTML para confirmación de reservas
---

##  Grupo A - PROGIII**
```

 -Hugo Leonel García

 -José Benjamín Fibiger

 -Rita María Victoria Lobos

 -Susana Ester Ledesma
 
---

*Desarrollado como Trabajo Final Integrador (PRIMERA ENTREGA)- Programación III 2025*