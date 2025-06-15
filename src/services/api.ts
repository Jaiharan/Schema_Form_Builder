import { Schema, Submission } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  async createSchema(name: string, schema: any): Promise<Schema> {
    const response = await fetch(`${API_BASE}/schemas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, schema }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create schema');
    }

    return response.json();
  },

  async getSchemas(): Promise<Schema[]> {
    const response = await fetch(`${API_BASE}/schemas`);
    if (!response.ok) {
      throw new Error('Failed to fetch schemas');
    }
    return response.json();
  },

  async getSchema(id: string): Promise<Schema> {
    const response = await fetch(`${API_BASE}/schemas/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch schema');
    }
    return response.json();
  },

  async submitForm(schemaId: string, data: any): Promise<Submission> {
    const response = await fetch(`${API_BASE}/schemas/${schemaId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit form');
    }

    return response.json();
  },

  async getSubmissions(schemaId: string): Promise<Submission[]> {
    const response = await fetch(`${API_BASE}/schemas/${schemaId}/submissions`);
    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }
    return response.json();
  },

  async getAllSubmissions(): Promise<Submission[]> {
    const response = await fetch(`${API_BASE}/submissions`);
    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }
    return response.json();
  },

  async deleteSchema(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/schemas/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete schema');
    }
  },
};