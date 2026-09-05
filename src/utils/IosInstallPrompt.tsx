// IosInstallPrompt.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import SimpleButton from '../components/ui/buttons/SimpleButton';
import share from '../assets/icons/share.webp';
import add from '../assets/icons/add.webp';

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
		<>
			{createPortal(
				<div className="modal vertical center">
					<div className='pwaCard card vertical'>
						<div className='vertical gap5'>
							<h2>Instale o Juqueriquere no seu iPhone</h2>
							<p>Acesse as trilhas offline de forma mais rápida!</p>
							<p>Toque no botão <strong>Compartilhar</strong> <img src={share} id='shareIcon'/> e depois em <strong>"Adicionar à Tela de Início"</strong><img src={add} id='addIcon' />.</p>
						</div>

						<div className='horizontal justifyCenter gap15'>
							<SimpleButton
								tema='dark'
								raio='10'
								icon='none'
								onClick={() => setShowPrompt(false)}
							>
								Entendi
							</SimpleButton>
						</div>
					</div>

				</div>,
				document.body
			)}
		</>

	);
}