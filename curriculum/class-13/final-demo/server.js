'use strict'

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/public', express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride((request, response) => {
    //if the request HAS .body, && .body is typeof object, && _method lives in the body
    //all three conditions have to be true to run the code.  High level to low level
    if(request.body && typeof request.body === 'object' && '_method' in request.body) {
        let method = request.body._method;
        delete request.body._method;
        return method;
    }
}))

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

app.put('/update/:task_id', updateTask);

// shows the details of a default task. This 
// is being sent through the request body. 
app.post('/show', getOneTask)

app.delete('/tasks/:task_id', deleteTask);


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
    // destructure variables
    let { title, description, category, contact, status, id } = request.body;
    // need SQL to update the specific task that we were on
    let SQL = `UPDATE tasks SET title=$1, description=$2, category=$3, contact=$4, status=$5 WHERE id=$6;`;
    // use request.params.task_id === whatever task we were on
    let values = [title, description, category, contact, status, id];
    // console.log('update:', request.body);
    // let SQL = 'UPDATE tasks SET status=$1 WHERE id=$2;';
    // let id = parseInt(request.body.id);
    // let values = [request.body.status, id];
    // console.log(values);
    client.query(SQL, values)
        .then(update => {
            if (update.rowCount > 0) {
                return response.redirect(`/tasks/${id}`);
            }
        })
}

function deleteTask(request, response) {
    let SQL = 'DELETE FROM tasks WHERE id=$1;';
    let values = [parseInt(request.body.id)];

    return client.query(SQL, values)
    .then( response.redirect('/'))
    .catch(err => console.error(err));
}