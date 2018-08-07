const axios = require('axios');
const Airtable = require('airtable');
const MapboxClient = require('mapbox');
const mapbox = new MapboxClient('pk.eyJ1IjoiaW5kaWVsZWUiLCJhIjoiY2pqNGVsdjlzMTY5MjNwcGNvdWQxYXlydSJ9.XiSB6XHZULnIAKVRDyPTuQ');

class AirtableService {
  constructor() {
    this.client = new Airtable({
      endpointUrl: 'https://api.airtable.com',
      apiKey: process.env.AIRTABLE_API_KEY
    });
  }

  getStoreLocations(options) {
    return new Promise((resolve,reject) => {
      let data = [],
          base = new Airtable().base('app2FdLQMXJCedDMT'),
          formula;

      if (typeof options.productType !== "undefined") {
        formula = 
          `AND(` +
            `AND(` +
              `{lat} >= ${options.latMin}, ` +
              `{lat} <= ${options.latMax} ` +
            `), ` + 
            `AND(` +
              `{lng} >= ${options.lngMin}, ` +
              `{lng} <= ${options.lngMax}` + 
            `)` +
            `, AND({${options.productType}} = 'TRUE')`+
          `)`;
      } else {
        formula = 
          `AND(` +
            `AND(` +
              `{lat} >= ${options.latMin}, ` +
              `{lat} <= ${options.latMax} ` +
            `), ` + 
            `AND(` +
              `{lng} >= ${options.lngMin}, ` +
              `{lng} <= ${options.lngMax}` + 
            `)` +
          `)`;
      }

      base('Locations').select({
        view: "Grid view",
        fields: ["address", "lat", "lng", "title", "phone"],
        filterByFormula: formula
      })
      .eachPage((records, fetchNextPage) => {
        records.forEach(record => {
          data.push({
            id: record.id,
            address: record.get("address"),
            lat: record.get("lat"),
            lng: record.get("lng"),
            title: record.get("title"),
            phone: record.get("phone")
          });
        });
        fetchNextPage();
      }, (err) => {
        if (err) { 
          console.error(err);
          reject(err); 
        } else {
          resolve(data);
        }
      });
    });
  }

  processStoreLocations() {
    return new Promise((resolve,reject) => {
      let base = new Airtable().base('app2FdLQMXJCedDMT');

      base('Locations').select({
        view: "Grid view",
        fields: ["address", "lat", "lng", "title", "phone"],
        filterByFormula: `NOT({processed} = "true")`
      })
      .eachPage((records, fetchNextPage) => {
        records.forEach(record => {
          //get coords
          mapbox.geocodeForward(record.get("address"), (err, data, res) => {
            //write upstream
            base('Locations').update(record.id, {
              "lng": data.features[0].center[0].toString(),
              "lat": data.features[0].center[1].toString(),
              "processed": "true"
            }, function(err, record) {
              if (err) { 
                console.error(err); 
                return;
              }
            });
          });
        });
        fetchNextPage();
      }, (err) => {
        if (err) { 
          console.error(err);
          reject(err); 
        } else {
          resolve("Process Store Locations: completed successfully");
        }
      });
    });
  }
}

module.exports = AirtableService;
