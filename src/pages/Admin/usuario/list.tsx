import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import SimpleButton from "../../../components/ui/buttons/SimpleButton";
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

        const { data, error } = await supabase
            .from("usuarios")
            .select("id, name, login, tipo, criado_em")
            .order("id", { ascending: true });

        if (error) {
            console.error("Erro ao buscar usuários:", error);
            setLoading(false);
            return;
        }

        setUsuarios(data || []);
        setLoading(false);
    }

    return (
        <>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">

                <h1>Usuários</h1>

                <p>
                    Gerencie os usuários administradores do sistema.
                </p>

                <SimpleButton
                    path="/admin/usuario/cadastrar"
                    tema="dark"
                    raio="10"
                >
                    Cadastrar Usuário
                </SimpleButton>

                {loading ? (
                    <p>Carregando usuários...</p>
                ) : usuarios.length === 0 ? (
                    <p>Nenhum usuário encontrado.</p>
                ) : (
                    <div className="listaUsuarios">

                        {usuarios.map((usuario) => (
                            <div
                                className="card horizontal gap15"
                                key={usuario.id}
                            >

                                <div className="usuarioInfo">
                                    <h2>{usuario.name}</h2>

                                    <p>
                                        <strong>Login:</strong>{" "}
                                        {usuario.login}
                                    </p>

                                    <p>
                                        <strong>Tipo:</strong>{" "}
                                        {usuario.tipo}
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

                                <div className="horizontal gap5">
                                    <SimpleButton
                                        path={`/admin/usuarios/${usuario.id}`}
                                        tema="dark"
                                        raio="10"
                                    >
                                        Editar
                                    </SimpleButton>
                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>
        </>
    );
}
