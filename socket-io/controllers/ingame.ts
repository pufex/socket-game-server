import type { 
    AskForSlotPayload,
    AskToExitSlotPayload,
    UsurpationPayload,
    AskToStartGamePayload,
    SocketType,
    IoType
} from "../types";
import type { GameInResponseType } from "../../db/games/model";

import Game from "../../db/games/model";

import {lookForSettling} from "../helpers"



export const giveSlot = (
    io: IoType,
    socket: SocketType
) => {
    return async ({game, player}: AskForSlotPayload) => {

        if(!socket.user)
            return

        const user_name = socket.user.name

        const enemyPlayer = player === "O"
            ? "X"
            : "O"
        const gameQuery = {name: game}
        const gameDocument = await Game.findOne(gameQuery)
            .exec()
        if(!gameDocument)
            return

        if(gameDocument.isActive)
            return

        if(gameDocument.isFinished)
            return

        if(gameDocument[player] !== null)
            return
        
        if(gameDocument[enemyPlayer] === user_name)
            return 

        gameDocument[player] = user_name
        await gameDocument.save()

        const polishedGame: GameInResponseType = {
            id: gameDocument._id.toString(),
            name: gameDocument.name,
            board: gameDocument.board,
            currentTurn: gameDocument.currentTurn,
            turn: gameDocument.turn,
            X: gameDocument.X,
            O: gameDocument.O,
            isActive: gameDocument.isActive,
            isDraw: gameDocument.isDraw,
            isFinished: gameDocument.isFinished,
            winner: gameDocument.winner,
        }
        io.to(game).emit("gameStateChange", {game: polishedGame})
    }
}

export const handleSlotExit = (
    io: IoType,
    socket: SocketType
) => {
    return async ({game, player}: AskToExitSlotPayload) => {
        if(!socket.user)
            return
        
        const gameQuery = {name: game}
        const gameDocument = await Game.findOne(gameQuery)
            .exec()
        if(!gameDocument)
            return
        
        gameDocument[player] = null
        await gameDocument.save()

        const polishedGame: GameInResponseType = {
            id: gameDocument._id.toString(),
            name: gameDocument.name,
            board: gameDocument.board,
            currentTurn: gameDocument.currentTurn,
            turn: gameDocument.turn,
            X: gameDocument.X,
            O: gameDocument.O,
            isActive: gameDocument.isActive,
            isDraw: gameDocument.isDraw,
            isFinished: gameDocument.isFinished,
            winner: gameDocument.winner,
        }
        io.to(game).emit("gameStateChange", {game: polishedGame})
    }
}

export const handleUsurpation = (
    io: IoType,
    socket: SocketType
) => {
    return async ({
        col,
        row,
        game,
    }: UsurpationPayload) => {

        if(!socket.user)
            return

        const user_name = socket.user.name

        const gameQuery = {name: game}
        const gameDocument = await Game.findOne(gameQuery)
            .exec()
        if(!gameDocument)
            return

        if(
            gameDocument.X !== user_name
                        &&
            gameDocument.O !== user_name
        ) return

        const player = gameDocument.X === user_name
            ? "X"
            : "O"
        const enemyPlayer = player === "X"
            ? "O"
            : "X"

        if(gameDocument.currentTurn !== player)
            return

        if(gameDocument.board[row][col] !== null)
            return

        gameDocument.board[row][col] = player

        const winner = lookForSettling(gameDocument.board)
        if(winner === undefined){
            gameDocument.isFinished = true
            gameDocument.isDraw = true
        }else if(winner !== null){
            gameDocument.isFinished = true
            gameDocument.winner = winner
        }else{
            gameDocument.turn++
            gameDocument.currentTurn = enemyPlayer
        }

        await gameDocument.save()
        const polishedGame: GameInResponseType = {
            id: gameDocument._id.toString(),
            name: gameDocument.name,
            board: gameDocument.board,
            currentTurn: gameDocument.currentTurn,
            turn: gameDocument.turn,
            X: gameDocument.X,
            O: gameDocument.O,
            isActive: gameDocument.isActive,
            isDraw: gameDocument.isDraw,
            isFinished: gameDocument.isFinished,
            winner: gameDocument.winner,
        }
        io.to(game).emit("gameStateChange", {game: polishedGame})
    }
}

export const handleGameActivation = (
    io: IoType,
    socket: SocketType
) => {
    return async ({game}: AskToStartGamePayload) => {

        if(!socket.user)
            return

        const user_name = socket.user.name

        const gameQuery = {name: game}
        const gameDocument = await Game.findOne(gameQuery)
            .exec()
        if(!gameDocument)
            return
        if(gameDocument.isActive)
            return
        if(gameDocument.isFinished)
            return
        if(gameDocument.X === null || gameDocument.O === null)
            return
        if(gameDocument.X !== user_name && gameDocument.O !== user_name)
            return

        gameDocument.isActive = true
        await gameDocument.save()
        const polishedGame: GameInResponseType = {
            id: gameDocument._id.toString(),
            name: gameDocument.name,
            board: gameDocument.board,
            currentTurn: gameDocument.currentTurn,
            turn: gameDocument.turn,
            X: gameDocument.X,
            O: gameDocument.O,
            isActive: gameDocument.isActive,
            isDraw: gameDocument.isDraw,
            isFinished: gameDocument.isFinished,
            winner: gameDocument.winner,
        }
        io.to(game).emit("gameStateChange", {game: polishedGame})
    }   
}

