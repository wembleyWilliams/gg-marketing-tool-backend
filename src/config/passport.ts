import {findUser} from "../database";
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')

module.exports = () => {
 passport.use(
    new LocalStrategy(({
      usernameField: 'email',
      passwordField: 'password'
    }),(email: any, password: any, done: any)=>{
      //Match User
      findUser(email)
        .then((user)=>{
          if(!user){
            return done(null, false, {message: 'Email is not registered'})
          }else {
            //Match password
            bcrypt.compare(password,user.password,(err: any, isMatch: boolean) =>{
              if(err){
                throw err
              }
              if(isMatch){
                return done(null, user)
              }else {
                done(null, false, {message: 'Password incorrect'});
              }
            })
          }
        })
        .catch((err: any)=>{
          console.log(err)
        })
    })
  )
  //
  passport.serializeUser((user: any, done: any) =>{
    done(null, user.email);
  });

  passport.deserializeUser((user: any, done: any) =>  {
    findUser(user.email)
      .then((user)=>{
        done(null, user)
      })
      .catch((err: any) => {
        done(err, user)
      })
  });
}
