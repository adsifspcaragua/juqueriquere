import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import './CardPonto.css'
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
    trilhaId: number; // Pode ser do tipo TrilhaType
    imagem?: string;
}

export default function CardPonto({ ponto, trilhaId  /*Temporário*/ }: Props) {
    if (!ponto.nome) return null; // Retorna null se o ponto não tiver nome
    const [imagem, setImagem] = useState<string>();
    

    useEffect(() => {
        async function loadData() {

            const imagemDb = await db.imagens.where('ponto_interesse_id').equals(Number(ponto.id)).first();
            
            if (imagemDb) {
                setImagem(`url(${imagemDb.caminho_arquivo})`);
            } else {
                setImagem(`url(${trilhaGeneric})`);
            }
        }

        loadData();
    }, []);

    const location = useLocation();
    const pageName = location.pathname.split("/").filter(Boolean).pop() || "explorar";

    return (
        <Link 
        to={`/trilha/${trilhaId}/ponto/${ponto.id}?from=${pageName}`}
        className={imagem ?
            `cardTrilha carrosselCard` : `cardTrilha carrosselCard`
        }
        style={ {backgroundImage : imagem} }
        >
            <div className='cardTrilha cardPonto carrosselCard'>
                <div className="info vertical">
                <h2>{ponto.nome}</h2>
                {ponto.planta && <h3>{ponto.planta}</h3>}
                </div>
            </div>
        </Link>
    );
}