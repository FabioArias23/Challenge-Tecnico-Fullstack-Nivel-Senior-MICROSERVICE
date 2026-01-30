# Dockerfile
FROM node:18-alpine

# Instalamos dependencias necesarias para compilar módulos de Node si hiciera falta
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./

# Instalamos todas las dependencias
RUN npm install

COPY . .

# Generamos la build de producción
RUN npm run build

# Exponemos el puerto que usa NestJS
EXPOSE 3000

# COMANDO CRÍTICO: 
# 1. Corre migraciones (crea tablas en Supabase)
# 2. Corre seeders (crea admin en Supabase)
# 3. Arranca la app
CMD ["sh", "-c", "npm run migration:run && npm run seed:run && npm run start:prod"]