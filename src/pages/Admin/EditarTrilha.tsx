import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../lib/dexie";
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

                <form className="card form vertical gap15">

                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input defaultValue={trilha.nome}/>
                    </div>

                    <div className="vertical gap5">
                        <label>Cor:</label>
                        <input defaultValue={trilha.cor_identificacao}/>
                    </div>

                    <div className="horizontal gap15">
                        <div className="vertical gap5">
                            <label>Dificuldade:</label>
                            <select defaultValue={trilha.dificuldade}>
                                <option>Fácil</option>
                                <option>Moderada</option>
                                <option>Difícil</option>
                            </select>
                        </div>

                        <div className="vertical gap5">
                            <label>Extensão:</label>
                            <input defaultValue={trilha.extensao}/>
                        </div>

                        <div className="vertical gap5">
                            <label>Duração:</label>
                            <input defaultValue={trilha.duracao}/>
                        </div>
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição curta:</label>
                        <AutoResizeTextarea
                            defaultValue={trilha.descricao_curta}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        <AutoResizeTextarea
                            defaultValue={trilha.descricao}
                            rows={3}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Equipamento recomendado:</label>
                        <AutoResizeTextarea
                            defaultValue={trilha.equipamento_recomendado}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Atenção:</label>
                        <AutoResizeTextarea
                            defaultValue={trilha.atencao}
                        />
                    </div>

                    <div className="btnFull">
                        <SimpleButton tema="dark" icon="Save" raio="10" type="back">
                            Salvar alterações
                        </SimpleButton>
                    </div>
                </form>
            </section>
        </>
    );
}