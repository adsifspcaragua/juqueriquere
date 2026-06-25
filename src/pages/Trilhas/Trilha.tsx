import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { db, type PontoInteresseDB } from "../../lib/dexie";

import NotFound from "../NotFound";
import type TrilhaType from "./TrilhaInfo";

import SimpleButton from "../../components/ui/buttons/SimpleButton";
import TrilhasMap from "../../components/ui/TrilhasMap";
import DraggableCarousel from "../../components/ui/DraggableCarousel";
import { icons } from "../../components/ui/icons";
import CardPonto from "../../components/ui/CardPonto";
import Switch from "../../components/ui/buttons/Switch";
import imgNotFound from "../../assets/img/imgNotFound.webp"


export default function Trilha() {
    const { Distancia, Tempo, Dificuldade } = icons.default;

    const { id: paramsId } = useParams();
    const id = Number(paramsId);

    const [trilha, setTrilha] = useState<TrilhaType | null>(null);
    const [loading, setLoading] = useState(true);

    const [aba, setAba] = useState("Descrição");

    const [hl, setHl] = useState<(number | string)[]>([id]);

    const [imagens, setImagemArray] = useState<string[]>();

    const [pontosDados, setPontosDados] = useState<PontoInteresseDB[]>();
    const [pontoSelecionado, setPontoSelecionado] = useState<string>();


    useEffect(() => {
        async function carregar() {
            const resultado = await db.trilhas.get(id);

            if (!resultado) {
                setLoading(false);
                return;
            }

            const trilhaConvertida: TrilhaType = {
                ...resultado,
                id: resultado.id ?? 0,

                pontos_interesse:
                    typeof resultado.pontos_interesse === "string"
                        ? JSON.parse(resultado.pontos_interesse)
                        : resultado.pontos_interesse ?? [],

                ramais:
                    typeof resultado.ramais === "string"
                        ? JSON.parse(resultado.ramais)
                        : resultado.ramais ?? [],

                pontos_no_mapa: Array.isArray(resultado.pontos_no_mapa)
                    ? resultado.pontos_no_mapa
                    : [],
            } as TrilhaType;
            const pontos = await db.pontos_interesse.where('trilha_id').equals(Number(id)).toArray();
            setPontosDados(pontos)

            const arrayIMG : string[] = [];
            const imagens = await db.imagens.where('trilha_id').equals(Number(id)).toArray();
            imagens.forEach((imagem) => (
                arrayIMG.push(
                    imagem.caminho_arquivo &&
                    `${imagem.caminho_arquivo}`
                )
            ))
            setImagemArray(arrayIMG)

            setTrilha(trilhaConvertida);
            setLoading(false);
        }

        carregar();
    }, [id]);

    if (loading) {
        return (
            <>
                <div className="paddingHeader"></div>

                <section className="conteudo">
                    <p>Carregando...</p>
                </section>
            </>
        );
    }

    if (!trilha) {
        return <NotFound />;
    }
    const pontosList = (pontosDados ?? []).map(
        (ponto, index) => (
            <div
                id={String(index)}
                key={ponto.nome}
            >
                <CardPonto
                    ponto={ponto}
                    trilhaId={trilha.id}
                />
            </div>
        )
    );

    const imagensList = (imagens ?? []).map(
        (imagem, index) => (
            <div
                key={String(index)}
            >
                <img
                src={imagem}
                >
                </img>
            </div>
        )
    );

    const normalize = (str: string) =>
        str.toLowerCase().replace(".", "").trim();

    const findCarousselID = (
        targetName: string,
        list: any[]
    ) => {
        const normalizedTarget = normalize(targetName);

        return list.find(
            (ponto: any) =>
                normalize(String(ponto.key)) ===
                normalizedTarget
        )?.props.id;
    };

    const options = {
        "Mapa completo": id,
        ...Object.fromEntries(
            (trilha.ramais ?? []).map((r) => [
                r.nome,
                r.id,
            ])
        ),
    } as Record<string, number | string>;

    return (
        <>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">
                <SimpleButton
                    path="/explorar/"
                    type="back"
                    icon="setaBack"
                >
                    Voltar para Mapa
                </SimpleButton>

                <div className="desktopWrap">
                    <div className="vertical">
                        <DraggableCarousel
                        items={imagensList}
                        emptyImage={imgNotFound}
                        >
                        </DraggableCarousel>
                    </div>
                    <div className="vertical gap15">
                        <div className="desktopWrap gap15">
                            <div className="vertical gap5">
                                <h1>{trilha.nome}</h1>
                                <p>{trilha.descricao_curta}</p>
                            </div>
                            <div className="horizontal destaquesTrilha">
                                <div className="vertical gap5">
                                    <div className="horizontal gap5">
                                        <img src={Distancia} />
                                        <p>Distância</p>
                                    </div>
                                    <p>{trilha.extensao}</p>
                                </div>
                                <div className="linhaVertical"></div>
                                <div className="vertical gap5">
                                    <div className="horizontal gap5">
                                        <img src={Tempo} />
                                        <p>Duração</p>
                                    </div>
                                    <p>{trilha.duracao}</p>
                                </div>
                                <div className="linhaVertical"></div>
                                <div className="vertical gap5">
                                    <div className="horizontal gap5">
                                        <img src={Dificuldade} />
                                        <p>Dificuldade</p>
                                    </div>
                                    <p>{trilha.dificuldade}</p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="vertical gap5"
                            id="trilhaSwitch"
                        >
                            <Switch
                                options={[
                                    "Descrição",
                                    "Mapa da trilha",
                                ]}
                                value={aba}
                                onChange={setAba}
                                style="light"
                            />
                            {aba === "Descrição" && (
                                <div className="vertical gap15">
                                    <div className="vertical gap5 card switchCard">
                                        <h1>Descrição</h1>
                                        <p>{trilha.descricao}</p>
                                    </div>
                                </div>
                            )}
                            {aba === "Mapa da trilha" && (
                                <div className="vertical card gap15 switchCard">
                                    
                                    {(trilha.ramais ?? []).length >
                                        0 && (
                                            <Switch
                                                options={Object.keys(
                                                    options
                                                )}
                                                value={Object.keys(options).find((key) =>
                                                    options[key] === hl[0]
                                                ) ??
                                                    "Mapa completo"
                                                }
                                                onChange={(valor: string) => setHl([options[valor] as string])
                                                }
                                            />
                                        )
                                    }
                                    
                                    <div className="desktopWrap gap30">
                                        <div className="vertical gap5">
                                            <h1>Mapa da trilha</h1>
                                            <div className="mapa">
                                                <TrilhasMap
                                                    highlight={hl}
                                                    id={[id]}
                                                    onPointClick={(
                                                        nome
                                                    ) =>
                                                        setPontoSelecionado(
                                                            findCarousselID(
                                                                nome,
                                                                pontosList
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="vertical gap5">
                                            <h1>
                                                Pontos de Interesse
                                            </h1>
                                            <DraggableCarousel
                                                items={pontosList}
                                                activeId={
                                                    pontoSelecionado
                                                }
                                                onChange={(id) =>
                                                    setPontoSelecionado(
                                                        String(id)
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}