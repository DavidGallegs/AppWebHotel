# COMANDOS

## COMANDOS FRONTEND

~~~cmd
docker compose -f docker-compose-dev.yml up -d

docker compose -f docker-compose-dev.yml exec frontend sh

npm run dev

docker compose -f docker-compose-dev.yml down

wsl --shutdown
~~~

## COMANDOS BACKEND

~~~cmd
docker compose -f docker-compose-dev.yml up -d

docker compose -f docker-compose-dev.yml exec backend bash

docker compose -f docker-compose-dev.yml down

wsl --shutdown
~~~
