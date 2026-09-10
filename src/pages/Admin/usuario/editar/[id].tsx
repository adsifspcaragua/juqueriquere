import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import SimpleButton from "../../../../components/ui/buttons/SimpleButton";
import "../../../_styles/admin.css";
import ProtectedRoute from "../../../../components/Protected";
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
                
                    {
                        loading ? (
                            <>
                                <SimpleButton type="back" icon="setaBack" path={`/admin/usuario/list}`}>Voltar para Usuarios</SimpleButton>
                                <p>Carregando usuário...</p>
                            </>
                        ) : !usuario ? (
                            
                            <p>Usuário não encontrado.</p>
                        )
                        :
                        <>
                            <div className="vertical gap15">
                                <SimpleButton type="back" icon="setaBack" path={`/admin/usuario/${usuario.id}`}>Voltar para {usuario.name}</SimpleButton>
                                <div className="vertical gap5">
                                    <h1>Editar usuário: {usuario.name}</h1>
                                    <p>Gerencie as informações da conta de forma simples e segura. Atualize o nome, foto de perfil, dados de acesso, senha e chaves de acesso, mantendo as informações sempre atualizadas e protegidas.</p>
                                </div>
                            </div>
                        </>
                    }
                    
                

                <div className="linhaPontilhadaLight"/>

                <div className="card vertical gap15">
                    {loading ? (
                        <>
                    
                        </>
                    ):(
                        <>
                            <h3>Foto de perfil</h3>
                            <div className="horizontal gap15">
                                <img src="#" alt="Foto do usuário" className="userImg" />
                                <div className="vertical gap5">
                                    <SimpleButton tema="dark" raio="10"> Carregar imagem</SimpleButton>
                                    <SimpleButton tema="red" raio="10"> Remover imagem</SimpleButton>
                                </div>
                            </div>
                        
                        </>
                    )}
                    
                </div>

                {/*
                <div className="card vertical gap5 userCard">
                    {usuario ? 
                        <>
                            <div className="horizontal justify center gap15">
                                <h1>{usuario.name}</h1> 
                            </div>
                            <div>
                            <p>
                                e-mail: {usuario.login}
                            </p>
                            <p>
                                Data da criação: {new Date(usuario.criado_em as string).toLocaleDateString("pt-BR")}.
                            </p>
                            </div>
                        </>
                        : 
                        <></>
                    }
                    
                </div>

                <div className="vertical card gap15">
                    <div className="horizontal justify center">
                        
                    </div>

                    {loading ? (
                        <p>Carregando usuário...</p>
                    ) : !usuario ? (
                        <p>Usuário não encontrado.</p>
                    ) : (
                        <div className="vertical gap5"> 
                        </div>
                    )}
                </div>
                */}

            </section>
            </ProtectedRoute>
        </>
    );
}
