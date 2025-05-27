/* eslint-disable @typescript-eslint/no-explicit-any */
import { marked } from "marked";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { NextRequest, NextResponse } from "next/server";

// Estilos CSS para mejorar la apariencia del PDF
const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Source+Code+Pro:wght@400;600&display=swap');

  :root {
    /* Fuentes */
    --font-body: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --font-heading: 'Merriweather', Georgia, serif;
    --font-code: 'Source Code Pro', Menlo, Monaco, Consolas, "Courier New", monospace;

    /* Colores */
    --color-text-primary: #212529; /* Negro muy oscuro para headings */
    --color-text-secondary: #343a40; /* Gris oscuro para el cuerpo */
    --color-text-muted: #6c757d;    /* Gris medio para descripciones/pies de foto */
    --color-accent: #005ea2;       /* Azul Institucional - Fuerte y claro */
    --color-accent-light: #eef6ff;  /* Azul muy claro para fondos sutiles */
    --color-accent-hover: #003d6b; /* Azul oscuro para interacción */
    --color-background: #ffffff;
    --color-border-light: #e9ecef;  /* Gris muy claro para bordes finos */
    --color-border-medium: #ced4da; /* Gris medio para bordes de tablas/HR */
    --color-code-bg: #f8f9fa;      /* Gris muy claro para fondos de código */
    --color-code-text: #343a40;    /* Mismo que texto secundario para código */
    --color-quote-border: var(--color-accent); /* Borde de cita con acento */

    /* Espaciado y Dimensiones */
    --line-height-normal: 1.65;
    --line-height-heading: 1.25;
    --base-spacing-unit: 1rem; /* 16px - Base para todos los márgenes y paddings */
    --border-radius-small: 3px;
    --border-radius-medium: 5px;
  }

  /* Reset y Base */
  *, *::before, *::after { box-sizing: border-box; }

  html {
    font-size: 10.5pt; /* Tamaño base para el documento impreso */
    -webkit-print-color-adjust: exact; /* Asegura que los colores se impriman como se ven */
    print-color-adjust: exact;
  }

  body {
    font-family: var(--font-body);
    line-height: var(--line-height-normal);
    color: var(--color-text-secondary);
    background-color: var(--color-background);
    margin: 0;
    padding: 0; /* Los márgenes se definirán en Puppeteer para un control total */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Contenedor principal para aplicar márgenes internos en el documento */
  .document-content {
    padding: 20mm; /* Márgenes internos del documento para crear espacio */
  }

  /* Encabezados */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-text-primary); /* Más oscuro para los encabezados */
    margin-top: calc(var(--base-spacing-unit) * 2.5);
    margin-bottom: calc(var(--base-spacing-unit) * 1);
    line-height: var(--line-height-heading);
    font-weight: 700;
  }

  h1 {
    font-size: 2.8rem;
    font-weight: 900; /* Extra bold para el título principal */
    margin-top: 0;
    margin-bottom: calc(var(--base-spacing-unit) * 1.8);
    padding-bottom: calc(var(--base-spacing-unit) * 0.6);
    border-bottom: 3px solid var(--color-accent); /* Línea gruesa de acento */
    letter-spacing: -0.02em; /* Ajuste sutil del espaciado entre letras */
  }
  h2 {
    font-size: 2rem;
    margin-top: calc(var(--base-spacing-unit) * 3);
    padding-bottom: calc(var(--base-spacing-unit) * 0.4);
    border-bottom: 1px solid var(--color-border-light); /* Línea fina */
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
    font-family: var(--font-body); /* Usar fuente del cuerpo para un estilo más suave */
  }
  h5 {
    font-size: 1.05rem;
    color: var(--color-text-muted);
    font-weight: 600;
    font-family: var(--font-body);
    text-transform: uppercase; /* Mayúsculas para un estilo de "etiqueta" */
    letter-spacing: 0.08em; /* Más espaciado para las mayúsculas */
  }
  h6 {
    font-size: 0.95rem;
    color: var(--color-text-muted);
    font-weight: 700;
    font-family: var(--font-body);
    font-style: italic; /* Un toque de cursiva */
  }

  /* Párrafos */
  p {
    margin-top: 0;
    margin-bottom: calc(var(--base-spacing-unit) * 0.9);
    text-align: justify; /* Texto justificado para un look de revista */
    hyphens: auto; /* Guiones automáticos para mejor espaciado entre palabras */
  }
  p:last-child { margin-bottom: 0; }

  /* Enlaces */
  a {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px solid transparent; /* Borde sutil que aparece al hover */
    transition: color 0.15s ease-in-out, border-bottom-color 0.15s ease-in-out;
  }
  a:hover, a:focus {
    color: var(--color-accent-hover);
    border-bottom-color: var(--color-accent); /* Borde subrayado con el color de acento */
  }

  /* Listas */
  ul, ol {
    margin-top: calc(var(--base-spacing-unit) * 0.5);
    margin-bottom: calc(var(--base-spacing-unit) * 1);
    padding-left: calc(var(--base-spacing-unit) * 1.8); /* Indentación estándar */
  }
  ul ul, ol ol, ul ol, ol ul {
    margin-top: calc(var(--base-spacing-unit) * 0.3);
    margin-bottom: calc(var(--base-spacing-unit) * 0.3);
    padding-left: calc(var(--base-spacing-unit) * 1.5); /* Indentación para listas anidadas */
  }
  li {
    margin-bottom: calc(var(--base-spacing-unit) * 0.4);
    padding-left: calc(var(--base-spacing-unit) * 0.1);
  }
  ul { list-style-type: none; } /* Quitamos el estilo de viñeta por defecto */
  ul li::before {
    content: "•"; /* Viñeta personalizada */
    color: var(--color-accent); /* Color de acento para las viñetas */
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1.2em; /* Ajuste para alinear la viñeta */
    text-align: right;
  }
  ol { list-style-position: outside; } /* Números fuera del contenido del item */

  /* Citas en Bloque */
  blockquote {
    margin: calc(var(--base-spacing-unit) * 1.8) 0;
    padding: calc(var(--base-spacing-unit) * 1.2) calc(var(--base-spacing-unit) * 1.8);
    border-left: 4px solid var(--color-quote-border); /* Borde de acento más grueso */
    background-color: var(--color-accent-light); /* Fondo suave */
    color: var(--color-text-secondary);
    border-radius: var(--border-radius-medium);
    font-style: italic; /* Texto de cita en cursiva */
  }
  blockquote p {
    font-size: 0.95em; /* Ligeramente más pequeño que el texto normal */
    line-height: 1.5;
    margin-bottom: calc(var(--base-spacing-unit) * 0.6);
    text-align: left; /* No justificar las citas */
    hyphens: none;
  }
  blockquote p:last-of-type { margin-bottom: 0; } /* Eliminar margen del último párrafo en la cita */
  blockquote footer, blockquote cite {
    font-style: normal; /* El pie de cita no es cursiva */
    font-size: 0.88em;
    color: var(--color-text-muted);
    display: block;
    margin-top: calc(var(--base-spacing-unit) * 1);
    text-align: right;
  }

  /* Código */
  code {
    font-family: var(--font-code);
    background-color: var(--color-accent-light);
    color: var(--color-accent-hover); /* Un tono más oscuro de acento para el código inline */
    padding: 0.2em 0.4em;
    border-radius: var(--border-radius-small);
    font-size: 0.88em;
    word-break: break-word; /* Romper palabras largas si no caben */
  }
  pre {
    font-family: var(--font-code);
    background-color: var(--color-code-bg);
    border: 1px solid var(--color-border-light);
    padding: calc(var(--base-spacing-unit) * 1);
    margin: calc(var(--base-spacing-unit) * 1.8) 0;
    border-radius: var(--border-radius-medium);
    overflow-x: auto; /* Scroll horizontal si el código es muy largo */
    line-height: 1.5;
    font-size: 0.88em;
    color: var(--color-code-text);
    box-shadow: 0 4px 8px rgba(0,0,0,0.05); /* Sombra sutil para profundidad */
  }
  pre code {
    background-color: transparent; /* Quitar el fondo del código inline dentro de pre */
    color: inherit; /* Heredar el color de pre */
    padding: 0;
    font-size: 1em;
  }

  /* Tablas */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: calc(var(--base-spacing-unit) * 1.8) 0;
    font-size: 0.9em;
    border: 1px solid var(--color-border-medium); /* Borde exterior de la tabla */
    border-radius: var(--border-radius-medium); /* Esquinas redondeadas */
    overflow: hidden; /* Asegura que el borde redondeado se vea bien */
  }
  th, td {
    border: 1px solid var(--color-border-light); /* Bordes internos más ligeros */
    padding: calc(var(--base-spacing-unit) * 0.8) calc(var(--base-spacing-unit) * 1);
    text-align: left;
    vertical-align: top; /* Contenido alineado arriba */
  }
  th {
    background-color: var(--color-code-bg); /* Fondo sutil para los encabezados */
    font-weight: 600;
    font-family: var(--font-body);
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-medium); /* Borde inferior más marcado */
  }
  tbody tr:hover {
    background-color: var(--color-accent-light); /* Resaltar fila al pasar el ratón */
  }

  /* Imágenes */
  img {
    max-width: 100%;
    height: auto;
    display: block; /* Para que el margin: auto funcione */
    margin: calc(var(--base-spacing-unit) * 1.8) auto; /* Centrar la imagen */
    border-radius: var(--border-radius-medium);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1); /* Sombra más pronunciada */
    border: 1px solid var(--color-border-light); /* Borde sutil */
  }
  figure {
    margin: calc(var(--base-spacing-unit) * 1.8) 0;
    page-break-inside: avoid; /* Evitar que la figura se rompa en dos páginas */
  }
  figcaption {
    text-align: center;
    font-size: 0.85em;
    color: var(--color-text-muted);
    margin-top: calc(var(--base-spacing-unit) * 0.8);
    font-style: italic;
  }

  /* Líneas Separadoras */
  hr {
    border: 0;
    height: 1px;
    background-color: var(--color-border-medium); /* Línea sólida y discreta */
    margin: calc(var(--base-spacing-unit) * 3) 0;
  }

  /* Elemento Details/Summary (Información Expandible) */
  details {
    background-color: var(--color-accent-light);
    border: 1px solid var(--color-border-light);
    border-left: 5px solid var(--color-accent); /* Borde de acento más grueso */
    border-radius: var(--border-radius-medium);
    padding: var(--base-spacing-unit);
    margin: calc(var(--base-spacing-unit) * 1.8) 0;
    page-break-inside: avoid; /* Mantener todo el bloque en una página */
  }
  details summary {
    font-weight: 700;
    font-family: var(--font-body);
    color: var(--color-text-primary);
    padding-bottom: calc(var(--base-spacing-unit) * 0.6);
    margin-bottom: calc(var(--base-spacing-unit) * 0.6);
    border-bottom: 1px dashed var(--color-border-medium); /* Línea punteada sutil */
    list-style: none; /* Oculta el triángulo por defecto */
    cursor: default; /* No es interactivo en PDF, así que quitamos el cursor de puntero */
  }
  details summary::-webkit-details-marker { display: none; } /* Oculta marcador en WebKit */
  details summary::marker { display: none; } /* Oculta marcador estándar */

  /* Forzamos que el contenido de details se muestre siempre (es para un PDF estático) */
  details > *:not(summary) {
    display: block !important;
  }
  details p {
    font-size: 0.9em;
    text-align: left;
    hyphens: none;
    margin-top: calc(var(--base-spacing-unit) * 0.8);
    color: var(--color-text-secondary);
  }

  /* Pie de página (para el template de Puppeteer) */
  .page-footer {
    font-family: var(--font-body);
    font-size: 8.5pt;
    color: var(--color-text-muted);
    /* El estilo de centrado y padding se maneja en el footerTemplate de Puppeteer */
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
