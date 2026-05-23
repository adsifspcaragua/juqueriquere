import { type Trilha } from '../../pages/Trilhas/TrilhaInfo';
import { Link } from "react-router-dom";
import { icons } from './icons';
import './CardTrilha.css'
import type { JSX } from 'react';

type Props = {
    trilha: Trilha;
    id?: string | number;
};

export default function CardTrilha({ trilha, id }: Props): JSX.Element {
    const { Dificuldade, Distancia, Tempo } = icons.dark;

    return (
        <Link to={`/trilha/${id}`} className='cardTrilha carrosselCard'>
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
        </Link>
    );
}