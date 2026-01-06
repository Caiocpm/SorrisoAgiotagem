import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = join(__dirname, 'clientes.json');

app.use(cors());
app.use(express.json());

// Inicializar arquivo de dados se não existir
if (!existsSync(DB_FILE)) {
  writeFileSync(DB_FILE, JSON.stringify({ clientes: [] }, null, 2));
}

// Funções auxiliares para manipular dados
const lerClientes = () => {
  const data = readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
};

const salvarClientes = (data) => {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Rotas da API

// Listar todos os clientes
app.get('/api/clientes', (req, res) => {
  const data = lerClientes();
  res.json(data.clientes);
});

// Buscar cliente por ID
app.get('/api/clientes/:id', (req, res) => {
  const data = lerClientes();
  const cliente = data.clientes.find(c => c.id === req.params.id);

  if (!cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  res.json(cliente);
});

// Criar novo cliente
app.post('/api/clientes', (req, res) => {
  const { nome, celular, endereco } = req.body;

  if (!nome || !celular) {
    return res.status(400).json({ error: 'Nome e celular são obrigatórios' });
  }

  const data = lerClientes();
  const novoCliente = {
    id: Date.now().toString(),
    nome,
    celular,
    endereco: endereco || '',
    dataCadastro: new Date().toISOString()
  };

  data.clientes.push(novoCliente);
  salvarClientes(data);

  res.status(201).json(novoCliente);
});

// Atualizar cliente
app.put('/api/clientes/:id', (req, res) => {
  const { nome, celular, endereco } = req.body;
  const data = lerClientes();
  const index = data.clientes.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  data.clientes[index] = {
    ...data.clientes[index],
    nome: nome || data.clientes[index].nome,
    celular: celular || data.clientes[index].celular,
    endereco: endereco !== undefined ? endereco : data.clientes[index].endereco
  };

  salvarClientes(data);
  res.json(data.clientes[index]);
});

// Deletar cliente
app.delete('/api/clientes/:id', (req, res) => {
  const data = lerClientes();
  const index = data.clientes.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  data.clientes.splice(index, 1);
  salvarClientes(data);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
