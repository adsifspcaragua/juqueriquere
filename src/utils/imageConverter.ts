// src/utils/imageConverter.ts

export function convertToWebPBase64(file: File, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const resultBase64 = event.target?.result as string;

            if (file.type === "image/webp") {
                return resolve(resultBase64);
            }

            const img = new Image();
            img.src = resultBase64;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("Não foi possível obter o contexto do Canvas."));

                ctx.drawImage(img, 0, 0);

                const webpBase64 = canvas.toDataURL("image/webp", quality);
                resolve(webpBase64);
            };

            img.onerror = () => reject(new Error("Erro ao carregar a imagem para conversão."));
        };
        
        reader.onerror = (error) => reject(error);
    });
}