/* eslint-disable @typescript-eslint/no-explicit-any */
import { marked } from "marked";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { NextRequest, NextResponse } from "next/server";

// Estilos CSS para un documento PDF de alta calidad profesional
const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;0,900;1,400&family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Source+Code+Pro:wght@400;500;600&display=swap');

  :root {
    /* Core Typography */
    --font-body: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --font-heading: 'Merriweather', Georgia, serif;
    --font-code: 'Source Code Pro', Menlo, Monaco, Consolas, "Courier New", monospace;

    /* Refined Color Palette (Corporate & Elegant) */
    --color-text-primary: #1A202C; /* Very Dark Blue/Gray (almost black) */
    --color-text-secondary: #4A5568; /* Dark Gray */
    --color-text-muted: #718096; /* Medium Gray */
    --color-accent: #2B6CB0; /* Corporate Blue */
    --color-accent-hover: #255790; /* Darker blue for hover/active states */
    --color-accent-light: #EBF4FF; /* Very Light Blue (backgrounds) */
    --color-background-body: #FFFFFF;
    --color-background-code: #F7FAFC; /* Light Gray for code blocks */
    --color-border-light: #E2E8F0; /* Light Gray Border */
    --color-border-medium: #CBD5E0; /* Medium Gray Border */

    /* Sizing & Spacing */
    --base-font-size: 11pt; /* Optimal for readability in documents */
    --base-line-height: 1.65;
    --spacing-unit: 1rem; /* Relative unit, 1rem = --base-font-size */
    --border-radius: 4px; /* Subtle rounded corners */
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
  }

  body {
    font-family: var(--font-body);
    color: var(--color-text-primary);
    background-color: var(--color-background-body);
    margin: 0;
    /* Generous padding acts as page margins since Puppeteer margins might be 0 */
    padding: 20mm 25mm;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Headings - Clear Hierarchy & Elegant Spacing */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-text-primary);
    margin-top: calc(var(--spacing-unit) * 2.8);
    margin-bottom: calc(var(--spacing-unit) * 1);
    line-height: 1.3;
    font-weight: 700;
  }

  h1 {
    font-size: 2.75rem; /* Slightly reduced for balance */
    font-weight: 900;
    margin-top: 0;
    margin-bottom: calc(var(--spacing-unit) * 1.8);
    padding-bottom: calc(var(--spacing-unit) * 0.8);
    border-bottom: 3px solid var(--color-accent);
    letter-spacing: -0.03em;
  }

  h2 {
    font-size: 2rem;
    margin-top: calc(var(--spacing-unit) * 3.2);
    padding-bottom: calc(var(--spacing-unit) * 0.6);
    border-bottom: 1px solid var(--color-border-medium);
    letter-spacing: -0.02em;
  }

  h3 {
    font-size: 1.6rem;
    font-weight: 700;
    margin-top: calc(var(--spacing-unit) * 2.5);
    color: var(--color-text-primary); /* Slightly darker than secondary */
    letter-spacing: -0.01em;
  }

  h4 {
    font-size: 1.25rem;
    font-weight: 700; /* Bold for clear sub-sectioning */
    font-family: var(--font-body); /* Sans-serif for H4 for variety */
    color: var(--color-text-secondary);
    margin-top: calc(var(--spacing-unit) * 2.2);
    margin-bottom: calc(var(--spacing-unit) * 0.8);
  }

  h5 {
    font-size: 1.05rem;
    font-weight: 700;
    font-family: var(--font-body);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: calc(var(--spacing-unit) * 2);
    margin-bottom: calc(var(--spacing-unit) * 0.6);
  }

  h6 {
    font-size: 1rem;
    font-weight: 400; /* Normal weight for subtle headings */
    font-family: var(--font-body);
    font-style: italic;
    color: var(--color-text-muted);
    margin-top: calc(var(--spacing-unit) * 1.8);
    margin-bottom: calc(var(--spacing-unit) * 0.5);
  }

  /* Paragraphs - Justified for formal look, good leading */
  p {
    margin-top: 0;
    margin-bottom: calc(var(--spacing-unit) * 1.1);
    text-align: justify;
    hyphens: auto;
    font-size: 1rem; /* Relative to body's 11pt */
    line-height: var(--base-line-height);
  }
  p:last-child { margin-bottom: 0; }

  /* Links - Clear, accessible, and subtly styled */
  a {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600; /* Semi-bold for emphasis */
    border-bottom: 1px solid transparent; /* Prepare for hover effect */
    transition: color 0.2s ease, border-bottom-color 0.2s ease;
  }
  a:hover, a:focus {
    color: var(--color-accent-hover);
    border-bottom-color: var(--color-accent-hover);
  }

  /* Lists - Clean, well-spaced, and professional markers */
  ul, ol {
    margin-top: calc(var(--spacing-unit) * 0.5);
    margin-bottom: calc(var(--spacing-unit) * 1.1);
    padding-left: calc(var(--spacing-unit) * 1.8); /* Indentation */
  }
  ul ul, ol ol, ul ol, ol ul {
    margin-top: calc(var(--spacing-unit) * 0.3);
    margin-bottom: calc(var(--spacing-unit) * 0.3);
    padding-left: calc(var(--spacing-unit) * 1.5);
  }
  li {
    margin-bottom: calc(var(--spacing-unit) * 0.45);
    padding-left: calc(var(--spacing-unit) * 0.3);
    line-height: 1.6;
  }
  ul { list-style-type: none; }
  ul li::before {
    content: "–"; /* Em dash for a sophisticated bullet */
    color: var(--color-accent);
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1.2em; /* Fine-tuned alignment */
  }
  ol { list-style-position: outside; }

  /* Blockquotes - Visually distinct and elegant */
  blockquote {
    margin: calc(var(--spacing-unit) * 2.2) 0;
    padding: calc(var(--spacing-unit) * 1.2) calc(var(--spacing-unit) * 1.8);
    border-left: 4px solid var(--color-accent);
    background-color: var(--color-accent-light);
    color: var(--color-text-secondary);
    border-radius: var(--border-radius);
    font-style: italic;
  }
  blockquote p {
    font-size: 1.02rem; /* Slightly larger for emphasis */
    line-height: 1.6;
    margin-bottom: calc(var(--spacing-unit) * 0.8);
    text-align: left; /* Override justify for quotes if desired */
    hyphens: none;
  }
  blockquote p:last-child { margin-bottom: 0; }
  blockquote footer, blockquote cite {
    font-style: normal;
    font-size: 0.9rem;
    color: var(--color-text-muted);
    display: block;
    margin-top: var(--spacing-unit);
    text-align: right;
  }

  /* Code Blocks - Clean, readable, and professional */
  code { /* Inline code */
    font-family: var(--font-code);
    background-color: var(--color-background-code);
    color: var(--color-text-primary); /* Darker for better contrast on light bg */
    padding: 0.2em 0.45em;
    border-radius: var(--border-radius);
    font-size: 0.88em;
    white-space: pre-wrap;
    word-break: break-word;
    border: 1px solid var(--color-border-light);
  }
  pre { /* Code blocks */
    font-family: var(--font-code);
    background-color: var(--color-background-code);
    border: 1px solid var(--color-border-light);
    padding: calc(var(--spacing-unit) * 1.2);
    margin: calc(var(--spacing-unit) * 2.2) 0;
    border-radius: var(--border-radius);
    overflow-x: auto;
    line-height: 1.55;
    font-size: 0.9em;
    color: var(--color-text-primary);
  }
  pre code {
    background-color: transparent;
    border: none;
    padding: 0;
    font-size: 1em; /* Inherit from pre */
    white-space: pre; /* Preserve whitespace in code blocks */
  }

  /* Tables - Professional, clean, and readable */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: calc(var(--spacing-unit) * 2.2) 0;
    font-size: 0.92rem;
    border: 1px solid var(--color-border-medium);
    border-radius: 0; /* Sharp corners for a more formal table, or use var(--border-radius) */
  }
  th, td {
    border: 1px solid var(--color-border-light);
    padding: calc(var(--spacing-unit) * 0.75) calc(var(--spacing-unit) * 1);
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #F9FAFB; /* Very light gray, almost white */
    font-weight: 600; /* Less shouting than 700 */
    font-family: var(--font-body); /* Consistent with body text family */
    color: var(--color-text-primary);
    text-transform: none; /* No uppercase for a more subtle look */
    font-size: 0.95em;
    border-bottom: 2px solid var(--color-border-medium);
  }
  /* Optional: Zebra striping for very long tables, otherwise keep clean */
  /* tbody tr:nth-of-type(even) { background-color: #FDFEFF; } */

  /* Specific column alignments from example */
  table th:nth-child(2), table td:nth-child(2) { text-align: center; }
  table th:nth-child(3), table td:nth-child(3) { text-align: right; }


  /* Images & Figures - Well-integrated with subtle styling */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: calc(var(--spacing-unit) * 2.2) auto;
    border-radius: var(--border-radius);
    border: 1px solid var(--color-border-light); /* Subtle border */
    box-shadow: 0 3px 8px rgba(0,0,0,0.05); /* Softer shadow */
  }
  figure { margin: calc(var(--spacing-unit) * 2.2) 0; padding: 0; }
  figcaption {
    text-align: center;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-top: calc(var(--spacing-unit) * 0.7);
    font-style: italic;
  }

  /* Horizontal Rules - Minimalist separator */
  hr {
    border: 0;
    height: 1px;
    background-color: var(--color-border-medium);
    margin: calc(var(--spacing-unit) * 3.5) 0;
  }

  /* Details/Summary (Open by default for PDF) - Styled as an info box */
  details {
    background-color: var(--color-accent-light);
    border: 1px solid var(--color-accent);
    border-left-width: 4px;
    border-radius: var(--border-radius);
    padding: calc(var(--spacing-unit) * 1.2) calc(var(--spacing-unit) * 1.5);
    margin: calc(var(--spacing-unit) * 2) 0;
  }
  details summary {
    font-weight: 700;
    font-family: var(--font-heading); /* Use heading font for summary */
    color: var(--color-accent);
    padding-bottom: calc(var(--spacing-unit) * 0.6);
    margin-bottom: calc(var(--spacing-unit) * 0.8);
    border-bottom: 1px dashed var(--color-accent);
    list-style: none;
    cursor: default;
    font-size: 1.1rem;
  }
  details summary::-webkit-details-marker, details summary::marker { display: none; }
  details[open] > summary ~ * { display: block !important; }
  details p {
    font-size: 0.95rem;
    text-align: left;
    hyphens: none;
    margin-top: calc(var(--spacing-unit) * 0.8);
    color: var(--color-text-secondary); /* Slightly darker than blockquote text */
  }

  /* Page Footer (Puppeteer Template) */
  .page-footer {
    font-family: var(--font-body);
    font-size: 9pt;
    color: var(--color-text-muted);
  }

  /* Print-specific optimizations */
  @media print {
    h1, h2, h3, h4, h5, h6,
    pre, blockquote, table,
    img, figure, details {
      page-break-inside: avoid;
    }
    p, li {
      orphans: 3;
      widows: 3;
    }
    a {
      color: var(--color-accent) !important; /* Ensure link color prints */
      border-bottom: none !important; /* Remove underlines for cleaner print unless desired */
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
