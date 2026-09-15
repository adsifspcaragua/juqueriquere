import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { usePageTitle } from "../../../../lib/hooks/usePageTitle.ts";

import {
    db,
    type PontoInteresseDB,
    type TrilhaDB
} from '../../../../lib/dexie.ts';

import NotFound from '../../../_components/NotFound.tsx';

import SimpleButton from '../../../../components/ui/buttons/SimpleButton.tsx';
import '../../../_styles/ponto.css';
import GaleriaImagens from '../../../../components/ui/GaleriaImagens.tsx';
import Map from '../../../../components/ui/Map/Map.tsx';

export default function Ponto() {
    const { id, idPonto } = useParams<{
        id?: string;
        idPonto: string;
    }>();

    const [searchParams] = useSearchParams();
    let from = searchParams.get('from') || 'Mapa';
    
    const [trilha, setTrilha] = useState<TrilhaDB | null>(null);
    const [ponto, setPontoDados] = useState<PontoInteresseDB>();
    const [imagens, setImagens] = useState<string[]>([]);

    usePageTitle(ponto?.nome);

    useEffect(() => {
        let urlsCriadas: string[] = [];

        async function carregar() {
            if (!idPonto) return;

            const idPontoNumerico = Number(idPonto);

            const pontoDB = await db.pontos_interesse.get(idPontoNumerico);
            if (!pontoDB) return;

            // Identifica o ID da trilha via parâmetro de URL ou via campo no próprio ponto (caso exista)
            const idTrilha = id ? Number(id) : pontoDB.trilha_id;
            let trilhaDB: TrilhaDB | undefined = undefined;

            if (idTrilha) {
                trilhaDB = await db.trilhas.get(idTrilha);
            }

            const imagensDB = await db.imagens
                .where('ponto_interesse_id')
                .equals(idPontoNumerico)
                .toArray();

            const urls = imagensDB
                .filter((img) => img.arquivo instanceof Blob)
                .map((img) => {
                    const url = URL.createObjectURL(img.arquivo!);

                    urlsCriadas.push(url);

                    return url;
                });

            setTrilha(trilhaDB || null);
            setPontoDados(pontoDB);
            setImagens(urls);
        }

        carregar();

        return () => {
            urlsCriadas.forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [id, idPonto]);

    if (!ponto) {
        return <NotFound />;
    }

    if (!from) {
        from = 'explorar';
    }

    const goBack = () => {
        if (id && trilha && from === id) {
            return (
                <SimpleButton
                    path={`/trilha/${id}`}
                    type="back"
                    icon="setaBack"
                >
                    Voltar para {trilha.nome}
                </SimpleButton>
            );
        }

        return (
            <SimpleButton
                path={`/${from}/`}
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
                                        pointId={Number(idPonto)}
                                        id={trilha?.id}
                                        center={[ponto.latitude,ponto.longitude]}
                                    />
                                </div>
                            )}

                            <div className="vertical gap5">

                                <p>Aparece em:</p>

                                {trilha ? (
                                    <SimpleButton
                                        path={`/trilha/${trilha.id}`}
                                        tema="dark"
                                        raio="10"
                                    >
                                        {trilha.nome}
                                    </SimpleButton>
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