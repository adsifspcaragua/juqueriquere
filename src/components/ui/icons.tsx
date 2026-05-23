import seta         from '../../assets/icons/seta1.png';
import setaDark     from '../../assets/icons/seta12.png';
import QRDark       from '../../assets/icons/qr_code_scanner.png';
import QR           from '../../assets/icons/QR-hover.png';
import home         from '../../assets/icons/Home.png';
import menu         from '../../assets/icons/Menu.png';
import XDark        from '../../assets/icons/X.webp';
import X            from '../../assets/icons/X-dark.png';
import Explorar     from '../../assets/icons/Explorar.png';
import Sobre        from '../../assets/icons/Sobre.png';
import Dificuldade  from '../../assets/icons/Dificuldade-light.png';
import Distancia    from '../../assets/icons/Distancia-light.png';
import Tempo        from '../../assets/icons/Tempo-light.png';
import DificuldadeDark  from '../../assets/icons/Dificuldade.png';
import DistanciaDark    from '../../assets/icons/Distancia.png';
import TempoDark        from '../../assets/icons/Tempo.png';

export const icons = {
        "default": {
            "seta"          : seta,
            "QR"            : QR,
            "Home"          : home,
            "Menu"          : menu,
            "X"             : X,
            "Explorar"      : Explorar,
            "Sobre"         : Sobre,
            "Dificuldade"   : Dificuldade,
            "Distancia"     : Distancia,
            "Tempo"         : Tempo
        },
        "dark": {
            "seta"          : setaDark,
            "QR"            : QRDark,
            "Home"          : home,
            "Menu"          : menu,
            "X"             : XDark,
            "Explorar"      : Explorar,
            "Sobre"         : Sobre,
            "Dificuldade"   : DificuldadeDark,
            "Distancia"     : DistanciaDark,
            "Tempo"         : TempoDark
        },
         "none": {
            "seta"          : setaDark,
            "QR"            : QRDark,
            "Home"          : home,
            "Menu"          : menu,
            "X"             : XDark,
            "Explorar"      : Explorar,
            "Sobre"         : Sobre,
            "Dificuldade"   : Dificuldade,
            "Distancia"     : Distancia,
            "Tempo"         : Tempo
        }
} as any;