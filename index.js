import http from "http";

import express from "express";
import cors from "cors";
import { config } from "dotenv";

import userRouter from "./database/user.js";
import articleRouter from "./database/article.js";
import fileRouter from "./database/file.js";

import { Server } from "socket.io";

config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

app.use(cors());
app.use(userRouter);
app.use(articleRouter);
app.use(fileRouter);

io.on("connection", (socket) => {
	io.emit("server", "user connect");

	socket.on("message", (message) => {
		io.emit("message", message);
	});

	socket.on("disconnect", () => {
		io.emit("server", "user disconnect");
	});
});

server.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));
