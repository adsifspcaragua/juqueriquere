// PÁGINA INICIAL

import { useEffect, useState } from "react";
import { usePageTitle } from "../lib/hooks/usePageTitle.ts";

import SimpleButton from "../components/ui/buttons/SimpleButton.tsx";
import Scanner from "../components/Scanner.tsx";

import Logo from '../assets/logo.webp';

import { IosInstallPrompt } from "../utils/IosInstallPrompt.tsx";

export default function index(){
	
	/* Começo da Função Instalar App */
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e);
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
	};

	/* Fim da Função Instalar App */

    usePageTitle("Início");
	
	const [openScanner, setOpenScanner] = useState(false);

	return (
        <>
			<IosInstallPrompt/>
			

			<div className="vertical gap30">
				<div className="bannerInicio horizontal">
					<div className="conteudo vertical">
						<div className="paddingHeader"></div>
						<img src={Logo} alt="Logo Parque" />
						<p>
							Localizado às margens do Rio Juqueriquerê, o Parque Natural Municipal do Juqueriquerê é a primeira unidade de conservação de proteção integral municipal, cujos objetivos básicos são a preservação dos ecossistemas e biodiversidade e a realização de pesquisa científica.
						</p>
						<SimpleButton raio="10" path="/sobre/">
							Mais informações
						</SimpleButton>
					</div>
				</div>
				<section className="vertical gap30" id="inicio">
					<div className="vertical">
						<div className="vertical" id="scannercard">
							<div className="vertical">
								<h1>Vamos explorar?</h1>
								<p>
									Cada QR Code é uma nova descoberta!
								</p>
								<p>
									Use o leitor e embarque em uma jornada cheia de histórias e curiosidades pelo parque.
								</p>
							</div>
							<SimpleButton
								tema="dark"
								icon="QR"
								raio="10"
								onClick={() => setOpenScanner(true)}
							>
								Ler QR Code
							</SimpleButton>
						</div>
					</div>

					<div className="vertical">
						<div className="pwaCard card vertical">
							<div className="vertical">
								<h1>Instale o Juqueriquerê</h1>
								<p>
									Acesse as trilhas offline de forma mais rápida!
								</p>
							</div>
							<SimpleButton
								tema='dark'
								raio='10'
								onClick={handleInstallClick}
							>
									Instalar
							</SimpleButton>
						</div>
					</div>

					<div className="carrossel horizontal" id="CarrosselInicio">
						<div className="carrosselCard vertical gap15" id="trilhas">
							<div className="vertical">
								<h1>Trilhas</h1>
								<p>
									Explore caminhos serenos, admire vistas deslumbrantes e encontre a paz na jornada.
								</p>
							</div>
							<SimpleButton path="/trilhas" raio="10">
								Ir para Trilhas
							</SimpleButton>
						</div>
						<div className="carrosselCard vertical gap15" id="especies">
							<div className="vertical">
								<h1>Pontos de Interesse</h1>
								<p>
									Descubra as espécies nativas do parque e aprenda mais sobre os seres que habitam esse espaço.
								</p>
							</div>
							<SimpleButton path="/pontos" raio="10">
								Ir para Pontos de Interesse
							</SimpleButton>
						</div>
					</div>
				</section>

				<section className="vertical gap5 conteudo">
					<h1>Mais vistos</h1>
					<p>Em breve</p>
				</section>
			</div>

			{openScanner && (
				<Scanner onClose={() => setOpenScanner(false)} />
			)}
        </>
	);
}