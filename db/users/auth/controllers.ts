import type { Request, Response } from "express";
import type { UserPayload, UserInTokenPayload } from "../model";
import User from "../model"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const register = async (
    req: Request,
    res: Response
) => {
    const {name, password} = req.body as UserPayload
    if(!name || !password)
        return res.status(400).json({message: "Missing required credentials."})

    const existingQuery = {name}
    const existingUser = await User.findOne(existingQuery)
        .lean().exec()
    if(existingUser)
        return res.status(409).json({message: "Username is already taken."})

    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({name, password: hashedPassword})
    res.status(201).json({message: `User ${name} successfully created.`})
}

export const login = async (
    req: Request,
    res: Response
) => {
    const {name, password} = req.body as UserPayload
    if(!name || !password)
        return res.status(400).json({message: "Missing required credentials."})

    const userQuery = {name}
    const user = await User.findOne(userQuery)
        .lean().exec()
    if(!user)
        return res.status(401).json({message: "Wrong username or password."})

    const hashedPassword = user.password
    const match = await bcrypt.compare(password, hashedPassword)
    if(!match)
        return res.status(409).json({message: "Wrong username or password"})

    const payload: UserInTokenPayload = {
        id: user._id.toString(),
        name: user.name,
        game_name: user.game_name
    }

    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET as string,
        {expiresIn: "30d"}
    )

    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET as string,
        {expiresIn: "1h"}
    )

    res.cookie("token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000*60*60*24*30,
    })
    res.json({accessToken, user: payload})
}

export const refresh = async (
    req: Request,
    res: Response
) => {
    const token = req.cookies?.token
    if(!token)
        return res.sendStatus(401)
    jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET as string,
        {}, 
        async (err, decoded) => {
            if(err)
                return res.sendStatus(401)

            const userObj = decoded as UserInTokenPayload
            const {id} = userObj

            const user = await User.findById(id)
                .lean().exec()
            if(!user)
                return res.sendStatus(401)

            const payload: UserInTokenPayload = {
                id: user._id.toString(),
                name: user.name,
                game_name: user.game_name
            }
 
            const accessToken = jwt.sign(
                payload,
                process.env.ACCESS_TOKEN_SECRET as string,
                {expiresIn: "1h"}
            )

            res.json({accessToken, user: payload})
        }
    )
}

export const logout = async (
    req: Request,
    res: Response
) => {
    const token = req.cookies.token
    if(!token)
        return res.sendStatus(204)
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    })
    res.sendStatus(200)
}