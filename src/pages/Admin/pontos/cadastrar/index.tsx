import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabase.ts";
import { db, type ImagemDB } from "../../../../lib/dexie.ts";
import { createRecord } from "../../../../lib/services/crud.ts";
import { uploadImagem } from "../../../../lib/services/images.ts";
import { convertToWebP } from "../../../../utils/imageConverter.ts";

import SimpleButton from "../../../../components/ui/buttons/SimpleButton.tsx";
import DraggableCarousel from "../../../../components/ui/DraggableCarousel.tsx";
import AutoResizeTextarea from "../../../../utils/AutoResizeTextarea.tsx";
import Map from "../../../../components/ui/Map/Map.tsx";
import ProtectedRoute from "../../../../components/Protected.tsx";

import "../../../_styles/ponto.css";

interface Trilha {
    id: number;
    nome: string;
}

export default function CadastrarPontoInteresse() {
    const formRef = useRef<HTMLFormElement>(null);

    const [trilhas, setTrilhas] = useState<Trilha[]>([]);
    const [trilhaSelecionada, setTrilhaSelecionada] = useState<number | null>(null);

    const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(false);

    // --- ESTADOS DO PREVIEW ---
    const [previewAtivo, setPreviewAtivo] = useState(false);
    const [dadosPreview, setDadosPreview] = useState<{
        nome: string;
        descricao: string;
        planta: string;
        latitude: string;
        longitude: string;
    } | null>(null);

    useEffect(() => {
        async function carregarTrilhas() {
            const trilhasOffline = await db.trilhas.toArray();
            if (trilhasOffline.length > 0) {
                setTrilhas(trilhasOffline);
                return;
            }
            const { data, error } = await supabase.from("trilhas").select("id, nome").order("nome");
            if (error) { console.error(error); return; }
            setTrilhas(data ?? []);
        }
        carregarTrilhas();
    }, []);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        const newUrls = files.map((file) => URL.createObjectURL(file));

        setImagensSelecionadas((prev) => [...prev, ...files]);
        setPreviewUrls((prev) => [...prev, ...newUrls]);
    }

    function handleRemoveImage(indexToRemove: number) {
        URL.revokeObjectURL(previewUrls[indexToRemove]);

        setImagensSelecionadas((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setPreviewUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    function handleAtivarPreview() {
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        setDadosPreview({
            nome: formData.get("nome") as string,
            descricao: formData.get("descricao") as string,
            planta: formData.get("planta") as string,
            latitude: formData.get("latitude") as string,
            longitude: formData.get("longitude") as string,
        });
        setPreviewAtivo(true);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);

        try {
            const formData = new FormData(e.currentTarget);
            const dadosPontoSupabase = {
                trilha_id: trilhaSelecionada,
                nome: formData.get("nome") as string,
                descricao: formData.get("descricao") as string,
                planta: formData.get("planta") as string,
                caminho: formData.get("caminho") as string,
                misc: formData.get("misc") as string,
                latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
                longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
            };

            const novoPonto = await createRecord<any>("pontos_interesse", dadosPontoSupabase);
            if (!novoPonto) throw new Error("Não foi possível criar o ponto de interesse.");

            await db.pontos_interesse.put(novoPonto);

            if (imagensSelecionadas.length > 0) {
                for (let index = 0; index < imagensSelecionadas.length; index++) {
                    const file = imagensSelecionadas[index];

                    // Converte para Blob WebP
                    const blobWebP = await convertToWebP(file, 0.8);

                    const nomeArquivo = `${crypto.randomUUID()}.webp`;
                    const caminho = `pontos/${nomeArquivo}`;

                    // Upload para o Storage do Supabase
                    await uploadImagem(blobWebP, caminho);

                    const registroImagem = await createRecord<any>("imagens", {
                        trilha_id: null,
                        ponto_interesse_id: novoPonto.id,
                        caminho_arquivo: caminho,
                        legenda: `Imagem ${index + 1} do ponto de interesse ${novoPonto.nome}`,
                    });

                    // Se a imagem foi cadastrada no banco, grava no Dexie local com o Blob do arquivo
                    if (registroImagem) {
                        await db.imagens.put({
                            ...registroImagem,
                            arquivo: blobWebP,
                        } as ImagemDB);
                    }
                }
            }

            alert("Ponto de interesse e imagens cadastrados com sucesso!");

            // Limpa URLs da memória e reseta o formulário
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
            formRef.current?.reset();
            setDadosPreview(null);
            setTrilhaSelecionada(null);
            setImagensSelecionadas([]);
            setPreviewUrls([]);
            setPreviewAtivo(false);

        } catch (error: any) {
            console.error("Erro ao cadastrar ponto de interesse:", error);
            alert(`Erro ao cadastrar: ${error?.message || error}`);
        } finally {
            setCarregando(false);
        }
    }

    const nomeTrilhaSelecionada = trilhas.find((t) => t.id === trilhaSelecionada)?.nome || "Nenhuma Trilha";

    // --- RENDERIZAÇÃO DO PREVIEW ---
    if (previewAtivo && dadosPreview) {
        const imagensListPreview = previewUrls.map((url, index) => (
            <div key={String(index)}>
                <img src={url} alt="Preview" />
            </div>
        ));

        return (
            <>
                <div className="paddingHeader"></div>
                <div style={{ background: "#ff9800", color: "#000", padding: "10px", textAlign: "center", fontWeight: "bold" }}>
                    MODO PREVIEW - O ponto ainda não foi salvo no banco de dados.
                </div>

                <section className="conteudo vertical gap15">
                    <div className="horizontal gap15">
                        <SimpleButton type="back" icon="setaBack" raio="10" onClick={() => setPreviewAtivo(false)}>
                            Voltar para a Edição/Formulário
                        </SimpleButton>
                    </div>

                    <div className="desktopWrap">
                        <div className="vertical">
                            {imagensListPreview.length > 0 && (
                                <DraggableCarousel items={imagensListPreview} />
                            )}
                        </div>

                        <div className="vertical gap15">
                            <div className="vertical gap15">
                                <div className="vertical gap5">
                                    <h1>{dadosPreview.nome || "Nome de Exemplo"}</h1>
                                    {dadosPreview.planta && <i>{dadosPreview.planta}</i>}
                                </div>
                                <div className="card vertical gap5">
                                    <h2>Descrição</h2>
                                    <p>{dadosPreview.descricao || "Sua descrição aparecerá aqui."}</p>
                                </div>
                            </div>
                            <div className="card desktopWrap gap15">
                                {dadosPreview.latitude && dadosPreview.longitude && (
                                    <div className="mapa">
                                        <Map id={trilhaSelecionada ? [trilhaSelecionada] : []} />
                                    </div>
                                )}

                                <div className="vertical gap5">
                                    <p>Aparece em:</p>
                                    <SimpleButton tema="dark" raio="10">{nomeTrilhaSelecionada}</SimpleButton>
                                    {dadosPreview.latitude && dadosPreview.longitude && (
                                        <p>Coordenadas: {dadosPreview.latitude}, {dadosPreview.longitude}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    // --- RENDERIZAÇÃO DO FORMULÁRIO ---
    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">
                <SimpleButton path="/admin/pontos" type="back" icon="setaBack">
                    Voltar
                </SimpleButton>

                <h1>Cadastrar Ponto de Interesse</h1>

                <form ref={formRef} className="card form vertical gap15" onSubmit={handleSubmit}>
                    <div className="vertical gap5">
                        <label>Trilha:</label>
                        <select
                            name="trilha"
                            value={trilhaSelecionada ?? ""}
                            onChange={(e) => setTrilhaSelecionada(e.target.value ? Number(e.target.value) : null)}
                            required
                            disabled={carregando}
                        >
                            <option value="">Ponto não pertence a nenhuma trilha</option>
                            {trilhas.map((trilha) => (
                                <option key={trilha.id} value={trilha.id}>
                                    {trilha.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input
                            name="nome"
                            required
                            disabled={carregando}
                            defaultValue={dadosPreview?.nome ?? ""}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Nome Científico / Planta (Opcional):</label>
                        <input
                            name="planta"
                            disabled={carregando}
                            defaultValue={dadosPreview?.planta ?? ""}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        <AutoResizeTextarea
                            name="descricao"
                            placeholder="Descreva o ponto de interesse..."
                            disabled={carregando}
                            defaultValue={dadosPreview?.descricao ?? ""}
                        />
                    </div>

                    <div className="horizontal gap15">
                        <div>
                            <label>Latitude:</label>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                disabled={carregando}
                                defaultValue={dadosPreview?.latitude ?? ""}
                            />
                        </div>

                        <div>
                            <label>Longitude:</label>
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                disabled={carregando}
                                defaultValue={dadosPreview?.longitude ?? ""}
                            />
                        </div>
                    </div>

                    <div className="vertical gap15">
                        <div className="vertical gap5" id="file">
                            <label>Imagens do Ponto de Interesse:</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                disabled={carregando}
                            />
                        </div>

                        {imagensSelecionadas.length > 0 && (
                            <div className="vertical gap5">
                                <p><strong>{imagensSelecionadas.length} imagem(ns) selecionada(s):</strong></p>
                                <DraggableCarousel
                                    items={imagensSelecionadas.map((file, idx) => (
                                        <div key={idx} className="uploadPreview vertical gap5 carrosselCard">
                                            <img src={previewUrls[idx]} alt={file.name} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                disabled={carregando}
                                            >
                                                Remover
                                            </button>
                                            <p>{file.name}</p>
                                        </div>
                                    ))}
                                />
                            </div>
                        )}
                    </div>

                    <div className="horizontal gap15" style={{ marginTop: "10px" }}>
                        <button
                            type="button"
                            className="btn-preview"
                            onClick={handleAtivarPreview}
                            disabled={carregando}
                            style={{ background: "#4a5568", color: "#fff", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", flex: 1 }}
                        >
                            Visualizar Preview da Página
                        </button>

                        <button
                            type="submit"
                            disabled={carregando}
                            style={{ flex: 1 }}
                        >
                            {carregando ? "Cadastrando..." : "Cadastrar ponto de interesse"}
                        </button>
                    </div>
                </form>
            </section>
        </ProtectedRoute>
    );
}