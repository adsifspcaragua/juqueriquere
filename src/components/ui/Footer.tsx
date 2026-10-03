import { useEffect, useState } from "react";
import meioAmbiente from "../../assets/meioAmbiente.webp";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.webp";
import { supabase } from "../../lib/supabase";
import "../styles/Footer.css";

interface Links {
    Instagram: string | null;
    Whatsapp: string | null;
    email: string | null;
}

export default function Footer() {
    const [links, setLinks] = useState<Links>({
        Instagram: null,
        Whatsapp: null,
        email: null,
    });

    useEffect(() => {
        async function carregarLinks() {
            const { data, error } = await supabase
                .from("links")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error(
                    "Erro ao carregar links:",
                    error
                );
                return;
            }

            if (data) {
                setLinks({
                    Instagram: data.Instagram ?? null,
                    Whatsapp: data.Whatsapp?.replace(/\D/g, "") ?? null,
                    email: data.email ?? null,
                });
            }
        }

        carregarLinks();
    }, []);

    return (
        <footer className="vertical">
            <div className="vertical justify w100 gap30">

                <div
                    className="vertical gap30 w100 justify"
                    id="footerLinha1"
                >
                    <div
                        className="horizontal gap15 center"
                        id="footerLogos"
                    >
                        <img
                            src={logo}
                            alt="Parque Natural Municipal Juqueriquerê"
                            id="logoPNMJ"
                        />

                        <div className="linhaVertical" />

                        <img
                            src={meioAmbiente}
                            alt="Meio ambiente"
                            id="logoSEMAAP"
                        />
                    </div>

                    <div
                        className="horizontal gap30"
                        id="linksFooter"
                    >
                        {/* LINKS ÚTEIS */}
                        <div className="vertical gap5 left">
                            <h5>Links úteis</h5>

                            <Link to="/">
                                Início
                            </Link>

                            <Link to="/Mapa">
                                Mapa
                            </Link>

                            <Link to="/sobre">
                                Sobre o parque
                            </Link>
                        </div>

                        {/* CATEGORIAS */}
                        <div className="vertical gap5 left">
                            <h5>Categorias</h5>

                            <Link to="/trilhas">
                                Trilhas
                            </Link>

                            <Link to="/pontos">
                                Pontos
                            </Link>
                        </div>

                        {/* CONTATO */}
                        <div className="vertical gap5 left">
                            <h5>Contato</h5>

                            <a
                                href={
                                    links.email
                                        ? `mailto:${links.email}`
                                        : undefined
                                }
                            >
                                E-mail
                            </a>
                            <a
                                href={
                                    links.Whatsapp
                                    ? `https://wa.me/55${links.Whatsapp}` : undefined
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                WhatsApp
                            </a>

                            <a
                                href={
                                    links.Instagram || undefined
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Instagram
                            </a>
                        </div>
                    </div>
                </div>

                <div className="linhaHorizontal" />

                <div className="vertical gap5 left">
                    <h5>
                        Desenvolvido por estudantes do IFSP
                        Campus Caraguatatuba.
                    </h5>

                    <Link to="/desenvolvimento">
                        Conheça a equipe e o desenvolvimento →
                    </Link>
                </div>
            </div>

            <div
                className="vertical gap15 justifyRight right w100"
                id="footerLinha3"
            >
                <div className="vertical gap5 right">
                    <Link to="/Legal/TermosDeUso">
                        Termos de Uso
                    </Link>

                    <Link to="/Legal/PoliticaDePrivacidade">
                        Política de Privacidade
                    </Link>

                    <p id="footerBolinha">•</p>

                    <Link to="/admin">
                        Administração do site
                    </Link>
                </div>

                <p>
                    © 2026 - Parque Natural Municipal
                    Juqueriquerê
                </p>
            </div>
        </footer>
    );
}