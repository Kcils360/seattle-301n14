'use strict'

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/public', express.static('./public'));
app.use(express.urlencoded({ extended: true }));

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.set('view engine', 'ejs');

// Home route
app.get('/', getTasks);
// Get an individual task information (/tasks/1)
app.get('/tasks/:task_id', getOneTask);

app.get('/add', (req, res) => {
    res.render('pages/add');
})
app.post('/add', addNewTask);

app.post('/update', updateTask);

// shows the details of a default task. This 
// is being sent through the request body. 
app.post('/show', getOneTask)

app.listen(PORT, () => console.log(`server up on port ${PORT}`))


function getTasks(request, response) {
    let SQL = 'SELECT * FROM tasks';
    return client.query(SQL)
        .then(res => {
            if (res.rowCount > 0) {
                // console.log('res:', res.rows);
                response.render('index', { activeTodos: res.rows });
            }
        })
}

function getOneTask(request, response) {
    // request.body.search will either be an id or some words
    // requset.params.task_id comes from /tasks/:task_id
    // bananas is just the name of the input field on the index.ejs file. 
    let id = request.params.task_id ? request.params.task_id : parseInt(request.body.bananas);

    let SQL = 'SELECT * FROM tasks WHERE id=$1;';
    client.query(SQL, [id])
        .then(res => {
            if (res.rowCount > 0) {
                response.render('./pages/show', { showTodo: res.rows });
            }
        })
}

function addNewTask(request, response) {
    let req = request.body;
    let SQL = 'INSERT INTO tasks(title, description, contact, status, category) VALUES($1, $2, $3, $4, $5) RETURNING id;';
    let values = [req.title, req.description, req.contact, req.status, req.category];
    // run the query
    client.query(SQL, values)
        .then(res => {
            // make sure we have data
            if (res.rowCount > 0) {
                // b/c we are returning the ID from th SQL query, let's redirect to that specific tasks page. 
                return response.redirect(`/tasks/${res.rows[0].id}`);
            }
        })
        // we need to handle the error and show us what is wrong
        .catch(err => console.error(err))

}

function updateTask(request, response) {
    let SQL = 'UPDATE tasks SET status=$1 WHERE id=$2;';
    let id = parseInt(request.body.id);
    let values = [request.body.status, id];
    console.log(values);
    client.query(SQL, values)
        .then(update => {
            if (update.rowCount > 0) {
                return response.redirect(`/tasks/${id}`);
            }
        })
}