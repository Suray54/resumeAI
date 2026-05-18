import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { FileText, Sparkles, Wand2, Share2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 w-full mb-10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
            <span className="font-semibold text-slate-800">Resumize AI</span>
          </div>
          <div>
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-lg font-semibold h-9 px-4">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg h-9 px-4">Log In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-32 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-8"
        >
          <Sparkles size={14} />
          AI-powered resume builder
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-900 text-balance leading-[1.1] mb-8"
        >
          Build your AI Resume <br className="hidden md:block"/> in minutes
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl text-balance"
        >
          Create professional resumes, extract data from existing PDFs, and tailor your content to pass ATS systems with the power of artificial intelligence.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to={user ? "/dashboard" : "/login"}>
            <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm font-semibold">
              Get Started for Free
            </Button>
          </Link>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="bg-white py-32 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-500 text-lg">A simple workflow designed to get you hired.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FileText size={32} className="text-indigo-500" />}
              title="Create or Upload"
              desc="Start from scratch or upload your existing PDF resume."
              delay={0}
            />
            <FeatureCard 
              icon={<Wand2 size={32} className="text-amber-500" />}
              title="Enhance with AI"
              desc="Improve wording, fix grammar, and make it ATS-friendly automatically."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Sparkles size={32} className="text-rose-500" />}
              title="Customize Design"
              desc="Choose from beautiful templates and customize colors."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Share2 size={32} className="text-emerald-500" />}
              title="Download or Share"
              desc="Download as a PDF or share via a public, live URL."
              delay={0.3}
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials (Mock) */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="bg-slate-900 text-white rounded-[2rem] p-12 md:p-24 text-center mx-auto md:w-[90%] shadow-2xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 tracking-tight">"This entirely changed how I apply for jobs."</h2>
          <div className="flex justify-center items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-500 overflow-hidden border-2 border-slate-700">
               <img src="https://picsum.photos/seed/avatar1/200/200" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-lg">Jane Doe</p>
              <p className="text-slate-400">Software Engineer</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center p-6"
    >
      <div className="bg-gray-50 flex items-center justify-center rounded-2xl w-20 h-20 mb-6 shadow-sm border border-gray-100">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
