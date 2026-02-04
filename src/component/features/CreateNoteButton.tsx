'use client';

import { useRouter } from 'next/navigation';
import { File01Icon } from 'hugeicons-react';
import Button from '../ui/Button';

export default function CreateNoteButton() {
  const router = useRouter();

  const handleCreate = () => {
    router.push('/editor/new');
  };

  return (
    <Button onClick={handleCreate}>
      <File01Icon className="w-4 h-4 mr-2" />
      New Note
    </Button>
  );
}
