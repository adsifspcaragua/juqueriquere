// src/utils/kmlConverter.ts
import { kml } from "@tmcw/togeojson";

/**
 * Lê um arquivo KML e o converte para um objeto GeoJSON.
 */
export async function convertKmlToGeoJson(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const kmlText = event.target?.result as string;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(kmlText, "text/xml");
                const geojsonConvertido = kml(xmlDoc);
                
                resolve(geojsonConvertido);
            } catch (error) {
                reject(new Error("Erro ao fazer o parse do KML."));
            }
        };

        reader.onerror = () => {
            reject(new Error("Erro ao ler o arquivo KML."));
        };

        reader.readAsText(file);
    });
}