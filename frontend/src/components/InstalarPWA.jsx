import { useState, useEffect } from "react";

function InstalarPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mostrarBotao, setMostrarBotao] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Previne o prompt automático
      e.preventDefault();
      // Salva o evento para usar depois
      setDeferredPrompt(e);
      // Mostra o botão de instalação
      setMostrarBotao(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Verifica se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setMostrarBotao(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstalar = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostra o prompt de instalação
    deferredPrompt.prompt();

    // Aguarda a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA instalado com sucesso");
    } else {
      console.log("Instalação do PWA recusada");
    }

    // Limpa o prompt
    setDeferredPrompt(null);
    setMostrarBotao(false);
  };

  const handleFechar = () => {
    setMostrarBotao(false);
  };

  if (!mostrarBotao) {
    return null;
  }

  return (
    <div className="instalar-pwa-banner">
      <div className="instalar-pwa-conteudo">
        <div className="instalar-pwa-info">
          <strong>📱 Instalar App</strong>
          <p>Adicione à tela inicial para acesso rápido</p>
        </div>
        <div className="instalar-pwa-acoes">
          <button onClick={handleInstalar} className="btn-instalar-pwa">
            Instalar
          </button>
          <button onClick={handleFechar} className="btn-fechar-pwa">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstalarPWA;
