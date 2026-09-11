import { useEffect, useState } from "react";
import { usePageTitle } from "../lib/hooks/usePageTitle";
import { supabase } from "../lib/supabase";

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
import SimpleButton from '../components/ui/buttons/SimpleButton';

const BUCKET_IMAGENS = "imagens";

interface Sobre {
    id: number;

    descricao: string;
    area: string;

    acessibilidade_titulo?: string;
    acessibilidade_descricao?: string;

    visitas_grupo_titulo: string;
    visitas_grupo_descricao: string;

    horario_titulo: string;
    horario_descricao: string;

    endereco_titulo: string;
    endereco_descricao: string;

    email_agendamento: string;
    link_mapa: string;
}

interface EspacoParque {
    id: number;
    titulo: string;
    descricao: string;
    imagem_id?: number | null;
    ordem: number;
}

interface EspacoParqueComImagem extends EspacoParque {
    imagemUrl?: string;
}

interface ImagemDB {
    id: number;
    caminho_arquivo: string;
    legenda?: string;
}

export default function Sobre() {
    usePageTitle("Sobre");

    const [sobre, setSobre] = useState<Sobre | null>(null);
    const [espacos, setEspacos] = useState<EspacoParqueComImagem[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarSobre();
    }, []);

    async function carregarSobre() {
        try {
            setCarregando(true);

            /*
             * ==========================================
             * BUSCAR INFORMAÇÕES GERAIS DO PARQUE
             * ==========================================
             */

            const {
                data: sobreData,
                error: sobreError
            } = await supabase
                .from("sobre")
                .select("*")
                .order("id", { ascending: true })
                .limit(1)
                .maybeSingle();

            if (sobreError) {
                throw sobreError;
            }

            if (sobreData) {
                setSobre(sobreData);
            }

            /*
             * ==========================================
             * BUSCAR ESPAÇOS DO PARQUE
             * ==========================================
             */

            const {
                data: espacosData,
                error: espacosError
            } = await supabase
                .from("espacos_parque")
                .select("*")
                .order("ordem", { ascending: true });

            if (espacosError) {
                throw espacosError;
            }

            if (!espacosData) {
                setEspacos([]);
                return;
            }

            /*
             * ==========================================
             * BUSCAR IMAGENS DOS ESPAÇOS
             * ==========================================
             */

            const espacosComImagem: EspacoParqueComImagem[] =
                await Promise.all(
                    espacosData.map(async (espaco) => {

                        if (!espaco.imagem_id) {
                            return {
                                ...espaco,
                                imagemUrl: undefined
                            };
                        }

                        const {
                            data: imagemData,
                            error: imagemError
                        } = await supabase
                            .from("imagens")
                            .select("id, caminho_arquivo, legenda")
                            .eq("id", espaco.imagem_id)
                            .maybeSingle();

                        if (imagemError || !imagemData) {
                            return {
                                ...espaco,
                                imagemUrl: undefined
                            };
                        }

                        /*
                         * caminho_arquivo deve conter somente
                         * o caminho do arquivo dentro do Storage.
                         *
                         * Exemplo:
                         * espacos/area-convivencia.webp
                         */

                        const {
                            data: urlData
                        } = supabase
                            .storage
                            .from(BUCKET_IMAGENS)
                            .getPublicUrl(imagemData.caminho_arquivo);

                        return {
                            ...espaco,
                            imagemUrl: urlData.publicUrl
                        };
                    })
                );

            setEspacos(espacosComImagem);

        } catch (error) {
            console.error("Erro ao carregar página Sobre:", error);

            alert(
                "Não foi possível carregar as informações do parque."
            );
        } finally {
            setCarregando(false);
        }
    }

    /*
     * ==========================================
     * GALERIA SUPERIOR
     * ==========================================
     *
     * Esta galeria continua usando as imagens
     * existentes no projeto.
     */

    const imagensGaleria = [
        {
            src: img_sede_administrativa,
            alt: "Sede Administrativa"
        },
        {
            src: img_bancos_lixeiras,
            alt: "Bancos e Lixeiras de Recicláveis"
        },
        {
            src: img_entrada_banheiros,
            alt: "Entrada dos Banheiros"
        },
        {
            src: img_estante_livros,
            alt: "Estante de Livros"
        },
        {
            src: img_vista_sala_verde,
            alt: "Vista da Sala Verde"
        },
        {
            src: img_bicicletario,
            alt: "Bicicletário"
        },
        {
            src: img_doca_caiaques,
            alt: "Doca dos Caiaques"
        },
        {
            src: img_entrada_sede_area_verde,
            alt: "Entrada da Sede da Área Verde"
        },
        {
            src: img_lateral_esquerda_piquenique,
            alt: "Lateral Esquerda da Área de Piquenique"
        },
        {
            src: img_placa_aves,
            alt: "Placa de Aves"
        },
        {
            src: img_placa_caraguata,
            alt: "Placa de Caraguatá"
        },
        {
            src: img_placa_esquilos,
            alt: "Placa de Esquilos"
        },
        {
            src: img_placa_orientacoes_entrada,
            alt: "Placa de Orientações da Entrada"
        },
        {
            src: img_placa_programa_mar_lixo,
            alt: "Placa do Programa O Mar Não Está para Lixo"
        },
        {
            src: img_placa_roteiro_aguas,
            alt: "Placa do Roteiro das Águas"
        },
        {
            src: img_vagas_especiais_bicicletario,
            alt: "Vagas Especiais e Bicicletário"
        }
    ];

    return (
        <>
            <div className="paddingHeader"></div>

            <section
                className="vertical conteudo"
                id="sobre"
            >

                <div className="logo">
                    <img
                        src={Logo}
                        alt="Logo Parque"
                    />
                </div>

                {/* ==========================================
                    GALERIA
                ========================================== */}

                <div className="carrossel horizontal galeria">

                    {imagensGaleria.map((imagem, index) => (
                        <img
                            key={index}
                            src={imagem.src}
                            className="carrosselCard"
                            alt={imagem.alt}
                        />
                    ))}

                </div>

                {/* ==========================================
                    INFORMAÇÕES DO PARQUE
                ========================================== */}

                {carregando && !sobre ? (

                    <p>
                        Carregando informações do parque...
                    </p>

                ) : (

                    <>

                        <p>
                            {sobre?.descricao}
                            <br />
                            <br />
                            {sobre?.area}
                        </p>

                        <div className="linhaPontilhadaLight"></div>

                        {/* ==========================================
                            ESPAÇOS DO PARQUE
                        ========================================== */}

                        <h1>
                            Espaços do Parque
                        </h1>

                        <div className="carrossel horizontal">

                            {espacos.map((espaco) => (

                                <div
                                    key={espaco.id}
                                    className="carrosselCard espacoCard vertical"
                                >

                                    {espaco.imagemUrl && (
                                        <img
                                            src={espaco.imagemUrl}
                                            alt={espaco.titulo}
                                        />
                                    )}

                                    <div className="fade vertical gap5">

                                        <h1>
                                            {espaco.titulo}
                                        </h1>

                                        <p>
                                            {espaco.descricao}
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                        <div className="linhaPontilhadaLight"></div>

                        {/* ==========================================
                            ACESSIBILIDADE
                        ========================================== */}

                        <div className="vertical gap5">

                            <h1>
                                {sobre?.acessibilidade_titulo ||
                                    "Acessibilidade"}
                            </h1>

                            <p>
                                {sobre?.acessibilidade_descricao}
                            </p>

                        </div>

                        <div className="linhaPontilhadaLight"></div>

                        {/* ==========================================
                            VISITE O PARQUE
                        ========================================== */}

                        <div className="vertical gap15 desktopWrap3">

                            <h1>
                                Visite o Parque
                            </h1>

                            {/* VISITAS EM GRUPO */}

                            <div
                                className="vertical card"
                                id="cardGrupo"
                            >

                                <h1>
                                    {sobre?.visitas_grupo_titulo}
                                </h1>

                                <p>
                                    {sobre?.visitas_grupo_descricao}
                                </p>

                                {sobre?.email_agendamento && (
                                    <SimpleButton
                                        tema="dark"
                                        raio="10"
                                        path={`mailto:${sobre.email_agendamento}`}
                                    >
                                        Enviar e-mail
                                    </SimpleButton>
                                )}

                            </div>

                            {/* HORÁRIO */}

                            <div
                                className="vertical card"
                                id="cardHorario"
                            >

                                <h1>
                                    {sobre?.horario_titulo}
                                </h1>

                                <p>
                                    {sobre?.horario_descricao}
                                </p>

                            </div>

                            {/* ENDEREÇO */}

                            <div
                                className="vertical card"
                                id="cardEndereco"
                            >

                                <h1>
                                    {sobre?.endereco_titulo}
                                </h1>

                                <p>
                                    {sobre?.endereco_descricao}
                                </p>

                                {sobre?.link_mapa && (
                                    <SimpleButton
                                        tema="dark"
                                        raio="10"
                                        path={sobre.link_mapa}
                                    >
                                        Ver rotas
                                    </SimpleButton>
                                )}

                            </div>

                        </div>

                    </>

                )}

            </section>
        </>
    );
}