import { useQuery } from "@apollo/client"
import { useState } from "react"
import { GET_BOOKS, GET_BOOKS_BY_GENRE } from "../queries"

const Books = (props) => {
  const [genreFilter, setGenreFilter] = useState("")
  const { loading: loadingAllBooks, error: errorAllBooks, data: allBooks, refetch: refetchGenres } = useQuery(GET_BOOKS)
  const { loading: loadingFilteredBooks, error: errorFilteredBooks, data: filteredBooks } = useQuery(GET_BOOKS_BY_GENRE, {
    variables: { genre: genreFilter }
  })

  if (!props.show) {
    return null
  }

  if(loadingAllBooks || loadingFilteredBooks) return <p>loading...</p>
  if(errorAllBooks || errorFilteredBooks) return <p>Error: {errorAllBooks?.message || errorFilteredBooks?.message}</p>


  const books = filteredBooks?.allBooks;
  const genres = [...new Set(allBooks.allBooks.map(book => book.genres).flat(Infinity))]

  console.log(books)

  return (
    <div>
      <h2>books</h2>
      
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map(genre => <button key={genre} onClick={() => {
          setGenreFilter(genre)
          refetchGenres()
        }}>{genre}</button>)}
        <button onClick={() => {
          setGenreFilter("")
          refetchGenres()
        }}>all genres</button>
      </div>
    </div>
  )
}

export default Books
