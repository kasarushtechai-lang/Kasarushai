import { SchoolDocument } from '../types';
import { SAMPLE_DOCUMENTS } from '../constants';

const STORAGE_KEY = 'school_documents_db_v1';

export function loadDocuments(): SchoolDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial sample documents
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DOCUMENTS));
      return SAMPLE_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_DOCUMENTS;
  } catch (e) {
    console.error('Error loading documents from storage:', e);
    return SAMPLE_DOCUMENTS;
  }
}

export function saveDocuments(docs: SchoolDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving documents to storage:', e);
  }
}

export function addDocument(doc: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt'>): SchoolDocument {
  const current = loadDocuments();
  const newDoc: SchoolDocument = {
    ...doc,
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newDoc, ...current];
  saveDocuments(updated);
  return newDoc;
}

export function updateDocument(id: string, updates: Partial<SchoolDocument>): SchoolDocument | null {
  const current = loadDocuments();
  const index = current.findIndex(d => d.id === id);
  if (index === -1) return null;

  const updatedDoc: SchoolDocument = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updatedDoc;
  saveDocuments(current);
  return updatedDoc;
}

export function deleteDocument(id: string): boolean {
  const current = loadDocuments();
  const filtered = current.filter(d => d.id !== id);
  saveDocuments(filtered);
  return true;
}

/**
 * Generate a smart reference document number according to Thai educational standard
 */
export function generateSuggestedCode(categoryPrefix: string, academicYear: string): string {
  const randomNum = Math.floor(Math.random() * 89) + 10;
  return `ศธ 04225/${categoryPrefix} ${randomNum}/${academicYear}`;
}
