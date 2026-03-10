# Usamos la versión Alpine de Node (ultraligera y optimizada)
FROM node:22-alpine

# Establecemos el directorio de trabajo por defecto del contenedor
WORKDIR /app

# Exponemos el puerto estándar de Astro para que sea accesible desde el exterior
EXPOSE 4321