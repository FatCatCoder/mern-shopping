const express = require('express');
const mongoose = require('mongoose');

// const //
const app = express();
const port = process.env.PORT || 5000;
const items = require('./routes/api/items');


// middleware //
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

const db = require('./config/keys').mongoURI;
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected ...'))
    .catch(err => console.log(err));


// routes //
app.use('/api/items', items);


// server start //
app.listen(port, () =>{
    console.log(`Server listening on ${port}...`);
})