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

            // Se o arquivo já for WebP, retorna a string Base64 diretamente
            if (file.type === "image/webp") {
                return resolve(resultBase64);
            }

            // Caso contrário, carrega a imagem em memória para conversão
            const img = new Image();
            img.src = resultBase64;

            img.onload = () => {
                // Cria um canvas com as mesmas dimensões da imagem
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("Não foi possível obter o contexto do Canvas."));

                // Desenha a imagem no canvas
                ctx.drawImage(img, 0, 0);

                // Exporta o canvas como uma string Base64 formatada em WebP
                const webpBase64 = canvas.toDataURL("image/webp", quality);
                resolve(webpBase64);
            };

            img.onerror = (error) => reject(new Error("Erro ao carregar a imagem para conversão."));
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
    const [imagemSelecionada, setImagemSelecionada] = useState<File | null>(null);
    const [carregando, setCarregando] = useState(false);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setImagemSelecionada(e.target.files[0]);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);

        try {
            const formData = new FormData(e.currentTarget);

            // 1. Criar dados apenas da tabela 'trilhas'
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

            // 2. Inserir Trilha no Supabase
            const { data: novaTrilha, error: erroTrilha } = await supabase
                .from("trilhas")
                .insert(dadosTrilhaSupabase)
                .select()
                .single();

            if (erroTrilha) throw erroTrilha;

            // Salva no banco local Dexie com as chaves vazias que a interface exige
            const trilhaParaDexie: TrilhaDB = {
                ...novaTrilha,
                pontos_interesse: [],
                ramais: [],
                pontos_no_mapa: []
            };
            await db.trilhas.put(trilhaParaDexie);

            // 3. Se houver imagem selecionada, converte para WebP e insere na tabela 'imagens'
            if (imagemSelecionada) {
                // A mágica acontece aqui: A imagem vira uma string Base64 em WebP (bem mais leve)
                const stringWebPBase64 = await convertToWebPBase64(imagemSelecionada, 0.8);

                // Monta o objeto com as colunas da sua tabela 'public.imagens'
                const dadosImagem = {
                    trilha_id: novaTrilha.id,
                    ponto_interesse_id: null,
                    caminho_arquivo: stringWebPBase64, // Armazena a string otimizada
                    legenda: `Capa da trilha ${novaTrilha.nome}`
                };

                // Insere o registro na tabela de imagens do Supabase
                const { data: novaImagem, error: erroImagem } = await supabase
                    .from("imagens")
                    .insert(dadosImagem)
                    .select()
                    .single();

                if (erroImagem) throw erroImagem;

                // Salva a imagem na tabela local correspondente do Dexie
                await db.imagens.put(novaImagem as ImagemDB);
            }

            alert("Trilha cadastrada e imagem otimizada para WebP com sucesso!");
            formRef.current?.reset();
            setImagemSelecionada(null);

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

                    <div className="vertical gap5">
                        <label>Imagem de Capa da Trilha:</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            disabled={carregando}
                        />
                        {imagemSelecionada && (
                            <p style={{ fontSize: "12px", color: "gray" }}>
                                Arquivo: {imagemSelecionada.name} (será convertido e comprimido em WebP)
                            </p>
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

