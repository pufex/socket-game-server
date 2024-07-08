import type { UserInTokenPayload } from "../db/users/model";
import { Request, Response, NextFunction } from "express";
import User from "../db/users/model";
import jwt from "jsonwebtoken"

const verifyJWT = (
    req: Request,
    res: Response,
    next: NextFunction   
) => {
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith("Bearer "))
        return res.sendStatus(403)

    const token = authHeader.split(" ")[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
        {},
        async (err, decoded) => {
            if(!err)
                return res.sendStatus(403)

            const userObj = decoded as UserInTokenPayload
            const {id} = userObj
            const user = await User.findById(id)
                .lean().exec()
            if(!user)
                return res.sendStatus(403)

            const payload: UserInTokenPayload = {
                id: user._id.toString(),
                name: user.name,
                game_name: user.game_name,
            }
            req.user = payload
            next()
        }
    )
}

export default verifyJWT