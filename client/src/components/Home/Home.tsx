import Navbar from "../Navbar";
import Footer from "../Footer";
import { Outlet } from "react-router-dom";

const Home = () => {
	return (
		<div className="min-h-screen bg-white border-gray-200 dark:bg-gray-900">
			<Navbar />
			<div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
					<div className="content mt-6">
						<Outlet />
					</div>
			</div>
			<Footer />
		</div>
	);
};

export default Home;
