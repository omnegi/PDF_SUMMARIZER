import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { uploadPDF } from './services/api';

const PDFUploader = ({ onSummaryGenerated, setIsLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [summaryLength, setSummaryLength] = useState('medium');
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

    console.log('Starting summary generation...');
    console.log('Selected file:', selectedFile.name);

    try {
      setIsLoading(true);
      setError('');

      console.log('Sending request to backend...');
      const response = await uploadPDF(selectedFile, summaryLength);
      console.log('Backend response:', response);

      if (response && response.summary) {
        console.log('Summary received:', response.summary);
        onSummaryGenerated(response.summary);
      } else if (response && typeof response === 'string') {
        console.log('String response received:', response);
        onSummaryGenerated(response);
      } else {
        console.error('Unexpected response format:', response);
        setError('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setError(error.message || 'Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('Summary generation completed');
    }
  };

  return (
    <div
      className={`transition-all duration-300 p-8 text-center rounded-xl bg-blue-900/80 backdrop-blur-md ${
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
    <p className="text-sm text-white/80 mb-4 transition-colors duration-300">
        Drag and drop your PDF here or click to browse
      </p>

      {error && <p className="text-red-500 mb-4 transition-colors duration-300">{error}</p>}

      {selectedFile && (
        <p className="text-gray-200 mb-4 text-sm transition-colors duration-300">
          📄 Selected File: <strong>{selectedFile.name}</strong>
        </p>
      )}

      {selectedFile && (
        <div className="mb-4">
          <label className="block text-white/90 text-sm font-medium mb-2">
            Summary Length:
          </label>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSummaryLength('short')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                summaryLength === 'short'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              Short
            </button>
            <button
              onClick={() => setSummaryLength('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                summaryLength === 'medium'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setSummaryLength('long')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                summaryLength === 'long'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              Long
            </button>
          </div>
          <p className="text-white/60 text-xs mt-2 text-center">
            {summaryLength === 'short' && 'Quick overview (2-3 paragraphs)'}
            {summaryLength === 'medium' && 'Balanced summary (4-6 paragraphs)'}
            {summaryLength === 'long' && 'Detailed analysis (7+ paragraphs)'}
          </p>
        </div>
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
          Generate Summary ({summaryLength.charAt(0).toUpperCase() + summaryLength.slice(1)})
        </button>
      )}
    </div>
  );
};

export default PDFUploader;
