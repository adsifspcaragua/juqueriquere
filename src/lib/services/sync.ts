import { supabase } from "../supabase";
import { db } from "../dexie";

type TipoEntidade = "trilha" | "ponto";

function getCampoBusca(tipo: TipoEntidade): "trilha_id" | "ponto_interesse_id" {
  return tipo === "trilha" ? "trilha_id" : "ponto_interesse_id";
}

async function baixarImagem(
  caminhoArquivo: string
): Promise<Blob | undefined> {
  try {
    if (caminhoArquivo.startsWith("data:")) {
      console.warn(
        "Imagem ignorada: caminho_arquivo contém Base64:",
        caminhoArquivo.substring(0, 50)
      );
      return undefined;
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

// Funções de Sincronização Geral
export async function sincronizarTrilhas() {
  const { data, error } = await supabase.from("trilhas").select("*");
  if (error) throw error;

  await db.trilhas.clear();
  await db.trilhas.bulkPut(data ?? []);
}

export async function sincronizarPontos() {
  const { data, error } = await supabase.from("pontos_interesse").select("*");
  if (error) throw error;

  await db.pontos_interesse.clear();
  if (data) {
    await db.pontos_interesse.bulkPut(data);
  }
}

export async function sincronizarImagens() {
  const { data: remoteImages, error } = await supabase.from("imagens").select("*");

  if (error) {
    console.error("Erro ao buscar imagens remotas:", error);
    throw error;
  }

  if (!remoteImages) return;

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

  const imagensParaDexie = await Promise.all(
    remoteImages.map(async (remoteImg) => {
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
    })
  );

  await db.imagens.bulkPut(imagensParaDexie);
}

// Lógica Unificada de Busca de Imagens
async function obterImagensPorEntidade(
  tipo: TipoEntidade,
  id: number
): Promise<string[]> {
  const campoBusca = getCampoBusca(tipo);
  const idNumerico = Number(id);

  try {
    // 1. Tenta buscar no Dexie primeiro
    const imagensLocais = await db.imagens
      .where(campoBusca)
      .equals(idNumerico)
      .toArray();

    const urlsLocais = imagensLocais
      .map((img) => {
        if (img.arquivo instanceof Blob && img.arquivo.size > 0) {
          return URL.createObjectURL(img.arquivo);
        }
        if (
          img.caminho_arquivo &&
          (img.caminho_arquivo.startsWith("http://") ||
            img.caminho_arquivo.startsWith("https://") ||
            img.caminho_arquivo.startsWith("data:"))
        ) {
          return img.caminho_arquivo;
        }
        return null;
      })
      .filter((url): url is string => url !== null);

    if (urlsLocais.length > 0) {
      return urlsLocais;
    }

    // 2. Se não existir no Dexie, busca no Supabase APENAS para esta entidade
    const { data: remoteImages, error } = await supabase
      .from("imagens")
      .select("*")
      .eq(campoBusca, idNumerico);

    if (error || !remoteImages || remoteImages.length === 0) {
      return [];
    }

    // 3. Baixa e grava no Dexie
    const imagensParaDexie = await Promise.all(
      remoteImages.map(async (remoteImg) => {
        const arquivo = await baixarImagem(remoteImg.caminho_arquivo);
        return {
          ...remoteImg,
          arquivo,
        };
      })
    );

    await db.imagens.bulkPut(imagensParaDexie);

    // 4. Retorna URLs criadas
    return imagensParaDexie
      .map((img) => {
        if (img.arquivo instanceof Blob && img.arquivo.size > 0) {
          return URL.createObjectURL(img.arquivo);
        }
        if (
          img.caminho_arquivo &&
          (img.caminho_arquivo.startsWith("http://") ||
            img.caminho_arquivo.startsWith("https://") ||
            img.caminho_arquivo.startsWith("data:"))
        ) {
          return img.caminho_arquivo;
        }
        return null;
      })
      .filter((url): url is string => url !== null);
  } catch (error) {
    console.error(`Erro ao buscar imagens do(a) ${tipo} (${id}):`, error);
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