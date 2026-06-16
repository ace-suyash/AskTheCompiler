import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';

function StatCard({ label, value }) {
  return (
    <div className="card text-center py-4">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function QuestionRow({ q }) {
  return (
    <Link to={`/questions/${q._id}`} className="card flex items-center gap-4 hover:border-gray-700 transition-colors">
      <div className="flex flex-col items-center text-center min-w-[48px]">
        <span className={`text-sm font-semibold ${q.score > 0 ? 'text-green-400' : q.score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
          {q.score}
        </span>
        <span className="text-xs text-gray-600">votes</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-blue-400 line-clamp-1">{q.title}</p>
        <div className="flex gap-2 mt-1">
          {q.tags?.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
      <div className="text-right text-xs text-gray-500 shrink-0">
        <div>{q.views} views</div>
        {q.hasAcceptedAnswer && <div className="text-green-400">✓ answered</div>}
      </div>
    </Link>
  );
}

function AnswerRow({ a }) {
  return (
    <Link to={`/questions/${a.question?._id}`} className="card flex items-center gap-4 hover:border-gray-700 transition-colors">
      <div className="flex flex-col items-center text-center min-w-[48px]">
        <span className={`text-sm font-semibold ${a.score > 0 ? 'text-green-400' : a.score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
          {a.score}
        </span>
        <span className="text-xs text-gray-600">votes</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">on: <span className="text-blue-400">{a.question?.title}</span></p>
        <p className="text-sm text-gray-300 line-clamp-1">{a.bodyPreview}</p>
      </div>
      {a.isAccepted && <span className="text-green-400 text-lg shrink-0" title="Accepted">✓</span>}
    </Link>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('questions');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${id}`);
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await api.delete('/users/me');
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card animate-pulse h-32 bg-gray-800" />
        <div className="card animate-pulse h-24 bg-gray-800" />
      </div>
    );
  }

  if (!data) {
    return <div className="card text-center py-16 text-gray-400">User not found.</div>;
  }

  const { user, stats, questions, answers, isOwner } = data;

  return (
    <div className="space-y-6">

      {/* Profile header */}
      <div className="card flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
          {user.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{user.username}</h1>
          {user.bio && <p className="text-gray-400 text-sm mt-1">{user.bio}</p>}
          <p className="text-xs text-gray-600 mt-2">
            Member since {new Date(user.createdAt).toLocaleDateString()}
            {isOwner && user.email && <> · {user.email}</>}
          </p>
          <p className="text-sm text-brand-500 mt-1">⭐ {user.reputation} reputation</p>
        </div>

        {isOwner ? (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 rounded-lg px-3 py-1.5 transition-colors shrink-0"
          >
            Delete Account
          </button>
        ) : isAuthenticated ? (
          <button
            onClick={() => navigate(`/messages/${user._id}`)}
            className="btn-secondary text-sm shrink-0"
          >
            Message
          </button>
        ) : null}
      </div>

      {/* Stats dashboard */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {isOwner ? 'Your Dashboard' : 'Activity'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Questions" value={stats.totalQuestions} />
          <StatCard label="Answers" value={stats.totalAnswers} />
          <StatCard label="Reach (views)" value={stats.totalViews} />
          <StatCard label="Net votes" value={stats.netScore} />
        </div>
        {isOwner && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <StatCard label="Upvotes received" value={stats.totalUpvotes} />
            <StatCard label="Downvotes received" value={stats.totalDownvotes} />
            <StatCard label="Accepted answers" value={stats.acceptedAnswersCount} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800 pb-2">
        <button
          onClick={() => setTab('questions')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === 'questions' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          Questions ({stats.totalQuestions})
        </button>
        <button
          onClick={() => setTab('answers')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === 'answers' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          Answers ({stats.totalAnswers})
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-3">
        {tab === 'questions' && (
          questions.length === 0
            ? <p className="text-gray-500 text-sm text-center py-8">No questions yet.</p>
            : questions.map(q => <QuestionRow key={q._id} q={q} />)
        )}
        {tab === 'answers' && (
          answers.length === 0
            ? <p className="text-gray-500 text-sm text-center py-8">No answers yet.</p>
            : answers.map(a => <AnswerRow key={a._id} a={a} />)
        )}
      </div>

      {/* Delete account modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-900 border border-red-900 rounded-xl w-full max-w-sm p-5">
            <h3 className="text-lg font-bold text-white mb-2">Delete Account</h3>
            <p className="text-sm text-gray-400 mb-4">
              This is permanent. Your questions and answers will remain but show as posted by
              a deleted account. Type <span className="font-mono text-red-400">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm
                         text-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleting}
                className="bg-red-700 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
