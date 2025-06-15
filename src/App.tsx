import React, { useState, useEffect } from 'react';
import { Layout, Plus, List, Upload as UploadIcon } from 'lucide-react';
import { SchemaUpload } from './components/SchemaUpload';
import { DynamicForm } from './components/DynamicForm';
import { SubmissionsList } from './components/SubmissionsList';
import { ImportExport } from './components/ImportExport';
import { api } from './services/api';
import { Schema, Submission } from './types';

type View = 'upload' | 'form' | 'import';

function App() {
  const [currentView, setCurrentView] = useState<View>('upload');
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [currentSchema, setCurrentSchema] = useState<Schema | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    try {
      const fetchedSchemas = await api.getSchemas();
      setSchemas(fetchedSchemas);
    } catch (err) {
      setError('Failed to load schemas');
    }
  };

  const handleSchemaUpload = async (name: string, schema: any) => {
    setLoading(true);
    setError('');
    
    try {
      const newSchema = await api.createSchema(name, schema);
      setSchemas(prev => [...prev, newSchema]);
      setCurrentSchema(newSchema);
      setCurrentView('form');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schema');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (!currentSchema) return;
    
    setLoading(true);
    try {
      await api.submitForm(currentSchema.id, data);
      if (showSubmissions) {
        const updatedSubmissions = await api.getSubmissions(currentSchema.id);
        setSubmissions(updatedSubmissions);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (data: any) => {
    const { schema, formData, schemaName } = data;
    handleSchemaUpload(schemaName || 'Imported Form', schema).then(() => {
      setTimeout(() => {
        if (currentSchema) {
          Object.entries(formData).forEach(([key, value]) => {
            const input = document.querySelector(`[name="${key}"]`) as HTMLInputElement;
            if (input) {
              if (input.type === 'checkbox') {
                input.checked = !!value;
              } else {
                input.value = String(value);
              }
            }
          });
        }
      }, 100);
    });
  };

  const handleViewSubmissions = async () => {
    if (!currentSchema) return;
    
    try {
      const fetchedSubmissions = await api.getSubmissions(currentSchema.id);
      setSubmissions(fetchedSubmissions);
      setShowSubmissions(true);
    } catch (err) {
      setError('Failed to load submissions');
    }
  };

  const handleSchemaSelect = (schema: Schema) => {
    setCurrentSchema(schema);
    setCurrentView('form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Layout className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Schema Form Builder</h1>
            </div>
            
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentView === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Plus className="w-4 h-4" />
                New Schema
              </button>
              
              <button
                onClick={() => setCurrentView('import')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentView === 'import'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <UploadIcon className="w-4 h-4" />
                Import
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <List className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Saved Schemas</h2>
              </div>
              
              {schemas.length === 0 ? (
                <p className="text-gray-500 text-sm">No schemas created yet</p>
              ) : (
                <div className="space-y-2">
                  {schemas.map((schema) => (
                    <button
                      key={schema.id}
                      onClick={() => handleSchemaSelect(schema)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        currentSchema?.id === schema.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{schema.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(schema.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {currentView === 'upload' && (
              <SchemaUpload
                onSchemaUpload={handleSchemaUpload}
                loading={loading}
              />
            )}

            {currentView === 'form' && currentSchema && (
              <DynamicForm
                schema={currentSchema.schema}
                schemaId={currentSchema.id}
                onSubmit={handleFormSubmit}
                onExport={handleExport}
                onViewSubmissions={handleViewSubmissions}
                loading={loading}
              />
            )}

            {currentView === 'import' && (
              <ImportExport onImport={handleImport} />
            )}

            {currentView === 'form' && !currentSchema && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Schema Selected
                </h3>
                <p className="text-gray-600 mb-6">
                  Create a new schema or select an existing one from the sidebar to get started.
                </p>
                <button
                  onClick={() => setCurrentView('upload')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create New Schema
                </button>
              </div>
            )}
          </div>
        </div>

        {showSubmissions && currentSchema && (
          <SubmissionsList
            submissions={submissions}
            schema={currentSchema}
            onClose={() => setShowSubmissions(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;