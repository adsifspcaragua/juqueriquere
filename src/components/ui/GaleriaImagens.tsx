import DraggableCarousel from "./DraggableCarousel";
import imgNotFound from "../../assets/img/imgNotFound.webp";

interface GaleriaImagensProps {
    imagens?: string[];
}

export default function GaleriaImagens({ imagens }: GaleriaImagensProps) {
    // Se o array não existir ou estiver vazio, usa a imagem de fallback 
    const imagensExibicao = imagens?.length ? imagens : [imgNotFound];

    const items = imagensExibicao.map((imagem, index) => (
        <div key={String(index)}>
            <img src={imagem} alt={`Imagem ${index + 1}`} />
        </div>
    ));

    return <DraggableCarousel items={items} emptyImage={imgNotFound} />;
}