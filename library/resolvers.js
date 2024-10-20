const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken")

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

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
    me: async (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if(!currentUser) {
        throw new GraphQLError('not autheticated', {
          extensions: {
            coder: 'BAD_USER_INPUT',
          }
        })
      }
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

      const newBook = Book.findById(book._id).populate("author")
  
      pubsub.publish('BOOK_ADDED', { bookAdded: newBook })

      return newBook 

    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if(!currentUser) {
        throw new GraphQLError('not autheticated', {
          extensions: {
            coder: 'BAD_USER_INPUT',
          }
        })
      }

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
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })        
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
};

module.exports = resolvers;
