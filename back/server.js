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

app.use(require('./src/routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const ret = new JsonReturn();
    ret.setError(true);
    ret.setCode(404);
    ret.addMessage('Rota não encontrada.');
    return res.status(ret.getCode()).json(ret.generate());
});

// error handler
app.use(function (err, req, res, next) {
    const ret = new JsonReturn();
    ret.setError(true);
    ret.setCode(err.status || 500);
    ret.addMessage('Erro interno');
    ret.addMessage(err.message);
    return res.status(ret.getCode()).json(ret.generate());
});

var server = http.createServer(app);
server.listen(process.env.APP_PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.APP_PORT}`);
});
