import React, { useRef, useState } from 'react';
import {
  Upload,
  Code2,
  FileJson,
  Filter,
  Palette,
  Sparkles,
  Download,
  ListTree,
  CheckSquare,
  Square,
  ChevronDown,
  Layers,
  CheckCircle
} from 'lucide-react';
import {
  NodeType,
  NODE_TYPE_CONFIG,
  ProcessedNode,
  DataSourceInfo
} from '../types.ts';
import { SAMPLE_PRESETS, SamplePreset } from '../data/sampleData.ts';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  nodeTypesPresent: NodeType[];
  typeCounts: Record<NodeType, number>;
  selectedTypes: Set<NodeType>;
  onToggleType: (type: NodeType) => void;
  onSelectAllTypes: () => void;
  onClearAllTypes: () => void;
  onLoadPreset: (preset: SamplePreset) => void;
  onOpenJsonModal: () => void;
  onFileUpload: (file: File) => void;
  onExportJson: () => void;
  nodes: ProcessedNode[];
  selectedNode: ProcessedNode | null;
  onSelectNode: (node: ProcessedNode | null) => void;
  dataSourceInfo: DataSourceInfo;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  typeCounts,
  selectedTypes,
  onToggleType,
  onSelectAllTypes,
  onClearAllTypes,
  onLoadPreset,
  onOpenJsonModal,
  onFileUpload,
  onExportJson,
  nodes,
  selectedNode,
  onSelectNode,
  dataSourceInfo
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'filters' | 'explorer'>('filters');

  const allTypes: NodeType[] = ['file', 'class', 'function', 'variable', 'module', 'unknown'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const topConnectedNodes = React.useMemo(() => {
    return [...nodes].sort((a, b) => b.degree - a.degree).slice(0, 15);
  }, [nodes]);

  if (!isOpen) return null;

  return (
    <aside className="absolute top-12 left-0 bottom-0 z-20 w-80 md:w-88 bg-black/95 backdrop-blur-xl border-r border-neutral-800 flex flex-col shadow-2xl shadow-black overflow-hidden transition-all text-zinc-200">
      {/* Aviso de Origem de Dados */}
      <div className="p-3 border-b border-neutral-800/80 bg-neutral-950/80">
        {dataSourceInfo.type === 'example' ? (
          <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-yellow-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Dados de Exemplo (Demonstração)
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Você está visualizando um dataset fictício de exemplo. Importe o JSON do seu próprio projeto para inspecionar o seu código real.
            </p>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-neutral-900 border border-yellow-500/40 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-yellow-400 font-mono">
              <CheckCircle size={14} className="text-yellow-400" />
              JSON Importado pelo Usuário
            </div>
            <p className="text-[11px] text-zinc-300 mt-1 truncate font-mono">
              Arquivo: {dataSourceInfo.name}
            </p>
          </div>
        )}
      </div>

      {/* Ações de Importação e Presets */}
      <div className="p-3.5 border-b border-neutral-800 space-y-2.5 bg-neutral-950/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1.5 font-mono">
            <FileJson size={14} className="text-yellow-400" />
            Carregar Grafo
          </span>
          <button
            onClick={onExportJson}
            title="Exportar JSON do grafo atual"
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-yellow-400 px-2 py-0.5 rounded hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors"
          >
            <Download size={12} />
            Exportar
          </button>
        </div>

        {/* Botão de Presets de Exemplo */}
        <div className="relative">
          <button
            onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900 hover:bg-neutral-850 border border-yellow-500/40 hover:border-yellow-400 rounded-md text-xs font-semibold text-yellow-300 shadow-sm transition-all"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-400" />
              Carregar Exemplo...
            </span>
            <ChevronDown size={14} className={`text-yellow-400 transition-transform ${presetDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {presetDropdownOpen && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-neutral-950 border border-yellow-500/40 rounded-lg shadow-2xl z-40 p-1.5 space-y-1 backdrop-blur-xl divide-y divide-neutral-900">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onLoadPreset(preset);
                    setPresetDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded hover:bg-neutral-900 text-xs transition-colors group"
                >
                  <div className="font-semibold text-zinc-200 group-hover:text-yellow-400 flex items-center justify-between">
                    <span>{preset.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {preset.data.nodes.length} nós
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Upload & Colar JSON */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-yellow-500/40 rounded-md text-xs font-mono text-zinc-300 hover:text-yellow-400 transition-colors"
          >
            <Upload size={13} className="text-yellow-400" />
            Upload JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={onOpenJsonModal}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-yellow-500/40 rounded-md text-xs font-mono text-zinc-300 hover:text-yellow-400 transition-colors"
          >
            <Code2 size={13} className="text-yellow-400" />
            Colar JSON
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 text-xs font-medium bg-neutral-950/60">
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-2 px-3 text-center flex items-center justify-center gap-1.5 border-b-2 font-mono transition-all ${
            activeTab === 'filters'
              ? 'border-yellow-400 text-yellow-400 bg-neutral-900/60 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900/30'
          }`}
        >
          <Filter size={13} />
          Filtros & Legenda
        </button>
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex-1 py-2 px-3 text-center flex items-center justify-center gap-1.5 border-b-2 font-mono transition-all ${
            activeTab === 'explorer'
              ? 'border-yellow-400 text-yellow-400 bg-neutral-900/60 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900/30'
          }`}
        >
          <ListTree size={13} />
          Explorador ({nodes.length})
        </button>
      </div>

      {/* Conteúdo com Scroll */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {activeTab === 'filters' ? (
          <>
            {/* Seção Filtros por Tipo de Nó */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1.5 font-mono">
                  <Filter size={13} className="text-yellow-400" />
                  Filtrar por Tipo
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <button
                    onClick={onSelectAllTypes}
                    className="text-yellow-400 hover:text-yellow-300 hover:underline px-1"
                  >
                    Todos
                  </button>
                  <span className="text-zinc-600">•</span>
                  <button
                    onClick={onClearAllTypes}
                    className="text-zinc-400 hover:text-zinc-200 hover:underline px-1"
                  >
                    Nenhum
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {allTypes.map((type) => {
                  const config = NODE_TYPE_CONFIG[type];
                  const count = typeCounts[type] || 0;
                  const isChecked = selectedTypes.has(type);

                  return (
                    <label
                      key={type}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-neutral-900/90 border-neutral-700 text-white hover:border-yellow-500/50'
                          : 'bg-neutral-950/40 border-neutral-900 text-zinc-500 hover:bg-neutral-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleType(type)}
                          className="hidden"
                        />
                        <span className="text-zinc-400">
                          {isChecked ? <CheckSquare size={14} className="text-yellow-400" /> : <Square size={14} />}
                        </span>
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{
                            backgroundColor: config.color,
                            boxShadow: isChecked ? `0 0 6px ${config.color}` : 'none'
                          }}
                        />
                        <span className="font-medium font-mono text-[12px]">{config.namePt}</span>
                      </div>

                      <span className="font-mono text-[11px] text-zinc-400 bg-neutral-900 px-1.5 py-0.2 rounded border border-neutral-800">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Legenda de Cores Detalhada */}
            <div className="pt-3 border-t border-neutral-800 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1.5 font-mono">
                <Palette size={13} className="text-yellow-400" />
                Legenda de Cores
              </span>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {allTypes.map((type) => {
                  const config = NODE_TYPE_CONFIG[type];
                  return (
                    <div
                      key={`legend-${type}`}
                      onClick={() => onToggleType(type)}
                      className="p-2 rounded-md bg-neutral-950/70 border border-neutral-900 hover:border-yellow-500/40 cursor-pointer transition-all flex items-start gap-2.5"
                    >
                      <span
                        className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                        style={{
                          backgroundColor: config.color,
                          boxShadow: `0 0 8px ${config.color}80`
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-200 font-mono text-xs">{config.namePt}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({config.nameEn})</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Explorador de Nós */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <Layers size={13} />
                Top Conexões (Grau)
              </span>
              <span>{nodes.length} nós</span>
            </div>

            <div className="space-y-1">
              {topConnectedNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => onSelectNode(node)}
                    className={`w-full text-left p-2 rounded-md border transition-all text-xs flex items-center justify-between group ${
                      isSelected
                        ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300'
                        : 'bg-neutral-950/60 border-neutral-900 hover:bg-neutral-900 hover:border-neutral-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: node.color }}
                      />
                      <span className="font-mono font-medium truncate">{node.label}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-zinc-500">
                        {node.degree} lks
                      </span>
                      <span
                        className="text-[9px] font-mono px-1 py-0.2 rounded uppercase"
                        style={{
                          backgroundColor: `${node.color}25`,
                          color: node.color
                        }}
                      >
                        {node.type}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="p-2.5 bg-black border-t border-neutral-800 text-center text-[11px] font-mono text-zinc-500">
        Clique no nó: Destaque • Fundo: Limpar
      </div>
    </aside>
  );
};
