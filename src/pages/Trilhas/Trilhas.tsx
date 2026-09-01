import { useEffect, useState } from 'react';
import { usePageTitle } from "../../lib/hooks/usePageTitle";

import { db } from "../../lib/dexie";
import Select from '../../components/ui/form/Select.tsx';
import CardTrilha from '../../components/ui/CardTrilha.tsx';
import type Trilha from './TrilhaInfo';
import { createPortal } from "react-dom";
import '../styles/trilhas.css'

export default function Trilhas() {

    usePageTitle("Trilhas");

    const order = {
        "Nome A-Z": (a: any, b: any) => a.nome.localeCompare(b.nome),
        "Nome Z-A": (a: any, b: any) => b.nome.localeCompare(a.nome),
    } as const;

    type OrderKey = keyof typeof order;

    const [orderKey, setOrderKey] = useState<OrderKey>(Object.keys(order)[0] as OrderKey);
    const [search, setSearch] = useState("");

    const [trilhas, setTrilhas] = useState<Trilha[]>([]);

    useEffect(() => {
        async function loadData() {
            const data = await db.trilhas.toArray();
            if(data)setTrilhas(data as Trilha[]);
        }

        loadData();
    }, []);

    const trilhasFiltradas = trilhas
        .filter((trilha) =>
            trilha.nome.toLowerCase().includes(search.toLowerCase())
        )
        .sort(order[orderKey]);

    const trilhasList = trilhasFiltradas.map((trilha) => (
        <CardTrilha
            id={trilha.id}
            key={trilha.id}
            trilha={trilha}
        />
    ));

    return (
        <>
            {createPortal(
                <div className="horizontal gap5" id="filtros">

                    <Select
                        options={Object.keys(order)}
                        onChange={(newValue) => {
                            setOrderKey(newValue as OrderKey);
                        }}
                        value={orderKey}
                        style='none'
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

                </div>,
                document.body
            )}

            <div className="paddingHeader2"></div>

            <section>
                <div className="conteudo vertical">

                    <div className="img-fade" id="capivara"></div>

                    <div className="info vertical gap5">
                        <h1>Trilhas</h1>
                        <p>Explore caminhos serenos, admire vistas deslumbrantes e encontre a paz na jornada.</p>
                    </div>

                    <div className="lista vertical">
                        <p>{trilhasFiltradas.length} trilhas encontradas.</p>

                        <div className="listaGrid">
                            {trilhasList}
                        </div>

                    </div>
                </div>
            </section>

            {createPortal(<div className="paddingFooter"></div>,document.body)}
        </>
    );
}