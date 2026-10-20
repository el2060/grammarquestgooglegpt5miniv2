import React, { useState, useMemo, useRef } from 'react';
import type { QuizQuestion } from '../types';
import { XP_PER_CORRECT_ANSWER } from '../constants';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface QuizProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number, questionsAnswered: number, correctAnswersByTopic: Record<string, number>) => void;
  quizId: string;
  onReset?: () => void;
  onPracticeAgain?: () => void;
  xpMultiplier?: number;
}

const renderWithBold = (text: string) => {
    const parts = text.split(/<b>(.*?)<\/b>/g);
    return parts.map((part, index) =>
      index % 2 === 1 ? <b key={index} className="font-semibold text-slate-900">{part}</b> : part
    );
};

const renderWithItalics = (text: string) => {
    const parts = text.split(/\*(.*?)\*/g);
    return parts.map((part, index) =>
      index % 2 === 1 ? <i key={index}>{part}</i> : part
    );
};


export const Quiz: React.FC<QuizProps> = ({ questions, onQuizComplete, quizId, onReset, onPracticeAgain, xpMultiplier = 1 }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [checked, setChecked] = useState(false);
  const completed = useRef(false);
  const rewardClaimed = useRef(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    if (checked) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleNext = () => {
    if (!checked || completed.current) return;
    setChecked(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      completed.current = true;
      const finalScore = questions.reduce((total, question, index) => {
        return total + (userAnswers[index] === question.correctAnswer ? 1 : 0);
      }, 0);

      const correctAnswersByTopic: Record<string, number> = {};
      questions.forEach((q, index) => {
        if (userAnswers[index] === q.correctAnswer) {
          correctAnswersByTopic[q.topic] = (correctAnswersByTopic[q.topic] || 0) + 1;
        }
      });
      
      if (!rewardClaimed.current) {
        rewardClaimed.current = true;
        onQuizComplete(finalScore, questions.length, correctAnswersByTopic);
      }
    }
  };

  const score = useMemo(() => {
    return questions.reduce((total, question, index) => {
      return total + (userAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  }, [questions, userAnswers]);

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsFinished(false);
    setChecked(false);
    completed.current = false;
  }

  if (isFinished) {
    const earnedXp = Math.round(score * XP_PER_CORRECT_ANSWER * xpMultiplier);

    return (
      <div className="p-2 sm:p-4">
        <div className="text-center">
            <h3 className="text-3xl font-bold text-slate-900">Quiz Complete!</h3>
            {earnedXp > 0 && <p className="font-semibold text-base text-amber-800 bg-gradient-to-r from-amber-200 to-yellow-200 inline-block px-5 py-2 rounded-full my-4 shadow-md border border-amber-300/50">+ {earnedXp} XP Earned!</p>}
            <p className="text-lg my-2 text-slate-600 font-medium">You scored</p>
            <p className="text-7xl font-extrabold bg-blue-600 bg-clip-text text-transparent my-4">{score}<span className="text-5xl text-slate-400"> / {questions.length}</span></p>
        </div>

        <div className="space-y-3 my-8 text-left">
            <h4 className="text-xl font-semibold text-slate-800 mb-4">Review your answers</h4>
            {questions.map((q, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                    <div key={index} className={`p-4 rounded-xl border shadow-sm ${isCorrect ? 'bg-gradient-to-br from-emerald-50 to-green-50/60 border-emerald-200/60' : 'bg-gradient-to-br from-rose-50 to-red-50/60 border-rose-200/60'}`}>
                        <div className="flex items-start gap-3">
                            {isCorrect ? <CheckCircleIcon className="w-6 h-6 text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircleIcon className="w-6 h-6 text-rose-500 mt-0.5 flex-shrink-0" />}
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-800">{index + 1}. {renderWithItalics(q.question)}</p>
                                <p className={`mt-2 text-sm font-medium ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                                   Your answer: {userAnswer ? renderWithBold(userAnswer) : "Not answered"}
                                </p>
                                {!isCorrect && (
                                   <p className="mt-1 text-sm font-medium text-emerald-800">
                                       Correct answer: {renderWithBold(q.correctAnswer)}
                                   </p>
                                )}
                                {q.explanation && <p className="mt-2 text-sm text-slate-600">{q.explanation}</p>}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
        <div className="text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            {onPracticeAgain ? (
                <button onClick={onPracticeAgain} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-sm ">
                    Generate New Practice Set
                </button>
            ) : (
                <button onClick={resetQuiz} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-sm ">
                    Retake Quiz
                </button>
            )}
            {onReset && (
                <button onClick={onReset} className="w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-300 transition-all shadow-md hover:shadow-sm ">
                    Analyze New Text
                </button>
            )}
        </div>
      </div>
    );
  }

  const progressPercentage = (currentQuestionIndex / questions.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2" aria-live="polite">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <div className="bg-slate-200 rounded-full h-3 w-full shadow-inner">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 shadow-md" style={{ width: `${progressPercentage}%`}}></div>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mt-6 text-slate-800">{renderWithItalics(currentQuestion.question)}</h3>
      </div>
      <div className="space-y-3">
        {currentQuestion.options.map((option) => {
          const isSelected = userAnswers[currentQuestionIndex] === option;
          return (
            <button
              key={option}
              aria-pressed={isSelected}
              disabled={checked}
              onClick={() => handleSelectAnswer(option)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-base shadow-sm hover:shadow-md ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 text-blue-900 shadow-md'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <span className={isSelected ? 'text-slate-800 font-medium' : 'text-slate-700'}>{renderWithBold(option)}</span>
              {isSelected && (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {checked && <div role="status" className={`p-4 rounded-xl border ${userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}><p className="font-semibold">{userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? 'Correct. Nicely done!' : 'A chance to learn.'}</p><p className="text-sm mt-1">Correct answer: {renderWithBold(currentQuestion.correctAnswer)}</p>{currentQuestion.explanation && <p className="text-sm mt-2">{currentQuestion.explanation}</p>}</div>}
      <div className="text-right pt-2">
        {!checked ? <button className="primary-button" disabled={!userAnswers[currentQuestionIndex]} onClick={() => setChecked(true)}>Check answer</button> :
        <button
          onClick={handleNext}
          disabled={!userAnswers[currentQuestionIndex]}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-sm "
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
        </button>
        }
      </div>
    </div>
  );
};
