import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Trilha from './pages/Trilhas/Trilha.tsx';
import NotFound from './pages/NotFound.tsx';
import Trilhas from "./pages/Trilhas/Trilhas.tsx";
import Sobre from "./pages/Sobre.tsx";
import Header from './components/ui/Header.tsx';
import Footer from "./components/ui/Footer.tsx";
import SimpleButton from "./components/ui/buttons/SimpleButton.tsx";
import Scanner from "./components/Scanner.tsx";
import Logo from './assets/logo.png';
import Mapa from "./pages/Mapa.tsx";
import Explorar from "./pages/Explorar.tsx";

const HomePage = () => {
	const [openScanner, setOpenScanner] = useState(false);

	return (
		<>
      <div className="paddingHeader"></div>
			<section className="conteudo vertical" id="inicio">
				<div className="vertical">
					
					<div className="bannerInicio horizontal">
						<div className="conteudo vertical">
							<img src={Logo} />
							<p>
								Localizado às margens do Rio Juqueriquerê, o Parque Natural Municipal do Juqueriquerê é a primeira unidade de conservação de proteção integral municipal, cujos objetivos básicos são a preservação dos ecossistemas e biodiversidade e a realização de pesquisa científica.
							</p>
							<SimpleButton raio="10">Mais informações</SimpleButton>
						</div>
					</div>

					<div className="vertical" id="scannercard">
						<div className="vertical">
							<h1>Vamos explorar?</h1>
							<p>Cada QR Code é uma nova descoberta!</p>
							<p>Use o leitor e embarque em uma jornada cheia de histórias e curiosidades pelo parque.</p>
						</div>
						<SimpleButton tema="dark" icon="QR" raio="10" onClick={() => setOpenScanner(true)}>Ler QR Code</SimpleButton>
					</div>
				</div>

				<div className="carrossel horizontal">
					<div className="carrosselCard vertical gap5" id="trilhas">
						<h1>Trilhas</h1>
						<p>Explore caminhos serenos, admire vistas deslumbrantes e encontre a paz na jornada.</p>
						<SimpleButton path="/trilhas/" raio="10">Ir para Trilhas</SimpleButton>
					</div>
					<div className="carrosselCard vertical gap5" id="especies">
						<h1>Espécies Nativas</h1>
						<p>Descubra as espécies nativas do parque e aprenda mais sobre os seres que habitam esse espaço.</p>
						<SimpleButton path="/trilhas/" raio="10">Ir para Espécies Nativas</SimpleButton>
					</div>
					<div className="carrosselCard vertical gap5" id="passaros">
						<h1>Pássaros</h1>
						<p>Observe pássaros em seu habitat natural e perceba sons, cores e comportamentos ao longo do passeio.</p>
						<SimpleButton path="/trilhas/" raio="10">Ir para Pássaros</SimpleButton>
					</div>
				</div>

			</section>

			{openScanner && (
				<Scanner onClose={() => setOpenScanner(false)} />
			)}
		</>
	);
};


export default function App() {
	return (
		<>
			<Router>
				<Header />
				<div className="container">
					<Routes>
						<Route path="/" element={<HomePage />} />
            			<Route path="/sobre" element={<Sobre />} />
						<Route path="/mapa" element={<Mapa />} />
						<Route path="/trilhas/" element={<Trilhas />} />
						<Route path="/trilha/:id" element={<Trilha />} />
						<Route path="/explorar" element={<Explorar />} />
						<Route path='*' element={<NotFound />} />
					</Routes>
				</div>
				<Footer />
			</Router>

		</>
	)
};


