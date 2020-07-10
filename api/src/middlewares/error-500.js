module.exports = (req, res) => {
    const ret = req.ret;
    ret.setError(true);
    ret.setCode(err.status || 500);
    ret.addMessage('Erro interno');
    ret.addMessage(err.message);
    return res.status(ret.getCode()).json(ret.generate());
};
