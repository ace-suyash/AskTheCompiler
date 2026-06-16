import { useState } from 'react';import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';

const LANGUAGES = {
  javascript: { extension: javascript({ jsx: true }), label: 'javascript' },
  python:     { extension: python(),                  label: 'python' },
  java:       { extension: java(),                    label: 'java' },
  cpp:        { extension: cpp(),                     label: 'cpp' },
  c:          { extension: cpp(),                     label: 'c' }, 
  css:        { extension: css(),                     label: 'css' },
  html:       { extension: html(),                    label: 'html' },
};

export default function CodeInsertModal({ onInsert, onClose }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  const handleInsert = () => {
    if (!code.trim()) return;
    const fenced = `\n\`\`\`${LANGUAGES[language].label}\n${code}\n\`\`\`\n`;
    onInsert(fenced);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200">Insert Code Snippet</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Language picker */}
        <div className="px-4 py-3 border-b border-gray-800">
          <label className="block text-xs font-medium text-gray-400 mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm
                       text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
          </select>
        </div>

        {/* Code editor */}
        <div className="p-4">
          <CodeMirror
            value={code}
            height="280px"
            theme="dark"
            extensions={[LANGUAGES[language].extension]}
            onChange={(val) => setCode(val)}
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              autocompletion: true,     
              bracketMatching: true,   
              closeBrackets: true,     
              indentOnInput: true,     
              tabSize: 2,
            }}
            className="text-sm rounded-lg overflow-hidden border border-gray-700"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-800">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!code.trim()}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Code
          </button>
        </div>

      </div>
    </div>
  );
}
