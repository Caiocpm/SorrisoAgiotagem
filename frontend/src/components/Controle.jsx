import { useState, useEffect } from "react";
import {
  listarClientes,
  initDB,
  listarEmprestimosPorCliente,
} from "../utils/db";
import {
  calcularJurosParcela,
  calcularResumoEmprestimo,
  formatarMoeda,
  formatarData,
} from "../utils/calculos";
import { exportarBackupJSON, importarBackupJSON } from "../utils/backupRestore";

function Controle() {
  const [resumoClientes, setResumoClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("atrasados"); // atrasados, ativos
  const [emprestimosMap, setEmprestimosMap] = useState({});
  const [todosClientes, setTodosClientes] = useState([]);
  const [expandidos, setExpandidos] = useState({});

  const carregarResumo = async () => {
    try {
      await initDB();
      const clientes = await listarClientes();
      setTodosClientes(clientes);

      const resumo = [];
      const emprestimosData = {};

      for (const cliente of clientes) {
        const emprestimos = await listarEmprestimosPorCliente(cliente.id);
        emprestimosData[cliente.id] = emprestimos;

        // Filtrar apenas empréstimos com parcelas em aberto
        const emprestimosAtivos = emprestimos.filter((emp) => {
          const resumoEmp = calcularResumoEmprestimo(emp);
          return resumoEmp.status !== "pago";
        });

        if (emprestimosAtivos.length > 0) {
          // Calcular estatísticas do cliente
          let totalDevedor = 0;
          let totalOriginal = 0;
          let maiorAtraso = 0;
          let temAtrasado = false;

          emprestimosAtivos.forEach((emp) => {
            const resumoEmp = calcularResumoEmprestimo(emp);
            totalDevedor += resumoEmp.saldoDevedor;
            totalOriginal += resumoEmp.valorOriginal;

            if (resumoEmp.status === "atrasado") {
              temAtrasado = true;
            }

            // Verificar maior atraso nas parcelas
            emp.parcelas.forEach((parcela) => {
              const calcParcela = calcularJurosParcela(parcela);
              if (calcParcela.diasAtraso > maiorAtraso) {
                maiorAtraso = calcParcela.diasAtraso;
              }
            });
          });

          resumo.push({
            clienteId: cliente.id,
            clienteNome: cliente.nome,
            clienteCelular: cliente.celular,
            totalEmprestimos: emprestimosAtivos.length,
            totalOriginal,
            totalDevedor,
            maiorAtraso,
            status: temAtrasado ? "atrasado" : "ativo",
            emprestimos: emprestimosAtivos,
          });
        }
      }

      // Ordenar por maior atraso primeiro, depois por total devedor
      resumo.sort((a, b) => {
        if (b.maiorAtraso !== a.maiorAtraso) {
          return b.maiorAtraso - a.maiorAtraso;
        }
        return b.totalDevedor - a.totalDevedor;
      });

      setResumoClientes(resumo);
      setEmprestimosMap(emprestimosData);
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao carregar resumo:", error);
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarResumo();
  }, []);

  const toggleExpandir = (clienteId) => {
    setExpandidos((prev) => ({
      ...prev,
      [clienteId]: !prev[clienteId],
    }));
  };

  const handleExportarBackup = async () => {
    const resultado = await exportarBackupJSON();
    if (resultado.sucesso) {
      alert(resultado.mensagem);
    } else {
      alert('Erro ao exportar backup:\n' + resultado.mensagem);
    }
  };

  const handleImportarBackup = async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    if (!arquivo.name.endsWith('.json')) {
      alert('Por favor, selecione um arquivo JSON válido.');
      return;
    }

    const confirmar = window.confirm(
      'Importar backup?\n\n' +
      '⚠️ IMPORTANTE:\n' +
      '• Clientes com mesmo celular serão mesclados\n' +
      '• Novos empréstimos serão adicionados\n' +
      '• Dados existentes não serão apagados\n\n' +
      'Deseja continuar?'
    );

    if (!confirmar) {
      event.target.value = ''; // Limpar seleção
      return;
    }

    const resultado = await importarBackupJSON(arquivo, false);

    if (resultado.sucesso) {
      alert(resultado.mensagem);
      // Recarregar dados
      await carregarResumo();
    } else {
      alert('Erro ao importar backup:\n' + resultado.mensagem);
    }

    // Limpar input
    event.target.value = '';
  };

  const resumoFiltrado = resumoClientes.filter((cliente) => {
    if (filtroStatus === "atrasados") return cliente.status === "atrasado";
    if (filtroStatus === "ativos") return cliente.status === "ativo";
    return true;
  });

  // Calcular totais gerais
  const totaisGerais = resumoFiltrado.reduce(
    (acc, cliente) => ({
      totalClientes: acc.totalClientes + 1,
      totalEmprestimos: acc.totalEmprestimos + cliente.totalEmprestimos,
      totalOriginal: acc.totalOriginal + cliente.totalOriginal,
      totalDevedor: acc.totalDevedor + cliente.totalDevedor,
    }),
    { totalClientes: 0, totalEmprestimos: 0, totalOriginal: 0, totalDevedor: 0 }
  );

  if (carregando) {
    return (
      <div className="empty-state">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Resumo Geral */}
      <div className="controle-resumo-geral">
        <div className="resumo-card">
          <span className="resumo-label">Clientes Ativos</span>
          <span className="resumo-valor">{totaisGerais.totalClientes}</span>
        </div>
        <div className="resumo-card">
          <span className="resumo-label">Empréstimos</span>
          <span className="resumo-valor">{totaisGerais.totalEmprestimos}</span>
        </div>
        <div className="resumo-card">
          <span className="resumo-label">Total Emprestado</span>
          <span className="resumo-valor">
            {formatarMoeda(totaisGerais.totalOriginal)}
          </span>
        </div>
        <div className="resumo-card destaque">
          <span className="resumo-label">Total a Receber</span>
          <span className="resumo-valor">
            {formatarMoeda(totaisGerais.totalDevedor)}
          </span>
        </div>
      </div>

      {/* Filtros e Exportação */}
      <div className="controle-filtros">
        <div className="filtros-grupo">
          <button
            className={`filtro-btn ${
              filtroStatus === "atrasados" ? "active" : ""
            }`}
            onClick={() => setFiltroStatus("atrasados")}
          >
            Atrasados (
            {resumoClientes.filter((c) => c.status === "atrasado").length})
          </button>
          <button
            className={`filtro-btn ${filtroStatus === "ativos" ? "active" : ""}`}
            onClick={() => setFiltroStatus("ativos")}
          >
            Em Dia ({resumoClientes.filter((c) => c.status === "ativo").length})
          </button>
        </div>

        <div className="backup-grupo">
          <button
            className="btn-backup btn-backup-export"
            onClick={handleExportarBackup}
            title="Exportar backup completo em JSON (clientes e empréstimos)"
          >
            💾 Exportar Backup
          </button>
          <label className="btn-backup btn-backup-import" title="Importar backup de arquivo JSON">
            📂 Importar Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportarBackup}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Lista de Clientes */}
      {resumoFiltrado.length === 0 ? (
        <div className="empty-state">
          <p>
            {filtroStatus === "atrasados"
              ? "Nenhum cliente com empréstimos atrasados."
              : "Nenhum cliente com empréstimos em dia."}
          </p>
        </div>
      ) : (
        <div className="controle-lista">
          {resumoFiltrado.map((cliente) => {
            const isExpandido = expandidos[cliente.clienteId] || false;

            return (
              <div
                key={cliente.clienteId}
                className={`controle-item ${cliente.status}`}
              >
                <button
                  className="btn-expand-controle"
                  onClick={() => toggleExpandir(cliente.clienteId)}
                  title={isExpandido ? "Retrair" : "Expandir detalhes"}
                >
                  {isExpandido ? "▼" : "▶"}
                </button>
                <div className="controle-header">
                  <div className="controle-cliente-info">
                    <h3>{cliente.clienteNome}</h3>
                    <p className="controle-celular">{cliente.clienteCelular}</p>
                  </div>
                  <div className="controle-status-container">
                    {cliente.maiorAtraso > 0 && (
                      <span className="controle-atraso">
                        {cliente.maiorAtraso}{" "}
                        {cliente.maiorAtraso === 1 ? "dia" : "dias"} de atraso
                      </span>
                    )}
                    <span className={`status-badge status-${cliente.status}`}>
                      {cliente.status.toUpperCase()}
                    </span>
                  </div>
                </div>

              <div className="controle-valores">
                <div className="controle-valor-item">
                  <span className="controle-label">Empréstimos Ativos</span>
                  <span className="controle-numero">
                    {cliente.totalEmprestimos}
                  </span>
                </div>
                <div className="controle-valor-item">
                  <span className="controle-label">Valor Original</span>
                  <span className="controle-numero">
                    {formatarMoeda(cliente.totalOriginal)}
                  </span>
                </div>
                <div className="controle-valor-item destaque">
                  <span className="controle-label">Saldo Devedor</span>
                  <span className="controle-numero-destaque">
                    {formatarMoeda(cliente.totalDevedor)}
                  </span>
                </div>
              </div>

              {/* Detalhes dos Empréstimos - Apenas se expandido */}
              {isExpandido && (
                <div className="controle-emprestimos-detalhes">
                  {cliente.emprestimos.map((emp) => {
                    const resumoEmp = calcularResumoEmprestimo(emp);

                    return (
                      <div key={emp.id} className="controle-emprestimo-mini">
                        <div className="emprestimo-mini-info">
                          <span className="emprestimo-mini-label">
                            {formatarMoeda(resumoEmp.valorOriginal)} •{" "}
                            {resumoEmp.numeroParcelas}x
                          </span>
                          <span className="emprestimo-mini-saldo">
                            Devedor: {formatarMoeda(resumoEmp.saldoDevedor)}
                          </span>
                        </div>

                        {/* Parcelas em aberto */}
                        <div className="parcelas-mini">
                          {emp.parcelas
                            .filter((p) => p.valorPago === 0)
                            .map((parcela) => {
                              const calcParcela = calcularJurosParcela(parcela);

                              return (
                                <div
                                  key={parcela.numero}
                                  className={`parcela-mini ${calcParcela.status}`}
                                >
                                  <span className="parcela-mini-numero">
                                    P{parcela.numero}
                                  </span>
                                  <span className="parcela-mini-venc">
                                    {formatarData(parcela.dataVencimento)}
                                  </span>
                                  <span className="parcela-mini-valor">
                                    {formatarMoeda(calcParcela.totalParcela)}
                                  </span>
                                  {calcParcela.diasAtraso > 0 && (
                                    <span className="parcela-mini-atraso">
                                      +{calcParcela.diasAtraso}d
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Controle;
