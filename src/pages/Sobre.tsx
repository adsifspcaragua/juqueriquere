import { useEffect, useState } from "react";
import { usePageTitle } from "../lib/hooks/usePageTitle";
import { supabase } from "../lib/supabase";
import { db } from "../lib/dexie";

import Logo from "../assets/logo.webp";
import SimpleButton from "../components/ui/buttons/SimpleButton";
import imgNotFound from "../assets/img/imgNotFound.webp";

interface Sobre {
  id: number;
  descricao: string;
  area: string;

  acessibilidade_titulo: string;
  acessibilidade_descricao: string;

  visitas_grupo_titulo: string;
  visitas_grupo_descricao: string;

  horario_titulo: string;
  horario_descricao: string;

  endereco_titulo: string;
  endereco_descricao: string;

  email_agendamento: string;
  link_mapa: string;
}

interface EspacoParque {
  id: number;
  titulo: string;
  descricao: string;
  imagem_id?: number | null;
  ordem: number;
  caminho_imagem_local?: string;
}

interface EspacoParqueComImagem extends EspacoParque {
  imagemUrl?: string;
}

interface ImagemGaleria {
  id: number;
  caminho_arquivo: string;
  legenda?: string | null;
}

/*
|--------------------------------------------------------------------------
| CACHE DAS IMAGENS
|--------------------------------------------------------------------------
*/

const CACHE_IMAGENS = "juqueriquere-imagens-v1";

/**
 * Retorna a URL pública de uma imagem do Supabase.
 */
function resolverUrlImagem(
  caminhoOuUrl?: string | null
): string {
  if (!caminhoOuUrl) return imgNotFound;

  if (
    caminhoOuUrl.startsWith("data:") ||
    caminhoOuUrl.startsWith("blob:") ||
    caminhoOuUrl.startsWith("http")
  ) {
    return caminhoOuUrl;
  }

  const { data } = supabase.storage
    .from("imagens")
    .getPublicUrl(caminhoOuUrl);

  return data.publicUrl || imgNotFound;
}

/**
 * Obtém uma imagem do Cache Storage.
 *
 * ONLINE:
 * Supabase → fetch → Cache Storage → Blob URL
 *
 * OFFLINE:
 * Cache Storage → Blob URL
 */
async function obterImagemOffline(
  caminho?: string | null
): Promise<string> {
  if (!caminho) {
    return imgNotFound;
  }

  /*
   * Imagens que já são locais não precisam
   * passar pelo Cache Storage.
   */
  if (
    caminho.startsWith("data:") ||
    caminho.startsWith("blob:")
  ) {
    return caminho;
  }

  const url = resolverUrlImagem(caminho);

  if (!url || url === imgNotFound) {
    return imgNotFound;
  }

  try {
    const cache = await caches.open(CACHE_IMAGENS);

    /*
     * Primeiro tenta encontrar a imagem
     * no cache local.
     */
    let resposta = await cache.match(url);

    /*
     * Se não existe no cache e estamos online,
     * baixa a imagem do Supabase.
     */
    if (!resposta && navigator.onLine) {
      const respostaNova = await fetch(url);

      if (respostaNova.ok) {
        /*
         * Guarda uma cópia no Cache Storage.
         */
        await cache.put(url, respostaNova.clone());

        resposta = respostaNova;
      }
    }

    /*
     * Se conseguiu encontrar/baixar a imagem,
     * transforma em Blob URL.
     */
    if (resposta && resposta.ok) {
      const blob = await resposta.blob();

      return URL.createObjectURL(blob);
    }

    /*
     * Fallback para a URL normal.
     */
    return url;
  } catch (error) {
    console.warn(
      "Erro ao carregar imagem:",
      caminho,
      error
    );

    return url;
  }
}

/**
 * Remove uma imagem do Cache Storage.
 *
 * Essa função pode ser utilizada futuramente
 * quando uma imagem for removida pelo painel admin.
 */
