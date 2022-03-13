class ExpressError extends Error {
    constructor(message , statusCode) {
        super();
        this.message = message;
        this.statuCode = statusCode;
    }
}

module.exports = ExpressError;