import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Menu, X, Sparkles, ArrowRight, Play, Bot, Target, TrendingUp, Award,
  BookOpen, BrainCircuit, Users, Star, ChevronDown, Zap,
  Calculator, Atom, Globe, Heart, Coffee, CheckCircle2
} from "lucide-react";
import TichaLogo from "../assets/ticha-logo.jpg";

// Tilt Card Component
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct);
      y.set(yPct);
    }
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const Home: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const featuresRef = useRef(null);
  const tracksRef = useRef(null);
  const testimonialsRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const isTracksInView = useInView(tracksRef, { once: true, margin: "-100px" });
  const isTestimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: Bot, title: "AI Chat Tutor", desc: "24/7 personal AI that explains anything – like a professor in your pocket.", gradient: "from-violet-500 to-purple-600" },
    { icon: Target, title: "Adaptive Quizzes", desc: "Quizzes that evolve with you. Master every topic at your own pace.", gradient: "from-blue-500 to-cyan-500" },
    { icon: TrendingUp, title: "Smart Study Plans", desc: "AI‑generated daily roadmap for exams or casual learning.", gradient: "from-emerald-500 to-teal-500" },
    { icon: Award, title: "Certificates & Badges", desc: "Earn recognition for every milestone – even casual streaks.", gradient: "from-amber-500 to-orange-500" },
  ];

  const tracks = [
    { icon: Calculator, name: "Mathematics", color: "#3B82F6", desc: "Algebra → Calculus", level: "All levels" },
    { icon: Atom, name: "Physics", color: "#8B5CF6", desc: "Mechanics → Quantum", level: "O/A Level" },
    { icon: Globe, name: "Geography", color: "#10B981", desc: "Maps → Climate", level: "BEPC → BAC" },
    { icon: BookOpen, name: "Literature", color: "#F59E0B", desc: "Poetry → Novels", level: "GCE & beyond" },
    { icon: Heart, name: "Wellness & Focus", color: "#EC4899", desc: "Stress management, study techniques", level: "Casual" },
    { icon: Coffee, name: "Casual Corner", color: "#8B5CF6", desc: "Learn anything, no pressure", level: "For fun" },
  ];

  const testimonials = [
    { name: "Aisha M.", role: "BAC Candidate, Yaoundé", text: "Ticha's AI tutor turned my grades around. From 8/20 to 15/20 in math within a month!", avatar: "A" },
    { name: "David K.", role: "GCE A-Level, Douala", text: "The adaptive quizzes are addictive. I finally understand physics.", avatar: "D" },
    { name: "Sarah L.", role: "Casual Learner", text: "I use the Casual Corner to learn French literature. It's like Duolingo but deeper.", avatar: "S" },
  ];

  const stats = [
    { value: "2,500+", label: "Active Students", icon: Users },
    { value: "15,000+", label: "Practice Questions", icon: BookOpen },
    { value: "94%", label: "Score Improvement", icon: TrendingUp },
    { value: "4.9/5", label: "User Rating", icon: Star },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background – safe gradient + simple grid pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#0F1222] to-[#1A0B2E]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute -top-1/3 -left-1/4 w-[80%] h-[80%] bg-purple-600/30 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[80%] h-[80%] bg-blue-600/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-black/70 backdrop-blur-xl border-b border-white/10 py-3" : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <img src={TichaLogo} alt="Ticha" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">Ticha</span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Tracks", "Testimonials"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="text-sm font-medium text-white/70 hover:text-white transition relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 text-sm font-semibold text-white/80 hover:text-white transition">Sign In</Link>
            <Link to="/signup" className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all">Get Started</Link>
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-white">
              <Menu className="w-6 h-6" />
            </button>
          </motion.div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col p-8">
            <div className="flex justify-end"><button onClick={() => setMobileMenuOpen(false)}><X className="w-8 h-8 text-white" /></button></div>
            <nav className="flex flex-col gap-6 mt-12 text-center">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold">Features</a>
              <a href="#tracks" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold">Tracks</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold">Testimonials</a>
              <div className="flex gap-4 mt-8 justify-center">
                <Link to="/login" className="px-8 py-3 border rounded-full">Sign In</Link>
                <Link to="/signup" className="px-8 py-3 bg-white text-black rounded-full">Sign Up</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-purple-300 mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI‑powered learning – now with Casual Mode</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">Your AI‑Powered</span><br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">Study Companion</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-white/70"
          >
            Whether you're grinding for <strong className="text-white">BEPC, PROBATOIRE, BAC, GCE</strong> or exploring for fun – Ticha adapts to you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-5 justify-center"
          >
            <Link to="/signup" className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all inline-flex items-center gap-2 overflow-hidden">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">Start Learning Free</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 border border-white/20 rounded-full font-semibold backdrop-blur-sm hover:bg-white/10 transition flex items-center gap-2">
              <Play className="w-5 h-5" /> Watch Demo
            </button>
          </motion.div>

          <div className="absolute top-1/4 left-[5%] w-32 h-32 bg-purple-500/30 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-1/4 right-[5%] w-40 h-40 bg-blue-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-1/3 right-[10%] hidden lg:block">
            <Bot className="w-16 h-16 text-purple-400/40" />
          </motion.div>
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-1/3 left-[8%] hidden lg:block">
            <BrainCircuit className="w-20 h-20 text-blue-400/30" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-16">
            <ChevronDown className="w-6 h-6 text-white/40 mx-auto animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="relative py-28 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Powered by Advanced AI
            </span>
            <h2 className="text-4xl md:text-6xl font-black mt-5 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Everything you need to excel
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((f, i) => (
              <motion.div key={i} variants={itemVariants}>
                <TiltCard className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-7 hover:border-purple-500/50 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <f.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-white/60 leading-relaxed">{f.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Learning Tracks */}
      <section id="tracks" ref={tracksRef} className="relative py-28 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isTracksInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-300 font-semibold">
              <BookOpen className="w-4 h-4" /> Choose your path
            </span>
            <h2 className="text-4xl md:text-6xl font-black mt-5 text-white">Learning tracks for everyone</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mt-4">From exam prep to casual curiosity – find your vibe.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10" style={{ color: track.color }}>
                    <track.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{track.name}</h3>
                    <span className="text-xs text-white/40">{track.level}</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm">{track.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                  <s.icon className="w-6 h-6 text-purple-300" />
                </div>
                <p className="text-3xl md:text-4xl font-black text-white">{s.value}</p>
                <p className="text-white/50 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" ref={testimonialsRef} className="relative py-28 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-sm text-emerald-300 font-semibold">
              <Star className="w-4 h-4 fill-emerald-400" /> Real stories
            </span>
            <h2 className="text-4xl md:text-6xl font-black mt-5 text-white">Loved by students</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, n) => <Star key={n} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-white/80 text-lg leading-relaxed">“{t.text}”</p>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-white/40">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-24 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 p-12 shadow-2xl">
            <div className="relative z-10">
              <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Ready to learn smarter?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">Join thousands of students already using Ticha. No credit card required.</p>
              <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all group">
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - using simple text links instead of social icons that may not exist */}
      <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={TichaLogo} alt="Ticha" className="h-8 w-8 rounded-lg" />
                <span className="text-xl font-bold text-white">Ticha</span>
              </div>
              <p className="text-white/50 text-sm max-w-xs">AI-powered exam prep & casual learning for Cameroon and beyond.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#tracks" className="hover:text-white transition">Learning Tracks</a></li>
                <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link to="/casual" className="hover:text-white transition">Casual Mode</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
                <li><a href="/help" className="hover:text-white transition">Help Center</a></li>
                <li><a href="/report-bug" className="hover:text-white transition">Report Bug</a></li>
                <li><a href="/syllabus" className="hover:text-white transition">Syllabus Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><Link to="/terms" className="hover:text-white transition">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <p>&copy; {new Date().getFullYear()} Ticha. All rights reserved.</p>
            <div className="flex gap-5">
              <span className="text-xs">Follow us:</span>
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">Instagram</a>
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};