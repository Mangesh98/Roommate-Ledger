const express = require("express");
const cors = require("cors");
const userModel = require("./models/user");
const bodyParser = require("body-parser"); // For parsing request bodies
const bcrypt = require("bcrypt"); // For password hashing
const dotenv = require("dotenv");
const user = require("./models/user");
dotenv.config({ path: ".env" });

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
	origin: ["http://localhost:3000"], // Replace with your Next.js app's URL
	credentials: true, // Allow cookies for authentication (if applicable)
	allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
	methods: "GET, POST", // Allowed HTTP methods
};

app.use(cors(corsOptions));

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// Replace with your user data model (e.g., MongoDB, database connection)
const users = []; // Placeholder for user data storage

app.get("/", (req, res) => {
	res.send("Hello World!");
});

// **User Registration**
app.post("/register", async (req, res) => {
	const { name, email, password } = req.body;

	// Validate user input
	if (!name || !password || !email) {
		return res.status(400).json({ message: "Please provide valid details" });
	}

	// Check for existing user (replace with actual user existence check)
	const existingUser = await userModel.findOne({ email });
	if (existingUser) {
		return res.status(409).json({ message: "Username already exists" });
	}

	// Hash password before storing
	const hashedPassword = await bcrypt.hash(password, 10);

	// Store user data (replace with your data storage method)
	const user = await userModel.create({
		name,
		email,
		password: hashedPassword,
	});
	console.log(user);
	res.status(201).json({ message: "User registered successfully" });
});

// **User Login**
app.post("/login", async (req, res) => {
	const { email, password } = req.body;

	// Validate user input
	if (!email || !password) {
		return res
			.status(400)
			.json({ message: "Please provide email and password" });
	}

	// Find user (replace with actual user retrieval)
	const user = await userModel.findOne({ email });
	if (!user) {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	// Compare password hash (replace with your password comparison method)
	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	// Login successful (replace with session creation/token generation)
	res.status(200).json({ message: "Login successful" }); // Adjust response for authentication
});

app.listen(port, () => {
	console.log(`Roommate Ledger server listening at http://localhost:${port}`);
});
