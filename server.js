import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoutes.js'
import doctorRouter from './routes/doctorRoutes.js'
import userRouter from './routes/userRoutes.js'

//app config
const app = express()

// const port = process.env.PORT || 4000;
const port = process.env.PORT || 4000;


connectDB()
connectCloudinary()

//middlewares
const allowedOrigins = ['http://localhost:5173','http://localhost:5174','https://doctor-carebridge.vercel.app','https://doctor-carebridge-admin.vercel.app'];

app.use(express.json())
app.use(cors({origin:allowedOrigins,credentials:true}))
// app.use(cors())

//api endpoint
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

app.get('/',(req,res) => {
    res.send("API WORKING")
})

app.listen(port,() => {
    console.log("Server is Running at ",port)
})
