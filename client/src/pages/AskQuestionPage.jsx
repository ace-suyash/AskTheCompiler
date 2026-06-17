import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { TECH_TAGS } from '../data/techTags.js';
import MarkdownEditor from '../components/editor/MarkdownEditor.jsx';

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.length > 0) {
      setSuggestions(TECH_TAGS.filter(t => t.includes(val.toLowerCase())).slice(0, 6));
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tag) => {
    const t = tag.toLowerCase().trim();
    if (t && !tags.includes(t) && tags.length < 5) {
      onChange([...tags, t]);
    }
    setInput('');
    setSuggestions([]);
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="tag flex items-center gap-1">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-white">×</button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={handleInput}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
              e.preventDefault();
              addTag(input.trim());
            }
          }}
          placeholder={tags.length < 5 ? 'Type a tag and press Enter...' : 'Maximum 5 tags'}
          disabled={tags.length >= 5}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm
                     text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2
                     focus:ring-brand-600 focus:border-transparent disabled:opacity-50"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => addTag(s)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const validateQuestion = (title, body, tags) => {
  if (!title.trim() || title.trim().length < 7) {
    return 'Title must be at least 7 characters. Be specific.';
  }
  if (!body.trim() || body.trim().length < 20) {
    return 'Please add more detail to your question (min 20 characters).';
  }
  const hasValidTag = tags.some(t => TECH_TAGS.includes(t.toLowerCase()));
  if (!hasValidTag) {
    return 'Please add at least one technology tag (e.g. javascript, python, react).';
  }
  return null;
};

export default function AskQuestionPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // validity check
    const validationError = validateQuestion(title, body, tags);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/questions', { title, body, tags });
      navigate(`/questions/${data.question._id}`);
    } catch (err) {
      // handle error
      setError(err.response?.data?.message || 'Failed to post question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="btn-primary text-sm hidden sm:block"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-white mb-1">Ask a Question</h1>
      <p className="text-gray-500 text-sm mb-6">
        Technical questions about programming, software development, and CS only.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Title */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title <span className="text-gray-500 font-normal">— be specific and concise</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I prevent useEffect from running on the first render?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm
                       text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2
                       focus:ring-brand-600"
          />
          <p className="text-xs text-gray-600 mt-1">{title.length}/150 characters</p>
        </div>

        {/* Body */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Body <span className="text-gray-500 font-normal">— include all relevant code and error messages</span>
          </label>
          <MarkdownEditor value={body} onChange={setBody} />
          <p className="text-xs text-gray-600 mt-2">
            💡 Tip: Paste or drag images directly into the editor — they'll upload automatically.
          </p>
        </div>

        {/* Tags */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags <span className="text-gray-500 font-normal">— add up to 5 technology tags</span>
          </label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : 'Post Your Question'}
        </button>

      </form>
    </div>
  );
}
