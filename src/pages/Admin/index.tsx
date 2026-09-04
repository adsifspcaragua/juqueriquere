import SimpleButton from "../../components/ui/buttons/SimpleButton";
import '../_styles/admin.css'
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import ProtectedRoute from "../../components/Protected";

export default function Admin() {
    const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
    const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);


    useEffect(() => {
        buscarUsuario();
    }, []);

    async function buscarUsuario() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
            .from("usuarios")
            .select("tipo, name")
            .eq("auth_id", user.id)
            .single();

        if (error) {
            console.error("Erro ao buscar usuário:", error);
            return;
        }

        setTipoUsuario(data.tipo);
        setNomeUsuario(data.name);
    }


    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>
            <section className="conteudo vertical gap15" id="adminHome">

                <h1>Administração do Site</h1>
                <p>Gerencie conteúdos, trilhas, pontos de interesse, alertas e demais informações do Catálogo Digital PNMJ. Mantenha os dados atualizados para oferecer aos visitantes uma experiência informativa, acessível e segura.</p>

                <section className="conteudo desktopWrap3 gap15">


                    <div className="card horizontal gap5">
                        <div>
                            <img src="#" alt="Foto do usuário" />
                        </div>


                        <div className="vertical">
                            <h2>{nomeUsuario || "Carregando..."}</h2>


                            <p>
                                Tipo de usuário: {tipoUsuario || "Carregando..."}
                            </p>


                            <p>----------------------------</p>


                            <SimpleButton
                                path="/admin/minha-conta"
                                tema="dark"
                                raio="10"
                            >
                                Minha Conta
                            </SimpleButton>
                        </div>
                    </div>


                </section>


                <div className="conteudo gap15 desktopWrap3">
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
                        <p>Atualize as informações institucionais do projeto e do parque, garantindo que os visitantes tenham acesso a conteúdos claros e relevantes sobre a plataforma.</p>
                        <SimpleButton path="/admin/sobre" tema="dark" raio="10">Gerenciar Informações</SimpleButton>
                    </div>
                    {tipoUsuario === "MASTER" && (
                        <div className="card vertical gap5">
                            <h2>Cadastrar Usuário</h2>
                            <p>Atualize as informações institucionais do projeto e do parque, garantindo que os visitantes tenham acesso a conteúdos claros e relevantes sobre a plataforma.</p>
                            <SimpleButton path="/admin/usuario/list" tema="dark" raio="10">Gerenciar Informações</SimpleButton>
                        </div>
                    )}
                </div>
            </section>
        </ProtectedRoute>
    );
}