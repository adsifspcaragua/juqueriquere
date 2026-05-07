import { useParams } from 'react-router-dom';
import data from '../../data.json';
import NotFound from '../NotFound';
import TrilhaInfo, { type Trilha } from './TrilhaInfo';
import SimpleButton from '../../components/ui/buttons/SimpleButton';

export default function Trilha(){
    let params = useParams();
    let id = parseInt(params.id || ``) ;
    const trilha = data.trilhas.find(t => t.id === id) as Trilha;
    if (!trilha) return <NotFound />;
    return(
        <>
            
            <section className='vertical conteudo'>
                <SimpleButton path="/trilhas/" type='back'>Voltar para Trilhas</SimpleButton>

                <div className="vertical conteudo" id='detalheTrilha'>
                    <div className="mapa">
                        <p>Mapa que a moça do parque não fez até hoje...</p>
                    </div>
                    <div className="vertical conteudo" id='conteudoTrilha'>
                        <div className='vertical gap5'>
                            <div className='horizontal titulo'>
                                <h1>{trilha.nome}</h1>
                            </div>
                            <p>{trilha.descricao}</p>
                        </div>
                        <div className="vertical gap5">
                            <TrilhaInfo trilha={trilha}/>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}