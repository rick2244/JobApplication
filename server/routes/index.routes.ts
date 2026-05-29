import express, {type Request, Response, Router} from 'express';
import {getIndex, addUser, signIn, verifyUser} from '../controllers/index.controllers';

export const indexRouter: Router = express.Router();


indexRouter.get('/', getIndex);

indexRouter.get('/verify/:token', verifyUser);

indexRouter.post('/addUser', addUser);

indexRouter.post('/signIn', signIn);



