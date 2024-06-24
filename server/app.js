const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser"); // For parsing request bodies
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
	origin: ["http://localhost:3000"], // Next.js app's URL
	credentials: true, // Allow cookies for authentication
	allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
	methods: "GET, POST", // Allowed HTTP methods
	allowedMethods: ["GET", "POST", "OPTIONS"], // Include OPTIONS for preflight requests
};

app.use(cors(corsOptions));

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// Import routes
const usersRoutes = require("./routes/usersRoute");
const roomRoutes = require("./routes/roomRoute");

// Use routes
app.use("/users", usersRoutes);
app.use("/room", roomRoutes);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`Roommate Ledger server listening at http://localhost:${port}`);
});
