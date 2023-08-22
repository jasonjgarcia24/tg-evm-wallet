import dotenv from "dotenv";
dotenv.config();

import { IntgrBot } from "./services/bot";
import { establishConnectionToMongoDb } from "./utils/db.utils";

const main = async () => {
	await establishConnectionToMongoDb();

	const bot = new IntgrBot();

	bot.setup();

	bot.run();
};

main().catch((err) => console.log("--err", err.message));
