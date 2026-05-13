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
}

export default function Map({ id, onHover, onClick, onLeave }: MapProps) {
  
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
    
    // 1. Mapeamos as LINHAS (Trilhas) associando-as ao ID do data.json
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

    // 2. Mapeamos os PONTOS associando-os ao ID da trilha a que pertencem
    const points = trilhasPontos.features.map(feature => {

      const featName = normalize(feature.properties?.name || "");
      const trailMetadata = data.trilhas.find(t => 
        t.pontos_interesse.some(p => normalize(p.planta) === featName)
      );

      return { feature, trailId: trailMetadata?.id };

    }).filter(item => {

      if (!item.trailId) return false;
      return targetIds ? targetIds.includes(item.trailId) : true;

    });

    return { lines, points };
  }, [id]);

  return (
    <svg width="100%" height="auto" viewBox="0 0 1146 1146" fill="none" xmlns="http://www.w3.org/2000/svg">
      <image href={mapImage} width="1146" height="1146" />

      {/* Camada de Trilhas */}
      <g className="trails-layer">
        {filteredData.lines.map((item, idx) => (
          <path
            key={`line-${idx}`}
            d={pathGenerator(item.feature) || ""}
            stroke={item.feature.properties?.stroke || "#4CAF50"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
            style={{ cursor: 'pointer', transition: '0.3s' }}
            // Agora passamos o item.trailId (o ID real do data.json)
            onMouseEnter={(e) => item.trailId && onHover?.(e, item.trailId)}
            onMouseLeave={onLeave}
            onClick={() => item.trailId && onClick?.(item.trailId)}
          />
        ))}
      </g>

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