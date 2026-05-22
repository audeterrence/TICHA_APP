import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  Cpu, 
  FileCheck, 
  MessageSquare,
  ArrowRight,
  TrendingUp,
  RotateCw
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ExtractedTopic {
  id: string;
  name: string;
  weight: number; // percentage appearance
  mastery: number;
}

export const ExamPrep: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [progress, setProgress] = useState(0);

  // Extracted past paper questions mockup
  const [extractedTopics, setExtractedTopics] = useState<ExtractedTopic[]>([]);

  const mockExtracts: Record<string, ExtractedTopic[]> = {
    BAC: [
      { id: 'et1', name: 'Quadratic Functions & Matrices', weight: 45, mastery: 82 },
      { id: 'et2', name: 'Probability Distributions', weight: 30, mastery: 60 },
      { id: 'et3', name: 'Rotational Dynamics (Physics)', weight: 25, mastery: 65 },
    ],
    BEPC: [
      { id: 'et1', name: 'Equations & Inequations (Algebra)', weight: 50, mastery: 90 },
      { id: 'et2', name: 'Thales & Pythagoras Theorems', weight: 30, mastery: 75 },
      { id: 'et3', name: 'Syllable Stress & Grammar', weight: 20, mastery: 85 },
    ],
    'GCE A-Level': [
      { id: 'et1', name: 'Mechanics & Oscillations', weight: 40, mastery: 72 },
      { id: 'et2', name: 'Organic Reaction Pathways', weight: 35, mastery: 48 },
      { id: 'et3', name: 'Differential Equations', weight: 25, mastery: 80 },
    ],
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setParsing(true);
    setParsed(false);
    setProgress(0);

    // Simulate OCR OCR analysis steps
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setParsing(false);
          setParsed(true);
          const activeLevel = user?.level || 'BAC';
          setExtractedTopics(mockExtracts[activeLevel as keyof typeof mockExtracts] || mockExtracts.BAC);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleQueryTemplate = (promptText: string) => {
    navigate('/chat', { state: { initialPrompt: promptText, subject: 'Past Paper Analysis' } });
  };

  const handleReset = () => {
    setFile(null);
    setParsed(false);
    setProgress(0);
    setExtractedTopics([]);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div>
        <h2 className="text-2xl font-black text-slate-850">AI Past Paper Parser (OCR)</h2>
        <p className="text-sm text-slate-400">
          Upload active GCE, Probatoire, or BAC past papers. Ticha AI will scan the topics and prepare adaptive mock questions instantly!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Container Panel */}
        <Card className="lg:col-span-2 space-y-6 flex flex-col justify-center min-h-[380px]">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all ${
                isDragOver 
                  ? 'border-tichaBlue bg-tichaBlue/5' 
                  : 'border-slate-200/80 hover:border-slate-350 bg-slate-50/20'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4.5 border border-slate-200/40">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-850 text-base mb-1">Drag and Drop your past paper</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-6">
                Supports PDF or image files of Cameroonian official exams (BEPC, Probatoire, BAC, GCE). Max size 10MB.
              </p>
              
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,image/*"
                  className="sr-only"
                />
                <Button variant="secondary" className="border-slate-200 shadow-sm text-slate-700 pointer-events-none">
                  Select File from Device
                </Button>
              </label>
            </div>
          ) : parsing ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-tichaPurple/10 flex items-center justify-center text-tichaPurple shadow-sm border border-tichaPurple/10 animate-spin">
                <RotateCw className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-850 text-base">Running Ticha OCR Parser...</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Reading document blocks and extracting Cameroonian national curriculum alignments.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-sm bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-tichaBlue to-tichaPurple h-full rounded-full transition-all duration-150" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-extrabold text-tichaBlue">{progress}% Scanned</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between p-2 space-y-6">
              
              {/* Paper overview card */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-200/50 flex items-center justify-center text-slate-500 border border-slate-200/30">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <h4 className="font-bold text-slate-800 text-sm truncate max-w-[250px]">{file.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleReset}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Clear File
                </button>
              </div>

              {/* Successful scan readout */}
              <div className="p-5 bg-gradient-to-tr from-emerald-50/40 to-teal-50/20 border border-emerald-100 rounded-3xl flex gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                  <FileCheck className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-emerald-800 text-sm">OCR Topic Sync Complete</h4>
                  <p className="text-xs text-emerald-600/90 leading-relaxed">
                    Ticha AI successfully identified {extractedTopics.length} major exam categories matching the active **{user?.level}** board syllabus.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3.5 pt-4">
                <Button 
                  onClick={() => handleQueryTemplate(`Please construct a 5-question review mock quiz focusing on: ${extractedTopics.map(t => t.name).join(', ')}`)}
                  variant="outline"
                >
                  <span>Build Quick Quiz</span>
                </Button>
                <Button 
                  onClick={() => handleQueryTemplate(`Let's discuss the core solutions for GCE/BAC exam questions in: ${file.name}`)}
                >
                  <span>Discuss solutions in Chat</span>
                  <MessageSquare className="w-4 h-4 ml-2" />
                </Button>
              </div>

            </div>
          )}
        </Card>

        {/* Sidebar Panel: Extracted topics and templates */}
        <div className="space-y-6">
          
          {/* Extracted syllabus items */}
          <Card className="space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cpu className="w-4.5 h-4.5 text-tichaBlue" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">OCR Syllabus Weight</h3>
            </div>

            {!parsed ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                Upload a past exam paper to inspect identified curriculum topic weights.
              </div>
            ) : (
              <div className="space-y-4">
                {extractedTopics.map((topic) => (
                  <div key={topic.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 leading-tight truncate max-w-[150px]">{topic.name}</span>
                      <span className="text-tichaBlue font-black">{topic.weight}% Appearances</span>
                    </div>
                    
                    {/* Weight bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-tichaBlue h-full rounded-full" style={{ width: `${topic.weight}%` }} />
                    </div>

                    {/* Student current mastery comparison */}
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase text-slate-400">
                      <span>Your Mastery</span>
                      <span className="text-tichaPurple">{topic.mastery}% Done</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* AI suggestion templates */}
          <Card className="space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-tichaPurple" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">AI Prompt Helpers</h3>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Formulate answering criteria', prompt: 'What are the main scoring criteria examiners use when marking BAC/GCE questions on this topic?' },
                { label: 'Summarize core revision formulas', prompt: 'Create a revision formulas sheet for this parsed document.' },
                { label: 'Create standard quiz questions', prompt: 'Generate 3 high-probability multiple-choice questions matching GCE syllabus standards.' },
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQueryTemplate(template.prompt)}
                  disabled={!parsed}
                  className="w-full text-left p-3 border border-slate-100 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 hover:border-slate-200 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-between gap-2"
                >
                  <span className="truncate">{template.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-tichaPurple shrink-0" />
                </button>
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
