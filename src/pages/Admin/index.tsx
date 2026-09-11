import SimpleButton from "../../components/ui/buttons/SimpleButton";
import '../_styles/admin.css'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import ProtectedRoute from "../../components/Protected";
import { logout } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import defaultPfp from '../../assets/avatar.jpg';



export default function Admin() {
    const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
    const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
    const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);
    const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        buscarUsuario();
        // pega sessão inicial
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });

        // escuta mudanças (LOGIN / LOGOUT)
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    async function buscarUsuario() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
            .from("usuarios")
            .select("tipo, name, foto_url, login")
            .eq("auth_id", user.id)
            .single();

        if (error) {
            console.error("Erro ao buscar usuário:", error);
            return;
        }

        setTipoUsuario(data.tipo);
        setNomeUsuario(data.name);
        setFotoUsuario(data.foto_url);
        setEmailUsuario(data.login);
    }

    async function handleLogout() {
            await logout();
    
            if (location.pathname.startsWith('/admin')) {
                navigate('/admin/login');
            }
        }


    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>
            <section className="conteudo vertical gap30 desktopWrap3" id="adminHome">

                <div className="vertical gap30">
                    <div className="vertical gap5">
                        <h1>Administração do Site</h1>
                        <p>Gerencie conteúdos, trilhas, pontos de interesse, alertas e demais informações do Catálogo Digital PNMJ. Mantenha os dados atualizados para oferecer aos visitantes uma experiência informativa, acessível e segura.</p>
                    </div>
                    <div className="vertical gap15">
                        <h3>Olá, {nomeUsuario}!</h3>
                        <div className="horizontal center card userCard">
                                <img src={fotoUsuario || defaultPfp} alt="Foto do usuário" className="userImg" />
                                <div className="vertical w100 left gap15">
                                    <div className="vertical left gap5 w100">
                                        <div className="vertical">
                                            <h2>{nomeUsuario || "Carregando..."}</h2>
                                            <p>{tipoUsuario || "Carregando..."}</p>
                                        </div>
                                        <div className="linhaHorizontalDark"/>
                                        <p>{emailUsuario || "Carregando..."}</p>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>

                <div className="gap15 desktopWrap">
                    <div className="card vertical gap5">
                        <h2>Trilhas</h2>
                        <p>Cadastre, edite e organize as trilhas do parque, mantendo informações como descrição, dificuldade, distância e duração sempre atualizadas.</p>
                        <SimpleButton path="/admin/trilhas" tema="dark" raio="10">Gerenciar Trilhas</SimpleButton>
                    </div>

                    <div className="card vertical gap5">
                        <h2>Pontos de Interesse</h2>
                        <p>Administre os pontos de interesse disponíveis no catálogo, incluindo informações, imagens e conteúdos educativos para os visitantes.</p>
                        <SimpleButton path="/admin/pontos" tema="dark" raio="10">Gerenciar Pontos de Interesse</SimpleButton>
                    </div>

                    <div className="card vertical gap5">
                        <h2>Sobre o Parque</h2>
                        <p>Atualize as informações do parque, garantindo que os visitantes tenham acesso a conteúdos claros e relevantes sobre a plataforma.</p>
                        <SimpleButton path="/admin/sobre" tema="dark" raio="10">Gerenciar Informações</SimpleButton>
                    </div>
                    {tipoUsuario === "MASTER" && (
                        <div className="card vertical gap5">
                            <h2>Usuários</h2>
                            <p>Gerencie as contas administrativas do sistema, permitindo adicionar, editar ou remover usuários e controlar seus acessos e contribuições.</p>
                            <SimpleButton path="/admin/usuario/list" tema="dark" raio="10">Gerenciar Informações</SimpleButton>
                        </div>
                    )}
                </div>
                <div className="card vertical gap15 btnFull outrasOpcoes">
                    <h4>Outras opções:</h4>
                    <div className="vertical gap5">
                        <SimpleButton
                            path="/admin/minha-conta"
                            raio="10"
                            tema="light"
                        >
                            Gerenciar conta
                        </SimpleButton>
                        {user ? (
                            <SimpleButton tema="red" icon="logout" raio="10" onClick={handleLogout}>
                                Sair
                            </SimpleButton>
                        ) : (
                            null
                        )}
                    </div>
                </div>
            </section>
        </ProtectedRoute>
    );
}