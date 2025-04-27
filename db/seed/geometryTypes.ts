import { customType, CustomTypeValues } from "drizzle-orm/pg-core";

export type GeometryTypes = {
  Point: GeoJSON.Point;
  LineString: GeoJSON.LineString;
  Polygon: GeoJSON.Polygon;
  MultiPoint: GeoJSON.MultiPoint;
  MultiLineString: GeoJSON.MultiLineString;
  MultiPolygon: GeoJSON.MultiPolygon;
  GeometryCollection: GeoJSON.GeometryCollection;
};

/**
 * Experimental custom type for PostGIS geometry, only supports Point and LineString.
 */
export const geometryType = <
  TType extends GeoJSON.Geometry["type"] = GeoJSON.Geometry["type"],
  T extends CustomTypeValues = CustomTypeValues
>(
  dbName: string,
  fieldConfig?: T["config"] & { type: TType }
) => {
  const type = fieldConfig?.type;
  return customType<{
    data: GeometryTypes[TType];
  }>({
    dataType() {
      return type ? `geometry(${type},4326)` : "geometry";
    },
    toDriver(value) {
      throw new Error("Not implemented");
    },
    fromDriver(value) {
      try {
        const data = JSON.parse(value as string);

        if (type && data.type !== type) {
          throw new Error(`Expected geometry type ${type}, got ${data.type}`);
        }

        return data as GeometryTypes[TType];
      } catch (e) {
        throw new Error(
          `Failed to parse geometry :` +
            {
              cause: e,
            }
        );
      }
    },
  })(`public".ST_AsGeoJSON("${dbName}") as "${dbName}`, {
    ...fieldConfig,
  });
};
