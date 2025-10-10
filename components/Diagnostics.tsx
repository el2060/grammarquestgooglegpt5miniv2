import React, { useState, useCallback } from 'react';
import { analyzeTextForFeedback, generateQuizFromFeedback, generateModelRewrite } from '../services/azureOpenAIService';
import type { QuizQuestion, FeedbackItem, ModelRewrite } from '../types';
import { SAMPLE_TEXTS } from '../constants';
import { Quiz } from './Quiz';
import { Loader } from './Loader';
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

  const [analysisView, setAnalysisView] = useState<AnalysisView>('feedback');
  const [lastSampleIndex, setLastSampleIndex] = useState<number | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (text.trim().length < 10) {
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
      setFeedback([]); 
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
    return <div className="py-10"><Loader text="Analyzing your text..." /></div>;
  }

  if (feedback !== null) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <h2 className="text-2xl font-bold text-slate-900">Your Analysis Results</h2>
                <button onClick={() => handleReset(true)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors flex-shrink-0">
                    <ArrowPathIcon className="w-4 h-4" />
                    Analyze New Text
                </button>
            </div>
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Your Analyzed Text</h3>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{submittedText}</p>
            </div>
            
            <div className="mt-6">
                <h3 className="text-lg font-bold text-slate-800 text-center mb-4">Choose Your Analysis</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-100 p-1.5 rounded-xl">
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
                            <button key={view} onClick={() => setAnalysisView(view)} className={`px-4 py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-2 ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}>
                                <Icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{labels[view]}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="mt-6 min-h-[200px]">
                {error && <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}
                
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
                        {isLoadingQuiz && <Loader text="Generating your quiz..." />}
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
                        {isLoadingRewrite && <Loader text="Polishing your text..." />}
                        {!isLoadingRewrite && !modelRewrite && feedback.length > 0 && (
                           <div className="text-center py-8">
                                <p className="text-slate-600 mb-4">See how AI would polish your text to fix errors and improve clarity.</p>
                                <button onClick={handleGenerateRewrite} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Generate AI Polish</button>
                            </div>
                        )}
                        {!isLoadingRewrite && modelRewrite && (
                           <div className="space-y-4">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-bold text-blue-800 mb-2">Polished Version:</h4>
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
     <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/60 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-5 shadow-md">
            <ClipboardDocumentCheckIcon className="w-9 h-9 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Diagnostic Tool</h2>
        <p className="text-slate-600 mt-2 max-w-xl mx-auto font-medium">
            Analyse your writing to identify grammar areas for improvement. <br />
            Receive <span className="text-blue-600 font-bold">personalised AI feedback</span> and <span className="text-blue-600 font-bold">targeted practice exercises</span>.
        </p>

        <div className="mt-6 text-left relative">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="My final year project is due next month, so me and my groupmates is very busy..."
                className="w-full h-48 p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-slate-900 placeholder-slate-400 shadow-sm"
            />
             <div className="absolute bottom-3 right-3 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                {wordCount} words
            </div>
        </div>

        <button
            onClick={handleAnalyze}
            disabled={wordCount < 10}
            className="w-full px-8 py-4 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
        >
            <PencilSquareIcon className="w-5 h-5" />
            Analyse My Writing
        </button>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm font-medium">
            <button onClick={handleUseSample} className="text-slate-600 hover:text-blue-600 transition-colors hover:scale-105 transform">
              {text.length > 0 ? 'Try another sample' : 'Use a sample text'}
            </button>
            <span className="text-slate-300">|</span>
            {text.length > 0 && (
                <>
                    <button onClick={handleClearText} className="text-slate-600 hover:text-rose-600 transition-colors hover:scale-105 transform">
                      Clear text
                    </button>
                    <span className="text-slate-300">|</span>
                </>
            )}
            <button onClick={onLearnWithScenesClick} className="text-slate-600 hover:text-green-600 transition-colors hover:scale-105 transform">
              Learn with Scenes
            </button>
        </div>
    </div>
  );
};