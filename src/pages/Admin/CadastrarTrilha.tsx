import { supabase } from "../../lib/supabase";
import { db } from "../../lib/dexie";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import { useRef, useEffect } from "react";


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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const dados = {
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

        const { data, error } = await supabase
            .from("trilhas")
            .insert(dados)
            .select()
            .single();

        if (error) {
            console.error(error);
            alert("Erro ao cadastrar a trilha.");
            return;
        }

        await db.trilhas.put(data);


        alert("Trilha cadastrada com sucesso!");
        formRef.current?.reset();
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

                        <label>
                            Nome:
                        </label>

                        <input
                            name="nome"
                            placeholder="Ex: Trilha da Capivara"
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Cor:
                        </label>

                        <input
                            name="cor_identificacao"
                            placeholder="Ex: Verde"
                        />

                    </div>

                    <div className="horizontal gap15">


                        <div className="vertical gap5">

                            <label>
                                Dificuldade:
                            </label>

                            <select name="dificuldade">

                                <option>
                                    Fácil
                                </option>

                                <option>
                                    Moderada
                                </option>

                                <option>
                                    Difícil
                                </option>

                            </select>

                        </div>

                        <div className="vertical gap5">

                            <label>
                                Extensão:
                            </label>

                            <input
                                name="extensao"
                                placeholder="Ex: 2,5 km"
                            />

                        </div>

                        <div className="vertical gap5">
                            <label>
                                Duração:
                            </label>
                            <input
                                name="duracao"
                                placeholder="Ex: 1h 30min"
                            />
                        </div>
                    </div>

                    <div className="vertical gap5">

                        <label>
                            Descrição curta:
                        </label>

                        <AutoResizeTextarea
                            name="descricao_curta"
                            placeholder="Resumo da trilha em poucas palavras..."
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Descrição:
                        </label>

                        <AutoResizeTextarea
                            name="descricao"
                            rows={3}
                            placeholder="Descreva o percurso, características, paisagem e informações importantes..."
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Equipamento recomendado:
                        </label>

                        <AutoResizeTextarea
                            name="equipamento_recomendado"
                            placeholder="Ex: Calçado adequado, água, protetor solar..."
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Atenção:
                        </label>

                        <AutoResizeTextarea
                            name="atencao"
                            placeholder="Ex: Trechos íngremes, cuidado com pedras soltas..."
                        />

                    </div>

                    <div className="btnFull">
                        <SimpleButton
                            tema="dark"
                            icon="Save"
                            raio="10"
                            type="back"
                        >
                            Cadastrar trilha
                        </SimpleButton>

                    </div>
                </form>

            </section>
        </>
    );
}