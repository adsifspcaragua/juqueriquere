interface PontoInteresse {
    planta?: string;
    caminho?: string;
    misc?: string;
    latitude?: string;
    longitude?: string;
}
export default interface Trilha {
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
    ramais: {
        nome: string;
        descricao: string;
        id: number | string;
    }[];
    pontos_no_mapa: number[];
}
