import osmtogeojson from "osmtogeojson";
import axios, { CancelToken, CancelTokenSource } from "axios";

import { OVERPASS_SERVERS, DEFAULT_BORDER_WIDTH } from "./constants";
import { slugify } from "./utils";
import layersJson from "./layers.json";

interface Constraints {
  bbox?: string;
  areaId?: number;
  area?: string;
}

interface Layer {
  id?: string;
  name: string;
  description: string;
  filters?: Array<Array<string> | string[]>;
  style?: {
    lineColor?: string;
    lineWidth?: number;
    borderColor?: string;
    borderStyle?: string;
    borderWidth?: number;
    lineStyle?: string;
  };
  type?: string;
  isActive?: boolean;
  onlyDebug?: boolean;
}

const layers: Layer[] = layersJson as Layer[];

const AREA_ID_OVERRIDES: { [key: string]: number } = { teste: 303585 };

class OSMController {
  static _getAreaQuery(constraints: Constraints): string {
    const bbox = constraints.bbox;
    const areaId = constraints.areaId;
    const filteredLayers = layers.filter((l: Layer) => l.filters);

    const body = filteredLayers
      .map((l: Layer) =>
        (l.type === "poi" ? ["node", "way"] : ["way"])
          .map((element: string) =>
            l
              .filters!.map(
                (f: string[] | string[][]) =>
                  element +
                  (typeof f[0] === "string"
                    ? `["${f[0]}"="${f[1]}"]`
                    : f
                        .map(
                          (f_inner: any) => `["${f_inner[0]}"="${f_inner[1]}"]`
                        )
                        .join("")) +
                  (bbox ? `(${bbox});\n` : `(area.a);\n`)
              )
              .join("")
          )
          .join("")
      )
      .join("");

    return `
          [out:json][timeout:500];
          ${!bbox && areaId ? `area(${areaId})->.a;` : ""}
          (
              ${body}
          );
          out body geom;
      `;
  }

  static _getMultipleWaysQuery(waysIds: number[][]): string {
    const flatIds = waysIds.flat();
    const waysQueries = flatIds
      .map((id: number) => `way(id:${id})`)
      .join(";\n");
    return `
      [out:json];
      (${waysQueries};);
      out body geom;>;
    `;
  }

  static _getMultipleRelationQuery(relationIds: number[]): string {
    const relationQueries = relationIds
      .map((id: number) => `relation(${id});`)
      .join("\n");
    return `
      [out:json];
      (
      ${relationQueries}
      );
      out geom;
    `;
  }

  static _getRelationQuery(relationId: number): string {
    return `
      [out:json][timeout:500];
      relation(${relationId});
      out geom;
    `;
  }

  static _getLayers(): Layer[] {
    layers.forEach((l: Layer) => {
      l.id = slugify(l.name);

      l.isActive = l.isActive !== undefined ? l.isActive : true;
      l.type = l.type || "way";
      if (l.style) {
        l.style.lineStyle = l.style.lineStyle || "solid";

        if (l.style.borderColor) {
          l.style.borderStyle = l.style.borderStyle || "solid";
          l.style.borderWidth = l.style.borderWidth || DEFAULT_BORDER_WIDTH;
        }
      }
    });

    return layers.filter((l: Layer) => !l.onlyDebug);
  }

