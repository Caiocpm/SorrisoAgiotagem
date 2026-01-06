import { useState } from 'react';
import { adicionarEmprestimo } from '../utils/db';
import { criarParcelas } from '../utils/calculos';

function FormularioEmprestimo({ clienteId, clienteNome, onEmprestimoAdicionado, onCancelar }) {
  const [formData, setFormData] = useState({
    valorTotal: '',
    valorTotalFormatado: '0,00',
    numeroParcelas: '1',
    dataEmprestimo: new Date().toISOString().split('T')[0]
  });

  const formatarValorMonetario = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleValorChange = (e) => {
    const valorDigitado = e.target.value;
    const valorFormatado = formatarValorMonetario(valorDigitado);
    const apenasNumeros = valorDigitado.replace(/\D/g, '');
    const valorNumerico = (Number(apenasNumeros) / 100).toFixed(2);

    setFormData(prev => ({
      ...prev,
      valorTotal: valorNumerico,
      valorTotalFormatado: valorFormatado
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calcularValorParcela = () => {
    const valor = parseFloat(formData.valorTotal);
    if (isNaN(valor) || valor <= 0) return '0,00';

    const numeroParcelas = parseInt(formData.numeroParcelas);

    // Divide o valor pelas parcelas
    const valorPorParcela = valor / numeroParcelas;

    // Define a taxa de juros baseada no número de parcelas
    // 1x = 30% de juros
    // 2x = 60% de juros por parcela
    const taxaJuros = numeroParcelas === 1 ? 0.30 : 0.60;

    // Aplica os juros em CADA parcela
    const valorParcelaComJuros = valorPorParcela + (valorPorParcela * taxaJuros);

    return valorParcelaComJuros.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.valorTotal || parseFloat(formData.valorTotal) <= 0) {
      alert('Informe um valor válido para o empréstimo!');
      return;
    }

    try {
      const parcelas = criarParcelas(
        formData.valorTotal,
        parseInt(formData.numeroParcelas),
        formData.dataEmprestimo
      );

      const novoEmprestimo = {
        clienteId,
        valorTotal: parseFloat(formData.valorTotal),
        numeroParcelas: parseInt(formData.numeroParcelas),
        dataEmprestimo: formData.dataEmprestimo,
        parcelas
      };

      await adicionarEmprestimo(novoEmprestimo);

      if (onEmprestimoAdicionado) {
        onEmprestimoAdicionado();
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao adicionar empréstimo');
    }
  };

  return (
    <div className="emprestimo-form-overlay">
      <div className="emprestimo-form-container">
        <h3>Novo Empréstimo para {clienteNome}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="valorTotal">Valor do Empréstimo (R$) *</label>
            <input
              type="text"
              id="valorTotal"
              name="valorTotal"
              value={formData.valorTotalFormatado}
              onChange={handleValorChange}
              placeholder="0,00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="numeroParcelas">Número de Parcelas *</label>
            <select
              id="numeroParcelas"
              name="numeroParcelas"
              value={formData.numeroParcelas}
              onChange={handleChange}
              required
            >
              <option value="1">1x - À vista</option>
              <option value="2">2x - Parcelado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dataEmprestimo">Data do Empréstimo *</label>
            <input
              type="date"
              id="dataEmprestimo"
              name="dataEmprestimo"
              value={formData.dataEmprestimo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="resumo-emprestimo">
            <p><strong>Resumo:</strong></p>
            <p>Valor da parcela: R$ {calcularValorParcela()}</p>
            <p className="info-juros">
              * Juros de {parseInt(formData.numeroParcelas) === 1 ? '30%' : '60% por parcela'} já incluídos
            </p>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Adicionar Empréstimo
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioEmprestimo;
