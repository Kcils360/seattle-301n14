'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

require('dotenv').config();

const PORT = process.env.PORT;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

const app = express();

app.use(cors());

app.get('/location', getLocation);
app.get('/weather', getWeather);

function handleError(err, res) {
  console.error('ERR', err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

app.listen(PORT, () => console.log(`App is up on ${PORT}`) );

// -------------------------- HELPERS ----------------- //

function getLocation(request, response) {

  const locationHandler = {
    
    query: request.query.data,
    
    cacheHit: (results) => { 
      response.send(results.rows[0]);
    },
    
    cacheMiss: () => {
      Location.fetchLocation(request.query.data)
        .then( results => response.send(results) );
    },
  };
  
  Location.lookupLocation(locationHandler);
}

// DATA MODELS
function Location(query,data) {
  // this.id = 0;
  this.search_query = query;
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

// Refactor #1: Pull this out of the getLocation function
Location.prototype.cache = function() {
  let NEWSQL = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES($1,$2,$3,$4) RETURNING id`;
  let newValues = Object.values(this);
  return client.query(NEWSQL, newValues)
    .then( result => {
      this.id = result.rows[0].id;
      return this;
    });
};

Location.lookupLocation = function(handler) {

  const SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  const values = [handler.query];

  return client.query(SQL, values)
    .then(result => {
      if(result.rowCount > 0) {
        handler.cacheHit(result);
      } else {
        handler.cacheMiss();
      }
    })
    .catch(console.error);

};

Location.fetchLocation = function(query) {
  const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(_URL)
    .then( data => {
      if ( ! data.body.results.length ) { throw 'No Data'; }
      else {
        let location = new Location(query, data.body.results[0]);
        location.cache()
          .then( res => {
            res.send(location);
          })
      }
    }); 
};

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
  //add a time stamp
  this.created_at = Date.now();
}

function getWeather(request, response) {
  const SQL =  `SELECT * FROM weathers WHERE location_id=$1;`;
  const values = [request.query.data.id];
  client.query(SQL, values)
    .then(result => {
      if(result.rowCount > 0){
        // DONE check if data is valid
        //DONE if data is > 15 seconds refresh data
        if((result.rows[0].created_at+15000) < Date.now()) {
          const _URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
        return superagent.get(_URL)
        .then(result => {
          const weatherSummaries = [];
          result.body.daily.data.forEach(day => {
            const summary = new Weather(day);
            weatherSummaries.push(summary);
          });
          const SQL = `INSERT INTO weathers (forecast, time, location_id) VALUES ($1, $2, $3);`;
        weatherSummaries.forEach(summary => {
          const values = [summary.forecast, summary.time, request.query.data.id];
        client.query(SQL, values);
      })
          console.log('refreshed cache', weatherSummaries);
          response.send(weatherSummaries);
        })
        .catch(error => handleError(error, response));
        } else {response.send(result.rows)};
        //DONE else return data back to client
        
      } else { 
        //new call to darksky, cache data in locations, then cache weather data into weathers     
        const _URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
        return superagent.get(_URL)
        .then(result => {
          const weatherSummaries = [];
          result.body.daily.data.forEach(day => {
            const summary = new Weather(day);
            weatherSummaries.push(summary);
          });
          const SQL = `INSERT INTO weathers (forecast, time, location_id) VALUES ($1, $2, $3);`;
        weatherSummaries.forEach(summary => {
          const values = [summary.forecast, summary.time, request.query.data.id];
        client.query(SQL, values);
      })
          response.send(weatherSummaries);
        })
        .catch(error => handleError(error, response));
      }}
      )};
      
      function weatherCache(weatherSummary, id) {
        const SQL = `INSERT INTO weathers (forecast, time, location_id) VALUES ($1, $2, $3);`;
        weatherSummary.forEach(summary => {
          const values = [summary.forecast, summary.time, id];
        client.query(SQL, values);
      })
    }