import { gql, useQuery } from "@apollo/client"
import EditAuthor from "./EditAuthor"

const GET_AUTHORS = gql(`
  query getAuthors {
    allAuthors {
      id
      name 
      born 
      bookCount 
    }
  }
`)

const Authors = (props) => {
  const { loading, error, data } = useQuery(GET_AUTHORS, {
    pollInterval: 3000,
  })
  if (!props.show) {
    return null
  }

  if(loading) return <p>loading...</p>
  if(error) return <p>Error: {error.message}</p>


  const authors = data.allAuthors; 

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {props.token && 
        <div>
          <h2>set birthyear</h2>
          <EditAuthor authors={authors} token={props.token} />
        </div>
      }

    </div>
  )
}

export default Authors
