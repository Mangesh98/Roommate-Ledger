import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
	user?: {
		userId: string;
		name: string;
		email: string;
		room?: string;
	};
}

function auth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
	const token = req.body.token || req.headers["authorization"];
	if (!token) {
		return res
			.status(401)
			.json({ success: false, message: "Unauthorized Access" });
	}

	jwt.verify(
		token as string,
		process.env.JWT_SECRET as string,
		(err, decoded) => {
			if (err) {
				return res
					.status(401)
					.json({ success: false, message: "Unauthorized Access" });
			}

			if (typeof decoded !== "string" && decoded !== undefined) {
				const user = decoded as {
					userId: string;
					name: string;
					email: string;
					room?: string;
				};
				req.user = user;
				next();
			} else {
				return res
					.status(401)
					.json({ success: false, message: "Unauthorized Access" });
			}
		}
	);
}

export default auth;
