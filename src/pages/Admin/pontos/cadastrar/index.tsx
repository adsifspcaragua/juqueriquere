import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabase.ts";
import { db, type ImagemDB } from "../../../../lib/dexie.ts";
import SimpleButton from "../../../../components/ui/buttons/SimpleButton.tsx";
import DraggableCarousel from "../../../../components/ui/DraggableCarousel.tsx";
import AutoResizeTextarea from "../../../../utils/AutoResizeTextarea.tsx";
import { convertToWebP } from "../../../../utils/imageConverter.ts";

// Importações necessárias para simular a página Ponto.tsx no preview
import TrilhasMap from "../../../../components/ui/TrilhasMap.tsx";
import "../../_styles/ponto.css";
import ProtectedRoute from "../../../../components/Protected.tsx";

interface Trilha {
    id: number;
    nome: string;
}

export default function CadastrarPontoInteresse() {
    const formRef = useRef<HTMLFormElement>(null);

    const [trilhas, setTrilhas] = useState<Trilha[]>([]);
    const [trilhaSelecionada, setTrilhaSelecionada] = useState<number | null>(null);

    const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([]);
    const [imagensBase64, setImagensBase64] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(false);

    // --- ESTADOS DO PREVIEW ---
    const [previewAtivo, setPreviewAtivo] = useState(false);
    const [dadosPreview, setDadosPreview] = useState<{
        nome: string;
        descricao: string;
        planta: string;
        latitude: string; // Mudado para string para reverter perfeitamente para o input text/number
        longitude: string; // Mudado para string para reverter perfeitamente para o input text/number
    } | null>(null);

    useEffect(() => {
        async function carregarTrilhas() {
            const trilhasOffline = await db.trilhas.toArray();
            if (trilhasOffline.length > 0) {
                setTrilhas(trilhasOffline);
                return;
            }
            const { data, error } = await supabase.from("trilhas").select("id, nome").order("nome");
            if (error) { console.error(error); return; }
            setTrilhas(data ?? []);
        }
        carregarTrilhas();
    }, []);


    async function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);

        const novosBase64: string[] = [];

        for (const file of files) {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = () => {
                    resolve(reader.result as string);
                };

                reader.onerror = () => {
                    reject(new Error("Erro ao carregar imagem."));
                };

                reader.readAsDataURL(file);
            });

            novosBase64.push(base64);
        }

        setImagensSelecionadas(files);
        setImagensBase64(novosBase64);
    }



    function handleRemoveImage(indexToRemove: number) {
        setImagensSelecionadas((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setImagensBase64((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    // --- GERA OS DADOS PARA O PREVIEW ---
    function handleAtivarPreview() {
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        setDadosPreview({
            nome: formData.get("nome") as string,
            descricao: formData.get("descricao") as string,
            planta: formData.get("planta") as string,
            latitude: formData.get("latitude") as string,
            longitude: formData.get("longitude") as string,
        });
        setPreviewAtivo(true);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);

        try {
            const formData = new FormData(e.currentTarget);
            const dados = {
                trilha_id: trilhaSelecionada,
                nome: formData.get("nome") as string,
                descricao: formData.get("descricao") as string,
                planta: formData.get("planta") as string,
                caminho: formData.get("caminho") as string,
                misc: formData.get("misc") as string,
                latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
                longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
            };

            const { data: novoPonto, error: errorPonto } = await supabase
                .from("pontos_interesse")
                .insert(dados)
                .select()
                .single();

            if (errorPonto) throw errorPonto;

            await db.pontos_interesse.put(novoPonto);

            if (imagensSelecionadas.length > 0) {
                const promessasImagens = imagensSelecionadas.map(async (file, index) => {
                    const stringWebPBase64 = await convertToWebP(file, 0.8);
                    return {
                        trilha_id: null,
                        ponto_interesse_id: novoPonto.id,
                        caminho_arquivo: stringWebPBase64,
                        legenda: `Imagem ${index + 1} do ponto de interesse ${novoPonto.nome}`
                    };
                });

                const dadosImagens = await Promise.all(promessasImagens);
                const { data: novasImagens, error: erroImagens } = await supabase
                    .from("imagens")
                    .insert(dadosImagens)
                    .select();

                if (erroImagens) throw erroImagens;
                if (novasImagens) {
                    await db.imagens.bulkPut(novasImagens as ImagemDB[]);
                }
            }

            alert("Ponto de interesse e imagens cadastrados com sucesso!");
            formRef.current?.reset();
            setDadosPreview(null); // Limpa o cache temporário
            setTrilhaSelecionada(null);
            setImagensSelecionadas([]);
            setImagensBase64([]);
            setPreviewAtivo(false);

        } catch (error: any) {
            console.error(error);
            alert(`Erro ao cadastrar: ${error.message || error}`);
        } finally {
            setCarregando(false);
        }
    }

    const nomeTrilhaSelecionada = trilhas.find(t => t.id === trilhaSelecionada)?.nome || "Nenhuma Trilha";

    // renderização preview
    if (previewAtivo && dadosPreview) {
        const imagensListPreview = imagensBase64.map((imagem, index) => (
            <div key={String(index)}>
                <img src={imagem} alt="Preview" />
            </div>
        ));

        return (
            <>
                <div className="paddingHeader"></div>
                <div style={{ background: '#ff9800', color: '#000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                    MODO PREVIEW - O ponto ainda não foi salvo no banco de dados.
                </div>

                <section className='conteudo vertical gap15'>
                    <div className="horizontal gap15">
                        <SimpleButton type="back" icon="setaBack" raio='10' onClick={() => setPreviewAtivo(false)}>
                            Voltar para a Edição/Formulário
                        </SimpleButton>
                    </div>

                    <div className="desktopWrap">
                        <div className="vertical">
                            {imagensListPreview.length > 0 && (
                                <DraggableCarousel items={imagensListPreview} />
                            )}
                        </div>

                        <div className="vertical gap15">
                            <div className="vertical gap15">
                                <div className="vertical gap5">
                                    <h1>{dadosPreview.nome || "Nome de Exemplo"}</h1>
                                    {dadosPreview.planta && <i>{dadosPreview.planta}</i>}
                                </div>
                                <div className="card vertical gap5">
                                    <h2>Descrição</h2>
                                    <p>{dadosPreview.descricao || "Sua descrição aparecerá aqui."}</p>
                                </div>
                            </div>
                            <div className="card desktopWrap gap15">
                                {dadosPreview.latitude && dadosPreview.longitude && (
                                    <div className="mapa">
                                        <TrilhasMap id={trilhaSelecionada ? [trilhaSelecionada] : []} />
                                    </div>
                                )}

                                <div className="vertical gap5">
                                    <p>Aparece em:</p>
                                    <SimpleButton tema='dark' raio='10'>{nomeTrilhaSelecionada}</SimpleButton>
                                    {dadosPreview.latitude && dadosPreview.longitude && (
                                        <p>Coordenadas: {dadosPreview.latitude}, {dadosPreview.longitude}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    // renderização do forms
    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">
                <SimpleButton path="/admin/pontos" type="back" icon="setaBack">
                    Voltar
                </SimpleButton>

                <h1>Cadastrar Ponto de Interesse</h1>

                <form ref={formRef} className="card form vertical gap15" onSubmit={handleSubmit}>
                    <div className="vertical gap5">
                        <label>Trilha:</label>
                        <select
                            name="trilha"
                            value={trilhaSelecionada ?? ""}
                            onChange={(e) => setTrilhaSelecionada(e.target.value ? Number(e.target.value) : null)}
                            required
                            disabled={carregando}
                        >
                            <option value="">Ponto não pertence a nenhuma trilha</option>
                            {trilhas.map((trilha) => (
                                <option key={trilha.id} value={trilha.id}>
                                    {trilha.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input
                            name="nome"
                            required
                            disabled={carregando}
                            defaultValue={dadosPreview?.nome ?? ""}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Nome Científico / Planta (Opcional):</label>
                        <input
                            name="planta"
                            disabled={carregando}
                            defaultValue={dadosPreview?.planta ?? ""}
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição:</label>
                        <AutoResizeTextarea
                            name="descricao"
                            placeholder="Descreva o ponto de interesse..."
                            disabled={carregando}
                            defaultValue={dadosPreview?.descricao ?? ""}
                        />
                    </div>

                    <div className="horizontal gap15">
                        <div>
                            <label>Latitude:</label>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                disabled={carregando}
                                defaultValue={dadosPreview?.latitude ?? ""}
                            />
                        </div>

                        <div>
                            <label>Longitude:</label>
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                disabled={carregando}
                                defaultValue={dadosPreview?.longitude ?? ""}
                            />
                        </div>
                    </div>

                    <div className="vertical gap15">
                        <div className="vertical gap5" id="file">
                            <label>Imagens do Ponto de Interesse:</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                disabled={carregando}
                            />
                        </div>

                        {imagensSelecionadas.length > 0 && (
                            <div className="vertical gap5">
                                <p><strong>{imagensSelecionadas.length} imagem(ns) selecionada(s):</strong></p>
                                <DraggableCarousel
                                    items={imagensSelecionadas.map((file, idx) => (
                                        <div key={idx} className="uploadPreview vertical gap5 carrosselCard">
                                            <img src={imagensBase64[idx]} alt={file.name} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                disabled={carregando}
                                            >
                                                Remover
                                            </button>
                                            <p>{file.name}</p>
                                        </div>
                                    ))}
                                />
                            </div>
                        )}
                    </div>

                    {/* Botões de Ação na parte inferior do formulário */}
                    <div className="horizontal gap15" style={{ marginTop: '10px' }}>
                        <button
                            type="button"
                            className="btn-preview"
                            onClick={handleAtivarPreview}
                            style={{ background: '#4a5568', color: '#fff', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', flex: 1 }}
                        >
                            Visualizar Preview da Página
                        </button>

                        <button
                            type="submit"
                            disabled={carregando}
                            style={{ flex: 1 }}
                        >
                            {carregando ? "Cadastrando..." : "Cadastrar ponto de interesse"}
                        </button>
                    </div>
                </form>
            </section>
        </ProtectedRoute>
    );
}