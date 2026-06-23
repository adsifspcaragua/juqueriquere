import Dexie from "dexie";
import type { Table } from "dexie";

interface PontoInteresseDB {
  nome: string;
  latitude?: string;
  longitude?: string;
}

interface RamalDB {
  nome: string;
  descricao: string;
  id: number | string;
}

export interface TrilhaDB {
  id: number;
  nome: string;
  cor_identificacao: string;
  dificuldade: string;
  extensao: string;
  duracao: string;
  descricao_curta: string;
  descricao: string;
  equipamento_recomendado: string;
  atencao: string;
  pontos_interesse: PontoInteresseDB[];
  ramais: RamalDB[];
  pontos_no_mapa: number[];
}

export interface InformacaoParqueDB {
  id: number;
  titulo: string;
  conteudo: string;
}

export interface ImagemDB {
  id: number;
  trilha_id?: number | null;
  ponto_interesse_id?: number | null;
  caminho_arquivo: string;
  legenda?: string;
}

export interface MetadataDB {
  chave: string;
  valor: string;
}

export class JuqueriquereDB extends Dexie {
  trilhas!: Table<TrilhaDB>;
  pontos_interesse!: Table<PontoInteresseDB>;
  ramais!: Table<RamalDB>;
  informacoes_parque!: Table<InformacaoParqueDB>;
  imagens!: Table<ImagemDB>;
  metadata!: Table<MetadataDB>;

  constructor() {
    super("JuqueriquereDB");

    this.version(1).stores({
      trilhas: "id",
      pontos_interesse: "id,trilha_id",
      ramais: "id,trilha_id",
      informacoes_parque: "id",
      imagens: "id,trilha_id,ponto_interesse_id",
      metadata: "chave"
    });
  }
}

export const db = new JuqueriquereDB();