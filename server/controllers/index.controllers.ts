import {type Request, Response} from 'express';
import bcrypt from 'bcrypt';
import prisma from '../db.js';
import transporter from '../mailer.js';
import crypto from 'crypto'


type User = {
    email: string,
    password: string,
    createdAt: Date,
    id: number,
    verified: boolean,
    verificationToken: string | null
}

export const getIndex = (req: Request, res: Response):void => {
  res.send('Hello from the index controller!');
};

export const addUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, confirmPassword }: { email: string, password:string, confirmPassword:string } = req.body;

  if(!email || !password || !confirmPassword){
    res.status(400).send('All fields are required.');
    return;
  }

  const match = password === confirmPassword;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!match || !hasUpper || !hasLower || !hasNumber || !hasSpecial || !isLongEnough) {
    res.status(400).send('Passwords must meet all requirements');
    return;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const verificationToken = crypto.randomUUID();
  const user: User = await prisma.user.create({
    data: { email, password: hashedPassword, verificationToken}
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your Account!",
    html: `<p>Please click the link below to verify your account:</p>
           <a href="${process.env.FRONTEND_URL}/verify?token=${verificationToken}">Verify Account</a>`

  })
  

  res.status(201).json({ message: 'User created', userId: user.id });
};



export const signIn = async (req: Request, res: Response): Promise<void> => {
    const {email, password}: {email:string, password:string} = req.body;

    if(!email || !password){
        res.status(400).send("Email and password are required");
    }

    //find out if there is a user in my database that has that email
    //null will be returned if 
    const user: User | null = await prisma.user.findUnique({
        where: { email }
    });

    const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;

    if(!user || !passwordMatch){
        res.status(401).send("Invalid email or password");
        return;
    }

    if(!user.verified){
        res.status(403).send("Email address not verified");
        return;
    }

    console.log("User found:", user);

    res.status(200).send("Login is successful");

}

export const verifyUser = async (req: Request, res: Response): Promise<void> => {
    const token = req.query.token as string;

    if(!token){
        res.status(400).send("Verification token is required");
        return;
    }

    const user = await prisma.user.findFirst({
        where: { verificationToken: token }
    });

    if(!user){
        res.status(400).send("Error verifying email address");
        return;
    }
    //updating the data structure by the id, changing verfied to true, and verificationToken to null
    await prisma.user.update({
        where: {id: user.id},
        data: {verified: true, verificationToken: null}
    });

    res.status(200).send("Email address verified successfully");
}