import data from '../../data.json';
import { type Trilha } from '../../pages/Trilhas/TrilhaInfo.tsx';
import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';
import { useState } from 'react';
import './Menu.css';
import { icons } from './icons.tsx';

interface menuProps {
    ativo: boolean;
    onChoice: () => void;
}

export default function Menu({ ativo, onChoice }: menuProps) {
    const { Explorar, Sobre, Home } = icons.default;

    const trilhas: Trilha[] = [...data.trilhas];
    const [trilhasShow, setTrilhasShow] = useState(false);
    const [pontosShow, setPontosShow] = useState(false);

    const buttonMenu = (path?: string, title?: string, icon?: string, dark?: boolean) => {
        return (
            <div className={`MenuGroup ${dark ? 'dark' : ''}`}>
                <SimpleButton
                    tema='dark'
                    icon="none"
                    raio="0"
                    path={`/${path}`}
                >
                    <h3>{title}</h3>
                    <img src={icon}/>
                </SimpleButton>
            </div>
        );
    }

    return (
        <div
            className={`menuOverlay ${ativo ? 'open' : ''}`}
            onClick={onChoice}
        >
            <div
                className={`menuWeb ${ativo ? 'open' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >

                <div className="menuLista vertical gap5">

                    <h1>Menu</h1>

                    {/*fazer renderização condicional dps, apenas para web*/}
                    {buttonMenu("", "Início", Home, true)}
                    {buttonMenu("sobre", "Sobre", Sobre, true)}
                    {buttonMenu("explorar", "Mapa", Explorar, true)}
                    
                    {/* TRILHAS */}
                    <div className='MenuGroup'>

                        <SimpleButton
                            icon="none"
                            raio="0"
                            onClick={() => setTrilhasShow(!trilhasShow)}
                        >
                            <h3>Trilhas</h3>
                            <h3>{trilhasShow ? '-' : '+'}</h3>
                        </SimpleButton>

                        <div className={`children ${trilhasShow ? 'open' : ''}`}>

                            {trilhas.map((trilha) => (
                                <SimpleButton
                                    key={trilha.nome + "option"}
                                    tema='dark'
                                    raio="0"
                                    path={`/trilha/${trilha.id}`}
                                    onClick={onChoice}
                                >
                                    {trilha.nome}
                                </SimpleButton>
                            ))}
                            <SimpleButton
                                raio="0"
                                path='/explorar'
                            >
                                <h3>Ver todas as trilhas</h3>
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
                            <h3>Pontos</h3>
                            <h3>{pontosShow ? '-' : '+'}</h3>
                        </SimpleButton>

                        <div className={`children ${pontosShow ? 'open' : ''}`}>

                            {trilhas.map((trilha) =>
                                trilha.pontos_interesse.map((ponto, index) => (
                                    <SimpleButton
                                        key={`${trilha.id}-${index}`}
                                        icon='none'
                                        tema='dark'
                                        raio="0"
                                    >
                                        {ponto.planta || ponto.misc || ponto.caminho}
                                    </SimpleButton>
                                ))
                            )}
                            

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}