const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser"); // For parsing request bodies
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
	origin: [process.env.CLIENT_URL], // Next.js app's URL
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
const entryRoutes = require("./routes/entryRoute");
const {router: ledgerRoutes} = require("./routes/ledgerRoute");

// Use routes
app.use("/users", usersRoutes);
app.use("/room", roomRoutes);
app.use("/entry", entryRoutes);
app.use("/ledger", ledgerRoutes);

app.get("/", (req, res) => {
	res.send("Hello");
});

app.listen(port, () => {
	console.log(`Roommate Ledger server listening at ${port}`);
});
