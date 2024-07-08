import type { 
    IoType, 
    SocketType, 
    MessageType, 
} from "../types"
import type { GameInResponseType } from "../../db/games/model"
import User from "../../db/users/model"
import Game from "../../db/games/model"
import { selectPlayerRandomly } from "../../db/games/helpers"
import { defaultBoard } from "../../db/games/constants"

export const handleDisconnected = (
    io: IoType,
    socket: SocketType
) => {
    return async () => {
        if(!socket.user) 
            return

        const id = socket.user.id
        const user = await User.findById(id)
            .exec()
        if(!user) 
            return

        const game_name = user.game_name
        if(!game_name)
            return

        user.game_name = null
        await user.save()

        const gameQuery = {name: game_name}
        const gameDocument = await Game.findOne(gameQuery)
            .exec()
        if(!gameDocument) return

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

        const usersInRoomQuery = {game_name}
        const usersInRoom = await User.find(usersInRoomQuery)
            .lean().exec()
        const usernames = usersInRoom.map(user => user.name)

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
            io.to(game_name).emit("giveTheList", {users: usernames})
            io.to(game_name).emit("giveMessage", {message: messageObj})
            io.to(game_name).emit("gameStateChange", {game: polishedGame})
        }
    }
}