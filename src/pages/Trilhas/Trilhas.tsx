import { useState } from 'react';
import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';
import data from '../../data.json';
import Select from '../../components/ui/form/Select.tsx';

import Dificuldade from '../../assets/icons/Dificuldade.png';
import Distancia from '../../assets/icons/Distância.png';
import Tempo from '../../assets/icons/Tempo.png';

export default function Trilhas() {
    const order = {
        "Nome A-Z": (a: any, b: any) => a.nome.localeCompare(b.nome),
        "Nome Z-A": (a: any, b: any) => b.nome.localeCompare(a.nome),
    } as const;
    type OrderKey = keyof typeof order;
    
    const [orderKey, setOrderKey] = useState<OrderKey>("Nome A-Z");
    const trilhas = [...data.trilhas].sort(order[orderKey]);

    const trilhasList = trilhas.map((trilha) => (
        <div className='cardTrilha' key={trilha.id}>
            <div className="info vertical">
                <h2>{trilha.nome}</h2>
                <div className="linhaPontilhadaDark"></div>
                <div className="horizontal gap5"><img src={Dificuldade}/><p>Leve</p></div>
                <div className="horizontal gap5"><img src={Distancia}/><p>243m</p></div>
                <div className="horizontal gap5"><img src={Tempo}/><p>12min</p></div>
                <SimpleButton tema='dark' raio='10' path={`/trilha/${trilha.id}`}>Ver detalhes</SimpleButton>
            </div>
        </div>
    ));

    return (
        <>
            <div className="paddingHeader" id='paddingImgFade'></div>
            <section className='img-fade' id='capivara'>
                <div className="conteudo vertical">
                    <div className="info vertical gap5">
                        <h1>Trilhas</h1>                        
                        <p>Explore caminhos serenos, admire vistas deslumbrantes e encontre a paz na jornada.</p>
                    </div>

                    <div className="lista vertical">
                        <h3>Todas as Trilhas:</h3>
                        
                        <div className='horizontal' id='filtros'>
                            <p>Exibindo {trilhasList.length} trilhas</p>
                            <div className="horizontal gap5">
                                <p>Ordenar por: </p>
                                <Select 
                                options={Object.keys(order)}
                                onChange={(newValue) => {
                                    setOrderKey(newValue as OrderKey);
                                }}
                                value={orderKey}
                                style='none'
                                ></Select>
                            </div>
                        </div>
                        {trilhasList}
                    </div>
                </div>
            </section>
        </>
    );
}