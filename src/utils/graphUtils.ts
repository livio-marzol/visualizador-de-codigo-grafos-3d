import {
  RawGraphData,
  RawNode,
  RawLink,
  ProcessedGraphData,
  ProcessedNode,
  ProcessedLink,
  ValidationResult,
  ValidationIssue,
  normalizeNodeType,
  calculateNodeRadius,
  NODE_TYPE_CONFIG
} from '../types.ts';

/**
 * Validação profunda do JSON do grafo, reportando:
 * - IDs duplicados
 * - Nós ausentes referenciados em links
 * - Relações inválidas (links órfãos, loops reflexivos desnecessários)
 * - Erros estruturais de esquema
 */
export function validateGraphJson(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!input || typeof input !== 'object') {
    return {
      valid: false,
      error: 'O JSON deve ser um objeto contendo os campos "nodes" e "links".',
      issues: [{
        type: 'error',
        category: 'schema',
        message: 'Estrutura raiz inválida: esperado objeto JSON { nodes: [], links: [] }.'
      }]
    };
  }

  const obj = input as Record<string, unknown>;

  if (!Array.isArray(obj.nodes)) {
    return {
      valid: false,
      error: 'O campo "nodes" é obrigatório e deve ser um array.',
      issues: [{
        type: 'error',
        category: 'schema',
        message: 'O campo "nodes" é obrigatório e precisa ser uma lista de nós.'
      }]
    };
  }

  if (obj.links !== undefined && !Array.isArray(obj.links)) {
    return {
      valid: false,
      error: 'O campo "links" deve ser um array.',
      issues: [{
        type: 'error',
        category: 'schema',
        message: 'O campo "links" deve ser uma lista de arestas.'
      }]
    };
  }

  const nodes: RawNode[] = [];
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];

  for (let i = 0; i < obj.nodes.length; i++) {
    const n = obj.nodes[i];
    if (!n || typeof n !== 'object') {
      issues.push({
        type: 'error',
        category: 'schema',
        message: `Nó na posição [${i}] é inválido ou nulo.`
      });
      continue;
    }

    const nodeObj = n as Record<string, unknown>;
    const rawId = nodeObj.id;

    if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
      issues.push({
        type: 'error',
        category: 'schema',
        message: `Nó na posição [${i}] não possui o campo identificador obrigatório "id".`
      });
      continue;
    }

    const id = String(rawId).trim();

    if (seenIds.has(id)) {
      duplicateIds.push(id);
      issues.push({
        type: 'warning',
        category: 'duplicate_id',
        message: `ID duplicado detectado: "${id}" (ocorrência na posição [${i}] ignorada).`
      });
      continue;
    }
    seenIds.add(id);

    // Coleta propriedades padrão e extras
    const standardKeys = new Set(['id', 'label', 'type', 'language', 'size', 'description', 'filePath', 'loc', 'group', 'module']);
    const extra: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(nodeObj)) {
      if (!standardKeys.has(key)) {
        extra[key] = val;
      }
    }

    nodes.push({
      ...nodeObj,
      id,
      label: nodeObj.label ? String(nodeObj.label) : id,
      type: nodeObj.type ? String(nodeObj.type) : 'unknown',
      language: nodeObj.language ? String(nodeObj.language) : undefined,
      size: typeof nodeObj.size === 'number' && !isNaN(nodeObj.size) ? nodeObj.size : 30,
      description: nodeObj.description ? String(nodeObj.description) : undefined,
      filePath: nodeObj.filePath ? String(nodeObj.filePath) : undefined,
      loc: typeof nodeObj.loc === 'number' ? nodeObj.loc : undefined,
      group: nodeObj.group ? String(nodeObj.group) : (nodeObj.module ? String(nodeObj.module) : undefined),
      ...extra
    });
  }

  if (nodes.length === 0) {
    return {
      valid: false,
      error: 'O grafo deve conter pelo menos um nó válido.',
      issues: [{
        type: 'error',
        category: 'schema',
        message: 'Nenhum nó válido foi encontrado no array "nodes".'
      }]
    };
  }

  const rawLinks = Array.isArray(obj.links) ? obj.links : [];
  const validLinks: RawLink[] = [];
  const missingNodeIds = new Set<string>();
  const invalidRelations: string[] = [];

  for (let i = 0; i < rawLinks.length; i++) {
    const l = rawLinks[i];
    if (!l || typeof l !== 'object') {
      issues.push({
        type: 'warning',
        category: 'invalid_relation',
        message: `Aresta na posição [${i}] não é um objeto válido.`
      });
      continue;
    }

    const linkObj = l as Record<string, unknown>;
    const source = typeof linkObj.source === 'object' && linkObj.source !== null
      ? String((linkObj.source as any).id ?? '')
      : String(linkObj.source ?? '');
    const target = typeof linkObj.target === 'object' && linkObj.target !== null
      ? String((linkObj.target as any).id ?? '')
      : String(linkObj.target ?? '');

    const sourceTrimmed = source.trim();
    const targetTrimmed = target.trim();

    if (!sourceTrimmed || !targetTrimmed) {
      issues.push({
        type: 'warning',
        category: 'invalid_relation',
        message: `Aresta na posição [${i}] tem source ou target vazio.`
      });
      continue;
    }

    let hasError = false;
    if (!seenIds.has(sourceTrimmed)) {
      missingNodeIds.add(sourceTrimmed);
      hasError = true;
    }
    if (!seenIds.has(targetTrimmed)) {
      missingNodeIds.add(targetTrimmed);
      hasError = true;
    }

    if (hasError) {
      continue;
    }

    if (sourceTrimmed === targetTrimmed) {
      invalidRelations.push(`Auto-referência reflexiva detectada no nó "${sourceTrimmed}".`);
      issues.push({
        type: 'warning',
        category: 'invalid_relation',
        message: `Aresta aponta para o próprio nó (auto-referência): "${sourceTrimmed}" -> "${targetTrimmed}".`
      });
      // Permite ou ignora dependendo da necessidade, mas preserva no grafo
    }

    validLinks.push({
      ...linkObj,
      source: sourceTrimmed,
      target: targetTrimmed,
      relation: linkObj.relation ? String(linkObj.relation).trim() : 'relaciona'
    });
  }

  if (missingNodeIds.size > 0) {
    const missingArr = Array.from(missingNodeIds);
    issues.push({
      type: 'warning',
      category: 'missing_node',
      message: `${missingArr.length} nó(s) referenciado(s) em arestas não estão declarados em "nodes": ${missingArr.slice(0, 5).map(id => `"${id}"`).join(', ')}${missingArr.length > 5 ? ` (+${missingArr.length - 5} outros)` : ''}.`,
      details: missingArr
    });
  }

  const fatalErrors = issues.filter(iss => iss.type === 'error');

  return {
    valid: fatalErrors.length === 0,
    error: fatalErrors.length > 0 ? fatalErrors[0].message : undefined,
    issues,
    data: {
      nodes,
      links: validLinks
    }
  };
}

