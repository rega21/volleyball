# Volleyball Lawn

App web para gestionar jugadores, armar equipos y registrar partidos de vóley (Club de Lawn Tennis).

**Stack:** HTML + CSS + Vanilla JS · Supabase (Postgres) · Chart.js · GSAP (Flip plugin) · Lucide icons · Sin bundler

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
- [x] `src/services/ratings.js` — getAverages, getAllAverages, getMyVotedIds, upsert vote
- [x] `src/services/feedback.js` — send

**Vistas y controladores**
- [x] `src/views/playersView.js` — render lista + cards con rating y botón dinámico (VOTAR/EDITAR)
- [x] `src/controllers/playersController.js` — carga, búsqueda toggle, modal agregar/editar jugador
- [x] `src/controllers/ratingsController.js` — modal de rating con sliders + radar chart (Chart.js), upsert de votos, pre-carga voto existente
- [x] `src/controllers/themeController.js` — dark/light con persistencia
- [x] `src/controllers/menuController.js` — hamburger + modal feedback
- [x] `src/controllers/tabController.js` — navegación entre tabs con callbacks por tab
- [x] `src/controllers/partidoController.js` — selección de jugadores, armado automático snake draft

---

## Pendiente

### Jugadores
- [x] Sistema de ratings con sliders (6 atributos: Remate, Defensa, Saque, Armado, Movilidad, Técnica)
- [x] Radar chart con Chart.js reactivo en tiempo real
- [x] Rating promedio en la card (⭐ número, "xx" si < 4 votos)
- [x] Botón dinámico: 🗳️ VOTAR (sin voto) / ✏️ EDITAR (ya votó, pre-carga valores)
- [x] Editar jugador haciendo click en el nombre (nombre, apodo, posición)
- [x] Posición: radio button (una sola posición, obligatoria)
- [x] Iconos Lucide en botones Buscar y Agregar
- [x] Navegación entre jugadores dentro del modal de rating: flechas < > + swipe táctil izquierda/derecha (excluye zona de sliders)
- [x] Nombre del jugador en el botón de acción: "Calificar · Nombre" / "Actualizar · Nombre" (se eliminó el h2 del header para ganar espacio)
- [x] Feedback visual tras enviar voto: botón muestra "✓ Guardado" en verde por 1.5s
- [x] Botón VOTAR → CALIFICAR, EDITAR → ACTUALIZAR
- [x] Badge "☆ Pendiente" sin contador de votos
- [x] Botón CALIFICAR azul con borde suave, ACTUALIZAR neutro con borde gris
- [x] Lista de jugadores con scroll interno (header fijo, lista scrolleable)
- [ ] Modal detalle de jugador (ver stats completos)

### Supabase
- [ ] View `player_avg_ratings` — promedio de stats con mínimo 4 votos
- [x] RLS habilitado en todas las tablas — ver [SUPABASE.md](SUPABASE.md) para detalle completo
- [x] Vista `active_players` con soft delete (columna `deleted_at`)
- [x] `upsert` atómico en `player_positions` (sin DELETE intermedio)
- [x] Constraint `UNIQUE (player_id, voter_id)` en `ratings`
- [x] Constraint `UNIQUE (player_id)` en `player_positions`
- [ ] Renombrar columna `recepcion` → `armado` en tabla `ratings` (por ahora se muestra como "Armado" en la UI pero la columna DB mantiene el nombre original)

### Partido
- [x] Selección de jugadores con filas full-width (nombre/apodo + posición + checkbox azul)
- [x] Contador de seleccionados en tiempo real
- [x] Toggle Balanceado / Manual
- [x] Modo Balanceado: snake draft por rating, máx 14 jugadores (7v7)
- [x] Modo Balanceado: swap de jugadores entre equipos con click + animación GSAP FLIP (los nombres vuelan a su nueva posición) + flash verde al completar
- [x] Modo Manual: asignación uno a uno con botones A/B por jugador
- [x] Aviso si hay 15+ jugadores (tercer equipo pendiente)
- [x] Footer fijo con toggle y botón de generar
- [ ] Tercer equipo para 15+ jugadores (formato rey de la cancha)
- [ ] Compartir equipos por WhatsApp
- [ ] Tablas Supabase: `matches`, `match_players` (postergado)

### Historial
- [ ] Tab Historial: lista de partidos jugados
- [ ] Registro de resultado (sets) y MVP
- [ ] Vista detalle de partido
- [ ] Tablas Supabase: `match_results`

### General
- [x] App shell refactor: topbar + content + bottom-nav en contenedor flex, sin position:fixed
- [x] Menú hamburguesa → dropdown que nace desde el botón (Admin, Rating Global, Tabla General, Sugerencias, Info App)
- [x] Modal Info App: logo, versión, features, crédito + botón "Descargar App" (PWA install prompt, solo aparece si aún no está instalada)
- [x] Fix: partidoActions visible al cargar en tab jugadores (renderList ya no fuerza display:flex)
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

### Service Worker — cómo funciona el caché

El SW cachea todos los assets estáticos (CSS, JS, HTML, imágenes) con una clave de versión (`voley-clt-vN`).

**Flujo de actualización automática:**
1. El browser detecta que `service-worker.js` cambió (compara byte a byte)
2. Instala el nuevo SW en segundo plano
3. Al activarse, borra el cache viejo y descarga todo fresco
4. El listener `updatefound` en `app.js` hace `window.location.reload()` automáticamente

**Regla práctica:** cada vez que hacés un deploy con cambios de CSS o JS, hay que bumpar la versión del cache en `service-worker.js`:
```
const CACHE = 'voley-clt-v3'; // → v4, v5, etc.
```
Sin este cambio, el browser sigue sirviendo los archivos viejos del cache.

**En desarrollo local:** el browser no siempre re-chequea el SW en cada recarga normal. Si ves cambios que no se reflejan, usar `Ctrl+Shift+R` (hard refresh) o ir a DevTools → Application → Service Workers → "Update on reload".

---

### Modal de rating (pendiente implementar)
- Sliders con gradiente dinámico: `linear-gradient` inline en `el.style.background`
- Radar reactivo: evento `input` (no `change`) → `chart.update("none")` sin animación
- Color dinámico del radar: stat con valor más alto determina el color
- Instancia del chart persistente: reusar con `.update()` en vez de recrear
- Colores por stat: Remate `#FF4C4C` · Defensa `#00E5FF` · Saque `#2ECC71` · Recepción `#F1C40F` · Movilidad `#F97316` · Técnica `#9B59B6`
