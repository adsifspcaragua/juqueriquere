import { Link, useLocation } from 'react-router-dom';
import './CardPonto.css'
import type TrilhaType from '../../pages/Trilhas/TrilhaInfo';

interface Ponto {
    nome: string;
    planta?: string;
    latitude?: string;
    longitude?: string;
}

interface Props {
    ponto: Ponto;
    trilha: TrilhaType; // Pode ser do tipo TrilhaType
}

export default function CardPonto({ ponto, trilha: trilha  /*Temporário*/ }: Props) {
    if (!ponto.nome) return null; // Retorna null se o ponto não tiver nome

    const location = useLocation();
    const pageName = location.pathname.split("/").filter(Boolean).pop() || "explorar";

    return (
        <Link to={`/trilha/${Object(trilha).id}/ponto/${ponto.nome}?from=${pageName}`}>
            <div className='cardTrilha cardPonto carrosselCard'>
                <div className="info vertical">
                <h2>{ponto.nome}</h2>
                {ponto.planta && <h3>{ponto.planta}</h3>}
                </div>
            </div>
        </Link>
    );
}