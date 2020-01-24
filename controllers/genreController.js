var Genre = require("../models/genre");
var Session = require("../models/session");
var async = require("async");

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Display list of all Genre.
function genre_list(req, res, next) {
  Genre.find()
    .sort([["name", "ascending"]])
    .exec(function(err, list_genres) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      //   res.render('genre_list', { title: 'Genre List', list_genres:  list_genres, idi:res.idi});
      res.send({ title: "Genre List", list_genres: list_genres, idi: res.idi });
    });
};

// Display detail page for a specific Genre.
function genre_detail(req, res, next) {
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_sessions: function(callback) {
        Session.find({ genre: req.params.id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        var err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_sessions: results.genre_sessions
      });
    }
  );
};

// Display Genre create form on GET.
function genre_create_get(req, res, next) {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
genre_create_post = [
  // Validate that the name field is not empty.
  body("name", "Genre name required")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize (trim) the name field.
  sanitizeBody("name").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array()
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec(function(err, found_genre) {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save(function(err) {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  }
];

// Display Genre delete form on GET.
function genre_delete_get(req, res, next) {
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_sessions: function(callback) {
        Session.find({ genre: req.params.id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        res.redirect("/exec/genres");
      }
      // Successful, so render.
      res.render("genre_delete", {
        title: "Delete Genre",
        genre: results.genre,
        genre_sessions: results.genre_sessions
      });
    }
  );
};

// Handle Genre delete on POST.
function genre_delete_post(req, res, next) {
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_sessions: function(callback) {
        Session.find({ genre: req.params.id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.genre_sessions.length > 0) {
        // Genre has sessions. Render in same way as for GET route.
        res.render("genre_delete", {
          title: "Delete Genre",
          genre: results.genre,
          genre_sessions: results.genre_sessions
        });
        return;
      } else {
        // Genre has no sessions. Delete object and redirect to the list of genres.
        Genre.findByIdAndRemove(req.body.id, function deleteGenre(err) {
          if (err) {
            return next(err);
          }
          // Success - go to genres list.
          res.redirect("/exec/genres");
        });
      }
    }
  );
};

// Display Genre update form on GET.
function genre_update_get(req, res, next) {
  Genre.findById(req.params.id, function(err, genre) {
    if (err) {
      return next(err);
    }
    if (genre == null) {
      // No results.
      var err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("genre_form", { title: "Update Genre", genre: genre });
  });
};

// Handle Genre update on POST.
genre_update_post = [
  // Validate that the name field is not empty.
  body("name", "Genre name required")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize (escape) the name field.
  sanitizeBody("name").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request .
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data (and the old id!)
    var genre = new Genre({
      name: req.body.name,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("genre_form", {
        title: "Update Genre",
        genre: genre,
        errors: errors.array()
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function(
        err,
        thegenre
      ) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to genre detail page.
        res.redirect(thegenre.url);
      });
    }
  }
];

module.exports = {
  genre_list,
  genre_detail,
  genre_create_get,
  genre_create_post,
  genre_delete_get,
  genre_delete_post,
  genre_update_get,
  genre_update_post,
}