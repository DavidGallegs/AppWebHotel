# Usamos la imagen oficial de PHP con servidor web Apache
FROM php:8.3-apache

# 1. Instalamos herramientas de sistema y extensiones PHP (MySQL y Zip)
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql zip

# 2. Habilitamos el módulo Rewrite de Apache (Vital para el enrutamiento de Laravel)
RUN a2enmod rewrite

# 3. Importamos Composer desde su imagen oficial para gestionar dependencias
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Establecemos el directorio de trabajo por defecto del contenedor
WORKDIR /var/www/html

# --- LAS LÍNEAS NUEVAS PARA PRODUCCIÓN ---
# Copiamos todo tu código de Laravel al contenedor
COPY . .

# Instalamos los paquetes de PHP (excluyendo los de desarrollo para mayor velocidad)
RUN composer install --no-dev --optimize-autoloader

# Le damos permisos a Apache para que pueda escribir en las carpetas de caché y logs de Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
# ----------------------------------------

# 5. Configuramos Apache para que apunte a la carpeta public de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf