import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import "../../_styles/admin.css";
import ProtectedRoute from "../../../components/Protected";
import { useParams } from "react-router-dom";


interface Usuario {
    id: number;
    name: string;
    login: string;
    tipo: "MASTER" | "ADMIN";
    criado_em?: string;
}

export default function Usuario() {
    const { id } = useParams<{ id: string }>();

    const [usuario, setUsuario] = useState<Usuario>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        buscarUsuario();
    }, []);

    async function buscarUsuario() {
        if (!id) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('id, name, login, tipo, criado_em')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Erro ao buscar usuário:", error);
                return;
            }

            setUsuario(data);
        } catch (err) {
            console.error("Erro inesperado:", err);
        } finally {
            setLoading(false); 
        }
    }

    return (
        <>
            <ProtectedRoute>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap30">
                <div className="vertical gap15">
                    <SimpleButton type="back" icon="setaBack" path="/admin/usuario/list">Voltar para Usuários</SimpleButton>
                    <div className="card vertical userCard">
                        {usuario ? 
                            <>
                                <div className="horizontal gap15 center">
                                    <img src="#" alt="Foto do usuário" className="userImg" />
                                    <div className="vertical left">
                                        <h1>{usuario.name}</h1>
                                        <p>{usuario.tipo}</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="horizontal gap5">
                                        <h5>E-mail:</h5>
                                        <p>{usuario.login}</p>
                                    </div>
                                    <div className="horizontal gap5">
                                        <h5>Criado em: </h5>
                                        <p>{new Date(usuario.criado_em as string).toLocaleDateString("pt-BR")}</p>
                                    </div>
                                </div>
                                <div className="linhaPontilhadaDark" />
                                <SimpleButton raio="10" path={`/admin/usuario/editar/${usuario.id}`}>Editar conta</SimpleButton>
                            </>
                            : 
                            <></>
                        }
                    </div>
                </div>

                <div className="vertical card gap15">

                    {loading ? (
                        <p>Carregando usuário...</p>
                    ) : !usuario ? (
                        <p>Usuário não encontrado.</p>
                    ) : (
                        <div className="vertical gap5">
                           <h1>Contribuições do usuário</h1>
                           <p>Em breve...</p>
                        </div>
                    )}
                </div>

            </section>
            </ProtectedRoute>
        </>
    );
}
