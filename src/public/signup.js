import http, { Method } from 'https://cdn.skypack.dev/@easytool/http'

const register = () => {
  const domForm = document.getElementById('signup')
  const usernameInput = document.getElementById('username')
  const passwordInput = document.getElementById('password')
  const retypePasswordInput = document.getElementById('retype_password')
  const emailInput = document.getElementById('email')
  domForm.addEventListener('submit', async(submitEvent) => {
    submitEvent.preventDefault()
    const username = usernameInput.value
    const password = passwordInput.value
    const retype_password = retypePasswordInput.value
    const email = emailInput.value
    if(username === '') {
      M.toast({ html: 'Username field can not be empty!' })
      return 0
    }
    if(password === '') {
      M.toast({ html: 'Password field can not be empty!' })
      return 0
    }
    if(retype_password === '') {
      M.toast({ html: 'Retype password field can not be empty!' })
      return 0
    }
    if(email === '') {
      M.toast({ html: 'Email field can not be empty!' })
      return 0
    }
    if(password !== retype_password) {
      M.toast({ html: 'Passwords don\'t match!' })
      return 0
    }
    http({
      baseURL: 'http://localhost:8080',
      url: '/user/register',
      method: Method.POST,
      data: {
        username,
        password,
        email
      },
      afterResponse(resolve, reject, response) {
        const { data, status } = response
        if(status == 200) {
          return resolve(data)
        }
        return reject(response)
      },
      onError(errorObject) {
        M.toast({ html: errorObject.response.data })
      }
    }).catch(error => console.log(error))
  })
}

window.onload = async() => {
  register()
  M.updateTextFields()
}
