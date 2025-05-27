/* eslint-disable @typescript-eslint/no-explicit-any */
import { marked } from "marked";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { NextRequest, NextResponse } from "next/server";

// Estilos CSS para un documento PDF de nivel directivo, ultra-profesional
const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Source+Code+Pro:wght@400;500;600&display=swap');

  :root {
    /* Core Typography */
    --font-body: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --font-heading: 'Merriweather', Georgia, serif;
    --font-code: 'Source Code Pro', Menlo, Monaco, Consolas, "Courier New", monospace;

    /* Refined Color Palette - Sophisticated & Modern Corporate */
    --color-text-primary: #121826;     /* Deep Indigo/Almost Black */
    --color-text-secondary: #374151; /* Dark Cool Gray */
    --color-text-muted: #6B7280;    /* Medium Cool Gray */
    --color-accent: #3182CE;        /* Vibrant yet Professional Blue (Tailwind Blue 600) */
    --color-accent-hover: #2B6CB0;    /* Darker Blue (Tailwind Blue 700) */
    --color-accent-light: #EBF8FF;    /* Very Light Blue (Tailwind Blue 100, adjusted) */
    --color-background-body: #FFFFFF;
    --color-background-code: #F3F4F6; /* Lightest Cool Gray (Tailwind Gray 100) */
    --color-border-light: #D1D5DB;  /* Light Gray Border (Tailwind Gray 300) */
    --color-border-medium: #9CA3AF; /* Medium Gray Border (Tailwind Gray 400) */

    /* Sizing & Spacing */
    --base-font-size: 11pt;
    --base-line-height: 1.7; /* Increased for body text readability */
    --spacing-unit: 1rem; /* Approx 11pt or 14.6px, adjust based on final base-font-size px */
    --border-radius: 3px; /* Subtle rounded corners for a softer, modern look */
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

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
    padding: 20mm 25mm; /* Page margins defined by body padding */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Headings - Refined Hierarchy & Spacing */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-text-primary);
    margin-top: calc(var(--spacing-unit) * 2.8);
    margin-bottom: calc(var(--spacing-unit) * 1);
    line-height: 1.25; /* Tighter line height for headings */
  }

  h1 { /* Improvement 1 */
    font-size: 2.6rem;
    font-weight: 900;
    margin-top: 0;
    margin-bottom: calc(var(--spacing-unit) * 2); /* More space after H1 */
    padding-bottom: calc(var(--spacing-unit) * 0.7);
    border-bottom: 2px solid var(--color-accent); /* Improvement 21 */
    letter-spacing: -0.035em;
  }

  h2 { /* Improvement 2 */
    font-size: 1.9rem; /* Slightly smaller for better scale */
    font-weight: 700;
    margin-top: calc(var(--spacing-unit) * 3.5); /* More top margin */
    margin-bottom: calc(var(--spacing-unit) * 1.2); /* Improvement 2 */
    padding-bottom: 0; /* No border for H2, rely on space */
    border-bottom: none; /* Improvement 22 */
    letter-spacing: -0.025em;
  }

  h3 { /* Improvement 3 */
    font-size: 1.5rem;
    font-weight: 600; /* Semi-bold */
    margin-top: calc(var(--spacing-unit) * 2.6);
    color: var(--color-text-primary);
    letter-spacing: -0.015em;
  }

  h4 { /* Improvement 31 */
    font-size: 1.2rem;
    font-weight: 600;
    font-family: var(--font-heading); /* Keep heading font for consistency */
    color: var(--color-text-secondary);
    margin-top: calc(var(--spacing-unit) * 2.3);
    margin-bottom: calc(var(--spacing-unit) * 0.7);
  }

  h5 { /* Improvement 10 */
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
    font-weight: 500; /* Medium weight */
    font-family: var(--font-body);
    font-style: italic;
    color: var(--color-text-muted);
    margin-top: calc(var(--spacing-unit) * 1.9);
    margin-bottom: calc(var(--spacing-unit) * 0.5);
  }

  /* Paragraphs */
  p { /* Improvement 4 */
    margin-top: 0;
    margin-bottom: calc(var(--spacing-unit) * 1.0);
    text-align: justify;
    hyphens: auto;
    font-size: 1rem;
    line-height: 1.75; /* Optimal for justified text */
  }
  p:last-child { margin-bottom: 0; }

  /* Links */
  a { /* Improvement 5 */
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px dotted var(--color-accent-light); /* Subtle dotted underline */
    transition: color 0.2s ease, border-bottom-color 0.2s ease, border-bottom-style 0.2s ease;
  }
  a:hover, a:focus {
    color: var(--color-accent-hover);
    border-bottom-color: var(--color-accent-hover);
    border-bottom-style: solid; /* Solid on hover */
  }

  /* Lists */
  ul, ol { /* Improvement 12 */
    margin-top: calc(var(--spacing-unit) * 0.6);
    margin-bottom: calc(var(--spacing-unit) * 1.0);
    padding-left: calc(var(--spacing-unit) * 2.2);
  }
  ul ul, ol ol, ul ol, ol ul { /* Improvement 27 */
    margin-top: calc(var(--spacing-unit) * 0.25);
    margin-bottom: calc(var(--spacing-unit) * 0.25);
    padding-left: calc(var(--spacing-unit) * 1.6);
  }
  li { /* Improvement 13 */
    margin-bottom: calc(var(--spacing-unit) * 0.35);
    padding-left: calc(var(--spacing-unit) * 0.25);
    line-height: 1.65;
  }
  ul { list-style-type: none; }
  ul li::before { /* Improvement 26 */
    content: "•";
    color: var(--color-accent);
    font-size: 0.8em; /* Smaller bullet */
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1.35em; /* Adjusted for smaller bullet */
    vertical-align: 0.1em; /* Fine-tune vertical alignment */
  }
  ol { list-style-position: outside; }

  /* Blockquotes */
  blockquote { /* Improvement 25 */
    margin: calc(var(--spacing-unit) * 2.0) 0;
    padding: calc(var(--spacing-unit) * 1.1) calc(var(--spacing-unit) * 1.6);
    border-left: 3px solid var(--color-accent);
    background-color: var(--color-accent-light);
    color: var(--color-text-secondary);
    border-radius: var(--border-radius);
    font-style: italic;
  }
  blockquote p { /* Improvement 8 */
    font-size: 1rem; /* Same as body */
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

  /* Code */
  code { /* Inline code - Improvement 6 */
    font-family: var(--font-code);
    background-color: var(--color-accent-light);
    color: var(--color-accent); /* Use accent color for inline code */
    padding: 0.15em 0.4em;
    border-radius: var(--border-radius);
    font-size: 0.86em;
    white-space: pre-wrap;
    word-break: break-word;
    border: 1px solid var(--color-border-light);
  }
  pre { /* Code blocks - Improvement 19 */
    font-family: var(--font-code);
    background-color: var(--color-background-code); /* Cleaner, lighter bg */
    border: 1px solid var(--color-border-light);
    padding: calc(var(--spacing-unit) * 1.1);
    margin: calc(var(--spacing-unit) * 2.0) 0;
    border-radius: var(--border-radius);
    overflow-x: auto;
    line-height: 1.5;
    font-size: 0.88em; /* Slightly smaller for denser code */
  }
  pre code { /* Improvement 7 */
    background-color: transparent;
    border: none;
    padding: 0;
    font-size: 1em;
    font-weight: 500; /* Sharper text */
    color: var(--color-text-primary); /* Good contrast on light bg */
    white-space: pre;
  }

  /* Tables - Booktabs style */
  table { /* Improvement 23 */
    width: 100%;
    border-collapse: collapse;
    margin: calc(var(--spacing-unit) * 2.0) 0;
    font-size: 0.9rem;
    border-top: 1.5px solid var(--color-text-primary); /* Thicker top border for table */
    border-bottom: 1.5px solid var(--color-text-primary); /* Thicker bottom border for table */
  }
  th, td { /* Improvement 15, 23 */
    border: none; /* Remove all default cell borders */
    padding: calc(var(--spacing-unit) * 0.9) calc(var(--spacing-unit) * 1);
    text-align: left;
    vertical-align: top;
  }
  th { /* Improvement 28 */
    font-weight: 600;
    font-family: var(--font-body);
    color: var(--color-text-primary);
    text-transform: none;
    font-size: 0.92em;
    border-bottom: 1px solid var(--color-border-medium); /* Separator for header row */
  }
  /* Specific column alignments, if needed (remove if not) */
  table th:nth-child(2), table td:nth-child(2) { text-align: center; }
  table th:nth-child(3), table td:nth-child(3) { text-align: right; }


  /* Images & Figures */
  img { /* Improvement 24 */
    max-width: 100%;
    height: auto;
    display: block;
    margin: calc(var(--spacing-unit) * 2.0) auto;
    border-radius: var(--border-radius);
    border: none; /* No border by default */
    box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* Softer, more diffuse shadow */
  }
  figure { margin: calc(var(--spacing-unit) * 2.0) 0; padding: 0; }
  figcaption { /* Improvement 9 */
    text-align: center;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: calc(var(--spacing-unit) * 0.8);
    font-style: italic;
  }

  /* Horizontal Rules */
  hr { /* Improvement 14, 30 */
    border: 0;
    height: 0.5px;
    background-color: var(--color-border-light);
    margin: calc(var(--spacing-unit) * 4) 0; /* Stronger separator */
  }

  /* Details/Summary */
  details { /* Improvement 20, 29 */
    background-color: var(--color-accent-light);
    border: 1px solid var(--color-border-light); /* Lighter border overall */
    border-left: 3px solid var(--color-accent);
    border-radius: var(--border-radius);
    padding: calc(var(--spacing-unit) * 1);
    margin: calc(var(--spacing-unit) * 1.8) 0;
  }
  details summary {
    font-weight: 700;
    font-family: var(--font-heading);
    color: var(--color-text-primary); /* Primary text color */
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

  /* Page Footer (Puppeteer Template) */
  .page-footer { /* Improvement 36 */
    font-family: var(--font-body);
    font-size: 8.5pt; /* More discreet */
    color: var(--color-text-muted);
  }

  /* Print-specific optimizations */
  @media print { /* Improvement 34, 35 */
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
      border-bottom: none !important; /* Cleaner for print */
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
