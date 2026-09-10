import React, { useEffect, useState, useRef } from "react";
import '../styles/imageCropperModal.css';

export interface ImageCropperModalProps {
    imageSrc: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
    title?: string;
    aspectRatio?: "circle" | "square";
    size?: number;
}

export default function ImageCropperModal({
    imageSrc,
    onCropComplete,
    onCancel,
    title = "Ajustar Imagem",
    aspectRatio = "circle",
    size = 280,
}: ImageCropperModalProps) {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            imageRef.current = img;
            draw();
        };
    }, [imageSrc]);

    useEffect(() => {
        draw();
    }, [zoom, offset]);

    const draw = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);
        ctx.save();

        // Máscara
        ctx.beginPath();
        if (aspectRatio === "circle") {
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        } else {
            ctx.rect(0, 0, size, size);
        }
        ctx.clip();

        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(0, 0, size, size);

        // Renderização proporcional
        const aspect = img.width / img.height;
        let drawWidth = size * zoom;
        let drawHeight = (size / aspect) * zoom;

        if (aspect < 1) {
            drawWidth = (size * aspect) * zoom;
            drawHeight = size * zoom;
        }

        const x = (size - drawWidth) / 2 + offset.x;
        const y = (size - drawHeight) / 2 + offset.y;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        ctx.restore();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (blob) onCropComplete(blob);
        }, "image/webp", 0.85);
    };

    return (
        <div className="cropper-modal-overlay">
            <div className="cropper-modal-card">
                <h3>{title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "10px" }}>
                    Arraste para posicionar e use o controle abaixo para zoom.
                </p>

                <div
                    style={{
                        cursor: isDragging ? "grabbing" : "grab",
                        userSelect: "none",
                        display: "flex",
                        justifyContent: "center",
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            borderRadius: aspectRatio === "circle" ? "50%" : "8px",
                            border: "2px solid #555",
                        }}
                    />
                </div>

                <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.85rem" }}>Zoom</label>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                    <button type="button" onClick={onCancel} className="cropper-btn-cancel">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleConfirm} className="cropper-btn-confirm">
                        Confirmar Recorte
                    </button>
                </div>
            </div>
        </div>
    );
}