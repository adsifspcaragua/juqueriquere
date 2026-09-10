import { useRef, useState } from "react";
import { createRecord } from "../../../../lib/services/crud.ts";
import { db, type TrilhaDB } from "../../../../lib/dexie.ts";

import SimpleButton from "../../../../components/ui/buttons/SimpleButton.tsx";
import DraggableCarousel from "../../../../components/ui/DraggableCarousel.tsx";
import AutoResizeTextarea from "../../../../utils/AutoResizeTextarea.tsx";
import Map from "../../../../components/ui/Map/Map.tsx";

import { convertToWebP } from "../../../../utils/imageConverter.ts";
import { convertKmlToGeoJson } from "../../../../utils/kmlConverter.ts";
import { uploadImagem } from "../../../../lib/services/images.ts";
import ProtectedRoute from "../../../../components/Protected.tsx";

export default function CadastrarTrilha() {
    const formRef = useRef<HTMLFormElement>(null);

    const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(false);

    const [geojsonTrilha, setGeojsonTrilha] = useState<any>(null);
    const [nomeArquivoKml, setNomeArquivoKml] = useState<string | null>(null);
    const [corIdentificacao, setCorIdentificacao] = useState("#000000");

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        // Cria URLs temporárias super leves para pré-visualização
        const newUrls = files.map(file => URL.createObjectURL(file));

        setImagensSelecionadas((prev) => [...prev, ...files]);
        setPreviewUrls((prev) => [...prev, ...newUrls]);
    }

    function handleRemoveImage(indexToRemove: number) {
        // Libera a memória da URL criada
        URL.revokeObjectURL(previewUrls[indexToRemove]);

        setImagensSelecionadas((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setPreviewUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

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
            setGeojsonTrilha(null);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCarregando(true);

        try {
            const formData = new FormData(e.currentTarget);

            const dadosTrilhaSupabase = {
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

            // 1. Cria a trilha principal
            const novaTrilha = await createRecord<TrilhaDB>("trilhas", dadosTrilhaSupabase);
            if (!novaTrilha) throw new Error("Não foi possível criar a trilha.");

            // 2. Salva no Dexie local
            const trilhaParaDexie: TrilhaDB = {
                ...novaTrilha,
                pontos_interesse: [],
                ramais: [],
                pontos_no_mapa: []
            };
            await db.trilhas.put(trilhaParaDexie);

            // 3. Processamento individual e seguro das imagens
            if (imagensSelecionadas.length > 0) {
                for (let index = 0; index < imagensSelecionadas.length; index++) {
                    const file = imagensSelecionadas[index];
                    
                    // Converte para WebP
                    const blobWebP = await convertToWebP(file, 0.8);
                    
                    const nomeArquivo = `${crypto.randomUUID()}.webp`;
                    const caminho = `trilhas/${nomeArquivo}`;

                    // Upload no Storage
                    await uploadImagem(blobWebP, caminho);

                    // Cria registro no Banco de Dados
                    const registroImagem = await createRecord<any>("imagens", {
                        trilha_id: novaTrilha.id,
                        ponto_interesse_id: null,
                        caminho_arquivo: caminho,
                        legenda: `Imagem ${index + 1} da trilha ${novaTrilha.nome}`,
                    });

                    // Se a imagem foi cadastrada com sucesso no banco, salva no Dexie local
                    if (registroImagem) {
                        await db.imagens.put({
                            ...registroImagem,
                            arquivo: blobWebP
                        });
                    }
                }
            }

            alert("Trilha e imagens cadastradas com sucesso!");

            // Limpa o formulário e libera memória das URLs de pré-visualização
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            formRef.current?.reset();
            setImagensSelecionadas([]);
            setPreviewUrls([]);
            setGeojsonTrilha(null);
            setNomeArquivoKml(null);
            setCorIdentificacao("#000000");

        } catch (error: any) {
            console.error("Erro ao cadastrar trilha:", error);
            alert(`Erro ao cadastrar: ${error?.message || error}`);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap15">
                <SimpleButton path="/admin/trilhas" type="back" icon="setaBack">
                    Voltar
                </SimpleButton>

                <h1>Cadastrar Trilha</h1>

                <form ref={formRef} className="card vertical gap15" onSubmit={handleSubmit}>
                    
                    <div className="vertical gap5">
                        <label>Nome:</label>
                        <input name="nome" placeholder="Ex: Trilha da Capivara" required disabled={carregando} />
                    </div>

                    <div className="vertical gap5" style={{ background: "#f0f8ff", padding: "10px", borderRadius: "8px", border: "1px dashed #ccc" }}>
                        <label>Arquivo de Rota (KML):</label>
                        <input type="file" accept=".kml" onChange={handleKmlChange} disabled={carregando} />
                        {nomeArquivoKml && (
                            <p style={{ fontSize: "0.9rem", color: "green", margin: 0 }}>
                             {nomeArquivoKml} carregado ({geojsonTrilha?.features?.length || 0} linha(s) encontrada(s)).
                            </p>
                        )}
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
                        <select name="dificuldade" required disabled={carregando}>
                            <option value="">Selecione...</option>
                            <option value="Fácil">Fácil</option>
                            <option value="Moderado">Moderada</option>
                            <option value="Difícil">Difícil</option>
                        </select>
                    </div>

                    <div className="vertical gap5">
                        <label>Extensão (ex: 5.2 km):</label>
                        <input name="extensao" placeholder="Ex: 5 km" required disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Duração Estimada (ex: 2 horas):</label>
                        <input name="duracao" placeholder="Ex: 2 horas" required disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição Curta:</label>
                        <input name="descricao_curta" placeholder="Resumo breve da trilha" required disabled={carregando} maxLength={150} />
                    </div>

                    <div className="vertical gap5">
                        <label>Descrição Detalhada:</label>
                        <AutoResizeTextarea name="descricao" placeholder="Detalhes completos sobre a trilha..." required disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Equipamento Recomendado:</label>
                        <AutoResizeTextarea name="equipamento_recomendado" placeholder="Ex: Água, protetor solar, bota de trilha..." disabled={carregando} />
                    </div>

                    <div className="vertical gap5">
                        <label>Atenção / Avisos:</label>
                        <AutoResizeTextarea name="atencao" placeholder="Ex: Trecho escorregadio após chuvas..." disabled={carregando} />
                    </div>

                    <div className="vertical gap15">
                        <div className="vertical gap5" id="file">
                            <label>Imagens da Trilha:</label>
                            <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={carregando} />
                        </div>

                        {imagensSelecionadas.length > 0 && (
                            <div className="vertical gap5">
                                <p>
                                    <strong>{imagensSelecionadas.length} imagem(ns) selecionada(s):</strong>
                                </p>
                                <DraggableCarousel
                                    items={imagensSelecionadas.map((file, idx) => (
                                        <div key={idx} className="uploadPreview vertical gap5 carrosselCard">
                                            <img src={previewUrls[idx]} alt={file.name} />
                                            <button type="button" onClick={() => handleRemoveImage(idx)} disabled={carregando}>Remover</button>
                                            <p>{file.name}</p>
                                        </div>
                                    ))}
                                />
                            </div>
                        )}
                    </div>

                    <div className="btnFull">
                        <button type="submit" disabled={carregando}>
                            {carregando ? "Cadastrando..." : "Cadastrar trilha"}
                        </button>
                    </div>
                </form>
            </section>
        </ProtectedRoute>
    );
}