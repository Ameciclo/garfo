import { sql, type DriverValueMapper, type SQL } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";

export type Point = {
  lat: number;
  lng: number;
};

export const pointType = customType<{ data: Point; driverData: string }>({
  dataType() {
    return "geometry(Point,4326)";
  },
  toDriver(value: Point): string {
    return `SRID=4326;POINT(${value.lng} ${value.lat})`;
  },
  fromDriver(value: string) {
    const matches = value.match(/POINT\((?<lng>[\d.-]+) (?<lat>[\d.-]+)\)/);
    const { lat, lng } = matches?.groups ?? {};

    if (!matches) {
      console.warn(
        `Could not parse point value in function pointType.fromDriver
         Currently returning() is not supported and select must use a 
         custom select like so: db.select({ geo: selectPoint('geo', place.geo) })`,
        value
      );
    }

    return { lat: parseFloat(String(lat)), lng: parseFloat(String(lng)) };
  },
});

export const selectPoint = (
  column: string,
  decoder: DriverValueMapper<any, any>
): SQL<Point> => {
  return sql<Point>`st_astext(${sql.identifier(column)})`.mapWith(decoder);
};
