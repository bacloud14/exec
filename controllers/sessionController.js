var Session = require("../models/session");
var Author = require("../models/author");
var Genre = require("../models/genre");
var execution = require("../models/execution");
var mongoose = require("mongoose");

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

var async = require("async");
async function getUser(session_id) {
  return await Author.find({ uid: session_id }, "uid").exec();
}
async function getGenre(genre_name) {
  return await Genre.find({ name: genre_name }).exec();
}
async function create_session(req) {
  // Extract the validation errors from a request.
  // Create a Session object with escaped and trimmed data.
  getUser(req.session.id).then(function(result) {
    var uid = result[0]._id;
    const newId = new mongoose.Types.ObjectId(uid);
    var session = new Session({
      title: "title",
      author: newId,
      summary: "summary"
    });

    // Data from form is valid. Save session.
    session.save(function(err) {
      if (err) {
        console.log(err);
      }
      // Successful - redirect to new session record.
    });
  });
}
//renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
function index(req, res) {
  async.parallel(
    {
      session_count: function(callback) {
        Session.count(callback);
      },
      execution_count: function(callback) {
        execution.count(callback);
      },
      execution_running_count: function(callback) {
        execution.count({ status: "Running" }, callback);
      },
      author_count: function(callback) {
        Author.count(callback);
      },
      genre_count: function(callback) {
        Genre.count(callback);
      }
    },
    function(err, results) {
      res.render("index", {
        title: "Code execution report Home",
        error: err,
        data: results,
        _uid: req.session.id
      });
    }
  );
};
//sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Display list of all sessions.
function session_list(req, res, next) {
  getUser(req.session.id).then(function(result) {
    var uid = result[0]._id;
    const newId = new mongoose.Types.ObjectId(uid);
    Session.find({ author: newId }, "title author")
      .populate("author")
      .exec(function(err, list_sessions) {
        if (err) {
          return next(err);
        } else {
          // Successful, so render
          if (req.headers["user-agent"] == "python-requests/2.18.4")
            res.send(list_sessions);
          else
            res.render("session_list", {
              title: "Session List",
              session_list: list_sessions
            });
          // res.send({ title: "Session List", session_list: list_sessions });
        }
      });
  });
};
// sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Display detail page for a specific session.
function session_detail(req, res, next) {
  async.parallel(
    {
      session: function(callback) {
        Session.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      execution: function(callback) {
        execution.find({ session: req.params.id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.session == null) {
        // No results.
        var err = new Error("Session not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      if (req.headers["user-agent"] == "python-requests/2.18.4")
        res.send({
          title: "Title",
          session: results.session,
          session_executions: results.execution
        });
      else
        res.render("session_detail", {
          title: "Title",
          session: results.session,
          session_executions: results.execution
        });
    }
  );
};

//renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Display session create form on GET.
async function session_create_get(req, res, next) {
  create_session(req).then(function(res) {
    console.log("inserted");
  });
  // Get all authors and genres, which we can use for adding to our session.
  async.parallel(
    {
      genres: function(callback) {
        Genre.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      res.render("session_form", {
        title: "Create Session",
        genres: results.genres 
      });
    }
  );
};

// sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Handle session create on POST.
session_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body("title", "Title must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("summary", "Summary must not be empty.")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields.
  sanitizeBody("*").escape(),
  sanitizeBody("genre.*").escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    getUser(req.session.id).then(function(getUserResult) {
      getGenre(req.body.genre).then(function(getGenreResult) {
        var uid = getUserResult[0]._id;
        var gid = getGenreResult[0]._id;

        const newId = new mongoose.Types.ObjectId(uid);
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Session object with escaped and trimmed data.
        var session = new Session({
          title: req.body.title,
          author: newId,
          summary: req.body.summary,
          genre: gid
        });

        if (!errors.isEmpty()) {
          return;
        } else {
          // Data from form is valid. Save session.
          session.save(function(err) {
            if (err) {
              return next(err);
            }
            // Successful - redirect to new session record.
            if (req.headers["user-agent"] == "python-requests/2.18.4")
              res.send(session);
            else res.redirect(session.url);
          });
        }
      });
    });
  }
];

//renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Display session delete form on GET.
function session_delete_get(req, res, next) {
  async.parallel(
    {
      session: function(callback) {
        Session.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      session_executions: function(callback) {
        execution.find({ session: req.params.id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.session == null) {
        // No results.
        res.redirect("/exec/sessions");
      }
      // Successful, so render.
      res.render("session_delete", {
        title: "Delete Session",
        session: results.session,
        session_executions: results.session_executions
      });
    }
  );
};

//renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Handle session delete on POST.
function session_delete_post(req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).

  async.parallel(
    {
      session: function(callback) {
        Session.findById(req.body.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      session_executions: function(callback) {
        execution.find({ session: req.body.id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.session_executions.length > 0) {
        // Session has session_executions. Render in same way as for GET route.
        res.render("session_delete", {
          title: "Delete Session",
          session: results.session,
          session_executions: results.session_executions
        });
        return;
      } else {
        // Session has no execution objects. Delete object and redirect to the list of sessions.
        Session.findByIdAndRemove(req.body.id, function deleteSession(err) {
          if (err) {
            return next(err);
          }
          // Success - got to sessions list.
          res.redirect("/exec/sessions");
        });
      }
    }
  );
};

// renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Display session update form on GET.
function session_update_get(req, res, next) {
  // Get session, authors and genres for form.
  async.parallel(
    {
      session: function(callback) {
        Session.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      genres: function(callback) {
        Genre.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.session == null) {
        // No results.
        var err = new Error("Session not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (
        var all_g_iter = 0;
        all_g_iter < results.genres.length;
        all_g_iter++
      ) {
        for (
          var session_g_iter = 0;
          session_g_iter < results.session.genre.length;
          session_g_iter++
        ) {
          if (
            results.genres[all_g_iter]._id.toString() ==
            results.session.genre[session_g_iter]._id.toString()
          ) {
            results.genres[all_g_iter].checked = "true";
          }
        }
      }
      res.render("session_form", {
        title: "Update Session",
        genres: results.genres,
        session: results.session
      });
    }
  );
};

// renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Handle session update on POST.
session_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body("title", "Title must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("summary", "Summary must not be empty.")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields.
  sanitizeBody("title").escape(),
  sanitizeBody("summary").escape(),
  sanitizeBody("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    getUser(req.session.id).then(function(result) {
      var uid = result[0]._id;
      const newId = new mongoose.Types.ObjectId(uid);
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Session object with escaped/trimmed data and old id.
      var session = new Session({
        title: req.body.title,
        author: newId,
        summary: req.body.summary,
        genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
        _id: req.params.id // This is required, or a new ID will be assigned!
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors and genres for form
        async.parallel(
          {
            genres: function(callback) {
              Genre.find(callback);
            }
          },
          function(err, results) {
            if (err) {
              return next(err);
            }

            // Mark our selected genres as checked.
            for (let i = 0; i < results.genres.length; i++) {
              if (session.genre.indexOf(results.genres[i]._id) > -1) {
                results.genres[i].checked = "true";
              }
            }
            res.render("session_form", {
              title: "Update Session",
              genres: results.genres,
              session: session,
              errors: errors.array()
            });
          }
        );
        return;
      } else {
        // Data from form is valid. Update the record.
        Session.findByIdAndUpdate(req.params.id, session, {}, function(
          err,
          thesession
        ) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to session detail page.
          res.redirect(thesession.url);
        });
      }
    });
  }
];

module.exports = {
  index,
  session_list,
  session_detail,
  session_create_get,
  session_create_post,
  session_delete_get,
  session_delete_post,
  session_update_get,
  session_update_post,
}