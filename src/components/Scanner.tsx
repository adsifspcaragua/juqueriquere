import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import SimpleButton from "./ui/buttons/SimpleButton";
import './Scanner.css';

export default function Scanner({ onClose }: { onClose: () => void }) {
  const qrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (qrRef.current) return;

    const html5QrCode = new Html5Qrcode("reader");
    qrRef.current = html5QrCode;

    const start = async () => {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          const path = decodedText.startsWith("/")
            ? decodedText
            : `/${decodedText}`;

          if (/^\/trilha\/\d+\/?$/.test(path)) {
            window.location.href = path;
          } else {
            alert("QR inválido");
          }

          await stop();   
          onClose();
        },
        () => { }
      );
    };

    const stop = async () => {
      try {
        if (qrRef.current) {
          await qrRef.current.stop().catch(() => { });
          qrRef.current.clear();
          qrRef.current = null;
        }

        // 🔥 FORÇA desligar a câmera (resolve o problema)
        const video = document.querySelector("#reader video") as HTMLVideoElement;

        if (video && video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }

      } catch (err) {
        console.warn("Erro ao parar câmera:", err);
      }
    };

    start();

    return () => {
      stop();
    };
  }, []);

  const handleClose = async () => {
    try {
      if (qrRef.current) {
        await qrRef.current.stop().catch(() => { });
        qrRef.current.clear();
        qrRef.current = null;
      }

      // 🔥 força matar qualquer stream restante
      const videos = document.querySelectorAll("#reader video");

      videos.forEach((video: any) => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
      });

      // 🔥 limpa DOM manualmente (ESSENCIAL)
      const reader = document.getElementById("reader");
      if (reader) reader.innerHTML = "";

      // 🔥 pequeno delay pra garantir que browser finalize stream
      setTimeout(() => {
        onClose();
      }, 100);

    } catch (err) {
      console.warn("Erro ao fechar scanner:", err);
      onClose();
    }
  };

  return (
    <div className="leitorQR" onClick={handleClose}>
      <div className="QRcontainer vertical" onClick={(e) => e.stopPropagation()}>
        <h1>Aponte a câmera<br></br>para um código QR</h1>
        <div id="reader" />
        <SimpleButton onClick={() => handleClose()} tema="dark" icon="X" raio="10">Fechar</SimpleButton>
      </div>
    </div>
  );
}