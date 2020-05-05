import { BoardApiClient } from "./boardApiClient";
import { UserApiClient } from "./userApiClient";
import { GroupApiClient } from "./groupApiClient";

export class ApiRequester {
    public static boards = new BoardApiClient();
    public static users = new UserApiClient();
    public static groups = new GroupApiClient();
}