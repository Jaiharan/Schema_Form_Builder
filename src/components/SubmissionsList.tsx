import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Search, Download } from 'lucide-react';
import { Submission, Schema } from '../types';

interface SubmissionsListProps {
  submissions: Submission[];
  schema: Schema;
  onClose: () => void;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  schema,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubmissions, setFilteredSubmissions] = useState(submissions);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSubmissions(submissions);
      return;
    }

    const filtered = submissions.filter(submission =>
      JSON.stringify(submission.data)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredSubmissions(filtered);
  }, [searchTerm, submissions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const exportSubmissions = () => {
    const exportData = {
      schema: schema.schema,
      schemaName: schema.name,
      submissions: filteredSubmissions,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name}-submissions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Submissions for {schema.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredSubmissions.length} of {submissions.length} submissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportSubmissions}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export All
            </button>
            <button aria-label='Close'
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {submissions.length === 0
                    ? 'No submissions yet for this form'
                    : 'No submissions match your search'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(submission.submittedAt)}
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        ID: {submission.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-md p-3">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(submission.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};