import type Trilha from '../../pages/Trilhas/TrilhaInfo';
import trilhaGeneric from '../../assets/img/CardTrilha.webp';

import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState, type JSX } from 'react';

import { icons } from './icons';
import '../styles/CardTrilha.css';

import { obterCapa } from '../../lib/services/sync';

type Props = {
    trilha: Trilha;
    id?: string | number;
    getImg?: (img: string | undefined) => void;
};

export default function CardTrilha({ trilha, id, getImg }: Props): JSX.Element {
    const { Dificuldade, Distancia, Tempo } = icons.dark;

    const [imagem, setImagem] = useState<string>(`url(${trilhaGeneric})`);

    const location = useLocation();
    const pageName = location.pathname.split("/").filter(Boolean).pop() || "Mapa";

    useEffect(() => {
        let isMounted = true;

        async function carregarCapa() {
            const targetId = id ?? trilha.id;
            if (!targetId) return;

            try {
                const url = await obterCapa('trilha', Number(targetId));

                if (isMounted) {
                    if (url) {
                        setImagem(`url(${url})`);
                        if (getImg) getImg(url);
                    } else {
                        setImagem(`url(${trilhaGeneric})`);
                        if (getImg) getImg(trilhaGeneric);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar capa da trilha:", error);
            }
        }

        carregarCapa();

        return () => {
            isMounted = false;
        };
    }, [id, trilha.id, getImg]);

    return (
        <Link
            to={`/trilha/${id ?? trilha.id}?from=${pageName}`}
            className="cardTrilha carrosselCard"
            style={{ backgroundImage: imagem }}
        >
            <div className="info vertical">
                <h2>{trilha.nome}</h2>

                <div className="linhaPontilhadaDark"></div>

                <div className="vertical gap5">
                    <div className="horizontal gap5">
                        <img src={Dificuldade} alt="Dificuldade" />
                        <p>{trilha.dificuldade}</p>
                    </div>

                    <div className="horizontal gap5">
                        <img src={Distancia} alt="Distância" />
                        <p>{trilha.extensao}</p>
                    </div>

                    <div className="horizontal gap5">
                        <img src={Tempo} alt="Duração" />
                        <p>{trilha.duracao}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}