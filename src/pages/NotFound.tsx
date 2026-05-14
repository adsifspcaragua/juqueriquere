import SimpleButton from "../components/ui/buttons/SimpleButton";

export default function NotFound(){
    return(
        <>
            <section className='conteudo vertical'>
                <div className="paddingHeader"></div>
                <div className="img-fade" id="capivara"></div>
                <div className="vertical gap5">
                    <h1>Ops! Página não encontrada</h1>
                    <p>Parece que você se perdeu na trilha.</p>
                    <p>Não se preocupe, até os exploradores mais experientes se confundem às vezes. Vamos ajudar você a voltar ao caminho certo!</p>
                </div>
                <div className="vertical gap15">
                    <p>Aqui estão algumas sugestões para você se reencontrar:</p>
                    <div className="horizontal wrap">
                        <SimpleButton path="/">Início</SimpleButton>
                        <SimpleButton path="/Explorar">Mapa</SimpleButton>
                        <SimpleButton path="/Trilhas">Trilhas</SimpleButton>
                        <SimpleButton path="/">Pontos de Interesse</SimpleButton>
                        <SimpleButton path="/">Plantas</SimpleButton>
                        <SimpleButton path="/">Observação de Pássaros</SimpleButton>
                    </div>
                </div>
            </section>
        </>
    )
}