import { useEffect, useState } from "react";
import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import ProtectedRoute from "../../../components/Protected";
import { getAll } from "../../../lib/services/crud";
import "../../_styles/admin.css";

interface Usuario {
    id: number;
    name: string;
    login: string;
    tipo: "MASTER" | "ADMIN";
    criado_em?: string;
}

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        buscarUsuarios();
    }, []);

    async function buscarUsuarios() {
        setLoading(true);

        try {
            const data = await getAll<Usuario>(
                "usuarios",
                "id, name, login, tipo, criado_em",
                "id",
                true
            );
            setUsuarios(data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap30">
                <div className="vertical gap15">
                    <SimpleButton type="back" icon="setaBack" path="/admin/">
                        Voltar
                    </SimpleButton>
                    <div className="card vertical gap5 adminCard" id="adminTrilhasCard">
                        <h1>Usuários</h1>
                        <p>Gerencie os usuários administradores do sistema.</p>
                    </div>
                </div>

                <div className="vertical card gap15">
                    <div className="horizontal justify center">
                        <h2>todos</h2>
                        <SimpleButton
                            path="/admin/usuario/cadastrar"
                            tema="dark"
                            raio="10"
                            icon="PlusDark"
                        >
                            Cadastrar Usuário
                        </SimpleButton>
                    </div>

                    {loading ? (
                        <p>Carregando usuários...</p>
                    ) : usuarios.length === 0 ? (
                        <p>Nenhum usuário encontrado.</p>
                    ) : (
                        <div className="listaUsuarios vertical gap5">
                            {usuarios.map((usuario) => (
                                <div
                                    className="card vertical gap5 userListCard"
                                    key={usuario.id}
                                >
                                    <div className="horizontal center justify">
                                        <h3>{usuario.name}</h3>
                                        <SimpleButton
                                            path={`/admin/usuario/${usuario.id}`}
                                            raio="10"
                                        >
                                            Detalhes
                                        </SimpleButton>
                                    </div>
                                    <p>
                                        <strong>Login:</strong> {usuario.login}
                                    </p>
                                    <p>
                                        <strong>Tipo:</strong> {usuario.tipo}
                                    </p>
                                    {usuario.criado_em && (
                                        <p>
                                            <strong>Criado em:</strong>{" "}
                                            {new Date(
                                                usuario.criado_em
                                            ).toLocaleDateString("pt-BR")}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </ProtectedRoute>
    );
}