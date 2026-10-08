# 🚀 NASA API Recopiler & Space Apps Explorer

> **Herramienta interactiva para explorar, probar, evaluar y documentar APIs oficiales de la NASA para proyectos y hackathons (como NASA Space Apps Challenge).**

![NASA Space Apps Toolkit](https://img.shields.io/badge/NASA-Space_Apps_Challenge-0284c7?style=for-the-badge&logo=nasa)
![Status](https://img.shields.io/badge/Estado-Listo_para_usar-10b981?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-HTML5_|_Vanilla_CSS_|_ES6_JS-6366f1?style=for-the-badge)

---

## 🌟 ¿Qué resuelve este proyecto?

Durante el desarrollo de un proyecto o reto de la NASA, los equipos enfrentan el desafío de **saber qué APIs existen, qué datos devuelven exactamente, si tienen restricciones o fallas de CORS, y cómo documentar cuáles servirán para la solución final**.

**NASA API Recopiler** te permite:
1. **Consultar cualquier API en tiempo real** mediante peticiones `GET` configurables.
2. **Analizar la respuesta de inmediato:**
   - 🌲 **Visor JSON interactivo** con coloreado de sintaxis, búsqueda de claves y descarga.
   - 🖼️ **Visor multimedia automático:** Detecta fotos y videos espaciales (APOD, rovers de Marte, satélite EPIC) y genera una galería al instante.
   - 📊 **Extractor de Esquema (Schema):** Lista las propiedades, tipos de datos y permite agregar campos clave con un solo clic.
   - 💻 **Generador de Código:** Genera snippets listos para copiar en **JavaScript (fetch)**, **Python (requests)** y **cURL**.
3. **Documentar y Evaluar en Equipo:**
   - Decisión del equipo: ⭐ *Seleccionada para el proyecto* | 🤔 *En evaluación* | 💡 *Idea secundaria* | ❌ *Descartada*.
   - Puntuación de viabilidad (1 a 5 estrellas).
   - Reto o Categoría del reto de la NASA al que aplica.
   - Notas del equipo: *¿Por qué nos servirá? ¿Qué problema resuelve? ¿Cómo se integra?*
   - Datos clave del JSON que se consumirán.
   - Limitaciones y Rate limits a tener en cuenta.
4. **Exportar el Dossier del Proyecto:**
   - 📝 **Reporte en Markdown (`NASA_APIs_Dossier.md`):** Formato profesional listo para pegar en la postulación del reto o en el `README.md` del repositorio de GitHub.
   - 📦 **Colección en JSON:** Copia de seguridad para compartir con el equipo e importar en sus computadoras.
   - 📊 **Matriz en CSV:** Para abrir en Excel, Google Sheets o Notion.

---

## 🪐 Catálogo de APIs Preconfiguradas Incluidas

La aplicación incluye presets listos con parámetros de prueba para las APIs más potentes de la NASA:

| API | Categoría | Utilidad para el Hackathon |
| :--- | :--- | :--- |
| **APOD** (Astronomy Picture of the Day) | 🔭 Astronomía e Imágenes | Feeds diarios, carruseles, fotos en HD con explicaciones científicas. |
| **NeoWs Feed** (Near Earth Objects) | ☄️ Asteroides y Objetos Cercanos | Órbitas de asteroides cercanos, velocidades, diámetros y alerta de colisión. |
| **Mars Rover Photos** (Curiosity) | 🪐 Exploración Planetaria | Fotos tomadas en la superficie marciana filtradas por Sol (día) y cámara. |
| **EONET v3** (Natural Event Tracker) | 🌍 Monitoreo de la Tierra | Eventos naturales en vivo (incendios, tormentas, volcanes). *¡No requiere API Key!* |
| **EPIC** (Earth Polychromatic Camera) | 🌍 Monitoreo de la Tierra | Fotos del disco completo de la Tierra tomadas desde el satélite DSCOVR. |
| **DONKI CME** (Eyecciones de Masa Coronal) | ☀️ Clima Espacial y Sol | Tormentas solares, eyecciones solares que causan auroras y fallas de satélites. |
| **DONKI Solar Flare** (Llamaradas Solares) | ☀️ Clima Espacial y Sol | Registro de erupciones solares clasificadas por radiación. |
| **NASA Image and Video Library** | 🎬 Archivo y Medios | Búsqueda libre en millones de fotos, audios y videos de misiones de la NASA. |
| **NASA Exoplanet Archive** | 🔭 Astronomía profunda | Consulta SQL (TAP) de planetas descubiertos fuera del sistema solar. |
| **NASA TechTransfer** | 💡 Innovación y Software | Patentes y software aeroespacial liberado para uso público. |

---

## 🚀 Cómo Ejecutar el Proyecto

Tienes dos formas sumamente sencillas de usar la aplicación:

### Opción 1: Servidor Local Integrado (Recomendada con Proxy CORS)
Incluye un servidor Node.js ultraligero **sin dependencias externas** que activa un proxy local para sortear bloqueos de CORS en endpoints estrictos:

```bash
# Iniciar el servidor local
npm start
# O directamente:
node local-server.js
```
Abre tu navegador en:
👉 **`http://localhost:3000`**

---

### Opción 2: Modo Directo (Sin servidor)
Haz doble clic sobre el archivo `index.html` o ábrelo con tu navegador favorito.
> *Nota: Si un endpoint de la NASA bloquea peticiones directas desde el navegador por CORS, activa la casilla **"Proxy CORS Fallback"** en la barra superior.*

---

## 🔑 Cómo Obtener tu API Key Gratuita de la NASA

Por defecto la herramienta usa `DEMO_KEY`, la cual permite hasta **30 consultas por hora** por IP.

Para tu hackathon se recomienda generar una clave personal (es gratis y toma 30 segundos):
1. Ingresa a [https://api.nasa.gov](https://api.nasa.gov).
2. Llena tu nombre y correo en el formulario *"Generate API Key"*.
3. Copia tu clave recibida (permite **1,000 consultas por hora**).
4. Pégala en el campo superior derecho de la app y haz clic en **"Guardar"**. Automáticamente se inyectará en todas tus consultas y presets.

---

## 💡 Sugerencias de Funcionalidades Adicionales Incluidas

En respuesta a lo que necesitabas para tu proyecto:
1. **Botón de Exportar Dossier en Markdown:** Genera un documento con resumen ejecutivo de APIs elegidas, tablas y justificación técnica para impresionar a los evaluadores del concurso.
2. **Extractor de Esquema de Datos:** No necesitas adivinar qué propiedades tiene la respuesta; la tabla te indica cada nombre de propiedad (`string`, `number`, `array`) y te permite agregarlo a los *"Datos clave"* con un botón.
3. **Galería Multimedia Integrada:** Detecta si la respuesta contiene imágenes (`hdurl`, `url`, `img_src`) para que veas qué contenido visual tienes disponible para tu interfaz.
4. **Generador de Código Políglota:** Te da el código listo en JavaScript, Python o cURL para que los programadores del equipo lo integren directamente en el repositorio de la solución.
5. **Persistencia Local (`localStorage`):** Tus notas, valoraciones y APIs guardadas se conservan automáticamente en tu navegador para que nunca pierdas tu investigación.
