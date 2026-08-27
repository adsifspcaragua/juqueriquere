import { useEffect, useRef, useState, isValidElement, type ReactNode } from 'react';
import SimpleButton from './buttons/SimpleButton';
import '../styles/DraggableCarousel.css';

interface CarouselProps {
    items: ReactNode[];
    activeId?: string | number;
    onChange?: (id: string | number) => void;
    emptyImage?: string;
}

const NativeCarousel = ({
    items,
    activeId,
    onChange,
    emptyImage,
}: CarouselProps) => {
    const [index, setIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeout = useRef<number | null>(null);

    // Funções auxiliares
    const getCardWidth = (): number => {
        const firstCard = containerRef.current?.children[0] as HTMLElement;
        return firstCard ? firstCard.offsetWidth + 10 : 0; // 10 é o gap
    };

    const getIdFromIndex = (idx: number): string | number => {
        const currentItem = items[idx];
        if (isValidElement(currentItem)) {
            const props = currentItem.props as { id?: string | number };
            if (props.id !== undefined) return props.id;
        }
        return idx;
    };

    // EXTERNO -> INTERNO
    useEffect(() => {
        console.log(items)
        if (activeId === undefined || items.length === 0) return;

        const idx = items.findIndex((item) => {
            if (isValidElement(item)) {
                const props = item.props as { id?: string | number };
                return props.id === activeId;
            }
            return false;
        });

        if (idx !== -1 && idx !== index) {
            setIndex(idx);
            containerRef.current?.scrollTo({
                left: idx * getCardWidth(),
                behavior: 'smooth',
            });
        }
    }, [activeId, items, index]);

    // INTERNO -> EXTERNO (Cliques nas setas)
    const handleArrow = (direction: number) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= items.length) return;

        setIndex(nextIndex);
        containerRef.current?.scrollTo({
            left: nextIndex * getCardWidth(),
            behavior: 'smooth',
        });

        onChange?.(getIdFromIndex(nextIndex));
    };

    // INTERNO -> EXTERNO (Scroll manual)
    const handleScroll = () => {
        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = setTimeout(() => {
            const container = containerRef.current;
            const cardWidth = getCardWidth();
            if (!container || cardWidth === 0) return;

            const newIndex = Math.round(container.scrollLeft / cardWidth);

            if (newIndex !== index && newIndex >= 0 && newIndex < items.length) {
                setIndex(newIndex);
                onChange?.(getIdFromIndex(newIndex));
            }
        }, 100);
    };

    return (
        <div className="carrosselContainer">
            {index > 0 && (
                <div className="circleButton left">
                    <SimpleButton
                        icon="Left"
                        onClick={() => handleArrow(-1)}
                    />
                </div>
            )}

            <div
                ref={containerRef}
                className="carrossel"
                onScroll={handleScroll}
            >
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <div key={idx} className="carrosselCard">
                            {item}
                        </div>
                    ))
                ) : emptyImage ? (
                    <div className="carrosselCard empty">
                        <img
                            src={emptyImage}
                            alt="Nenhuma imagem disponível"
                        />
                    </div>
                ) : null}
            </div>

            {index < items.length - 1 && items.length > 0 && (
                <div className="circleButton right">
                    <SimpleButton
                        icon="Right"
                        onClick={() => handleArrow(1)}
                    />
                </div>
            )}
        </div>
    );
};

export default NativeCarousel;