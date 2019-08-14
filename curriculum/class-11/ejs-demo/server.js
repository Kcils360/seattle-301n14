'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

let list = ['Mangos', 'Beer', 'Banana', 'Milk'];
let quantities = [
    {name: 'Mangos', quantity:3 },
    {name: 'Beer', quantity:24 },
    {name: 'Bananas', quantity:6 },
    {name: 'Milk', quantity:1 },
    {name: 'Wine', quantity:1 }
]


//routes
app.get('/', (request, response) => {
    //do something ejs-ey
    response.render('index', {arrayOfGroceries: list});
})

app.get('/quantities', (request, response) => {
    response.render('quantities', {listOfQuants: quantities});
})




app.listen(PORT, () => console.log(`server up on ${PORT}`));