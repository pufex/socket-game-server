import mongoose from "mongoose"

export type UserType = {
    name: string,
    password: string,
    game_name: string | null,
}

export type UserPayload = {
    name: string,
    password: string,
}

export type UserInTokenPayload = Omit<UserType, "password"> & {id: string}

const UserSchema = new mongoose.Schema<UserType>({
    name: {
        type: String,
        required: true,
        unique: true,
        min: 6,
        max: 30
    },
    password: {
        type: String,
        required: true,
    },
    game_name: {
        type: String,
        default: null
    },
})

const UserModel = mongoose.model("User", UserSchema)

export default UserModel