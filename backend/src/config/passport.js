const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;

        let user = await User.findOne({ where: { google_id: profile.id } });

        if (!user && email) {
          user = await User.findOne({ where: { email } });
          if (user && !user.google_id) {
            user.google_id = profile.id;
            await user.save();
          }
        }

        if (!user) {
          // SPEC §5(3): jika belum ada, buat user baru dengan role default pemilik.
          user = await User.create({
            nama: profile.displayName || email || 'Pengguna Google',
            email: email || null,
            google_id: profile.id,
            role: 'pemilik',
          });
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
