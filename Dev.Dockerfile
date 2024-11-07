# Usa una imagen de Node.js como base
FROM node:18

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala todas las dependencias, incluidas las de desarrollo
RUN npm install

# Copia todo el código fuente al contenedor
COPY . .

# Expone el puerto 3000 para la API
EXPOSE 3000

# Comando para ejecutar la API en modo de desarrollo
CMD ["npm", "run", "dev"]
