import type Trilha from '../../pages/Trilhas/TrilhaInfo';
import { Link } from "react-router-dom";
import { icons } from './icons';
import './CardTrilha.css'
import { useEffect, useState, type JSX } from 'react';
import { db } from '../../lib/dexie';

type Props = {
    trilha: Trilha;
    id?: string | number;
};

export default function CardTrilha({ trilha, id }: Props): JSX.Element {
    const { Dificuldade, Distancia, Tempo } = icons.dark;

    const [imagem, setImagem] = useState<string>();
    
    useEffect(() => {
        async function loadData() {
            const imagens = await db.imagens.toArray();
            const imagem = imagens.find(i => i.trilha_id == id)
            if(imagem)setImagem(imagem.caminho_arquivo)
            console.log(imagem?.caminho_arquivo)
        }

        loadData();
    }, []);

    return (
        <Link to={`/trilha/${id}`} className='cardTrilha'>
            <div className="info vertical">

                <h2>{trilha.nome}</h2>
                <img src={imagem}></img>
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
