import meioAmbiente from "../../assets/meioAmbiente.webp";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.webp"
import '../styles/Footer.css';

export default function Footer(){
    return (
        <footer className="vertical">
            <div className="conteudoFooter gap30">
                <div className="footerLogos horizontal gap30">
                    <img src={meioAmbiente} alt="Meio ambiente" />
                    <div className="linhaVertical" />
                    <div className="linhaHorizontal" />
                    <img src={logo} alt="Parque Natural Municipal Juqueriquerê" />
                </div>

                <div className="horizontal gap30" id="linksFooter">
                    <div className="vertical gap5">
                        <Link to={"/"}>Início</Link>
                        <Link to={"/Mapa"}>Mapa</Link>
                        <Link to={"/sobre"}>Sobre o parque</Link>
                    </div>
                    <div className="vertical gap5">
                        <Link to={"/trilhas"}>Trilhas</Link>
                        <Link to={"/pontos"}>Pontos de Interesse</Link>
                    </div>
                    <div className="vertical gap5">
                        <Link to={"/"}>Termos de Uso</Link>
                        <Link to={"/"}>Política de Privacidade</Link>
                    </div>
                </div>
            </div>
            <div className="linhaHorizontal"></div>
            <p>© 2026 - Parque Natural Municipal Juqueriquerê</p>
        </footer>
    );
}