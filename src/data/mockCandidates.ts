import { Candidate, JobRole } from '../types';
import { cleanText, extractSkills, parseIndianResumeContext } from '../utils/nlp';

/**
 * Predefined matching Job Descriptions
 */
export const PREDEFINED_ROLES: JobRole[] = [
  {
    id: "role_1",
    title: "Python & Machine Learning Developer",
    description: `We are looking for a Python and Machine Learning Engineer.
    Required skills: Python, Django, FastAPI Framework, SQL, PostgreSQL database.
    Experience in machine learning, modeling, and text mining using TensorFlow, PyTorch, Keras, Pandas, NumPy, Scikit-learn, and NLP processors like spaCy, NLTK.
    Requires strong analytical skills, problem solving, teamwork, and communication.
    Education: B.Tech, BE, or M.Tech from a tier-1 Indian institution with high scoring.`,
    skills: ["Python", "Django", "FastAPI", "SQL", "PostgreSQL", "TensorFlow", "PyTorch", "Keras", "Pandas", "NumPy", "Scikit-Learn", "NLP", "SpaCy", "NLTK", "Analytical skills", "Problem solving", "Teamwork", "Communication"]
  },
  {
    id: "role_2",
    title: "SDE / Frontend Engineer (React)",
    description: `Immediate opening for a Frontend Developer with strong engineering fundamentals.
    Skills required: HTML, CSS, JavaScript, React, Hooks, Redux, TypeScript, Tailwind CSS, Bootstrap.
    Familiarity with visual frameworks, Git, GitHub, CI/CD, responsive designs, testing and performance auditing.
    Key properties: adaptability, creativity, collaboration, and high attention to detail.
    Education: BCA, MCA, or B.Tech/BE degree. Candidates from premier universities like VIT, DTU, or Anna University preferred.`,
    skills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Tailwind CSS", "Bootstrap", "Git", "GitHub", "Adaptability", "Creativity", "Collaboration"]
  },
  {
    id: "role_3",
    title: "Data Analyst",
    description: `We are seeking a senior Data Analyst.
    Must be proficient in SQL, Python, Excel, Pandas, NumPy, Tableau, Power BI, and PostgreSQL.
    Key responsibilities: cleansing data, pipeline integration, exploratory data analysis, and dashboard reporting.
    Requires critical thinking, presentation skills, project management, and verbal agility.
    Location: Bengaluru or Hyderabad, India.`,
    skills: ["SQL", "Python", "Pandas", "NumPy", "Tableau", "Power BI", "PostgreSQL", "Data analysis", "Analytical skills", "Critical thinking", "Communication", "Project management"]
  },
  {
    id: "role_4",
    title: "Cyber Security Analyst",
    description: `Actively hiring a Cyber Security Analyst to manage threat vectors and maintain compliance.
    Required technologies & certifications: Python, Linux, Bash, SQL, Git, Nginx, Prometheus.
    Expertise in network security, threat detection, penetration testing, compliance auditing, firewalls.
    Must possess strong analytical skills, critical thinking, problem solving, and detailed communication.
    Education: B.Tech, B.Sc, or MCA. Relevant certifications like CEH or CISSP are highly valued.`,
    skills: ["Python", "Linux", "SQL", "Git", "Nginx", "Prometheus", "Analytical skills", "Critical thinking", "Problem solving", "Communication"]
  },
  {
    id: "role_5",
    title: "DevOps / Cloud Engineer",
    description: `Looking for a DevOps Engineer to construct high-availabilty CI/CD systems on cloud infrastructure.
    Required skills: Linux, Kubernetes, Docker, AWS, Azure, GCP, Git, GitHub, CI/CD, Jenkins, Ansible, Terraform.
    Experience in infrastructure-as-code, microservices architecture, log aggregation (Elasticsearch, Prometheus, Grafana).
    Excellent collaboration, communication, and real-time incident resolution skills.`,
    skills: ["Linux", "Kubernetes", "Docker", "AWS", "Azure", "GCP", "Git", "GitHub", "CI/CD", "Jenkins", "Ansible", "Terraform", "Collaboration", "Communication"]
  },
  {
    id: "role_6",
    title: "Technical Product Manager",
    description: `Seeking a Technical Product Manager to spearhead enterprise product workflows.
    Must have experience with Agile methodology, Scrum master, roadmap mapping, and project management.
    Familiar with Python, SQL analytics, wireframing tools, and cross-functional team management.
    Excellent communication, leadership, business presentation, and structured critical thinking.`,
    skills: ["Agile", "Scrum", "Project management", "Python", "SQL", "Communication", "Leadership", "Critical thinking"]
  },
  {
    id: "role_7",
    title: "Full Stack Web Developer (Node/Express)",
    description: `Looking for an experienced Full Stack Web Developer.
    Must be proficient in HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, MySQL, and REST APIs.
    Familiar with cloud deployments, Git, user session management, and responsive frontend styling.`,
    skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "MySQL", "REST APIs", "Git"]
  },
  {
    id: "role_8",
    title: "Mobile iOS & Android Engineer (React Native)",
    description: `Opening for a Mobile App Engineer.
    Requires expertise in React Native, Flutter, Swift, Java, iOS, Android, and mobile UI design.
    Must understand lifecycle management, local databases like SQLite, and push notification services.`,
    skills: ["React Native", "Flutter", "Swift", "Java", "iOS", "Android", "Mobile UI", "SQLite", "Git"]
  },
  {
    id: "role_9",
    title: "AI Integration & Generative Specialist",
    description: `Seeking an AI Integration Specialist to connect large language models (LLM) and agents.
    Requires knowledge of Python, OpenAI, Gemini API, LangChain, vector databases (Pinecone, ChromaDB), and API orchestration.
    Must be proficient with system design, prompt engineering, and serverless architectures.`,
    skills: ["Python", "OpenAI", "Gemini API", "LangChain", "Vector databases", "Pinecone", "ChromaDB", "System design", "Prompt engineering"]
  },
  {
    id: "role_10",
    title: "QA Automation & Test Engineer",
    description: `Hiring a Quality Assurance Engineer specialized in automation frameworks.
    Requires experience in Selenium, Cypress, Playwright, Jest, Python, JavaScript, and CI/CD pipelines.
    Excellent debugging skills, bug reporting, and cross-browser and end-to-end user path testing.`,
    skills: ["Selenium", "Cypress", "Playwright", "Jest", "Python", "JavaScript", "CI/CD", "Debugging", "Testing"]
  },
  {
    id: "role_11",
    title: "Junior SDE Trainee (Fresher / 12th Pass)",
    description: `We are searching for enthusiastic Junior IT Support and Software Trainees.
    We encourage applications from all SDE Fresher candidates, 12th Pass (Higher Secondary) students, BCA, or B.Sc computer science Graduates looking for their first industrial code deployment experience.
    Key expectations: basic knowledge of HTML, CSS, JavaScript, and Microsoft Excel or Google Sheets.
    Requires high adaptability, teamwork, and strong communication.
    Training will be provided. High school and intermediate pass outs with a strong passion for coding are highly welcome to apply.`,
    skills: ["HTML", "CSS", "JavaScript", "Excel", "Fresher", "Entry level", "12th pass", "High school", "Adaptability", "Teamwork", "Communication"]
  }
];

