import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const AskQuestion = ({ documentId }) => {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      return;
    }

    const newConversation = [...conversation, { question, answer: '...' }];
    setConversation(newConversation);
    setLoading(true);
    setError('');

    try {
      console.log('Sending request to askQuestion API');
      const response = await axios.post('http://localhost:8000/ask/', {
                document_id: documentId,
                question,
                conversation_history: conversation,
            }); 
      console.log('Response received:', response);
      const answer = response.data.answer;

      setConversation((prev) => {
        const updatedConversation = [...prev];
        updatedConversation[updatedConversation.length - 1].answer = answer;
        return updatedConversation;
      });
    } catch (error) {
      console.error('Error asking question:', error);
      setError('Error retrieving the answer. Please try again.');
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded-lg shadow-lg">
      <div className="max-h-96 overflow-y-auto mb-4">
        {conversation.map((entry, index) => (
          <div key={index} className="mb-4">
            <div className="bg-gray-100 p-3 rounded-md mb-2">
              <strong>Q:</strong> {entry.question}
            </div>
            <div className="bg-green-100 p-3 rounded-md">
              <strong>A:</strong> {entry.answer}
            </div>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the document"
          className="flex-grow p-2 border rounded-md mr-2"
          disabled={loading}
        />
        <button
          onClick={handleAskQuestion}
          className={`p-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
          disabled={loading}
        >
          Ask
        </button>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

AskQuestion.propTypes = {
  documentId: PropTypes.string.isRequired,
};

export default AskQuestion;
