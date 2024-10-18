import { gql, useMutation } from "@apollo/client"
import Notify from "./Notify"
import { useState } from "react"

const LOGIN = gql(`
  mutation getToken($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value 
    }
  }
`)


const Login = (props) => {
  const [ getToken ] = useMutation(LOGIN)
  const [ notification, setNotification ] = useState(null)

  if(!props.show) {
    return null
  }

  async function submitLogin(event) {
    event.preventDefault();
    const name = event.target.name.value
    const password = event.target.password.value

    if(!name || !password) {
      return; 
    }

    try {
      const response = await getToken({ variables: { username: name, password }})
      
      props.setToken(response.data.login.value)
      props.setPage("authors")
    } catch (error) {
      setNotification(error.message)
      setTimeout(() => setNotification(null), 5000)
    }

  }

  return (
    <form onSubmit={submitLogin}>
      <div>
        <label htmlFor="name">name</label>
        <input id="name" name="name" type="text" />
      </div>
      <div>
        <label htmlFor="password">password</label>
        <input id="password" name="password" type="password"/>
      </div>
      <button type="submit">login</button>
      <Notify notification={notification}/>
    </form>
  )
}

export default Login
