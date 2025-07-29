import './App.css';
import Detail from './components/Detail';
import Header from './components/Header';
import PDFUploader from './components/PDFUploader';
import ChatInterface from './components/ChatInterface';
import { useState } from 'react';
import Hero from './components/Hero';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Markdown from 'react-markdown';

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
      <div>
        <Header />
        <Hero />

        {/* PDFUploader Full Width */}
        <div className="w-full animate-slide-in mt-6 p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 items-stretch">

              {/* Summary Card */}
              <div className="p-6 rounded-xl border border-white/10 backdrop-blur-md bg-white/5 text-black dark:bg-gray-800 dark:text-white shadow-lg h-full flex flex-col">
                <h2 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                  Generated Summary 🤖
                </h2>

                <div className="flex justify-end mb-2">
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

                <p className="whitespace-pre-line flex-grow">
                  <Markdown>
                  {summary}
                  </Markdown>
                  </p>
              </div>

              {/* Chat Interface */}
              <div className="p-6 h-full">
                <div className="h-full">
                  <ChatInterface summary={summary} />
                </div>
              </div>
            </div>

            {/* Upload Another PDF Button */}
            <div className="text-center py-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
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
