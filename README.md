# Creador de Diapositivas Estilo Consultora (McKinsey/BCG)

## ¿Qué es?
Una app web simple para crear y exportar diapositivas tipo PowerPoint (.pptx) con diseño profesional, inspirada en el estilo de consultoras como McKinsey y BCG.

## ¿Cómo usar?
1. Abre `index.html` en tu navegador.
2. Añade, edita y organiza tus diapositivas desde la barra lateral.
3. Escribe el título y contenido (usa `-` o `*` para bullets).
4. Previsualiza tu slide en tiempo real.
5. Haz clic en "Exportar a PPTX" para descargar tu presentación.

## Exportar a PPTX
Para exportar, descarga la librería [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) y agrégala antes de `app.js` en tu `index.html`:

```html
<script src="https://unpkg.com/pptxgenjs/dist/pptxgen.bundle.js"></script>
<script src="app.js"></script>
```

## Sugerencias con Claude
El botón "Sugerir con Claude" es solo un mockup. Para integración real, conecta con la API de Anthropic. 