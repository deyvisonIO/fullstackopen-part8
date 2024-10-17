const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");
const { GraphQLError } = require("graphql");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const Book = require("./models/book");
const Author = require("./models/author");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connection Established"))
  .catch((error) =>
    console.log("Couldn't establish connection with database:", error.message),
  );

const typeDefs = `
  type Author {
    name: String!
    id: String!
    born: Int 
  }
  type AuthorWithBookCount {
    name: String!
    id: String!
    born: Int 
    bookCount: Int!
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: String!
    genres: [String!]!
  }
  type Query {
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    authorCount: Int! 
    allAuthors: [AuthorWithBookCount!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        const booksByAuthorWithGenre = await Book.find({
          author: { name: args.author },
          genres: args.genre,
    }).populate("author");
        return booksByAuthorWithGenre;
      }
      if (args.author) {
        const booksByAuthor = await Book.find({
          author: { name: args.author },
        }).populate("author");
        return booksByAuthor;
      }

      if (args.genre) {
        const booksWithGenre = await Book.find({ genres: args.genre }).populate("author");
        return booksWithGenre;
      }
      return Book.find({}).populate("author");
    },
    authorCount: async () => Author.collection.countDocuments(),
    allAuthors: async () => {
      const authors = await Author.find({})
      const authorsWithBookCount = await Promise.all(authors.map(async (author) => {
        const bookCount = await Book.collection.countDocuments({ author: author._id })
        author.bookCount = bookCount
        return author
      }))
      return authorsWithBookCount
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const isBookInDatabase = await Book.findOne({ title: args.title });
      if (isBookInDatabase) {
        throw new GraphQLError("Title must be unique", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
          },
        });
      }

      const book = new Book({ ...args });

      try {
        const isAuthorInDatabase = await Author.findOne({ name: args.author });

        if (isAuthorInDatabase) {
          book.author = isAuthorInDatabase._id
        } else {
          const author = new Author({ name: args.author });
          await author.save();
          book.author = author._id
        }
      } catch (error) {
        throw new GraphQLError("Saving book's author failed", {
          extensions: { code: "BAD_USER_INPUT", invalidArgs: args.name, error },
        });
      }

      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError("Saving book failed", {
          extensions: { code: "BAD_USER_INPUT", invalidArgs: args.name, error },
        });
      }
  
      return Book.findById(book._id).populate("author")

    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }
      author.born = args.setBornTo;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError("Saving author failed", {
          extensions: { code: "BAD_USER_INPUT", invalidArgs: args.name, error },
        });
      }

      return author; 
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
