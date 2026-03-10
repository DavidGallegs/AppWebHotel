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

ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf