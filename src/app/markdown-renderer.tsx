
import React from 'react';
import { Components } from 'react-markdown';
import Image from 'next/image';

// =================================================================================================
// Componentes de Encabezado (H1-H6)
// Estilos jerárquicos y responsivos para los encabezados.
// =================================================================================================

const CustomH1: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 border-b-2 border-blue-600 pb-4 mb-6">
    {children}
  </h1>
);

const CustomH2: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 border-b border-gray-300 pb-3 mt-10 mb-5">
    {children}
  </h2>
);

const CustomH3: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
    {children}
  </h3>
);

const CustomH4: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <h4 className="text-xl md:text-2xl font-semibold text-gray-700 mt-6 mb-3">
    {children}
  </h4>
);

const CustomH5: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <h5 className="text-lg md:text-xl font-semibold text-gray-600 mt-4 mb-2">
    {children}
  </h5>
);

const CustomH6: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <h6 className="text-base md:text-lg font-bold text-gray-500 uppercase tracking-wider mt-4 mb-2">
    {children}
  </h6>
);

// =================================================================================================
// Componentes de Bloque
// =================================================================================================

const CustomParagraph: React.FC<React.PropsWithChildren<{ node?: any }>> = ({ children, node }) => {
  // Check if this paragraph contains an image, which we render as a block element.
  // An image can be a direct child or nested inside a link.
  const containsImage = node?.children.some((child: any) => {
    if (child.type === 'element' && child.tagName === 'img') {
      return true;
    }
    if (
      child.type === 'element' &&
      child.tagName === 'a' &&
      child.children?.some((grandchild: any) => grandchild.type === 'element' && grandchild.tagName === 'img')
    ) {
      return true;
    }
    return false;
  });

  // If the paragraph contains an image, render a <div> instead of a <p>
  // to prevent invalid HTML (e.g., <p><div>...</div></p>).
  // We keep the paragraph styling for any accompanying text.
  if (containsImage) {
    return <div className="text-base md:text-lg text-gray-700 leading-relaxed my-4">{children}</div>;
  }

  // For standard paragraphs, use the <p> tag with appropriate styling.
  return (
    <p className="text-base md:text-lg text-gray-700 leading-relaxed my-4">
      {children}
    </p>
  );
};

const CustomBlockquote: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <blockquote className="border-l-4 border-blue-500 bg-blue-50 text-gray-700 italic px-5 py-3 my-6">
    {children}
  </blockquote>
);

const CustomHr: React.FC = () => (
  <hr className="border-t-2 border-gray-200 my-10" />
);

// =================================================================================================
// Componentes de Listas (UL, OL, LI)
// =================================================================================================

const CustomUl: React.FC<React.PropsWithChildren<{ ordered?: boolean }>> = ({ children }) => (
  <ul className="list-disc list-inside space-y-2 my-4 pl-4 text-gray-700">
    {children}
  </ul>
);

const CustomOl: React.FC<React.PropsWithChildren<{ ordered?: boolean }>> = ({ children }) => (
  <ol className="list-decimal list-inside space-y-2 my-4 pl-4 text-gray-700">
    {children}
  </ol>
);

const CustomLi: React.FC<React.PropsWithChildren<{ checked?: boolean | null }>> = ({ children, checked }) => (
  <li className={`flex items-start ${checked !== null ? 'task-list-item' : ''}`}>
    {checked !== null && (
      <input
        type="checkbox"
        checked={!!checked}
        readOnly
        className="mr-3 mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-default"
      />
    )}
    <span className={checked ? 'text-gray-500 line-through' : ''}>{children}</span>
  </li>
);

// =================================================================================================
// Componentes de Código (En línea y Bloques)
// =================================================================================================

