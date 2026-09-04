import { useMemo } from 'react';
import { type FeatureCollection, type Geometry, type Feature, type Point } from 'geojson';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/dexie';
//import trilhasPontosRaw from '../../../data/Trilhas PNMJ/PontosRaw.json'; 
import trilhasLinhasRaw from '../../../data/Trilhas PNMJ/TrilhasRaw.json';
import { normalize } from './utils';

//const trilhasPontos = trilhasPontosRaw as unknown as FeatureCollection<Geometry>;
const trilhasLinhas = trilhasLinhasRaw as unknown as FeatureCollection<Geometry>;

export function useMapData(id?: number | number[], highlight?: number | string | (number | string)[]) {
  const trilhas = useLiveQuery(() => db.trilhas.toArray(), []);
  const pontosInteresseDB = useLiveQuery(() => db.pontos_interesse.toArray(), []);

  const normalizedHighlights = useMemo(() => {
    if (!highlight) return [];
    const arr = Array.isArray(highlight) ? highlight : [highlight];
    return arr.map(h => typeof h === 'string' ? normalize(h) : h);
  }, [highlight]);

  const filteredData = useMemo(() => {
    if (!trilhas) return { lines: [], points: [] };

    const targetIds = Array.isArray(id) ? id : (id ? [id] : null);
    
    // 1. PROCESSAR LINHAS (Trilhas)
    const lines = trilhasLinhas.features.map(feature => {
      const featName = normalize(feature.properties?.name || "");
      const featIdFromMap = feature.id as string;
      let trailId: number | undefined = undefined;
      let ramalId: string | undefined = undefined;

      for (const t of trilhas) {
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

    // Usaremos este Set para evitar duplicar pontos que já vieram do GeoJSON
    const pontosProcessadosGeoJSON = new Set<string>();
    /*
    // 2. PROCESSAR PONTOS DO GEOJSON
    const pointsFromGeoJSON = trilhasPontos.features.map(feature => {
      const featName = normalize(feature.properties?.name || "");
      
      if (featName) {
        pontosProcessadosGeoJSON.add(featName);
      }

      if (!featName) return { feature, trailId: undefined, pointName: featName };

      const trailMetadata = trilhas.find(t => {
        const hasInNested = t.pontos_interesse?.some(poi => {
          const valoresDoPonto = Object.values(poi).map(val => normalize(String(val)));
          return valoresDoPonto.includes(featName);
        });
        
        if (hasInNested) return true;

        const hasInTable = pontosInteresseDB?.some(poi => {
          if (poi.trilha_id !== t.id) return false;
          const valoresDoPonto = Object.values(poi).map(val => normalize(String(val)));
          return valoresDoPonto.includes(featName);
        });

        return hasInTable;
      });

      return { feature, trailId: trailMetadata?.id, pointName: featName };
    }).filter(item => {
      if (!item.trailId) return false;
      return targetIds ? targetIds.includes(item.trailId) : true;
    });*/

    // 3. PROCESSAR PONTOS EXCLUSIVOS DO BANCO DE DADOS (Dexie/Supabase)
    const pointsFromDB = (pontosInteresseDB || [])
      .filter(poi => {
        // Filtra apenas pontos que tem coordenadas e ainda não foram incluídos via GeoJSON
        const poiName = normalize(poi.nome || "");
        return poi.latitude && poi.longitude && !pontosProcessadosGeoJSON.has(poiName);
      })
      .map(poi => {
        const poiName = normalize(poi.nome || "");

        // Constrói uma Feature GeoJSON "falsa" para o ponto do banco
        const syntheticFeature: Feature<Point> = {
          type: "Feature",
          id: `db-poi-${poi.id}`,
          geometry: {
            type: "Point",
            coordinates: [poi.longitude!, poi.latitude!] // GeoJSON exige formato [longitude, latitude]
          },
          properties: {
            name: poi.nome,
            description: poi.descricao
            // Adicione outras propriedades aqui, se seu mapa utilizar (ex: ícone, categoria)
          }
        };

        return {
          feature: syntheticFeature as Feature<Geometry>,
          trailId: poi.trilha_id,
          pointName: poiName
        };
      }).filter(item => {
        if (!item.trailId) return false;
        return targetIds ? targetIds.includes(item.trailId) : true;
      });

    // 4. UNIR OS PONTOS
    //const points = [...pointsFromGeoJSON, ...pointsFromDB];
    const points = [...pointsFromDB];
    return { lines, points };
  }, [id, trilhas, pontosInteresseDB]); // pontosInteresseDB no array garante re-render ao sincronizar

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