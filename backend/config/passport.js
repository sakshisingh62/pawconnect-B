// // backend/config/passport.js

// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/User'); // Your existing User model

// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             // Google will redirect the user to this URL after consent
//             callbackURL: '/api/auth/google/callback', 
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             const newUser = {
//                 googleId: profile.id,
//                 name: profile.displayName,
//                 email: profile.emails[0].value, // Google guarantees at least one email
//                 // Note: Phone number is NOT provided by Google OAuth
//                 // imageUrl: profile.photos[0].value, 
//             };

//             try {
//                 let user = await User.findOne({ email: newUser.email });

//                 if (user) {
//                     // User already exists, log them in
//                     done(null, user);
//                 } else {
//                     // User does not exist, create a new account
//                     user = await User.create(newUser);
//                     done(null, user);
//                 }
//             } catch (err) {
//                 console.error(err);
//                 done(err, null);
//             }
//         }
//     )
// );

// // Passport serialization/deserialization (needed for session handling)
// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//     User.findById(id).then(user => done(null, user));
// });

// module.exports = passport;