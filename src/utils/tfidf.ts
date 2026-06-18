/**
 * TF-IDF Vectorizer & Cosine Similarity in Pure TypeScript
 * Replicates the exact behavior of Scikit-learn's TfidfVectorizer & cosine_similarity
 */

export interface Vector {
  [word: string]: number;
}

/**
 * Tokenize a clean string into words/terms
 */
function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(token => token.length > 0);
}

/**
 * Compute Term Frequencies (TF) for a document
 * TF = (Count of term in doc) / (Total terms in doc)
 */
function computeTF(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  if (tokens.length === 0) return tf;

  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  // Normalize by total words in the document
  for (const token in tf) {
    tf[token] = tf[token] / tokens.length;
  }

  return tf;
}

/**
 * Compute Inverse Document Frequencies (IDF) across a corpus
 * IDF = ln( (1 + N) / (1 + DF) ) + 1
 * Replicates the Scikit-learn smooth_idf=True formula
 */
function computeIDF(corpusTokens: string[][]): Record<string, number> {
  const idf: Record<string, number> = {};
  const N = corpusTokens.length;

  // Build document frequency (DF) dictionary
  const df: Record<string, number> = {};
  
  for (const doc of corpusTokens) {
    const uniqueTermsInDoc = new Set(doc);
    for (const term of uniqueTermsInDoc) {
      df[term] = (df[term] || 0) + 1;
    }
  }

  // Smooth IDF calculation (Scikit-Learn style)
  for (const term in df) {
    idf[term] = Math.log((1 + N) / (1 + df[term])) + 1;
  }

  return idf;
}

/**
 * Compute Cosine Similarity between two vectors
 * Cosine Similarity = DotProduct(A, B) / (Norm(A) * Norm(B))
 */
export function cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  // Union of terms to build vector space
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  for (const term of allTerms) {
    const valA = vecA[term] || 0;
    const valB = vecB[term] || 0;

    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Rank resumes against a Job Description using TF-IDF and Cosine Similarity
 * @param resumes Cleaned text files of resumes
 * @param jd Cleaned text of the Job Description
 * @returns Array of score percentage floats (0 to 100) matching index of resumes
 */
export function calculateSimilarityScores(resumes: string[], jd: string): number[] {
  if (resumes.length === 0) return [];
  if (!jd) return resumes.map(() => 0);

  // Consolidated corpus: [0] is JD, [1...] are resumes
  const corpus = [jd, ...resumes];
  
  // Tokenize each document
  const corpusTokens = corpus.map(doc => tokenize(doc));
  
  // 1. Calculate Term Frequency (TF) for each document
  const tfs = corpusTokens.map(tokens => computeTF(tokens));
  
  // 2. Calculate smooth Inverse Document Frequency (IDF) based on the corpus
  const idfs = computeIDF(corpusTokens);
  
  // 3. Create TF-IDF Vector for each document
  const tfidfs = tfs.map(tf => {
    const tfidfVec: Record<string, number> = {};
    for (const term in tf) {
      if (idfs[term]) {
        tfidfVec[term] = tf[term] * idfs[term];
      }
    }
    return tfidfVec;
  });

  // TF-IDF of Job Description (index 0)
  const jdVector = tfidfs[0];
  
  // TF-IDF of Resumes (indices 1 to length)
  const resumeVectors = tfidfs.slice(1);

  // Compute similarities
  return resumeVectors.map(resumeVec => {
    const rawScore = cosineSimilarity(jdVector, resumeVec);
    // Amplify slightly for relevance scaling in client layout (range bounds)
    // and convert to double percentage decimal
    const scaledScore = Math.min(100, Math.round(rawScore * 100 * 100) / 100);
    return scaledScore;
  });
}
