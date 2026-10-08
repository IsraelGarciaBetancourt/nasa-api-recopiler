// Catálogo curado de APIs oficiales de la NASA para NASA Space Apps Challenge
const NASA_PRESETS = [
  {
    id: "apod",
    name: "APOD - Astronomy Picture of the Day",
    category: "🔭 Astronomía e Imágenes",
    description: "Cada día una imagen o fotografía diferente del universo con explicación escrita por un astrónomo profesional.",
    badge: "Popular ⭐",
    url: "https://api.nasa.gov/planetary/apod",
    params: [
      { key: "api_key", value: "DEMO_KEY", enabled: true, note: "Tu API Key de NASA o DEMO_KEY" },
      { key: "count", value: "5", enabled: false, note: "Obtener N fotos aleatorias" },
      { key: "thumbs", value: "true", enabled: false, note: "Genera miniatura si es video" }
    ],
    recommendedFor: "Apps educativas, visores de fondos espaciales, dashboards de astronomía, feeds diarios."
  },
  {
    id: "neows-feed",
    name: "Asteroides Cercanos a la Tierra (NeoWs Feed)",
    category: "☄️ Asteroides y Objetos Cercanos",
    description: "Servicio web de objetos cercanos a la Tierra (Near Earth Object Web Service). Rastrea asteroides que se aproximan a la Tierra con diámetros estimados, velocidad y si son potencialmente peligrosos.",
    badge: "Crítico 🚨",
    url: "https://api.nasa.gov/neo/rest/v1/feed",
    params: [
      { key: "start_date", value: "2024-05-01", enabled: true, note: "Fecha inicio (YYYY-MM-DD)" },
      { key: "end_date", value: "2024-05-07", enabled: true, note: "Fecha fin (máx 7 días)" },
      { key: "api_key", value: "DEMO_KEY", enabled: true, note: "API Key" }
    ],
    recommendedFor: "Mapas 3D de órbitas, sistemas de alerta temprana de asteroides, juegos de defensa planetaria."
  },
  {
    id: "mars-curiosity",
    name: "Fotos de Rovers de Marte (Curiosity)",
    category: "🪐 Exploración Planetaria",
    description: "Imágenes tomadas por las cámaras del rover Curiosity en la superficie de Marte según el día solar marciano (Sol).",
    badge: "Exploración 🚀",
    url: "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos",
    params: [
      { key: "sol", value: "1000", enabled: true, note: "Sol marciano (día en Marte)" },
      { key: "camera", value: "fhaz", enabled: true, note: "Cámara: fhaz, rhaz, mast, chemcam, etc." },
      { key: "api_key", value: "DEMO_KEY", enabled: true, note: "API Key" }
    ],
    recommendedFor: "Galerías marcianas interactivas, modelos de visión computacional, simuladores de telemetría de rover."
  },
  {
    id: "eonet-events",
    name: "EONET - Eventos Naturales de la Tierra en Vivo",
    category: "🌍 Monitoreo de la Tierra",
    description: "Earth Observatory Natural Event Tracker v3. Rastrea eventos naturales globales activos (incendios forestales, tormentas severas, volcanes, hielo marino). ¡No requiere API Key!",
    badge: "En Vivo ⚡",
    url: "https://eonet.gsfc.nasa.gov/api/v3/events",
    params: [
      { key: "status", value: "open", enabled: true, note: "Eventos actualmente activos (open) o cerrados (all)" },
      { key: "limit", value: "15", enabled: true, note: "Cantidad máxima de eventos a devolver" }
    ],
    recommendedFor: "Mapas de cambio climático, monitoreo de desastres naturales, apps de respuesta a emergencias, visores geoespaciales."
  },
  {
    id: "epic-earth",
    name: "EPIC - Fotos de la Tierra en Disco Completo",
    category: "🌍 Monitoreo de la Tierra",
    description: "Cámara de imágenes policromáticas de la Tierra a bordo del satélite DSCOVR a 1.5 millones de km. Proporciona imágenes diarias del disco completo iluminado de nuestro planeta.",
    badge: "Satélite 🛰️",
    url: "https://api.nasa.gov/EPIC/api/natural",
    params: [
      { key: "api_key", value: "DEMO_KEY", enabled: true, note: "API Key" }
    ],
    recommendedFor: "Globos 3D interactivos, monitoreo de nubosidad y aerosoles, animaciones del giro de la Tierra."
  },
  {
    id: "donki-cme",
    name: "DONKI - Clima Espacial (Eyecciones Solares CME)",
    category: "☀️ Clima Espacial y Sol",
    description: "Base de datos de notificaciones y conocimiento de clima espacial. Monitorea Eyecciones de Masa Coronal (CME) del Sol que causan tormentas geomagnéticas y auroras boreales.",
    badge: "Clima Espacial ⚡",
    url: "https://api.nasa.gov/DONKI/CME",
    params: [
      { key: "startDate", value: "2024-01-01", enabled: true, note: "Fecha de inicio (YYYY-MM-DD)" },
      { key: "api_key", value: "DEMO_KEY", enabled: true, note: "API Key" }
    ],
    recommendedFor: "Predicción de auroras boreales, protección de redes eléctricas y satélites, dashboards astronómicos avanzados."
  },
  {
    id: "donki-solar-flare",
    name: "DONKI - Erupciones Solares (Solar Flares)",
    category: "☀️ Clima Espacial y Sol",
    description: "Registro de llamaradas solares clasificadas por intensidad (Clase X, M, C, etc.) que afectan comunicaciones de radio e instrumentos.",
    badge: "Energía Solar 💥",
    url: "https://api.nasa.gov/DONKI/FLR",
    params: [
      { key: "startDate", value: "2024-01-01", enabled: true, note: "Fecha de inicio" },
      { key: "api_key", value: "DEMO_KEY", enabled: true, note: "API Key" }
    ],
    recommendedFor: "Análisis de actividad del ciclo solar 25, monitoreo de radiación espacial para misiones Artemis."
  },
  {
    id: "nasa-media-library",
    name: "Biblioteca Multimedia de la NASA (Fotos, Audio y Video)",
    category: "🎬 Archivo y Medios",
    description: "Búsqueda completa de millones de archivos de medios oficiales de la NASA. ¡Acceso libre, no requiere API Key!",
    badge: "Sin API Key 🔓",
    url: "https://images-api.nasa.gov/search",
    params: [
      { key: "q", value: "james webb telescope", enabled: true, note: "Término de búsqueda" },
      { key: "media_type", value: "image", enabled: true, note: "image, video o audio" }
    ],
    recommendedFor: "Buscadores espaciales, catálogos de misiones históricas (Apolo, Hubble, Artemis), plataformas de divulgación."
  },
  {
    id: "exoplanet-archive",
    name: "Archivo de Exoplanetas de la NASA (TAP / SQL)",
    category: "🔭 Astronomía e Imágenes",
    description: "Base de datos astronómica oficial de exoplanetas confirmados fuera de nuestro sistema solar con parámetros orbitales, masas y estrellas anfitrionas.",
    badge: "Big Data 🌌",
    url: "https://exoplanetarchive.ipac.caltech.edu/TAP/sync",
    params: [
      { key: "query", value: "select pl_name, hostname, discoverymethod, disc_year from ps where disc_year > 2022", enabled: true, note: "Consulta SQL astronómica" },
      { key: "format", value: "json", enabled: true, note: "Formato de salida" }
    ],
    recommendedFor: "Modelos predictivos de habitabilidad, mapas galácticos de planetas extrasolares, gráficos interactivos."
  },
  {
    id: "techtransfer",
    name: "NASA TechTransfer (Patentes y Software)",
    category: "💡 Innovación y Tecnología",
    description: "Catálogo de tecnologías, patentes y software desarrollado por la NASA liberado para su uso en la industria.",
    badge: "Patentes 📜",
    url: "https://api.nasa.gov/techtransfer/patent/",
    params: [
      { key: "engine", value: "software", enabled: true, note: "software, patent, o spinoff" },
      { key: "api_key", value: "DEMO_KEY", enabled: true, note: "API Key" }
    ],
    recommendedFor: "Soluciones de transferencia tecnológica comercial, análisis de propiedad intelectual de misiones."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NASA_PRESETS;
}
