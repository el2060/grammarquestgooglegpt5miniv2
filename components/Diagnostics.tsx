import React, { useState, useCallback } from 'react';
import { analyzeTextForFeedback, generateQuizFromFeedback, generateModelRewrite } from '../services/geminiService';
import type { QuizQuestion, FeedbackItem, ModelRewrite } from '../types';
import { SAMPLE_TEXTS } from '../constants';
import { Quiz } from './Quiz';
import { Loader } from './Loader';
import { GrammarTipsLoader } from './GrammarTipsLoader';
import { QuizGenerationLoader } from './QuizGenerationLoader';
import { AiPolishLoader } from './AiPolishLoader';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface DiagnosticsProps {
  onQuizComplete: (score: number, questionsAnswered: number, correctAnswersByTopic: Record<string, number>) => void;
  selectedTopics: string[];
  onLearnWithScenesClick: () => void;
  onAnalysisComplete: () => void;
}

type AnalysisView = 'feedback' | 'quiz' | 'polish';

export const Diagnostics: React.FC<DiagnosticsProps> = ({ onQuizComplete, selectedTopics, onLearnWithScenesClick, onAnalysisComplete }) => {
  const [text, setText] = useState('');
  const [submittedText, setSubmittedText] = useState('');

  const [feedback, setFeedback] = useState<FeedbackItem[] | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [modelRewrite, setModelRewrite] = useState<ModelRewrite | null>(null);

  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isLoadingRewrite, setIsLoadingRewrite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState('');

  const [analysisView, setAnalysisView] = useState<AnalysisView>('feedback');
  const [lastSampleIndex, setLastSampleIndex] = useState<number | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (text.trim().split(/\s+/).length < 10 || selectedTopics.length === 0) {
      alert("Please enter at least 10 words to analyze.");
      return;
    }
    handleReset(false);
    setIsLoadingFeedback(true);
    setError(null);
    setSubmittedText(text);

    try {
      const feedbackResult = await analyzeTextForFeedback(text, selectedTopics);
      setFeedback(feedbackResult);
      onAnalysisComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
      setFeedback(null);
    } finally {
      setIsLoadingFeedback(false);
    }
  }, [text, selectedTopics, onAnalysisComplete]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!feedback) return;
    setIsLoadingQuiz(true);
    setError(null);
    try {
      const quizResult = await generateQuizFromFeedback(feedback);
      setQuiz(quizResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz.");
    } finally {
      setIsLoadingQuiz(false);
    }
  }, [feedback]);

  const handlePracticeDiagnosticQuizAgain = useCallback(async () => {
    if (!feedback) return;

    setQuiz(null);
    setIsLoadingQuiz(true);
    setError(null);
    try {
        const quizResult = await generateQuizFromFeedback(feedback);
        setQuiz(quizResult);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate a new quiz.");
    } finally {
        setIsLoadingQuiz(false);
    }
  }, [feedback]);


  const handleGenerateRewrite = useCallback(async () => {
    if (!feedback || !submittedText) return;
    setIsLoadingRewrite(true);
    setError(null);
    try {
      const rewriteResult = await generateModelRewrite(submittedText, feedback);
      setModelRewrite(rewriteResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate AI Polish.");
    } finally {
      setIsLoadingRewrite(false);
    }
  }, [feedback, submittedText]);


  const handleReset = (clearText: boolean = true) => {
    if (clearText) {
      setText('');
      setLastSampleIndex(null);
    }
    setSubmittedText('');
    setFeedback(null);
    setQuiz(null);
    setModelRewrite(null);
    setError(null);
    setIsLoadingFeedback(false);
    setIsLoadingQuiz(false);
    setIsLoadingRewrite(false);
    setAnalysisView('feedback');
  };

  const handleUseSample = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length);
    } while (nextIndex === lastSampleIndex && SAMPLE_TEXTS.length > 1);

    setText(SAMPLE_TEXTS[nextIndex]);
    setLastSampleIndex(nextIndex);
  };

  const handleClearText = () => {
    setText('');
    setLastSampleIndex(null);
  };

  const hasText = text.trim().length > 0;
  const wordCount = hasText ? text.trim().split(/\s+/).length : 0;

  if (isLoadingFeedback) {
    return <div className="py-10"><GrammarTipsLoader text="Gemini is analyzing your grammar..." /></div>;
  }

  if (feedback !== null) {
    return (
        <div className="surface min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <h2 className="text-2xl font-bold text-slate-900">Your Analysis Results</h2>
                <button onClick={() => handleReset(true)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors flex-shrink-0">
                    <PencilSquareIcon className="w-4 h-4" />
                    Analyze New Text
                </button>
            </div>
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Your Analyzed Text</h3>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{submittedText}</p>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-bold text-slate-800 text-center mb-4">Choose Your Analysis</h3>
                <div className="analysis-tabs" aria-label="Analysis results">
                    {(['feedback', 'quiz', 'polish'] as AnalysisView[]).map(view => {
                        const isActive = analysisView === view;
                        const icons = {
                            feedback: ClipboardDocumentListIcon,
                            quiz: BeakerIcon,
                            polish: SparklesIcon
                        };
                        const labels = {
                            feedback: "Grammar Feedback",
                            quiz: "Practice Questions",
                            polish: "AI Polish"
                        }
                        const Icon = icons[view];
                        return (
                            <button key={view} aria-label={labels[view]} aria-pressed={isActive} onClick={() => setAnalysisView(view)} >
                                <Icon className="w-5 h-5" />
                                <span>{view === 'feedback' ? 'Feedback' : view === 'quiz' ? 'Practice' : 'AI Polish'}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="mt-6 min-h-[200px]">
                {error && <div role="alert" className="notice-error">{error}</div>}

                {analysisView === 'feedback' && (
                    <div className="space-y-4 animate-fade-in">
                        {feedback.length > 0 ? feedback.map((item, index) => (
                            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="font-semibold text-blue-700 bg-blue-100 inline-block px-2 py-0.5 rounded-md text-sm">{item.errorType}</p>
                                <p className="text-sm text-slate-600 mt-3">{item.explanation}</p>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-md">
                                        <p className="font-semibold text-rose-800 mb-1">Original:</p>
                                        <p className="text-rose-700 line-through">{item.originalSentence}</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                        <p className="font-semibold text-emerald-800 mb-1">Suggested:</p>
                                        <p className="text-emerald-700 font-medium">{item.correctedSentence}</p>
                                    </div>
                                </div>
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                                    <LightBulbIcon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-amber-800 text-sm">Learning Tip:</p>
                                        <p className="text-sm text-amber-700">{item.learningTip}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <h3 className="text-2xl font-bold text-emerald-800">Great job!</h3>
                                <p className="text-emerald-700 mt-2">We didn't find any errors based on your selected topics.</p>
                            </div>
                        )}
                    </div>
                )}

                {analysisView === 'quiz' && (
                    <div className="animate-fade-in">
                        {isLoadingQuiz && <QuizGenerationLoader text="Creating your personalized quiz..." />}
                        {!isLoadingQuiz && !quiz && feedback.length > 0 && (
                            <div className="text-center py-8">
                                <p className="text-slate-600 mb-4">Test your understanding with a quiz based on your errors.</p>
                                <button onClick={handleGenerateQuiz} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Generate Quiz</button>
                            </div>
                        )}
                        {!isLoadingQuiz && quiz && <Quiz questions={quiz} onQuizComplete={onQuizComplete} quizId="diagnostic-quiz" onReset={() => handleReset(true)} onPracticeAgain={handlePracticeDiagnosticQuizAgain} />}
                        {!isLoadingQuiz && feedback.length === 0 && (
                            <p className="text-center text-slate-500 py-8">No errors were found, so no quiz can be generated.</p>
                        )}
                    </div>
                )}

                {analysisView === 'polish' && (
                    <div className="animate-fade-in">
                        {isLoadingRewrite && <AiPolishLoader text="AI is perfecting your writing..." />}
                        {!isLoadingRewrite && !modelRewrite && feedback.length > 0 && (
                           <div className="text-center py-8">
                                <p className="text-slate-600 mb-4">See how AI would polish your text to fix errors and improve clarity.</p>
                                <button onClick={handleGenerateRewrite} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Generate AI Polish</button>
                            </div>
                        )}
                        {!isLoadingRewrite && modelRewrite && (
                           <div className="space-y-4">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex justify-between items-center gap-3 mb-2"><h4 className="font-bold text-blue-800">Polished Version:</h4><button className="quiet-button" onClick={async () => { try { await navigator.clipboard.writeText(modelRewrite.rewrittenText); setCopyStatus('Copied to clipboard'); } catch { setCopyStatus('Copy unavailable. Select the text to copy it.'); } }}>Copy text</button></div><p role="status" className="text-xs text-blue-700 mb-2">{copyStatus}</p>
                                    <p className="text-blue-900 whitespace-pre-wrap">{modelRewrite.rewrittenText}</p>
                                </div>
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <h4 className="font-bold text-emerald-800 mb-2">Summary of Changes:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-emerald-700 text-sm">
                                        {modelRewrite.summaryOfChanges.map((change, i) => <li key={i}>{change}</li>)}
                                    </ul>
                                </div>
                           </div>
                        )}
                        {!isLoadingRewrite && feedback.length === 0 && (
                            <p className="text-center text-slate-500 py-8">Your text is already great, so no polish is needed!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
  }


  return (
    <section className="surface min-w-0" aria-labelledby="writing-heading">
      <p className="eyebrow">Write. Reflect. Improve.</p>
      <h2 id="writing-heading" className="text-2xl font-bold tracking-tight mt-2">Get feedback on your writing.</h2>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">Share a paragraph. Your coach will explain what to improve and help you practise.</p>
      {error && <p role="alert" className="notice-error">{error}</p>}
      <div className="mt-6">
        <div className="writing-label"><label htmlFor="writing-input">Your writing</label><span>At least 10 words</span></div>
        <textarea id="writing-input" value={text} onChange={event => setText(event.target.value)} aria-describedby="writing-hint" placeholder="Tell us about your day, paste a paragraph, or try a sample below…" className="w-full h-60 p-4 border border-slate-300 rounded-xl focus:border-blue-500 bg-slate-50/40 text-slate-800 placeholder-slate-400 text-sm leading-7 resize-y" />
        <div id="writing-hint" className="flex justify-between gap-3 mt-2 text-xs text-slate-500"><span>{selectedTopics.length === 0 ? 'Select a grammar focus to continue.' : hasText && wordCount < 10 ? `${10 - wordCount} more word${10 - wordCount === 1 ? '' : 's'} to start` : 'Your writing is sent to Google when you analyse it.'}</span><span className="whitespace-nowrap" aria-live="polite">{wordCount} words</span></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <div className="flex gap-2"><button className="quiet-button" onClick={handleUseSample}>{hasText ? 'Try another sample' : 'Use a sample text'}</button>{hasText && <button className="quiet-button" onClick={handleClearText}>Clear text</button>}</div>
        <button className="primary-button w-full sm:w-auto" onClick={handleAnalyze} disabled={wordCount < 10 || selectedTopics.length === 0}><PencilSquareIcon className="w-4 h-4" />Analyse My Writing</button>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500"><span>Prefer to learn with an example?</span><button className="quiet-button text-blue-700" onClick={onLearnWithScenesClick}>Learn with Scenes</button></div>
    </section>
  );
};
