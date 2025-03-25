import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await prisma.user.findUnique({where: {username}});
            if (!user) return done(null, false, {message: 'Incorrect Username'});
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return done(null, false, {message: 'Incorrect Password'});
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

export default passport;