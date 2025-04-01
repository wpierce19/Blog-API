import {body, validationResult} from "express-validator";
import asyncHandler from "express-async-handler";
import {PrismaClient} from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import passport from "../config/passport.js";

const prisma = new PrismaClient();
const validateSignup = [
    body("email")
        .trim()
        .toLowerCase()
        .custom(async(value) => {
            const user = await prisma.user.findUnique({
                where : {
                    email: value,
                },
            });
            if (user) {
                throw new Error("Email already exists. Please try a different one");
            }
        }),
        body("name")
        .trim()
];

const userSignUp = [
    validateSignup,
    asyncHandler(async (req,res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation errors:", errors.array());
            return res.status(409).send({errors: errors.array()});
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await prisma.user.create({
            data: {...req.body, password: hashedPassword}
        });
        res.sendStatus(200);

    })
];

const userLogin = (req,res,next) => {
    passport.authenticate("local", {session: false}, (err, user, info) => {
        if (err) return res.status(400). send({err});
        if (!user) {
            return res.status(400).send({err: info.message});
        }
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
        return res.send({token});
    })(req,res, next);
};

export default {
    userLogin,
    userSignUp,
};