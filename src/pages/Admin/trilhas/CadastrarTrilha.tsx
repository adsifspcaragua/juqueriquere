import { useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { db, type TrilhaDB, type ImagemDB } from "../../../lib/dexie";
import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import DraggableCarousel from "../../../components/ui/DraggableCarousel";
import AutoResizeTextarea from "../../../utils/AutoResizeTextarea.tsx";
import { convertToWebPBase64 } from "../../../utils/imageConverter.ts";

export default function CadastrarTrilha() {
    const formRef = useRef<HTMLFormElement>(null);
    const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([]);
    const [imagensBase64, setImagensBase64] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(false);
    
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

    // Função para remover uma imagem específica
    function handleRemoveImage(indexToRemove: number) {
        setImagensSelecionadas((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setImagensBase64((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);

        try {
            const formData = new FormData(e.currentTarget);

            const dadosTrilhaSupabase = {
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

            const { data: novaTrilha, error: erroTrilha } = await supabase
                .from("trilhas")
                .insert(dadosTrilhaSupabase)
                .select()
                .single();

            if (erroTrilha) throw erroTrilha;

            const trilhaParaDexie: TrilhaDB = {
                ...novaTrilha,
                pontos_interesse: [],
                ramais: [],
                pontos_no_mapa: []
            };
            await db.trilhas.put(trilhaParaDexie);

            if (imagensSelecionadas.length > 0) {
                const promessasImagens = imagensSelecionadas.map(async (file, index) => {
                    const stringWebPBase64 = await convertToWebPBase64(file, 0.8);
                    return {
                        trilha_id: novaTrilha.id,
                        ponto_interesse_id: null,
                        caminho_arquivo: stringWebPBase64,
                        legenda: `Imagem ${index + 1} da trilha ${novaTrilha.nome}`
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

            alert("Trilha e imagens cadastradas com sucesso!");
            formRef.current?.reset();
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
                <SimpleButton path="/admin/trilhas" type="back" icon="setaBack">
                    Voltar
                </SimpleButton>

                <h1>Cadastrar Trilha</h1>

                <form ref={formRef} className="card form vertical gap15" onSubmit={handleSubmit}>
                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input name="nome" placeholder="Ex: Trilha da Capivara" required disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Cor:</label>
                        <input name="cor_identificacao" placeholder="Ex: Verde" disabled={carregando} />
                    </div>

                    <div className="horizontal gap15">
                        <div className="vertical gap5">
                            <label>Dificuldade:</label>
                            <select name="dificuldade" disabled={carregando}>
                                <option>Fácil</option>
                                <option>Moderada</option>
                                <option>Difícil</option>
                            </select>
                        </div>

                        <div className="vertical gap5">
                            <label>Extensão:</label>
                            <input name="extensao" placeholder="Ex: 2,5 km" disabled={carregando} />
                        </div>

                        <div className="vertical gap5">
                            <label>Duração:</label>
                            <input name="duracao" placeholder="Ex: 1h 30min" disabled={carregando} />
                        </div>
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição curta:</label>
                        <AutoResizeTextarea name="descricao_curta" placeholder="Resumo da trilha em poucas palavras..." disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        <AutoResizeTextarea name="descricao" placeholder="Descreva o percurso..." disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Equipamento recomendado:</label>
                        <AutoResizeTextarea name="equipamento_recomendado" placeholder="Ex: Calçado adequado..." disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Atenção:</label>
                        <AutoResizeTextarea name="atencao" placeholder="Ex: Trechos íngremes..." disabled={carregando} />
                    </div>

                    <div className="vertical gap15">
                        <div className="vertical gap5" id="file">
                            <label>Imagens da Trilha:</label>
                            <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={carregando} />
                        </div>

                        {imagensSelecionadas.length > 0 && (
                            <div className="vertical gap5">
                                <p><strong>{imagensSelecionadas.length} imagem(ns) selecionada(s):</strong></p>
                                <DraggableCarousel
                                    items={imagensSelecionadas.map((file, idx) => (
                                        <div key={idx} className="uploadPreview vertical gap5 carrosselCard">
                                            
                                            <img src={imagensBase64[idx]} alt={file.name} />
                                            
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

                    <div className="btnFull">
                        <button type="submit" disabled={carregando}>
                            {carregando ? "Cadastrando..." : "Cadastrar trilha"}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}