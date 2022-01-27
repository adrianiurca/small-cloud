import { Router } from 'express'
import passport from 'passport'
const menuRouter = Router()

menuRouter.get('/', (req, res, next) => passport.authenticate(
  'jwt', { session: false }, (err, _user, info) => {
    const menu = {
      isAuthenticated: [
        {
          href: '/',
          label: 'Home'
        },
        {
          href: '/dashboard',
          label: 'Dashboard'
        },
        {
          href: '/templates',
          label: 'Templates'
        },
        {
          href: '/profile',
          label: 'Profile'
        }
      ],
      notAuthenticated: [
        {
          href: '/',
          label: 'Home'
        },
        {
          href: '/auth',
          label: 'Log In'
        }
      ]
    }
    if(err) {
      console.log(err)
    }
    if(info) {
      console.log(info.message)
      res.status(200).json({
        auth: false,
        menu: menu.notAuthenticated
      })
    } else {
      res.status(200).json({
        auth: true,
        menu: menu.isAuthenticated
      })
    }
  })(req, res, next))

export default menuRouter
