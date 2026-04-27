import {
  Quiz, Psychology, Groups, MenuBook, Event, School,
  TrendingUpOutlined, ShieldOutlined, StarOutlined,
} from "@mui/icons-material";

// ─── Nav ──────────────────────────────────────────────────────────────────────

export const navLinks = [
  { key: "resources", labelKey: "publicHome.header.nav.resources" },
];

// ─── University tags ──────────────────────────────────────────────────────────

export const universityTags = [
  "Mohammed V University",
  "Cadi Ayyad University",
  "Hassan II University",
  "University of Ibn Zohr",
  "Abdelmalek Essaadi University",
  "Sidi Mohamed Ben Abdellah University",
  "ENSA Marrakech",
  "FST Settat",
  "ENSA Agadir",
  "EST Casablanca",
  "Faculty of Sciences Rabat",
  "EMI Rabat",
];

// ─── AI feature cards ─────────────────────────────────────────────────────────

export const aiCards = [
  {
    icon: Quiz,
    title: "Practice with Quizzes & Exams",
    description:
      "Generate revision quizzes from curated material and train confidently before exam day.",
  },
  {
    icon: Psychology,
    title: "Get AI Learning Summaries",
    description:
      "Transform long resources into concise, structured summaries to accelerate understanding.",
  },
  {
    icon: Groups,
    title: "Study with Your Peers",
    description:
      "Share references and collaborate with students from your academic track.",
  },
];

// ─── MUS Role Pillars ─────────────────────────────────────────────────────────
// Consumed by <PublicRoleSection pillars={musRolePillars} />
// Shape is fully compatible with the RoleCard component.

export const musRolePillars = [
  {
    id: "resources",
    Icon: MenuBook,
    SubIcon: TrendingUpOutlined,
    badge: "publicHome.role.pillars.resources.badge",
    badgeFallback: "Academic Resources",
    titleKey: "publicHome.role.pillars.resources.title",
    title: "Everything you need to study",
    descKey: "publicHome.role.pillars.resources.description",
    desc: "Browse thousands of verified notes, past exams, and course summaries from Moroccan and international universities — organized by module, level, and institution.",
    stat: {
      valueKey: "publicHome.role.pillars.resources.stat.value",
      value: "50M+",
      labelKey: "publicHome.role.pillars.resources.stat.label",
      label: "Resources available",
    },
    ctaKey: "publicHome.role.pillars.resources.cta",
    ctaFallback: "Explore resources",
    features: [
      { key: "publicHome.role.pillars.resources.f1", fallback: "Notes, exams & summaries by module" },
      { key: "publicHome.role.pillars.resources.f2", fallback: "Filter by university, program & level" },
      { key: "publicHome.role.pillars.resources.f3", fallback: "Community ratings & verified quality" },
      { key: "publicHome.role.pillars.resources.f4", fallback: "Download instantly or save for later" },
    ],
  },
  {
    id: "exams",
    Icon: Quiz,
    SubIcon: StarOutlined,
    badge: "publicHome.role.pillars.exams.badge",
    badgeFallback: "Exam Preparation",
    titleKey: "publicHome.role.pillars.exams.title",
    title: "Prepare smarter, score higher",
    descKey: "publicHome.role.pillars.exams.description",
    desc: "Access structured past exam papers and practice quizzes tailored to your course. Track your weak areas and revise with confidence before exam day.",
    stat: {
      valueKey: "publicHome.role.pillars.exams.stat.value",
      value: "1B+",
      labelKey: "publicHome.role.pillars.exams.stat.label",
      label: "Students helped",
    },
    ctaKey: "publicHome.role.pillars.exams.cta",
    ctaFallback: "Start practicing",
    features: [
      { key: "publicHome.role.pillars.exams.f1", fallback: "Past papers from real university exams" },
      { key: "publicHome.role.pillars.exams.f2", fallback: "AI-generated revision quizzes" },
      { key: "publicHome.role.pillars.exams.f3", fallback: "Personalized weak-area tracking" },
      { key: "publicHome.role.pillars.exams.f4", fallback: "Progress analytics on your dashboard" },
    ],
  },
  {
    id: "clubs",
    Icon: Event,
    SubIcon: Groups,
    badge: "publicHome.role.pillars.clubs.badge",
    badgeFallback: "Campus Life",
    titleKey: "publicHome.role.pillars.clubs.title",
    title: "Stay connected on campus",
    descKey: "publicHome.role.pillars.clubs.description",
    desc: "Coordinate university clubs, academic events, and peer study groups. Everything from scheduling to resource sharing in one place.",
    stat: {
      valueKey: "publicHome.role.pillars.clubs.stat.value",
      value: "120K+",
      labelKey: "publicHome.role.pillars.clubs.stat.label",
      label: "Institutions worldwide",
    },
    ctaKey: "publicHome.role.pillars.clubs.cta",
    ctaFallback: "Discover events",
    features: [
      { key: "publicHome.role.pillars.clubs.f1", fallback: "Create & manage academic clubs" },
      { key: "publicHome.role.pillars.clubs.f2", fallback: "Schedule events & study sessions" },
      { key: "publicHome.role.pillars.clubs.f3", fallback: "Share resources within your group" },
      { key: "publicHome.role.pillars.clubs.f4", fallback: "Real-time announcements & updates" },
    ],
  },
  {
    id: "educators",
    Icon: School,
    SubIcon: ShieldOutlined,
    badge: "publicHome.role.pillars.educators.badge",
    badgeFallback: "For Educators",
    titleKey: "publicHome.role.pillars.educators.title",
    title: "Teach, publish & earn",
    descKey: "publicHome.role.pillars.educators.description",
    desc: "Upload and organize your course materials. Monitor how students interact with your content and earn from premium resources — all with admin-backed verification.",
    stat: {
      valueKey: "publicHome.role.pillars.educators.stat.value",
      value: "100%",
      labelKey: "publicHome.role.pillars.educators.stat.label",
      label: "Verified content",
    },
    ctaKey: "publicHome.role.pillars.educators.cta",
    ctaFallback: "Start publishing",
    features: [
      { key: "publicHome.role.pillars.educators.f1", fallback: "Publish notes, exams & course packs" },
      { key: "publicHome.role.pillars.educators.f2", fallback: "Admin-verified content quality badge" },
      { key: "publicHome.role.pillars.educators.f3", fallback: "Engagement & download analytics" },
      { key: "publicHome.role.pillars.educators.f4", fallback: "Wallet earnings from premium content" },
    ],
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const testimonials = [
  {
    title: "Excellent",
    text: "I found focused notes and exam summaries that match my exact semester and modules.",
  },
  {
    title: "Game changer",
    text: "The recommendation feed saves me hours every week. I no longer search across random groups.",
  },
  {
    title: "High quality",
    text: "Moderation + ratings made it much easier to trust what I download and revise from.",
  },
];

// ─── Footer columns ───────────────────────────────────────────────────────────

export const footerCols = {
  Company: ["About MUS", "Academic Integrity", "Premium", "Jobs", "Blog"],
  "Contact & Help": ["FAQ", "Support", "Newsroom", "Guides"],
  Legal: ["Terms", "Privacy Policy", "Cookie Settings", "Copyright"],
};