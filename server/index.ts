import express from 'express'
import cors from 'cors';
import { indexRouter } from './routes/index.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', indexRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Sever is running on port: ${PORT}`);
})