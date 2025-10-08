import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

class SwaggerConfig {
  constructor(app) {
    this.app = app;
  }

  init() {
    try {
      const swaggerDefinition = {
        openapi: '3.0.0',
        info: {
          title: 'PROGIII API - Sistema de Reservas',
          version: '1.0.0',
          description: 'API REST para gestión de reservas de salones de cumpleaños',
          contact: {
            name: 'Grupo A - PROGIII',
            email: 'grupoa@progiii.com'
          }
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 3000}`,
            description: 'Servidor de desarrollo'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Token JWT obtenido en /api/auth/login'
            }
          },
          schemas: {
            Error: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: 'Mensaje de error' }
              }
            },
            SuccessResponse: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'success' },
                message: { type: 'string', example: 'Operación exitosa' },
                data: { type: 'object' }
              }
            }
          }
        },
        tags: [
          { name: 'Autenticación', description: 'Endpoints de autenticación' },
          { name: 'Servicios', description: 'BREAD de servicios' },
          { name: 'Salones', description: 'BREAD de salones' },
          { name: 'Turnos', description: 'BREAD de turnos' },
          { name: 'Usuarios', description: 'BREAD de usuarios (Solo Admin)' }
        ],
        paths: this._getPaths()
      };

      const swaggerSpec = swaggerJSDoc({
        definition: swaggerDefinition,
        apis: [] // No leer archivos, usar definición manual
      });

      const swaggerUiOptions = {
        explorer: true,
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true
        }
      };

      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

      this.app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
      });

      console.log('📚 Swagger configurado exitosamente');
    } catch (error) {
      console.error('❌ Error al configurar Swagger:', error.message);
    }
  }

  _getPaths() {
    return {
      '/api/auth/login': {
        post: {
          tags: ['Autenticación'],
          summary: 'Iniciar sesión',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre_usuario', 'contrasenia'],
                  properties: {
                    nombre_usuario: { type: 'string', format: 'email', example: 'oscram@correo.com' },
                    contrasenia: { type: 'string', example: 'admin123' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login exitoso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'object',
                        properties: {
                          token: { type: 'string' },
                          user: { type: 'object' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/salones': {
        get: {
          tags: ['Salones'],
          summary: 'Listar salones',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            '200': { description: 'Lista de salones' },
            '401': { description: 'No autorizado' }
          }
        },
        post: {
          tags: ['Salones'],
          summary: 'Crear salón',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titulo', 'direccion', 'importe'],
                  properties: {
                    titulo: { type: 'string', example: 'Salón Principal' },
                    direccion: { type: 'string', example: 'San Lorenzo 1000' },
                    capacidad: { type: 'integer', example: 200 },
                    importe: { type: 'number', example: 95000 }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'Salón creado' },
            '401': { description: 'No autorizado' },
            '403': { description: 'Sin permisos' }
          }
        }
      },
      '/api/salones/{id}': {
        get: {
          tags: ['Salones'],
          summary: 'Obtener salón por ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Salón encontrado' },
            '404': { description: 'No encontrado' }
          }
        },
        put: {
          tags: ['Salones'],
          summary: 'Actualizar salón',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    titulo: { type: 'string' },
                    direccion: { type: 'string' },
                    capacidad: { type: 'integer' },
                    importe: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Salón actualizado' },
            '404': { description: 'No encontrado' }
          }
        },
        delete: {
          tags: ['Salones'],
          summary: 'Eliminar salón (soft delete)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Salón eliminado' },
            '404': { description: 'No encontrado' }
          }
        }
      },
      '/api/turnos': {
        get: {
          tags: ['Turnos'],
          summary: 'Listar turnos',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Lista de turnos' }
          }
        },
        post: {
          tags: ['Turnos'],
          summary: 'Crear turno',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['hora_desde', 'hora_hasta'],
                  properties: {
                    orden: { type: 'integer', example: 1 },
                    hora_desde: { type: 'string', example: '12:00' },
                    hora_hasta: { type: 'string', example: '14:00' }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'Turno creado' }
          }
        }
      },
      '/api/turnos/{id}': {
        get: {
          tags: ['Turnos'],
          summary: 'Obtener turno por ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Turno encontrado' }
          }
        },
        put: {
          tags: ['Turnos'],
          summary: 'Actualizar turno',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Turno actualizado' }
          }
        },
        delete: {
          tags: ['Turnos'],
          summary: 'Eliminar turno',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Turno eliminado' }
          }
        }
      },
      '/api/usuarios': {
        get: {
          tags: ['Usuarios'],
          summary: 'Listar usuarios (Solo Admin)',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Lista de usuarios' },
            '403': { description: 'Sin permisos' }
          }
        },
        post: {
          tags: ['Usuarios'],
          summary: 'Crear usuario (Solo Admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre', 'apellido', 'nombre_usuario', 'contrasenia', 'tipo_usuario'],
                  properties: {
                    nombre: { type: 'string', example: 'Juan' },
                    apellido: { type: 'string', example: 'Pérez' },
                    nombre_usuario: { type: 'string', format: 'email', example: 'juan@correo.com' },
                    contrasenia: { type: 'string', example: 'password123' },
                    tipo_usuario: { type: 'integer', example: 3 }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'Usuario creado' }
          }
        }
      },
      '/api/usuarios/{id}': {
        get: {
          tags: ['Usuarios'],
          summary: 'Obtener usuario por ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Usuario encontrado' }
          }
        },
        put: {
          tags: ['Usuarios'],
          summary: 'Actualizar usuario',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Usuario actualizado' }
          }
        },
        delete: {
          tags: ['Usuarios'],
          summary: 'Eliminar usuario',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            '200': { description: 'Usuario eliminado' }
          }
        }
      },
      '/api/servicios': {
        get: {
          tags: ['Servicios'],
          summary: 'Listar servicios',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Lista de servicios' }
          }
        }
      }
    };
  }
}

export default SwaggerConfig;