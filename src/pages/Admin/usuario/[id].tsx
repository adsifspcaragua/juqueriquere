import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import ProtectedRoute from "../../../components/Protected";
import { getCurrentUserProfile, type LoggedUserProfile } from "../../../lib/auth";
import { deleteRecord, getById } from "../../../lib/services/crud";
import "../../_styles/admin.css";
import defaultPfp from '../../../assets/avatar.jpg';

interface Usuario {
    id: number;
    name: string;
    login: string;
    tipo: "MASTER" | "ADMIN";
    foto_url?: string | null;
    criado_em?: string;
}

export default function Usuario() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [currentUser, setCurrentUser] = useState<LoggedUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregarDados() {
            setLoading(true);
            try {
                const perfilLogado = await getCurrentUserProfile();
                setCurrentUser(perfilLogado);

                if (id) {
                    const data = await getById<Usuario>("usuarios", id);
                    setUsuario(data);
                }
            } catch (err) {
                console.error("Erro inesperado ao buscar usuário:", err);
            } finally {
                setLoading(false);
            }
        }

        carregarDados();
    }, [id]);

    async function handleExcluir() {
        if (!id || !usuario) return;

        const confirmacao = window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.name}"?`);
        if (!confirmacao) return;

        try {
            await deleteRecord("usuarios", id);
            alert("Usuário excluído com sucesso!");
            navigate("/admin/usuario/list");
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            alert("Erro ao excluir usuário.");
        }
    }

    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap30">
                <div className="vertical gap15">
                    <SimpleButton type="back" icon="setaBack" path="/admin/usuario/list">
                        Voltar para Usuários
                    </SimpleButton>

                    <div className="card vertical userCard desktopWrap center">
                        {loading ? (
                            <p>Carregando dados do usuário...</p>
                        ) : !usuario ? (
                            <p>Usuário não encontrado.</p>
                        ) : (
                            <>
                                <div className="horizontal gap15 center">
                                    <img
                                        src={usuario.foto_url || defaultPfp}
                                        alt={`Foto de ${usuario.name}`}
                                        className="userImg"
                                    />
                                    <div className="vertical left gap5 w100">
                                        <div className="vertical left">
                                            <h1>{usuario.name}</h1>
                                            <p>{usuario.tipo}</p>
                                        </div>
                                        <div className="linhaHorizontalDark"></div>
                                        <div className="vertical">
                                            <div className="horizontal gap5">
                                                <h5>E-mail:</h5>
                                                <p>{usuario.login}</p>
                                            </div>
                                            <div className="horizontal gap5">
                                                <h5>Criado em: </h5>
                                                <p>{usuario.criado_em ? new Date(usuario.criado_em).toLocaleDateString("pt-BR") : "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="horizontal gap5 HtoV">
                                    <SimpleButton tema="dark" raio="10" path={`/admin/usuario/editar/${usuario.id}`}>
                                        Editar conta
                                    </SimpleButton>
                                
                                    {currentUser?.tipo === "MASTER" && (
                                        <SimpleButton tema="red" raio="10" onClick={handleExcluir}>
                                            Excluir usuário
                                        </SimpleButton>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {!loading && usuario && (
                    <div className="vertical card gap15">
                        <h4>Contribuições do usuário:</h4>
                        <div className="vertical gap5">
                            <p>Em breve...</p>
                        </div>
                    </div>
                )}
            </section>
        </ProtectedRoute>
    );
}