import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  RawGraphData,
  ProcessedNode,
  NodeType,
  LabelMode,
  DimensionMode,
  DataSourceInfo
} from './types.ts';
import { DEFAULT_RAW_GRAPH, SamplePreset } from './data/sampleData.ts';
import { processGraphData, validateGraphJson } from './utils/graphUtils.ts';
import { GraphViewer, GraphViewerRef } from './components/GraphViewer.tsx';
import { Toolbar } from './components/Toolbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { NodeDetails } from './components/NodeDetails.tsx';
import { JsonModal } from './components/JsonModal.tsx';
import { HelpModal } from './components/HelpModal.tsx';

export default function App() {
  const [rawData, setRawData] = useState<RawGraphData>(DEFAULT_RAW_GRAPH);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [labelMode, setLabelMode] = useState<LabelMode>('important');
  const [dimensionMode, setDimensionMode] = useState<DimensionMode>('3d');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Informações explícitas sobre a origem dos dados (Exemplo vs Importado)
  const [dataSourceInfo, setDataSourceInfo] = useState<DataSourceInfo>({
    type: 'example',
    name: 'Projeto Web TypeScript (Exemplo)',
    sourceNote: 'Dados fictícios para teste e demonstração do visualizador 3D. Importe seu próprio JSON para visualizar seu código real.'
  });

  // Tipos selecionados nos filtros
  const [selectedTypes, setSelectedTypes] = useState<Set<NodeType>>(
    new Set(['file', 'class', 'function', 'variable', 'module', 'unknown'])
  );

  const graphViewerRef = useRef<GraphViewerRef>(null);

  // Processa dados do grafo gerando graus, vizinhança, grupos e raios
  const processedData = useMemo(() => {
    return processGraphData(rawData);
  }, [rawData]);

  // Mapa de acesso rápido a todos os nós processados
  const allNodesMap = useMemo(() => {
    const map = new Map<string, ProcessedNode>();
    for (const node of processedData.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [processedData.nodes]);

  // Contagem de nós por tipo no dataset atual
  const typeCounts = useMemo(() => {
    const counts: Record<NodeType, number> = {
      file: 0,
      class: 0,
      function: 0,
      variable: 0,
      module: 0,
      unknown: 0
    };
    for (const node of processedData.nodes) {
      counts[node.type] = (counts[node.type] || 0) + 1;
    }
    return counts;
  }, [processedData.nodes]);

  // Tipos de nós presentes nos dados atuais
  const nodeTypesPresent = useMemo(() => {
    return Object.keys(typeCounts).filter(
      (type) => typeCounts[type as NodeType] > 0
    ) as NodeType[];
  }, [typeCounts]);

  // Nós filtrados por tipo selecionado
  const visibleNodes = useMemo(() => {
    return processedData.nodes.filter((node) => selectedTypes.has(node.type));
  }, [processedData.nodes, selectedTypes]);

  const visibleNodeIds = useMemo(() => {
    return new Set(visibleNodes.map((n) => n.id));
  }, [visibleNodes]);

  // Arestas filtradas (visíveis somente se ambos os nós estiverem visíveis)
  const visibleLinks = useMemo(() => {
    return processedData.links.filter((link) => {
      const sId = typeof link.source === 'object' ? link.source.id : link.source;
      const tId = typeof link.target === 'object' ? link.target.id : link.target;
      return visibleNodeIds.has(sId) && visibleNodeIds.has(tId);
    });
  }, [processedData.links, visibleNodeIds]);

  // Busca e correspondências
  const matchedNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return visibleNodes.filter(
      (node) =>
        node.label.toLowerCase().includes(q) ||
        node.id.toLowerCase().includes(q) ||
        node.language.toLowerCase().includes(q) ||
        node.type.toLowerCase().includes(q) ||
        node.group.toLowerCase().includes(q)
    );
  }, [visibleNodes, searchQuery]);

  const searchMatchedIds = useMemo(() => {
    return new Set(matchedNodes.map((n) => n.id));
  }, [matchedNodes]);

  const isSearching = searchQuery.trim().length > 0;

  // Nó selecionado atual
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return allNodesMap.get(selectedNodeId) || null;
  }, [selectedNodeId, allNodesMap]);

  // Ações de seleção de nó (preservando a posição da câmera ao apenas selecionar)
  const handleSelectNode = useCallback((node: ProcessedNode | null) => {
    if (node) {
      setSelectedNodeId(node.id);
    } else {
      setSelectedNodeId(null);
    }
  }, []);

  // Alterna visibilidade de um tipo de nó
  const handleToggleType = useCallback((type: NodeType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleSelectAllTypes = useCallback(() => {
    setSelectedTypes(new Set(['file', 'class', 'function', 'variable', 'module', 'unknown']));
  }, []);

  const handleClearAllTypes = useCallback(() => {
    setSelectedTypes(new Set());
  }, []);

  // Alterna dimensão 2D / 3D
  const handleToggleDimension = useCallback(() => {
    setDimensionMode((prev) => (prev === '3d' ? '2d' : '3d'));
  }, []);

  // Carrega um preset de exemplo com indicação clara de dados fictícios
  const handleLoadPreset = useCallback((preset: SamplePreset) => {
    setRawData(preset.data);
    setSelectedNodeId(null);
    setSearchQuery('');
    setDataSourceInfo({
      type: 'example',
      name: preset.name,
      sourceNote: 'Dados fictícios para teste e demonstração do visualizador 3D.'
    });
    handleSelectAllTypes();
  }, [handleSelectAllTypes]);

  // Upload de arquivo JSON
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const validation = validateGraphJson(parsed);

        if (!validation.valid || !validation.data) {
          alert(`Erro ao validar JSON:\n${validation.error || 'Formato de JSON incorreto.'}`);
          return;
        }

        // Se houver avisos, reporta
        if (validation.issues.length > 0) {
          const warnings = validation.issues.map(i => `• ${i.message}`).join('\n');
          console.warn('Avisos na validação do JSON importado:\n' + warnings);
        }

        setRawData(validation.data);
        setSelectedNodeId(null);
        setSearchQuery('');
        setDataSourceInfo({
          type: 'imported',
          name: file.name,
          fileName: file.name,
          importedAt: new Date().toLocaleTimeString(),
          sourceNote: `JSON importado do arquivo local: ${file.name}`
        });
        handleSelectAllTypes();
      } catch (err) {
        alert(`Erro ao processar arquivo JSON:\n${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  }, [handleSelectAllTypes]);

  // Exportar dados atuais em arquivo JSON
  const handleExportJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rawData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'sourcegraph-3d.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [rawData]);

  // Aplica novo JSON via modal de edição
  const handleApplyJson = useCallback((newData: RawGraphData, sourceLabel?: string) => {
    setRawData(newData);
    setSelectedNodeId(null);
    setSearchQuery('');
    setDataSourceInfo({
      type: 'imported',
      name: sourceLabel || 'JSON Colado Manualmente',
      importedAt: new Date().toLocaleTimeString(),
      sourceNote: 'Estrutura JSON importada manualmente pelo usuário.'
    });
    handleSelectAllTypes();
  }, [handleSelectAllTypes]);

  // Atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setIsJsonModalOpen(false);
        setIsHelpModalOpen(false);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        graphViewerRef.current?.centerCamera();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      {/* Barra de Ferramentas Superior */}
      <Toolbar
        totalNodes={processedData.nodes.length}
        totalLinks={processedData.links.length}
        visibleNodesCount={visibleNodes.length}
        visibleLinksCount={visibleLinks.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        matchedNodes={matchedNodes}
        onSelectNode={handleSelectNode}
        selectedNode={selectedNode}
        onReorganize={() => graphViewerRef.current?.reheat()}
        onCenterCamera={() => graphViewerRef.current?.centerCamera()}
        labelMode={labelMode}
        onSetLabelMode={setLabelMode}
        dimensionMode={dimensionMode}
        onToggleDimension={handleToggleDimension}
        dataSourceInfo={dataSourceInfo}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Painel Lateral (Upload, Presets, Filtros, Legenda) */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        nodeTypesPresent={nodeTypesPresent}
        typeCounts={typeCounts}
        selectedTypes={selectedTypes}
        onToggleType={handleToggleType}
        onSelectAllTypes={handleSelectAllTypes}
        onClearAllTypes={handleClearAllTypes}
        onLoadPreset={handleLoadPreset}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onFileUpload={handleFileUpload}
        onExportJson={handleExportJson}
        nodes={processedData.nodes}
        selectedNode={selectedNode}
        onSelectNode={handleSelectNode}
        dataSourceInfo={dataSourceInfo}
      />

      {/* Área Central: Visualizador 3D/2D com 3d-force-graph */}
      <main className="w-full h-full pt-12">
        <GraphViewer
          ref={graphViewerRef}
          nodes={visibleNodes}
          links={visibleLinks}
          selectedNode={selectedNode}
          onSelectNode={handleSelectNode}
          searchMatchedIds={searchMatchedIds}
          isSearching={isSearching}
          labelMode={labelMode}
          dimensionMode={dimensionMode}
        />
      </main>

      {/* Painel de Detalhes do Nó Selecionado */}
      <NodeDetails
        node={selectedNode}
        allNodesMap={allNodesMap}
        onClose={() => setSelectedNodeId(null)}
        onSelectNode={(node) => {
          setSelectedNodeId(node.id);
        }}
        onFocusNode={(nodeId) => graphViewerRef.current?.focusNode(nodeId)}
      />

      {/* Modal de Edição / Colagem de JSON */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        currentData={rawData}
        onApply={handleApplyJson}
      />

      {/* Modal de Ajuda & Atalhos */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
