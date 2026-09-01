import { supabase } from "../supabase";
import { db } from "../dexie";

async function baixarImagem(
    caminhoArquivo: string
): Promise<Blob | undefined> {
    try {
        // Ignora registros antigos que possuem Base64
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
            console.error(
                `Erro ao baixar imagem ${caminhoArquivo}:`,
                error
            );

            return undefined;
        }

        return data;
    } catch (error) {
        console.error(
            `Erro ao baixar imagem ${caminhoArquivo}:`,
            error
        );

        return undefined;
    }
}

export async function sincronizarTrilhas() {
  const { data, error } = await supabase
    .from("trilhas")
    .select("*");

  if (error) throw error;

  await db.trilhas.clear();

  await db.trilhas.bulkPut(data ?? []);
}

export async function sincronizarImagens() {
  const { data, error } = await supabase
    .from("imagens")
    .select("*");

  if (error) throw error;

  if (!data?.length) {
    await db.imagens.clear();
    return;
  }

  const imagensParaDexie = await Promise.all(
    data.map(async (imagem) => {
      const arquivo = await baixarImagem(
        imagem.caminho_arquivo
      );

      return {
        ...imagem,
        arquivo,
      };
    })
  );

  await db.imagens.clear();

  await db.imagens.bulkPut(imagensParaDexie);
}

export async function sincronizarPontos() {
  const { data, error } = await supabase
    .from("pontos_interesse")
    .select("*");

  if (error) {
    throw error;
  }

  await db.pontos_interesse.clear();

  if (data) {
    await db.pontos_interesse.bulkPut(data);
  }
}
