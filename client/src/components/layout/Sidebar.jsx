import { useNavigate } from 'react-router-dom';
import { TECH_TAGS } from '../../data/techTags.js';

export default function Sidebar() {
  const navigate = useNavigate();

  const popularTags = TECH_TAGS.slice(0, 20);

  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="card sticky top-20">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/?tag=${tag}`)}
              className="tag"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}