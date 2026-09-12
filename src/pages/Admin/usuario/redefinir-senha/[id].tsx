import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SimpleButton from "../../../../components/ui/buttons/SimpleButton";
import ProtectedRoute from "../../../../components/Protected";
import { getCurrentUserProfile, type LoggedUserProfile } from "../../../../lib/auth";
import { getById } from "../../../../lib/services/crud";
import { supabase } from "../../../../lib/supabase";
import "../../../_styles/admin.css";
import defaultPfp from '../../../../assets/avatar.jpg';

interface Usuario {
    id: number;
    auth_id: string;
    name: string;
    login: string;
    tipo: "MASTER" | "ADMIN";
    foto_url?: string | null;
}

export default function RedefinirSenha() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [currentUser, setCurrentUser] = useState<LoggedUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregandoForm, setCarregandoForm] = useState(false);
    const [erro, setErro] = useState("");

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
                console.error("Erro ao carregar dados:", err);
            } finally {
                setLoading(false);
            }
        }

        carregarDados();
    }, [id]);

    // Permissão: MASTER ou o próprio usuário logado
    const ehProprioUsuario = currentUser && usuario && currentUser.auth_id === usuario.auth_id;
    const ehMaster = currentUser?.tipo === "MASTER";
    const temPermissao = ehMaster || ehProprioUsuario;

    async function handleRedefinirSenha(e: React.FormEvent) {
        e.preventDefault();
        setErro("");

        if (novaSenha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        if (novaSenha.length < 6) {
            setErro("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (!usuario) return;

        setCarregandoForm(true);

        try {
            if (ehProprioUsuario) {
                // O próprio usuário altera a senha via sessão ativa
                const { error } = await supabase.auth.updateUser({ password: novaSenha });
                if (error) throw error;
            } else if (ehMaster) {
                // O usuário MASTER altera a senha de outro chamando a função de banco (RPC)
                const { error } = await supabase.rpc("admin_redefinir_senha", {
                    target_auth_id: usuario.auth_id,
                    nova_senha: novaSenha,
                });
                if (error) throw error;
            }

            alert("Senha redefinida com sucesso!");
            navigate(`/admin/usuario/${usuario.id}`);
        } catch (error: unknown) {
            console.error("Erro ao redefinir senha:", error);
            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Erro ao redefinir senha.");
            }
        } finally {
            setCarregandoForm(false);
        }
    }
    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap30">
                <div className="vertical gap15">
                    <SimpleButton type="back" icon="setaBack" path={id ? `/admin/usuario/${id}` : "/admin/usuario/list"}>
                        Voltar para Perfil
                    </SimpleButton>

                    <div className="card vertical userCard desktopWrap center">
                        {loading ? (
                            <p>Carregando dados do usuário...</p>
                        ) : !usuario ? (
                            <p>Usuário não encontrado.</p>
                        ) : !temPermissao ? (
                            <p style={{ color: "red" }}>
                                Você não tem permissão para redefinir a senha deste usuário.
                            </p>
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
                                        </div>
                                    </div>
                                </div>

                                <div className="linhaHorizontalDark"></div>

                                <form onSubmit={handleRedefinirSenha} className="vertical gap15 w100">
                                    <h3>Redefinir Senha</h3>

                                    <div className="vertical gap5">
                                        <label>Nova Senha</label>
                                        <input
                                            type="password"
                                            value={novaSenha}
                                            onChange={(e) => setNovaSenha(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <div className="vertical gap5">
                                        <label>Confirmar Nova Senha</label>
                                        <input
                                            type="password"
                                            value={confirmarSenha}
                                            onChange={(e) => setConfirmarSenha(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    {erro && <p style={{ color: "red" }}>{erro}</p>}

                                    <div className="vertical gap5">
                                        <button type="submit" disabled={carregandoForm} className="r10">
                                            {carregandoForm ? "Salvando..." : "Redefinir Senha"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/admin/usuario/${usuario.id}`)}
                                            className="btnCancel r10"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </ProtectedRoute>
    );
}