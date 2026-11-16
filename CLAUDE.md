# Atelier Gourmet — sitio de una página

Sitio estático (HTML/CSS/JS sin framework) para Atelier Gourmet, Hermosillo, Sonora.

## Reglas
- El estándar visual vive en `docs/refero-styles.md` ("spiced parchment gallery"). Los valores se reflejan en `src/css/tokens.css`; no uses colores, tamaños ni radios fuera de esos tokens.
  - Lienzo pergamino `#d8cbb8`, texto `#2c2c2c` (nunca negro puro), único acento azafrán `#d49653` (estrellas, estados activos, puntuación; máx. 2–3 por pantalla).
  - Display: Cormorant Garamond 300 en MAYÚSCULAS (sustituto de TT Ramillas; nunca en negrita, nunca < 22px). UI/cuerpo: Manrope 500/700 (sustituto de Satoshi). Fuentes autoalojadas en `src/assets/fonts`.
  - Tarjetas/secciones/imágenes con radio 0; 3px solo en botones, inputs y etiquetas. Filetes de 1px `#b6ab9c` como separadores. Sin sombras ni degradados (salvo el velo oscuro sobre fotografía/video).
  - Botones solo ghost/outlined o de texto; nada de botones rellenos de color. Párrafos alineados a la izquierda.
  - Excepción aprobada por el cliente (versión C · Temporada, `src/css/menu-tones.css`): el fondo del menú cambia de tinte según la categoría visible (Canapés pergamino, Principales cobre #d6b8a0, Sides mantequilla #e0cfa0, Ensaladas salvia #c3c8a8, Combos pimentón #dbb3a5, Brunch yogurt y miel #e7dcc8, Postres rosa cacao #dcc1bd), con un acento propio por categoría. Texto siempre tinta (contraste ≥ 7.3:1).
  - Assets versionados (`?v=N` en CSS/JS de index.html): súbelo en cada despliegue para evitar caché de GitHub Pages.
  - Movimiento: 0.4s con cubic-bezier(0.25, 0.46, 0.45, 0.94); marquesina de platillos 27s lineal. Parallax solo en las capas del hero (petición del cliente). Todo se desactiva con prefers-reduced-motion.
- Regla estricta de contenido: nunca inventar precios, premios, historia ni datos específicos. Solo usar lo que consta en las fuentes del negocio. Las reseñas deben ser textuales.
- Teléfono: `tel:+526622445593`. WhatsApp: `https://wa.me/526622445593?text=…` con mensaje precodificado.
- Dirección: Blvd. Ignacio Soto 27, Periodista, 83156 Hermosillo, Son. (enlace a Google Maps con indicaciones).
- Moneda MXN. Pedido mínimo de 10 PAX en Combos.

## Pendientes de confirmar con el cliente
- Croissant de Burrata ($1,700): rendimiento no especificado.
- Panqué de Zanahoria ($290): rendimiento no especificado.
- Si el pedido mínimo de 10 PAX aplica a Principales por persona.
- Reseñas textuales (3): no se encontraron públicamente; la sección muestra la calificación verificada (4,9 · 25 en Google) con enlace a Google. Agregar citas solo si el cliente las provee.

## Estructura
`src/index.html` · `src/css/{tokens,main,parallax}.css` · `src/js/{main,parallax,cart}.js` · `src/assets/{img,video,fonts}`

Deploy: GitHub Pages vía `.github/workflows/pages.yml` (publica `src/`). URL: https://yoshio28.github.io/Atelier-Gourmet/
