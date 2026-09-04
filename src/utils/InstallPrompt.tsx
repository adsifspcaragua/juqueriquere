import { useState, useEffect } from 'react';

export function InstallPrompt() {
  // Guarda o evento nativo do navegador
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  // Controla se o nosso banner customizado deve aparecer
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Impede o navegador de mostrar o aviso padrão dele imediatamente
      e.preventDefault();
      // Salva o evento para usarmos quando o usuário clicar no nosso botão
      setDeferredPrompt(e);
      // Mostra o nosso banner na tela
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Dispara o pop-up nativo de instalação do navegador
    deferredPrompt.prompt();

    // Aguarda para ver se o usuário clicou em "Instalar" ou "Cancelar"
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou a instalação');
    } else {
      console.log('Usuário recusou a instalação');
    }

    // O prompt só pode ser usado uma vez, então limpamos ele
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  // Se não estiver pronto para instalar (ou já estiver instalado), não renderiza nada
  if (!showBanner) return null;

  // Aqui você estiliza como quiser (exemplo com Tailwind CSS)
  return (
    <div style={{
      position: 'fixed', bottom: '0', left: '0', width: '100%', 
      backgroundColor: '#008A66', color: 'white', padding: '16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: 9999, boxShadow: '0 -2px 10px rgba(0,0,0,0.2)'
    }}>
      <div>
        <h4 style={{ margin: 0, fontWeight: 'bold' }}>Instale o Juqueriquere</h4>
        <p style={{ margin: 0, fontSize: '14px' }}>Acesse as trilhas offline de forma mais rápida!</p>
      </div>
      <button 
        onClick={handleInstallClick} 
        style={{
          backgroundColor: 'white', color: '#008A66', border: 'none', 
          padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
        }}
      >
        Instalar
      </button>
    </div>
  );
}