import {config as dotenv} from "dotenv"
dotenv()

import corsOptions from "./config/corsOptions"

import express from "express"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import cors from "cors"
// import verifyJWT from "./middleware/verifyJWT"

import AuthRoutes from "./db/users/auth/routes"
import GamesRoutes from "./db/games/routes"

import { Server } from "socket.io"

import { verifyUser } from "./socket-io/middleware"

import { 
    handleGameEnter, 
    handleLeavingGame, 
} from "./socket-io/controllers/manageUsers"

import { 
    handleUserList, 
    handleSendingMessage,
} from "./socket-io/controllers/misc"

import { 
    giveSlot,
    handleSlotExit,
    handleUsurpation,
    handleGameActivation,
} from "./socket-io/controllers/ingame"

import { 
    handleDisconnected
} from "./socket-io/controllers/auto"



const URI = process.env.MONGODB_KEY as string
const PORT = process.env.PORT || 9000

const app = express()

app.use(express.static("/public"))
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

// app.use(verifyJWT)

app.use("/auth", AuthRoutes)
app.use("/games", GamesRoutes)

mongoose.connect(URI)
    .then(() => {
        console.log("Connected to the DB!")
        const server = app.listen(PORT, () => console.log(`Listening to port ${PORT}`))

        const io = new Server(server, {
            cors: {
                origin: "*",
            }
        })

        io.use(verifyUser)
        io.on("connection", (socket) => {

            console.log(`User ${socket.id} connected.`)
            console.log("User Data:")
            console.dir(socket.user)

            // MANAGING USERS
            socket.on("enterGame", handleGameEnter(io, socket))
            socket.on("askToLeaveGame", handleLeavingGame(io, socket))

            // MISC
            socket.on("askForList", handleUserList(io, socket))
            socket.on("askToSendMessage", handleSendingMessage(io, socket))


            // INGAME EVENTS
            socket.on("askForSlot", giveSlot(io, socket))
            socket.on("askToExitSlot", handleSlotExit(io, socket))
            socket.on("askToTakePosition", handleUsurpation(io, socket))
            socket.on("askToStartGame", handleGameActivation(io, socket))

            //DISCONNECT
            socket.on("disconnect", handleDisconnected(io, socket))
        })

    })
    .catch((err) => {
        console.log("Failed to connect to the DB!")
        console.log(err)
        process.exit(1)
    })

