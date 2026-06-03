# API Reference — RiseCup

Base URL: `/api`  
Autenticación: `Authorization: Bearer <token>` (Sanctum)  
Formato: JSON en todas las respuestas.

## Estructura de respuestas

### Recurso único
Los endpoints que devuelven un objeto (show, store, update…) devuelven el objeto directamente, sin envoltura `data`:
```json
{ "id": 1, "nombre": "Fútbol", "deleted_at": null }
```

### Colección paginada
Los endpoints con paginación (`GET /torneos`, `GET /partidos`, `GET /usuarios`) devuelven la estructura estándar de Laravel:
```json
{
  "data": [ ...items... ],
  "links": {
    "first": "http://localhost/api/torneos?page=1",
    "last":  "http://localhost/api/torneos?page=3",
    "prev":  null,
    "next":  "http://localhost/api/torneos?page=2"
  },
  "meta": {
    "current_page": 1,
    "last_page":    3,
    "per_page":     9,
    "total":        27,
    "from":         1,
    "to":           9,
    "path":         "http://localhost/api/torneos"
  }
}
```

### Colección no paginada
Los endpoints que devuelven un array sin paginar (p.ej. `GET /deportes`, `GET /torneos/{id}/equipos`) devuelven directamente un array:
```json
[ { "id": 1, ... }, { "id": 2, ... } ]
```

---

## Resources (shapes)

Todos los endpoints devuelven objetos con esta forma según el tipo.

### UsuarioResource
```json
{
  "id": 1,
  "nombre": "Sergio",
  "email": "sergio@example.com",
  "elo": 520,
  "rol": "usuario | admin",
  "created_at": "2026-05-12T10:00:00Z",
  "deleted_at": null
}
```

### UsuarioPublicoResource _(en contextos anidados)_
```json
{
  "id": 1,
  "nombre": "Sergio",
  "elo": 520,
  "elo_al_unirse": 510   // solo dentro de miembros de equipo (pivot)
}
```

### DeporteResource
```json
{
  "id": 1,
  "nombre": "Fútbol",
  "deleted_at": null
}
```

### TorneoResource
```json
{
  "id": 1,
  "nombre": "Copa Primavera",
  "deporte_id": 2,
  "deporte": { ...DeporteResource },       // si se cargó la relación
  "creado_por": 3,
  "organizador": { ...UsuarioPublicoResource }, // si se cargó la relación
  "elo_minimo": 400,
  "elo_maximo": null,
  "max_jugadores": 8,
  "min_miembros": 3,
  "max_miembros": 5,
  "fecha_inicio": "2026-06-15T10:00:00Z",
  "fecha_fin": "2026-06-20T18:00:00Z",
  "formato": "eliminacion_simple | eliminacion_doble | round_robin | suizo",
  "estado": "abierto | programacion | en_curso | finalizado",
  "direccion": "Calle Mayor 1",
  "ciudad": "Madrid",
  "provincia": "Madrid",
  "equipos_count": 5,         // withCount — número de equipos bloqueados
  "equipos": [ ...EquipoResource ],   // si se cargó la relación
  "partidos": [ ...PartidoResource ], // si se cargó la relación
  "created_at": "2026-05-20T09:00:00Z"
}
```

### EquipoResource
```json
{
  "id": 10,
  "torneo_id": 1,
  "nombre": "Los Cracks",
  "escudo_url": "http://localhost/storage/escudos/equipos/abc.jpg",
  "capitan_id": 3,
  "capitan": { ...UsuarioPublicoResource },
  "semilla": 2,
  "bloqueado": true,
  "inscrito": true,
  "miembros_count": 4,       // withCount
  "miembros": [ ...UsuarioPublicoResource ]  // incluye elo_al_unirse (pivot)
}
```

