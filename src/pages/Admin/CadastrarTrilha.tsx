import { supabase } from "../../lib/supabase";
import { db } from "../../lib/dexie";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import { useRef } from "react";

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
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Cor:
                        </label>

                        <input
                            name="cor_identificacao"
                        />

                    </div>

                    <div className="horizontal gap15">

                        <div>

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

                        <div>

                            <label>
                                Extensão:
                            </label>

                            <input
                                name="extensao"
                            />

                        </div>

                        <div>

                            <label>
                                Duração:
                            </label>

                            <input
                                name="duracao"
                            />

                        </div>

                    </div>

                    <label>
                        Descrição curta:
                    </label>

                    <textarea
                        name="descricao_curta"
                    />

                    <label>
                        Descrição:
                    </label>

                    <textarea
                        name="descricao"
                        rows={8}
                    />

                    <label>
                        Equipamento recomendado:
                    </label>

                    <textarea
                        name="equipamento_recomendado"
                    />

                    <label>
                        Atenção:
                    </label>

                    <textarea
                        name="atencao"
                    />

                    <button type="submit">
                        Cadastrar
                    </button>

                </form>

            </section>

        </>

    );
}