import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import ProtectedRoute from "../../../components/Protected";
import "../../_styles/admin.css";
import "../../../style.css";

interface LinksDB {
    id: number;
    created_at: string;
    Instagram: string | null;
    Whatsapp: string | null;
    email: string | null;
}

export default function AdminLinks() {
    const [links, setLinks] = useState<LinksDB | null>(null);

    const [instagram, setInstagram] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [email, setEmail] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarLinks();
    }, []);

    async function carregarLinks() {
        setCarregando(true);
        setErro("");

        const { data, error } = await supabase
            .from("links")
            .select("*")
            .order("id", { ascending: true })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("ERRO AO CARREGAR LINKS:", error);

            setErro(
                `Erro ao carregar os links: ${error.message}`
            );

            setCarregando(false);
            return;
        }

        console.log("REGISTRO LINKS:", data);

        if (data) {
            const registro = data as LinksDB;

            setLinks(registro);

            setInstagram(
                registro.Instagram ?? ""
            );

            setWhatsapp(
                registro.Whatsapp?.trim() ?? ""
            );

            setEmail(
                registro.email ?? ""
            );
        } else {
            setErro(
                "Nenhum registro foi encontrado na tabela links."
            );
        }

        setCarregando(false);
    }

    async function salvarLinks(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSalvando(true);
        setMensagem("");
        setErro("");

        if (!links) {
            setErro(
                "Não existe nenhum registro para alterar."
            );

            setSalvando(false);
            return;
        }

        const novosDados = {
            Instagram: instagram.trim(),
            Whatsapp: whatsapp.trim(),
            email: email.trim(),
        };

        console.log(
            "TENTANDO ATUALIZAR:",
            novosDados
        );

        console.log(
            "ID DO REGISTRO:",
            links.id
        );

        try {
            const { data, error } = await supabase
                .from("links")
                .update(novosDados)
                .eq("id", links.id)
                .select("*")
                .maybeSingle();

            if (error) {
                console.error(
                    "ERRO AO ATUALIZAR LINKS:",
                    error
                );

                setErro(
                    `Erro ao salvar: ${error.message}`
                );

                setSalvando(false);
                return;
            }

            console.log(
                "RESULTADO DO UPDATE:",
                data
            );

            /*
             * Se não voltou nenhum registro,
             * provavelmente o UPDATE não teve
             * permissão pelo RLS.
             */
            if (!data) {
                setErro(
                    "O Supabase não retornou o registro atualizado. Verifique as políticas RLS da tabela links."
                );

                setSalvando(false);
                return;
            }

            const registroAtualizado =
                data as LinksDB;

            setLinks(registroAtualizado);

            setInstagram(
                registroAtualizado.Instagram ?? ""
            );

            setWhatsapp(
                registroAtualizado.Whatsapp?.trim() ?? ""
            );

            setEmail(
                registroAtualizado.email ?? ""
            );

            setMensagem(
                "Links atualizados com sucesso!"
            );
        } catch (error) {
            console.error(
                "ERRO INESPERADO:",
                error
            );

            setErro(
                "Ocorreu um erro inesperado ao salvar."
            );
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <ProtectedRoute>
                <div className="paddingHeader2"></div>

                <section className="conteudo vertical gap30">
                    <h1>Links</h1>

                    <p>
                        Carregando...
                    </p>
                </section>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="paddingHeader2"></div>

            <section className="conteudo vertical gap30">

                <div className="vertical gap5">
                    <h1>Links do site</h1>

                    <p>
                        Edite os links exibidos no
                        rodapé do site.
                    </p>
                </div>

                {mensagem && (
                    <div className="card">
                        <p>{mensagem}</p>
                    </div>
                )}

                {erro && (
                    <div className="card">
                        <p>{erro}</p>
                    </div>
                )}

                {!links ? (
                    <div className="card">
                        <p>
                            Nenhum registro encontrado
                            na tabela links.
                        </p>
                    </div>
                ) : (
                    <form
                        onSubmit={salvarLinks}
                        className="vertical gap30"
                    >

                        {/* INSTAGRAM */}

                        <div className="vertical gap5">
                            <label htmlFor="instagram">
                                Instagram
                            </label>

                            <input
                                id="instagram"
                                type="text"
                                value={instagram}
                                onChange={(event) =>
                                    setInstagram(
                                        event.target.value
                                    )
                                }
                                placeholder="https://www.instagram.com/..."
                            />
                        </div>

                        {/* WHATSAPP */}

                        <div className="vertical gap5">
                            <label htmlFor="whatsapp">
                                WhatsApp
                            </label>

                            <input
                                id="whatsapp"
                                type="text"
                                value={whatsapp}
                                onChange={(event) =>
                                    setWhatsapp(
                                        event.target.value.trim()
                                    )
                                }
                                placeholder="https://wa.me/..."
                            />
                        </div>

                        {/* E-MAIL */}

                        <div className="vertical gap5">
                            <label htmlFor="email">
                                E-mail
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="email@exemplo.com"
                            />
                        </div>

                        {/* BOTÃO */}

                        <button
                            type="submit"
                            disabled={salvando}
                        >
                            {salvando
                                ? "Salvando..."
                                : "Salvar alterações"}
                        </button>

                    </form>
                )}
            </section>
        </ProtectedRoute>
    );
}