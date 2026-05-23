import { useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { type FeatureCollection, type Geometry } from 'geojson';
import mapImage from '../../assets/img/map.png';
import trilhasPontosRaw from '../../data/Trilhas PNMJ/PontosRaw.json'; 
import trilhasLinhasRaw from '../../data/Trilhas PNMJ/TrilhasRaw.json';
import data from '../../data.json';

const trilhasPontos = trilhasPontosRaw as unknown as FeatureCollection<Geometry>;
const trilhasLinhas = trilhasLinhasRaw as unknown as FeatureCollection<Geometry>;

interface MapProps {
  id?: number | number[];
  onHover?: (event: React.MouseEvent<SVGElement>, id: number) => void;
  onClick?: (id: number) => void;
  onLeave?: () => void;
  highlight?: number | number[]; // IDs das trilhas a destacar
}

export default function Map({ id, onHover, onClick, onLeave, highlight }: MapProps) {

  // Função auxiliar para normalizar nomes e facilitar a busca entre JSONs
  const normalize = (s: string) => s.toLowerCase().replace('trilha ', '').replace('.', '').trim();

  const projection = useMemo(() => {
    const width = 1146;
    const height = 1146;
    const margin = 41;

    return geoMercator().fitExtent(
      [[margin, margin], [width - margin, height - margin]], 
      { type: "FeatureCollection", features: [...trilhasPontos.features, ...trilhasLinhas.features] }
    );
  }, []);

  const pathGenerator = geoPath().projection(projection);

  const filteredData = useMemo(() => {
    const targetIds = Array.isArray(id) ? id : (id ? [id] : null);
    
    // Mapeamento de trilhas associando-as ao ID do data.json
    const lines = trilhasLinhas.features.map(feature => {

      const featName = normalize(feature.properties?.name || "");
      const trailMetadata = data.trilhas.find(t => 
        normalize(t.nome).includes(featName) || featName.includes(t.nome)
      );
      
      return { feature, trailId: trailMetadata?.id };

    }).filter(item => {
      if (!item.trailId) return false;
      return targetIds ? targetIds.includes(item.trailId) : true;
    });

    const points = trilhasPontos.features.map(feature => {
      const featName = normalize(feature.properties?.name || "");
      
      // Procura em todas as trilhas qual possui este ponto catalogado
      const trailMetadata = data.trilhas.find(t => 
        t.pontos_interesse.some(poi => {
          // Extrai todos os valores das chaves do objeto (ex: "Jerivá", "Bifurcação", etc)
          const valoresDoPonto = Object.values(poi).map(val => normalize(String(val)));
          // Verifica se o nome que vem do mapa (PontosRaw) está nesta lista
          return valoresDoPonto.includes(featName);
        })
      );

      return { feature, trailId: trailMetadata?.id };
    }).filter(item => {
      // Só exibe se o ponto existir no data.json (tiver trailId)
      // E, se houver um filtro de ID ativo, o ponto deve pertencer a essa trilha
      if (!item.trailId) return false;
      return targetIds ? targetIds.includes(item.trailId) : true;
    });

    return { lines, points };
  }, [id]);

  return (
    <svg width="100%" height="auto" viewBox="0 0 1146 1146" fill="none" xmlns="http://www.w3.org/2000/svg">
      <image href={mapImage} width="1146" height="1146" />

      {/* Camada de Trilhas */}
      {filteredData.lines.map((item, idx) => {
  const d = pathGenerator(item.feature) || "";
  
  return (
    <g key={`trail-group-${idx}`}>
      {/* 1. PATH FANTASMA (Área de clique expandida) */}
      <path
        d={d}
        stroke="transparent"
        strokeWidth="45"
        fill="none"
        style={{ cursor: 'pointer' }}
        onMouseEnter={(e) => item.trailId && onHover?.(e, item.trailId)}
        onMouseLeave={onLeave}
        onClick={() => item.trailId && onClick?.(item.trailId)}
      />

      {/* 2. PATH VISUAL (O que o usuário vê) */}
      <path
        d={d}
        stroke={item.feature.properties?.stroke || "#4CAF50"}
        strokeWidth="10" // Espessura visual fina
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
        pointerEvents="none"
        className={!highlight || (item.trailId && (Array.isArray(highlight) ? highlight.includes(item.trailId) : highlight === item.trailId)) ? 'path highlighted' : 'path not-highlighted'}
          />
    </g>
      );
    })}

      {/* Camada de Pontos */}
      <g className="points-layer">
        {filteredData.points.map((item, idx) => {
          const coords = (item.feature.geometry as any).coordinates;
          const [x, y] = projection([coords[0], coords[1]]) || [0, 0];

          return (
            <circle
              key={`point-${idx}`}
              cx={x}
              cy={y}
              r="8"
              fill="#fbc02d"
              stroke="#ffffff"
              strokeWidth="2"
              // Também passamos o item.trailId aqui
              onMouseEnter={(e) => item.trailId && onHover?.(e, item.trailId)}
              onMouseLeave={onLeave}
              onClick={() => item.trailId && onClick?.(item.trailId)}
              style={{ cursor: 'pointer' }}
            >
              <title>{item.feature.properties?.name}</title>
            </circle>
          );
        })}
      </g>
    </svg>
  );
}