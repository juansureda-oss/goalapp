# GoalApp

Dashboard web de la competición **FCF Preferent Infantil S13 · Grup 2** (temporada 2026/27),
con datos reales de **fcf.cat**. Hecho para que el hijo de Juan y sus amigos sigan la liga desde el móvil.

Toda la app es **un único archivo**: [`index.html`](index.html) (HTML + CSS + JS, sin dependencias).

## Qué hace
- **Portada**: próximo partido de todo el grupo, cuenta atrás, resto de la jornada y rejilla de equipos.
- **Clasificación**: calculada con los criterios oficiales de desempate de la FCF (**Art. 220** del Reglament General):
  puntos → enfrentamiento directo / mini-liga → diferencia de goles → goles a favor. Columnas tipo FCF (Pts, J, G, E, P, F, C, Últimos).
- **Calendario**: 30 jornadas; por defecto muestra la próxima; toca un partido para el pop-up.
- **Goleadores**: ranking del grupo con podio (top 3). Cada jugador se asigna a su equipo por `codequipo`.
- **Ficha de equipo**: balance, goleadores del equipo y sus partidos (local a la izquierda, visitante a la derecha).
- **Pop-up de partido**: resultado + **goleadores reales de cada equipo** (del acta del partido). Si no se ha jugado, **probabilidad de victoria** (1X2) basada en el rendimiento de la temporada (a partir de que ambos equipos lleven ≥3 partidos).
- **EN DIRECTO**: reloj correcto para Infantil S13 = **2×35 min** (70'), con "Descanso" en el intermedio.
- **Modo oscuro** automático, animaciones y es instalable como PWA.

## Datos (fcf.cat)
La web de la FCF bloquea las llamadas directas (CORS), así que la app pega contra un **Cloudflare Worker proxy**:

- Proxy: `https://goalapi.juansureda.workers.dev` (variable `CONFIG.PROXY` en `index.html`).
- Parámetros de la competición: `temporadaId=22&competicioId=58162451&grupId=58162453` (`FCF_Q`).
- Endpoints usados (vía proxy, sobre `https://www.fcf.cat/api/competition/`): `partidos`, `goleadores`, `acta?codacta=<CODACTA>`.
- Si el proxy no responde, la app usa un calendario de ejemplo embebido (`EMBEDDED_FIX`).

## Hosting / despliegue
La app está servida por otro **Cloudflare Worker de assets estáticos**:
- URL pública: `https://orange-surf-11ad.juansureda.workers.dev/`
- Para publicar cambios: en el panel de Cloudflare de ese worker, **New deployment** subiendo el `index.html` actualizado.

## Cómo seguir editando
1. `git clone https://github.com/juansureda-oss/goalapp.git`
2. Edita `index.html` (todo está ahí).
3. Prueba abriéndolo en el navegador.
4. Sube el `index.html` al worker `orange-surf-11ad` (New deployment).
5. `git commit` + `git push` para guardar el código aquí.
