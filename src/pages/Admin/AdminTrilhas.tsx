import { useEffect, useState } from "react";
import { db } from "../../lib/dexie";
import SimpleButton from "../../components/ui/buttons/SimpleButton";
import Select from "../../components/ui/form/Select";
import type Trilha from "../Trilhas/TrilhaInfo";
import { createPortal } from "react-dom";


export default function AdminTrilhas() {

    async function excluirTrilha() {
        if (!trilhaSelecionada) return;

        await db.trilhas.delete(trilhaSelecionada.id);

        setTrilhas((prev) =>
            prev.filter((t) => t.id !== trilhaSelecionada.id)
        );

        setModalDelete(false);
        setTrilhaSelecionada(null);
    }

    const order = {
        "Nome A-Z": (a: any, b: any) => a.nome.localeCompare(b.nome),
        "Nome Z-A": (a: any, b: any) => b.nome.localeCompare(a.nome),
    } as const;

    type OrderKey = keyof typeof order;

    const [orderKey, setOrderKey] = useState<OrderKey>("Nome A-Z");
    const [search, setSearch] = useState("");

    const [modalDelete, setModalDelete] = useState(false);
    const [trilhaSelecionada, setTrilhaSelecionada] = useState<any>(null);

    const [trilhas, setTrilhas] = useState<Trilha[]>([]);


    useEffect(() => {
        async function loadData() {
            const data = await db.trilhas.toArray();
            setTrilhas(data as Trilha[]);
        }

        loadData();
    }, []);

    const abrirExcluir = (trilha: any) => {
        setTrilhaSelecionada(trilha);
        setModalDelete(true);
    };

    const cancelar = () => {
        setModalDelete(false);
        setTrilhaSelecionada(null);
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

                <div className="card vertical gap5 adminCard" id="adminTrilhasCard">

                    <h1>
                        Gerenciar Trilhas
                    </h1>

                    <p>
                        Cadastre, edite e organize as trilhas
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
                                placeholder="Pesquisar trilha..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                        <div className="circleButton">
                            <SimpleButton
                                path="/admin/trilhas/cadastrar"
                                icon="Plus"
                            >
                            </SimpleButton>
                        </div>

                    </div>,
                    document.body
                )}
                

                {modalDelete && (
                    createPortal(
                        <div className = "modal vertical center" >
                            <div className="modal-content card vertical gap15">

                                <h2>
                                    Deseja excluir <br/>
                                    {trilhaSelecionada?.nome}?
                                </h2>

                                <p>Esta ação não pode ser revertida.</p>

                                <div className="horizontal btnFull gap15">
                                    <SimpleButton tema="dark" icon="X" raio="10" onClick={cancelar}>
                                        Manter
                                    </SimpleButton>

                                    <SimpleButton tema="red" icon="Trash" raio="10" onClick={excluirTrilha}>
                                        Excluir
                                    </SimpleButton>
                                </div>

                            </div>
                    </div>, 
                    document.body
                    )

                )}

                <div className="vertical gap5">
                    <h2>Trilhas cadastradas</h2>

                    <div className="vertical gap5">
                        {trilhas.map((trilha) => (
                            <div
                                className="card horizontal gap5 justify"
                                key={trilha.id}
                            >
                                <div className="cardTrilhaCompacto vertical gap5">
                                    <h3>{trilha.nome}</h3>
                                    <p>{trilha.dificuldade}</p>
                                    <p>{trilha.extensao}</p>
                                </div>

                                <div className="btnFull actions vertical gap5">
                                    <SimpleButton  icon="Edit" tema="dark" raio="10" path={`/admin/trilhas/editar/${trilha.id}`}                                        >
                                        Editar
                                    </SimpleButton>
                                    <SimpleButton icon="Trash" tema="red" raio="10" onClick={() => abrirExcluir(trilha)}>
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