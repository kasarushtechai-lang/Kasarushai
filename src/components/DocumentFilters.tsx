import React from 'react';
import { 
  SchoolDepartment, 
  DocumentCategory, 
  DocumentPriority, 
  DocumentStatus 
} from '../types';
import { 
  DEPARTMENTS, 
  CATEGORIES, 
  PRIORITIES, 
  STATUSES 
} from '../constants';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  CheckCircle2, 
  HardDrive 
} from 'lucide-react';

interface DocumentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: SchoolDepartment | 'all';
  onDepartmentChange: (dept: SchoolDepartment | 'all') => void;
  selectedCategory: DocumentCategory | 'all';
  onCategoryChange: (cat: DocumentCategory | 'all') => void;
  selectedPriority: DocumentPriority | 'all';
  onPriorityChange: (p: DocumentPriority | 'all') => void;
  selectedStatus: DocumentStatus | 'all';
  onStatusChange: (s: DocumentStatus | 'all') => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  onlyWithDrive: boolean;
  onOnlyWithDriveChange: (val: boolean) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
  selectedYear,
  onYearChange,
  onlyWithDrive,
  onOnlyWithDriveChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  const departmentsList: Array<{ id: SchoolDepartment | 'all'; label: string }> = [
    { id: 'all', label: 'ทุกฝ่ายงาน (ทั้งหมด)' },
    { id: 'academic', label: 'วิชาการ' },
    { id: 'administration', label: 'สารบรรณ/บริหารทั่วไป' },
    { id: 'personnel', label: 'งานบุคคล' },
    { id: 'budget', label: 'แผนงาน/งบประมาณ' },
    { id: 'student_affairs', label: 'กิจการนักเรียน' },
  ];

  const filteredCategories = selectedDepartment === 'all' 
    ? CATEGORIES 
    : CATEGORIES.filter(c => c.department === selectedDepartment);

  return (
    <div className="bg-white border-[3px] border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000] space-y-4">
      {/* Search Bar & Quick Toggles */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          <input
            id="doc-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาชื่อเอกสาร, เลขที่คำสั่ง, ผู้จัดทำ, สาระสำคัญ หรือแท็ก..."
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-neutral-50 hover:bg-white focus:bg-white border-2 border-black rounded-none focus:outline-none focus:ring-0 font-bold text-black placeholder:text-neutral-500 placeholder:font-medium transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-black hover:bg-black hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Academic Year Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>ปีการศึกษา:</span>
          </label>
          <select
            id="filter-academic-year-select"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="text-xs font-black uppercase tracking-wider bg-white border-2 border-black rounded-none px-3 py-2.5 text-black focus:outline-none"
          >
            <option value="all">ทั้งหมด</option>
            <option value="2568">2568 (ปัจจุบัน)</option>
            <option value="2567">2567</option>
            <option value="2566">2566</option>
          </select>
        </div>

        {/* Has Google Drive file toggle */}
        <button
          type="button"
          onClick={() => onOnlyWithDriveChange(!onlyWithDrive)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider border-2 border-black transition-all shrink-0 cursor-pointer ${
            onlyWithDrive
              ? 'bg-black text-yellow-400 shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>มีไฟล์บน Drive</span>
          {onlyWithDrive && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Reset filter button */}
        {hasActiveFilters && (
          <button
            id="reset-filter-btn"
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 border-2 border-black transition-colors shrink-0 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

      {/* Department Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-black font-black uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>ฝ่ายงาน:</span>
        </span>
        {departmentsList.map((dept) => {
          const isActive = selectedDepartment === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => {
                onDepartmentChange(dept.id);
                // If category is not in the newly selected dept, reset category
                if (dept.id !== 'all') {
                  onCategoryChange('all');
                }
              }}
              className={`px-3 py-1.5 whitespace-nowrap font-black uppercase tracking-wider text-xs border-2 border-black transition-all cursor-pointer ${
                isActive
                  ? 'bg-black text-yellow-400 shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-white hover:bg-neutral-100 text-black shadow-[1px_1px_0px_0px_#000]'
              }`}
            >
              {dept.label}
            </button>
          );
        })}
      </div>

      {/* Secondary Dropdown Selectors: Category, Status, Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t-2 border-black">
        {/* Category selector */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1.5">หมวดหมู่เอกสาร</label>
          <select
            id="filter-category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as DocumentCategory | 'all')}
            className="w-full text-xs font-bold bg-white border-2 border-black rounded-none px-3 py-2 text-black focus:outline-none focus:bg-yellow-50"
          >
            <option value="all">หมวดหมู่ทั้งหมด</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.labelTh} ({c.codePrefix})
              </option>
            ))}
          </select>
        </div>

        {/* Status selector */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1.5">สถานะเอกสาร</label>
          <select
            id="filter-status-select"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as DocumentStatus | 'all')}
            className="w-full text-xs font-bold bg-white border-2 border-black rounded-none px-3 py-2 text-black focus:outline-none focus:bg-yellow-50"
          >
            <option value="all">สถานะทั้งหมด</option>
            {Object.entries(STATUSES).map(([key, info]) => (
              <option key={key} value={key}>
                {info.labelTh}
              </option>
            ))}
          </select>
        </div>

        {/* Priority selector */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1.5">ชั้นความเร็ว / ความสำคัญ</label>
          <select
            id="filter-priority-select"
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value as DocumentPriority | 'all')}
            className="w-full text-xs font-bold bg-white border-2 border-black rounded-none px-3 py-2 text-black focus:outline-none focus:bg-yellow-50"
          >
            <option value="all">ความเร็วทั้งหมด</option>
            {Object.entries(PRIORITIES).map(([key, info]) => (
              <option key={key} value={key}>
                {info.labelTh}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
