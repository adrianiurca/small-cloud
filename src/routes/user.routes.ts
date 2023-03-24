import { Router } from 'express'
import { User, updateUser, getUserByUsername } from '../helpers/db_utils.js'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import jwtSecret from '../config/jwtConfig.js'
import LOG from '../helpers/log_utils.js'

const userRouter = Router()

userRouter.post('/register', (req, res, next) => passport.authenticate('register', (err, user, info) => {
  if(err) {
    LOG(err)
  }
  if(info) {
    LOG(info.message)
    if(info.message === 'username already taken') {
      res.status(409).send(info.message)
    }
    if(info.message === 'something went wrong on DB') {
      res.status(500).send(info.message)
    }
  } else {
    req.logIn(user, _err => {
      const foundUser: User | undefined = getUserByUsername(user.username)
      if(foundUser) {
        const data: Partial<User> = {
          id: foundUser.id,
          email: req.body.email
        }
        try {
          updateUser(data)
          LOG('user created in db')
          res.status(200).send({ message: 'user created!' })
        } catch(err) {
          LOG(err)
          res.status(500).send({ message: 'user could not be created' })
        }
      }
    })
  }
})(req, res, next))

userRouter.post('/login', (req, res, next) => passport.authenticate('login', (err, user, info) => {
  if(err) {
    LOG(err)
  }
  if(info) {
    LOG(info.message)
    res.status(401).send(info.message)
  } else {
    req.logIn(user, _err => {
      const foundUser = getUserByUsername(user.username)
      if(foundUser) {
        const token = jwt.sign({ id: user.username }, jwtSecret.secret, { expiresIn: '1h' })
        res.status(200).send({
          auth: true,
          username: user.username,
          token,
          message: 'user found & logged in'
        })
      }
    })
  }
})(req, res, next))

userRouter.get('/profile', (req, res, next) => passport.authenticate(
  'jwt', { session: false }, (err, user, info) => {
    if(err) {
      LOG(err)
    }
    if(info) {
      LOG(info.message)
      res.status(401).send(info.message)
    } else {
      LOG('user found in db from route')
      res.status(200).send({
        auth: true,
        user_profile: {
          username: user.username,
          email: user.email
        }
      })
    }
  })(req, res, next))

export default userRouter
