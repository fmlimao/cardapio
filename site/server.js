require("dotenv-safe").config();
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const http = require('http')
const logger = require('morgan');
const axios = require('axios');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.use('/assets', express.static(path.join(__dirname, './public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './src/views'))
app.use(expressLayouts);
app.set('layout', 'clients/layout');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(helmet());
app.use(cookieParser());
app.use(require('./src/middlewares/json-return'));

app.get('/', (req, res) => {
    return res.sendFile(__dirname + '/src/views/home.html');
});

app.get('/:tenantSlug', (req, res) => {
    const { tenantSlug } = req.params;
    console.log('tenantSlug', tenantSlug);

    axios.get(process.env.API_HOST + `/site/tenants/${tenantSlug}`)
        .then(ajaxResponse => {
            const data = ajaxResponse.data;
            console.log('then', 'data', data);

            const tenant = data.content.tenant;

            return res.render('clients/content', {
                tenant,
                timestamp: Date.now(),
            })
        })
        .catch(ajaxResponse => {
            const data = ajaxResponse.response.data;
            console.log('catch', 'data', data);
            return res.sendFile(__dirname + '/src/views/404.html');
        });

});

// Mensagens de erro
app.use((req, res) => {
    return res.sendFile(__dirname + '/src/views/404.html');
});

app.use(require('./src/middlewares/error-500'));

var server = http.createServer(app);
server.listen(process.env.APP_PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.APP_PORT}`);
});
