var express = require("express");
var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var execRouter = require("./routes/exec"); //Import routes for "exec" area of site
var Author = require("./models/author");

var compression = require("compression");
var helmet = require("helmet");
const uuidv1 = require("uuid/v1");
const rateLimit = require("express-rate-limit");

var mongoose = require("mongoose");
var session = require("express-session");
const MongoStore = require("connect-mongo")(session);


var app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(compression()); // Compress all routes
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var mongoDB = "mongodb://localhost:27017/exec";
mongoose
  .connect(mongoDB, { useNewUrlParser: true })
  .catch(error => console.error(error));
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", function() {
  console.error.bind(console, "MongoDB connection error:");
  app.use(function(err, req, res, next) {
    res.render("error");
  });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
// Use the session middleware
app.use(
  session({
    secret: "exec 2020",
    cookie: { maxAge: 86400000 * 7 }, // 7 days
    genid: function(req) {
      return uuidv1(); // use UUIDs for session IDs
    },
    store: new MongoStore({
      mongooseConnection: db,
      dbName: "exec",
      // ttl: 14 * 24 * 60 * 60,
      collection: "cookies"
    })
  })
);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const general_limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 60 * 20, // limit each IP to 600 requests per windowMs
  message:
    "Access to the API is very transparent to be able to assure maximum benefit of the service without authentication, Therfore there is a limit of access to any page, please try again after an hour"
});
//  apply to all requests
app.use(general_limiter);
const create_ressource_limit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 30, // start blocking after 1 req / 2 minute requests
  message: "Too many calls creating ressources from this IP, please try again after an hour"
});
app.use(/.*create$/, create_ressource_limit);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle Author create on POST.
function fire_create_author(sess) {
  var now = new Date();
  var death = new Date();
  death.setDate(now.getDate() + 14);
  var author = new Author({
    uid: sess.id,
    date_of_birth: now,
    date_of_death: death
  });
  // Save author.
  author.save(function(err) {
    if (err) {
      return next(err);
    }
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use((req, res, next) => {
  if (typeof req.session.isNew === "undefined") {
    req.session.isNew = true;
    req.session.save(next);
    fire_create_author(req.session);
  } else if (req.session.isNew) {
    req.session.isNew = false;
    req.session.save(next);
  } else {
    next();
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/exec", execRouter); // Add exec routes to middleware chain.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
