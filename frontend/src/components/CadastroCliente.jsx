import { useState } from "react";
import { adicionarCliente } from "../utils/db";

function CadastroCliente({ onClienteAdicionado }) {
  const [formData, setFormData] = useState({
    nome: "",
    celular: "",
    endereco: "",
  });
  const [mensagem, setMensagem] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.celular) {
      alert("Nome e celular são obrigatórios!");
      return;
    }

    try {
      const novoCliente = await adicionarCliente(formData);
      setMensagem("Cliente cadastrado com sucesso!");
      setFormData({
        nome: "",
        celular: "",
        endereco: "",
      });

      setTimeout(() => setMensagem(""), 3000);

      if (onClienteAdicionado) {
        onClienteAdicionado(novoCliente);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao cadastrar cliente");
    }
  };

  const handleLimpar = () => {
    setFormData({
      nome: "",
      celular: "",
      endereco: "",
    });
    setMensagem("");
  };

  return (
    <div className="form-container">
      {mensagem && <div className="success-message">{mensagem}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite o nome completo"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="celular">Celular *</label>
          <input
            type="tel"
            id="celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endereco">Endereço</label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Digite o endereço completo"
          />
        </div>

        <div>
          <button type="submit" className="btn btn-primary">
            Cadastrar Cliente
          </button>
        </div>
      </form>
    </div>
  );
}

export default CadastroCliente;
