import { Link } from "react-router-dom";
import { Github, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding Section */}
          <div className="space-y-3">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 
                bg-clip-text text-transparent"
            >
              Roommate Ledger
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Simplifying shared expenses and financial management for
              roommates.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                ["Room Entries", "/room-entries"],
                ["My Entries", "/my-entries"],
                ["Ledger", "/ledger"],
                ["Payment Confirmation", "/payment-confirmation"],
              ].map(([title, path]) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-sm text-gray-500 hover:text-blue-600 
                      dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Connect
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/mangesh98"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 
                  dark:hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub repository</span>
              </a>
              <a
                href="mailto:contact@mangeshraje55555@gmail.com"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 
                  dark:hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Contact email</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            © {currentYear}{" "}
            <Link
              to="/"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Roommate Ledger™
            </Link>
            . All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
