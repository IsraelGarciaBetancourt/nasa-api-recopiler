// Función Serverless para Vercel (Proxy CORS)
// Permite que la app desplegada en Vercel consulte cualquier API de la NASA sin bloqueos de CORS

export default async function handler(req, res) {
  // Configurar cabeceras CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Falta el parámetro "url"' });
  }

  try {
    const targetUrl = decodeURIComponent(url);
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'NASA-API-Recopiler-Vercel/1.0',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    const textData = await response.text();

    res.setHeader('Content-Type', contentType);
    return res.status(response.status).send(textData);
  } catch (error) {
    return res.status(502).json({
      error: 'Error al contactar con la API remota',
      details: error.message
    });
  }
}
