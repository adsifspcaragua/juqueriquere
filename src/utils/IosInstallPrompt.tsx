// IosInstallPrompt.tsx
import { useState, useEffect } from 'react';

export function IosInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Detecta se é um dispositivo Apple (iPhone/iPad)
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // 2. Detecta se o app JÁ ESTÁ instalado (rodando em modo standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         // @ts-ignore - Propriedade específica da Apple
                         window.navigator.standalone === true;

    // Se for iOS e ainda não estiver instalado, mostra o aviso
    if (isIos && !isStandalone) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '0', left: '0', width: '100%', 
      backgroundColor: '#f8f9fa', color: '#333', padding: '16px',
      textAlign: 'center', zIndex: 9999, borderTop: '1px solid #ddd',
      boxShadow: '0 -4px 10px rgba(0,0,0,0.1)'
    }}>
      <p style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 'bold' }}>
        Instale o Juqueriquere no seu iPhone
      </p>
      <p style={{ margin: 0, fontSize: '14px' }}>
        Toque no botão Compartilhar <strong>(ícone com seta pra cima no rodapé)</strong> e depois em <strong>"Adicionar à Tela de Início"</strong>.
      </p>
      <button 
        onClick={() => setShowPrompt(false)}
        style={{ marginTop: '12px', padding: '6px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        Entendi
      </button>
    </div>
  );
}