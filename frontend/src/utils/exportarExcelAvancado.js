import * as XLSX from 'xlsx';
import {
  calcularJurosParcela,
  calcularResumoEmprestimo,
  formatarData,
  formatarMoeda,
} from "./calculos";

/**
 * Exporta dados completos para Excel com múltiplas abas e formatação profissional
 * @param {Array} clientes - Array de clientes
 * @param {Object} emprestimosMap - Mapa de empréstimos por cliente
 */
export function exportarExcelCompleto(clientes, emprestimosMap) {
  // Criar um novo workbook
  const workbook = XLSX.utils.book_new();

  // 1. ABA: RESUMO GERAL
  const abaResumo = criarAbaResumo(clientes, emprestimosMap);
  XLSX.utils.book_append_sheet(workbook, abaResumo, 'Resumo Geral');

  // 2. ABA: PARCELAS DETALHADAS
  const abaParcelas = criarAbaParcelas(clientes, emprestimosMap);
  XLSX.utils.book_append_sheet(workbook, abaParcelas, 'Todas as Parcelas');

  // 3. ABA: PARCELAS EM ATRASO
  const abaAtrasadas = criarAbaParcelasAtrasadas(clientes, emprestimosMap);
  XLSX.utils.book_append_sheet(workbook, abaAtrasadas, 'Parcelas em Atraso');

  // 4. ABA: PARCELAS A VENCER
  const abaAVencer = criarAbaParcelasAVencer(clientes, emprestimosMap);
  XLSX.utils.book_append_sheet(workbook, abaAVencer, 'A Vencer (Próximos 7 dias)');

  // 5. ABA: TOTALIZADORES
  const abaTotalizadores = criarAbaTotalizadores(clientes, emprestimosMap);
  XLSX.utils.book_append_sheet(workbook, abaTotalizadores, 'Totalizadores');

  // Gerar e baixar arquivo
  const dataHora = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  XLSX.writeFile(workbook, `sorriso-agiotagem-completo-${dataHora}.xlsx`);
}

/**
 * Cria aba com resumo por cliente
 */
