# Documentación — RiseCup

## ¿Qué es RiseCup?

Plataforma web para la creación y gestión de torneos deportivos en red local. Permite organizar torneos, inscribir equipos, gestionar partidos y calcular el ELO de los jugadores.

---

## Arquitectura

| Capa | Tecnología |
|---|---|
| Backend (API REST) | Laravel 12 + Sanctum |
| Frontend (SPA) | React 18 + Vite + Tailwind CSS |
| Base de datos | MySQL 8 |
| Infraestructura | Docker + Nginx + Apache |
| DNS | BIND9 (`risecup.lan`) |

---

## Funcionalidades

### Usuarios
- Registro e inicio de sesión con autenticación por token (Sanctum)
- Perfil público con historial ELO por deporte
- Sistema de roles: `usuario` y `admin`

### Torneos
- Creación de torneos con 4 formatos: eliminación simple, eliminación doble, round robin y sistema suizo
- Filtros por deporte, ELO mínimo/máximo y número de equipos
- Estados: `abierto` → `programación` → `en curso` → `finalizado`

### Equipos
- Inscripción mediante código de invitación
- Capitán con control de miembros (expulsar, bloquear inscripción)
- Escudo de equipo personalizable

### Partidos
- Generación automática de brackets al iniciar el torneo
- Registro de resultados con recálculo automático de ELO
- Notificación por email al actualizar fecha de partido

### Sistema ELO
- ELO independiente por deporte
- Base fija de 10 puntos + variable según diferencia de nivel
- Bonus de +5 por upset (diferencia > 200 ELO)
- Pérdida máxima de 15 puntos por partido

### Panel de administración
- Gestión de usuarios (editar, banear, cambiar rol)
- Gestión de torneos y deportes
- Dashboard con torneos por formato y usuarios baneados
- Acceso desde la navbar con autenticación automática via token

### Emails
- Confirmación de torneo a todos los participantes
- Notificación al actualizar fecha de partido a los capitanes
- Enviados via Mailtrap (sandbox)
