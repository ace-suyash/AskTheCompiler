import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';

const buildPreview = (body = '') =>
  body
    .replace(/```[\s\S]*?```/g, ' ')          // fenced code blocks
    .replace(/`[^`]*`/g, ' ')                 // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')   // ![alt](url) images
    .replace(/<img\b[^>]*>/gi, '')            // raw <img> tags
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // [text](url) → text
    .replace(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg|bmp|avif)(?:\?[^\s]*)?/gi, '') // bare image URLs
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150);

function QuestionCard({ question }) {
  const score = (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
  const hasAccepted = !!question.acceptedAnswer;

  return (
    <div className="card hover:border-gray-700 transition-colors">
      <div className="flex gap-4">

        {/* Vote / answer stats */}
        <div className="flex flex-col items-center gap-2 text-center shrink-0 min-w-[52px]">
          <div className={`text-sm font-medium px-2 py-1 rounded ${
            score > 0 ? 'text-green-400 bg-green-950' :
            score < 0 ? 'text-red-400 bg-red-950' :
            'text-gray-400 bg-gray-800'
          }`}>
            {score}
          </div>
          <div className={`text-xs px-2 py-1 rounded border ${
            hasAccepted
              ? 'text-green-400 border-green-700 bg-green-950'
              : 'text-gray-500 border-gray-700'
          }`}>
            {hasAccepted ? '✓' : '0'} ans
          </div>
          <div className="text-xs text-gray-600">{question.views} views</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/questions/${question._id}`}
            className="text-base font-medium text-blue-400 hover:text-blue-300 line-clamp-2"
          >
            {question.title}
          </Link>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {buildPreview(question.body)}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {question.tags?.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            <span className="ml-auto text-xs text-gray-600 shrink-0">
              asked by{' '}
              <Link to={`/users/${question.author?._id}`} className="text-gray-400 hover:text-brand-500">
                {question.author?.username}
              </Link>
              {' · '}
              {new Date(question.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function HomePage() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/questions', {
          params: { search, tag, sort, page, limit: 15 },
        });
        setQuestions(data.questions);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [search, tag, sort, page]);

  const setSort = (s) => setSearchParams({ ...Object.fromEntries(searchParams), sort: s, page: 1 });

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">
            {tag ? `Questions tagged [${tag}]` : search ? `Results for "${search}"` : 'All Questions'}
          </h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-0.5">{pagination.total} questions</p>
          )}
        </div>
        {isAuthenticated && (
          <Link to="/ask" className="btn-primary text-sm">Ask Question</Link>
        )}
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-800 pb-2">
        {['newest', 'votes', 'unanswered'].map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${
              sort === s
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Question list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse h-28 bg-gray-800" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg">No questions found.</p>
          <p className="text-gray-600 text-sm mt-2">
            {isAuthenticated ? (
              <Link to="/ask" className="text-brand-500 hover:underline">Be the first to ask</Link>
            ) : (
              'Be the first to ask a question!'
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => <QuestionCard key={q._id} question={q} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: i + 1 })}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
