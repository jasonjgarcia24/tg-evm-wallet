import mongoose from "mongoose";

const MONGODB_URL = process.env["MONGODB_URL"];

if (!MONGODB_URL) throw Error("No mongodb url provided");

export const establishConnectionToMongoDb = async () => {
	return mongoose
		.connect(MONGODB_URL, {})
		.catch((err) => console.log(`DB_CONN_ERR: ${err}`))
		.then(() =>
			console.log(`Connection to database at ${MONGODB_URL} was successful`)
		);
};
