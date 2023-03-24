import jwtSecret from './jwtConfig.js'
import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy as JWTstrategy, ExtractJwt as ExtractJWT } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import { v4 as uuidv4 } from 'uuid'
import { User, saveUser, getUserByUsername } from '../helpers/db_utils.js'
import LOG from '../helpers/log_utils.js'

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
        LOG('username already taken!')
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
            LOG('user found & authenticated')
            return done(null, user)
          }
          LOG('passwords do not match')
          return done(null, false, { message: 'passwords do not match' })
        })
      } else {
        LOG('bad username')
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
        LOG('user found in db')
        return done(null, user)
      } else {
        LOG('user not found in db')
        return done(null, false, { message: 'user not found in db' })
      }
    } catch(err) {
      done(err)
    }
  })
)
