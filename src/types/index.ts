export interface Schema {
  id: string;
  name: string;
  schema: any;
  createdAt: string;
}

export interface Submission {
  id: string;
  schemaId: string;
  data: any;
  submittedAt: string;
}

export interface ValidationError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: any;
  message?: string;
}

export interface FormField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  description?: string;
  options?: string[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}