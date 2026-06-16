import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    // marksown styling
    <div className="prose prose-invert prose-sm max-w-none
                    prose-pre:p-0 prose-pre:bg-transparent
                    prose-code:text-blue-300 prose-code:bg-gray-800
                    prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-code:before:content-none prose-code:after:content-none
                    prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-brand-600 prose-blockquote:text-gray-400">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSanitize, // removing malicious HTML tags and attributes
          rehypeHighlight, // highlighting
        ]}
      >
        {content}
      </ReactMarkdown>      
    </div>
  );
}
