import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser"; // For parsing request bodies
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const app = express();
const port: number = Number(process.env.PORT) || 5000;

const corsOptions: cors.CorsOptions = {
	origin: [process.env.CLIENT_URL || "http://localhost:3000"], // Production app's URL
	// origin: [process.env.CLIENT_URL_DEV || "http://localhost:3000"], // Development app's URL
	credentials: true, // Allow cookies for authentication
	allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
	methods: "GET, POST", // Allowed HTTP methods
};

app.use(cors(corsOptions));

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// Import routes
import usersRoutes from "./routes/usersRoute";
import roomRoutes from "./routes/roomRoute";
import entryRoutes from "./routes/entryRoute";
import { router as ledgerRoutes } from "./routes/ledgerRoute";

// Use routes
app.use("/users", usersRoutes);
app.use("/room", roomRoutes);
app.use("/entry", entryRoutes);
app.use("/ledger", ledgerRoutes);

app.get("/", (_req: Request, res: Response): void => {
	res.send("Hello");
});

app.listen(port, () => {
	console.log(`Roommate Ledger server listening at ${port}`);
});
