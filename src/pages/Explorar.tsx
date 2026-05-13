import data from '../data.json';
import CardTrilha from '../components/CardTrilha.tsx';
import CardPonto from '../components/CardPonto.tsx';





export default function Explorar() {
    const trilhas = [...data.trilhas];

    const trilhasList = trilhas.map((trilha) => (
        <CardTrilha key={trilha.id} trilha={trilha} />
    ));

    return (
        <>
            <div className="paddingHeader" id='paddingImgFade'></div>
            <section className='img-fade' id='capivara'>
                <div className="conteudo vertical">
                    <div className="info vertical gap5">
                        <h1>Todas as Atividades</h1>
                        <p>Descubrar caminhos, fauna e paisagens únicas às margens do Rio Juqueriquerê</p>
                    </div>
                    <h1>Trilhas:</h1>

                    <div className='carrossel horizontal' id='filtros'>
                        <div className="horizontal gap5">
                            {trilhasList}

                        </div>
                    </div>
                    <div className="lista vertical">
                        <h1>Pontos de interesse:</h1>

                    </div>

                    
                </div>
            </section>
        </>
    );
}