/* eslint-disable @typescript-eslint/no-explicit-any */
import { marked } from "marked";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { NextRequest, NextResponse } from "next/server";

// Estilos CSS para mejorar la apariencia del PDF
// Estilos CSS para un documento de alta calidad profesional
const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700&family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Source+Code+Pro:wght@400;500;600&display=swap');

  :root {
    /* --- Core Typography --- */
    --font-body: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --font-heading: 'Merriweather', Georgia, serif;
    --font-code: 'Source Code Pro', Menlo, Monaco, Consolas, "Courier New", monospace;

    /* --- Color Palette - Refined & Professional --- */
    --color-text-primary: #1a1d20;       /* Casi negro, para máxima legibilidad del cuerpo */
    --color-text-secondary: #45494d;    /* Gris oscuro para elementos secundarios */
    --color-text-muted: #6c757d;        /* Gris medio para notas, captions, etc. */
    --color-heading-main: #0f1113;      /* Negro intenso para encabezados principales */
    --color-accent: #005ea2;            /* Azul corporativo, profundo y serio */
    --color-accent-subdued: #2a7ab0;    /* Un azul ligeramente más claro para interacciones sutiles */
    --color-accent-light: #f0f7ff;      /* Azul muy pálido para fondos de énfasis */
    --color-background: #ffffff;
    --color-border-subtle: #e9ecef;     /* Borde muy claro, casi invisible */
    --color-border-medium: #ced4da;     /* Borde estándar para divisiones claras */
    --color-border-strong: #adb5bd;     /* Borde para separaciones más marcadas */
    --color-code-bg: #f8f9fa;           /* Fondo para bloques de código, muy sutil */
    --color-code-text: var(--color-text-secondary);
    --color-table-header-bg: #f1f3f5;
    --color-table-row-alt-bg: #f9f9f9; // Muy sutil

    /* --- Sizing & Spacing - Vertical Rhythm & Harmony --- */
    --base-font-size: 11pt;             /* Aumentado para una lectura más cómoda y formal */
    --base-line-height-multiplier: 1.65; /* Factor para el line-height del cuerpo */
    --base-line-height: calc(var(--base-font-size) * var(--base-line-height-multiplier));
    --base-spacing-unit: 0.5rem;        /* Unidad base más pequeña para granularidad (aprox 8px en 16px base) */
                                        /* Se usarán múltiplos para márgenes y paddings */
    --content-width-max: 68ch;          /* Ancho de línea óptimo para lectura (caracteres) */

    /* --- Borders & Shadows --- */
    --border-radius-soft: 3px;
    --border-radius-medium: 5px;
    --box-shadow-subtle: 0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.04);
    --box-shadow-medium: 0 4px 10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.06);
  }

  /* --- Universal Resets & Base --- */
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html {
    font-size: var(--base-font-size);
    line-height: var(--base-line-height-multiplier);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: var(--font-body);
    color: var(--color-text-primary);
    background-color: var(--color-background);
    margin: 0;
    /* Padding interno para el contenido, crea el margen visual dentro del PDF */
    /* Aumentar padding lateral para mejor estética en A4 */
    padding: calc(var(--base-spacing-unit) * 5) calc(var(--base-spacing-unit) * 7);
    font-feature-settings: "liga" on, "kern" on; /* Habilitar ligaduras y kerning */
    text-rendering: optimizeLegibility;
  }

  /* --- Headings - Clear Hierarchy & Elegance --- */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-heading-main);
    line-height: 1.25;
    margin-bottom: calc(var(--base-spacing-unit) * 3); /* approx 0.75 * base-line-height */
    font-weight: 700;
    letter-spacing: -0.01em;
    max-width: var(--content-width-max); /* Encabezados también respetan el ancho de línea */
  }
  h1 + *, h2 + *, h3 + *, h4 + *, h5 + *, h6 + * { margin-top: calc(var(--base-spacing-unit) * 2) !important; }


  h1 {
    font-size: 2.7rem; /* Ligeramente más contenido pero impactante */
    font-weight: 900;
    margin-top: 0;
    margin-bottom: calc(var(--base-spacing-unit) * 7); /* Más espacio después del H1 */
    padding-bottom: calc(var(--base-spacing-unit) * 2.5);
    border-bottom: 2px solid var(--color-accent);
    letter-spacing: -0.03em; /* Un poco más ajustado para Merriweather Bold */
  }

  h2 {
    font-size: 2.1rem;
    margin-top: calc(var(--base-spacing-unit) * 10); /* Espacio generoso antes de H2 */
    margin-bottom: calc(var(--base-spacing-unit) * 5);
    padding-bottom: calc(var(--base-spacing-unit) * 2);
    border-bottom: 1px solid var(--color-border-medium);
    font-weight: 700;
  }

  h3 {
    font-size: 1.7rem;
    color: var(--color-heading-main);
    margin-top: calc(var(--base-spacing-unit) * 8);
    margin-bottom: calc(var(--base-spacing-unit) * 4);
    font-weight: 700;
    /* Opcional: quitar borde para H3 o hacerlo más sutil */
    /* border-bottom: 1px solid var(--color-border-subtle); */
    /* padding-bottom: calc(var(--base-spacing-unit) * 1); */
  }

  h4 {
    font-size: 1.3rem;
    color: var(--color-text-secondary);
    font-family: var(--font-heading);
    font-weight: 700;
    font-style: italic;
    margin-top: calc(var(--base-spacing-unit) * 7);
    margin-bottom: calc(var(--base-spacing-unit) * 2.5);
  }

  h5 {
    font-size: 1.1rem;
    color: var(--color-text-muted);
    font-weight: 700;
    font-family: var(--font-body);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-top: calc(var(--base-spacing-unit) * 6);
    margin-bottom: calc(var(--base-spacing-unit) * 2);
  }

  h6 {
    font-size: 1rem; /* Mismo tamaño que el cuerpo, pero diferenciado por estilo */
    color: var(--color-text-muted);
    font-weight: 600; /* Semi-bold */
    font-family: var(--font-body);
    font-style: italic;
    margin-top: calc(var(--base-spacing-unit) * 5);
    margin-bottom: calc(var(--base-spacing-unit) * 1.5);
  }

  /* --- Paragraphs & Text Elements --- */
  p {
    margin-top: 0;
    margin-bottom: var(--base-line-height);
    text-align: justify;
    hyphens: auto;
    max-width: var(--content-width-max);
  }
  p:last-child { margin-bottom: 0; }

  /* Sangría de primera línea (toque clásico) */
  /* Excluir párrafos que siguen inmediatamente a encabezados, listas, etc. */
  h1 + p, h2 + p, h3 + p, h4 + p, h5 + p, h6 + p,
  ul + p, ol + p, blockquote + p, pre + p, hr + p,
  details + p, table + p, figure + p,
  div > p:first-child /* Si p está dentro de un div, como en details */
  {
    text-indent: 0;
  }
  /* Aplicar sangría a párrafos que siguen a otros párrafos */
  p + p {
    text-indent: calc(var(--base-spacing-unit) * 4); /* Aproximadamente 2em */
  }


  a {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px solid transparent; /* Preparar para hover, invisible por defecto */
    transition: border-bottom-color 0.2s ease-in-out, color 0.2s ease-in-out;
    padding-bottom: 0.05em; /* Mínimo espacio para el borde */
  }
  a:hover, a:focus {
    color: var(--color-accent-subdued);
    border-bottom-color: var(--color-accent-subdued);
  }

  strong, b { font-weight: 700; color: var(--color-text-primary); }
  em, i { font-style: italic; }
  del { color: var(--color-text-muted); text-decoration: line-through; }
  mark { background-color: #fffbe0; padding: 0.1em 0.3em; border-radius: var(--border-radius-soft); box-shadow: 0 0 0 1px #ffeccc; }


  /* --- Lists (Ordered & Unordered) --- */
  ul, ol {
    margin-top: calc(var(--base-spacing-unit) * 2.5);
    margin-bottom: var(--base-line-height);
    padding-left: calc(var(--base-spacing-unit) * 5);
    max-width: var(--content-width-max);
  }
  ul ul, ol ol, ul ol, ol ul {
    margin-top: calc(var(--base-spacing-unit) * 1.5);
    margin-bottom: calc(var(--base-spacing-unit) * 1.5);
    padding-left: calc(var(--base-spacing-unit) * 4.5);
  }
  li {
    margin-bottom: calc(var(--base-spacing-unit) * 1.5);
    padding-left: calc(var(--base-spacing-unit) * 1.5);
    line-height: var(--base-line-height-multiplier);
  }
  ul { list-style-type: none; }
  ul li::before {
    content: "–"; /* Em dash */
    color: var(--color-accent);
    font-weight: bold; /* Hacer el dash un poco más grueso */
    display: inline-block;
    width: 1em; /* Espacio para el dash */
    margin-left: -2em; /* Ajuste preciso para alineación */
    position: relative;
    top: -0.03em; /* Ajuste vertical fino */
  }
  ol { list-style-position: outside; padding-left: calc(var(--base-spacing-unit) * 6); }
  ol li::marker { font-weight: 600; color: var(--color-text-secondary); }

  /* --- Blockquotes --- */
  blockquote {
    margin: calc(var(--base-spacing-unit) * 5) 0 calc(var(--base-spacing-unit) * 5) calc(var(--base-spacing-unit) * 3);
    padding: calc(var(--base-spacing-unit) * 3) calc(var(--base-spacing-unit) * 4.5);
    border-left: 4px solid var(--color-accent);
    background-color: var(--color-accent-light);
    color: var(--color-text-secondary);
    border-radius: 0 var(--border-radius-medium) var(--border-radius-medium) 0;
    font-style: italic;
    max-width: calc(var(--content-width-max) - var(--base-spacing-unit) * 3);
    box-shadow: var(--box-shadow-subtle);
  }
  blockquote p {
    font-size: 1em;
    line-height: var(--base-line-height-multiplier);
    margin-bottom: calc(var(--base-spacing-unit) * 2.5);
    text-align: left;
    hyphens: none;
    max-width: 100%;
    text-indent: 0 !important; /* Asegurar que no haya sangría en blockquotes */
  }
  blockquote footer, blockquote cite {
    font-style: normal;
    font-size: 0.9em;
    font-weight: 600;
    color: var(--color-text-muted);
    display: block;
    margin-top: calc(var(--base-spacing-unit) * 2.5);
    text-align: right;
  }
  blockquote blockquote {
    margin-top: calc(var(--base-spacing-unit) * 3);
    margin-left: 0;
    margin-right: calc(var(--base-spacing-unit) * -2.5);
    padding: calc(var(--base-spacing-unit) * 2.5) calc(var(--base-spacing-unit) * 3.5);
    border-left-color: var(--color-border-strong);
    background-color: var(--color-background);
    box-shadow: inset 3px 0 0 var(--color-border-medium), var(--box-shadow-subtle);
  }


  /* --- Code Blocks & Inline Code --- */
  code:not(pre > code) {
    font-family: var(--font-code);
    background-color: #eef1f3; /* Un gris azulado muy claro */
    color: var(--color-accent-subdued); /* Coincide con color de enlace */
    padding: 0.2em 0.45em;
    border-radius: var(--border-radius-soft);
    font-size: 0.88em; /* Ligeramente más pequeño */
    word-break: break-word;
    border: 1px solid #dfe3e6;
    font-weight: 500; /* Un poco más de peso para código inline */
  }
  pre {
    font-family: var(--font-code);
    background-color: var(--color-code-bg);
    border: 1px solid var(--color-border-subtle);
    padding: calc(var(--base-spacing-unit) * 3.5);
    margin: var(--base-line-height) 0;
    border-radius: var(--border-radius-medium);
    overflow-x: auto;
    line-height: 1.55;
    font-size: 0.9em;
    color: var(--color-code-text);
    box-shadow: var(--box-shadow-subtle);
    max-width: 100%;
  }
  pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    font-size: 1em;
    border: none;
    font-weight: 400; /* Resetear peso si code inline lo tenía */
  }

  /* --- Tables --- */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: calc(var(--base-line-height) * 1.5) 0; /* Más espacio alrededor de las tablas */
    font-size: 0.92em; /* Ligeramente más pequeño para condensar info */
    border: 1px solid var(--color-border-medium);
    border-radius: var(--border-radius-medium);
    overflow: hidden;
    box-shadow: none; /* Tablas más planas para un look de informe */
  }
  th, td {
    border-width: 0 0 1px 0; /* Solo bordes inferiores para filas */
    border-style: solid;
    border-color: var(--color-border-subtle);
    padding: calc(var(--base-spacing-unit) * 2.5) calc(var(--base-spacing-unit) * 3);
    text-align: left;
    vertical-align: top;
    line-height: 1.5;
  }
  /* Borde derecho para celdas, excepto la última */
  th:not(:last-child), td:not(:last-child) {
    border-right: 1px solid var(--color-border-subtle);
  }
  th {
    background-color: var(--color-table-header-bg);
    font-weight: 600;
    font-family: var(--font-body);
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border-medium); /* Línea más fuerte bajo encabezados */
    text-transform: none;
    font-size: 0.95em;
    white-space: nowrap; /* Evitar que los encabezados se rompan si es posible */
  }
  tbody tr:last-child td {
    border-bottom: none; /* Quitar borde inferior de la última fila */
  }
  tbody tr:nth-child(even) {
    background-color: var(--color-table-row-alt-bg); /* Cebreado sutil */
  }
  /* Alineación específica de ejemplo (ajustar si es necesario) */
  table th:nth-child(2), table td:nth-child(2) { text-align: center; }
  table th:nth-child(3), table td:nth-child(3) { text-align: right; }


  /* --- Images & Figures --- */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: calc(var(--base-line-height) * 1.2) auto; /* Ajustar margen */
    border-radius: var(--border-radius-medium);
    box-shadow: var(--box-shadow-medium);
    border: 1px solid var(--color-border-subtle);
  }
  figure {
    margin: calc(var(--base-line-height) * 1.8) 0;
    padding: 0;
    max-width: 100%;
  }
  figure img { margin-left: auto; margin-right: auto; }
  figcaption {
    text-align: center;
    font-size: 0.87em; /* Un poco más grande */
    color: var(--color-text-muted);
    margin-top: calc(var(--base-spacing-unit) * 2);
    font-style: italic;
    line-height: 1.45;
    max-width: calc(var(--content-width-max) * 0.9); /* Figcaption un poco más ancho */
    margin-left: auto;
    margin-right: auto;
  }

  /* --- Horizontal Rules --- */
  hr {
    border: 0;
    height: 1px;
    background-color: var(--color-border-medium);
    margin: calc(var(--base-line-height) * 2.5) auto; /* Más espacio vertical */
    max-width: calc(var(--content-width-max) * 0.5); /* HR más corta y centrada */
  }

  /* --- Details/Summary (expandible, forzado a 'open') --- */
  details {
    background-color: var(--color-accent-light);
    border: 1px solid var(--color-accent-light);
    border-left: 4px solid var(--color-accent);
    border-radius: var(--border-radius-medium);
    padding: calc(var(--base-spacing-unit) * 3) calc(var(--base-spacing-unit) * 4);
    margin: var(--base-line-height) 0;
    box-shadow: var(--box-shadow-subtle);
  }
  details summary {
    font-weight: 700;
    font-family: var(--font-body);
    color: var(--color-accent);
    padding-bottom: calc(var(--base-spacing-unit) * 2);
    margin-bottom: calc(var(--base-spacing-unit) * 2.5);
    border-bottom: 1px dashed var(--color-border-medium);
    list-style: none;
    cursor: default;
    font-size: 1.1em; /* Summary un poco más grande */
  }
  details summary::-webkit-details-marker, details summary::marker { display: none; }
  details[open] > summary ~ * { display: block !important; }
  details p {
    font-size: 0.95em;
    text-align: left;
    hyphens: none;
    margin-top: calc(var(--base-spacing-unit) * 2.5);
    max-width: 100%;
    text-indent: 0 !important; /* Sin sangría en párrafos de details */
  }

  /* --- Page Footer (Puppeteer Template) --- */
  .page-footer { /* Estilo aplicado por footerTemplate */
    font-family: var(--font-body);
    font-size: 8.5pt;
    color: var(--color-text-muted);
  }

  /* --- Print-Specific Optimizations --- */
  @media print {
    h1, h2, h3, h4, h5, h6,
    pre, blockquote, table, img, figure, details {
      page-break-inside: avoid; /* Evitar cortes de elementos importantes */
    }
    p, li {
      orphans: 3; /* Mínimo de líneas al final de página */
      widows: 3;  /* Mínimo de líneas al inicio de página siguiente */
    }
    a {
      color: var(--color-accent) !important;
      border-bottom: none !important; /* No subrayar enlaces en PDF (ya son de color) */
    }
    /* Opcional: mostrar URL de enlaces (puede ser útil o ruidoso) */
    /*
    a[href^="http"]::after, a[href^="mailto"]::after {
      content: " [" attr(href) "]";
      font-size: 0.8em;
      font-weight: normal;
      color: var(--color-text-muted);
      word-break: break-all;
    }
    */
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { markdown } = body;

    if (!markdown) {
      return NextResponse.json({ error: "Missing markdown" }, { status: 400 });
    }

    if (markdown && typeof markdown === "string") {
      markdown = markdown.replace(/<details>/g, "<details open>");
    }

    marked.setOptions({
      gfm: true,
      breaks: false,
    });

    const markdownHtml = marked.parse(markdown) as string;

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documento</title>
        <style>
          ${getStyles()}
        </style>
      </head>
      <body>
        ${markdownHtml}
      </body>
      </html>
    `;
    const remoteExecutablePath =
      "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(remoteExecutablePath),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        right: "0mm",
        bottom: "20mm",
        left: "0mm",
      },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
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
