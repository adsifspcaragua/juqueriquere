import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import '../styles/CardPonto.css';
import '../styles/CardTrilha.css';
import trilhaGeneric from '../../assets/img/CardTrilha.webp';

import { obterCapa } from '../../lib/services/sync';

interface Ponto {
    id: number;
    trilha_id: number;
    nome: string;
    planta?: string;
    latitude?: number | null;
    longitude?: number | null;
}

interface Props {
    ponto: Ponto;
    trilhaId: number;
}

export default function CardPonto({ ponto }: Props) {
    const [imagem, setImagem] = useState<string>(trilhaGeneric);

    const location = useLocation();
    const pageName = location.pathname.split("/").filter(Boolean).pop() || "Mapa";

    useEffect(() => {
        let isMounted = true;

        async function carregarImagem() {
            if (!ponto.id) return;

            try {
                const url = await obterCapa('ponto', Number(ponto.id));

                if (isMounted) {
                    if (url) {
                        setImagem(url);
                    } else {
                        setImagem(trilhaGeneric);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar capa do ponto:", error);
            }
        }

        carregarImagem();

        return () => {
            isMounted = false;
        };
    }, [ponto.id]);

    if (!ponto.nome) return null;

    return (
        <Link
            to={`/ponto/${ponto.id}?from=${pageName}`}
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