import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TichaLogo } from "../components/common/TichaLogo";
import { BookOpen, BrainCircuit, Target, TrendingUp, Award, ArrowRight, CheckCircle2, Sparkles, Play, Zap, Clock, Users, Star, ChevronDown, Bot, Calculator, Atom, Globe, Feather, Quote, Menu } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export const Home: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: Bot, color: "#7C3AED", title: "AI Chat Tutor", desc: "Chat with your personal AI tutor 24/7. Ask questions, get explanations, solve problems instantly." },
    { icon: Target, color: "#2563EB", title: "Smart Quizzes", desc: "Adaptive quizzes that adjust to your level. Track your progress with real-time mastery metrics." },
    { icon: TrendingUp, color: "#10B981", title: "Study Plans", desc: "AI-generated study plans tailored to your exam date. Stay on track with daily goals." },
    { icon: Award, color: "#F59E0B", title: "Exam Prep", desc: "Comprehensive past papers and exam-focused practice. Master every topic step by step." },
  ];

  const subjects = [
    { icon: Calculator, name: "Mathematics", color: "#2563EB" },
    { icon: Atom, name: "Physics", color: "#7C3AED" },
    { icon: Globe, name: "Geography", color: "#10B981" },
    { icon: Feather, name: "Literature", color: "#F59E0B" },
    { icon: BookOpen, name: "History", color: "#EF4444" },
    { icon: Globe, name: "English", color: "#06B6D4" },
  ];

  const stats = [
    { value: "2,500+", label: "Active Learners", icon: Users },
    { value: "15,000+", label: "Questions Bank", icon: BookOpen },
    { value: "94%", label: "Improve in 30 Days", icon: TrendingUp },
    { value: "4.8/5", label: "Student Rating", icon: Star },
  ];

  const testimonials = [
    { name: "Aisha M.", level: "BAC Candidate", text: "Ticha helped me improve my math score from 8/20 to 15/20 in just 3 weeks!", avatar: "A" },
    { name: "Jean-Pierre K.", level: "GCE O-Level", text: "The AI tutor explains things better than my teacher sometimes. Game changer!", avatar: "J" },
    { name: "Nadia F.", level: "BEPC Student", text: "I love the daily tasks. It keeps me accountable every single day.", avatar: "N" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#2563EB]/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#10B981]/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <TichaLogo size={38} />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0F172A] to-[#2563EB] bg-clip-text text-transparent tracking-tight">Ticha</span>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Subjects", "How It Works"].map((item, i) => (
              <motion.a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="text-sm font-medium text-slate-600 hover:text-[#2563EB] transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-[#2563EB] hover:bg-[#2563EB]/5 rounded-xl transition-all">Sign In</Link>
            <Link to="/signup" className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-xl hover:shadow-lg hover:shadow-[#2563EB]/25 hover:-translate-y-0.5 transition-all">Start Free Trial</Link>
          </motion.div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E293B]/80" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "50px 50px" }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563EB]/20 rounded-full blur-[150px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7C3AED]/20 rounded-full blur-[120px]" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-sm text-white/90 mb-8 backdrop-blur-sm">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}><Sparkles className="w-4 h-4 text-[#7C3AED]" /></motion.div>
            <span>Now with Advanced AI Explanations</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mb-10">
            <div className="relative inline-block">
              <TichaLogo size={100} className="rounded-3xl shadow-2xl shadow-[#2563EB]/30 bg-white p-4" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-2 -right-2 w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></motion.div>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.1]">
            Your AI-Powered<br /><span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#10B981] bg-clip-text text-transparent">Study Companion</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-slate-300 leading-relaxed">
            Meet <strong className="text-white font-semibold">Ticha</strong> the smart study app for Cameroon exams. BEPC, Probatoire, BAC, GCE. AI tutoring, adaptive quizzes, and personalized study plans.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/signup" className="group relative px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-2xl shadow-xl shadow-[#2563EB]/25 hover:shadow-2xl hover:shadow-[#2563EB]/40 transition-all flex items-center gap-3 overflow-hidden">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">Start Learning Free<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <button className="group flex items-center gap-3 px-8 py-4 text-base font-semibold text-white border-2 border-white/20 rounded-2xl hover:bg-white/10 transition-all"><Play className="w-5 h-5" />Watch Demo</button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-16 flex flex-wrap justify-center gap-3">
            {["BEPC", "Probatoire", "BAC", "GCE O-Level", "GCE A-Level"].map((exam, i) => (
              <motion.span key={exam} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.1 }} className="px-4 py-2 bg-white/10 border border-white/10 rounded-full text-sm text-white/80 backdrop-blur-sm">{exam}</motion.span>
            ))}
          </motion.div>

          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mt-20"><ChevronDown className="w-6 h-6 text-white/40 mx-auto" /></motion.div>
        </div>
      </section>

      <section ref={featuresRef} id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full text-sm font-bold uppercase tracking-wider mb-4"><BrainCircuit className="w-4 h-4" />Powered by AI</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight">Everything you need to<span className="block bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent"> ace your exams</span></h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-slate-500">Our AI adapts to your learning style and creates a personalized path to success.</p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate={isFeaturesInView ? "visible" : "hidden"} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} variants={itemVariants} className="group relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#2563EB]/20 transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 to-[#7C3AED]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: f.color + "15" }}><f.icon className="w-7 h-7" style={{ color: f.color }} /></div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-3">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="subjects" className="py-24 px-6 bg-gradient-to-b from-white to-[#F8FAFC] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2563EB]/10 text-[#2563EB] rounded-full text-sm font-bold uppercase tracking-wider mb-4"><BookOpen className="w-4 h-4" />All Subjects Covered</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight">Master every subject</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {subjects.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }} className="group bg-white rounded-2xl p-6 text-center border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: s.color + "15", color: s.color }}><s.icon className="w-6 h-6" /></div>
                <p className="text-sm font-semibold text-slate-700">{s.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 bg-[#0F172A] relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#10B981]/20 text-[#10B981] rounded-full text-sm font-bold uppercase tracking-wider mb-4"><Clock className="w-4 h-4" />Get Started in Minutes</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">How Ticha Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Create Account", desc: "Sign up in 30 seconds. Choose your exam type and subjects." },
              { num: "02", title: "Set Your Goals", desc: "Tell us your exam date and daily study goals. Our AI builds your plan." },
              { num: "03", title: "Learn & Practice", desc: "Chat with AI, take quizzes, track progress. Repeat daily for best results!" },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} viewport={{ once: true }} className="relative">
                <div className="text-7xl font-black text-white/5 select-none">{step.num}</div>
                <h3 className="text-xl font-bold text-white mt-2 mb-2">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-br from-[#2563EB]/5 to-[#7C3AED]/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16"><h2 className="text-4xl font-black text-[#0F172A]">What Students Say</h2></div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
                <Quote className="w-8 h-8 text-[#2563EB]/20 mb-4" />
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(n => <Star key={n} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />)}</div>
                <p className="text-slate-600 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div><p className="font-semibold text-[#0F172A]">{t.name}</p><p className="text-sm text-slate-500">{t.level}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={statsRef} className="py-20 px-6 bg-white relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isStatsInView ? { opacity: 1, y: 0 } : {}} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={isStatsInView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center"><s.icon className="w-7 h-7 text-[#2563EB]" /></div>
                <p className="text-3xl font-black text-[#0F172A]">{s.value}</p>
                <p className="text-sm text-slate-500 font-medium mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-28 px-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#7C3AED]/40" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "30px 30px" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10B981]/20 border border-[#10B981]/20 rounded-full text-sm text-[#10B981] font-bold mb-6"><CheckCircle2 className="w-4 h-4" />No credit card required</div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Start your journey to<span className="block bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent"> exam success</span></h2>
            <p className="text-xl text-slate-300 mb-10 max-w-lg mx-auto">Join 2,500+ students already studying smarter with Ticha. Your first week is completely free.</p>
            <Link to="/signup" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#2563EB] font-bold text-lg rounded-2xl shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all">Create Free Account<ArrowRight className="w-5 h-5" /></Link>
          </motion.div>
        </div>
      </section>

      <footer className="bg-[#0F172A] text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <TichaLogo size={30} />
            <span className="text-xl font-bold text-white tracking-tight">Ticha</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Ticha. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};