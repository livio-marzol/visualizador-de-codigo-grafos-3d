export type NodeType = 'file' | 'class' | 'function' | 'variable' | 'module' | 'unknown';

export type LabelMode = 'none' | 'important' | 'all';
export type DimensionMode = '3d' | '2d';

export interface DataSourceInfo {
  type: 'example' | 'imported';
  name: string;
  importedAt?: string;
  fileName?: string;
  sourceNote: string;
}

export interface RawNode {
  id: string;
  label?: string;
  type?: string;
  language?: string;
  size?: number;
  description?: string;
  filePath?: string;
  loc?: number;
  module?: string;
  group?: string;
  [key: string]: unknown;
}

export interface RawLink {
  source: string;
  target: string;
  relation?: string;
  [key: string]: unknown;
}

export interface RawGraphData {
  nodes: RawNode[];
  links: RawLink[];
}

export interface ProcessedNode {
  id: string;
  label: string;
  type: NodeType;
  rawType: string;
  language: string;
  size: number;
  radius: number;
  color: string;
  description?: string;
  filePath?: string;
  loc?: number;
  group: string; // Grupo de arquivo ou módulo para clusterização visual
  degree: number;
  inDegree: number;
  outDegree: number;
  neighbors: Set<string>;
  inbound: { sourceId: string; relation?: string }[];
  outbound: { targetId: string; relation?: string }[];
  extraMetadata: Record<string, unknown>;
  // Coordenadas calculadas pela física de forças
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  __threeObj?: any;
}

export interface ProcessedLink {
  id: string;
  source: string | ProcessedNode;
  target: string | ProcessedNode;
  relation?: string;
}

export interface ProcessedGraphData {
  nodes: ProcessedNode[];
  links: ProcessedLink[];
  groups: string[];
}

export interface NodeTypeConfig {
  type: NodeType;
  namePt: string;
  nameEn: string;
  color: string;
  glowColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
}

export const NODE_TYPE_CONFIG: Record<NodeType, NodeTypeConfig> = {
  file: {
    type: 'file',
    namePt: 'Arquivo',
    nameEn: 'File',
    color: '#3b82f6', // azul
    glowColor: 'rgba(59, 130, 246, 0.5)',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-500/40',
    badgeText: 'text-blue-400',
    description: 'Arquivos de código-fonte (.ts, .tsx, .py, etc.)'
  },
  class: {
    type: 'class',
    namePt: 'Classe',
    nameEn: 'Class',
    color: '#a855f7', // roxo
    glowColor: 'rgba(168, 85, 247, 0.5)',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-400',
    description: 'Classes e interfaces orientadas a objetos'
  },
  function: {
    type: 'function',
    namePt: 'Função',
    nameEn: 'Function',
    color: '#22c55e', // verde
    glowColor: 'rgba(34, 197, 94, 0.5)',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-400',
    description: 'Funções, métodos e hooks declarados'
  },
  variable: {
    type: 'variable',
    namePt: 'Variável',
    nameEn: 'Variable',
    color: '#f97316', // laranja
    glowColor: 'rgba(249, 115, 22, 0.5)',
    badgeBg: 'bg-orange-500/15',
    badgeBorder: 'border-orange-500/40',
    badgeText: 'text-orange-400',
    description: 'Constantes, variáveis de estado e configurações'
  },
  module: {
    type: 'module',
    namePt: 'Módulo',
    nameEn: 'Module',
    color: '#eab308', // amarelo
    glowColor: 'rgba(234, 179, 8, 0.5)',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-400',
    description: 'Módulos, pacotes e namespaces de exportação'
  },
  unknown: {
    type: 'unknown',
    namePt: 'Desconhecido',
    nameEn: 'Unknown',
    color: '#9ca3af', // cinza
    glowColor: 'rgba(156, 163, 175, 0.5)',
    badgeBg: 'bg-zinc-500/15',
    badgeBorder: 'border-zinc-500/40',
    badgeText: 'text-zinc-400',
    description: 'Entidades genéricas ou não classificadas'
  }
};

/**
 * Normaliza os tipos suportando nomes em inglês e português.
 */
export function normalizeNodeType(rawType?: string): NodeType {
  if (!rawType) return 'unknown';
  const clean = rawType.toLowerCase().trim();

  if (clean === 'file' || clean === 'arquivo' || clean.includes('file') || clean.includes('arquivo')) {
    return 'file';
  }
  if (clean === 'class' || clean === 'classe' || clean.includes('class') || clean.includes('interface')) {
    return 'class';
  }
  if (clean === 'function' || clean === 'funcao' || clean === 'função' || clean === 'method' || clean.includes('func')) {
    return 'function';
  }
  if (clean === 'variable' || clean === 'variavel' || clean === 'variável' || clean === 'const' || clean.includes('var')) {
    return 'variable';
  }
  if (clean === 'module' || clean === 'modulo' || clean === 'módulo' || clean === 'package' || clean.includes('mod')) {
    return 'module';
  }
  return 'unknown';
}

/**
 * Calcula raio visual da esfera proporcional ao size do nó.
 */
export function calculateNodeRadius(size?: number): number {
  const baseSize = size && size > 0 ? size : 25;
  const scaled = Math.cbrt(baseSize) * 2.2;
  return Math.max(3.8, Math.min(19, scaled));
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  category: 'duplicate_id' | 'missing_node' | 'invalid_relation' | 'syntax' | 'schema';
  message: string;
  details?: string[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  issues: ValidationIssue[];
  data?: RawGraphData;
}
