const express = require('express');
const mongoose = require('mongoose');

// const //
const app = express();
const port = process.env.PORT || 5000;
const items = require('./routes/api/items');
const auth = require('./routes/auth/auth');


// middleware //
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

const db = require('./config/keys').mongoURI_local;
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true  
    })
    .then(() => console.log('MongoDB Connected ...'))
    .catch(err => console.log(err));


// routes //
app.use('/api/items', items);

app.use('/', auth);


// server start //
app.listen(port, () =>{
    console.log(`Server listening on ${port}...`);
})