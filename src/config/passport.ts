import jwtSecret from './jwtConfig.js'
import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy as JWTstrategy } from 'passport-jwt'
import { ExtractJwt as ExtractJWT } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import { v4 as uuidv4 } from 'uuid'
import { User, saveUser, getUserByUsername } from '../helpers/db_utils.js'

const BCRYPT_SALT_ROUNDS = 12

passport.use(
  'register',
  new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: false
  },
  (username, password, done) => {
    try {
      const user: User | undefined = getUserByUsername(username)
      if(user) {
        console.log('username already taken!')
        return done(null, false, { message: 'username already taken' })
      } else {
        bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then(hashedPassword => {
          try {
            const newUser: User = {
              id: uuidv4(),
              username,
              password: hashedPassword,
              email: 'dummy@dummy.com'
            }
            saveUser(newUser)
            return done(null, newUser)
          } catch(err) {
            return done(null, false, { message: 'something went wrong on DB' })
          }
        })
      }
    } catch(err) {
      done(err)
    }
  })
)

passport.use(
  'login',
  new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: false
  },
  (username, password, done) => {
    try {
      const user: User | undefined = getUserByUsername(username)

      if(user) {
        bcrypt.compare(password, user.password).then(response => {
          if(response) {
            console.log('user found & authenticated')
            return done(null, user)
          }
          console.log('passwords do not match')
          return done(null, false, { message: 'passwords do not match' })
        })
      } else {
        console.log('bad username')
        return done(null, false, { message: 'bad username' })
      }
    } catch(err) {
      done(err)
    }
  })
)

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: jwtSecret.secret
}

passport.use(
  'jwt',
  new JWTstrategy(opts, (jwtPayload, done) => {
    try {
      const user: User | undefined = getUserByUsername(jwtPayload.id)
      if(user) {
        console.log('user found in db')
        return done(null, user)
      } else {
        console.log('user not found in db')
        return done(null, false, { message: 'user not found in db' })
      }
    } catch(err) {
      done(err)
    }
  })
)
