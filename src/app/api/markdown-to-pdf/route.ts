/* eslint-disable @typescript-eslint/no-explicit-any */
import { marked } from "marked";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { NextRequest, NextResponse } from "next/server";

// Función para obtener los estilos CSS del documento PDF
const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Source+Code+Pro:wght@400;500;600&display=swap');

  :root {
    --font-body: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --font-heading: 'Merriweather', Georgia, serif;
    --font-code: 'Source Code Pro', Menlo, Monaco, Consolas, "Courier New", monospace;
    --color-text-primary: #121826;
    --color-text-secondary: #374151;
    --color-text-muted: #6B7280;
    --color-accent: #3182CE;
    --color-accent-hover: #2B6CB0;
    --color-accent-light: #EBF8FF;
    --color-background-body: #FFFFFF;
    --color-background-code: #F3F4F6;
    --color-border-light: #D1D5DB;
    --color-border-medium: #9CA3AF;
    --base-font-size: 11pt;
    --base-line-height: 1.7;
    --spacing-unit: 1rem;
    --border-radius: 3px;
  }

  *, *::before, *::after { box-sizing: border-box; }

  html {
    font-size: var(--base-font-size);
    line-height: var(--base-line-height);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    text-rendering: optimizeLegibility;
    font-variant-ligatures: common-ligatures;
    -moz-font-feature-settings: "liga" on, "clig" on;
    -webkit-font-feature-settings: "liga" on, "clig" on;
    font-feature-settings: "liga" on, "clig" on;
  }

  body {
    font-family: var(--font-body);
    color: var(--color-text-primary);
    background-color: var(--color-background-body);
    margin: 0;
    padding: 20mm 25mm;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-text-primary);
    margin-top: calc(var(--spacing-unit) * 2.8);
    margin-bottom: calc(var(--spacing-unit) * 1);
    line-height: 1.25;
  }

  h1 {
    font-size: 2.6rem;
    font-weight: 900;
    margin-top: 0;
    margin-bottom: calc(var(--spacing-unit) * 2);
    padding-bottom: calc(var(--spacing-unit) * 0.7);
    border-bottom: 2px solid var(--color-accent);
    letter-spacing: -0.035em;
  }

  h2 {
    font-size: 1.9rem;
    font-weight: 700;
    margin-top: calc(var(--spacing-unit) * 3.5);
    margin-bottom: calc(var(--spacing-unit) * 1.2);
    letter-spacing: -0.025em;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: calc(var(--spacing-unit) * 2.6);
    letter-spacing: -0.015em;
  }

  h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    margin-top: calc(var(--spacing-unit) * 2.3);
    margin-bottom: calc(var(--spacing-unit) * 0.7);
  }

  h5 {
    font-size: 1.0rem;
    font-weight: 700;
    font-family: var(--font-body);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.075em;
    margin-top: calc(var(--spacing-unit) * 2.1);
    margin-bottom: calc(var(--spacing-unit) * 0.6);
  }

  h6 {
    font-size: 0.95rem;
    font-weight: 500;
    font-family: var(--font-body);
    font-style: italic;
    color: var(--color-text-muted);
    margin-top: calc(var(--spacing-unit) * 1.9);
    margin-bottom: calc(var(--spacing-unit) * 0.5);
  }

  p {
    margin-top: 0;
    margin-bottom: calc(var(--spacing-unit) * 1.0);
    text-align: justify;
    hyphens: auto;
    font-size: 1rem;
    line-height: 1.75;
  }
  p:last-child { margin-bottom: 0; }

  a {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px dotted var(--color-accent-light);
    transition: color 0.2s ease, border-bottom-color 0.2s ease, border-bottom-style 0.2s ease;
  }
  a:hover, a:focus {
    color: var(--color-accent-hover);
    border-bottom-color: var(--color-accent-hover);
    border-bottom-style: solid;
  }

  ul, ol {
    margin-top: calc(var(--spacing-unit) * 0.6);
    margin-bottom: calc(var(--spacing-unit) * 1.0);
    padding-left: calc(var(--spacing-unit) * 2.2);
  }
  ul ul, ol ol, ul ol, ol ul {
    margin-top: calc(var(--spacing-unit) * 0.25);
    margin-bottom: calc(var(--spacing-unit) * 0.25);
    padding-left: calc(var(--spacing-unit) * 1.6);
  }
  li {
    margin-bottom: calc(var(--spacing-unit) * 0.35);
    padding-left: calc(var(--spacing-unit) * 0.25);
    line-height: 1.65;
  }
  ul { list-style-type: none; }
  ul li::before {
    content: "•";
    color: var(--color-accent);
    font-size: 0.8em;
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1.35em;
    vertical-align: 0.1em;
  }
  ol { list-style-position: outside; }

  blockquote {
    margin: calc(var(--spacing-unit) * 2.0) 0;
    padding: calc(var(--spacing-unit) * 1.1) calc(var(--spacing-unit) * 1.6);
    border-left: 3px solid var(--color-accent);
    background-color: var(--color-accent-light);
    color: var(--color-text-secondary);
    border-radius: var(--border-radius);
    font-style: italic;
  }
  blockquote p {
    font-size: 1rem;
    line-height: 1.65;
    margin-bottom: calc(var(--spacing-unit) * 0.7);
    text-align: left;
    hyphens: none;
  }
  blockquote p:last-child { margin-bottom: 0; }
  blockquote footer, blockquote cite {
    font-style: normal;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    display: block;
    margin-top: calc(var(--spacing-unit) * 0.9);
    text-align: right;
  }

  code {
    font-family: var(--font-code);
    background-color: var(--color-accent-light);
    color: var(--color-accent);
    padding: 0.15em 0.4em;
    border-radius: var(--border-radius);
    font-size: 0.86em;
    white-space: pre-wrap;
    word-break: break-word;
    border: 1px solid var(--color-border-light);
  }
  pre {
    font-family: var(--font-code);
    background-color: var(--color-background-code);
    border: 1px solid var(--color-border-light);
    padding: calc(var(--spacing-unit) * 1.1);
    margin: calc(var(--spacing-unit) * 2.0) 0;
    border-radius: var(--border-radius);
    overflow-x: auto;
    line-height: 1.5;
    font-size: 0.88em;
  }
  pre code {
    background-color: transparent;
    border: none;
    padding: 0;
    font-size: 1em;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: pre;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: calc(var(--spacing-unit) * 2.0) 0;
    font-size: 0.9rem;
    border-top: 1.5px solid var(--color-text-primary);
    border-bottom: 1.5px solid var(--color-text-primary);
  }
  th, td {
    border: none;
    padding: calc(var(--spacing-unit) * 0.9) calc(var(--spacing-unit) * 1);
    text-align: left;
    vertical-align: top;
  }
  th {
    font-weight: 600;
    font-family: var(--font-body);
    color: var(--color-text-primary);
    text-transform: none;
    font-size: 0.92em;
    border-bottom: 1px solid var(--color-border-medium);
  }
  table th:nth-child(2), table td:nth-child(2) { text-align: center; }
  table th:nth-child(3), table td:nth-child(3) { text-align: right; }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: calc(var(--spacing-unit) * 2.0) auto;
    border-radius: var(--border-radius);
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  figure { margin: calc(var(--spacing-unit) * 2.0) 0; padding: 0; }
  figcaption {
    text-align: center;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: calc(var(--spacing-unit) * 0.8);
    font-style: italic;
  }

  hr {
    border: 0;
    height: 0.5px;
    background-color: var(--color-border-light);
    margin: calc(var(--spacing-unit) * 4) 0;
  }

  details {
    background-color: var(--color-accent-light);
    border: 1px solid var(--color-border-light);
    border-left: 3px solid var(--color-accent);
    border-radius: var(--border-radius);
    padding: calc(var(--spacing-unit) * 1);
    margin: calc(var(--spacing-unit) * 1.8) 0;
  }
  details summary {
    font-weight: 700;
    font-family: var(--font-heading);
    color: var(--color-text-primary);
    padding-bottom: calc(var(--spacing-unit) * 0.5);
    margin-bottom: calc(var(--spacing-unit) * 0.7);
    border-bottom: 1px dashed var(--color-border-medium);
    list-style: none;
    cursor: default;
    font-size: 1.05rem;
  }
  details summary::-webkit-details-marker, details summary::marker { display: none; }
  details[open] > summary ~ * { display: block !important; }
  details p {
    font-size: 0.92rem;
    text-align: left;
    hyphens: none;
    margin-top: calc(var(--spacing-unit) * 0.7);
    color: var(--color-text-secondary);
  }

  .page-footer {
    font-family: var(--font-body);
    font-size: 8.5pt;
    color: var(--color-text-muted);
  }

  @media print {
    h1, h2, h3, h4, h5, h6,
    pre, blockquote, table,
    img, figure, details {
      page-break-inside: avoid;
    }
    p, li, figcaption, details p {
      orphans: 3;
      widows: 3;
    }
    a {
      color: var(--color-accent) !important;
      border-bottom: none !important;
    }
  }
