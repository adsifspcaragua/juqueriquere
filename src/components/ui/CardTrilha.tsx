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

export default function CardTrilha({ trilha, id }: Props): JSX.Element {
    const { Dificuldade, Distancia, Tempo } = icons.dark;

    const [imagem, setImagem] = useState<string>(`url(${trilhaGeneric})`);

    const location = useLocation();
    const pageName = location.pathname.split("/").filter(Boolean).pop() || "Mapa";

    useEffect(() => {
        let isMounted = true;
        let urlBlobCriada: string | null = null;

        async function carregarCapa() {
            const targetId = id ?? trilha.id;
            if (!targetId) return;

            const url = await obterCapa('trilha', Number(targetId));

            if (isMounted) {
                if (url) {
                    if (url.startsWith("blob:")) urlBlobCriada = url;
                    setImagem(`url(${url})`);
                } else {
                    setImagem(`url(${trilhaGeneric})`);
                }
            } else if (url && url.startsWith("blob:")) {
                URL.revokeObjectURL(url);
            }
        }

        carregarCapa();

        return () => {
            isMounted = false;
            if (urlBlobCriada) {
                URL.revokeObjectURL(urlBlobCriada);
            }
        };
    }, [id, trilha.id]);

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