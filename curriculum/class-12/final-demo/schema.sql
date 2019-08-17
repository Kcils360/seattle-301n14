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
VALUES ('Get some', 'Go and get some', 'Dukes', 'incomplete', 'actions'),
       ('Get more', 'Go and get more', 'Dukes', 'incomplete', 'actions');