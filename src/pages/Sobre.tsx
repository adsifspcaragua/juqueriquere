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

function resolverUrlImagem(caminhoOuUrl?: string | null): string {
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
 * Sincroniza as informações do Sobre (Local-First -> Supabase)
 */
async function sincronizarSobre(onUpdate: (data: Sobre) => void) {
  // 1. Tenta carregar localmente do Dexie
  if (db.sobre) {
    const sobreLocal = await db.sobre.toArray();
    if (sobreLocal.length > 0) {
      onUpdate(sobreLocal[0] as Sobre);
    }
  }

  // 2. Se houver conexão, busca dados atualizados no Supabase
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
      console.error("Erro na sincronização de informações do Parque:", error);
    }
  }
}

/**
 * Sincroniza as imagens da Galeria (Local-First -> Supabase)
 */
async function sincronizarGaleria(onUpdate: (data: ImagemGaleria[]) => void) {
  // 1. Tenta carregar do Dexie local
  if (db.imagens) {
    const imagensLocais = await db.imagens.toArray();
    const galeriaLocal = imagensLocais.filter(
      (img) =>
        img.caminho_arquivo?.startsWith("galeria/") ||
        img.caminho_arquivo?.startsWith("data:")
    );
    if (galeriaLocal.length > 0) {
      onUpdate(galeriaLocal as ImagemGaleria[]);
    }
  }

  // 2. Se online, busca do Supabase e atualiza o Dexie
  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from("imagens")
        .select("id, caminho_arquivo, legenda")
        .like("caminho_arquivo", "galeria/%");

      if (!error && data) {
        onUpdate(data as ImagemGaleria[]);
        if (db.imagens) {
          for (const img of data) {
            await db.imagens.put(img);
          }
        }
      }
    } catch (error) {
      console.error("Erro na sincronização da galeria:", error);
    }
  }
}

/**
 * Sincroniza os espaços do parque e resolve suas imagens (Local-First -> Supabase)
 */
async function sincronizarEspacos(onUpdate: (data: EspacoParqueComImagem[]) => void) {
  const processarEspacos = (
    espacosData: EspacoParque[],
    imagensData: ImagemGaleria[]
  ): EspacoParqueComImagem[] => {
    return espacosData.map((espaco) => {
      let imagemUrl: string | undefined = undefined;

      if (espaco.caminho_imagem_local) {
        imagemUrl = espaco.caminho_imagem_local;
      } else if (espaco.imagem_id) {
        const img = imagensData.find((i) => i.id === espaco.imagem_id);
        if (img) {
          imagemUrl = resolverUrlImagem(img.caminho_arquivo);
        }
      }

      return {
        ...espaco,
        imagemUrl,
      };
    });
  };

  // 1. Tenta carregar localmente do Dexie
  if (db.espacos_parque) {
    const espacosLocais = (await db.espacos_parque.toArray()) as EspacoParque[];
    const imagensLocais = db.imagens
      ? ((await db.imagens.toArray()) as ImagemGaleria[])
      : [];

    if (espacosLocais.length > 0) {
      const ordenados = espacosLocais.sort((a, b) => a.ordem - b.ordem);
      onUpdate(processarEspacos(ordenados, imagensLocais));
    }
  }

  // 2. Se online, busca atualizações do Supabase
  if (navigator.onLine) {
    try {
      const { data: espacosData, error: espacosError } = await supabase
        .from("espacos_parque")
        .select("*")
        .order("ordem", { ascending: true });

      if (!espacosError && espacosData) {
        const { data: imagensData } = await supabase
          .from("imagens")
          .select("id, caminho_arquivo, legenda");

        const espacosProcessados = processarEspacos(
          espacosData,
          (imagensData || []) as ImagemGaleria[]
        );

        onUpdate(espacosProcessados);

        // Salva atualizações no banco local
        if (db.espacos_parque) {
          await db.espacos_parque.clear();
          await db.espacos_parque.bulkPut(espacosData);
        }
        if (db.imagens && imagensData) {
          for (const img of imagensData) {
            await db.imagens.put(img);
          }
        }
      }
    } catch (error) {
      console.error("Erro na sincronização de espaços:", error);
    }
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Sobre() {
  usePageTitle("Sobre");

  const [sobre, setSobre] = useState<Sobre | null>(null);
  const [espacos, setEspacos] = useState<EspacoParqueComImagem[]>([]);
  const [imagensGaleria, setImagensGaleria] = useState<ImagemGaleria[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        await Promise.all([
          sincronizarSobre(setSobre),
          sincronizarGaleria(setImagensGaleria),
          sincronizarEspacos(setEspacos),
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados da página Sobre:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <>
      <div className="paddingHeader"></div>

      <section className="vertical conteudo" id="sobre">
        <div className="horizontal logo" style={{ width: "100%" }}>
          <img src={Logo} alt="Logo Parque" style={{ height: 45 }} />
        </div>

        {carregando && !sobre ? (
          <p>Carregando informações do parque...</p>
        ) : (
          <>
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

              <div className="carrossel horizontal galeria">
                {imagensGaleria.map((imagem) => (
                  <img
                    key={imagem.id}
                    src={resolverUrlImagem(imagem.caminho_arquivo)}
                    className="carrosselCard"
                    alt={imagem.legenda || "Imagem do Parque"}
                  />
                ))}
              </div>
            </div>

            <div className="linhaPontilhadaLight"></div>

            <h1>Espaços do Parque</h1>

            <div className="carrossel horizontal" id="carrosselEspacos">
              {espacos.map((espaco) => (
                <div
                  key={espaco.id}
                  className="carrosselCard espacoCard vertical"
                  style={{
                    backgroundImage: `url(${espaco.imagemUrl || imgNotFound})`,
                  }}
                >
                  <div className="fade vertical gap5">
                    <h1>{espaco.titulo}</h1>
                    <p>{espaco.descricao}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="linhaPontilhadaLight"></div>

            {/* ACESSIBILIDADE */}
            <div className="vertical gap5">
              <h1>
                {sobre?.acessibilidade_titulo || "Acessibilidade"}
              </h1>
              <p>{sobre?.acessibilidade_descricao}</p>
            </div>

            <div className="linhaPontilhadaLight"></div>

            {/* VISITE O PARQUE */}
            <h1>Visite o Parque</h1>

            <div className="vertical gap15 desktopWrap3">
              {/* VISITAS EM GRUPO */}
              <div className="vertical card" id="cardGrupo">
                <h1>{sobre?.visitas_grupo_titulo}</h1>
                <p>{sobre?.visitas_grupo_descricao}</p>
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
              <div className="vertical card" id="cardHorario">
                <h1>{sobre?.horario_titulo}</h1>
                <p>{sobre?.horario_descricao}</p>
              </div>

              {/* ENDEREÇO */}
              <div className="vertical card" id="cardEndereco">
                <h1>{sobre?.endereco_titulo}</h1>
                <p>{sobre?.endereco_descricao}</p>
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