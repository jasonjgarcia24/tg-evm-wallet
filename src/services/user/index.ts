import { IUser, userModel } from "../../models/user.model";

export class UserService {
	static createIfDoesntExist = async (user: IUser["telegram"]) => {
		const userObj = userModel.findOne({ telegram: { id: user.id } });

		if (!userObj) userModel.create({ telegram: user });
	};

	static setSelectedChain = async (
		tgId: number,
		selectedChain: "opt" | "base" | "zora"
	) => {
		await userModel.findOneAndUpdate(
			{ telegram: { id: tgId } },
			{ $set: { selected_chain: selectedChain } }
		);
	};

	static setSelectedTimeline = async (
		tgId: number,
		selectedTimeline: "1h" | "6h" | "24h"
	) => {
		await userModel.findOneAndUpdate(
			{ telegram: { id: tgId } },
			{ $set: { selected_timeline: selectedTimeline } }
		);
	};
}
