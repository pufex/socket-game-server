import express from "express"

import { 
    getAllGames,
    getGameByName,
    createGame,
    deleteGameByName
} from "./controllers"

const GamesRoutes = express.Router()

GamesRoutes.get("/", getAllGames)
GamesRoutes.get("/:id", getGameByName)
GamesRoutes.post("/", createGame)
GamesRoutes.delete("/:id", deleteGameByName)

export default GamesRoutes