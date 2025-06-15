import React, { useState, useEffect } from 'react';
import { Send, Download, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { FormField } from '../types';
import { parseSchemaToFields, validateField } from '../utils/schemaParser';

interface DynamicFormProps {
  schema: any;
  schemaId: string;
  onSubmit: (data: any) => Promise<void>;
  onExport: (data: any) => void;
  onViewSubmissions: () => void;
  loading: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  schemaId,
  onSubmit,
  onExport,
  onViewSubmissions,
  loading,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<FormField[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const parsedFields = parseSchemaToFields(schema);
    setFields(parsedFields);
    setFormData({});
    setErrors({});
    setSubmitSuccess(false);
  }, [schema]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }

    // Real-time validation
    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(value, field, schema);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(formData[field.name], field, schema);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleExport = () => {
    const exportData = {
      schema,
      schemaId,
      formData,
      exportedAt: new Date().toISOString(),
    };
    onExport(exportData);
  };

  const renderField = (field: FormField) => {
    const error = errors[field.name];
    const value = formData[field.name] || '';

    const baseInputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      error
        ? 'border-red-300 bg-red-50'
        : 'border-gray-300 focus:border-blue-500'
    }`;

    const labelClasses = `block text-sm font-medium mb-2 ${
      error ? 'text-red-700' : 'text-gray-700'
    }`;

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className="mb-4">
            <label className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-600 mb-2">{field.description}</p>
            )}
            <select
              id={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={baseInputClasses}
              required={field.required}
            >
              <option value="">Select an option</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={field.name}
                checked={!!value}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={field.name} className={`ml-2 ${labelClasses.replace('block', 'inline')}`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {field.description && (
              <p className="text-sm text-gray-600 mt-1 ml-6">{field.description}</p>
            )}
            {error && (
              <p className="mt-1 ml-6 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="mb-4">
            <label className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-600 mb-2">{field.description}</p>
            )}
            <input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value ? Number(e.target.value) : '')}
              min={field.minimum}
              max={field.maximum}
              className={baseInputClasses}
              required={field.required}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} className="mb-4">
            <label className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-600 mb-2">{field.description}</p>
            )}
            <input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              minLength={field.minLength}
              maxLength={field.maxLength}
              pattern={field.pattern}
              className={baseInputClasses}
              required={field.required}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {schema.title || 'Dynamic Form'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onViewSubmissions}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Submissions
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {schema.description && (
        <p className="text-gray-600 mb-6">{schema.description}</p>
      )}

      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 font-medium">Form submitted successfully!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(renderField)}

        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Form
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};