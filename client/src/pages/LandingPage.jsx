import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

const features = [
  {
    icon: '&#x3C;/\u003E',
    title: 'Code-First Q&A',
    desc: 'Ask and answer with full Markdown support, syntax highlighting for 7 languages, and drag-and-drop image uploads.',
  },
  {
    icon: '#',
    title: 'Smart Tagging',
    desc: 'Organize questions with 1–5 tech tags from a curated list of 50+ technologies. Filter and find exactly what you need.',
  },
  {
    icon: '^',
    title: 'Reputation System',
    desc: 'Earn reputation as your questions and answers get upvoted. Build trust in the developer community.',
  },
  {
    icon: '@',
    title: 'Direct Messages',
    desc: 'Connect one-on-one with other developers. Messages auto-expire after 24 hours to keep things fresh.',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar clone for landing (no search) */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-brand-500 font-mono font-bold text-lg">&gt;_</span>
            <span className="font-bold text-white tracking-tight">AskTheCompiler</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/questions" className="text-sm text-gray-400 hover:text-white transition-colors">
              Browse Questions
            </Link>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/questions')}
                className="btn-primary text-sm"
              >
                Go to Feed
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Log in</Link>
                <Link to="/register" className="btn-primary text-sm">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-600/20 mb-6">
          <span className="text-3xl font-mono font-bold text-brand-500">&gt;_</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Ask. Answer.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-500">
            Compile.
          </span>
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          The developer Q&A platform built for competitive programmers, DSA enthusiasts, and
          developers. Filter out noise, focus on code.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/questions')}
              className="btn-primary text-base px-6 py-3"
            >
              Browse Questions
            </button>
          ) : (
            <>
              <Link
                to="/register"
                className="btn-primary text-base px-6 py-3"
              >
                Join the Community
              </Link>
              <Link
                to="/questions"
                className="btn-secondary text-base px-6 py-3"
              >
                Explore Questions
              </Link>
            </>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto border-t border-gray-800 pt-8">
          <div>
            <div className="text-2xl font-bold text-white">7+</div>
            <div className="text-sm text-gray-500">Languages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-sm text-gray-500">Tech Tags</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">24h</div>
            <div className="text-sm text-gray-500">DM Expiry</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          Built for Developers
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-brand-600/10 border border-brand-600/20 flex items-center justify-center text-brand-500 font-mono font-bold text-lg mb-4">
                <span dangerouslySetInnerHTML={{ __html: f.icon }} />
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-brand-500 font-mono font-bold">&gt;_</span>
            <span>AskTheCompiler</span>
          </div>
          <p>&copy; {new Date().getFullYear()} AskTheCompiler</p>
        </div>
      </footer>
    </div>
  );
}
