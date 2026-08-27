import { useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import SimpleButton from "./ui/buttons/SimpleButton";
import './styles/Scanner.css';

export default function Scanner({ onClose }: { onClose: () => void }) {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const stopScanner = useCallback(async () => {
    try {
      if (qrRef.current) {
        if (qrRef.current.isScanning) {
          await qrRef.current.stop().catch(() => {});
        }
        qrRef.current.clear();
        qrRef.current = null;
      }

      document.querySelectorAll<HTMLVideoElement>("#reader video").forEach((video) => {
        if (video.srcObject) {
          (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
      });

      const reader = document.getElementById("reader");
      if (reader) reader.innerHTML = "";
    } catch (err) {}
  }, []);

  const handleClose = useCallback(async () => {
    await stopScanner();
    setTimeout(() => {onCloseRef.current();}, 100);
  }, [stopScanner]);

  useEffect(() => {
    if (qrRef.current || isStartingRef.current) return;

    isStartingRef.current = true;
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

        await stopScanner();
        onCloseRef.current();
      }, () => {}
    ).finally(() => {
      isStartingRef.current = false;
    });

    return () => {
      stopScanner();
    };
  }, [stopScanner]);

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