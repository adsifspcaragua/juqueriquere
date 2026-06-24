import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./components/Protected.tsx";

import ScrollToTop from "./components/Scroll.tsx";

import Trilha from './pages/Trilhas/Trilha.tsx';
import NotFound from './pages/NotFound.tsx';
import Trilhas from "./pages/Trilhas/Trilhas.tsx";
import Pontos from "./pages/Trilhas/Pontos.tsx";
import Ponto from "./pages/Trilhas/Ponto.tsx";

import Sobre from "./pages/Sobre.tsx";
import Mapa from "./pages/Mapa.tsx";
import Explorar from "./pages/Explorar.tsx";
import Admin from "./pages/Admin.tsx";
import Login from "./pages/Admin/Login.tsx";

import AdminTrilhas from "./pages/Admin/AdminTrilhas.tsx";
import CadastrarTrilha from "./pages/Admin/CadastrarTrilha.tsx";
import EditarTrilha from "./pages/Admin/EditarTrilha.tsx";

import AdminPontos from "./pages/Admin/AdminPontos.tsx";
import AdminSobre from "./pages/Admin/AdminSobre.tsx";

import Header from './components/ui/Header.tsx';
import Footer from "./components/ui/Footer.tsx";
import SimpleButton from "./components/ui/buttons/SimpleButton.tsx";
import Scanner from "./components/Scanner.tsx";

import Logo from './assets/logo.webp';

import { useSync } from "./lib/hooks/useSync.ts";
import CadastrarPontoInteresse from "./pages/Admin/CadastrarPonto.tsx";


function PageTransition({ children }: { children: React.ReactNode }) {
	return (
		<motion.main
			initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
			animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
			transition={{ duration: 0.2 }}
		>
			{children}
		</motion.main>
	);
}

const HomePage = () => {
	const [openScanner, setOpenScanner] = useState(false);

	return (
		<PageTransition>
			<div className="paddingHeader"></div>

			<section className="conteudo vertical" id="inicio">
				<div className="vertical">

					<div className="bannerInicio horizontal">
						<div className="conteudo vertical">
							<img src={Logo} alt="Logo Parque" />

							<p>
								Localizado às margens do Rio Juqueriquerê, o Parque Natural Municipal do Juqueriquerê é a primeira unidade de conservação de proteção integral municipal, cujos objetivos básicos são a preservação dos ecossistemas e biodiversidade e a realização de pesquisa científica.
							</p>

							<SimpleButton raio="10" path="/sobre/">
								Mais informações
							</SimpleButton>
						</div>
					</div>

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

			{openScanner && (
				<Scanner onClose={() => setOpenScanner(false)} />
			)}
		</PageTransition>
	);
};

function AnimatedRoutes() {
	const location = useLocation();


	return (
		<>
			<Header />
			<div className="container">
				<ScrollToTop />
				<AnimatePresence mode="wait">
					<Routes
						location={location}
						key={location.pathname}
					>
						<Route
							path="/"
							element={<HomePage />}
						/>
						<Route
							path="/sobre"
							element={
								<PageTransition>
									<Sobre />
								</PageTransition>
							}
						/>
						<Route
							path="/mapa"
							element={
								<PageTransition>
									<Mapa />
								</PageTransition>
							}
						/>
						<Route
							path="/trilhas/"
							element={
								<PageTransition>
									<Trilhas />
								</PageTransition>
							}
						/>
						<Route
							path="/pontos/"
							element={
								<PageTransition>
									<Pontos />
								</PageTransition>
							}
						/>
						<Route
							path="/trilha/:id"
							element={
								<PageTransition>
									<Trilha />
								</PageTransition>
							}
						/>
						<Route
							path="/trilha/:id/ponto/:nomePonto"
							element={
								<PageTransition>
									<Ponto />
								</PageTransition>
							}
						/>
						<Route
							path="/explorar"
							element={
								<PageTransition>
									<Explorar />
								</PageTransition>
							}
						/>
						<Route
							path="/admin"
							element={
								<ProtectedRoute>
									<PageTransition>
										<Admin />
									</PageTransition>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/login"
							element={
								<PageTransition>
									<Login />
								</PageTransition>
							}
						/>
						<Route
							path="/admin/trilhas"
							element={
								<ProtectedRoute>
									<PageTransition>
										<AdminTrilhas />
									</PageTransition>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/trilhas/cadastrar"
							element={
									<PageTransition>
										<CadastrarTrilha />
									</PageTransition>
							}
						/>
						<Route
							path="/admin/trilhas/editar/:id"
							element={
								<ProtectedRoute>
									<PageTransition>
										<EditarTrilha />
									</PageTransition>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/pontos"
							element={
								<ProtectedRoute>
									<PageTransition>
										<AdminPontos />
									</PageTransition>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/pontos/cadastrar"
							element={
								<ProtectedRoute>
									<PageTransition>
										<CadastrarPontoInteresse />
									</PageTransition>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/sobre"
							element={
								<ProtectedRoute>
									<PageTransition>
										<AdminSobre />
									</PageTransition>
								</ProtectedRoute>
							}
						/>
						<Route
							path="*"
							element={
								<PageTransition>
									<NotFound />
								</PageTransition>
							}
						/>
					</Routes>
				</AnimatePresence>
			</div>
			<Footer />
		</>
	);
}

export default function App() {
	useSync();

	return (
		<Router>
			<AnimatedRoutes />
		</Router>
	);
}