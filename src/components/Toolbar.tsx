import React, { useRef, useEffect } from 'react';
import {
  RotateCcw,
  Maximize2,
  Tag,
  Search,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Boxes,
  HelpCircle,
  FileCode2,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ProcessedNode, LabelMode, DimensionMode, DataSourceInfo } from '../types.ts';

interface ToolbarProps {
  totalNodes: number;
  totalLinks: number;
  visibleNodesCount: number;
  visibleLinksCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchedNodes: ProcessedNode[];
  onSelectNode: (node: ProcessedNode | null) => void;
  selectedNode: ProcessedNode | null;
  onReorganize: () => void;
  onCenterCamera: () => void;
  labelMode: LabelMode;
  onSetLabelMode: (mode: LabelMode) => void;
  dimensionMode: DimensionMode;
  onToggleDimension: () => void;
  dataSourceInfo: DataSourceInfo;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenHelp: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  totalNodes,
  totalLinks,
  visibleNodesCount,
  visibleLinksCount,
  searchQuery,
  onSearchChange,
  matchedNodes,
  onSelectNode,
  selectedNode,
  onReorganize,
  onCenterCamera,
  labelMode,
  onSetLabelMode,
  dimensionMode,
  onToggleDimension,
  dataSourceInfo,
  sidebarOpen,
  onToggleSidebar,
  onOpenHelp
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [labelMenuOpen, setLabelMenuOpen] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isFiltered = visibleNodesCount !== totalNodes || visibleLinksCount !== totalLinks;

