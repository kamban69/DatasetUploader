"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useEdgeStore } from "./lib/edgestore";
import { useCallback } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [edgeStoreError, setEdgeStoreError] = useState<string | null>(null);

  // Initialize EdgeStore
  const { edgestore } = useEdgeStore();

  // Check if EdgeStore is properly initialized
  useEffect(() => {
    const checkEdgeStore = async () => {
      try {
        // Attempt to initialize EdgeStore
        await fetch('/api/edgestore/init');
        setEdgeStoreError(null);
      } catch (error) {
        console.error('EdgeStore initialization error:', error);
        setEdgeStoreError('Failed to initialize EdgeStore. Please check your environment variables.');
      }
    };
    
    checkEdgeStore();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files);
      setUploadedFiles([...uploadedFiles, ...fileArray]);
      showNotification("Files added to queue", "success");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...fileArray]);
      showNotification("Files added to queue", "success");
    }
  };
  
  // Function to upload files to EdgeStore
  const uploadFilesToEdgeStore = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      showNotification("Please add at least one file", "error");
      return [];
    }

    setIsUploading(true);
    const urls: string[] = [];
    
    try {
      for (const file of uploadedFiles) {
        const res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            // You could update a progress bar here if needed
            console.log(`Upload progress: ${progress}%`);
          },
        });
        urls.push(res.url);
      }
      showNotification("Files uploaded to storage successfully!", "success");
      return urls;
    } catch (error) {
      console.error("Error uploading files:", error);
      showNotification("Error uploading files to storage", "error");
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles, edgestore, showNotification]);

  const handleSaveDataset = async () => {
    if (uploadedFiles.length === 0) {
      showNotification("Please upload at least one file", "error");
      return;
    }
    
    try {
      // Upload files to EdgeStore
      const urls = await uploadFilesToEdgeStore();
      
      if (urls.length > 0) {
        // Save URLs to state for potential future use
        setUploadedUrls(urls);
        showNotification("Dataset saved successfully!", "success");
        setUploadedFiles([]);
        closeModal();
      }
    } catch (error) {
      console.error("Error saving dataset:", error);
      showNotification("Error saving dataset", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* EdgeStore Error Message */}
      {edgeStoreError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{edgeStoreError}</span>
            </div>
            <button 
              onClick={() => setEdgeStoreError(null)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Side Menu */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Dataset Uploader</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul>
            <li className="mb-2">
              <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg bg-gray-100">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                </svg>
                Datasets
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                Approvals
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Datasets</h2>
          <button 
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Dataset
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {uploadedUrls.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Uploaded Datasets</h3>
              <div className="space-y-3">
                {uploadedUrls.map((url, index) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">File {index + 1}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{url}</p>
                      </div>
                    </div>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View File
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No datasets available. Click "New Dataset" to upload files.</p>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Upload Data</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div 
                className={`border-2 border-dashed rounded-lg p-12 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <h4 className="text-xl font-medium text-gray-700 mb-2">Drag & drop files to upload</h4>
                  <p className="text-sm text-gray-500 mb-4">Consider zipping large directories for faster uploads</p>
                  <p className="text-sm text-gray-500 mb-6">or</p>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer">
                    Browse Files
                    <input type="file" className="hidden" multiple onChange={handleFileSelect} />
                  </label>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Uploaded Files ({uploadedFiles.length})</h4>
                  <ul className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="p-3 flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">{(file.size / 1024).toFixed(1)} KB</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200 gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveDataset}
                disabled={isUploading}
                className={`px-4 py-2 text-white font-medium rounded-lg flex items-center ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isUploading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isUploading ? 'Uploading...' : 'Save Dataset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center z-50`}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {notification.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            )}
          </svg>
          {notification.message}
        </div>
      )}
    </div>
  );
}
