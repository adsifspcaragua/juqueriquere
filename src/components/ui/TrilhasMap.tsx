import { useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { type FeatureCollection, type Geometry } from 'geojson';
import mapImage from '../../assets/img/map.webp';
import trilhasPontosRaw from '../../data/Trilhas PNMJ/PontosRaw.json'; 
import trilhasLinhasRaw from '../../data/Trilhas PNMJ/TrilhasRaw.json';
import data from '../../data.json';

/*
Necessita de atualizações urgentes
*/

const trilhasPontos = trilhasPontosRaw as unknown as FeatureCollection<Geometry>;
const trilhasLinhas = trilhasLinhasRaw as unknown as FeatureCollection<Geometry>;

interface MapProps {
  id?: number | number[];
  onHover?: (event: React.MouseEvent<SVGElement>, trailId: number, ramalId?: string) => void;
  onClick?: (trailId: number, ramalId?: string) => void;
  onPointClick?: (pointName: string, trailId?: number) => void;
  onLeave?: () => void;
  highlight?: number | string | (number | string)[]; 
}

export default function Map({ id, onHover, onClick, onPointClick, onLeave, highlight }: MapProps) {

  const normalize = (s: string) => s.toLowerCase().replace('trilha ', '').replace('.', '').trim();

  // 1. Normalizamos os valores de highlight para facilitar a comparação em todo o componente
  const normalizedHighlights = useMemo(() => {
    if (!highlight) return [];
    const arr = Array.isArray(highlight) ? highlight : [highlight];
    return arr.map(h => typeof h === 'string' ? normalize(h) : h);
  }, [highlight]);

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
    
    const lines = trilhasLinhas.features.map(feature => {
      const featName = normalize(feature.properties?.name || "");
      const featIdFromMap = feature.id as string;

      let trailId: number | undefined = undefined;
      let ramalId: string | undefined = undefined;

      for (const t of data.trilhas) {
        const normTrailName = normalize(t.nome);

        if (t.ramais) {
          const ramalEncontrado = t.ramais.find(
            r => String(r.id) === String(featIdFromMap) || featName.includes(normalize(r.nome))
          );
          
          if (ramalEncontrado) {
            trailId = t.id;
            ramalId = String(ramalEncontrado.id);
            break;
          }
        }

        if (normTrailName === featName || normTrailName.includes(featName) || featName === normTrailName) {
          trailId = t.id;
          break;
        }
      }
      
      return { feature, trailId, ramalId };

    }).filter(item => {
      if (!item.trailId) return false;
      return targetIds ? targetIds.includes(item.trailId) : true;
    });

    const points = trilhasPontos.features.map(feature => {
      const featName = normalize(feature.properties?.name || "");
      if (!featName) return { feature, trailId: undefined, pointName: featName };

      const trailMetadata = data.trilhas.find(t => 
        t.pontos_interesse.some(poi => {
          const valoresDoPonto = Object.values(poi).map(val => normalize(String(val)));
          return valoresDoPonto.includes(featName);
        })
      );

      // Exportamos o pointName para facilitar a filtragem depois
      return { feature, trailId: trailMetadata?.id, pointName: featName };
    }).filter(item => {
      if (!item.trailId) return false;
      return targetIds ? targetIds.includes(item.trailId) : true;
    })

    return { lines, points };
  }, [id]);

  // 2. Identificamos se alguma trilha precisa ser destacada porque o PONTO dela está destacado
  const highlightedTrailIdsByPoint = useMemo(() => {
    if (normalizedHighlights.length === 0) return [];
    return filteredData.points
      .filter(p => p.pointName && normalizedHighlights.includes(p.pointName))
      .map(p => p.trailId);
  }, [filteredData.points, normalizedHighlights]);

  // 3. Atualizamos a função de verificação das linhas
  const isLineHighlighted = (trailId?: number, ramalId?: string) => {
    if (!highlight) return true;

    if (ramalId && normalizedHighlights.includes(ramalId)) return true;
    if (trailId && normalizedHighlights.includes(trailId)) return true;
    
    // Se a trilha for dona de um ponto que está em destaque, destacamos a trilha
    if (trailId && highlightedTrailIdsByPoint.includes(trailId)) return true;

    return false;
  };

  // função para verificar se o ponto em si deve ser destacado
  const isPointHighlighted = (pointName?: string, trailId?: number) => {
    if (!highlight) return true;

    // Destaca o ponto se o nome dele foi passado no highlight
    if (pointName && normalizedHighlights.includes(pointName)) return true;

    if (trailId && normalizedHighlights.includes(trailId)) return true;

    return false;
  };

  return (
    <svg width="100%" height="auto" viewBox="0 0 1146 1146" fill="none" xmlns="http://www.w3.org/2000/svg">
      <image href={mapImage} width="1146" height="1146" />

      {/* Camada de Trilhas */}
      {filteredData.lines.map((item, idx) => {
        const d = pathGenerator(item.feature) || "";
        const highlighted = isLineHighlighted(item.trailId, item.ramalId);
        
        return (
          <g key={`trail-group-${idx}`}>
            <path
              d={d}
              stroke="transparent"
              strokeWidth="45"
              fill="none"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => item.trailId && onHover?.(e, item.trailId, item.ramalId)}
              onMouseLeave={onLeave}
              onClick={() => item.trailId && onClick?.(item.trailId, item.ramalId)}
            />
            <path
              d={d}
              stroke={item.feature.properties?.stroke || "#4CAF50"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={highlighted ? "0.8" : "0"}
              pointerEvents="none"
              className={`path ${highlighted ? 'highlighted' : 'not-highlighted'}`}
            />
          </g>
        );
      })}

      {/* Camada de Pontos */}
      <g className="points-layer">
        {filteredData.points.map((item, idx) => {
          const coords = (item.feature.geometry as any).coordinates;
          const [x, y] = projection([coords[0], coords[1]]) || [0, 0];
          const highlighted = isPointHighlighted(item.pointName, item.trailId);

          return (
            <circle
              key={`point-${idx}`}
              cx={x}
              cy={y}
              r="3"
              fill="#fbc02d"
              stroke="#fae208"
              strokeWidth="2"
              opacity={highlighted ? "1" : "0"} 
              pointerEvents={highlighted ? "auto" : "none"} // Evita cliques em pontos ocultos
              className={`point ${highlighted ? 'highlighted' : 'not-highlighted'}`}
              onMouseEnter={(e) => item.trailId && onHover?.(e, item.trailId)}
              onMouseLeave={onLeave}
              onClick={(e) => {
                // Evita que o clique no ponto dispare o clique de uma trilha que esteja embaixo dele
                e.stopPropagation(); 
                
                if (onPointClick && item.pointName) {
                  onPointClick(item.pointName, item.trailId);
                } else if (item.trailId) {
                  onClick?.(item.trailId); 
                }
              }}
              style={{ cursor: highlighted ? 'pointer' : 'default' }}
            >
              <title>{item.feature.properties?.name}</title>
            </circle>
          );
        })}
      </g>
    </svg>
  );
}