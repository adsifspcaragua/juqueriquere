import img_sede_administrativa from '../assets/img/sobre/Sede administrativa_.jpg'
import img_bancos_lixeiras from '../assets/img/sobre/Bancos + lixeiras de recicláveis.jpg'
import img_entrada_banheiros from '../assets/img/sobre/entrada dos banheiros.jfif'
import img_estante_livros from '../assets/img/sobre/estante de livros.jfif'
import img_vista_sala_verde from '../assets/img/sobre/Vista interna da sala verde.jfif'
import img_bicicletario from '../assets/img/sobre/Bicicletário_.jpg'
import img_doca_caiaques from '../assets/img/sobre/Doca dos caiaques.jpg'
import img_entrada_sede_area_verde from '../assets/img/sobre/Entrada Sede Área Verde.jpg'
import img_lateral_esquerda_piquenique from '../assets/img/sobre/Lateral esquerda área de piquenique.jpg'
import img_placa_aves from '../assets/img/sobre/Placa aves.jpg'
import img_placa_caraguata from '../assets/img/sobre/Placa Caraguatá.jpg'
import img_placa_esquilos from '../assets/img/sobre/Placa esquilos.jpg'
import img_placa_orientacoes_entrada from '../assets/img/sobre/Placa orientações entrada.jpg'
import img_placa_programa_mar_lixo from '../assets/img/sobre/Placa Programa O Mar Não Está para Lixo.jpg'
import img_placa_roteiro_aguas from '../assets/img/sobre/Placa roteiro das águas.jpg'
import img_vagas_especiais_bicicletario from '../assets/img/sobre/Vagas especiais + bicicletário.jpg'
import Logo from '../assets/logo.png';
import SimpleButton from '../components/ui/buttons/SimpleButton'

