const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//using the below code directly in routes.
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

mongoose.connect(process.env.MONGO_URI) //add uri.
    .then(() => console.log("DBC"))
    .catch((err) => console.log("DBNC E- ", err))

app.get('/', (req, res) => {
    res.send('BW')
}
);

app.use('/', require('./routes/routes'));



const port = 8000;
app.listen(port, () => console.log('S ON PORT - ', port));