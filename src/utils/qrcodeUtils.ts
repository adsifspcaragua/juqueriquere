import QRCode from "qrcode";

export async function generateQrCode(text: string): Promise<string> {
    try {
        const dataUrl = await QRCode.toDataURL(text, { 
            width: 300, 
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        return dataUrl;
    } catch (error) {
        console.error("Erro ao gerar QR Code", error);
        throw error;
    }
}


export function downloadQrCode(dataUrl: string, nomeSugerido: string = "arquivo"): void {
    if (!dataUrl) return;
    
    const link = document.createElement("a");
    link.href = dataUrl;
    
    const nomeFormatado = nomeSugerido.replace(/\s+/g, '_');
    link.download = `qrcode_${nomeFormatado}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}