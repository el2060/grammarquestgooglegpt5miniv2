import type { FeedbackItem, QuizQuestion, ModelRewrite } from '../types';
import { getActiveGeminiConfig, requestGemini } from './geminiConnection';

async function callGemini<T>(systemPrompt: string, userPrompt: string, schema: object): Promise<T> {
  return requestGemini<T>(getActiveGeminiConfig(), systemPrompt, userPrompt, schema);
}

function validateQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  if (!Array.isArray(questions) || questions.length === 0 || !questions.every(q =>
    q && typeof q.question === 'string' && q.question.trim() && typeof q.topic === 'string' && q.topic.trim() &&
    Array.isArray(q.options) && q.options.length === 4 &&
    q.options.every(option => typeof option === 'string' && option.trim()) &&
    new Set(q.options).size === 4 && q.options.includes(q.correctAnswer))) {
    throw new Error('Gemini returned an incomplete quiz. Please try again.');
  }
  return questions;
}

const quizSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: {
            type: "array",
            items: { type: "string" }
          },
          correctAnswer: { type: "string" },
          topic: { type: "string" },
          explanation: { type: "string", description: "A short explanation of the grammar rule that makes the correct answer right." }
        },
        required: ["question", "options", "correctAnswer", "topic", "explanation"],
        additionalProperties: false
      }
    }
  },
  required: ["questions"],
  additionalProperties: false
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  const systemPrompt = "You are an expert grammar coach for polytechnic students in Singapore. Generate contextual, scenario-based quiz questions using relatable Singaporean contexts.";

  const userPrompt = `Generate a 3-question quiz about the grammar topic: "${topic}". The questions must be contextual and scenario-based, using relatable Singaporean contexts, places, or everyday situations (e.g., ordering kopi, taking the MRT, discussing school projects at a polytechnic). Do not focus too narrowly on student or polytechnic life. Ensure each question has exactly four distinct options and one is clearly correct. correctAnswer must exactly match one of the options. topic must exactly match the requested topic.`;

  const result = await callGemini<{ questions: QuizQuestion[] }>(
    systemPrompt,
    userPrompt,
    quizSchema
  );

  return validateQuestions(result.questions);
};

const feedbackSchema = {
  type: "object",
  properties: {
    feedback: {
      type: "array",
      description: "An array of feedback items for each identified grammar error.",
      items: {
        type: "object",
        properties: {
          errorType: {
            type: "string",
            description: "A concise name for the grammar error category (e.g., 'Subject-Verb Agreement', 'Incorrect Tense')."
          },
          explanation: {
            type: "string",
            description: "A clear, simple explanation of why the original sentence is incorrect."
          },
          originalSentence: {
            type: "string",
            description: "The original sentence from the user's text that contains the error."
          },
          correctedSentence: {
            type: "string",
            description: "The corrected version of the sentence."
          },
          learningTip: {
            type: "string",
            description: "A short, actionable tip to help the user avoid this mistake in the future."
          }
        },
        required: ["errorType", "explanation", "originalSentence", "correctedSentence", "learningTip"],
        additionalProperties: false
      }
    }
  },
  required: ["feedback"],
  additionalProperties: false
};

export const analyzeTextForFeedback = async (text: string, topics: string[]): Promise<FeedbackItem[]> => {
  const topicsString = topics.length > 0 ? topics.join(', ') : 'common grammar topics';

  const systemPrompt = "You are an expert grammar coach for polytechnic students in Singapore. Provide clear, simple explanations for grammar errors.";

  const userPrompt = `
Analyze the following text for grammar errors, focusing *only* on these topics: ${topicsString}.
- Your audience is a polytechnic student in Singapore. Explanations should be clear and simple.
- Identify up to 4 distinct grammar errors.
- Do not identify spelling mistakes.
- For each error, provide the error type, a simple explanation, the original sentence, a corrected version, and a learning tip.
- If there are no grammar errors from the specified topics, return an empty array.

Text to analyze:
---
${text}
---
`;

  const result = await callGemini<{ feedback: FeedbackItem[] }>(
    systemPrompt,
    userPrompt,
    feedbackSchema
  );

  if (!Array.isArray(result.feedback) || !result.feedback.every(item =>
    item && ['errorType', 'explanation', 'originalSentence', 'correctedSentence', 'learningTip']
      .every(key => typeof item[key as keyof FeedbackItem] === 'string' && item[key as keyof FeedbackItem].trim()))) {
    throw new Error('Gemini returned incomplete feedback. Please try again.');
  }
  return result.feedback;
};

export const generateQuizFromFeedback = async (feedback: FeedbackItem[]): Promise<QuizQuestion[]> => {
  const errorSummary = feedback.map(f => `- ${f.errorType}: ${f.explanation}`).join('\n');

  const systemPrompt = "You are an expert grammar coach for polytechnic students in Singapore. Generate contextual quiz questions based on identified errors.";

  const userPrompt = `
Based on the following identified grammar errors, generate a 5-question multiple-choice quiz.
- Each question must be contextual and scenario-based, using relatable Singaporean contexts (e.g., ordering food, taking public transport, campus life).
- The questions should test the specific grammar concepts found in the errors.
- Each question must have exactly four distinct options. correctAnswer must exactly match one of the options.

Identified Errors:
---
${errorSummary}
---
`;

  const result = await callGemini<{ questions: QuizQuestion[] }>(
    systemPrompt,
    userPrompt,
    quizSchema
  );

  return validateQuestions(result.questions);
};

const modelRewriteSchema = {
  type: "object",
  properties: {
    rewrittenText: {
      type: "string",
      description: "The fully rewritten, corrected, and improved version of the user's text."
    },
    summaryOfChanges: {
      type: "array",
      description: "A bulleted list of 2-3 key changes made during the rewrite, explaining the grammar rule.",
      items: { type: "string" }
    }
  },
  required: ["rewrittenText", "summaryOfChanges"],
  additionalProperties: false
};

export const generateModelRewrite = async (text: string, feedback: FeedbackItem[]): Promise<ModelRewrite> => {
  const feedbackSummary = feedback.map(f => `Error: ${f.errorType}\nOriginal: ${f.originalSentence}`).join('\n---\n');

  const systemPrompt = "You are an expert English writing coach for a polytechnic student in Singapore. Rewrite text to be grammatically correct while preserving the original meaning.";

  const userPrompt = `
Rewrite the following user-submitted text to be grammatically correct and to improve its natural flow and clarity.
- You MUST correct the specific grammar errors that were identified.
- Do not change the original meaning or intent of the text.
- After rewriting the text, provide a brief, bulleted summary of the 2-3 most important changes you made, explaining *why* you made them by referencing the grammar rules.

Original Text:
---
${text}
---

Identified Errors to Fix:
---
${feedbackSummary}
---
`;

  const result = await callGemini<ModelRewrite>(
    systemPrompt,
    userPrompt,
    modelRewriteSchema
  );

  if (typeof result.rewrittenText !== 'string' || !result.rewrittenText.trim() ||
    !Array.isArray(result.summaryOfChanges) || !result.summaryOfChanges.every(item => typeof item === 'string')) {
    throw new Error('Gemini returned an incomplete rewrite. Please try again.');
  }
  return result;
};