export default function Sobre(){

    return(
        <>
            <div className="paddingHeader"></div>
            <section className='vertical conteudo' id='sobre'>

                <div className="bannerInicio horizontal">
                    <div className="conteudo vertical">
                        <img src={Logo} alt="Logo Parque" />
                        <p>
                            O Parque Natural Municipal do Juqueriquerê (PNMJ) é um refúgio de biodiversidade em Caraguatatuba, que combina a preservação da Mata Atlântica com a beleza da flora e fauna às margens do maior rio da região. O espaço oferece uma experiência tranquila e educativa, contando com trilhas ecológicas, torre de observação e um deck panorâmico, sendo o destino ideal para quem busca lazer contemplativo fora do ambiente urbano e do circuito tradicional de praias
                        </p>
                    </div>
                </div>

                <div className="vertical gap5">
                    <h2>Galeria de imagens</h2>
                    <div className='carrossel horizontal galeria'>
                        <img src={img_sede_administrativa}  className="carrosselCard" alt="Sede Administrativa"></img>
                        <img src={img_bancos_lixeiras} alt="Bancos e Lixeiras de Recicláveis" className="carrosselCard"></img>
                        <img src={img_entrada_banheiros} alt="Entrada dos Banheiros" className="carrosselCard"></img>
                        <img src={img_estante_livros} alt="Estante de Livros" className="carrosselCard"></img>
                        <img src={img_vista_sala_verde} alt="Vista da Sala Verde" className="carrosselCard"></img>
                        <img src={img_bicicletario} alt="Bicicletário" className="carrosselCard"></img>
                        <img src={img_doca_caiaques} alt="Doca dos Caiaques" className="carrosselCard"></img>
                        <img src={img_entrada_sede_area_verde} alt="Entrada da Sede da Área Verde" className="carrosselCard"></img>
                        <img src={img_lateral_esquerda_piquenique} alt="Lateral Esquerda da Área de Piquenique" className="carrosselCard"></img>
                        <img src={img_placa_aves} alt="Placa de Aves" className="carrosselCard"></img>
                        <img src={img_placa_caraguata} alt="Placa de Caraguatá" className="carrosselCard"></img>
                        <img src={img_placa_esquilos} alt="Placa de Esquilos" className="carrosselCard"></img>
                        <img src={img_placa_orientacoes_entrada} alt="Placa de Orientações da Entrada" className="carrosselCard"></img>
                        <img src={img_placa_programa_mar_lixo} alt="Placa do Programa O Mar Não Está para Lixo" className="carrosselCard"></img>
                        <img src={img_placa_roteiro_aguas} alt="Placa do Roteiro das Águas" className="carrosselCard"></img>
                        <img src={img_vagas_especiais_bicicletario} alt="Vagas Especiais e Bicicletário" className="carrosselCard"></img>
                    </div>
                </div>

                <div className="vertical gap5">
                    <h1>Área de Convivência</h1>
                    <p>
                        Principal espaço de recepção e descanso do parque, totalmente integrado à natureza. Conta com jardins de Mata Atlântica, áreas de piquenique, observatório de aves, Sala Verde, comedouros para fauna e infraestrutura acessível.
                    </p>
                </div>
                
                <div className="vertical gap5">
                    <h2>Observações e Pontos de Interesse</h2>
                    <ul>
                        <li>Pavimentação acessível em bloquetes</li>
                        <li>Sem obstáculos relevantes</li>
                        <li>Possui banheiros acessíveis, bebedouro, bicicletário e estacionamento</li>
                        <li>Disponível cadeira Julietti para PCD (até 70 kg)</li>
                        <li>Observatório de aves com cerca de 10 m de altura</li>
                        <li>Vista panorâmica da copa das árvores e do parque</li>
                        <li>Bromélias de grande porte</li>
                        <li>Exemplares de Ingá e árvores “Olho-de-boi”</li>
                        <li>Área de piquenique sombreada</li>
                        <li>Sala Verde para educação ambiental</li>
                        <li>Biblioteca e estante de livros educativos</li>
                        <li>Boxes de exposição temática</li>
                        <li>Comedouros para aves, esquilos e borboletas</li>
                        <li>Placas educativas sobre fauna e flora</li>
                    </ul>
                </div>

                <div className="vertical gap5">
                    <h2>Acessibilidade</h2>
                    <p>O PNMJ oferece às pessoas com deficiência (PCD) a cadeira Julietti, que suporta até 70 kg para percorrer as trilhas com conforto.</p>
                </div>

                <div className="vertical card" id='cardGrupo'>
                    <h1>Visitas em grupos</h1>
                    <p>
                        Para visita de grupos, é necessário realizar agendamento prévio com, no mínimo, 7 dias de antecedência, por meio do e-mail pnm.juqueriquere@caraguatatuba.sp.gov.br.
                    </p>
                    <p>
                        No pedido, devem ser informados o objetivo da visita, a quantidade de participantes e a necessidade de utilização das estruturas disponíveis, como auditório, mesas ao ar livre, entre outros espaços.
                    </p>
                    <p>
                        Também é importante incluir quaisquer outras informações relevantes que possam auxiliar na organização e no atendimento da visita.
                    </p>
                    <SimpleButton tema='dark' raio='10' path='mailto:pnm.juqueriquere@caraguatatuba.sp.gov.br'>Enviar e-mail</SimpleButton>
                </div>

                <div className="vertical card" id="cardHorario">
                    <h1>Horário de funcionamento</h1>
                    <p>O parque está aberto para visitações de terça à sexta-feira das 9h30 às 16h30, e aos sábados, domingos e feriados das 9h às 16h.</p>
                </div>

                <div className="vertical card" id='cardEndereco'>
                    <h1>Endereço</h1>
                    <p>Avenida José Herculano, 5030 – Porto Novo (em frente à Colônia de Férias Min. João Cleófas).</p>
                    <SimpleButton tema='dark' raio='10' path='https://maps.app.goo.gl/ynGnyuGkpvWqRRd17'>Ver rotas</SimpleButton>
                </div>
            </section>
        </>
    )
}