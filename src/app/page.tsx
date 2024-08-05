'use client';

import SlateEditor from '@/components/SlateEditor';
import Image from 'next/image';

export default function Home() {
  return (
    <main className='min-h-screen w-11/12 flex flex-col items-center justify-center'>
      <SlateEditor />
    </main>
  );
}