### PartidoResource
```json
{
  "id": 5,
  "torneo_id": 1,
  "torneo": { ...TorneoResource },         // si se cargó la relación
  "equipo1_id": 10,
  "equipo1": { ...EquipoResource },
  "equipo2_id": 11,
  "equipo2": { ...EquipoResource },
  "ganador_equipo_id": 10,
  "ganador": { ...EquipoResource },
  "resultado_e1": "3",
  "resultado_e2": "1",
  "delta_elo_e1": 14,
  "delta_elo_e2": -9,
  "estado": "pendiente | en_curso | finalizado | cancelado",
  "ronda": 2,
  "programado_en": "2026-06-16T16:00:00Z",
  "historial_elo": [ ...HistorialEloResource ],
  "created_at": "2026-05-25T08:00:00Z"
}
```

### InvitacionResource
```json
{
  "id": 3,
  "torneo_id": 1,
  "equipo_id": 10,
  "codigo": "ABCD1234",
  "max_usos": 5,
  "usos_actuales": 2,
  "expira_en": "2026-06-10T23:59:59Z",
  "vigente": true
}
```

### HistorialEloResource
```json
{
  "id": 7,
  "partido_id": 5,
  "usuario_id": 3,
  "elo_antes": 506,
  "elo_despues": 520,
  "delta": 14
}
```

### EloDeporteResource
```json
{
  "id": 2,
  "deporte_id": 2,
  "deporte": { ...DeporteResource },
  "elo": 540
}
```

---

## Auth

### `POST /api/register`
Registro de nuevo usuario.

**Body:**
| Campo | Tipo | Requerido |
|---|---|---|
| nombre | string, max 255 | sí |
| email | string, email, unique | sí |
| contrasena | string, min 8 | sí |
| contrasena_confirmation | string | sí |

**Respuesta `201`:**
```json
{
  "usuario": { ...UsuarioResource },
  "token": "1|abcdef..."
}
```

---

### `POST /api/login`
Inicio de sesión.

**Body:**
| Campo | Tipo |
|---|---|
| email | string |
| contrasena | string |

**Respuesta `200`:**
```json
{
  "usuario": { ...UsuarioResource },
  "token": "2|xyz..."
}
```

**Errores:**
- `403` — cuenta baneada (`deleted_at` no nulo)
- `422` — credenciales incorrectas

---

### `POST /api/logout` 🔒
Invalida el token actual.

**Respuesta `200`:**
```json
{ "message": "Sesión cerrada correctamente." }
```

---

### `GET /api/me` 🔒
Devuelve el usuario autenticado.

**Respuesta `200`:** `UsuarioResource`

---

## Usuarios

### `GET /api/usuarios` 🔒 admin
Lista paginada de todos los usuarios (incluidos baneados).

**Query params:** _(paginación Laravel — `?page=N`)_

**Respuesta `200`:** colección paginada — `data` + `meta` + `links`
```json
{
  "data": [ ...UsuarioResource ],
  "meta": { "current_page": 1, "last_page": 3, "per_page": 20, "total": 58, ... },
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." }
}
```

---

### `GET /api/usuarios/{id}` 🔒
Perfil completo de un usuario.

**Respuesta `200`:**
```json
{
  "id": 1,
  "nombre": "Sergio",
  "email": "sergio@example.com",
  "elo": 520,
  "rol": "usuario",
  "created_at": "...",
  "deleted_at": null,
  "elosDeporte": [ ...EloDeporteResource ],
  "torneos_creados": [ ...TorneoResource ],
  "torneos_inscritos": [ ...TorneoResource ],
  "torneos_ganados": 2
}
```

---

### `PUT /PATCH /api/usuarios/{id}` 🔒 propio o admin
Actualizar datos del usuario.

**Body (todos opcionales):**
| Campo | Tipo |
|---|---|
| nombre | string, max 255 |
| email | string, email, unique |
| contrasena | string, min 8 |
| contrasena_confirmation | string |

**Respuesta `200`:** `UsuarioResource`

---

### `DELETE /api/usuarios/{id}` 🔒 admin
Banea al usuario (soft delete + invalida tokens).

**Respuesta `200`:**
```json
{ "message": "Usuario baneado correctamente." }
```

---

### `POST /api/usuarios/{id}/desbanear` 🔒 admin
Levanta el baneo (restore).