/**
 * Dedução inteligente do grupo / cluster visual do nó:
 * Agrupa nós por arquivo pai, módulo ou prefixo de pacote.
 */
function inferNodeGroup(raw: RawNode, rawLinks: RawLink[]): string {
  // 1. Se explicitamente definido no nó
  if (raw.group) return String(raw.group);
  if (raw.module) return String(raw.module);
  if (raw.filePath) {
    // Normaliza nome do arquivo
    return raw.filePath;
  }

  // 2. Se o nó é um arquivo ou módulo por si só
  const normType = normalizeNodeType(raw.type);
  if (normType === 'file' || normType === 'module') {
    return raw.id;
  }

  // 3. Se o ID contém prefixo de caminho (ex: src/services/UserService.ts:login)
  if (raw.id.includes('/') || raw.id.includes('\\')) {
    const parts = raw.id.split(/[:#]/);
    if (parts[0]) return parts[0];
  }

  // 4. Inspeciona links para verificar se o nó pertence/é definido por um arquivo ou módulo
  for (const l of rawLinks) {
    if (l.target === raw.id && (l.relation?.includes('define') || l.relation?.includes('contem') || l.relation?.includes('declara'))) {
      return l.source;
    }
    if (l.source === raw.id && (l.relation?.includes('localizado') || l.relation?.includes('membro'))) {
      return l.target;
    }
  }

  // 5. Fallback por tipo
  return `type:${normType}`;
}

/**
 * Processa nós e conexões calculando graus, vizinhança e agrupamento visual.
 */
export function processGraphData(rawData: RawGraphData): ProcessedGraphData {
  const nodeMap = new Map<string, ProcessedNode>();
  const groupsSet = new Set<string>();

  // Primeiro passo: inicializar nós processados
  for (const raw of rawData.nodes) {
    const normalizedType = normalizeNodeType(raw.type);
    const typeConfig = NODE_TYPE_CONFIG[normalizedType];
    const size = raw.size && raw.size > 0 ? raw.size : 30;
    const group = inferNodeGroup(raw, rawData.links);
    groupsSet.add(group);

    // Separar metadados adicionais
    const standardKeys = new Set([
      'id', 'label', 'type', 'language', 'size', 'description', 'filePath',
      'loc', 'group', 'module', 'degree', 'inDegree', 'outDegree', 'neighbors',
      'inbound', 'outbound', 'x', 'y', 'z', 'vx', 'vy', 'vz'
    ]);
    const extraMetadata: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(raw)) {
      if (!standardKeys.has(key) && val !== undefined) {
        extraMetadata[key] = val;
      }
    }

    const processed: ProcessedNode = {
      id: raw.id,
      label: raw.label || raw.id,
      type: normalizedType,
      rawType: raw.type || normalizedType,
      language: raw.language || 'Geral',
      size,
      radius: calculateNodeRadius(size),
      color: typeConfig.color,
      description: raw.description,
      filePath: raw.filePath,
      loc: raw.loc,
      group,
      degree: 0,
      inDegree: 0,
      outDegree: 0,
      neighbors: new Set<string>(),
      inbound: [],
      outbound: [],
      extraMetadata
    };

    nodeMap.set(raw.id, processed);
  }

  const processedLinks: ProcessedLink[] = [];

  // Segundo passo: vincular arestas e calcular métricas
  for (let i = 0; i < rawData.links.length; i++) {
    const link = rawData.links[i];
    const sourceNode = nodeMap.get(link.source);
    const targetNode = nodeMap.get(link.target);

    if (sourceNode && targetNode) {
      sourceNode.outDegree++;
      sourceNode.degree++;
      sourceNode.neighbors.add(targetNode.id);
      sourceNode.outbound.push({ targetId: targetNode.id, relation: link.relation });

      targetNode.inDegree++;
      targetNode.degree++;
      targetNode.neighbors.add(sourceNode.id);
      targetNode.inbound.push({ sourceId: sourceNode.id, relation: link.relation });

      processedLinks.push({
        id: `link-${i}-${sourceNode.id}->${targetNode.id}`,
        source: sourceNode.id,
        target: targetNode.id,
        relation: link.relation || 'relaciona'
      });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links: processedLinks,
    groups: Array.from(groupsSet)
  };
}
