import React from 'react';
import { Eye, Monitor, Sparkles, Smartphone, Shield, Lightbulb } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Eye,
      title: "Effortless Overviews",
      description: "Get clear and comprehensive summaries of any document in seconds. Our AI extracts key information to save you time while preserving the original meaning."
    },
    {
      icon: Monitor,
      title: "Intuitive Interface",
      description: "Clean and user-friendly interface that makes document analysis simple. Upload files, get insights, and manage your documents with ease."
    },
    {
      icon: Sparkles,
      title: "Versatile Summaries",
      description: "Choose from various summary types - bullet points, paragraphs, executive summaries, or custom formats tailored to your specific needs."
    },
    {
      icon: Smartphone,
      title: "Works on Any Device",
      description: "Use the AI summarizer on Windows, Mac, Linux, iOS, or Android. Access your summaries from anywhere with our responsive web interface."
    },
    {
      icon: Lightbulb,
      title: "AI-Powered Insights",
      description: "Beyond summaries, get key insights, action items, and relevant information extracted from your documents with advanced AI analysis."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data remains secure with SSL encryption and GDPR compliance. Files are processed securely and never stored without your consent."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Every Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how our AI-powered summarization can transform your document workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
