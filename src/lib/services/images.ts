import { supabase } from "../supabase";

export async function uploadImagem(
    arquivo: File | Blob,
    caminho: string
) {
    console.log("📤 Enviando imagem para o Storage:");
    console.log("Caminho:", caminho);
    console.log("Tipo:", arquivo.type);
    console.log("Tamanho:", arquivo.size);

    const { data, error } = await supabase.storage
        .from("imagens")
        .upload(caminho, arquivo, {
            cacheControl: "31536000",
            upsert: true,
            contentType: arquivo.type || "image/webp",
        });

    if (error) {
        console.error("Erro ao enviar imagem:", error);
        throw error;
    }

    console.log("✅ Imagem enviada:", data);

    return data;
}

export function obterUrlImagem(caminho: string) {
    const { data } = supabase.storage
        .from("imagens")
        .getPublicUrl(caminho);

    return data.publicUrl;
}