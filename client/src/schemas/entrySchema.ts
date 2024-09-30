import { z } from "zod";

export const NewEntrySchema = z.object({
	description: z.string().min(1, "Description is required"),
	price: z.preprocess(
		(val) => (val === "" ? undefined : Number(val)),
		z.number().refine((val) => !isNaN(val) && val >= 1, {
			message: "Price is required",
		})
	),
	date: z.string(),
	category: z.string(),
	selectedMembers: z.preprocess((val) => {
		if (typeof val === "string") {
			return [val];
		}
		return val;
	}, z.array(z.string()).min(1, "At least one member is required")),
});
