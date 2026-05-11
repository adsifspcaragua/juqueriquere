import { Link } from 'react-router-dom';
import Scanner from '../Scanner';
import logo from "../../assets/logo.png";
import { useState} from "react";
import SimpleButton from './buttons/SimpleButton';
import Menu from './Menu';

export default function Header() {
    const [openScanner, setOpenScanner] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    return (
        <>
            <header className="horizontal">
                <Link to="/" className="logo">
                    <img src={logo} alt="logo do parque" />
                </Link>
                <nav className="horizontal">
                    <div className="navBtn" id="scanner" onClick={() => setOpenScanner(true)}></div>
                    <div className="navBtn" id="menu"    onClick={() => setOpenMenu(!openMenu)}></div>
                </nav>
            </header>

            <div className="menuMobile horizontal">
                <nav className="horizontal">
                    <SimpleButton path='/' tema='none'  icon='Home' >Início</SimpleButton>
                    <SimpleButton tema='light'          icon='QR'   onClick={() => setOpenScanner(true)}    >Ler QR Code</SimpleButton>
                    <SimpleButton tema='none'           icon='Menu' onClick={() => setOpenMenu(!openMenu)}       >Menu       </SimpleButton>
                </nav>
            </div>

            <Menu ativo={openMenu} onChoice={() => setOpenMenu(false)} />
                
            {openScanner && (
                <Scanner onClose={() => setOpenScanner(false)} />
            )}
        </>
    );
}; 