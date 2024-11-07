# Primera etapa: compilación
FROM node:18 AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias e instala todas las dependencias
COPY package*.json ./
RUN npm install

# Copia todo el código fuente y compila TypeScript
COPY . .
RUN npm run build

# Segunda etapa: entorno de producción
FROM node:18 AS production

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios desde la etapa de construcción
COPY package*.json ./
COPY --from=build /app/dist ./dist
RUN npm install --only=production

# Expone el puerto de la aplicación
EXPOSE 3000

# Comando para ejecutar la API
CMD ["node", "dist/server.js"]
