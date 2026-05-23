import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SimpleButton from '../components/ui/buttons/SimpleButton';
import TrilhasMap from '../components/ui/TrilhasMap';
import './styles/mapa.css';
import data from '../data.json';
import { type Trilha } from './Trilhas/TrilhaInfo';

export default function Mapa() {
    const navigate = useNavigate();

    const [tooltip, setTooltip] = useState({
        visible: false,
        x: 0,
        y: 0,
        content: null as React.ReactNode | null,
    });
    const onHover = (e: React.MouseEvent, id: number) => {
        const trilha = data.trilhas.find(t => t.id === id) as Trilha;
        const content = (
                <div className='popoverContent'>
                    <h3>{trilha.nome}</h3>
                </div>
        );
        
        setTooltip(
            {
            visible: true,
            x: e.clientX,
            y: e.clientY,
            content,
            }
    
        );
    };

    const handleLeave = () => {
        setTooltip({ ...tooltip, visible: false });
    };

    const onClick = (id : number) => {
        console.log(`Hovering over path with id: ${id}`);
        navigate(`/trilha/${id}`);
    };


    return (
        <>
            <div className="paddingHeader"></div>
            <section className='vertical conteudo'>
                <SimpleButton path="/trilhas/" type='back'>Voltar para Trilhas</SimpleButton>

                <div className="vertical conteudo" id='detalheTrilha'>
                    <div className="mapaInterativo">
                        <TrilhasMap onHover={(e, id) => onHover(e, id) } onClick={(id) => onClick(id)} onLeave={handleLeave}/>
                        {tooltip.visible && (
                            <div
                                className='popover'
                                style={{
                                    position: 'fixed', 
                                    top: tooltip.y + 20,
                                    left: tooltip.x + 15,
                                }}
                                >
                                {tooltip.content}
                            </div>
                        )}
                    </div>

                    <div className="vertical conteudo" id='conteudoTrilha'>
                        
                    </div>
                </div>
            </section>
        </>
    );
}