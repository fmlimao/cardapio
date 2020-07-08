require("dotenv-safe").config();
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const http = require('http')
const logger = require('morgan');

const JsonReturn = require('./src/helpers/json-return');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(helmet());
app.use(cookieParser());

// Todas as rotas
app.use(require('./src/routes'));

// Mensagens de erro
app.use(require('./src/middlewares/error-404'));
app.use(require('./src/middlewares/error-500'));

var server = http.createServer(app);
server.listen(process.env.APP_PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.APP_PORT}`);
});
