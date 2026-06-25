import type Trilha from '../../pages/Trilhas/TrilhaInfo';
import trilhaGeneric from '../../assets/img/CardTrilha.webp'

import { icons } from './icons';
import './CardTrilha.css'

import { Link } from "react-router-dom";
import { useEffect, useState, type JSX } from 'react';

import { db } from '../../lib/dexie';

type Props = {
    trilha: Trilha;
    id?: string | number;
    getImg?: (img : string | undefined) => void;
};

export default function CardTrilha({ trilha, id }: Props): JSX.Element {
    const { Dificuldade, Distancia, Tempo } = icons.dark;

    const [imagem, setImagem] = useState<string>();
    

    useEffect(() => {
        async function loadData() {
            if (!id) {
                setImagem(`url(${trilhaGeneric})`);
                return;
            }

            const imagemDb = await db.imagens.where('trilha_id').equals(Number(id)).first();
            
            if (imagemDb) {
                setImagem(`url(${imagemDb.caminho_arquivo})`);
            } else {
                setImagem(`url(${trilhaGeneric})`);
            }
        }

        loadData();
    }, []);


    return (
        <Link 
        to={`/trilha/${id}`} 
        className={imagem ?
            `cardTrilha carrosselCard` : `cardTrilha carrosselCard`
        }
        style={ {backgroundImage : imagem} }
        >
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
