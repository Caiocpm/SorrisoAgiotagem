import { useState } from "react";
import CadastroCliente from "./components/CadastroCliente";
import ListaClientes from "./components/ListaClientes";
import Controle from "./components/Controle";
import NotificacoesVencimento from "./components/NotificacoesVencimento";
import PINProtection from "./components/PINProtection";
import InstalarPWA from "./components/InstalarPWA";
import logo from "./logo.png";

function App() {
  const [abaAtiva, setAbaAtiva] = useState("cadastro");
  const [clienteAdicionado, setClienteAdicionado] = useState(null);
  const [atualizarDados, setAtualizarDados] = useState(0);

  const handleClienteAdicionado = (novoCliente) => {
    setClienteAdicionado(novoCliente);
    setAtualizarDados(prev => prev + 1);
  };

  const handleDadosAtualizados = () => {
    setAtualizarDados(prev => prev + 1);
  };

  return (
    <PINProtection>
      <div className="container">
        <div className="header">
          <img src={logo} alt="Logo" className="logo" />
          <NotificacoesVencimento atualizarDados={atualizarDados} />
        </div>

        <div className="tabs">
          <button
            className={`tab ${abaAtiva === "cadastro" ? "active" : ""}`}
            onClick={() => setAbaAtiva("cadastro")}
          >
            Cadastro
          </button>
          <button
            className={`tab ${abaAtiva === "lista" ? "active" : ""}`}
            onClick={() => setAbaAtiva("lista")}
          >
            Lista
          </button>
          <button
            className={`tab ${abaAtiva === "controle" ? "active" : ""}`}
            onClick={() => setAbaAtiva("controle")}
          >
            Controle
          </button>
        </div>

        <div className="tab-content">
          {abaAtiva === "cadastro" && (
            <CadastroCliente onClienteAdicionado={handleClienteAdicionado} />
          )}
          {abaAtiva === "lista" && (
            <ListaClientes
              clienteAdicionado={clienteAdicionado}
              onDadosAtualizados={handleDadosAtualizados}
            />
          )}
          {abaAtiva === "controle" && <Controle key={atualizarDados} />}
        </div>
      </div>

      <InstalarPWA />
    </PINProtection>
  );
}

export default App;
