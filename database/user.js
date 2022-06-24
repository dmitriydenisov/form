import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import { resolve } from "path";

const __dirname = resolve();
const upload = multer({ dest: resolve(__dirname, "./uploads") });

const router = express.Router();

const users = [
	{ id: 1, name: "Алексей", age: 29 },
	{ id: 2, name: "Олег", age: 22 },
	{ id: 3, name: "Виктория", age: 32 },
	{ id: 4, name: "Павел", age: 22 },
	{ id: 5, name: "Оксана", age: 15 },
];

let nextUserId = 6;

router.get("/users", (req, res) => {
	const limit = parseInt(req.query.limit ?? 10, 10);
	const offset = parseInt(req.query.offset ?? 0, 10);

	const select = users.slice(offset, offset + limit);

	res.json(select).end();
});

router.get("/users/:id", (req, res) => {
	const id = parseInt(req.params.id, 10);
	const user = users.find((user) => user.id === id);

	res.json(user).end();
});

router.get("/usersCount", (req, res) => {
	res.json({ count: users.length }).end();
});

router.post("/users", bodyParser.json(), upload.none(), (req, res) => {
	const { name, age } = req.body;

	if (users.some((user) => user.name === name)) {
		res.status(409).send("Пользователь с таким именем уже есть.");
		return;
	}

	const user = { id: nextUserId, name, age };
	users.push(user);
	nextUserId++;
	res.json(user).end();
});

router.delete("/users/:id", (req, res) => {
	const id = parseInt(req.params.id);

	if (!users.some((user) => user.id === id)) {
		res.status(409).send("Пользователя с таким id не найдено.");
		return;
	}

	const index = users.findIndex((user) => user.id === id);
	users.splice(index, 1);
	res.status(200).end();
});

router.patch("/users/:id", bodyParser.json(), (req, res) => {
	const id = parseInt(req.params.id);

	if (!users.some((user) => user.id === id)) {
		res.status(404).send("Пользователя с таким id не найдено.");
		return;
	}

	const user = users.find((user) => user.id === id);

	for (const key of ["name", "age"]) {
		if (req.body.hasOwnProperty(key)) {
			user[key] = req.body[key];
		}
	}

	res.json(user).end();
});

router.put("/users/:id", bodyParser.json(), (req, res) => {
	const id = parseInt(req.params.id);
	const index = users.findIndex((user) => user.id === id);

	if (index === -1) {
		res.status(404).send("Пользователя с таким id не найдено.");
		return;
	}

	delete req.body.id;

	users[index] = { id, ...req.body };

	res.json(users[index]).end();
});

export default router;
