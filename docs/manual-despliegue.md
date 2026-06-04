# Manual de Despliegue — RiseCup

## Requisitos previos

- Ubuntu Server (o cualquier distro con apt)
- Conexión a internet
- Puerto 80 y 53 disponibles

---

## Paso 1 — Instalar Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

> Cierra sesión y vuelve a entrar para que el grupo `docker` se aplique.

---

## Paso 2 — Clonar el repositorio

```bash
git clone https://github.com/rec44/Torneo-app.git risecup
cd risecup
```

---

## Paso 3 — Configurar el entorno

```bash
cp torneo-app/.env.example torneo-app/.env
```

Edita `torneo-app/.env` y ajusta los siguientes valores:

```env
APP_URL=http://risecup.lan
FRONTEND_URL=http://risecup.lan

DB_HOST=db
DB_DATABASE=torneo_app
DB_USERNAME=sergio
DB_PASSWORD=sergio123
```

> El resto de valores (Mailtrap, claves, etc.) ya vienen configurados en el `.env.example`.

---

## Paso 4 — Configurar la IP en el DNS

Averigua la IP de la máquina:

```bash
ip a | grep "inet " | grep -v 127
```

Edita el archivo de zona DNS:

```bash
nano dns/zonas/db.risecup.lan
```

Cambia la IP en las líneas `A` por la de tu máquina:

```
@   IN  A   <TU_IP>
www IN  A   <TU_IP>
```

Sube el número de `serial` en una unidad (p.ej. de `2024010101` a `2024010102`).

---

## Paso 5 — Levantar los contenedores

```bash
docker compose up -d --build
```

Comprueba que todos están arriba:

```bash
docker compose ps
```

Deben aparecer: `frontend`, `web`, `db`, `dns`, `queue`.

---

## Paso 6 — Inicializar la base de datos

```bash
docker compose exec web php artisan key:generate
docker compose exec web php artisan config:clear
docker compose exec web php artisan migrate --seed
```

---

## Paso 7 — Configurar el DNS en el cliente

Para acceder por `risecup.lan` desde otro equipo, configura el DNS del cliente:

**Windows:**
1. Panel de control → Centro de redes → Adaptador → Propiedades → IPv4
2. DNS preferido: `<IP_DEL_SERVIDOR>`
3. Ejecuta `ipconfig /flushdns` en CMD

**Linux:**
```bash
echo "nameserver <IP_DEL_SERVIDOR>" | sudo tee /etc/resolv.conf
```

**Alternativa (archivo hosts):**
Añade esta línea al archivo hosts del cliente:
```
<IP_DEL_SERVIDOR>    risecup.lan
```
- Windows: `C:\Windows\System32\drivers\etc\hosts` (como administrador)
- Linux/Mac: `/etc/hosts`

---

## Paso 8 — Acceder a la aplicación

Abre el navegador y ve a:

```
http://risecup.lan
```

---

## Usuarios por defecto

| Rol           | Email                | Contraseña  |
|---------------|----------------------|-------------|
| Administrador | `admin@example.com`  | `admin123`  |
| Usuario       | `user@example.com`   | `user123`   |
| Usuario       | `sergio@example.com` | `sergio123` |

---

## Comandos útiles

```bash
docker compose ps                        # estado de los contenedores
docker compose logs -f web               # logs del backend
docker compose logs -f queue             # logs del worker de emails
docker compose restart web queue         # reiniciar tras cambiar .env
docker compose down                      # parar (datos persistentes)
docker compose down -v                   # parar y BORRAR la base de datos
docker compose exec web php artisan config:clear   # limpiar caché de config
```
