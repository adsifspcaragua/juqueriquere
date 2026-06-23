import meioAmbiente from "../../assets/meioAmbiente.webp";
import './Footer.css';

export default function Footer(){
    return (
        <footer className="vertical">
            <img src={meioAmbiente} alt="Meio ambiente" />
            <p>© 2026 - Parque Natural Municipal Juqueriquerê</p>
        </footer>
    );
}