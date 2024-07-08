import type { UserInTokenPayload } from "../db/users/model"
import type { SocketType, IONextFunction } from "./types"
import jwt from "jsonwebtoken"
import User from "../db/users/model"

export const verifyUser = (
    socket: SocketType,
    next: IONextFunction
) => {
    if(!socket.handshake.auth || !socket.handshake.auth.token)
        return next(new Error("Unauthorised"))
    
    const token = socket.handshake.auth.token
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
        {},
        async (err, decoded) => {
            if(err)
                return next(new Error("Unauthorised"))
            const userObj = decoded as UserInTokenPayload
            const {id} = userObj
            const user = await User.findById(id)
                .lean().exec()
            
            if(!user)
                return next(new Error("Unauthorised"))

            const payload: UserInTokenPayload = {
                id: user._id.toString(),
                name: user.name,
                game_name: user.game_name,
            }
            socket.user = payload
            next()
        }
    )
}