`;

// Endpoint POST para convertir Markdown a PDF
export async function POST(req: NextRequest) {
  let browser: any;
  try {
    // 1. Extraer y validar el contenido de Markdown del cuerpo de la solicitud
    const body = await req.json();
    let { markdown } = body;

    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json({ error: "El contenido de Markdown es obligatorio y debe ser una cadena de texto." }, { status: 400 });
    }

    // 2. Pre-procesar el Markdown si es necesario
    // Asegura que las etiquetas <details> estén abiertas por defecto para la impresión
    markdown = markdown.replace(/<details>/g, "<details open>");

    // 3. Configurar 'marked' para la conversión de Markdown a HTML
    marked.setOptions({
      gfm: true,      // Habilitar tablas y otras características de GitHub Flavored Markdown
      breaks: false,  // No insertar <br> en saltos de línea simples
      pedantic: false // No ser excesivamente estricto con la sintaxis
    });

    const markdownHtml = marked.parse(markdown) as string;

    // 4. Construir el HTML completo con estilos incrustados
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Documento PDF</title>
        <style>${getStyles()}</style>
      </head>
      <body>
        ${markdownHtml}
      </body>
      </html>
    `;

    // 5. Configurar y lanzar Puppeteer con Chromium
    // La URL remota apunta a una versión estable de Chromium empaquetada para entornos sin servidor
    const remoteExecutablePath = "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";
    
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(remoteExecutablePath),
      headless: true, // Usar el modo headless de Chromium
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // 6. Cargar el HTML en la página y esperar a que la red esté inactiva
    await page.setContent(fullHtml, { waitUntil: "networkidle0", timeout: 30000 });

    // 7. Generar el PDF con opciones de formato y encabezado/pie de página
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "0mm", bottom: "20mm", left: "0mm" },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>", // Encabezado vacío
      footerTemplate: `
        <div style="box-sizing: border-box; width: 100%; text-align: center; font-family: 'Open Sans', sans-serif; font-size: 8.5pt; color: #6c757d; padding: 0 15mm;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
    });

    // 8. Crear y devolver la respuesta HTTP con el PDF
    const response = new NextResponse(pdf);
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set("Content-Disposition", 'attachment; filename="documento.pdf"');
    
    return response;

  } catch (error: any) {
    // 9. Manejo de errores centralizado
    console.error("Error al convertir Markdown a PDF:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    const errorStack = process.env.NODE_ENV === 'development' ? error.stack : undefined;

    return NextResponse.json(
      {
        error: "No se pudo generar el PDF.",
        details: errorMessage,
        stack: errorStack, // Incluir el stack solo en desarrollo por seguridad
      },
      { status: 500 }
    );

  } finally {
    // 10. Asegurarse de que el navegador Puppeteer se cierre siempre
    if (browser) {
      await browser.close();
    }
  }
}