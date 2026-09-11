import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import '../_styles/admin.css';
import ProtectedRoute from "../../components/Protected";
import { logout } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import defaultPfp from '../../assets/avatar.jpg';

interface Usuario {
    id: number;
    name: string;
    login: string;
    tipo: string;
    foto_url?: string | null;
}

export default function MinhaConta() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        carregarDadosUsuario();
    }, []);

    async function carregarDadosUsuario() {
        setLoading(true);
        try {
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

            if (authError || !authUser) {
                throw new Error("Usuário não autenticado");
            }

            const { data, error } = await supabase
                .from("usuarios")
                .select("id, name, login, tipo, foto_url")
                .eq("auth_id", authUser.id)
                .single();

            if (error) throw error;

            setUsuario(data);
        } catch (err) {
            console.error("Erro ao carregar dados da conta:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await logout();
        navigate('/admin/login');
    }

    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>
            <section className="conteudo vertical gap30 desktopWrap1-2" id="minhaConta">
                {loading ? (
                    <>
                        <SimpleButton type="back" icon="setaBack" path="/admin">
                            Voltar para o Painel
                        </SimpleButton>
                        <p>Carregando dados da conta...</p>
                    </>
                ) : !usuario ? (
                    <>
                        <SimpleButton type="back" icon="setaBack" path="/admin">
                            Voltar para o Painel
                        </SimpleButton>
                        <p>Não foi possível carregar os dados da sua conta.</p>
                    </>
                ) : (
                    <>
                        <div className="vertical gap15 ">
                            <SimpleButton type="back" icon="setaBack" path="/admin">
                                Voltar para o Painel
                            </SimpleButton>
                            
                            <div className="vertical gap5">
                                <h1>Minha Conta</h1>
                                <p>Visualize suas informações de perfil e credenciais de acesso ao painel de administração.</p>
                            </div>

                            <div className="vertical card userCard gap15">
                                <div className="horizontal center gap15">
                                    <img src={usuario.foto_url || defaultPfp} className="userImg" alt="Foto de perfil do usuário" />
                                    <div className="vertical">
                                        <h2>{usuario.name}</h2>
                                        <p>{usuario.tipo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="vertical gap30">
                            <div className="card vertical gap15 btnFull">
                                <h4>Informações Pessoais:</h4>
                                <div className="vertical gap5">
                                    <h5>Nome:</h5>
                                    <p>{usuario.name}</p>
                                </div>
                                <div className="vertical gap5">
                                    <h5>E-mail (Login):</h5>
                                    <p>{usuario.login}</p>
                                </div>
                                <div className="vertical gap5">
                                    <h5>Nível de Permissão:</h5>
                                    <p>{usuario.tipo}</p>
                                </div>
                                <SimpleButton path={`/admin/usuario/editar/${usuario.id}`} tema="dark" raio="10">
                                        Editar Minha Conta
                                </SimpleButton>
                            </div>
                            {/* Encerramento de Sessão */}
                            <div className="card vertical gap15 btnFull">
                                <h4>Sessão:</h4>
                                <p>Deseja encerrar sua sessão atual neste dispositivo?</p>
                                <div>
                                    <SimpleButton tema="red" raio="10" onClick={handleLogout}>
                                        Sair da minha conta
                                    </SimpleButton>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </ProtectedRoute>
    );
}