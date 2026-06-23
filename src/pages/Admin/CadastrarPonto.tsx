import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { db } from "../../lib/dexie";
import SimpleButton from "../../components/ui/buttons/SimpleButton";

interface Trilha {
    id: number;
    nome: string;
}

export default function CadastrarPontoInteresse() {
    const formRef = useRef<HTMLFormElement>(null);

    const [trilhas, setTrilhas] = useState<Trilha[]>([]);
    const [trilhaSelecionada, setTrilhaSelecionada] = useState<number | null>(null);

    useEffect(() => {
        async function carregarTrilhas() {
            // Tenta carregar do Dexie primeiro
            const trilhasOffline = await db.trilhas.toArray();

            if (trilhasOffline.length > 0) {
                setTrilhas(trilhasOffline);
                return;
            }

            // Caso não existam, busca do Supabase
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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const dados = {
            trilha_id: trilhaSelecionada,
            nome: formData.get("nome") as string,
            descricao: formData.get("descricao") as string,
            planta: formData.get("planta") as string,
            caminho: formData.get("caminho") as string,
            misc: formData.get("misc") as string,
            latitude: formData.get("latitude")
                ? Number(formData.get("latitude"))
                : null,
            longitude: formData.get("longitude")
                ? Number(formData.get("longitude"))
                : null,
        };

        const { data, error } = await supabase
            .from("pontos_interesse")
            .insert(dados)
            .select()
            .single();

        if (error) {
            console.error(error);
            alert("Erro ao cadastrar o ponto de interesse.");
            return;
        }

        await db.pontos_interesse.put(data);

        alert("Ponto de interesse cadastrado com sucesso!");
        formRef.current?.reset();
        setTrilhaSelecionada(null);
    }

    return (
        <>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">
                <SimpleButton
                    path="/admin/pontos-interesse"
                    type="back"
                    icon="setaBack"
                >
                    Voltar
                </SimpleButton>

                <h1>Cadastrar Ponto de Interesse</h1>

                <form
                    ref={formRef}
                    className="card form vertical gap15"
                    onSubmit={handleSubmit}
                >
                    <div className="vertical gap5">
                        <label>Trilha:</label>

                        {trilhas.map((trilha) => (
                            <label
                                key={trilha.id}
                                className="horizontal gap5"
                            >
                                <input
                                    type="radio"
                                    name="trilha"
                                    checked={trilhaSelecionada === trilha.id}
                                    onChange={() =>
                                        setTrilhaSelecionada(trilha.id)
                                    }
                                />
                                {trilha.nome}
                            </label>
                        ))}
                        <label className="horizontal gap5">
                            <input
                                type="radio"
                                name="trilha"
                                checked={trilhaSelecionada === null}

                            />
                             Ponto não pertence a nenhuma trilha
                        </label>

                    </div>

                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input name="nome" required />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        <textarea name="descricao" />
                    </div>



                    <div className="horizontal gap15">
                        <div>
                            <label>Latitude:</label>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                            />
                        </div>

                        <div>
                            <label>Longitude:</label>
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                            />
                        </div>
                    </div>

                    <button type="submit">
                        Cadastrar
                    </button>
                </form>
            </section>
        </>
    );
}