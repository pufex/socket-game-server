import { UserInTokenPayload } from "../../db/users/model";

export {}

declare global {
    namespace Express {
        export interface Request {
            user?: UserInTokenPayload
        }
    }
}