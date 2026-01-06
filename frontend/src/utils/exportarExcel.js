import {
  calcularJurosParcela,
  calcularResumoEmprestimo,
  formatarData,
} from "./calculos";

/**
 * Converte dados para formato CSV
 * @param {Array} clientes - Array de clientes
 * @param {Object} emprestimosMap - Mapa de empréstimos por cliente
 * @returns {string} Dados em formato CSV
 */
function gerarCSV(clientes, emprestimosMap) {
  let csv = "\uFEFF"; // BOM para UTF-8

  // Cabeçalho
  csv += "Cliente,Celular,Endereco,";
  csv += "Emprestimo ID,Data Emprestimo,Valor Original,Num Parcelas,";
  csv += "Parcela Num,Vencimento,Valor Parcela,Juros Atraso,Total,Valor Pago,Saldo Devedor,Dias Atraso,Status\n";

  // Dados
  clientes.forEach((cliente) => {
    const emprestimos = emprestimosMap[cliente.id] || [];

    if (emprestimos.length === 0) {
      // Cliente sem empréstimos
      csv += `"${cliente.nome}","${cliente.celular}","${cliente.endereco || ""}",`;
      csv += ",,,,,,,,,,,\n";
    } else {
      emprestimos.forEach((emprestimo) => {
        emprestimo.parcelas.forEach((parcela) => {
          const calc = calcularJurosParcela(parcela);

          csv += `"${cliente.nome}","${cliente.celular}","${cliente.endereco || ""}",`;
          csv += `"${emprestimo.id}","${formatarData(emprestimo.dataEmprestimo)}",`;
          csv += `${emprestimo.valorTotal},${emprestimo.numeroParcelas},`;
          csv += `${parcela.numero},"${formatarData(parcela.dataVencimento)}",`;
          csv += `${calc.valorParcela},${calc.jurosAtraso},${calc.totalParcela},`;
          csv += `${calc.valorPago},${calc.saldoDevedor},${calc.diasAtraso},"${calc.status}"\n`;
        });
      });
    }
  });

  return csv;
}

/**
 * Gera resumo dos empréstimos em CSV
 * @param {Array} clientes - Array de clientes
 * @param {Object} emprestimosMap - Mapa de empréstimos por cliente
 * @returns {string} Dados em formato CSV
 */
function gerarResumoCSV(clientes, emprestimosMap) {
  let csv = "\uFEFF"; // BOM para UTF-8

  // Cabeçalho
  csv += "Cliente,Celular,Total Emprestimos,Valor Original Total,";
  csv += "Valor Com Juros Total,Total Pago,Saldo Devedor Total,Status Geral\n";

  // Dados
  clientes.forEach((cliente) => {
    const emprestimos = emprestimosMap[cliente.id] || [];

    let totalOriginal = 0;
    let totalComJuros = 0;
    let totalPago = 0;
    let totalDevedor = 0;
    let temAtrasado = false;
    let todosPagos = true;

    emprestimos.forEach((emprestimo) => {
      const resumo = calcularResumoEmprestimo(emprestimo);
      totalOriginal += resumo.valorOriginal;
      totalComJuros += resumo.totalComJurosAtraso;
      totalPago += resumo.totalPago;
      totalDevedor += resumo.saldoDevedor;

      if (resumo.status === "atrasado") temAtrasado = true;
      if (resumo.status !== "pago") todosPagos = false;
    });

    const statusGeral = todosPagos
      ? "pago"
      : temAtrasado
      ? "atrasado"
      : "ativo";

    csv += `"${cliente.nome}","${cliente.celular}",${emprestimos.length},`;
    csv += `${totalOriginal.toFixed(2)},${totalComJuros.toFixed(2)},`;
    csv += `${totalPago.toFixed(2)},${totalDevedor.toFixed(2)},"${statusGeral}"\n`;
  });

  return csv;
}

/**
 * Baixa dados em formato CSV
 * @param {string} conteudo - Conteúdo CSV
 * @param {string} nomeArquivo - Nome do arquivo
 */
function baixarCSV(conteudo, nomeArquivo) {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", nomeArquivo);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta dados detalhados para Excel (CSV)
 * @param {Array} clientes - Array de clientes
 * @param {Object} emprestimosMap - Mapa de empréstimos por cliente
 */
export function exportarDetalhado(clientes, emprestimosMap) {
  const csv = gerarCSV(clientes, emprestimosMap);
  const dataHora = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  baixarCSV(csv, `emprestimos-detalhado-${dataHora}.csv`);
}

/**
 * Exporta resumo para Excel (CSV)
 * @param {Array} clientes - Array de clientes
 * @param {Object} emprestimosMap - Mapa de empréstimos por cliente
 */
export function exportarResumo(clientes, emprestimosMap) {
  const csv = gerarResumoCSV(clientes, emprestimosMap);
  const dataHora = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  baixarCSV(csv, `emprestimos-resumo-${dataHora}.csv`);
}
