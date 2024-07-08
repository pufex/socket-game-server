import type { 
    IoType, 
    SocketType, 
    EnterGamePayload, 
    MessageType,
    AskToLeaveGamePayload
 } from "../types"
import type { GameInResponseType } from "../../db/games/model"
import Game from "../../db/games/model"
import User from "../../db/users/model"

import { defaultBoard } from "../../db/games/constants"
import { selectPlayerRandomly } from "../../db/games/helpers"

export const handleGameEnter = (
    io: IoType,
    socket: SocketType
) => {
    
    return async ({game}: EnterGamePayload) => {

        if(!socket.user)
            return socket.emit("enterGameError")

        const user_id = socket.user.id

        const gameQuery = {name: game}
        const gameDocument = await Game.findOne(gameQuery)
            .lean().exec()
        if(!gameDocument)
            return socket.emit("enterGameError")

        const user = await User.findById(user_id)
            .exec()
        if(!user)
            return socket.emit("enterGameError")

        if(user.game_name)
            socket.leave(user.game_name)

        user.game_name = game
        await user.save();

        const usersInRoomQuery = {game_name: game}
        const usersInRoom = await User.find(usersInRoomQuery)
            .lean().exec()
        const usernames = usersInRoom.map(user => user.name) 

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

        const messageObj: MessageType = {
            timestamp: new Date(),
            isAdmin: true,
            message: `User ${user.name} entered this game.`
        }
        
        socket.join(game)
        io.to(game).emit("giveTheList", {users: usernames})
        io.to(game).emit("giveMessage", {message: messageObj})
        socket.emit("enterGameSuccess", {game: polishedGame})
    }
}

export const handleLeavingGame = (
    io: IoType,
    socket: SocketType 
) => {
    return async ({game}: AskToLeaveGamePayload) => {
        
        if(!socket.user)
            return socket.emit("gameLeftError")

        const user_id = socket.user.id
        
        const user = await User.findById(user_id)
            .exec()
        if(!user)
            return socket.emit("gameLeftError")
        user.game_name = null
        await user.save()
        const gameQuery = {name: game}
        const gameDocument = await Game.findOne(gameQuery)
            .exec()
        if(!gameDocument){
            return socket.emit("gameLeftSuccess")
        }

        const {X,O} = gameDocument
        if(X === user.name || O === user.name){
            if(X === user.name) 
                gameDocument.X = null
            if(O === user.name)
                gameDocument.O = null
            
            if(gameDocument.isActive && !gameDocument.isFinished){
                gameDocument.isActive = false
                gameDocument.board = defaultBoard;
                gameDocument.turn = 0;
                gameDocument.currentTurn = selectPlayerRandomly()
            }
            await gameDocument.save()
        }

        const usersInRoomQuery = {game_name: game}
        const usersInRoom = await User.find(usersInRoomQuery)
            .lean().exec()
        const usernames = usersInRoom.map(user => user.name)
        
        socket.leave(game)
        if(usernames.length === 0){
            await gameDocument.deleteOne()
        }else{
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
            const messageObj: MessageType = {
                timestamp: new Date(),
                isAdmin: true,
                message: `User ${user.name} left this game.`
            }
            io.to(game).emit("giveTheList", {users: usernames})
            io.to(game).emit("giveMessage", {message: messageObj})
            io.to(game).emit("gameStateChange", {game: polishedGame})
        }
        socket.emit("gameLeftSuccess")
    }
}