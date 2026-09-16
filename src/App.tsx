import { Suspense, useEffect } from "react";
import { BrowserRouter as Router, useLocation, useRoutes } from "react-router-dom";
import routes from "~react-pages";
import { sincronizarImagens } from "./lib/services/sync.ts";

import { AnimatePresence, motion } from "framer-motion";

import { useSync } from "./lib/hooks/useSync.ts";
import Header from './components/ui/Header.tsx';
import Footer from "./components/ui/Footer.tsx";
import ScrollToTop from "./components/Scroll.tsx";

import './style.css'

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
                    {/* A key garante que o Framer Motion saiba quando a rota mudou */}
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
        // Verifica se o app está rodando instalado (Standalone) ou no navegador
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                          || (navigator as any).standalone;

        if (isStandalone && navigator.onLine) {
            // Executa em segundo plano sem travar a interface do usuário
            sincronizarImagens().catch(console.error);
        }
    }, []);

    return (
        <Router>
            <AnimatedRoutes />
        </Router>
    );
}