import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase.ts";
import { db } from "../../../lib/dexie";

import "../../_styles/admin.css";
import "../../../style.css";

import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import AutoResizeTextarea from "../../../utils/AutoResizeTextarea";
import ProtectedRoute from "../../../components/Protected.tsx";
import NativeCarousel from "../../../components/ui/DraggableCarousel";
import { createPortal } from "react-dom";

interface SobreDB {
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

  created_at?: string;
  updated_at?: string;
}

interface EspacoParqueDB {
  id: number;
  titulo: string;
  descricao: string;
  imagem_id?: number | null;
  ordem: number;
  created_at?: string;
  updated_at?: string;
  caminho_imagem_local?: string; // Para fallback offline
}

interface ImagemGaleriaDB {
  id: number;
  caminho_arquivo: string;
  legenda?: string | null;
}

export default function EditarSobre() {
  const [sobre, setSobre] = useState<SobreDB | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [espacos, setEspacos] = useState<EspacoParqueDB[]>([]);
  const [imagensGaleria, setImagensGaleria] = useState<ImagemGaleriaDB[]>([]);
  const [novaImagemGaleria, setNovaImagemGaleria] = useState<File | null>(null);
  const [legendaGaleria, setLegendaGaleria] = useState("");
  const [salvandoGaleria, setSalvandoGaleria] = useState(false);
  const [removendoImagemGaleria, setRemovendoImagemGaleria] = useState<number | null>(null);

  const [adicionandoEspaco, setAdicionandoEspaco] = useState(false);
  const [editandoEspaco, setEditandoEspaco] = useState<EspacoParqueDB | null>(null);

  const [novoEspaco, setNovoEspaco] = useState({
    titulo: "",
    descricao: "",
    imagem: null as File | null,
  });

  const [imagemEdicao, setImagemEdicao] = useState<File | null>(null);
  const [salvandoEspaco, setSalvandoEspaco] = useState(false);
  const [removendoEspaco, setRemovendoEspaco] = useState<number | null>(null);

  useEffect(() => {
    carregarSobre();
    carregarEspacos();
    carregarImagensGaleria();
  }, []);

  // Helpers auxiliares offline/online
  function isNetworkError(error: any): boolean {
    return (
      !navigator.onLine ||
      error?.message?.includes("Failed to fetch") ||
      error?.message?.includes("network") ||
      error?.status === 0
    );
  }

  function obterExtensao(arquivo: File) {
    return arquivo.name.split(".").pop()?.toLowerCase() || "webp";
  }

  function converterArquivoParaBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  function obterUrlImagem(caminhoOuUrl: string) {
    if (!caminhoOuUrl) return "";
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
    return data.publicUrl;
  }

  // --- CARREGAMENTO DE DADOS ---
  async function carregarSobre() {
    setCarregando(true);
    try {
      // 1. Tenta carregar do Dexie primeiro
      if (db.sobre) {
        const sobreLocal = await db.sobre.toArray();
        if (sobreLocal.length > 0) {
          setSobre(sobreLocal[0] as SobreDB);
          setCarregando(false);
        }
      }

      // 2. Busca do Supabase se online
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("sobre")
          .select("*")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setSobre(data as SobreDB);
          if (db.sobre) {
            await db.sobre.clear();
            await db.sobre.put(data as SobreDB);
          }
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar informações do parque:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarEspacos() {
    try {
      // 1. Dexie local
      if (db.espacos_parque) {
        const espacosLocais = await db.espacos_parque.toArray();
        if (espacosLocais.length > 0) {
          setEspacos(espacosLocais.sort((a, b) => a.ordem - b.ordem));
        }
      }

      // 2. Supabase
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("espacos_parque")
          .select("*")
          .order("ordem", { ascending: true });

        if (!error && data) {
          setEspacos(data || []);
          if (db.espacos_parque) {
            await db.espacos_parque.clear();
            await db.espacos_parque.bulkPut(data || []);
          }
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar espaços do parque:", error);
    }
  }

  async function carregarImagensGaleria() {
    try {
      // 1. Dexie local
      if (db.imagens) {
        const imagensLocais = await db.imagens.toArray();
        const galeriaLocal = imagensLocais.filter((img) =>
          img.caminho_arquivo?.startsWith("galeria/") || img.caminho_arquivo?.startsWith("data:")
        );
        if (galeriaLocal.length > 0) {
          setImagensGaleria(galeriaLocal);
        }
      }

      // 2. Supabase
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("imagens")
          .select("id, caminho_arquivo, legenda")
          .like("caminho_arquivo", "galeria/%");

        if (!error && data) {
          setImagensGaleria(data || []);
          if (db.imagens) {
            for (const img of data || []) {
              await db.imagens.put(img);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar galeria:", error);
    }
  }

  // --- IMAGENS SUPABASE STORAGE ---
  async function enviarImagem(caminho: string, arquivo: File) {
    const { error } = await supabase.storage
      .from("imagens")
      .upload(caminho, arquivo, { cacheControl: "3600", upsert: false });

    if (error) throw error;
  }

  async function cadastrarImagem(caminho: string, legenda: string) {
    const { data, error } = await supabase
      .from("imagens")
      .insert({
        trilha_id: null,
        ponto_interesse_id: null,
        caminho_arquivo: caminho,
        legenda: legenda.trim() || null,
      })
      .select("id, caminho_arquivo, legenda")
      .single();

    if (error) throw error;
    return data as ImagemGaleriaDB;
  }

  async function excluirImagem(imagem: ImagemGaleriaDB) {
    if (!imagem.caminho_arquivo.startsWith("data:")) {
      await supabase.storage.from("imagens").remove([imagem.caminho_arquivo]);
    }
    const { error: dbError } = await supabase
      .from("imagens")
      .delete()
      .eq("id", imagem.id);

    if (dbError) throw dbError;
  }

  // --- GALERIA ACTIONS ---
  function selecionarImagemGaleria(e: React.ChangeEvent<HTMLInputElement>) {
    setNovaImagemGaleria(e.target.files?.[0] || null);
  }

  async function adicionarImagemGaleria() {
    if (!novaImagemGaleria) {
      alert("Selecione uma imagem para a galeria.");
      return;
    }

    setSalvandoGaleria(true);
    const extensao = obterExtensao(novaImagemGaleria);
    const caminho = `galeria/${crypto.randomUUID()}.${extensao}`;

    try {
      if (navigator.onLine) {
        await enviarImagem(caminho, novaImagemGaleria);
        const imagem = await cadastrarImagem(caminho, legendaGaleria);

        setImagensGaleria((prev) => [...prev, imagem]);
        if (db.imagens) await db.imagens.put(imagem);
        alert("Imagem adicionada à galeria com sucesso!");
      } else {
        // Fallback offline: salva em base64 localmente no Dexie
        const base64 = await converterArquivoParaBase64(novaImagemGaleria);
        const imagemOffline: ImagemGaleriaDB = {
          id: Date.now(),
          caminho_arquivo: base64,
          legenda: legendaGaleria.trim() || null,
        };

        setImagensGaleria((prev) => [...prev, imagemOffline]);
        if (db.imagens) await db.imagens.put(imagemOffline);
        alert("Imagem adicionada localmente! Ela será sincronizada quando houver conexão.");
      }

      setNovaImagemGaleria(null);
      setLegendaGaleria("");
      const input = document.getElementById("imagemGaleria") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (error: any) {
      console.error("Erro ao adicionar imagem da galeria:", error);
      alert(`Não foi possível adicionar a imagem.\n\n${error?.message || error}`);
    } finally {
      setSalvandoGaleria(false);
    }
  }

  async function removerImagemGaleria(imagem: ImagemGaleriaDB) {
    if (!window.confirm(`Deseja realmente remover a imagem "${imagem.legenda || "sem legenda"}"?`)) {
      return;
    }

    setRemovendoImagemGaleria(imagem.id);

    try {
      if (db.imagens) await db.imagens.delete(imagem.id);
      setImagensGaleria((prev) => prev.filter((item) => item.id !== imagem.id));

      if (navigator.onLine) {
        await excluirImagem(imagem);
      }

      alert("Imagem removida da galeria com sucesso!");
    } catch (error: any) {
      console.error("Erro ao remover imagem da galeria:", error);
      alert(`Não foi possível remover a imagem.\n\n${error?.message || error}`);
    } finally {
      setRemovendoImagemGaleria(null);
    }
  }

  // --- ESPAÇOS ACTIONS ---
  function abrirEdicaoEspaco(espaco: EspacoParqueDB) {
    setEditandoEspaco(espaco);
    setImagemEdicao(null);
  }

  function selecionarImagemEdicao(e: React.ChangeEvent<HTMLInputElement>) {
    setImagemEdicao(e.target.files?.[0] || null);
  }

  async function salvarEdicaoEspaco() {
    if (!editandoEspaco) return;
    if (!editandoEspaco.titulo.trim()) return alert("Informe o título do espaço.");
    if (!editandoEspaco.descricao.trim()) return alert("Informe a descrição do espaço.");

    setSalvandoEspaco(true);

    try {
      let novaImagemId = editandoEspaco.imagem_id;
      let caminhoLocal: string | undefined = editandoEspaco.caminho_imagem_local;

      if (imagemEdicao) {
        if (navigator.onLine) {
          const nomeArquivo = `${crypto.randomUUID()}.${obterExtensao(imagemEdicao)}`;
          const novoCaminhoArquivo = `areas/${nomeArquivo}`;
          await enviarImagem(novoCaminhoArquivo, imagemEdicao);
          const novaImagem = await cadastrarImagem(novoCaminhoArquivo, editandoEspaco.titulo);
          novaImagemId = novaImagem.id;
        } else {
          caminhoLocal = await converterArquivoParaBase64(imagemEdicao);
        }
      }

      const dadosAtualizados: EspacoParqueDB = {
        ...editandoEspaco,
        titulo: editandoEspaco.titulo.trim(),
        descricao: editandoEspaco.descricao.trim(),
        imagem_id: novaImagemId,
        caminho_imagem_local: caminhoLocal,
        updated_at: new Date().toISOString(),
      };

      // Atualiza localmente
      if (db.espacos_parque) await db.espacos_parque.put(dadosAtualizados);
      setEspacos((prev) => prev.map((e) => (e.id === dadosAtualizados.id ? dadosAtualizados : e)));

      // Atualiza Supabase se online
      if (navigator.onLine) {
        await supabase.from("espacos_parque").update({
          titulo: dadosAtualizados.titulo,
          descricao: dadosAtualizados.descricao,
          imagem_id: dadosAtualizados.imagem_id,
          updated_at: dadosAtualizados.updated_at,
        }).eq("id", editandoEspaco.id);
      }

      setEditandoEspaco(null);
      setImagemEdicao(null);
      alert("Espaço atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao editar espaço:", error);
      alert(`Não foi possível editar o espaço.\n\n${error?.message || error}`);
    } finally {
      setSalvandoEspaco(false);
    }
  }

  async function removerEspaco(espaco: EspacoParqueDB) {
    if (!window.confirm(`Deseja realmente remover o espaço "${espaco.titulo}"?`)) return;

    setRemovendoEspaco(espaco.id);

    try {
      if (db.espacos_parque) await db.espacos_parque.delete(espaco.id);
      setEspacos((prev) => prev.filter((item) => item.id !== espaco.id));

      if (navigator.onLine) {
        await supabase.from("espacos_parque").delete().eq("id", espaco.id);
        if (espaco.imagem_id) {
          await supabase.from("imagens").delete().eq("id", espaco.imagem_id);
        }
      }

      alert("Espaço removido com sucesso!");
    } catch (error: any) {
      console.error("Erro ao remover espaço:", error);
      alert(`Não foi possível remover o espaço.\n\n${error?.message || error}`);
    } finally {
      setRemovendoEspaco(null);
    }
  }

  function atualizarNovoEspaco(campo: "titulo" | "descricao", valor: string) {
    setNovoEspaco((prev) => ({ ...prev, [campo]: valor }));
  }

  function selecionarImagemEspaco(e: React.ChangeEvent<HTMLInputElement>) {
    setNovoEspaco((prev) => ({ ...prev, imagem: e.target.files?.[0] || null }));
  }

  async function adicionarEspaco() {
    if (!novoEspaco.titulo.trim()) return alert("Informe o título do espaço.");
    if (!novoEspaco.descricao.trim()) return alert("Informe a descrição do espaço.");
    if (!novoEspaco.imagem) return alert("Selecione uma imagem para o espaço.");

    setSalvandoEspaco(true);

    try {
      const maiorOrdem = espacos.length > 0 ? Math.max(...espacos.map((e) => e.ordem || 0)) : 0;
      const novaOrdem = maiorOrdem + 1;
      const idTemp = Date.now();

      let imagemId: number | null = null;
      let caminhoLocal: string | undefined = undefined;

      if (navigator.onLine) {
        const nomeArquivo = `${crypto.randomUUID()}.${obterExtensao(novoEspaco.imagem)}`;
        const caminhoArquivo = `areas/${nomeArquivo}`;

        await enviarImagem(caminhoArquivo, novoEspaco.imagem);
        const imagemData = await cadastrarImagem(caminhoArquivo, novoEspaco.titulo);
        imagemId = imagemData.id;

        const { data: espacoData, error } = await supabase
          .from("espacos_parque")
          .insert({
            titulo: novoEspaco.titulo.trim(),
            descricao: novoEspaco.descricao.trim(),
            imagem_id: imagemId,
            ordem: novaOrdem,
          })
          .select()
          .single();

        if (error) throw error;

        if (db.espacos_parque) await db.espacos_parque.put(espacoData);
        setEspacos((prev) => [...prev, espacoData].sort((a, b) => a.ordem - b.ordem));
      } else {
        caminhoLocal = await converterArquivoParaBase64(novoEspaco.imagem);
        const espacoOffline: EspacoParqueDB = {
          id: idTemp,
          titulo: novoEspaco.titulo.trim(),
          descricao: novoEspaco.descricao.trim(),
          imagem_id: null,
          caminho_imagem_local: caminhoLocal,
          ordem: novaOrdem,
        };

        if (db.espacos_parque) await db.espacos_parque.put(espacoOffline);
        setEspacos((prev) => [...prev, espacoOffline].sort((a, b) => a.ordem - b.ordem));
        alert("Espaço salvo localmente! Será sincronizado quando houver conexão.");
      }

      setNovoEspaco({ titulo: "", descricao: "", imagem: null });
      setAdicionandoEspaco(false);
      alert("Espaço adicionado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar espaço:", error);
      alert(`Não foi possível adicionar o espaço.\n\n${error?.message || error}`);
    } finally {
      setSalvandoEspaco(false);
    }
  }

  // --- FORM SOBRE ACTIONS ---
  function atualizarCampo(campo: keyof SobreDB, valor: string) {
    setSobre((prev) => (prev ? { ...prev, [campo]: valor } : prev));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sobre) return;

    setSalvando(true);

    const dadosAtualizados: SobreDB = {
      ...sobre,
      updated_at: new Date().toISOString(),
    };

    try {
      // 1. Salva localmente primeiro (Offline-first)
      if (db.sobre) {
        await db.sobre.put(dadosAtualizados);
      }
      setSobre(dadosAtualizados);

      // 2. Tenta atualizar no Supabase se houver rede
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("sobre")
          .update({
            descricao: sobre.descricao,
            area: sobre.area,
            acessibilidade_titulo: sobre.acessibilidade_titulo,
            acessibilidade_descricao: sobre.acessibilidade_descricao,
            visitas_grupo_titulo: sobre.visitas_grupo_titulo,
            visitas_grupo_descricao: sobre.visitas_grupo_descricao,
            horario_titulo: sobre.horario_titulo,
            horario_descricao: sobre.horario_descricao,
            endereco_titulo: sobre.endereco_titulo,
            endereco_descricao: sobre.endereco_descricao,
            email_agendamento: sobre.email_agendamento,
            link_mapa: sobre.link_mapa,
            updated_at: dadosAtualizados.updated_at,
          })
          .eq("id", sobre.id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSobre(data as SobreDB);
          if (db.sobre) await db.sobre.put(data as SobreDB);
        }
        alert("Informações do parque atualizadas com sucesso!");
      } else {
        alert("Informações salvas localmente! Serão sincronizadas quando você estiver online.");
      }
    } catch (error: any) {
      if (isNetworkError(error)) {
        alert("Sem conexão. As alterações foram salvas localmente (offline).");
      } else {
        console.error("Erro ao atualizar informações do parque:", error);
        alert(`Erro ao salvar as informações:\n\n${error?.message || error}`);
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <ProtectedRoute>
        <div className="paddingHeader"></div>
        <section className="conteudo vertical gap15">
          <h1>Editar informações do parque</h1>
          <div className="card">
            <p>Carregando informações...</p>
          </div>
        </section>
      </ProtectedRoute>
    );
  }

  if (!sobre) {
    return (
      <ProtectedRoute>
        <div className="paddingHeader"></div>
        <section className="conteudo vertical gap15">
          <SimpleButton path="/admin" type="back" icon="setaBack">
            Voltar
          </SimpleButton>
          <h1>Editar informações do parque</h1>
          <div className="card vertical gap5">
            <p>Nenhuma informação do parque foi cadastrada ainda.</p>
          </div>
        </section>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="paddingHeader"></div>

      <section className="conteudo vertical gap15 desktopWrap1-2">
        <div className="vertical gap15">
          <SimpleButton path="/admin" type="back" icon="setaBack">
            Voltar
          </SimpleButton>
          <div className="card vertical gap5 adminCard" id="adminSobreCard">
            <h1>Sobre o Parque</h1>
            <p>
              Atualize as informações do parque, garantindo que os visitantes
              tenham acesso a conteúdos claros e relevantes sobre a plataforma.
            </p>
          </div>
        </div>

        <form className="card vertical gap30" onSubmit={handleSubmit}>
          {/* Informações Gerais */}
          <div className="vertical gap15">
            <h2>Informações gerais</h2>
            <div className="vertical gap5">
              <label>Descrição do parque:</label>
              <AutoResizeTextarea
                value={sobre.descricao}
                onChange={(e) => atualizarCampo("descricao", e.target.value)}
                disabled={salvando}
                required
              />
            </div>
            <div className="vertical gap5">
              <label>Área do parque:</label>
              <input
                type="text"
                value={sobre.area || ""}
                onChange={(e) => atualizarCampo("area", e.target.value)}
                disabled={salvando}
              />
            </div>
          </div>

          <div className="linhaHorizontalDark"></div>

          {/* Galeria */}
          <div className="vertical gap15" id="secaoGaleriaSobre">
            <h2>Galeria</h2>
            <div className="vertical desktopWrap gap30">
              <div className="vertical gap15" id="sobreAdminGaleriaLeft">
                <h4>Adicionar imagem</h4>
                <div className="vertical gap5">
                  <label htmlFor="imagemGaleria">Imagem:</label>
                  <input
                    id="imagemGaleria"
                    type="file"
                    accept="image/*"
                    onChange={selecionarImagemGaleria}
                    disabled={salvandoGaleria}
                  />
                  {novaImagemGaleria && (
                    <p>
                      Imagem selecionada: <strong>{novaImagemGaleria.name}</strong>
                    </p>
                  )}
                </div>
                <div className="vertical gap5">
                  <label htmlFor="legendaGaleria">Legenda:</label>
                  <input
                    id="legendaGaleria"
                    type="text"
                    value={legendaGaleria}
                    onChange={(e) => setLegendaGaleria(e.target.value)}
                    placeholder="Ex.: Sede administrativa"
                    disabled={salvandoGaleria}
                  />
                </div>
                <button
                  type="button"
                  onClick={adicionarImagemGaleria}
                  disabled={salvandoGaleria}
                >
                  {salvandoGaleria ? "Adicionando..." : "Adicionar imagem"}
                </button>
              </div>

              <div className="vertical gap5">
                <h4>Imagens cadastradas:</h4>
                {imagensGaleria.length > 0 ? (
                  <NativeCarousel
                    items={imagensGaleria.map((imagem) => {
                      const src = obterUrlImagem(imagem.caminho_arquivo);
                      return (
                        <div key={imagem.id} className="cardGaleriaItem vertical gap10">
                          <img src={src} alt={imagem.legenda || "Imagem da galeria"} />
                          <p>{imagem.legenda || "Sem legenda"}</p>
                          <button
                            type="button"
                            onClick={() => removerImagemGaleria(imagem)}
                            disabled={removendoImagemGaleria === imagem.id}
                            className="btnDanger"
                          >
                            {removendoImagemGaleria === imagem.id ? "Removendo..." : "Excluir"}
                          </button>
                        </div>
                      );
                    })}
                  />
                ) : (
                  <p>Nenhuma imagem cadastrada na galeria.</p>
                )}
              </div>
            </div>
          </div>

          <div className="linhaHorizontalDark"></div>

          {/* Espaços do Parque */}
          <div className="vertical gap15">
            <div className="horizontal spaceBetween alignCenter">
              <h2>Espaços do Parque</h2>
              <button
                type="button"
                onClick={() => setAdicionandoEspaco(true)}
                disabled={salvandoEspaco}
              >
                + Adicionar Espaço
              </button>
            </div>

            {espacos.length > 0 ? (
              <div className="vertical gap10">
                {espacos.map((espaco) => (
                  <div key={espaco.id} className="card horizontal spaceBetween alignCenter gap15">
                    <div className="vertical gap5">
                      <strong>{espaco.titulo}</strong>
                      <p>{espaco.descricao}</p>
                    </div>
                    <div className="horizontal gap10">
                      <button type="button" onClick={() => abrirEdicaoEspaco(espaco)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => removerEspaco(espaco)}
                        disabled={removendoEspaco === espaco.id}
                        className="btnDanger"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum espaço cadastrado ainda.</p>
            )}
          </div>

          <div className="linhaHorizontalDark"></div>

          {/* Acessibilidade */}
          <div className="vertical gap15">
            <h2>Acessibilidade</h2>
            <div className="vertical gap5">
              <label>Título:</label>
              <input
                type="text"
                value={sobre.acessibilidade_titulo || ""}
                onChange={(e) => atualizarCampo("acessibilidade_titulo", e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className="vertical gap5">
              <label>Descrição:</label>
              <AutoResizeTextarea
                value={sobre.acessibilidade_descricao || ""}
                onChange={(e) => atualizarCampo("acessibilidade_descricao", e.target.value)}
                disabled={salvando}
              />
            </div>
          </div>

          <div className="linhaHorizontalDark"></div>

          {/* Visitas em Grupo */}
          <div className="vertical gap15">
            <h2>Visitas em Grupo</h2>
            <div className="vertical gap5">
              <label>Título:</label>
              <input
                type="text"
                value={sobre.visitas_grupo_titulo || ""}
                onChange={(e) => atualizarCampo("visitas_grupo_titulo", e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className="vertical gap5">
              <label>Descrição:</label>
              <AutoResizeTextarea
                value={sobre.visitas_grupo_descricao || ""}
                onChange={(e) => atualizarCampo("visitas_grupo_descricao", e.target.value)}
                disabled={salvando}
              />
            </div>
          </div>

          <div className="linhaHorizontalDark"></div>

          {/* Horários e Endereço */}
          <div className="vertical gap15">
            <h2>Horário de Funcionamento e Localização</h2>
            <div className="vertical gap5">
              <label>Título do Horário:</label>
              <input
                type="text"
                value={sobre.horario_titulo || ""}
                onChange={(e) => atualizarCampo("horario_titulo", e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className="vertical gap5">
              <label>Descrição do Horário:</label>
              <AutoResizeTextarea
                value={sobre.horario_descricao || ""}
                onChange={(e) => atualizarCampo("horario_descricao", e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className="vertical gap5">
              <label>Título do Endereço:</label>
              <input
                type="text"
                value={sobre.endereco_titulo || ""}
                onChange={(e) => atualizarCampo("endereco_titulo", e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className="vertical gap5">
              <label>Descrição do Endereço:</label>
              <AutoResizeTextarea
                value={sobre.endereco_descricao || ""}
                onChange={(e) => atualizarCampo("endereco_descricao", e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className="vertical gap5">
              <label>E-mail para Agendamentos:</label>
              <input
                type="email"
                value={sobre.email_agendamento || ""}
                onChange={(e) => atualizarCampo("email_agendamento", e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className="vertical gap5">
              <label>Link do Mapa (Google Maps):</label>
              <input
                type="text"
                value={sobre.link_mapa || ""}
                onChange={(e) => atualizarCampo("link_mapa", e.target.value)}
                disabled={salvando}
              />
            </div>
          </div>

          <button type="submit" disabled={salvando} className="btnPrimary">
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </section>

      {/* MODAL ADICIONAR ESPAÇO */}
      {adicionandoEspaco &&
        createPortal(
          <div className="modalOverlay">
            <div className="modalCard vertical gap15">
              <h3>Adicionar Novo Espaço</h3>
              <div className="vertical gap5">
                <label>Título:</label>
                <input
                  type="text"
                  value={novoEspaco.titulo}
                  onChange={(e) => atualizarNovoEspaco("titulo", e.target.value)}
                  disabled={salvandoEspaco}
                />
              </div>
              <div className="vertical gap5">
                <label>Descrição:</label>
                <AutoResizeTextarea
                  value={novoEspaco.descricao}
                  onChange={(e) => atualizarNovoEspaco("descricao", e.target.value)}
                  disabled={salvandoEspaco}
                />
              </div>
              <div className="vertical gap5">
                <label>Imagem:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={selecionarImagemEspaco}
                  disabled={salvandoEspaco}
                />
              </div>
              <div className="horizontal gap10 spaceEnd">
                <button
                  type="button"
                  onClick={() => setAdicionandoEspaco(false)}
                  disabled={salvandoEspaco}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={adicionarEspaco}
                  disabled={salvandoEspaco}
                >
                  {salvandoEspaco ? "Salvando..." : "Adicionar Espaço"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL EDITAR ESPAÇO */}
      {editandoEspaco &&
        createPortal(
          <div className="modalOverlay">
            <div className="modalCard vertical gap15">
              <h3>Editar Espaço</h3>
              <div className="vertical gap5">
                <label>Título:</label>
                <input
                  type="text"
                  value={editandoEspaco.titulo}
                  onChange={(e) =>
                    setEditandoEspaco({ ...editandoEspaco, titulo: e.target.value })
                  }
                  disabled={salvandoEspaco}
                />
              </div>
              <div className="vertical gap5">
                <label>Descrição:</label>
                <AutoResizeTextarea
                  value={editandoEspaco.descricao}
                  onChange={(e) =>
                    setEditandoEspaco({ ...editandoEspaco, descricao: e.target.value })
                  }
                  disabled={salvandoEspaco}
                />
              </div>
              <div className="vertical gap5">
                <label>Substituir Imagem (Opcional):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={selecionarImagemEdicao}
                  disabled={salvandoEspaco}
                />
              </div>
              <div className="horizontal gap10 spaceEnd">
                <button
                  type="button"
                  onClick={() => setEditandoEspaco(null)}
                  disabled={salvandoEspaco}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={salvarEdicaoEspaco}
                  disabled={salvandoEspaco}
                >
                  {salvandoEspaco ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ProtectedRoute>
  );
}