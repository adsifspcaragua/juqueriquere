import meioAmbiente from "../../assets/meioAmbiente.webp";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.webp"
import '../styles/Footer.css';

export default function Footer(){
    return (
        <footer className="vertical">
            <div className="conteudoFooter horizontal justifyCenter center">
                                   
                <img src={logo} alt="Parque Natural Municipal Juqueriquerê" id="logoPNMJ"/>

                <div className="horizontal gap30" id="linksFooter">
                    <div className="vertical gap5 left">
                        <h5>Links úteis</h5>
                        <Link to={"/"}>Início</Link>
                        <Link to={"/Mapa"}>Mapa</Link>
                        <Link to={"/sobre"}>Sobre o parque</Link>
                    </div>
                    <div className="vertical gap5 left">
                        <h5>Categorias</h5>
                        <Link to={"/trilhas"}>Trilhas</Link>
                        <Link to={"/pontos"}>Pontos de Interesse</Link>
                    </div>
                </div>

                <img src={meioAmbiente} alt="Meio ambiente" id="logoSEMAAP"/>
            </div>
            <div className="linhaHorizontal"></div>
            <div className="vertical gap15 center">
                <div className="horizontal gap5" id="termos">
                    <Link to={"/Legal/TermosDeUso"}>Termos de Uso</Link>
                    <p>•</p>
                    <Link to={"/Legal/PoliticaDePrivacidade"}>Política de Privacidade</Link>
                </div>
                <p>© 2026 - Parque Natural Municipal Juqueriquerê</p>
            </div>
        </footer>
    );
}