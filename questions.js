/**
 * SHADOWPROOF — Question Banks
 * One array per module. Consumed by assessment.js via:
 *   ShadowproofAssessment.init({ moduleId, moduleTitle, questions: SHADOWPROOF_QUESTIONS.aitm, ... })
 * Question shape: { question, options[], correct (index), explanation }
 */
window.SHADOWPROOF_QUESTIONS = {

  aitm: [
    {
      question: 'What makes an AiTM (Adversary-in-the-Middle) attack especially dangerous?',
      options: [
        'It guesses your password through brute force',
        'It steals your active session even when MFA is enabled',
        'It only works against people with weak passwords',
        'It physically damages your device'
      ],
      correct: 1,
      explanation: 'AiTM proxies the real login in real time and captures your session cookie after you pass MFA — so multi-factor alone does not stop it.'
    },
    {
      question: 'You get an email with a link to "review a shared document." What is the safest habit?',
      options: [
        'Click it if the sender name looks familiar',
        'Hover the link, and click if it looks close enough',
        'Never reach a login page from an emailed link — open a new tab and type the address or use a bookmark',
        'Reply and ask the sender if it is legitimate'
      ],
      correct: 2,
      explanation: 'The strongest defense is to never authenticate through a link you were sent. Navigate to the site yourself so a proxy page never gets your credentials.'
    },
    {
      question: 'Which detail exposes the sender "no-reply@rnicrosoft-secure.com"?',
      options: [
        'The word "secure" proves it is safe',
        '"rn" is used to imitate the letter "m" — it is not microsoft.com',
        '"no-reply" means it is automated and trustworthy',
        'Nothing — it is a normal Microsoft domain'
      ],
      correct: 1,
      explanation: '"rn" placed together mimics "m" at a glance. The real domain is microsoft.com. Lookalike domains are a core phishing tell.'
    },
    {
      question: 'The email warns the document "expires in 24 hours or data will be lost." This is:',
      options: [
        'A helpful courtesy reminder',
        'Manufactured urgency designed to rush your judgment',
        'Standard Microsoft policy',
        'A sign the message is genuine'
      ],
      correct: 1,
      explanation: 'Artificial time pressure is engineered to make you act before you think. Feeling rushed by a message is exactly when to slow down.'
    }
  ],

  bec: [
    {
      question: 'A text from an unknown number says: "It\'s David, your CEO — new phone. Need a quick favor." The best first move is to:',
      options: [
        'Reply and ask what he needs',
        'Verify through a known channel (Teams, Slack, or his known desk line) before doing anything',
        'Buy the gift cards to be safe',
        'Delete it and tell no one'
      ],
      correct: 1,
      explanation: 'Verifying through a channel you already trust is the single most effective defense against BEC. The "new phone" line is the most common opener.'
    },
    {
      question: 'Which request pattern should be treated as hostile until proven otherwise?',
      options: [
        'A request to join a meeting',
        'A request involving gift cards, wire transfers, or changed banking details',
        'A request to review a shared calendar',
        'A request to update your email signature'
      ],
      correct: 1,
      explanation: 'Gift cards, wires, crypto, and banking-detail changes are the money-movement patterns at the heart of BEC. They warrant out-of-band verification every time.'
    },
    {
      question: 'A vendor emails from "acme-corp.net" asking to update their bank details — but your records show acme-corp.com. You should:',
      options: [
        'Update it since the invoice number matches',
        'Call the vendor on a number you already have on file to confirm',
        'Reply to the email asking if they are sure',
        'Update it, but only for small amounts'
      ],
      correct: 1,
      explanation: 'The .net vs .com swap is a lookalike domain. Any banking change must be confirmed by calling a number you already trust — never one from the email.'
    },
    {
      question: '"Keep this between us for now" in a payment message is a red flag because:',
      options: [
        'It signals the request is confidential and important',
        'Isolation is a tactic — real executives don\'t ask you to hide business transactions',
        'It means a reward is coming',
        'It is a normal part of finance work'
      ],
      correct: 1,
      explanation: 'Secrecy requests exist to stop you from verifying with someone who might catch the scam. Legitimate business does not need to be hidden.'
    }
  ],

  smishing: [
    {
      question: 'A text claims to be USPS about a "held package," linking to usps-parcelupdate.co/verify. The clearest red flag is:',
      options: [
        'USPS never sends any texts',
        'The domain is not usps.com — it is a lookalike using a .co suffix',
        'Packages are never actually held',
        'The message is too short'
      ],
      correct: 1,
      explanation: 'Real USPS uses usps.com. Lookalike domains with odd suffixes (.co, -secure, extra words) are the hallmark of smishing.'
    },
    {
      question: 'Which agency will legitimately text you demanding immediate payment to avoid arrest?',
      options: ['The IRS', 'The SSA', 'The DMV', 'None — agencies do not text arrest threats'],
      correct: 3,
      explanation: 'The IRS, SSA, and DMV do not text threats or arrest warnings. Authority-based urgency about arrest or warrants is always a scam.'
    },
    {
      question: 'The best way to report a smishing text and help block the sender is to:',
      options: [
        'Reply "STOP"',
        'Forward it to 7726 (SPAM), then delete and block',
        'Click the link to see where it leads',
        'Call the number back'
      ],
      correct: 1,
      explanation: 'Forwarding to 7726 lets your carrier block the sender network-wide. Replying "STOP" only confirms your number is active.'
    },
    {
      question: 'A text feels professional, has no link, and references your real appointment. This is:',
      options: [
        'Definitely a scam — every text is',
        'Possibly legitimate — but still verify before sharing anything sensitive',
        'Safe to reply to with your password',
        'A reason to send personal details'
      ],
      correct: 1,
      explanation: 'Not every text is a scam; legit messages feel unremarkable. The rule holds: never share sensitive info by text, and verify anything that asks for it.'
    }
  ],

  quishing: [
    {
      question: 'The single most important habit when scanning any QR code is to:',
      options: [
        'Scan it quickly before it expires',
        'Read the URL preview your phone shows before you tap to open it',
        'Trust it if a company logo is next to it',
        'Only scan codes printed in color'
      ],
      correct: 1,
      explanation: 'Every modern phone shows a URL preview after scanning. Reading it before you tap is the whole defense — two seconds that catch most malicious codes.'
    },
    {
      question: 'A QR code on a parking meter looks like a sticker placed over another sticker. You should:',
      options: [
        'Scan it — stickers are normal',
        'Treat it as hostile; attackers paste fake QR stickers over real ones',
        'Peel it and immediately scan what is underneath',
        'Scan it but enter only a small payment'
      ],
      correct: 1,
      explanation: 'Layered or fresh-looking stickers on public codes are a top quishing tactic. If it looks added-on, do not scan it.'
    },
    {
      question: 'An email from "IT" has a QR code to scan to "re-enroll your MFA." The right move is:',
      options: [
        'Scan it with your phone right away',
        'Do not scan; use the real system on your computer or contact IT directly',
        'Forward it to your team so they can scan it too',
        'Scan it only if your name appears in it'
      ],
      correct: 1,
      explanation: 'QR codes in email exist to move you off your monitored computer onto your phone. Real MFA changes happen through official channels, not an emailed code.'
    },
    {
      question: 'A scanned QR code opens a page that looks like a Microsoft sign-in. You should:',
      options: [
        'Enter your credentials — it looks official',
        'Close it; open the app or type the URL yourself — logins should not come from scanning a square',
        'Enter a fake password to test it',
        'Screenshot it and sign in later'
      ],
      correct: 1,
      explanation: 'A QR leading to a login page is almost always a credential harvester. Real sign-ins happen through your own browser or app.'
    }
  ],

  vishing: [
    {
      question: 'The most reliable defense against a suspicious "support" call is to:',
      options: [
        'Ask the caller to prove their identity over the phone',
        'Hang up and call back on the official number you look up yourself',
        'Stay on the line and cooperate to be polite',
        'Give partial info to test them'
      ],
      correct: 1,
      explanation: 'Hanging up and calling the real number yourself defeats nearly every vishing call. A scammer\'s callback path won\'t reach the real organization.'
    },
    {
      question: 'A caller claiming to be "Microsoft security" asks you to read back the 6-digit code just texted to you. You should:',
      options: [
        'Read it — they need it to secure your account',
        'Never share it; a code read aloud lets them log in as you',
        'Read only the first three digits',
        'Ask them to text you first'
      ],
      correct: 1,
      explanation: 'MFA codes are never shared aloud with anyone. If someone asks you to read a code, they are attacking your account — every time.'
    },
    {
      question: 'A caller already knows your name, title, and department. This means:',
      options: [
        'They must be legitimate — only real staff would know that',
        'Nothing about legitimacy; that info is easily found on LinkedIn, company sites, or breaches',
        'You can safely share your password',
        'They must work in your building'
      ],
      correct: 1,
      explanation: 'Familiarity is not authentication. Personal details are trivially available and are used to manufacture false trust.'
    },
    {
      question: 'Your "CEO" leaves a voicemail urgently asking you to move money — and the voice sounds exactly right. You should:',
      options: [
        'Act immediately because it sounds like them',
        'Verify on a separate known channel or ask something only the real person would know — voice cloning is real',
        'Reply to the voicemail with a transfer confirmation',
        'Forward the voicemail to accounting to handle'
      ],
      correct: 1,
      explanation: 'AI voice cloning needs only seconds of audio. Trust the verified identity, not the sound — confirm through a channel you already trust.'
    }
  ]

};
