import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const FileUpload = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please upload a valid PDF file.');
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('No file selected.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData);
      onSuccess(response.data.id);
      setError('');
      setFile(null); // Reset file input after successful upload
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded-lg shadow-lg">
      
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full p-2 border rounded-md"
        />
        {file && (
          <div className="mt-2 text-sm text-gray-500">
            Selected file: {file.name}
          </div>
        )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
      <button
        onClick={handleFileUpload}
        className={`w-full p-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
};

FileUpload.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};

export default FileUpload;