import MapNew from '../../components/ui/Map/Map'
import TrilhasMap from '../../components/ui/TrilhasMap';

export default function Test(){


    return(

        <>
        <div className='conteudo desktopWrap'>
            <div className="mapa">
                <TrilhasMap/>
            </div>
            <div className="mapa">
                <MapNew/>
            </div>
            
        </div>
            
            
        </>

    )
}