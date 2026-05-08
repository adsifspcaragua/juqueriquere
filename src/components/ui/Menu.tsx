import data from '../../data.json';
import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';
import { useState } from 'react';

interface menuProps {
    ativo: boolean;
    onChoice: () => void;
}

export default function Menu( {ativo, onChoice} : menuProps) {
    const displayValue = ativo ? "flex" : "none";
    const trilhas = [...data.trilhas];
    
    const Trilhas = () => {
        
        const [trilhasShow, setTrrilhasShow] = useState(false);
        const trilhasList = trilhas.map((trilha) => (
            <SimpleButton key={trilha.nome + "option"} tema='dark' raio="0" path={`/trilha/${trilha.id}` } onClick={onChoice}>
                {trilha.nome}
            </SimpleButton>
        )); 
        
        return(
            <div>
                <SimpleButton tema='dark' icon="none" raio="0" onClick={() => setTrrilhasShow(!trilhasShow)}>
                    <h3>Trilhas </h3>
                    <h3>{trilhasShow ? '-' : '+'}</h3>
                </SimpleButton>
                <div className='children'>
                    {trilhasShow ? trilhasList : null}
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
            <div>
                <SimpleButton tema='dark' icon="none" raio="0" onClick={() => setPontosShow(!pontosShow)}>
                    <h3>Pontos </h3>
                    <h3>{pontosShow ? '-' : '+'}</h3>
                </SimpleButton>
                <div className='children'>
                    {pontosShow ? pontosList : null}
                </div>
            </div>
        )
    }
    
    return(
        <>
            <div className="menuWeb" style={{display : displayValue}}>
                <section className="menuLista conteudo vertical">
                    <h1>Menu</h1>
                    <Trilhas/>
                    <Pontos />
                </section>
            </div>
            
        </>
    )
}