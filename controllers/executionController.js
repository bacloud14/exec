var Execution = require("../models/execution");
var Session = require("../models/session");
var Author = require("../models/author");
var async = require("async");
var mongoose = require("mongoose");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

async function getUser(session_id) {
  return await Author.find({ uid: session_id }, "uid").exec();
}
// sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Display list of all executions.
exports.execution_list = function(req, res, next) {
  getUser(req.session.id).then(function(result) {
    var uid = result[0]._id;
    const newId = new mongoose.Types.ObjectId(uid);
    Execution.find()
      .populate({
        path: "session",
        match: { author: newId }
      })
      .exec(function(err, list_executions) {
        if (err) {
          return next(err);
        }
        list_executions = list_executions.filter(function(execution) {
          return execution.session;
        });
        // Successful, so render.
        if (req.headers["user-agent"] == "python-requests/2.18.4")
          res.send({
            title: "Session execution List",
            execution_list: list_executions
          });
        else
          res.render("execution_list", {
            title: "Session execution List",
            execution_list: list_executions
          });
      });
  });
};

// sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Display detail page for a specific execution.
exports.execution_detail = function(req, res, next) {
  Execution.findById(req.params.id)
    .populate("session")
    .exec(function(err, execution) {
      if (err) {
        return next(err);
      }
      if (execution == null) {
        // No results.
        var err = new Error("Session copy not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      //
      if (req.headers["user-agent"] == "python-requests/2.18.4")
        res.send({ title: "Session:", execution: execution });
      else
        res.render("execution_detail", {
          title: "Session:",
          execution: execution
        });
    });
};

// sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Display execution create form on GET.
exports.execution_create_get = function(req, res, next) {
  getUser(req.session.id).then(function(result) {
    Session.find({ title: { $exists: true } }, "title").exec(function(
      err,
      sessions
    ) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      if (req.headers["user-agent"] == "python-requests/2.18.4")
        res.send({ title: "Create execution", session_list: sessions });
      else
        res.render("execution_form", {
          title: "Create execution",
          session_list: sessions
        });
      //
    });
  });
};
// function create_execution(){
//     // Extract the validation errors from a request.

//     // Create a execution object with escaped and trimmed data.
//     var execution = new Execution(
//       { session: req.body.session,
//         imprint: req.body.imprint,
//         status: req.body.status,
//         due_back: req.body.due_back
//        });

//     if (!errors.isEmpty()) {
//         // There are errors. Render form again with sanitized values and error messages.
//         Session.find({},'title')
//             .exec(function (err, sessions) {
//                 if (err) { return next(err); }
//                 // Successful, so render.
//                 res.render('execution_form', { title: 'Create execution', session_list : sessions, selected_session : execution.session._id , errors: errors.array(), execution:execution });
//         });
//         return;
//     }
//     else {
//         // Data from form is valid
//         execution.save(function (err) {
//             if (err) { return next(err); }
//                // Successful - redirect to new record.
//                res.redirect(execution.url);
//             });
//     }
// }

// sendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrendersendrender
// Handle execution create on POST.
exports.execution_create_post = [
  // Validate fields.
  body("session", "Session must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("imprint", "Imprint must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody("session").escape(),
  sanitizeBody("imprint").escape(),
  sanitizeBody("status").escape(),
  sanitizeBody("due_back").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a execution object with escaped and trimmed data.
    var execution = new Execution({
      session: req.body.session,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Session.find({}, "title").exec(function(err, sessions) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("execution_form", {
          title: "Create execution",
          session_list: sessions,
          selected_session: execution.session._id,
          errors: errors.array(),
          execution: execution
        });
      });
      return;
    } else {
      // Data from form is valid
      execution.save(function(err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        if (req.headers["user-agent"] == "python-requests/2.18.4")
          res.send(execution);
        else res.redirect(execution.url);
      });
    }
  }
];

// renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Display execution delete form on GET.
exports.execution_delete_get = function(req, res, next) {
  Execution.findById(req.params.id)
    .populate("session")
    .exec(function(err, execution) {
      if (err) {
        return next(err);
      }
      if (execution == null) {
        // No results.
        res.redirect("/exec/executions");
      }
      // Successful, so render.
      res.render("execution_delete", {
        title: "Delete execution",
        execution: execution
      });
    });
};

// renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Handle execution delete on POST.
exports.execution_delete_post = function(req, res, next) {
  // Assume valid execution id in field.
  Execution.findByIdAndRemove(req.body.id, function deleteexecution(err) {
    if (err) {
      return next(err);
    }
    // Success, so redirect to list of execution items.
    res.redirect("/exec/executions");
  });
};

// renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Display execution update form on GET.
exports.execution_update_get = function(req, res, next) {
  // Get session, authors and genres for form.
  async.parallel(
    {
      execution: function(callback) {
        Execution.findById(req.params.id)
          .populate("session")
          .exec(callback);
      },
      sessions: function(callback) {
        Session.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.execution == null) {
        // No results.
        var err = new Error("Session copy not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("execution_form", {
        title: "Update  execution",
        session_list: results.sessions,
        selected_session: results.execution.session._id,
        execution: results.execution
      });
    }
  );
};

// renderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrenderrender
// Handle execution update on POST.
exports.execution_update_post = [
  // Validate fields.
  body("session", "Session must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("imprint", "Imprint must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody("session").escape(),
  sanitizeBody("imprint").escape(),
  sanitizeBody("status").escape(),
  sanitizeBody("due_back").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a execution object with escaped/trimmed data and current id.
    var execution = new Execution({
      session: req.body.session,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // There are errors so render the form again, passing sanitized values and errors.
      Session.find({}, "title").exec(function(err, sessions) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("execution_form", {
          title: "Update execution",
          session_list: sessions,
          selected_session: execution.session._id,
          errors: errors.array(),
          execution: execution
        });
      });
      return;
    } else {
      // Data from form is valid.
      Execution.findByIdAndUpdate(req.params.id, execution, {}, function(
        err,
        theexecution
      ) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to detail page.
        res.redirect(theexecution.url);
      });
    }
  }
];
