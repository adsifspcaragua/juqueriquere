import { usePageTitle } from "../../lib/hooks/usePageTitle";
import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';

export default function Trilhas() {
    usePageTitle("Desenvolvimento");

    return (
        <>
            <div className="vertical gap30">
                <div className="bannerInicio horizontal" id="devBg">
                    <div className="conteudo vertical">
                        <div className="paddingHeader"></div>
                        <div className="vertical gap15">
                            <SimpleButton type="back" icon="setaBack" path="/">Voltar</SimpleButton>
                            <div className="vertical gap5">
                                <h1>SOBRE O PROJETO</h1>
                                <p>
                                    Este projeto foi desenvolvido por estudantes do curso de Tecnologia em Análise e Desenvolvimento de Sistemas do IFSP — Câmpus Caraguatatuba, como parte das atividades de extensão do curso.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="conteudo vertical gap15">
                    <div className="vertical gap5">
                        <h1>Quem fez parte do projeto?</h1>
                        <p>O desenvolvimento deste Catálogo Digital foi realizado de forma colaborativa, envolvendo diferentes etapas de pesquisa, design, desenvolvimento e organização do conteúdo.</p>
                    </div>

                    <div className="horizontal gap15 carrossel" id="carrosselDevs">
                        <div className="card vertical center gap15 w100">
                            <img src="https://github.com/Kauangithub.png" alt="" className="devImg"/>
                            <div className="vertical gap15 btnFull">
                                <div className="vertical gap5">
                                    <h3>Kauan Machado</h3>
                                    <p> • Banco de Dados<br/>
                                        • Back-End<br/>
                                        • Performance
                                    </p>
                                </div>
                                <SimpleButton tema='dark' raio="10" path="https://github.com/Kauangithub">GitHub</SimpleButton>
                            </div>
                        </div>
                        <div className="card vertical center gap15 w100">
                            <img src="https://github.com/lucashirotsu.png" alt="" className="devImg"/>
                            <div className="vertical gap15 btnFull">
                                <div className="vertical gap5">
                                    <h3>Lucas Hirotsu</h3>
                                    <p> • Experiência do Usuário<br />
                                        • Interfaces e Protótipos<br />
                                        • Conteúdo Visual
                                    </p>
                                </div>
                                <SimpleButton tema='dark' raio="10" path="https://github.com/lucashirotsu">GitHub</SimpleButton>
                            </div>
                        </div>
                        <div className="card vertical center gap15 w100">
                            <img src="https://github.com/MRC0sta.png" alt="" className="devImg"/>
                            <div className="vertical gap15 btnFull">
                                <div className="vertical gap5">
                                    <h3>Matheus Costa</h3>
                                    <p> • Dados e Informações<br />
                                        • Requisitos<br />
                                        • Suporte Técnico
                                    </p>
                                </div>
                                <SimpleButton tema='dark' raio="10" path="https://github.com/MRC0sta">GitHub</SimpleButton>
                            </div>
                        </div>
                        <div className="card vertical center gap15 w100">
                            <img src="https://github.com/RafaelRibeiro398.png" alt="" className="devImg"/>
                            <div className="vertical gap15 btnFull">
                                <div className="vertical gap5">
                                    <h3>Rafael Ribeiro</h3>
                                    <p> • Front-End<br />
                                        • PWA<br />
                                        • Qualidade e Testes
                                    </p>
                                </div>
                                <SimpleButton tema='dark' raio="10" path="https://github.com/RafaelRibeiro398">GitHub</SimpleButton>
                            </div>
                        </div>
                        <div className="card vertical center gap15 w100">
                            <img src="https://github.com/FatalRestart.png" alt="" className="devImg"/>
                            <div className="vertical gap15 btnFull">
                                <div className="vertical gap5">
                                    <h3>Ygor Prado</h3>
                                    <p> • <br />
                                        • <br />
                                        • 
                                    </p>
                                </div>
                                <SimpleButton tema='dark' raio="10" path="https://github.com/FatalRestart">GitHub</SimpleButton>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}