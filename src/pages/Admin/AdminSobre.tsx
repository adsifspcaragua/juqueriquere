import SimpleButton from "../../components/ui/buttons/SimpleButton";


export default function Admin() {

    return (
        <>
            <div className="paddingHeader"></div>
            <section className="conteudo vertical gap15" id="adminHome">
                <SimpleButton path="/admin/" type='back' icon="setaBack">Voltar</SimpleButton>
                
                <div className="card vertical gap5 adminCard" id="adminSobreCard">
                    <h2>Trilhas</h2>
                    <p>Atualize as informações institucionais do parque, garantindo visitantes tenham acesso a conteúdos claros e relevantes.</p>
                </div>
            </section>
        </>
    );
}