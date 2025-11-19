import './App.css';
import Detail from './components/Detail';
import Header from './components/Header';
import PDFUploader from './components/PDFUploader';
import ChatInterface from './components/ChatInterface';
import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Markdown from 'react-markdown';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    setSummary('');
    setIsLoading(false);
    setCopied(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-colors duration-300">
        <Header />
        <Hero />

        {/* PDFUploader Full Width */}
        <div className="w-full animate-slide-in mt-6 p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-colors duration-300">
          <div className="border-2 border-dotted border-indigo-500 rounded-lg p-6">
            <PDFUploader onSummaryGenerated={setSummary} setIsLoading={setIsLoading} />
          </div>

          {isLoading && (
            <div className="text-center text-indigo-400 mt-4">
              Processing PDF... please wait.
            </div>
          )}
        </div>

        {/* Show Detail and FAQ only if summary is NOT generated */}
        {!summary && (
          <>
            <Detail />
            <FAQ />
          </>
        )}

      

        {/* Summary + Chat Interface Side by Side */}
        {summary && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-colors duration-300 items-stretch">

              {/* Summary Card */}
              <div className="h-[700px] rounded-xl border border-white/10 backdrop-blur-md bg-white/5 text-black shadow-lg flex flex-col transition-colors duration-300">
                {/* Summary Header - Fixed */}
                <div className="p-6 pb-0 flex-shrink-0">
                  <h2 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                    Generated Summary 🤖
                  </h2>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-500">📄 Scroll to read full summary</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(summary);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                    >
                      {copied ? 'Copied!' : '📄 Copy Summary'}
                    </button>
                  </div>
                </div>

                {/* Summary Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 relative summary-scroll">
                  {/* Scroll indicator gradient */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/20 to-transparent pointer-events-none z-10"></div>
                  
                  <div className="whitespace-pre-line text-sm leading-relaxed pt-2">
                    <ErrorBoundary>
                      <Markdown>
                        {summary || 'No summary available'}
                      </Markdown>
                    </ErrorBoundary>
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="h-[700px]">
                <ChatInterface summary={summary} />
              </div>
            </div>

            {/* Upload Another PDF Button */}
            <div className="text-center py-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-colors duration-300">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300"
              >
                🔁 Upload Another PDF
              </button>
            </div>
          </>
        )}
        
        <Footer />
      </div>
    </>
  );
}

export default App;
