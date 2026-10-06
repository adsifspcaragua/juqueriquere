import SimpleButton from "../../components/ui/buttons/SimpleButton";
import '../_styles/admin.css'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import ProtectedRoute from "../../components/Protected";
import { logout } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import defaultPfp from '../../assets/avatar.jpg';
import { TextSkeleton } from "../../components/ui/PageSkeleton";

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
            <section className="conteudo vertical gap30 desktopWrap1-2" id="adminHome">

                <div className="vertical gap30">
                    <div className="vertical gap5">
                        <h1>Administração do Site</h1>
                        <p>Gerencie os conteúdos do Catálogo Digital PNMJ e mantenha
                             as informações do parque sempre atualizadas.</p>
                    </div>

                    <div className="card vertical gap15">
                        <div className="horizontal center userCard gap15">
                            <img src={fotoUsuario || defaultPfp} alt="Foto do usuário" className="userImg" />
                            <div className="vertical w100 left gap15">
                                <div className="vertical left gap5 w100">
                                    <div className="vertical">
                                        <h2 style={{width:"100%"}}>{nomeUsuario || <TextSkeleton lines={1}/>}</h2>
                                        <p style={{width:"100%"}}>{tipoUsuario || <TextSkeleton lines={1}/>}</p>
                                    </div>
                                    <div className="linhaHorizontalDark" />
                                    <p style={{width:"100%", textAlign:"left"}}>{emailUsuario || <TextSkeleton lines={1}/>}</p>
                                </div>
                            </div>
                        </div>
                        <div className="vertical gap5">
                        <h4>Opções da conta:</h4>
                    </div>
                    <div className="horizontal gap5">
                        {user ? (
                            <SimpleButton tema="red" icon="logout" raio="10" type="back" onClick={handleLogout}>
                                Sair
                            </SimpleButton>
                        ) : (
                            null
                        )}
                        <SimpleButton
                            path="/admin/minha-conta"
                            raio="10"
                            tema="light"
                        >
                            Gerenciar conta
                        </SimpleButton>
                    </div>

                    </div>
                </div>

                <div className="vertical gap15">
                    <div className="vertical gap5">
                        <h1>Conteúdo do site:</h1>
                        <p>Gerencie as principais informações disponibilizadas aos visitantes.</p>
                    </div>
                    <div className="gap15 desktopWrap">
                        <div className="card vertical gap15">
                            <div className="vertical gap5">
                                <h2>Trilhas</h2>
                                <p>Cadastre e atualize trilhas, descrições,
                                dificuldade, distância e duração.</p>
                            </div>
                            <SimpleButton path="/admin/trilhas" tema="dark" raio="10">Gerenciar Trilhas</SimpleButton>
                        </div>
                        <div className="card vertical gap15">
                            <div className="vertical gap5">
                                <h2>Pontos de Interesse</h2>
                                <p>Administre os pontos, imagens e conteúdos
                                educativos disponíveis no catálogo.</p>
                            </div>
                            <SimpleButton path="/admin/pontos" tema="dark" raio="10">Gerenciar Pontos de Interesse</SimpleButton>
                        </div>
                        <div className="card vertical gap15">
                            <div className="vertical gap5">
                                <h2>Sobre o Parque</h2>
                                <p>Gerencie as principais informações disponibilizadas aos visitantes.</p>
                            </div>
                            <SimpleButton path="/admin/sobre" tema="dark" raio="10">Gerenciar Informações</SimpleButton>
                        </div>
                        <div className="card vertical gap15">
                            <div className="vertical gap5">
                                <h2>Links úteis</h2>
                                <p>Gerencie os links e referências externas
                                disponibilizados aos visitantes.</p>
                            </div>
                            <SimpleButton path="/admin/links" tema="dark" raio="10">Gerenciar Informações</SimpleButton>
                        </div>
                    
                        {tipoUsuario === "MASTER" && (
                            <div className="card vertical gap15">
                                <div className="vertical gap5">
                                    <h2>Usuários</h2>
                                    <p>Gerencie as contas administrativas e
                                    suas permissões de acesso.</p>
                                </div>
                                <SimpleButton path="/admin/usuario/list" tema="dark" raio="10">Gerenciar Informações</SimpleButton>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </ProtectedRoute>
    );
}