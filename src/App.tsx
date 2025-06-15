import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

function App() {
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ matched: boolean; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBeforeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBeforeImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBeforePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAfterImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAfterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beforeImage || !afterImage) {
      setError("Please upload both before and after images");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('before_image', beforeImage);
      formData.append('after_image', afterImage);

      const response = await fetch('http://localhost:5000/api/compare', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle the error message from the backend
        setError(data.error || 'An error occurred');
        return;
      }

      setResult({
        matched: data.confidence >= 0.45,
        confidence: data.confidence
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBeforeImage(null);
    setAfterImage(null);
    setBeforePreview(null);
    setAfterPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Facial Recognition for Plastic Surgery
          </h1>
          <p className="text-lg text-gray-600">
            Compare before and after images to determine if they belong to the same person
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            {!result ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Before Surgery Image
                    </label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        beforePreview ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                      }`}
                      onClick={() => document.getElementById('before-image-input')?.click()}
                    >
                      {beforePreview ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={beforePreview} 
                            alt="Before preview" 
                            className="w-full h-full object-contain"
                          />
                          <button 
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBeforeImage(null);
                              setBeforePreview(null);
                            }}
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload before image</p>
                        </>
                      )}
                      <input
                        id="before-image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBeforeImageChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      After Surgery Image
                    </label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        afterPreview ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                      }`}
                      onClick={() => document.getElementById('after-image-input')?.click()}
                    >
                      {afterPreview ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={afterPreview} 
                            alt="After preview" 
                            className="w-full h-full object-contain"
                          />
                          <button 
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAfterImage(null);
                              setAfterPreview(null);
                            }}
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload after image</p>
                        </>
                      )}
                      <input
                        id="after-image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAfterImageChange}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                    <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="text-red-800 font-medium mb-1">Error</h3>
                      <p className="text-red-700 text-sm">{error}</p>
                      {(error.includes('file format') || error.includes('File size')) && (
                        <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                          {error.includes('file format') && (
                            <li>Allowed formats: JPG, JPEG, PNG, WEBP</li>
                          )}
                          {error.includes('File size') && (
                            <li>Maximum file size: 15 MB</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={!beforeImage || !afterImage || loading}
                    className={`px-6 py-3 rounded-md text-white font-medium flex items-center ${
                      !beforeImage || !afterImage || loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Compare Images'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  result.matched ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.matched ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                
                <h2 className={`text-2xl font-bold mb-2 ${
                  result.matched ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.matched ? 'Same Person' : 'Different People'}
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Confidence: {(result.confidence * 100).toFixed(2)}%
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                  >
                    Compare Another Pair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
          <Info className="text-blue-500 mr-3 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">How it works:</p>
            <p>
              Our AI model analyzes facial features from both images and compares them to determine if they belong to the same person.
              The confidence score indicates how certain the model is about its prediction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;