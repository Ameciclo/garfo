"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectPoint = exports.pointType = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.pointType = (0, pg_core_1.customType)({
    dataType() {
        return "geometry(Point,4326)";
    },
    toDriver(value) {
        return `SRID=4326;POINT(${value.lng} ${value.lat})`;
    },
    fromDriver(value) {
        var _a;
        const matches = value.match(/POINT\((?<lng>[\d.-]+) (?<lat>[\d.-]+)\)/);
        const { lat, lng } = (_a = matches === null || matches === void 0 ? void 0 : matches.groups) !== null && _a !== void 0 ? _a : {};
        if (!matches) {
            console.warn(`Could not parse point value in function pointType.fromDriver
         Currently returning() is not supported and select must use a 
         custom select like so: db.select({ geo: selectPoint('geo', place.geo) })`, value);
        }
        return { lat: parseFloat(String(lat)), lng: parseFloat(String(lng)) };
    },
});
const selectPoint = (column, decoder) => {
    return (0, drizzle_orm_1.sql) `st_astext(${drizzle_orm_1.sql.identifier(column)})`.mapWith(decoder);
};
exports.selectPoint = selectPoint;
