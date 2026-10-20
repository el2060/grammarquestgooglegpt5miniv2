import React from 'react';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface Props { onGetStarted: () => void; onExploreScenes: () => void }

export function HomePage({ onGetStarted, onExploreScenes }: Props) {
  return <div className="home-page">
    <section className="home-welcome" aria-labelledby="home-title">
      <div className="coach-avatar"><img src="/grammar-coach-avatar.png" alt="A friendly blue book character winking hello" width={1024} height={1024} fetchPriority="high" /></div>
      <p className="welcome-eyebrow">A LITTLE PRACTICE. A LOT MORE CONFIDENCE.</p>
      <h2 id="home-title">Meet your Grammar Coach.</h2>
      <p className="welcome-description">Your ideas deserve great sentences. Get friendly AI feedback, practise tricky grammar, and watch your confidence grow.</p>
      <div className="welcome-actions"><button className="welcome-primary" onClick={onGetStarted}>Get started <ArrowRightIcon className="w-4 h-4" /></button><button className="welcome-secondary" onClick={onExploreScenes}><BookOpenIcon className="w-4 h-4" /> Explore scenes</button></div>
      <p className="welcome-key-note">Connect your own Gemini API key when you're ready.</p>
    </section>
    <section id="how-it-works" className="welcome-features" aria-label="How your grammar coach helps">
      <article><span>01</span><h3>Write with clarity.</h3><p>Understand your mistakes with simple, personalised grammar feedback.</p></article>
      <article><span>02</span><h3>Learn by doing.</h3><p>Try quick quizzes, earn XP and collect badges with every small win.</p></article>
      <article><span>03</span><h3>See a better version.</h3><p>Explore a polished example of your writing and learn why it works.</p></article>
    </section>
  </div>;
}
