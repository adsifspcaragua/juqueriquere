import data from '../../data.json';
import type Trilha from '../../pages/Trilhas/TrilhaInfo.tsx';
import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import './Menu.css';

import { getUser, logout } from '../../lib/auth'; // ajuste o path se necessário

interface menuProps {
    ativo: boolean;
    onChoice: () => void;
}

export default function Menu({ ativo, onChoice }: menuProps) {

    const trilhas: Trilha[] = [...data.trilhas] as Trilha[];

    const pontos = trilhas
        .flatMap((trilha) =>
            trilha.pontos_interesse.map((ponto) => ({
                ...ponto,
                trilhaId: trilha.id
            }))
        )
        .slice(0, 5);

    const [trilhasShow, setTrilhasShow] = useState(false);
    const [pontosShow, setPontosShow] = useState(false);

    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // pega sessão inicial
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });

        // escuta mudanças (LOGIN / LOGOUT)
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    async function handleLogout() {
        await logout();

        if (location.pathname.startsWith('/admin')) {
            navigate('/admin/login');
        }

        onChoice();
    }

    function closeMenu() {
        setTrilhasShow(false);
        setPontosShow(false);
        onChoice();
    }

    return (
        <div
            className={`menuOverlay ${ativo ? 'open' : ''}`}
            onClick={closeMenu}
        >
            <div
                className={`menuWeb ${ativo ? 'open' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >

                <div className="menuLista vertical gap15">

                    <h1>Menu</h1>

                    <div className="menuLinks">
                        <SimpleButton path='/' raio='0' onClick={closeMenu}>Início</SimpleButton>
                        <SimpleButton path='/explorar' raio='0' onClick={closeMenu}>Mapa</SimpleButton>
                        <SimpleButton path='/sobre' raio='0' onClick={closeMenu}>Sobre</SimpleButton>
                    </div>

                    {/* TRILHAS */}
                    <div className="menuLinks">
                        <div className='MenuGroup'>
                            <SimpleButton
                                icon="none"
                                raio="0"
                                onClick={() => setTrilhasShow(!trilhasShow)}
                            >
                                Trilhas
                                <div className={`arrow ${trilhasShow ? 'open' : ''}`}></div>
                            </SimpleButton>

                            <div className={`children ${trilhasShow ? 'open' : ''}`}>
                                {trilhas.slice(0, 5).map((trilha) => (
                                    <SimpleButton
                                        key={trilha.nome + "option"}
                                        raio="0"
                                        path={`/trilha/${trilha.id}`}
                                        onClick={closeMenu}
                                    >
                                        {trilha.nome}
                                    </SimpleButton>
                                ))}
                                <SimpleButton
                                    raio="0"
                                    path='/trilhas'
                                    onClick={closeMenu}
                                >
                                    <b>Ver todas as Trilhas</b>
                                </SimpleButton>
                            </div>

                        </div>

                        {/* PONTOS */}
                        <div className='MenuGroup'>
                            <SimpleButton
                                icon="none"
                                raio="0"
                                onClick={() => setPontosShow(!pontosShow)}
                            >
                                Pontos
                                <div className={`arrow ${pontosShow ? 'open' : ''}`}></div>
                            </SimpleButton>

                            <div className={`children ${pontosShow ? 'open' : ''}`}>
                                {pontos.map((ponto, index) => (
                                    <SimpleButton
                                        key={`${ponto.nome}-${index}`}
                                        raio="0"
                                        path={`/trilha/${ponto.trilhaId}/ponto/${encodeURIComponent(ponto.nome)}`}
                                        onClick={closeMenu}
                                    >
                                        {ponto.nome}
                                    </SimpleButton>
                                ))}
                                <SimpleButton
                                    raio="0"
                                    path='/pontos'
                                    onClick={closeMenu}
                                >
                                    <b>Ver tods os Pontos</b>
                                </SimpleButton>
                            </div>
                        </div>


                    </div>
                    <div className="menuLinks">
                        <div className='MenuGroup'>
                            <SimpleButton path='/admin' raio='0'>
                                Administração do Site
                            </SimpleButton>

                            {/* ADMIN / LOGOUT */}
                            {user ? (
                                <SimpleButton raio="0" onClick={handleLogout}>
                                    Logout
                                </SimpleButton>
                            ) : (
                                null
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}