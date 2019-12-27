import { RequestParameter } from "./requestParameter";
import { Promise } from "es6-promise";

/** Do an API request
 * @param action - Api action (controller)
 * @param method - Api method (additional route, often empty)
 * @param requestType - HTTP request type, eg. GET, POST, PUT, etc.
 * @param requestParameters - A list of parameters to be pushed with the request.
 */
export class ApiRequester {
    /* Do a HTTP request
     */
    public send(action: string, method: string, requestType: string, requestParameters: RequestParameter[] = null) {
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
            if (requestParameters != null) {
                req.send(this.createURLSearchParams(requestParameters));
            } else {
                req.send();
            }
        });
    }

    /* Convert the request parameters to URLSearchParams,
     * which can be read by the server.
     */
    private createURLSearchParams(requestParameters: RequestParameter[]): URLSearchParams {
        let params = new URLSearchParams();
        for (let parameter of requestParameters) {
            params.append(parameter.key, parameter.value);
        }

        return params;
    }
}
