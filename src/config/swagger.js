const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PROGIII API',
      version: '1.0.0',
      description: 'API REST para gestión de reservas de salones de cumpleaños',
      contact: {
        name: 'Grupo A - PROGIII',
        email: 'grupoa@correo.com'
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
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Servicio: {
          type: 'object',
          properties: {
            servicio_id: {
              type: 'integer',
              description: 'ID único del servicio'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del servicio',
              maxLength: 255
            },
            importe: {
              type: 'number',
              format: 'decimal',
              description: 'Importe del servicio'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del servicio (activo/inactivo)'
            },
            creado: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            modificado: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última modificación'
            }
          }
        },
        ServicioInput: {
          type: 'object',
          required: ['descripcion', 'importe'],
          properties: {
            descripcion: {
              type: 'string',
              description: 'Descripción del servicio',
              maxLength: 255,
              minLength: 3
            },
            importe: {
              type: 'number',
              format: 'decimal',
              description: 'Importe del servicio',
              minimum: 0
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['error']
            },
            message: {
              type: 'string'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }));
};