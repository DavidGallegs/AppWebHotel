# GUÍA REPOSITORIO

## DESCARGAR ARQUITECTURA DE GITHUB

Tenemos que estar dentro de WSL:Ubuntu

1. Nos registramos con git (En caso de ser necesario):
    - `git config --global user.email "tu-correo-de-github@gmail.com"`
    - `git config --global user.name "User"`
2. En la ruta /home/david o donde se quira instalar el repositorio.
3. Clonamos el repositorio: `git clone https://github.com/DavidGallegs/AppWebHotel.git`
4. Nos metemos dentro de la carpeta del proyecto.
5. Creamos la platilla .env: `cp backend/.env.example backend/.env`
6. Configuramos el archivo .env del backend con los datos de la base de datos:

    ~~~env
        DB_CONNECTION=mysql
        DB_HOST=base_datos
        DB_PORT=3306
        DB_DATABASE=app_db
        DB_USERNAME=root
        DB_PASSWORD=root

        SESSION_DRIVER=file <!--Editar esta línea-->
    ~~~

7. Levantamos el docker compose: `docker compose -f docker-compose-dev.yml up -d --build`
8. Instalamos las dependencias:
    - `docker compose -f docker-compose-dev.yml exec frontend npm install`
    - `docker compose -f docker-compose-dev.yml exec backend composer install`
9. Para laravel generar llave de seguridad y migrar tablas:
    - `docker compose -f docker-compose-dev.yml exec backend php artisan key:generate`
    - `docker compose -f docker-compose-dev.yml exec backend php artisan migrate`
10. Al estar en WSL:Ubuntu otorgamos permisos de edición: `sudo chown -R $USER:$USER .`

Para comprobar que esta todo hecho usamos los **`Comandos de frontend`** para ver index.astro.
Nota: El comando: `docker compose -f docker-compose-dev.yml up -d --build`, solo es para la primera vez
o actualizaciones. Sino usar el comando `docker compose -f docker-compose-dev.yml up -d`.

## COMANDOS DE DOCKER

### COMANDOS FRONTEND

~~~cmd
docker compose -f docker-compose-dev.yml up -d

docker compose -f docker-compose-dev.yml exec frontend sh

npm run dev

docker compose -f docker-compose-dev.yml down

wsl --shutdown
~~~

### COMANDOS BACKEND

~~~cmd
docker compose -f docker-compose-dev.yml up -d

docker compose -f docker-compose-dev.yml exec backend bash

docker compose -f docker-compose-dev.yml down

wsl --shutdown
~~~
