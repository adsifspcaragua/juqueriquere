import SimpleButton from '../../components/ui/buttons/SimpleButton';
interface PontoInteresse {
    planta?: string;
    caminho?: string;
    misc?: string;
    latitude?: string;
    longitude?: string;
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
