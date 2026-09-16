import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import '../styles/CardPonto.css';
import '../styles/CardTrilha.css';
import trilhaGeneric from '../../assets/img/CardTrilha.webp';

import { obterCapa } from '../../lib/services/sync';

interface Ponto {
    id: number;
    nome: string;
    planta?: string;
    latitude?: number | null;
    longitude?: number | null;
}

interface Props {
    ponto: Ponto;
    trilhaId: number;
}

export default function CardPonto({ ponto, trilhaId }: Props) {
    const [imagem, setImagem] = useState<string>(trilhaGeneric);

    const location = useLocation();
    const pageName = location.pathname.split("/").filter(Boolean).pop() || "Mapa";

    useEffect(() => {
        let isMounted = true;
        let urlBlobCriada: string | null = null;

        async function carregarImagem() {
            if (!ponto.id) return;

            const url = await obterCapa('ponto', Number(ponto.id));

            if (isMounted) {
                if (url) {
                    if (url.startsWith("blob:")) urlBlobCriada = url;
                    setImagem(url);
                } else {
                    setImagem(trilhaGeneric);
                }
            } else if (url && url.startsWith("blob:")) {
                URL.revokeObjectURL(url);
            }
        }

        carregarImagem();

        return () => {
            isMounted = false;
            if (urlBlobCriada) {
                URL.revokeObjectURL(urlBlobCriada);
            }
        };
    }, [ponto.id]);

    if (!ponto.nome) return null;

    return (
        <Link
            to={`/trilha/${trilhaId}/ponto/${ponto.id}?from=${pageName}`}
            className="cardPonto carrosselCard"
            style={{
                backgroundImage: `url("${imagem}")`
            }}
        >
            <div className="info vertical">
                <h3>{ponto.nome}</h3>
                
                {ponto.planta && (
                    <i>{ponto.planta}</i>
                )}
            </div>
        </Link>
    );
}