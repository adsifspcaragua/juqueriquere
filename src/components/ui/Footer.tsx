import meioAmbiente from "../../assets/meioAmbiente.png";
import './Footer.css';

export default function Footer(){
    return (
        <footer className="vertical">
            <img src={meioAmbiente} alt="Meio ambiente" />
            <p>© 2026 - Não tão protagonistas do SUD</p>
        </footer>
    );
}