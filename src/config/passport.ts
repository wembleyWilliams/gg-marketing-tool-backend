import {findUser} from "../database";
import {is} from "cheerio/lib/api/traversing";

const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')

const strategy = (passport: any)=>{
  passport.use(
    new LocalStrategy({usernameField: 'email'},(email: any, password: any, done: any)=>{
      //Match User
      findUser(email)
        .then((user)=>{
          if(!user){
            return done(null, false, {message: 'Email is not registered'})
          }else {
            
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
}