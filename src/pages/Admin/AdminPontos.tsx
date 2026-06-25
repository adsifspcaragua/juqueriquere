import { useEffect, useState } from "react";
import { db } from "../../lib/dexie";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import Select from "../../components/ui/form/Select";
import type Ponto from "../Trilhas/TrilhaInfo";
import { createPortal } from "react-dom";


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

    const [pontos, setPontos] = useState<Ponto[]>([]);


    useEffect(() => {
        async function loadData() {
            const data = await db.pontos_interesse.toArray();
            setPontos(data as Ponto[]);
        }

        loadData();
    }, []);

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
            <div className="paddingHeader"></div>

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

                {modalDelete && (
                    <div className="modal">
                        <div className="modal-content">

                            <h2>
                                Deseja excluir:
                                <br />

                                {pontoSelecionada?.nome}?
                            </h2>

                            <button onClick={excluirPonto}>
                                Excluir
                            </button>

                            <button
                                onClick={cancelar}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>

                )}

                <div className="vertical gap5">
                    <h2>Pontos cadastradas</h2>

                    <div className="vertical gap5">
                        {pontos.map((ponto) => (
                            <div
                                className="card horizontal gap5 justify"
                                key={ponto.id}
                            >
                                <div className="cardPontoCompacto vertical gap5">
                                    <h3>{ponto.nome}</h3>
                                    <p>{ponto.dificuldade}</p>
                                    <p>{ponto.extensao}</p>
                                </div>

                                <div className="btnFull actions vertical gap5">
                                    <SimpleButton  icon="Edit" tema="dark" raio="10" path={`/admin/pontos/editar/${ponto.id}`}                                        >
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