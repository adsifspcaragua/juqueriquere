import { useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import SimpleButton from "./ui/buttons/SimpleButton";
import './styles/Scanner.css';

export default function Scanner({ onClose }: { onClose: () => void }) {
  const qrRef = useRef<Html5Qrcode | null>(null);

  // 1. Centraliza a lógica de forçar a parada da câmera e limpar o DOM
  const stopScanner = useCallback(async () => {
    try {
      if (qrRef.current) {
        await qrRef.current.stop().catch(() => {});
        qrRef.current.clear();
        qrRef.current = null;
      }

      // 🔥 Força matar qualquer stream restante (substitui o 'any' por genéricos do TS)
      document.querySelectorAll<HTMLVideoElement>("#reader video").forEach((video) => {
        if (video.srcObject) {
          (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
      });

      // 🔥 Limpa DOM manualmente
      const reader = document.getElementById("reader");
      if (reader) reader.innerHTML = "";
    } catch (err) {
      console.warn("Erro ao parar câmera:", err);
    }
  }, []);

  const handleClose = useCallback(async () => {
    await stopScanner();
    // 🔥 pequeno delay pra garantir que browser finalize stream
    setTimeout(onClose, 100);
  }, [stopScanner, onClose]);

  useEffect(() => {
    if (qrRef.current) return;

    qrRef.current = new Html5Qrcode("reader");

    qrRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        const path = decodedText.startsWith("/") ? decodedText : `/${decodedText}`;

        if (/^\/trilha\/\d+\/?$/.test(path)) {
          window.location.href = path;
        } else {
          alert("QR inválido");
        }

        await handleClose(); 
      },
      () => {} // Callback de ignorar erros de frame
    );

    return () => { stopScanner(); };
  }, [handleClose, stopScanner]);

  return (
    <div className="leitorQR" onClick={handleClose}>
      <div className="QRcontainer vertical" onClick={(e) => e.stopPropagation()}>
        <h1>Aponte a câmera<br />para um código QR</h1>
        <div id="reader" />
        <SimpleButton onClick={handleClose} tema="dark" icon="X" raio="10">
          Fechar
        </SimpleButton>
      </div>
    </div>
  );
}