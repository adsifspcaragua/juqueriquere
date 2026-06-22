import Dexie from "dexie";
import type { Table } from "dexie";

export interface TrilhaDB {
  id?: number;
  nome: string;
  cor_identificacao: string;
  dificuldade: string;
  extensao: string;
  duracao: string;
  descricao_curta: string;
  descricao: string;
  equipamento_recomendado: string;
  atencao: string;
}

export interface PontoInteresseDB {
  id: number;
  trilha_id?: number | null;
  nome: string;
  descricao?: string;
  planta?: string;
  caminho?: string;
  misc?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface RamalDB {
  id: string;
  trilha_id: number;
  nome: string;
  descricao: string;
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