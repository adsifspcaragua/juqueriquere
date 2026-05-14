
interface Ponto {
    planta?: string;
    Caminho?: string;
    misc?: string;
    latitude?: string;
    longitude?: string;
}

interface Props {
    ponto: Ponto;
    trilha: string;
}

export default function CardPonto({ ponto, trilha: _trilha  /*Temporário*/ }: Props) {
    return (
        <div className='cardTrilha carrosselCard'>
            <div className="info vertical">
            <h2>{ponto.planta || ponto.misc || ponto.Caminho}</h2>
            </div>
        </div>
        
    );
}