/**
 * Realistic Indian Candidate Resumes (Raw text blocks)
 */
const MOCK_RESUMES_TEXT = [
  {
    id: "cand_1",
    name: "Arjun Sharma",
    fileName: "arjun_sharma_iit_m_btech.pdf",
    text: `ARJUN SHARMA
    Email: arjun.sharma.iit@gmail.com | Phone: +91 9886012345 | Location: Bengaluru, Karnataka
    
    EDUCATION:
    - B.Tech in Computer Science & Engineering
      Indian Institute of Technology (IIT) Madras
      CGPA: 9.4 / 10
    
    TECHNICAL SKILLS:
    - Languages: Python, JavaScript, SQL, C++
    - ML / DL: TensorFlow, PyTorch, Scikit-Learn, Pandas, NumPy, NLTK, NLP
    - Backend: Django, FastAPI, Flask, PostgreSQL
    - DevOps & Tools: Git, GitHub, Docker, AWS
    
    EXPERIENCE:
    - ML Engineer Intern | Razorpay, Bengaluru
      Built an NLP pipeline to classify transactional logs. Extracted text features using spaCy and trained high-precision classification models with Scikit-learn.
      Automated model pipelines via Docker and Docker Compose.
    
    KEY PROJECT:
    - Smart Resume Recommendation Engine:
      Utilized TF-IDF Vectorization and Cosine Similarity models to automate applicant matching. Scaled back-end REST APIs with FastAPI and SQLite.`
  },
  {
    id: "cand_2",
    name: "Priyanka Patel",
    fileName: "priyanka_patel_anna_mca.docx",
    text: `PRIYANKA PATEL
    Email: priyanka.patel@annauniv.edu | Mobile: +91-76543-21098 | Location: Chennai, India
    
    PROFESSIONAL SUMMARY:
    Detail-oriented Software Developer with core expertise in frontend engineering, responsive web development, and single-page applications.
    
    EDUCATION:
    - Master of Computer Applications (MCA)
      Anna University, Chennai
      Score: 8.7 CGPA
    
    SKILLS DATABASE:
    - Core: JavaScript, TypeScript, HTML, CSS, Tailwind CSS, Bootstrap
    - Frameworks: React, Redux, Node.js, Express, Next.js
    - Repositories: Git, GitHub, GitLab
    - Soft Skills: Teamwork, Creativity, Collaboration, Communication, Quick Adaptability
    
    PROFESSIONAL EXPERIENCE:
    - Frontend Developer | Tata Consultancy Services (TCS), Chennai
      Developed custom banking UI layouts using React and Tailwind CSS.
      Collaborated with visual designers to implement pixel-perfect user components. Reduced load latency by 35% using Next.js route caching.`
  },
  {
    id: "cand_3",
    name: "Rahul Deshmukh",
    fileName: "rahul_d_vtu_be_data.pdf",
    text: `RAHUL DESHMUKH
    Email: rahul.deshmukh2025@outlook.com | Phone: 9812345678 | Location: Pune, Maharashtra
    
    EDUCATION:
    - B.E (Bachelor of Engineering) in Information Science
      Visvesvaraya Technological University (VTU), Belagavi
      Graduation score: 78% Match
    
    SKILLS WORKSPACE:
    - Programming: Python, SQL, PostgreSQL, R
    - Analytics: Pandas, NumPy, Scikit-learn, Tableau, Power BI, Excel
    - Databases: MySQL, SQLite, MongoDB
    - Personal Qualities: Communication, Critical Thinking, Project Management, Analytical skills
    
    EXPERIENCE:
    - Data Analyst | Infosys, Pune
      Conducted weekly warehousing database cleanups using optimized SQL queries.
      Designed interactive performance dashboards using Tableau and Power BI. Exported aggregated data profiles via Python and Pandas scripts.`
  },
  {
    id: "cand_4",
    name: "Aditya Verma",
    fileName: "aditya_aktu_btech_py.pdf",
    text: `ADITYA VERMA
    Email: aditya.verma@aktu.ac.in | Phone: +91 8881234567 | Gurgaon, Haryana
    
    OBJECTIVE:
    Motivated engineer seeking positions in software development centering Python, web backends, and databases.
    
    EDUCATION:
    - B.Tech in Electronics & Communication
      Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow
      CGPA: 7.2 GP
    
    DEVELOPMENT SKILLS:
    - Programming: Python, Java, SQL, Hibernate
    - Web Frameworks: Django, Flask
    - Tech Utilities: Git, MySQL, Linux
    - Core Qualities: Teamwork, Problem solving, Self-guided Adaptability
    
    ACADEMIC PROJECTS:
    - Django Personal Blog App:
      Built a fully functional blog supporting user sessions and comments with Django and MySQL. Deploying database setups on Linux VMs.`
  },
  {
    id: "cand_5",
    name: "Saurabh Mishra",
    fileName: "saurabh_cyber_expert.pdf",
    text: `SAURABH MISHRA
    Email: saurabh.mishra.sec@gmail.com | Phone: +91 9999112233 | Noida, India
    
    EDUCATION:
    - B.Tech in Information Technology
      Dr. A.P.J. Abdul Kalam Technical University (AKTU)
      CGPA: 8.1 / 10
    
    CORE EXPERIENCE:
    - Cybersecurity Analyst | HCL Technologies
      Led threat mitigation strategies across enterprise infrastructure. Audited compliance rules, configured firewalls, and optimized Nginx and system security.
      Expert linux systems administrator doing automation via Python and shell scripting.
    
    SKILLS:
    Linux, Bash, Python, SQL, Git, Nginx, Prometheus, Threat detection, Compliance auditing, Analytical skills, Critical thinking, Problem solving, Communication`
  },
  {
    id: "cand_6",
    name: "Nehal Gowda",
    fileName: "nehal_devops_vtu.pdf",
    text: `NEHAL GOWDA
    Email: nehal.devops@outlook.com | Phone: +91 9123456789 | Bengaluru, India
    
    EDUCATION:
    - B.E. in Computer Science
      Visvesvaraya Technological University (VTU)
      Score: 8.5 CGPA
    
    EXPERIENCE:
    - Senior DevOps Administrator | Wipro
      Spearheaded scalable container orchestration on AWS using Kubernetes, Docker, and Terraform. 
      Integrated automated testing and CI/CD deployment pipelines using Jenkins and GitHub. Managed logging and monitoring via Prometheus and Grafana.
    
    SKILLS:
    Linux, Kubernetes, Docker, AWS, GCP, Git, GitHub, CI/CD, Jenkins, Ansible, Terraform, Collaboration, Communication, Prometheus, Grafana`
  },
  {
    id: "cand_7",
    name: "Karan Johar (Fresher)",
    fileName: "karan_johar_fresher.pdf",
    text: `KARAN JOHAR
    Email: karan.johar.fresher@outlook.com | Phone: +91 9555123456 | Mumbai, Maharashtra
    
    OBJECTIVE:
    Enthusiastic and motivated SDE Fresher seeking an entry level position to leverage academic knowledge of software engineering.
    
    EDUCATION:
    - BCA (Bachelor of Computer Applications)
      Mumbai University
      Score: 9.1 CGPA (Fresher Graduate, Batch of 2026)
    
    SKILLS WORKSPACE:
    - Programming: Python, HTML, CSS, JavaScript, React, SQL
    - Concept Tools: Git, GitHub, VS Code
    - Category: Entry level engineering, Fresher status
    - Soft Skills: Teamwork, Problem solving, Critical thinking, Adaptability
    
    ACADEMIC PROJECTS:
    - Inventory Management Website (React & CSS)
      Designed a lightweight React client application for real-time item tracking.
    - Python Quiz Application
      Built a terminal based interactive trivia quiz leveraging basic object oriented coding.`
  },
  {
    id: "cand_8",
    name: "Deepak Rawat (12th Pass)",
    fileName: "deepak_rawat_12th_pass.pdf",
    text: `DEEPAK RAWAT
    Email: deepak.rawat12@gmail.com | Phone: +91 7401234567 | New Delhi, Delhi, India
    
    PERSONAL PROFILE:
    Hardworking 12th Pass student with strong foundation in computers, looking for entry level junior roles, data entry, software operations or internships.
    
    EDUCATION:
    - 12th Pass (Higher Secondary Certificate - HSC)
      Central Board of Secondary Education (CBSE), New Delhi
      Class 12 Score: 88% overall
    - 10th Pass (High School Certificate - SSC)
      CBSE, New Delhi
      Class 10 CGPA: 9.2
    
    TECHNICAL SKILLS:
    - Computer Basics: HTML, CSS, JavaScript, SQL fundamentals
    - Practical Applications: Microsoft Excel, Word, Google Sheets
    - Soft Skills: Adaptability, Quick learner, Communication, Teamwork
    - Background: High school graduate, 12th pass, Fresher status
    
    VOLUNTARY ACTIVITY:
    - Coordinated school computer labs, assisted students with tech installations.`
  }
];

/**
 * Helper to get initial candidates collection processed with NLP
 */
export function getInitialCandidates(): Candidate[] {
  return MOCK_RESUMES_TEXT.map(res => {
    const rawText = res.text;
    const cleanedText = cleanText(rawText);
    const skills = extractSkills(rawText);
    const contact = parseIndianResumeContext(rawText);

    return {
      id: res.id,
      name: res.name,
      fileName: res.fileName,
      rawText,
      cleanedText,
      contact,
      skills,
      isMock: true
    };
  });
}
