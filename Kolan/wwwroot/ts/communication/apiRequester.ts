import { RequestParameter } from "./requestParameter";
import { RequestType } from "../enums/requestType";
import { Promise } from "es6-promise";

/** Do an API request
 * @param action - Api action (controller)
 * @param method - Api method (additional route, often empty)
 * @param requestType - HTTP request type, eg. GET, POST, PUT, etc.
 * @param requestParameters - A list of parameters to be pushed with the request.
 */
export class ApiRequester {
    /**
     * Performs an HTTP request to the backend server.
     *
     * @name send
     * @function
     * @param {string} action
     * @param {string} method
     * @param {string} requestType
     * @param {RequestParameter[]} requestParameters=null
     * @returns {undefined}
     */
    public send(action: string, method: string, requestType: RequestType, requestObject: object = []): Promise<any> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            let url = "/api/" + action;
            if (method) url += "/" + method;

            req.open(requestType, url);
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            req.onerror = (e) => reject(Error(`Network Error: ${e}`));
            req.onload = () => {
                if (req.status === 200) resolve(req.response);
                else                    reject(req);
            }

            // Send data
            if (requestObject) {
                req.send(this.createURLSearchParams(requestObject));
            } else {
                req.send();
            }
        });
    }

    /**
     * Convert the RequestParameters to URLSearch params, which can be read by the server.
     *
     * @name createURLSearchParams
     * @function
     * @param {RequestParameter[]} requestParameters
     * @returns {URLSearchParams}
     */
    private createURLSearchParams(requestObject: object): URLSearchParams {
        let params = new URLSearchParams();
        for (const key in requestObject) {
            params.append(key, requestObject[key]);
        }

        return params;
    }
}
