import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { usePageTitle } from "../../lib/hooks/usePageTitle.ts";

import {
    db,
    type PontoInteresseDB,
    type TrilhaDB
} from '../../lib/dexie.ts';
import { obterImagensPorPonto } from '../../lib/services/sync.ts';

import NotFound from '../_components/NotFound.tsx';

import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';
import '../_styles/ponto.css';
import GaleriaImagens from '../../components/ui/GaleriaImagens.tsx';
import Map from '../../components/ui/Map/Map.tsx';

export default function Ponto() {
    const { id } = useParams<{ id: string }>();

    const [searchParams] = useSearchParams();
    const from = searchParams.get('from') || 'Mapa';
    
    const [trilhas, setTrilhas] = useState<TrilhaDB[]>([]);
    const [ponto, setPontoDados] = useState<PontoInteresseDB>();
    const [imagens, setImagens] = useState<string[]>([]);

    usePageTitle(ponto?.nome);

    useEffect(() => {
        let isMounted = true;
        let urlsCriadas: string[] = [];

        async function carregar() {
            if (!id) return;

            const idPontoNumerico = Number(id);

            try {
                // Carrega os dados do ponto e as imagens (via Dexie + Supabase Fallback) em paralelo
                const [pontoDB, urls] = await Promise.all([
                    db.pontos_interesse.get(idPontoNumerico),
                    obterImagensPorPonto(idPontoNumerico)
                ]);

                if (!pontoDB || !isMounted) return;

                urlsCriadas = urls;

                // Suporte para 0, 1 ou múltiplas trilhas associadas
                let trilhasEncontradas: TrilhaDB[] = [];

                const idsTrilhas: number[] = Array.isArray((pontoDB as any).trilha_ids)
                    ? (pontoDB as any).trilha_ids
                    : pontoDB.trilha_id ? [pontoDB.trilha_id] : [];

                if (idsTrilhas.length > 0) {
                    const resultados = await db.trilhas.bulkGet(idsTrilhas);
                    trilhasEncontradas = resultados.filter((t): t is TrilhaDB => Boolean(t));
                } else {
                    // Fallback: busca por vínculo no array de pontos das próprias trilhas
                    const todasTrilhas = await db.trilhas.toArray();
                    trilhasEncontradas = todasTrilhas.filter((t: any) =>
                        Array.isArray(t.ponto_ids) && t.ponto_ids.includes(idPontoNumerico)
                    );
                }

                if (!isMounted) return;

                setTrilhas(trilhasEncontradas);
                setPontoDados(pontoDB);
                setImagens(urls);
            } catch (error) {
                console.error("Erro ao carregar dados do ponto:", error);
            }
        }

        carregar();

        return () => {
            isMounted = false;
            urlsCriadas.forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [id]);

    if (!ponto) {
        return <NotFound />;
    }

    const goBack = () => {
        const idTrilhaOrigem = Number(from);
        
        // Se 'from' for o ID numérico de uma trilha
        if (!isNaN(idTrilhaOrigem) && idTrilhaOrigem > 0) {
            const trilhaOrigem = trilhas.find((t) => t.id === idTrilhaOrigem);
            return (
                <SimpleButton
                    path={`/trilha/${idTrilhaOrigem}`}
                    type="back"
                    icon="setaBack"
                >
                    Voltar para {trilhaOrigem ? trilhaOrigem.nome : 'Trilha'}
                </SimpleButton>
            );
        }

        return (
            <SimpleButton
                path={`/${from.toLowerCase()}/`}
                type="back"
                icon="setaBack"
            >
                Voltar para {from}
            </SimpleButton>
        );
    };

    return (
        <>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">

                <div className="vertical gap15">
                    <div className="horizontal gap5">
                        {goBack()}
                    </div>
                </div>

                <div className="desktopWrap">

                    <div className="vertical">
                        <div className="vertical">
                            <GaleriaImagens imagens={imagens} />
                        </div>
                    </div>

                    <div className="vertical gap15">

                        <div className="vertical gap15">

                            <div className="vertical gap5">

                                <h1>{ponto.nome}</h1>

                                <div className="vertical gap5">
                                    {ponto.planta && (
                                        <i>{ponto.planta}</i>
                                    )}
                                </div>

                            </div>

                            <div className="card vertical gap5">

                                <h2>Descrição</h2>

                                {ponto.descricao && (
                                    <p>{ponto.descricao}</p>
                                )}

                            </div>

                        </div>

                        <div className="card desktopWrap gap15">

                            {ponto.latitude && ponto.longitude && (
                                <div className="mapa">
                                    <Map
                                        pointId={Number(id)}
                                        id={trilhas[0]?.id}
                                        center={[ponto.latitude, ponto.longitude]}
                                    />
                                </div>
                            )}

                            <div className="vertical gap5">

                                <p>Aparece em:</p>

                                {trilhas.length > 0 ? (
                                    <div className="vertical gap5">
                                        {trilhas.map((trilha) => (
                                            <SimpleButton
                                                key={trilha.id}
                                                path={`/trilha/${trilha.id}`}
                                                tema="dark"
                                                raio="10"
                                            >
                                                {trilha.nome}
                                            </SimpleButton>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Nenhuma trilha associada</p>
                                )}

                                {ponto.latitude && ponto.longitude && (
                                    <p>
                                        Coordenadas: {ponto.latitude},{' '}
                                        {ponto.longitude}
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </section>
        </>
    );
}