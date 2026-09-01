import Dexie from "dexie";
import type { Table } from "dexie";

export interface PontoInteresseDB {
  id: number;
  trilha_id: number;
  nome: string;
  descricao: string;
  planta?: string;
  latitude?: number | null;
  longitude?: number | null;
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

  // Caminho do arquivo no Supabase Storage
  caminho_arquivo: string;

  legenda?: string;

  // Cópia local para funcionamento offline
  arquivo?: Blob;

  // URL temporária criada a partir do Blob
  // Não é persistida; pode ser criada em runtime.
  url_local?: string;
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
      ramais: "id",
      informacoes_parque: "id",
      imagens: "id,trilha_id,ponto_interesse_id",
      metadata: "chave"
    });

    // Nova versão para permitir o campo arquivo.
    this.version(2).stores({
      trilhas: "id",
      pontos_interesse: "id,trilha_id",
      ramais: "id",
      informacoes_parque: "id",
      imagens: "id,trilha_id,ponto_interesse_id",
      metadata: "chave"
    });
  }
}

export const db = new JuqueriquereDB();
