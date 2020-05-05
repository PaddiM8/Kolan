import { RequestType } from "../enums/requestType";

export class ApiClient {
    /**
     * Performs an HTTP request to the backend server.
     */
    protected send(action: string, method: string, requestType: RequestType, requestObject: object = []): Promise<any> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            let url = "/api/" + action;
            if (method) url += "/" + method;

            req.open(requestType, url);
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            req.onerror = (e) => reject(Error(`Network Error: ${e}`));
            req.onload = () => {
                if (req.status == 200) resolve(req.response);
                else                   reject(req);
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
     */
    private createURLSearchParams(requestObject: object): URLSearchParams {
        let params = new URLSearchParams();
        for (const key in requestObject) {
            params.append(key, requestObject[key]);
        }

        return params;
    }
}