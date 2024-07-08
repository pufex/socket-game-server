import { UserInTokenPayload } from "../../db/users/model";

export {}

declare module "socket.io" {
    interface Socket {
        user?: UserInTokenPayload
    }
}