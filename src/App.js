import React, { useState } from 'react';
import { Loader2, Upload, CheckCircle, BrainCircuit, AlertCircle } from 'lucide-react';

const App = () => {
  const [formData, setFormData] = useState({
    question: '',
    solution: '',
    marks: 10,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !formData.solution || !formData.question) {
      setError('Please fill in all fields and select an image');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiUrl = 'http://localhost:5000/api/calculate'; // Adjust URL if needed
      const formDataToSend = new FormData();

      formDataToSend.append('file', selectedFile);
      formDataToSend.append('text', formData.solution);
      formDataToSend.append('marks', formData.marks);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Error evaluating the answer');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
            <BrainCircuit className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white ml-3">
              Auto<span className="text-blue-200">Eval</span>
            </h1>
          </div>
          <p className="text-gray-600">Intelligent Answer Assessment System</p>
        </div>

        {/* Main Form */}
        <div className="bg-white/80 backdrop-blur shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Assessment Details</h2>
          <div className="space-y-6">
            {/* Question Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Question</label>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the question here..."
              />
            </div>

            {/* Solution Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Model Solution</label>
              <textarea
                name="solution"
                value={formData.solution}
                onChange={handleInputChange}
                className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the correct solution here..."
              />
            </div>

            {/* Marks Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Maximum Marks</label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Student Answer</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 transition-colors hover:border-blue-400">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full py-4 px-6 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
                  Evaluating...
                </>
              ) : (
                'Evaluate Answer'
              )}
            </button>

            {/* Results Display */}
            {result && (
              <div className="mt-6 bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Evaluation Results</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Extracted Answer:</p>
                    <p className="text-gray-700">{result.ocr_text}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Score:</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {result.scaled_score.toFixed(1)} / {formData.marks}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
