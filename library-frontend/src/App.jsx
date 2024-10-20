import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";

import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { BOOK_ADDED, GET_BOOKS } from "./queries"

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null)

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client}) => {
      const addedBook = data.data.bookAdded;

      notify(`${addedBook.title} added`)

      client.cache.updateQuery({query: GET_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(addedBook)
        }
      })
    }
  })

  function notify(notification) {
    setNotification(notification)
    setTimeout(() => setNotification(null), 5000)
  }


  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {!token && <button onClick={() => setPage("login")}>login</button>}
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={() => setToken(null)}>logout</button>}
      </div>

      <Notify notification={notification}/>

      <Authors show={page === "authors"} token={token} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} token={token} />


      <Login show={page === "login"} setToken={setToken} setPage={setPage} />
    </div>
  );
};

export default App;
