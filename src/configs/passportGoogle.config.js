const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL_GOOGLE,
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, done) => {
      console.log(profile);
      console.log(refreshToken);
      console.log(accessToken);
      req.profile = profile;
      done(null, profile);
    }
  )
);
