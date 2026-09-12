import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase.ts";
import { db } from "../../../lib/dexie";

import "../../_styles/admin.css"
import "../../../style.css"

import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import AutoResizeTextarea from "../../../utils/AutoResizeTextarea";
import ProtectedRoute from "../../../components/Protected.tsx";

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

    const [editandoEspaco, setEditandoEspaco] =
        useState<EspacoParqueDB | null>(null);

    const [novoEspaco, setNovoEspaco] = useState({
        titulo: "",
        descricao: "",
        imagem: null as File | null
    });

    const [imagemEdicao, setImagemEdicao] =
        useState<File | null>(null);

    const [salvandoEspaco, setSalvandoEspaco] =
        useState(false);

    const [removendoEspaco, setRemovendoEspaco] =
        useState<number | null>(null);
    useEffect(() => {
        carregarSobre();
        carregarEspacos();
        carregarImagensGaleria();
    }, []);

    function abrirEdicaoEspaco(
        espaco: EspacoParqueDB
    ) {

        setEditandoEspaco(espaco);

        setImagemEdicao(null);

    }

    function selecionarImagemEdicao(
        e: React.ChangeEvent<HTMLInputElement>
    ) {

        const arquivo = e.target.files?.[0] || null;

        setImagemEdicao(arquivo);

    }

    async function carregarSobre() {

        setCarregando(true);

        try {

            /*
             * 1. Tenta carregar primeiro do Dexie.
             * Isso permite que o formulário continue funcionando
             * mesmo quando o usuário estiver offline.
             */
            const sobreLocal = await db.sobre.toArray();

            if (sobreLocal.length > 0) {
                setSobre(sobreLocal[0] as SobreDB);
                setCarregando(false);

                /*
                 * Não retornamos imediatamente.
                 * Buscamos a versão mais recente do Supabase
                 * quando houver conexão.
                 */
            }

            /*
             * 2. Busca a versão mais recente no Supabase.
             */
            const { data, error } = await supabase
                .from("sobre")
                .select("*")
                .order("id", { ascending: true })
                .limit(1)
                .maybeSingle();

            if (error) {
                /*
                 * Se já conseguimos carregar do Dexie,
                 * podemos continuar usando os dados locais.
                 */
                if (sobreLocal.length > 0) {
                    return;
                }

                throw error;
            }

            if (data) {

                setSobre(data as SobreDB);

                /*
                 * 3. Atualiza o cache local.
                 */
                await db.sobre.put(data as SobreDB);
            }

        } catch (error: any) {

            console.error("Erro ao carregar informações do parque:", error);

            alert(
                `Não foi possível carregar as informações do parque.\n\n${error?.message || error
                }`
            );

        } finally {
            setCarregando(false);
        }
    }

    function obterExtensao(arquivo: File) {
        return arquivo.name.split(".").pop()?.toLowerCase() || "webp";
    }

    async function enviarImagem(caminho: string, arquivo: File) {
        const { error } = await supabase.storage
            .from("imagens")
            .upload(caminho, arquivo, {
                cacheControl: "3600",
                upsert: false
            });

        if (error) throw error;
    }

    async function cadastrarImagem(
        caminho: string,
        legenda: string
    ) {
        const { data, error } = await supabase
            .from("imagens")
            .insert({
                trilha_id: null,
                ponto_interesse_id: null,
                caminho_arquivo: caminho,
                legenda: legenda.trim() || null
            })
            .select("id, caminho_arquivo, legenda")
            .single();

        if (error) throw error;
        return data as ImagemGaleriaDB;
    }

    async function excluirImagem(
        imagem: ImagemGaleriaDB
    ) {
        const { error: storageError } = await supabase.storage
            .from("imagens")
            .remove([imagem.caminho_arquivo]);

        if (storageError) throw storageError;

        const { error: dbError } = await supabase
            .from("imagens")
            .delete()
            .eq("id", imagem.id);

        if (dbError) throw dbError;
    }

    async function carregarImagensGaleria() {
        const { data, error } = await supabase
            .from("imagens")
            .select("id, caminho_arquivo, legenda")
            .like("caminho_arquivo", "galeria/%");

        if (error) {
            console.error("Erro ao carregar galeria:", error);
            setImagensGaleria([]);
            return;
        }

        setImagensGaleria(data || []);
    }

    function selecionarImagemGaleria(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        setNovaImagemGaleria(e.target.files?.[0] || null);
    }

    async function adicionarImagemGaleria() {
        if (!novaImagemGaleria) {
            alert("Selecione uma imagem para a galeria.");
            return;
        }

        setSalvandoGaleria(true);

        const caminho = `galeria/${crypto.randomUUID()}.${obterExtensao(novaImagemGaleria)}`;

        try {
            await enviarImagem(caminho, novaImagemGaleria);

            const imagem = await cadastrarImagem(
                caminho,
                legendaGaleria
            );

            setImagensGaleria((prev) => [...prev, imagem]);
            setNovaImagemGaleria(null);
            setLegendaGaleria("");

            const input = document.getElementById(
                "imagemGaleria"
            ) as HTMLInputElement | null;

            if (input) input.value = "";

            alert("Imagem adicionada à galeria com sucesso!");
        } catch (error: any) {
            await supabase.storage
                .from("imagens")
                .remove([caminho]);

            console.error("Erro ao adicionar imagem da galeria:", error);
            alert(
                `Não foi possível adicionar a imagem.\n\n${error?.message || error}`
            );
        } finally {
            setSalvandoGaleria(false);
        }
    }

    async function removerImagemGaleria(
        imagem: ImagemGaleriaDB
    ) {
        if (
            !window.confirm(
                `Deseja realmente remover a imagem "${imagem.legenda || "sem legenda"}"?`
            )
        ) {
            return;
        }

        setRemovendoImagemGaleria(imagem.id);

        try {
            await excluirImagem(imagem);

            setImagensGaleria((prev) =>
                prev.filter((item) => item.id !== imagem.id)
            );

            alert("Imagem removida da galeria com sucesso!");
        } catch (error: any) {
            console.error("Erro ao remover imagem da galeria:", error);
            alert(
                `Não foi possível remover a imagem.\n\n${error?.message || error}`
            );
        } finally {
            setRemovendoImagemGaleria(null);
        }
    }

    async function salvarEdicaoEspaco() {
        if (!editandoEspaco) return;

        if (!editandoEspaco.titulo.trim()) {
            alert("Informe o título do espaço.");
            return;
        }

        if (!editandoEspaco.descricao.trim()) {
            alert("Informe a descrição do espaço.");
            return;
        }

        setSalvandoEspaco(true);

        let novoCaminhoArquivo: string | null = null;
        let novaImagemId: number | null = null;

        try {

            /*
             * ==========================================
             * SE UMA NOVA IMAGEM FOI SELECIONADA
             * ==========================================
             */

            if (imagemEdicao) {

                const nomeArquivo =
                    `${crypto.randomUUID()}.${obterExtensao(imagemEdicao)}`;

                novoCaminhoArquivo = `areas/${nomeArquivo}`;

                await enviarImagem(
                    novoCaminhoArquivo,
                    imagemEdicao
                );

                const novaImagem = await cadastrarImagem(
                    novoCaminhoArquivo,
                    editandoEspaco.titulo
                );

                novaImagemId = novaImagem.id;

            }


            /*
             * ==========================================
             * ATUALIZAR ESPAÇO
             * ==========================================
             */

            const dadosAtualizados: {
                titulo: string;
                descricao: string;
                imagem_id?: number | null;
                updated_at: string;
            } = {

                titulo: editandoEspaco.titulo.trim(),

                descricao:
                    editandoEspaco.descricao.trim(),

                updated_at:
                    new Date().toISOString()

            };


            /*
             * Só altera imagem_id se o usuário
             * realmente escolheu uma nova imagem.
             */

            if (novaImagemId !== null) {

                dadosAtualizados.imagem_id =
                    novaImagemId;

            }


            const {
                data,
                error
            } = await supabase
                .from("espacos_parque")
                .update(dadosAtualizados)
                .eq("id", editandoEspaco.id)
                .select()
                .single();

            if (error) {
                throw error;
            }


            /*
             * ==========================================
             * SE TROCOU A IMAGEM
             * REMOVE A ANTIGA
             * ==========================================
             */

            if (
                novaImagemId !== null &&
                editandoEspaco.imagem_id
            ) {

                const {
                    data: imagemAntiga,
                    error: imagemAntigaError
                } = await supabase
                    .from("imagens")
                    .select("caminho_arquivo")
                    .eq(
                        "id",
                        editandoEspaco.imagem_id
                    )
                    .maybeSingle();

                if (!imagemAntigaError && imagemAntiga) {

                    await supabase.storage
                        .from("imagens")
                        .remove([
                            imagemAntiga.caminho_arquivo
                        ]);

                }


                await supabase
                    .from("imagens")
                    .delete()
                    .eq(
                        "id",
                        editandoEspaco.imagem_id
                    );

            }


            /*
             * ==========================================
             * ATUALIZA LISTA NA TELA
             * ==========================================
             */

            setEspacos((prev) =>
                prev.map((espaco) =>
                    espaco.id === data.id
                        ? data
                        : espaco
                )
            );


            /*
             * ==========================================
             * FECHAR MODAL
             * ==========================================
             */

            setEditandoEspaco(null);
            setImagemEdicao(null);

            alert(
                "Espaço atualizado com sucesso!"
            );

        } catch (error: any) {

            /*
             * Se houve erro depois do upload,
             * remove o arquivo novo para evitar
             * arquivo órfão no Storage.
             */

            if (novoCaminhoArquivo) {

                await supabase.storage
                    .from("imagens")
                    .remove([
                        novoCaminhoArquivo
                    ]);

            }

            if (novaImagemId) {

                await supabase
                    .from("imagens")
                    .delete()
                    .eq(
                        "id",
                        novaImagemId
                    );

            }

            console.error(
                "Erro ao editar espaço:",
                error
            );

            alert(
                `Não foi possível editar o espaço.\n\n${error?.message || error
                }`
            );

        } finally {

            setSalvandoEspaco(false);

        }
    }

    async function removerEspaco(
        espaco: EspacoParqueDB
    ) {

        const confirmar = window.confirm(
            `Deseja realmente remover o espaço "${espaco.titulo}"?\n\n` +
            "A área e sua imagem serão excluídas permanentemente."
        );

        if (!confirmar) {
            return;
        }

        setRemovendoEspaco(espaco.id);

        try {

            let caminhoImagem: string | null = null;


            /*
             * ==========================================
             * BUSCAR IMAGEM
             * ==========================================
             */

            if (espaco.imagem_id) {

                const {
                    data: imagem,
                    error: imagemError
                } = await supabase
                    .from("imagens")
                    .select("caminho_arquivo")
                    .eq(
                        "id",
                        espaco.imagem_id
                    )
                    .maybeSingle();

                if (imagemError) {
                    throw imagemError;
                }

                if (imagem) {
                    caminhoImagem =
                        imagem.caminho_arquivo;
                }

            }


            /*
             * ==========================================
             * REMOVER ESPAÇO
             * ==========================================
             */

            const {
                error: espacoError
            } = await supabase
                .from("espacos_parque")
                .delete()
                .eq(
                    "id",
                    espaco.id
                );

            if (espacoError) {
                throw espacoError;
            }


            /*
             * ==========================================
             * REMOVER IMAGEM DA TABELA
             * ==========================================
             */

            if (espaco.imagem_id) {

                const {
                    error: imagemDeleteError
                } = await supabase
                    .from("imagens")
                    .delete()
                    .eq(
                        "id",
                        espaco.imagem_id
                    );

                if (imagemDeleteError) {
                    throw imagemDeleteError;
                }

            }


            /*
             * ==========================================
             * REMOVER ARQUIVO DO STORAGE
             * ==========================================
             */

            if (
                caminhoImagem &&
                caminhoImagem.startsWith("areas/")
            ) {

                const {
                    error: storageError
                } = await supabase.storage
                    .from("imagens")
                    .remove([
                        caminhoImagem
                    ]);

                if (storageError) {
                    throw storageError;
                }

            }


            /*
             * ==========================================
             * ATUALIZAR LISTA
             * ==========================================
             */

            setEspacos((prev) =>
                prev.filter(
                    (item) =>
                        item.id !== espaco.id
                )
            );

            alert(
                "Espaço removido com sucesso!"
            );

        } catch (error: any) {

            console.error(
                "Erro ao remover espaço:",
                error
            );

            alert(
                `Não foi possível remover o espaço.\n\n${error?.message || error
                }`
            );

        } finally {

            setRemovendoEspaco(null);

        }
    }

    async function carregarEspacos() {

        try {

            const { data, error } = await supabase
                .from("espacos_parque")
                .select("*")
                .order("ordem", { ascending: true });

            if (error) {
                throw error;
            }

            setEspacos(data || []);

        } catch (error: any) {

            console.error(
                "Erro ao carregar espaços do parque:",
                error
            );

            alert(
                `Não foi possível carregar os espaços do parque.\n\n${error?.message || error
                }`
            );

        }
    }

    function atualizarNovoEspaco(
        campo: "titulo" | "descricao",
        valor: string
    ) {

        setNovoEspaco((prev) => ({
            ...prev,
            [campo]: valor
        }));

    }

    function selecionarImagemEspaco(
        e: React.ChangeEvent<HTMLInputElement>
    ) {

        const arquivo = e.target.files?.[0] || null;

        setNovoEspaco((prev) => ({
            ...prev,
            imagem: arquivo
        }));

    }

    async function adicionarEspaco() {
        if (!novoEspaco.titulo.trim()) {
            alert("Informe o título do espaço.");
            return;
        }

        if (!novoEspaco.descricao.trim()) {
            alert("Informe a descrição do espaço.");
            return;
        }

        if (!novoEspaco.imagem) {
            alert("Selecione uma imagem para o espaço.");
            return;
        }

        setSalvandoEspaco(true);

        let caminhoArquivo: string | null = null;
        let imagemId: number | null = null;

        try {

            /*
             * ==========================================
             * 1. DEFINIR NOME DO ARQUIVO
             * ==========================================
             */

            const nomeArquivo =
                `${crypto.randomUUID()}.${obterExtensao(novoEspaco.imagem)}`;

            caminhoArquivo = `areas/${nomeArquivo}`;

            await enviarImagem(
                caminhoArquivo,
                novoEspaco.imagem
            );

            const imagemData = await cadastrarImagem(
                caminhoArquivo,
                novoEspaco.titulo
            );

            imagemId = imagemData.id;


            const maiorOrdem =
                espacos.length > 0
                    ? Math.max(
                        ...espacos.map(
                            (espaco) => espaco.ordem || 0
                        )
                    )
                    : 0;

            const novaOrdem = maiorOrdem + 1;


            const { data: espacoData, error: espacoError } =
                await supabase
                    .from("espacos_parque")
                    .insert({
                        titulo: novoEspaco.titulo.trim(),
                        descricao: novoEspaco.descricao.trim(),
                        imagem_id: imagemId,
                        ordem: novaOrdem
                    })
                    .select()
                    .single();

            if (espacoError) {
                throw espacoError;
            }


            setEspacos((prev) =>
                [...prev, espacoData]
                    .sort((a, b) => a.ordem - b.ordem)
            );


            setNovoEspaco({
                titulo: "",
                descricao: "",
                imagem: null
            });

            setAdicionandoEspaco(false);

            alert("Espaço adicionado com sucesso!");

        } catch (error: any) {

            console.error(
                "Erro ao adicionar espaço:",
                error
            );


            /*
             * Se a imagem foi enviada mas alguma
             * etapa posterior falhou, tenta remover
             * o arquivo órfão do Storage.
             */

            if (caminhoArquivo) {

                await supabase.storage
                    .from("imagens")
                    .remove([caminhoArquivo]);

            }


            /*
             * Se a imagem foi cadastrada na tabela
             * mas o espaço falhou, remove o registro.
             */

            if (imagemId) {

                await supabase
                    .from("imagens")
                    .delete()
                    .eq("id", imagemId);

            }

            alert(
                `Não foi possível adicionar o espaço.\n\n${error?.message || error
                }`
            );

        } finally {

            setSalvandoEspaco(false);

        }
    }

    function atualizarCampo(
        campo: keyof SobreDB,
        valor: string
    ) {
        setSobre((prev) => {

            if (!prev) return prev;

            return {
                ...prev,
                [campo]: valor
            };
        });
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {

        e.preventDefault();

        if (!sobre) return;

        setSalvando(true);

        try {

            const dadosAtualizados = {

                descricao: sobre.descricao,
                area: sobre.area,

                acessibilidade_titulo:
                    sobre.acessibilidade_titulo,

                acessibilidade_descricao:
                    sobre.acessibilidade_descricao,

                visitas_grupo_titulo:
                    sobre.visitas_grupo_titulo,

                visitas_grupo_descricao:
                    sobre.visitas_grupo_descricao,

                horario_titulo:
                    sobre.horario_titulo,

                horario_descricao:
                    sobre.horario_descricao,

                endereco_titulo:
                    sobre.endereco_titulo,

                endereco_descricao:
                    sobre.endereco_descricao,

                email_agendamento:
                    sobre.email_agendamento,

                link_mapa:
                    sobre.link_mapa,

                updated_at: new Date().toISOString()
            };

            /*
             * 1. Atualiza o Supabase.
             */
            const { data, error } = await supabase
                .from("sobre")
                .update(dadosAtualizados)
                .eq("id", sobre.id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            /*
             * 2. Atualiza o objeto local com o retorno
             * do Supabase.
             */
            const sobreAtualizado = data as SobreDB;

            setSobre(sobreAtualizado);

            /*
             * 3. Atualiza o Dexie.
             */
            await db.sobre.put(sobreAtualizado);

            alert(
                "Informações do parque atualizadas com sucesso!"
            );

        } catch (error: any) {

            console.error(
                "Erro ao atualizar informações do parque:",
                error
            );

            alert(
                `Erro ao salvar as informações:\n\n${error?.message || error
                }`
            );

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

                    <SimpleButton
                        path="/admin"
                        type="back"
                        icon="setaBack"
                    >
                        Voltar
                    </SimpleButton>

                    <h1>Editar informações do parque</h1>

                    <div className="card vertical gap5">

                        <p>
                            Nenhuma informação do parque foi
                            cadastrada ainda.
                        </p>

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
                    <SimpleButton
                        path="/admin"
                        type="back"
                        icon="setaBack"
                    >
                        Voltar
                    </SimpleButton>
                    <div className="card vertical gap5 adminCard" id="adminSobreCard">
                        <h1>Sobre o Parque</h1>
                        <p>Atualize as informações do parque, garantindo que os visitantes tenham acesso a conteúdos claros e relevantes sobre a plataforma.</p>
                    </div>
                </div>

                <form
                    className="card vertical gap30"
                    onSubmit={handleSubmit}
                >
                    <div className="desktopWrap">
                        <div className="vertical gap15">

                            <h2>Informações gerais</h2>

                            <div className="vertical gap5">
                                <label>Descrição do parque:</label>
                                <AutoResizeTextarea
                                    value={sobre.descricao}
                                    onChange={(e) =>
                                        atualizarCampo(
                                            "descricao",
                                            e.target.value
                                        )
                                    }
                                    disabled={salvando}
                                    required
                                />
                            </div>


                            <div className="vertical gap15">

                                <h2>Espaços do Parque</h2>

                                {/* ========================================== */}
                                {/* BOTÃO ADICIONAR ESPAÇO */}
                                {/* ========================================== */}

                                {!adicionandoEspaco && (

                                    <div className="btnFull">

                                        <button
                                            type="button"
                                            onClick={() => setAdicionandoEspaco(true)}
                                            disabled={salvando}
                                        >
                                            Adicionar espaço
                                        </button>

                                    </div>

                                )}


                                {/* ========================================== */}
                                {/* FORMULÁRIO NOVO ESPAÇO */}
                                {/* ========================================== */}

                                {adicionandoEspaco && (

                                    <div className="card vertical gap15">

                                        <h3>Novo espaço</h3>

                                        <div className="vertical gap5">

                                            <label>
                                                Título:
                                            </label>

                                            <input
                                                type="text"
                                                value={novoEspaco.titulo}
                                                onChange={(e) =>
                                                    atualizarNovoEspaco(
                                                        "titulo",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Ex.: Área de Convivência"
                                                disabled={salvandoEspaco}
                                                required
                                            />

                                        </div>


                                        <div className="vertical gap5">

                                            <label>
                                                Descrição:
                                            </label>

                                            <AutoResizeTextarea
                                                value={novoEspaco.descricao}
                                                onChange={(e) =>
                                                    atualizarNovoEspaco(
                                                        "descricao",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Descreva este espaço do parque..."
                                                disabled={salvandoEspaco}
                                                required
                                            />

                                        </div>


                                        <div className="vertical gap5">

                                            <label>
                                                Imagem:
                                            </label>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={selecionarImagemEspaco}
                                                disabled={salvandoEspaco}
                                                required
                                            />

                                            {novoEspaco.imagem && (

                                                <p>
                                                    Imagem selecionada:{" "}
                                                    <strong>
                                                        {novoEspaco.imagem.name}
                                                    </strong>
                                                </p>

                                            )}

                                        </div>


                                        <div className="horizontal gap5">

                                            <button
                                                type="button"
                                                onClick={adicionarEspaco}
                                                disabled={salvandoEspaco}
                                            >
                                                {salvandoEspaco
                                                    ? "Salvando..."
                                                    : "Salvar espaço"
                                                }
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setAdicionandoEspaco(false);

                                                    setNovoEspaco({
                                                        titulo: "",
                                                        descricao: "",
                                                        imagem: null
                                                    });

                                                }}
                                                disabled={salvandoEspaco}
                                            >
                                                Cancelar
                                            </button>

                                        </div>

                                    </div>

                                )}




                                {/* ========================================== */}
                                {/* ESPAÇOS CADASTRADOS */}
                                {/* ========================================== */}

                                {espacos.length > 0 && (

                                    <div className="vertical gap15">

                                        {espacos.map((espaco) => (

                                            <div
                                                key={espaco.id}
                                                className="card vertical gap5"
                                            >

                                                <h3>
                                                    {espaco.ordem}. {espaco.titulo}
                                                </h3>

                                                <p>
                                                    {espaco.descricao}
                                                </p>

                                                <div className="horizontal gap5">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirEdicaoEspaco(
                                                                espaco
                                                            )
                                                        }
                                                        disabled={
                                                            salvandoEspaco ||
                                                            removendoEspaco !== null
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removerEspaco(
                                                                espaco
                                                            )
                                                        }
                                                        disabled={
                                                            salvandoEspaco ||
                                                            removendoEspaco !== null
                                                        }
                                                    >
                                                        {removendoEspaco === espaco.id
                                                            ? "Removendo..."
                                                            : "Remover"
                                                        }
                                                    </button>

                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                                {espacos.length === 0 &&
                                    !adicionandoEspaco && (

                                        <p>
                                            Nenhum espaço do parque cadastrado.
                                        </p>

                                    )}


                                {/* ========================================== */}
                                {/* MODAL DE EDIÇÃO DO ESPAÇO */}
                                {/* ========================================== */}

                                {editandoEspaco && (

                                    <div
                                        className="modalOverlay"
                                        onClick={() => {

                                            if (!salvandoEspaco) {
                                                setEditandoEspaco(null);
                                                setImagemEdicao(null);
                                            }

                                        }}
                                    >

                                        <div
                                            className="modal"
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        >

                                            <div className="vertical gap15">

                                                <div className="horizontal">

                                                    <h2>
                                                        Editar espaço
                                                    </h2>

                                                    <button
                                                        type="button"
                                                        onClick={() => {

                                                            if (!salvandoEspaco) {
                                                                setEditandoEspaco(null);
                                                                setImagemEdicao(null);
                                                            }

                                                        }}
                                                        disabled={salvandoEspaco}
                                                    >
                                                        ×
                                                    </button>

                                                </div>


                                                <div className="vertical gap15">

                                                    {/* TÍTULO */}

                                                    <div className="vertical gap5">

                                                        <label>
                                                            Título:
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                editandoEspaco.titulo
                                                            }
                                                            onChange={(e) =>
                                                                setEditandoEspaco(
                                                                    (prev) =>
                                                                        prev
                                                                            ? {
                                                                                ...prev,
                                                                                titulo:
                                                                                    e.target.value
                                                                            }
                                                                            : prev
                                                                )
                                                            }
                                                            disabled={
                                                                salvandoEspaco
                                                            }
                                                            required
                                                        />

                                                    </div>


                                                    {/* DESCRIÇÃO */}

                                                    <div className="vertical gap5">

                                                        <label>
                                                            Descrição:
                                                        </label>

                                                        <AutoResizeTextarea
                                                            value={
                                                                editandoEspaco.descricao
                                                            }
                                                            onChange={(e) =>
                                                                setEditandoEspaco(
                                                                    (prev) =>
                                                                        prev
                                                                            ? {
                                                                                ...prev,
                                                                                descricao:
                                                                                    e.target.value
                                                                            }
                                                                            : prev
                                                                )
                                                            }
                                                            disabled={
                                                                salvandoEspaco
                                                            }
                                                            required
                                                        />

                                                    </div>


                                                    {/* IMAGEM ATUAL */}

                                                    <div className="vertical gap5">

                                                        <label>
                                                            Imagem atual:
                                                        </label>

                                                        <p>
                                                            A imagem atual será mantida
                                                            caso nenhuma nova imagem
                                                            seja selecionada.
                                                        </p>

                                                    </div>


                                                    {/* NOVA IMAGEM */}

                                                    <div className="vertical gap5">

                                                        <label>
                                                            Alterar imagem:
                                                        </label>

                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={
                                                                selecionarImagemEdicao
                                                            }
                                                            disabled={
                                                                salvandoEspaco
                                                            }
                                                        />

                                                        {imagemEdicao && (

                                                            <p>
                                                                Nova imagem:{" "}
                                                                <strong>
                                                                    {
                                                                        imagemEdicao.name
                                                                    }
                                                                </strong>
                                                            </p>

                                                        )}

                                                    </div>


                                                    {/* BOTÕES */}

                                                    <div className="horizontal gap5">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                salvarEdicaoEspaco()
                                                            }
                                                            disabled={
                                                                salvandoEspaco
                                                            }
                                                        >
                                                            {salvandoEspaco
                                                                ? "Salvando..."
                                                                : "Salvar alterações"
                                                            }
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                setEditandoEspaco(
                                                                    null
                                                                );

                                                                setImagemEdicao(
                                                                    null
                                                                );

                                                            }}
                                                            disabled={
                                                                salvandoEspaco
                                                            }
                                                        >
                                                            Cancelar
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                <div className="linhaPontilhadaDark" />

                                <div className="vertical gap15">
                                    <h2>Galeria</h2>

                                    <div className="card vertical gap15">
                                        <h3>Adicionar imagem</h3>

                                        <div className="vertical gap5">
                                            <label htmlFor="imagemGaleria">
                                                Imagem:
                                            </label>

                                            <input
                                                id="imagemGaleria"
                                                type="file"
                                                accept="image/*"
                                                onChange={selecionarImagemGaleria}
                                                disabled={salvandoGaleria}
                                            />

                                            {novaImagemGaleria && (
                                                <p>
                                                    Imagem selecionada:{" "}
                                                    <strong>
                                                        {novaImagemGaleria.name}
                                                    </strong>
                                                </p>
                                            )}
                                        </div>

                                        <div className="vertical gap5">
                                            <label htmlFor="legendaGaleria">
                                                Legenda:
                                            </label>

                                            <input
                                                id="legendaGaleria"
                                                type="text"
                                                value={legendaGaleria}
                                                onChange={(e) =>
                                                    setLegendaGaleria(e.target.value)
                                                }
                                                placeholder="Ex.: Sede administrativa"
                                                disabled={salvandoGaleria}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={adicionarImagemGaleria}
                                            disabled={salvandoGaleria}
                                        >
                                            {salvandoGaleria
                                                ? "Adicionando..."
                                                : "Adicionar imagem"}
                                        </button>
                                    </div>

                                    {imagensGaleria.length > 0 ? (
                                        <div className="desktopWrap">
                                            {imagensGaleria.map((imagem) => {
                                                const {
                                                    data: urlData
                                                } = supabase.storage
                                                    .from("imagens")
                                                    .getPublicUrl(
                                                        imagem.caminho_arquivo
                                                    );

                                                return (
                                                    <div
                                                        key={imagem.id}
                                                        className="card vertical gap5"
                                                    >
                                                        <img
                                                            src={urlData.publicUrl}
                                                            alt={
                                                                imagem.legenda ||
                                                                "Imagem da galeria"
                                                            }
                                                            style={{
                                                                width: "100%",
                                                                maxHeight: 250,
                                                                objectFit: "cover",
                                                                borderRadius: 10
                                                            }}
                                                        />

                                                        <p>
                                                            {imagem.legenda ||
                                                                "Sem legenda"}
                                                        </p>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removerImagemGaleria(
                                                                    imagem
                                                                )
                                                            }
                                                            disabled={
                                                                removendoImagemGaleria !==
                                                                    null ||
                                                                salvandoGaleria
                                                            }
                                                        >
                                                            {removendoImagemGaleria ===
                                                            imagem.id
                                                                ? "Removendo..."
                                                                : "Remover imagem"}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p>
                                            Nenhuma imagem cadastrada na galeria.
                                        </p>
                                    )}
                                </div>

                                <div className="linhaPontilhadaDark" />

                                <div className="desktopWrap">
                                    <div className="vertical gap15">
                                        <h2>Acessibilidade</h2>
                                        <div className="vertical gap5">
                                            <label>Título:</label>
                                            <input
                                                type="text"
                                                value={
                                                    sobre.acessibilidade_titulo
                                                }
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "acessibilidade_titulo",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                        <div className="vertical gap5">
                                            <label>Informações sobre acessibilidade:</label>
                                            <AutoResizeTextarea
                                                value={
                                                    sobre.acessibilidade_descricao
                                                }
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "acessibilidade_descricao",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="vertical gap15">
                                        <h2>Visitas em grupo</h2>
                                        <div className="vertical gap5">
                                            <label>Título:</label>
                                            <input
                                                type="text"
                                                value={
                                                    sobre.visitas_grupo_titulo
                                                }
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "visitas_grupo_titulo",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                        <div className="vertical gap5">
                                            <label>Informações sobre visitas em grupo:</label>
                                            <AutoResizeTextarea
                                                value={
                                                    sobre.visitas_grupo_descricao
                                                }
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "visitas_grupo_descricao",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                        <div className="vertical gap5">
                                            <label>E-mail para agendamento:</label>
                                            <input
                                                type="email"
                                                value={
                                                    sobre.email_agendamento
                                                }
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "email_agendamento",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="exemplo@caraguatatuba.sp.gov.br"
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>


                                <div className="linhaPontilhadaDark" />

                                <div className="desktopWrap">
                                    <div className="vertical gap15">
                                        <h2>Horário de funcionamento</h2>
                                        <div className="vertical gap5">
                                            <label>
                                                Título:
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    sobre.horario_titulo
                                                }
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "horario_titulo",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                        <div className="vertical gap5">
                                            <label>
                                                Horário:
                                            </label>
                                            <AutoResizeTextarea
                                                value={
                                                    sobre.horario_descricao
                                                }
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "horario_descricao",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="vertical gap15">
                                        <h2>Endereço</h2>
                                        <div className="vertical gap5">
                                            <label>
                                                Título:
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    sobre.endereco_titulo
                                                }
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "endereco_titulo",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                        <div className="vertical gap5">
                                            <label>
                                                Endereço:
                                            </label>
                                            <AutoResizeTextarea
                                                value={
                                                    sobre.endereco_descricao
                                                }
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "endereco_descricao",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                        <div className="vertical gap5">
                                            <label>
                                                Link do Google Maps:
                                            </label>
                                            <input
                                                type="url"
                                                value={sobre.link_mapa}
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        "link_mapa",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://maps.google.com/..."
                                                disabled={salvando}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="btnFull">

                                    <button
                                        type="submit"
                                        disabled={salvando}
                                    >
                                        {salvando
                                            ? "Salvando..."
                                            : "Salvar alterações"
                                        }
                                    </button>

                                </div>
                            </div>
                        </div>

                    </div>
                </form>
                </section>
        </ProtectedRoute>
    );
}