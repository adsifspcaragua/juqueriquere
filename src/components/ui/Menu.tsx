import data from '../../data.json';
import type Trilha from '../../pages/Trilhas/TrilhaInfo.tsx';
import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';
import { useState } from 'react';
import './Menu.css';

interface menuProps {
    ativo: boolean;
    onChoice: () => void;
}

export default function Menu({ ativo, onChoice }: menuProps) {

    const trilhas: Trilha[] = [...data.trilhas] as Trilha[]; // Asserção de tipo para garantir que temos um array de Trilha
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

    return (
        <div
            className={`menuOverlay ${ativo ? 'open' : ''}`}
            onClick={onChoice}
        >
            <div
                className={`menuWeb ${ativo ? 'open' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >

                <div className="menuLista vertical gap15">

                    <h1>Menu</h1>

                    <div className="menuLinks">
                        <SimpleButton path='/' raio='0'>Início</SimpleButton>
                        <SimpleButton path='/explorar' raio='0'>Mapa</SimpleButton>
                        <SimpleButton path='/sobre' raio='0'>Sobre</SimpleButton>
                    </div>

                    <div className="menuLinks">
                        {/* TRILHAS */}
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
                                        onClick={onChoice}
                                    >
                                        {trilha.nome}
                                    </SimpleButton>
                                ))}
                                <SimpleButton
                                    raio="0"
                                    path='/trilhas'
                                >
                                    <b>Ver todas as trilhas</b>
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
                                    >
                                        {ponto.nome}
                                    </SimpleButton>
                                ))}
                                <SimpleButton
                                    raio="0"
                                    path='/Pontos'
                                >
                                    <b>Ver todas os pontos</b>
                                </SimpleButton>
                            </div>
                        </div>
                    </div>
                    
                    {/* Acesso Temporário */}
                    <div className="menuLinks">
                        <SimpleButton path='/admin/login' raio='0'>Administração do Site</SimpleButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
