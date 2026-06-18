import { Candidate, IndianContext } from '../types';

// Standard English stop words
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
  'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
  'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
  "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
  'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
  'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
  'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't", 'with', 'about', 'contact', 'phone',
  'email', 'resume', 'cv', 'experience', 'education', 'skills'
]);

// Large dictionary of predefined software engineering, data science, frontend, and soft skills
export const SKILL_LIBRARY = [
  // Languages
  "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "rust", "swift", "kotlin", "ruby", "php", "scala", "matlab",
  // Web Frameworks & Frontend
  "django", "flask", "fastapi", "node.js", "express", "react", "angular", "vue", "next.js", "tailwind css", "tailwind", "bootstrap", "html", "css", "jquery", "sass", "graphql",
  // Databases & Caching
  "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis", "cassandra", "elasticsearch", "oracle", "mariadb", "dynamodb",
  // Data Science, ML & AI
  "numpy", "pandas", "scikit-learn", "tensorflow", "keras", "pytorch", "nlp", "spacy", "nltk", "machine learning", "deep learning", "artificial intelligence", "r", "tableau", "power bi", "data analysis", "data analyst", "selenium", "scipy", "seaborn",
  // Cloud, DevOps & Tools
  "git", "github", "docker", "kubernetes", "aws", "azure", "gcp", "devops", "ci/cd", "jenkins", "linux", "nginx", "apache", "terraform", "ansible", "prometheus", "grafana",
  // Soft Skills
  "communication", "teamwork", "leadership", "problem solving", "critical thinking", "adaptability", "time management", "creativity", "collaboration", "analytical skills", "project management", "agile", "scrum",
  // Experience/Level Badges
  "fresher", "entry level", "12th pass", "high school", "intermediate"
];

/**
 * Text Preprocessing Pipeline
 * - Convey everything to lowercase
 * - Strip punctuation
 * - Filter stopwords
 * - Trim extra spaces
 */
export function cleanText(text: string): string {
  if (!text) return "";
  
  // Lowercase
  let cleaned = text.toLowerCase();
  
  // Replace punctuation with spaces
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ");
  
  // Split into tokens
  const words = cleaned.split(/\s+/);
  
  // Filter stop words and numbers (unless they are relevant, like 91)
  const filteredWords = words.filter(word => {
    return word.length > 1 && !STOP_WORDS.has(word);
  });
  
  return filteredWords.join(" ");
}

/**
 * Identify and Extract Skills from a clean string
 */
