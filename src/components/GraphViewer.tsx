import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import ForceGraph3D, { ForceGraph3DInstance } from '3d-force-graph';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import {
  ProcessedNode,
  ProcessedLink,
  NODE_TYPE_CONFIG,
  LabelMode,
  DimensionMode
} from '../types.ts';

export interface GraphViewerRef {
  reheat: () => void;
  centerCamera: () => void;
  focusNode: (nodeId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface GraphViewerProps {
  nodes: ProcessedNode[];
  links: ProcessedLink[];
  selectedNode: ProcessedNode | null;
  onSelectNode: (node: ProcessedNode | null) => void;
  searchMatchedIds: Set<string>;
  isSearching: boolean;
  labelMode: LabelMode;
  dimensionMode: DimensionMode;
}

export const GraphViewer = forwardRef<GraphViewerRef, GraphViewerProps>(({
  nodes,
  links,
  selectedNode,
  onSelectNode,
  searchMatchedIds,
  isSearching,
  labelMode,
  dimensionMode
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphInstanceRef = useRef<ForceGraph3DInstance | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ProcessedNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<any | null>(null);

  // Helper refs para evitar closures obsoletas nos callbacks do ForceGraph
  const selectedNodeRef = useRef(selectedNode);
  selectedNodeRef.current = selectedNode;

  const hoveredNodeRef = useRef(hoveredNode);
  hoveredNodeRef.current = hoveredNode;

  const hoveredLinkRef = useRef(hoveredLink);
  hoveredLinkRef.current = hoveredLink;

  const labelModeRef = useRef(labelMode);
  labelModeRef.current = labelMode;

  const dimensionModeRef = useRef(dimensionMode);
  dimensionModeRef.current = dimensionMode;

  const searchMatchedIdsRef = useRef(searchMatchedIds);
  searchMatchedIdsRef.current = searchMatchedIds;

  const isSearchingRef = useRef(isSearching);
  isSearchingRef.current = isSearching;

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // Lógica inteligente para exibição de labels sem poluição visual
  const shouldShowLabel = useCallback((node: ProcessedNode): boolean => {
    const mode = labelModeRef.current;
    if (mode === 'none') return false;
    if (mode === 'all') return true;

    // Modo 'important' (padrão):
    const isHovered = hoveredNodeRef.current?.id === node.id;
    const isMatched = isSearchingRef.current && searchMatchedIdsRef.current.has(node.id);
    if (isHovered || isMatched) return true;

    const sel = selectedNodeRef.current;

    // Se houver um nó selecionado, mostra apenas a label do selecionado e dos seus vizinhos diretos
    if (sel) {
      const isSelected = sel.id === node.id;
      const isNeighbor = sel.neighbors.has(node.id);
      return isSelected || isNeighbor;
    }

    // Se nenhum nó estiver selecionado, mostra apenas nós principais
    const isMainNode =
      node.type === 'file' ||
      node.type === 'module' ||
      node.degree >= 4;

    return isMainNode;
  }, []);

  // Determina a cor do nó considerando tema Preto e Amarelo
  const getNodeColor = useCallback((node: ProcessedNode): string => {
    const sel = selectedNodeRef.current;
    const isSearch = isSearchingRef.current;
    const matched = searchMatchedIdsRef.current;

    // Caso de busca ativa
    if (isSearch) {
      if (matched.has(node.id)) {
        return '#facc15'; // Amarelo vibrante de destaque
      }
      if (!sel) {
        return 'rgba(60, 60, 60, 0.25)'; // Esmaecer nós não correspondentes
      }
    }

    // Caso de nó selecionado: destaca nó + vizinhos e esmaece os demais
    if (sel) {
      if (sel.id === node.id) {
        return '#fde047'; // Nó ativo em amarelo brilhante
      }
      if (sel.neighbors.has(node.id)) {
        return node.color; // Vizinhos diretos mantêm sua cor temática nítida
      }
      // Nós não pertencentes à vizinhança direta ficam com baixa opacidade
      return 'rgba(70, 70, 70, 0.12)';
    }

    // Caso de hover
    const hov = hoveredNodeRef.current;
    if (hov) {
      if (hov.id === node.id) return '#facc15';
      if (hov.neighbors.has(node.id)) return node.color;
      return 'rgba(80, 80, 80, 0.35)';
    }

    return node.color;
  }, []);

  // Determina o contraste e cor da aresta
  const getLinkColor = useCallback((link: any): string => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    const sel = selectedNodeRef.current;
    const hovL = hoveredLinkRef.current;

    // Aresta sob hover
    if (hovL && (
      (typeof hovL.source === 'object' ? hovL.source.id : hovL.source) === sourceId &&
      (typeof hovL.target === 'object' ? hovL.target.id : hovL.target) === targetId
    )) {
      return '#fde047'; // Amarelo elétrico no hover
    }

    if (sel) {
      if (sourceId === sel.id || targetId === sel.id) {
        return '#facc15'; // Destaque luminoso amarelo para conexões do nó selecionado
      }
      return 'rgba(40, 40, 40, 0.06)'; // Arestas não relacionadas quase invisíveis
    }

    const hov = hoveredNodeRef.current;
    if (hov) {
      if (sourceId === hov.id || targetId === hov.id) {
        return 'rgba(250, 204, 21, 0.9)';
      }
      return 'rgba(45, 45, 45, 0.15)';
    }

    // Contraste padrão contra o fundo preto
    return 'rgba(161, 161, 170, 0.65)';
  }, []);

  const isLinkHighlighted = useCallback((link: any): boolean => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    const sel = selectedNodeRef.current;
    const hovL = hoveredLinkRef.current;

    if (hovL && (
      (typeof hovL.source === 'object' ? hovL.source.id : hovL.source) === sourceId &&
      (typeof hovL.target === 'object' ? hovL.target.id : hovL.target) === targetId
    )) {
      return true;
    }

    if (sel) {
      return sourceId === sel.id || targetId === sel.id;
    }
    const hov = hoveredNodeRef.current;
    if (hov) {
      return sourceId === hov.id || targetId === hov.id;
    }
    return false;
  }, []);

  // Tooltip detalhado do nó em tema Preto e Amarelo
  const getNodeTooltipHtml = useCallback((node: ProcessedNode): string => {
    const typeConf = NODE_TYPE_CONFIG[node.type];
    return `
      <div style="background: rgba(5, 5, 5, 0.97); border: 1px solid rgba(234, 179, 8, 0.5); border-radius: 8px; padding: 10px 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.95); color: #f4f4f5; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; max-width: 290px; backdrop-filter: blur(14px); line-height: 1.45;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(39, 39, 42, 0.8);">
          <strong style="color: #ffffff; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${node.label}</strong>
          <span style="background: ${node.color}25; color: ${node.color}; border: 1px solid ${node.color}60; border-radius: 4px; padding: 1px 6px; font-size: 9px; text-transform: uppercase; font-weight: 700;">
            ${typeConf.namePt}
          </span>
        </div>
        <div style="color: #a1a1aa; margin-bottom: 3px; font-size: 10px;">
          ID: <span style="color: #e4e4e7;">${node.id}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: #a1a1aa; margin-bottom: 2px;">
          <span>Grupo / Módulo:</span>
          <span style="color: #facc15; font-weight: 600;">${node.group}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: #a1a1aa; margin-bottom: 2px;">
          <span>Linguagem:</span>
          <span style="color: #f4f4f5; font-weight: 500;">${node.language}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: #a1a1aa; margin-bottom: 2px;">
          <span>Tamanho:</span>
          <span style="color: #f4f4f5;">${node.size} LOC/pts</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: #a1a1aa; margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(63, 63, 70, 0.6);">
          <span>Grau de conexões:</span>
          <span style="color: #facc15; font-weight: 700;">${node.degree} (${node.inDegree} in / ${node.outDegree} out)</span>
        </div>
        ${node.description ? `<div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid rgba(39, 39, 42, 0.8); color: #a1a1aa; font-family: sans-serif; font-size: 10px; font-style: italic;">${node.description}</div>` : ''}
      </div>
    `;
  }, []);

  // Tooltip em alto contraste mostrando claramente a relação no hover da aresta
  const getLinkTooltipHtml = useCallback((link: any): string => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    const relation = link.relation || 'relaciona';

    return `
      <div style="background: rgba(5, 5, 5, 0.98); border: 1px solid rgba(250, 204, 21, 0.7); border-radius: 6px; padding: 7px 12px; box-shadow: 0 12px 20px -3px rgba(0,0,0,0.9); color: #f4f4f5; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11px; backdrop-filter: blur(12px);">
        <div style="color: #eab308; font-size: 9px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 2px;">Relação Direcional</div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: #ffffff; font-weight: 600;">${sourceId}</span>
          <span style="background: rgba(250, 204, 21, 0.2); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.6); border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: bold;">
            --[ ${relation} ]-->
          </span>
          <span style="color: #ffffff; font-weight: 600;">${targetId}</span>
        </div>
      </div>
    `;
  }, []);

  // Configuração das forças com maior separação e clusterização por arquivo/módulo
  const configurePhysicsForces = useCallback((graph: ForceGraph3DInstance, currentNodes: ProcessedNode[], is2D: boolean) => {
    const chargeForce = graph.d3Force('charge');
    if (chargeForce) {
      chargeForce.strength(-340);
      chargeForce.distanceMax(600);
    }

    const linkForce = graph.d3Force('link');
    if (linkForce) {
      linkForce.distance((link: any) => {
        const s = typeof link.source === 'object' ? link.source : null;
        const t = typeof link.target === 'object' ? link.target : null;
        if (s && t && s.group === t.group) {
          return is2D ? 45 : 55;
        }
        return is2D ? 75 : 95;
      });
      linkForce.strength(0.6);
    }

    // Cluster Force para agrupamento visual em torno de arquivos/módulos
    graph.d3Force('cluster', (alpha: number) => {
      if (alpha <= 0.001) return;
      const groupsMap = new Map<string, { x: number; y: number; z: number; count: number }>();

      for (let i = 0; i < currentNodes.length; i++) {
        const n = currentNodes[i];
        if (!groupsMap.has(n.group)) {
          groupsMap.set(n.group, { x: 0, y: 0, z: 0, count: 0 });
        }
        const g = groupsMap.get(n.group)!;
        g.x += n.x || 0;
        g.y += n.y || 0;
        g.z += n.z || 0;
        g.count++;
      }

      for (const g of groupsMap.values()) {
        if (g.count > 0) {
          g.x /= g.count;
          g.y /= g.count;
          g.z /= g.count;
        }
      }

      const k = 0.12 * alpha;
      for (let i = 0; i < currentNodes.length; i++) {
        const n = currentNodes[i];
        const g = groupsMap.get(n.group);
        if (g) {
          n.vx = (n.vx || 0) + (g.x - (n.x || 0)) * k;
          n.vy = (n.vy || 0) + (g.y - (n.y || 0)) * k;
          if (!is2D) {
            n.vz = (n.vz || 0) + (g.z - (n.z || 0)) * k;
          } else {
            n.z = 0;
            n.vz = 0;
          }
        }
      }
    });
  }, []);

  // Inicializa o ForceGraph3D
  useEffect(() => {
    if (!containerRef.current) return;

    const graph = (ForceGraph3D as any)({
      controlType: 'orbit'
    })(containerRef.current);

    graphInstanceRef.current = graph;

    // Configurações visuais com fundo 100% preto
    graph
      .backgroundColor('#000000')
      .showNavInfo(false)
      .enableNodeDrag(true)
      .enableNavigationControls(true)
      .numDimensions(dimensionModeRef.current === '2d' ? 2 : 3)
      .nodeRelSize(1)
      .nodeResolution(28)
      .nodeVal((node: any) => (node as ProcessedNode).radius || 4)
      .nodeColor((node: any) => getNodeColor(node as ProcessedNode))
      .nodeOpacity(0.95)
      .nodeLabel((node: any) => getNodeTooltipHtml(node as ProcessedNode))
      .linkLabel((link: any) => getLinkTooltipHtml(link))
      .linkHoverPrecision(4)
      // Arestas com contraste e setas direcionais destacadas
      .linkDirectionalArrowLength(4.8)
      .linkDirectionalArrowRelPos(0.95)
      .linkDirectionalArrowResolution(12)
      .linkCurvature(0.12)
      .linkWidth((link: any) => isLinkHighlighted(link) ? 2.8 : 1.2)
      .linkColor((link: any) => getLinkColor(link))
      .linkDirectionalArrowColor((link: any) => isLinkHighlighted(link) ? '#facc15' : getLinkColor(link))
      .linkDirectionalParticles((link: any) => isLinkHighlighted(link) ? 4 : 0)
      .linkDirectionalParticleSpeed(0.008)
      .linkDirectionalParticleWidth(2.6)
      .linkDirectionalParticleColor(() => '#facc15')
      // Rótulos inteligentes 3D
      .nodeThreeObjectExtend(true)
      .nodeThreeObject((node: any) => {
        const pNode = node as ProcessedNode;
        const group = new THREE.Group();
        const sel = selectedNodeRef.current;
        const isSelected = sel?.id === pNode.id;

        // Anel de destaque amarelo em volta do nó selecionado
        if (isSelected) {
          const ringGeo = new THREE.RingGeometry(pNode.radius + 1.2, pNode.radius + 2.5, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color('#facc15'),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          group.add(ring);
        }

        // Rótulo textual 3D com SpriteText
        if (shouldShowLabel(pNode)) {
          const sprite = new SpriteText(pNode.label);
          sprite.fontFace = 'ui-monospace, SFMono-Regular, Menlo, monospace';
          sprite.fontWeight = isSelected ? 'bold' : 'normal';
          sprite.color = isSelected ? '#ffffff' : (sel && sel.neighbors.has(pNode.id) ? '#fef08a' : '#d4d4d8');
          sprite.backgroundColor = isSelected ? 'rgba(10, 10, 10, 0.97)' : 'rgba(5, 5, 5, 0.88)';
          sprite.borderColor = isSelected ? '#facc15' : pNode.color;
          sprite.borderWidth = isSelected ? 1.8 : 0.8;
          sprite.borderRadius = 3;
          sprite.padding = [4, 2.5];
          sprite.textHeight = Math.max(3.2, Math.min(5.5, pNode.radius * 0.75));
          sprite.position.y = pNode.radius + 4.0;
          group.add(sprite);
        }

        return group.children.length > 0 ? group : null;
      })
      .onNodeClick((node: any) => {
        const pNode = node as ProcessedNode;
        onSelectNode(pNode);
      })
      .onBackgroundClick(() => {
        onSelectNode(null);
      })
      .onNodeHover((node: any) => {
        const pNode = (node as ProcessedNode) || null;
        setHoveredNode(pNode);
      })
      .onLinkHover((link: any) => {
        setHoveredLink(link || null);
      });

    // Luzes da cena (luz principal branca + fill sutil dourado/amarelo)
    const scene = graph.scene();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(150, 200, 150);
    const dirLight2 = new THREE.DirectionalLight(0xfacc15, 0.45);
    dirLight2.position.set(-150, -100, -150);
    scene.add(ambientLight);
    scene.add(dirLight1);
    scene.add(dirLight2);

    // Ajuste de tamanho
    const handleResize = () => {
      if (containerRef.current && graphInstanceRef.current) {
        graphInstanceRef.current.width(containerRef.current.clientWidth);
        graphInstanceRef.current.height(containerRef.current.clientHeight);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (graphInstanceRef.current) {
        graphInstanceRef.current._destructor();
        graphInstanceRef.current = null;
      }
    };
  }, []);

  // Atualização e carregamento de novos grafos
  useEffect(() => {
    if (!graphInstanceRef.current) return;

    const graphNodes = nodes.map(n => ({ ...n }));
    const graphLinks = links.map(l => ({ ...l }));

    graphInstanceRef.current.graphData({
      nodes: graphNodes,
      links: graphLinks
    });

    configurePhysicsForces(
      graphInstanceRef.current,
      graphNodes as ProcessedNode[],
      dimensionModeRef.current === '2d'
    );

    graphInstanceRef.current.d3ReheatSimulation();

    setTimeout(() => {
      if (graphInstanceRef.current) {
        graphInstanceRef.current.zoomToFit(700, 45);
      }
    }, 150);
  }, [nodes, links, configurePhysicsForces]);

  // Alternância 2D / 3D
  useEffect(() => {
    if (!graphInstanceRef.current) return;
    const is2D = dimensionMode === '2d';

    graphInstanceRef.current.numDimensions(is2D ? 2 : 3);

    configurePhysicsForces(
      graphInstanceRef.current,
      nodesRef.current,
      is2D
    );

    if (is2D) {
      graphInstanceRef.current.cameraPosition({ x: 0, y: 0, z: 320 }, { x: 0, y: 0, z: 0 }, 800);
    }

    graphInstanceRef.current.d3ReheatSimulation();
    setTimeout(() => {
      graphInstanceRef.current?.zoomToFit(600, 40);
    }, 200);
  }, [dimensionMode, configurePhysicsForces]);

  // Atualização de destaques visuais
  useEffect(() => {
    if (!graphInstanceRef.current) return;

    graphInstanceRef.current.nodeColor(graphInstanceRef.current.nodeColor());
    graphInstanceRef.current.linkColor(graphInstanceRef.current.linkColor());
    graphInstanceRef.current.linkWidth(graphInstanceRef.current.linkWidth());
    graphInstanceRef.current.linkDirectionalParticles(graphInstanceRef.current.linkDirectionalParticles());
    graphInstanceRef.current.linkDirectionalArrowColor(graphInstanceRef.current.linkDirectionalArrowColor());

    graphInstanceRef.current.refresh();
  }, [selectedNode, hoveredNode, hoveredLink, searchMatchedIds, isSearching, labelMode]);

  // Métodos expostos
  useImperativeHandle(ref, () => ({
    reheat: () => {
      if (graphInstanceRef.current) {
        graphInstanceRef.current.d3ReheatSimulation();
      }
    },
    centerCamera: () => {
      if (graphInstanceRef.current) {
        graphInstanceRef.current.zoomToFit(700, 45);
      }
    },
    focusNode: (nodeId: string) => {
      if (!graphInstanceRef.current) return;
      const graph = graphInstanceRef.current;
      const graphData = graph.graphData();
      const node = graphData.nodes.find((n: any) => n.id === nodeId);
      if (node) {
        const nx = typeof node.x === 'number' ? node.x : 0;
        const ny = typeof node.y === 'number' ? node.y : 0;
        const nz = typeof node.z === 'number' ? node.z : 0;
        const distance = 130;
        const hyp = Math.hypot(nx, ny, nz);
        const distRatio = hyp > 0 ? (1 + distance / hyp) : 1.5;

        graph.cameraPosition(
          { x: nx * distRatio, y: ny * distRatio, z: nz * distRatio },
          { x: nx, y: ny, z: nz },
          900
        );
      }
    },
    zoomIn: () => {
      if (!graphInstanceRef.current) return;
      const cam = graphInstanceRef.current.cameraPosition();
      graphInstanceRef.current.cameraPosition(
        { x: cam.x * 0.75, y: cam.y * 0.75, z: cam.z * 0.75 },
        undefined,
        350
      );
    },
    zoomOut: () => {
      if (!graphInstanceRef.current) return;
      const cam = graphInstanceRef.current.cameraPosition();
      graphInstanceRef.current.cameraPosition(
        { x: cam.x * 1.35, y: cam.y * 1.35, z: cam.z * 1.35 },
        undefined,
        350
      );
    }
  }));

  return (
    <div className="w-full h-full relative overflow-hidden bg-black select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Botões flutuantes de Zoom e Ajuste */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-1.5 bg-black/92 backdrop-blur-md p-1.5 rounded-lg border border-yellow-500/35 shadow-xl shadow-black">
        <button
          onClick={() => {
            if (graphInstanceRef.current) {
              const cam = graphInstanceRef.current.cameraPosition();
              graphInstanceRef.current.cameraPosition(
                { x: cam.x * 0.75, y: cam.y * 0.75, z: cam.z * 0.75 },
                undefined,
                300
              );
            }
          }}
          title="Aproximar (+)"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-900 text-zinc-300 hover:text-yellow-400 transition-colors text-base font-bold font-mono"
        >
          +
        </button>
        <button
          onClick={() => {
            if (graphInstanceRef.current) {
              const cam = graphInstanceRef.current.cameraPosition();
              graphInstanceRef.current.cameraPosition(
                { x: cam.x * 1.35, y: cam.y * 1.35, z: cam.z * 1.35 },
                undefined,
                300
              );
            }
          }}
          title="Afastar (-)"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-900 text-zinc-300 hover:text-yellow-400 transition-colors text-base font-bold font-mono"
        >
          -
        </button>
        <div className="h-px bg-neutral-800 my-0.5" />
        <button
          onClick={() => graphInstanceRef.current?.zoomToFit(700, 45)}
          title="Centralizar Câmera (F)"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-900 text-zinc-300 hover:text-yellow-400 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
      </div>

      {/* Dica de navegação 2D/3D */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none hidden md:flex items-center gap-3 text-[11px] font-mono text-zinc-400 bg-black/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-yellow-500/30 shadow-lg shadow-black">
        <span className="text-yellow-400 font-bold">{dimensionMode === '2d' ? 'Modo 2D' : 'Modo 3D'}</span>
        <span>•</span>
        <span>{dimensionMode === '2d' ? 'Arraste para Pan' : 'Arraste para Girar 360°'}</span>
        <span>•</span>
        <span>Scroll: Zoom</span>
        <span>•</span>
        <span>Clique no nó: Destacar vizinhança</span>
      </div>
    </div>
  );
});

GraphViewer.displayName = 'GraphViewer';
