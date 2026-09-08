// src/hooks/useEditarTrilha.ts
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, type ImagemDB, type TrilhaDB } from "../../lib/dexie.ts";
import { supabase } from "../supabase.ts";
import { convertToWebP, fileToBase64 } from "../../utils/imageConverter.ts";
import { convertKmlToGeoJson } from "../../utils/kmlConverter.ts";
import { uploadImagem } from "../../lib/services/images.ts";

export function useEditarTrilha() {
    const { id } = useParams();
    const [trilha, setTrilha] = useState<any>(null);
    const [carregando, setCarregando] = useState(false);

    const [geojsonTrilha, setGeojsonTrilha] = useState<any>(null);
    const [nomeArquivoKml, setNomeArquivoKml] = useState<string | null>(null);

    const [imagensSalvas, setImagensSalvas] = useState<ImagemDB[]>([]);
    const [imagensSalvasUrls, setImagensSalvasUrls] = useState<Record<number, string>>({});
    const [imagensDeletadasIds, setImagensDeletadasIds] = useState<number[]>([]);
    
    const [novasImagens, setNovasImagens] = useState<File[]>([]);
    const [novasImagensBase64, setNovasImagensBase64] = useState<string[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const idNumerico = Number(id);
                if (!id || Number.isNaN(idNumerico)) return;

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
                if (data?.geometria) setGeojsonTrilha(data.geometria);

                const imgs = await db.imagens.where("trilha_id").equals(idNumerico).toArray();
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

    async function handleKmlChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setNomeArquivoKml(file.name);
        try {
            const geojsonConvertido = await convertKmlToGeoJson(file);
            setGeojsonTrilha(geojsonConvertido);
        } catch (error: any) {
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
                cor_identificacao: formData.get("cor_identificacao") as string,
                dificuldade: formData.get("dificuldade") as string,
                extensao: formData.get("extensao") as string,
                duracao: formData.get("duracao") as string,
                descricao_curta: formData.get("descricao_curta") as string,
                descricao: formData.get("descricao") as string,
                equipamento_recomendado: formData.get("equipamento_recomendado") as string,
                atencao: formData.get("atencao") as string,
                geometria: geojsonTrilha,
            };

            const { data: trilhaAtualizada, error: erroTrilha } = await supabase
                .from("trilhas")
                .update(dadosTrilha)
                .eq("id", idNumerico)
                .select()
                .single();

            if (erroTrilha) throw erroTrilha;

            const trilhaExistenteDexie = await db.trilhas.get(idNumerico);
            await db.trilhas.put({ ...trilhaExistenteDexie, ...trilhaAtualizada });

            if (imagensDeletadasIds.length > 0) {
                await supabase.from("imagens").delete().in("id", imagensDeletadasIds);
                await db.imagens.bulkDelete(imagensDeletadasIds);
                setImagensDeletadasIds([]);
            }

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
            console.error(error);
            alert(`Erro ao atualizar: ${error?.message || error}`);
        } finally {
            setCarregando(false);
        }
    }

    return {
        trilha,
        carregando,
        geojsonTrilha,
        nomeArquivoKml,
        imagensSalvas,
        imagensSalvasUrls,
        novasImagens,
        novasImagensBase64,
        handleKmlChange,
        handleFileChange,
        handleRemoveSavedImage,
        handleRemoveNewImage,
        handleSubmit,
    };
}