export function extractSkills(text: string): string[] {
  if (!text) return [];
  const textLower = text.toLowerCase();
  const extracted = new Set<string>();
  
  for (const skill of SKILL_LIBRARY) {
    // Escape regex characters
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    if (regex.test(textLower)) {
      extracted.add(skill.toUpperCase() === 'NLP' || skill.toUpperCase() === 'SQL' ? skill.toUpperCase() : skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }
  
  return Array.from(extracted);
}

/**
 * Extract Indian Universities, Phone, Grades and Emails
 */
export function parseIndianResumeContext(rawText: string): IndianContext {
  const details: IndianContext = {
    degrees: [],
    universities: [],
    cgpaPercentage: "Not Specified",
    phone: "Not Found",
    email: "Not Found",
    location: "India"
  };

  if (!rawText) return details;

  // 1. Extract Email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const emailMatch = rawText.match(emailRegex);
  if (emailMatch) {
    details.email = emailMatch[0];
  }

  // 2. Extract Phone (Indian phone format, including country code +91)
  const phonePatterns = [
    /(?:\+91[\s\-]?)?[6789]\d{9}/,                        // +91 9876543210 or 9876543210
    /(?:\+91[\s\-]?\d{5}[\s\-]?\d{5})/,                   // +91-98765-43210
    /\b\d{10}\b/                                          // Standard 10 digits
  ];
  for (const pattern of phonePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      details.phone = match[0];
      // Format to start with +91 if matching 10 digits without code
      if (details.phone.length === 10 && !details.phone.startsWith("+91")) {
        details.phone = "+91 " + details.phone;
      }
      break;
    }
  }

  // 3. Indian Common Locations
  const cities = ["bengaluru", "bangalore", "mumbai", "delhi", "noida", "gurugram", "gurgaon", "pune", "chennai", "hyderabad", "kolkata", "ahmedabad", "jaipur", "kochi"];
  const rawLower = rawText.toLowerCase();
  for (const city of cities) {
    if (rawLower.includes(city)) {
      details.location = city.charAt(0).toUpperCase() + city.slice(1) + ", India";
      break;
    }
  }

  // 4. Indian Degrees standard mapping
  const degreeMap: Record<string, RegExp> = {
    "B.Tech (Bachelor of Technology)": /\bb\.?\s*tech\b|bachelor\s+of\s+technology/i,
    "B.E (Bachelor of Engineering)": /\bb\.?\s*e\.?\b|bachelor\s+of\s+engineering/i,
    "M.Tech (Master of Technology)": /\bm\.?\s*tech\b|master\s+of\s+technology/i,
    "MCA (Master of Computer Appl.)": /\bm\.?\s*c\.?\s*a\.?\b|master\s+of\s+computer\s+applications/i,
    "BCA (Bachelor of Computer Appl.)": /\bb\.?\s*c\.?\s*a\.?\b|bachelor\s+of\s+computer\s+applications/i,
    "MBA (Master of Business Admin.)": /\bm\.?\s*b\.?\s*a\.?\b|master\s+of\s+business\s+administration/i,
    "B.Sc (Bachelor of Science)": /\bb\.?\s*sc\b|bachelor\s+of\s+science/i,
    "M.Sc (Master of Science)": /\bm\.?\s*sc\b|master\s+of\s+science/i,
    "B.Com (Bachelor of Commerce)": /\bb\.?\s*com\b|bachelor\s+of\s+commerce/i,
    "12th Pass (Higher Secondary)": /\b12th\s*(?:pass|standard|class|grade)?\b|\bhigher\s+secondary\b|\bintermediate\s*(?:education|certificate)?\b|cbse\s+class\s+12\b|\bi\.s\.c\b|\bhsc\b/i,
    "10th Pass (High School)": /\b10th\s*(?:pass|standard|class|grade)?\b|\bhigh\s*school\b|\bmatriculation\b|cbse\s+class\s+10\b|\bi\.c\.s\.e\b|\bssc\b/i
  };
  
  for (const [degName, regex] of Object.entries(degreeMap)) {
    if (regex.test(rawText)) {
      details.degrees.push(degName);
    }
  }

  // 5. Tier Universities
  const universitiesMap: Record<string, RegExp> = {
    "Indian Institute of Technology (IIT)": /\biit\b|indian\s+institute\s+of\s+technology/i,
    "National Institute of Technology (NIT)": /\bnit\b|national\s+institute\s+of\s+technology/i,
    "BITS Pilani": /\bbits\b|\bbirla\s+institute\s+of\s+technology/i,
    "Anna University": /\banna\s+university\b/i,
    "Visvesvaraya Technological University (VTU)": /\bvtu\b|visvesvaraya/i,
    "Dr. A.P.J. Abdul Kalam Technical University (AKTU)": /\baktu\b|\buptu\b|abdul\s+kalam/i,
    "Delhi Technological University (DTU)": /\bdtu\b|delhi\s+technological/i,
    "Jawaharlal Nehru Technological University (JNTU)": /\bjntu\b|jawaharlal\s+nehru/i,
    "Pune University (SPPU)": /\bpune\s+university\b|savitribai\s+phule/i,
    "Delhi University (DU)": /\bdelhi\s+university\b|university\s+of\s+delhi/i,
    "VIT University": /\bvit\b|vellore\s+institute/i,
    "SRM University": /\bsrm\b|srm\s+institute/i,
    "Amity University": /\bamity\b/i
  };

  for (const [uniName, regex] of Object.entries(universitiesMap)) {
    if (regex.test(rawText)) {
      details.universities.push(uniName);
    }
  }

  // 6. CGPA (e.g., 9.2 CGPA, 9.2/10) or Percentage (e.g., 85%)
  const cgpaRegex = /\b(?:cgpa|gpa|g\.p\.a\.?)\s*(?:of|is)?\s*(\d(?:\.\d{1,2})?)\s*(?:\/|out\s+of)?\s*(?:10)?\b|\b(\d(?:\.\d{1,2})?)\s*(?:cgpa|gpa)\b/i;
  const percentageRegex = /\b(\d{2}(?:\.\d{1,2})?)\s*(?:%|percent)\b/i;

  const cgpaMatch = rawText.match(cgpaRegex);
  const percentageMatch = rawText.match(percentageRegex);

  if (cgpaMatch) {
    const score = cgpaMatch[1] || cgpaMatch[2];
    details.cgpaPercentage = `${score} / 10 CGPA`;
  } else if (percentageMatch) {
    details.cgpaPercentage = `${percentageMatch[1]}%`;
  } else {
    // Look for decimal number followed by CGPA or alone in educational lines
    const fallBackCgpa = /(\d\.\d{1,2})\s*(?:cgpa|gpa|\/10)?/i;
    const fbMatch = rawText.match(fallBackCgpa);
    if (fbMatch && parseFloat(fbMatch[1]) <= 10.0) {
      details.cgpaPercentage = `${fbMatch[1]} CGPA`;
    }
  }

  return details;
}
