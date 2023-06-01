module.exports = {
    bodyParserErrorHandler: bodyParserErrorHandler
}

function isBodyParserError(error) 
{
    const bodyParserCommonErrorsTypes = [
        'encoding.unsupported',
        'entity.parse.failed',
        'entity.verify.failed',
        'request.aborted',
        'request.size.invalid',
        'stream.encoding.set',
        'parameters.too.many',
        'charset.unsupported',
        'entity.too.large'
    ]

    return bodyParserCommonErrorsTypes.includes(error.type);
}

function bodyParserErrorHandler({ onError = (err, req, res) => { errorMsg = (err) => { return `BodyParser failed to parse request --> ${err.message}` } } } = {}) {
    return (err, req, res, next) => {
        if (err && isBodyParserError(err)) {
            onError(err, req, res);
            res.status(err.status);
            res.send({ message: errorMessage(err) })
        } else next(err)
    }
}