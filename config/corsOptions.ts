import type { CorsOptions } from "cors";

import allowedOrigins from "./allowedOrigins";

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if(!origin || allowedOrigins.includes(origin))
            callback(null, true)
        else callback(new Error("Not allowed by CORS policy."))
    },
    credentials: true
}

export default corsOptions