import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
let didVerifyOnce = false;

const VerifyEmail = () => {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (didVerifyOnce) return;
    didVerifyOnce = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`${import.meta.env.VITE_HOST_URL}/users/verify-email/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setTimeout(() => navigate("/sign-in"), 3_000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transform transition-all">
        {status === "verifying" && (
          <div className="text-center space-y-4">
            <Loader2 className="animate-spin h-16 w-16 mx-auto text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Verifying your email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we confirm your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 animate-bounce" />
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-500">
              Email verified successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You'll be redirected to the login page in a moment...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-500">
              Verification failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The verification link is invalid or has expired. Please request a
              new verification email.
            </p>
            <button
              onClick={() => navigate("/sign-in")}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
