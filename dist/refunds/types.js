export class RefundError extends Error {
    code;
    cause;
    constructor(message, code, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'RefundError';
    }
}
//# sourceMappingURL=types.js.map