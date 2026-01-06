import { useState, useEffect } from "react";

const PIN_STORAGE_KEY = "agiotagem_pin";

function PINProtection({ children }) {
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasPIN, setHasPIN] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Verifica se já existe um PIN configurado
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    if (storedPin) {
      setHasPIN(true);
    } else {
      setIsConfiguring(true);
    }
  }, []);

  const handleConfigurePin = () => {
    if (newPin.length < 4) {
      setError("O PIN deve ter pelo menos 4 dígitos");
      return;
    }

    if (newPin !== confirmPin) {
      setError("Os PINs não coincidem");
      return;
    }

    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    setHasPIN(true);
    setIsConfiguring(false);
    setNewPin("");
    setConfirmPin("");
    setError("");
  };

  const handleUnlock = () => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    if (pin === storedPin) {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("PIN incorreto!");
      setPin("");
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      action();
    }
  };

  const handleResetPin = () => {
    if (
      window.confirm(
        "ATENÇÃO: Ao resetar o PIN, você perderá o acesso aos dados se esquecer o novo PIN. Deseja continuar?"
      )
    ) {
      localStorage.removeItem(PIN_STORAGE_KEY);
      setHasPIN(false);
      setIsConfiguring(true);
      setPin("");
      setError("");
    }
  };

  if (isUnlocked) {
    return children;
  }

  return (
    <div className="pin-overlay">
      <div className="pin-container">
        {isConfiguring ? (
          <>
            <div className="pin-header">
              <h2>🔒 Configurar PIN de Segurança</h2>
              <p>Defina um PIN de 4-6 dígitos para proteger seus dados</p>
            </div>

            <div className="pin-form">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                placeholder="Digite o PIN (4-6 dígitos)"
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                onKeyPress={(e) => handleKeyPress(e, handleConfigurePin)}
                className="pin-input"
                autoFocus
              />

              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                placeholder="Confirme o PIN"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                onKeyPress={(e) => handleKeyPress(e, handleConfigurePin)}
                className="pin-input"
              />

              {error && <div className="pin-error">{error}</div>}

              <button onClick={handleConfigurePin} className="btn-pin-submit">
                Configurar PIN
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="pin-header">
              <h2>🔒 Sistema Protegido</h2>
              <p>Digite seu PIN para acessar</p>
            </div>

            <div className="pin-form">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                placeholder="Digite o PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                onKeyPress={(e) => handleKeyPress(e, handleUnlock)}
                className="pin-input"
                autoFocus
              />

              {error && <div className="pin-error">{error}</div>}

              <button onClick={handleUnlock} className="btn-pin-submit">
                Desbloquear
              </button>

              <button onClick={handleResetPin} className="btn-pin-reset">
                Esqueci o PIN
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PINProtection;
