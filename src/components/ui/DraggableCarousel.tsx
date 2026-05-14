import {
  useEffect,
  useRef,
  isValidElement,
  type ReactNode
} from 'react';

interface CarouselProps {
  items: ReactNode[];
  activeId?: string | number;
  onChange?: (id: string | number) => void;
}

const NativeCarousel = ({
  items,
  activeId,
  onChange
}: CarouselProps) => {

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollTimeout = useRef<number | null>(null);

  // EXTERNO -> INTERNO
  useEffect(() => {

    if (activeId === undefined) return;

    const index = items.findIndex((item) => {
      if (isValidElement(item)) {
        const props = item.props as {
          id?: string | number
        };
        return props.id === activeId;
      }
      return false;
    });

    if (index === -1) return;

    const container = containerRef.current;
    if (!container) return;

    const firstCard = container.children[0] as HTMLElement;
    if (!firstCard) return;

    const gap = 10;

    const cardWidth =
      firstCard.offsetWidth + gap;

    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });

  }, [activeId]);

  // INTERNO -> EXTERNO
  const handleScroll = () => {

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {

      const container = containerRef.current;

      if (!container) return;

      const firstCard =
        container.children[0] as HTMLElement;

      if (!firstCard) return;

      const cardWidth =
        firstCard.offsetWidth + 10;

      const index = Math.round(
        container.scrollLeft / cardWidth
      );

      const currentItem = items[index];

      if (!currentItem) return;

      let currentId: string | number = index;

      if (isValidElement(currentItem)) {

        const props = currentItem.props as {
          id?: string | number
        };

        if (props.id !== undefined) {
          currentId = props.id;
        }
      }

      onChange?.(currentId);

    }, 100);
  };

  return (

    <div
      ref={containerRef}
      className="carrossel"
      onScroll={handleScroll}
    >

      {items.map((item, index) => (

        <div
          key={index}
          className="carrosselCard"
        >
          {item}
        </div>

      ))}

    </div>
  );
};

export default NativeCarousel;