import { useParams } from 'react-router-dom';
import data from '../../data.json';
import NotFound from '../NotFound';
import TrilhaInfo, { type Trilha } from './TrilhaInfo';
import SimpleButton from '../../components/ui/buttons/SimpleButton';
import TrilhasMap from '../../components/ui/TrilhasMap';

export default function Trilha() {
    let params = useParams();
    let id = parseInt(params.id || ``);

    const trilha = data.trilhas.find(t => t.id === id) as Trilha;
    if (!trilha) return <NotFound />;

    return (
        <>
            <div className="paddingHeader"></div>
            <section className='vertical conteudo'>
                <SimpleButton path="/trilhas/" type='back'>Voltar para Trilhas</SimpleButton>

                <div className="vertical conteudo" id='detalheTrilha'>
                    <div className="mapa">
                        {<TrilhasMap id={id}></TrilhasMap>}
                    </div>
                    <div className="vertical conteudo" id='conteudoTrilha'>
                        <div className='vertical gap5'>
                            <div className='horizontal titulo'>
                                <h1>{trilha.nome}</h1>
                            </div>
                            <p>{trilha.descricao_curta}</p>

                        </div>
                        <p>{trilha.extensao}</p>
                        <p>{trilha.duracao}</p>
                        <p>{trilha.dificuldade}</p>

                        <div className="vertical gap5">
                            <p>{trilha.descricao}</p>

                            <TrilhaInfo trilha={trilha} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}