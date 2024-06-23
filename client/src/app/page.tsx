import React from "react";
import Navbar from "./components/Navbar";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room";
import Footer from "./components/Footer";

const Home = () => {
	return (
		<>
			<div className="min-h-screen bg-white border-gray-200 dark:bg-gray-900">
				<Navbar />
				{/* <CreateRoom /> */}
				<Room />
				<Footer />
			</div>
		</>
	);
};

export default Home;
