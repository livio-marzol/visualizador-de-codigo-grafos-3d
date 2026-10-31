import { RawGraphData } from '../types.ts';

export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  data: RawGraphData;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'fullstack-ts',
    name: 'Projeto Web TypeScript (Completo)',
    description: 'Arquitetura modular React + Node com arquivos, classes, funções e dependências.',
    data: {
      nodes: [
        // Módulos
        { id: "mod:ui", label: "@app/ui", type: "module", language: "TypeScript", size: 90, description: "Componentes visuais e layouts compartilhados" },
        { id: "mod:auth", label: "@app/auth", type: "module", language: "TypeScript", size: 110, description: "Serviços e provedores de autenticação" },
        { id: "mod:api", label: "@app/api", type: "module", language: "TypeScript", size: 85, description: "Cliente HTTP e endpoints REST" },

        // Arquivos
        { id: "src/main.tsx", label: "main.tsx", type: "file", language: "TypeScript", size: 45, description: "Ponto de entrada DOM da aplicação" },
        { id: "src/App.tsx", label: "App.tsx", type: "file", language: "TypeScript", size: 140, description: "Componente raiz com rotas e layout" },
        { id: "src/contexts/AuthContext.tsx", label: "AuthContext.tsx", type: "file", language: "TypeScript", size: 115, description: "Contexto de autenticação global e sessão" },
        { id: "src/services/UserService.ts", label: "UserService.ts", type: "file", language: "TypeScript", size: 160, description: "Lógica de negócio de usuários e permissões" },
        { id: "src/services/ApiClient.ts", label: "ApiClient.ts", type: "file", language: "TypeScript", size: 130, description: "Wrapper Axios com interceptores JWT" },
        { id: "src/controllers/UserController.ts", label: "UserController.ts", type: "file", language: "TypeScript", size: 180, description: "Controlador de rotas de usuário" },
        { id: "src/models/UserModel.ts", label: "UserModel.ts", type: "file", language: "TypeScript", size: 75, description: "Schema e validações de dados de usuário" },
        { id: "src/utils/crypto.ts", label: "crypto.ts", type: "file", language: "TypeScript", size: 60, description: "Funções utilitárias de hash e criptografia" },
        { id: "src/config/env.ts", label: "env.ts", type: "file", language: "TypeScript", size: 35, description: "Carregamento e tipagem de variáveis de ambiente" },

        // Classes
        { id: "cls:UserService", label: "class UserService", type: "class", language: "TypeScript", size: 130, description: "Gerenciador de regras de negócio de usuários" },
        { id: "cls:ApiClient", label: "class ApiClient", type: "class", language: "TypeScript", size: 110, description: "Cliente HTTP singleton" },
        { id: "cls:UserController", label: "class UserController", type: "class", language: "TypeScript", size: 140, description: "Handler de requisições HTTP" },
        { id: "cls:TokenStorage", label: "class TokenStorage", type: "class", language: "TypeScript", size: 65, description: "Armazenamento seguro de tokens no browser" },

        // Funções
        { id: "fn:renderApp", label: "renderApp()", type: "function", language: "TypeScript", size: 30, description: "Inicializa o React Root" },
        { id: "fn:useAuth", label: "useAuth()", type: "function", language: "TypeScript", size: 40, description: "Hook para consumir estado do AuthContext" },
        { id: "fn:loginWithEmail", label: "loginWithEmail()", type: "function", language: "TypeScript", size: 55, description: "Autentica usuário via e-mail e senha" },
        { id: "fn:hashPassword", label: "hashPassword()", type: "function", language: "TypeScript", size: 35, description: "Gera hash bcrypt com salt" },
        { id: "fn:verifyJwtToken", label: "verifyJwtToken()", type: "function", language: "TypeScript", size: 45, description: "Valida assinatura e expiração de token JWT" },
        { id: "fn:fetchUserProfile", label: "fetchUserProfile()", type: "function", language: "TypeScript", size: 50, description: "Busca dados do perfil autenticado" },
        { id: "fn:updatePreferences", label: "updatePreferences()", type: "function", language: "TypeScript", size: 40, description: "Atualiza preferências no banco de dados" },
        { id: "fn:handleRequest", label: "handleRequest()", type: "function", language: "TypeScript", size: 50, description: "Middleware de roteamento e validação" },

        // Variáveis
        { id: "var:API_BASE_URL", label: "API_BASE_URL", type: "variable", language: "TypeScript", size: 25, description: "URL base da API v1" },
        { id: "var:JWT_SECRET_KEY", label: "JWT_SECRET_KEY", type: "variable", language: "TypeScript", size: 25, description: "Chave secreta para assinatura de tokens" },
        { id: "var:DEFAULT_AVATAR", label: "DEFAULT_AVATAR", type: "variable", language: "TypeScript", size: 20, description: "URL de avatar padrão do usuário" },
        { id: "var:TOKEN_KEY", label: "TOKEN_KEY", type: "variable", language: "TypeScript", size: 20, description: "Chave de armazenamento local de credenciais" }
      ],
      links: [
        { source: "src/main.tsx", target: "fn:renderApp", relation: "executa" },
        { source: "src/main.tsx", target: "src/App.tsx", relation: "renderiza" },
        { source: "src/App.tsx", target: "src/contexts/AuthContext.tsx", relation: "prove_contexto" },
        { source: "src/App.tsx", target: "mod:ui", relation: "utiliza_layout" },
        { source: "src/contexts/AuthContext.tsx", target: "fn:useAuth", relation: "define_hook" },
        { source: "src/contexts/AuthContext.tsx", target: "cls:UserService", relation: "instancia" },
        { source: "src/contexts/AuthContext.tsx", target: "cls:TokenStorage", relation: "armazena_token" },
        { source: "cls:TokenStorage", target: "var:TOKEN_KEY", relation: "usa_constante" },

        { source: "src/services/UserService.ts", target: "cls:UserService", relation: "define_classe" },
        { source: "cls:UserService", target: "cls:ApiClient", relation: "depende_de" },
        { source: "cls:UserService", target: "fn:loginWithEmail", relation: "implementa_metodo" },
        { source: "cls:UserService", target: "fn:fetchUserProfile", relation: "implementa_metodo" },
        { source: "cls:UserService", target: "src/models/UserModel.ts", relation: "valida_com" },

        { source: "fn:loginWithEmail", target: "fn:verifyJwtToken", relation: "chama" },
        { source: "fn:loginWithEmail", target: "fn:hashPassword", relation: "compara_senha" },
        { source: "fn:hashPassword", target: "src/utils/crypto.ts", relation: "localizado_em" },
        { source: "fn:verifyJwtToken", target: "var:JWT_SECRET_KEY", relation: "acessa_segredo" },

        { source: "src/controllers/UserController.ts", target: "cls:UserController", relation: "define_classe" },
        { source: "cls:UserController", target: "cls:UserService", relation: "injeta_servico" },
        { source: "cls:UserController", target: "fn:handleRequest", relation: "roteia_para" },
        { source: "fn:handleRequest", target: "fn:updatePreferences", relation: "delega_execucao" },

        { source: "src/services/ApiClient.ts", target: "cls:ApiClient", relation: "define_classe" },
        { source: "cls:ApiClient", target: "var:API_BASE_URL", relation: "configura_base" },
        { source: "src/config/env.ts", target: "var:API_BASE_URL", relation: "exporta" },
        { source: "src/config/env.ts", target: "var:JWT_SECRET_KEY", relation: "exporta" },

        { source: "mod:auth", target: "src/contexts/AuthContext.tsx", relation: "engloba" },
        { source: "mod:auth", target: "src/services/UserService.ts", relation: "engloba" },
        { source: "mod:api", target: "src/services/ApiClient.ts", relation: "engloba" },
        { source: "src/models/UserModel.ts", target: "var:DEFAULT_AVATAR", relation: "valor_padrao" }
      ]
    }
  },
  {
    id: 'compiler-ast',
    name: 'Compilador & AST (Estrutura de Análise)',
    description: 'Pipeline de compilação: Lexer, Parser, Nós da AST, Gerador de Código e Tabelas de Símbolos.',
    data: {
      nodes: [
        { id: "mod:frontend", label: "compiler.frontend", type: "module", language: "Rust/C++", size: 100, description: "Etapa de análise léxica e sintática" },
        { id: "mod:backend", label: "compiler.backend", type: "module", language: "Rust/C++", size: 95, description: "Otimizações de IR e geração de código de máquina" },

        { id: "file:Lexer.ts", label: "Lexer.ts", type: "file", language: "TypeScript", size: 120, description: "Scanner de caracteres e produção de tokens" },
        { id: "file:Parser.ts", label: "Parser.ts", type: "file", language: "TypeScript", size: 210, description: "Analisador sintático descendente recursivo" },
        { id: "file:AST.ts", label: "AST.ts", type: "file", language: "TypeScript", size: 140, description: "Definição de nós da árvore sintática abstrata" },
        { id: "file:SymbolTable.ts", label: "SymbolTable.ts", type: "file", language: "TypeScript", size: 90, description: "Escopos léxicos e resolução de tipos" },
        { id: "file:CodeGen.ts", label: "CodeGen.ts", type: "file", language: "TypeScript", size: 180, description: "Emissão de bytecode ou LLVM IR" },

        { id: "cls:Lexer", label: "class Lexer", type: "class", language: "TypeScript", size: 110, description: "Controla cursor no código-fonte" },
        { id: "cls:Parser", label: "class Parser", type: "class", language: "TypeScript", size: 160, description: "Gera nós AST a partir do fluxo de tokens" },
        { id: "cls:ASTNode", label: "class ASTNode", type: "class", language: "TypeScript", size: 90, description: "Classe base para nós da árvore sintática" },
        { id: "cls:BinaryExpr", label: "class BinaryExpr", type: "class", language: "TypeScript", size: 75, description: "Expressões binárias (+, -, *, /)" },
        { id: "cls:SymbolTable", label: "class SymbolTable", type: "class", language: "TypeScript", size: 85, description: "Tabela hash hierárquica de escopos" },
        { id: "cls:CodeEmitter", label: "class CodeEmitter", type: "class", language: "TypeScript", size: 130, description: "Buffer de instruções de máquina" },

        { id: "fn:nextToken", label: "nextToken()", type: "function", language: "TypeScript", size: 40, description: "Consome próximo token reconhecido" },
        { id: "fn:parseExpression", label: "parseExpression()", type: "function", language: "TypeScript", size: 65, description: "Aplica regras de precedência de operadores" },
        { id: "fn:parseStatement", label: "parseStatement()", type: "function", language: "TypeScript", size: 55, description: "Processa declarações, loops e condicionais" },
        { id: "fn:typeCheck", label: "typeCheck()", type: "function", language: "TypeScript", size: 60, description: "Valida compatibilidade de tipos estáticos" },
        { id: "fn:emitBytecode", label: "emitBytecode()", type: "function", language: "TypeScript", size: 70, description: "Traduz nó AST em opcodes" },

        { id: "var:KEYWORDS_MAP", label: "KEYWORDS_MAP", type: "variable", language: "TypeScript", size: 30, description: "Mapa de palavras reservadas do idioma" },
        { id: "var:MAX_SCOPE_DEPTH", label: "MAX_SCOPE_DEPTH", type: "variable", language: "TypeScript", size: 15, description: "Limite de recursão de escopo léxico" }
      ],
      links: [
        { source: "mod:frontend", target: "file:Lexer.ts", relation: "contem" },
        { source: "mod:frontend", target: "file:Parser.ts", relation: "contem" },
        { source: "mod:backend", target: "file:CodeGen.ts", relation: "contem" },

        { source: "file:Lexer.ts", target: "cls:Lexer", relation: "declara" },
        { source: "cls:Lexer", target: "fn:nextToken", relation: "metodo" },
        { source: "cls:Lexer", target: "var:KEYWORDS_MAP", relation: "consulta" },

        { source: "file:Parser.ts", target: "cls:Parser", relation: "declara" },
        { source: "cls:Parser", target: "cls:Lexer", relation: "alimentado_por" },
        { source: "cls:Parser", target: "fn:parseStatement", relation: "chama" },
        { source: "cls:Parser", target: "fn:parseExpression", relation: "chama" },

        { source: "fn:parseExpression", target: "cls:BinaryExpr", relation: "cria_instancia" },
        { source: "cls:BinaryExpr", target: "cls:ASTNode", relation: "herda_de" },
        { source: "file:AST.ts", target: "cls:ASTNode", relation: "declara" },

        { source: "file:SymbolTable.ts", target: "cls:SymbolTable", relation: "declara" },
        { source: "cls:SymbolTable", target: "var:MAX_SCOPE_DEPTH", relation: "limite" },
        { source: "cls:Parser", target: "cls:SymbolTable", relation: "popula_tabela" },
        { source: "cls:Parser", target: "fn:typeCheck", relation: "valida_semantica" },
        { source: "fn:typeCheck", target: "cls:SymbolTable", relation: "busca_simbolo" },

        { source: "file:CodeGen.ts", target: "cls:CodeEmitter", relation: "declara" },
        { source: "cls:CodeEmitter", target: "fn:emitBytecode", relation: "metodo" },
        { source: "fn:emitBytecode", target: "cls:ASTNode", relation: "percorre_arvore" }
      ]
    }
  },
  {
    id: 'microservices',
    name: 'Microsserviços de E-Commerce',
    description: 'Serviços distribuídos: Catálogo, Pedidos, Pagamento, Autenticação e Cache.',
    data: {
      nodes: [
        { id: "mod:gateway", label: "API Gateway", type: "module", language: "Go", size: 140, description: "Roteamento reverso e rate limiting" },
        { id: "mod:order_svc", label: "Order Service", type: "module", language: "Kotlin", size: 120, description: "Processamento de pedidos e checkout" },
        { id: "mod:pay_svc", label: "Payment Service", type: "module", language: "TypeScript", size: 130, description: "Integração Stripe e conciliação financeira" },
        { id: "mod:inventory_svc", label: "Inventory Service", type: "module", language: "Python", size: 95, description: "Controle de estoque em tempo real" },

        { id: "file:routes.go", label: "routes.go", type: "file", language: "Go", size: 80, description: "Definição de rotas do Gateway" },
        { id: "file:OrderController.kt", label: "OrderController.kt", type: "file", language: "Kotlin", size: 110, description: "Endpoints REST de pedidos" },
        { id: "file:StripeClient.ts", label: "StripeClient.ts", type: "file", language: "TypeScript", size: 90, description: "SDK de pagamentos" },
        { id: "file:stock_manager.py", label: "stock_manager.py", type: "file", language: "Python", size: 75, description: "Gestão de concorrência de estoque" },

        { id: "cls:PaymentGateway", label: "class PaymentGateway", type: "class", language: "TypeScript", size: 105, description: "Adaptador de provedores de pagamento" },
        { id: "cls:OrderRepository", label: "class OrderRepository", type: "class", language: "Kotlin", size: 95, description: "Acesso a dados PostgreSQL" },
        { id: "cls:StockMutex", label: "class StockMutex", type: "class", language: "Python", size: 60, description: "Lock distribuído via Redis" },

        { id: "fn:routeToService", label: "routeToService()", type: "function", language: "Go", size: 45, description: "Encaminha pacote com tracing distribuído" },
        { id: "fn:createOrder", label: "createOrder()", type: "function", language: "Kotlin", size: 65, description: "Inicia saga de pedido" },
        { id: "fn:chargeCreditCard", label: "chargeCreditCard()", type: "function", language: "TypeScript", size: 70, description: "Executa transação com token seguro" },
        { id: "fn:reserveInventory", label: "reserveInventory()", type: "function", language: "Python", size: 50, description: "Deduz quantidade com lock atômico" },

        { id: "var:KAFKA_BROKER_URL", label: "KAFKA_BROKER_URL", type: "variable", language: "Config", size: 20, description: "Barramento de eventos distribuídos" },
        { id: "var:REDIS_PORT", label: "REDIS_PORT", type: "variable", language: "Config", size: 15, description: "Porta do cluster Redis" }
      ],
      links: [
        { source: "mod:gateway", target: "file:routes.go", relation: "define" },
        { source: "file:routes.go", target: "fn:routeToService", relation: "executa" },
        { source: "fn:routeToService", target: "mod:order_svc", relation: "despacha" },

        { source: "mod:order_svc", target: "file:OrderController.kt", relation: "contem" },
        { source: "file:OrderController.kt", target: "fn:createOrder", relation: "chama" },
        { source: "fn:createOrder", target: "cls:OrderRepository", relation: "persiste" },
        { source: "fn:createOrder", target: "mod:pay_svc", relation: "saga_evento" },
        { source: "fn:createOrder", target: "mod:inventory_svc", relation: "requisita_reserva" },

        { source: "mod:pay_svc", target: "file:StripeClient.ts", relation: "contem" },
        { source: "file:StripeClient.ts", target: "cls:PaymentGateway", relation: "implementa" },
        { source: "cls:PaymentGateway", target: "fn:chargeCreditCard", relation: "metodo" },

        { source: "mod:inventory_svc", target: "file:stock_manager.py", relation: "contem" },
        { source: "file:stock_manager.py", target: "fn:reserveInventory", relation: "metodo" },
        { source: "fn:reserveInventory", target: "cls:StockMutex", relation: "sincroniza_com" },
        { source: "cls:StockMutex", target: "var:REDIS_PORT", relation: "conecta" },

        { source: "mod:order_svc", target: "var:KAFKA_BROKER_URL", relation: "publica_topico" },
        { source: "mod:pay_svc", target: "var:KAFKA_BROKER_URL", relation: "consome_topico" }
      ]
    }
  }
];

export const DEFAULT_RAW_GRAPH: RawGraphData = SAMPLE_PRESETS[0].data;
