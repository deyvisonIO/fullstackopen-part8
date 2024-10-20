import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { CHANGE_AUTHOR } from '../queries'

const EditAuthor = (props) => {
  const [author, setAuthor] = useState(props.authors[0].name || '')
  const [born, setBorn] = useState('')
  const [ changeAuthor ] = useMutation(CHANGE_AUTHOR, {
    context: {
      headers: {
        "Authorization": "Bearer " + props.token,
      }
    }
  })
  

  const submit = async (event) => {
    event.preventDefault()

    console.log("author:",author);
    console.log("born:",born)

    changeAuthor({ variables: { name: author, setBornTo: Number(born) }})

    setAuthor('')
    setBorn('')
  }

  if(!props.authors) {
    return null
  }

  return (
    <div>
      <form onSubmit={submit}>
        <select onChange={({ target }) => setAuthor(target.value)} >
          {props.authors.map(author => <option key={author.id} value={author.name}>{author.name}</option>)}
        </select>
        <div>
          born 
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default EditAuthor  
