import { Resume } from '@/lib/types';
import { Mail, MapPin, Phone, Globe } from 'lucide-react';

export function ResumePreview({ data }: { data: Resume }) {
  const { personalInfo, summary, experience, education, projects, skills, themeColor, template } = data;

  const renderModern = () => (
    <div className="flex flex-col h-full font-sans text-slate-900">
      <header className="border-b-4 pb-6 mb-8 flex justify-between" style={{ borderColor: themeColor }}>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
            {personalInfo.fullName || 'YOUR NAME'}
          </h1>
          <p className="font-bold uppercase tracking-[0.2em] text-xs" style={{ color: themeColor }}>
            {personalInfo.jobTitle || 'Job Title'}
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-[10px] text-slate-500 font-medium">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.email && personalInfo.phone && <span>•</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.phone && personalInfo.address && <span>•</span>}
            {personalInfo.address && <span>{personalInfo.address}</span>}
            {personalInfo.address && personalInfo.website && <span>•</span>}
            {personalInfo.website && <span>{personalInfo.website}</span>}
          </div>
        </div>
        
        {personalInfo.avatarUrl && (
          <img 
            src={personalInfo.avatarUrl} 
            alt="Profile" 
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover shadow-sm border-2"
            style={{ borderColor: themeColor }}
          />
        )}
      </header>

      {summary && (
        <div className="mb-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Summary</h3>
          <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8 flex-1">
        <div className="col-span-8">
          {experience?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Experience</h3>
              {experience.map(exp => (
                <div key={exp.id} className="mb-6">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">{exp.position}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      {exp.startDate} — {exp.current ? 'PRESENT' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold mb-2" style={{ color: themeColor }}>{exp.company}</p>
                  <div className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {projects?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Projects</h3>
              {projects.map(proj => (
                <div key={proj.id} className="mb-6">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">{proj.title}</h4>
                    {proj.link && <a href={proj.link} target="_blank" className="hover:underline text-[10px] font-semibold" style={{ color: themeColor }}>{proj.link}</a>}
                  </div>
                  {proj.subtitle && <p className="text-[10px] font-bold mb-2 text-slate-500">{proj.subtitle}</p>}
                  <div className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">
                    {proj.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-4">
          {skills?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-sm text-[9px] font-bold text-slate-700 uppercase">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {education?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Education</h3>
              {education.map(edu => (
                <div key={edu.id} className="mb-4">
                  <p className="font-bold text-slate-800 text-[10px]">{edu.degree}</p>
                  <p className="text-slate-500 text-[9px] mt-0.5 mb-1">{edu.institution}</p>
                  <div className="text-[8px] text-slate-400 font-semibold mb-1">{edu.startDate} — {edu.endDate}</div>
                  {edu.description && <p className="text-[10px] leading-relaxed text-slate-600 whitespace-pre-wrap">{edu.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="flex flex-col gap-8 font-sans max-w-3xl mx-auto">
      <header className="text-center">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 uppercase">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 mt-3 text-xs tracking-widest uppercase text-gray-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.address && <span>• {personalInfo.address}</span>}
        </div>
      </header>
      
      {summary && (
        <div className="text-center">
          <p className="text-sm text-gray-700 leading-relaxed max-w-2xl mx-auto whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {experience?.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-center mb-6 text-gray-400" style={{ color: themeColor }}>Experience</h2>
          <div className="flex flex-col gap-8">
            {experience.map(exp => (
              <div key={exp.id} className="grid grid-cols-[1fr_3fr] gap-4">
                <div className="text-right text-xs text-gray-500 uppercase tracking-wider pt-0.5">
                  {exp.startDate} — <br/>{exp.current ? 'Present' : exp.endDate}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-base">{exp.position}</h3>
                  <div className="text-sm text-gray-500 mb-2">{exp.company}</div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
       {education?.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-center mb-6 text-gray-400" style={{ color: themeColor }}>Education</h2>
          <div className="flex flex-col gap-6">
            {education.map(edu => (
              <div key={edu.id} className="grid grid-cols-[1fr_3fr] gap-4">
                 <div className="text-right text-xs text-gray-500 uppercase tracking-wider pt-0.5">
                  {edu.startDate} — {edu.endDate}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{edu.degree}</h3>
                  <div className="text-sm text-gray-500">{edu.institution}</div>
                  {edu.description && <p className="text-sm text-gray-600 mt-1">{edu.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
       {skills?.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-center mb-6 text-gray-400" style={{ color: themeColor }}>Skills</h2>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
             {skills.map((skill, idx) => (
                <span key={idx} className="text-sm text-gray-700">
                  {skill}{idx < skills.length - 1 ? '  ·  ' : ''}
                </span>
              ))}
          </div>
        </section>
       )}
    </div>
  );

  const renderClassic = () => (
    <div className="flex flex-col gap-4" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <header className="text-center border-b-[2px] border-black pb-4 mb-2">
        <h1 className="text-[32px] font-bold text-black mb-1">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="text-[13px] text-black">
          {personalInfo.address && <span>{personalInfo.address} | </span>}
          {personalInfo.phone && <span>{personalInfo.phone} | </span>}
          {personalInfo.email && <span className="underline">{personalInfo.email}</span>}
          {personalInfo.website && <span> | {personalInfo.website}</span>}
        </div>
      </header>

      {summary && (
        <section>
          <p className="text-[13px] text-black leading-snug whitespace-pre-wrap">{summary}</p>
        </section>
      )}

      {experience?.length > 0 && (
        <section>
          <h2 className="text-[14px] font-bold uppercase border-b border-black mb-2 pb-[2px]">Experience</h2>
          <div className="flex flex-col gap-3">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <div className="font-bold text-[14px] text-black">{exp.company}</div>
                  <div className="font-bold text-[13px] text-black">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                </div>
                <div className="italic text-[13px] text-black mb-1">{exp.position}</div>
                <div className="text-[13px] text-black whitespace-pre-wrap leading-snug">{exp.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {education?.length > 0 && (
        <section>
          <h2 className="text-[14px] font-bold uppercase border-b border-black mb-2 pb-[2px]">Education</h2>
          <div className="flex flex-col gap-2">
            {education.map(edu => (
              <div key={edu.id}>
                 <div className="flex justify-between items-baseline">
                  <div className="font-bold text-[14px] text-black">{edu.institution}</div>
                  <div className="font-bold text-[13px] text-black">{edu.startDate} - {edu.endDate}</div>
                </div>
                <div className="italic text-[13px] text-black">{edu.degree}</div>
                {edu.description && <div className="text-[13px] text-black mt-1 leading-snug">{edu.description}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {skills?.length > 0 && (
        <section>
          <h2 className="text-[14px] font-bold uppercase border-b border-black mb-2 pb-[2px]">Skills</h2>
          <p className="text-[13px] text-black leading-snug">
             <span className="font-bold">Core Competencies: </span>
             {skills.join(', ')}
          </p>
        </section>
      )}
    </div>
  );

  const renderProfessional = () => (
    <div className="flex flex-col h-full font-sans text-slate-800">
      <header className="flex flex-col mb-8">
        <h1 className="text-4xl font-light tracking-tight text-slate-900 border-b pb-4 mb-4">
          <span className="font-bold">{personalInfo.fullName?.split(' ')[0] || 'YOUR'}</span> {personalInfo.fullName?.split(' ').slice(1).join(' ') || 'NAME'}
        </h1>
        <div className="flex flex-wrap gap-y-2 gap-x-6 text-[11px] font-medium text-slate-500 uppercase tracking-widest">
          {personalInfo.jobTitle && <span className="text-slate-900">{personalInfo.jobTitle}</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.address && <span>{personalInfo.address}</span>}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-4 space-y-8">
          {summary && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-slate-400">Profile</h3>
              <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">{summary}</p>
            </div>
          )}

          {skills?.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-slate-400">Expertise</h3>
              <div className="flex flex-col gap-2">
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></div>
                    <span className="text-[11px] font-medium text-slate-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education?.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-slate-400">Education</h3>
              {education.map(edu => (
                <div key={edu.id} className="mb-4">
                  <p className="font-bold text-slate-800 text-[11px] leading-tight">{edu.degree}</p>
                  <p className="text-slate-500 text-[10px] mt-1">{edu.institution}</p>
                  <div className="text-[9px] text-slate-400 mt-1">{edu.startDate} — {edu.endDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-8 space-y-8">
          {experience?.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5 pb-1 border-b border-slate-100 text-slate-400">Experience</h3>
              <div className="space-y-8">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{exp.position}</h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold mb-3" style={{ color: themeColor }}>{exp.company}</p>
                    <div className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects?.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5 pb-1 border-b border-slate-100 text-slate-400">Projects</h3>
              <div className="space-y-6">
                {projects.map(proj => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                      {proj.link && <a href={proj.link} target="_blank" className="hover:underline text-[10px] font-bold" style={{ color: themeColor }}>Link</a>}
                    </div>
                    <p className="text-[10px] italic mb-2 text-slate-500">{proj.subtitle}</p>
                    <div className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {proj.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCreative = () => (
    <div className="flex h-full font-sans text-slate-800 -m-[15mm]">
      {/* Colorful Sidebar */}
      <div className="w-[80mm] h-full p-10 flex flex-col shrink-0" style={{ backgroundColor: themeColor }}>
        <div className="mb-10 text-center">
          {personalInfo.avatarUrl ? (
            <img 
              src={personalInfo.avatarUrl} 
              alt="Profile" 
              referrerPolicy="no-referrer"
              className="w-32 h-32 rounded-3xl object-cover mx-auto mb-6 border-4 border-white/20 shadow-xl"
            />
          ) : (
            <div className="w-32 h-32 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-6 border-4 border-white/20">
              <span className="text-4xl font-black text-white">{personalInfo.fullName?.[0] || 'R'}</span>
            </div>
          )}
          <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter">
            {personalInfo.fullName || 'RESUME'}
          </h1>
          <p className="text-white/80 text-xs font-bold mt-2 uppercase tracking-widest">{personalInfo.jobTitle}</p>
        </div>

        <div className="space-y-10 text-white flex-1">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white pb-1 border-b border-white/20">Contact</h3>
            <div className="space-y-3 text-[11px]">
              {personalInfo.email && <div className="flex items-center gap-3 opacity-90"><Mail size={14} className="shrink-0" /> {personalInfo.email}</div>}
              {personalInfo.phone && <div className="flex items-center gap-3 opacity-90"><Phone size={14} className="shrink-0" /> {personalInfo.phone}</div>}
              {personalInfo.address && <div className="flex items-center gap-3 opacity-90"><MapPin size={14} className="shrink-0" /> {personalInfo.address}</div>}
              {personalInfo.website && <div className="flex items-center gap-3 opacity-90"><Globe size={14} className="shrink-0" /> {personalInfo.website}</div>}
            </div>
          </div>

          {skills?.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white pb-1 border-b border-white/20">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {education?.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white pb-1 border-b border-white/20">Learning</h3>
              {education.map(edu => (
                <div key={edu.id} className="mb-4 last:mb-0">
                  <p className="font-bold text-[11px]">{edu.degree}</p>
                  <p className="text-white/70 text-[10px] mt-0.5">{edu.institution}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white p-12 overflow-hidden flex flex-col">
        {summary && (
          <div className="mb-12">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 italic">About Me</h3>
            <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap font-medium">{summary}</p>
          </div>
        )}

        <div className="space-y-12 overflow-y-auto">
          {experience?.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8 italic">Experience</h3>
              <div className="space-y-10 relative">
                 {/* Timeline line */}
                <div className="absolute left-[7px] top-2 bottom-5 w-0.5 bg-slate-100"></div>
                
                {experience.map(exp => (
                  <div key={exp.id} className="relative pl-8">
                    <div className="absolute left-0 top-[5px] w-4 h-4 rounded-full border-4 border-white shadow-sm ring-2" style={{ ringColor: themeColor, backgroundColor: themeColor }}></div>
                    <div className="flex flex-col mb-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-black text-slate-900 text-base leading-tight">{exp.position}</h4>
                        <span className="text-[10px] text-slate-400 font-black whitespace-nowrap ml-4">
                          {exp.startDate.split(' ')[0]} — {exp.current ? 'NOW' : exp.endDate.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-xs font-bold mt-1" style={{ color: themeColor }}>{exp.company}</p>
                    </div>
                    <div className="text-xs leading-relaxed text-slate-500 whitespace-pre-wrap">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects?.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8 italic">Creative Lab</h3>
              <div className="grid grid-cols-2 gap-6">
                {projects.map(proj => (
                  <div key={proj.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                    <h4 className="font-black text-slate-900 text-sm mb-1">{proj.title}</h4>
                    {proj.subtitle && <p className="text-[10px] font-bold text-slate-400 mb-3">{proj.subtitle}</p>}
                    <div className="text-[11px] leading-relaxed text-slate-500 whitespace-pre-wrap flex-1 mb-4">
                      {proj.description}
                    </div>
                    {proj.link && (
                      <a href={proj.link} target="_blank" className="text-[10px] font-black uppercase tracking-widest mt-auto hover:opacity-80 transition-opacity" style={{ color: themeColor }}>
                        View project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-[0_0_20px_rgba(0,0,0,0.05)] text-left overflow-hidden" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>
      {template === 'minimal' ? renderMinimal() : 
       template === 'classic' ? renderClassic() : 
       template === 'professional' ? renderProfessional() :
       template === 'creative' ? renderCreative() :
       renderModern()}
    </div>
  );
}
