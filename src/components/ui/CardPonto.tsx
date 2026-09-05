import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import '../styles/CardPonto.css'
import trilhaGeneric from '../../assets/img/CardTrilha.webp'

import { db } from '../../lib/dexie';


interface Ponto {
    id : number;
    nome: string;
    planta?: string;
    latitude?: number | null;
    longitude?: number | null;
}

interface Props {
    ponto: Ponto;
    trilhaId: number;
    imagem?: string;
}

export default function CardPonto({ ponto, trilhaId }: Props) {
    const [imagem, setImagem] = useState<string>();

    useEffect(() => {
        if (!ponto.id) return;
        async function loadData() {
            const imagemDb = await db.imagens.where('ponto_interesse_id').equals(Number(ponto.id)).first();
            if (imagemDb) {
                setImagem(`url(${imagemDb.caminho_arquivo})`);
            } else {
                setImagem(`url(${trilhaGeneric})`);
            }
        }
        loadData();
    }, [ponto.id]);

    const location = useLocation();
    const pageName = location.pathname.split("/").filter(Boolean).pop() || "explorar";

    if (!ponto.nome) return null;

    return (
        <Link
            to={`/trilha/${trilhaId}/ponto/${ponto.id}?from=${pageName}`}
            className="cardPonto carrosselCard"
            style={{ backgroundImage: imagem }}
        >
            <div className="info vertical">
                <h2>{ponto.nome}</h2>
                {ponto.planta && <i>{ponto.planta}</i>}
            </div>
        </Link>
    );
}
