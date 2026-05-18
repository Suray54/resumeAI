import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resume } from '@/lib/types';
import { ResumePreview } from '@/components/ResumePreview';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';

export function PublicResume() {
  const { id } = useParams<{id: string}>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchResume = async () => {
      try {
        const d = await getDoc(doc(db, 'resumes', id));
        if (d.exists()) {
          const data = { id: d.id, ...d.data() } as Resume;
          if (data.isPublic) {
            setResume(data);
          } else {
            setError('This resume is private.');
          }
        } else {
          setError('Resume not found.');
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load resume. You may not have access.');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  if (error || !resume) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm">
         <div className="mx-auto bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
         </div>
         <h1 className="text-xl font-bold text-gray-900 mb-2">{error || 'Access Denied'}</h1>
         <p className="text-gray-500 text-sm">The creator has either deleted this resume or made it private.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#edece9] flex flex-col font-sans">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
      
      <header className="fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-6 z-10 hide-print">
        <div className="text-sm font-semibold tracking-wide uppercase text-gray-400">
          Powered by Resumize AI
        </div>
        <Button onClick={() => window.print()} className="gap-2" style={{ backgroundColor: resume.themeColor }}>
          <Download size={16} /> Print / Save PDF
        </Button>
      </header>

      <main className="flex-1 overflow-auto pt-24 pb-12 flex justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          id="print-area"
          className="bg-white shadow-xl rounded-sm print:shadow-none"
        >
          <ResumePreview data={resume} />
        </motion.div>
      </main>
    </div>
  );
}
