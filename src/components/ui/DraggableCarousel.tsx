import React, { useState, useEffect, useRef, isValidElement, type ReactNode } from 'react';
import { motion, type PanInfo } from 'framer-motion';

interface CarouselProps {
  items: ReactNode[];
  onChange?: (id: string | number) => void;
  cardWidth?: number;
  activeId?: string | number; // Adicione esta linha
}

const DraggableCarousel = ({ items, onChange, cardWidth = 300, activeId }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Efeito para sincronizar o carrossel quando o botão externo é clicado
  // DraggableCarousel.tsx

// 1. Sincroniza EXTERNO -> INTERNO
// Quando você clica no botão lá fora, o carrossel pula para o index certo
useEffect(() => {
  if (activeId === undefined) return;

  const newIndex = items.findIndex((item) => {
    if (isValidElement(item)) {
      const props = item.props as { id?: string | number };
      return props.id === activeId;
    }
    return false;
  });

  if (newIndex !== -1 && newIndex !== currentIndex) {
    setCurrentIndex(newIndex);
  }
}, [activeId, items]); // Não coloque currentIndex aqui!

// 2. Notifica INTERNO -> EXTERNO
// Quando o index muda (via arraste), avisamos o componente pai
useEffect(() => {
  if (!onChange) return;

  const currentItem = items[currentIndex];
  let currentId: string | number = currentIndex;

  if (isValidElement(currentItem)) {
    const props = currentItem.props as { id?: string | number };
    if (props.id !== undefined) currentId = props.id;
  }

  // A TRAVA CRUCIAL: Só chama o onChange se o ID for realmente 
  // diferente do que o Pai já sabe (activeId)
  if (currentId !== activeId) {
    onChange(currentId);
  }
}, [currentIndex]); // Focado apenas na mudança de posição

  // Função chamada quando o usuário solta o mouse/dedo
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50; // Quantos pixels o usuário precisa arrastar para trocar
    const velocity = info.velocity.x; // Velocidade do movimento

    if (info.offset.x < -threshold || velocity < -500) {
      // Arrastou para a esquerda -> Próximo
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } else if (info.offset.x > threshold || velocity > 500) {
      // Arrastou para a direita -> Anterior
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  return (
    <div ref={containerRef} style={viewportStyle}>
      <motion.div
        drag="x"
        // Limita o arraste para não mostrar o "vazio"
        dragConstraints={{
          left: -(cardWidth * (items.length - 1)),
          right: 0,
        }}
        dragElastic={0.1} // Efeito de resistência nas pontas
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * cardWidth) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          display: 'flex',
          width: items.length * cardWidth,
          cursor: 'grab'
        }}
        whileTap={{ cursor: 'grabbing' }}
      >
        {items.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              width: cardWidth, 
              flexShrink: 0,
              padding: '0 10px',
              boxSizing: 'border-box'
            }}
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// Estilos básicos
const viewportStyle: React.CSSProperties = {
  overflow: 'hidden', // Esconde o que está fora da tela
  width: '100%',
  padding: '20px 0',
  userSelect: 'none' // Evita selecionar texto enquanto arrasta
};

export default DraggableCarousel;