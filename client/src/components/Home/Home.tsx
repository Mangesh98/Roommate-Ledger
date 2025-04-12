import Navbar from "../Navbar";
import Footer from "../Footer";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="mt-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
