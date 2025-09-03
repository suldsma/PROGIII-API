const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PROGIII API - Sistema de Reservas',
      version: '1.0.0',
      description: `
        API REST para gestión de reservas de salones de cumpleaños.
        
        **Funcionalidades implementadas:**
        - BREAD completo para Servicios (Browse, Read, Edit, Add, Delete)
        - Autenticación con JWT
        - Autorización por roles
        - Validación de datos
        - Soft delete
        - Paginación y búsqueda
        
        **Roles de usuario:**
        - **Administrador (1)**: Acceso completo a todos los recursos
        - **Empleado (2)**: BREAD completo para Servicios, Salones, Turnos
        - **Cliente (3)**: Solo lectura de Servicios, Salones, Turnos
      `,
      contact: {
        name: 'Grupo A - PROGIII',
        email: 'grupoa@progiii.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
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
          description: 'Ingrese el token JWT en el formato: Bearer {token}'
        }
      },
      schemas: {
        Servicio: {
          type: 'object',
          properties: {
            servicio_id: {
              type: 'integer',
              description: 'ID único del servicio',
              example: 1,
              readOnly: true
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del servicio',
              maxLength: 255,
              minLength: 3,
              example: 'Servicio de sonido profesional'
            },
            importe: {
              type: 'number',
              format: 'decimal',
              description: 'Importe del servicio en pesos',
              minimum: 0,
              maximum: 9999999.99,
              example: 15000.00
            },
            activo: {
              type: 'boolean',
              description: 'Estado del servicio (true: activo, false: eliminado)',
              example: true,
              readOnly: true
            },
            creado: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de creación',
              example: '2025-08-19T21:47:55.000Z',
              readOnly: true
            },
            modificado: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de última modificación',
              example: '2025-08-19T21:47:55.000Z',
              readOnly: true
            }
          },
          required: ['servicio_id', 'descripcion', 'importe', 'activo']
        },
        ServicioInput: {
          type: 'object',
          required: ['descripcion', 'importe'],
          properties: {
            descripcion: {
              type: 'string',
              description: 'Descripción del servicio',
              maxLength: 255,
              minLength: 3,
              example: 'Servicio de sonido profesional'
            },
            importe: {
              type: 'number',
              format: 'decimal',
              description: 'Importe del servicio en pesos',
              minimum: 0,
              maximum: 9999999.99,
              example: 15000.00
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['nombre_usuario', 'contrasenia'],
          properties: {
            nombre_usuario: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'alblop@correo.com'
            },
            contrasenia: {
              type: 'string',
              description: 'Contraseña del usuario',
              minLength: 3,
              example: 'password123'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              example: 'Login exitoso'
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT token para autenticación'
                },
                user: {
                  $ref: '#/components/schemas/Usuario'
                }
              }
            }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            nombre: {
              type: 'string',
              example: 'Alberto'
            },
            apellido: {
              type: 'string',
              example: 'López'
            },
            nombre_usuario: {
              type: 'string',
              format: 'email',
              example: 'alblop@correo.com'
            },
            tipo_usuario: {
              type: 'integer',
              description: '1=Administrador, 2=Empleado, 3=Cliente',
              example: 1
            },
            tipo_usuario_texto: {
              type: 'string',
              example: 'Administrador'
            },
            celular: {
              type: 'string',
              nullable: true,
              example: null
            },
            foto: {
              type: 'string',
              nullable: true,
              example: null
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Página actual',
              example: 1
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas disponibles',
              example: 5
            },
            totalItems: {
              type: 'integer',
              description: 'Total de elementos',
              example: 45
            },
            itemsPerPage: {
              type: 'integer',
              description: 'Elementos por página',
              example: 10
            },
            hasNext: {
              type: 'boolean',
              description: 'Indica si hay página siguiente',
              example: true
            },
            hasPrev: {
              type: 'boolean',
              description: 'Indica si hay página anterior',
              example: false
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['error'],
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo del error',
              example: 'Servicio no encontrado'
            },
            errors: {
              type: 'array',
              description: 'Detalles específicos de errores de validación',
              items: {
                type: 'object',
                properties: {
                  field: { 
                    type: 'string',
                    description: 'Campo que causó el error'
                  },
                  message: { 
                    type: 'string',
                    description: 'Descripción del error'
                  },
                  value: {
                    description: 'Valor que causó el error'
                  }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo del éxito',
              example: 'Operación realizada exitosamente'
            },
            data: {
              description: 'Datos de respuesta'
            }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'No autorizado - Token inválido o faltante',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Token de acceso requerido'
              }
            }
          }
        },
        Forbidden: {
          description: 'Prohibido - Sin permisos suficientes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'No tienes permisos para acceder a este recurso'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Recurso no encontrado'
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Errores de validación',
                errors: [
                  {
                    field: 'descripcion',
                    message: 'La descripción es requerida',
                    value: ''
                  }
                ]
              }
            }
          }
        },
        InternalServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Error interno del servidor'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para autenticación y autorización de usuarios'
      },
      {
        name: 'Servicios',
        description: 'BREAD completo para gestión de servicios - Entidad principal de la primera entrega'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = (app) => {
  // Configuración personalizada de Swagger UI
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info hgroup.main h2 { color: #3b82f6 }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
      .swagger-ui .auth-wrapper { margin-top: 20px; }
    `,
    customSiteTitle: "PROGIII API - Documentación",
    customfavIcon: "/favicon.ico"
  };
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  
  // Endpoint para obtener el JSON de Swagger
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  
  console.log('📚 Swagger configurado exitosamente');
};