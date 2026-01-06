/**
 * Cria as parcelas de um empréstimo
 * - Para 1x: 30% de juros sobre o total
 * - Para 2x: 60% de juros por parcela
 *
 * Exemplo: R$ 1.000
 * - 1x: R$ 1.000 + 30% = R$ 1.300
 * - 2x: R$ 500 + 60% = R$ 800 por parcela (total R$ 1.600)
 *
 * @param {number} valorTotal - Valor total do empréstimo
 * @param {number} numeroParcelas - Número de parcelas (1 ou 2)
 * @param {string} dataEmprestimo - Data do empréstimo
 * @returns {array} Array com as parcelas
 */
export function criarParcelas(valorTotal, numeroParcelas, dataEmprestimo) {
  const valor = parseFloat(valorTotal);

  // Divide o valor pelas parcelas
  const valorPorParcela = valor / numeroParcelas;

  // Define a taxa de juros baseada no número de parcelas
  // 1x = 30% de juros
  // 2x = 60% de juros por parcela
  const taxaJuros = numeroParcelas === 1 ? 0.30 : 0.60;

  // Aplica os juros em CADA parcela
  const valorParcelaComJuros = valorPorParcela + (valorPorParcela * taxaJuros);

  const parcelas = [];
  const dataBase = new Date(dataEmprestimo + 'T00:00:00');

  for (let i = 0; i < numeroParcelas; i++) {
    const dataVencimento = new Date(dataBase);
    dataVencimento.setDate(dataBase.getDate() + (30 * (i + 1))); // 30 dias por parcela

    parcelas.push({
      numero: i + 1,
      valor: parseFloat(valorParcelaComJuros.toFixed(2)),
      valorPago: 0,
      dataVencimento: dataVencimento.toISOString().split('T')[0],
      status: 'pendente'
    });
  }

  return parcelas;
}

/**
 * Calcula os juros de uma parcela
 * - 1% ao dia após o vencimento
 *
 * @param {object} parcela - Objeto da parcela
 * @returns {object} Objeto com informações do cálculo
 */
export function calcularJurosParcela(parcela) {
  const valorParcela = parseFloat(parcela.valor);
  const valorPago = parseFloat(parcela.valorPago) || 0;

  const dataVenc = new Date(parcela.dataVencimento + 'T00:00:00');
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Calcula dias de atraso
  const diasAtraso = hoje > dataVenc
    ? Math.floor((hoje - dataVenc) / (1000 * 60 * 60 * 24))
    : 0;

  // Juros de atraso: 1% ao dia sobre o valor da parcela
  const taxaJurosAtraso = 0.01;
  const jurosAtraso = diasAtraso > 0
    ? valorParcela * taxaJurosAtraso * diasAtraso
    : 0;

  // Total da parcela com juros
  const totalParcela = valorParcela + jurosAtraso;

  // Saldo devedor da parcela
  const saldoDevedor = Math.max(totalParcela - valorPago, 0);

  // Determina status
  let status;
  if (saldoDevedor === 0 && valorPago > 0) {
    status = 'pago';
  } else if (diasAtraso > 0) {
    status = 'atrasado';
  } else if (hoje <= dataVenc) {
    status = 'ativo';
  } else {
    status = 'pendente';
  }

  return {
    valorParcela,
    jurosAtraso: parseFloat(jurosAtraso.toFixed(2)),
    totalParcela: parseFloat(totalParcela.toFixed(2)),
    valorPago,
    saldoDevedor: parseFloat(saldoDevedor.toFixed(2)),
    diasAtraso,
    status
  };
}

/**
 * Calcula o resumo total de um empréstimo com parcelas
 *
 * @param {object} emprestimo - Objeto do empréstimo
 * @returns {object} Resumo do empréstimo
 */
export function calcularResumoEmprestimo(emprestimo) {
  let totalPago = 0;
  let totalDevedor = 0;
  let totalJurosAtraso = 0;
  let todasPagas = true;
  let algumAtraso = false;

  emprestimo.parcelas.forEach(parcela => {
    const calc = calcularJurosParcela(parcela);
    totalPago += calc.valorPago;
    totalDevedor += calc.saldoDevedor;
    totalJurosAtraso += calc.jurosAtraso;

    if (calc.status !== 'pago') todasPagas = false;
    if (calc.status === 'atrasado') algumAtraso = true;
  });

  const valorTotal = emprestimo.valorTotal;
  const valorComJuros = emprestimo.parcelas.reduce((acc, p) => acc + p.valor, 0);
  const totalComJurosAtraso = valorComJuros + totalJurosAtraso;

  let status;
  if (todasPagas) {
    status = 'pago';
  } else if (algumAtraso) {
    status = 'atrasado';
  } else {
    status = 'ativo';
  }

  return {
    valorOriginal: valorTotal,
    valorComJuros: parseFloat(valorComJuros.toFixed(2)),
    jurosAtraso: parseFloat(totalJurosAtraso.toFixed(2)),
    totalComJurosAtraso: parseFloat(totalComJurosAtraso.toFixed(2)),
    totalPago: parseFloat(totalPago.toFixed(2)),
    saldoDevedor: parseFloat(totalDevedor.toFixed(2)),
    numeroParcelas: emprestimo.numeroParcelas,
    status
  };
}

/**
 * Formata valor para moeda brasileira
 * @param {number} valor
 * @returns {string}
 */
export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata data para o padrão brasileiro
 * @param {string} dataISO - Data no formato ISO
 * @returns {string}
 */
export function formatarData(dataISO) {
  if (!dataISO) return '';
  const data = new Date(dataISO + 'T00:00:00');
  return data.toLocaleDateString('pt-BR');
}

/**
 * Calcula quantos dias faltam para o vencimento
 * @param {string} dataVencimento - Data de vencimento no formato ISO
 * @returns {number} Dias até o vencimento (negativo se atrasado)
 */
export function calcularDiasParaVencimento(dataVencimento) {
  const dataVenc = new Date(dataVencimento + 'T00:00:00');
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diff = dataVenc - hoje;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se a parcela está próxima do vencimento
 * @param {object} parcela - Objeto da parcela
 * @param {number} diasAlerta - Dias antes do vencimento para alertar (padrão: 3)
 * @returns {object} Status de alerta
 */
export function verificarAlertaVencimento(parcela, diasAlerta = 3) {
  const calc = calcularJurosParcela(parcela);

  if (calc.status === 'pago') {
    return { tipo: 'pago', urgencia: 0 };
  }

  const diasRestantes = calcularDiasParaVencimento(parcela.dataVencimento);

  if (diasRestantes < 0) {
    return { tipo: 'atrasado', urgencia: 3, diasRestantes };
  } else if (diasRestantes === 0) {
    return { tipo: 'venceHoje', urgencia: 2, diasRestantes };
  } else if (diasRestantes <= diasAlerta) {
    return { tipo: 'venceSoon', urgencia: 1, diasRestantes };
  }

  return { tipo: 'normal', urgencia: 0, diasRestantes };
}
