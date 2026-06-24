import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../lib/dexie";
import { supabase } from "../../lib/supabase";
import SimpleButton from "../../components/ui/buttons/SimpleButton";

function AutoResizeTextarea({
    defaultValue,
    rows = 1,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {

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
            rows={rows}
            defaultValue={defaultValue}
            onInput={resize}
            {...props}
        />
    );
}


export default function EditarTrilha() {

    const { id } = useParams();
    const [trilha, setTrilha] = useState<any>(null);

    useEffect(() => {
        async function load() {
            const data = await db.trilhas.get(Number(id));
            setTrilha(data);
        }

        load();
    }, [id]);

    async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
) {
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
        .update(dados)
        .eq("id", Number(id))
        .select()
        .single();

    if (error) {
        console.error(error);
        alert("Erro ao atualizar a trilha.");
        return;
    }

    await db.trilhas.put(data);
    setTrilha(data);

    alert("Trilha atualizada com sucesso!");
}

    if (!trilha) {
        return <h1>Trilha não encontrada</h1>;
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

                <h1>Editar {trilha.nome}</h1>

                <form className="card form vertical gap15"     onSubmit={handleSubmit}
>

                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input name="nome" defaultValue={trilha.nome} />
                    </div>

                    <div className="vertical gap5">
                        <label>Cor:</label>
                        <input name="cor_identificacao" defaultValue={trilha.cor_identificacao} />
                    </div>

                    <div className="horizontal gap15">
                        <div className="vertical gap5">
                            <label>Dificuldade:</label>
                            <select name="dificuldade" defaultValue={trilha.dificuldade}>
                                <option>Fácil</option>
                                <option>Moderada</option>
                                <option>Difícil</option>
                            </select>
                        </div>

                        <div className="vertical gap5">
                            <label>Extensão:</label>
                            <input name="extensao" defaultValue={trilha.extensao} />
                        </div>

                        <div className="vertical gap5">
                            <label>Duração:</label>
                            <input name="duracao" defaultValue={trilha.duracao} />
                        </div>
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição curta:</label>
                        <AutoResizeTextarea
                            name="descricao_curta"
                            defaultValue={trilha.descricao_curta}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        <AutoResizeTextarea
                            name="descricao"
                            defaultValue={trilha.descricao}
                            rows={3}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Equipamento recomendado:</label>
                        <AutoResizeTextarea
                            name="equipamento_recomendado"
                            defaultValue={trilha.equipamento_recomendado}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Atenção:</label>
                        <AutoResizeTextarea
                            name="atencao"
                            defaultValue={trilha.atencao}
                        />
                    </div>

                    <div className="btnFull">
                        <button type="submit">Editar trilha</button>
                    </div>
                </form>
            </section>
        </>
    );
}