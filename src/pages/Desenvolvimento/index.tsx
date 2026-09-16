import { usePageTitle } from "../../lib/hooks/usePageTitle";
import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';

export default function Trilhas() {
    usePageTitle("Desenvolvimento");

    return (
        <>
            <div className="paddingHeader"></div>
            <section className="conteudo desktopWrap1-2 gap15">
                <div className="vertical gap15">
                    <SimpleButton type="back" icon="setaBack" path="/">Voltar</SimpleButton>
                    <h1>Desenvolvimento</h1>
                    <p>
                        O sistema foi desenvolvido por estudantes do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas no Instituto Federal de Ciência, Educação e Tecnologia de São Paulo - Campus Caraguatatuba.
                    </p>
                    <p>Mais em breve...</p>
                </div>
                <div className="desktopWrap gap15">
                    <div className="card horizontal gap15">
                        <img src="https://github.com/Kauangithub.png" alt="" className="devImg"/>
                        <div className="vertical gap15">
                            <div className="vertical gap5">
                                <h3>Kauan Machado</h3>
                                <p>Função</p>
                            </div>
                            <SimpleButton tema='dark' raio="10" path="https://github.com/Kauangithub">GitHub</SimpleButton>
                        </div>
                    </div>
                    <div className="card horizontal gap15">
                        <img src="https://github.com/lucashirotsu.png" alt="" className="devImg"/>
                        <div className="vertical gap15">
                            <div className="vertical gap5">
                                <h3>Lucas Hirotsu</h3>
                                <p>Função</p>
                            </div>
                            <SimpleButton tema='dark' raio="10" path="https://github.com/lucashirotsu">GitHub</SimpleButton>
                        </div>
                    </div>
                    <div className="card horizontal gap15">
                        <img src="https://github.com/MRC0sta.png" alt="" className="devImg"/>
                        <div className="vertical gap15">
                            <div className="vertical gap5">
                                <h3>Matheus Costa</h3>
                                <p>Função</p>
                            </div>
                            <SimpleButton tema='dark' raio="10" path="https://github.com/MRC0sta">GitHub</SimpleButton>
                        </div>
                    </div>
                    <div className="card horizontal gap15">
                        <img src="https://github.com/RafaelRibeiro398.png" alt="" className="devImg"/>
                        <div className="vertical gap15">
                            <div className="vertical gap5">
                                <h3>Rafael Ribeiro</h3>
                                <p>Função</p>
                            </div>
                            <SimpleButton tema='dark' raio="10" path="https://github.com/RafaelRibeiro398">GitHub</SimpleButton>
                        </div>
                    </div>
                    <div className="card horizontal gap15">
                        <img src="https://github.com/FatalRestart.png" alt="" className="devImg"/>
                        <div className="vertical gap15">
                            <div className="vertical gap5">
                                <h3>Ygor Prado</h3>
                                <p>Função</p>
                            </div>
                            <SimpleButton tema='dark' raio="10" path="https://github.com/FatalRestart">GitHub</SimpleButton>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}