**Respuesta `200`:**
```json
{
  "message": "Usuario desbaneado correctamente.",
  "usuario": { ...UsuarioResource }
}
```

---

## Deportes

### `GET /api/deportes`
Lista todos los deportes activos.

**Respuesta `200`:** `DeporteResource[]`

---

### `GET /api/deportes/{id}`
Detalle de un deporte.

**Respuesta `200`:** `DeporteResource`

---

### `POST /api/deportes` 🔒 admin
Crear deporte.

**Body:**
| Campo | Tipo |
|---|---|
| nombre | string, max 100, unique |

**Respuesta `201`:** `DeporteResource`

---

### `PUT /api/deportes/{id}` 🔒 admin
Actualizar nombre de un deporte.

**Respuesta `200`:** `DeporteResource`

---

### `DELETE /api/deportes/{id}` 🔒 admin
Soft delete de un deporte.

**Respuesta `204`:** sin cuerpo

---

### `POST /api/deportes/{id}/restaurar` 🔒 admin
Restaura un deporte eliminado.

**Respuesta `200`:** `DeporteResource`

---

## Torneos

### `GET /api/torneos`
Lista paginada de torneos (por defecto excluye `finalizado`).

**Query params:**
| Param | Descripción |
|---|---|
| estado | filtra por estado concreto |
| deporte_id | filtra por deporte |
| fecha_desde | fecha_inicio >= valor (Y-m-d) |
| fecha_hasta | fecha_inicio <= valor |
| elo_min | elo_minimo >= valor |
| elo_max | elo_maximo <= valor |

**Respuesta `200`:** colección paginada — `data` + `meta` + `links`
```json
{
  "data": [ ...TorneoResource ],
  "meta": { "current_page": 1, "last_page": 2, "per_page": 9, "total": 15, ... },
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." }
}
```
Cada torneo incluye: `deporte`, `organizador`, `equipos_count` (bloqueados).

---

### `GET /api/torneos/{id}`
Detalle completo de un torneo.

**Respuesta `200`:** `TorneoResource` con relaciones cargadas:
- `deporte`, `organizador`
- `equipos` → cada uno con `capitan`, `miembros` (con `elo_al_unirse`)
- `partidos` → cada uno con `equipo1`, `equipo2`, `ganador`, `historialElo`

---

### `POST /api/torneos` 🔒
Crear torneo. El `creado_por` se asigna automáticamente al usuario autenticado.

**Body:**
| Campo | Tipo | Requerido |
|---|---|---|
| nombre | string, max 200 | sí |
| deporte_id | integer, exists:deportes | sí |
| max_jugadores | integer, min 2 | sí |
| formato | enum | sí |
| elo_minimo | integer, nullable | no |
| elo_maximo | integer, nullable | no |
| min_miembros | integer, nullable | no |
| max_miembros | integer, nullable | no |
| fecha_inicio | datetime, nullable | no |
| fecha_fin | datetime, nullable | no |
| direccion | string, nullable | no |
| ciudad | string, nullable | no |
| provincia | string, nullable | no |

**Respuesta `201`:** `TorneoResource` con `deporte`.

---

### `PUT /api/torneos/{id}` 🔒 organizador o admin
Editar torneo. Solo permitido cuando `estado = abierto`.

**Respuesta `200`:** `TorneoResource`

**Errores:**
- `422` — torneo no está en estado `abierto`

---

### `DELETE /api/torneos/{id}` 🔒 organizador o admin
Eliminar torneo. No permitido si `estado = en_curso`.

**Respuesta `204`:** sin cuerpo

---

### `GET /api/mis-torneos` 🔒
Torneos creados e inscritos del usuario autenticado.

**Respuesta `200`:**
```json
{
  "creados":  [ ...TorneoResource ],
  "inscrito": [ ...TorneoResource ]
}
```

---

### `POST /api/torneos/{id}/iniciar` 🔒 organizador o admin
Genera el bracket y pasa el torneo a estado `programacion`.

- Elimina equipos no confirmados (no bloqueados)
- Asigna semillas aleatorias
- Genera partidos de eliminación simple

