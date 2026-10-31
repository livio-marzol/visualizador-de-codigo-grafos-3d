# 🌐 Visualizador 3D de Código em Grafos (SourceGraph 3D)

Uma ferramenta interativa que gera e renderiza grafos tridimensionais da arquitetura de projetos de código, facilitando a visualização de conexões entre arquivos, classes, funções e dependências.

---

## ✨ Funcionalidades

- **Visualização Tridimensional (3D):** Navegação dinâmica pelo grafo do projeto.
- **Categorização por Cores:**
  - 🔵 Arquivos
  - 🟣 Classes
  - 🟢 Funções
  - 🟠 Variáveis
  - 🟡 Módulos
- **Filtros e Destaque:** Filtre elementos por tipo ou clique nos nós para destacar a vizinhança direta.
- **Suporte a JSON / Exemplos:** Carregamento de grafos personalizados via JSON ou uso de datasets de demonstração (ex: TypeScript).

---

## 🛠️ Tecnologias Utilizadas

- **TypeScript**
- **React / Vite**
- **Three.js / 3D Force Graph** (ou a biblioteca de renderização usada)
- **CSS Moderno / Tailwind**

---

## 🚀 Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/livio-marzol/visualizador-de-codigo-grafos-3d.git
cd visualizador-de-codigo-grafos-3d
