/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  SchoolDocument, 
  SchoolDepartment, 
  DocumentCategory, 
  DocumentPriority, 
  DocumentStatus 
} from './types';
import { 
  loadDocuments, 
  addDocument, 
  updateDocument, 
  deleteDocument 
} from './services/storage';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './services/auth';
import { deleteDriveFile, DriveFileInfo } from './services/drive';
import { exportDocumentsToCsv } from './utils/exportCsv';

import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { DocumentFilters } from './components/DocumentFilters';
import { DocumentList } from './components/DocumentList';
import { DocumentModal } from './components/DocumentModal';
import { DocumentDetailDrawer } from './components/DocumentDetailDrawer';
import { DriveFileManager } from './components/DriveFileManager';
import { ConfirmationModal } from './components/ConfirmationModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<SchoolDepartment | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<DocumentPriority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [onlyWithDrive, setOnlyWithDrive] = useState(false);

  // Modals state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SchoolDocument | null>(null);
  const [detailDoc, setDetailDoc] = useState<SchoolDocument | null>(null);
  const [isDriveManagerOpen, setIsDriveManagerOpen] = useState(false);

  // Destructive Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemDetails?: { name: string; code?: string; extra?: string };
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load initial documents from local persistence
  useEffect(() => {
    const loaded = loadDocuments();
    setDocuments(loaded);
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, userToken) => {
        setUser(authedUser);
        setToken(userToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Login handler
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        showToast(`เข้าสู่ระบบ Google สำเร็จ: ${res.user.email}`);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      showToast('การเข้าสู่ระบบ Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      showToast('ออกจากระบบ Google สำเร็จ');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Save (Create or Update) document handler
  const handleSaveDocument = (docData: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingDoc) {
      const updated = updateDocument(editingDoc.id, docData);
      if (updated) {
        setDocuments(loadDocuments());
        showToast(`บันทึกการแก้ไขเอกสาร "${updated.code}" เรียบร้อยแล้ว`);
      }
      setEditingDoc(null);
    } else {
      const created = addDocument(docData);
      setDocuments(loadDocuments());
      showToast(`ลงทะเบียนเอกสารใหม่ "${created.code}" สำเร็จ`);
    }
    setIsDocModalOpen(false);
  };

  // Request Document Deletion (Requires Explicit User Confirmation Dialog)
  const handleRequestDeleteDocument = (doc: SchoolDocument) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบเอกสารโรงเรียน',
      message: doc.driveAttachment
        ? 'คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้ออกจากระบบ และลบไฟล์แนบที่เกี่ยวข้องออกจาก Google Drive? ข้อมูลที่ลบจะไม่สามารถกู้คืนได้'
        : 'คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้ออกจากทะเบียนเอกสารของโรงเรียน? ข้อมูลจะไม่สามารถกู้คืนได้',
      itemDetails: {
        name: doc.title,
        code: doc.code,
        extra: doc.driveAttachment ? `ไฟล์แนบบน Drive: ${doc.driveAttachment.name}` : undefined,
      },
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          // If has Drive file attached, delete it from Google Drive as well
          if (doc.driveAttachment?.fileId && token) {
            try {
              await deleteDriveFile(doc.driveAttachment.fileId);
            } catch (driveErr) {
              console.warn('Could not delete from Google Drive:', driveErr);
            }
          }
          deleteDocument(doc.id);
          setDocuments(loadDocuments());
          if (detailDoc?.id === doc.id) {
            setDetailDoc(null);
          }
          showToast(`ลบเอกสาร "${doc.code}" ออกจากระบบเรียบร้อย`);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          showToast('เกิดข้อผิดพลาดในการลบเอกสาร', 'error');
        } finally {
          setIsConfirmLoading(false);
        }
      },
    });
  };

  // Request Drive File Deletion (Requires Explicit User Confirmation Dialog)
  const handleRequestDeleteDriveFile = (file: DriveFileInfo) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบไฟล์จาก Google Drive',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ "${file.name}" ออกจาก Google Drive ของโรงเรียนอย่างถาวร?`,
      itemDetails: {
        name: file.name,
        code: `Google Drive File ID: ${file.id.substring(0, 12)}...`,
      },
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await deleteDriveFile(file.id);
          showToast(`ลบไฟล์ "${file.name}" ออกจาก Google Drive เรียบร้อย`);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          showToast('ไม่สามารถลบไฟล์ออกจาก Google Drive ได้', 'error');
        } finally {
          setIsConfirmLoading(false);
        }
      },
    });
  };

  // Export CSV handler
  const handleExportCsv = () => {
    exportDocumentsToCsv(documents, `school_documents_registry_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('ดาวน์โหลดสมุดทะเบียนเอกสารโรงเรียน (CSV) สำเร็จ');
  };

  // Filter logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchCode = doc.code.toLowerCase().includes(q);
        const matchIssuer = doc.issuer.toLowerCase().includes(q);
        const matchSummary = doc.summary?.toLowerCase().includes(q) || false;
        const matchTags = doc.tags?.some(t => t.toLowerCase().includes(q)) || false;
        if (!matchTitle && !matchCode && !matchIssuer && !matchSummary && !matchTags) {
          return false;
        }
      }

      // Department
      if (selectedDepartment !== 'all' && doc.department !== selectedDepartment) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'all' && doc.priority !== selectedPriority) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) {
        return false;
      }

      // Academic Year
      if (selectedYear !== 'all' && doc.academicYear !== selectedYear) {
        return false;
      }

      // Only With Drive
      if (onlyWithDrive && !doc.driveAttachment) {
        return false;
      }

      return true;
    });
  }, [
    documents, 
    searchTerm, 
    selectedDepartment, 
    selectedCategory, 
    selectedPriority, 
    selectedStatus, 
    selectedYear, 
    onlyWithDrive
  ]);

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedDepartment !== 'all' || 
    selectedCategory !== 'all' || 
    selectedPriority !== 'all' || 
    selectedStatus !== 'all' || 
    selectedYear !== 'all' || 
    onlyWithDrive;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSelectedYear('all');
    setOnlyWithDrive(false);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans text-black">
      {/* Top Application Header */}
      <Header
        user={user}
        isConnectedToDrive={!!token}
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenNewDocModal={() => {
          setEditingDoc(null);
          setIsDocModalOpen(true);
        }}
        onOpenDriveManager={() => setIsDriveManagerOpen(true)}
        onExportData={handleExportCsv}
        totalDocsCount={documents.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI / Statistical Summary Cards */}
        <StatsOverview
          documents={documents}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={(dept) => setSelectedDepartment(dept)}
          isConnectedToDrive={!!token}
          onConnectDrive={handleLogin}
        />

        {/* Filter Toolbar */}
        <DocumentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onlyWithDrive={onlyWithDrive}
          onOnlyWithDriveChange={setOnlyWithDrive}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* School Documents Table / Card List */}
        <DocumentList
          documents={filteredDocuments}
          onViewDoc={(doc) => setDetailDoc(doc)}
          onEditDoc={(doc) => {
            setEditingDoc(doc);
            setIsDocModalOpen(true);
          }}
          onDeleteDoc={handleRequestDeleteDocument}
          onOpenNewDoc={() => {
            setEditingDoc(null);
            setIsDocModalOpen(true);
          }}
        />
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] text-xs font-black uppercase tracking-wider ${
              toast.type === 'success'
                ? 'bg-yellow-300 text-black'
                : 'bg-rose-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 stroke-[3] text-black shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 stroke-[3] text-white shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Document Registration / Edit Modal */}
      <DocumentModal
        isOpen={isDocModalOpen}
        initialDoc={editingDoc}
        isConnectedToDrive={!!token}
        onLoginGoogle={handleLogin}
        onSave={handleSaveDocument}
        onClose={() => {
          setIsDocModalOpen(false);
          setEditingDoc(null);
        }}
      />

      {/* Document Details Drawer / Modal */}
      <DocumentDetailDrawer
        document={detailDoc}
        isOpen={!!detailDoc}
        onClose={() => setDetailDoc(null)}
        onEdit={(doc) => {
          setDetailDoc(null);
          setEditingDoc(doc);
          setIsDocModalOpen(true);
        }}
        onDelete={handleRequestDeleteDocument}
      />

      {/* Google Drive File Explorer Modal */}
      <DriveFileManager
        isOpen={isDriveManagerOpen}
        isConnectedToDrive={!!token}
        onLoginGoogle={handleLogin}
        onClose={() => setIsDriveManagerOpen(false)}
        onRequestDeleteFile={handleRequestDeleteDriveFile}
      />

      {/* Explicit Confirmation Modal for Destructive Operations (Google Workspace requirement) */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        itemDetails={confirmModal.itemDetails}
        isLoading={isConfirmLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
