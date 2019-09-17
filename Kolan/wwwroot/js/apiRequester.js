"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
/** Do an API request
 * @param action - Api action (controller)
 * @param method - Api method (additional route, often empty)
 * @param requestType - HTTP request type, eg. GET, POST, PUT, etc.
 * @param requestParameters - A list of parameters to be pushed with the request.
 */
class ApiRequester {
    /* Do a HTTP request
     */
    send(action, method, requestType, requestParameters = null) {
        return new es6_promise_1.Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            let url = "api/" + action;
            if (method)
                url += "/" + method;
            req.open(requestType, url);
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            req.onerror = (e) => reject(Error(`Network Error: ${e}`));
            req.onload = () => {
                if (req.status === 200)
                    resolve(req.response);
                else
                    reject(Error(req.statusText));
            };
            // Send data
            if (requestParameters != null) {
                req.send(this.createURLSearchParams(requestParameters));
            }
            else {
                req.send();
            }
        });
    }
    /* Convert the request parameters to URLSearchParams,
     * which can be read by the server.
     */
    createURLSearchParams(requestParameters) {
        let params = new URLSearchParams();
        for (let parameter of requestParameters) {
            params.append(parameter.key, parameter.value);
        }
        return params;
    }
}
exports.ApiRequester = ApiRequester;
