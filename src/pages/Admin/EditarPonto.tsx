import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { db, type ImagemDB, type PontoInteresseDB } from "../../lib/dexie";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import DraggableCarousel from "../../components/ui/DraggableCarousel";
import AutoResizeTextarea from "./AutoResizeTextarea.tsx";
import { convertToWebPBase64 } from "./imageConverter.ts";

interface Trilha {
    id: number;
    nome: string;
}

export default function EditarPontoInteresse() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const formRef = useRef<HTMLFormElement>(null);

    const [trilhas, setTrilhas] = useState<Trilha[]>([]);
    const [pontoAtual, setPontoAtual] = useState<PontoInteresseDB | null>(null);
    const [trilhaSelecionada, setTrilhaSelecionada] = useState<number | null>(null);
    
    // Controle de imagens existentes no banco
    const [imagensAntigas, setImagensAntigas] = useState<ImagemDB[]>([]);
    const [imagensParaRemover, setImagensParaRemover] = useState<number[]>([]);

    // Controle de novas imagens a serem adicionadas
    const [imagensNovas, setImagensNovas] = useState<File[]>([]);
    const [imagensBase64, setImagensBase64] = useState<string[]>([]);
    
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarDadosIniciais() {
            if (!id) return;

            try {
                // 1. Carregar Trilhas
                const trilhasOffline = await db.trilhas.toArray();
                if (trilhasOffline.length > 0) {
                    setTrilhas(trilhasOffline);
                } else {
                    const { data: trilhasData } = await supabase.from("trilhas").select("id, nome").order("nome");
                    if (trilhasData) setTrilhas(trilhasData);
                }

                // 2. Carregar Dados do Ponto de Interesse
                const pontoOffline = await db.pontos_interesse.get(Number(id));
                if (pontoOffline) {
                    setPontoAtual(pontoOffline);
                    setTrilhaSelecionada(pontoOffline.trilha_id);
                } else {
                    const { data: pontoData, error: pontoError } = await supabase
                        .from("pontos_interesse")
                        .select("*")
                        .eq("id", id)
                        .single();
                    
                    if (pontoError) throw pontoError;
                    if (pontoData) {
                        setPontoAtual(pontoData);
                        setTrilhaSelecionada(pontoData.trilha_id);
                    }
                }

                // 3. Carregar Imagens do Ponto
                const imagensOffline = await db.imagens.where({ ponto_interesse_id: Number(id) }).toArray();
                if (imagensOffline.length > 0) {
                    setImagensAntigas(imagensOffline);
                } else {
                    const { data: imagensData } = await supabase
                        .from("imagens")
                        .select("*")
                        .eq("ponto_interesse_id", id);
                        
                    if (imagensData) setImagensAntigas(imagensData);
                }

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                alert("Erro ao carregar os dados do ponto de interesse.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDadosIniciais();
    }, [id]);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const novosBase64: string[] = [];

            for (const file of files) {
                const base64 = await convertToWebPBase64(file, 0.8);
                novosBase64.push(base64);
            }

            setImagensBase64((prev) => [...prev, ...novosBase64]);
            setImagensNovas((prev) => [...prev, ...files]);
        }
    }

    function handleRemoveNovaImagem(indexToRemove: number) {
        setImagensNovas((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setImagensBase64((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    function handleRemoveImagemAntiga(imagem: ImagemDB) {
        // Remove da visualização atual e adiciona na lista de deleção
        setImagensAntigas((prev) => prev.filter((img) => img.id !== imagem.id));
        setImagensParaRemover((prev) => [...prev, imagem.id!]);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);

        try {
            const formData = new FormData(e.currentTarget);

            const dadosAtualizados = {
                trilha_id: trilhaSelecionada,
                nome: formData.get("nome") as string,
                descricao: formData.get("descricao") as string,
                planta: formData.get("planta") as string,
                caminho: formData.get("caminho") as string,
                misc: formData.get("misc") as string,
                latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
                longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
            };

            // 1. Atualiza o Ponto de Interesse no Supabase
            const { data: pontoAtualizado, error: errorPonto } = await supabase
                .from("pontos_interesse")
                .update(dadosAtualizados)
                .eq("id", id)
                .select()
                .single();

            if (errorPonto) throw errorPonto;

            // Atualiza no banco local offline (Dexie)
            await db.pontos_interesse.update(Number(id), dadosAtualizados as any);

            // 2. Remove imagens antigas deletadas pelo usuário
            if (imagensParaRemover.length > 0) {
                const { error: erroDeleteImagens } = await supabase
                    .from("imagens")
                    .delete()
                    .in("id", imagensParaRemover);

                if (erroDeleteImagens) throw erroDeleteImagens;
                
                await db.imagens.bulkDelete(imagensParaRemover);
            }

            // 3. Adiciona as novas imagens selecionadas
            if (imagensNovas.length > 0) {
                const promessasImagens = imagensNovas.map(async (file, index) => {
                    const stringWebPBase64 = await convertToWebPBase64(file, 0.8);
                    return {
                        trilha_id: null,
                        ponto_interesse_id: Number(id),
                        caminho_arquivo: stringWebPBase64,
                        legenda: `Nova imagem ${index + 1} de ${pontoAtualizado.nome}`
                    };
                });

                const dadosNovasImagens = await Promise.all(promessasImagens);

                const { data: imagensInseridas, error: erroInsertImagens } = await supabase
                    .from("imagens")
                    .insert(dadosNovasImagens)
                    .select();

                if (erroInsertImagens) throw erroInsertImagens;

                if (imagensInseridas) {
                    await db.imagens.bulkPut(imagensInseridas as ImagemDB[]);
                }
            }

            alert("Ponto de interesse atualizado com sucesso!");
            navigate("/admin/pontos"); // Volta para a lista após salvar
            
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao atualizar: ${error.message || error}`);
        } finally {
            setCarregando(false);
        }
    }

    if (carregando && !pontoAtual) {
        return <p style={{ padding: '20px' }}>Carregando dados...</p>;
    }

    return (
        <>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">
                <SimpleButton path="/admin/pontos" type="back" icon="setaBack">
                    Voltar
                </SimpleButton>

                <h1>Editar Ponto de Interesse</h1>

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
                            defaultValue={pontoAtual?.nome} 
                            required 
                            disabled={carregando} 
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        {/* Verifique se AutoResizeTextarea aceita a prop defaultValue, caso contrário ajuste no seu componente */}
                        <AutoResizeTextarea 
                            name="descricao" 
                            defaultValue={pontoAtual?.descricao || ""} 
                            placeholder="Descreva o ponto de interesse..." 
                            disabled={carregando} 
                        />
                    </div>

                    <div className="horizontal gap15">
                        <div>
                            <label>Latitude:</label>
                            <input 
                                type="number" 
                                step="any" 
                                name="latitude" 
                                defaultValue={pontoAtual?.latitude || ""} 
                                disabled={carregando} 
                            />
                        </div>

                        <div>
                            <label>Longitude:</label>
                            <input 
                                type="number" 
                                step="any" 
                                name="longitude" 
                                defaultValue={pontoAtual?.longitude || ""} 
                                disabled={carregando} 
                            />
                        </div>
                    </div>

                    <hr style={{ opacity: 0.2, margin: '10px 0' }}/>

                    {/* IMAGENS EXISTENTES */}
                    {imagensAntigas.length > 0 && (
                        <div className="vertical gap15">
                            <label>Imagens Atuais:</label>
                            <DraggableCarousel
                                items={imagensAntigas.map((imagem) => (
                                    <div key={imagem.id} className="uploadPreview vertical gap5 carrosselCard">
                                        <img src={imagem.caminho_arquivo} alt="Imagem salva" />
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveImagemAntiga(imagem)}
                                            disabled={carregando}
                                            style={{ background: '#ff4d4f', color: 'white' }}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                ))}
                            />
                        </div>
                    )}

                    {/* NOVAS IMAGENS */}
                    <div className="vertical gap15">
                        <div className="vertical gap5" id="file">
                            <label>Adicionar Novas Imagens:</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                disabled={carregando}
                            />
                        </div>

                        {imagensNovas.length > 0 && (
                            <div className="vertical gap5">
                                <p><strong>{imagensNovas.length} nova(s) imagem(ns) selecionada(s):</strong></p>
                                <DraggableCarousel
                                    items={imagensNovas.map((file, idx) => (
                                        <div key={idx} className="uploadPreview vertical gap5 carrosselCard">
                                            <img src={imagensBase64[idx]} alt={file.name} />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveNovaImagem(idx)}
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