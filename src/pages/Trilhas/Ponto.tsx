import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";

import { db, type PontoInteresseDB } from '../../lib/dexie';

import NotFound from '../NotFound';

import SimpleButton from '../../components/ui/buttons/SimpleButton';
import TrilhasMap from '../../components/ui/TrilhasMap';
import DraggableCarousel from '../../components/ui/DraggableCarousel';

import '../styles/ponto.css';
import imgNotFound from "../../assets/img/imgNotFound.webp";
import type TrilhaType from './TrilhaInfo';

export default function Ponto() {
    const { id, nomePonto } = useParams<{ id: string; nomePonto: string }>();
    const [searchParams] = useSearchParams();
    let from = searchParams.get('from') || 'explorar';
    
    const [trilha, setTrilha] = useState<TrilhaType | undefined>(undefined);
    const [ponto, setPontoDados] = useState<PontoInteresseDB>();
    const [imagens, setImagens] = useState<string[]>();

    useEffect(() => {
        async function carregar() {
            if(!nomePonto){
                return;
            }

            const trilha = await db.trilhas.get(Number(id));
            const ponto = await db.pontos_interesse
                .where('trilha_id').equals(Number(id))
                .and(ponto => ponto.nome.toLowerCase().includes(nomePonto.toLowerCase()))
                .first();
            setTrilha(trilha)
            setPontoDados(ponto)
            setImagens([imgNotFound])//temporário
        }

        carregar();
    },[id]);

    const imagensList = (imagens ?? []).map(
        (imagem, index) => (
            <div
                key={String(index)}
            >
                <img
                src={imagem}
                >
                </img>
            </div>
        )
    );
    
    //const trilha = data.trilhas
    //    .find(t => t.id === parseInt(id || ''))
    //const ponto = trilha?.pontos_interesse.find(p => String(Object.values(p)[0]) === nomePonto);
    
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
                        <SimpleButton path="/explorar/" type='back' icon='setaBack'>Voltar para Mapa</SimpleButton>
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
                        {
                            imagensList && 
                            <DraggableCarousel
                            items={imagensList}
                            ></DraggableCarousel>
                            
                        }
                        
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