function criarAbaResumo(clientes, emprestimosMap) {
  const dados = [];

  // Cabeçalho
  dados.push([
    'Cliente',
    'Celular',
    'Endereço',
    'Qtd Empréstimos',
    'Valor Original Total',
    'Valor c/ Juros Contrato',
    'Juros por Atraso',
    'Total a Receber',
    'Total Pago',
    'Saldo Devedor',
    'Status'
  ]);

  // Dados dos clientes
  clientes.forEach((cliente) => {
    const emprestimos = emprestimosMap[cliente.id] || [];

    let totalOriginal = 0;
    let totalComJurosContrato = 0;
    let totalJurosAtraso = 0;
    let totalComJurosAtraso = 0;
    let totalPago = 0;
    let totalDevedor = 0;
    let temAtrasado = false;
    let temQuitado = false;
    let todosPagos = emprestimos.length > 0;

    emprestimos.forEach((emprestimo) => {
      const resumo = calcularResumoEmprestimo(emprestimo);
      totalOriginal += resumo.valorOriginal;
      totalComJurosContrato += resumo.valorComJuros;
      totalJurosAtraso += resumo.totalJurosAtraso;
      totalComJurosAtraso += resumo.totalComJurosAtraso;
      totalPago += resumo.totalPago;
      totalDevedor += resumo.saldoDevedor;

      if (resumo.status === 'atrasado') temAtrasado = true;
      if (resumo.status === 'quitado') temQuitado = true;
      if (resumo.status !== 'quitado') todosPagos = false;
    });

    const statusGeral = todosPagos && emprestimos.length > 0
      ? 'QUITADO'
      : temAtrasado
      ? 'ATRASADO'
      : emprestimos.length > 0
      ? 'EM DIA'
      : 'SEM EMPRÉSTIMOS';

    dados.push([
      cliente.nome,
      cliente.celular,
      cliente.endereco || '',
      emprestimos.length,
      totalOriginal,
      totalComJurosContrato,
      totalJurosAtraso,
      totalComJurosAtraso,
      totalPago,
      totalDevedor,
      statusGeral
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(dados);

  // Definir larguras das colunas
  worksheet['!cols'] = [
    { wch: 25 }, // Cliente
    { wch: 15 }, // Celular
    { wch: 30 }, // Endereço
    { wch: 12 }, // Qtd Empréstimos
    { wch: 18 }, // Valor Original
    { wch: 18 }, // Valor c/ Juros Contrato
    { wch: 18 }, // Juros Atraso
    { wch: 18 }, // Total a Receber
    { wch: 15 }, // Total Pago
    { wch: 15 }, // Saldo Devedor
    { wch: 15 }, // Status
  ];

  return worksheet;
}

/**
 * Cria aba com todas as parcelas detalhadas
 */
function criarAbaParcelas(clientes, emprestimosMap) {
  const dados = [];

  // Cabeçalho
  dados.push([
    'Cliente',
    'Celular',
    'Data Empréstimo',
    'Valor Original',
    'Valor c/ Juros',
    'Num Parcelas',
    'Parcela Nº',
    'Vencimento',
    'Valor Parcela',
    'Juros Atraso',
    'Total',
    'Pago',
    'Saldo',
    'Dias Atraso',
    'Status'
  ]);

  // Dados das parcelas
  clientes.forEach((cliente) => {
    const emprestimos = emprestimosMap[cliente.id] || [];

    emprestimos.forEach((emprestimo) => {
      const resumoEmp = calcularResumoEmprestimo(emprestimo);

      emprestimo.parcelas.forEach((parcela) => {
        const calc = calcularJurosParcela(parcela);

        dados.push([
          cliente.nome,
          cliente.celular,
          formatarData(emprestimo.dataEmprestimo),
          resumoEmp.valorOriginal,
          resumoEmp.valorComJuros,
          emprestimo.numeroParcelas,
          parcela.numero,
          formatarData(parcela.dataVencimento),
          calc.valorParcela,
          calc.jurosAtraso,
          calc.totalParcela,
          calc.valorPago,
          calc.saldoDevedor,
          calc.diasAtraso,
          calc.status.toUpperCase()
        ]);
      });
    });
  });

  const worksheet = XLSX.utils.aoa_to_sheet(dados);

  // Definir larguras das colunas
  worksheet['!cols'] = [
    { wch: 25 }, // Cliente
    { wch: 15 }, // Celular
    { wch: 12 }, // Data Empréstimo
    { wch: 15 }, // Valor Original
    { wch: 15 }, // Valor c/ Juros
    { wch: 12 }, // Num Parcelas
    { wch: 10 }, // Parcela Nº
    { wch: 12 }, // Vencimento
    { wch: 13 }, // Valor Parcela
    { wch: 12 }, // Juros Atraso
    { wch: 12 }, // Total
    { wch: 12 }, // Pago
    { wch: 12 }, // Saldo
    { wch: 12 }, // Dias Atraso
    { wch: 12 }, // Status
  ];

  return worksheet;
}

/**
 * Cria aba com parcelas em atraso
 */
function criarAbaParcelasAtrasadas(clientes, emprestimosMap) {
  const dados = [];

  // Cabeçalho
  dados.push([
    'Cliente',
    'Celular',
    'Parcela Nº',
    'Vencimento',
    'Dias de Atraso',
    'Valor Original',
    'Juros Atraso (1%/dia)',
    'Total c/ Juros',
    'Já Pago',
    'Saldo Devedor'
  ]);

  // Filtrar apenas parcelas atrasadas
  clientes.forEach((cliente) => {
    const emprestimos = emprestimosMap[cliente.id] || [];

    emprestimos.forEach((emprestimo) => {
      emprestimo.parcelas.forEach((parcela) => {
        const calc = calcularJurosParcela(parcela);

        if (calc.status === 'atrasado') {
          dados.push([
            cliente.nome,
            cliente.celular,
            parcela.numero,
            formatarData(parcela.dataVencimento),
            calc.diasAtraso,
            calc.valorParcela,
            calc.jurosAtraso,
            calc.totalParcela,
            calc.valorPago,
            calc.saldoDevedor
          ]);
        }
      });
    });
  });

  // Se não houver parcelas atrasadas
  if (dados.length === 1) {
    dados.push(['Nenhuma parcela em atraso! 🎉']);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(dados);

  // Definir larguras das colunas
  worksheet['!cols'] = [
    { wch: 25 }, // Cliente
    { wch: 15 }, // Celular
    { wch: 10 }, // Parcela Nº
    { wch: 12 }, // Vencimento
    { wch: 13 }, // Dias Atraso
    { wch: 15 }, // Valor Original
    { wch: 18 }, // Juros Atraso
    { wch: 15 }, // Total c/ Juros
    { wch: 12 }, // Já Pago
    { wch: 15 }, // Saldo Devedor
  ];

  return worksheet;
}

/**
 * Cria aba com parcelas a vencer nos próximos 7 dias
 */
function criarAbaParcelasAVencer(clientes, emprestimosMap) {
  const dados = [];
  const hoje = new Date();
  const setedasDepois = new Date();
  setedasDepois.setDate(hoje.getDate() + 7);

  // Cabeçalho
  dados.push([
    'Cliente',
    'Celular',
    'Parcela Nº',
    'Vencimento',
    'Dias até Vencimento',
    'Valor Parcela',
    'Já Pago',
    'Saldo Devedor'
  ]);

  // Filtrar parcelas que vencem nos próximos 7 dias
  clientes.forEach((cliente) => {
    const emprestimos = emprestimosMap[cliente.id] || [];

    emprestimos.forEach((emprestimo) => {
      emprestimo.parcelas.forEach((parcela) => {
        const calc = calcularJurosParcela(parcela);
        const dataVencimento = new Date(parcela.dataVencimento);

        // Parcelas pendentes que vencem nos próximos 7 dias
        if (calc.status === 'pendente' && dataVencimento >= hoje && dataVencimento <= setedasDepois) {
          const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

          dados.push([
            cliente.nome,
            cliente.celular,
            parcela.numero,
            formatarData(parcela.dataVencimento),
            diasRestantes,
            calc.valorParcela,
            calc.valorPago,
            calc.saldoDevedor
          ]);
        }
      });
    });
  });

  // Se não houver parcelas a vencer
  if (dados.length === 1) {
    dados.push(['Nenhuma parcela vence nos próximos 7 dias']);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(dados);

  // Definir larguras das colunas
  worksheet['!cols'] = [
    { wch: 25 }, // Cliente
    { wch: 15 }, // Celular
    { wch: 10 }, // Parcela Nº
    { wch: 12 }, // Vencimento
    { wch: 18 }, // Dias até Vencimento
    { wch: 15 }, // Valor Parcela
    { wch: 12 }, // Já Pago
    { wch: 15 }, // Saldo Devedor
  ];

  return worksheet;
}

/**
 * Cria aba com totalizadores gerais
 */
function criarAbaTotalizadores(clientes, emprestimosMap) {
  let totalClientes = clientes.length;
  let totalClientesComEmprestimo = 0;
  let totalEmprestimos = 0;
  let totalParcelasGeral = 0;
  let totalParcelasPagas = 0;
  let totalParcelasAtrasadas = 0;
  let totalParcelasPendentes = 0;

  let valorOriginalTotal = 0;
  let valorComJurosContratoTotal = 0;
  let valorJurosAtrasoTotal = 0;
  let valorTotalAReceber = 0;
  let valorTotalPago = 0;
  let saldoDevedorTotal = 0;

  // Calcular totais
  clientes.forEach((cliente) => {
    const emprestimos = emprestimosMap[cliente.id] || [];

    if (emprestimos.length > 0) {
      totalClientesComEmprestimo++;
    }

    totalEmprestimos += emprestimos.length;

    emprestimos.forEach((emprestimo) => {
      const resumo = calcularResumoEmprestimo(emprestimo);

      totalParcelasGeral += emprestimo.parcelas.length;

      valorOriginalTotal += resumo.valorOriginal;
      valorComJurosContratoTotal += resumo.valorComJuros;
      valorJurosAtrasoTotal += resumo.totalJurosAtraso;
      valorTotalAReceber += resumo.totalComJurosAtraso;
      valorTotalPago += resumo.totalPago;
      saldoDevedorTotal += resumo.saldoDevedor;

      emprestimo.parcelas.forEach((parcela) => {
        const calc = calcularJurosParcela(parcela);

        if (calc.status === 'pago') totalParcelasPagas++;
        else if (calc.status === 'atrasado') totalParcelasAtrasadas++;
        else totalParcelasPendentes++;
      });
    });
  });

  const dados = [];

  // Seção: Visão Geral
  dados.push(['📊 VISÃO GERAL']);
  dados.push(['']);
  dados.push(['Total de Clientes', totalClientes]);
  dados.push(['Clientes com Empréstimos Ativos', totalClientesComEmprestimo]);
  dados.push(['Clientes sem Empréstimos', totalClientes - totalClientesComEmprestimo]);
  dados.push(['Total de Empréstimos', totalEmprestimos]);
  dados.push(['Total de Parcelas', totalParcelasGeral]);
  dados.push(['']);

  // Seção: Situação das Parcelas
  dados.push(['📝 SITUAÇÃO DAS PARCELAS']);
  dados.push(['']);
  dados.push(['Parcelas Pagas', totalParcelasPagas]);
  dados.push(['Parcelas Atrasadas', totalParcelasAtrasadas]);
  dados.push(['Parcelas Pendentes (Em Dia)', totalParcelasPendentes]);
  dados.push(['']);

  // Seção: Valores Financeiros
  dados.push(['💰 VALORES FINANCEIROS']);
  dados.push(['']);
  dados.push(['Valor Original Total (sem juros)', valorOriginalTotal.toFixed(2)]);
  dados.push(['Valor Total c/ Juros de Contrato', valorComJurosContratoTotal.toFixed(2)]);
  dados.push(['Juros por Atraso (1%/dia)', valorJurosAtrasoTotal.toFixed(2)]);
  dados.push(['Total a Receber (c/ todos juros)', valorTotalAReceber.toFixed(2)]);
  dados.push(['Total Já Recebido', valorTotalPago.toFixed(2)]);
  dados.push(['Saldo Devedor Total', saldoDevedorTotal.toFixed(2)]);
  dados.push(['']);

  // Seção: Indicadores
  dados.push(['📈 INDICADORES']);
  dados.push(['']);
  const percRecuperado = valorTotalAReceber > 0
    ? ((valorTotalPago / valorTotalAReceber) * 100).toFixed(2)
    : 0;
  const percAtrasadas = totalParcelasGeral > 0
    ? ((totalParcelasAtrasadas / totalParcelasGeral) * 100).toFixed(2)
    : 0;

  dados.push(['% Recuperado', percRecuperado + '%']);
  dados.push(['% Parcelas em Atraso', percAtrasadas + '%']);
  dados.push(['']);
  dados.push(['Gerado em:', new Date().toLocaleString('pt-BR')]);

  const worksheet = XLSX.utils.aoa_to_sheet(dados);

  // Definir larguras das colunas
  worksheet['!cols'] = [
    { wch: 40 }, // Descrição
    { wch: 20 }, // Valor
  ];

  return worksheet;
}
