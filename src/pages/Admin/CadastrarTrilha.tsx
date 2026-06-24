import { supabase } from "../../lib/supabase";
import { db, type TrilhaDB, type ImagemDB } from "../../lib/dexie";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import { useRef, useEffect, useState } from "react";


// --- FUNÇÃO PARA CONVERTER A IMAGEM EM WEBP E RETORNAR COMO BASE64 ---
function convertToWebPBase64(file: File, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);


        reader.onload = (event) => {
            const resultBase64 = event.target?.result as string;


            if (file.type === "image/webp") {
                return resolve(resultBase64);
            }


            const img = new Image();
            img.src = resultBase64;


            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;


                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("Não foi possível obter o contexto do Canvas."));


                ctx.drawImage(img, 0, 0);


                const webpBase64 = canvas.toDataURL("image/webp", quality);
                resolve(webpBase64);
            };


            img.onerror = () => reject(new Error("Erro ao carregar a imagem para conversão."));
        };
       
        reader.onerror = (error) => reject(error);
    });
}


function AutoResizeTextarea(
    props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
    const ref = useRef<HTMLTextAreaElement>(null);


    function resize() {
        const textarea = ref.current;
        if (!textarea) return;


        requestAnimationFrame(() => {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 500)}px`;
        });
    }


    useEffect(() => {
        resize();
    }, []);


    return (
        <textarea
            ref={ref}
            rows={1}
            onInput={resize}
            {...props}
        />
    );
}


export default function CadastrarTrilha() {
    const formRef = useRef<HTMLFormElement>(null);
    // 1. Mudamos o estado para suportar um array de arquivos
    const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([]);
    const [imagensBase64, setImagensBase64] = useState<string[]>([]);

    const [carregando, setCarregando] = useState(false);
    
    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const novosBase64: string[] = [];

            // O 'for...of' permite o uso de await corretamente
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


            // 2. Lógica para processar MÚLTIPLAS imagens
            if (imagensSelecionadas.length > 0) {
               
                // Mapeia o array de arquivos e cria uma promessa de conversão para cada um
                const promessasImagens = imagensSelecionadas.map(async (file, index) => {
                    const stringWebPBase64 = await convertToWebPBase64(file, 0.8);
                    return {
                        trilha_id: novaTrilha.id,
                        ponto_interesse_id: null,
                        caminho_arquivo: stringWebPBase64,
                        legenda: `Imagem ${index + 1} da trilha ${novaTrilha.nome}`
                    };
                });
                
                // Aguarda todas as imagens serem convertidas simultaneamente
                const dadosImagens = await Promise.all(promessasImagens);


                // O Supabase aceita um Array de objetos no .insert() para salvar vários de uma vez!
                const { data: novasImagens, error: erroImagens } = await supabase
                    .from("imagens")
                    .insert(dadosImagens)
                    .select();


                if (erroImagens) throw erroImagens;


                // O Dexie possui o bulkPut para salvar múltiplos registros locais de forma super rápida
                if (novasImagens) {
                    await db.imagens.bulkPut(novasImagens as ImagemDB[]);
                }
            }


            alert("Trilha e imagens cadastradas com sucesso!");
            formRef.current?.reset();
            setImagensSelecionadas([]); // Limpa o array após o sucesso


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


                <SimpleButton
                    path="/admin/trilhas"
                    type="back"
                    icon="setaBack"
                >
                    Voltar
                </SimpleButton>


                <h1>
                    Cadastrar Trilha
                </h1>


                <form
                    ref={formRef}
                    className="card form vertical gap15"
                    onSubmit={handleSubmit}
                >
                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input name="nome" placeholder="Ex: Trilha da Capivara" required />
                    </div>


                    <div className="vertical gap5">
                        <label>Cor:</label>
                        <input name="cor_identificacao" placeholder="Ex: Verde" />
                    </div>


                    <div className="horizontal gap15">
                        <div className="vertical gap5">
                            <label>Dificuldade:</label>
                            <select name="dificuldade">
                                <option>Fácil</option>
                                <option>Moderada</option>
                                <option>Difícil</option>
                            </select>
                        </div>


                        <div className="vertical gap5">
                            <label>Extensão:</label>
                            <input name="extensao" placeholder="Ex: 2,5 km" />
                        </div>


                        <div className="vertical gap5">
                            <label>Duração:</label>
                            <input name="duracao" placeholder="Ex: 1h 30min" />
                        </div>
                    </div>


                    <div className="vertical gap5">
                        <label>Descrição curta:</label>
                        <AutoResizeTextarea
                            name="descricao_curta"
                            placeholder="Resumo da trilha em poucas palavras..."
                        />
                    </div>


                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        <AutoResizeTextarea
                            name="descricao"
                            rows={3}
                            placeholder="Descreva o percurso, características, paisagem..."
                        />
                    </div>


                    <div className="vertical gap5">
                        <label>Equipamento recomendado:</label>
                        <AutoResizeTextarea
                            name="equipamento_recomendado"
                            placeholder="Ex: Calçado adequado, água, protetor solar..."
                        />
                    </div>


                    <div className="vertical gap5">
                        <label>Atenção:</label>
                        <AutoResizeTextarea
                            name="atencao"
                            placeholder="Ex: Trechos íngremes, cuidado com pedras soltas..."
                        />
                    </div>


                    {/* 3. Adicionamos o atributo 'multiple' no input */}
                    <div className="vertical gap5">
                        <label>Imagens da Trilha:</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            disabled={carregando}
                        />
                        {imagensSelecionadas.length > 0 && (
                            <div style={{ fontSize: "12px", color: "gray", marginTop: "4px" }}>
                                <p><strong>{imagensSelecionadas.length} imagem(ns) selecionada(s):</strong></p>
                                
                                    {imagensSelecionadas.map((file, index) => (
                                        <div key={index} >
                                            <h3>{file.name}</h3>
                                            <img
                                            src={`${imagensBase64[index]}`}
                                            style={{height : 200}}
                                        ></img>
                                        </div>
                                    ))}
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



