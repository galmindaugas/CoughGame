import { Button } from "@/components/ui/button";

const ThankYou = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background dark:bg-darkBg">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary bg-opacity-10 rounded-full mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Thank You!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You've completed all audio evaluations. Your responses have been recorded.
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Feel free to close this window or return to the conference.
        </p>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Cough Conference Audio Evaluation</p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
