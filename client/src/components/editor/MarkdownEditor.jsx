import { useCallback, useRef, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import api from '../../api/axios.js';

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your question here. You can use Markdown and paste images directly.',
  minHeight = 300,
}) {

  const uploadingRef = useRef(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  
  // Appends a fenced code block (from CodeInsertModal) to the markdown
  const handleCodeInsert = useCallback((fencedCode) => {
    onChange((prev) => (prev || '') + fencedCode);
  }, [onChange]);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.url;
  };


  const insertImageMarkdown = useCallback((url, currentValue) => {
    const imageMarkdown = `\n![uploaded image](${url})\n`;
    onChange((currentValue || '') + imageMarkdown);
  }, [onChange]);


  const getImageFiles = (dataTransfer) => {
    const files = [];
    if (dataTransfer?.files) {
      for (const file of dataTransfer.files) {
        if (file.type.startsWith('image/')) files.push(file);
      }
    }
    // if pasted from clipboard
    if (dataTransfer?.items) {
      for (const item of dataTransfer.items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    }
    return files;
  };


  const handleImageEvent = useCallback(async (dataTransfer) => {
    if (uploadingRef.current) return; // prevent parallel uploads
    const files = getImageFiles(dataTransfer);
    if (files.length === 0) return;

    uploadingRef.current = true;

    // for user satisfaction
    const placeholder = '\n![uploading...]()\n';
    onChange((value || '') + placeholder);

    try {
      for (const file of files) {
        const url = await uploadImageToCloudinary(file);
        onChange((prev) =>
          (prev || '').replace('![uploading...]()', `![image](${url})`)
        );
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      onChange((prev) => (prev || '').replace('\n![uploading...]()\n', ''));
      alert('Image upload failed. Please try again.');
    } finally {
      uploadingRef.current = false;
    }
  }, [value, onChange]);

  return (
    <div>
      {/* Toolbar above editor */}
      <div className="flex justify-end mb-1.5">
        <button
          type="button"
          onClick={() => setShowCodeModal(true)}
          className="text-xs font-medium text-gray-400 hover:text-brand-500
                     border border-gray-700 hover:border-brand-600 rounded-md
                     px-2.5 py-1 transition-colors"
        >
          {'</> Insert Code'}
        </button>
      </div>

      <div data-color-mode="dark" className="rounded-lg overflow-hidden border border-gray-700">
        <MDEditor
          value={value}
          onChange={onChange}
          height={minHeight}
          preview="edit"
          textareaProps={{ placeholder }}

          // Intercept paste (ctrl+V with an image in clipboard)
          onPaste={async (event) => {
            const files = getImageFiles(event.clipboardData);
            if (files.length > 0) {
              event.preventDefault();
              await handleImageEvent(event.clipboardData);
            }
          }}

          // Intercept drop (drag n drop)
          onDrop={async (event) => {
            const files = getImageFiles(event.dataTransfer);
            if (files.length > 0) {
              event.preventDefault();
              await handleImageEvent(event.dataTransfer);
            }
          }}
        />
      </div>

      {/* Code insert modal */}
      {showCodeModal && (
        <CodeInsertModal
          onInsert={handleCodeInsert}
          onClose={() => setShowCodeModal(false)}
        />
      )}
    </div>
  );
}
