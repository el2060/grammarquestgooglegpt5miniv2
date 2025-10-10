import { AzureOpenAI } from "openai";
import type { FeedbackItem, QuizQuestion, ModelRewrite } from '../types';

// Initialize the Azure OpenAI client
const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  dangerouslyAllowBrowser: true // Required for client-side usage in Vite
});

const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5-mini";

/**
 * Helper function to call Azure OpenAI with JSON response format
 * GPT-5 mini constraints:
 * - Use max_completion_tokens instead of max_tokens
 * - Temperature must be 1 (default)
 * - Top-p not supported
 */
async function callAzureOpenAI<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: any
): Promise<T> {
  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "response",
        strict: true,
        schema: schema
      }
    },
    max_completion_tokens: 4096,
    // Temperature defaults to 1 (required for GPT-5 mini)
    // Top-p is not supported for GPT-5 mini
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from Azure OpenAI");
  }

  try {
    return JSON.parse(content) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", content, e);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
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
          topic: { type: "string" }
        },
        required: ["question", "options", "correctAnswer", "topic"],
        additionalProperties: false
      }
    }
  },
  required: ["questions"],
  additionalProperties: false
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  const systemPrompt = "You are an expert grammar coach for polytechnic students in Singapore. Generate contextual, scenario-based quiz questions using relatable Singaporean contexts.";

  const userPrompt = `Generate a 3-question quiz about the grammar topic: "${topic}". The questions must be contextual and scenario-based, using relatable Singaporean contexts, places, or everyday situations (e.g., ordering kopi, taking the MRT, discussing school projects at a polytechnic). Do not focus too narrowly on student or polytechnic life. Ensure the options are plausible and one is clearly correct.`;

  const result = await callAzureOpenAI<{ questions: QuizQuestion[] }>(
    systemPrompt,
    userPrompt,
    quizSchema
  );

  return result.questions;
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

  const result = await callAzureOpenAI<{ feedback: FeedbackItem[] }>(
    systemPrompt,
    userPrompt,
    feedbackSchema
  );

  return result.feedback;
};

export const generateQuizFromFeedback = async (feedback: FeedbackItem[]): Promise<QuizQuestion[]> => {
  const errorSummary = feedback.map(f => `- ${f.errorType}: ${f.explanation}`).join('\n');

  const systemPrompt = "You are an expert grammar coach for polytechnic students in Singapore. Generate contextual quiz questions based on identified errors.";

  const userPrompt = `
Based on the following identified grammar errors, generate a 5-question multiple-choice quiz.
- Each question must be contextual and scenario-based, using relatable Singaporean contexts (e.g., ordering food, taking public transport, campus life).
- The questions should test the specific grammar concepts found in the errors.

Identified Errors:
---
${errorSummary}
---
`;

  const result = await callAzureOpenAI<{ questions: QuizQuestion[] }>(
    systemPrompt,
    userPrompt,
    quizSchema
  );

  return result.questions;
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

  const result = await callAzureOpenAI<ModelRewrite>(
    systemPrompt,
    userPrompt,
    modelRewriteSchema
  );

  return result;
};
