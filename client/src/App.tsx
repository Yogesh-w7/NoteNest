import { Outlet, Link } from "react-router-dom";
import { 
  LogIn, 
  UserPlus 
} from 'lucide-react'; // Assuming lucide-react is installed for professional icons
import './index.css';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
                    bg-gradient-to-br from-[#B0C9E5] via-[#F5D488] to-[#EBBDC3] 
                    text-gray-800 px-4 font-['Inter'] antialiased">

      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 
                       bg-gradient-to-r from-[#B0C9E5] via-[#F5B488] to-[#DCBA83] bg-clip-text text-transparent 
                       animate-pulse drop-shadow-lg">
          ✨ Notes App ✨
        </h1>
        <p className="mb-6 text-lg md:text-xl text-gray-700 font-medium">
          Your personal note-taking companion 🚀
        </p>
      </header>

      {/* Interactive Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 px-8 py-3 bg-white/80 text-[#B0C9E5] font-semibold rounded-xl shadow-lg
                     hover:shadow-2xl hover:scale-105 hover:bg-white transition-all duration-300 ease-in-out
                     border border-[#B0C9E5]/30 backdrop-blur-sm"
        >
          <LogIn className="w-5 h-5" />
          Login
        </Link>
        <Link
          to="/signup"
          className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#DCBA83] to-[#EBBDC3] text-gray-800 
                     font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 
                     hover:from-[#F5B488] hover:to-[#B0C9E5] transition-all duration-300 ease-in-out"
        >
          <UserPlus className="w-5 h-5" />
          Sign Up
        </Link>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md border-t border-[#F5D488]/30 mb-10"></div>

      {/* Outlet for nested routes (like Login/Signup forms) */}
      <div className="w-full max-w-md">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="mt-auto mb-4 text-sm text-[#DCBA83]/80 font-medium">
        &copy; {new Date().getFullYear()} Notes App. All rights reserved.
      </footer>
    </div>
  );
}

export default App;