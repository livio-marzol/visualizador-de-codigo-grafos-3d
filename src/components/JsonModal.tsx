import React, { useState, useEffect } from 'react';
import {
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Check
} from 'lucide-react';
import { RawGraphData, ValidationIssue } from '../types.ts';
import { validateGraphJson } from '../utils/graphUtils.ts';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: RawGraphData;
  onApply: (data: RawGraphData, fileName?: string) => void;
}

export const JsonModal: React.FC<JsonModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onApply
}) => {
  const [jsonText, setJsonText] = useState('');
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(currentData, null, 2));
      setIssues([]);
      setFatalError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, currentData]);

  if (!isOpen) return null;

  const handleValidateAndApply = () => {
    setFatalError(null);
    setIssues([]);
    setSuccessMsg(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      setFatalError(`Erro de sintaxe JSON: ${(e as Error).message}`);
      return;
    }

    const validation = validateGraphJson(parsed);
    setIssues(validation.issues);

    if (!validation.valid || !validation.data) {
      setFatalError(validation.error || 'O JSON não contém um grafo válido.');
      return;
    }

    onApply(validation.data, 'JSON Colado Manualmente');
    setSuccessMsg(
      validation.issues.length > 0
        ? `Grafo aplicado com ${validation.issues.length} aviso(s) tratado(s).`
        : 'Grafo validado e aplicado com sucesso!'
    );

    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setFatalError(null);
    } catch (e) {
      setFatalError(`Não foi possível formatar: ${(e as Error).message}`);
    }
  };

  const handleLoadTemplate = () => {
    const template = {
      nodes: [
        { id: "src/App.tsx", label: "App.tsx", type: "file", language: "TypeScript", size: 120 },
        { id: "src/User.ts", label: "User.ts", type: "file", language: "TypeScript", size: 90 },
        { id: "cls:UserController", label: "UserController", type: "class", language: "TypeScript", size: 140 },
        { id: "fn:renderApp", label: "renderApp()", type: "function", language: "TypeScript", size: 30 },
        { id: "fn:getUser", label: "getUser()", type: "function", language: "TypeScript", size: 45 },
        { id: "var:API_URL", label: "API_URL", type: "variable", language: "TypeScript", size: 20 },
        { id: "mod:auth", label: "@app/auth", type: "module", language: "TypeScript", size: 110 }
      ],
      links: [
        { source: "src/App.tsx", target: "fn:renderApp", relation: "defines" },
        { source: "src/App.tsx", target: "mod:auth", relation: "imports" },
        { source: "src/User.ts", target: "cls:UserController", relation: "declares" },
        { source: "cls:UserController", target: "fn:getUser", relation: "implements" },
        { source: "fn:getUser", target: "var:API_URL", relation: "reads" }
      ]
    };
    setJsonText(JSON.stringify(template, null, 2));
    setFatalError(null);
    setIssues([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-950 border border-yellow-500/40 rounded-xl shadow-2xl shadow-black w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-black/90">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
              <FileCode size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">Importar / Editar JSON do Grafo</h3>
              <p className="text-[11px] text-zinc-400">Validação rigorosa de IDs, nós ausentes e relações</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-yellow-400 hover:bg-neutral-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 flex flex-col min-h-0 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Editor JSON do Grafo</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFormat}
                className="flex items-center gap-1 hover:text-yellow-400 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:border-yellow-500/40 transition-colors"
              >
                <Sparkles size={12} className="text-yellow-400" />
                Formatar JSON
              </button>
              <button
                onClick={handleLoadTemplate}
                className="flex items-center gap-1 hover:text-yellow-400 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:border-yellow-500/40 transition-colors"
              >
                <RotateCcw size={12} className="text-yellow-400" />
                Template Padrão
              </button>
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
            rows={14}
            className="w-full flex-1 p-3 bg-black text-zinc-100 font-mono text-xs rounded-lg border border-neutral-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 focus:outline-none resize-none selection:bg-yellow-500 selection:text-black"
          />

          {/* Feedback de Erro Fatal */}
          {fatalError && (
            <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-800/80 text-red-300 text-xs flex items-start gap-2 font-mono">
              <AlertCircle size={15} className="shrink-0 text-red-400 mt-0.5" />
              <span>{fatalError}</span>
            </div>
          )}

          {/* Lista de Avisos / Problemas Diagnosticados */}
          {issues.length > 0 && (
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-yellow-500/40 text-xs space-y-1 font-mono max-h-32 overflow-y-auto">
              <div className="text-yellow-400 font-bold flex items-center gap-1.5 pb-1 border-b border-neutral-800">
                <AlertTriangle size={13} className="text-yellow-400" />
                Avisos de Validação ({issues.length})
              </div>
              {issues.map((iss, i) => (
                <div key={i} className="text-zinc-300 text-[11px] leading-tight flex items-start gap-1">
                  <span className="text-yellow-400">•</span>
                  <span>{iss.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Sucesso */}
          {successMsg && (
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-yellow-400 text-yellow-300 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 size={15} className="shrink-0 text-yellow-400" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-black/90 flex items-center justify-between">
          <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
            Formato: &#123; nodes: [ ... ], links: [ ... ] &#125;
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-mono text-zinc-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleValidateAndApply}
              className="px-4 py-1.5 rounded-md text-xs font-bold font-mono bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-500/25 active:scale-98 transition-all flex items-center gap-1.5"
            >
              <Check size={14} strokeWidth={2.5} />
              Validar e Aplicar Grafo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
