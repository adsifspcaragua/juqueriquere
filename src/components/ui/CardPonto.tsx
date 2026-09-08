import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import '../styles/CardPonto.css';
import trilhaGeneric from '../../assets/img/CardTrilha.webp';

import { db } from '../../lib/dexie';

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

    const pageName =
        location.pathname.split("/").filter(Boolean).pop() || "explorar";

    useEffect(() => {
        if (!ponto.id) return;

        let objectUrl: string | null = null;
        let cancelado = false;

        async function carregarImagem() {
            try {
                const imagemDb = await db.imagens
                    .where('ponto_interesse_id')
                    .equals(Number(ponto.id))
                    .first();

                if (cancelado) return;

                // Imagem encontrada no Dexie
                if (imagemDb?.arquivo instanceof Blob) {
                    objectUrl = URL.createObjectURL(imagemDb.arquivo);

                    setImagem(objectUrl);
                    return;
                }

                // Caso exista uma URL válida no caminho_arquivo
                if (
                    imagemDb?.caminho_arquivo &&
                    (
                        imagemDb.caminho_arquivo.startsWith('http://') ||
                        imagemDb.caminho_arquivo.startsWith('https://') ||
                        imagemDb.caminho_arquivo.startsWith('data:')
                    )
                ) {
                    setImagem(imagemDb.caminho_arquivo);
                    return;
                }

                // Caso não exista imagem
                setImagem(trilhaGeneric);

            } catch (error) {
                console.error(
                    `Erro ao carregar imagem do ponto ${ponto.id}:`,
                    error
                );

                if (!cancelado) {
                    setImagem(trilhaGeneric);
                }
            }
        }

        carregarImagem();

        // Libera a ObjectURL criada
        return () => {
            cancelado = true;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
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
                <h2>{ponto.nome}</h2>

                {ponto.planta && (
                    <i>{ponto.planta}</i>
                )}
            </div>
        </Link>
    );
}

