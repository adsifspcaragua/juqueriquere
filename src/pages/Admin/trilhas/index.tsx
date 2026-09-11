import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { db } from "../../../lib/dexie";
import { deleteById } from "../../../lib/services/crud";
import { supabase } from "../../../lib/supabase";
import { deletarImagens } from "../../../lib/services/images";
import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import Select from "../../../components/ui/form/Select";
import QrCodeModal from "../../../components/ui/QrCodeModal";
import ProtectedRoute from "../../../components/Protected";
import type Trilha from "../../Trilhas/TrilhaInfo";

import "../../_styles/admin.css";

export default function AdminTrilhas() {
    const order = {
        "Nome A-Z": (a: Trilha, b: Trilha) =>
            a.nome.localeCompare(b.nome, "pt-BR"),
        "Nome Z-A": (a: Trilha, b: Trilha) =>
            b.nome.localeCompare(a.nome, "pt-BR"),
        "ID Crescente": (a: Trilha, b: Trilha) => a.id - b.id,
        "ID Decrescente": (a: Trilha, b: Trilha) => b.id - a.id,
    } as const;

    type OrderKey = keyof typeof order;

    const [trilhas, setTrilhas] = useState<Trilha[]>([]);
    const [orderKey, setOrderKey] = useState<OrderKey>("ID Crescente");
    const [search, setSearch] = useState("");

    const [modalDelete, setModalDelete] = useState(false);
    const [trilhaSelecionada, setTrilhaSelecionada] = useState<Trilha | null>(null);

    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [itemParaQrCode, setItemParaQrCode] = useState<Trilha | null>(null);

    useEffect(() => {
        async function loadData() {
            const data = await db.trilhas.toArray();
            setTrilhas(data as Trilha[]);
        }
        loadData();
    }, []);


async function excluirTrilha() {
    if (!trilhaSelecionada) return;

    try {
        // Busca no Supabase todas as imagens associadas a esta trilha
        const { data: imagensSupabase, error: errFetch } = await supabase
            .from("imagens")
            .select("id, caminho_arquivo")
            .eq("trilha_id", trilhaSelecionada.id);

        if (errFetch) throw errFetch;

        const imagensParaDeletar = imagensSupabase || [];
        const caminhosStorage = imagensParaDeletar
            .map((img) => img.caminho_arquivo)
            .filter((caminho): caminho is string => Boolean(caminho));

        // Apaga os arquivos do Storage do Supabase em lote
        if (caminhosStorage.length > 0) {
            await deletarImagens(caminhosStorage);
        }

        // Remove as linhas da tabela 'imagens' no Supabase e no Dexie
        if (imagensParaDeletar.length > 0) {
            const idsImagens = imagensParaDeletar.map((img) => img.id);

            for (const id of idsImagens) {
                await deleteById("imagens", id);
            }

            await db.imagens.bulkDelete(idsImagens);
        }

        // Remove a trilha do Supabase via deleteById
        const ok = await deleteById("trilhas", trilhaSelecionada.id);
        if (!ok) {
            throw new Error("Falha ao deletar a trilha no banco de dados.");
        }

        // Remove a trilha do cache local (Dexie)
        await db.trilhas.delete(trilhaSelecionada.id);

        // Atualiza a interface
        setTrilhas((prev) => prev.filter((t) => t.id !== trilhaSelecionada.id));
        setModalDelete(false);
        setTrilhaSelecionada(null);

    } catch (err) {
        console.error("Erro ao excluir trilha e suas imagens:", err);
        alert("Erro ao excluir trilha. Verifique se as permissões de DELETE estão ativas no Storage do Supabase.");
    }
}

    const abrirExcluir = (trilha: Trilha) => {
        setTrilhaSelecionada(trilha);
        setModalDelete(true);
    };

    const cancelar = () => {
        setModalDelete(false);
        setTrilhaSelecionada(null);
    };

    const trilhasFiltradas = trilhas
        .filter((trilha) =>
            trilha.nome.toLowerCase().includes(search.toLowerCase())
        )
        .sort(order[orderKey]);

    return (
        <ProtectedRoute>
            <div className="paddingHeader2"></div>

            <section className="conteudo vertical gap15 desktopWrap1-2">
                <div className="vertical gap15">
                    <SimpleButton path="/admin/" type="back" icon="setaBack">
                        Voltar
                    </SimpleButton>
                    <div className="card vertical gap5 adminCard" id="adminTrilhasCard">
                        <h1>Gerenciar Trilhas</h1>
                        <p>Cadastre, edite e organize as trilhas do parque.</p>
                    </div>
                </div>

                {createPortal(
                    <div className="horizontal gap5" id="filtros">
                        <Select
                            options={Object.keys(order)}
                            value={orderKey}
                            onChange={(value) => setOrderKey(value as OrderKey)}
                            style="none"
                        />
                        <div className="pesquisa horizontal">
                            <div className="pesquisaIcon"></div>
                            <input
                                type="text"
                                placeholder="Pesquisar trilha..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="circleButton">
                            <SimpleButton path="/admin/trilhas/cadastrar" icon="Plus" />
                        </div>
                    </div>,
                    document.body
                )}

                {/* MODAL DE EXCLUSÃO */}
                {modalDelete &&
                    createPortal(
                        <div className="modal vertical center">
                            <div className="modal-content card vertical gap15">
                                <h2>
                                    Deseja excluir <br />
                                    {trilhaSelecionada?.nome}?
                                </h2>
                                <p>Esta ação não pode ser revertida e apagará todas as imagens associadas.</p>
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
                    )}

                <QrCodeModal
                    isOpen={qrModalOpen}
                    onClose={() => {
                        setQrModalOpen(false);
                        setItemParaQrCode(null);
                    }}
                    path={itemParaQrCode ? `/trilha/${itemParaQrCode.id}` : ""}
                    title={itemParaQrCode?.nome || ""}
                />

                <div className="vertical gap15">
                    <div className="vertical gap5">
                        <h1>Trilhas cadastradas</h1>
                        <p>{trilhasFiltradas.length} trilha(s) encontrada(s).</p>
                    </div>

                    <div className="listaGrid desktopWrap gap15">
                        {trilhasFiltradas.map((trilha) => (
                            <div className="card horizontal gap5 justify" key={trilha.id}>
                                <div className="cardTrilhaCompacto vertical gap5">
                                    <h3>{trilha.nome}</h3>
                                    <p>{trilha.dificuldade}</p>
                                    <p>{trilha.extensao}</p>
                                </div>

                                <div className="btnFull actions vertical gap5">
                                    <SimpleButton
                                        icon="Scan"
                                        tema="dark"
                                        raio="10"
                                        onClick={() => {
                                            setItemParaQrCode(trilha);
                                            setQrModalOpen(true);
                                        }}
                                    >
                                        QR Code
                                    </SimpleButton>

                                    <SimpleButton
                                        icon="Edit"
                                        tema="dark"
                                        raio="10"
                                        path={`/admin/trilhas/editar/${trilha.id}`}
                                    >
                                        Editar
                                    </SimpleButton>

                                    <SimpleButton
                                        icon="Trash"
                                        tema="red"
                                        raio="10"
                                        onClick={() => abrirExcluir(trilha)}
                                    >
                                        Excluir
                                    </SimpleButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {createPortal(<div className="paddingFooter"></div>, document.body)}
        </ProtectedRoute>
    );
}