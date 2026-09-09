import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SimpleButton from "./buttons/SimpleButton";
import { generateQrCode, downloadQrCode } from "../../utils/qrcodeUtils.ts"; 

interface QrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    path: string;
    title: string;
}

export default function QrCodeModal({ isOpen, onClose, path, title }: QrCodeModalProps) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

    useEffect(() => {
        // Só gera o QR Code se o modal estiver aberto e houver um path válido
        if (isOpen && path) {
            generateQrCode(path)
                .then(setQrCodeDataUrl)
                .catch(() => alert("Não foi possível gerar o QR Code."));
        } else {
            // Limpa o estado quando o modal fecha
            setQrCodeDataUrl("");
        }
    }, [isOpen, path]);

    const handleDownload = () => {
        if (qrCodeDataUrl) {
            downloadQrCode(qrCodeDataUrl, title);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal vertical center">
            <div className="modal-content card vertical gap15" style={{ alignItems: 'center' }}>
                
                <h2>QR Code</h2>
                <p style={{ textAlign: 'center' }}>{title}</p>

                {qrCodeDataUrl && (
                    <img 
                        src={qrCodeDataUrl} 
                        alt={`QR Code de ${title}`} 
                        style={{ width: '250px', height: '250px', borderRadius: '10px' }} 
                    />
                )}

                <div className="horizontal btnFull gap15" style={{ marginTop: '10px' }}>
                    <SimpleButton tema="dark" icon="X" raio="10" onClick={onClose}>
                        Fechar
                    </SimpleButton>

                    <SimpleButton tema="green" icon="Download" raio="10" onClick={handleDownload}>
                        Baixar
                    </SimpleButton>
                </div>
            </div>
        </div>,
        document.body
    );
}