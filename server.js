const express = require('express');
const port = 3000

const app = express();

app.use('/static', express.static('public'))

app.set('view engine', 'pug');


app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`The application is running in port ${port}`)
});

