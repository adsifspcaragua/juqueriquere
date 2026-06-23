import { useEffect, useState } from 'react';
import { db } from "../lib/dexie";
import type Trilha from './Trilhas/TrilhaInfo';
import CardTrilha from '../components/ui/CardTrilha.tsx';
import CardPonto from '../components/ui/CardPonto.tsx';
import TrilhasMap from '../components/ui/TrilhasMap.tsx';
import DraggableCarousel from '../components/ui/DraggableCarousel.tsx';
import './styles/explorar.css';
import SimpleButton from '../components/ui/buttons/SimpleButton.tsx';

export default function Explorar() {
    const [trilhas, setTrilhas] = useState<Trilha[]>([]);


    const [trilhaSelecionada, setTrilhaSelecionada] = useState<number | null>(null);

    useEffect(() => {
        async function loadData() {
            const data = await db.trilhas.toArray();
            setTrilhas(data);

            if (data.length > 0) {
                setTrilhaSelecionada(data[0].id);
            }
        }

        loadData();
    }, []);

    const trilhaAtual =
        trilhas.find((t) => t.id === trilhaSelecionada) ?? trilhas[0];

    if (!trilhaAtual) {
        return (
            <>
                <div className="paddingHeader"></div>
                <section className="conteudo">
                    <p>Nenhuma trilha cadastrada.</p>
                </section>
            </>
        );
    }
    const highlightIds = [
        trilhaAtual.id,
        ...(trilhaAtual.ramais ? trilhaAtual.ramais.map(r => r.id) : [])
    ];

    const trilhasList = trilhas.map((trilha) => (
        <CardTrilha
            id={trilha.id}
            key={trilha.id}
            trilha={trilha}
        />
    ));

    const pontosList = (trilhaAtual.pontos_interesse ?? []).map((ponto, index) => (
        <CardPonto
            key={index}
            ponto={ponto}
            trilha={trilhaAtual}
        />
    ));

    return (
        <>
            <div className="paddingHeader"></div>
            <section className="conteudo vertical gap30 desktopWrap">

                <div className="vertical gap5">
                    <h1>Mapa geral do Parque</h1>
                    <div className="mapa">
                        {/* Repasse o array de IDs (trilha + ramais) e garanta que o onClick atualize o estado da trilha principal */}
                        <TrilhasMap
                            highlight={highlightIds}
                            onClick={(trailId, _ramalId) => setTrilhaSelecionada(trailId)}
                        />
                    </div>
                </div>

                <div className="vertical gap30">
                    <div className="vertical gap5">
                        <h1>Trilhas</h1>
                        <DraggableCarousel
                            items={trilhasList}
                            activeId={trilhaSelecionada}
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
                            <div className="vertical gap5" id='pontosList'>
                                {pontosList}
                            </div>
                        </div>
                        <SimpleButton path='/pontos'>Todos os Pontos de Interesse</SimpleButton>
                    </div>
                </div>
            </section>
        </>
    );
}