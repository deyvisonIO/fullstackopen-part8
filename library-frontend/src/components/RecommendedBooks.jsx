import { gql, useQuery } from "@apollo/client"
import { GET_BOOKS } from "../queries"

const FAVORITE_GENRE = gql(`
  query {
    me {
      favoriteGenre 
    }
  }
`)

const RecommendedBooks = (props) => {
  const { loading: loadingFavoriteGenre, error: errorFavoriteGenre, data: favoriteGenre} = useQuery(FAVORITE_GENRE)
  const { loading: loadingAllBooks, error: errorAllBooks, data: allBooks } = useQuery(GET_BOOKS)

  if(!props.show) {
    return null
  }

  if(loadingFavoriteGenre|| loadingAllBooks) return <p>loading...</p>
  if(errorFavoriteGenre || errorAllBooks) return <p>Error: {errorFavoriteGenre?.message || errorAllBooks?.message}</p>


  const books = allBooks?.allBooks;

  console.log(books)
  console.log(favoriteGenre)

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
          {books.filter(i => i.genre === favoriteGenre.me.favoriteGenre).map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

}

export default RecommendedBooks
