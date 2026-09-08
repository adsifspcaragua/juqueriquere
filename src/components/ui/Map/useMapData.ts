import { useMemo } from 'react';
import { type Geometry, type Feature, type Point } from 'geojson';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/dexie';
import { normalize } from './utils';

type LineData = {
  feature: Feature<Geometry>;
  trailId: number;
  ramalId?: string;
};

// Função auxiliar para verificar se a geometria é uma linha
const isLineGeometry = (geom?: Geometry | null): boolean => {
  if (!geom) return false;
  return geom.type === 'LineString' || geom.type === 'MultiLineString';
};

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

  const targetPointIds = useMemo(() => pointId !== undefined ? (Array.isArray(pointId) ? pointId : [pointId]) : null, [pointId]);
  
  const normalizedTargetPoints = useMemo(() => {
    if (!targetPointIds) return null;
    return targetPointIds.map(p => typeof p === 'string' ? normalize(p) : p);
  }, [targetPointIds]);

  const filteredData = useMemo(() => {
    if (!trilhas) return { lines: [], points: [] };

    const isSingleId = id !== undefined && !Array.isArray(id);

    // 1. EXTRAIR LINHAS APENAS DO BANCO DE DADOS
    const dbLines: LineData[] = [];

    trilhas.forEach(t => {
      if (t.geometria && t.id) {
        let features: Feature<Geometry>[] = [];

        if (t.geometria.type === 'FeatureCollection' && Array.isArray(t.geometria.features)) {
          features = t.geometria.features;
        } else if (t.geometria.type === 'Feature') {
          features = [t.geometria];
        } else if (t.geometria.type) {
          features = [{
            type: 'Feature',
            geometry: t.geometria,
            properties: {}
          }];
        }

        // Filtra estritamente apenas os elementos que são linhas
        features
          .filter(feat => isLineGeometry(feat.geometry))
          .forEach(feat => {
            const featureComPropriedades: Feature<Geometry> = {
              ...feat,
              properties: {
                ...feat.properties,
                name: feat.properties?.name || t.nome,
                color: t.cor_identificacao || feat.properties?.color,
                stroke: t.cor_identificacao || feat.properties?.stroke,
              }
            };

            dbLines.push({
              feature: featureComPropriedades,
              trailId: t.id!,
            });
          });
      }
    });

    const allLines = dbLines.filter(item => {
      if (item.trailId === undefined) return false;
      if (isSingleId) return targetTrailIds.has(item.trailId);
      return true; 
    });

    // 2. PONTOS DE INTERESSE DO BD
    const pointsFromDB = (pontosInteresseDB || [])
      .filter(poi => poi.latitude && poi.longitude)
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

        if (normalizedTargetPoints && targetPointIds) {
          const matchName = normalizedTargetPoints.includes(item.pointName);
          const matchId = item.dbId !== undefined && targetPointIds.includes(item.dbId);
          if (!matchName && !matchId) return false;
        }

        if (isSingleId) return targetTrailIds.has(item.trailId);
        return true;
      });

    return { lines: allLines, points: pointsFromDB };
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