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
      {/* please complete the MarkdownEditor component */}
    </div>
  );
}
