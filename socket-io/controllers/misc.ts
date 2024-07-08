import type { 
    IoType, 
    SocketType, 
    AskForListPayload, 
    AskToSendMessagePayload,
    MessageType
} from "../types"
import User from "../../db/users/model"
import Game from "../../db/games/model"

export const handleUserList = (
    io: IoType,
    socket: SocketType
) => {
    return async ({game}: AskForListPayload) => {
        const usersInGameQuery = {game_name: game}
        const usersInGame = await User.find(usersInGameQuery)
            .lean().exec()
        const usernames = usersInGame.map(user => user.name)
        socket.emit("giveTheList", {users: usernames})
    }
}

export const handleSendingMessage = (
    io: IoType,
    socket: SocketType
) => {
    return async ({message, game}: AskToSendMessagePayload) => {
        
        if(!socket.user)
            return socket.emit("messageNotSent")

        const user_name = socket.user.name
        
        const gameQuery = {name: game}
        const gameDocument = await Game.findOne(gameQuery)
            .lean().exec()
        if(!gameDocument)
            return socket.emit("messageNotSent")

        const timestamp = new Date();
        const messageObj: MessageType = {
            timestamp,
            message,
            name: user_name,
            isAdmin: false
        }
        socket.emit("messageSent")
        io.to(game).emit("giveMessage", {message: messageObj})
    }
}