// server functions
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

// socket io server
io = require("./utils/socketUtil")(server);

// mongoDB connection
require("./config/MongoConnect");

// dev requirements
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const verifyRoles = require("./middleware/verifyRoles");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const PORT = process.env.PORT || 3000;

// custom middleware logger
if (process.env.NODE_ENV === "production") {
  app.use(logger);
}
// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// public routes
app.use("/", require("./routes/root"));

app.use("/visitor-count", require("./routes/visitor-count"));
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/userData"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use("/api/v1/feedback", require("./routes/api/feedback"));
app.use("/api/v1/run", require("./routes/api/run"));
app.use("/api/v1/contest-watcher", require("./routes/api/contestWatcher"));
app.use("/api/v1/snippet", require("./routes/api/snippetHandler"));
app.use("/api/v1/get-random-name", require("./routes/api/randomName"));
app.use("/api/v1/room", require("./routes/api/roomApiHandler"));
app.use("/api/v1/user/", require("./routes/api/user"));
app.use("/api/v1/problem", require("./routes/api/problem"));

// protected routes
app.use(verifyJWT);
app.use("/api/v1/settings", require("./routes/api/settings"));
// admin routes
app.use(verifyRoles(5150));
app.use("/api/v1/admin", require("./routes/api/admin"));

app.get("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
  app.use(errorHandler);
}

server.listen(PORT, (res, err) => {
  if (err) {
    console.log(`[NODE-APP] : Server failed - ${err}`);
    return;
  }
  console.log(`[NODE-APP] : Server running - Port ${PORT}`);
});
