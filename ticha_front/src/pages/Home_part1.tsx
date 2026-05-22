import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TichaLogo } from "../components/common/TichaLogo";
import { 
  BookOpen, BrainCircuit, Target, TrendingUp, Award,
  ArrowRight, CheckCircle2, Sparkles, Play, Zap,
  Clock, Users, Star, ChevronDown, Bot, Calculator,
  Atom, Globe, Feather, Quote, Menu, X
} from "lucide-react";
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
    { icon: BookMarked, name: "History", color: "#EF4444" },
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