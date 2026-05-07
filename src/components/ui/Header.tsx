import { Link } from 'react-router-dom';
import Scanner from '../Scanner';
import logo from "../../assets/logo.png";
import { useState } from "react";
import SimpleButton from './buttons/SimpleButton';

export default function Header() {
    const [openScanner, setOpenScanner] = useState(false);

    return (
        <>
            <header className="horizontal">
                <Link to="/" className="logo">
                    <img src={logo} alt="logo do parque"></img>
                </Link>
                <nav className="horizontal">
                    <div className="navBtn" id="scanner" onClick={() => setOpenScanner(true)}></div>
                    <div className="navBtn" id="menu"></div>
                </nav>
            </header>

            <div className="menuMobile horizontal">
                <nav className="horizontal">
                    <SimpleButton path='/' tema='none' icon='Home'>Início</SimpleButton>
                    <SimpleButton tema='light' icon='QR' onClick={() => setOpenScanner(true)}>Ler QR Code</SimpleButton>
                    <SimpleButton path='/' tema='none' icon='Menu'>Menu</SimpleButton>

                </nav>
            </div>

            {openScanner && (
                <Scanner onClose={() => setOpenScanner(false)} />
            )}
            <div className="paddingHeader"></div>
        </>
    );
};