# RiseCup — Despliegue con Docker

Aplicación de gestión de torneos. Arquitectura desacoplada (backend + frontend)
desplegada con Docker Compose: Apache+PHP (Laravel), Nginx (React), MySQL y un servidor
DNS propio (BIND9).

## Stack

| Servicio   | Tecnología            | Descripción                                  |
|------------|-----------------------|----------------------------------------------|
| `frontend` | React (Vite) + Nginx  | SPA compilada. Sirve la web y hace proxy a /api |
| `web`      | Laravel + Apache/PHP 8.3 | API backend                               |
| `db`       | MySQL 8.0             | Base de datos                                |
| `dns`      | BIND9                 | Resuelve el dominio `risecup.lan`            |

## Requisitos

- Docker y Docker Compose v2
- (Opcional) Git para clonar el repositorio

Instalación de Docker en Ubuntu:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # cerrar sesión y volver a entrar
```

## Estructura del proyecto (docker)

```
.
├── docker-compose.yml          # Orquesta los 4 servicios
├── torneo-app/                 # Backend Laravel
│   ├── Dockerfile
│   └── 000-default.conf        # VirtualHost de Apache (apunta a /public)
├── torneo-app-client/          # Frontend React
│   ├── Dockerfile              # Multi-stage: compila con Node y sirve con Nginx
│   ├── nginx.conf              # SPA + proxy /api → backend
│   └── .env.production         # VITE_API_URL=/api
└── dns/
    ├── named.conf
    └── zonas/db.risecup.lan    # Zona DNS → IP de la máquina
```

---

## 1. Iniciar Sesion
 Usuario: Sergio
 Contraseña: Sergio123

## 2. Clonar y levantar

```bash
git clone <URL_DEL_REPO> riseapp
cd riseapp
docker compose up -d --build
```

Comprobar que los 4 contenedores están arriba:
```bash
docker compose ps
```

## 3. Configuración del backend (Laravel) — solo la primera vez

```bash
# Dependencias de PHP
docker compose exec web composer install

# Crear el archivo de entorno
docker compose exec web cp .env.example .env
```

Editar `torneo-app/.env` con los datos de la base de datos:
```env
APP_URL=http://risecup.lan

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=torneo_app
DB_USERNAME=sergio
DB_PASSWORD=sergio123
```
> `DB_HOST` es el **nombre del servicio** del contenedor MySQL (`db`), no una IP ni el dominio.

Generar clave, migraciones y permisos:
```bash
docker compose exec web php artisan key:generate
docker compose exec web php artisan config:clear
docker compose exec web php artisan migrate --seed
docker compose exec web chown -R www-data:www-data storage bootstrap/cache
```

> La base de datos `torneo_app` y el usuario `sergio` los crea automáticamente el
> contenedor de MySQL la primera vez (variables `MYSQL_*` del `docker-compose.yml`).
> Las **tablas** las crean las migraciones de Laravel (`php artisan migrate`).

## 4. Configuración del DNS

El servidor BIND resuelve `risecup.lan` hacia la IP de la máquina. Esa IP está en
`dns/zonas/db.risecup.lan`:
```
@   IN  A   192.168.1.45
www IN  A   192.168.1.45
```

> ⚠️ **Si despliegas en otra red, cambia esa IP por la de tu máquina** (averíguala con
> `ip a`), sube el número de *serial* en una unidad y reinicia el DNS:
> ```bash
> docker compose restart dns
> ```

Validar la zona:
```bash
docker compose exec dns named-checkzone risecup.lan /etc/bind/zonas/db.risecup.lan
# Debe decir: loaded serial X OK
```

## 5. Acceder a la aplicación

**Por IP (directo, sin DNS):**
```
http://<IP_DE_LA_MAQUINA>      # p.ej. http://192.168.1.45
```

**Por dominio `risecup.lan`** — configura el cliente para usar el DNS de la máquina:

- *Opción A (DNS):* en la configuración de red del cliente, poner como DNS preferido la
  IP de la máquina (`192.168.1.45`). En Windows, después: `ipconfig /flushdns`.
- *Opción B (hosts):* añadir al archivo hosts del cliente:
  ```
  192.168.1.45    risecup.lan
  ```
  (Windows: `C:\Windows\System32\drivers\etc\hosts` — editar como administrador.)

Abrir: **http://risecup.lan**

## 6. Usuarios de la aplicación

Cuentas para iniciar sesión en la web (se crean con `php artisan migrate --seed`):

| Rol               | Email                 | Contraseña  |
|-------------------|-----------------------|-------------|
| Administrador     | `admin@example.com`   | `admin123`  |
| Usuario           | `user@example.com`    | `user123`   |
| Usuario corriente | `sergio@example.com`  | `sergio123` |

> Estos son los usuarios de la **aplicación** (login de la web), distintos del login de
> Ubuntu y de las credenciales de la base de datos MySQL.

---

## Comandos útiles

```bash
docker compose ps                  # estado de los contenedores
docker compose logs -f <servicio>  # logs (frontend | web | db | dns)
docker compose restart <servicio>  # reiniciar un servicio
docker compose down                # parar y eliminar contenedores (los datos persisten)
docker compose up -d --build       # reconstruir y levantar
docker compose down -v             # ⚠️ además BORRA el volumen de la BD
```
