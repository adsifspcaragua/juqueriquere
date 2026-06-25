import { useEffect, useState } from "react";
import { db, type PontoInteresseDB } from "../../lib/dexie";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import Select from "../../components/ui/form/Select";
import { createPortal } from "react-dom";
import type Trilha from "../Trilhas/TrilhaInfo";
import distancia from "../../assets/icons/Distancia-light.webp";

export default function AdminPontos() {

    async function excluirPonto() {
        if (!pontoSelecionada) return;

        await db.pontos_interesse.delete(pontoSelecionada.id);

        setPontos((prev) =>
            prev.filter((t) => t.id !== pontoSelecionada.id)
        );

        setModalDelete(false);
        setPontoSelecionada(null);
    }

    const order = {
        "Nome A-Z": (a: any, b: any) => a.nome.localeCompare(b.nome),
        "Nome Z-A": (a: any, b: any) => b.nome.localeCompare(a.nome),
    } as const;

    type OrderKey = keyof typeof order;

    const [orderKey, setOrderKey] = useState<OrderKey>("Nome A-Z");
    const [search, setSearch] = useState("");

    const [modalDelete, setModalDelete] = useState(false);
    const [pontoSelecionada, setPontoSelecionada] = useState<any>(null);

    const [pontos, setPontos] = useState<PontoInteresseDB[]>([]);
    const [trilhas, setTrilhas] = useState<Trilha[]>([]);

    useEffect(() => {
        async function loadData() {
            const dadosTrilhas = await db.trilhas.toArray();
            const data = await db.pontos_interesse.toArray();
            
            if (data) setPontos(data);
            if (dadosTrilhas) setTrilhas(dadosTrilhas); 
        }

        loadData();
    }, []);

    const findTrilha = (ponto : PontoInteresseDB) => {
        const trilha = trilhas?.find(t => Number(t.id) === Number(ponto.trilha_id));
        return trilha?.nome || "Trilha não encontrada";
    }

    const abrirExcluir = (ponto: any) => {
        setPontoSelecionada(ponto);
        setModalDelete(true);
    };

    const cancelar = () => {
        setModalDelete(false);
        setPontoSelecionada(null);
    };

    return (
        <>
            <div className="paddingHeader2"></div>

            <section className="conteudo vertical gap15">

                <SimpleButton
                    path="/admin/"
                    type="back"
                    icon="setaBack"
                >
                    Voltar
                </SimpleButton>

                <div className="card vertical gap5 adminCard" id="adminPontosCard">
                    <h1>
                        Gerenciar Pontos
                    </h1>
                    <p>
                        Cadastre, edite e organize as pontos
                        do parque.
                    </p>
                </div>

                {createPortal(
                    <div
                        className="horizontal gap5"
                        id="filtros"
                    >
                        <Select
                            options={Object.keys(order)}
                            value={orderKey}
                            onChange={(value) =>
                                setOrderKey(value as OrderKey)
                            }
                            style="none"
                        />

                        <div className="pesquisa horizontal">
                            <div className="pesquisaIcon"></div>
                            <input
                                type="text"
                                placeholder="Pesquisar ponto..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        <div className="circleButton">
                            <SimpleButton
                                path="/admin/pontos/cadastrar"
                                icon="Plus"
                            >
                            </SimpleButton>
                        </div>
                    </div>,
                    document.body
                )}

                {createPortal(
                    modalDelete && (
                        <div className="modal vertical center">
                            <div className="modal-content card vertical gap15">
                                <h2>
                                    Deseja excluir <br />
                                    {pontoSelecionada?.nome}?
                                </h2>

                                <p>Esta ação não pode ser revertida.</p>

                                <div className="horizontal btnFull gap15">
                                    <SimpleButton tema="dark" icon="X" raio="10" onClick={cancelar}>
                                        Manter
                                    </SimpleButton>

                                    <SimpleButton tema="red" icon="Trash" raio="10" onClick={excluirPonto}>
                                        Excluir
                                    </SimpleButton>
                                </div>
                            </div>
                        </div>
                    ), document.body
                )}

                <div className="vertical gap5">
                    <h2>Pontos cadastrados</h2>

                    <div className="vertical gap5">
                        {pontos.map((ponto) => (
                            <div
                                className="card horizontal gap5 justify"
                                key={ponto.id}
                            >
                                <div className="cardPontoCompacto vertical gap15">
                                    <div className="vertical gap5">
                                        <h3>{ponto.nome}</h3>
                                        <p>{ponto.latitude}, {ponto.longitude}</p>
                                    </div>
                                    <div className="seloTrilha horizontal center">
                                        <img src={distancia}/>
                                        <p>{findTrilha(ponto)}</p>
                                    </div>
                                </div>

                                <div className="btnFull actions vertical gap5">
                                    <SimpleButton  icon="Edit" tema="dark" raio="10" path={`/admin/pontos/editar/${ponto.id}`}        >
                                        Editar
                                    </SimpleButton>
                                    <SimpleButton icon="Trash" tema="red" raio="10" onClick={() => abrirExcluir(ponto)}>
                                        Excluir
                                    </SimpleButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </section>

            {createPortal(<div className="paddingFooter"></div>,document.body)}
        </>
    );
}