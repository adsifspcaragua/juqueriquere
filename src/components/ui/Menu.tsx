import data from '../../data.json';
import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';
import { useState } from 'react';
import './Menu.css';

interface menuProps {
    ativo: boolean;
    onChoice: () => void;
}

export default function Menu( {ativo, onChoice} : menuProps) {
    const trilhas = [...data.trilhas];
    
    const Trilhas = () => {
        
        const [trilhasShow, setTrrilhasShow] = useState(false);
        const trilhasList = trilhas.map((trilha) => (
            <SimpleButton key={trilha.nome + "option"} tema='dark' raio="0" path={`/trilha/${trilha.id}` } onClick={onChoice}>
                {trilha.nome}
            </SimpleButton>
        )); 
        
        return(
            <div className='MenuGroup'>
                <SimpleButton icon="none" raio="0" onClick={() => setTrrilhasShow(!trilhasShow)}>
                    <h3>Trilhas </h3>
                    <h3>{trilhasShow ? '-' : '+'}</h3>
                </SimpleButton>
                <div className={`children ${trilhasShow ? 'open' : ''}`}>
                    {trilhasList}
                </div>
            </div>
        )
    }

    const Pontos = () => {
        
        const [pontosShow, setPontosShow] = useState(false);
        const pontosList = trilhas.map((trilha) => (
            trilha.pontos_interesse.map((ponto, index) => (
                <SimpleButton key={index} icon='none' tema='dark' raio="0">
                    {ponto.planta}
                </SimpleButton>
            ))
        ));

        return(
            <div className='MenuGroup'>
                <SimpleButton icon="none" raio="0" onClick={() => setPontosShow(!pontosShow)}>
                    <h3>Pontos </h3>
                    <h3>{pontosShow ? '-' : '+'}</h3>
                </SimpleButton>
                <div className={`children ${pontosShow ? 'open' : ''}`}>
                    {pontosList}
                </div>
            </div>
        )
    }
    
    return(
        <>
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
                        <Trilhas />
                        <Pontos />
                    </div>
                </div>
            </div>
            

        </>
    )
}