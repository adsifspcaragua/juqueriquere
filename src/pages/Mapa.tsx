import { useEffect, useState } from 'react';
import { usePageTitle } from "../lib/hooks/usePageTitle.ts";

import { db, type PontoInteresseDB } from "../lib/dexie.ts";
import type Trilha from './Trilhas/TrilhaInfo.tsx';
import CardTrilha from '../components/ui/CardTrilha.tsx';
import CardPonto from '../components/ui/CardPonto.tsx';
import TrilhasMap from '../components/ui/TrilhasMap.tsx';
import DraggableCarousel from '../components/ui/DraggableCarousel.tsx';
import './_styles/explorar.css';
import SimpleButton from '../components/ui/buttons/SimpleButton.tsx';

export default function Explorar() {
    usePageTitle("Mapa");

    const [trilhas, setTrilhas] = useState<Trilha[]>([]);
    const [pontosDados, setPontosDados] = useState<PontoInteresseDB[]>();

    const [trilhaSelecionada, setTrilhaSelecionada] = useState<number | undefined>(undefined);

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

    //carrega os pontos quando a trilhaSelecionada muda de valor
    useEffect(() => {
        async function carregarPontos() {
            if(!trilhaSelecionada) return;
            const pontos = await db.pontos_interesse.where('trilha_id').equals(Number(trilhaSelecionada)).toArray();
            if(pontos)setPontosDados(pontos)
        }
        carregarPontos();
    }, [trilhaSelecionada]);

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

    const pontosList = (pontosDados ?? []).map((ponto, index) => (
        <CardPonto
            key={index}
            ponto={ponto}
            trilhaId={trilhaAtual.id}
        />
    ));

    return (
        <>
            <div className="paddingHeader"></div>
            <section className="conteudo vertical gap30 desktopWrap">

                <div className="vertical gap15">
                    <h1>Mapa geral do Parque</h1>
                    <div className="mapa">
                        {/* Repasse o array de IDs (trilha + ramais) e garanta que o onClick atualize o estado da trilha principal */}
                        <TrilhasMap
                            highlight={highlightIds}
                            onClick={(trailId, _ramalId) => setTrilhaSelecionada(trailId)}
                        />
                    </div>
                </div>

                <div className="vertical gap15">
                    <div className="vertical gap15">
                        <div className="horizontal justify center">
                            <h1>Trilhas</h1>
                            <SimpleButton path='/trilhas' tema='none'>Todas as Trilhas</SimpleButton>
                        </div>
                        <DraggableCarousel
                            items={trilhasList}
                            activeId={trilhaSelecionada}
                            onChange={(id) => setTrilhaSelecionada(Number(id))}
                        />
                    </div>
                    <div className="vertical gap15">
                        <div className="vertical gap15">
                            <h4>Pontos de interesse nesta trilha:</h4>
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