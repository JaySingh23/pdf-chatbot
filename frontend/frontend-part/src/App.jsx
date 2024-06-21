import { useState } from 'react';
import FileUpload from './components/FileUpload';
import AskQuestion from './components/AskQuestion';

const App = () => {
  const [documentId, setDocumentId] = useState(null);

  const handleFileUploadSuccess = (uploadedDocumentId) => {
    setDocumentId(uploadedDocumentId);
  };

  return (
    <div>
      <h1 className="text-center text-3xl m-4">PDF Q&A Application</h1>
      <FileUpload onSuccess={handleFileUploadSuccess} />
      {documentId && <AskQuestion documentId={documentId} />}
    </div>
  );
};

export default App;