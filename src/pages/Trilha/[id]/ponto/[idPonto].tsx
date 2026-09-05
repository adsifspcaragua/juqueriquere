import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { usePageTitle } from "../../../../lib/hooks/usePageTitle.ts";

import { db, type PontoInteresseDB, type TrilhaDB } from '../../../../lib/dexie.ts';

import NotFound from '../../../_components/NotFound.tsx';

import SimpleButton from '../../../../components/ui/buttons/SimpleButton.tsx';
import TrilhasMap from '../../../../components/ui/TrilhasMap.tsx';
import '../../../_styles/ponto.css';
import GaleriaImagens from '../../../../components/ui/GaleriaImagens.tsx';
import Map from '../../../../components/ui/Map/Map.tsx';

export default function Ponto() {
    const { id, idPonto } = useParams<{ id: string; idPonto: string }>();
    const [searchParams] = useSearchParams();
    let from = searchParams.get('from') || 'explorar';
    
    // CORREÇÃO: Removido o (undefined) para que o TypeScript entenda como TrilhaDB | undefined
    const [trilha, setTrilha] = useState<TrilhaDB>();
    const [ponto, setPontoDados] = useState<PontoInteresseDB>();
    const [imagens, setImagens] = useState<string[]>();

    usePageTitle(ponto?.nome);

    useEffect(() => {
        async function carregar() {
            if (!id || !idPonto) return;

            const trilhaDB = await db.trilhas.get(Number(id));
            const pontoDB = await db.pontos_interesse.get(Number(idPonto));

            if (!pontoDB) return;

            const imagensDB = await db.imagens.where('ponto_interesse_id').equals(Number(pontoDB.id)).toArray();
            const caminhosImagens = imagensDB.map((img) => img.caminho_arquivo).filter(Boolean) as string[];

            setTrilha(trilhaDB);
            setPontoDados(pontoDB);
            setImagens(caminhosImagens); 
        }
        carregar();
    }, [id, idPonto]);

    if (!ponto || !trilha) { return (<NotFound />); }
    if (!from) from = 'explorar';
    const goBack = () => {
        switch (from) {
            case `${id}`:
                return (
                    <>
                        <SimpleButton path={`/trilha/${id}`} type="back" icon='setaBack'>Voltar para {trilha.nome}</SimpleButton>
                    </>
                )
            case 'pontos':
                return (
                    <>
                        <SimpleButton path={`/${from}/`} type='back' icon='setaBack'>Voltar para {from}</SimpleButton>
                    </>
                )
            default:
                return (
                    <>
                        <SimpleButton path="/Mapa/" type='back' icon='setaBack'>Voltar para Mapa</SimpleButton>
                    </>
                )
        }
    };

    return (
        <>
            <div className="paddingHeader"></div>
            <section className='conteudo vertical gap15'>
                
                <div className="vertical gap15">
                    <div className='horizontal gap5'>
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
                                <h1>{Object(ponto).nome}</h1>
                                <div className='vertical gap5'>
                                    {
                                        Object(ponto).planta && (
                                            <i>{Object(ponto).planta}</i>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="card vertical gap5">
                                <h2>Descrição</h2>
                                {
                                    Object(ponto).descricao && (
                                        <p>{Object(ponto).descricao}</p>
                                    )
                                }
                            </div>
                        </div>
                        <div className="card desktopWrap gap15">
                            {ponto.latitude && ponto.longitude && (
                                <div className="mapa">
                                    <TrilhasMap highlight={Object(ponto).nome} id={[trilha.id]} />
                                    <Map pointId={Number(idPonto)} id={Number(id)}/>
                                </div>
                            )}
                        
                            <div className="vertical gap5">
                                <p>Aparece em:</p>
                                <SimpleButton path={`/trilha/${id}`} tema='dark' raio='10'>{trilha.nome}</SimpleButton>
                                {
                                    ponto.latitude && ponto.longitude && (
                                        <p>Coordenadas: {ponto.latitude}, {ponto.longitude}</p>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>
    );
}