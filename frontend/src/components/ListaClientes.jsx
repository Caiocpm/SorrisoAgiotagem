import { useState, useEffect } from "react";
import {
  listarClientes,
  excluirCliente,
  initDB,
  listarEmprestimosPorCliente,
  excluirEmprestimo,
  atualizarEmprestimo,
} from "../utils/db";
import {
  calcularJurosParcela,
  calcularResumoEmprestimo,
  formatarMoeda,
  formatarData,
  verificarAlertaVencimento,
} from "../utils/calculos";
import FormularioEmprestimo from "./FormularioEmprestimo";

function ListaClientes({ clienteAdicionado, onDadosAtualizados }) {
  const [clientes, setClientes] = useState([]);
  const [emprestimos, setEmprestimos] = useState({});
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clientesExpandidos, setClientesExpandidos] = useState({});

  const carregarClientes = async () => {
    try {
      await initDB();
      const data = await listarClientes();
      setClientes(data);

      // Carregar empréstimos para cada cliente
      const emprestimosMap = {};
      for (const cliente of data) {
        const emprestimosDados = await listarEmprestimosPorCliente(cliente.id);
        emprestimosMap[cliente.id] = emprestimosDados;
      }
      setEmprestimos(emprestimosMap);

      setCarregando(false);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    if (clienteAdicionado) {
      carregarClientes();
    }
  }, [clienteAdicionado]);

  const handleDelete = async (id, nome) => {
    const emprestimosCliente = emprestimos[id] || [];

    if (emprestimosCliente.length > 0) {
      alert(
        `Não é possível excluir ${nome}. O cliente possui ${emprestimosCliente.length} empréstimo(s) ativo(s). Exclua os empréstimos primeiro.`
      );
      return;
    }

    if (window.confirm(`Deseja realmente excluir o cliente ${nome}?`)) {
      try {
        await excluirCliente(id);
        setClientes(clientes.filter((c) => c.id !== id));
        if (onDadosAtualizados) onDadosAtualizados();
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao excluir cliente");
      }
    }
  };

  const handleDeleteEmprestimo = async (
    emprestimoId,
    clienteId,
    clienteNome
  ) => {
    if (
      window.confirm(
        `Deseja realmente excluir este empréstimo de ${clienteNome}?`
      )
    ) {
      try {
        await excluirEmprestimo(emprestimoId);

        // Atualiza a lista de empréstimos localmente
        const emprestimosAtualizados = { ...emprestimos };
        emprestimosAtualizados[clienteId] = emprestimosAtualizados[
          clienteId
        ].filter((e) => e.id !== emprestimoId);
        setEmprestimos(emprestimosAtualizados);
        if (onDadosAtualizados) onDadosAtualizados();
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao excluir empréstimo");
      }
    }
  };

  const handleAdicionarEmprestimo = (cliente) => {
    setClienteSelecionado(cliente);
  };

  const handleEmprestimoAdicionado = () => {
    setClienteSelecionado(null);
    carregarClientes();
    if (onDadosAtualizados) onDadosAtualizados();
  };

  const handleMarcarPago = async (emprestimo, numeroParcela) => {
    try {
      const emprestimoAtualizado = { ...emprestimo };
      const parcelaIndex = emprestimoAtualizado.parcelas.findIndex(
        (p) => p.numero === numeroParcela
      );

      if (parcelaIndex !== -1) {
        const parcela = emprestimoAtualizado.parcelas[parcelaIndex];
        const calcParcela = calcularJurosParcela(parcela);

        // Se já está pago, desmarca
        if (calcParcela.status === "pago") {
          emprestimoAtualizado.parcelas[parcelaIndex].valorPago = 0;
        } else {
          // Pergunta se quer pagar parcialmente ou total
          const opcao = window.confirm(
            `Parcela ${numeroParcela}\n` +
              `Valor Total: ${formatarMoeda(calcParcela.totalParcela)}\n` +
              `Já Pago: ${formatarMoeda(calcParcela.valorPago)}\n` +
              `Saldo: ${formatarMoeda(calcParcela.saldoDevedor)}\n\n` +
              `Clique OK para pagar TOTAL ou CANCELAR para pagar PARCIALMENTE`
          );

          if (opcao) {
            // Pagar total
            emprestimoAtualizado.parcelas[parcelaIndex].valorPago =
              calcParcela.totalParcela;
          } else {
            // Pagar parcialmente
            const valorPagarStr = window.prompt(
              `Digite o valor a pagar:\n` +
                `Saldo devedor: ${formatarMoeda(calcParcela.saldoDevedor)}`,
              ""
            );

            if (valorPagarStr !== null && valorPagarStr.trim() !== "") {
              // Remove caracteres não numéricos exceto vírgula e ponto
              const valorLimpo = valorPagarStr
                .replace(/[^\d,.-]/g, "")
                .replace(",", ".");
              const valorPagar = parseFloat(valorLimpo);

              if (isNaN(valorPagar) || valorPagar <= 0) {
                alert("Valor inválido! Digite um valor maior que zero.");
                return;
              }

              if (valorPagar > calcParcela.saldoDevedor) {
                alert(
                  `Valor não pode ser maior que o saldo devedor de ${formatarMoeda(
                    calcParcela.saldoDevedor
                  )}`
                );
                return;
              }

              // Adiciona ao valor já pago
              const novoValorPago = calcParcela.valorPago + valorPagar;
              emprestimoAtualizado.parcelas[parcelaIndex].valorPago =
                parseFloat(novoValorPago.toFixed(2));
            } else {
              return; // Cancelou
            }
          }
        }

        await atualizarEmprestimo(emprestimoAtualizado);
        carregarClientes();
        if (onDadosAtualizados) onDadosAtualizados();
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao atualizar parcela");
    }
  };

  const toggleExpandirCliente = (clienteId) => {
    setClientesExpandidos((prev) => ({
      ...prev,
      [clienteId]: !prev[clienteId],
    }));
  };

  const enviarWhatsAppCobranca = (cliente, parcela, calcParcela) => {
    const telefone = cliente.celular.replace(/\D/g, "");

    const mensagem = `Prezado, ${cliente.nome}! 
Informo que, conforme estipulado, os pagamentos realizados após o vencimento terão acréscimo de 1% de juros ao dia sobre o valor em aberto, até a quitação.

📋 *Parcela ${parcela.numero}*
💰 Valor: ${formatarMoeda(calcParcela.totalParcela)}
📅 Vencimento: ${formatarData(parcela.dataVencimento)}${
      calcParcela.diasAtraso > 0
        ? `
⚠️ Atraso: ${calcParcela.diasAtraso} dias`
        : ""
    }${
      calcParcela.valorPago > 0
        ? `
✅ Já Pago: ${formatarMoeda(calcParcela.valorPago)}
💳 Saldo: ${formatarMoeda(calcParcela.saldoDevedor)}`
        : ""
    }

`;

    const url = `https://api.whatsapp.com/send?phone=55${telefone}&text=${encodeURIComponent(
      mensagem
    )}`;
    window.open(url, "_blank");
  };

  const clientesFiltrados = clientes
    .filter((cliente) =>
      cliente.nome.toLowerCase().includes(filtro.toLowerCase())
    )
    .sort((a, b) => {
      const emprestimosA = emprestimos[a.id] || [];
      const emprestimosB = emprestimos[b.id] || [];

      // Verifica se tem empréstimos ativos (não quitados)
      const temAtivoA = emprestimosA.some((emp) => {
        const resumo = calcularResumoEmprestimo(emp);
        return resumo.status !== "quitado";
      });
      const temAtivoB = emprestimosB.some((emp) => {
        const resumo = calcularResumoEmprestimo(emp);
        return resumo.status !== "quitado";
      });

      // Se um tem empréstimo ativo e o outro não, prioriza o que tem
      if (temAtivoA && !temAtivoB) return -1;
      if (!temAtivoA && temAtivoB) return 1;

      // Se ambos têm ou ambos não têm, ordena alfabeticamente
      return a.nome.localeCompare(b.nome);
    });

  if (carregando) {
    return (
      <div className="empty-state">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filtrar por nome..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>
            {filtro
              ? "Nenhum cliente encontrado com esse nome."
              : "Nenhum cliente cadastrado ainda."}
          </p>
        </div>
      ) : (
        <div className="clientes-lista">
          {clientesFiltrados.map((cliente) => {
            const emprestimosCliente = emprestimos[cliente.id] || [];
            const isExpandido = clientesExpandidos[cliente.id];

            return (
              <div key={cliente.id} className="cliente-item">
                <button
                  className="btn-expand"
                  onClick={() => toggleExpandirCliente(cliente.id)}
                  title={isExpandido ? "Retrair" : "Expandir"}
                >
                  {isExpandido ? "▼" : "▶"}
                </button>
                <div className="cliente-info">
                  <div className="cliente-header">
                    <h3>{cliente.nome}</h3>
                    <div className="cliente-actions">
                      <a
                        href={`https://wa.me/55${cliente.celular.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp"
                        title="Enviar mensagem no WhatsApp"
                      >
                        📱 WhatsApp
                      </a>
                      <button
                        className="btn btn-add-emprestimo"
                        onClick={() => handleAdicionarEmprestimo(cliente)}
                      >
                        Empréstimo
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(cliente.id, cliente.nome)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  {!isExpandido && emprestimosCliente.length > 0 && (
                    <div className="cliente-badges">
                      <p>
                        <span className="label">Celular:</span>{" "}
                        {cliente.celular}
                      </p>
                      <div className="badges-container">
                        {emprestimosCliente.map((emprestimo) => {
                          const resumo = calcularResumoEmprestimo(emprestimo);
                          return (
                            <span
                              key={emprestimo.id}
                              className={`status-badge status-${resumo.status}`}
                            >
                              {resumo.status.toUpperCase()}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isExpandido && emprestimosCliente.length === 0 && (
                    <p>
                      <span className="label">Celular:</span> {cliente.celular}
                    </p>
                  )}

                  {isExpandido && (
                    <>
                      <p>
                        <span className="label">Celular:</span>{" "}
                        {cliente.celular}
                      </p>
                      {cliente.endereco && (
                        <p>
                          <span className="label">Endereço:</span>{" "}
                          {cliente.endereco}
                        </p>
                      )}
                    </>
                  )}

                  {isExpandido && emprestimosCliente.length > 0 && (
                    <div className="emprestimos-cliente">
                      <h4>Empréstimos:</h4>
                      {emprestimosCliente.map((emprestimo) => {
                        const resumo = calcularResumoEmprestimo(emprestimo);

                        return (
                          <div
                            key={emprestimo.id}
                            className={`emprestimo-card emprestimo-${resumo.status}`}
                          >
                            <div className="emprestimo-header">
                              <div>
                                <p>
                                  <span className="label">Valor Original:</span>{" "}
                                  {formatarMoeda(resumo.valorOriginal)}
                                </p>
                                <p>
                                  <span className="label">
                                    Total com Juros:
                                  </span>{" "}
                                  {formatarMoeda(resumo.valorComJuros)}
                                </p>
                                <p>
                                  <span className="label">Parcelas:</span>{" "}
                                  {resumo.numeroParcelas}x
                                </p>
                                <p className="saldo-devedor">
                                  <span className="label">Saldo Devedor:</span>{" "}
                                  {formatarMoeda(resumo.saldoDevedor)}
                                </p>
                              </div>
                              <div className="emprestimo-actions">
                                <span
                                  className={`status-badge status-${resumo.status}`}
                                >
                                  {resumo.status.toUpperCase()}
                                </span>
                                <button
                                  className="btn btn-danger btn-delete-emprestimo"
                                  onClick={() =>
                                    handleDeleteEmprestimo(
                                      emprestimo.id,
                                      cliente.id,
                                      cliente.nome
                                    )
                                  }
                                >
                                  Excluir Empréstimo
                                </button>
                              </div>
                            </div>

                            <div className="parcelas-list">
                              {emprestimo.parcelas.map((parcela) => {
                                const calcParcela =
                                  calcularJurosParcela(parcela);
                                const alerta =
                                  verificarAlertaVencimento(parcela);

                                return (
                                  <div
                                    key={parcela.numero}
                                    className={`parcela-item ${
                                      calcParcela.status
                                    } ${
                                      alerta.tipo === "venceSoon"
                                        ? "vence-soon"
                                        : alerta.tipo === "venceHoje"
                                        ? "vence-hoje"
                                        : ""
                                    }`}
                                  >
                                    <div className="parcela-info">
                                      <div>
                                        <strong>
                                          Parcela {parcela.numero}
                                        </strong>
                                        <p>
                                          Vencimento:{" "}
                                          {formatarData(parcela.dataVencimento)}
                                        </p>
                                        {calcParcela.diasAtraso > 0 && (
                                          <p className="atraso">
                                            Atraso: {calcParcela.diasAtraso}{" "}
                                            dias
                                          </p>
                                        )}
                                      </div>
                                      <div className="parcela-valores">
                                        <div>
                                          <p>
                                            Valor:{" "}
                                            {formatarMoeda(
                                              calcParcela.valorParcela
                                            )}
                                          </p>
                                          {calcParcela.jurosAtraso > 0 && (
                                            <p className="atraso">
                                              + Juros:{" "}
                                              {formatarMoeda(
                                                calcParcela.jurosAtraso
                                              )}
                                            </p>
                                          )}
                                          <p className="total">
                                            Total:{" "}
                                            {formatarMoeda(
                                              calcParcela.totalParcela
                                            )}
                                          </p>
                                          {calcParcela.valorPago > 0 && (
                                            <>
                                              <p className="pago-parcial">
                                                Pago:{" "}
                                                {formatarMoeda(
                                                  calcParcela.valorPago
                                                )}
                                              </p>
                                              {calcParcela.saldoDevedor > 0 && (
                                                <p className="saldo-parcela">
                                                  Saldo:{" "}
                                                  {formatarMoeda(
                                                    calcParcela.saldoDevedor
                                                  )}
                                                </p>
                                              )}
                                            </>
                                          )}
                                        </div>
                                        <div className="parcela-acoes">
                                          {calcParcela.status !== "pago" && (
                                            <button
                                              className="btn-whatsapp-parcela"
                                              onClick={() =>
                                                enviarWhatsAppCobranca(
                                                  cliente,
                                                  parcela,
                                                  calcParcela
                                                )
                                              }
                                              title="Enviar cobrança por WhatsApp"
                                            >
                                              🔫 COBRAR
                                            </button>
                                          )}
                                          <button
                                            className={`btn-toggle-pago ${
                                              calcParcela.status === "pago"
                                                ? "pago"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              handleMarcarPago(
                                                emprestimo,
                                                parcela.numero
                                              )
                                            }
                                            title={
                                              calcParcela.status === "pago"
                                                ? "Desmarcar como pago"
                                                : calcParcela.valorPago > 0
                                                ? "Adicionar pagamento"
                                                : "Registrar pagamento"
                                            }
                                          >
                                            {calcParcela.status === "pago"
                                              ? "✓ Pago"
                                              : calcParcela.valorPago > 0
                                              ? "+ Pagar"
                                              : "Pagar"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
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
              </div>
            );
          })}
        </div>
      )}

      {clienteSelecionado && (
        <FormularioEmprestimo
          clienteId={clienteSelecionado.id}
          clienteNome={clienteSelecionado.nome}
          onEmprestimoAdicionado={handleEmprestimoAdicionado}
          onCancelar={() => setClienteSelecionado(null)}
        />
      )}
    </div>
  );
}

export default ListaClientes;
