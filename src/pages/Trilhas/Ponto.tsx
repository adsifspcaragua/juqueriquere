import { useParams, useSearchParams } from 'react-router-dom';
import data from '../../data.json';

import NotFound from '../NotFound';

import SimpleButton from '../../components/ui/buttons/SimpleButton';
import TrilhasMap from '../../components/ui/TrilhasMap';

export default function Ponto() {
    const { id, nomePonto } = useParams<{ id: string; nomePonto: string }>();
    const [searchParams] = useSearchParams();
    let from = searchParams.get('from') || 'explorar';

    const trilha = data.trilhas
        .find(t => t.id === parseInt(id || ''))
    const ponto = trilha?.pontos_interesse.find(p => String(Object.values(p)[0]) === nomePonto);

    if (!trilha || !ponto) { return (<NotFound />); }

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
            <section className='conteudo desktopWrap'>

                <div className="vertical gap15">
                    <div className='horizontal gap5'>
                        {goBack()}
                    </div>
                </div>

                <div className="vertical gap15">
                    <h1>{Object(ponto).nome}</h1>
                    <div className='vertical gap5'>
                        {
                            Object(ponto).planta && (
                                <h3>Nome científico: {Object(ponto).planta}</h3>
                            )
                        }
                    </div>

                    {
                        Object(ponto).descricao && (
                            <p>{Object(ponto).descricao}</p>
                        )
                    }
                </div>

                <div className="card vertical gap15">
                    <div className="vertical gap5">
                        <p>Aparece em:</p>
                        <SimpleButton path={`/trilha/${id}`} tema='dark' raio='10'>{trilha.nome}</SimpleButton>
                    </div>
                    
                    {ponto.latitude && ponto.longitude && (
                        <div className="mapa">
                            <TrilhasMap highlight={Object(ponto).nome} id={[trilha.id]} />
                        </div>
                    )}

                    {
                        ponto.latitude && ponto.longitude && (
                            <p>Coordenadas: {ponto.latitude}, {ponto.longitude}</p>
                        )
                    }
                </div>
            </section>

        </>
    );
}