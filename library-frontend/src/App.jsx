import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Notify from "./components/Notify";

import { useSubscription } from "@apollo/client";
import { BOOK_ADDED, GET_BOOKS } from "./queries"
import RecommendedBooks from "./components/RecommendedBooks";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(localStorage.getItem("user-token"));
  const [notification, setNotification] = useState(null)

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client}) => {
      console.log("subscription:", data);
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

  function logout() {
    setToken(null)
    localStorage.removeItem("user-token")
  }


  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>

        {!token && <button onClick={() => setPage("login")}>login</button>}
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={() => setPage("recommended")}>recommended</button>}
        {token && <button onClick={logout}>logout</button>}
      </div>

      <Notify notification={notification}/>

      <Authors show={page === "authors"} token={token} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} token={token} />

      <RecommendedBooks show={page === "recommended"} />


      <Login show={page === "login"} setToken={setToken} setPage={setPage} />
    </div>
  );
};

export default App;
