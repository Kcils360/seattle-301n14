'use strict'

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.set('view engine', 'ejs');

// let todos = [
//     {id: 1, task: 'get some', description: 'Go and get some', completed: false},
//     {id: 2, task: 'get some more', description: 'Go and get some more', completed: false},
//     {id: 3, task: 'get even more', description: 'Get even more, again', completed: false},
//     {id: 4, task: 'too much', description: 'Give some back', completed: false}
// ]


// app.get('/', (req, res) => {
//     let allTasks = getTasks()
//     .then( res => {
//         console.log('alltasks: ', allTasks);
//     })

//     res.render('index', {activeTodos: allTasks});
// })
app.get('/', getTasks);
app.get('/tasks/:task_id', getOneTask);
app.get('/add', (req,res) => {
    res.render('pages/add');
})
app.post('/add', addNewTask);
app.post('/update', updateTask);

// app.post('/show', (req, res) => {
//     let id = req.body.search;
//     console.log('show req: ', id);
//     let oneTodo;
//     if(id[1] === 'ID') oneTodo = todos.filter( td => td.id == id[0]);
//     if(id[1] === 'todo') oneTodo = todos.filter( td => td.task === id[0]);
//     console.log(oneTodo);
//     res.render('./pages/show', {showTodo: oneTodo});
// })

app.listen(PORT, () => console.log(`server up on port ${PORT}`))




function getTasks(request, response) {
    let SQL = 'SELECT * FROM tasks';
    return client.query(SQL)
        .then( res => {
            if(res.rowCount > 0){
                // console.log('res:', res.rows);
                response.render('index', {activeTodos: res.rows});
            }
        })
}

function getOneTask(request, response) {
    let SQL = 'SELECT * FROM tasks WHERE id=$1;';
    client.query(SQL, [request.params.task_id])
    .then( res => {
        if(res.rowCount >0){
            response.render('./pages/show', {showTodo: res.rows});
        }
    })
}

function addNewTask(request, response){
    // console.log('add',request.body);
    let req = request.body;
    let SQL = 'INSERT INTO tasks(title, description, contact, status, category) VALUES($1, $2, $3, $4, $5) RETURNING id;';
    let values = [req.title, req.description, req.contact, req.status, req.category];
    console.log(values);
    client.query(SQL, values)
    .then(clientRes => {
        if(clientRes.rowCount > 0){
            response.render('index');
        }
    })
}

function updateTask(request, response){
    let SQL = 'UPDATE tasks SET status=$1 WHERE id=$2;';
    let id = parseInt(request.body.id);
    // console.log(id)
    let values = [request.body.status, id];
    console.log(values);
    client.query(SQL, values)
    .then(update => {
        if(update.rowCount > 0){
            return response.render('index');
        }               
    })
}