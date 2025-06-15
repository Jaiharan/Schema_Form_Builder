import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface SchemaUploadProps {
  onSchemaUpload: (name: string, schema: any) => void;
  loading: boolean;
}

export const SchemaUpload: React.FC<SchemaUploadProps> = ({ onSchemaUpload, loading }) => {
  const [schemaText, setSchemaText] = useState('');
  const [schemaName, setSchemaName] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('Form submit triggered');
    console.log('Schema name:', schemaName);
    console.log('Schema text length:', schemaText.length);
    
    if (!schemaName.trim()) {
      setError('Please enter a schema name');
      return;
    }

    if (!schemaText.trim()) {
      setError('Please provide a JSON schema');
      return;
    }

    try {
      const schema = JSON.parse(schemaText);
      console.log('Parsed schema:', schema);
      setError('');
      onSchemaUpload(schemaName.trim(), schema);
    } catch (err) {
      console.error('JSON parse error:', err);
      setError('Invalid JSON format');
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const schema = JSON.parse(content);
        setSchemaText(JSON.stringify(schema, null, 2));
        setSchemaName(file.name.replace('.json', ''));
        setError('');
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const sampleSchema = {
    type: 'object',
    title: 'User Registration Form',
    description: 'A sample form for user registration',
    properties: {
      firstName: {
        type: 'string',
        title: 'First Name',
        description: 'Enter your first name',
        minLength: 2,
        maxLength: 50
      },
      lastName: {
        type: 'string',
        title: 'Last Name',
        description: 'Enter your last name',
        minLength: 2,
        maxLength: 50
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Email Address',
        description: 'Enter a valid email address'
      },
      age: {
        type: 'integer',
        title: 'Age',
        description: 'Enter your age',
        minimum: 18,
        maximum: 120
      },
      country: {
        type: 'string',
        title: 'Country',
        description: 'Select your country',
        enum: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Other']
      },
      newsletter: {
        type: 'boolean',
        title: 'Subscribe to newsletter',
        description: 'Receive updates and news via email'
      }
    },
    required: ['firstName', 'lastName', 'email', 'age']
  };

  const loadSample = () => {
    setSchemaText(JSON.stringify(sampleSchema, null, 2));
    setSchemaName('User Registration Form');
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Upload JSON Schema</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schema Name *
          </label>
          <input
            type="text"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            placeholder="Enter a name for your schema"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON Schema *
          </label>
          
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop a JSON file here, or
            </p>
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
              <input
                type="file"
                accept=".json"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>

          <textarea
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            placeholder="Or paste your JSON schema here..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            disabled={loading}
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Create Form
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={loadSample}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Load Sample
          </button>
        </div>
      </form>
    </div>
  );
};