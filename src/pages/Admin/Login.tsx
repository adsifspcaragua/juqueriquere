import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../../lib/auth";

import SimpleButton from "../../components/ui/buttons/SimpleButton";

import LogoDark from "../../assets/logoDark.webp";
import User from "../../assets/icons/User.webp";
import Lock from "../../assets/icons/Lock.webp";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    async function fazerLogin() {
        const { error } = await login(email, senha);

        if (error) {
            alert("Login inválido.");
            return;
        }

        navigate("/admin");
    }

    return (
        <div className="desktopWrap3">
            <div></div>

            <section className="vertical gap15" id="loginPage">

                <div className="paddingHeader"></div>

                <SimpleButton
                    type="back"
                    icon="setaBack"
                    path="/"
                >
                    Voltar para Início
                </SimpleButton>

                <div className="card vertical center">

                    <img
                        src={LogoDark}
                        alt="Logo"
                        className="logo"
                    />

                    <div className="linhaPontilhadaDark"></div>

                    <div className="vertical gap5">
                        <h2>Administração do Site</h2>

                        <p>
                            Faça login para administrar o sistema.
                        </p>
                    </div>

                    <div className="campoLogin horizontal center">
                        <img src={User} alt="" />

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="campoLogin horizontal center">
                        <img src={Lock} alt="" />

                        <input
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    <div className="btnFull">
                        <button
                            type="button"
                            onClick={fazerLogin}
                        >
                            Entrar
                        </button>
                    </div>

                </div>
            </section>

            <div></div>
        </div>
    );
}