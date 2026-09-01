export async function convertToWebP(
    file: File,
    quality = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement("canvas");

            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Não foi possível criar o contexto do canvas."));
                return;
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Não foi possível converter a imagem."));
                        return;
                    }

                    resolve(blob);
                },
                "image/webp",
                quality
            );
        };

        img.onerror = () => {
            reject(new Error("Não foi possível carregar a imagem."));
        };

        img.src = URL.createObjectURL(file);
    });
}