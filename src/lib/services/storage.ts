import { supabase } from "../supabase";

const DEFAULT_BUCKET = "imagens";

/**
 * Converte URLs públicas do Supabase de volta para o caminho interno no bucket.
 */
export function extractPathFromUrl(url: string, bucketName = DEFAULT_BUCKET): string | null {
    if (!url) return null;
    const marker = `/${bucketName}/`;
    const parts = url.split(marker);
    return parts.length > 1 ? parts[1] : null;
}

/**
 * Faz upload de um arquivo/Blob para qualquer bucket.
 */
export async function uploadFile(
    file: Blob | File, 
    path: string, 
    bucket = DEFAULT_BUCKET
): Promise<string> {
    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

    if (error) throw error;
    return getPublicUrl(path, bucket);
}

/**
 * Retorna a URL pública de um arquivo.
 */
export function getPublicUrl(path: string, bucket = DEFAULT_BUCKET): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Apaga um ou mais arquivos do bucket
 */
export async function deleteFile(
    pathOrUrl: string, 
    bucket = DEFAULT_BUCKET
): Promise<void> {
    const path = pathOrUrl.startsWith("http") 
        ? extractPathFromUrl(pathOrUrl, bucket) 
        : pathOrUrl;

    if (!path) return;

    try {
        await supabase.storage.from(bucket).remove([path]);
    } catch (err) {
        console.warn(`[storage.deleteFile] Não foi possível remover '${path}':`, err);
    }
}

/**
 * Substitui uma imagem existente ou remove se for solicitada exclusão.
 */
export async function processImageUpdate(options: {
    action: "upload" | "remove" | "none";
    currentUrl?: string | null;
    newBlob?: Blob | null;
    folderPath: string; // Ex: "usuarios/12" ou "trilhas/45"
    bucket?: string;
}): Promise<string | null> {
    const { action, currentUrl, newBlob, folderPath, bucket = DEFAULT_BUCKET } = options;

    if (action === "none") return currentUrl || null;

    // Se a ação for upload ou remoção, apaga a imagem anterior se existir
    if (currentUrl) {
        await deleteFile(currentUrl, bucket);
    }

    if (action === "upload" && newBlob) {
        const fileName = `${crypto.randomUUID()}.webp`;
        const fullPath = `${folderPath}/${fileName}`;
        return await uploadFile(newBlob, fullPath, bucket);
    }

    return null; // Ação de remoção
}