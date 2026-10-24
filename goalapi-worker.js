/*
 * goalapi — Cloudflare Worker (proxy de datos para GoalApp)
 * Desplegado en: https://goalapi.juansureda.workers.dev
 *
 * ¿Por qué existe?
 * La API de fcf.cat (https://www.fcf.cat/api/competition/...) bloquea las llamadas
 * cross-origin desde el navegador (CORS) y, además, responde 403 a las peticiones de
 * servidor que no llevan cabeceras de navegador. Este worker hace de puente: recibe la
 * URL de fcf.cat en el parámetro ?url=, la pide con cabeceras de navegador y devuelve
 * el JSON con CORS abierto y un pequeño cache (30 s).
 *
 * Uso desde la app (index.html, CONFIG.PROXY):
 *   https://goalapi.juansureda.workers.dev/?url=<encodeURIComponent(URL de https://www.fcf.cat/...)>
 * Ejemplos de endpoints usados por GoalApp:
 *   .../api/competition/partidos?temporadaId=22&competicioId=58162451&grupId=58162453
 *   .../api/competition/goleadores?temporadaId=22&competicioId=58162451&grupId=58162453
 *   .../api/competition/acta?codacta=<CODACTA del partido>
 *
 * NOTA: este archivo es una reconstrucción fiel del worker desplegado (mismo
 * comportamiento y mismos formatos de respuesta/error). Si se edita, volver a
 * desplegarlo en el worker "goalapi" de Cloudflare.
 */

const ALLOW = 'https://www.fcf.cat/';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,OPTIONS',
  'access-control-allow-headers': '*',
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'content-type': 'application/json; charset=utf-8' },
  });
}

export default {
  async fetch(request) {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const u = new URL(request.url);
    const target = u.searchParams.get('url');
    // "endpoint" = parte de la URL después de /api (para mensajes de error legibles)
    const endpoint = target ? target.replace(/^https?:\/\/[^/]+\/api/, '') : '';

    // Solo se permite proxyar fcf.cat
    if (!target || !target.startsWith(ALLOW)) {
      return json({ error: 'Invalid or missing url', endpoint }, 400);
    }

    try {
      const upstream = await fetch(target, {
        // Cabeceras de navegador para que fcf.cat no devuelva 403
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'referer': 'https://www.fcf.cat/',
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'ca,es;q=0.9,en;q=0.8',
        },
      });

      if (!upstream.ok) {
        const backendBody = await upstream.text().catch(() => '');
        return json(
          { error: 'Backend returned status ' + upstream.status, backendBody, endpoint },
          200,
        );
      }

      const body = await upstream.text();
      return new Response(body, {
        headers: {
          ...CORS,
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'public, max-age=30',
        },
      });
    } catch (e) {
      return json({ error: 'Failed to fetch competition data', endpoint }, 500);
    }
  },
};
