import { gql } from "@apollo/client";

const BOOK_DETAILS = gql(`
  fragment bookDetails on Book { 
      title
      author {
        name
      }
      published
      genres
  }
`)


export const GET_AUTHORS = gql(`
  query getAuthors {
    allAuthors {
      id
      name 
      born 
      bookCount 
    }
  }
`)

export const GET_BOOKS = gql(`
  query getBooks {
    allBooks {
      genres
    }
  }
`)

export const GET_BOOKS_BY_GENRE = gql(`
  query getBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`)

export const LOGIN = gql(`
  mutation getToken($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value 
    }
  }
`)

export const CHANGE_AUTHOR = gql(`
  mutation changeAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name
      setBornTo: $setBornTo
    ) {
      name
      born
    }   
  }
`)

export const CREATE_BOOK = gql(`
  mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title
      published
      author {
        name
      }
      genres
      id
    }   
  }
`)

export const BOOK_ADDED = gql(`
  subscription {
    bookAdded {
      ...bookDetails
    }
  }

  ${BOOK_DETAILS}
`)
