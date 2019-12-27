/**
 * Contains a key/value pair for a HTTP request parameter.
 * @name RequestParameter
 * @function
 */
export class RequestParameter {
    public key: string;
    public value: string;

    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }
}
