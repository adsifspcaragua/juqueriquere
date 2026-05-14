import { useParams } from 'react-router-dom';
import data from '../../data.json';
import NotFound from '../NotFound';
import TrilhaInfo, { type Trilha } from './TrilhaInfo';
import SimpleButton from '../../components/ui/buttons/SimpleButton';
import TrilhasMap from '../../components/ui/TrilhasMap';
import distancia from '../../assets/icons/Distancia-light.png';
import dificuldade from '../../assets/icons/Dificuldade-light.png';
import tempo from '../../assets/icons/Tempo-light.png';

export default function Trilha() {
    let params = useParams();
    let id = parseInt(params.id || ``);

    const trilha = data.trilhas.find(t => t.id === id) as Trilha;
    if (!trilha) return <NotFound />;

    return (
        <>
            <div className="paddingHeader"></div>
            <section className='vertical conteudo'>
                <SimpleButton path="/explorar/" type='back'>Voltar para Mapa</SimpleButton>

                <div className="vertical conteudo" id='detalheTrilha'>
                    <div className="mapa">
                        {<TrilhasMap id={[id]}></TrilhasMap>}
                    </div>
                    <div className="vertical conteudo" id='conteudoTrilha'>
                        <div className='vertical gap5'>
                            <div className='horizontal titulo'>
                                <h1>{trilha.nome}</h1>
                            </div>
                            <p>{trilha.descricao_curta}</p>

                        </div>

                        <div className="horizontal destaquesTrilha">
                            <div className="vertical gap5">
                                <div className="horizontal gap5">
                                    <img src={distancia}/>
                                    <p>Distância</p>
                                </div>
                                <p>{trilha.extensao}</p>
                            </div>
                            <div className="linhaVertical"></div>
                            <div className="vertical gap5">
                                <div className="horizontal gap5">
                                    <img src={tempo}/>
                                    <p>Duração</p>
                                </div>
                                <p>{trilha.duracao}</p>
                            </div>
                            <div className="linhaVertical"></div>
                            <div className="vertical gap5">
                                <div className="horizontal gap5">
                                    <img src={dificuldade}/>
                                    <p>Dificuldade</p>
                                </div>
                                <p>{trilha.dificuldade}</p>
                            </div>
                        </div>


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