import { useCookies } from "react-cookie";

export default function Auth() {
  // dummy auth
  const [cookies, setCookie] = useCookies(["user"]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome to Chat
          </h1>
          <p className="text-slate-600">Choose your user to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {cookies.user && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-green-800 font-medium">
                  Signed in as User {cookies.user}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <button
              className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              onClick={() => setCookie("user", "1")}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">1</span>
                </div>
                <span>Sign in as User 1</span>
              </div>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            </button>

            <button
              className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-6 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              onClick={() => setCookie("user", "2")}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">2</span>
                </div>
                <span>Sign in as User 2</span>
              </div>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            </button>
          </div>

          {cookies.user && (
            <a
              href="/chat"
              className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200 border border-slate-200 hover:border-slate-300"
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Go to Chat
              </div>
            </a>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Select a user to start chatting
          </p>
        </div>
      </div>
    </div>
  );
}
