import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "../../../components/Protected";
import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import { signUp } from "../../../lib/auth";
import { createRecord } from "../../../lib/services/crud";
import "../../_styles/admin.css";

interface UsuarioInput {
    auth_id: string;
    login: string;
    tipo: "MASTER" | "ADMIN";
}

export default function CadastrarUsuario() {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [tipo, setTipo] = useState<"MASTER" | "ADMIN">("ADMIN");

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    async function cadastrarUsuario(e: React.FormEvent) {
        e.preventDefault();

        setErro("");
        setCarregando(true);

        try {
            // 1. Cria a conta no Supabase Auth
            const { data, error: authError } = await signUp(login, senha);

            if (authError) throw authError;

            if (!data.user) {
                throw new Error("Não foi possível criar a conta de autenticação.");
            }

            // 2. Insere os dados na tabela 'usuarios' usando o serviço de CRUD
            await createRecord<UsuarioInput>("usuarios", {
                auth_id: data.user.id,
                login,
                tipo,
            });

            alert("Usuário cadastrado com sucesso!");
            navigate("/admin/usuario/list");
        } catch (error: unknown) {
            console.error("Erro ao cadastrar usuário:", error);
            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Erro ao cadastrar usuário.");
            }
        } finally {
            setCarregando(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>
            <section className="vertical gap15" id="loginPage">
                <SimpleButton type="back" icon="setaBack" path="/admin/usuario/list">
                    Voltar
                </SimpleButton>
                <div className="vertical gap15 container card">
                    <h1>Cadastrar Usuário</h1>

                    <form onSubmit={cadastrarUsuario} className="vertical gap15">
                        <div className="vertical gap5">
                            <label>Login / E-mail</label>
                            <input
                                type="email"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                required
                            />
                        </div>

                        <div className="vertical gap5">
                            <label>Senha</label>
                            <input
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="horizontal gap15 center">
                            <label>Tipo de usuário:</label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value as "MASTER" | "ADMIN")}
                            >
                                <option value="ADMIN">Administrador</option>
                                <option value="MASTER">Master</option>
                            </select>
                        </div>

                        {erro && <p style={{ color: "red" }}>{erro}</p>}

                        <div className="vertical gap5">
                            <button type="submit" disabled={carregando} className="r10">
                                {carregando ? "Cadastrando..." : "Cadastrar Usuário"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/admin/usuario/list")}
                                className="btnCancel r10"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </ProtectedRoute>
    );
}