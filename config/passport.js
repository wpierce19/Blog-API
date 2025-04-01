import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

passport.use(
        new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async (email,password,done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        email: email.toLowerCase(),
                    },
                });
                if (!user) {
                    return done(null, false, {message: "Email Not Found"});
                }
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return done(null, false, {message: "Incorrect Password"});
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

export default passport;