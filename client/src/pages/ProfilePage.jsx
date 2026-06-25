import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { TECH_TAGS } from '../data/techTags.js';

function QuestionRow({ q }) {
  return (
    <Link to={`/questions/${q._id}`} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-3 flex gap-4 items-start hover:border-gray-700 transition-colors cursor-pointer">
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center min-w-[52px] flex-shrink-0">
        <div className={`text-base font-semibold ${q.score > 0 ? 'text-emerald-400' : q.score < 0 ? 'text-red-400' : 'text-slate-100'}`}>
          {q.score}
        </div>
        <div className="text-[10px] text-slate-500">votes</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-blue-400 hover:text-blue-300 mb-1.5 line-clamp-1">{q.title}</div>
        <div className="flex flex-wrap gap-1">
          {q.tags?.slice(0, 3).map(t => <span key={t} className="bg-blue-950 text-blue-400 border border-blue-900 rounded px-2 py-0.5 text-[11px]">{t}</span>)}
        </div>
        <div className="text-xs text-slate-500 mt-1.5">{q.views} views{q.hasAcceptedAnswer && <span className="text-emerald-400 ml-2">✓ answered</span>}</div>
      </div>
    </Link>
  );
}

function AnswerRow({ a }) {
  return (
    <Link to={`/questions/${a.question?._id}`} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-3 flex gap-4 items-start hover:border-gray-700 transition-colors cursor-pointer">
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center min-w-[52px] flex-shrink-0">
        <div className={`text-base font-semibold ${a.score > 0 ? 'text-emerald-400' : a.score < 0 ? 'text-red-400' : 'text-slate-100'}`}>
          {a.score}
        </div>
        <div className="text-[10px] text-slate-500">votes</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 mb-0.5">on: <span className="text-blue-400">{a.question?.title}</span></div>
        <div className="text-sm text-slate-300 line-clamp-1">{a.bodyPreview}</div>
      </div>
      {a.isAccepted && <span className="text-emerald-400 text-lg shrink-0 mt-1" title="Accepted">✓</span>}
    </Link>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('questions');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${username}`);
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const openDeleteModal = () => {
    setDeleteConfirm('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeleteError('');
    setDeleteConfirm('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm.trim() !== 'DELETE') {
      setDeleteError('Please type DELETE exactly as shown to confirm.');
      return;
    }
    setDeleteError('');
    setDeleting(true);
    try {
      await api.delete('/users/me');
      useAuthStore.getState().clearUser();
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Could not delete account. Please try again.';
      setDeleteError(message);
      console.error('Delete account failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-[1fr_240px] gap-6">
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-[72px] h-[72px] rounded-full bg-gray-800 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-800 rounded w-48" />
                <div className="h-4 bg-gray-800 rounded w-72" />
                <div className="h-4 bg-gray-800 rounded w-32" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-16 mb-2" />
                <div className="h-8 bg-gray-800 rounded w-12" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl text-center py-16 text-slate-500">
          User not found.
        </div>
      </div>
    );
  }

  const { user, stats, questions, answers, isOwner } = data;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Profile header card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 mb-5 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-[72px] h-[72px] rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shrink-0 ring-2 ring-blue-900 ring-offset-2 ring-offset-gray-900">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">{user.username}</h1>
              <div className="text-sm text-slate-500 mt-1 flex gap-4 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
                {isOwner && user.email && (
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {user.email}
                  </span>
                )}
              </div>
              {user.bio ? (
                <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-lg">{user.bio}</p>
              ) : isOwner ? (
                <p className="text-sm text-slate-600 mt-3 italic max-w-lg">No bio added yet.</p>
              ) : null}
              <span className="mt-2 inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded-md px-2.5 py-0.5 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {user.reputation} reputation
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {isOwner ? (
              <button
                onClick={openDeleteModal}
                className="flex items-center gap-2 text-sm border border-red-900 text-red-400 hover:border-red-600 hover:text-red-300 rounded-lg px-4 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete Account
              </button>
            ) : isAuthenticated ? (
              <button
                onClick={() => navigate(`/messages/${user._id}`)}
                className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Message
              </button>
            ) : null}
          </div>
        </div>

        {/* Stats grid — public row */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="text-3xl font-semibold text-slate-100 mt-1">{stats.totalQuestions}</div>
            <div className="text-xs text-slate-500 mt-1">Questions</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            <div className="text-3xl font-semibold text-slate-100 mt-1">{stats.totalAnswers}</div>
            <div className="text-xs text-slate-500 mt-1">Answers</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            <div className="text-3xl font-semibold text-slate-100 mt-1">{stats.totalViews}</div>
            <div className="text-xs text-slate-500 mt-1">Reach (views)</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <div className="text-3xl font-semibold text-slate-100 mt-1">{stats.netScore}</div>
            <div className="text-xs text-slate-500 mt-1">Net votes</div>
          </div>
        </div>

        {/* Stats grid — owner row */}
        {isOwner && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-1.5">
                <ArrowUp size={14} className="text-emerald-400" />
                <div className="text-2xl font-semibold text-emerald-400 mt-1">{stats.totalUpvotes}</div>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Upvotes received</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-1.5">
                <ArrowDown size={14} className="text-red-400" />
                <div className="text-2xl font-semibold text-red-400 mt-1">{stats.totalDownvotes}</div>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Downvotes received</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                <div className="text-2xl font-semibold text-slate-100 mt-1">{stats.acceptedAnswersCount}</div>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Accepted answers</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('questions')}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'questions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Questions ({stats.totalQuestions})
          </button>
          <button
            onClick={() => setTab('answers')}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'answers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Answers ({stats.totalAnswers})
          </button>
        </div>

        {/* Tab content */}
        <div>
          {tab === 'questions' && (
            questions.length === 0
              ? (
                <div className="text-center py-16 text-slate-600">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-sm">No questions posted yet.</p>
                  <p className="text-xs text-slate-700 mt-1">Start by asking your first question.</p>
                </div>
              )
              : questions.map(q => <QuestionRow key={q._id} q={q} />)
          )}
          {tab === 'answers' && (
            answers.length === 0
              ? (
                <div className="text-center py-16 text-slate-600">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm">No answers posted yet.</p>
                  <p className="text-xs text-slate-700 mt-1">Help others by answering their questions.</p>
                </div>
              )
              : answers.map(a => <AnswerRow key={a._id} a={a} />)
          )}
        </div>

      {/* Delete account modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-2">Delete Account</h3>
            <p className="text-sm text-slate-400 mb-4">
              This is permanent. Your questions and answers will remain but show as posted by
              a deleted account. Type <span className="font-mono text-red-400">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onPaste={(e) => e.preventDefault()}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              className="w-full bg-gray-800 border border-gray-700 text-slate-100 placeholder-slate-600 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            {deleteError && (
              <p className="text-xs text-red-400 mb-3" role="alert">{deleteError}</p>
            )}
            {!deleteError && <div className="mb-3" />}
            <div className="flex justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="border border-gray-700 text-slate-400 hover:text-slate-200 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm.trim() !== 'DELETE' || deleting}
                className="bg-red-700 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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