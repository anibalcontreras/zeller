# Usa una imagen de Node.js como base
FROM node:16

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala solo las dependencias de producción
RUN npm install --only=production

# Copia todo el código fuente al contenedor
COPY . .

# Compila el código TypeScript a JavaScript
RUN npm run build

# Expone el puerto 3000 para la API
EXPOSE 3000

# Comando para ejecutar la API en producción
CMD ["npm", "run", "start"]
