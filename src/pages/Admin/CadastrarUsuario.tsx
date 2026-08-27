import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function CadastrarUsuario() {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [tipo, setTipo] = useState("ADMIN");

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    async function cadastrarUsuario(
        e: React.FormEvent
    ) {
        e.preventDefault();

        setErro("");
        setCarregando(true);

        try {
            const { data, error: authError } =
                await supabase.auth.signUp({
                    email: `${login}`,
                    password: senha
                });

            if (authError) {
                throw authError;
            }

            if (!data.user) {
                throw new Error(
                    "Não foi possível criar o usuário."
                );
            }

            const { error: dbError } = await supabase
                .from("usuarios")
                .insert({
                    auth_id: data.user.id,
                    login: login,
                    tipo: tipo
                });

            if (dbError) {
                throw dbError;
            }

            alert("Usuário cadastrado com sucesso!");

            navigate("/admin/usuarios");

        } catch (error: any) {
            console.error(error);

            setErro(
                error.message ||
                "Erro ao cadastrar usuário."
            );

        } finally {
            setCarregando(false);
        }
    }

    return (
        <section className="vertical gap15" id="loginPage">

            <div className="container">
                <h1>Cadastrar Usuário</h1>

                <form onSubmit={cadastrarUsuario}>

                    <div>
                        <label>Login</label>

                        <input
                            type="text"
                            value={login}
                            onChange={(e) =>
                                setLogin(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label>Senha</label>

                        <input
                            type="password"
                            value={senha}
                            onChange={(e) =>
                                setSenha(e.target.value)
                            }
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label>Tipo de usuário</label>

                        <select
                            value={tipo}
                            onChange={(e) =>
                                setTipo(e.target.value)
                            }
                        >
                            <option value="ADMIN">
                                Administrador
                            </option>

                            <option value="MASTER">
                                Master
                            </option>
                        </select>
                    </div>

                    {erro && (
                        <p style={{ color: "red" }}>
                            {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                    >
                        {carregando
                            ? "Cadastrando..."
                            : "Cadastrar Usuário"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/usuarios")
                        }
                    >
                        Cancelar
                    </button>

                </form>
            </div>
            </section>
            );
}