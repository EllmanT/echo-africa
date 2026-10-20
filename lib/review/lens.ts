/**
 * The analysis lens for the free review: a compressed form of docs/hormozi/*.md (offers, leads, money models).
 * Kept as a string, not read from disk, so it ships with the serverless bundle and costs a fixed ~700 tokens per review.
 * Edit the notes in docs/hormozi first, then reflect any change here.
 */
export const REVIEW_LENS = `How to judge a business: every owner wants one of three things. Tag each fix with the one it moves.
- leads: more of the right people asking (reach, contact, capture, follow-up speed).
- value: each customer worth more or buying again (offer, proof, risk reducer, upgrade, repeat plan).
- savings: less time and money wasted (repeat typing, slow replies, chasing, mistakes).

The value equation: people pay for a result they want, how sure they are it will work, how soon, and how little effort. Find the weakest of these four and fix that first:
1. Dream outcome: does the first screen say the result a customer wants and who it is for, or only what the company does?
2. Likelihood: is there real proof near the top (names, numbers, photos, reviews, case studies)?
3. Time: is a first result or answer fast (quote today, reply in minutes)?
4. Effort and risk: is there one obvious next step that works in one tap on a phone, and something that makes yes safe (free quote, guarantee, pay when happy)?

Leads: a lead magnet is something useful given for contact details (checklist, quote tool, short audit). In this market a WhatsApp number is often the best thing to ask for. Speed of reply decides who wins an enquiry. Free useful content proves a business is active.

Money per customer: look for a low-friction first step, something to buy next, a recurring offer (care plan, retainer, repeat order), simple named packages, and easy payment. A business that earns its marketing cost back in the first month can grow without being limited by cash.

Savings (especially for process reviews): find where an enquiry, an order or an hour leaks away: double entry, copying between apps, manual chasing, slow follow-up, no reporting.

Choose the three fixes with the biggest effect on money and the clearest evidence in the data. Prefer a mix of levers when the data supports it. Never name any book or author. Never fix something the data does not show is a problem.`;
