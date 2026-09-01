import { useRef, useState, useEffect, isValidElement, type ReactNode } from 'react';
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
    const [internalIndex, setInternalIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeout = useRef<number | null>(null);

    // Auxiliares
    const getCardWidth = (): number => {
        const firstCard = containerRef.current?.children[0] as HTMLElement;
        return firstCard ? firstCard.offsetWidth + 10 : 0;
    };

    const getIdFromIndex = (idx: number): string | number => {
        const currentItem = items[idx];
        if (isValidElement(currentItem)) {
            const props = currentItem.props as { id?: string | number };
            if (props.id !== undefined) return props.id;
        }
        return idx;
    };

    const getIndexFromId = (id?: string | number): number => {
        if (id === undefined || items.length === 0) return -1;
        return items.findIndex((item) => {
            if (isValidElement(item)) {
                const props = item.props as { id?: string | number };
                return props.id === id;
            }
            return false;
        });
    };

    // Resolve o índice atual durante a renderização, impedindo dupla renderização
    const computedIndexFromProp = getIndexFromId(activeId);
    const isControlled = activeId !== undefined && computedIndexFromProp !== -1;
    const currentIndex = isControlled ? computedIndexFromProp : internalIndex;

    useEffect(() => {
        if (isControlled && containerRef.current) {
            containerRef.current.scrollTo({
                left: computedIndexFromProp * getCardWidth(),
                behavior: 'smooth',
            });
        }
    }, [isControlled, computedIndexFromProp]); // Dispara apenas quando o ID controlado muda

    const scrollToIndex = (newIndex: number) => {
        if (newIndex < 0 || newIndex >= items.length) return;

        if (!isControlled) {
            setInternalIndex(newIndex);
        }

        containerRef.current?.scrollTo({
            left: newIndex * getCardWidth(),
            behavior: 'smooth',
        });

        onChange?.(getIdFromIndex(newIndex));
    };

    const handleArrow = (direction: number) => {
        scrollToIndex(currentIndex + direction);
    };

    const handleScroll = () => {
        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = window.setTimeout(() => {
            const container = containerRef.current;
            const cardWidth = getCardWidth();
            if (!container || cardWidth === 0) return;

            const newIndex = Math.round(container.scrollLeft / cardWidth);

            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
                if (!isControlled) {
                    setInternalIndex(newIndex);
                }
                onChange?.(getIdFromIndex(newIndex));
            }
        }, 100);
    };

    return (
        <div className="carrosselContainer">
            {currentIndex > 0 && (
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

            {currentIndex < items.length - 1 && items.length > 0 && (
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
