import { Link, useLocation } from "react-router-dom";
import { icons } from "../icons";
import './SimpleButton.css';
interface props {
    path?: string;
    children?: React.ReactNode;
    tema?: string;
    icon?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    type?: string;
    raio?: string;
}

export default function SimpleButton({path, children, tema, icon, type, raio, onClick}: props) {
    const location = useLocation();
    const styleClass = {
        "dark": "btn-dark",
        "none": "btn-none",
    } as any;
    if(!icon) icon = 'seta';
    tema = (tema && icons[tema]) ? tema : 'default';
    const imagemSrc = icons[tema]?.[icon] || null;
    tema = tema && styleClass[tema] ? 'btn ' + styleClass[tema]: 'btn';// ensuring that the theme will always match the class, and if doesnt exist an specific style, it'll use the default one
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        if(onClick) onClick(event);
        if(path? true : false) window.scrollTo(0, 0);// scroll to top of the page when the button is clicked and has a path to navigate to
    };
    return(
            <Link to={path || location.pathname} onClick={handleClick}>
                <div className={tema} style={{borderRadius: raio ? raio + 'px' : '20px'}}>
                    {type == "back" ? imagemSrc && <img src={imagemSrc} alt={icon} className="back"/> : children}
                    {type == "back" ?  children : imagemSrc && <img src={imagemSrc} alt={icon} />}
                    {}
                </div> 
            </Link>
    ) 
}
