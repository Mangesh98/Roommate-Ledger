const jwt = require("jsonwebtoken");

function auth(req, res, next) {
	const token = req.body.token || req.headers["authorization"];
	if (!token)
		return res
			.status(401)
			.json({ success: false, message: "Unauthorized Access" });

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err)
			return res
				.status(401)
				.json({ success: false, message: "Unauthorized Access" });
		req.user = user;
		next();
	});
}

module.exports = auth;
