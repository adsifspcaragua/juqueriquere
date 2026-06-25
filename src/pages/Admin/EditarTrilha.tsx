import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, type ImagemDB } from "../../lib/dexie";
import { supabase } from "../../lib/supabase";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import DraggableCarousel from "../../components/ui/DraggableCarousel";
import AutoResizeTextarea from "./AutoResizeTextarea.tsx";
import { convertToWebPBase64 } from "./imageConverter";

export default function EditarTrilha() {
    const { id } = useParams();
    const [trilha, setTrilha] = useState<any>(null);
    const [carregando, setCarregando] = useState(false);

    // Estados para controle das imagens
    const [imagensSalvas, setImagensSalvas] = useState<ImagemDB[]>([]);
    const [imagensDeletadasIds, setImagensDeletadasIds] = useState<number[]>([]);
    const [novasImagens, setNovasImagens] = useState<File[]>([]);
    const [novasImagensBase64, setNovasImagensBase64] = useState<string[]>([]);
    
    useEffect(() => {
        async function load() {
            const data = await db.trilhas.get(Number(id));
            setTrilha(data);

            const imgs = await db.imagens.where("trilha_id").equals(Number(id)).toArray();
            setImagensSalvas(imgs);
        }

        load();
    }, [id]);

    // Manipula a seleção de novos arquivos (igual ao cadastro, mas adicionando à lista)
    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const novosBase64: string[] = [];

            for (const file of files) {
                const base64 = await convertToWebPBase64(file, 0.8);
                novosBase64.push(base64);
            }

            setNovasImagensBase64((prev) => [...prev, ...novosBase64]);
            setNovasImagens((prev) => [...prev, ...files]);
        }
    }

    // Remove uma imagem que já estava salva no banco (coloca o ID na fila de exclusão)
    function handleRemoveSavedImage(img: ImagemDB, indexToRemove: number) {
        if (img.id) {
            setImagensDeletadasIds((prev) => [...prev, img.id!]);
        }
        setImagensSalvas((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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
                const promessasImagens = novasImagens.map(async (file, index) => {
                    const stringWebPBase64 = await convertToWebPBase64(file, 0.8);
                    // Conta quantas imagens restaram para continuar a numeração da legenda
                    const totalExistentes = imagensSalvas.length; 
                    return {
                        trilha_id: Number(id),
                        ponto_interesse_id: null,
                        caminho_arquivo: stringWebPBase64,
                        legenda: `Imagem ${totalExistentes + index + 1} da trilha ${trilhaAtualizada.nome}`
                    };
                });

                const dadosImagens = await Promise.all(promessasImagens);

                const { data: novasImagensSalvas, error: erroImagens } = await supabase
                    .from("imagens")
                    .insert(dadosImagens)
                    .select();

                if (erroImagens) throw erroImagens;

                if (novasImagensSalvas) {
                    await db.imagens.bulkPut(novasImagensSalvas as ImagemDB[]);
                    // Atualiza o estado local para unificar as imagens
                    setImagensSalvas((prev) => [...prev, ...(novasImagensSalvas as ImagemDB[])]);
                }

                // Limpa o estado temporário de uploads
                setNovasImagens([]);
                setNovasImagensBase64([]);
            }

            // Atualiza os dados da trilha no Dexie local
            await db.trilhas.put(trilhaAtualizada);
            setTrilha(trilhaAtualizada);

            alert("Trilha e imagens atualizadas com sucesso!");
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao atualizar: ${error.message || error}`);
        } finally {
            setCarregando(false);
        }
    }

    if (!trilha) {
        return <h1>Trilha não encontrada</h1>;
    }

    const totalImagens = imagensSalvas.length + novasImagens.length;

    return (
        <>
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
                        <AutoResizeTextarea name="equipamento_recommended" defaultValue={trilha.equipamento_recomendado} disabled={carregando} />
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
                                                <img src={img.caminho_arquivo} alt={img.legenda} />
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
        </>
    );
}