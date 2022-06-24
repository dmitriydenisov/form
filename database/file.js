import { exec } from "child_process";
import express from "express";
import multer from "multer";
import { resolve } from "path";

const __dirname = resolve();
const upload = multer({ dest: resolve(__dirname, "./uploads") });

const router = express.Router();

router.post("/photo", upload.single("photo"), (req, res) => {
	const file = req.file;
	exec(`mv ${file.path} ${file.destination}/${file.filename}${file.originalname.match(/\.(.{1,})$/)[0]}`);
	res.end();
});

router.post("/files", upload.any(), (req, res) => {
	if (req.files.length) {
		for (const file of req.files) {
			exec(`mv ${file.path} ${file.destination}/${file.filename}${file.originalname.match(/\.(.{1,})$/)[0]}`);
		}
	}

	res.end();
});

export default router;
