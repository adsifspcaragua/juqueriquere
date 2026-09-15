import meioAmbiente from "../../assets/meioAmbiente.webp";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.webp"
import '../styles/Footer.css';

export default function Footer(){
    return (
        <footer className="vertical">
            <div className="desktopWrap3 justify w100 gap30">      
                <div className="horizontal gap15 center" id="footerLogos">
                    <img src={logo} alt="Parque Natural Municipal Juqueriquerê" id="logoPNMJ"/>
                    <div className="linhaVertical"/>
                    <img src={meioAmbiente} alt="Meio ambiente" id="logoSEMAAP"/>
                </div>


                <div className="horizontal gap30" id="linksFooter">
                    <div className="vertical gap5 left">
                        <h5>Links úteis</h5>
                        <Link to={"/"}>Início</Link>
                        <Link to={"/Mapa"}>Mapa</Link>
                        <Link to={"/sobre"}>Sobre o parque</Link>
                        <br />
                        <Link to={"/admin"}>Administração do site</Link>
                        <Link to={"/Legal/TermosDeUso"}>Termos de Uso</Link>
                        <Link to={"/Legal/PoliticaDePrivacidade"}>Política de Privacidade</Link>
                    </div>
                    <div className="vertical gap5 left">
                        <h5>Categorias</h5>
                        <Link to={"/trilhas"}>Trilhas</Link>
                        <Link to={"/pontos"}>Pontos de Interesse</Link>
                    </div>
                </div>

                <div className="horizontal gap30" id="linksFooter">
                    <div className="vertical gap5 left">
                        <h5>Desenvolvido por: </h5>
                        <Link to={'https://github.com/Kauangithub'}>Kauan Machado</Link>
                        <Link to={'https://github.com/lucashirotsu'}>Lucas Hirotsu</Link>
                        <Link to={'https://github.com/MRC0sta'}>Matheus Costa</Link>
                    </div>
                    <div className="vertical gap5 left">
                        <br />
                        <Link to={'https://github.com/RafaelRibeiro398'}>Rafael Ribeiro</Link>
                        <Link to={'https://github.com/fatalrestart'}>Ygor Prado</Link>
                        <Link to={"/Desenvolvimento"}>Mais informações →</Link>
                    </div>
                </div>
            </div>
            <div className="linhaHorizontal"/>
            <p>© 2026 - Parque Natural Municipal Juqueriquerê</p>
        </footer>
    );
}