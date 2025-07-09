import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      question: "What file formats can I summarize?",
      answer: "Our AI tool summarizes PDF documents, as well as other formats like DOC, DOCX, TXT, and more. We support most common document types for maximum flexibility."
    },
    {
      question: "Can I use this tool as a chapter summarizer?",
      answer: "Yes, whether it's a textbook, novel, or report, our AI tool quickly summarizes chapters or entire files. Text doesn't need to be long through a word count filter to be helpful."
    },
    {
      question: "Is the AI voice summarizer good for students?",
      answer: "Absolutely! Students can use it to create study notes, summarize textbooks, chapters, and research papers. It's perfect for exam preparation and research."
    },
    {
      question: "What's the best AI PDF summarizer?",
      answer: "That depends on your needs, but our tool offers AI summarization for PDFs, documents, and text files. Simply upload your file and extract the key information quickly."
    },
    {
      question: "How secure is my data with the AI PDF summarizer?",
      answer: "Your files are processed with full encryption and automatically deleted from our servers within 24 hours. We use GDPR-compliant data processing and never store your documents permanently."
    },
    {
      question: "Can I easily download my AI-generated summaries?",
      answer: "Of course! You can quickly copy summaries to your clipboard or download them directly. The tool is perfect for saving multiple note-taking and sharing with others."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI PDF Summarizer FAQs
          </h2>
          <p className="text-xl text-gray-600">
            Common questions about our AI-powered document summarization tool
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-white">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;