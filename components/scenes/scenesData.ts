import type { Scene } from '../../types';
import { MugIcon } from '../icons/MugIcon';
import { ComputerDesktopIcon } from '../icons/ComputerDesktopIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { SunIcon } from '../icons/SunIcon';
import { PhotoIcon } from '../icons/PhotoIcon';
import { CreditCardIcon } from '../icons/CreditCardIcon';
import { ListBulletIcon } from '../icons/ListBulletIcon';
import { ChatBubbleOvalLeftEllipsisIcon } from '../icons/ChatBubbleOvalLeftEllipsisIcon';

export const scenesData: Scene[] = [
  // Scene 1: Subject-Verb Agreement
  {
    id: 'sv-agreement-kopi',
    title: 'Subject-Verb Agreement',
    description: 'Ordering kopi and understanding why subjects and verbs must agree.',
    icon: MugIcon,
    panels: [
      {
        type: 'dialogue',
        content: {
          character: 'Ben',
          line: 'Auntie, one Kopi O, please. My friend <b>want</b> one also.',
          annotation: "Notice the verb 'want'. Does it match the subject 'friend'?",
        },
      },
      {
        type: 'explanation',
        content: "In the sentence, 'My friend want one also', the subject is 'friend', which is singular.",
        explanation: "Singular subjects need singular verbs. The correct singular form of 'want' is 'wants'. So, it should be 'My friend <b>wants</b> one also'.",
        explanationAnnotation: "A simple trick: singular verbs in the present tense often end with an '-s'.",
      },
      {
        type: 'dialogue',
        content: {
          character: 'Auntie',
          line: 'Okay, two Kopi O. Here you go. The kopi <b>are</b> very hot, be careful.',
          annotation: "What about 'kopi'? Is it singular or plural?",
        },
      },
      {
        type: 'explanation',
        content: "Here, 'kopi' is treated as an uncountable noun, which is singular.",
        explanation: "Uncountable nouns (like water, rice, or information) use singular verbs. The sentence should be 'The kopi <b>is</b> very hot'.",
      },
      {
        type: 'summary',
        content: 'Remember to match your subject and verb!',
        keyTakeaway: 'Singular subjects (he, she, the cat) use singular verbs (runs, eats). Plural subjects (they, the cats) use plural verbs (run, eat).',
      },
    ],
  },
  // Scene 2: Tenses
  {
    id: 'tenses-project-deadline',
    title: 'Using Correct Tenses',
    description: 'Discussing a project deadline and using past, present, and future tenses.',
    icon: ComputerDesktopIcon,
    panels: [
      {
        type: 'dialogue',
        content: {
          character: 'Sarah',
          line: 'Hey Alex, I <b>finish</b> the slides for our presentation yesterday.',
          annotation: "The action happened 'yesterday'. Is 'finish' the right verb tense?",
        },
      },
      {
        type: 'explanation',
        content: "The word 'yesterday' indicates the action happened in the past.",
        explanation: "For actions completed in the past, we use the simple past tense. The past tense of 'finish' is 'finished'. The correct sentence is 'I <b>finished</b> the slides...'",
        explanationAnnotation: "Look for time clues like 'yesterday', 'last week', or 'in 2020' to decide if you need the past tense.",
      },
      {
        type: 'dialogue',
        content: {
          character: 'Alex',
          line: 'Great! I <b>am reviewing</b> them now and I <b>was adding</b> my part later tonight.',
          annotation: "Alex is talking about two different timeframes. Are the tenses correct?",
        },
      },
      {
        type: 'explanation',
        content: "Alex talks about reviewing 'now' (present) and adding his part 'later tonight' (future).",
        explanation: "For an immediate action, 'I am reviewing them now' (present continuous) works well. For a future plan, 'I will add my part later' (simple future) is perfect. So, 'I <b>am reviewing</b> them now and I <b>will add</b> my part later tonight.'",
      },
      {
        type: 'summary',
        content: 'Choosing the right tense helps your listener understand when an action happened.',
        keyTakeaway: 'Use past tense for completed actions, present for current actions, and future for upcoming actions. Pay attention to time words!',
      },
    ],
  },
  // Scene 3: Modals
  {
    id: 'modals-library-help',
    title: 'Understanding Modals',
    description: 'Learning how to ask for help politely using modals like "can", "could", and "may".',
    icon: UserGroupIcon,
    panels: [
      {
        type: 'dialogue',
        content: {
          character: 'Chloe',
          line: 'Excuse me, <b>can</b> I borrow this book?',
          annotation: "'Can' is a modal verb used to ask for permission. It's common and friendly.",
        },
      },
      {
        type: 'explanation',
        content: "Using modals like 'can', 'could', or 'may' is a polite way to make requests.",
        explanation: "'Could' is often considered slightly more polite than 'can'. '<b>Could</b> I borrow this book?'. 'May' is the most formal: '<b>May</b> I borrow this book?'",
        explanationAnnotation: 'The modal you choose can change the tone of your question from informal to formal.',
      },
      {
        type: 'dialogue',
        content: {
          character: 'Librarian',
          line: 'Of course. You <b>should</b> return it in two weeks. You <b>must not</b> write in it.',
          annotation: "The librarian uses 'should' for advice and 'must not' for a strict rule.",
        },
      },
      {
        type: 'explanation',
        content: "'Should' is used to give advice or a recommendation.",
        explanation: "'Must' and 'must not' (or 'mustn't') are used for obligations and prohibitions. It means there is no choice. For example, 'You <b>must</b> finish your project by Friday'.",
      },
      {
        type: 'summary',
        content: 'Modals add meaning to other verbs, expressing things like ability, permission, or obligation.',
        keyTakeaway: "Use 'can/could/may' for requests, 'should' for advice, and 'must' for strong obligations.",
      },
    ],
  },
  // Scene 4: Clauses
  {
    id: 'clauses-bbq',
    title: 'East Coast BBQ Plan',
    description: 'Learn how to connect ideas using independent and dependent clauses.',
    icon: SunIcon,
    panels: [
      {
        type: 'dialogue',
        content: {
          character: 'Jia Hao',
          line: 'We should have a BBQ at East Coast Park <b>because the weather is good</b>.',
          annotation: "The sentence has a main idea and a reason. How are they connected?",
        },
      },
      {
        type: 'explanation',
        content: "This sentence has two parts. 'We should have a BBQ at East Coast Park' is an <b>independent clause</b>; it can be a sentence on its own.",
        explanation: "The second part, 'because the weather is good', is a <b>dependent clause</b>. It starts with 'because' and cannot stand alone as a complete sentence. It needs the main clause to make sense.",
        explanationAnnotation: "Words like 'because', 'if', 'when', and 'while' often start dependent clauses.",
      },
      {
        type: 'dialogue',
        content: {
          character: 'Aisha',
          line: 'Okay! <b>While you guys buy the food</b>, I will go and book the pit.',
          annotation: "Here the dependent clause comes first. How does that change the sentence?",
        },
      },
      {
        type: 'explanation',
        content: "Here, 'While you guys buy the food' is the dependent clause.",
        explanation: "When a dependent clause comes before the independent clause ('I will go and book the pit'), you must put a comma after it.",
      },
      {
        type: 'summary',
        content: 'Combining clauses makes your writing more detailed and interesting.',
        keyTakeaway: "A sentence needs at least one independent clause. Use dependent clauses to add extra information like reasons, times, or conditions.",
      },
    ]
  },
  // Scene 5: Run-on Sentences
  {
    id: 'run-on-ig-caption',
    title: 'IG Caption Fix',
    description: 'Fix long, confusing sentences to make your social media posts clear.',
    icon: PhotoIcon,
    panels: [
       {
        type: 'dialogue',
        content: {
          character: 'Fiona',
          line: 'Just finished my FYP it was so tough but I am so happy now.',
          annotation: "This sentence feels a bit long and breathless. Can you spot the two main ideas?",
        },
      },
      {
        type: 'explanation',
        content: "This is a <b>run-on sentence</b>. It combines two complete sentences (independent clauses) without proper punctuation.",
        explanation: "The two main ideas are 'Just finished my FYP' and 'It was so tough but I am so happy now'. You can fix this in a few ways.",
      },
      {
        type: 'explanation',
        content: "<b>Method 1: Use a period.</b> Just finished my FYP. It was so tough, but I am so happy now.",
        explanation: "<b>Method 2: Use a comma and a conjunction (like 'and', 'but', 'so').</b> Just finished my FYP, and it was so tough, but I am so happy now.",
        explanationAnnotation: "A period is the simplest fix. A conjunction helps connect the ideas more smoothly.",
      },
      {
        type: 'summary',
        content: "Clear captions get more likes!",
        keyTakeaway: "Don't connect two complete sentences with just a comma (that's a 'comma splice') or nothing at all. Use a period, a semicolon, or a comma with a conjunction.",
      },
    ]
  },
  // Scene 6: Misplaced Modifiers
  {
    id: 'modifiers-ezlink',
    title: 'The Mysterious EZ-Link Card',
    description: 'Place your descriptions carefully to avoid confusing sentences.',
    icon: CreditCardIcon,
    panels: [
      {
        type: 'dialogue',
        content: {
          character: 'Sam',
          line: 'I found an EZ-Link card on the floor of the bus <b>walking to school</b>.',
          annotation: "This sentence is confusing. Who or what was walking to school?",
        },
      },
      {
        type: 'explanation',
        content: "This sentence has a <b>misplaced modifier</b>. The phrase 'walking to school' is supposed to describe Sam, but it's placed next to 'bus'.",
        explanation: "This makes it sound like the bus was walking to school, which is impossible! Modifiers should be placed as close as possible to the word they are describing.",
      },
      {
        type: 'explanation',
        content: "Here's the corrected sentence:",
        explanation: "<b>Walking to school</b>, I found an EZ-Link card on the floor of the bus. (Now it's clear that 'I' was walking). OR: I found an EZ-Link card on the floor of the bus <b>while I was walking to school</b>.",
      },
      {
        type: 'summary',
        content: "Clear descriptions prevent confusion.",
        keyTakeaway: "Always place descriptive phrases (modifiers) right next to the person or thing they are describing to avoid silly or confusing sentences.",
      },
    ]
  },
    // Scene 7: Parallel Structure
  {
    id: 'parallel-poster',
    title: 'Open House Poster Design',
    description: 'Create balanced and stylish lists for posters and presentations.',
    icon: ListBulletIcon,
    panels: [
      {
        type: 'dialogue',
        content: {
          character: 'Design Lead',
          line: 'For the poster, list the event highlights: <b>campus tours, watching performances, and to eat free food</b>.',
          annotation: "This list feels a bit unbalanced. Do you see how the items are structured differently?",
        },
      },
      {
        type: 'explanation',
        content: "This list lacks <b>parallel structure</b>. The items are not in the same grammatical form.",
        explanation: "We have a noun ('tours'), a gerund phrase ('watching...'), and an infinitive phrase ('to eat...'). To make it parallel, all items should have the same form.",
      },
      {
        type: 'explanation',
        content: "<b>Correction Option 1 (using nouns):</b> Campus tours, live performances, and free food.",
        explanation: "<b>Correction Option 2 (using '-ing' verbs):</b> Touring the campus, watching performances, and eating free food.",
        explanationAnnotation: "Both are correct! The important thing is consistency.",
      },
      {
        type: 'summary',
        content: 'Parallel lists are easier to read and look more professional.',
        keyTakeaway: "When you make a list, make sure all the items have the same grammatical pattern (e.g., all nouns, all '-ing' verbs, etc.).",
      },
    ]
  },
    // Scene 8: Punctuation
  {
    id: 'punctuation-whatsapp',
    title: 'CCA WhatsApp Chaos',
    description: 'See how commas and question marks can prevent misunderstandings.',
    icon: ChatBubbleOvalLeftEllipsisIcon,
    panels: [
       {
        type: 'dialogue',
        content: {
          character: 'Ryan',
          line: 'For the party we need to buy drinks snacks games and decorations.',
          annotation: "This is hard to read. What's missing?",
        },
      },
      {
        type: 'explanation',
        content: "When you have a list of three or more items, you need to separate them with <b>commas</b>.",
        explanation: "Correct version: We need to buy <b>drinks, snacks, games, and decorations.</b> The comma before 'and' is called the Oxford comma. It's optional but often makes sentences clearer.",
      },
      {
        type: 'dialogue',
        content: {
          character: 'Bella',
          line: 'Okay who is bringing the speaker.',
          annotation: "Bella is asking something, but the sentence doesn't show it.",
        },
      },
      {
        type: 'explanation',
        content: "This is a direct question, so it needs a <b>question mark</b> at the end.",
        explanation: "Correct version: Okay, who is bringing the speaker<b>?</b>",
      },
       {
        type: 'summary',
        content: "Good punctuation makes your messages easy to understand.",
        keyTakeaway: "Use commas to separate items in a list, and use a question mark at the end of every question.",
      },
    ]
  },
    // Scene 9: Articles
  {
    id: 'articles-bubble-tea',
    title: 'The Perfect Bubble Tea',
    description: "Learn when to use 'a', 'an', and 'the' while ordering a drink.",
    icon: MugIcon,
    panels: [
        {
        type: 'dialogue',
        content: {
          character: 'Customer',
          line: "Hi, I'd like to order <b>a</b> bubble tea, please.",
          annotation: "The customer uses 'a' because they are talking about any general bubble tea, not a specific one.",
        },
      },
      {
        type: 'explanation',
        content: "Use 'a' or 'an' (indefinite articles) when you are talking about a singular noun for the first time, or when you mean 'any one' of something.",
        explanation: "Use 'a' before words that start with a consonant sound (a drink, a cup). Use 'an' before words that start with a vowel sound (an orange, an hour).",
      },
      {
        type: 'dialogue',
        content: {
          character: 'Barista',
          line: "Sure. We have a new special today. Would you like to try <b>the</b> special?",
          annotation: "The barista now uses 'the' because they are referring to a specific special that they just mentioned.",
        },
      },
      {
        type: 'explanation',
        content: "Use 'the' (the definite article) when you are talking about a specific noun that both the speaker and listener know about.",
        explanation: "It's specific because it was just introduced ('a new special'). Now it's 'the special'.",
      },
      {
        type: 'summary',
        content: "Using the correct article makes your request clear.",
        keyTakeaway: "Use 'a' or 'an' for general, non-specific nouns. Use 'the' for specific nouns that have already been mentioned or are unique.",
      },
    ]
  }
];
