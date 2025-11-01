COMANDOS PARA CREAR MODULOS, SERVICES O CONTROLLERS (la carpeta se creará automáticamente y se llamará <name>)
- nest generate module <name>
- nest generate service <name>
- nest generate controller <name>

GENERACIÓN DE PDF Y QR
- class-validator && class-transformer: npm install class-validator class-transformer
- pdfkit: npm install pdfkit qrcode
- qrcode: npm install -D @types/pdfkit @types/qrcode

SEGURIDAD
 ENCRIPTA CONTRASEÑAS
    - bcryptjs: npm install bcryptjs
 VERIFICA AUTENTICACION PARA PERMITIR ACCESO A CIERTAS RUTAS SEGUN ROL
    - jsonwebtoken: npm install jsonwebtoken

CONEXIÓN A BD Y DEPENDENCIAS NECESARIAS
- postgresql: npm install pg

- Dependencias NestJS: npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/typeorm @nestjs/config @nestjs/jwt typeorm reflect-metadata rxjs bcrypt class-validator class-transformer cookie-parser
Y LUEGO:
npm install --save-dev @nestjs/cli @nestjs/schematics @nestjs/testing @types/node @types/express @types/bcrypt typescript ts-node

CONFIGURACION
- Importar reflect-metadata en main.ts



EJEMPLO PARA BRUNO O POSTMAN
- registro de usuario
POST http://localhost:3000/users/register
Content-Type: application/json

{
    "name": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "StrongPassword123!",
    "birthDate": "1990-01-01",
    "gender": "male",
    "phone": "1234567890",
    "role": "Inspector"
}

- login de usuario
POST http://localhost:3000/users/login
Content-Type: application/json

{
    "email": "john.doe@example.com",
    "password": "StrongPassword123!"
}

- generar pdf
POST http://localhost:3000/documents/generate
Content-Type: application/json
Cookie: access_token=<access_token>

{
  "clientName": "Juan Pérez",
  "clientEmail": "juan.perez@email.com",
  "clientId": "CLI-2025-001",
  "documentType": "Factura",
  "additionalInfo": "Compra realizada el 28/10/2025"
}
