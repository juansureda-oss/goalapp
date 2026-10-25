# GoalApp

Dashboard web para seguir desde el móvil las competiciones de fútbol base de la
**Federació Catalana de Futbol (FCF)**, con **datos reales de fcf.cat**.
Hecho para que los hijos de Juan y sus amigos sigan sus ligas. La app es un único
`index.html` (HTML + CSS + JS, sin dependencias) y la interfaz está en castellano.

## Archivos del proyecto
- [`index.html`](index.html) — **la app completa** (un solo archivo, sin build).
- [`goalapi-worker.js`](goalapi-worker.js) — el **Cloudflare Worker proxy** que da acceso a los datos de fcf.cat.

## Multi-liga
La app arranca en una **pantalla de inicio** para elegir liga:

- **Liga de Juan** — Preferente Infantil S13 · Grupo 2 (fútbol 11; partes de 2×35 min).
- **Liga de Mateo** — Primera Divisió Aleví S11 · Grupo 6 (fútbol 7; partes de 4×15 min).

Cada liga tiene su propia competición en fcf.cat, sus equipos y la duración de partido
correcta, así que el reloj de "EN DIRECTO" y el estado de "Descanso" se calculan según
el formato de cada categoría.

## Qué hace la app
- **Portada**: próximo partido de todo el grupo, cuenta atrás, resto de la jornada y rejilla de equipos.
- **Clasificación**: calculada con los criterios oficiales de desempate de la FCF (**Art. 220** del Reglament General):
  puntos → enfrentamiento directo / mini-liga → diferencia de goles → goles a favor. Columnas tipo FCF (Pts, J, G, E, P, F, C, Últimos).
  Al tocar un equipo se abre su ficha.
- **Calendario**: 30 jornadas; por defecto muestra la próxima. El selector de jornada queda fijo (sticky) al hacer scroll. Toca un partido para el pop-up.
- **Goleadores**: ranking del grupo con podio (top 3). Cada jugador se asigna a su equipo por `codequipo`.
- **Ficha de equipo**: secciones **Balance · Goleadores · Plantilla · Partidos** (local a la izquierda, visitante a la derecha).
  La plantilla acumula las tarjetas por jugador (p. ej. 🟨 3).
- **Pop-up de partido**: si ya se jugó, resultado + **goleadores reales de cada equipo**, **tarjetas** y **alineaciones** (del acta del partido).
  Si no se ha jugado, **probabilidad de victoria** (1X2) basada en el rendimiento de la temporada (cuando ambos equipos llevan ≥3 partidos).
- **EN DIRECTO**: reloj correcto por categoría (Infantil S13 = 2×35; Aleví fútbol-7 = 4×15), con "Descanso" en los intermedios.

## Sensación de app (navegación)
- **Barra de navegación inferior fija** (Inicio · Clasificación · Calendario · Goleadores) con la pestaña activa resaltada.
- **Selector de jornada sticky**; al cambiar de jornada **no hay salto de scroll**.
- **Memoria de scroll por sección**: al volver a una pestaña recuperas tu posición; al re-tocar la pestaña activa sube arriba.
- Shell con **scroll interno** (100dvh) para un tacto nativo, modo oscuro automático e instalable como PWA.

## Datos (fcf.cat) y el worker proxy
La web de la FCF bloquea las llamadas directas del navegador (CORS) y responde 403 a las peticiones
sin cabeceras de navegador. Por eso la app no pega directa contra fcf.cat, sino contra un
**Cloudflare Worker proxy** ([`goalapi-worker.js`](goalapi-worker.js)):

- Worker proxy: `https://goalapi.juansureda.workers.dev` (variable `CONFIG.PROXY` en `index.html`).
- Formato de llamada: `…/?url=<encodeURIComponent(URL de https://www.fcf.cat/…)>`
- El worker valida que la URL sea de `www.fcf.cat`, la pide con cabeceras de navegador
  (User-Agent de Chrome + Referer de fcf.cat) y devuelve el JSON con CORS abierto y cache de 30 s.
- Cada liga define su competición con `temporadaId` / `competicioId` / `grupId` (campo `q` en el objeto `LEAGUES` de `index.html`).
- Endpoints usados (vía proxy, sobre `https://www.fcf.cat/api/competition/`): `partidos`, `goleadores`, `acta?codacta=<CODACTA>`.
- Si el proxy no responde, la app usa un calendario de ejemplo embebido como respaldo.

## Hosting / despliegue
La app está servida por otro **Cloudflare Worker de assets estáticos**:
- URL pública: `https://orange-surf-11ad.juansureda.workers.dev/`
- Para publicar cambios de la **app**: en el panel de Cloudflare de ese worker, **New deployment** subiendo el `index.html` actualizado.
- Para publicar cambios del **proxy**: pegar `goalapi-worker.js` en el worker `goalapi` y desplegar.

## Cómo seguir editando
1. `git clone https://github.com/juansureda-oss/goalapp.git`
2. Edita `index.html` (toda la app está ahí) y/o `goalapi-worker.js` (el proxy).
3. Pruébalo abriendo `index.html` en el navegador.
4. Despliega en Cloudflare (ver sección anterior).
5. `git commit` + `git push` para guardar el código aquí.
