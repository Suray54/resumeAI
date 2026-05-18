import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resume, Experience, Education, Project } from '@/lib/types';
import { ResumePreview } from '@/components/ResumePreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Save, Download, Sparkles, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';

export function Builder() {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchResume = async () => {
      try {
        const d = await getDoc(doc(db, 'resumes', id));
        if (d.exists()) {
          const data = { id: d.id, ...d.data() } as Resume;
          setResume(data);
          setSkillsInput((data.skills || []).join(', '));
        } else {
          toast.error('Resume not found');
          navigate('/dashboard');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!resume || !id) return;
    setSaving(true);
    try {
      const dataToSave = { ...resume, updatedAt: serverTimestamp() };
      delete dataToSave.id;
      await updateDoc(doc(db, 'resumes', id), dataToSave);
      toast.success('Saved successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onDownloadClick = async () => {
    const element = document.getElementById('print-area');
    if (!element) {
      toast.error('Could not find resume content');
      return;
    }
    
    const toastId = toast.loading('Generating PDF...');
    try {
      // Use modern-screenshot for better quality and robustness with modern CSS
      const { domToPng } = await import('modern-screenshot');
      const { jsPDF } = await import('jspdf');
      
      // Create a temporary container to render the element in full
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm'; 
      
      const clone = element.cloneNode(true) as HTMLElement;
      container.appendChild(clone);
      document.body.appendChild(container);

      // Wait a moment for any potential renders
      await new Promise(r => setTimeout(r, 100));

      // Capture the element as a high-quality PNG
      const dataUrl = await domToPng(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      // Cleanup
      document.body.removeChild(container);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Load image to get dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imgWidth = pageWidth;
      const imgHeight = (img.height * imgWidth) / img.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
      
      // Add subsequent pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${resume?.title || 'resume'}.pdf`);
      toast.success('Downloaded successfully!', { id: toastId });
    } catch (e) {
      console.error('PDF Generation Error:', e);
      toast.error('Failed to generate PDF. Opening print dialog...', { id: toastId });
      window.print();
    }
  };

  const enhanceWithAI = async (text: string, type: string, context?: string, callback?: (res: string) => void) => {
    if (!text.trim()) {
      toast.error("Please enter some text to enhance first.", { duration: 2000 });
      return;
    }
    const toastId = toast.loading('AI is magically enhancing your text...');
    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type, context })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.result && callback) {
        callback(data.result);
        toast.success('Enhanced successfully!', { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to enhance via AI', { id: toastId });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!resume) return null;

  const updatePersonalInfo = (field: string, value: string) => {
    setResume(prev => prev ? { ...prev, personalInfo: { ...prev.personalInfo, [field]: value } } : null);
  };

  const addExperience = () => {
    const newItem: Experience = { id: uuidv4(), company: '', position: '', startDate: '', endDate: '', current: false, description: '' };
    setResume(prev => prev ? { ...prev, experience: [...(prev.experience || []), newItem] } : null);
  };
  const updateExperience = (id: string, field: string, value: any) => {
    setResume(prev => prev ? { ...prev, experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e) } : null);
  };
  const removeExperience = (id: string) => {
    setResume(prev => prev ? { ...prev, experience: prev.experience.filter(e => e.id !== id) } : null);
  };

  const addEducation = () => {
    const newItem: Education = { id: uuidv4(), institution: '', degree: '', startDate: '', endDate: '', description: '' };
    setResume(prev => prev ? { ...prev, education: [...(prev.education || []), newItem] } : null);
  };
  const updateEducation = (id: string, field: string, value: any) => {
    setResume(prev => prev ? { ...prev, education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e) } : null);
  };
  const removeEducation = (id: string) => {
    setResume(prev => prev ? { ...prev, education: prev.education.filter(e => e.id !== id) } : null);
  };

  const addProject = () => {
    const newItem: Project = { id: uuidv4(), title: '', subtitle: '', link: '', description: '' };
    setResume(prev => prev ? { ...prev, projects: [...(prev.projects || []), newItem] } : null);
  };
  const updateProject = (id: string, field: string, value: any) => {
    setResume(prev => prev ? { ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p) } : null);
  };
  const removeProject = (id: string) => {
    setResume(prev => prev ? { ...prev, projects: prev.projects.filter(p => p.id !== id) } : null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      <style>{`
        @media print {
          .hide-print { display: none !important; }
          #print-area { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 210mm; 
            margin: 0; 
            padding: 0;
            z-index: 9999;
          }
          body { background: white !important; }
          .preview-container { background: white !important; padding: 0 !important; }
        }
      `}</style>
      
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0 hide-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-slate-500 hover:bg-slate-50">
            <ChevronLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
            <Input 
              value={resume.title || ''} 
              onChange={(e) => setResume({ ...resume, title: e.target.value })}
              className="w-64 font-semibold text-slate-800 text-sm border-transparent hover:border-slate-200 focus-visible:ring-indigo-500 px-2 shadow-none"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 mr-2">
            <div className={`w-2 h-2 rounded-full ${resume.isPublic ? 'bg-green-500' : 'bg-slate-400'}`}></div>
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">{resume.isPublic ? 'Public' : 'Private'}</span>
          </div>
          <Button variant="outline" onClick={handleSave} disabled={saving} className="gap-2 text-slate-600 hover:bg-slate-50 border-slate-200">
            <Save size={16} /> {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={onDownloadClick} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-lg font-semibold text-sm">
            <Download size={16} /> Download PDF
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left pane: Editor */}
        <div className="w-[450px] shrink-0 border-r border-slate-200 bg-white flex flex-col hide-print">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Tabs defaultValue="basics">
                <TabsList className="w-full grid grid-cols-3 mb-6 bg-gray-100">
                  <TabsTrigger value="basics">Basics</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basics" className="space-y-6">
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Personal Info</h3>
                    <div className="grid gap-3">
                      <Input placeholder="Full Name" value={resume.personalInfo.fullName || ''} onChange={e => updatePersonalInfo('fullName', e.target.value)} />
                      <Input placeholder="Job Title" value={resume.personalInfo.jobTitle || ''} onChange={e => updatePersonalInfo('jobTitle', e.target.value)} />
                      <Input placeholder="Email" type="email" value={resume.personalInfo.email || ''} onChange={e => updatePersonalInfo('email', e.target.value)} />
                      <Input placeholder="Phone" value={resume.personalInfo.phone || ''} onChange={e => updatePersonalInfo('phone', e.target.value)} />
                      <Input placeholder="Location / Address" value={resume.personalInfo.address || ''} onChange={e => updatePersonalInfo('address', e.target.value)} />
                      <Input placeholder="Website / LinkedIn" value={resume.personalInfo.website || ''} onChange={e => updatePersonalInfo('website', e.target.value)} />
                      <Input placeholder="Avatar Image URL (Optional)" value={resume.personalInfo.avatarUrl || ''} onChange={e => updatePersonalInfo('avatarUrl', e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Professional Summary</h3>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors" onClick={() => enhanceWithAI(resume.summary, 'summary', undefined, res => setResume({...resume, summary: res}))}>
                        <Sparkles size={12} /> AI Improve
                      </button>
                    </div>
                    <Textarea 
                      placeholder="Write a brief professional summary..." 
                      className="min-h-[150px] resize-y rounded-lg border-slate-200 focus-visible:ring-indigo-500"
                      value={resume.summary || ''}
                      onChange={e => setResume({...resume, summary: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Skills</h3>
                    <Input 
                      placeholder="React, TypeScript, Node.js (comma separated)" 
                      value={skillsInput} 
                      onChange={e => {
                        setSkillsInput(e.target.value);
                        setResume({...resume, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)});
                      }}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="space-y-8">
                  {/* Experience */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Work Experience</h3>
                       <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addExperience}><Plus size={16} /> Add</Button>
                    </div>
                    
                    {(resume.experience || []).map((exp, idx) => (
                      <div key={exp.id} className="p-4 border rounded-xl bg-gray-50/50 space-y-3 relative group">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500" onClick={() => removeExperience(exp.id)}>
                          <Trash2 size={14} />
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Company" value={exp.company || ''} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                          <Input placeholder="Position" value={exp.position || ''} onChange={e => updateExperience(exp.id, 'position', e.target.value)} />
                          <Input placeholder="Start Date" value={exp.startDate || ''} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                          <Input placeholder="End Date" value={exp.endDate || ''} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} disabled={exp.current} />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <input type="checkbox" id={`curr-${exp.id}`} checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} className="rounded border-gray-300" />
                          <label htmlFor={`curr-${exp.id}`} className="text-sm text-gray-600">I currently work here</label>
                        </div>
                         
                        <div className="relative">
                          <Textarea 
                            placeholder="Description of duties and achievements..." 
                            value={exp.description || ''} 
                            onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                            className="min-h-[100px] mt-2 rounded-lg border-slate-200 focus-visible:ring-indigo-500"
                          />
                          <button 
                            className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors shadow-sm"
                            onClick={() => enhanceWithAI(exp.description, 'job-description', exp.position, (res) => updateExperience(exp.id, 'description', res))}
                          >
                            <Sparkles size={10} /> AI Improve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Education</h3>
                       <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addEducation}><Plus size={16} /> Add</Button>
                    </div>
                    {(resume.education || []).map((edu) => (
                      <div key={edu.id} className="p-4 border rounded-xl bg-gray-50/50 space-y-3 relative group">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500" onClick={() => removeEducation(edu.id)}>
                          <Trash2 size={14} />
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Institution" value={edu.institution || ''} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} />
                          <Input placeholder="Degree" value={edu.degree || ''} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} />
                          <Input placeholder="Start Date" value={edu.startDate || ''} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} />
                          <Input placeholder="End Date" value={edu.endDate || ''} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} />
                        </div>
                        <Textarea 
                          placeholder="Activities, achievements, GPA..." 
                          value={edu.description || ''} 
                          onChange={e => updateEducation(edu.id, 'description', e.target.value)}
                          className="h-20"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Projects */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Projects</h3>
                       <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addProject}><Plus size={16} /> Add</Button>
                    </div>
                    {(resume.projects || []).map((proj) => (
                      <div key={proj.id} className="p-4 border rounded-xl bg-gray-50/50 space-y-3 relative group">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500" onClick={() => removeProject(proj.id)}>
                          <Trash2 size={14} />
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Project Name" value={proj.title || ''} onChange={e => updateProject(proj.id, 'title', e.target.value)} />
                          <Input placeholder="Link (Optional)" value={proj.link || ''} onChange={e => updateProject(proj.id, 'link', e.target.value)} />
                        </div>
                        <Input placeholder="Role / Subtitle" value={proj.subtitle || ''} onChange={e => updateProject(proj.id, 'subtitle', e.target.value)} />
                        <div className="relative">
                          <Textarea 
                            placeholder="Description of the project..." 
                            value={proj.description || ''} 
                            onChange={e => updateProject(proj.id, 'description', e.target.value)}
                            className="min-h-[100px] rounded-lg border-slate-200 focus-visible:ring-indigo-500"
                          />
                          <button 
                            className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors shadow-sm"
                            onClick={() => enhanceWithAI(proj.description, 'rewrite', '', (res) => updateProject(proj.id, 'description', res))}
                          >
                            <Sparkles size={10} /> AI Improve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </TabsContent>

                <TabsContent value="design" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Template</h3>
                    <Select value={resume.template} onValueChange={(val: any) => setResume({...resume, template: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern Professional</SelectItem>
                        <SelectItem value="minimal">Minimal Clean</SelectItem>
                        <SelectItem value="classic">Classic Standard</SelectItem>
                        <SelectItem value="professional">Professional Executive</SelectItem>
                        <SelectItem value="creative">Creative Modern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Accent Color</h3>
                    <div className="flex gap-3">
                      {['#1a1a1a', '#2563eb', '#16a34a', '#dc2626', '#8b5cf6', '#ea580c', '#0d9488'].map(color => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${resume.themeColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setResume({...resume, themeColor: color})}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
              </Tabs>
            </div>
          </div>
        </div>

        {/* Right pane: Preview */}
        <div className="flex-1 bg-slate-100 flex justify-center p-8 sm:p-12 overflow-auto shadow-inner preview-container">
          <div id="print-area">
            <ResumePreview data={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
