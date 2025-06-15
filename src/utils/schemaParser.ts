import { FormField } from '../types';

export const parseSchemaToFields = (schema: any): FormField[] => {
  const fields: FormField[] = [];
  
  if (!schema.properties) return fields;

  Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
    const field: FormField = {
      name: key,
      type: mapJsonTypeToFormType(property.type, property.format),
      label: property.title || key.charAt(0).toUpperCase() + key.slice(1),
      required: schema.required?.includes(key) || false,
      description: property.description,
    };

    // Add constraints based on property type
    if (property.enum) {
      field.options = property.enum;
      field.type = 'select';
    }

    if (property.minimum !== undefined) field.minimum = property.minimum;
    if (property.maximum !== undefined) field.maximum = property.maximum;
    if (property.minLength !== undefined) field.minLength = property.minLength;
    if (property.maxLength !== undefined) field.maxLength = property.maxLength;
    if (property.pattern) field.pattern = property.pattern;
    if (property.format) field.format = property.format;

    fields.push(field);
  });

  return fields;
};

const mapJsonTypeToFormType = (type: string, format?: string): string => {
  if (format) {
    switch (format) {
      case 'email': return 'email';
      case 'date': return 'date';
      case 'date-time': return 'datetime-local';
      case 'time': return 'time';
      case 'uri': return 'url';
      case 'password': return 'password';
      default: break;
    }
  }

  switch (type) {
    case 'string': return 'text';
    case 'number': return 'number';
    case 'integer': return 'number';
    case 'boolean': return 'checkbox';
    case 'array': return 'text'; // Will be handled specially
    default: return 'text';
  }
};

export const validateField = (value: any, field: FormField, schema: any): string | null => {
  const property = schema.properties[field.name];
  
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`;
  }

  if (value === undefined || value === null || value === '') {
    return null; // Optional field, no validation needed
  }

  // Type-specific validation
  switch (field.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
      break;
    
    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Please enter a valid number';
      }
      if (field.minimum !== undefined && numValue < field.minimum) {
        return `Value must be at least ${field.minimum}`;
      }
      if (field.maximum !== undefined && numValue > field.maximum) {
        return `Value must be at most ${field.maximum}`;
      }
      break;
    
    case 'text':
      if (field.minLength !== undefined && value.length < field.minLength) {
        return `Must be at least ${field.minLength} characters`;
      }
      if (field.maxLength !== undefined && value.length > field.maxLength) {
        return `Must be at most ${field.maxLength} characters`;
      }
      if (field.pattern) {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
          return 'Please enter a valid format';
        }
      }
      break;
    
    case 'url':
      try {
        new URL(value);
      } catch {
        return 'Please enter a valid URL';
      }
      break;
  }

  return null;
};