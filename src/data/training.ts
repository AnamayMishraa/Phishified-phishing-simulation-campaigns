export interface Course {
  id: string;
  name: string;
  duration: string;
  completed: number;
  total: number;
  category: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  instructor: string;
  skills: string[];
  certificateAvailable: boolean;
  modules: CourseModule[];
}

export interface CourseModule {
  name: string;
  duration: string;
  completed: boolean;
}

export interface Certificate {
  courseId: string;
  courseName: string;
  issuedDate: string;
  expiryDate: string;
  credentialId: string;
  status: "Active" | "Expired";
}

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getCourseCertificate(courseId: string): Certificate | undefined {
  return certificates.find((c) => c.courseId === courseId);
}

export function getCertificates(): Certificate[] {
  return certificates;
}

export const courses: Course[] = [
  {
    id: "1",
    name: "Phishing Foundations: Spotting Red Flags",
    duration: "15 min",
    completed: 840,
    total: 1200,
    category: "Core Training",
    difficulty: "Beginner",
    instructor: "Sarah Mitchell",
    skills: ["Email Security", "Link Analysis", "Threat Detection"],
    certificateAvailable: true,
    description: "Learn to identify the most common phishing indicators including suspicious sender addresses, urgency tactics, and malicious links. Covers email anatomy, header inspection, and URL verification techniques used by modern security teams.",
    modules: [
      { name: "What is Phishing?", duration: "3 min", completed: true },
      { name: "Email Header Analysis", duration: "4 min", completed: true },
      { name: "Link & URL Inspection", duration: "3 min", completed: true },
      { name: "Attachment Safety", duration: "3 min", completed: false },
      { name: "Reporting Phishing Emails", duration: "2 min", completed: false },
    ],
  },
  {
    id: "2",
    name: "Social Engineering Tactics & Pretexting",
    duration: "20 min",
    completed: 320,
    total: 1200,
    category: "Advanced",
    difficulty: "Advanced",
    instructor: "Marcus Chen",
    skills: ["Social Engineering", "Pretexting", "Impersonation Defense"],
    certificateAvailable: true,
    description: "Deep dive into social engineering techniques including pretexting, baiting, tailgating, and advanced impersonation tactics used by modern threat actors targeting enterprise environments.",
    modules: [
      { name: "Social Engineering Overview", duration: "4 min", completed: true },
      { name: "Pretexting Scenarios", duration: "5 min", completed: false },
      { name: "Baiting & Tailgating", duration: "4 min", completed: false },
      { name: "Impersonation Techniques", duration: "4 min", completed: false },
      { name: "Defense Strategies", duration: "3 min", completed: false },
    ],
  },
  {
    id: "3",
    name: "Securing Your Remote Workplace",
    duration: "10 min",
    completed: 950,
    total: 1200,
    category: "Compliance",
    difficulty: "Beginner",
    instructor: "Alex Rivera",
    skills: ["VPN", "Network Security", "Remote Work"],
    certificateAvailable: true,
    description: "Best practices for maintaining security while working remotely, including VPN usage, public Wi-Fi risks, device encryption, and physical security measures for home offices.",
    modules: [
      { name: "Remote Work Threats", duration: "3 min", completed: true },
      { name: "VPN & Network Security", duration: "3 min", completed: true },
      { name: "Device Physical Security", duration: "2 min", completed: true },
      { name: "Home Network Hardening", duration: "2 min", completed: true },
    ],
  },
  {
    id: "4",
    name: "Credential Safety & Multi-Factor Auth",
    duration: "12 min",
    completed: 1100,
    total: 1200,
    category: "Core Training",
    difficulty: "Beginner",
    instructor: "Sarah Mitchell",
    skills: ["Password Management", "MFA", "Account Security"],
    certificateAvailable: false,
    description: "Understanding password security best practices, credential reuse risks, password manager usage, and the critical importance of multi-factor authentication for protecting corporate accounts.",
    modules: [
      { name: "Password Best Practices", duration: "3 min", completed: true },
      { name: "Credential Stuffing Attacks", duration: "3 min", completed: true },
      { name: "Multi-Factor Authentication", duration: "3 min", completed: true },
      { name: "Password Manager Usage", duration: "3 min", completed: true },
    ],
  },
  {
    id: "5",
    name: "Mobile Device Security & SMS Phishing",
    duration: "18 min",
    completed: 180,
    total: 1200,
    category: "Advanced",
    difficulty: "Intermediate",
    instructor: "Marcus Chen",
    skills: ["Mobile Security", "Smishing", "Device Encryption"],
    certificateAvailable: true,
    description: "Specialized training on mobile-specific threats including SMS phishing (smishing), rogue apps, mobile malware, and secure configuration of iOS and Android enterprise devices.",
    modules: [
      { name: "Mobile Threat Landscape", duration: "4 min", completed: true },
      { name: "SMS Phishing Identification", duration: "5 min", completed: false },
      { name: "App Permission Security", duration: "4 min", completed: false },
      { name: "Device Encryption Setup", duration: "5 min", completed: false },
    ],
  },
  {
    id: "6",
    name: "GDPR & Data Privacy Compliance",
    duration: "25 min",
    completed: 640,
    total: 1200,
    category: "Compliance",
    difficulty: "Intermediate",
    instructor: "Emily Watson",
    skills: ["Data Privacy", "GDPR", "CCPA", "Compliance"],
    certificateAvailable: true,
    description: "Comprehensive overview of data privacy regulations including GDPR, CCPA, and HIPAA requirements for handling personal data, breach notification procedures, and privacy-by-design principles.",
    modules: [
      { name: "Privacy Regulation Overview", duration: "5 min", completed: true },
      { name: "Data Classification", duration: "5 min", completed: true },
      { name: "Breach Notification Protocol", duration: "8 min", completed: false },
      { name: "Privacy by Design", duration: "7 min", completed: false },
    ],
  },
];

export const certificates: Certificate[] = [
  { courseId: "1", courseName: "Phishing Foundations: Spotting Red Flags", issuedDate: "2026-02-15", expiryDate: "2027-02-15", credentialId: "CERT-PHISH-2026-001", status: "Active" },
  { courseId: "3", courseName: "Securing Your Remote Workplace", issuedDate: "2026-01-10", expiryDate: "2027-01-10", credentialId: "CERT-REMOTE-2026-003", status: "Active" },
  { courseId: "4", courseName: "Credential Safety & Multi-Factor Auth", issuedDate: "2025-11-20", expiryDate: "2026-11-20", credentialId: "CERT-CRED-2025-004", status: "Active" },
  { courseId: "6", courseName: "GDPR & Data Privacy Compliance", issuedDate: "2025-09-05", expiryDate: "2026-09-05", credentialId: "CERT-GDPR-2025-006", status: "Active" },
];
