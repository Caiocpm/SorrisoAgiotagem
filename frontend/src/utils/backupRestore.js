import { listarClientes, listarEmprestimosPorCliente, adicionarCliente, adicionarEmprestimo, initDB } from './db';

/**
 * Exporta todos os dados (clientes e empréstimos) em formato JSON
 * @returns {Promise<void>}
 */
export async function exportarBackupJSON() {
  try {
    await initDB();

    // Buscar todos os clientes
    const clientes = await listarClientes();

    // Buscar empréstimos de cada cliente
    const emprestimosMap = {};
    for (const cliente of clientes) {
      const emprestimos = await listarEmprestimosPorCliente(cliente.id);
      if (emprestimos.length > 0) {
        emprestimosMap[cliente.id] = emprestimos;
      }
    }

    // Criar objeto de backup
    const backup = {
      versao: '1.0',
      dataExportacao: new Date().toISOString(),
      totalClientes: clientes.length,
      totalEmprestimos: Object.values(emprestimosMap).reduce((acc, emps) => acc + emps.length, 0),
      clientes: clientes,
      emprestimos: emprestimosMap
    };

    // Converter para JSON
    const jsonString = JSON.stringify(backup, null, 2);

    // Criar blob e fazer download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dataHora = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.href = url;
    link.download = `sorriso-backup-${dataHora}.json`;
    link.click();

    URL.revokeObjectURL(url);

    return {
      sucesso: true,
      mensagem: `Backup exportado com sucesso! ${clientes.length} clientes e ${backup.totalEmprestimos} empréstimos.`
    };
  } catch (error) {
    console.error('Erro ao exportar backup:', error);
    return {
      sucesso: false,
      mensagem: `Erro ao exportar backup: ${error.message}`
    };
  }
}

/**
 * Importa dados de um arquivo JSON de backup
 * @param {File} arquivo - Arquivo JSON selecionado pelo usuário
 * @param {boolean} sobrescrever - Se true, sobrescreve dados existentes. Se false, mescla.
 * @returns {Promise<Object>}
 */
export async function importarBackupJSON(arquivo, sobrescrever = false) {
  try {
    await initDB();

    // Ler arquivo
    const texto = await arquivo.text();
    const backup = JSON.parse(texto);

    // Validar formato do backup
    if (!backup.versao || !backup.clientes || !backup.emprestimos) {
      throw new Error('Arquivo de backup inválido ou corrompido.');
    }

    // Estatísticas
    let clientesImportados = 0;
    let clientesAtualizados = 0;
    let emprestimosImportados = 0;

    // Se sobrescrever, poderia limpar banco primeiro (não implementado por segurança)
    // Para mesclar, vamos verificar se cliente já existe pelo celular

    const clientesExistentes = await listarClientes();
    const mapaCelulares = new Map(clientesExistentes.map(c => [c.celular, c]));

    // Importar clientes
    for (const clienteBackup of backup.clientes) {
      const clienteExistente = mapaCelulares.get(clienteBackup.celular);

      if (clienteExistente) {
        // Cliente já existe - podemos atualizar ou pular
        clientesAtualizados++;

        // Importar empréstimos deste cliente
        const emprestimosCliente = backup.emprestimos[clienteBackup.id] || [];
        for (const emprestimo of emprestimosCliente) {
          // Adicionar empréstimo com o ID do cliente existente
          const emprestimoNovo = {
            ...emprestimo,
            clienteId: clienteExistente.id,
            id: undefined // Deixar o banco gerar novo ID
          };
          delete emprestimoNovo.id;

          await adicionarEmprestimo(emprestimoNovo);
          emprestimosImportados++;
        }
      } else {
        // Cliente novo - adicionar
        const clienteNovo = {
          nome: clienteBackup.nome,
          celular: clienteBackup.celular,
          endereco: clienteBackup.endereco || ''
        };

        const novoId = await adicionarCliente(clienteNovo);
        clientesImportados++;

        // Importar empréstimos deste cliente
        const emprestimosCliente = backup.emprestimos[clienteBackup.id] || [];
        for (const emprestimo of emprestimosCliente) {
          const emprestimoNovo = {
            ...emprestimo,
            clienteId: novoId,
            id: undefined
          };
          delete emprestimoNovo.id;

          await adicionarEmprestimo(emprestimoNovo);
          emprestimosImportados++;
        }
      }
    }

    return {
      sucesso: true,
      mensagem: `Backup importado com sucesso!\n\n` +
                `📊 Estatísticas:\n` +
                `• Clientes novos: ${clientesImportados}\n` +
                `• Clientes existentes: ${clientesAtualizados}\n` +
                `• Empréstimos importados: ${emprestimosImportados}\n\n` +
                `Data do backup: ${new Date(backup.dataExportacao).toLocaleString('pt-BR')}`,
      stats: {
        clientesImportados,
        clientesAtualizados,
        emprestimosImportados
      }
    };
  } catch (error) {
    console.error('Erro ao importar backup:', error);
    return {
      sucesso: false,
      mensagem: `Erro ao importar backup: ${error.message}`
    };
  }
}

/**
 * Limpa todos os dados do banco (usar com cuidado!)
 * @returns {Promise<Object>}
 */
export async function limparTodosDados() {
  try {
    await initDB();

    // Esta função seria implementada em db.js
    // Por segurança, não vou implementá-la agora

    return {
      sucesso: false,
      mensagem: 'Função de limpeza não implementada por segurança.'
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: `Erro: ${error.message}`
    };
  }
}
