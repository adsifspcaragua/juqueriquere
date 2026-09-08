import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, type ImagemDB, type TrilhaDB } from "../../../../lib/dexie.ts";
import { supabase } from "../../../../lib/supabase.ts";

import SimpleButton from "../../../../components/ui/buttons/SimpleButton.tsx";
import DraggableCarousel from "../../../../components/ui/DraggableCarousel.tsx";
import AutoResizeTextarea from "../../../../utils/AutoResizeTextarea.tsx";
import Map from "../../../../components/ui/Map/Map.tsx";

import { convertToWebP, fileToBase64 } from "../../../../utils/imageConverter.ts";
import { convertKmlToGeoJson } from "../../../../utils/kmlConverter.ts";
import { uploadImagem } from "../../../../lib/services/images.ts";
import ProtectedRoute from "../../../../components/Protected.tsx";

export default function EditarTrilha() {
    const { id } = useParams();
    const [trilha, setTrilha] = useState<any>(null);
    const [carregando, setCarregando] = useState(false);

    // Estados para o KML/GeoJSON e Cor
    const [geojsonTrilha, setGeojsonTrilha] = useState<any>(null);
    const [nomeArquivoKml, setNomeArquivoKml] = useState<string | null>(null);
    const [corIdentificacao, setCorIdentificacao] = useState("#000000");

    // Estados para controle das imagens
    const [imagensSalvas, setImagensSalvas] = useState<ImagemDB[]>([]);
    const [imagensSalvasUrls, setImagensSalvasUrls] = useState<Record<number, string>>({});
    const [imagensDeletadasIds, setImagensDeletadasIds] = useState<number[]>([]);
    
    const [novasImagens, setNovasImagens] = useState<File[]>([]);
    const [novasImagensBase64, setNovasImagensBase64] = useState<string[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const idNumerico = Number(id);

                if (!id || Number.isNaN(idNumerico)) {
                    console.error("ID da trilha inválido:", id);
                    setTrilha(null);
                    return;
                }

                // 1. Busca trilha no Dexie ou Supabase
                let data = await db.trilhas.get(idNumerico);

                if (!data) {
                    const { data: trilhaSupabase, error } = await supabase
                        .from("trilhas")
                        .select("*")
                        .eq("id", idNumerico)
                        .single();

                    if (error) throw error;

                    data = trilhaSupabase;
                    await db.trilhas.put(data as TrilhaDB);
                }

                setTrilha(data);

                if (data?.cor_identificacao) {
                    setCorIdentificacao(data.cor_identificacao);
                }

                if (data?.geometria) {
                    setGeojsonTrilha(data.geometria);
                }

                // 2. Busca imagens vinculadas
                const imgs = await db.imagens
                    .where("trilha_id")
                    .equals(idNumerico)
                    .toArray();

                setImagensSalvas(imgs);

                const urls: Record<number, string> = {};
                for (const img of imgs) {
                    if (img.arquivo instanceof Blob && img.id != null) {
                        urls[img.id] = URL.createObjectURL(img.arquivo);
                    }
                }
                setImagensSalvasUrls(urls);

            } catch (error) {
                console.error("Erro ao carregar trilha:", error);
                setTrilha(null);
            }
        }

        load();

        return () => {
            setImagensSalvasUrls((urls) => {
                Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
                return {};
            });
        };
    }, [id]);

    // Função para filtrar e remover a linha clicada
    function handleRemoveLine(indexToRemove: number) {
        if (!geojsonTrilha) return;

        const novasFeatures = geojsonTrilha.features.filter(
            (_: any, idx: number) => idx !== indexToRemove
        );

        if (novasFeatures.length === 0) {
            setGeojsonTrilha(null);
        } else {
            setGeojsonTrilha({
                ...geojsonTrilha,
                features: novasFeatures
            });
        }
    }

    async function handleKmlChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setNomeArquivoKml(file.name);

        try {
            const geojsonConvertido = await convertKmlToGeoJson(file);
            setGeojsonTrilha(geojsonConvertido);
        } catch (error: any) {
            console.error(error);
            alert(error.message);
            setNomeArquivoKml(null);
        }
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);

        try {
            const novosBase64 = await Promise.all(files.map(fileToBase64));
            setNovasImagens((prev) => [...prev, ...files]);
            setNovasImagensBase64((prev) => [...prev, ...novosBase64]);
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar a visualização das imagens.");
        }
    }

    function handleRemoveSavedImage(img: ImagemDB, indexToRemove: number) {
        if (img.id) {
            setImagensDeletadasIds((prev) => [...prev, img.id!]);

            const url = imagensSalvasUrls[img.id];
            if (url) URL.revokeObjectURL(url);

            setImagensSalvasUrls((prev) => {
                const novas = { ...prev };
                delete novas[img.id!];
                return novas;
            });
        }

        setImagensSalvas((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    function handleRemoveNewImage(indexToRemove: number) {
        setNovasImagens((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setNovasImagensBase64((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);

        try {
            const formData = new FormData(e.currentTarget);
            const idNumerico = Number(id);

            const dadosTrilha = {
                nome: formData.get("nome") as string,
                cor_identificacao: corIdentificacao,
                dificuldade: formData.get("dificuldade") as string,
                extensao: formData.get("extensao") as string,
                duracao: formData.get("duracao") as string,
                descricao_curta: formData.get("descricao_curta") as string,
                descricao: formData.get("descricao") as string,
                equipamento_recomendado: formData.get("equipamento_recomendado") as string,
                atencao: formData.get("atencao") as string,
                geometria: geojsonTrilha,
            };

            // 1. Atualiza no Supabase
            const { data: trilhaAtualizada, error: erroTrilha } = await supabase
                .from("trilhas")
                .update(dadosTrilha)
                .eq("id", idNumerico)
                .select()
                .single();

            if (erroTrilha) throw erroTrilha;

            // 2. Sincroniza no Dexie
            const trilhaExistenteDexie = await db.trilhas.get(idNumerico);
            const trilhaParaDexie: TrilhaDB = {
                ...trilhaExistenteDexie,
                ...trilhaAtualizada,
            };
            await db.trilhas.put(trilhaParaDexie);

            // 3. Processa exclusão de imagens
            if (imagensDeletadasIds.length > 0) {
                const { error: erroDeletar } = await supabase
                    .from("imagens")
                    .delete()
                    .in("id", imagensDeletadasIds);

                if (erroDeletar) throw erroDeletar;

                await db.imagens.bulkDelete(imagensDeletadasIds);
                setImagensDeletadasIds([]);
            }

            // 4. Processa novas imagens
            if (novasImagens.length > 0) {
                const dadosImagens = [];
                const imagensConvertidas: Blob[] = [];
                const totalExistentes = imagensSalvas.length;

                for (let index = 0; index < novasImagens.length; index++) {
                    const file = novasImagens[index];
                    const blobWebP = await convertToWebP(file, 0.8);
                    
                    imagensConvertidas.push(blobWebP);

                    const nomeArquivo = `${crypto.randomUUID()}.webp`;
                    const caminho = `trilhas/${nomeArquivo}`;

                    await uploadImagem(blobWebP, caminho);

                    dadosImagens.push({
                        trilha_id: idNumerico,
                        ponto_interesse_id: null,
                        caminho_arquivo: caminho,
                        legenda: `Imagem ${totalExistentes + index + 1} da trilha ${trilhaAtualizada.nome}`,
                    });
                }

                const { data: novasImagensSalvas, error: erroImagens } = await supabase
                    .from("imagens")
                    .insert(dadosImagens)
                    .select();

                if (erroImagens) throw erroImagens;

                if (novasImagensSalvas) {
                    const imagensDexie = novasImagensSalvas.map((imagem, index) => ({
                        ...imagem,
                        arquivo: imagensConvertidas[index]
                    }));

                    await db.imagens.bulkPut(imagensDexie);

                    setImagensSalvas((prev) => [...prev, ...imagensDexie]);
                    setImagensSalvasUrls((prev) => {
                        const novasUrls = { ...prev };
                        imagensDexie.forEach((imagem) => {
                            if (imagem.id != null && imagem.arquivo instanceof Blob) {
                                novasUrls[imagem.id] = URL.createObjectURL(imagem.arquivo);
                            }
                        });
                        return novasUrls;
                    });
                }

                setNovasImagens([]);
                setNovasImagensBase64([]);
            }

            alert("Trilha atualizada com sucesso!");
        } catch (error: any) {
            console.error("Erro ao atualizar trilha:", error);
            alert(`Erro ao atualizar: ${error?.message || error}`);
        } finally {
            setCarregando(false);
        }
    }

    if (!trilha) {
        return <h1>Trilha não encontrada</h1>;
    }

    const totalImagens = imagensSalvas.length + novasImagens.length;

    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">
                <SimpleButton path="/admin/trilhas" type="back" icon="setaBack">
                    Voltar
                </SimpleButton>

                <h1>Editar {trilha.nome}</h1>

                <form className="card vertical gap15" onSubmit={handleSubmit}>
                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input name="nome" defaultValue={trilha.nome} required disabled={carregando} />
                    </div>

                    <div className="vertical gap5" style={{ background: "#f0f8ff", padding: "10px", borderRadius: "8px", border: "1px dashed #ccc" }}>
                        <label>Atualizar Arquivo de Rota (KML):</label>
                        <input type="file" accept=".kml" onChange={handleKmlChange} disabled={carregando} />
                        {nomeArquivoKml ? (
                            <p style={{ fontSize: "0.9rem", color: "green", margin: 0 }}>
                                Novo arquivo: {nomeArquivoKml} carregado ({geojsonTrilha?.features?.length || 0} linha(s) encontrada(s)).
                            </p>
                        ) : geojsonTrilha ? (
                            <p style={{ fontSize: "0.9rem", color: "#555", margin: 0 }}>
                                Rota atual carregada ({geojsonTrilha?.features?.length || 0} linha(s)).
                            </p>
                        ) : null}
                    </div>

                    {geojsonTrilha && (
                        <div className="vertical gap5">
                            <label>
                                <strong>Pré-visualização da Rota:</strong>
                                <span style={{ fontSize: "0.85rem", color: "#666", marginLeft: "8px" }}>
                                    (Clique em uma linha para removê-la)
                                </span>
                            </label>
                            <div style={{ height: "380px", width: "100%" }}>
                                <Map 
                                    previewGeoJson={geojsonTrilha} 
                                    previewColor={corIdentificacao} 
                                    onDeleteLine={handleRemoveLine}
                                />
                            </div>
                        </div>
                    )}

                    <div className="vertical gap5">
                        <label>Cor de Identificação (Hexadecimal):</label>
                        <input 
                            type="color" 
                            name="cor_identificacao" 
                            value={corIdentificacao} 
                            onChange={(e) => setCorIdentificacao(e.target.value)}
                            required 
                            disabled={carregando} 
                            style={{ height: "40px", width: "100%", cursor: "pointer" }} 
                        />
                    </div>

                    <div className="vertical gap5">
                        <label>Dificuldade:</label>
                        <select name="dificuldade" defaultValue={trilha.dificuldade} required disabled={carregando}>
                            <option value="">Selecione...</option>
                            <option value="Fácil">Fácil</option>
                            <option value="Moderada">Moderada</option>
                            <option value="Difícil">Difícil</option>
                        </select>
                    </div>

                    <div className="vertical gap5">
                        <label>Extensão (ex: 5.2 km):</label>
                        <input name="extensao" defaultValue={trilha.extensao} required disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Duração Estimada (ex: 2 horas):</label>
                        <input name="duracao" defaultValue={trilha.duracao} required disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição Curta:</label>
                        <input name="descricao_curta" defaultValue={trilha.descricao_curta} required disabled={carregando} maxLength={150} />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição Detalhada:</label>
                        <AutoResizeTextarea name="descricao" defaultValue={trilha.descricao} required disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Equipamento Recomendado:</label>
                        <AutoResizeTextarea name="equipamento_recomendado" defaultValue={trilha.equipamento_recomendado} disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Atenção / Avisos:</label>
                        <AutoResizeTextarea name="atencao" defaultValue={trilha.atencao} disabled={carregando} />
                    </div>

                    <div className="vertical gap15">
                        <div className="vertical gap5" id="file">
                            <label>Adicionar novas imagens:</label>
                            <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={carregando} />
                        </div>

                        {totalImagens > 0 && (
                            <div className="vertical gap5">
                                <p><strong>{totalImagens} imagem(ns) nesta trilha:</strong></p>
                                <DraggableCarousel
                                    items={[
                                        ...imagensSalvas.map((img, idx) => (
                                            <div key={`salva-${img.id || idx}`} className="uploadPreview vertical gap5 carrosselCard">
                                                <img src={imagensSalvasUrls[img.id!] ?? ""} alt={img.legenda} />
                                                <button type="button" className="btn-red" onClick={() => handleRemoveSavedImage(img, idx)} disabled={carregando}>
                                                    Excluir
                                                </button>
                                                <p>{img.legenda}</p>
                                            </div>
                                        )),
                                        ...novasImagens.map((file, idx) => (
                                            <div key={`nova-${idx}`} className="uploadPreview vertical gap5 carrosselCard">
                                                <img src={novasImagensBase64[idx]} alt={file.name} />
                                                <button type="button" onClick={() => handleRemoveNewImage(idx)} disabled={carregando}>
                                                    Remover
                                                </button>
                                                <p>{file.name} (Nova)</p>
                                            </div>
                                        ))
                                    ]}
                                />
                            </div>
                        )}
                    </div>

                    <div className="btnFull">
                        <button type="submit" disabled={carregando}>
                            {carregando ? "Salvando alterações..." : "Salvar alterações"}
                        </button>
                    </div>
                </form>
            </section>
        </ProtectedRoute>
    );
}