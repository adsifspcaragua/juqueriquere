import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from "../lib/hooks/usePageTitle.ts";

import Select from '../components/ui/form/Select.tsx';
import CardPonto from '../components/ui/CardPonto.tsx';
import { db, type PontoInteresseDB, type TrilhaDB } from '../lib/dexie.ts';
import '../components/styles/CardTrilha.css';
import '../components/styles/CardPonto.css';
import SimpleButton from '../components/ui/buttons/SimpleButton.tsx';

const ORDER_OPTIONS = {
    "Nome A-Z": (a: PontoInteresseDB, b: PontoInteresseDB) =>
        (a.nome || "").localeCompare(b.nome || ""),
    "Nome Z-A": (a: PontoInteresseDB, b: PontoInteresseDB) =>
        (b.nome || "").localeCompare(a.nome || ""),
} as const;

type OrderKey = keyof typeof ORDER_OPTIONS;

export default function Pontos() {
    usePageTitle("Pontos de Interesse");

    const [searchParams, setSearchParams] = useSearchParams();

    // Ler ambos os parâmetros da URL
    const trilhaParam = searchParams.get("trilha");
    const ordemParam = (searchParams.get("ordem") as OrderKey) || "Nome A-Z";

    const [search, setSearch] = useState("");
    const [pontosDados, setPontosDados] = useState<PontoInteresseDB[]>([]);
    const [trilhasDados, setTrilhasDados] = useState<TrilhaDB[]>([]);

    useEffect(() => {
        async function carregarDados() {
            try {
                const [pontos, trilhas] = await Promise.all([
                    db.pontos_interesse.toArray(),
                    db.trilhas.toArray(),
                ]);

                if (pontos) setPontosDados(pontos);
                if (trilhas) setTrilhasDados(trilhas);
            } catch (error) {
                console.error("Erro ao carregar dados do banco:", error);
            }
        }

        carregarDados();
    }, []);

    // Atualiza a trilha MANTENDO a ordem atual na URL
    const handleSetTrilhaParam = (val: string | null) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            if (val !== null && val !== "") {
                newParams.set("trilha", val);
            } else {
                newParams.delete("trilha");
            }
            return newParams;
        }, { replace: true });
    };

    // Atualiza a ordem MANTENDO a trilha atual na URL
    const handleSetOrderParam = (val: OrderKey) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            if (val && val !== "Nome A-Z") {
                newParams.set("ordem", val);
            } else {
                newParams.delete("ordem");
            }
            return newParams;
        }, { replace: true });
    };

    const trilhaSelecionada = useMemo(() => {
        if (!trilhaParam || trilhaParam === "sem-trilha") return null;
        return trilhasDados.find((t) => String(t.id) === String(trilhaParam)) || null;
    }, [trilhasDados, trilhaParam]);

    // OPÇÕES DESKTOP
    const orderOptionsKeys = useMemo(() => Object.keys(ORDER_OPTIONS) as OrderKey[], []);

    const trilhaOptionsDesktop = useMemo(() => {
        return [
            "Todas as trilhas",
            "Pontos sem trilha",
            ...trilhasDados.map((t) => t.nome),
        ];
    }, [trilhasDados]);

    const valorTrilhaDesktop = useMemo(() => {
        if (trilhaParam === "sem-trilha") return "Pontos sem trilha";
        if (trilhaSelecionada) return trilhaSelecionada.nome;
        return "Todas as trilhas";
    }, [trilhaParam, trilhaSelecionada]);

    const handleTrilhaChange = (optionValue: string) => {
        if (optionValue === "Todas as trilhas") {
            handleSetTrilhaParam(null);
        } else if (optionValue === "Pontos sem trilha") {
            handleSetTrilhaParam("sem-trilha");
        } else {
            const trilha = trilhasDados.find((t) => t.nome === optionValue);
            if (trilha) {
                handleSetTrilhaParam(String(trilha.id));
            }
        }
    };

    // OPÇÕES MOBILE
    const mobileOptions = useMemo(() => {
        return [
            "Todas as trilhas",
            "Pontos sem trilha",
            ...trilhasDados.map((t) => `Trilha: ${t.nome}`),
            ...orderOptionsKeys.map((k) => `Ordem: ${k}`),
        ];
    }, [trilhasDados, orderOptionsKeys]);

    const valorSelectMobile = useMemo(() => {
        if (trilhaParam === "sem-trilha") return "Pontos sem trilha";
        if (trilhaSelecionada) return `Trilha: ${trilhaSelecionada.nome}`;
        if (ordemParam !== "Nome A-Z") return `Ordem: ${ordemParam}`;
        return "Todas as trilhas";
    }, [trilhaParam, trilhaSelecionada, ordemParam]);

    const handleMobileSelectChange = (value: string) => {
        if (value.startsWith("Ordem: ")) {
            const key = value.replace("Ordem: ", "") as OrderKey;
            handleSetOrderParam(key);
        } else if (value.startsWith("Trilha: ")) {
            const nomeTrilha = value.replace("Trilha: ", "");
            const trilha = trilhasDados.find((t) => t.nome === nomeTrilha);
            if (trilha) {
                handleSetTrilhaParam(String(trilha.id));
            }
        } else if (value === "Pontos sem trilha") {
            handleSetTrilhaParam("sem-trilha");
        } else if (value === "Todas as trilhas") {
            handleSetTrilhaParam(null);
        }
    };

    // FILTRAGEM E ORDENAÇÃO
    const pontosFiltrados = useMemo(() => {
        const termo = search.trim().toLowerCase();
        const sortFn = ORDER_OPTIONS[ordemParam] || ORDER_OPTIONS["Nome A-Z"];

        return pontosDados
            .filter((item) => {
                const trilhaDoPonto = trilhasDados.find((t) => String(t.id) === String(item.trilha_id));
                const nomeTrilha = trilhaDoPonto?.nome || "";

                const batePesquisa =
                    !termo ||
                    (item.nome || "").toLowerCase().includes(termo) ||
                    (item.planta || "").toLowerCase().includes(termo) ||
                    nomeTrilha.toLowerCase().includes(termo);

                let bateTrilha = true;
                if (trilhaParam === "sem-trilha") {
                    bateTrilha = !item.trilha_id;
                } else if (trilhaParam) {
                    bateTrilha = String(item.trilha_id) === String(trilhaParam);
                }

                return batePesquisa && bateTrilha;
            })
            .sort(sortFn);
    }, [pontosDados, trilhasDados, search, trilhaParam, ordemParam]);

    const temFiltroAtivo = Boolean(search || trilhaParam || ordemParam !== "Nome A-Z");

    const limparFiltros = () => {
        setSearch("");
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.delete("trilha");
            newParams.delete("ordem");
            return newParams;
        }, { replace: true });
    };

    return (
        <>
            {createPortal(
                <div className="horizontal gap5 filtrosMobile" id="filtros">
                    <div className="pesquisa horizontal">
                        <div className="pesquisaIcon"></div>
                        <input
                            type="text"
                            placeholder="Pesquisar por ponto, planta ou trilha..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select
                        options={mobileOptions}
                        onChange={handleMobileSelectChange}
                        value={valorSelectMobile}
                        compacto
                        style="none"
                    />
                </div>,
                document.body
            )}

            <div className="paddingHeader2"></div>

            <section>
                <div className="conteudo vertical desktopWrap1-2">
                    <div className="vertical gap15">
                        <div className="img-fade" id="capivara"></div>

                        <div className="info vertical gap5">
                            <h1>Pontos</h1>
                            <p>
                                Descubra as espécies nativas do parque e aprenda mais sobre
                                os seres que habitam esse espaço.
                            </p>
                        </div>

                        <div className="vertical gap15 filtrosDesktop card right" id="filtros">
                            <div className="pesquisa horizontal center w100">
                                <div className="pesquisaIcon"></div>
                                <input
                                    type="text"
                                    placeholder="Pesquisar por ponto, planta ou trilha..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="vertical gap5 right">
                                <div className="horizontal gap5 center">
                                    <p>Exibir pontos em: </p>
                                    <Select
                                        options={trilhaOptionsDesktop}
                                        onChange={handleTrilhaChange}
                                        value={valorTrilhaDesktop}
                                        style="none"
                                        icon='select'
                                    />
                                </div>

                                <div className="horizontal gap5 center">
                                    <p>Ordenar por: </p>
                                    <Select
                                        options={orderOptionsKeys}
                                        onChange={(val) => handleSetOrderParam(val as OrderKey)}
                                        value={ordemParam}
                                        style="none"
                                        icon='select'
                                    />
                                </div>
                            </div>

                            {temFiltroAtivo && (
                                <>
                                    <div className="linhaHorizontalDark"></div>
                                    <div className="vertical gap15 w100">
                                        <h4>Filtros aplicados:</h4>

                                        <div className="vertical gap5">
                                            {search && (
                                                <div className="horizontal gap5 justify center">
                                                    <SimpleButton
                                                        tema="light"
                                                        icon="X"
                                                        onClick={() => setSearch("")}
                                                    >
                                                        Busca: "{search}"
                                                    </SimpleButton>
                                                </div>
                                            )}
                                            {trilhaParam && (
                                                <div className="horizontal gap5 justify center">
                                                    <SimpleButton
                                                        tema="light"
                                                        icon="X"
                                                        onClick={() => handleSetTrilhaParam(null)}
                                                    >
                                                        {trilhaParam === "sem-trilha"
                                                            ? "Pontos sem trilha"
                                                            : trilhaSelecionada
                                                            ? `Trilha: ${trilhaSelecionada.nome}`
                                                            : "Trilha selecionada"}
                                                    </SimpleButton>
                                                </div>
                                            )}
                                            {ordemParam !== "Nome A-Z" && (
                                                <div className="horizontal gap5 justify center">
                                                    <SimpleButton
                                                        tema="light"
                                                        icon="X"
                                                        onClick={() => handleSetOrderParam("Nome A-Z")}
                                                    >
                                                        Ordem: {ordemParam}
                                                    </SimpleButton>
                                                </div>
                                            )}
                                        </div>

                                        <SimpleButton
                                            tema="dark"
                                            icon="Trash"
                                            raio='10'
                                            onClick={limparFiltros}
                                        >
                                            Limpar filtros
                                        </SimpleButton>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="lista vertical">
                        <p>Exibindo {pontosFiltrados.length} pontos</p>

                        <div className="listaGrid">
                            {pontosFiltrados.map((item) => (
                                <CardPonto
                                    key={item.id}
                                    ponto={item}
                                    trilhaId={item.trilha_id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {createPortal(
                <div className="paddingFooter"></div>,
                document.body
            )}
        </>
    );
}