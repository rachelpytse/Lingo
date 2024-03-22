import { auth } from "@clerk/nextjs"

const adminIds = [
    "user_2dtv64T9Me6qTYVumKxM0DlqJ4P",
]

export const isAdmin = () => {
    const {userId} = auth()

    if(!userId) {
        return false
    }

    return adminIds.indexOf(userId) !== -1
}