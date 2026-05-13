import SimpleButton from '../../components/ui/buttons/SimpleButton';
interface PontoInteresse {
    planta: string;
    latitude: string;
    longitude: string;
}
export interface Trilha {
    id: number;
    nome: string;
    cor_identificacao: string;
    dificuldade: string;
    extensao: string;
    duracao: string;
    descricao_curta: string;
    descricao: string;
    pontos_interesse: PontoInteresse[];
    equipamento_recomendado: string;
    atencao: string;
    pontos_no_mapa: number[];
}
interface TrilhaProps {
    trilha: Trilha;
}

export default function TrilhaInfo({trilha}: TrilhaProps){
    const Pontos = () => {
        const rendderPontos = trilha.pontos_interesse.map((ponto, index) => (
            <SimpleButton key={index} icon='none' tema='dark'>
                <h3>{ponto.planta}</h3>
            </SimpleButton>
        ));
        return(
            <div className="pontosTrilha vertical">
                <h2>Pontos de interesse em {trilha.nome}:</h2>
                <div className="vertical gap5">{rendderPontos}</div>
            </div>
        )
    }

    return(
        <>
            <div className="cardTrilhaInfo conteudo">
                <Pontos />
            </div>
        </>
    )
}