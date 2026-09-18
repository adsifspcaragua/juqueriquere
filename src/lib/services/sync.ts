import { supabase } from "../supabase";
import { db } from "../dexie";

type TipoEntidade = "trilha" | "ponto";

function getCampoBusca(tipo: TipoEntidade): "trilha_id" | "ponto_interesse_id" {
  return tipo === "trilha" ? "trilha_id" : "ponto_interesse_id";
}

// Cache em memória para reutilizar URLs de Blob e evitar vazamento de memória
const objectUrlCache = new WeakMap<Blob, string>();

function obterUrlDoBlob(blob: Blob): string {
  if (objectUrlCache.has(blob)) {
    return objectUrlCache.get(blob)!;
  }
  const url = URL.createObjectURL(blob);
  objectUrlCache.set(blob, url);
  return url;
}

// Converte caminho relativo de arquivo no Supabase para URL pública válida
export function getPublicUrl(caminhoArquivo: string): string {
  if (!caminhoArquivo) return "";
  if (
    caminhoArquivo.startsWith("http://") ||
    caminhoArquivo.startsWith("https://") ||
    caminhoArquivo.startsWith("data:")
  ) {
    return caminhoArquivo;
  }
  const { data } = supabase.storage.from("imagens").getPublicUrl(caminhoArquivo);
  return data.publicUrl;
}

// Extrai a URL final da imagem com prioridade para o Blob local
function extrairUrlImagem(img: { arquivo?: Blob; caminho_arquivo?: string }): string | null {
  if (img.arquivo instanceof Blob && img.arquivo.size > 0) {
    return obterUrlDoBlob(img.arquivo);
  }
  if (img.caminho_arquivo) {
    return getPublicUrl(img.caminho_arquivo);
  }
  return null;
}

async function baixarImagem(
  caminhoArquivo: string
): Promise<Blob | undefined> {
  if (!caminhoArquivo || !navigator.onLine) return undefined;

  try {
    if (caminhoArquivo.startsWith("data:")) {
      console.warn(
        "Imagem ignorada por conter Base64:",
        caminhoArquivo.substring(0, 50)
      );
      return undefined;
    }

    if (caminhoArquivo.startsWith("http://") || caminhoArquivo.startsWith("https://")) {
      const response = await fetch(caminhoArquivo);
      if (!response.ok) return undefined;
      return await response.blob();
    }

    const { data, error } = await supabase.storage
      .from("imagens")
      .download(caminhoArquivo);

    if (error) {
      console.error(`Erro ao baixar imagem ${caminhoArquivo}:`, error);
      return undefined;
    }

    return data;
  } catch (error) {
    console.error(`Erro ao baixar imagem ${caminhoArquivo}:`, error);
    return undefined;
  }
}

