import { Slash } from 'lucide-react';

type Tab = { key: string; label: string };

type BreadCrumbProps = {
  isEdit: boolean;
  TABS: Tab[];
  selectedType: string;
};

export const BreadCrumb = ({ isEdit, TABS, selectedType }: BreadCrumbProps) => {
  return (
    <nav className="breadcrumb-nav">
      <span>Test Creation</span>
      <Slash size={10} />
      <span>{isEdit ? 'Edit Test' : 'Create Test'}</span>
      <Slash size={10} />
      <span className="bc-active">
        {TABS.find(t => t.key === selectedType)?.label ?? 'Chapter Wise'}
      </span>
    </nav>
  );
};