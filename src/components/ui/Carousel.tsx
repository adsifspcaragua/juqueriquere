import React, { useState, useEffect, type ReactNode, isValidElement } from 'react';

interface CarouselProps {
  items: ReactNode[];
  onChange?: (id: string | number) => void;
}

const Carousel = ({ items, onChange }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lógica para extrair o ID ou Index
  useEffect(() => {
  if (!onChange) return;

  const currentItem = items[currentIndex];

  if (isValidElement(currentItem)) {
    const props = currentItem.props as { id?: string | number };

    if (props.id !== undefined) {
      onChange(props.id);
    } else {
      onChange(currentIndex);
    }
  } else {
    // Caso seja apenas uma string ou número (não é um Element)
    onChange(currentIndex);
  }
}, [currentIndex, items, onChange]);

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1 === items.length ? 0 : prev + 1));
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  return (
    <div style={containerStyle}>
      <button onClick={prevItem} style={buttonStyle}>❮</button>
      
      <div style={contentStyle}>
        {items[currentIndex]}
      </div>

      <button onClick={nextItem} style={buttonStyle}>❯</button>
    </div>
  );
};

// Estilos básicos inline para demonstração
const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  border: '1px solid #ddd',
  borderRadius: '8px',
  width: 'fit-content'
};

const contentStyle: React.CSSProperties = {
  minWidth: '200px',
  textAlign: 'center',
  fontSize: '1.2rem'
};

const buttonStyle: React.CSSProperties = {
  cursor: 'pointer',
  padding: '8px 12px',
  borderRadius: '50%',
  border: '1px solid #ccc',
  background: '#fff'
};

export default Carousel;