**Respuesta `200`:**
```json
{
  "message": "Bracket generado...",
  "torneo": { ...TorneoResource }
}
```

**Errores:**
- `422` — torneo no está `abierto`
- `422` — menos de la mitad de plazas confirmadas

---

### `POST /api/torneos/{id}/confirmar` 🔒 organizador o admin
Confirma el inicio del torneo y envía correos. Pasa a `en_curso`.

Requiere que **todos** los partidos tengan `programado_en` asignado.

**Respuesta `200`:**
```json
{
  "message": "Torneo en curso.",
  "torneo": { ...TorneoResource }
}
```

**Errores:**
- `422` — torneo no está en `programacion`
- `422` — hay partidos sin fecha asignada (indica cuántos)

---

## Equipos

### `GET /api/torneos/{torneo}/equipos`
Lista todos los equipos de un torneo.

**Respuesta `200`:** `EquipoResource[]`  
Incluye: `capitan`, `miembros` (con `elo_al_unirse`), `miembros_count`.

---

### `GET /api/torneos/{torneo}/equipos/{equipo}`
Detalle de un equipo.

**Respuesta `200`:** `EquipoResource` con `capitan` y `miembros`.

---

### `POST /api/torneos/{torneo}/equipos` 🔒
Crear equipo e inscribirse como capitán.

**Body (multipart/form-data):**
| Campo | Tipo | Requerido |
|---|---|---|
| nombre | string, max 100 | sí |
| escudo | file (jpg/png/webp, max 2 MB) | no |

**Respuesta `201`:** `EquipoResource`

**Errores:**
- `422` — torneo no abierto, completo, ya en otro equipo, o ELO fuera de rango

---

### `PATCH /api/torneos/{torneo}/equipos/{equipo}` 🔒 capitán u organizador
Cambiar nombre del equipo.

**Body:**
| Campo | Tipo |
|---|---|
| nombre | string, max 100 |

**Respuesta `200`:** `EquipoResource`

---

### `POST /api/torneos/{torneo}/equipos/{equipo}/escudo` 🔒 capitán u organizador
Subir o reemplazar escudo del equipo.

**Body (multipart/form-data):**
| Campo | Tipo |
|---|---|
| escudo | file (jpg/jpeg/png/webp, max 2 MB) |

**Respuesta `200`:** `EquipoResource`

---

### `DELETE /api/torneos/{torneo}/equipos/{equipo}` 🔒 capitán u organizador
Eliminar equipo. El capitán solo puede hacerlo si el torneo está `abierto`.

**Respuesta `204`:** sin cuerpo

---

### `POST /api/torneos/{torneo}/equipos/{equipo}/unirse` 🔒
Unirse a un equipo (si no está bloqueado).

**Respuesta `200`:**
```json
{ "message": "Te has unido al equipo correctamente." }
```

**Errores:**
- `422` — torneo no abierto, equipo bloqueado, ya inscrito, equipo lleno, ELO fuera de rango

---

### `DELETE /api/torneos/{torneo}/equipos/{equipo}/miembros/{usuario}` 🔒 capitán u organizador
Expulsar miembro. No se puede expulsar al capitán.

**Respuesta `200`:** `EquipoResource` actualizado.

---

### `PATCH /api/torneos/{torneo}/equipos/{equipo}/lock` 🔒 capitán u organizador
Alternar bloqueo del equipo.

- Bloquear: requiere `min_miembros` mínimo → pone `bloqueado=true`, `inscrito=true`
- Desbloquear: `bloqueado=false`

**Respuesta `200`:** `EquipoResource`

---

## Invitaciones

### `GET /invitaciones/{codigo}` _(pública)_
Información de una invitación por código (para mostrar en pantalla de unión).

**Respuesta `200`:**
```json
{
  "codigo": "ABCD1234",
  "vigente": true,
  "torneo": {
    "id": 1,
    "nombre": "Copa Primavera",
    "estado": "abierto",
    "deporte": "Fútbol"
  },
  "equipo": {
    "id": 10,
    "nombre": "Los Cracks",
    "miembros_count": 3
  }
}
```

