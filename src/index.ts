require("dotenv").config();
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { connectDB } from "./db";
import generateVideo from './routes/'

const app = express();

app.use(cors({
    origin: '*',  // In production, specify your frontend domain instead of '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    credentials: true,
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));



app.use(express.json())
app.use(bodyParser.json());

console.log('db',process.env.MONGO_URI)
connectDB(process.env.MONGO_URI as string);

app.get('/',(req,res)=>{
    res.send("Hello World")
})


app.use('/api/v1', generateVideo)


app.listen(3000,()=>{
    console.log(`Sever is running on port ${3000}`)
});
