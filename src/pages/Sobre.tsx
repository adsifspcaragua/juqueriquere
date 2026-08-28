import { usePageTitle } from "../lib/hooks/usePageTitle";

import img_sede_administrativa from '../assets/img/sobre/Sede administrativa_.webp'
import img_bancos_lixeiras from '../assets/img/sobre/Bancos + lixeiras de recicláveis.webp'
import img_entrada_banheiros from '../assets/img/sobre/entrada dos banheiros.webp'
import img_estante_livros from '../assets/img/sobre/estante de livros.webp'
import img_vista_sala_verde from '../assets/img/sobre/Vista interna da sala verde.webp'
import img_bicicletario from '../assets/img/sobre/Bicicletário_.webp'
import img_doca_caiaques from '../assets/img/sobre/Doca dos caiaques.webp'
import img_entrada_sede_area_verde from '../assets/img/sobre/Entrada Sede Área Verde.webp'
import img_lateral_esquerda_piquenique from '../assets/img/sobre/Lateral esquerda área de piquenique.webp'
import img_placa_aves from '../assets/img/sobre/Placa aves.webp'
import img_placa_caraguata from '../assets/img/sobre/Placa Caraguatá.webp'
import img_placa_esquilos from '../assets/img/sobre/Placa esquilos.webp'
import img_placa_orientacoes_entrada from '../assets/img/sobre/Placa orientações entrada.webp'
import img_placa_programa_mar_lixo from '../assets/img/sobre/Placa Programa O Mar Não Está para Lixo.webp'
import img_placa_roteiro_aguas from '../assets/img/sobre/Placa roteiro das águas.webp'
import img_vagas_especiais_bicicletario from '../assets/img/sobre/Vagas especiais + bicicletário.webp'
import Logo from '../assets/logo.webp';
import SimpleButton from '../components/ui/buttons/SimpleButton'

export default function Sobre(){
    usePageTitle("Sobre");

    return(
        <>
            <div className="paddingHeader"></div>
            <section className='vertical conteudo' id='sobre'>
                <div className="logo"><img src={Logo} alt="Logo Parque"/></div>

                <div className='carrossel horizontal galeria'>
                    <img src={img_sede_administrativa} className="carrosselCard" alt="Sede Administrativa"></img>
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

                <p>
                    Localizado às margens do Rio Juqueriquerê, é a primeira unidade de proteção integral da cidade, voltada à preservação da biodiversidade local, conservação dos ecossistemas e apoio à pesquisa científica.
                    <br />
                    <br />
                    Com uma área aproximada de 35.000m2 destaca-se no cenário nacional de Unidades de Conservação. A área tem papel crucial por estar inserida na maior bacia hidrográfica do Litoral Norte — a do Rio Juqueriquerê — em uma região de intensa urbanização.
                </p>

                <div className="linhaPontilhadaLight"></div>
                
                <h1>Espaços do Parque</h1>
                <div className="carrossel horizontal">
                    <div className="carrosselCard espacoCard vertical" id='convivencia'>
                        <div className="fade vertical gap5">
                            <h1>Área de Convivência</h1>
                            <p>
                                Principal espaço de recepção e descanso do parque, totalmente integrado à natureza. Conta com jardins de Mata Atlântica, áreas de piquenique, observatório de aves, Sala Verde, comedouros para fauna e infraestrutura acessível.
                            </p>
                        </div>
                    </div>

                    <div className="carrosselCard espacoCard vertical" id='salaverde'>
                        <div className="fade vertical gap5">
                            <h1>Sala Verde</h1>
                            <p>
                                Espaço dedicado à educação ambiental, utilizado para palestras, oficinas, atividades educativas e ações de conscientização sobre a preservação da natureza. Integrada ao ambiente natural do parque, a Sala Verde proporciona um local acolhedor para ...
                            </p>
                        </div>
                    </div>
                </div>

                <div className="linhaPontilhadaLight"></div>

                <div className="vertical gap5">
                    <h1>Acessibilidade</h1>
                    <p>O PNMJ oferece às pessoas com deficiência (PCD) a cadeira Julietti, que suporta até 70 kg para percorrer as trilhas com conforto.</p>
                </div>

                <div className="linhaPontilhadaLight"></div>

                <div className="vertical gap15 desktopWrap3">
                    <h1>Visite o Parque</h1>
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
                </div>
            </section>
        </>
    )
}