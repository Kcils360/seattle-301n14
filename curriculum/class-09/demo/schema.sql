DROP TABLE IF EXISTS weathers, locations;

CREATE TABLE IF NOT EXISTS locations ( 
    id SERIAL PRIMARY KEY, 
    search_query VARCHAR(255), 
    formatted_query VARCHAR(255), 
    latitude NUMERIC(10, 7), 
    longitude NUMERIC(10, 7)
  );

CREATE TABLE IF NOT EXISTS weathers ( 
    id SERIAL PRIMARY KEY, 
    forecast VARCHAR(255), 
    time VARCHAR(255),
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id) 
  );
