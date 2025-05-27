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

    /* Color Palette */
    --color-primary: #1a1a1a; /* Gris muy oscuro para texto principal y encabezados */
    --color-secondary: #333; /* Ligeramente más claro para texto menos prominente */
    --color-muted: #666; /* Para subtítulos, detalles menores */
    --color-accent: #007bff; /* Azul vibrante para enlaces, resaltados */
    --color-accent-light: #e6f2ff; /* Azul muy claro para fondos */
    --color-border: #ddd; /* Gris claro para bordes sutiles */
    --color-border-dark: #ccc; /* Ligeramente más oscuro para líneas más fuertes */
    --color-background-light: #f9f9f9; /* Fondo claro general */
    --color-white: #ffffff;

    /* Spacing & Sizing */
    --base-font-size: 10.5pt; /* Tamaño base para una lectura cómoda en impresión */
    --base-spacing-unit: 1rem; /* Unidad de espaciado base (16px) */
    --line-height-body: 1.7; /* Aumentado para mejor legibilidad del cuerpo */
    --line-height-heading: 1.3; /* Espaciado de línea para encabezados */

    /* Border Radius */
    --border-radius-default: 4px;
    --border-radius-large: 8px;
  }

  /* Universal Box Sizing */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* HTML & Body Base Styles */
  html {
    font-size: var(--base-font-size);
    line-height: var(--line-height-body);
    /* Asegura que los colores se impriman como se especifican (importante para fondos y acentos) */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: var(--font-body);
    color: var(--color-primary);
    background-color: var(--color-white);
    margin: 0; /* Puppeteer maneja los márgenes externos del documento */
    /* Padding interno para el contenido, actúa como el margen del texto dentro del cuerpo */
    padding: calc(var(--base-spacing-unit) * 1.5) calc(var(--base-spacing-unit) * 2.5);
    -webkit-font-smoothing: antialiased; /* Suavizado de fuentes para mejor renderizado */
    -moz-osx-font-smoothing: grayscale;
  }

  /* Encabezados */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-primary);
    margin-top: calc(var(--base-spacing-unit) * 2.5);
    margin-bottom: calc(var(--base-spacing-unit) * 0.8);
    line-height: var(--line-height-heading);
    font-weight: 700; /* Peso por defecto para encabezados */
  }

  h1 {
    font-size: 2.8rem; /* Gran tamaño para el título principal */
    font-weight: 900; /* Extra bold para impacto */
    margin-top: 0;
    margin-bottom: calc(var(--base-spacing-unit) * 1.5);
    padding-bottom: calc(var(--base-spacing-unit) * 0.7);
    border-bottom: 3px solid var(--color-accent); /* Borde grueso de acento */
    letter-spacing: -0.03em; /* Espaciado de letra ligeramente más ajustado */
    color: #000; /* Negro puro para máximo contraste */
  }

  h2 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-top: calc(var(--base-spacing-unit) * 3); /* Más espacio superior para secciones nuevas */
    margin-bottom: calc(var(--base-spacing-unit) * 1);
    padding-bottom: calc(var(--base-spacing-unit) * 0.5);
    border-bottom: 1px solid var(--color-border); /* Borde sutil para división */
    letter-spacing: -0.02em;
    color: var(--color-primary);
  }

  h3 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-top: calc(var(--base-spacing-unit) * 2.5);
    margin-bottom: calc(var(--base-spacing-unit) * 0.7);
    color: var(--color-primary);
  }

  h4 {
    font-size: 1.4rem;
    font-weight: 600;
    margin-top: calc(var(--base-spacing-unit) * 2);
    margin-bottom: calc(var(--base-spacing-unit) * 0.6);
    font-family: var(--font-body); /* Usa la fuente del cuerpo para encabezados de menor nivel */
    color: var(--color-secondary);
  }

  h5 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-top: calc(var(--base-spacing-unit) * 1.8);
    margin-bottom: calc(var(--base-spacing-unit) * 0.5);
    font-family: var(--font-body);
    color: var(--color-secondary);
    text-transform: uppercase; /* Para un estilo de sección o categoría */
    letter-spacing: 0.05em; /* Más espacio para letras mayúsculas */
  }

  h6 {
    font-size: 1rem;
    font-weight: 700;
    margin-top: calc(var(--base-spacing-unit) * 1.5);
    margin-bottom: calc(var(--base-spacing-unit) * 0.4);
    font-family: var(--font-body);
    color: var(--color-muted);
    font-style: italic; /* Para detalles o sub-subtítulos */
  }

  /* Párrafos */
  p {
    margin-top: 0;
    margin-bottom: calc(var(--base-spacing-unit) * 1); /* Espacio consistente entre párrafos */
    text-align: justify; /* Alineación justificada para un look profesional */
    hyphens: auto; /* Habilitar guiones para un mejor ajuste de texto */
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
    padding-bottom: 1px; /* Espacio visual para el subrayado */
    border-bottom: 1px solid rgba(0, 123, 255, 0.3); /* Subrayado sutil */
    transition: border-bottom-color 0.2s ease-in-out; /* Transición para un posible hover en web */
  }
  a:hover, a:focus {
    border-bottom-color: var(--color-accent); /* Subrayado más pronunciado al "hover" */
    color: #0056b3; /* Azul ligeramente más oscuro al "hover" */
  }

  /* Listas */
  ul, ol {
    margin-top: calc(var(--base-spacing-unit) * 0.6);
    margin-bottom: calc(var(--base-spacing-unit) * 1);
    padding-left: calc(var(--base-spacing-unit) * 2); /* Más padding para legibilidad */
  }
  ul ul, ol ol, ul ol, ol ul {
    margin-top: calc(var(--base-spacing-unit) * 0.4);
    margin-bottom: calc(var(--base-spacing-unit) * 0.4);
    padding-left: calc(var(--base-spacing-unit) * 1.5); /* Menor indentación para listas anidadas */
  }
  li {
    margin-bottom: calc(var(--base-spacing-unit) * 0.4);
    line-height: 1.6; /* Buen espaciado de línea para ítems de lista */
    padding-left: calc(var(--base-spacing-unit) * 0.2);
  }
  ul {
    list-style-type: none; /* Eliminar el bullet por defecto */
  }
  ul li::before {
    content: "▪"; /* Custom square bullet (o "•" o "—") */
    color: var(--color-accent);
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1.5em; /* Posicionar el bullet correctamente fuera del texto */
  }
  ol {
    list-style-position: outside; /* Números fuera del texto */
  }

  /* Citas en Bloque (Blockquotes) */
  blockquote {
    margin: calc(var(--base-spacing-unit) * 2) 0;
    padding: calc(var(--base-spacing-unit) * 1.2) calc(var(--base-spacing-unit) * 1.8);
    border-left: 5px solid var(--color-accent); /* Borde de acento más grueso */
    background-color: var(--color-accent-light);
    color: var(--color-secondary);
    border-radius: var(--border-radius-default);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06); /* Sombra sutil para profundidad */
    font-style: italic; /* Las citas suelen ser itálicas */
  }
  blockquote p {
    font-size: 1.05rem; /* Ligeramente más grande que el texto normal */
    line-height: 1.6;
    margin-bottom: calc(var(--base-spacing-unit) * 0.8);
    text-align: left;
    hyphens: none;
  }
  blockquote p:last-child {
    margin-bottom: 0;
  }
  blockquote footer, blockquote cite {
    font-style: normal; /* Restablecer itálicas para la fuente/autor */
    font-size: 0.9em;
    color: var(--color-muted);
    display: block;
    margin-top: calc(var(--base-spacing-unit) * 1);
    text-align: right;
  }

  /* Bloques de Código */
  code {
    font-family: var(--font-code);
    background-color: #f0f0f0; /* Gris claro suave para código inline */
    color: var(--color-primary);
    padding: 0.2em 0.4em;
    border-radius: var(--border-radius-default);
    font-size: 0.9em; /* Ligeramente más pequeño para código inline */
    white-space: pre-wrap; /* Permite que las líneas largas de código se envuelvan */
    word-break: break-word;
  }
  pre {
    font-family: var(--font-code);
    background-color: var(--color-background-light); /* Fondo suave */
    border: 1px solid var(--color-border);
    padding: calc(var(--base-spacing-unit) * 1);
    margin: calc(var(--base-spacing-unit) * 2) 0;
    border-radius: var(--border-radius-default);
    overflow-x: auto; /* Esencial para bloques de código largos */
    line-height: 1.5;
    font-size: 0.9em;
    color: var(--color-secondary);
    box-shadow: 0 2px 5px rgba(0,0,0,0.04); /* Sombra sutil */
  }
  pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    font-size: 1em; /* Hereda el tamaño del 'pre' */
  }

  /* Tablas */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: calc(var(--base-spacing-unit) * 2) 0;
    font-size: 0.95em;
    border: 1px solid var(--color-border-dark); /* Borde exterior claro */
    border-radius: var(--border-radius-default); /* Esquinas redondeadas para toda la tabla */
    overflow: hidden; /* Asegura que el contenido respete el border-radius */
    box-shadow: 0 4px 12px rgba(0,0,0,0.07); /* Sombra más pronunciada para tablas */
  }
  th, td {
    border: 1px solid var(--color-border);
    padding: calc(var(--base-spacing-unit) * 0.8) calc(var(--base-spacing-unit) * 1.2);
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: var(--color-background-light);
    font-weight: 700;
    color: var(--color-primary);
    text-transform: uppercase;
    font-size: 0.9em;
    letter-spacing: 0.03em;
    border-bottom: 2px solid var(--color-border-dark); /* Borde inferior más fuerte para el encabezado */
  }
  /* Alineaciones específicas para columnas de tabla (según el ejemplo en el markdown) */
  th:nth-child(2), td:nth-child(2) { text-align: center; }
  th:nth-child(3), td:nth-child(3) { text-align: right; }
  tbody tr:nth-child(odd) {
    background-color: var(--color-white); /* Mantener filas impares blancas */
  }
  tbody tr:nth-child(even) {
    background-color: #fdfdfd; /* Muy sutil rayado de cebra */
  }
  tbody tr:hover {
    background-color: var(--color-accent-light); /* Resaltado al "hover" */
  }


  /* Imágenes */
  img {
    max-width: 100%;
    height: auto;
    display: block; /* Convertir a bloque para centrar */
    margin: calc(var(--base-spacing-unit) * 2) auto; /* Centrar imagen */
    border-radius: var(--border-radius-default);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1); /* Sombra más clara */
    border: 1px solid var(--color-border); /* Borde sutil alrededor de la imagen */
  }
  figure {
    margin: calc(var(--base-spacing-unit) * 2) 0;
    padding: 0;
  }
  figcaption {
    text-align: center;
    font-size: 0.85em;
    color: var(--color-muted);
    margin-top: calc(var(--base-spacing-unit) * 0.7);
    font-style: italic;
  }

  /* Reglas Horizontales */
  hr {
    border: 0;
    height: 1px;
    background-color: var(--color-border-dark);
    margin: calc(var(--base-spacing-unit) * 3) 0;
  }

  /* Detalles/Summary (contenido expandible, forzado a estar abierto para PDF) */
  details {
    background-color: var(--color-accent-light);
    border: 1px solid var(--color-accent); /* Borde de acento para importancia */
    border-radius: var(--border-radius-default);
    padding: calc(var(--base-spacing-unit) * 1);
    margin: calc(var(--base-spacing-unit) * 1.8) 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  details summary {
    font-weight: 700;
    color: var(--color-accent); /* Color de acento para el texto del sumario */
    padding-bottom: calc(var(--base-spacing-unit) * 0.5);
    margin-bottom: calc(var(--base-spacing-unit) * 0.5);
    border-bottom: 1px dashed var(--color-border); /* Separador punteado */
    list-style: none; /* Ocultar el marcador por defecto */
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
    margin-top: calc(var(--base-spacing-unit) * 0.5);
  }

  /* Estilo del pie de página (aplicado por el footerTemplate de Puppeteer) */
  .page-footer {
    font-family: var(--font-body);
    font-size: 9pt; /* Texto del pie de página ligeramente más grande */
    color: var(--color-muted);
    /* Posicionado y contenido gestionado por la plantilla de Puppeteer */
  }

  /* Ajustes específicos para impresión (para evitar cortes extraños) */
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
