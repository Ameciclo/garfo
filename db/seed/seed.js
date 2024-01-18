"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const node_postgres_1 = require("drizzle-orm/node-postgres");
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const schema = __importStar(require("../migration/schema"));
dotenv_1.default.config();
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
function readCsv(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on("data", (data) => {
            results.push(data);
        })
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}
function seedCities() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/public/cities.csv");
        const insertionData = data.map((item) => ({
            id: item.id,
            name: item.name,
            state: item.state,
        }));
        try {
            yield db.insert(schema.cities).values(insertionData).onConflictDoNothing();
            console.log("Seeding de cities concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados:", error);
        }
    });
}
function seedCoordinates() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/public/coordinates.csv");
        const insertionData = data.map((item) => ({
            id: item.id,
            point: item.point,
            type: item.type,
        }));
        try {
            yield db
                .insert(schema.coordinates)
                .values(insertionData)
                .onConflictDoNothing();
            console.log("Seeding de coordinates concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados em coordinates:", error);
        }
    });
}
function seedCyclistInfraRelations() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/cyclist-infra/relations.csv");
        const insertionData = data.map((item) => ({
            id: item.id,
            name: item.name,
            pdcRef: item.pdc_ref,
            pdcNotes: item.pdc_notes,
            pdcTypology: item.pdc_typology,
            pdcKm: item.pdc_km,
            pdcStretch: item.pdc_stretch,
            pdcCities: item.pdc_cities,
            osmId: item.osm_id || null,
            notes: item.notes,
        }));
        try {
            yield db
                .insert(schema.cyclist_infra_relations)
                .values(insertionData)
                .onConflictDoNothing();
            console.log("Seeding de relations concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados em relations:", error);
        }
    });
}
function seedCyclistInfraRelationsCities() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/cyclist-infra/relations_cities.csv");
        const insertionData = data.map((item) => ({
            relationId: item.relation_id,
            citiesId: item.cities_id,
        }));
        try {
            yield db
                .insert(schema.cyclist_infra_relationCities)
                .values(insertionData)
                .onConflictDoNothing();
            console.log("Seeding de relations_cities concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados em relations_cities:", error);
        }
    });
}
// Função para fazer o seeding da tabela cyclist_count_edition
function seedCyclistCountEdition() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/cyclist-count/count_edition.csv");
        const insertionData = data.map((item) => ({
            id: item.id,
            cityId: item.city_id,
            name: item.name,
            date: item.date,
            coordinatesId: item.coordinates_id,
        }));
        try {
            yield db
                .insert(schema.cyclist_count_edition)
                .values(insertionData)
                .onConflictDoNothing();
            console.log("Seeding da tabela cyclist_count_edition concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados em cyclist_count_edition:", error);
        }
    });
}
// Função para fazer o seeding da tabela cyclist_count_session
function seedCyclistCountSession() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/cyclist-count/count_session.csv");
        const insertionData = data.map((item) => ({
            id: item.id,
            editionId: item.edition_id,
            startTime: new Date(item.start_time),
            endTime: new Date(item.end_time),
        }));
        try {
            yield db
                .insert(schema.cyclist_count_session)
                .values(insertionData)
                .onConflictDoNothing();
            console.log("Seeding da tabela cyclist_count_session concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados em cyclist_count_session:", error);
        }
    });
}
function seedCyclistCountDirections() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/cyclist-count/directions.csv");
        const insertionData = data.map((item) => ({
            id: parseInt(item.id, 10),
            origin: item.origin,
            originCardinal: item.origin_cardinal,
            destin: item.destin,
            destinCardinal: item.destin_cardinal,
        }));
        try {
            yield db
                .insert(schema.directions)
                .values(insertionData)
                .onConflictDoNothing();
            console.log("Seeding de directions concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados em directions:", error);
        }
    });
}
function seedCyclistCountDirectionCounts() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/cyclist-count/direction_count.csv");
        const insertionData = data.map((item) => ({
            id: parseInt(item.id, 10),
            sessionId: parseInt(item.session_id, 10),
            directionId: parseInt(item.direction_id, 10),
            count: parseInt(item.count, 10),
        }));
        try {
            yield db
                .insert(schema.direction_count)
                .values(insertionData)
                .onConflictDoNothing();
            console.log("Seeding de direction_count concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados em direction_count:", error);
        }
    });
}
// Função para fazer o seeding da tabela cyclist_count_characteristics
function seedCyclistCountCharacteristics() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/cyclist-count/characteristics.csv");
        const insertionData = data.map((item) => ({
            id: item.id,
            name: item.name,
            type: item.type,
            atribute: item.atribute,
        }));
        try {
            yield db
                .insert(schema.cyclist_count_characteristics)
                .values(insertionData)
                .onConflictDoNothing();
            console.log("Seeding da tabela cyclist_count_characteristics concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados em cyclist_count_characteristics:", error);
        }
    });
}
// Função para fazer o seeding da tabela cyclist_count_characteristicsCount
function seedCyclistCountCharacteristicsCount() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readCsv("./db/seed/cyclist-count/characteristics_count.csv");
        const insertionData = data.map((item) => ({
            id: item.id,
            sessionId: item.session_id,
            characteristicsId: item.characteristics_id,
            count: item.count,
        }));
        try {
            yield db
                .insert(schema.cyclist_count_characteristicsCount)
                .values(insertionData)
                .onConflictDoNothing();
            console.log("Seeding da tabela cyclist_count_characteristicsCount concluído.");
        }
        catch (error) {
            console.error("Erro ao inserir dados em cyclist_count_characteristicsCount:", error);
        }
    });
}
// Função principal para executar todos os seedings
function runSeed() {
    return __awaiter(this, void 0, void 0, function* () {
        // public
        yield seedCities();
        yield seedCoordinates();
        // Cyclist Infra
        yield seedCyclistInfraRelations();
        yield seedCyclistInfraRelationsCities();
        // Cyclist Count
        yield seedCyclistCountEdition();
        yield seedCyclistCountSession();
        yield seedCyclistCountDirections();
        yield seedCyclistCountDirectionCounts();
        yield seedCyclistCountCharacteristics();
        yield seedCyclistCountCharacteristicsCount();
    });
}
runSeed();
