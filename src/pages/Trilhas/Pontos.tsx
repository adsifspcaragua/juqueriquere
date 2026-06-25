import { useState } from 'react';
import data from '../../data.json';
import Select from '../../components/ui/form/Select.tsx';
import CardPonto from '../../components/ui/CardPonto.tsx';
import { createPortal } from "react-dom";
//import SimpleButton from '../../components/ui/buttons/SimpleButton.tsx';


export default function Pontos() {
    const order = {
        "Nome A-Z": (a: any, b: any) => a.nome.localeCompare(b.nome),
        "Nome Z-A": (a: any, b: any) => b.nome.localeCompare(a.nome),
    } as const;
    type OrderKey = keyof typeof order;

    const [orderKey, setOrderKey] = useState<OrderKey>(Object.keys(order)[0] as OrderKey);
    const [search, setSearch] = useState("");

    const getNomePonto = (ponto: any) => {
        return String(Object.values(ponto)[0] ?? "");
    };

    const pontos = data.trilhas.flatMap((trilha) =>
        trilha.pontos_interesse.map((ponto) => ({
            ponto,
            trilha: trilha
        }))
    );

    const pontosFiltrados = pontos
        .filter((item) =>
            getNomePonto(item.ponto)
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .sort((a, b) =>
            order[orderKey](
                {
                    nome: getNomePonto(a.ponto)
                },
                {
                    nome: getNomePonto(b.ponto)
                }
            )
        );
    const pontosList = pontosFiltrados.map((item, index) => (
        <>
            {!Object(item.ponto).caminho && 
                <CardPonto
                    key={index}
                    ponto={item.ponto}
                    trilha={Object(item.trilha)}
                /> 
             }
        </>
    ));

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
                        options={Object.keys(order)}
                        onChange={(newValue) => {
                            setOrderKey(newValue as OrderKey);
                        }}
                        value={orderKey}
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
                        <p>
                            {pontosList.length} pontos encontrados.
                        </p>
                        <div className="listaGrid">
                            {pontosList}
                        </div>
                    </div>
                    
                </div>
            </section>

            {createPortal(<div className="paddingFooter"></div>,document.body)}
        </>
    );
}