const CustomCode: React.FC<React.PropsWithChildren<{ className?: string; inline?: boolean }>> = ({ children, className, inline }) => {
  if (inline) {
    return (
      <code className="bg-gray-200 text-gray-800 font-mono text-sm rounded-md px-2 py-1">
        {children}
      </code>
    );
  }

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'bash';

  return (
    <div className="bg-gray-900 rounded-lg my-6 overflow-hidden">
      <div className="bg-gray-800 text-gray-300 text-xs font-sans px-4 py-2 flex justify-between items-center">
        <span>{language}</span>
        <button
          onClick={() => navigator.clipboard.writeText(String(children))}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Copiar código"
        >
          Copiar
        </button>
      </div>
      <pre className="p-4 text-white text-sm overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
};

// =================================================================================================
// Componentes de Tabla
// =================================================================================================

const CustomTable: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <div className="my-6 overflow-x-auto">
    <table className="min-w-full border-collapse border border-gray-300">
      {children}
    </table>
  </div>
);

const CustomThead: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <thead className="bg-gray-100">{children}</thead>
);

const CustomTbody: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
);

const CustomTr: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <tr>{children}</tr>
);

const CustomTh: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border border-gray-300">
    {children}
  </th>
);

const CustomTd: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border border-gray-300">
    {children}
  </td>
);

// =================================================================================================
// Componentes en Línea (Links, Imágenes, etc.)
// =================================================================================================

const CustomLink: React.FC<React.ComponentProps<'a'>> = ({ href, children }) => {
  const isInternal = href?.startsWith('#');
  return (
    <a
      href={href}
      className="text-blue-600 font-medium hover:underline hover:text-blue-700 transition-colors"
      target={isInternal ? undefined : "_blank"}
      rel={isInternal ? undefined : "noopener noreferrer"}
    >
      {children}
    </a>
  );
};

const CustomImage: React.FC<React.ComponentProps<'img'>> = ({ src, alt, title }) => {
  // Convert Blob URLs to string URLs if needed
  const imageSrc = src instanceof Blob ? URL.createObjectURL(src) : src;

  // Handle relative paths by ensuring they start with a slash
  const getImagePath = (imgSrc: string | undefined) => {
    if (!imgSrc) return '';
    if (imgSrc.startsWith('http') || imgSrc.startsWith('blob:')) return imgSrc;
    return imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`;
  };

  const imagePath = getImagePath(imageSrc);
  if (!imagePath) return null;

  return (
    <figure className="my-6 flex flex-col items-center">
      <div className="relative max-w-full h-auto rounded-lg overflow-hidden shadow-lg">
        <Image
          src={imagePath}
          alt={alt || "Imagen de la presentación"}
          width={800}
          height={600}
          className="rounded-lg"
          style={{ objectFit: 'contain' }}
          onLoad={(e) => {
            // Revoke the object URL to free up memory
            if (src instanceof Blob) {
              URL.revokeObjectURL(imagePath);
            }
          }}
        />
      </div>
      {title && (
        <figcaption className="text-center text-sm mt-3 text-gray-600 italic">
          {title}
        </figcaption>
      )}
    </figure>
  );
};

const CustomDel: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <del className="text-gray-500">{children}</del>
);

// =================================================================================================
// Exportar componentes personalizados
// =================================================================================================

export const markdownComponents: Components = {
  h1: CustomH1,
  h2: CustomH2,
  h3: CustomH3,
  h4: CustomH4,
  h5: CustomH5,
  h6: CustomH6,
  p: CustomParagraph,
  blockquote: CustomBlockquote,
  hr: CustomHr,
  ul: CustomUl,
  ol: CustomOl,
  li: CustomLi,
  code: CustomCode,
  table: CustomTable,
  thead: CustomThead,
  tbody: CustomTbody,
  tr: CustomTr,
  th: CustomTh,
  td: CustomTd,
  a: CustomLink,
  img: CustomImage,
  del: CustomDel,
  // No es necesario `em` o `strong` si los estilos por defecto de Tailwind son suficientes.
  // Se pueden añadir si se requiere personalización extrema.
};
