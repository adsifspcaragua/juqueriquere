import { useEffect, useState } from "react";
import { usePageTitle } from "../lib/hooks/usePageTitle";
import { supabase } from "../lib/supabase";

import Logo from "../assets/logo.webp";
import SimpleButton from "../components/ui/buttons/SimpleButton";

import imgNotFound from "../assets/img/imgNotFound.webp";

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

interface ImagemGaleria {
    id: number;
    caminho_arquivo: string;
    legenda?: string;
}

export default function Sobre() {
    usePageTitle("Sobre");

    const [sobre, setSobre] = useState<Sobre | null>(null);

    const [espacos, setEspacos] =
        useState<EspacoParqueComImagem[]>([]);

    const [imagensGaleria, setImagensGaleria] =
        useState<ImagemGaleria[]>([]);

    const [carregando, setCarregando] =
        useState(true);

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
             * BUSCAR GALERIA
             * ==========================================
             *
             * Todas as imagens ficam na mesma tabela
             * "imagens" e no mesmo bucket "imagens".
             *
             * As imagens da galeria são identificadas
             * pelo caminho:
             *
             * galeria/arquivo.webp
             *
             * Não utilizamos coluna "ordem".
             */

            const {
                data: galeriaData,
                error: galeriaError
            } = await supabase
                .from("imagens")
                .select(
                    "id, caminho_arquivo, legenda"
                )
                .like(
                    "caminho_arquivo",
                    "galeria/%"
                );

            if (galeriaError) {
                console.error(
                    "Erro ao carregar imagens da galeria:",
                    galeriaError
                );

                setImagensGaleria([]);
            } else {
                setImagensGaleria(
                    galeriaData || []
                );
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

            const espacosComImagem:
                EspacoParqueComImagem[] =
                await Promise.all(
                    espacosData.map(
                        async (espaco) => {

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
                                .select(
                                    "id, caminho_arquivo, legenda"
                                )
                                .eq(
                                    "id",
                                    espaco.imagem_id
                                )
                                .maybeSingle();

                            if (
                                imagemError ||
                                !imagemData
                            ) {
                                return {
                                    ...espaco,
                                    imagemUrl: undefined
                                };
                            }

                            /*
                             * caminho_arquivo contém somente
                             * o caminho do arquivo dentro do Storage.
                             */

                            const {
                                data: urlData
                            } = supabase
                                .storage
                                .from(
                                    BUCKET_IMAGENS
                                )
                                .getPublicUrl(
                                    imagemData.caminho_arquivo
                                );

                            return {
                                ...espaco,
                                imagemUrl:
                                    urlData.publicUrl
                            };
                        }
                    )
                );

            setEspacos(
                espacosComImagem
            );

        } catch (error) {
            console.error(
                "Erro ao carregar página Sobre:",
                error
            );

            alert(
                "Não foi possível carregar as informações do parque."
            );
        } finally {
            setCarregando(false);
        }
    }

    /*
     * ==========================================
     * URL DAS IMAGENS DA GALERIA
     * ==========================================
     */

    function obterUrlImagemGaleria(
        caminho: string
    ) {
        const {
            data
        } = supabase
            .storage
            .from(BUCKET_IMAGENS)
            .getPublicUrl(caminho);

        return data.publicUrl;
    }

    return (
        <>
            <div className="paddingHeader"></div>

            <section
                className="vertical conteudo"
                id="sobre"
            >

                <div
                    className="horizontal logo"
                    style={{ width: "100%" }}
                >
                    <img
                        src={Logo}
                        alt="Logo Parque"
                        style={{ height: 45 }}
                    />
                </div>

                {carregando && !sobre ? (
                    <p>
                        Carregando informações
                        do parque...
                    </p>
                ) : (

                    <>
                        <div className="desktopWrap gap15">

                            {/*
                             * ==========================================
                             * GALERIA
                             * ==========================================
                             */}

                            <div
                                className="carrossel horizontal galeria"
                            >

                                {imagensGaleria.map(
                                    (imagem) => (

                                        <img
                                            key={imagem.id}
                                            src={obterUrlImagemGaleria(
                                                imagem.caminho_arquivo
                                            )}
                                            className="carrosselCard"
                                            alt={
                                                imagem.legenda ||
                                                "Imagem do Parque"
                                            }
                                        />

                                    )
                                )}

                            </div>

                            <p>
                                {sobre?.descricao}

                                <br />
                                <br />

                                {sobre?.area}
                            </p>

                        </div>

                        <div className="linhaPontilhadaLight"></div>

                        <h1>
                            Espaços do Parque
                        </h1>

                        <div
                            className="carrossel horizontal"
                            id="carrosselEspacos"
                        >

                            {espacos.map(
                                (espaco) => (

                                    <div
                                        key={espaco.id}
                                        className="carrosselCard espacoCard vertical"
                                        style={{
                                            backgroundImage:
                                                `url(${espaco.imagemUrl || imgNotFound})`
                                        }}
                                    >

                                        {espaco.imagemUrl && (
                                            <img
                                                src={
                                                    espaco.imagemUrl
                                                }
                                                alt={
                                                    espaco.titulo
                                                }
                                            />
                                        )}

                                        <div
                                            className="fade vertical gap5"
                                        >
                                            <h1>
                                                {
                                                    espaco.titulo
                                                }
                                            </h1>

                                            <p>
                                                {
                                                    espaco.descricao
                                                }
                                            </p>
                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                        <div className="linhaPontilhadaLight"></div>

                        {/* ==========================================
                            ACESSIBILIDADE
                        ========================================== */}

                        <div className="vertical gap5">

                            <h1>
                                {
                                    sobre?.acessibilidade_titulo ||
                                    "Acessibilidade"
                                }
                            </h1>

                            <p>
                                {
                                    sobre?.acessibilidade_descricao
                                }
                            </p>

                        </div>

                        <div className="linhaPontilhadaLight"></div>

                        {/* ==========================================
                            VISITE O PARQUE
                        ========================================== */}

                        <h1>
                            Visite o Parque
                        </h1>

                        <div
                            className="vertical gap15 desktopWrap3"
                        >

                            {/* VISITAS EM GRUPO */}

                            <div
                                className="vertical card"
                                id="cardGrupo"
                            >

                                <h1>
                                    {
                                        sobre?.visitas_grupo_titulo
                                    }
                                </h1>

                                <p>
                                    {
                                        sobre?.visitas_grupo_descricao
                                    }
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
                                    {
                                        sobre?.horario_titulo
                                    }
                                </h1>

                                <p>
                                    {
                                        sobre?.horario_descricao
                                    }
                                </p>

                            </div>

                            {/* ENDEREÇO */}

                            <div
                                className="vertical card"
                                id="cardEndereco"
                            >

                                <h1>
                                    {
                                        sobre?.endereco_titulo
                                    }
                                </h1>

                                <p>
                                    {
                                        sobre?.endereco_descricao
                                    }
                                </p>

                                {sobre?.link_mapa && (
                                    <SimpleButton
                                        tema="dark"
                                        raio="10"
                                        path={
                                            sobre.link_mapa
                                        }
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