  static async _getAreaId(areaName: string): Promise<number> {
    const overriden = AREA_ID_OVERRIDES[areaName];
    if (overriden) {
      return overriden;
    } else {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURI(
            areaName
          )}`
        );
        const nominatimData = await response.json();

        if (nominatimData.length > 0) {
          const osmId =
            nominatimData.find(
              (item: { osm_type: string }) => item.osm_type === "relation"
            )?.osm_id || nominatimData[0].osm_id;
          return 3600000000 + osmId;
        } else {
          throw new Error("No data found");
        }
      } catch (e) {
        console.error("Error:", e);
        throw e;
      }
    }
  }

  static async _getAreaData(
    constraints: Constraints
  ): Promise<{ geoJson: any | null }> {
    try {
      const areaId = await OSMController._getAreaId(constraints.area!);
      const query = OSMController._getAreaQuery({ areaId });
      const encodedQuery = encodeURI(query);

      let cancelSources: CancelTokenSource[] = [];
      let requests = OVERPASS_SERVERS.map((server, index) => {
        const endpoint = `${server}?data=${encodedQuery}`;
        const cancelSource = axios.CancelToken.source();
        cancelSources.push(cancelSource);

        return axios
          .get(endpoint, { cancelToken: cancelSource.token })
          .then((response) => {
            const data = response.data;
            if (data.elements.length > 0) {
              // Cancel other requests
              cancelSources.forEach((source, srcIndex) => {
                if (srcIndex !== index) {
                  source.cancel(`Request #${srcIndex} was aborted`);
                }
              });

              return osmtogeojson(data, { flatProperties: true });
            }
            return null; // or throw an error if that makes more sense
          });
      });

      const results = await Promise.allSettled(requests);
      const successfulResult = results.find(
        (result) => result.status === "fulfilled" && result.value !== null
      );

      if (successfulResult && successfulResult.status === "fulfilled") {
        return { geoJson: successfulResult.value };
      } else {
        throw new Error("No successful responses from servers.");
      }
    } catch (error) {
      console.error("Error in _getAreaData:", error);
      throw error; // or handle it differently
    }
  }

  static async getWaysFromRelationId(relationId: number): Promise<any> {
    try {
      const query = OSMController._getRelationQuery(relationId);
      const encodedQuery = encodeURI(query);

      let geoJson = null;

      for (const server of OVERPASS_SERVERS) {
        const endpoint = `${server}?data=${encodedQuery}`;

        try {
          const response = await axios.get(endpoint);

          if (response.status === 200 && response.data.elements.length > 0) {
            geoJson = osmtogeojson(response.data);
            break;
          }
        } catch (error) {
          console.error(`Error fetching from server:`, error);
        }
      }

      return geoJson;
    } catch (error) {
      console.error(
        `Error fetching data for relation ID ${relationId}:`,
        error
      );
      throw error;
    }
  }

  static async getOSMJsonWaysFromWaysIds(waysIds: number[][]): Promise<any> {
    const query = OSMController._getMultipleWaysQuery(waysIds);
    const encodedQuery = encodeURI(query);
    let relationsWays = null;

    for (const server of OVERPASS_SERVERS) {
      const endpoint = `${server}?data=${encodedQuery}`;

      try {
        const response = await axios.get(endpoint);
        if (response.status === 200 && response.data.elements.length > 0) {
          relationsWays = response.data;
          break;
        }
      } catch (error) {
        console.error(`Error fetching from server:`, error);
      }
    }
    return relationsWays;
  }

  static async getRelationJsonFromIds(relationIds: number[]): Promise<any> {
    try {
      const query = OSMController._getMultipleRelationQuery(relationIds);
      const encodedQuery = encodeURI(query);
      let data = null;

      for (const server of OVERPASS_SERVERS) {
        const endpoint = `${server}?data=${encodedQuery}`;

        try {
          const response = await axios.get(endpoint);
          if (response.status === 200 && response.data.elements.length > 0) {
            data = response.data;
            break;
          }
        } catch (error) {
          console.error(`Error fetching from server:`, error);
        }
      }

      return data;
    } catch (error) {
      console.error(`Error fetching data:`, error);
      throw error;
    }
  }

  static async getCycleWaysOSMJsonFromArea(
    constraints: Constraints
  ): Promise<any> {
    try {
      const areaId = await OSMController._getAreaId(constraints.area!);
      const query = OSMController._getAreaQuery({ areaId });
      const encodedQuery = encodeURI(query);

      let cancelSources: CancelTokenSource[] = [];

      const requests = OVERPASS_SERVERS.map((server, index) => {
        const endpoint = `${server}?data=${encodedQuery}`;
        const cancelSource = axios.CancelToken.source();
        cancelSources.push(cancelSource);

        return axios
          .get(endpoint, { cancelToken: cancelSource.token })
          .then((response) => {
            if (response.data.elements.length > 0) {
              cancelSources.forEach((source, srcIndex) => {
                if (srcIndex !== index) {
                  source.cancel(`Request #${srcIndex} was aborted`);
                }
              });

              return response.data;
            }
            return null;
          });
      });

      const results = await Promise.allSettled(requests);
      const successfulResult = results.find(
        (result) => result.status === "fulfilled" && result.value !== null
      );

      if (successfulResult && successfulResult.status === "fulfilled") {
        return successfulResult.value;
      } else {
        throw new Error("No successful responses from servers.");
      }
    } catch (error) {
      console.error("Error in getCycleWaysOSMJsonFromArea:", error);
      throw error;
    }
  }
}

export const getWaysFromRelationId = OSMController.getWaysFromRelationId;
export const getCycleWaysOSMJsonFromArea = OSMController.getCycleWaysOSMJsonFromArea;
export const getRelationJsonFromIds = OSMController.getRelationJsonFromIds;
export const getOSMJsonWaysFromWaysIds = OSMController.getOSMJsonWaysFromWaysIds;
