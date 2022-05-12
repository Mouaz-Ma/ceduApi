if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}


// packeges
const createError = require('http-errors'),
          express = require('express'),
             path = require('path'),
             http = require('http'),
     cookieParser = require('cookie-parser'),
          session = require('express-session'),
           helmet = require("helmet"),
         passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
         mongoose = require('mongoose'),
    mongoSanitize = require('express-mongo-sanitize'),
           logger = require('morgan'),
              jwt = require('jsonwebtoken'),
          ejsMate = require('ejs-mate'),
               io = require("socket.io")(http),
             cors = require('cors');

// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const blogsRouter = require('./routes/blogs');
const universityRouter = require('./routes/university');

// error
const ExpressError = require('./utils/ExpressError');

const MongoDBStore = require("connect-mongo");

const dbUrl = process.env.DATABASE;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const app = express();

// view engine setup
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
  replaceWith: '_'
}))

const secret = process.env.SECRET;

const store =  MongoDBStore.create({ 
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(helmet());


// configure helmet later
// app.use(
//   helmet.contentSecurityPolicy({
//       directives: {
//           defaultSrc: [],
//           workerSrc: ["'self'", "blob:"],
//           objectSrc: [],
//           imgSrc: [
//               "'self'",
//               "blob:",
//               "data:",
//               "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//               "https://images.unsplash.com/",
//           ],
//       },
//   })
// );


app.use(passport.initialize());
app.use(passport.session());


app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/university', universityRouter);


  //  web sockets
  io.on("connect", function(socket) {
    console.log(`A user connected`);
  });

// catch 404 and forward to error handler
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


// Setting up the port for listening requests
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server at 5000"));
