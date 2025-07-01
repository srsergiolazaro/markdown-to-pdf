"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./markdown-renderer";

export default function Home() {
  const [markdown, setMarkdown] = useState("# ¡Hola, mundo!\n\nEscribe tu **markdown** aquí.");
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/markdown-to-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markdown }),
      });

      if (!response.ok) {
        throw new Error("Error al convertir el documento");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "documento.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      alert("Error al convertir el documento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Editor de Markdown a PDF</h1>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label htmlFor="markdown" className="block mb-2 font-medium">
              Markdown
            </label>
            <textarea
              id="markdown"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[70vh] p-4 border rounded-lg font-mono resize-none"
              placeholder="Escribe tu markdown aquí..."
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">
              Previsualización
            </label>
            <div className="w-full h-[70vh] p-4 border rounded-lg overflow-y-auto">
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleConvert}
            disabled={isLoading || !markdown}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Convirtiendo..." : "Convertir a PDF"}
          </button>
        </div>
      </main>
    </div>
  );
}
