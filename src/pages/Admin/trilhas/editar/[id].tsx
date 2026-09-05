import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, type ImagemDB, type TrilhaDB } from "../../../../lib/dexie.ts";
import { supabase } from "../../../../lib/supabase.ts";
import SimpleButton from "../../../../components/ui/buttons/SimpleButton.tsx";
import DraggableCarousel from "../../../../components/ui/DraggableCarousel.tsx";
import AutoResizeTextarea from "../../../../utils/AutoResizeTextarea.tsx";
import { convertToWebP } from "../../../../utils/imageConverter.ts";
import { uploadImagem } from "../../../../lib/services/images.ts";
import ProtectedRoute from "../../../../components/Protected.tsx";

export default function EditarTrilha() {

    const { id } = useParams();
    const [trilha, setTrilha] = useState<any>(null);
    const [carregando, setCarregando] = useState(false);
    const [imagensSalvasUrls, setImagensSalvasUrls] = useState<Record<number, string>>({});

    // Estados para controle das imagens
    const [imagensSalvas, setImagensSalvas] = useState<ImagemDB[]>([]);
    const [imagensDeletadasIds, setImagensDeletadasIds] = useState<number[]>([]);
    const [novasImagens, setNovasImagens] = useState<File[]>([]);
    const [novasImagensBase64, setNovasImagensBase64] = useState<string[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const idNumerico = Number(id);

                console.log(" ID da trilha:", id);
                console.log(" ID numérico:", idNumerico);

                if (!id || Number.isNaN(idNumerico)) {
                    console.error("ID da trilha inválido:", id);
                    setTrilha(null);
                    return;
                }

                // Primeiro tenta buscar no Dexie
                let data = await db.trilhas.get(idNumerico);

                // Se não encontrar offline, busca no Supabase
                if (!data) {
                    console.log("Trilha não encontrada no Dexie. Buscando no Supabase...");

                    const { data: trilhaSupabase, error } = await supabase
                        .from("trilhas")
                        .select("*")
                        .eq("id", idNumerico)
                        .single();

                    if (error) {
                        console.error("Erro ao buscar trilha:", error);
                        setTrilha(null);
                        return;
                    }

                    data = trilhaSupabase;

                    // Guarda no Dexie para funcionar offline depois
                    await db.trilhas.put(data as TrilhaDB);
                }

                console.log("Trilha carregada:", data);

                setTrilha(data);

                const imgs = await db.imagens
                    .where("trilha_id")
                    .equals(idNumerico)
                    .toArray();

                console.log("Imagens encontradas:", imgs);

                setImagensSalvas(imgs);

                const urls: Record<number, string> = {};

                for (const img of imgs) {
                    if (img.arquivo instanceof Blob && img.id != null) {
                        urls[img.id] = URL.createObjectURL(img.arquivo);
                    }
                }

                setImagensSalvasUrls(urls);
            } catch (error) {
                console.error("Erro ao carregar trilha:", error);
                setTrilha(null);
            }
        }

        async function loadUser() {
            const { data } = await supabase.auth.getSession();
            console.log("Sessão:", data.session);
        }

        load();
        loadUser();

        return () => {
            setImagensSalvasUrls((urls) => {
                Object.values(urls).forEach((url) => {
                    URL.revokeObjectURL(url);
                });

                return {};
            });
        };
    }, [id]);

    // Manipula a seleção de novos arquivos (igual ao cadastro, mas adicionando à lista)

    async function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        const novosBase64: string[] = [];

        for (const file of files) {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = () => {
                    resolve(reader.result as string);
                };

                reader.onerror = () => {
                    reject(new Error("Erro ao carregar imagem."));
                };

                reader.readAsDataURL(file);
            });

            novosBase64.push(base64);
        }

        setNovasImagens((prev) => [...prev, ...files]);
        setNovasImagensBase64((prev) => [...prev, ...novosBase64]);
    }


    // Remove uma imagem que já estava salva no banco (coloca o ID na fila de exclusão)
    function handleRemoveSavedImage(img: ImagemDB, indexToRemove: number) {
        if (img.id) {
            setImagensDeletadasIds((prev) => [...prev, img.id!]);

            const url = imagensSalvasUrls[img.id];

            if (url) {
                URL.revokeObjectURL(url);
            }

            setImagensSalvasUrls((prev) => {
                const novas = { ...prev };
                delete novas[img.id!];
                return novas;
            });
        }

        setImagensSalvas((prev) =>
            prev.filter((_, idx) => idx !== indexToRemove)
        );
    }

    // Remove uma imagem nova que acabou de ser selecionada
    function handleRemoveNewImage(indexToRemove: number) {
        setNovasImagens((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setNovasImagensBase64((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);

        try {
            const formData = new FormData(e.currentTarget);

            const dadosTrilha = {
                nome: formData.get("nome") as string,
                cor_identificacao: formData.get("cor_identificacao") as string,
                dificuldade: formData.get("dificuldade") as string,
                extensao: formData.get("extensao") as string,
                duracao: formData.get("duracao") as string,
                descricao_curta: formData.get("descricao_curta") as string,
                descricao: formData.get("descricao") as string,
                equipamento_recomendado: formData.get("equipamento_recomendado") as string,
                atencao: formData.get("atencao") as string,
            };



            const { data: trilhaAtualizada, error: erroTrilha } = await supabase
                .from("trilhas")
                .update(dadosTrilha)
                .eq("id", Number(id))
                .select()
                .single();

            if (erroTrilha) throw erroTrilha;

            // Deleta do Supabase e do Dexie as imagens removidas pelo usuário
            if (imagensDeletadasIds.length > 0) {
                const { error: erroDeletar } = await supabase
                    .from("imagens")
                    .delete()
                    .in("id", imagensDeletadasIds);

                if (erroDeletar) throw erroDeletar;

                await db.imagens.bulkDelete(imagensDeletadasIds);
                setImagensDeletadasIds([]); // Limpa a fila de exclusão
            }

            // Salva as novas imagens (se houver) no Supabase e no Dexie
            if (novasImagens.length > 0) {
                const novasImagensSalvas: ImagemDB[] = [];

                const totalExistentes = imagensSalvas.length;

                for (let index = 0; index < novasImagens.length; index++) {
                    const file = novasImagens[index];

                    // Converte a imagem para WebP
                    const blobWebP = await convertToWebP(file, 0.8);

                    const nomeArquivo = `${crypto.randomUUID()}.webp`;


                    // Caminho REAL dentro do Storage
                    const caminho = `trilhas/${id}/${nomeArquivo}`;

                    console.log("Processando imagem:", {
                        arquivoOriginal: file.name,
                        tamanhoOriginal: file.size,
                        tamanhoWebP: blobWebP.size,
                        caminho,
                    });

                    // 1. Envia o arquivo físico para o Storage
                    await uploadImagem(blobWebP, caminho);

                    // 2. Cria registro da tabela imagens
                    novasImagensSalvas.push({
                        id: Date.now() + index,
                        trilha_id: Number(id),
                        ponto_interesse_id: null,
                        caminho_arquivo: caminho,
                        legenda: `Imagem ${totalExistentes + index + 1} da trilha ${trilhaAtualizada.nome}`,
                        arquivo: blobWebP,
                    });
                }

                // 3. Salva somente os metadados no Supabase
                const dadosImagens = novasImagensSalvas.map((imagem) => ({
                    trilha_id: imagem.trilha_id,
                    ponto_interesse_id: imagem.ponto_interesse_id,
                    caminho_arquivo: imagem.caminho_arquivo,
                    legenda: imagem.legenda,
                }));

                const { data: imagensInseridas, error: erroImagens } =
                    await supabase
                        .from("imagens")
                        .insert(dadosImagens)
                        .select();

                if (erroImagens) {
                    console.error("Erro ao salvar imagens no banco:", erroImagens);
                    throw erroImagens;
                }

                console.log("Imagens salvas no banco:", imagensInseridas);

                // 4. Salva o Blob no Dexie para funcionar offline
                const imagensDexie = imagensInseridas.map((imagem, index) => ({
                    ...imagem,
                    arquivo: novasImagensSalvas[index].arquivo,
                }));

                // Salva no Dexie
                await db.imagens.bulkPut(imagensDexie);

                // Adiciona as imagens à lista de imagens salvas
                setImagensSalvas((prev) => [
                    ...prev,
                    ...imagensDexie
                ]);

                // Cria URLs locais para as novas imagens aparecerem imediatamente
                setImagensSalvasUrls((prev) => {
                    const novasUrls = { ...prev };

                    imagensDexie.forEach((imagem) => {
                        if (imagem.id != null && imagem.arquivo instanceof Blob) {
                            novasUrls[imagem.id] = URL.createObjectURL(imagem.arquivo);
                        }
                    });

                    return novasUrls;
                });

                // Limpa as imagens pendentes
                setNovasImagens([]);
                setNovasImagensBase64([]);

                console.log("Imagens salvas no Dexie:", imagensDexie);
            }
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao atualizar: ${error.message || error}`);
        } finally {
            setCarregando(false);
            alert("Trilha Atualizada com sucesso")

        }

    }

    if (!trilha) {
        return <h1>Trilha não encontrada</h1>;
    }

    const totalImagens = imagensSalvas.length + novasImagens.length;

    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">
                <SimpleButton path="/admin/trilhas" type="back" icon="setaBack">
                    Voltar
                </SimpleButton>

                <h1>Editar {trilha.nome}</h1>

                <form className="card form vertical gap15" onSubmit={handleSubmit}>
                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input name="nome" defaultValue={trilha.nome} disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Cor:</label>
                        <input name="cor_identificacao" defaultValue={trilha.cor_identificacao} disabled={carregando} />
                    </div>

                    <div className="horizontal gap15">
                        <div className="vertical gap5">
                            <label>Dificuldade:</label>
                            <select name="dificuldade" defaultValue={trilha.dificuldade} disabled={carregando}>
                                <option>Fácil</option>
                                <option>Moderada</option>
                                <option>Difícil</option>
                            </select>
                        </div>

                        <div className="vertical gap5">
                            <label>Extensão:</label>
                            <input name="extensao" defaultValue={trilha.extensao} disabled={carregando} />
                        </div>

                        <div className="vertical gap5">
                            <label>Duração:</label>
                            <input name="duracao" defaultValue={trilha.duracao} disabled={carregando} />
                        </div>
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição curta:</label>
                        <AutoResizeTextarea name="descricao_curta" defaultValue={trilha.descricao_curta} disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        <AutoResizeTextarea name="descricao" defaultValue={trilha.descricao} rows={3} disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Equipamento recomendado:</label>
                        <AutoResizeTextarea name="equipamento_recomendado" defaultValue={trilha.equipamento_recomendado} disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Atenção:</label>
                        <AutoResizeTextarea name="atencao" defaultValue={trilha.atencao} disabled={carregando} />
                    </div>

                    {/* Seção de upload e manipulação do carrossel de imagens */}
                    <div className="vertical gap15">
                        <div className="vertical gap5" id="file">
                            <label>Adicionar novas imagens:</label>
                            <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={carregando} />
                        </div>

                        {totalImagens > 0 && (
                            <div className="vertical gap5">
                                <p><strong>{totalImagens} imagem(ns) nesta trilha:</strong></p>
                                <DraggableCarousel
                                    items={[
                                        // Renderiza as imagens que já estão salvas no banco
                                        ...imagensSalvas.map((img, idx) => (
                                            <div key={`salva-${img.id || idx}`} className="uploadPreview vertical gap5 carrosselCard">
                                                <img
                                                    src={imagensSalvasUrls[img.id] ?? ""}
                                                    alt={img.legenda}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSavedImage(img, idx)}
                                                    disabled={carregando}
                                                    className="btn-red"
                                                >
                                                    Excluir
                                                </button>
                                                <p>{img.legenda}</p>
                                            </div>
                                        )),
                                        // Renderiza as novas imagens recém-selecionadas pelo input
                                        ...novasImagens.map((file, idx) => (
                                            <div key={`nova-${idx}`} className="uploadPreview vertical gap5 carrosselCard">
                                                <img src={novasImagensBase64[idx]} alt={file.name} />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(idx)}
                                                    disabled={carregando}
                                                >
                                                    Remover
                                                </button>
                                                <p>{file.name} (Nova)</p>
                                            </div>
                                        ))
                                    ]}
                                />
                            </div>
                        )}
                    </div>

                    <div className="btnFull">
                        <button type="submit" disabled={carregando}>
                            {carregando ? "Salvando alterações..." : "Salvar alterações"}
                        </button>
                    </div>
                </form>
            </section>
        </ProtectedRoute>
    );
}