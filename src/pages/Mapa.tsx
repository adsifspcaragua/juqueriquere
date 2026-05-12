
import SimpleButton from '../components/ui/buttons/SimpleButton';
import TrilhasMap from '../components/ui/TrilhasMap';

export default function Mapa() {
    

    return (
        <>
            <div className="paddingHeader"></div>
            <section className='vertical conteudo'>
                <SimpleButton path="/trilhas/" type='back'>Voltar para Trilhas</SimpleButton>

                <div className="vertical conteudo" id='detalheTrilha'>
                    <div className="mapaInterativo">
                        <TrilhasMap/>
                    </div>

                    <div className="vertical conteudo" id='conteudoTrilha'>
                        
                    </div>
                </div>
            </section>
        </>
    );
}