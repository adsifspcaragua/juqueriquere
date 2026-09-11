import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase.ts";
import { db } from "../../../lib/dexie";

import SimpleButton from "../../../components/ui/buttons/SimpleButton";
import AutoResizeTextarea from "../../../utils/AutoResizeTextarea";
import ProtectedRoute from "../../../components/Protected.tsx";

interface SobreDB {
    id: number;

    descricao: string;
    area: string;

    area_convivencia_titulo: string;
    area_convivencia_descricao: string;

    sala_verde_titulo: string;
    sala_verde_descricao: string;

    acessibilidade_titulo: string;
    acessibilidade_descricao: string;

    visitas_grupo_titulo: string;
    visitas_grupo_descricao: string;

    horario_titulo: string;
    horario_descricao: string;

    endereco_titulo: string;
    endereco_descricao: string;

    email_agendamento: string;
    link_mapa: string;

    created_at?: string;
    updated_at?: string;
}

export default function EditarSobre() {

    const [sobre, setSobre] = useState<SobreDB | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        carregarSobre();
    }, []);

    async function carregarSobre() {

        setCarregando(true);

        try {

            /*
             * 1. Tenta carregar primeiro do Dexie.
             * Isso permite que o formulário continue funcionando
             * mesmo quando o usuário estiver offline.
             */
            const sobreLocal = await db.sobre.toArray();

            if (sobreLocal.length > 0) {
                setSobre(sobreLocal[0] as SobreDB);
                setCarregando(false);

                /*
                 * Não retornamos imediatamente.
                 * Buscamos a versão mais recente do Supabase
                 * quando houver conexão.
                 */
            }

            /*
             * 2. Busca a versão mais recente no Supabase.
             */
            const { data, error } = await supabase
                .from("sobre")
                .select("*")
                .order("id", { ascending: true })
                .limit(1)
                .maybeSingle();

            if (error) {
                /*
                 * Se já conseguimos carregar do Dexie,
                 * podemos continuar usando os dados locais.
                 */
                if (sobreLocal.length > 0) {
                    return;
                }

                throw error;
            }

            if (data) {

                setSobre(data as SobreDB);

                /*
                 * 3. Atualiza o cache local.
                 */
                await db.sobre.put(data as SobreDB);
            }

        } catch (error: any) {

            console.error("Erro ao carregar informações do parque:", error);

            alert(
                `Não foi possível carregar as informações do parque.\n\n${
                    error?.message || error
                }`
            );

        } finally {
            setCarregando(false);
        }
    }

    function atualizarCampo(
        campo: keyof SobreDB,
        valor: string
    ) {
        setSobre((prev) => {

            if (!prev) return prev;

            return {
                ...prev,
                [campo]: valor
            };
        });
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {

        e.preventDefault();

        if (!sobre) return;

        setSalvando(true);

        try {

            const dadosAtualizados = {

                descricao: sobre.descricao,
                area: sobre.area,

                area_convivencia_titulo:
                    sobre.area_convivencia_titulo,

                area_convivencia_descricao:
                    sobre.area_convivencia_descricao,

                sala_verde_titulo:
                    sobre.sala_verde_titulo,

                sala_verde_descricao:
                    sobre.sala_verde_descricao,

                acessibilidade_titulo:
                    sobre.acessibilidade_titulo,

                acessibilidade_descricao:
                    sobre.acessibilidade_descricao,

                visitas_grupo_titulo:
                    sobre.visitas_grupo_titulo,

                visitas_grupo_descricao:
                    sobre.visitas_grupo_descricao,

                horario_titulo:
                    sobre.horario_titulo,

                horario_descricao:
                    sobre.horario_descricao,

                endereco_titulo:
                    sobre.endereco_titulo,

                endereco_descricao:
                    sobre.endereco_descricao,

                email_agendamento:
                    sobre.email_agendamento,

                link_mapa:
                    sobre.link_mapa,

                updated_at: new Date().toISOString()
            };

            /*
             * 1. Atualiza o Supabase.
             */
            const { data, error } = await supabase
                .from("sobre")
                .update(dadosAtualizados)
                .eq("id", sobre.id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            /*
             * 2. Atualiza o objeto local com o retorno
             * do Supabase.
             */
            const sobreAtualizado = data as SobreDB;

            setSobre(sobreAtualizado);

            /*
             * 3. Atualiza o Dexie.
             */
            await db.sobre.put(sobreAtualizado);

            alert(
                "Informações do parque atualizadas com sucesso!"
            );

        } catch (error: any) {

            console.error(
                "Erro ao atualizar informações do parque:",
                error
            );

            alert(
                `Erro ao salvar as informações:\n\n${
                    error?.message || error
                }`
            );

        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {

        return (
            <ProtectedRoute>
                <div className="paddingHeader"></div>

                <section className="conteudo vertical gap15">

                    <h1>Editar informações do parque</h1>

                    <div className="card">
                        <p>Carregando informações...</p>
                    </div>

                </section>
            </ProtectedRoute>
        );
    }

    if (!sobre) {

        return (
            <ProtectedRoute>
                <div className="paddingHeader"></div>

                <section className="conteudo vertical gap15">

                    <SimpleButton
                        path="/admin"
                        type="back"
                        icon="setaBack"
                    >
                        Voltar
                    </SimpleButton>

                    <h1>Editar informações do parque</h1>

                    <div className="card vertical gap5">

                        <p>
                            Nenhuma informação do parque foi
                            cadastrada ainda.
                        </p>

                    </div>

                </section>
            </ProtectedRoute>
        );
    }

    return (

        <ProtectedRoute>

            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">

                <SimpleButton
                    path="/admin"
                    type="back"
                    icon="setaBack"
                >
                    Voltar
                </SimpleButton>

                <h1>Editar informações do parque</h1>

                <form
                    className="card vertical gap15"
                    onSubmit={handleSubmit}
                >

                    {/* ============================= */}
                    {/* INFORMAÇÕES GERAIS */}
                    {/* ============================= */}

                    <h2>Informações gerais</h2>

                    <div className="vertical gap5">

                        <label>
                            Descrição do parque:
                        </label>

                        <AutoResizeTextarea
                            value={sobre.descricao}
                            onChange={(e) =>
                                atualizarCampo(
                                    "descricao",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Área do parque:
                        </label>

                        <input
                            type="text"
                            value={sobre.area}
                            onChange={(e) =>
                                atualizarCampo(
                                    "area",
                                    e.target.value
                                )
                            }
                            placeholder="Ex: aproximadamente 35.000 m²"
                            disabled={salvando}
                            required
                        />

                    </div>


                    <div className="linhaPontilhadaLight"></div>


                    {/* ============================= */}
                    {/* ESPAÇOS */}
                    {/* ============================= */}

                    <h2>Espaços do Parque</h2>

                    <div className="vertical gap5">

                        <label>
                            Título — Área de Convivência:
                        </label>

                        <input
                            type="text"
                            value={
                                sobre.area_convivencia_titulo
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "area_convivencia_titulo",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Descrição — Área de Convivência:
                        </label>

                        <AutoResizeTextarea
                            value={
                                sobre.area_convivencia_descricao
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "area_convivencia_descricao",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>


                    <div className="vertical gap5">

                        <label>
                            Título — Sala Verde:
                        </label>

                        <input
                            type="text"
                            value={
                                sobre.sala_verde_titulo
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "sala_verde_titulo",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Descrição — Sala Verde:
                        </label>

                        <AutoResizeTextarea
                            value={
                                sobre.sala_verde_descricao
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "sala_verde_descricao",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>


                    <div className="linhaPontilhadaLight"></div>


                    {/* ============================= */}
                    {/* ACESSIBILIDADE */}
                    {/* ============================= */}

                    <h2>Acessibilidade</h2>

                    <div className="vertical gap5">

                        <label>
                            Título:
                        </label>

                        <input
                            type="text"
                            value={
                                sobre.acessibilidade_titulo
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "acessibilidade_titulo",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Informações sobre acessibilidade:
                        </label>

                        <AutoResizeTextarea
                            value={
                                sobre.acessibilidade_descricao
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "acessibilidade_descricao",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>


                    <div className="linhaPontilhadaLight"></div>


                    {/* ============================= */}
                    {/* VISITAS EM GRUPO */}
                    {/* ============================= */}

                    <h2>Visitas em grupo</h2>

                    <div className="vertical gap5">

                        <label>
                            Título:
                        </label>

                        <input
                            type="text"
                            value={
                                sobre.visitas_grupo_titulo
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "visitas_grupo_titulo",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Informações sobre visitas em grupo:
                        </label>

                        <AutoResizeTextarea
                            value={
                                sobre.visitas_grupo_descricao
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "visitas_grupo_descricao",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>


                    <div className="vertical gap5">

                        <label>
                            E-mail para agendamento:
                        </label>

                        <input
                            type="email"
                            value={
                                sobre.email_agendamento
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "email_agendamento",
                                    e.target.value
                                )
                            }
                            placeholder="exemplo@caraguatatuba.sp.gov.br"
                            disabled={salvando}
                            required
                        />

                    </div>


                    <div className="linhaPontilhadaLight"></div>


                    {/* ============================= */}
                    {/* HORÁRIO */}
                    {/* ============================= */}

                    <h2>Horário de funcionamento</h2>

                    <div className="vertical gap5">

                        <label>
                            Título:
                        </label>

                        <input
                            type="text"
                            value={
                                sobre.horario_titulo
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "horario_titulo",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Horário:
                        </label>

                        <AutoResizeTextarea
                            value={
                                sobre.horario_descricao
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "horario_descricao",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>


                    <div className="linhaPontilhadaLight"></div>


                    {/* ============================= */}
                    {/* ENDEREÇO */}
                    {/* ============================= */}

                    <h2>Endereço</h2>

                    <div className="vertical gap5">

                        <label>
                            Título:
                        </label>

                        <input
                            type="text"
                            value={
                                sobre.endereco_titulo
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "endereco_titulo",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Endereço:
                        </label>

                        <AutoResizeTextarea
                            value={
                                sobre.endereco_descricao
                            }
                            onChange={(e) =>
                                atualizarCampo(
                                    "endereco_descricao",
                                    e.target.value
                                )
                            }
                            disabled={salvando}
                            required
                        />

                    </div>

                    <div className="vertical gap5">

                        <label>
                            Link do Google Maps:
                        </label>

                        <input
                            type="url"
                            value={sobre.link_mapa}
                            onChange={(e) =>
                                atualizarCampo(
                                    "link_mapa",
                                    e.target.value
                                )
                            }
                            placeholder="https://maps.google.com/..."
                            disabled={salvando}
                            required
                        />

                    </div>


                    {/* ============================= */}
                    {/* BOTÃO */}
                    {/* ============================= */}

                    <div className="btnFull">

                        <button
                            type="submit"
                            disabled={salvando}
                        >
                            {salvando
                                ? "Salvando..."
                                : "Salvar alterações"
                            }
                        </button>

                    </div>

                </form>

            </section>

        </ProtectedRoute>
    );
}