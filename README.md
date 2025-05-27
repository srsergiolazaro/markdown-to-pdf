# Markdown a PDF

Este es un proyecto que permite convertir documentos en formato Markdown a PDF con un diseño profesional y elegante. Utiliza Next.js y Puppeteer para realizar la conversión.

## Características

- Editor de Markdown en tiempo real
- Conversión a PDF con diseño profesional
- Soporte para elementos Markdown comunes:
  - Encabezados
  - Listas ordenadas y no ordenadas
  - Citas
  - Código y bloques de código
  - Tablas
  - Imágenes
  - Enlaces
  - Elementos details/summary
- Diseño optimizado para impresión
- Numeración automática de páginas
- Fuentes personalizadas y estilos tipográficos profesionales

## Tecnologías Utilizadas

- Next.js 14
- React
- Puppeteer
- Marked (para el parsing de Markdown)
- Tailwind CSS

## Cómo Usar

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
# o
yarn install
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador
5. Escribe tu contenido en Markdown en el editor
6. Haz clic en "Convertir a PDF" para generar el documento

## Uso desde la Línea de Comandos

Puedes convertir documentos Markdown a PDF directamente desde la línea de comandos usando curl:

```bash
# Ejemplo básico
curl -X POST https://markdown-to-pdf.taptapp.xyz/api/markdown-to-pdf \
  -H "Content-Type: application/json" \
  -d "{\"markdown\":\"# Título\\n\\nEste es un párrafo de ejemplo.\"}" \
  --output documento.pdf

# Ejemplo con un archivo Markdown
curl -X POST https://markdown-to-pdf.taptapp.xyz/api/markdown-to-pdf \
  -H "Content-Type: application/json" \
  -d @documento.md \
  --output documento.pdf
```

Para Windows (PowerShell):

```powershell
# Ejemplo básico
$markdown = @{
    markdown = "# Título`n`nEste es un párrafo de ejemplo."
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://markdown-to-pdf.taptapp.xyz/api/markdown-to-pdf" `
    -ContentType "application/json" `
    -Body $markdown `
    -OutFile "documento.pdf"

# Ejemplo con un archivo Markdown
$markdown = Get-Content -Path "documento.md" -Raw
$body = @{
    markdown = $markdown
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://markdown-to-pdf.taptapp.xyz/api/markdown-to-pdf" `
    -ContentType "application/json" `
    -Body $body `
    -OutFile "documento.pdf"
```

## Estructura del Proyecto

- `src/app/page.tsx` - Interfaz de usuario principal
- `src/app/api/markdown-to-pdf/route.ts` - API endpoint para la conversión
- `public/` - Archivos estáticos

## Personalización

El estilo del PDF generado puede ser personalizado modificando los estilos CSS en `src/app/api/markdown-to-pdf/route.ts`. Los estilos incluyen:

- Fuentes personalizadas (Merriweather, Open Sans, Source Code Pro)
- Esquema de colores profesional
- Espaciado y márgenes optimizados
- Estilos para todos los elementos Markdown
