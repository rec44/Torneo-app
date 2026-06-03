FROM php:8.3-apache

# Paquetes del sistema necesarios para las extensiones de PHP
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# Extensiones de PHP que Laravel necesita
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd

# Activar mod_rewrite (rutas de Laravel)
RUN a2enmod rewrite

# Composer (gestor de dependencias de PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Apache sirve la carpeta /public de Laravel
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

EXPOSE 80

CMD bash -c "php artisan storage:link --force 2>/dev/null || true && chown -R www-data:www-data storage bootstrap/cache && apache2-foreground"
