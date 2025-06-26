import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { uploadPDF } from './services/api';

const PDFUploader = ({ onSummaryGenerated, setIsLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      handleFileSelect(file);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleFileSelect = (file) => {
    setError('');
    setSelectedFile(file);
  };

  const handleGenerateSummary = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const summary = await uploadPDF(selectedFile);
      onSummaryGenerated(summary);
    } catch (err) {
      setError(err.message || 'Failed to process PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`transition-all duration-200 p-8 text-center rounded-xl border border-white/10 backdrop-blur-md bg-white/5 ${
        dragActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />

      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <Upload className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Upload PDF
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Drag and drop your PDF here or click to browse
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {selectedFile && (
        <p className="text-gray-600 mb-4 text-sm">
          📄 Selected File: <strong>{selectedFile.name}</strong>
        </p>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200 mr-2"
      >
        Select File
      </button>

      {selectedFile && (
        <button
          onClick={handleGenerateSummary}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 mt-4 transition-all duration-200"
        >
          Generate Summary
        </button>
      )}
    </div>
  );
};

export default PDFUploader;
