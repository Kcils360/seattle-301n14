'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();


const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

//routes
app.get('/', (request, response) => {
    //do something ejs-ey
    response.render('pages/index')
})

function Book(info) {
    this.title = info.title
    //image(url), author, description
}

app.post('/search', (request, response) => {
    // console.log('search: ',request.body.search[0]);
    // console.log('search 1', request.body.search[1]);
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    if(request.body.search[1] === 'author') {url += `inauthor:${request.body.search[0]}`}
    if(request.body.search[1] === 'title') {url += `intitle:${request.body.search[0]}`}
    // console.log(url);
    superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/results', {searchResults: results}));
})


app.listen(PORT, () => console.log(`server up on ${PORT}`));