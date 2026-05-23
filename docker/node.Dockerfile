# Usamos la versión Alpine de Node (ultraligera y optimizada)
FROM node:22-alpine

# Establecemos el directorio de trabajo por defecto del contenedor
WORKDIR /app

# 1. Copiamos los archivos que dicen qué paquetes necesitas
COPY package*.json ./

# 2. Instalamos los paquetes dentro de la imagen
RUN npm install

# 3. Copiamos todo el resto de tu código (componentes, páginas, etc.)
COPY . .

# 4. Construimos la versión optimizada de Astro (crea la carpeta /dist)
RUN npm run build
# ---------------------------

# Exponemos el puerto estándar de Astro para que sea accesible desde el exterior
EXPOSE 4321