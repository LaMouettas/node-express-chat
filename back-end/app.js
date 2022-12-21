require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const sMessage = require("./models/Message");

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("DB is OK"))
  .catch(() => console.log("DB failed"));

// export one function that gets called once as the server is being initialized
module.exports = function (app, server) {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "*");
    next();
  });
  app.use(express.json());
  const io = require("socket.io")(server, {
    cors: {
      origin: "http://127.0.0.1:5500",
      methods: ["GET", "POST"],
    },
  });
  require("./socket/chat")(io);
  app.use(function (req, res, next) {
    req.io = io;
    next();
  });

  app.get("/api/test", (req, res, next) => {
    res.status(200).json({ hello: "world" });
  });

  //api route get all messages
  app.get("/api/messages", (req, res, next) => {
    sMessage.find()
      .then((messages) => res.status(200).json(messages))
      .catch((error) => res.status(400).json({ error }));
  });

  //api route post a message
  app.post("/api/messages", (req, res, next) => {
    const message = new sMessage({
      ...req.body,
    });
    message
      .save()
      .then(() => res.status(201).json({ message: "sMessage saved" }))
      .catch((error) => res.status(400).json({ error }));
  });

  //api route delete all messages
  app.delete("/api/messages", (req, res, next) => {
    sMessage.deleteMany()
      .then(() => res.status(200).json({ message: "Messages deleted" }))
      .catch((error) => res.status(400).json({ error }));
  });
};
