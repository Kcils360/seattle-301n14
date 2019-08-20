DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT, 
    description TEXT,
    contact VARCHAR(255),
    status VARCHAR(255),
    category VARCHAR(255)
);

INSERT INTO tasks (title, description, contact, status, category)
VALUES ('Put Gas in the car', 'It has to be at least half full', 'Amanda', 'incomplete', 'actions'),
       ('Buy Apples', 'only the red kind', 'Dukes', 'incomplete', 'actions');