// Processador de tarefas em lotes concorrentes
async function processarEmLotes<T, R>(
  items: T[],
  limiteConcorrencia: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const resultados: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      resultados[currentIndex] = await fn(items[currentIndex]);
    }
  }

  const workers = Array.from(
    { length: Math.min(limiteConcorrencia, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return resultados;
}

// Abstração genérica para sincronizar tabelas simples mantendo resiliência offline
async function sincronizarTabela<T>(
  nomeTabela: string,
  tabelaDexie: { clear: () => Promise<void>; bulkPut: (items: T[]) => Promise<unknown> }
) {
  if (!navigator.onLine) return;

  try {
    const { data, error } = await supabase.from(nomeTabela).select("*");
    if (error) throw error;

    if (data) {
      await tabelaDexie.clear();
      await tabelaDexie.bulkPut(data);
    }
  } catch (error) {
    console.error(`Erro ao sincronizar tabela ${nomeTabela}:`, error);
  }
}

// Funções de Sincronização Geral
export async function sincronizarTrilhas() {
  await sincronizarTabela("trilhas", db.trilhas);
}

export async function sincronizarPontos() {
  await sincronizarTabela("pontos_interesse", db.pontos_interesse);
}

export async function sincronizarImagens() {
  if (!navigator.onLine) return;

  try {
    const { data: remoteImages, error } = await supabase.from("imagens").select("*");

    if (error || !remoteImages) return;

    const localImages = await db.imagens.toArray();
    const localMap = new Map(localImages.map((img) => [img.id, img]));

    const remoteIds = new Set(remoteImages.map((img) => img.id));
    const idsToDelete = localImages
      .filter((img) => !remoteIds.has(img.id))
      .map((img) => img.id);

    if (idsToDelete.length > 0) {
      await db.imagens.bulkDelete(idsToDelete);
    }

    if (remoteImages.length === 0) return;

    const limiteConcorrencia = 3;

    const imagensParaDexie = await processarEmLotes(
      remoteImages,
      limiteConcorrencia,
      async (remoteImg) => {
        const localImg = localMap.get(remoteImg.id);
        const mesmoCaminho = localImg?.caminho_arquivo === remoteImg.caminho_arquivo;
        const temBlobValido = Boolean(localImg?.arquivo && localImg.arquivo.size > 0);

        if (mesmoCaminho && temBlobValido) {
          return {
            ...remoteImg,
            arquivo: localImg!.arquivo,
          };
        }

        const arquivo = await baixarImagem(remoteImg.caminho_arquivo);

        return {
          ...remoteImg,
          arquivo,
        };
      }
    );

    await db.imagens.bulkPut(imagensParaDexie);
  } catch (error) {
    console.error("Erro ao sincronizar imagens remotas:", error);
  }
}

// Executa a sincronização completa de todas as entidades
export async function sincronizarTudo() {
  if (!navigator.onLine) return;
  await sincronizarTrilhas();
  await sincronizarPontos();
  await sincronizarImagens();
}

// Lógica Unificada de Busca de Imagens com suporte Offline-First
async function obterImagensPorEntidade(
  tipo: TipoEntidade,
  id: number
): Promise<string[]> {
  const campoBusca = getCampoBusca(tipo);
  const idNumerico = Number(id);

  try {
    // Tenta buscar no banco local Dexie primeiro
    const imagensLocais = await db.imagens
      .where(campoBusca)
      .equals(idNumerico)
      .toArray();

    if (imagensLocais.length > 0) {
      const urlsLocais = imagensLocais
        .map(extrairUrlImagem)
        .filter((url): url is string => url !== null);

      if (urlsLocais.length > 0) {
        return urlsLocais;
      }
    }

    // Se não existir localmente e estiver offline, encerra para evitar erros
    if (!navigator.onLine) {
      return [];
    }

    // Busca no Supabase apenas se necessário
    const { data: remoteImages, error } = await supabase
      .from("imagens")
      .select("*")
      .eq(campoBusca, idNumerico);

    if (error || !remoteImages || remoteImages.length === 0) {
      return [];
    }

    const limiteConcorrencia = 3;

    const imagensParaDexie = await processarEmLotes(
      remoteImages,
      limiteConcorrencia,
      async (remoteImg) => {
        const arquivo = await baixarImagem(remoteImg.caminho_arquivo);
        return {
          ...remoteImg,
          arquivo,
        };
      }
    );

    await db.imagens.bulkPut(imagensParaDexie);

    return imagensParaDexie
      .map(extrairUrlImagem)
      .filter((url): url is string => url !== null);
  } catch (error) {
    console.error(`Erro ao buscar imagens da entidade ${tipo} (${id}):`, error);
    return [];
  }
}

export async function obterImagensPorTrilha(trilhaId: number): Promise<string[]> {
  return obterImagensPorEntidade("trilha", trilhaId);
}

export async function obterImagensPorPonto(pontoId: number): Promise<string[]> {
  return obterImagensPorEntidade("ponto", pontoId);
}

export async function obterCapa(
  tipo: TipoEntidade,
  id: number
): Promise<string | null> {
  const imagens = await obterImagensPorEntidade(tipo, id);
  return imagens[0] ?? null;
}