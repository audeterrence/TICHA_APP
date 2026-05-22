import api, { mockData, safeApiCall } from './api'

export interface ChatSession {
  id: string
  title: string
  subject: string
  date: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const studySkillsBank = [
  { patterns: [/how to study/i, /how do i study/i, /study tip/i, /study for my/i, /exam prep/i], responses: ["Here is what top students do: 1) Pomodoro - 25 mins study, 5 min break. 2) Active recall - close book and test yourself. 3) Spaced repetition - revisit topics.", "Effective revision combines reading, writing, and testing. Try: read 20 mins, write summary from memory, attempt practice questions.", "Three pillars: 1. Understand first. 2. Practice actively. 3. Rest well. You are doing great by asking!"] },
  { patterns: [/motivate/i, /can not focus/i, /tired/i, /exhausted/i, /burnout/i], responses: ["Feeling tired is normal! Rest first, then restart. A 20-minute power nap can reset your brain completely.", "Every hour you study is progress. Consistency beats intensity. Even 30 focused minutes a day adds up to 15+ hours per month. You got this!", "Motivation comes after starting, not before! Just commit to 10 minutes of studying."] },
  { patterns: [/exam tomorrow/i, /exam soon/i, /last minute/i], responses: ["Last-minute prep: 1) Skim notes. 2) Do 3-5 past questions. 3) Sleep early - exhaustion kills performance!", "Focus on high-yield topics - ones that appear frequently in exams."] },
  { patterns: [/forget/i, /can not remember/i, /memory/i, /memorize/i], responses: ["Memory boost: 1) Write it down. 2) Teach it aloud. 3) Use mnemonics.", "Spaced repetition is king! Review today, then 2 days, then 1 week.", "Sleep is crucial! Brain consolidates learning during sleep."] }
]

const mathBank = [
  { patterns: [/algebra/i, /equation/i, /simplify/i, /factor/i], responses: ["Algebra: To solve ax + b = c, subtract b, divide by a. x = (c-b)/a. Try: Solve 3x + 5 = 20.", "Factoring: For x squared + 5x + 6, find numbers that multiply to 6 AND add to 5 (2 and 3). So (x+2)(x+3)."] },
  { patterns: [/geometry/i, /triangle/i, /pythagoras/i, /area/i], responses: ["Pythagoras: a squared + b squared = c squared. If a=3 b=4, c=5. Classic 3-4-5 triangle!", "Area: Triangle = half bh. Circle = pi r squared. Rectangle = l times w."] },
  { patterns: [/trigonometry/i, /sin/i, /cos/i, /tan/i, /sohcahtoa/i], responses: ["SOHCAHTOA! Sin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj. Always relative to your angle!", "Key identity: sin squared theta + cos squared theta = 1."] },
  { patterns: [/calculus/i, /derivative/i, /integration/i, /chain rule/i], responses: ["Differentiation: d/dx(x^n) = n times x^(n-1). So d/dx(x cubed) = 3x squared.", "Chain Rule: dy/dx = f prime of g(x) times g prime of x. Example: y = (3x+1) squared -> dy/dx = 6(3x+1)."] },
  { patterns: [/statistics/i, /mean/i, /probability/i], responses: ["Mean = sum divided by count. Probability: P(event) = favorable divided by total. Example: P(rolling 3 on die) = 1/6."] }
]

const physicsBank = [
  { patterns: [/force/i, /newton/i, /acceleration/i, /motion/i], responses: ["Newton Laws: 1) Objects stay at rest unless acted upon. 2) F=ma. 3) Every action has equal/opposite reaction.", "Kinematics: v = u + at. v=final, u=initial, a=acceleration, t=time. You can solve any motion problem!"] },
  { patterns: [/energy/i, /kinetic/i, /potential/i], responses: ["Energy: KE + PE = constant. KE = half mv squared. PE = mgh.", "Power: P = W/t = Energy/time. A 60W bulb uses 60 Joules per second."] },
  { patterns: [/wave/i, /frequency/i, /light/i, /sound/i], responses: ["Wave equation: v = f lambda. Frequency increases, wavelength decreases if speed constant.", "Sound: Needs medium. Speed 340m/s in air. Louder = bigger amplitude."] },
  { patterns: [/current/i, /voltage/i, /resistance/i, /ohm/i], responses: ["Ohm Law: V = IR. Resistors in series: add up. Resistors in parallel: 1/R = 1/R1 + 1/R2."] }
]

const chemistryBank = [
  { patterns: [/atom/i, /electron/i, /proton/i], responses: ["Atomic structure: Protons (+) neutrons (neutral) in nucleus. Electrons (-) orbit shells.", "Electron config: K=2, L=8, M=18 (octet rule for first 20). Carbon: 1s2 2s2 2p2."] },
  { patterns: [/bond/i, /ionic/i, /covalent/i], responses: ["Ionic: Metal gives electrons to non-metal. Covalent: Non-metals share electrons."] },
  { patterns: [/reaction/i, /equation/i, /balancing/i], responses: ["Balancing: Atoms conserved! Count each on both sides. Adjust coefficients, never subscripts.", "Acid + Base = Salt + Water. pH: 0-14, 7 neutral, less than 7 acidic."] },
  { patterns: [/organic/i, /alkane/i, /alkene/i], responses: ["Alkanes: Single bonds only. Methane CH4, Ethane C2H6.", "Alkenes: C=C double bond. More reactive. Test: bromine water decolorizes."] }
]

const biologyBank = [
  { patterns: [/cell/i, /DNA/i, /mitochondria/i], responses: ["Cell theory: All living things are cells. Plant cells: wall + chloroplasts + central vacuole.", "DNA: Double helix. Complementary base pairing: A-T, G-C."] },
  { patterns: [/genetics/i, /allele/i, /Mendel/i], responses: ["Mendel: 1) Dominance - dominant masks recessive. 2) Segregation - alleles separate during gamete formation.", "Punnett square: Gametes on axes, offspring in boxes. Genotype vs Phenotype."] },
  { patterns: [/ecosystem/i, /food chain/i], responses: ["Food chain: Producer -> Consumer -> Consumer. Energy loses 10 percent at each level."] }
]

const englishBank = [
  { patterns: [/grammar/i, /tense/i, /verb/i], responses: ["Tenses: Present (study), Past (studied), Future (will study). Perfect = completed. Progressive = ongoing.", "Parts of speech: Noun (thing), Verb (action), Adjective (describes noun), Adverb (describes verb)."] },
  { patterns: [/essay/i, /write/i, /composition/i], responses: ["Essay structure: Intro (hook + thesis), Body (Point-Evidence-Analysis), Conclusion.", "Paragraph: Topic sentence + supporting sentences + concluding sentence."] },
  { patterns: [/comprehension/i, /reading/i, /summary/i], responses: ["Comprehension: 1) Skim first. 2) Read actively. 3) Answer in text quotes.", "Inference: Look for clues in word choice, repeated ideas, what author does NOT say."] }
]

function generateAIResponse(msg: string): string {
  const m = msg.toLowerCase()
  if (/^(hi|hello|hey|bonjour|salut)/i.test(m)) return ["Hello! I am Ticha, your AI study assistant. What would you like to learn today?", "Hi! Ready to tackle challenging topics? Ask me about any subject or request study strategies!", "Hey! Great to see you! Whether you need help understanding a concept, want tips, or motivation - I am here to help!"][Math.floor(Math.random() * 3)]
  for (const bank of studySkillsBank) for (const p of bank.patterns) if (p.test(m)) return bank.responses[Math.floor(Math.random() * bank.responses.length)]
  let detected = null
  if (/math|algebra|calculus|geometry/i.test(m)) detected = 'math'
  if (/physics|force|energy|wave/i.test(m)) detected = 'physics'
  if (/chemistry|atom|bond|organic/i.test(m)) detected = 'chemistry'
  if (/biology|cell|DNA|genetics/i.test(m)) detected = 'biology'
  if (/english|grammar|essay/i.test(m)) detected = 'english'
  const banks: Record<string, any[]> = { math: mathBank, physics: physicsBank, chemistry: chemistryBank, biology: biologyBank, english: englishBank }
  if (detected) for (const bank of banks[detected]) for (const p of bank.patterns) if (p.test(m)) return bank.responses[Math.floor(Math.random() * bank.responses.length)]
  if (/\bmath\b/i.test(m)) return "For math, I can help with Algebra, Geometry, Trigonometry, Calculus, Statistics. Which topic confuses you?"
  if (/\bphysics\b/i.test(m)) return "Physics covers Forces, Motion, Waves, Electricity, Energy. What concept shall we explore?"
  if (/\bchemistry\b/i.test(m)) return "Chemistry: Atomic structure, Bonding, Reactions, Organic chemistry. What is your challenge?"
  if (/\bbiol/i.test(m)) return "Biology: Cells, Genetics, Ecology, Evolution. What interests you most?"
  if (/gce.*o.*level|o.?level/i.test(m)) return "GCE O-Level covers core subjects for ages 14-16. Typically 8-10 subjects."
  if (/gce.*a.*level|a.?level/i.test(m)) return "GCE A-Level: specialization after O-Level. Choose 3-4 subjects deeply."
  if (/bepc|probatoire|bac/i.test(m)) return "Cameroon system: BEPC (O-Level equiv), Probatoire (5th year), BAC (final). Preparing for which?"
  return ["Great question! Which subject or chapter is this from? That will help me give the most relevant explanation.", "Always break complex topics into smaller parts. What specific aspect is confusing you?", "Could you share more details? Is this from a subject or past paper?"][Math.floor(Math.random() * 3)]
}

export const getChatSessions = async (): Promise<ChatSession[]> => safeApiCall(api.get("/api/chat/sessions"), mockData.chatSessions, "Sessions")
export const createChatSession = async (subject: string, title?: string): Promise<ChatSession> => {
  const s = subject || "General"
  return safeApiCall(api.post("/api/chat/sessions", { subject: s, title }), { id: `s_${Date.now()}`, title: title || `Tutor: ${s}`, subject: s, date: "Just now" }, "Create")
}
export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  const fallback: ChatMessage[] = mockData.chatMessages[sessionId as keyof typeof mockData.chatMessages] as ChatMessage[] || [{ id: "m_init", role: "assistant", content: "Welcome! I am Ticha, your AI study assistant. Ask me about any subject!" }]
  return safeApiCall(api.get(`/api/chat/messages?session_id=${sessionId}`), fallback, "Messages")
}
export const sendChatMessage = async (sessionId: string, content: string): Promise<ChatMessage> => {
  const reply = generateAIResponse(content)
  await new Promise(r => setTimeout(r, 500 + Math.random() * 500))
  api.post("/api/chat/messages", { session_id: sessionId, content }).catch(() => {})
  return { id: `msg_${Date.now()}`, role: "assistant", content: reply }
}
