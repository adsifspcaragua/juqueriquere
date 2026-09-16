import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { usePageTitle } from "../../../../lib/hooks/usePageTitle.ts";

import {
    db,
    type PontoInteresseDB,
    type TrilhaDB
} from '../../../../lib/dexie.ts';
import { obterImagensPorPonto } from '../../../../lib/services/sync.ts';

import NotFound from '../../../_components/NotFound.tsx';

import SimpleButton from '../../../../components/ui/buttons/SimpleButton.tsx';
import '../../../_styles/ponto.css';
import GaleriaImagens from '../../../../components/ui/GaleriaImagens.tsx';
import Map from '../../../../components/ui/Map/Map.tsx';

export default function Ponto() {
    const { id, idPonto } = useParams<{
        id: string;
        idPonto: string;
    }>();

    const [searchParams] = useSearchParams();
    let from = searchParams.get('from') || 'Mapa';

    const [trilha, setTrilha] = useState<TrilhaDB>();
    const [ponto, setPontoDados] = useState<PontoInteresseDB>();
    const [imagens, setImagens] = useState<string[]>([]);

    usePageTitle(ponto?.nome);

    useEffect(() => {
        let isMounted = true;
        let urlsCriadas: string[] = [];

        async function carregar() {
            if (!id || !idPonto) return;

            const idTrilha = Number(id);
            const idPontoNumerico = Number(idPonto);

            try {
                const [trilhaDB, pontoDB, urls] = await Promise.all([
                    db.trilhas.get(idTrilha),
                    db.pontos_interesse.get(idPontoNumerico),
                    obterImagensPorPonto(idPontoNumerico)
                ]);

                if (!pontoDB || !trilhaDB || !isMounted) return;

                urlsCriadas = urls;

                setTrilha(trilhaDB);
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
    }, [id, idPonto]);

    if (!ponto || !trilha) {
        return <NotFound />;
    }

    if (!from) {
        from = 'explorar';
    }

    const goBack = () => {
        switch (from) {
            case `${id}`:
                return (
                    <SimpleButton
                        path={`/trilha/${id}`}
                        type="back"
                        icon="setaBack"
                    >
                        Voltar para {trilha.nome}
                    </SimpleButton>
                );

            default:
                return (
                    <SimpleButton
                        path={`/${from}/`}
                        type="back"
                        icon="setaBack"
                    >
                        Voltar para {from}
                    </SimpleButton>
                );
        }
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
                                        pointId={Number(idPonto)}
                                        id={Number(id)}
                                    />
                                </div>
                            )}

                            <div className="vertical gap5">

                                <p>Aparece em:</p>

                                <SimpleButton
                                    path={`/trilha/${id}`}
                                    tema="dark"
                                    raio="10"
                                >
                                    {trilha.nome}
                                </SimpleButton>

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