  const labelModeOptions: { mode: LabelMode; label: string; desc: string }[] = [
    { mode: 'important', label: 'Principais', desc: 'Rótulos no nó selecionado, vizinhos e arquivos/módulos' },
    { mode: 'all', label: 'Todas', desc: 'Exibe rótulos em todos os nós do grafo' },
    { mode: 'none', label: 'Nenhuma', desc: 'Oculta rótulos na cena (visual limpo)' }
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 md:px-5 py-2.5 bg-black/92 backdrop-blur-md border-b border-yellow-500/25 shadow-xl shadow-black/80 text-zinc-200">
      {/* Lado Esquerdo: Sidebar Toggle, Título & Indicador de Origem dos Dados */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Recolher painel lateral (B)' : 'Abrir painel lateral (B)'}
          className="p-1.5 rounded-md hover:bg-neutral-900 text-zinc-400 hover:text-yellow-400 transition-colors border border-neutral-800 hover:border-yellow-500/40 focus:outline-none focus:ring-1 focus:ring-yellow-500"
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-bold shadow-md shadow-yellow-500/30">
            <Boxes size={17} strokeWidth={2.5} />
          </div>
          <span className="hidden sm:inline font-bold text-sm tracking-tight text-white font-mono flex items-center gap-1.5">
            SourceGraph
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded">3D</span>
          </span>
        </div>

        {/* Indicador Claro de Origem dos Dados (Exemplo vs Importado) */}
        <div className="flex items-center">
          {dataSourceInfo.type === 'example' ? (
            <div
              title={dataSourceInfo.sourceNote}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/35 text-yellow-300 text-xs font-mono shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
              <span className="font-semibold text-yellow-400">Exemplo:</span>
              <span className="text-zinc-300 truncate max-w-[130px] md:max-w-[200px]">
                {dataSourceInfo.name}
              </span>
            </div>
          ) : (
            <div
              title={`Arquivo importado pelo usuário: ${dataSourceInfo.name}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/20 border border-yellow-400/60 text-yellow-300 text-xs font-mono shadow-sm"
            >
              <FileCode2 size={13} className="text-yellow-400 shrink-0" />
              <span className="font-bold text-yellow-400">JSON:</span>
              <span className="text-white truncate max-w-[130px] md:max-w-[200px]">
                {dataSourceInfo.name}
              </span>
            </div>
          )}
        </div>

        {/* Contadores de Nós e Arestas */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono pl-2 border-l border-neutral-800">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            <span>{visibleNodesCount} nós</span>
            {isFiltered && <span className="text-zinc-500 text-[10px]">({totalNodes})</span>}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60"></span>
            <span>{visibleLinksCount} arestas</span>
            {isFiltered && <span className="text-zinc-500 text-[10px]">({totalLinks})</span>}
          </span>
        </div>
      </div>

      {/* Centro: Barra de Busca com Autocomplete */}
      <div className="relative flex-1 max-w-xs md:max-w-sm mx-3">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-yellow-500/70 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar nó por nome ou id... (/)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-neutral-950/90 border border-neutral-800 focus:border-yellow-500/80 rounded-md pl-8 pr-8 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/40 transition-all font-mono"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 p-0.5 text-zinc-400 hover:text-yellow-400"
            >
              <X size={13} />
            </button>
          ) : (
            <span className="absolute right-2.5 px-1 py-0.2 text-[10px] font-mono text-yellow-500/80 border border-yellow-500/30 rounded bg-neutral-950 pointer-events-none">
              /
            </span>
          )}
        </div>

        {/* Dropdown de resultados de busca */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 max-h-60 overflow-y-auto bg-neutral-950/98 border border-yellow-500/40 rounded-lg shadow-2xl shadow-black z-50 divide-y divide-neutral-900 backdrop-blur-xl">
            {matchedNodes.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-zinc-400 text-center font-mono">
                Nenhum nó encontrado para "{searchQuery}"
              </div>
            ) : (
              matchedNodes.slice(0, 8).map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    onSelectNode(node);
                    onSearchChange(node.label);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-yellow-500/10 transition-colors ${
                    selectedNode?.id === node.id ? 'bg-yellow-500/20 text-yellow-300' : 'text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: node.color }}
                    />
                    <span className="font-mono font-medium truncate">{node.label}</span>
                    <span className="text-[10px] text-zinc-500 truncate">({node.id})</span>
                  </div>
                  <span
                    className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded uppercase"
                    style={{
                      backgroundColor: `${node.color}20`,
                      color: node.color,
                      border: `1px solid ${node.color}40`
                    }}
                  >
                    {node.type}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Lado Direito: Modos de Visualização & Ações */}
      <div className="flex items-center gap-1.5">
        {/* Alternar 2D / 3D */}
        <button
          onClick={onToggleDimension}
          title={`Alternar para layout ${dimensionMode === '3d' ? '2D (plano)' : '3D (tridimensional)'}`}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-md border transition-all active:scale-95 ${
            dimensionMode === '3d'
              ? 'bg-neutral-950 border-yellow-500/40 text-yellow-400 hover:bg-neutral-900 hover:border-yellow-400'
              : 'bg-yellow-500 border-yellow-400 text-black hover:bg-yellow-400'
          }`}
        >
          <Layers size={13} className={dimensionMode === '3d' ? 'text-yellow-400' : 'text-black'} />
          <span>{dimensionMode.toUpperCase()}</span>
        </button>

        {/* Menu de Opções de Labels (Nenhuma, Principais, Todas) */}
        <div className="relative">
          <button
            onClick={() => setLabelMenuOpen(!labelMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:border-yellow-500/40 text-zinc-200 hover:text-yellow-400 transition-all"
            title="Opções de exibição de rótulos dos nós"
          >
            <Tag size={13} className="text-yellow-400" />
            <span className="hidden md:inline font-mono">
              Labels: {labelMode === 'important' ? 'Principais' : labelMode === 'all' ? 'Todas' : 'Nenhuma'}
            </span>
            <span className="md:hidden text-[10px] uppercase font-mono">{labelMode}</span>
            <ChevronDown size={12} className={`text-zinc-400 transition-transform ${labelMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {labelMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-52 bg-neutral-950 border border-yellow-500/40 rounded-lg shadow-2xl shadow-black z-50 p-1 divide-y divide-neutral-900 backdrop-blur-xl">
              {labelModeOptions.map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => {
                    onSetLabelMode(opt.mode);
                    setLabelMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-md text-xs transition-colors flex flex-col ${
                    labelMode === opt.mode
                      ? 'bg-yellow-500/20 text-yellow-300 font-medium'
                      : 'text-zinc-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <span className="font-semibold text-yellow-400">{opt.label}</span>
                  <span className="text-[10px] text-zinc-400 leading-tight mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reorganizar Grafo */}
        <button
          onClick={onReorganize}
          title="Reiniciar simulação de forças com maior dispersão"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-yellow-500/40 text-zinc-200 hover:text-yellow-400 rounded-md transition-all active:scale-95"
        >
          <RotateCcw size={13} className="text-yellow-400" />
          <span className="hidden md:inline font-mono">Reorganizar</span>
        </button>

        {/* Centralizar Câmera */}
        <button
          onClick={onCenterCamera}
          title="Centralizar câmera e enquadrar todo o grafo (F)"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-yellow-500/40 text-zinc-200 hover:text-yellow-400 rounded-md transition-all active:scale-95"
        >
          <Maximize2 size={13} className="text-yellow-400" />
          <span className="hidden md:inline font-mono">Centralizar</span>
        </button>

        {/* Ajuda / Controles */}
        <button
          onClick={onOpenHelp}
          title="Controles de navegação e atalhos"
          className="p-1.5 text-zinc-400 hover:text-yellow-400 rounded hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
};
