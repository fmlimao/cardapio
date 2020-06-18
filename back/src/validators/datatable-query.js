const Validator = require('validatorjs');
const datatableValidator = require('./datatable');
const messagesValidator = require('./messages');

module.exports = (req) => {
    let { draw, start, length, search } = req.query;

    if (typeof draw === 'undefined') draw = 1;

    if (typeof start === 'undefined') start = 0;

    if (typeof length === 'undefined') length = 10;

    if (typeof search !== 'object') search = { value: '' };
    else if (typeof search.value === 'undefined') search.value = '';

    draw = Number(draw);
    start = Number(start);
    length = Number(length);
    search.value = String(search.value).trim();

    const queryDatatable = {
        draw,
        start,
        length,
        search,
    };

    const datatableValidation = new Validator(queryDatatable, datatableValidator, messagesValidator);
    const fails = datatableValidation.fails();
    const errors = datatableValidation.errors.all();

    const validation = {
        fails,
        errors,
    };

    return {
        draw,
        start,
        length,
        search,
        validation,
    };
};
