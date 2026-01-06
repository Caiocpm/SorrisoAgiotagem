# Carteira de Clientes - Sistema de Empréstimos

Sistema web para gerenciar carteira de clientes de empréstimos, desenvolvido com React e IndexedDB.

## Funcionalidades

- Cadastro de clientes com nome, celular e endereço
- Listagem de clientes cadastrados
- Filtro de busca por nome
- Exclusão de clientes
- Interface com abas para fácil navegação
- Armazenamento local no navegador (IndexedDB)
- Deploy automático no GitHub Pages

## Tecnologias Utilizadas

- React 18
- Vite
- IndexedDB (armazenamento local)
- CSS puro
- GitHub Actions (CI/CD)

## Como Executar Localmente

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Executar em Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

### 3. Build para Produção

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `frontend/dist`

## Deploy no GitHub Pages

### Configuração Inicial

1. Crie um repositório no GitHub chamado `Agiotagem-Co`
2. Configure o GitHub Pages:
   - Vá em Settings > Pages
   - Em "Source", selecione "GitHub Actions"

### Deploy Automático

O projeto já está configurado com GitHub Actions. Para fazer o deploy:

1. Faça commit das alterações:
```bash
git add .
git commit -m "Initial commit"
```

2. Crie o repositório remoto e faça push:
```bash
git remote add origin https://github.com/SEU_USUARIO/Agiotagem-Co.git
git branch -M main
git push -u origin main
```

3. O deploy será feito automaticamente e o site estará disponível em:
   `https://SEU_USUARIO.github.io/Agiotagem-Co/`

### Importante sobre o base path

Se você usar um nome de repositório diferente de `Agiotagem-Co`, atualize o arquivo [frontend/vite.config.js](frontend/vite.config.js):

```js
base: '/NOME-DO-SEU-REPOSITORIO/',
```

## Estrutura do Projeto

```
Agiotagem&Co/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Configuração do GitHub Actions
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CadastroCliente.jsx  # Formulário de cadastro
    │   │   └── ListaClientes.jsx    # Lista com filtro
    │   ├── utils/
    │   │   └── db.js               # Funções para IndexedDB
    │   ├── App.jsx                 # Componente principal com abas
    │   ├── main.jsx                # Ponto de entrada
    │   └── index.css               # Estilos globais
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Armazenamento de Dados

Os dados são armazenados localmente no navegador usando IndexedDB:
- Não requer servidor backend
- Dados persistem entre sessões
- Cada navegador/dispositivo tem seus próprios dados
- Para limpar os dados: abra DevTools > Application > IndexedDB > ClientesDB

## Dados do Cliente

Cada cliente possui:
- Nome (obrigatório)
- Celular (obrigatório)
- Endereço (opcional)
- ID único (gerado automaticamente)
- Data de cadastro (gerada automaticamente)

## Funções do IndexedDB

O arquivo [frontend/src/utils/db.js](frontend/src/utils/db.js) contém:

- `initDB()` - Inicializa o banco de dados
- `adicionarCliente(cliente)` - Adiciona novo cliente
- `listarClientes()` - Lista todos os clientes
- `excluirCliente(id)` - Remove um cliente
- `atualizarCliente(cliente)` - Atualiza dados do cliente
