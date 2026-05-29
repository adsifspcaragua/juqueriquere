import { useState } from 'react';
import data from '../data.json';
import type Trilha from './Trilhas/TrilhaInfo';
import CardTrilha from '../components/ui/CardTrilha.tsx';
import CardPonto from '../components/ui/CardPonto.tsx';
import TrilhasMap from '../components/ui/TrilhasMap.tsx';
import DraggableCarousel from '../components/ui/DraggableCarousel.tsx';
import './styles/explorar.css';
import SimpleButton from '../components/ui/buttons/SimpleButton.tsx';

export default function Explorar() {
    const trilhas = [...data.trilhas] as Trilha[]; // Asserção de tipo para garantir que temos um array de Trilha
     
    const [trilhaSelecionada, setTrilhaSelecionada] = useState(trilhas[0].id);

    const trilhaAtual = trilhas.find(t => t.id === trilhaSelecionada) || trilhas[0];

    const trilhasList = trilhas.map((trilha) => (
        <CardTrilha
            id={trilha.id} // O Carousel usa este ID para o onChange
            key={trilha.id}
            trilha={trilha}
        />
    ));
    const pontosList = trilhaAtual.pontos_interesse.map((ponto, index) => (
        <CardPonto
            key={index}
            ponto={ponto}
            trilha={trilhaAtual.nome}
        />
    ));
    
    return (
        <>
            <div className="paddingHeader"></div>
            <section className="conteudo vertical gap30">
                
                <div className="mapa">
                    {/* Repasse o ID para o mapa */}
                    <TrilhasMap highlight={trilhaSelecionada} onClick={(id) => setTrilhaSelecionada(id)}/>
                </div>

                <div className="vertical gap5">
                    <h1>Trilhas</h1>
                    <DraggableCarousel 
                        items={trilhasList}
                        activeId={trilhaSelecionada}
                        // O 'id' vem do componente CardTrilha.props.id
                        onChange={(id) => setTrilhaSelecionada(Number(id))}
                    />
                    <SimpleButton path='/trilhas'>Todas as Trilhas</SimpleButton>
                </div>

                <div className="vertical gap15">
                    <div className="vertical gap5">
                        <h1>Pontos de interesse</h1>
                        <div className="horizontal gap5 scroll">
                            {trilhas.map((trilha) => (
                                <button
                                    key={trilha.id}
                                    onClick={() => setTrilhaSelecionada(trilha.id)}
                                    className={trilhaSelecionada === trilha.id ? 'ativo' : ''}
                                >
                                    {trilha.nome}
                                </button>
                            ))}
                        </div>
                        <div className="vertical gap5">
                            {pontosList}
                        </div>
                    </div>
                    <SimpleButton path='/pontos'>Todos os Pontos de Interesse</SimpleButton>

                </div>
            </section>
        </>
    );
}