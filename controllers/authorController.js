var Author = require("../models/author");
var async = require("async");
var Session = require("../models/session");

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Display list of all Authors.
function author_list(req, res, next) {
  Author.find().exec(function(err, list_authors) {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    //
    if (req.headers["user-agent"] == "python-requests/2.18.4")
      res.send({ title: "Author List", author_list: list_authors });
    else
      res.render("author_list", {
        title: "Author List",
        author_list: list_authors
      });
  });
};

// sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Display detail page for a specific Author.
function author_detail(req, res, next) {
  async.parallel(
    {
      author: function(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_sessions: function(callback) {
        Session.find({ author: req.params.id }, "title summary").exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      } // Error in API usage.
      if (results.author == null) {
        // No results.
        var err = new Error("Author not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      //
      if (req.headers["user-agent"] == "python-requests/2.18.4")
        res.send({
          title: "Author Detail",
          author: results.author,
          author_sessions: results.authors_sessions
        });
      else
        res.render("author_detail", {
          title: "Author Detail",
          author: results.author,
          author_sessions: results.authors_sessions
        });
    }
  );
};

// renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Display Author create form on GET.

function author_create_get(req, res, next) {
 res.render("author_form", { title: "Create Author" });
};

// sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Handle Author create on POST.
author_create_post = [
  // Validate fields.
  body("uid")
    .isLength({ min: 1 })
    .trim()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody("uid").escape(),
  sanitizeBody("date_of_birth").toDate(),
  sanitizeBody("date_of_death").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    var now = new Date();
    var death = new Date();
    death.setDate(now.getDate() + 14);
    // Create Author object with escaped and trimmed data
    var author = new Author({
      uid: req.body.uid,
      // date_of_birth: req.body.date_of_birth,
      date_of_birth: new Date(),
      // date_of_death: req.body.date_of_death,
      date_of_death: death
    });

    if (!errors.isEmpty()) {
      console.log(errors);
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array()
      });
      return;
    } else {
      // Data from form is valid.

      // Save author.

      author.save(function(err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new author record.
        if (req.headers["user-agent"] == "python-requests/2.18.4")
          res.send(author);
        else res.redirect(author.url);
      });
    }
  }
];

module.exports = {
  author_list, author_detail, 
  author_create_get,
  author_create_post, 
}