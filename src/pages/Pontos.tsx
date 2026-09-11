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
  "Nome A-Z": (a: PontoInteresseDB, b: PontoInteresseDB) => (a.nome || "").localeCompare(b.nome || ""),
  "Nome Z-A": (a: PontoInteresseDB, b: PontoInteresseDB) => (b.nome || "").localeCompare(a.nome || ""),
} as const;

type OrderKey = keyof typeof ORDER_OPTIONS;

export default function Pontos() {
  usePageTitle("Pontos de Interesse");

  // Query Params para ler e atualizar ?trilha=idTrilha na URL
  const [searchParams, setSearchParams] = useSearchParams();
  const trilhaParam = searchParams.get("trilha");
  const selectedTrilhaId = trilhaParam ? Number(trilhaParam) : null;

  const [orderKey, setOrderKey] = useState<OrderKey>("Nome A-Z");
  const [search, setSearch] = useState("");
  
  const [pontosDados, setPontosDados] = useState<PontoInteresseDB[]>([]);
  const [trilhasDados, setTrilhasDados] = useState<TrilhaDB[]>([]);

  // Carrega dados do banco Dexie
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

  const handleSetTrilhaParam = (val: string | null) => {
  setSearchParams((prev) => {
    const newParams = new URLSearchParams(prev);
    if (val !== null) {
      newParams.set("trilha", val);
    } else {
      newParams.delete("trilha");
    }
    return newParams;
  });
};

const trilhaSelecionada = useMemo(() => {
  if (!trilhaParam || trilhaParam === "sem-trilha") return null;
  return trilhasDados.find((t) => t.id === Number(trilhaParam));
}, [trilhasDados, trilhaParam]);

  /*
   * =========================================================================================
   *  COMO RETORNAR A COR DA TRILHA DE UM PONTO:
   * =========================================================================================
   *  const getCorTrilha = (trilhaId: number): string => {
   *    const trilha = trilhasDados.find((t) => t.id === trilhaId);
   *    return trilha?.cor_identificacao ?? '#000000';
   *  };
   * =========================================================================================
   */

  const handleSetTrilhaId = (id: number | null) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (id !== null) {
        newParams.set("trilha", String(id));
      } else {
        newParams.delete("trilha");
      }
      return newParams;
    });
  };

  const selectOptions = useMemo(() => {
  const ordenacaoOps = Object.keys(ORDER_OPTIONS).map((key) => `Ordem: ${key}`);
  const trilhasOps = trilhasDados.map((t) => `Trilha: ${t.nome}`);
  return ["Todas as trilhas", "Pontos sem trilha", ...ordenacaoOps, ...trilhasOps];
}, [trilhasDados]);

const handleSelectChange = (optionValue: string) => {
  if (optionValue === "Pontos sem trilha") {
    handleSetTrilhaParam("sem-trilha");
  } else if (optionValue.startsWith("Ordem: ")) {
    const key = optionValue.replace("Ordem: ", "") as OrderKey;
    setOrderKey(key);
  } else if (optionValue.startsWith("Trilha: ")) {
    const nomeTrilha = optionValue.replace("Trilha: ", "");
    const trilha = trilhasDados.find((t) => t.nome === nomeTrilha);
    if (trilha) handleSetTrilhaParam(String(trilha.id));
  } else if (optionValue === "Todas as trilhas") {
    handleSetTrilhaParam(null);
  }
};

  const pontosFiltrados = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return pontosDados
        .filter((item) => {
        const bateNome = (item.nome || "").toLowerCase().includes(termo);
        
        let bateTrilha = true;
        if (trilhaParam === "sem-trilha") {
            bateTrilha = !item.trilha_id;
        } else if (trilhaParam) {
            bateTrilha = item.trilha_id === Number(trilhaParam);
        }

        return bateNome && bateTrilha;
        })
        .sort(ORDER_OPTIONS[orderKey]);
    }, [pontosDados, search, trilhaParam, orderKey]);

  const temFiltroAtivo = Boolean(search || selectedTrilhaId !== null || orderKey !== "Nome A-Z");

  return (
    <>
      {createPortal(
        <div className="horizontal gap5" id="filtros">
          <div className="pesquisa horizontal">
            <div className="pesquisaIcon"></div>
            <input
              type="text"
              placeholder="Pesquisar ponto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        <Select
            options={selectOptions}
            onChange={handleSelectChange}
            value={
                trilhaParam === "sem-trilha"
                ? "Pontos sem trilha"
                : trilhaSelecionada
                ? `Trilha: ${trilhaSelecionada.nome}`
                : `Ordem: ${orderKey}`
            }
            style="none"
        />
        </div>,
        document.body
      )}

      <div className="paddingHeader2"></div>

      <section>
        <div className="conteudo vertical">
          <div className="img-fade" id="capivara"></div>
          <div className="info vertical gap5">
            <h1>Pontos</h1>
            <p>
              Descubra as espécies nativas do parque e aprenda mais sobre os seres que habitam esse espaço.
            </p>
          </div>

          <div className="lista vertical">
            {temFiltroAtivo && (
              <div className=" horizontal gap5" style={{ flexWrap: 'wrap', marginBottom: '10px' }}>
                {search && (
                  <div className="horizontal gap5 justify center">
                    Busca: "{search}"
                    <SimpleButton tema='dark' icon='X'></SimpleButton>
                  </div>
                )}
                {orderKey !== "Nome A-Z" && (
                <div className="horizontal gap5 justify center">
                    Ordem: {orderKey}
                    <SimpleButton tema='dark' icon='X'></SimpleButton>
                </div>
                )}
                {trilhaSelecionada && (
                <div 
                    className="horizontal gap5 justify center" 
                >
                    Trilha: {trilhaSelecionada.nome}
                    <SimpleButton tema='dark' icon='X'></SimpleButton>
                </div>
                )}

                <SimpleButton
                tema='dark'
                icon='none'
                  onClick={() => {
                    setSearch("");
                    handleSetTrilhaId(null);
                    setOrderKey("Nome A-Z");
                  }}
                >
                  Limpar filtros
                </SimpleButton>
              </div>
            )}

            <p>{pontosFiltrados.length} pontos encontrados.</p>

            <div className="listaGrid">
              {pontosFiltrados.map((item) => {
                // Exemplo de resgate da cor por ponto:
                // const corTrilha = trilhasDados.find((t) => t.id === item.trilha_id)?.cor_identificacao;

                return (
                  <CardPonto
                    key={item.id}
                    ponto={item}
                    trilhaId={item.trilha_id}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {createPortal(<div className="paddingFooter"></div>, document.body)}

    </>
  );
}