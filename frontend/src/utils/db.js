const DB_NAME = 'ClientesDB';
const STORE_NAME = 'clientes';
const EMPRESTIMOS_STORE = 'emprestimos';
const DB_VERSION = 2;

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject('Erro ao abrir o banco de dados');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('nome', 'nome', { unique: false });
      }

      if (!db.objectStoreNames.contains(EMPRESTIMOS_STORE)) {
        const emprestimosStore = db.createObjectStore(EMPRESTIMOS_STORE, { keyPath: 'id' });
        emprestimosStore.createIndex('clienteId', 'clienteId', { unique: false });
      }
    };
  });
};

export const adicionarCliente = async (cliente) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    const novoCliente = {
      id: Date.now().toString(),
      nome: cliente.nome,
      celular: cliente.celular,
      endereco: cliente.endereco || '',
      dataCadastro: new Date().toISOString()
    };

    const request = objectStore.add(novoCliente);

    request.onsuccess = () => {
      resolve(novoCliente);
    };

    request.onerror = () => {
      reject('Erro ao adicionar cliente');
    };
  });
};

export const listarClientes = async () => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Erro ao listar clientes');
    };
  });
};

export const excluirCliente = async (id) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject('Erro ao excluir cliente');
    };
  });
};

export const atualizarCliente = async (cliente) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(cliente);

    request.onsuccess = () => {
      resolve(cliente);
    };

    request.onerror = () => {
      reject('Erro ao atualizar cliente');
    };
  });
};

// Funções para gerenciar empréstimos
export const adicionarEmprestimo = async (emprestimo) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EMPRESTIMOS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(EMPRESTIMOS_STORE);

    const novoEmprestimo = {
      id: Date.now().toString(),
      clienteId: emprestimo.clienteId,
      valorTotal: emprestimo.valorTotal,
      numeroParcelas: emprestimo.numeroParcelas || 1,
      dataEmprestimo: emprestimo.dataEmprestimo || new Date().toISOString().split('T')[0],
      parcelas: emprestimo.parcelas || [],
      dataCriacao: new Date().toISOString()
    };

    const request = objectStore.add(novoEmprestimo);

    request.onsuccess = () => {
      resolve(novoEmprestimo);
    };

    request.onerror = () => {
      reject('Erro ao adicionar empréstimo');
    };
  });
};

export const listarEmprestimosPorCliente = async (clienteId) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EMPRESTIMOS_STORE], 'readonly');
    const objectStore = transaction.objectStore(EMPRESTIMOS_STORE);
    const index = objectStore.index('clienteId');
    const request = index.getAll(clienteId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Erro ao listar empréstimos');
    };
  });
};

export const atualizarEmprestimo = async (emprestimo) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EMPRESTIMOS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(EMPRESTIMOS_STORE);
    const request = objectStore.put(emprestimo);

    request.onsuccess = () => {
      resolve(emprestimo);
    };

    request.onerror = () => {
      reject('Erro ao atualizar empréstimo');
    };
  });
};

export const excluirEmprestimo = async (id) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EMPRESTIMOS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(EMPRESTIMOS_STORE);
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject('Erro ao excluir empréstimo');
    };
  });
};
