# Supabase — Documentación de base de datos

## Tablas

### `players`
Jugadores del grupo.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK, auto |
| name | text | Requerido |
| nickname | text | Opcional |
| created_at | timestamptz | Auto |
| deleted_at | timestamptz | NULL = activo, soft delete |

**RLS:** habilitado
- SELECT, INSERT, UPDATE: público
- DELETE: no permitido (se usa soft delete)

---

### `positions`
Posiciones de juego (Armador, Central, Punta).

| Columna | Tipo | Notas |
|---|---|---|
| id | int4 | PK |
| name | text | Nombre visible (ej: "Punta (4)") |
| slug | text | Slug interno (ej: "punta_4") |

**RLS:** habilitado — solo SELECT público. No se modifican desde la app.

---

### `player_positions`
Relación jugador ↔ posición (1 posición por jugador).

| Columna | Tipo | Notas |
|---|---|---|
| player_id | uuid | FK → players |
| position_id | int4 | FK → positions |

**Constraint:** `UNIQUE (player_id)` — un jugador, una posición.

**RLS:** habilitado
- SELECT, INSERT, UPDATE: público
- DELETE: no permitido — se usa `upsert` con `onConflict: player_id`

> **Atención JS:** cuando hay exactamente 1 fila relacionada, el cliente Supabase JS devuelve `player_positions` como **objeto** en vez de **array**. Siempre normalizar: `Array.isArray(pp) ? pp : (pp ? [pp] : [])`

---

### `ratings`
Votos de calificación por jugador.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK, auto |
| player_id | uuid | FK → players |
| voter_id | text | ID del votante (generado en cliente) |
| remate | int2 | 0–10 |
| defensa | int2 | 0–10 |
| saque | int2 | 0–10 |
| recepcion | int2 | Columna DB (se muestra como "Armado" en la UI) |
| movilidad | int2 | 0–10 |
| tecnica | int2 | 0–10 |

**Constraint:** `UNIQUE (player_id, voter_id)` — un voto por jugador por votante.

**RLS:** habilitado
- SELECT, INSERT, UPDATE: público
- El promedio se calcula en el cliente con mínimo 4 votos (`MIN_VOTES = 4`)

> Pendiente: renombrar columna `recepcion` → `armado`

---

### `feedback`
Sugerencias enviadas desde la app.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK, auto |
| message | text | Texto del feedback |
| created_at | timestamptz | Auto |

**RLS:** habilitado — SELECT e INSERT público.

---

## Vistas

### `active_players`
Jugadores activos (sin soft delete).

```sql
CREATE VIEW active_players
WITH (security_invoker = on) AS
SELECT id, name, nickname, created_at, deleted_at
FROM players
WHERE deleted_at IS NULL;
```

- Hereda las políticas RLS de `players`
- La app lee siempre esta vista, nunca `players` directamente
- Para "eliminar" un jugador: `UPDATE players SET deleted_at = now() WHERE id = '...'`

---

## Soft Delete

En vez de DELETE físico, los jugadores se desactivan:

```sql
UPDATE players SET deleted_at = now() WHERE id = 'uuid-del-jugador';
```

Para restaurar:

```sql
UPDATE players SET deleted_at = NULL WHERE id = 'uuid-del-jugador';
```

---

## Variables de entorno

Las keys de Supabase viven en `.env` (ignorado por git):

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

> Nunca commitear `.env` ni la `service_role` key.

---

### `matches`
Partidos jugados.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK, auto |
| category | text | Default `'lawn'` — permite múltiples categorías a futuro |
| played_at | timestamptz | Fecha del partido |
| created_at | timestamptz | Auto |
| score_a | smallint | Resultado equipo A (nullable, se carga después) |
| score_b | smallint | Resultado equipo B (nullable) |
| score_c | smallint | Resultado equipo C (nullable, para 3 equipos a futuro) |

**RLS:** habilitado — SELECT, INSERT y UPDATE público.

> UPDATE requerido para cargar scores después del partido (`score_a`, `score_b`, `score_c`).

---

### `match_players`
Jugadores por partido y equipo.

| Columna | Tipo | Notas |
|---|---|---|
| match_id | uuid | FK → matches (cascade delete) |
| player_id | uuid | FK → players (cascade delete) |
| team | text | `'A'`, `'B'`, `'C'`... — text para soportar más de 2 equipos |

**PK:** `(match_id, player_id)`

**RLS:** habilitado — SELECT e INSERT público.

---

## Pendiente

- Renombrar columna `recepcion` → `armado` en tabla `ratings`
- Tabla `admins` para gestión de jugadores con PIN
- View `player_avg_ratings` — promedio por jugador con mínimo 4 votos
