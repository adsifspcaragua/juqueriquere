import { useMemo } from 'react';
import { type FeatureCollection, type Geometry } from 'geojson';
import trilhasPontosRaw from '../../../data/Trilhas PNMJ/PontosRaw.json'; 
import trilhasLinhasRaw from '../../../data/Trilhas PNMJ/TrilhasRaw.json';
import data from '../../../data.json';
import { normalize } from './utils';

const trilhasPontos = trilhasPontosRaw as unknown as FeatureCollection<Geometry>;
const trilhasLinhas = trilhasLinhasRaw as unknown as FeatureCollection<Geometry>;

export function useMapData(id?: number | number[], highlight?: number | string | (number | string)[]) {
  const normalizedHighlights = useMemo(() => {
    if (!highlight) return [];
    const arr = Array.isArray(highlight) ? highlight : [highlight];
    return arr.map(h => typeof h === 'string' ? normalize(h) : h);
  }, [highlight]);

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
      return { feature, trailId: trailMetadata?.id, pointName: featName };
    }).filter(item => {
      if (!item.trailId) return false;
      return targetIds ? targetIds.includes(item.trailId) : true;
    });

    return { lines, points };
  }, [id]);

  const highlightedTrailIdsByPoint = useMemo(() => {
    if (normalizedHighlights.length === 0) return [];
    return filteredData.points
      .filter(p => p.pointName && normalizedHighlights.includes(p.pointName))
      .map(p => p.trailId);
  }, [filteredData.points, normalizedHighlights]);

  const isLineHighlighted = (trailId?: number, ramalId?: string) => {
    if (!highlight) return true;
    if (ramalId && normalizedHighlights.includes(ramalId)) return true;
    if (trailId && normalizedHighlights.includes(trailId)) return true;
    if (trailId && highlightedTrailIdsByPoint.includes(trailId)) return true;
    return false;
  };

  const isPointHighlighted = (pointName?: string, trailId?: number) => {
    if (!highlight) return true;
    if (pointName && normalizedHighlights.includes(pointName)) return true;
    if (trailId && normalizedHighlights.includes(trailId)) return true;
    return false;
  };

  return { filteredData, isLineHighlighted, isPointHighlighted };
}