
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';
import MarkdownRenderer from '../components/renderer/MarkdownRenderer.jsx';
import MarkdownEditor from '../components/editor/MarkdownEditor.jsx';

function VoteButtons({ upvotes = [], downvotes = [], onVote, currentUserId }) {
  const score = upvotes.length - downvotes.length;
  const hasUpvoted = currentUserId && upvotes.includes(currentUserId);
  const hasDownvoted = currentUserId && downvotes.includes(currentUserId);

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onVote('up')}
        className={`p-1.5 rounded transition-colors ${
          hasUpvoted ? 'text-green-400' : 'text-gray-600 hover:text-gray-300'
        }`}
      >
        ▲
      </button>
      <span className={`text-base font-bold ${
        score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-gray-400'
      }`}>
        {score}
      </span>
      <button
        onClick={() => onVote('down')}
        className={`p-1.5 rounded transition-colors ${
          hasDownvoted ? 'text-red-400' : 'text-gray-600 hover:text-gray-300'
        }`}
      >
        ▼
      </button>
    </div>
  );
}

function AnswerCard({ answer, currentUser, questionAuthorId, onVote, onAccept, onReply }) {
  const isAuthor = currentUser && answer.author?._id === currentUser._id;
  const isQuestionAuthor = currentUser && currentUser._id === questionAuthorId;

  // 1 layer tagged replies
  const isReply = !!answer.replyTo;

  return (
    <div className={`card border ${answer.isAccepted ? 'border-green-700 bg-green-950/20' : ''}`}>

      {/* replying to @username */ }
      {isReply && answer.replyTo?.author && (
        <div className="text-xs text-brand-500 mb-2">
          ↪ replying to{' '}
          <Link to={`/users/${answer.replyTo.author._id}`} className="hover:underline">
            @{answer.replyTo.author.username}
          </Link>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1">
          <VoteButtons
            upvotes={answer.upvotes}
            downvotes={answer.downvotes}
            currentUserId={currentUser?._id}
            onVote={(type) => onVote(answer._id, type)}
          />
          {/* author accessible accept button */}
          {isQuestionAuthor && (
            <button
              onClick={() => onAccept(answer._id)}
              title={answer.isAccepted ? 'Unaccept this answer' : 'Accept this answer'}
              className={`mt-1 text-lg transition-colors ${
                answer.isAccepted ? 'text-green-400' : 'text-gray-700 hover:text-green-400'
              }`}
            >
              ✓
            </button>
          )}
          {answer.isAccepted && !isQuestionAuthor && (
            <span className="text-green-400 text-lg" title="Accepted answer">✓</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <MarkdownRenderer content={answer.body} />
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
            <div className="text-xs text-gray-600">
              answered by{' '}
              <Link to={`/users/${answer.author?._id}`} className="text-gray-400 hover:text-brand-500">
                {answer.author?.username}
              </Link>
              {' · '}
              {new Date(answer.createdAt).toLocaleDateString()}
            </div>
            {/* can only reply to others */}
            {currentUser && !isReply && !isAuthor && (
              <button
                onClick={() => onReply(answer)}
                className="text-xs text-gray-500 hover:text-brand-500 transition-colors"
              >
                ↪ Reply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerBody, setAnswerBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { _id, username } of answer being replied to

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, aRes] = await Promise.all([
          api.get(`/questions/${id}`),
          api.get(`/answers/question/${id}`),
        ]);
        setQuestion(qRes.data.question);
        setAnswers(aRes.data.answers);
      } catch (err) {
        setError('Question not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleQuestionVote = async (type) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post(`/questions/${id}/vote`, { voteType: type });
      setQuestion(data.question);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerVote = async (answerId, type) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post(`/answers/${answerId}/vote`, { voteType: type });
      setAnswers(prev => prev.map(a => a._id === answerId ? data.answer : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (answerId) => {
    try {
      const { data } = await api.post(`/answers/${answerId}/accept`);
      setAnswers(prev => prev.map(a => ({
        ...a,
        isAccepted: a._id === answerId ? data.answer.isAccepted : false,
      })));
      setQuestion(prev => ({
        ...prev,
        acceptedAnswer: data.answer.isAccepted ? answerId : null,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async () => {
    setIsDeleting(true);
    try {
      const { data } = await api.delete(`/questions/${id}`);
      setQuestion(data.question); 
     
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplyClick = (answer) => {
    setReplyingTo({ _id: answer._id, username: answer.author?.username });
    setAnswerBody(prev => prev.startsWith('@') ? prev : `@${answer.author?.username} ${prev}`);
    setError('');
    document.getElementById('answer-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setAnswerBody(prev => prev.replace(/^@\S+\s*/, ''));
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerBody.trim() || answerBody.trim().length < 20) {
      setError('Answer must be at least 20 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post(`/answers/question/${id}`, {
        body: answerBody,
        replyTo: replyingTo?._id || null,
      });
      setAnswers(prev => [...prev, data.answer]);
      setAnswerBody('');
      setReplyingTo(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post answer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse h-32 bg-gray-800" />
        ))}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-400">{error || 'Question not found.'}</p>
        <Link to="/" className="text-brand-500 hover:underline text-sm mt-2 block">← Back to questions</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Question */}
      <div className="card">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-xl font-bold text-white">{question.title}</h1>
          {/*conditional Delete Button */}
          {user?._id === question.author?._id && question.status !== 'removed' && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-sm text-red-500 hover:text-red-400 transition-colors px-2 py-1 border border-transparent hover:border-red-900 rounded"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-4 text-xs text-gray-500 mb-4">
          <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
          <span>Viewed {question.views} times</span>
        </div>

        <div className="flex gap-4">
          <VoteButtons
            upvotes={question.upvotes}
            downvotes={question.downvotes}
            currentUserId={user?._id}
            onVote={handleQuestionVote}
          />
          <div className="flex-1 min-w-0">
            <MarkdownRenderer content={question.body} />
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800">
              {question.tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
              <div className="ml-auto text-xs text-gray-500">
                asked by{' '}
                <Link to={`/users/${question.author?._id}`} className="text-gray-400 hover:text-brand-500">
                  {question.author?.username}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        <div className="space-y-4">
          {answers.map(answer => (
            <AnswerCard
              key={answer._id}
              answer={answer}
              currentUser={user}
              questionAuthorId={question.author?._id}
              onVote={handleAnswerVote}
              onAccept={handleAccept}
              onReply={handleReplyClick}
            />
          ))}
        </div>
      </div>

      {/* Answer form */}
      {isAuthenticated ? (
        <div className="card" id="answer-form">
          <h2 className="text-lg font-semibold text-white mb-3">Your Answer</h2>

          {/* Reply banner */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-brand-950 border border-brand-800 text-brand-300 text-sm rounded-lg px-3 py-2 mb-3">
              <span>↪ Replying to <span className="font-medium">@{replyingTo.username}</span></span>
              <button onClick={cancelReply} className="text-brand-400 hover:text-white">×</button>
            </div>
          )}

          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <MarkdownEditor
              value={answerBody}
              onChange={setAnswerBody}
              placeholder="Write your answer here. Include code examples where relevant."
              minHeight={200}
            />
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-400">
            <Link to="/login" className="text-brand-500 hover:underline">Log in</Link>
            {' '}or{' '}
            <Link to="/register" className="text-brand-500 hover:underline">sign up</Link>
            {' '}to post an answer.
          </p>
        </div>
      )}
      {/*Yes/No Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm w-full shadow-2xl text-center">
            
            <h3 className="text-lg font-bold text-white mb-6">
              Are you sure that you want to delete the question?
            </h3>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                No
              </button>
              <button
                onClick={handleDeleteQuestion}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
