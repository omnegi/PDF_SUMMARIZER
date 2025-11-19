import React from 'react';
import { Upload, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 transition-colors duration-300">
            Get Instant AI Summaries of{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Any PDF
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto transition-colors duration-300">
            Transform lengthy documents into concise, actionable insights with our advanced AI technology. 
            Save time and boost productivity with intelligent document summarization.
          </p>

         

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl mx-auto transition-colors duration-300">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Sparkles className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-semibold text-gray-800 transition-colors duration-300">AI-Powered Analysis</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{"< 30s"}</div>
                <div className="text-gray-600">Processing Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-gray-600">File Formats</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;