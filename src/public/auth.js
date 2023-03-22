import http, { Method } from 'https://cdn.skypack.dev/@easytool/http'

const login = () => {
  const usernameInput = document.getElementById('username')
  const passwordInput = document.getElementById('password')
  const domForm = document.getElementById('login')
  domForm.addEventListener('submit', async(submitEvent) => {
    submitEvent.preventDefault()
    const username = usernameInput.value
    const password = passwordInput.value
    http({
      baseURL: 'http://localhost:8080',
      url: '/user/login',
      method: Method.POST,
      data: { username, password },
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
    }).then(response => {
      localStorage.setItem('username', response.username)
      localStorage.setItem('token', response.token)
      window.location.replace('/')
    }).catch(error => console.log(error))
  })
}

window.onload = async() => {
  login()
  M.updateTextFields()
}
