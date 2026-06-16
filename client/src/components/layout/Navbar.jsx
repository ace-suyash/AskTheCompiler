import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-brand-500 font-mono font-bold text-lg">&gt;_</span>
          <span className="font-bold text-white tracking-tight">AskTheCompiler</span>
        </Link>

        {/* Search bar */}
        <form
          className="flex-1 max-w-xl hidden sm:flex"
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.target.search.value.trim();
            if (q) navigate(`/?search=${encodeURIComponent(q)}`);
          }}
        >
          <input
            name="search"
            type="search"
            placeholder="Search questions..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-1.5
                       text-sm text-gray-200 placeholder-gray-500 focus:outline-none
                       focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          />
        </form>

        {/* Right side */}
        <div className="flex items-center gap-5 shrink-0">
          {isAuthenticated ? (
            <>
              <Link to="/ask" className="btn-primary text-sm hidden sm:block">
                Ask Question
              </Link>
              {/* <button className="flex px-4 py-1.5 text-sm  transition-colors bg-green-600 rounded-lg">
                <Link to="/messages" className="text-white  hover:text-yellow-400">
                  Messages
                </Link>
              </button> */}
              <Link to="/messages" className="btn-primary text-sm hidden sm:block hover:bg-green-500">
                  Messages
                </Link>

              <div className="flex items-center gap-5">
                {/* <button  className="flex px-4 py-1.5 text-sm  transition-colors bg-green-600 rounded-lg">
                    <Link
                    to={`/users/${user?._id}`}
                    className="text-sm text-white hover:text-yellow-400 transition-colors hidden md:block"
                  >
                    {user?.username}
                  </Link>
                </button> */}

                  <Link
                      to={`/users/${user?._id}`}
                      className="btn-primary text-sm hidden sm:block hover:bg-green-500"
                    >
                      {user?.username}
                    </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm">Log in</Link>
              <Link to="/register" className="btn-primary text-sm">Sign up</Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
