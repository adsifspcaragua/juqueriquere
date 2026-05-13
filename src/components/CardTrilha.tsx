import { type Trilha } from '../pages/Trilhas/TrilhaInfo';
import { Link } from "react-router-dom";



import Dificuldade from '../assets/icons/Dificuldade.png';
import Distancia from '../assets/icons/Distância.png';
import Tempo from '../assets/icons/Tempo.png';
import './CardTrilha.css'

type Props = {
    trilha: Trilha;
};

export default function CardTrilha({ trilha }: Props) {
    return (
        <Link to={`/trilha/${trilha.id}`}>
        <div className='cardTrilha'>
            <div className="info vertical">

                <h2>{trilha.nome}</h2>

                <div className="linhaPontilhadaDark"></div>

                <div className="vertical gap5">

                    <div className="horizontal gap5">
                        <img src={Dificuldade} />
                        <p>{trilha.dificuldade}</p>
                    </div>

                    <div className="horizontal gap5">
                        <img src={Distancia} />
                        <p>{trilha.extensao}</p>
                    </div>

                    <div className="horizontal gap5">
                        <img src={Tempo} />
                        <p>{trilha.duracao}</p>
                    </div>

                </div>

            </div>
        </div>
        </Link>
    );
}