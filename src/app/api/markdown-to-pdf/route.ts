/* eslint-disable @typescript-eslint/no-explicit-any */
import { marked } from "marked";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { NextRequest, NextResponse } from "next/server";

// Estilos CSS para mejorar la apariencia del PDF
const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Source+Code+Pro:wght@400;600&display=swap');

  :root {
    /* Base Typography */
    --font-body: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --font-heading: 'Merriweather', Georgia, serif;
    --font-code: 'Source Code Pro', Menlo, Monaco, Consolas, "Courier New", monospace;

    /* Color Palette - Refinada para profesionalismo */
    --color-text-primary: #212529; /* Gris oscuro para texto principal y encabezados (casi negro) */
    --color-text-secondary: #343a40; /* Gris ligeramente más claro para texto secundario */
    --color-text-muted: #6c757d; /* Gris medio para subtítulos y detalles */
    --color-accent: #007bff; /* Azul profesional y vibrante para acentos */
    --color-accent-light: #e6f2ff; /* Azul muy claro para fondos sutiles */
    --color-accent-dark: #0056b3; /* Azul más oscuro para hover o elementos importantes */
    --color-border-light: #e9ecef; /* Borde gris muy claro */
    --color-border-medium: #ced4da; /* Borde gris medio */
    --color-background-soft: #f8f9fa; /* Fondo muy claro, casi blanco */
    --color-white: #ffffff;
    --color-black: #000000;

    /* Spacing & Sizing */
    --base-font-size: 10.5pt; /* Tamaño base para una lectura cómoda en impresión */
    --base-spacing-unit: 1rem; /* Unidad de espaciado base (16px) */
    --line-height-body: 1.75; /* Aumentado para máxima legibilidad del cuerpo */
    --line-height-heading: 1.3; /* Espaciado de línea para encabezados */

    /* Border Radius */
    --border-radius-default: 4px; /* Pequeño y elegante */
    --border-radius-medium: 8px; /* Para bloques más grandes */
  }

  /* Universal Box Sizing */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* HTML & Body Base Styles */
  html {
    font-size: var(--base-font-size);
    line-height: var(--line-height-body);
    -webkit-print-color-adjust: exact; /* Asegura que los colores se impriman como se especifican */
    print-color-adjust: exact;
  }

  body {
    font-family: var(--font-body);
    color: var(--color-text-primary);
    background-color: var(--color-white);
    margin: 0; /* Puppeteer maneja los márgenes externos del documento */
    /* Padding interno para el contenido, actúa como el margen del texto dentro del cuerpo */
    padding: calc(var(--base-spacing-unit) * 1.8) calc(var(--base-spacing-unit) * 2.8); /* Espaciado generoso */
    -webkit-font-smoothing: antialiased; /* Suavizado de fuentes */
    -moz-osx-font-smoothing: grayscale;
  }

  /* Encabezados - Jerarquía visual clara y elegante */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-text-primary);
    margin-top: calc(var(--base-spacing-unit) * 2.8); /* Más espacio antes */
    margin-bottom: calc(var(--base-spacing-unit) * 0.9); /* Espacio consistente después */
    line-height: var(--line-height-heading);
    font-weight: 700;
  }

  h1 {
    font-size: 2.85rem; /* Un poco más grande para el impacto principal */
    font-weight: 900; /* Extra bold para máxima presencia */
    margin-top: 0;
    margin-bottom: calc(var(--base-spacing-unit) * 1.6);
    padding-bottom: calc(var(--base-spacing-unit) * 0.8);
    border-bottom: 3px solid var(--color-accent); /* Borde de acento prominente */
    letter-spacing: -0.035em; /* Ajuste fino para compresión visual */
    color: var(--color-black); /* Negro puro para máximo contraste */
  }

  h2 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-top: calc(var(--base-spacing-unit) * 3.5); /* Gran separación para nuevas secciones */
    margin-bottom: calc(var(--base-spacing-unit) * 1.1);
    padding-bottom: calc(var(--base-spacing-unit) * 0.6);
    border-bottom: 1px solid var(--color-border-medium); /* Borde divisor sutil pero claro */
    letter-spacing: -0.02em;
    color: var(--color-text-primary);
  }

  h3 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-top: calc(var(--base-spacing-unit) * 2.8);
    margin-bottom: calc(var(--base-spacing-unit) * 0.8);
    color: var(--color-text-primary);
  }

  h4 {
    font-size: 1.45rem;
    font-weight: 600;
    margin-top: calc(var(--base-spacing-unit) * 2.2);
    margin-bottom: calc(var(--base-spacing-unit) * 0.7);
    font-family: var(--font-body); /* Usa la fuente del cuerpo para un contraste sutil */
    color: var(--color-text-secondary);
  }

  h5 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-top: calc(var(--base-spacing-unit) * 1.8);
    margin-bottom: calc(var(--base-spacing-unit) * 0.6);
    font-family: var(--font-body);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em; /* Más espacio para mayúsculas */
  }

  h6 {
    font-size: 1rem;
    font-weight: 700;
    margin-top: calc(var(--base-spacing-unit) * 1.5);
    margin-bottom: calc(var(--base-spacing-unit) * 0.5);
    font-family: var(--font-body);
    color: var(--color-text-muted);
    font-style: italic;
  }

  /* Párrafos */
  p {
    margin-top: 0;
    margin-bottom: calc(var(--base-spacing-unit) * 1.1); /* Espacio generoso y consistente */
    text-align: justify; /* Justificado para un look formal y pulcro */
    hyphens: auto; /* Permite la división de palabras para un mejor ajuste de texto */
    font-size: 1rem;
    line-height: var(--line-height-body);
  }
  p:last-child {
    margin-bottom: 0;
  }

  /* Enlaces */
  a {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600;
    padding-bottom: 1px;
    border-bottom: 1px solid rgba(0, 123, 255, 0.3); /* Subrayado sutil, siempre visible */
    transition: border-bottom-color 0.2s ease-in-out; /* Para compatibilidad web */
  }
  a:hover, a:focus {
    border-bottom-color: var(--color-accent-dark); /* Subrayado más fuerte al 'hover' */
    color: var(--color-accent-dark);
  }

  /* Listas - Claridad y legibilidad */
  ul, ol {
    margin-top: calc(var(--base-spacing-unit) * 0.8);
    margin-bottom: calc(var(--base-spacing-unit) * 1.2);
    padding-left: calc(var(--base-spacing-unit) * 2.2); /* Indentación generosa */
  }
  ul ul, ol ol, ul ol, ol ul {
    margin-top: calc(var(--base-spacing-unit) * 0.5);
    margin-bottom: calc(var(--base-spacing-unit) * 0.5);
    padding-left: calc(var(--base-spacing-unit) * 1.6); /* Menor indentación para anidación */
  }
  li {
    margin-bottom: calc(var(--base-spacing-unit) * 0.45);
    line-height: 1.65;
    padding-left: calc(var(--base-spacing-unit) * 0.2);
  }
  ul {
    list-style-type: none; /* Eliminar el bullet por defecto */
  }
  ul li::before {
    content: "▪"; /* Bullet cuadrado personalizado */
    color: var(--color-accent);
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1.6em; /* Posicionar el bullet para alineación perfecta */
  }
  ol {
    list-style-position: outside; /* Números fuera del texto para mayor limpieza */
  }

  /* Citas en Bloque (Blockquotes) - Diseño premium para resaltar contenido */
  blockquote {
    margin: calc(var(--base-spacing-unit) * 2.2) 0;
    padding: calc(var(--base-spacing-unit) * 1.5) calc(var(--base-spacing-unit) * 2);
    border-left: 6px solid var(--color-accent); /* Borde de acento más grueso y dominante */
    background-color: var(--color-accent-light);
    color: var(--color-text-secondary);
    border-radius: var(--border-radius-default);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* Sombra sutil pero con mayor profundidad */
    font-style: italic;
  }
  blockquote p {
    font-size: 1.05rem; /* Ligeramente más grande que el texto normal */
    line-height: 1.6;
    margin-bottom: calc(var(--base-spacing-unit) * 0.8);
    text-align: left; /* Citas no justificadas para preservar el estilo */
    hyphens: none; /* Sin guiones en citas */
  }
  blockquote p:last-child {
    margin-bottom: 0;
  }
  blockquote footer, blockquote cite {
    font-style: normal;
    font-size: 0.9em;
    color: var(--color-text-muted);
    display: block;
    margin-top: calc(var(--base-spacing-unit) * 1);
    text-align: right;
  }

  /* Bloques de Código - Limpios y legibles */
  code {
    font-family: var(--font-code);
    background-color: var(--color-background-soft);
    color: var(--color-text-primary);
    padding: 0.25em 0.5em; /* Más padding para código inline */
    border-radius: var(--border-radius-default);
    font-size: 0.9em;
    white-space: pre-wrap;
    word-break: break-word;
    border: 1px solid var(--color-border-light); /* Borde sutil para code inline */
  }
  pre {
    font-family: var(--font-code);
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border-medium);
    padding: calc(var(--base-spacing-unit) * 1.2); /* Padding generoso */
    margin: calc(var(--base-spacing-unit) * 2.2) 0;
    border-radius: var(--border-radius-medium);
    overflow-x: auto;
    line-height: 1.5;
    font-size: 0.9em;
    color: var(--color-text-secondary);
    box-shadow: 0 3px 8px rgba(0,0,0,0.06); /* Sombra sutil */
  }
  pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    font-size: 1em;
    border: none; /* No border for code inside pre */
  }

  /* Tablas - Estructuradas y fáciles de leer */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: calc(var(--base-spacing-unit) * 2.2) 0;
    font-size: 0.95em;
    border: 1px solid var(--color-border-medium); /* Borde exterior elegante */
    border-radius: var(--border-radius-default);
    overflow: hidden; /* Asegura que el border-radius se aplique */
    box-shadow: 0 5px 15px rgba(0,0,0,0.1); /* Sombra más pronunciada */
  }
  th, td {
    border: 1px solid var(--color-border-light);
    padding: calc(var(--base-spacing-unit) * 0.9) calc(var(--base-spacing-unit) * 1.3); /* Padding generoso */
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: var(--color-background-soft);
    font-weight: 700;
    color: var(--color-text-primary);
    text-transform: uppercase;
    font-size: 0.9em;
    letter-spacing: 0.04em;
    border-bottom: 2px solid var(--color-border-medium); /* Borde inferior más fuerte para encabezado */
  }
  /* Alineaciones específicas de tabla (según el markdown) */
  th:nth-child(2), td:nth-child(2) { text-align: center; }
  th:nth-child(3), td:nth-child(3) { text-align: right; }
  tbody tr:nth-child(odd) {
    background-color: var(--color-white);
  }
  tbody tr:nth-child(even) {
    background-color: #fcfcfc; /* Rayado de cebra muy sutil */
  }
  tbody tr:hover {
    background-color: var(--color-accent-light); /* Resaltado sutil al 'hover' */
  }

  /* Imágenes - Presentación limpia y profesional */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: calc(var(--base-spacing-unit) * 2.2) auto; /* Centrar y espaciar */
    border-radius: var(--border-radius-default);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12); /* Sombra más definida */
    border: 1px solid var(--color-border-medium); /* Borde sutil alrededor */
  }
  figure {
    margin: calc(var(--base-spacing-unit) * 2.2) 0;
    padding: 0;
  }
  figcaption {
    text-align: center;
    font-size: 0.85em;
    color: var(--color-text-muted);
    margin-top: calc(var(--base-spacing-unit) * 0.7);
    font-style: italic;
  }

  /* Reglas Horizontales - Separación elegante */
  hr {
    border: 0;
    height: 1px;
    background-color: var(--color-border-medium);
    margin: calc(var(--base-spacing-unit) * 3.5) 0; /* Más espacio para una separación clara */
  }

  /* Detalles/Summary - Siempre visible en PDF con estilo */
  details {
    background-color: var(--color-accent-light);
    border: 1px solid var(--color-accent); /* Borde de acento alrededor */
    border-radius: var(--border-radius-default);
    padding: calc(var(--base-spacing-unit) * 1.2);
    margin: calc(var(--base-spacing-unit) * 2) 0;
    box-shadow: 0 3px 8px rgba(0,0,0,0.06);
  }
  details summary {
    font-weight: 700;
    color: var(--color-accent); /* Título del sumario en color de acento */
    padding-bottom: calc(var(--base-spacing-unit) * 0.6);
    margin-bottom: calc(var(--base-spacing-unit) * 0.6);
    border-bottom: 1px dashed var(--color-border-medium); /* Separador punteado */
    list-style: none; /* Oculta el marcador por defecto */
    cursor: default; /* Indicar que no es interactivo en PDF */
    font-size: 1.1em;
  }
  details summary::-webkit-details-marker { display: none; }
  details summary::marker { display: none; }

  /* Asegura que el contenido se muestre cuando el atributo 'open' está configurado */
  details[open] > summary ~ * {
    display: block !important;
  }
  details p {
    font-size: 0.95em;
    text-align: left;
    hyphens: none;
    margin-top: calc(var(--base-spacing-unit) * 0.6);
  }

  /* Pie de página (para el template de Puppeteer) */
  .page-footer {
    font-family: var(--font-body);
    font-size: 9pt; /* Texto del pie de página claro y legible */
    color: var(--color-text-muted);
    /* Posicionado y contenido gestionado por la plantilla de Puppeteer */
  }

  /* Ajustes específicos para impresión - Evitar cortes en la paginación */
  @media print {
    h1, h2, h3, h4, h5, h6,
    pre,
    blockquote,
    table,
    img, figure, details {
      page-break-inside: avoid; /* Evita que estos elementos se corten a través de páginas */
    }
    p {
      orphans: 3; /* Número mínimo de líneas al final de una página */
      widows: 3;  /* Número mínimo de líneas al principio de una página */
    }
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
