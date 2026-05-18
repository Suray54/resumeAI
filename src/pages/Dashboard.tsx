import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import { Resume } from '@/lib/types';
import { FileText, Plus, MoreVertical, Pencil, Trash2, Link as LinkIcon, Eye, EyeOff, FileUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadResumes = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'resumes'), 
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Resume[];
      // Sorting purely on client for now as Firestore indexing isn't done
      setResumes(data.sort((a,b) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis() || 0));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [user]);

  const handleSignOut = () => {
    auth.signOut();
  };

  const handleCreateNew = async () => {
    if (!user) return;
    try {
      const newResume: Omit<Resume, 'id'> = {
        userId: user.uid,
        title: 'Untitled Resume',
        isPublic: false,
        visibility: 'private',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        themeColor: '#1a1a1a',
        template: 'modern',
        personalInfo: {
          fullName: user.displayName || '',
          jobTitle: '',
          email: user.email || '',
          phone: '',
          address: '',
          website: ''
        },
        summary: '',
        experience: [],
        education: [],
        projects: [],
        skills: []
      };

      const docRef = await addDoc(collection(db, 'resumes'), newResume);
      navigate(`/builder/${docRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create resume');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'resumes', deleteId));
      setResumes(prev => prev.filter(r => r.id !== deleteId));
      toast.success('Resume deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete resume');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleVisibility = async (resume: Resume, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newIsPublic = !resume.isPublic;
      await updateDoc(doc(db, 'resumes', resume.id!), { 
        isPublic: newIsPublic,
        visibility: newIsPublic ? 'public' : 'private',
        updatedAt: serverTimestamp()
      });
      setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, isPublic: newIsPublic, visibility: newIsPublic ? 'public' : 'private' } : r));
      toast.success(`Resume made ${newIsPublic ? 'public' : 'private'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update visibility');
    }
  };

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/resume/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    const toastId = toast.loading('Extracting data from PDF...');
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error(await res.text());
      const extractedData = await res.json();
      
      const newResume: Omit<Resume, 'id'> = {
        userId: user.uid,
        title: `${file.name.replace('.pdf', '')} - Extracted`,
        isPublic: false,
        visibility: 'private',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        themeColor: '#1a1a1a',
        template: 'modern',
        personalInfo: extractedData.personalInfo || {
          fullName: user.displayName || '',
          jobTitle: '',
          email: user.email || '',
          phone: '',
          address: '',
          website: ''
        },
        summary: extractedData.summary || '',
        experience: extractedData.experience || [],
        education: extractedData.education || [],
        projects: extractedData.projects || [],
        skills: extractedData.skills || []
      };

      const docRef = await addDoc(collection(db, 'resumes'), newResume);
      toast.success('Resume extracted successfully', { id: toastId });
      navigate(`/builder/${docRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract resume data', { id: toastId });
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
          <span className="font-semibold text-slate-800">Resumize AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 hidden sm:block">{user?.email}</span>
          <Button variant="ghost" onClick={handleSignOut} className="text-slate-500 hover:bg-slate-50">Log Out</Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Resumes</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and edit your professional resumes.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
            />
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none gap-2 text-slate-600 hover:bg-slate-50 border-slate-200 rounded-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <FileUp size={16} />
              Upload PDF
            </Button>
            <Button onClick={handleCreateNew} className="flex-1 sm:flex-none gap-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700">
              <Plus size={16} />
              New Resume
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map(resume => (
              <Card 
                key={resume.id}
                className="group relative flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md transition-all border border-slate-200 bg-white rounded-2xl"
                onClick={() => navigate(`/builder/${resume.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 inline-flex shrink-0 items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl outline-none" onClick={e => e.stopPropagation()}>
                        <MoreVertical size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
                        <DropdownMenuItem onClick={e => handleCopyLink(resume.id!, e)}>
                          <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={e => handleToggleVisibility(resume, e)}>
                          {resume.isPublic ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                          Make {resume.isPublic ? 'Private' : 'Public'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={e => {
                          e.stopPropagation();
                          navigate(`/builder/${resume.id}`);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-500 hover:text-rose-600" onClick={e => {
                          e.stopPropagation();
                          setDeleteId(resume.id!);
                        }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{resume.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wide font-bold">
                    {resume.template} template
                  </p>
                </div>
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${resume.isPublic ? 'bg-green-500' : 'bg-slate-300'}`} />
                    {resume.isPublic ? 'PUBLIC' : 'PRIVATE'}
                  </div>
                  <div>
                    {new Date(resume.updatedAt?.toMillis() || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </div>
                </div>
              </Card>
            ))}
            
            {resumes.length === 0 && (
              <div 
                onClick={handleCreateNew}
                className="h-[285px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                <div className="bg-slate-100 p-4 rounded-xl mb-4 text-slate-500">
                  <Plus size={32} />
                </div>
                <p className="text-sm font-medium">Create your first resume</p>
              </div>
            )}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
