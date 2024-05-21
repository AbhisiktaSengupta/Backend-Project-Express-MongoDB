import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js"
dotenv.config({
    path: './.env'
})
connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("An error occurred within your Express application : ",error);
        })
        const port = process.env.PORT || 8000;
        app.listen(port || 8000, () => {
            console.log(`Server is running at port :${port}`);
        });
        
})
.catch((err)=>{
    console.log("MONGODB connection failed");
})
