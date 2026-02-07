'use client';

import { useRouter } from 'next/navigation';
import HeroActionButton from '../ui/HeroActionButton';
import { NotebookAddIcon } from '@/component/icons';

export default function CreateNoteButton() {
  const router = useRouter();

  const handleCreate = () => {
    router.push('/editor/new');
  };

  return (
    <HeroActionButton
      theme="primary"
      icon={<NotebookAddIcon className="w-5 h-5" />}
      onClick={handleCreate}
    >
      New Notebook
    </HeroActionButton>
  );
}
