import express from "express"

import { 
    register, 
    login, 
    refresh, 
    logout, 
} from "./controllers"

const AuthRoutes = express.Router()

AuthRoutes.post("/register", register)
AuthRoutes.post("/login", login)
AuthRoutes.get("/refresh", refresh)
AuthRoutes.get("/logout", logout)

export default AuthRoutes