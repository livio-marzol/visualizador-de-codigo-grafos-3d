import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  LocateFixed,
  ArrowDownLeft,
  ArrowUpRight,
  Code,
  Boxes,
  FolderTree,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ProcessedNode,
  NODE_TYPE_CONFIG
} from '../types.ts';

interface NodeDetailsProps {
  node: ProcessedNode | null;
  allNodesMap: Map<string, ProcessedNode>;
  onClose: () => void;
  onSelectNode: (node: ProcessedNode) => void;
  onFocusNode: (nodeId: string) => void;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({
  node,
  allNodesMap,
  onClose,
  onSelectNode,
  onFocusNode
}) => {
  const [copiedId, setCopiedId] = useState(false);

  if (!node) return null;

  const typeConfig = NODE_TYPE_CONFIG[node.type];

  const handleCopyId = () => {
    navigator.clipboard.writeText(node.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const extraMetadataEntries = Object.entries(node.extraMetadata || {});

  return (
    <aside className="absolute top-14 right-3 md:right-5 bottom-4 z-20 w-84 md:w-96 bg-black/95 backdrop-blur-xl border border-yellow-500/30 rounded-xl flex flex-col shadow-2xl shadow-black overflow-hidden transition-all text-zinc-200 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Top Header */}
      <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shadow-md"
            style={{
              backgroundColor: node.color,
              boxShadow: `0 0 10px ${node.color}`
            }}
          />
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${node.color}25`,
              color: node.color,
              border: `1px solid ${node.color}50`
            }}
          >
            {typeConfig.namePt} ({node.rawType})
          </span>
        </div>

        <button
          onClick={onClose}
          title="Fechar painel (Esc)"
          className="p-1 rounded text-zinc-400 hover:text-yellow-400 hover:bg-neutral-900 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Identificação Principal */}
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-white font-mono break-words">
            {node.label}
          </h2>

          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-850 rounded px-2 py-1 text-xs font-mono text-zinc-400">
            <span className="text-yellow-500 text-[10px] font-bold">ID:</span>
            <span className="text-zinc-200 truncate flex-1">{node.id}</span>
            <button
              onClick={handleCopyId}
              title="Copiar ID"
              className="text-zinc-400 hover:text-yellow-400 p-0.5 hover:bg-neutral-900 rounded transition-colors"
            >
              {copiedId ? <Check size={13} className="text-yellow-400" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Botão Explícito para Centralizar a Câmera no Nó */}
        <button
          onClick={() => onFocusNode(node.id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold font-mono rounded-lg text-xs transition-all shadow-md shadow-yellow-500/20 active:scale-98"
        >
          <LocateFixed size={14} className="text-black stroke-[2.5]" />
          Focar Câmera Neste Nó
        </button>

        {/* Métricas de Grau de Conexões */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-center">
            <div className="text-[10px] font-mono text-yellow-500/80 font-semibold uppercase tracking-wider">Grau Total</div>
            <div className="text-lg font-bold text-yellow-400 font-mono mt-0.5">{node.degree}</div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-center">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <ArrowDownLeft size={10} className="text-yellow-400" /> Entrada
            </div>
            <div className="text-lg font-bold text-zinc-200 font-mono mt-0.5">{node.inDegree}</div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-center">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <ArrowUpRight size={10} className="text-yellow-400" /> Saída
            </div>
            <div className="text-lg font-bold text-zinc-200 font-mono mt-0.5">{node.outDegree}</div>
          </div>
        </div>

        {/* Metadados Essenciais do Nó */}
        <div className="space-y-2 bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 text-xs font-mono">
          <div className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider flex items-center gap-1 pb-1 border-b border-neutral-800">
            <Info size={12} className="text-yellow-400" />
            Metadados do Nó
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <FolderTree size={12} className="text-yellow-500/70" /> Grupo / Módulo:
            </span>
            <span className="text-yellow-400 font-medium px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 truncate max-w-[180px]">
              {node.group}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Code size={12} className="text-yellow-500/70" /> Linguagem:
            </span>
            <span className="text-zinc-200 font-medium px-1.5 py-0.2 rounded bg-neutral-900">
              {node.language}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Boxes size={12} className="text-yellow-500/70" /> Tamanho / LOC:
            </span>
            <span className="text-zinc-200 font-medium">
              {node.size} {node.loc ? `(${node.loc} LOC)` : 'pts'}
            </span>
          </div>

          {node.filePath && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <FileText size={12} className="text-yellow-500/70" /> Caminho do Arquivo:
              </span>
              <span className="text-zinc-200 font-medium truncate max-w-[180px]" title={node.filePath}>
                {node.filePath}
              </span>
            </div>
          )}

          {node.description && (
            <div className="pt-2 border-t border-neutral-800 text-[11px] text-zinc-300 font-sans leading-relaxed">
              <span className="text-yellow-500 font-mono text-[10px] block mb-0.5 uppercase font-bold">Descrição:</span>
              {node.description}
            </div>
          )}
        </div>

        {/* Metadados Adicionais / Personalizados do JSON */}
        {extraMetadataEntries.length > 0 && (
          <div className="space-y-2 bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 text-xs font-mono">
            <div className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider flex items-center gap-1 pb-1 border-b border-neutral-800">
              <Sparkles size={12} className="text-yellow-400" />
              Campos Adicionais ({extraMetadataEntries.length})
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {extraMetadataEntries.map(([key, val]) => (
                <div key={key} className="flex flex-col text-[11px] bg-black p-1.5 rounded border border-neutral-850">
                  <span className="text-yellow-400 font-semibold">{key}:</span>
                  <span className="text-zinc-200 break-words mt-0.5">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conexões de Entrada (Inbound) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 font-bold text-yellow-400">
              <ArrowDownLeft size={13} className="text-yellow-400" />
              Dependem deste nó ({node.inbound.length})
            </span>
          </div>

          {node.inbound.length === 0 ? (
            <div className="text-[11px] text-zinc-500 italic p-2 bg-neutral-950 rounded border border-neutral-850 font-mono">
              Nenhuma dependência de entrada
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {node.inbound.map((item, idx) => {
                const targetNode = allNodesMap.get(item.sourceId);
                return (
                  <button
                    key={`in-${idx}-${item.sourceId}`}
                    onClick={() => targetNode && onSelectNode(targetNode)}
                    className="w-full text-left p-2 rounded bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-yellow-500/40 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: targetNode?.color || '#a1a1aa' }}
                      />
                      <span className="font-mono text-xs text-zinc-300 group-hover:text-yellow-400 truncate">
                        {targetNode?.label || item.sourceId}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 shrink-0">
                      {item.relation || 'relaciona'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Conexões de Saída (Outbound) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 font-bold text-yellow-400">
              <ArrowUpRight size={13} className="text-yellow-400" />
              Este nó referencia / chama ({node.outbound.length})
            </span>
          </div>

          {node.outbound.length === 0 ? (
            <div className="text-[11px] text-zinc-500 italic p-2 bg-neutral-950 rounded border border-neutral-850 font-mono">
              Nenhuma dependência de saída
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {node.outbound.map((item, idx) => {
                const targetNode = allNodesMap.get(item.targetId);
                return (
                  <button
                    key={`out-${idx}-${item.targetId}`}
                    onClick={() => targetNode && onSelectNode(targetNode)}
                    className="w-full text-left p-2 rounded bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-yellow-500/40 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: targetNode?.color || '#a1a1aa' }}
                      />
                      <span className="font-mono text-xs text-zinc-300 group-hover:text-yellow-400 truncate">
                        {targetNode?.label || item.targetId}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 shrink-0">
                      {item.relation || 'relaciona'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rodapé com atalho */}
      <div className="p-2.5 bg-black border-t border-neutral-800 text-center flex items-center justify-between text-xs font-mono text-zinc-400 px-4">
        <span>Clique no fundo para desmarcar</span>
        <button
          onClick={onClose}
          className="text-yellow-400 hover:text-yellow-300 underline text-[11px]"
        >
          Fechar
        </button>
      </div>
    </aside>
  );
};
