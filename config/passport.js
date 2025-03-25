const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcryptjs");

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await Prisma.user.findUnique({where: {username}});
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