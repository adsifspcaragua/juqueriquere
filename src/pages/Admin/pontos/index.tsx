import { useEffect, useState } from "react";
import { db, type PontoInteresseDB } from "../../../lib/dexie";
import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import Select from "../../../components/ui/form/Select";
import { createPortal } from "react-dom";
import type Trilha from "../../Trilhas/TrilhaInfo";
import distancia from "../../../assets/icons/Distancia-light.webp";
import { supabase } from "../../../lib/supabase";
import ProtectedRoute from "../../../components/Protected";
import QrCodeModal from "../../../components/ui/QrCodeModal";
import '../../_styles/admin.css';
import { Link } from "react-router-dom";

export default function AdminPontos() {

    async function excluirPonto() {
        if (!pontoSelecionada) return;

        await db.pontos_interesse.delete(pontoSelecionada.id);

        try {
            const { error: erroDeletar } = await supabase
                .from("pontos_interesse")
                .delete()
                .eq('id', pontoSelecionada.id);

            if (erroDeletar) throw erroDeletar;
        } catch (error: any) {
            alert("erro ao deletar \n tente novamente mais tarde.");
            console.log(error);
        } finally {
            setPontos((prev) =>
                prev.filter((t) => t.id !== pontoSelecionada.id)
            );
        }

        setModalDelete(false);
        setPontoSelecionada(null);
    }

    const order = {
        "Nome A-Z": (a: PontoInteresseDB, b: PontoInteresseDB) => a.nome.localeCompare(b.nome),
        "Nome Z-A": (a: PontoInteresseDB, b: PontoInteresseDB) => b.nome.localeCompare(a.nome),
    } as const;

    type OrderKey = keyof typeof order;

    const [orderKey, setOrderKey] = useState<OrderKey>("Nome A-Z");
    const [search, setSearch] = useState("");

    const [modalDelete, setModalDelete] = useState(false);
    const [pontoSelecionada, setPontoSelecionada] = useState<any>(null);

    const [pontos, setPontos] = useState<PontoInteresseDB[]>([]);
    const [trilhas, setTrilhas] = useState<Trilha[]>([]);

    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [itemParaQrCode, setItemParaQrCode] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            const dadosTrilhas = await db.trilhas.toArray();
            const data = await db.pontos_interesse.toArray();

            if (data) setPontos(data);
            if (dadosTrilhas) setTrilhas(dadosTrilhas as unknown as Trilha[]);
        }

        loadData();
    }, []);

    const findTrilha = (ponto: PontoInteresseDB) => {
        if (!ponto.trilha_id) return null;
        return trilhas?.find(t => Number(t.id) === Number(ponto.trilha_id)) || null;
    }

    const abrirExcluir = (ponto: any) => {
        setPontoSelecionada(ponto);
        setModalDelete(true);
    };

    const cancelar = () => {
        setModalDelete(false);
        setPontoSelecionada(null);
    };

    // Aplica a busca por nome do ponto, planta ou nome da trilha e ordena os resultados
    const pontosFiltrados = pontos
        .filter((ponto) => {
            const termo = search.toLowerCase().trim();
            if (!termo) return true;

            const nomePonto = ponto.nome?.toLowerCase() || "";
            const plantaPonto = ponto.planta?.toLowerCase() || "";
            const trilha = findTrilha(ponto);
            const nomeTrilha = trilha?.nome?.toLowerCase() || "";

            return (
                nomePonto.includes(termo) ||
                plantaPonto.includes(termo) ||
                nomeTrilha.includes(termo)
            );
        })
        .sort(order[orderKey]);

    return (
        <ProtectedRoute>
            <div className="paddingHeader2"></div>

            <section className="conteudo vertical gap15 desktopWrap1-2">

                <div className="vertical gap15">
                    <SimpleButton
                        path="/admin/"
                        type="back"
                        icon="setaBack"
                    >
                        Voltar
                    </SimpleButton>
                    <div className="card vertical gap5 adminCard" id="adminPontosCard">
                        <h1>Gerenciar Pontos</h1>
                        <p>
                            Cadastre, edite e organize os pontos do parque.
                        </p>
                    </div>
                    <div
                        className="card vertical gap15 filtrosDesktop right"
                        id="filtros"
                    >
                        <div className="pesquisa horizontal w100 center">
                            <div className="pesquisaIcon"></div>
                            <input
                                type="text"
                                placeholder="Pesquisar por ponto, planta ou trilha..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="horizontal justify w100 center">
                            <SimpleButton
                                path="/admin/pontos/cadastrar"
                                icon="PlusDark"
                                tema="dark"
                                raio="10"
                            >
                                Cadastrar ponto
                            </SimpleButton>
                            <Select
                                options={Object.keys(order)}
                                value={orderKey}
                                onChange={(value) =>
                                    setOrderKey(value as OrderKey)
                                }
                                style="none"
                            />
                        </div>
                    </div>
                </div>

                {createPortal(
                    <div
                        className="horizontal gap5 filtrosMobile"
                        id="filtros"
                    >
                        <Select
                            options={Object.keys(order)}
                            value={orderKey}
                            onChange={(value) =>
                                setOrderKey(value as OrderKey)
                            }
                            style="none"
                            compacto
                            icon="select"
                        />

                        <div className="pesquisa horizontal">
                            <div className="pesquisaIcon"></div>
                            <input
                                type="text"
                                placeholder="Pesquisar ponto..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="circleButton">
                            <SimpleButton
                                path="/admin/pontos/cadastrar"
                                icon="Plus"
                            />
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

                <QrCodeModal 
                    isOpen={qrModalOpen} 
                    onClose={() => {
                        setQrModalOpen(false);
                        setItemParaQrCode(null);
                    }} 
                    path={
                        itemParaQrCode
                            ? itemParaQrCode.trilha_id
                                ? `trilha/${itemParaQrCode.trilha_id}/ponto/${itemParaQrCode.id}`
                                : `ponto/${itemParaQrCode.id}`
                            : ''
                    } 
                    title={itemParaQrCode?.nome || ''} 
                />

                <div className="vertical gap15">
                    <div className="vertical gap5">
                        <h2>Pontos cadastrados</h2>
                        <h4>({pontosFiltrados.length}) pontos encontrados</h4>
                    </div>

                    <div className="vertical gap15 desktopWrap">
                        {pontosFiltrados.map((ponto) => {
                            const trilha = findTrilha(ponto);
                            const pathPonto = trilha
                                ? `/trilha/${trilha.id}/ponto/${ponto.id}?from=admin/pontos`
                                : `/trilha/null/ponto/${ponto.id}?from=admin/pontos`;//isso mesmo, não é o correto, mas a correção virá quando tempo existir

                            return (
                                <div
                                    className="card horizontal gap5 justify"
                                    key={ponto.id}
                                >
                                    <div className="cardPontoCompacto vertical gap15">
                                        <div className="vertical gap5">
                                            <SimpleButton tema="none" icon="none" path={pathPonto}>
                                                <h2>{ponto.nome}</h2>
                                            </SimpleButton>
                                            
                                            {ponto.planta && <h4>{ponto.planta}</h4>}
                                            {ponto.latitude && ponto.longitude && (
                                                <p>{ponto.latitude}, {ponto.longitude}</p>
                                            )}
                                        </div>

                                        {trilha ? (
                                            <Link to={`/trilha/${trilha.id}`} className="seloTrilha horizontal center">
                                                <img src={distancia} alt="Ícone de distância" />
                                                <p>{trilha.nome}</p>
                                            </Link>
                                        ) : (
                                            <div className="seloTrilha horizontal center">
                                                <p>Sem trilha associada</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="btnFull actions vertical gap5">
                                        <SimpleButton 
                                            icon="QR" 
                                            tema="dark" 
                                            raio="10" 
                                            onClick={() => {
                                                setItemParaQrCode(ponto);
                                                setQrModalOpen(true);
                                            }}
                                        />

                                        <SimpleButton icon="Edit" tema="dark" raio="10" path={`/admin/pontos/editar/${ponto.id}`} />

                                        <SimpleButton icon="Trash" tema="red" raio="10" onClick={() => abrirExcluir(ponto)} />
                                    </div>
                                </div>
                            );
                        })}

                        {pontosFiltrados.length === 0 && (
                            <p style={{ padding: "10px 0" }}>Nenhum ponto encontrado.</p>
                        )}
                    </div>
                </div>

            </section>

            {createPortal(<div className="paddingFooter"></div>, document.body)}
        </ProtectedRoute>
    );
}