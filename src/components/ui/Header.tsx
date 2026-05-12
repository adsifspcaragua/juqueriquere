import { Link } from 'react-router-dom';
import Scanner from '../Scanner';
import logo from "../../assets/logo.png";
import { useState, useEffect } from "react";
import SimpleButton from './buttons/SimpleButton';
import Menu from './Menu';
import './Header.css';

export default function Header() {
    const [openScanner, setOpenScanner] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);

    useEffect(() => {
        if (openMenu) {
            const scrollY = window.scrollY;

            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflowY = 'scroll';

            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflowY = '';

                window.scrollTo(0, scrollY);
            };
        }
    }, [openMenu]);

    return (
        <>
            <header className="horizontal">
                <Link to="/" className="logo">
                    <img src={logo} alt="logo do parque" />
                </Link>

                <nav className="horizontal">
                    <div
                        className="navBtn"
                        id="scanner"
                        onClick={() => setOpenScanner(true)}
                    ></div>

                    <div
                        className={`navBtn ${openMenu ? 'active' : ''}`}
                        id="menu"
                        onClick={() => setOpenMenu(!openMenu)}
                    ></div>
                </nav>
            </header>

            <div className="menuMobile horizontal">
                <nav className="horizontal">
                    <SimpleButton path='/' tema='none' icon='Home'>
                        Início
                    </SimpleButton>

                    <SimpleButton
                        tema='light'
                        icon='QR'
                        onClick={() => setOpenScanner(true)}
                    >
                        Ler QR Code
                    </SimpleButton>

                    <SimpleButton
                        tema='dark'
                        icon='Menu'
                        onClick={() => setOpenMenu(!openMenu)}
                    >
                        Menu
                    </SimpleButton>
                </nav>
            </div>

            <Menu
                ativo={openMenu}
                onChoice={() => setOpenMenu(false)}
            />

            {openScanner && (
                <Scanner onClose={() => setOpenScanner(false)} />
            )}
        </>
    );
}