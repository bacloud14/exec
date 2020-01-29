var express = require("express");
var router = express.Router();

// Require our controllers.
var session_controller = require("../controllers/sessionController");
var author_controller = require("../controllers/authorController");
var genre_controller = require("../controllers/genreController");
var execution_controller = require("../controllers/executionController");
// var identity_controller = require('../controllers/identityController');

/// BOOK ROUTES ///

// GET exec home page.
router.get("/", session_controller.index);

// GET request for creating a Session. NOTE This must come before routes that display Session (uses id).
router.get("/session/create", session_controller.session_create_get);

// POST request for creating Session.
router.post("/session/create", session_controller.session_create_post);

// GET request to delete Session.
router.get("/session/:id/delete", session_controller.session_delete_get);

// POST request to delete Session.
router.post("/session/:id/delete", session_controller.session_delete_post);

// GET request to update Session.
router.get("/session/:id/update", session_controller.session_update_get);

// POST request to update Session.
router.post("/session/:id/update", session_controller.session_update_post);

// GET request for one Session.
router.get("/session/:id", session_controller.session_detail);

// GET request for list of all Session.
router.get("/sessions", session_controller.session_list);

/// AUTHOR ROUTES ///

// GET request for list of all Session.
// router.get('/idi', identity_controller.get_ip);

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get("/author/create", author_controller.author_create_get);

// POST request for creating Author.
router.post("/author/create", author_controller.author_create_post);

// GET request for one Author.
router.get("/author/:id", author_controller.author_detail);

// GET request for list of all Authors.
router.get("/authors", author_controller.author_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get("/genre/create", genre_controller.genre_create_get);

// POST request for creating Genre.
router.post("/genre/create", genre_controller.genre_create_post);

// GET request to delete Genre.
router.get("/genre/:id/delete", genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post("/genre/:id/delete", genre_controller.genre_delete_post);

// GET request to update Genre.
router.get("/genre/:id/update", genre_controller.genre_update_get);

// POST request to update Genre.
router.post("/genre/:id/update", genre_controller.genre_update_post);

// GET request for one Genre.
router.get("/genre/:id", genre_controller.genre_detail);

// GET request for list of all Genre.
router.get("/genres", genre_controller.genre_list);

/// BOOKINSTANCE ROUTES ///

// GET request for creating a execution. NOTE This must come before route that displays execution (uses id).
router.get("/execution/create", execution_controller.execution_create_get);

// POST request for creating execution.
router.post("/execution/create", execution_controller.execution_create_post);

// GET request to delete execution.
router.get("/execution/:id/delete", execution_controller.execution_delete_get);

// POST request to delete execution.
router.post(
  "/execution/:id/delete",
  execution_controller.execution_delete_post
);

// GET request to update execution.
router.get("/execution/:id/update", execution_controller.execution_update_get);

// POST request to update execution.
router.post(
  "/execution/:id/update",
  execution_controller.execution_update_post
);

// GET request for one execution.
router.get("/execution/:id", execution_controller.execution_detail);

// GET request for list of all execution.
router.get("/executions", execution_controller.execution_list);

module.exports = router;
