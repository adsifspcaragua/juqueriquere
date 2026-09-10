import { useState, useEffect } from 'react';
import SimpleButton from '../components/ui/buttons/SimpleButton';
import { createPortal } from "react-dom";
import icon from '../assets/icon.png';

export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			setDeferredPrompt(e);

			const hidePrompt = localStorage.getItem('hideInstallPrompt');
			const bannerFechadoNestaSessao = sessionStorage.getItem('bannerFechadoTemporariamente');
			
			if (hidePrompt !== 'true' && bannerFechadoNestaSessao !== 'true') {
				setShowBanner(true);
			}
		};

		const handleFecharBanner = () => {
			setShowBanner(false);
			sessionStorage.setItem('bannerFechadoTemporariamente', 'true');
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('fecharBannerPWA', handleFecharBanner);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('fecharBannerPWA', handleFecharBanner);
			sessionStorage.removeItem('bannerFechadoTemporariamente');
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

	const handleNeverShowAgainClick = () => {
		localStorage.setItem('hideInstallPrompt', 'true');
        setShowBanner(false);
        setDeferredPrompt(null);
	};

	if (!showBanner) return null;

	return (
		<>
			{createPortal(
				<div className="modal vertical center">
					<div className='pwaCard card vertical'>
						<div className='vertical center gap15'>
							<img src={icon} style={{width:70}}/>
							<div className="vertical gap5">
								<h2>Instale o App</h2>
								<p>Acesse as trilhas offline de forma mais rápida!</p>
							</div>
						</div>

						<div className='vertical btnFull justifyCenter gap5'>
							<SimpleButton
								tema='dark'
								raio='10'
								onClick={handleInstallClick}
							>
								Instalar
							</SimpleButton>

							<SimpleButton
								tema='light'
								raio='10'
								icon='none'
								onClick={handleDismissClick}
							>
								Agora não
							</SimpleButton>

							<SimpleButton
								raio='10'
								icon='none'
								onClick={handleNeverShowAgainClick}
							>
								Não mostrar novamente
							</SimpleButton>
						</div>
					</div>

				</div>,
				document.body
			)}
		</>
	);
}