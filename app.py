import re
import streamlit as st
import docx2txt
import pypdf
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import string

# Download NLTK requirements if not present
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Set page configuration
st.set_page_config(
    page_title="Indian Resume Screening & Candidate Ranking System",
    page_icon="💼",
    layout="wide",
)

# Custom Styling for modern look
st.markdown("""
<style>
    .metric-card {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        border-left: 5px solid #00D2C4;
        margin-bottom: 1rem;
    }
    .main-header {
        color: #1E293B;
        font-family: 'Inter', sans-serif;
    }
    .subactive {
        color: #64748B;
        font-size: 0.9rem;
    }
    .skill-badge-match {
        background-color: #D1FAE5;
        color: #065F46;
        padding: 0.25rem 0.5rem;
        border-radius: 5px;
        font-size: 0.8rem;
        margin-right: 0.25rem;
        display: inline-block;
    }
    .skill-badge-gap {
        background-color: #FEE2E2;
        color: #991B1B;
        padding: 0.25rem 0.5rem;
        border-radius: 5px;
        font-size: 0.8rem;
        margin-right: 0.25rem;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)


# ----------------------------------------------------
# 1. TEXT CLEANING & PROCESSING HELPER FUNCTIONS
# ----------------------------------------------------

def clean_text(text):
    """
    Cleans raw resume and job description text.
    - Standardizes to lowercase
    - Removes punctuation
    - Removes extra whitespaces
    - Removes stopwords
    """
    if not text:
        return ""
    # Lowercase
    text = text.lower()
    # Remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))
    # Tokenize
    tokens = word_tokenize(text)
    # Remove stopwords
    stop_words = set(stopwords.words("english"))
    filtered_tokens = [w for w in tokens if w not in stop_words]
    # Re-join
    return " ".join(filtered_tokens)


def extract_text_from_file(uploaded_file):
    """
    Extracts text from PDF or DOCX file.
    """
    try:
        if uploaded_file.name.endswith(".pdf"):
            reader = pypdf.PdfReader(uploaded_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        elif uploaded_file.name.endswith(".docx") or uploaded_file.name.endswith(".doc"):
            return docx2txt.process(uploaded_file)
    except Exception as e:
        st.error(f"Error reading file {uploaded_file.name}: {e}")
        return ""


# ----------------------------------------------------
# 2. SEPCIALIZED INDIAN CONTEXT PARSER
# ----------------------------------------------------

def parse_indian_resume_context(raw_text):
    """
    Parses specialized Indian patterns from resume text:
    - Degrees: B.Tech, B.E, M.Tech, MCA, BCA, BSc, MBA
    - Universities: IITs, NITs, Anna, VTU, AKTU, Pune, etc.
    - CGPA & Percentages
    - Indian Contact Format (+91 country code)
    """
    details = {
        "degrees": [],
        "universities": [],
        "cgpa_percentage": "Not Found",
        "phone": "Not Found"
    }

    # Match Indian mobile number pattern
    # Matches +91 XXXXXXXXXX, 91 XXXXXXXXXX, 0XXXXXXXXXX, or +91-XXXXX-XXXXX
    phone_pattern = r"(?:\+91[\-\s]?)?[6789]\d{9}|(?:\+91[\-\s]?\d{5}[\-\s]?\d{5})"
    phone_match = re.search(phone_pattern, raw_text)
    if phone_match:
        details["phone"] = phone_match.group(0)

    # Degrees standard mapping
    degree_patterns = {
        "B.Tech / Bachelor of Technology": r"\bb\.?\s*tech\b|bachelor\s+of\s+technology",
        "BE / Bachelor of Engineering": r"\bb\.?\s*e\.?\b|bachelor\s+of\s+engineering",
        "M.Tech / Master of Technology": r"\bm\.?\s*tech\b|master\s+of\s+technology",
        "MCA / Master of Computer Applications": r"\bm\.?\s*c\.?\s*a\.?\b|master\s+of\s+computer\s+applications",
        "BCA / Bachelor of Computer Applications": r"\bb\.?\s*c\.?\s*a\.?\b|bachelor\s+of\s+computer\s+applications",
        "MBA / Master of Business Administration": r"\bm\.?\s*b\.?\s*a\.?\b|master\s+of\s+business\s+administration",
        "B.Sc / Bachelor of Science": r"\bb\.?\s*sc\b|bachelor\s+of\s+science",
    }
    
    for degree_name, pattern in degree_patterns.items():
        if re.search(pattern, raw_text, re.IGNORECASE):
            details["degrees"].append(degree_name)

    # Premier Indian Institutes / Universities matching
    uni_patterns = {
        "Indian Institute of Technology (IIT)": r"\biit\b|indian\s+institute\s+of\s+technology",
        "National Institute of Technology (NIT)": r"\bnit\b|national\s+institute\s+of\s+technology",
        "Birla Institute of Technology and Science (BITS)": r"\bbits\b|\bbirla\s+institute\s+of\s+technology",
        "Anna University": r"\banna\s+university\b",
        "Visvesvaraya Technological University (VTU)": r"\bvtu\b|visvesvaraya",
        "Dr. A.P.J. Abdul Kalam Technical University (AKTU)": r"\baktu\b|\buptu\b|abdul\s+kalam",
        "Delhi Technological University (DTU)": r"\bdtu\b|delhi\s+technological",
        "Jawaharlal Nehru Technological University (JNTU)": r"\bjntu\b|jawaharlal\s+nehru",
        "Pune University": r"\bpune\s+university\b|savitribai\s+phule",
    }

    for uni_name, pattern in uni_patterns.items():
        if re.search(pattern, raw_text, re.IGNORECASE):
            details["universities"].append(uni_name)

    # CGPA or Percentage Matching
    # (e.g., 9.2/10, 8.5 CGPA, 78%, 85 percent)
    cgpa_pattern = r"\b(?:cgpa|gpa|g\.p\.a\.?)\s*(?:of|is)?\s*(\d(?:\.\d{1,2})?)\s*(?:/|out\s+of)?\s*(?:10)?\b|\b(\d(?:\.\d{1,2})?)\s*(?:cgpa|gpa)\b"
    pct_pattern = r"\b(\d{2}(?:\.\d{1,2})?)\s*(?:%|percent)\b"

    cgpa_match = re.search(cgpa_pattern, raw_text, re.IGNORECASE)
    pct_match = re.search(pct_pattern, raw_text, re.IGNORECASE)

    if cgpa_match:
        val = cgpa_match.group(1) or cgpa_match.group(2)
        details["cgpa_percentage"] = f"{val} CGPA"
    elif pct_match:
        details["cgpa_percentage"] = f"{pct_match.group(1)}%"

    return details


# ----------------------------------------------------
# 3. SKILL EXTRACTION DATABASE & RULES
# ----------------------------------------------------

SKILL_DB = {
    # Tech skills
    "python", "django", "flask", "fastapi", "numpy", "pandas", "scikit-learn", 
    "tensorflow", "keras", "pytorch", "nlp", "spacy", "nltk", "sql", "mysql", 
    "postgresql", "sqlite", "mongodb", "redis", "javascript", "react", "angular", 
    "vue", "node.js", "express", "typescript", "html", "css", "tailwind", "bootstrap", 
    "git", "github", "docker", "kubernetes", "aws", "azure", "gcp", "devops", 
    "ci/cd", "jenkins", "linux", "c++", "java", "spring", "spring boot", "php", 
    "laravel", "ruby", "rails", "swift", "kotlin", "scala", "go", "matlab",
    # Soft skills
    "communication", "teamwork", "leadership", "problem solving", "critical thinking", 
    "adaptability", "time management", "creativity", "collaboration", "analytical"
}


def extract_skills(text):
    """
    Extracts matches from the pre-defined technical and soft skills database.
    """
    found_skills = set()
    cleaned = text.lower()
    
    for skill in SKILL_DB:
        # Match as whole word to avoid sub-string matching issues (e.g., matching 'go' in 'good')
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, cleaned):
            found_skills.add(skill.title())
            
    return found_skills


# ----------------------------------------------------
# 4. RANKING & VECTOR ANALYSIS
# ----------------------------------------------------

def calculate_similarity(resumes_corpus, jd_text):
    """
    Computes Scikit-learn TF-IDF Vectorizer and Cosine Similarity scores.
    """
    if not resumes_corpus:
        return []
    
    # Create unified corpus (JD + Reumes)
    corpus = [jd_text] + resumes_corpus
    
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    # JD vector is index 0
    jd_vector = tfidf_matrix[0:1]
    # Resumes vectors are indices 1 onwards
    resumes_vectors = tfidf_matrix[1:]
    
    # Calculate cosine similarity
    similarities = cosine_similarity(resumes_vectors, jd_vector).flatten()
    return [round(score * 100, 2) for score in similarities]


# ----------------------------------------------------
# 5. PRE-DEFINED ROLES
# ----------------------------------------------------

PREDEFINED_ROLES = {
    "Python & ML Developer": """Python backend development, Django/FastAPI framework, SQL, building scalable microservices.
Experience with machine learning frameworks like Scikit-Learn, Pandas, TensorFlow, spaCy, and NLP models.
Familiar with Git, Docker, and REST APIs. Excellent problem solving, teamwork, and analytical skills.""",
    
    "Data Analyst": """Data Analyst with proficiency in Python, SQL, PostgreSQL, and Excel.
Experience in data cleaning, exploratory data analysis (EDA), Pandas, NumPy, and reporting.
Familiar with PostgreSQL, data visualization, communication, critical thinking, and presentation skills.""",
    
    "Frontend Engineer": """Solid experience with HTML, CSS, JavaScript, React, Tailwind CSS, and TypeScript.
Strong design-to-code skills, familiarity with Git/GitHub, and state management systems.
Team player with high attention to detail, adaptability, and modern responsive design development standards."""
}


# ----------------------------------------------------
# 6. STREAMLIT UI LAYOUT & CONTROLLER
# ----------------------------------------------------

def main():
    st.markdown('<h1 class="main-header">🎯 Resume / Candidate Screening System</h1>', unsafe_allow_html=True)
    st.markdown('<p class="subactive">Optimized for Indian educational grading, tier universities, contact frameworks, and TF-IDF role-fit scoring.</p>', unsafe_allow_html=True)
    st.markdown("---")

    # ------------------ SIDEBAR ------------------
    st.sidebar.header("📁 Document upload")
    
    # Bulk Resume Upload
    uploaded_files = st.sidebar.file_uploader(
        "Upload Indian Resumes (PDF / DOCX)",
        type=["pdf", "docx"],
        accept_multiple_files=True,
        help="Upload multiple candidate resumes in PDF or DOCX format to parse and rank them simultaneously."
    )

    st.sidebar.markdown("---")
    st.sidebar.header("📋 Job Description (JD)")
    
    # Choose predefined or custom JD
    jd_source = st.sidebar.selectbox(
        "Select Job Specification",
        options=["Select Role specification...", "Python & ML Developer", "Data Analyst", "Frontend Engineer", "Custom Description"]
    )

    jd_text = ""
    if jd_source in PREDEFINED_ROLES:
        jd_text = st.sidebar.text_area("Job Requirements", value=PREDEFINED_ROLES[jd_source], height=180)
    elif jd_source == "Custom Description":
        jd_text = st.sidebar.text_area("Paste Custom Requirements", value="", placeholder="Enter skills, requirements, and qualifications here...", height=180)
    else:
        st.sidebar.info("Please select a pre-defined role or enter custom requirements to begin screening.")

    # Execute Screening Button
    screen_btn = st.sidebar.button("⚙️ Extract, Screen & Rank Resumes", type="primary")

    # ------------------ MAIN SCREEN ------------------
    if screen_btn:
        if not uploaded_files:
            st.warning("⚠️ Please upload at least one resume file (.pdf/.docx) in the sidebar to screen candidates.")
            return
        if not jd_text.strip():
            st.warning("⚠️ Please enter or select a Job Description (JD) to match candidates against.")
            return

        with st.spinner("Processing documents, cleaning text corpora, and executing TF-IDF vectorization..."):
            processed_candidates = []
            resumes_corpus = []

            # Extract raw JD details
            jd_clean = clean_text(jd_text)
            jd_skills = extract_skills(jd_text)

            # Step 1: Text extraction, entity recognition, and local structures
            for idx, file in enumerate(uploaded_files):
                raw_text = extract_text_from_file(file)
                if not raw_text:
                    continue

                # Resume Name extraction (fallback file name)
                candidate_name = re.sub(r'[\-_]', ' ', file.name.split(".")[0]).title()
                
                # Preprocess / clean resume text
                cleaned_resume = clean_text(raw_text)
                resumes_corpus.append(cleaned_resume)

                # Extract Indian educational/contact patterns
                indian_context = parse_indian_resume_context(raw_text)

                # Get client-skills
                cand_skills = extract_skills(raw_text)

                processed_candidates.append({
                    "id": idx,
                    "name": candidate_name,
                    "filename": file.name,
                    "raw_text": raw_text,
                    "cleaned_text": cleaned_resume,
                    "phone": indian_context["phone"],
                    "degrees": indian_context["degrees"],
                    "universities": indian_context["universities"],
                    "scores": indian_context["cgpa_percentage"],
                    "skills": cand_skills,
                })

            # Step 2: TF-IDF vectorization and Cosine Similarity calculation
            scores = calculate_similarity(resumes_corpus, jd_clean)

            # Map scores back and sort candidates by rank
            for i, score in enumerate(scores):
                processed_candidates[i]["match_score"] = score
                
                # Determine recommendation status
                if score >= 65:
                    status = "✅ Highly Recommended"
                elif score >= 45:
                    status = "⚡ Shortlisted"
                elif score >= 25:
                    status = "🔄 Under Review"
                else:
                    status = "❌ Not Suitable"
                processed_candidates[i]["status"] = status

            # Sort candidate by descending rank
            ranked_candidates = sorted(processed_candidates, key=lambda x: x["match_score"], reverse=True)

            # ------------------ DISPLAY METRIC DASHBOARD ------------------
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.markdown(f"""
                <div class="metric-card">
                    <p style="margin:0; color:#64748B; font-size:0.85rem">Resumes Processed</p>
                    <h2 style="margin:0; color:#1E293B">{len(ranked_candidates)} Candidate(s)</h2>
                </div>
                """, unsafe_allow_html=True)
            with col2:
                top_score = ranked_candidates[0]["match_score"] if ranked_candidates else 0
                st.markdown(f"""
                <div class="metric-card">
                    <p style="margin:0; color:#64748B; font-size:0.85rem">Highest Match Score</p>
                    <h2 style="margin:0; color:#059669">{top_score}% Match</h2>
                </div>
                """, unsafe_allow_html=True)
            with col3:
                avg_score = round(sum(c["match_score"] for c in ranked_candidates) / len(ranked_candidates), 1) if ranked_candidates else 0
                st.markdown(f"""
                <div class="metric-card">
                    <p style="margin:0; color:#64748B; font-size:0.85rem">Average Match Score</p>
                    <h2 style="margin:0; color:#1E293B">{avg_score}% Fit</h2>
                </div>
                """, unsafe_allow_html=True)
            with col4:
                top_cand = ranked_candidates[0]["name"] if ranked_candidates else "N/A"
                st.markdown(f"""
                <div class="metric-card">
                    <p style="margin:0; color:#64748B; font-size:0.85rem">Top Ranked CV</p>
                    <h2 style="margin:0; color:#0284C7; font-size:1.3rem; margin-top:2px">{top_cand}</h2>
                </div>
                """, unsafe_allow_html=True)

            st.write("")

            # ------------------ CANDIDATE LEADERBOARD TABLE ------------------
            st.subheader("📊 Candidate Ranking Leaderboard")
            
            table_data = []
            for rank, cand in enumerate(ranked_candidates, 1):
                # Indian Degrees representational string
                deg_str = ", ".join(cand["degrees"]) if cand["degrees"] else "Not parsed"
                uni_str = cand["universities"][0] if cand["universities"] else "Other/Regional"
                
                table_data.append({
                    "Rank": rank,
                    "Candidate Name": cand["name"],
                    "Education (Degree)": f"{deg_str} ({uni_str})",
                    "Grading System": cand["scores"],
                    "Role Match Score": f"{cand['match_score']}%",
                    "Screening Status": cand["status"]
                })
            
            st.table(table_data)

            # ------------------ DETAILED EXPANDED ANALYTICS ------------------
            st.write("")
            st.subheader("🔍 Breakdown & Skill Gap Analysis per Candidate")

            for rank, cand in enumerate(ranked_candidates, 1):
                with st.expander(f"Candidate Rank #{rank}: {cand['name']} — Score: {cand['match_score']}%"):
                    col_info, col_gap = st.columns([1, 1])

                    with col_info:
                        st.markdown(f"#### 🎓 Candidate Profile Detail")
                        st.write(f"📁 **Source File:** `{cand['filename']}`")
                        st.write(f"📞 **Indian Contact Phone:** `{cand['phone']}`")
                        st.write(f"🎯 **Identified Degrees:** {', '.join(cand['degrees']) if cand['degrees'] else 'None identified'}")
                        st.write(f"🏫 **Premier University Matches:** {', '.join(cand['universities']) if cand['universities'] else 'Other'}")
                        st.write(f"📈 **Grading Score (CGPA / %):** `{cand['scores']}`")

                    with col_gap:
                        st.markdown(f"#### 🗺️ Skill Gap Mapping")

                        # Calculated Skill Sets Intersections
                        matched = cand["skills"].intersection(jd_skills)
                        missing = jd_skills.difference(cand["skills"])

                        st.write("**Matched Skills (Present in Resume):**")
                        if matched:
                            matched_badges = "".join([f'<span class="skill-badge-match">{m}</span>' for m in matched])
                            st.markdown(matched_badges, unsafe_allow_html=True)
                        else:
                            st.write("None of the predefined skills matched.")

                        st.write("")
                        st.write("**Missing/Required Skills (Target Skill Gap):**")
                        if missing:
                            missing_badges = "".join([f'<span class="skill-badge-gap">{m}</span>' for m in missing])
                            st.markdown(missing_badges, unsafe_allow_html=True)
                        else:
                            st.write("🟢 No major skill gaps identified against the requirements!")

    else:
        # Standard welcome message
        st.info("👈 Set the Job Specification requirements and upload resume files (.pdf/.docx) in the sidebar to run the matching model.")


if __name__ == "__main__":
    main()
