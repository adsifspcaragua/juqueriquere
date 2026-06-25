import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { db, type ImagemDB } from "../../lib/dexie";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import DraggableCarousel from "../../components/ui/DraggableCarousel";
import AutoResizeTextarea from "./AutoResizeTextarea.tsx";
import { convertToWebPBase64 } from "./imageConverter.ts";

interface Trilha {
    id: number;
    nome: string;
}

export default function CadastrarPontoInteresse() {
    const formRef = useRef<HTMLFormElement>(null);

    const [trilhas, setTrilhas] = useState<Trilha[]>([]);
    const [trilhaSelecionada, setTrilhaSelecionada] = useState<number | null>(null);
    
    // Estados novos para controle de imagens e loading
    const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([]);
    const [imagensBase64, setImagensBase64] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        async function carregarTrilhas() {
            const trilhasOffline = await db.trilhas.toArray();

            if (trilhasOffline.length > 0) {
                setTrilhas(trilhasOffline);
                return;
            }

            const { data, error } = await supabase
                .from("trilhas")
                .select("id, nome")
                .order("nome");

            if (error) {
                console.error(error);
                return;
            }

            setTrilhas(data ?? []);
        }

        carregarTrilhas();
    }, []);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const novosBase64: string[] = [];

            for (const file of files) {
                const base64 = await convertToWebPBase64(file, 0.8);
                novosBase64.push(base64);
            }

            setImagensBase64(novosBase64);
            setImagensSelecionadas(files);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);

        try {
            const formData = new FormData(e.currentTarget);

            const dados = {
                trilha_id: trilhaSelecionada,
                nome: formData.get("nome") as string,
                descricao: formData.get("descricao") as string,
                planta: formData.get("planta") as string,
                caminho: formData.get("caminho") as string,
                misc: formData.get("misc") as string,
                latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
                longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
            };

            const { data: novoPonto, error: errorPonto } = await supabase
                .from("pontos_interesse")
                .insert(dados)
                .select()
                .single();

            if (errorPonto) throw errorPonto;

            // Salva no banco local offline (Dexie)
            await db.pontos_interesse.put(novoPonto);

            // Fluxo de salvamento de Imagens para o Ponto de Interesse
            if (imagensSelecionadas.length > 0) {
                const promessasImagens = imagensSelecionadas.map(async (file, index) => {
                    const stringWebPBase64 = await convertToWebPBase64(file, 0.8);
                    return {
                        trilha_id: null, // Ponto de interesse direto, trilha_id fica nulo
                        ponto_interesse_id: novoPonto.id, // ID atribuído aqui conforme solicitado!
                        caminho_arquivo: stringWebPBase64,
                        legenda: `Imagem ${index + 1} do ponto de interesse ${novoPonto.nome}`
                    };
                });

                const dadosImagens = await Promise.all(promessasImagens);

                const { data: novasImagens, error: erroImagens } = await supabase
                    .from("imagens")
                    .insert(dadosImagens)
                    .select();

                if (erroImagens) throw erroImagens;

                if (novasImagens) {
                    await db.imagens.bulkPut(novasImagens as ImagemDB[]);
                }
            }

            alert("Ponto de interesse e imagens cadastrados com sucesso!");
            formRef.current?.reset();
            setTrilhaSelecionada(null);
            setImagensSelecionadas([]);
            setImagensBase64([]);
            
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao cadastrar: ${error.message || error}`);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">
                <SimpleButton path="/admin/pontos-interesse" type="back" icon="setaBack">
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
                        <input name="nome" required disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        {/* Substituído pelo componente auto-ajustável padrão */}
                        <AutoResizeTextarea name="descricao" placeholder="Descreva o ponto de interesse..." disabled={carregando} />
                    </div>

                    <div className="horizontal gap15">
                        <div>
                            <label>Latitude:</label>
                            <input type="number" step="any" name="latitude" disabled={carregando} />
                        </div>

                        <div>
                            <label>Longitude:</label>
                            <input type="number" step="any" name="longitude" disabled={carregando} />
                        </div>
                    </div>

                    {/* Bloco de Input e Carrossel de Imagens idêntico ao das Trilhas */}
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
                                    items={imagensSelecionadas.map((file, index) => (
                                        <div key={index} className="uploadPreview vertical gap5 carrosselCard">
                                            <img src={imagensBase64[index]} alt={file.name} />
                                            <p>{file.name}</p>
                                        </div>
                                    ))}
                                />
                            </div>
                        )}
                    </div>

                    <div className="btnFull">
                        <button type="submit" disabled={carregando}>
                            {carregando ? "Cadastrando..." : "Cadastrar ponto de interesse"}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}