import express from "express";
import bodyParser from "body-parser";

const router = express.Router();

const articles = [
	{ id: 1, userId: 1, content: "Ea commodo deserunt enim eu nulla minim aliquip aliqua sint." },
	{ id: 2, userId: 2, content: "Do ea deserunt ullamco laborum esse dolor pariatur reprehenderit." },
	{ id: 3, userId: 3, content: "Deserunt nulla aute enim veniam." },
	{
		id: 4,
		userId: 1,
		content: "Ea pariatur veniam dolor in esse eu labore reprehenderit duis aliquip reprehenderit cillum amet.",
	},
	{ id: 5, userId: 3, content: "Quis commodo magna culpa quis occaecat magna labore duis nulla sint." },
];

let nextArticleId = 6;

const authenticated = (req, res, next) => {
	const { authorization = "" } = req.headers;
	const match = authorization.match(/Bearer secret_user_(\d){1,}_secret/);

	if (!match) {
		res.status(401).send("Не авторизованный пользователь.");
	} else {
		req.uid = parseInt(match[1], 10);
		next();
	}
};

const access = (req, res, next) => {
	const id = parseInt(req.params.id);
	const index = articles.findIndex((article) => article.id === id);

	if (index === -1) {
		res.status(404).send("Статьи с таким id не найдено.");
		return;
	}

	const article = articles[index];

	if (article.userId !== req.uid) {
		res.status(409).send("Не хватает прав на удаление.");
		return;
	}

	req.article = article;

	next();
};

router.get("/articles", (req, res) => {
	const limit = parseInt(req.query.limit ?? 10, 10);
	const offset = parseInt(req.query.offset ?? 0, 10);
	const select = articles.slice(offset, offset + limit);
	res.json(select).end();
});

router.get("/articles/:id", (req, res) => {
	const id = parseInt(req.params.id, 10);
	const article = articles.find((article) => article.id === id);
	res.json(article).end();
});

// authorization: 'Bearer secret_user_1_secret',
router.post("/articles", authenticated, bodyParser.json(), (req, res) => {
	const { content } = req.body;
	const article = { id: nextArticleId, content, userId: req.uid };
	articles.push(article);
	res.json(article).end();
});

router.delete("/articles/:id", authenticated, access, (req, res) => {
	const index = articles.indexOf(req.article);
	articles.splice(index, 1);
	res.status(200).end();
});

router.patch("/articles/:id", authenticated, access, bodyParser.json(), (req, res) => {
	if (req.body.content) {
		req.article.content = req.body.content;
	}

	res.json(req.article).end();
});

router.put("/articles/:id", authenticated, access, bodyParser.json(), (req, res) => {
	delete req.body.id;
	const index = articles.indexOf(req.article);
	articles[index] = { id: req.article.id, ...req.body };

	res.json(articles[index]).end();
});

export default router;