async function removerImagemDoCache(
  caminho?: string | null
) {
  if (!caminho) return;

  if (
    caminho.startsWith("data:") ||
    caminho.startsWith("blob:")
  ) {
    return;
  }

  const url = resolverUrlImagem(caminho);

  if (!url || url === imgNotFound) return;

  try {
    const cache = await caches.open(CACHE_IMAGENS);
    await cache.delete(url);
  } catch (error) {
    console.warn(
      "Erro ao remover imagem do cache:",
      caminho,
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| SINCRONIZAÇÃO DO SOBRE
|--------------------------------------------------------------------------
*/

/**
 * Sincroniza as informações do Sobre.
 *
 * Primeiro utiliza o Dexie para permitir
 * carregamento offline.
 *
 * Depois, se estiver online, verifica o
 * Supabase e atualiza o Dexie.
 */
async function sincronizarSobre(
  onUpdate: (data: Sobre) => void
) {
  /*
   * 1. CARREGAMENTO LOCAL
   */
  if (db.sobre) {
    const sobreLocal = await db.sobre.toArray();

    if (sobreLocal.length > 0) {
      onUpdate(sobreLocal[0] as Sobre);
    }
  }

  /*
   * 2. SINCRONIZAÇÃO ONLINE
   */
  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from("sobre")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        onUpdate(data as Sobre);

        if (db.sobre) {
          await db.sobre.clear();
          await db.sobre.put(data as Sobre);
        }
      }
    } catch (error) {
      console.error(
        "Erro na sincronização de informações do Parque:",
        error
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| SINCRONIZAÇÃO DA GALERIA
|--------------------------------------------------------------------------
*/

/**
 * Sincroniza as imagens da galeria.
 *
 * O Dexie guarda os metadados.
 * O Cache Storage guarda os arquivos reais.
 */
async function sincronizarGaleria(
  onUpdate: (data: ImagemGaleria[]) => void
) {
  /*
   * 1. CARREGAMENTO LOCAL
   */
  if (db.imagens) {
    const imagensLocais =
      await db.imagens.toArray();

    const galeriaLocal =
      imagensLocais.filter(
        (img) =>
          img.caminho_arquivo?.startsWith(
            "galeria/"
          ) ||
          img.caminho_arquivo?.startsWith(
            "data:"
          )
      );

    if (galeriaLocal.length > 0) {
      onUpdate(
        galeriaLocal as ImagemGaleria[]
      );
    }
  }

  /*
   * 2. SINCRONIZAÇÃO ONLINE
   */
  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from("imagens")
        .select(
          "id, caminho_arquivo, legenda"
        )
        .like(
          "caminho_arquivo",
          "galeria/%"
        );

      if (!error && data) {
        const imagensGaleria =
          data as ImagemGaleria[];

        /*
         * Baixa cada imagem e coloca no cache.
         */
        for (const imagem of imagensGaleria) {
          await obterImagemOffline(
            imagem.caminho_arquivo
          );

          /*
           * Salva os metadados no Dexie.
           */
          if (db.imagens) {
            await db.imagens.put(imagem);
          }
        }

        onUpdate(imagensGaleria);
      }
    } catch (error) {
      console.error(
        "Erro na sincronização da galeria:",
        error
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| SINCRONIZAÇÃO DOS ESPAÇOS DO PARQUE
|--------------------------------------------------------------------------
*/

async function sincronizarEspacos(
  onUpdate: (
    data: EspacoParqueComImagem[]
  ) => void
) {
  /**
   * Associa cada espaço à sua imagem.
   */
  const processarEspacos = async (
    espacosData: EspacoParque[],
    imagensData: ImagemGaleria[]
  ): Promise<EspacoParqueComImagem[]> => {
    const resultado: EspacoParqueComImagem[] =
      [];

    for (const espaco of espacosData) {
      let imagemUrl: string | undefined;

      /*
       * Caso exista uma imagem local,
       * utiliza diretamente.
       */
      if (espaco.caminho_imagem_local) {
        imagemUrl =
          espaco.caminho_imagem_local;
      }

      /*
       * Caso contrário procura a imagem
       * pelo imagem_id.
       */
      else if (espaco.imagem_id) {
        const imagem = imagensData.find(
          (item) =>
            item.id === espaco.imagem_id
        );

        if (imagem) {
          imagemUrl =
            await obterImagemOffline(
              imagem.caminho_arquivo
            );
        }
      }

      resultado.push({
        ...espaco,
        imagemUrl,
      });
    }

    return resultado;
  };

  /*
   * 1. CARREGAMENTO LOCAL
   */
  if (db.espacos_parque) {
    const espacosLocais =
      (await db.espacos_parque.toArray()) as EspacoParque[];

    const imagensLocais = db.imagens
      ? ((await db.imagens.toArray()) as ImagemGaleria[])
      : [];

    if (espacosLocais.length > 0) {
      const ordenados =
        espacosLocais.sort(
          (a, b) => a.ordem - b.ordem
        );

      const espacosProcessados =
        await processarEspacos(
          ordenados,
          imagensLocais
        );

      onUpdate(espacosProcessados);
    }
  }

  /*
   * 2. SINCRONIZAÇÃO ONLINE
   */
  if (navigator.onLine) {
    try {
      /*
       * Busca os espaços.
       */
      const {
        data: espacosData,
        error: espacosError,
      } = await supabase
        .from("espacos_parque")
        .select("*")
        .order("ordem", {
          ascending: true,
        });

      if (
        !espacosError &&
        espacosData
      ) {
        /*
         * Descobre quais imagens realmente
         * são utilizadas pelos espaços.
         */
        const idsImagens =
          espacosData
            .map(
              (espaco) =>
                espaco.imagem_id
            )
            .filter(
              (
                id
              ): id is number =>
                id !== null &&
                id !== undefined
            );

        let imagensData: ImagemGaleria[] =
          [];

        /*
         * Só consulta a tabela imagens
         * se existirem imagens utilizadas.
         */
        if (idsImagens.length > 0) {
          const {
            data,
            error,
          } = await supabase
            .from("imagens")
            .select(
              "id, caminho_arquivo, legenda"
            )
            .in(
              "id",
              idsImagens
            );

          if (!error && data) {
            imagensData =
              data as ImagemGaleria[];
          }
        }

        /*
         * Baixa as imagens utilizadas pelos
         * espaços para o Cache Storage.
         */
        for (const imagem of imagensData) {
          await obterImagemOffline(
            imagem.caminho_arquivo
          );
        }

        /*
         * Processa os espaços.
         */
        const espacosProcessados =
          await processarEspacos(
            espacosData as EspacoParque[],
            imagensData
          );

        onUpdate(
          espacosProcessados
        );

        /*
         * Salva os espaços no Dexie.
         */
        if (db.espacos_parque) {
          await db.espacos_parque.clear();

          await db.espacos_parque.bulkPut(
            espacosData
          );
        }

        /*
         * Salva os metadados das imagens
         * no Dexie.
         */
        if (
          db.imagens &&
          imagensData.length > 0
        ) {
          for (const imagem of imagensData) {
            await db.imagens.put(imagem);
          }
        }
      }
    } catch (error) {
      console.error(
        "Erro na sincronização de espaços:",
        error
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| COMPONENTE PRINCIPAL
|--------------------------------------------------------------------------
*/

export default function Sobre() {
  usePageTitle("Sobre");

  const [sobre, setSobre] =
    useState<Sobre | null>(null);

  const [espacos, setEspacos] =
    useState<EspacoParqueComImagem[]>([]);

  const [imagensGaleria, setImagensGaleria] =
    useState<ImagemGaleria[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  /*
   * Guarda as Blob URLs criadas durante
   * a execução do componente.
   *
   * Elas serão liberadas no unmount.
   */
  const blobUrlsRef =
    useState<string[]>([])[0];

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);

        await Promise.all([
          sincronizarSobre((data) => {
            if (ativo) {
              setSobre(data);
            }
          }),

          sincronizarGaleria((data) => {
            if (ativo) {
              setImagensGaleria(data);
            }
          }),

          sincronizarEspacos((data) => {
            if (ativo) {
              setEspacos(data);
            }
          }),
        ]);
      } catch (error) {
        console.error(
          "Erro ao carregar dados da página Sobre:",
          error
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    /*
     * Quando voltar a ficar online, tenta
     * sincronizar novamente.
     */
    const handleOnline = () => {
      carregarDados();
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    return () => {
      ativo = false;

      window.removeEventListener(
        "online",
        handleOnline
      );

      /*
       * Libera Blob URLs criadas pelo cache.
       */
      for (const url of blobUrlsRef) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignora erros de revogação
        }
      }
    };
  }, []);

  return (
    <>
      <div className="paddingHeader"></div>

      <section
        className="vertical conteudo"
        id="sobre"
      >
        <div
          className="horizontal logo"
          style={{ width: "100%" }}
        >
          <img
            src={Logo}
            alt="Logo Parque"
            style={{ height: 45 }}
          />
        </div>

        {carregando && !sobre ? (
          <p>
            Carregando informações do parque...
          </p>
        ) : (
          <>
            {/* ==========================================================
                SOBRE O PARQUE
            ========================================================== */}

            <div className="desktopWrap1-2 gap30">
              <div className="vertical gap15">
                <h1>Sobre o parque</h1>

                <p>
                  {sobre?.descricao}

                  <br />
                  <br />

                  {sobre?.area}
                </p>
              </div>

              {/* GALERIA */}

              <div
                className="carrossel horizontal galeria"
              >
                {imagensGaleria.map(
                  (imagem) => (
                    <ImagemGaleriaCard
                      key={imagem.id}
                      imagem={imagem}
                    />
                  )
                )}
              </div>
            </div>

            <div className="linhaPontilhadaLight"></div>

            {/* ==========================================================
                ESPAÇOS DO PARQUE
            ========================================================== */}

            <h1>Espaços do Parque</h1>

            <div
              className="carrossel horizontal"
              id="carrosselEspacos"
            >
              {espacos.map(
                (espaco) => (
                  <div
                    key={espaco.id}
                    className="carrosselCard espacoCard vertical"
                    style={{
                      backgroundImage: `url(${
                        espaco.imagemUrl ||
                        imgNotFound
                      })`,
                    }}
                  >
                    <div className="fade vertical gap5">
                      <h1>
                        {espaco.titulo}
                      </h1>

                      <p>
                        {espaco.descricao}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="linhaPontilhadaLight"></div>

            {/* ==========================================================
                ACESSIBILIDADE
            ========================================================== */}

            <div className="vertical gap5">
              <h1>
                {sobre?.acessibilidade_titulo ||
                  "Acessibilidade"}
              </h1>

              <p>
                {sobre?.acessibilidade_descricao}
              </p>
            </div>

            <div className="linhaPontilhadaLight"></div>

            {/* ==========================================================
                VISITE O PARQUE
            ========================================================== */}

            <h1>Visite o Parque</h1>

            <div className="vertical gap15 desktopWrap3">
              {/* VISITAS EM GRUPO */}

              <div
                className="vertical card"
                id="cardGrupo"
              >
                <h1>
                  {sobre?.visitas_grupo_titulo}
                </h1>

                <p>
                  {sobre?.visitas_grupo_descricao}
                </p>

                {sobre?.email_agendamento && (
                  <SimpleButton
                    tema="dark"
                    raio="10"
                    path={`mailto:${sobre.email_agendamento}`}
                  >
                    Enviar e-mail
                  </SimpleButton>
                )}
              </div>

              {/* HORÁRIO */}

              <div
                className="vertical card"
                id="cardHorario"
              >
                <h1>
                  {sobre?.horario_titulo}
                </h1>

                <p>
                  {sobre?.horario_descricao}
                </p>
              </div>

              {/* ENDEREÇO */}

              <div
                className="vertical card"
                id="cardEndereco"
              >
                <h1>
                  {sobre?.endereco_titulo}
                </h1>

                <p>
                  {sobre?.endereco_descricao}
                </p>

                {sobre?.link_mapa && (
                  <SimpleButton
                    tema="dark"
                    raio="10"
                    path={sobre.link_mapa}
                  >
                    Ver rotas
                  </SimpleButton>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENTE DA IMAGEM DA GALERIA
|--------------------------------------------------------------------------
*/

interface ImagemGaleriaCardProps {
  imagem: ImagemGaleria;
}

function ImagemGaleriaCard({
  imagem,
}: ImagemGaleriaCardProps) {
  const [url, setUrl] =
    useState<string>(imgNotFound);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {
    let ativo = true;
    let blobUrl: string | null = null;

    async function carregarImagem() {
      try {
        setCarregando(true);

        const imagemUrl =
          await obterImagemOffline(
            imagem.caminho_arquivo
          );

        /*
         * Se a função retornou uma Blob URL,
         * guardamos para poder revogar depois.
         */
        if (
          imagemUrl.startsWith("blob:")
        ) {
          blobUrl = imagemUrl;
        }

        if (ativo) {
          setUrl(imagemUrl);
        }
      } catch (error) {
        console.warn(
          "Erro ao carregar imagem da galeria:",
          error
        );

        if (ativo) {
          setUrl(imgNotFound);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarImagem();

    return () => {
      ativo = false;

      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [imagem.caminho_arquivo]);

  return (
    <img
      src={url}
      className="carrosselCard"
      alt={
        imagem.legenda ||
        "Imagem do Parque"
      }
      loading="lazy"
      style={{
        opacity: carregando ? 0.7 : 1,
      }}
    />
  );
}

