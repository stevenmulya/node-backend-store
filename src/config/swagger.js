import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'Documentation for E-Commerce Backend Node.js',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [{
        bearerAuth: []
    }],
  },
  // Perbaikan disini: Menggunakan process.cwd() agar path akurat di Windows/Mac/Linux
  apis: [path.join(process.cwd(), 'src/routes/*.js')], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;