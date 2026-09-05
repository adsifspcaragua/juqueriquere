import { useMemo } from 'react';
import { type FeatureCollection, type Geometry, type Feature, type Point } from 'geojson';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/dexie';
import trilhasLinhasRaw from '../../../data/Trilhas PNMJ/TrilhasRaw.json';
import { normalize } from './utils';

// Mantemos apenas o GeoJSON das linhas (trilhas)
const trilhasLinhas = trilhasLinhasRaw as unknown as FeatureCollection<Geometry>;

export function useMapData(
  id?: number | string | (number | string)[], 
  highlight?: number | string | (number | string)[],
  pointId?: number | string | (number | string)[] 
) {
  const trilhas = useLiveQuery(() => db.trilhas.toArray(), []);
  const pontosInteresseDB = useLiveQuery(() => db.pontos_interesse.toArray(), []);

  const normalizedHighlights = useMemo(() => {
    if (!highlight) return [];
    const arr = Array.isArray(highlight) ? highlight : [highlight];
    return arr.map(h => typeof h === 'string' ? normalize(h) : h);
  }, [highlight]);

  // Lógica para Trilhas
  const targetIds = useMemo(() => id !== undefined ? (Array.isArray(id) ? id : [id]) : null, [id]);
  
  const targetTrailIds = useMemo(() => {
    const ids = new Set<number>();
    if (targetIds && trilhas) {
      targetIds.forEach(tId => {
        const idStr = String(tId);
        for (const t of trilhas) {
          if (String(t.id) === idStr && t.id) ids.add(t.id);
          if (t.ramais && t.ramais.some(r => String(r.id) === idStr) && t.id) ids.add(t.id);
        }
      });
    }
    return ids;
  }, [targetIds, trilhas]);

  // Lógica para Pontos
  const targetPointIds = useMemo(() => pointId !== undefined ? (Array.isArray(pointId) ? pointId : [pointId]) : null, [pointId]);
  
  const normalizedTargetPoints = useMemo(() => {
    if (!targetPointIds) return null;
    return targetPointIds.map(p => typeof p === 'string' ? normalize(p) : p);
  }, [targetPointIds]);


  const filteredData = useMemo(() => {
    if (!trilhas) return { lines: [], points: [] };

    const isSingleId = id !== undefined && !Array.isArray(id);

    // 1. PROCESSAR LINHAS DO GEOJSON
    const lines = trilhasLinhas.features.map(feature => {
      const rawName = feature.properties?.name || feature.properties?.Name || feature.properties?.NOME || feature.properties?.nome || "";
      const featName = normalize(rawName);
      const featIdFromMap = feature.properties?.id ?? feature.id;
      
      let trailId: number | undefined = undefined;
      let ramalId: string | undefined = undefined;

      for (const t of trilhas) {
        const normTrailName = normalize(t.nome);

        if (t.ramais && Array.isArray(t.ramais)) {
          const ramalEncontrado = t.ramais.find(r => {
            if (!r) return false;
            const rIdStr = String(r.id);
            const rNomeNorm = normalize(r.nome || "");
            const matchId = featIdFromMap !== undefined && rIdStr === String(featIdFromMap);
            const matchName = featName && rNomeNorm && (featName.includes(rNomeNorm) || rNomeNorm.includes(featName));
            return matchId || matchName;
          });
          
          if (ramalEncontrado) {
            trailId = t.id;
            ramalId = String(ramalEncontrado.id);
            break;
          }
        }

        if (featName && normTrailName && (normTrailName === featName || normTrailName.includes(featName) || featName.includes(normTrailName))) {
          trailId = t.id;
          break;
        }
      }
      return { feature, trailId, ramalId };
    }).filter(item => {
      if (item.trailId === undefined) return false;
      if (isSingleId) return targetTrailIds.has(item.trailId);
      return true; 
    });

    // 2. PROCESSAR PONTOS (APENAS DO DEXIE/DB)
    const pointsFromDB = (pontosInteresseDB || [])
      .filter(poi => poi.latitude && poi.longitude) // Filtra apenas se houver coordenadas (sem checar duplicação com geojson)
      .map(poi => {
        const poiName = normalize(poi.nome || "");
        const syntheticFeature: Feature<Point> = {
          type: "Feature",
          id: `db-poi-${poi.id}`,
          geometry: { type: "Point", coordinates: [poi.longitude!, poi.latitude!] },
          properties: { name: poi.nome, description: poi.descricao }
        };

        return {
          feature: syntheticFeature as Feature<Geometry>,
          trailId: poi.trilha_id,
          pointName: poiName,
          dbId: poi.id
        };
      }).filter(item => {
        if (item.trailId === undefined) return false;

        // FILTRO DO POINT ID (DB filtra pelo nome normalizado ou ID real)
        if (normalizedTargetPoints && targetPointIds) {
          const matchName = normalizedTargetPoints.includes(item.pointName);
          const matchId = item.dbId !== undefined && targetPointIds.includes(item.dbId);
          if (!matchName && !matchId) return false;
        }

        if (isSingleId) return targetTrailIds.has(item.trailId);
        return true;
      });

    return { lines, points: pointsFromDB };
  }, [id, trilhas, pontosInteresseDB, targetTrailIds, targetPointIds, normalizedTargetPoints]);

  const highlightedTrailIdsByPoint = useMemo(() => {
    if (normalizedHighlights.length === 0) return [];
    return filteredData.points
      .filter(p => p.pointName && normalizedHighlights.includes(p.pointName))
      .map(p => p.trailId);
  }, [filteredData.points, normalizedHighlights]);

  const isLineHighlighted = (trailId?: number, ramalId?: string) => {
    if (highlight) {
      if (ramalId && normalizedHighlights.includes(normalize(ramalId))) return true;
      if (ramalId && normalizedHighlights.includes(ramalId)) return true;
      if (trailId && normalizedHighlights.includes(trailId)) return true;
      if (trailId && highlightedTrailIdsByPoint.includes(trailId)) return true;
      return false;
    }
    if (targetIds && targetIds.length > 0) {
      return trailId ? targetTrailIds.has(trailId) : false;
    }
    return true;
  };

  const isPointHighlighted = (pointName?: string, trailId?: number) => {
    if (highlight) {
      if (pointName && normalizedHighlights.includes(pointName)) return true;
      if (trailId && normalizedHighlights.includes(trailId)) return true;
      return false;
    }
    
    if (targetPointIds && targetPointIds.length > 0) {
      return true;
    }

    if (targetIds && targetIds.length > 0) {
      return trailId ? targetTrailIds.has(trailId) : false;
    }
    return true;
  };

  return { filteredData, isLineHighlighted, isPointHighlighted };
}