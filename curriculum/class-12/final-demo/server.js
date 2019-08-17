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

let todos = [
    {id: 1, task: 'get some', description: 'Go and get some', completed: false},
    {id: 2, task: 'get some more', description: 'Go and get some more', completed: false},
    {id: 3, task: 'get even more', description: 'Get even more, again', completed: false},
    {id: 4, task: 'too much', description: 'Give some back', completed: false}
]



app.get('/', (req, res) => {
    res.render('index', {activeTodos: todos});
})

app.post('/show', (req, res) => {
    let id = req.body.search;
    console.log('show req: ', id);
    let oneTodo;
    if(id[1] === 'ID') oneTodo = todos.filter( td => td.id == id[0]);
    if(id[1] === 'todo') oneTodo = todos.filter( td => td.task === id[0]);
    console.log(oneTodo);
    res.render('./pages/show', {showTodo: oneTodo});
})

app.listen(PORT, () => console.log(`server up on port ${PORT}`))