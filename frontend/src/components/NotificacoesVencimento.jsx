import { useState, useEffect } from "react";
import {
  listarClientes,
  listarEmprestimosPorCliente,
  initDB,
} from "../utils/db";
import {
  verificarAlertaVencimento,
  formatarData,
  formatarMoeda,
  calcularJurosParcela,
} from "../utils/calculos";

function NotificacoesVencimento({ atualizarDados }) {
  const [notificacoes, setNotificacoes] = useState({
    venceHoje: [],
    venceSoon: [],
    atrasados: [],
  });
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const carregarNotificacoes = async () => {
    try {
      await initDB();
      const clientes = await listarClientes();

      const venceHoje = [];
      const venceSoon = [];
      const atrasados = [];

      for (const cliente of clientes) {
        const emprestimos = await listarEmprestimosPorCliente(cliente.id);

        for (const emprestimo of emprestimos) {
          for (const parcela of emprestimo.parcelas) {
            const alerta = verificarAlertaVencimento(parcela);

            if (alerta.tipo === "venceHoje") {
              venceHoje.push({
                cliente,
                emprestimo,
                parcela,
                alerta,
              });
            } else if (alerta.tipo === "venceSoon") {
              venceSoon.push({
                cliente,
                emprestimo,
                parcela,
                alerta,
              });
            } else if (alerta.tipo === "atrasado") {
              atrasados.push({
                cliente,
                emprestimo,
                parcela,
                alerta,
              });
            }
          }
        }
      }

      setNotificacoes({ venceHoje, venceSoon, atrasados });
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
  }, [atualizarDados]);

  const totalNotificacoes =
    notificacoes.venceHoje.length +
    notificacoes.venceSoon.length +
    notificacoes.atrasados.length;

  if (totalNotificacoes === 0) {
    return null;
  }

  return (
    <div className="notificacoes-container">
      <button
        className="notificacoes-badge"
        onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
        title="Ver notificações de vencimento"
      >
        <span className="badge-icon">🔔</span>
        <span className="badge-count">{totalNotificacoes}</span>
      </button>

      {mostrarDetalhes && (
        <>
          <div className="notificacoes-overlay" onClick={() => setMostrarDetalhes(false)}></div>
          <div className="notificacoes-detalhes">
            <div className="notificacoes-header">
              <h3>Notificações de Vencimento</h3>
              <button
                className="btn-fechar"
                onClick={() => setMostrarDetalhes(false)}
              >
                ✕
              </button>
            </div>

            <div className="notificacoes-lista">
            {notificacoes.atrasados.length > 0 && (
              <div className="notificacao-grupo atrasado">
                <h4>🚨 Atrasados ({notificacoes.atrasados.length})</h4>
                {notificacoes.atrasados.map((item, index) => {
                  const calc = calcularJurosParcela(item.parcela);
                  return (
                    <div key={index} className="notificacao-item">
                      <div className="notificacao-info">
                        <strong>{item.cliente.nome}</strong>
                        <p>
                          Parcela {item.parcela.numero} -{" "}
                          {formatarMoeda(calc.totalParcela)}
                        </p>
                        <p className="data-venc">
                          Venceu: {formatarData(item.parcela.dataVencimento)}
                        </p>
                        <p className="dias-atraso">
                          {Math.abs(item.alerta.diasRestantes)} dias de atraso
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {notificacoes.venceHoje.length > 0 && (
              <div className="notificacao-grupo vence-hoje">
                <h4>⚠️ Vence Hoje ({notificacoes.venceHoje.length})</h4>
                {notificacoes.venceHoje.map((item, index) => {
                  const calc = calcularJurosParcela(item.parcela);
                  return (
                    <div key={index} className="notificacao-item">
                      <div className="notificacao-info">
                        <strong>{item.cliente.nome}</strong>
                        <p>
                          Parcela {item.parcela.numero} -{" "}
                          {formatarMoeda(calc.totalParcela)}
                        </p>
                        <p className="data-venc">
                          Vencimento: {formatarData(item.parcela.dataVencimento)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {notificacoes.venceSoon.length > 0 && (
              <div className="notificacao-grupo vence-soon">
                <h4>📅 Próximos Vencimentos ({notificacoes.venceSoon.length})</h4>
                {notificacoes.venceSoon.map((item, index) => {
                  const calc = calcularJurosParcela(item.parcela);
                  return (
                    <div key={index} className="notificacao-item">
                      <div className="notificacao-info">
                        <strong>{item.cliente.nome}</strong>
                        <p>
                          Parcela {item.parcela.numero} -{" "}
                          {formatarMoeda(calc.totalParcela)}
                        </p>
                        <p className="data-venc">
                          Vence: {formatarData(item.parcela.dataVencimento)}
                        </p>
                        <p className="dias-restantes">
                          {item.alerta.diasRestantes} dias restantes
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default NotificacoesVencimento;
