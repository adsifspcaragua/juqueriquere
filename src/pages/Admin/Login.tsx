import SimpleButton from "../../components/ui/buttons/SimpleButton"
import LogoDark from "../../assets/logoDark.webp"
import User from "../../assets/icons/User.webp"
import Lock from "../../assets/icons/Lock.webp"

export default function Login() {
    return(
        <>                    
        
            <div className="desktopWrap3">
                <div></div>
                <section className="vertical gap15"  id="loginPage">
                    <div className="paddingHeader"></div>
                    <SimpleButton type="back" icon="setaBack" path="/">Voltar para Início</SimpleButton>
                    <div className="card vertical center">
                        <img src={LogoDark} alt="Parque Natural Municipal Juqueriquerê" className="logo"/>
                        <div className="linhaPontilhadaDark"></div>
                        <div className="vertical gap5">
                            <h2>Administração do Site</h2>
                            <p>Faça login para cadastrar trilhas, atualizar informações e manter a experiência dos visitantes sempre completa e segura.</p>
                        </div>
                        <div className="campoLogin horizontal center">
                            <img src={User}/>
                            <input type="text" placeholder="Login"/>
                        </div>
                        <div className="campoLogin horizontal center">
                            <img src={Lock}/>
                            <input type="password" placeholder="Senha"/>
                        </div>
                        <div className="btnFull">
                            <SimpleButton tema="dark" raio="10" path="/admin/">Entrar</SimpleButton>
                        </div>
                    </div>
                </section>
                <div></div>
            </div>
        </>
    )
}
