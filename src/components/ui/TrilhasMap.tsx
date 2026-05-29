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
  // Agora as funções de callback retornam o ID da trilha e opcionalmente o ID do ramal
  onHover?: (event: React.MouseEvent<SVGElement>, trailId: number, ramalId?: string) => void;
  onClick?: (trailId: number, ramalId?: string) => void;
  onLeave?: () => void;
  highlight?: number | string | (number | string)[]; // Pode destacar por ID numérico (trilha) ou string (ramal)
}

export default function Map({ id, onHover, onClick, onLeave, highlight }: MapProps) {

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
    
    const lines = trilhasLinhas.features.map(feature => {
      const featName = normalize(feature.properties?.name || "");
      const featIdFromMap = feature.id as string; // ID vindo do GeoJSON (ex: "5BDD9BF419000003")

      let trailId: number | undefined = undefined;
      let ramalId: string | undefined = undefined;

      // Busca na estrutura do data.json
      for (const t of data.trilhas) {
        const normTrailName = normalize(t.nome);

        // 1. Verifica se o ID do GeoJSON bate diretamente com o ID de algum ramal no JSON
        if (t.ramais) {
          const ramalEncontrado = t.ramais.find(
            r => String(r.id) === String(featIdFromMap) || featName.includes(normalize(r.nome))
          );
          
          if (ramalEncontrado) {
            trailId = t.id;
            ramalId = String(ramalEncontrado.id); // Força a string aqui também por segurança
            break;
          }
        }

        // 2. Se não for ramal, verifica se é a trilha principal pelo nome
        if (normTrailName === featName || normTrailName.includes(featName) || featName === normTrailName) {
          trailId = t.id;
          break;
        }
      }
      
      return { feature, trailId, ramalId };

    }).filter(item => {
      if (!item.trailId) return false;
      // O filtro por 'id' externo (prop) ainda funciona baseado no ID da trilha principal
      return targetIds ? targetIds.includes(item.trailId) : true;
    });

    const points = trilhasPontos.features.map(feature => {
      const featName = normalize(feature.properties?.name || "");
      
      const trailMetadata = data.trilhas.find(t => 
        t.pontos_interesse.some(poi => {
          const valoresDoPonto = Object.values(poi).map(val => normalize(String(val)));
          return valoresDoPonto.includes(featName);
        })
      );

      return { feature, trailId: trailMetadata?.id };
    }).filter(item => {
      if (!item.trailId) return false;
      return targetIds ? targetIds.includes(item.trailId) : true;
    });

    return { lines, points };
  }, [id]);

  // Função auxiliar para verificar se uma linha específica deve ser destacada
  const isLineHighlighted = (trailId?: number, ramalId?: string) => {
    if (!highlight) return true; // Se nada estiver destacado, mostra tudo normal

    const highlights = Array.isArray(highlight) ? highlight : [highlight];

    // Se a linha atual for um ramal e o ID do ramal estiver na lista de destaques
    if (ramalId && highlights.includes(ramalId)) {
      return true;
    }

    // Se o ID da trilha principal estiver nos destaques (e não estivermos filtrando por um ramal específico que não este)
    if (trailId && highlights.includes(trailId)) {
      // Opcional: Se você quiser que destacar a trilha principal também destaque seus ramais, deixe apenas "return true;"
      // Se quiser que destacar a trilha principal NÃO destaque o ramal, adicione: if (ramalId) return false;
      if (ramalId) return false;
      return true; 
    }

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
            {/* 1. PATH FANTASMA */}
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

            {/* 2. PATH VISUAL */}
            <path
              d={d}
              stroke={item.feature.properties?.stroke || "#4CAF50"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
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

          return (
            <circle
              key={`point-${idx}`}
              cx={x}
              cy={y}
              r="8"
              fill="#fbc02d"
              stroke="#ffffff"
              strokeWidth="2"
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