# Volleyball Lawn

App web para gestionar jugadores, armar equipos y registrar partidos de vóley (Club de Lawn Tennis).

**Stack:** HTML + CSS + Vanilla JS · Supabase (Postgres) · Chart.js · Sin bundler

---

## Estado actual

### Completado

**Base**
- [x] Estructura de archivos y carpetas
- [x] `index.html` — layout completo (topbar, sidemenu, bottom nav 3 tabs, modales)
- [x] `src/styles/main.css` — variables CSS, dark mode azul-oscuro, cards, nav, formularios
- [x] `src/assets/Lawn.png` — logo CLT en topbar
- [x] Íconos Lucide SVG (luna/sol) para toggle de tema
- [x] `src/api/client.js` — cliente Supabase como IIFE

**Supabase**
- [x] Proyecto creado (región São Paulo)
- [x] Tablas creadas: `positions`, `players`, `player_positions`, `ratings`, `feedback`
- [x] Permisos `anon`: SELECT en todas, INSERT en players/player_positions/ratings/feedback
- [x] Datos semilla: 3 posiciones (Armador, Central, Punta 4)
- [x] Jugadores de prueba insertados (8 jugadores)

**Servicios**
- [x] `src/services/players.js` — getAll, getById, create, getPositions
- [x] `src/services/ratings.js` — getAverages, hasVoted, vote (voter anónimo via localStorage)
- [x] `src/services/feedback.js` — send

**Vistas y controladores**
- [x] `src/views/playersView.js` — render lista + cards
- [x] `src/controllers/playersController.js` — carga, búsqueda toggle, modal agregar/editar jugador
- [x] `src/controllers/themeController.js` — dark/light con persistencia
- [x] `src/controllers/menuController.js` — hamburger + modal feedback
- [x] `src/controllers/tabController.js` — navegación entre tabs

---

## Pendiente

### Jugadores
- [ ] Modal detalle de jugador (al hacer click en la card)
- [ ] Sistema de ratings con sliders (6 atributos: Remate, Defensa, Saque, Recepción, Movilidad, Técnica)
- [ ] Radar chart con Chart.js (se muestra con mínimo 4 votos)
- [ ] Mostrar rating promedio en la card (estrella + número, "xx" si < 4 votos)
- [ ] Botón VOTAR en cada card

### Supabase
- [ ] View `player_avg_ratings` — promedio de stats con mínimo 4 votos
- [ ] RLS (Row Level Security) — todas las tablas están en UNRESTRICTED (acceso público total). Revisar si se agrega autenticación en el futuro

### Partido
- [ ] Tab Partido: selección de jugadores disponibles
- [ ] Armado automático de equipos (balanceado por rating + posiciones)
- [ ] Armado manual de equipos
- [ ] Confirmación de partido (lugar y fecha)
- [ ] Compartir equipos por WhatsApp
- [ ] Tablas Supabase: `matches`, `match_players`

### Historial
- [ ] Tab Historial: lista de partidos jugados
- [ ] Registro de resultado (sets) y MVP
- [ ] Vista detalle de partido
- [ ] Tablas Supabase: `match_results`

### General
- [ ] Feedback submit conectado a Supabase
- [ ] Estados de carga (skeleton / spinner)
- [ ] Manejo de errores visible al usuario (toasts)

---

## Arquitectura

```
index.html
app.js
src/
├── assets/
│   └── Lawn.png
├── api/
│   └── client.js              # Supabase IIFE → window.SupabaseClient
├── services/                  # Acceso a Supabase, sin lógica de UI
│   ├── players.js
│   ├── ratings.js
│   └── feedback.js
├── views/                     # Render de HTML, sin lógica de negocio
│   └── playersView.js
├── controllers/               # Lógica de negocio + eventos
│   ├── playersController.js
│   ├── tabController.js
│   ├── menuController.js
│   └── themeController.js
└── styles/
    └── main.css
```

---

## Schema Supabase (ejecutado)

```sql
create table positions (
  id serial primary key,
  name text not null unique,
  slug text not null unique
);

insert into positions (name, slug) values
  ('Armador', 'armador'),
  ('Central', 'central'),
  ('Punta (4)', 'punta_4');

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text,
  created_at timestamptz default now()
);

create table player_positions (
  player_id uuid references players(id) on delete cascade,
  position_id int references positions(id) on delete cascade,
  primary key (player_id, position_id)
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  voter_id text not null,
  remate smallint check (remate between 0 and 10),
  defensa smallint check (defensa between 0 and 10),
  saque smallint check (saque between 0 and 10),
  recepcion smallint check (recepcion between 0 and 10),
  movilidad smallint check (movilidad between 0 and 10),
  tecnica smallint check (tecnica between 0 and 10),
  created_at timestamptz default now(),
  unique (player_id, voter_id)
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz default now()
);
```

*(Tablas de partidos se agregan en la siguiente etapa)*

---

## Notas técnicas

### Modal de rating (pendiente implementar)
- Sliders con gradiente dinámico: `linear-gradient` inline en `el.style.background`
- Radar reactivo: evento `input` (no `change`) → `chart.update("none")` sin animación
- Color dinámico del radar: stat con valor más alto determina el color
- Instancia del chart persistente: reusar con `.update()` en vez de recrear
- Colores por stat: Remate `#FF4C4C` · Defensa `#00E5FF` · Saque `#2ECC71` · Recepción `#F1C40F` · Movilidad `#F97316` · Técnica `#9B59B6`
