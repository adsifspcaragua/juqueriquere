import { useParams } from 'react-router-dom';
import data from '../../data.json';
import NotFound from '../NotFound';
import TrilhaInfo, { type Trilha } from './TrilhaInfo';
import SimpleButton from '../../components/ui/buttons/SimpleButton';
import TrilhasMap from '../../components/ui/TrilhasMap';
import DraggableCarousel from '../../components/ui/DraggableCarousel.tsx';
import { icons } from '../../components/ui/icons';
import CardPonto from '../../components/ui/CardPonto';

export default function Trilha() {
    const { Distancia, Tempo, Dificuldade } = icons.default;
    let params = useParams();
    let id = parseInt(params.id || ``);


    const trilha = data.trilhas.find(t => t.id === id) as Trilha;
    if (!trilha) return <NotFound />;

    const pontosList = trilha.pontos_interesse.map((ponto, index) => (
        <CardPonto
            key={index}
            ponto={ponto}
            trilha={trilha.nome}
        />
    ));


    return (
        <>
            <div className="paddingHeader"></div>
            <section className='vertical conteudo'>
                <SimpleButton path="/explorar/" type='back'>Voltar para Mapa</SimpleButton>

                    <div className="mapa">
                        {<TrilhasMap id={[id]}></TrilhasMap>}
                    </div>

                        <div className='vertical gap5'>
                            <h1>{trilha.nome}</h1>
                            <p>{trilha.descricao_curta}</p>
                        </div>

                        <div className="horizontal destaquesTrilha">
                            <div className="vertical gap5">
                                <div className="horizontal gap5">
                                    <img src={Distancia}/>
                                    <p>Distância</p>
                                </div>
                                <p>{trilha.extensao}</p>
                            </div>
                            <div className="linhaVertical"></div>
                            <div className="vertical gap5">
                                <div className="horizontal gap5">
                                    <img src={Tempo}/>
                                    <p>Duração</p>
                                </div>
                                <p>{trilha.duracao}</p>
                            </div>
                            <div className="linhaVertical"></div>
                            <div className="vertical gap5">
                                <div className="horizontal gap5">
                                    <img src={Dificuldade}/>
                                    <p>Dificuldade</p>
                                </div>
                                <p>{trilha.dificuldade}</p>
                            </div>
                        </div>
                        <div className="vertical gap5">
                            <h1>Descrição</h1>
                            <p>{trilha.descricao}</p>
                        </div>
                        <div className="vertical gap5">
                            <h1>Pontos de Interesse</h1>
                            <DraggableCarousel items={pontosList}/>
                        </div>
            </section>
        </>
    )
}