---

### `GET /api/torneos/{torneo}/equipos/{equipo}/invitacion` 🔒 capitán u organizador
Devuelve la invitación vigente del equipo, o `204` si no existe ninguna.

**Respuesta `200`:** `InvitacionResource`  
**Respuesta `204`:** sin cuerpo (no hay invitación vigente)

---

### `POST /api/torneos/{torneo}/equipos/{equipo}/invitacion` 🔒 capitán u organizador
Crear invitación para el equipo.

**Body:**
| Campo | Tipo | Requerido |
|---|---|---|
| max_usos | integer, nullable | no |
| expira_en | datetime, nullable | no |

**Respuesta `201`:** `InvitacionResource`

---

### `POST /api/equipos/unirse-codigo` 🔒
Unirse a un equipo usando un código de invitación.

**Body:**
| Campo | Tipo |
|---|---|
| codigo | string |

**Respuesta `200`:**
```json
{
  "message": "Te has unido al equipo mediante invitación.",
  "equipo": { ...EquipoResource }
}
```

**Errores:**
- `422` — código inválido/expirado, torneo no abierto, equipo bloqueado, ya inscrito, equipo lleno, ELO fuera de rango

---

## Partidos

### `GET /api/partidos` 🔒
Lista paginada de partidos.

**Query params:**
| Param | Descripción |
|---|---|
| torneo_id | filtra por torneo |
| estado | filtra por estado |

**Respuesta `200`:** colección paginada — `data` + `meta` + `links`
```json
{
  "data": [ ...PartidoResource ],
  "meta": { "current_page": 1, "last_page": 3, "per_page": 20, "total": 45, ... },
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." }
}
```
Cada partido incluye: `equipo1`, `equipo2`, `ganador`, `torneo` (nombres).

---

### `GET /api/partidos/{id}` 🔒
Detalle de un partido.

**Respuesta `200`:** `PartidoResource` con `equipo1`, `equipo2`, `ganador`, `torneo`.

---

### `PATCH /api/partidos/{id}` 🔒 organizador o admin
Actualizar datos del partido (principalmente `programado_en`).

**Body:**
| Campo | Tipo |
|---|---|
| programado_en | datetime |

El backend valida que la fecha sea cronológicamente coherente con las rondas anterior y posterior. Si cambia respecto al valor previo, envía correos a los capitanes de ambos equipos.

**Respuesta `200`:** `PartidoResource`

**Errores:**
- `422` — fecha anterior a la ronda previa o posterior a la siguiente

---

### `PATCH /api/partidos/{id}/resultado` 🔒 organizador o admin
Registrar o corregir resultado de un partido.

**Body:**
| Campo | Tipo | Requerido |
|---|---|---|
| resultado_e1 | string (número) | sí |
| resultado_e2 | string (número) | sí |
| ganador_equipo_id | integer | sí |

- Si el partido ya estaba `finalizado` y cambia el ganador: revierte el ELO anterior y recalcula.
- Si es la primera vez: aplica ELO y avanza al ganador en el bracket.
- Si no quedan partidos pendientes: el torneo pasa automáticamente a `finalizado`.

**Respuesta `200`:** `PartidoResource` con `equipo1`, `equipo2`, `ganador`.

**Errores:**
- `422` — torneo en `programacion`, ganador no pertenece al partido

---

### `DELETE /api/partidos/{id}` 🔒 admin
Eliminar partido.

**Respuesta `204`:** sin cuerpo

---

## Códigos de error comunes

| Código | Significado |
|---|---|
| `401` | Token ausente o inválido |
| `403` | Sin permisos o cuenta baneada |
| `404` | Recurso no encontrado |
| `422` | Error de validación o regla de negocio |

Los errores de validación tienen esta forma:
```json
{
  "message": "The nombre field is required.",
  "errors": {
    "nombre": ["El nombre es obligatorio."]
  }
}
```

Los errores de negocio tienen solo `message`:
```json
{ "message": "El equipo ya tiene el número máximo de miembros." }
```
