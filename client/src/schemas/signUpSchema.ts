import { z } from "zod";

export const SignUpSchema = z.object({
	name: z.string().min(1, "Username is required"),
	room: z.string().min(1, "Room is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters long"),
});
