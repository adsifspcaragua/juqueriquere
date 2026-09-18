import { Suspense, useEffect } from "react";
import { BrowserRouter as Router, useLocation, useRoutes } from "react-router-dom";
import routes from "~react-pages";
import { sincronizarImagens, sincronizarTrilhas, sincronizarPontos } from "./lib/services/sync.ts";

import { AnimatePresence, motion } from "framer-motion";

import { useSync } from "./lib/hooks/useSync.ts";
import Header from './components/ui/Header.tsx';
import Footer from "./components/ui/Footer.tsx";
import ScrollToTop from "./components/Scroll.tsx";

import './style.css';

interface NavigatorIOS extends Navigator {
  standalone?: boolean;
}

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

function AnimatedRoutes() {
  const location = useLocation();
  const element = useRoutes(routes); 

  return (
    <>
      <Header />
      <div className="container">
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Suspense fallback={<div>Carregando...</div>}>
              {element}
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}

export default function App() {
  useSync();

  useEffect(() => {
    const executarSincronizacaoCompleta = async () => {
      if (!navigator.onLine) return;
      try {
        console.log("Iniciando sincronização completa de dados e imagens...");
        await Promise.all([
          sincronizarTrilhas().catch(console.error),
          sincronizarPontos().catch(console.error),
        ]);
        await sincronizarImagens().catch(console.error);
        console.log("Sincronização concluída com sucesso!");
      } catch (error) {
        console.error("Erro durante a sincronização:", error);
      }
    };

    // 1. Executa se o app for aberto instalado (modo Standalone)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as NavigatorIOS).standalone === true;

    if (isStandalone && navigator.onLine) {
      executarSincronizacaoCompleta();
    }

    // 2. Executa quando o navegador conclui a instalação do PWA
    const handleAppInstalled = () => {
      console.log("PWA instalado! Baixando assets para uso offline...");
      executarSincronizacaoCompleta();
    };

    // 3. Permite disparar sincronização manual via evento CustomEvent
    const handleForceSync = () => {
      executarSincronizacaoCompleta();
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('iniciarSincronizacaoOffline', handleForceSync);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('iniciarSincronizacaoOffline', handleForceSync);
    };
  }, []);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}