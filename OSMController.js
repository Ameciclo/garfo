/* eslint-disable no-loop-func */
const {
  OVERPASS_SERVERS,
  DEFAULT_BORDER_WIDTH,
  RELATION_IDS,
} = require("./constants.js");
const { slugify } = require("./utils.js");
const layers = require("./layers.json");
const axios = require("axios");
const { CancelToken } = axios;
const osmtogeojson = require("osmtogeojson");

const AREA_ID_OVERRIDES = { teste: 303585 }; // Replace with actual area IDs

class OSMController {
  // getQuery() remains the same
  static getQuery(constraints) {
    console.log(constraints);
    const bbox = constraints.bbox;
    const areaId = constraints.areaId;
    const filteredLayers = layers.filter((l) => l.filters);

    const body = filteredLayers
      .map((l) =>
        (l.type === "poi" ? ["node", "way"] : ["way"])
          .map((element) =>
            l.filters
              .map(
                (f) =>
                  element +
                  (typeof f[0] === "string"
                    ? `["${f[0]}"="${f[1]}"]`
                    : f
                        .map((f_inner) => `["${f_inner[0]}"="${f_inner[1]}"]`)
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
        ${!bbox && `area(${areaId})->.a;`}
        (
            ${body}
        );
        out body geom;
    `;
  }
  static getLayers() {
    layers.default.forEach((l) => {
      // Generate an ID based on name
      l.id = slugify(l.name);

      // Omitted values
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

    // Remove debugMode filtering
    layers.default = layers.default.filter(
      (l) => !l.onlyDebug || l.onlyDebug === false
    );

    return layers.default;
  }

  static getAreaId(areaName) {
    return new Promise((resolve, reject) => {
      const overriden = AREA_ID_OVERRIDES[areaName];
      if (overriden) {
        resolve(overriden);
      } else {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURI(
            areaName
          )}`
        )
          .then((response) => response.json())
          .then((nominatimData) => {
            console.debug("nominatimData", nominatimData);

            if (nominatimData.length > 0) {
              // This tries to replicate the behavior of the "geocodeArea" filter on Overpass Turbo.
              // Gets the first 'relation' result from Nomatim and extract its corresponding area.
              // Source: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#By_area_.28area.29
              let osmId;
              for (
                let i = 0;
                i < nominatimData.length && osmId === undefined;
                i++
              ) {
                console.log("nominatimData[i]", nominatimData[i]);
                if (nominatimData[i].osm_type === "relation") {
                  osmId = nominatimData[i].osm_id;
                }
              }
              // Fallback if there's no relation in search results. Not sure if it's needed, but just in case.
              if (!osmId) {
                osmId = nominatimData[0].osm_id;
              }

              let areaId = 3600000000 + osmId;

              resolve(areaId);
            } else {
              reject();
            }
          })
          .catch((e) => {
            console.error("Deu erro! Saca só:", e);
            notification["error"]({
              message: "Erro",
              description:
                "Ops, erro na API do Nominatim. Abra o console para ver mais detalhes.",
            });

            reject();
          });
      }
    });
  }

  static getData(constraints) {
    return new Promise((resolve, reject) => {
      let geoJson;
      let cancelSource;

      console.log(constraints);
      this.getAreaId(constraints.area)
        .then((areaId) => {
          const query = OSMController.getQuery({ areaId });
          console.debug("generated query: ", query);

          const encodedQuery = encodeURI(query);

          let requests = [];
          for (let i = 0; i < OVERPASS_SERVERS.length; i++) {
            const endpoint = OVERPASS_SERVERS[i] + "?data=" + encodedQuery;

            console.debug(`[SERVER #${i}] ${OVERPASS_SERVERS[i]}`);

            // Create a cancel token for each request
            cancelSource = CancelToken.source();

            requests[i] = axios
              .get(endpoint, { cancelToken: cancelSource.token })
              .then((response) => {
                const data = response.data;
                if (data.elements.length > 0) {
                  console.debug(`[SERVER #${i}] Success!`);
                  // Cancel all other requests once one succeeds
                  for (let r = 0; r < requests.length; r++) {
                    if (r !== i) {
                      console.debug(`[SERVER #${r}] Aborting`);
                      cancelSource.cancel(`Request #${r} was aborted`);
                    }
                  }

                  console.debug("osm data: ", data);
                  geoJson = osmtogeojson(data, { flatProperties: true });
                  console.debug("converted to geoJSON: ", geoJson);

                  resolve({
                    geoJson: geoJson,
                  });
                } else {
                  console.debug(`[SERVER #${i}] Empty result`);

                  // Check if I'm the last one
                  let isLastRemainingRequest = true;
                  for (let r = 0; r < requests.length; r++) {
                    if (r !== i) {
                      if (requests[r].status === undefined) {
                        isLastRemainingRequest = false;
                      }
                    }
                  }
                  if (isLastRemainingRequest) {
                    console.debug(
                      `[SERVER #${i}] I was the last one, so probably the result is empty.`
                    );
                    resolve({ geoJson: null });
                  }
                }
              })
              .catch((error) => {
                // Rest of the error handling code
                console.error(`[SERVER #${i}] Error:`, error);
              });
          }
        })
        .catch((e) => {
          console.error(e);
          reject();
        });
    });
  }

  static getRelationQuery(relationId) {
    return `
      [out:json][timeout:500];
      relation(${relationId});
      out geom;
    `;
  }

  static async getRelationData(relationId) {
    try {
      const query = OSMController.getRelationQuery(relationId);
      console.debug("generated query:", query);

      const encodedQuery = encodeURI(query);

      let geoJson = null;

      for (let i = 0; i < OVERPASS_SERVERS.length; i++) {
        const endpoint = OVERPASS_SERVERS[i] + "?data=" + encodedQuery;

        console.debug(`[SERVER #${i}] ${OVERPASS_SERVERS[i]}`);

        try {
          const response = await axios.get(endpoint);

          if (response.status === 200 && response.data.elements.length > 0) {
            console.debug(`[SERVER #${i}] Success!`);
            geoJson = osmtogeojson(response.data);
            break; // Stop iterating servers once we get data
          } else {
            console.debug(`[SERVER #${i}] Empty result`);
          }
        } catch (error) {
          console.error(`[SERVER #${i}] Error:`, error);
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
}

module.exports = OSMController;
