/* eslint-disable @typescript-eslint/no-explicit-any */
import { marked } from "marked";
import puppeteer from "puppeteer";
import { NextRequest, NextResponse } from "next/server";

// Estilos CSS para mejorar la apariencia del PDF
const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Open+Sans:wght@300;400;600;700&family=Source+Code+Pro:wght@400;600&display=swap');

  :root {
    --font-body: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --font-heading: 'Merriweather', Georgia, serif;
    --font-code: 'Source Code Pro', Menlo, Monaco, Consolas, "Courier New", monospace;

    --color-text-primary: #212529;
    --color-text-secondary: #343a40; /* Un poco más oscuro para mejor contraste del cuerpo */
    --color-text-muted: #6c757d;
    --color-heading-main: #1a1a1a;
    --color-accent: #005ea2;
    --color-accent-light: #eef6ff; /* Aclarado ligeramente para fondos */
    --color-accent-hover: #003d6b;
    --color-background: #ffffff;
    --color-border-light: #e9ecef;
    --color-border-medium: #ced4da;
    --color-code-bg: #f8f9fa;
    --color-code-text: #343a40;
    --color-quote-border: var(--color-accent);

    --line-height-normal: 1.65; /* Ligeramente ajustado */
    --line-height-heading: 1.25;
    --base-spacing-unit: 1rem; /* 16px */
    --border-radius-small: 3px;
    --border-radius-medium: 5px; /* Ligeramente más pequeño */
  }

  *, *::before, *::after { box-sizing: border-box; }

  html {
    font-size: 10.5pt; /* Ligeramente más grande para el cuerpo */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: var(--font-body);
    line-height: var(--line-height-normal);
    color: var(--color-text-secondary);
    background-color: var(--color-background);
    margin: 0;
    /* Reducimos el padding del body, los márgenes de Puppeteer definirán el espacio exterior */
    padding: 15mm 18mm; /* Menos padding */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Encabezados */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-heading-main);
    margin-top: calc(var(--base-spacing-unit) * 2.5);
    margin-bottom: calc(var(--base-spacing-unit) * 1);
    line-height: var(--line-height-heading);
    font-weight: 700;
  }

  h1 {
    font-size: 2.8rem; /* Ligeramente reducido */
    font-weight: 900;
    margin-top: 0;
    margin-bottom: calc(var(--base-spacing-unit) * 1.8);
    padding-bottom: calc(var(--base-spacing-unit) * 0.6);
    border-bottom: 2px solid var(--color-accent);
    letter-spacing: -0.25px;
  }
  h2 {
    font-size: 2rem; /* Ligeramente reducido */
    margin-top: calc(var(--base-spacing-unit) * 3);
    padding-bottom: calc(var(--base-spacing-unit) * 0.4);
    border-bottom: 1px solid var(--color-border-light);
  }
  h3 {
    font-size: 1.6rem;
    color: var(--color-text-primary);
    font-weight: 700;
    margin-top: calc(var(--base-spacing-unit) * 2.2);
  }
  h4 {
    font-size: 1.25rem;
    color: var(--color-text-primary);
    font-weight: 600;
    font-family: var(--font-body);
  }
  h5 {
    font-size: 1.05rem; /* Ligeramente más pequeño */
    color: var(--color-text-muted);
    font-weight: 600;
    font-family: var(--font-body);
    text-transform: uppercase;
    letter-spacing: 0.75px; /* Un poco más de espaciado */
  }
  h6 {
    font-size: 0.95rem; /* Ligeramente más pequeño */
    color: var(--color-text-muted);
    font-weight: 700;
    font-family: var(--font-body);
  }

  p {
    margin-top: 0;
    margin-bottom: calc(var(--base-spacing-unit) * 0.9); /* Menos espacio entre párrafos */
    text-align: justify;
    hyphens: auto;
  }
  p:last-child { margin-bottom: 0; }

  a {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px solid transparent;
    transition: color 0.15s ease-in-out, border-bottom-color 0.15s ease-in-out;
  }
  a:hover, a:focus {
    color: var(--color-accent-hover);
    border-bottom-color: var(--color-accent); /* Usar el color de acento normal para el subrayado en hover */
  }

  ul, ol {
    margin-top: calc(var(--base-spacing-unit) * 0.4);
    margin-bottom: calc(var(--base-spacing-unit) * 0.9);
    padding-left: calc(var(--base-spacing-unit) * 1.7);
  }
  ul ul, ol ol, ul ol, ol ul {
    margin-top: calc(var(--base-spacing-unit) * 0.2);
    margin-bottom: calc(var(--base-spacing-unit) * 0.2);
    padding-left: calc(var(--base-spacing-unit) * 1.4);
  }
  li {
    margin-bottom: calc(var(--base-spacing-unit) * 0.35);
    padding-left: calc(var(--base-spacing-unit) * 0.25);
  }
  ul { list-style-type: none; }
  ul li::before {
    content: "•";
    color: var(--color-accent);
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1.25em; /* Ajuste fino */
  }
  ol { list-style-position: outside; }

  blockquote {
    margin: calc(var(--base-spacing-unit) * 1.8) 0;
    padding: calc(var(--base-spacing-unit) * 1) calc(var(--base-spacing-unit) * 1.5);
    border-left: 3px solid var(--color-quote-border); /* Borde más fino */
    background-color: var(--color-accent-light);
    color: var(--color-text-secondary);
    border-radius: var(--border-radius-small);
  }
  blockquote p {
    font-size: 0.92em; /* Ligeramente más pequeño */
    line-height: 1.55;
    margin-bottom: calc(var(--base-spacing-unit) * 0.6);
    text-align: left;
    hyphens: none;
  }
  blockquote footer, blockquote cite {
    font-style: italic;
    font-size: 0.85em;
    color: var(--color-text-muted);
    display: block;
    margin-top: calc(var(--base-spacing-unit) * 0.8);
    text-align: right;
  }

  code {
    font-family: var(--font-code);
    background-color: var(--color-accent-light);
    color: var(--color-accent);
    padding: 0.2em 0.4em;
    border-radius: var(--border-radius-small);
    font-size: 0.85em; /* Ligeramente más pequeño */
    word-break: break-word;
  }
  pre {
    font-family: var(--font-code);
    background-color: var(--color-code-bg);
    border: 1px solid var(--color-border-light);
    padding: calc(var(--base-spacing-unit) * 0.9);
    margin: calc(var(--base-spacing-unit) * 1.8) 0;
    border-radius: var(--border-radius-medium);
    overflow-x: auto;
    line-height: 1.5;
    font-size: 0.85em;
    color: var(--color-code-text);
    box-shadow: 0 2px 5px rgba(0,0,0,0.04); /* Sombra más sutil */
  }
  pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    font-size: 1em;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: calc(var(--base-spacing-unit) * 1.8) 0;
    font-size: 0.88em; /* Un poco más pequeño */
    border: 1px solid var(--color-border-medium); /* Borde exterior para tablas */
    border-radius: 0; /* Quitar border-radius si tenemos borde exterior */
    box-shadow: none; /* Quitar sombra si tenemos borde exterior */
    overflow: visible;
  }
  th, td {
    border: 1px solid var(--color-border-light);
    padding: calc(var(--base-spacing-unit) * 0.7) calc(var(--base-spacing-unit) * 0.9);
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: var(--color-code-bg);
    font-weight: 600;
    font-family: var(--font-body);
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-medium); /* Borde más consistente */
  }
  tbody tr:nth-of-type(even) {
    background-color: transparent; /* Quitar cebreado para un look más limpio con bordes */
  }
  tbody tr:hover { background-color: var(--color-accent-light); }


  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: calc(var(--base-spacing-unit) * 1.8) auto;
    border-radius: var(--border-radius-medium);
    box-shadow: 0 4px 10px rgba(0,0,0,0.08); /* Sombra ajustada */
    border: 1px solid var(--color-border-light);
  }
  figure { margin: calc(var(--base-spacing-unit) * 1.8) 0; }
  figcaption {
    text-align: center;
    font-size: 0.82em;
    color: var(--color-text-muted);
    margin-top: calc(var(--base-spacing-unit) * 0.6);
    font-style: italic;
  }

  hr {
    border: 0;
    height: 1px;
    background-color: var(--color-border-medium); /* Línea sólida y sutil */
    margin: calc(var(--base-spacing-unit) * 3) 0;
  }

  /* Elemento Details/Summary - Opción: Mostrar siempre abierto y sin interactividad implícita */
  details {
    background-color: var(--color-accent-light);
    border: 1px solid var(--color-border-light); /* Borde más sutil que el de acento */
    border-left: 3px solid var(--color-accent); /* Mantener acento lateral */
    border-radius: var(--border-radius-medium);
    padding: var(--base-spacing-unit);
    margin: calc(var(--base-spacing-unit) * 1.5) 0;
  }
  details summary { /* Ocultar el marcador y el texto por defecto de summary */
    font-weight: 600;
    font-family: var(--font-body);
    color: var(--color-text-primary); /* No necesariamente el color de acento */
    padding-bottom: calc(var(--base-spacing-unit) * 0.5);
    margin-bottom: calc(var(--base-spacing-unit) * 0.5);
    border-bottom: 1px dashed var(--color-border-medium);
    list-style: none; /* Oculta el triángulo/marcador */
    cursor: default; /* No parece clicable */
  }
  details summary::-webkit-details-marker { display: none; } /* Oculta marcador en WebKit */
  details summary::marker { display: none; } /* Oculta marcador estándar */

  /* Para forzar que 'details' esté abierto en el PDF, idealmente se añade el atributo 'open' al HTML
     antes de Puppeteer, pero esto es un intento CSS (puede no ser 100% fiable en todos los motores PDF) */
  details[open] > summary {
    /* Estilos si está explícitamente abierto */
  }
  /* El contenido de details se mostrará porque añadimos 'open' al HTML mediante JS */
  details > *:not(summary) {
    display: block !important;
  }
  details p {
    font-size: 0.9em;
    text-align: left;
    hyphens: none;
    margin-top: calc(var(--base-spacing-unit) * 0.5);
  }

  /* Pie de página (para el template de Puppeteer) */
  .page-footer {
    font-family: var(--font-body);
    font-size: 8.5pt; /* Ligeramente más grande */
    color: var(--color-text-muted);
    /* Se aplica en el footerTemplate de Puppeteer */
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { markdown } = body; // Cambiado a let para modificarlo

    if (!markdown) {
      return NextResponse.json({ error: "Missing markdown" }, { status: 400 });
    }

    // --- Modificación para <details> ---
    // Reemplazar <details> por <details open> para que esté abierto en el PDF
    // Esto es más robusto que intentar forzarlo solo con CSS
    if (markdown && typeof markdown === "string") {
      markdown = markdown.replace(/<details>/g, "<details open>");
    }
    // --- Fin de modificación ---

    marked.setOptions({
      gfm: true,
      breaks: false, // false es generalmente mejor para párrafos bien formados.
    });

    const markdownHtml = marked.parse(markdown) as string;

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documento</title> <!-- Título genérico para la pestaña del navegador, no para el PDF en sí -->
        <style>
          ${getStyles()}
        </style>
      </head>
      <body>
        ${markdownHtml}
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        right: "0mm",
        bottom: "20mm", // Espacio para el pie de página
        left: "0mm",
      },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>", // Encabezado vacío para quitar fecha y título por defecto
      footerTemplate: `
        <div style="box-sizing: border-box; width: 100%; text-align: center; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 8.5pt; color: #6c757d; padding: 0 15mm;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
    });
    await browser.close();

    const response = new NextResponse(pdf);
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      'attachment; filename="documento_refinado.pdf"'
    );
    return response;
  } catch (error: any) {
    console.error("Error converting markdown to PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Error converting markdown to PDF",
        details: errorMessage,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
