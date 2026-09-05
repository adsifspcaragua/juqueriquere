import { useState, useEffect } from 'react';
import SimpleButton from '../components/ui/buttons/SimpleButton';
import { createPortal } from "react-dom";

export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();

			setDeferredPrompt(e);
			setShowBanner(true);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		deferredPrompt.prompt();

		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			console.log('Usuário aceitou a instalação');
		} else {
			console.log('Usuário recusou a instalação');
		}

		setDeferredPrompt(null);
		setShowBanner(false);
	};

	const handleDismissClick = () => {
		setShowBanner(false);
	};

	if (!showBanner) return null;

	return (
		<>
			{createPortal(
				<div className="modal vertical center">
					<div className='pwaCard card vertical'>
						<div className='vertical gap5'>
							<h2>Instale o Juqueriquerê</h2>
							<p>Acesse as trilhas offline de forma mais rápida!</p>
						</div>

						<div className='horizontal justifyCenter gap15'>
							<SimpleButton
								tema='light'
								raio='10'
								icon='none'
								onClick={handleDismissClick}
							>
								Agora não
							</SimpleButton>

							<SimpleButton
								tema='dark'
								raio='10'
								onClick={handleInstallClick}
							>
								Instalar
							</SimpleButton>
						</div>
					</div>

				</div>,
				document.body
			)}
		</>
	);
}