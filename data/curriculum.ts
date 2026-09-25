// Curriculum structure based on the official SAT Suite Question Bank
// domains and skills (College Board), current as of the 2025-2026 digital SAT.
// Source: satsuite.collegeboard.org/practice/student-question-bank

import type { DiagramSpec } from "@/lib/diagramTypes";
import type { FigureSpec } from "@/lib/figureTypes";

// Deliberately the same shape as data/questions.ts's Question type (q /
// choices / answer / explain) -- a worked example IS a real exam-format
// item (full passage or problem, four answer choices, one correct index),
// just one the student walks through with a question-specific explanation
// rather than being scored on. Sharing the shape means they render through
// the same choice component and there's no structural gap between "the
// question you learn from" and "the question you're tested on."
export interface WorkedExample {
  q: string;
  choices: string[]; // always exactly 4, in exam order
  answer: number; // index into choices
  explain: string;
  difficulty: "easy" | "medium" | "hard";
  // Hand-authored schematic figure for geometry examples (right triangles,
  // circles, parallel lines, solids, etc.) -- see lib/diagramTypes.ts and
  // components/GeometryDiagram.tsx. Left unset for non-geometry examples.
  diagram?: DiagramSpec;
  // A table, graph, or plot drawn to scale from its own data (see
  // lib/figureTypes.ts) -- the same figures practice questions use, for
  // examples whose method is reading a real graph (a line of best fit, a
  // curve's intercepts) rather than a schematic.
  figure?: FigureSpec;
  // For RW passage-based questions that reference one specific sentence
  // (e.g. "the underlined sentence") -- the exact substring of `q`, as it
  // literally appears there, to render underlined so the student sees it
  // highlighted directly in the passage rather than having to relocate it.
  underline?: string;
  // One entry per choice, in authored order: why that choice is wrong
  // (null at the correct answer). Shown for the choice a student actually
  // picked, instead of one explanation covering every choice at once.
  why?: (string | null)[];
}

export interface Pattern {
  name: string;
  explanation: string;
  examples: WorkedExample[]; // ordered easy -> hard
  traps: string[];
  // Math-only, and only set when a pattern has a genuine, concrete shortcut
  // via the built-in Desmos calculator (e.g. graphing a system and reading
  // the intersection instead of solving algebraically). Left unset for the
  // large majority of patterns where Desmos doesn't meaningfully help, or
  // where "graph it" isn't a clean, reliable method for that pattern —
  // same restraint as the `pattern` field on questions: only tag it where
  // it cleanly applies, never force it in.
  desmosTrick?: string;
  // Which of the digital SAT's two built-in Desmos calculators the trick
  // above actually needs -- the real exam gives students the graphing
  // calculator on Math questions that allow one and the four-function/
  // scientific calculator on questions that don't, and they're genuinely
  // different tools at different URLs (see SubskillClient's DESMOS_URLS),
  // not two skins on the same one. Every desmosTrick written so far talks
  // students through plotting an equation or a system, so all of them are
  // "graphing" today, but the field exists (rather than hardcoding one
  // URL) for the day a trick is pure computation with no plot involved.
  // Defaults to "graphing" when a trick is set without this -- the
  // majority case -- so it's optional to specify, not required.
  desmosCalculator?: "graphing" | "scientific";
}

export interface Subskill {
  id: string;
  name: string;
  blurb: string;
  patterns: Pattern[];
  tipsAndTricks: string[];
  domain: string;
  section: string;
}

export interface Domain {
  domain: string;
  subskills: Omit<Subskill, "domain" | "section">[];
}

export interface Section {
  section: string;
  domains: Domain[];
}

const LC_RW_CENTRAL_IDEAS: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Whole-Passage Main Idea",
      explanation:
        "These questions ask what the whole passage is really about. The trap: the main idea is almost never stated in the first sentence — you have to piece it together from the whole passage. After reading, ask yourself: 'If I could keep only one sentence, which one explains why all the others exist?' The right answer covers the whole passage rather than one part of it, and it shouldn't be so broad that it could describe a totally different passage. Wrong answers are usually too narrow (about just one detail) or too broad (vague and generic).",
      examples: [
        {
          q: "For years, a team of marine biologists monitoring a network of Pacific coral reefs treated rising ocean temperatures as the primary threat to reef survival. But after fifteen years of data, the team's focus shifted: reefs with high genetic diversity consistently survived heat waves that wiped out genetically uniform reefs nearby. The team now argues that conservation policy should prioritize preserving genetic diversity, not just controlling temperature. Which choice best states the main idea of the text?",
          choices: [
            "Rising ocean temperatures are the single greatest threat facing coral reefs today.",
            "Genetic diversity, not temperature control alone, is the key factor in coral reefs' ability to survive heat waves.",
            "Coral reefs face a wide variety of threats that scientists are still working to fully understand.",
            "The research team spent fifteen years studying a single network of Pacific coral reefs.",
          ],
          answer: 1,
          explain:
            "The passage's whole arc is a revision: from believing temperature was the main threat, to finding genetic diversity determines survival, ending in a policy recommendation built on that finding. Restating the original, now-revised belief about temperature misses that the passage moves past it. A claim generic enough to describe almost any conservation passage never engages the study's specific finding, and a true but trivial detail (how long they studied) isn't the passage's point. Only 'genetic diversity, not temperature control alone, is the key factor' captures both the finding and the stakes the final sentence signals.",
          difficulty: "easy",
          why: ["That's the belief the team held at the start. The passage is about how fifteen years of data moved them past it.", null, "This is so general it could describe almost any reef article. It never mentions the study's actual finding about genetic diversity.", "True, but it's just a detail about the study's length. The main idea is what the study found, not how long it took."],
        },
        {
          q: "A city's plan to convert vacant lots into community gardens was framed publicly as a way to beautify neglected blocks. Two years in, program coordinators tracked participating families' grocery receipts and found a measurable drop in produce spending alongside greater variety in what families ate. Several local schools have since asked to build their own teaching gardens, citing these results. Which choice best states the main idea of the text?",
          choices: [
            "A city built community gardens on lots that had previously been vacant.",
            "Schools have become increasingly interested in building their own gardens.",
            "A program framed as a beautification effort ended up producing real, practical benefits for participating families.",
            "Grocery spending on produce decreased for most families in the city.",
          ],
          answer: 2,
          explain:
            "Nothing states a conclusion outright, so build it from what changes across the passage: presented as beautification, but paragraph two reveals a measurable food-access benefit, and paragraph three shows other institutions responding to that practical benefit, not the visual one. Simply restating that a city built the gardens covers only the setup, and noting growing school interest is a downstream detail. Claiming spending fell for most families citywide overstates scope (only participating families, not most families citywide), and is a supporting fact rather than the throughline. Only 'a program framed as a beautification effort ended up producing real, practical benefits for participating families' captures the shift from framing to actual impact.",
          difficulty: "medium",
          why: ["That's only the setup in the first sentence. The passage goes on to show the program did more than fill empty lots.", "The schools' interest is a later ripple effect, one detail near the end, not the point the whole passage builds.", null, "Too broad: the text is about participating families, not most families in the city. It's also only one supporting fact."],
        },
        {
          q: "A jazz musician's rigorous classical training shaped her earliest performances, but when she began releasing improvisational recordings, critics dismissed them as undisciplined departures from that training. Decades later, music historians revisited her catalog and concluded that her improvisation was in fact deliberately built on the very classical structures those critics assumed she had abandoned. Which choice best states the main idea of the text?",
          choices: [
            "Critics are often unfair to musicians who experiment with new styles.",
            "Her improvisational work was originally dismissed as a break from her training but was later recognized as a sophisticated extension of it.",
            "Her classical training was more rigorous than that of most of her contemporaries.",
            "Music historians eventually praised her improvisational recordings as her best work.",
          ],
          answer: 1,
          explain:
            "Track the shift: technical training, then dismissed as a break from it, then later understood as an extension of it. The claim that critics are often unfair is tempting because it's true, but it's generic enough to fit thousands of passages and ignores the specific misunderstanding this one describes. Comparing her training's rigor to her contemporaries' invents a comparison the text never makes, and calling the recordings her 'best work' adds a claim the passage doesn't support — historians recognized structural continuity, not superiority. Only 'her improvisational work was originally dismissed as a break from her training but was later recognized as an extension of it' has both required pieces: what was misunderstood, and that it was later corrected.",
          difficulty: "hard",
          why: ["It sounds reasonable, but it's a general claim about critics everywhere. The text is about one specific misunderstanding of one musician.", null, "The text never compares her training to anyone else's, so \"more rigorous than her contemporaries\" is invented.", "Historians found her work built on classical structures; they never called it her best work. That's a stronger claim than the text makes."],
        },
        {
          q: "A small town's decision to convert an unused rail line into a walking trail drew mixed reactions at first. The project ultimately came in well under its projected budget, and businesses located along the trail have reported a rise in customers since it opened. Which choice best states the main idea of the text?",
          choices: [
            "The rail-to-trail conversion succeeded both financially and economically, coming in under budget while boosting nearby business.",
            "Local businesses were skeptical of the rail-to-trail project before it was completed.",
            "Converting unused rail lines into trails is an increasingly popular approach for small towns.",
            "The project was completed for less money than town planners had anticipated.",
          ],
          answer: 0,
          explain:
            "The passage tracks two outcomes for one project, a financial one (under budget) and an economic one (more customers), and the main idea has to capture both, not just one. Reporting only that the project cost less than expected covers just the budget half, and noting businesses were initially skeptical reports a detail from the opening, not the passage's point. A broader claim about rail-to-trail conversions generally generalizes beyond what this passage actually supports. Only 'the rail-to-trail conversion succeeded both financially and economically' combines both outcomes into the passage's real claim.",
          difficulty: "easy",
          why: [null, "The text says reactions were \"mixed\" at first, not that businesses were skeptical. And an opening detail isn't the main idea anyway.", "The text is about one town's project. A claim about a trend across many towns goes beyond anything it says.", "This covers only the budget half. The passage also stresses the boost to nearby businesses, and the main idea needs both."],
        },
        {
          q: "A historic theater's decline and eventual closure seemed to mark the end of an era for its neighborhood. When a preservation group took on its restoration, they made a deliberate choice: rather than recreating the theater's original 1920s appearance, they preserved only its facade while modernizing its accessibility and acoustics. Since reopening, the theater's attendance has exceeded even its historic peak. Which choice best states the main idea of the text?",
          choices: [
            "The facade was the only part of the theater that preservationists were able to save.",
            "The theater has become more popular now than it was during its original era.",
            "Choosing to modernize the theater rather than restore it exactly to its original form is what enabled its record-breaking reopening.",
            "Historic theaters generally benefit from prioritizing accessibility over historical accuracy.",
          ],
          answer: 2,
          explain:
            "The passage moves from decline, to a deliberate adaptation-over-restoration decision, to a record-attendance outcome, and ties the outcome to the decision. Simply noting the theater is more popular now states the outcome but not the reasoning that makes it the passage's actual point, and framing facade preservation as all that could be saved misreads it as a limitation rather than a deliberate choice. A broader claim that historic theaters generally benefit from prioritizing accessibility stretches one theater's result into a claim the passage never argues. Only 'choosing to modernize the theater rather than restore it exactly to its original form is what enabled its success' links the specific decision to the specific result.",
          difficulty: "medium",
          why: ["The facade was a deliberate choice, not the only thing they could save. This turns a decision into a limitation.", "That's the outcome, but it leaves out why: the decision to modernize, which is what the passage connects to the success.", null, "One theater's result doesn't support a rule about historic theaters in general. The text never makes that broader claim."],
        },
      ],
      traps: [
        "Choosing an answer that restates the passage's opening topic (temperature) rather than its actual conclusion.",
        "Choosing an answer that is true of the passage but also true of thousands of other passages (too generic to be 'the' main idea).",
        "Choosing an answer that includes a detail from only one paragraph, mistaking a supporting point for the overall thesis.",
      ],
    },
    {
      name: "Detail Comprehension in Informational Texts",
      explanation:
        "These questions ask what the text directly states, or reports, about one specific fact, number, finding, or reason: not the whole passage's point, just one piece of it accurately restated. The stems vary: 'According to the text, what is true about X?' 'Why does X believe Y?' 'What did the study find?' 'Which question does the text most directly attempt to answer?' The method is the same regardless of phrasing: locate the exact sentence(s) answering the question, then pick the choice matching what's actually said, with no outside knowledge, no reversed direction, and no overstating a modest finding into a stronger one.",
      examples: [
        {
          q: "A marine biologist tagged 40 sea turtles as part of a two-year nesting study. Of those 40, 34 returned to the same nesting beach the following year. According to the text, what did the biologist find?",
          choices: [
            "34 of the 40 tagged turtles returned to the same nesting beach the following year.",
            "All 40 tagged turtles returned to the same nesting beach the following year.",
            "The biologist tagged sea turtles over a two-year period.",
            "6 of the 40 tagged turtles returned to the same nesting beach the following year.",
          ],
          answer: 0,
          explain:
            "Locate the exact sentence answering 'what did she find' — the return count, 34 of 40. Describing the tagging itself reports what she did, not what she found. Reporting that 6 turtles returned gives the number that did NOT return (40 minus 34), a classic swapped-number trap, and claiming all 40 returned overstates the finding to 'all,' which the passage doesn't say. Only '34 of the 40 tagged turtles returned to the same nesting beach the following year' restates the finding exactly, without adding or reversing anything.",
          difficulty: "easy",
          why: [null, "The text says 34 of 40 returned, not all 40. \"All\" overstates the finding.", "That describes what the biologist did, not what she found, and the question asks for the finding.", "6 is the number that did not return (40 minus 34). This swaps the two groups."],
        },
        {
          q: "A city's recycling program initially accepted only paper and glass. After a 2019 policy change, the program began accepting most plastics as well. According to the text, what changed about the program in 2019?",
          choices: [
            "The program stopped accepting paper and glass.",
            "The program began accepting most plastics in addition to paper and glass.",
            "The program was replaced entirely by a new recycling initiative.",
            "The program began accepting paper and glass for the first time.",
          ],
          answer: 1,
          explain:
            "Locate the sentence describing the 2019 change specifically: plastics were added. Claiming paper and glass were dropped reverses the facts — they remained accepted, nothing was removed. Saying paper and glass were newly accepted in 2019 misattributes the original materials to that change, and claiming the program was replaced entirely invents an event the passage never mentions. Only 'the program began accepting most plastics in addition to paper and glass' matches exactly what changed and when.",
          difficulty: "easy",
          why: ["Nothing was removed. Paper and glass were still accepted; plastics were added.", null, "The program wasn't replaced. The text describes one policy change to the same program.", "Paper and glass were accepted from the start, not added in 2019."],
        },
        {
          q: "A single colony of aspen trees, all connected by one shared root system, is believed to be among the largest living organisms by mass in the region where it grows. Researchers monitoring the colony have found that its growth has been slowing in recent years, in part because deer graze on young saplings before the saplings can mature. The researchers believe that fencing off the colony's edges could allow it to resume its earlier growth rate. According to the text, why are the researchers concerned about the aspen colony?",
          choices: [
            "Its growth rate has been slowing, in part because deer graze on its young saplings.",
            "It is being replaced by a faster-growing, invasive species of tree.",
            "It cannot survive losing any portion of its shared root system.",
            "It has stopped producing new saplings entirely.",
          ],
          answer: 0,
          explain:
            "The text gives one specific, stated reason for concern: slowing growth, tied to deer grazing on saplings. Claiming it has stopped producing saplings entirely overstates 'slowing' into 'stopped entirely' — a common trap where a moderate finding gets pushed into an absolute one. Claims about an invasive species replacing it, or the root system being unable to survive any loss, both invent causes and vulnerabilities the text never mentions. Only 'its growth rate has been slowing, in part because deer graze on its young saplings' restates the actual reason given, at the actual degree the text supports.",
          difficulty: "medium",
          why: [null, "No invasive species appears in the text. The stated cause is deer eating young saplings.", "The text never says losing part of the root system would kill the colony. This invents a vulnerability.", "The text says growth is slowing, not that new saplings have stopped entirely. \"Entirely\" overstates it."],
        },
        {
          q: "Before a particular drug's approval process was reformed, clinical trials for that category of drug required a median of 8.5 years to complete. Following a set of regulatory changes enacted in 2015, that median fell to 6.2 years. According to the text, what was true of clinical trial length before the 2015 reforms?",
          choices: [
            "The median trial length was 6.2 years.",
            "The median trial length was 8.5 years.",
            "Trial length increased after the reforms took effect.",
            "Trial length remained unchanged by the reforms.",
          ],
          answer: 1,
          explain:
            "The question asks specifically for the before value. Reporting 6.2 years reports the after value — swapping the two time periods is the main trap built into this question. Claiming trial length increased reverses the direction entirely (the median fell, not rose), and claiming it remained unchanged contradicts the passage. Only 'the median trial length was 8.5 years' reports the correct number for the correct time period.",
          difficulty: "medium",
          why: ["6.2 years is the median after the 2015 reforms. The question asks about before.", null, "Trial length fell, from 8.5 to 6.2 years. This reverses the direction.", "The median changed from 8.5 to 6.2 years, so it didn't stay the same."],
        },
        {
          q: "In the coastal town of Marrow's Bend, residents greet one another not with 'hello' but with a question about the tide — 'high or low?' — even indoors, far from any dock. Researchers studying the phrase have traced its origin to a period when the town's economy depended entirely on tide-timed harvests, when knowing the tide was, quite literally, the most urgent thing two people could tell each other. Though the town's economy has since diversified well beyond fishing, the greeting has persisted for generations. Which question does the text most directly attempt to answer?",
          choices: [
            "How many other coastal towns share this same greeting?",
            "Why has this unusual greeting persisted in Marrow's Bend?",
            "When did the town's economy begin to diversify beyond fishing?",
            "Is the greeting easily understood by visitors to the town?",
          ],
          answer: 1,
          explain:
            "The text explains where the greeting came from and notes that it has outlasted the economic conditions that originally made it useful — together, that's an explanation for why it persisted. Questions about how many other towns share the greeting, when the economy diversified, or whether visitors understand it are all questions a reader might reasonably have, but none of them is addressed anywhere in the text: no count of other towns, no date for the economic shift, no mention of visitors' comprehension. Only 'why has this unusual greeting persisted in Marrow's Bend?' is a question the passage actually answers.",
          difficulty: "hard",
          why: ["The text never mentions any other towns, so it can't be answering this.", null, "The text says the economy diversified but never says when, so this question goes unanswered.", "Visitors aren't mentioned anywhere, so the text doesn't address this."],
        },
      ],
      traps: [
        "Choosing an answer accurate for a different part of the passage (a different number, entity, or time period) than the one actually asked about — always re-locate the exact sentence rather than relying on memory.",
        "Choosing an answer that reverses a stated direction or relationship (before/after, increase/decrease, more/less) from the text.",
        "Overstating what the text actually says — 'growth has slowed' becomes 'growth has stopped,' or 'some' becomes 'most' or 'all.'",
      ],
    },
    {
      name: "Reading Literary Narratives and Poetry",
      explanation:
        "A meaningful share of Central Ideas and Details questions come from novels, short stories, memoirs, and poems, often using older or more formal diction than the informational passages. The skill tested is identical to the informational version: what does the text state or clearly support about a character, narrator, or speaker's actions, feelings, or situation? The real challenge is usually the language itself, not the reasoning — read for what's literally depicted (an action, a stated feeling, a description) rather than projecting an assumption onto the character based on genre instincts. Nervousness doesn't always mean unhappiness; silence doesn't always mean disapproval; and old-fashioned phrasing often has a fairly plain, literal meaning once it's unpacked.",
      examples: [
        {
          q: "The following text is from a novel. The narrator is about to compete in a debate tournament for the first time. 'I stood backstage running through my opening line one more time, though I'd already said it so many times in my head that the words had started to lose their shape. My coach caught my eye from the wings and mouthed, just breathe. I nodded, but my hands wouldn't stop finding new ways to fold themselves.' According to the text, what does the narrator do while waiting backstage?",
          choices: [
            "She revises her opening argument at the last minute.",
            "She repeatedly rehearses her opening line and shows visible signs of nervousness.",
            "She decides to withdraw from the competition.",
            "She asks her coach for a different strategy.",
          ],
          answer: 1,
          explain:
            "The text states she has already run through her opening line so many times the words 'started to lose their shape,' and that her hands keep restlessly refolding themselves — repetition plus a physical sign of nerves. Claiming she revises her argument misreads 'said it so many times' as revising it; she's repeating the same line, not changing it. Withdrawing from the competition or asking her coach for a new strategy both describe actions the text never depicts. Only 'she repeatedly rehearses her opening line and shows visible signs of nervousness' matches both details the text actually gives.",
          difficulty: "easy",
          why: ["She repeats the same opening line; she doesn't change it. \"Revises\" misreads the rehearsing.", null, "Nothing suggests she's quitting. She's backstage getting ready to go on.", "Her coach mouths \"just breathe,\" and she only nods. She never asks for a new strategy."],
        },
        {
          q: "The following text is from a short story. Wen has just noticed that his grandfather quietly paid for a stranger's groceries. 'My grandfather never mentioned it to anyone, not even to my grandmother that evening at dinner. When I brought it up later, all he said was, \"That's between me and the young man,\" and reached for the newspaper, as though the conversation were already over.' According to the text, what is true about the grandfather?",
          choices: [
            "He wants recognition for his generosity.",
            "He regularly gives money to strangers.",
            "He prefers to keep his acts of kindness private.",
            "He disapproves of his grandson's curiosity.",
          ],
          answer: 2,
          explain:
            "He tells no one, including his own wife, and shuts down the topic with a brief, deflecting answer before changing the subject — all signs of someone who doesn't want the act discussed. Claiming he wants recognition is directly contradicted: avoiding mention of it is the opposite of wanting recognition. Claiming he regularly gives to strangers describes a pattern the text never establishes; this is one instance. Reading his short, matter-of-fact reply as disapproval isn't supported by the text either. Only 'he prefers to keep his acts of kindness private' matches his actual behavior.",
          difficulty: "easy",
          why: ["He tells no one, not even his wife, and cuts the subject short. That's the opposite of wanting recognition.", "The text shows a single act of generosity, not a habit. \"Regularly\" isn't supported.", null, "His short reply ends the conversation, but nothing shows he disapproves of his grandson. He's deflecting, not scolding."],
        },
        {
          q: "The following text is adapted from a poem. 'The roots have long since found the pot's edge, / and pressed there, coiled, without complaint, / though somewhere past the clay a field lies open, / loam enough for any tree to spread. / We prune what shows above the rim / and call the smallness chosen, call it shape, / and never ask what happens underneath, / where growth continues, quiet, unconsoled.' Based on the text, what does the poem suggest about growth that is constrained?",
          choices: [
            "It stops entirely once a limit is reached.",
            "It continues even when it isn't visible or acknowledged.",
            "It can be redirected but is never fully stopped by any container.",
            "It causes visible damage to whatever contains it.",
          ],
          answer: 1,
          explain:
            "The final lines state directly that beneath what's visibly pruned, 'growth continues, quiet, unconsoled' — unseen, but not absent. Claiming it stops entirely once a limit is reached directly contradicts 'continues.' Claiming it always escapes its container overreaches: the poem never claims that, only that it persists internally. Claiming it causes visible damage isn't supported; no damage to the pot is described anywhere. Only 'it continues even when it isn't visible or acknowledged' matches what the poem actually states about the unseen growth.",
          difficulty: "medium",
          why: ["The last line says growth \"continues.\" Saying it stops contradicts the poem directly.", null, "The poem never says growth escapes or is redirected past every container, only that it keeps going unseen.", "No damage to the pot is described. The roots press against the edge \"without complaint.\""],
        },
        {
          q: "The following text is from a novel set in the early nineteenth century. Miss Enderby has just been introduced to her cousin's new husband. 'Miss Enderby said little at the dinner table, a circumstance her aunt later remarked upon with some disappointment, supposing her niece wanting in either wit or interest. But Miss Enderby's silence proceeded from neither cause; she had, within the first quarter hour, discerned in Mr. Halloway's easy manner a carelessness with truth that his bride had not yet detected, and she judged it wiser, for the present, to observe than to speak.' According to the text, what is true about Miss Enderby?",
          choices: [
            "She is too shy to converse comfortably with new acquaintances.",
            "She disapproves of her cousin's choice of husband for financial reasons.",
            "She has already formed a shrewd, private judgment that she chooses not to voice yet.",
            "She lacks the wit her aunt expects of her.",
          ],
          answer: 2,
          explain:
            "The text explicitly rules out both shyness and dullness as explanations — her silence 'proceeded from neither cause.' It states instead that she has quietly detected something dishonest in Halloway and has deliberately chosen to watch rather than speak 'for the present.' Claiming she disapproves for financial reasons invents a reason the text never mentions; her judgment concerns his truthfulness, not his wealth. Only 'she has already formed a shrewd, private judgment that she chooses not to voice yet' matches what the text directly states about her silence.",
          difficulty: "medium",
          why: ["The text says her silence came from \"neither\" shyness nor lack of wit. It rules this out explicitly.", "Her judgment is about his \"carelessness with truth,\" not money. Financial reasons are never mentioned.", null, "This is the aunt's mistaken guess, and the text immediately says it's wrong."],
        },
        {
          q: "The following text is from a novel. The narrator has just returned home after a long absence to find her childhood bedroom unchanged. 'Someone had kept the room exactly as I'd left it — the concert posters still crooked on the wall, the desk still angled toward the window instead of the door the way I'd always preferred it. I stood in the doorway for a long moment before I made myself walk in and start packing the boxes I'd come for.' What does the text most strongly suggest about the narrator's reaction to her preserved room?",
          choices: [
            "She is grateful that her family thought to preserve it.",
            "She is more affected by the room than she is ready to act on immediately.",
            "She is annoyed that nothing in the room has been changed.",
            "She has no emotional response to seeing the room again.",
          ],
          answer: 1,
          explain:
            "She hesitates in the doorway for 'a long moment' and has to make herself walk in; both signal a reaction strong enough to slow her down, without the text stating exactly what that reaction is. Claiming she feels gratitude invents a feeling never mentioned, and claiming she's annoyed isn't supported; nothing in the text reads as complaint. Claiming she has no emotional response is directly undercut by the pause and the effort it takes her to enter: that's the opposite of no response. Only 'she is more affected by the room than she is ready to act on immediately' matches the hesitation the text actually depicts, without overstating what emotion is behind it.",
          difficulty: "hard",
          why: ["Gratitude is never mentioned. The text shows hesitation, not thankfulness.", null, "Nothing in the text reads as a complaint about the room being unchanged.", "She stands in the doorway \"for a long moment\" and has to make herself walk in. That's clearly a reaction."],
        },
      ],
      traps: [
        "Assuming a character's emotional state from genre instinct (a quiet character must be shy, a sudden reaction must be negative) instead of from what the text actually depicts.",
        "Getting distracted by unfamiliar or old-fashioned vocabulary and picking the choice that merely 'sounds' literary rather than the one the text supports.",
        "Importing a plausible backstory or motive the text never actually states, especially in longer character-study excerpts.",
      ],
    },
    {
      name: "Reasonable Conclusions Supported by the Text",
      explanation:
        "These questions ask what can reasonably be concluded from the text, even though the conclusion itself is never stated outright — 'based on the text, what can be concluded,' 'what does the text most strongly suggest,' or 'what would most likely have been true if X hadn't happened.' This differs from pure detail retrieval: instead of restating one stated fact, you connect two or more stated facts (or a stated fact and its logical consequence) into a conclusion the text supports without spelling out. The right answer follows necessarily, or very nearly necessarily, from what's given; a choice that merely sounds plausible isn't enough. Wrong answers typically add outside information, overstate the conclusion's certainty, or invert which fact caused which effect.",
      examples: [
        {
          q: "A city government surveyed residents about a new bike-share program. Of respondents who had used the program at least once, 91% said they would use it again. However, only 12% of all surveyed residents reported having used the program at all. Based on the text, what can reasonably be concluded about the bike-share program?",
          choices: [
            "Most residents dislike the bike-share program.",
            "The program has been well-received by those who have tried it, but most residents haven't tried it yet.",
            "The program will likely be canceled due to low approval.",
            "Residents who used the program found it too expensive.",
          ],
          answer: 1,
          explain:
            "The 91% figure shows strong approval among people who actually tried the program, while the 12% figure shows that few residents have tried it at all — two separate facts that combine into a specific, supported conclusion. Claiming most residents dislike the program conflates low usage with dislike, but the text gives no information about what non-users think. Predicting cancellation invents a future outcome never suggested by the text, and claiming users found it too expensive invents a reason that's never mentioned. Only 'the program has been well-received by those who have tried it, but most residents haven't tried it yet' follows from both given figures without adding anything.",
          difficulty: "easy",
          why: ["Low usage isn't the same as dislike. The text says nothing about how non-users feel.", null, "Nothing in the text predicts cancellation, and approval among users is actually 91%.", "Cost is never mentioned. This invents a complaint the text doesn't contain."],
        },
        {
          q: "A local bakery began offering a discount to customers who brought their own container instead of using a disposable bag. Six months later, the bakery reported using 40% fewer disposable bags than before the discount began, though its total number of daily customers stayed about the same. Based on the text, what can most reasonably be concluded?",
          choices: [
            "The discount caused a significant increase in the bakery's daily customers.",
            "A meaningful portion of the bakery's customers began bringing their own containers because of the discount.",
            "The bakery lost money by offering the discount.",
            "Disposable bags are more expensive than the discount amount.",
          ],
          answer: 1,
          explain:
            "Fewer bags used, combined with a steady customer count, points to existing customers switching their own behavior — not to more people showing up. Claiming customers increased is directly contradicted: customer count 'stayed about the same,' not increased. Claims about the bakery losing money or bags costing more than the discount both introduce financial claims the text never addresses at all. Only 'a meaningful portion of the bakery's customers began bringing their own containers because of the discount' follows from the two stated facts.",
          difficulty: "easy",
          why: ["The text says the number of customers \"stayed about the same,\" so it didn't increase.", null, "The text gives no information about the bakery's profits or losses.", "Neither the price of bags nor the size of the discount is given, so this comparison can't be made."],
        },
        {
          q: "A small furniture maker built each chair entirely by hand for the shop's first decade, a process that limited output to about three chairs a week regardless of how many orders came in. After investing in a table saw and a power sander, the shop's weekly output rose to roughly nine chairs, though each piece still required hours of hand-finishing to match the shop's original standard. Based on the text, what would have most likely been true if the shop had never adopted the new tools?",
          choices: [
            "The shop would have been unable to keep its chairs at the same quality standard.",
            "The shop would have continued producing far fewer chairs per week than it does now.",
            "The shop would have stopped hand-finishing its chairs entirely.",
            "The shop would have raised its prices to compensate for slower production.",
          ],
          answer: 1,
          explain:
            "The tools are what raised weekly output from about three chairs to about nine; without them, that constraint on output would remain. Claiming quality would have suffered is wrong because hand-finishing (the step that actually preserves quality) continued even after the tools were introduced, so quality isn't what the tools changed. Claiming hand-finishing would have stopped inverts the text: hand-finishing is exactly what stayed the same, tools or not. Claiming prices would have risen invents a pricing response never discussed. Only 'the shop would have continued producing far fewer chairs per week than it does now' follows directly from the stated cause of the output increase.",
          difficulty: "medium",
          why: ["Quality came from hand-finishing, which continued with or without the tools. The tools changed speed, not quality.", null, "Hand-finishing is what stayed the same. Without the tools it would have continued, not stopped.", "Prices are never discussed. This invents a response the text gives no basis for."],
        },
        {
          q: "For decades, engineers assumed that a bridge's support cables needed replacing every 25 years regardless of visible wear, since testing each individual cable's true condition was prohibitively expensive. A new sensor technology now allows continuous, low-cost monitoring of cable stress in real time. In bridges where the sensors have been installed, several cables originally scheduled for replacement have instead remained safely in service for over 30 years. What does the text most strongly suggest about the original 25-year replacement schedule?",
          choices: [
            "It was based on a fixed timeline rather than each cable's actual condition.",
            "It was created specifically to reduce the overall cost of bridge maintenance.",
            "It has now been proven unsafe for most bridges that still use it.",
            "It is no longer followed in any bridge, sensored or not.",
          ],
          answer: 0,
          explain:
            "The schedule applied 'regardless of visible wear' because testing individual condition was too costly (meaning it tracked age, not actual condition), and the sensor data confirms this by showing some cables safely outlasting the schedule by years. Claiming it was created to cut maintenance costs misreads the reasoning: the fixed schedule was a workaround for the cost of testing, not a cost-reduction goal in itself. Claiming it's been proven unsafe overstates the finding into a safety verdict the text never makes; some cables lasting longer doesn't mean the schedule was unsafe. Claiming it's no longer followed anywhere goes beyond what the text describes about un-sensored bridges. Only 'it was based on a fixed timeline rather than each cable's actual condition' follows directly from what the text establishes about the schedule's basis.",
          difficulty: "medium",
          why: [null, "The fixed schedule existed because testing each cable was too expensive, not as a goal to cut costs.", "Some cables lasting longer means the schedule replaced them early, not that it was unsafe.", "The text only describes bridges with sensors. It says nothing about bridges without them."],
        },
        {
          q: "A team studying a species of freshwater fish transplanted a population from a slow-moving river to a faster-flowing one, to see whether the fish's growth rate was influenced by water speed. The transplanted fish grew significantly faster in their new environment. Crucially, genetic testing showed that the transplanted fish and the original population remained genetically identical throughout the study. It can most reasonably be inferred from the text that the genetic testing was important for which reason?",
          choices: [
            "It confirmed that the fish had adapted permanently to the faster-flowing water.",
            "It ruled out genetic differences as an explanation for the change in growth rate, strengthening the conclusion that water speed caused it.",
            "It showed that the fish species is more genetically diverse than researchers had expected.",
            "It demonstrated that faster-flowing rivers contain more genetically varied fish populations.",
          ],
          answer: 1,
          explain:
            "Without the genetic test, the faster growth could be explained by a pre-existing genetic difference between the two groups rather than by the environment itself; confirming genetic identity closes off that alternative explanation and strengthens the water-speed conclusion specifically. Claiming it confirmed permanent adaptation overstates the finding, which the identical genetics actually argue against — no genetic change occurred at all. Claims about the species being more genetically diverse, or faster rivers containing more varied populations, both invent claims the text never addresses; the test showed sameness between two groups, not diversity within the species. Only 'it ruled out genetic differences as an explanation for the change in growth rate' describes the test's actual logical role.",
          difficulty: "hard",
          why: ["Identical genetics means no genetic change happened, so the test argues against permanent adaptation.", null, "The test compared two groups and found them the same. It says nothing about diversity within the species.", "The text never compares genetic variety between rivers. This invents a finding."],
        },
      ],
      traps: [
        "Picking an answer that sounds reasonable in general but isn't actually supported by the specific facts given in the text.",
        "Confusing a stated fact with the unstated conclusion the question is actually asking for.",
        "Overstating a modest, well-supported conclusion into a much stronger, unsupported claim ('may be true in some cases' becomes 'is always true').",
      ],
    },
  ],
  tipsAndTricks: [
    "Before reading answer choices, try to state the main idea in your own words in under 10 words. If none of the choices match your version, re-read the passage's last two sentences — conclusions often carry the thesis.",
    "For detail and literary-comprehension questions, always re-locate the exact sentence in the passage rather than relying on memory — wrong answers are specifically designed to sound like things the passage 'probably' said.",
    "For 'what can be concluded' questions, treat the answer like a math proof: it should follow necessarily from what's stated, not just seem plausible — if you can imagine a way the text could still be true and the answer choice false, it's not the right answer.",
  ],
};

const LC_RW_EVIDENCE: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Direct Quantitative Support",
      explanation:
        "This is the most common Command of Evidence pattern: you're given a claim and asked which choice provides the strongest factual support. The winning answer is almost always the one with the most specific, directly relevant number or fact; a choice that's merely 'related' to the topic isn't enough. Fast filter: cross out any choice that's a general statement about the topic (those are bait). Keep only choices with a specific measurement, comparison, or named data point.",
      examples: [
        {
          q: "A researcher claims that urban tree cover reduces summer energy costs. Which choice best supports this claim?",
          choices: [
            "Trees are commonly planted in residential neighborhoods across the city.",
            "Neighborhoods with over 30% tree canopy showed 20% lower average summer electricity bills than neighborhoods with minimal tree cover.",
            "The city planted over 5,000 new trees last year as part of a beautification initiative.",
            "Most residents report that they enjoy having trees on their street.",
          ],
          answer: 1,
          explain:
            "The winning answer has a specific number directly tied to the claimed relationship — tree canopy percentage linked to an electricity-bill outcome. The neighborhood-planting choice is true but generic, saying nothing about energy costs. The tree-planting figure is specific and real, but it measures planting activity, not costs. The resident-opinion choice is a feeling, not a measurement. Only the canopy-to-bill comparison directly measures the claimed relationship.",
          difficulty: "easy",
          why: ["True but generic. It says trees are common; it says nothing about energy costs.", null, "A real, specific number, but it measures how many trees were planted, not whether energy costs went down.", "That's how residents feel about trees, not a measurement of energy costs."],
        },
        {
          q: "A city planner claims that a new bike lane network reduced downtown traffic congestion. Which choice best supports this claim?",
          choices: [
            "The city spent $12 million building the bike lane network.",
            "Average downtown commute times fell 15% in the two years after the bike lanes were completed.",
            "The bike lane network spans over 40 miles of downtown streets.",
            "Cyclists reported feeling safer riding downtown after the lanes were installed.",
          ],
          answer: 1,
          explain:
            "What would actually prove this claim is a number about congestion (like commute times) tied to the bike lanes. The cost figure is a real, specific number, but it measures spending, not congestion, so it never touches the actual claim. The mileage figure measures the network's size, not its effect. The safety-feeling choice reports a feeling, not a traffic measurement. Only the commute-time statistic directly measures the claimed outcome.",
          difficulty: "medium",
          why: ["The $12 million measures spending, not congestion. It never touches what the claim is about.", null, "The 40 miles measures how big the network is, not whether traffic got better.", "That's about cyclists' sense of safety, not about congestion for everyone downtown."],
        },
        {
          q: "An official claims that a public awareness campaign decreased littering in city parks. Which choice best supports this claim?",
          choices: [
            "Park attendance increased by 30% during the campaign's first year.",
            "Weekly litter counts in the campaigned parks fell from an average of 40 items to 11 items over the same year.",
            "The campaign included posters, social media ads, and volunteer cleanup events.",
            "A survey found that 68% of park visitors had seen the campaign's posters.",
          ],
          answer: 1,
          explain:
            "The claim is specifically about litter decreasing, not about parks in general. The attendance figure is tempting (it's specific, about the same parks and campaign, and 'increased' sounds like good news), but it says nothing about litter, and more visitors could just as easily mean more litter. The poster-awareness figure measures whether people saw the campaign, not whether behavior changed. The activities list describes the campaign's methods, not its effect. Only the litter-count figure measures the right variable in the right direction.",
          difficulty: "hard",
          why: ["Attendance isn't litter. More visitors could just as easily mean more litter, so this doesn't show a decrease.", null, "This lists what the campaign did, not what effect it had on litter.", "Seeing the posters isn't the same as littering less. This measures awareness, not behavior."],
        },
        {
          q: "A facilities manager claims that a new office lighting system reduced employee eye strain complaints. Which choice best supports this claim?",
          choices: [
            "The lighting system uses LED bulbs, which are common in modern offices.",
            "Eye strain complaints dropped from 22 per month to 6 per month after installation.",
            "The new lighting system cost 15% less to install than the previous system.",
            "Employees were surveyed about their preferred lighting color temperature.",
          ],
          answer: 1,
          explain:
            "What would prove this claim is a number tied specifically to eye strain complaints. The LED-bulb fact is true and topic-related, but generic — it says nothing about complaints going down. The cost figure and the color-temperature survey each measure something other than the claimed outcome. Only the complaint-count comparison directly measures the claimed outcome.",
          difficulty: "easy",
          why: ["LED bulbs being common says nothing about whether eye strain complaints went down.", null, "Installation cost is a different outcome from eye strain complaints.", "A survey about preferred color temperature doesn't measure eye strain complaints at all."],
        },
        {
          q: "A city official claims that a new streetlight upgrade reduced nighttime traffic accidents. Which choice best supports this claim?",
          choices: [
            "The city installed 1,200 new LED streetlights across 40 miles of road.",
            "Nighttime accidents in the upgraded areas fell from an average of 14 per month to 9 per month in the year after installation.",
            "The new streetlights use 60% less energy than the previous fixtures.",
            "Residents reported that the upgraded streets felt brighter and safer at night.",
          ],
          answer: 1,
          explain:
            "What would actually prove this claim is a number about accidents, not about the lights themselves. The installation-scale figure sounds impressive and is specific and real, but it measures the scope of installation, not accidents. The energy-use figure and the resident perception each measure something the claim never mentions. Only the accident-count comparison directly measures the claimed outcome.",
          difficulty: "medium",
          why: ["The number of lights measures the size of the upgrade, not whether accidents fell.", null, "Energy use isn't part of the claim. The claim is about accidents.", "Feeling safer isn't the same as having fewer accidents. This is perception, not an accident count."],
        },
        {
          q: "A health department claims that a public health campaign increased vaccination rates among teenagers. Which choice best supports this claim?",
          choices: [
            "In the year before the campaign launched, vaccination rates among teenagers had already been declining for three consecutive years.",
            "Teen vaccination rates rose from 61% to 78% in the twelve months following the campaign's launch.",
            "The campaign's advertisements appeared on television, radio, and social media.",
            "A national survey found that teenagers generally trust information from health departments.",
          ],
          answer: 1,
          explain:
            "The claim is about an increase caused by the campaign specifically after it launched. The pre-campaign decline is tempting (it's specific and about the exact topic), but it describes the opposite direction, before the campaign even started, so it can't support a claim about the campaign's effect. The advertising-channels and general-trust choices don't measure vaccination rates at all. Only the post-campaign rate increase measures the right variable, in the right direction, during the right time period.",
          difficulty: "hard",
          why: ["This describes the years before the campaign, and in the wrong direction (declining). It can't show the campaign raised rates.", null, "Where the ads ran says nothing about whether vaccination rates actually went up.", "General trust in health departments isn't a vaccination rate, and it's national, not about this campaign."],
        },
      ],
      traps: [
        "Choosing a fact that's true and topic-related but doesn't measure the specific claim being made.",
        "Choosing an answer with impressive-sounding numbers that don't actually connect to the claim's specific variables.",
        "Ignoring direction: a stat showing something increased when the claim is about a decrease (or vice versa) is a trap, even if everything else about it looks relevant.",
      ],
    },
    {
      name: "Ruling Out Alternative Explanations",
      explanation:
        "This is a harder Command of Evidence pattern, used for causal claims. Here, the best evidence is a comparison that rules out some other explanation, rather than a plain supporting number. Look for a control group, a similar-but-different comparison case, or a 'before vs. after' setup with a comparison group. You'll know this pattern applies when the claim uses causal language like 'caused' or 'led to,' as opposed to merely descriptive language like 'is associated with.'",
      examples: [
        {
          q: "A transportation analyst claims that a city's new bike-share program reduced short-distance car trips. Which choice best supports this claim?",
          choices: [
            "Traffic sensor data showed a 12% drop in car trips under two miles within the program's first year, while a comparable city without a bike-share program saw no such drop over the same period.",
            "The bike-share program added 800 new bicycles to its fleet in its first year.",
            "Surveys found that 40% of bike-share users said they enjoyed exercising outdoors.",
            "Car trips under two miles fell by 12% in the program's first year.",
          ],
          answer: 0,
          explain:
            "The claim credits the bike-share program itself, so the evidence has to do more than show car trips fell around the same time — it has to rule out other causes. The plain 12%-drop figure alone doesn't rule out things like gas prices or weather that could affect any city that year. The fleet-size and enjoyment figures don't measure car trips at all. Only the first choice reports that same drop while also showing a comparable city without the program saw no such drop, ruling out those other explanations.",
          difficulty: "easy",
          why: [null, "Adding bikes to the fleet doesn't show that car trips went down.", "Enjoying exercise isn't a measure of car trips at all.", "The drop alone could have other causes, like gas prices or weather. Without a comparison city, it doesn't show the program caused it."],
        },
        {
          q: "A factory manager claims that a new safety training program reduced workplace injuries. Which choice best supports this claim?",
          choices: [
            "Injury rates fell 18% at the factory after training began.",
            "Injury rates fell 18% at the factory after training began, while a similar sister factory that didn't adopt the training saw no meaningful change over the same period.",
            "The training program included a two-hour session on equipment handling.",
            "Employees who completed the training rated it as 'helpful' in a post-session survey.",
          ],
          answer: 1,
          explain:
            "Same setup as before: the training has to be the actual cause, so injuries merely dropping around the same time isn't enough on its own. The plain 18%-drop figure alone doesn't rule out something like a slower production period needing less equipment use. The session-length and helpfulness-rating choices don't measure injuries at all. Only the sister-factory comparison rules out a company-wide explanation like a slowdown, by showing a similar factory without the training saw no meaningful change.",
          difficulty: "medium",
          why: ["Injuries falling around the same time could have another cause, like slower production. Without a comparison, this doesn't isolate the training.", null, "The session's contents say nothing about whether injuries actually went down.", "Rating the training \"helpful\" is an opinion, not an injury count."],
        },
        {
          q: "A nonprofit claims that a community garden program reduced grocery spending among participating families. Which choice best supports this claim?",
          choices: [
            "Participating families' grocery receipts, tracked before and after joining, showed a decline not seen in a comparison group of similar families who didn't join.",
            "Participating families' grocery spending declined by an average of 15% after joining the program.",
            "The garden program provided free seeds and tools to all participating families.",
            "Most participating families reported enjoying gardening as a hobby.",
          ],
          answer: 0,
          explain:
            "Joining the program has to be what actually drove the change here, not just something that happened alongside it. The plain 15%-decline figure doesn't rule out something like a general drop in food prices that year. The seeds-and-tools and hobby-enjoyment choices don't measure grocery spending. Only the first choice adds a comparison group of similar families who didn't join, ruling out that kind of alternative explanation.",
          difficulty: "easy",
          why: [null, "A decline alone could come from something else, like falling food prices that year. There's no comparison group to rule that out.", "Free seeds and tools describe the program, not its effect on grocery spending.", "Enjoying gardening doesn't measure grocery spending."],
        },
        {
          q: "A researcher claims that a workplace mentorship program increased promotion rates among mentees. Which choice best supports this claim?",
          choices: [
            "Employees who participated in the mentorship program were promoted at twice the rate of employees who never applied to the program.",
            "Employees who participated in the mentorship program were promoted at twice the rate of a comparable group of employees who applied but weren't matched with a mentor due to limited mentor availability.",
            "The mentorship program paired each mentee with a senior employee in a related field.",
            "A survey found that mentees felt more confident about their career prospects.",
          ],
          answer: 1,
          explain:
            "The claim is that mentorship, not pre-existing ambition, drove the promotions. The first choice's comparison group (employees who never applied) likely differs in ambition from the start, so it doesn't rule out that alternative explanation. The pairing-description and confidence-survey choices don't measure promotions. The second choice's comparison group applied but wasn't matched only due to limited availability, meaning both groups share the same ambition level and only the mentor-matching differed. That's the comparison that actually controls for the variable that matters.",
          difficulty: "medium",
          why: ["People who never applied may simply be less ambitious to begin with, so ambition, not mentorship, could explain the gap.", null, "How mentees were paired describes the program, not whether promotions went up.", "Feeling more confident isn't the same as actually being promoted."],
        },
        {
          q: "A researcher claims that a four-day work week caused a rise in employee output per hour. Which choice best supports this claim?",
          choices: [
            "A survey of employees found that 85% reported feeling less stressed after the switch to a four-day week.",
            "Output per hour at the company rose after the switch, while output per hour at a similar company in the same industry that kept a five-day week stayed flat over the same period.",
            "The company reduced its office hours from 40 to 32 hours per week.",
            "Output per hour at the company rose by 9% after the switch to a four-day week.",
          ],
          answer: 1,
          explain:
            "The claim is specifically about output per hour, caused by the schedule change. The stress-survey choice is tempting (less stress could plausibly raise output), but it never actually measures output. The plain 9%-rise figure and the hours-reduction fact don't rule out an industry-wide trend that year. Only the second choice directly measures output while also ruling out that alternative, using a similar company that kept a five-day week as a comparison.",
          difficulty: "hard",
          why: ["Less stress might help output, but this never measures output per hour, which is what the claim is about.", null, "Fewer hours is the change itself, not evidence of what it did to output per hour.", "A 9% rise alone could be an industry-wide trend that year. Without a comparison company, it doesn't show the schedule caused it."],
        },
      ],
      traps: [
        "Accepting correlation-only evidence for a causation claim without checking if alternative causes are addressed.",
        "Missing that the strongest evidence choice will often specifically reference a comparison group or a 'before vs. after' structure.",
      ],
    },
    {
      name: "Reading Data from a Graph or Table",
      explanation:
        "Many Command of Evidence questions hand you a graph or table directly, then ask one of three things: to complete a statement using the data ('which choice most effectively uses data from the graph to complete the text'), to identify which choice describes data that supports or weakens a stated conclusion, or to apply a hypothesis stated in the text to the data. For the first two, there's no trick beyond careful, literal reading: find the exact category, time period, or comparison the question asks about, and check every number and label in each answer choice against the data instead of settling for the first choice that looks plausible. For the third, the text states a rule ('the more X, the later Y,' or 'Y happens whenever X is above some level') and the blank follows 'If the hypothesis is correct, then...': find the variable the rule names in the graph, read the values, and apply the rule in exactly the direction it states. Wrong answers are built by swapping a category, a time period, a direction, or a single digit from the real data; by citing real numbers that don't actually address what the question is asking; or, with a hypothesis, by applying the rule backward, treating a cutoff as if it meant only the highest value, or predicting something the hypothesis never mentions.",
      examples: [
        {
          q: "A table shows the average commute time, in minutes, for workers in four cities: Denview, 22; Fairhaven, 31; Grantsville, 18; Millbrook, 27. A student writing about commute times notes that among these four cities, the shortest average commute belongs to ______. Which choice most effectively uses data from the table to complete the statement?",
          choices: [
            "Grantsville, at 18 minutes.",
            "Denview, at 22 minutes.",
            "Millbrook, at 27 minutes.",
            "Fairhaven, at 31 minutes.",
          ],
          answer: 0,
          explain:
            "Grantsville has the lowest value (18), matching 'shortest.' The other three choices each correctly report their own city's number, but none of those numbers is the minimum, so none of them actually completes 'shortest' correctly.",
          difficulty: "easy",
          why: [null, "Denview's 22 minutes is correct for Denview, but it's not the shortest. Grantsville's 18 is lower.", "Millbrook's 27 minutes is correct for Millbrook, but it's one of the longer commutes, not the shortest.", "Fairhaven's 31 minutes is the longest commute in the table, the opposite of \"shortest.\""],
        },
        {
          q: "A bar graph shows a company's quarterly revenue, in millions of dollars, over one year: Q1, 4.2; Q2, 5.1; Q3, 4.8; Q4, 6.3. An analyst writing about the company's performance notes that after an increase in Q2, revenue ______. Which choice most effectively uses data from the graph to complete the statement?",
          choices: [
            "fell slightly in Q3 before rising again in Q4.",
            "fell in every quarter for the rest of the year.",
            "remained exactly flat for the rest of the year.",
            "rose in every quarter for the rest of the year.",
          ],
          answer: 0,
          explain:
            "Q3 (4.8) is lower than Q2 (5.1), a slight fall, and Q4 (6.3) is higher again, a rise. 'Fell in every quarter' overstates that one dip into a full decline through year's end. 'Remained flat' ignores that the values changed at all. 'Rose in every quarter' ignores the Q3 dip entirely.",
          difficulty: "easy",
          why: [null, "Revenue fell only in Q3. It rose again in Q4 (6.3), so it didn't fall in every quarter.", "The values changed: 4.8 in Q3, then 6.3 in Q4. Nothing stayed flat.", "Q3 (4.8) was lower than Q2 (5.1), so revenue didn't rise in every quarter."],
        },
        {
          q: "Researchers surveyed customer satisfaction, on a 100-point scale, at two competing coffee chains before and after each chain introduced a loyalty rewards app. Chain A's average score rose from 62 to 81 after launching its app. Chain B's average score, measured over the same period without launching any app, rose from 65 to 68. The researchers concluded that Chain A's loyalty app substantially improved customer satisfaction. Which choice best describes data that support the researchers' conclusion?",
          choices: [
            "Chain A's score rose by 19 points after its app launched, while Chain B's score, without a comparable app, rose by only 3 points over the same period.",
            "Chain A's score was higher than Chain B's score both before and after the app launched.",
            "Both chains saw their customer satisfaction scores increase over the period studied.",
            "Chain B's score of 68 remained lower than Chain A's score of 81 after the app launched.",
          ],
          answer: 0,
          explain:
            "The conclusion is causal (the app specifically drove the improvement), so the strongest support is the size of Chain A's rise (19 points) compared to Chain B's much smaller rise (3 points) without an app, ruling out a general trend affecting both chains equally. Comparing the two chains' raw scores at a single point in time doesn't address which company changed more. Noting that 'both increased' actually undercuts the app's unique effect, since Chain B improved too without one.",
          difficulty: "medium",
          why: [null, "Which chain scored higher at a given moment doesn't show which one improved more, or why.", "If both chains improved, that actually points to a general trend, which weakens the case for the app specifically.", "Comparing final scores alone ignores that Chain A started lower. The key is how much each chain changed."],
        },
        {
          q: "A city's parks department claims that adding new drinking fountains increased park attendance. In the twelve months after fountains were added to five parks, average monthly attendance at those parks rose from 3,200 to 3,850. Over the same period, average monthly attendance at eight comparable parks that did not receive new fountains rose from 3,100 to 3,700. Which choice best describes data that weaken the department's claim?",
          choices: [
            "Attendance at the parks without new fountains rose by a comparable percentage (about 19%) over the same period as the parks that did receive fountains (about 20%).",
            "The five parks that received fountains had slightly higher attendance than the eight comparison parks before the fountains were added.",
            "Attendance at the parks with new fountains rose by about 650 visitors per month.",
            "The parks department installed fountains in five of its thirteen total parks.",
          ],
          answer: 0,
          explain:
            "If parks without any new fountains saw almost the same percentage increase, that points to some other citywide factor (like weather or a general rise in park use), driving attendance up everywhere, not the fountains specifically, which weakens the causal claim. The pre-existing attendance gap and the raw increase at the fountain parks are both true but don't address whether the fountains specifically caused the rise. The fountain-count detail is background information, not evidence either way.",
          difficulty: "medium",
          why: [null, "A small head start in attendance doesn't tell you whether the fountains caused the rise.", "This is the rise the department is pointing to. It doesn't weaken the claim; it's the claim's own evidence.", "How many parks got fountains is background. It doesn't count for or against the claim."],
        },
        {
          q: "A survey asked residents of three neighborhoods how they primarily commute to work: by car, by public transit, or by bicycle. In Neighborhood X, 58% commute by car, 12% by transit, and 30% by bicycle. In Neighborhood Y, 62% commute by car, 33% by transit, and 5% by bicycle. In Neighborhood Z, 55% commute by car, 40% by transit, and 5% by bicycle. A researcher claims that public transit use varies more across these neighborhoods than car use does. Which choice most effectively uses data from the survey to support the researcher's claim?",
          choices: [
            "Transit use ranges from 12% to 40% (a 28-point spread) across the neighborhoods, while car use ranges from 55% to 62% (only a 7-point spread).",
            "Car use ranges from 12% to 40% (a 28-point spread) across the neighborhoods, while transit use ranges from 55% to 62% (only a 7-point spread).",
            "Neighborhood Z has both the lowest car-commuting rate and the highest transit rate of the three neighborhoods.",
            "In every neighborhood surveyed, car commuting is more common than either transit or cycling individually.",
          ],
          answer: 0,
          explain:
            "The claim is specifically about variation (which commute type's rate swings more across the three neighborhoods), so the relevant comparison is each variable's range: transit spans 28 points (12% to 40%) while car spans only 7 points (55% to 62%), directly supporting the claim that transit use varies more. The second choice reports the identical two numbers but swaps which variable they belong to, which would actually support the opposite conclusion. The Neighborhood Z choice and the car-is-most-common choice are both true statements, but each describes a single data point or a consistent pattern rather than the spread across neighborhoods the claim is actually about.",
          difficulty: "hard",
          why: [null, "These are the right numbers attached to the wrong variables. With them swapped, they would argue the opposite.", "True for Neighborhood Z, but one neighborhood can't show how much each rate varies across all three.", "True, but it's about which option is most common, not which one varies more across neighborhoods."],
        },
        {
          q: "Botanist Lena Marsh hypothesizes that the more heavily deer browse a meadow, the later in the season the goldenrod growing there will flower, since the plants must regrow the leaves the deer have eaten before they can bloom. The bar graph shows the average number of deer visits per week that Marsh recorded at four meadows during one summer. If Marsh's hypothesis is correct, then goldenrod at ______\n\nWhich choice most effectively uses data from the graph to complete the statement?",
          choices: ["Pine Gap would be expected to flower later than goldenrod at any of the other three meadows.", "Crestview would be expected to flower earlier than goldenrod at Ashby.", "Fernhill would be expected to flower later than goldenrod at any of the other three meadows.", "Fernhill would be expected to grow shorter than goldenrod at any of the other three meadows."],
          answer: 2,
          explain:
            "Treat the hypothesis as a rule: more deer browsing means later flowering. Find the variable it names in the graph (deer visits) and apply the rule in the stated direction. Fernhill has the most visits (22 per week), so its goldenrod should flower latest. The Pine Gap choice applies the rule backward: Pine Gap has the fewest visits (3), so it should flower earliest. The Crestview choice misapplies the rule to two real values: Crestview (14) gets more visits than Ashby (9), so it should flower later, not earlier. The last choice picks the right meadow but predicts something the hypothesis never mentions; the rule is about when goldenrod flowers, not how tall it grows.",
          figure: {"kind": "bar", "xLabel": "Meadow", "y": {"label": "Deer visits per week", "min": 0, "max": 25, "step": 5}, "bars": [{"label": "Ashby", "value": 9}, {"label": "Crestview", "value": 14}, {"label": "Fernhill", "value": 22}, {"label": "Pine Gap", "value": 3}]},
          difficulty: "hard",
          why: ["This runs the rule backward. Pine Gap has the fewest visits (3), so it should flower earliest, not latest.", "Crestview (14 visits) gets more browsing than Ashby (9), so the rule predicts it flowers later, not earlier.", null, "Right meadow, wrong prediction. The hypothesis is about when goldenrod flowers, not how tall it grows."],
        },
      ],
      traps: [
        "Citing real numbers from the graph or table that don't actually address what the question is asking (the right city, but the wrong statistic; the right trend, but the wrong time period).",
        "Reporting two real values but swapping which category or variable each one belongs to, which can flip a supporting statement into its opposite.",
        "Overstating what the data shows — a single dip becomes 'fell every quarter,' or a modest gap becomes framed as if it were the entire story.",
        "Applying a stated hypothesis backward (reading 'the more X, the later Y' as 'the more X, the earlier Y') or stretching it to predict something it never mentions.",
        "Treating a hypothesis about a cutoff ('whenever the water is warmer than 8°C') as if it were only about the single highest or lowest value in the graph.",
      ],
    },
    {
      name: "Selecting the Best Supporting Quotation",
      explanation:
        "This Command of Evidence pattern applies to literary texts, poems, and passages about a historian's or researcher's work. You're given a claim (about a character's feeling, an author's style, a poem's theme, or a scholar's finding) and asked which quotation best supports or illustrates it. There's no data to weigh here. Instead: figure out exactly what quality, emotion, or specific point the claim names, then find the quotation that embodies that specific thing, rather than one that merely mentions the same character, scene, or general topic.",
      examples: [
        {
          q: "A short story states that a young sailor feels profound relief upon finally spotting land after weeks lost at sea. Which quotation from the story most effectively illustrates this claim?",
          choices: [
            "\"The gulls circled twice before he even trusted his own eyes.\"",
            "\"His knees buckled and he laughed, a short broken sound, as the shoreline steadied into something real.\"",
            "\"He had counted forty-one sunrises since losing sight of the coast.\"",
            "\"The captain ordered the sails trimmed as the wind shifted toward shore.\"",
          ],
          answer: 1,
          explain:
            "The claim names a specific emotion: relief, after a long ordeal. The gulls quotation shows disbelief and tension, not relief. The sunrise-count and sail-trimming quotations are neutral descriptions with no emotional content at all. Only the second quotation shows the physical release of built-up tension (buckled knees, a broken laugh), capturing the emotional release itself.",
          difficulty: "easy",
          why: ["Not trusting his own eyes shows disbelief and tension. The relief hasn't arrived yet.", null, "Counting sunrises is a neutral fact. It shows no emotion at all.", "The captain's order describes the ship, not the sailor's feelings."],
        },
        {
          q: "A novel states that a seamstress feels quiet pride in a dress she has just finished. Which quotation most effectively illustrates this claim?",
          choices: [
            "\"She announced to the whole shop that it was the finest dress she had ever made.\"",
            "\"She held it up to the window and said nothing for a long moment, smoothing one seam with her thumb.\"",
            "\"She had spent eleven hours on the beadwork alone that week.\"",
            "\"She wondered whether the customer would even notice the extra stitching.\"",
          ],
          answer: 1,
          explain:
            "The claim names a specific, understated emotion: quiet pride, not loud celebration. The announcement quotation shows pride, but loudly, which doesn't match the claim's specific wording. The doubt quotation shows uncertainty, not pride. The hours-spent quotation is a neutral fact with no emotional content. Only the second quotation shows restrained, private satisfaction (silently smoothing the seam by the window), matching 'quiet' precisely.",
          difficulty: "easy",
          why: ["That's pride, but loud and public. The claim specifies quiet pride.", null, "Hours spent is a neutral fact. It doesn't show any emotion.", "Wondering whether anyone will notice shows doubt, not pride."],
        },
        {
          q: "A short story states that a man feels a growing sense of unease about a business decision he has already made. Which quotation most effectively illustrates this claim?",
          choices: [
            "\"He hesitated for a moment before signing, pen hovering over the page.\"",
            "\"He reviewed the contract's terms one final time before the meeting began.\"",
            "\"Each time the phone rang that week, he was certain it would be the call undoing everything.\"",
            "\"He shook hands with his new business partner and thanked her for the opportunity.\"",
          ],
          answer: 2,
          explain:
            "The claim specifies growing unease about something already decided, not doubt before deciding. The hesitation quotation shows doubt, but before the decision — the wrong point in the timeline. The review and handshake quotations are neutral, with no unease shown. Only the third quotation shows unease that persists and builds after the decision, matching both the emotion and its timing exactly.",
          difficulty: "medium",
          why: ["This hesitation happens before he signs. The claim is about unease after the decision is already made.", "Reviewing the contract is neutral. It shows no unease.", null, "A warm handshake shows no unease at all, let alone growing unease."],
        },
        {
          q: "A researcher studying urban beekeeping claims that some city beekeepers deliberately choose rooftop locations specifically to keep hives farther from pedestrian foot traffic. Which quotation from an interview with a beekeeper would most directly support the researcher's claim?",
          choices: [
            "\"I've kept bees in three different rooftop locations, and each one has had its own unique advantages and challenges.\"",
            "\"Ever since I started keeping bees, I've noticed how calming it is to watch them work.\"",
            "\"I moved my hives to the roof specifically so people walking by on the sidewalk wouldn't have to worry about getting too close to the bees.\"",
            "\"Rooftop gardens have become much more popular in this city over the past decade.\"",
          ],
          answer: 2,
          explain:
            "The claim is specific: rooftops are chosen deliberately to keep hives away from pedestrians. The first quotation mentions rooftop experience generally but never states a reason for the choice. The second describes a personal feeling unrelated to location. The fourth describes a general trend in rooftop gardening, not a reason for hive placement. Only the third quotation directly states the beekeeper's actual motivation (distance from pedestrians), matching the claim exactly.",
          difficulty: "medium",
          why: ["It mentions rooftops but never gives the reason for choosing them, which is what the claim is about.", "A personal feeling about watching bees has nothing to do with where the hives are placed.", null, "A citywide gardening trend isn't a beekeeper's reason for placing hives on the roof."],
        },
        {
          q: "A novel states that a character maintains an outward appearance of composure even while privately furious during a tense meeting. Which quotation most effectively illustrates this claim?",
          choices: [
            "\"She slammed the folder shut and stormed out of the room.\"",
            "\"She thanked the committee calmly, her voice even, while her hand, hidden beneath the table, was clenched so tightly her knuckles had gone white.\"",
            "\"She sat quietly through the entire meeting without speaking.\"",
            "\"She later told a colleague how frustrating the meeting had been.\"",
          ],
          answer: 1,
          explain:
            "The claim requires both halves at once — outward composure and private anger underneath, simultaneously. The slammed-folder quotation shows anger, but openly, contradicting the 'outward composure' half. The quiet-sitting quotation shows calm but no evidence of concealed fury, and the colleague quotation reveals the anger only afterward, not during. Only the second quotation shows both halves at once: a calm, even voice on the surface, and a clenched, white-knuckled hand hidden beneath the table.",
          difficulty: "hard",
          why: ["Slamming the folder and storming out is open anger. The claim needs outward composure.", null, "Sitting quietly shows calm, but nothing shows the fury hidden underneath.", "This reveals her frustration afterward, not during the meeting while she kept her composure."],
        },
      ],
      traps: [
        "Choosing a quotation that mentions the right character or topic but doesn't actually demonstrate the specific quality or emotion named in the claim.",
        "Choosing a quotation that's vivid and dramatic in general but illustrates a different feeling or idea than the one stated in the claim.",
        "Overlooking a quieter, more precise quotation in favor of a more dramatic-sounding one that doesn't actually match the claim as closely.",
      ],
    },
    {
      name: "Evaluating a Hypothetical Finding's Effect on a Claim",
      explanation:
        "These questions describe a hypothesis or claim, then ask which new fact (one not already in the passage) would most strengthen it, or, just as often, most weaken it. There's no graph to read, and none of the choices are real quotes; they're all hypothetical findings you're judging for logical fit. The method: turn the hypothesis into a prediction ('if this is true, we'd expect to see ___'), then pick the choice that matches that prediction exactly. For a 'weaken' question, pick the choice that reports the opposite of that prediction, or that shows the same outcome would have happened anyway, without the supposed cause.",
      examples: [
        {
          q: "Researchers hypothesize that a species of beetle locates rotting fruit primarily by scent rather than by sight. Which finding, if true, would most strongly support this hypothesis?",
          choices: [
            "Beetles with their sense of smell experimentally blocked took far longer to locate fruit than beetles with their vision blocked.",
            "The beetles are most active during daylight hours.",
            "Rotting fruit produces a strong odor detectable by many insect species.",
            "Beetles were observed near fruit of many different colors.",
          ],
          answer: 0,
          explain:
            "Turn the hypothesis into a prediction: if it's true, blocking smell should stop the beetles from finding fruit, while blocking vision shouldn't matter much. The first choice matches that exact prediction. The color-observation choice tests sight, not smell, and wouldn't specifically confirm the 'scent, not sight' claim either way. The activity-timing and general-odor choices don't test the beetles' actual location behavior at all.",
          difficulty: "easy",
          why: [null, "Being active in daylight doesn't show whether they find fruit by scent or by sight.", "A strong odor existing doesn't show the beetles are the ones using it.", "Visiting fruit of many colors is about sight, and doesn't show scent is what they rely on."],
        },
        {
          q: "A transportation researcher claims that a city's new rapid-transit line reduced the number of people driving downtown for work. Which finding, if true, would most strongly support this claim?",
          choices: [
            "The rapid-transit line carries an average of 40,000 riders per day.",
            "Downtown parking permit purchases dropped significantly in the months after the line opened.",
            "The rapid-transit line took three years to construct.",
            "Surveys found that riders enjoyed the line's comfort and reliability.",
          ],
          answer: 1,
          explain:
            "The predicted effect is fewer downtown drivers after the line opened. The ridership figure doesn't by itself show driving went down — riders could simply be new commuters who never drove, so it doesn't confirm the specific claim. The construction-time and comfort-survey choices don't measure driving at all. Only the parking-permit drop directly reports the predicted decrease, since permits are a direct proxy for people driving downtown.",
          difficulty: "easy",
          why: ["Riders could be new commuters who never drove before, so ridership alone doesn't show driving went down.", null, "How long construction took has nothing to do with whether driving decreased.", "Liking the line isn't evidence that fewer people drove downtown."],
        },
        {
          q: "A nutritionist hypothesizes that a new meal-delivery service causes subscribers to eat more vegetables per week than they did before subscribing. Which finding, if true, would most directly weaken this hypothesis?",
          choices: [
            "Subscribers report high satisfaction with the variety of vegetables included in each week's meals.",
            "Subscribers' vegetable intake was already rising steadily in the months before they subscribed to the service, at about the same rate it continued rising after.",
            "The service's meals include, on average, three servings of vegetables per meal.",
            "Subscribers who canceled the service cited high cost as their primary reason for leaving.",
          ],
          answer: 1,
          explain:
            "A weakening finding for a causal claim shows the same change would likely have happened anyway, without the supposed cause. If vegetable intake was already climbing at about the same rate before subscribing, the service isn't what's driving the increase — the trend was already in motion. The satisfaction and vegetables-per-meal choices describe the service's content, not whether it actually changed behavior. The cancellation-reason choice concerns a different group (people who left) and doesn't address the hypothesis about eating habits at all.",
          difficulty: "medium",
          why: ["Satisfaction with the vegetables doesn't show whether eating habits actually changed.", null, "Servings per meal describe the product, not whether subscribers ate more vegetables than before.", "This is about people who left and why. It doesn't speak to the hypothesis about vegetable intake."],
        },
        {
          q: "An archaeologist proposes that an ancient trade network extended much farther than previously believed, based on a distinctive pottery style found at a distant site. Which finding, if true, would most strongly support this proposal?",
          choices: [
            "Chemical analysis shows the distant pottery's clay matches a mineral source found only in the original region.",
            "The pottery found at the distant site closely resembles pottery from the original region in style.",
            "The distant site has been continuously inhabited for over a thousand years.",
            "Similar pottery styles have also been found in a third, even more distant region.",
          ],
          answer: 0,
          explain:
            "The proposal's weak point is that the distant pottery could have been made locally by potters who simply copied the style, without any actual trade occurring. The style-resemblance choice just restates the similarity already given in the claim, adding nothing new. The habitation and third-region choices don't resolve that weak point either. Only the clay-source match rules out local imitation directly, since the physical material itself must have traveled from the original region.",
          difficulty: "medium",
          why: [null, "This just restates the style similarity the proposal already rests on. It adds nothing new.", "How long the site was inhabited doesn't show whether the pottery came through trade.", "A third site with similar pottery could also be local imitation. It doesn't rule that out."],
        },
        {
          q: "A biologist hypothesizes that a particular enzyme causes faster wound healing in a species of fish. Which finding, if true, would most strongly support this hypothesis?",
          choices: [
            "Fish naturally carrying more of the enzyme heal faster than fish with less of it.",
            "Fish given an experimental injection of the enzyme healed faster than untreated fish, with all other conditions matched.",
            "The enzyme was first identified by researchers studying a different fish species.",
            "Fish with higher enzyme levels tend to live in warmer water.",
          ],
          answer: 1,
          explain:
            "A hypothesis using 'causes' needs evidence that isolates the enzyme as the cause, not just evidence that the enzyme and fast healing tend to occur together. The natural-variation finding is only a correlation — some other trait shared by high-enzyme fish could be the real cause. The water-temperature finding introduces yet another variable without isolating anything, and the discovery-history fact is irrelevant. Only the experimental-injection finding directly tests cause and effect by controlling everything except the enzyme itself.",
          difficulty: "hard",
          why: ["This is only a correlation. Some other trait of high-enzyme fish could be what speeds healing.", null, "Where the enzyme was first discovered has no bearing on what it does in this species.", "Water temperature is yet another variable, and it doesn't isolate the enzyme as the cause."],
        },
      ],
      traps: [
        "Choosing a finding that's topically related but doesn't actually report the specific outcome the hypothesis predicts.",
        "Choosing a finding that would be roughly consistent with the hypothesis being either true or false — genuine support has to point specifically in the predicted direction.",
        "Mistaking a correlational finding (two things happen together) for support of a causal claim ('X causes Y') — a causal claim needs a finding that isolates the one variable in question, usually via a controlled comparison.",
      ],
    },
  ],
  tipsAndTricks: [
    "Underline the exact claim being supported before reading any answer choices — don't let the passage's surrounding narrative distract you from the specific sentence in question.",
    "If a claim uses words like 'causes' or 'led to,' the correct evidence usually involves ruling out alternatives (a comparison or control), not just a single supporting statistic.",
    "Rank each answer choice as 'off-topic,' 'related but vague,' or 'specific and directly measures the claim' — the correct answer is almost always in that third category.",
    "When a graph or table is involved, locate the exact category and time period the question names before looking at any answer choice — most wrong choices cite real numbers from the data, just attached to the wrong label.",
  ],
};

const LC_RW_INFERENCES: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Logical Completion (Fill-in-the-Blank Style)",
      explanation:
        "These questions give you a passage with a blank at the end, and ask what logically follows from everything stated before it. Stay strict: the correct answer follows directly from the text, with no outside knowledge or creative leaps allowed. Ask yourself 'given only what's stated, what MUST be true next?' — not 'what would be interesting next?'",
      examples: [
        {
          q: "The lab's results contradicted decades of prior research, so the team knew their next step would have to be ______. Which choice most logically completes the text?",
          choices: [
            "abandoning the research question entirely.",
            "replicating the experiment to confirm the surprising result.",
            "publishing the findings immediately as a major breakthrough.",
            "assuming the prior decades of research had been conducted incorrectly.",
          ],
          answer: 1,
          explain:
            "'Contradicted decades of prior research' implies the result is unusual and needs verification before being trusted. The standard, logical next step when a surprising result appears is replication, not dramatic action. Abandoning the field is too extreme a reaction to one surprising result. Publishing immediately skips the verification step entirely, and assuming all prior research was wrong is an unsupported leap. Replicating the experiment follows conservatively from what's actually stated.",
          difficulty: "easy",
          why: ["One surprising result is a reason to check it, not to give up on the whole question. This overreacts.", null, "Publishing right away skips the step a surprising result most needs: confirming it.", "One contradicting result doesn't show decades of research were wrong. That's a big leap the text doesn't support."],
        },
        {
          q: "The bridge inspectors found hairline cracks in three support beams that hadn't been present during the previous year's inspection, so the city announced that the bridge would need to ______. Which choice most logically completes the text?",
          choices: [
            "be demolished immediately.",
            "remain open with no further action required.",
            "undergo closer inspection and repair of the affected beams.",
            "be redesigned using an entirely different construction method.",
          ],
          answer: 2,
          explain:
            "New cracks in support beams imply something changed for the worse since last year, in a structurally important part of the bridge. The standard, cautious next step is closer inspection and repair, not the extremes on either side. Demolition goes further than three hairline cracks support, remaining open ignores the finding entirely, and a full redesign is a drastic leap the text never suggests. Closer inspection and repair is the conservative, logical step.",
          difficulty: "medium",
          why: ["Three hairline cracks call for a closer look and repairs, not tearing the whole bridge down.", "New cracks in support beams are exactly why action is needed. Doing nothing ignores the finding.", null, "A full redesign goes far beyond what three new cracks suggest. Nothing points to the design itself being flawed."],
        },
        {
          q: "The recipe had never failed before, so when the cake collapsed in the oven, the baker assumed the problem was most likely ______. Which choice most logically completes the text?",
          choices: [
            "a flaw in the recipe itself.",
            "a specific error in this attempt, such as oven temperature.",
            "a defect in the oven that would require professional repair.",
            "an intentional change the baker had made to the recipe.",
          ],
          answer: 1,
          explain:
            "'Had never failed before' implies the recipe itself is generally reliable, so a cautious first explanation points to something specific to this attempt, not the recipe's design. Standard troubleshooting logic starts with the most immediate variable, like oven temperature, not a rewrite of the whole recipe. Blaming the recipe directly contradicts the given information, and an oven defect or an intentional change are both specific claims the text never makes. A specific error in this attempt follows most directly from what's stated.",
          difficulty: "easy",
          why: ["The recipe \"had never failed before,\" so it's the least likely suspect. This contradicts the setup.", null, "Nothing points to a broken oven needing professional repair. That's a much bigger claim than the text supports.", "The text never says the baker changed anything. This invents a cause."],
        },
        {
          q: "The new bridge design used 40% less steel than the previous model while passing every load test, so engineers concluded that ______. Which choice most logically completes the text?",
          choices: [
            "steel-free bridges are now possible using this design approach.",
            "this design should immediately replace all older bridges currently in use.",
            "the design achieves comparable structural strength using less material.",
            "load testing is no longer a necessary step for future bridge designs.",
          ],
          answer: 2,
          explain:
            "Using less steel while passing every load test establishes that this design achieves comparable strength with less material, nothing more. 'Steel-free' wildly overreaches, and a sweeping replacement policy isn't supported by the data. Concluding load testing is unnecessary directly contradicts the passage, which describes load testing as the very thing that validated the design. The comparable-strength completion stays closest to exactly what's shown.",
          difficulty: "medium",
          why: ["The design used 40% less steel, not none. \"Steel-free\" goes far beyond the result.", "Passing tests on one design doesn't justify replacing every older bridge at once. The text never argues that.", null, "The load tests are what proved the design works, so the result supports testing, not dropping it."],
        },
        {
          q: "Despite requiring twice the initial investment, the new water filtration system removed contaminants at a rate the older systems could never approach, so the utility company reasoned that ______. Which choice most logically completes the text?",
          choices: [
            "all future systems should switch to this method regardless of cost.",
            "the higher cost could be justified specifically where superior contaminant removal is especially needed.",
            "the older filtration systems should be banned from further use entirely.",
            "the initial investment would be recovered within the first year of operation.",
          ],
          answer: 1,
          explain:
            "What's actually established is a costlier system that performs much better at contaminant removal. Switching regardless of cost ignores the stated cost tradeoff, and banning older systems entirely is unsupported by anything in the text. A specific recovery timeline is never mentioned. The completion limiting the conclusion to situations where the specific benefit justifies the specific cost is the only conservative reading.",
          difficulty: "hard",
          why: ["\"Regardless of cost\" ignores the tradeoff the sentence sets up: the system costs twice as much.", null, "Nothing in the text says the older systems are unsafe or should be banned.", "No payback timeline is mentioned. \"Within the first year\" is invented."],
        },
      ],
      traps: [
        "Choosing the most dramatic or interesting-sounding completion rather than the most logically necessary one.",
        "Choosing an answer that requires assuming something not stated (e.g., that the lab has unlimited funding, or that other labs already tried to replicate it).",
        "Choosing a completion that goes further than the evidence allows: 'likely' becomes 'proves,' or one case becomes 'always' or 'every.'",
      ],
    },
    {
      name: "Multi-Step and Conditional Inferences",
      explanation:
        "Some of the hardest Inferences questions don't ask you to extend a single stated fact; they ask you to combine two or more stated facts into one conclusion, rule out a competing explanation the text has quietly set up, or reason forward from a stated hypothesis as if it's true ('assuming this view is correct...', 'if these findings are valid...'). The method is the same discipline as basic completion, just with more moving parts: track each fact separately, notice what a second or third fact rules in or out, and accept any stated premise as true for the purposes of the question, even if it's phrased as someone's belief or assumption. As always, the correct completion is the narrowest one the combined facts actually support, not a sweeping generalization.",
      examples: [
        {
          q: "A city's public library recently digitized its entire collection of local newspapers dating back to 1890, making them searchable online for the first time. Historians researching the city's early development had previously needed to visit the library in person and read through physical archives page by page. Now that the newspapers are searchable online, these historians can likely ______. Which choice most logically completes the text?",
          choices: [
            "locate references to specific events far more quickly than before.",
            "stop using any other historical sources in their research.",
            "assume the digitized newspapers contain no errors.",
            "expect the library to digitize other cities' newspaper archives as well.",
          ],
          answer: 0,
          explain:
            "Two facts combine directly: the text is now searchable, and historians no longer need to search page by page — together, that means locating specific references is now much faster. Stopping the use of other sources, assuming no errors, and expecting other cities' archives to also be digitized are all unsupported leaps the text gives no basis for.",
          difficulty: "easy",
          why: [null, "Searchable newspapers are one more tool. Nothing suggests historians would drop every other source.", "Being digitized doesn't make the papers error-free, and the text never says anything about errors.", "The text is about one library's archive. It gives no reason to expect other cities' archives to follow."],
        },
        {
          q: "A bakery's new industrial oven can bake three times as many loaves per batch as its old oven, and it reaches baking temperature in half the time. Combined, these two facts suggest that the bakery's overall bread output could ______. Which choice most logically completes the text?",
          choices: [
            "increase substantially without necessarily hiring additional staff.",
            "decrease slightly due to the oven's higher energy costs.",
            "remain exactly the same as before, since costs offset the gains.",
            "depend primarily on how many customers visit the bakery each day.",
          ],
          answer: 0,
          explain:
            "More loaves per batch and less time per batch combine directly to support a higher overall output using the same equipment, without necessarily requiring more staff. The other choices introduce costs, customer demand, or an unsupported claim of no change — none of which the text addresses.",
          difficulty: "easy",
          why: [null, "Energy costs are never mentioned, and more loaves in less time points to more output, not less.", "The text gives two gains and no offsetting costs, so \"exactly the same\" isn't supported.", "Customer demand isn't mentioned. The question is about how much bread the oven setup can produce."],
        },
        {
          q: "A city's downtown area saw a 25% drop in reported bicycle theft last year, the same year it installed security cameras at major intersections. However, the number of registered bicycle owners in the downtown area also fell by roughly 20% over the same period. Given this decline in bicycle ownership, the drop in reported thefts ______. Which choice most logically completes the text?",
          choices: [
            "may be explained at least partly by there simply being fewer bicycles present to steal, not only by the new cameras.",
            "proves that the security cameras had no effect on theft rates at all.",
            "suggests that bicycle theft is no longer a problem in the downtown area.",
            "indicates that the cameras were installed in the wrong locations.",
          ],
          answer: 0,
          explain:
            "With fewer bicycles present overall, some of the theft decline could reflect that shrinking pool rather than the cameras alone — a competing explanation the text can't rule out. Claiming the cameras had 'no effect at all' overreaches in the other direction, since the text doesn't establish that either. The other two choices go well beyond what a 25% drop with a smaller bike population can support.",
          difficulty: "medium",
          why: [null, "Fewer bikes explains part of the drop, but that doesn't prove the cameras did nothing. \"No effect at all\" overreaches.", "A 25% drop in reported thefts means fewer thefts, not zero. Theft hasn't disappeared.", "Nothing in the text says where the cameras were placed, let alone that it was the wrong spot."],
        },
        {
          q: "A vineyard's soil contains a rare mineral that gives its wine a distinctive taste, one that has been chemically confirmed in bottles from every one of the vineyard's harvests dating back to 1962, the year the vineyard was first planted. Records show that the vineyard's original owner sourced all of the vines from a single nursery that closed permanently in 1965. A neighboring vineyard, planted in 1970 in soil with a nearly identical mineral composition but using vines from a different nursery, produces wine that lacks this distinctive taste entirely. Given these facts, the distinctive taste most likely ______. Which choice most logically completes the text?",
          choices: [
            "originates from the specific vines sourced from the nursery that closed in 1965, rather than from the soil alone.",
            "will eventually disappear from the original vineyard's wine as its oldest vines are replaced.",
            "could be reproduced by any vineyard that plants its vines in similar regional soil.",
            "was intentionally added to the wine during the bottling process each year.",
          ],
          answer: 0,
          explain:
            "Chaining the facts: the taste has appeared in every harvest since the vines came from one particular nursery, while a neighboring vineyard with nearly identical soil but different-sourced vines lacks the taste entirely — pointing to the vines themselves, not the shared soil, as the likely origin. The text never discusses vine replacement or an eventual disappearance. 'Similar regional soil' is directly undercut by the neighboring vineyard's lack of the taste despite comparable soil. Nothing in the text mentions any additive during bottling.",
          difficulty: "hard",
          why: [null, "The text never mentions replacing vines or the taste fading. This predicts something with no basis.", "The neighboring vineyard has nearly identical soil and no distinctive taste, so soil alone can't be the source.", "No additive is mentioned anywhere. The taste has been chemically traced to every harvest, not added at bottling."],
        },
        {
          q: "Economists have long assumed that a country's manufacturing employment declines primarily because factories relocate to countries with cheaper labor. A recent analysis of one country's manufacturing sector found that total manufacturing output actually rose over the past decade even as manufacturing employment fell by 15%, and that domestic factories, rather than closing, increasingly relied on automated equipment to replace manual tasks. Assuming this analysis is accurate, the country's declining manufacturing employment ______. Which choice most logically completes the text?",
          choices: [
            "may be explained at least as much by automation replacing workers domestically as by factories relocating abroad.",
            "confirms that manufacturing has become entirely obsolete as an industry in this country.",
            "proves that no factories in this country have relocated to other countries.",
            "suggests that manufacturing output will continue rising indefinitely regardless of employment levels.",
          ],
          answer: 0,
          explain:
            "If output rose while employment fell and factories stayed open but automated, that pattern points to automation, not just relocation, as at least part of the explanation — directly complicating the traditional assumption stated up front. 'Entirely obsolete' and 'no factories have relocated' both overreach into absolute claims the text doesn't support. The passage also gives no basis for predicting output will keep rising 'indefinitely.'",
          difficulty: "hard",
          why: [null, "Output actually rose, so manufacturing is doing fine. \"Entirely obsolete\" contradicts the data.", "The analysis points to automation as a cause, but it doesn't prove no factory ever moved abroad.", "A decade of rising output doesn't support a prediction that it will rise forever."],
        },
      ],
      traps: [
        "Using only the passage's first fact and ignoring a second fact that changes or complicates the picture.",
        "Treating a stated hypothesis or assumption ('if this view is correct...', 'assuming this analysis is accurate...') as something to question, rather than accepting it as true and reasoning forward from it.",
        "Picking a conclusion that resolves only part of the tension between two facts, instead of the choice that accounts for both.",
        "Choosing a completion that goes further than the evidence allows: 'likely' becomes 'proves,' or one case becomes 'always' or 'every.'",
      ],
    },
  ],
  tipsAndTricks: [
    "Treat inference questions like a chain: text says A, therefore B must follow — if your answer choice requires a hidden step C that isn't in the text, it's wrong.",
    "When two choices both seem 'reasonable,' pick the narrower, more conservative one — the SAT rewards caution on inference questions.",
    "For fill-in-the-blank completions, physically cover the choices and predict the completion yourself first, then match.",
  ],
};

const LC_RW_WORDS_CONTEXT: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Precise Synonym in Context",
      explanation:
        "You're given a sentence with a blank and four choices, and you pick the word that makes the text most logical and precise. Usually the four choices have different meanings, and they're often advanced words (a set like 'endorsed,' 'questioned,' 'ignored,' 'expanded'), so the real job is to work out what meaning the blank needs before you look. Cover the choices and hunt for the context clue: a contrast word ('although,' 'rather than,' 'however') means the blank opposes something nearby; a colon or a restatement means the blank is explained right there; cause and effect ('so,' 'as a result') means the blank must lead to the outcome. Predict your own simple word (like 'used for profit' or 'strict'), then pick the choice whose meaning matches it, not the fanciest-sounding option. Sometimes all four choices point the same way and differ only in strength or tone ('diplomatic' vs. 'conciliatory'); then your prediction has to be exact, because the right answer fits this sentence's precise logic, not just its general direction.",
      examples: [
        {
          q: "The committee's ______ approach to spending drew criticism from departments hoping for expanded budgets. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["generous", "austere", "confusing", "enthusiastic"],
          answer: 1,
          explain:
            "Predict your own word first: something like 'strict' or 'tight-fisted,' since departments wanted more money and are unhappy. 'Generous' is the opposite of what's needed — departments wouldn't be upset by generosity. 'Confusing' and 'enthusiastic' don't match the criticism described at all. 'Austere' precisely matches strict, minimal spending, consistent with departments being unhappy about it.",
          difficulty: "easy",
          why: ["Departments wanted bigger budgets, so they wouldn't criticize generosity. This is the opposite of what fits.", null, "Nothing says the approach was hard to understand. The complaint is about tight spending, not clarity.", "\"Enthusiastic\" says nothing about how much was spent, and it doesn't explain why departments were unhappy."],
        },
        {
          q: "The negotiator's ______ tone put both sides at ease during an otherwise tense meeting. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["diplomatic", "conciliatory", "formal", "assertive"],
          answer: 1,
          explain:
            "Predict your own word first: something like 'calming' or 'soothing,' since the tone is what put both sides at ease. 'Diplomatic' is tempting since it sounds similar, but it just means tactful — a diplomatic tone could still leave real tension in the room. 'Formal' and 'assertive' don't match an easing effect at all. 'Conciliatory' specifically means aimed at reducing conflict, the actual effect the sentence describes.",
          difficulty: "medium",
          why: ["Close, but \"diplomatic\" only means tactful. A tactful tone can still leave tension; the sentence says it put both sides at ease.", null, "A formal tone doesn't ease tension. It says nothing about calming anyone.", "An assertive tone pushes; it wouldn't be what put both sides at ease."],
        },
        {
          q: "The professor's ______ feedback left little room for misinterpretation, since every point was stated in exact, unambiguous terms. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["brief", "harsh", "explicit", "generous"],
          answer: 2,
          explain:
            "Predict your own word first: something like 'clear' or 'precise,' since the feedback left no room for misinterpretation. 'Brief' only describes length — short feedback could still be vague, so it doesn't guarantee the described precision. 'Harsh' and 'generous' describe tone, not clarity. 'Explicit' precisely matches 'stated in exact, unambiguous terms.'",
          difficulty: "easy",
          why: ["\"Brief\" is about length. Short feedback can still be vague, and the sentence stresses exactness.", "\"Harsh\" describes tone, not clarity. The sentence is about how unambiguous the feedback was.", null, "\"Generous\" describes tone or kindness, not how exact and unambiguous the feedback was."],
        },
        {
          q: "Rather than adopting the committee's plan outright, the director chose to ______ several of its individual provisions, discarding the rest. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["endorse", "salvage", "ratify", "overturn"],
          answer: 1,
          explain:
            "Predict your own word first: something like 'keep only some parts of,' since the plan wasn't adopted outright and the rest was discarded. 'Endorse' and 'ratify' both imply approving something as a whole, which doesn't match 'several... provisions' being kept while 'the rest' is discarded. 'Overturn' means to reject — the opposite direction. 'Salvage' precisely captures retaining select useful parts from something otherwise not adopted.",
          difficulty: "medium",
          why: ["\"Endorse\" means approve as a whole. The director kept only several provisions and threw out the rest.", null, "\"Ratify\" means formally approve the whole thing, which contradicts discarding most of it.", "\"Overturn\" means reject, but the director kept several provisions."],
        },
        {
          q: "For most of the nineteenth century, the owners of the Carrow textile mill ______ the river that ran beside it, harnessing its current to drive their looms and flushing their dye waste downstream without a second thought for the towns below. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["revered", "exploited", "surveyed", "neglected"],
          answer: 1,
          explain:
            "Cover the choices and predict from the details: the owners used the river's current for power and dumped waste in it 'without a second thought,' so they used it for their own gain with no regard for the cost. Something like 'used selfishly' fits, and 'exploited' matches exactly. The four choices mean different things, so the context clue does all the work. 'Revered' means deeply respected, the opposite of dumping waste in it. 'Surveyed' means measured or examined, which says nothing about using it. 'Neglected' is tempting because the owners ignored the harm, but they used the river constantly rather than leaving it alone.",
          difficulty: "medium",
          why: ["\"Revered\" means deeply respected. Dumping waste in the river shows the opposite.", null, "\"Surveyed\" means measured or examined. The owners were using the river, not studying it.", "Tempting, since they ignored the harm, but they used the river constantly. \"Neglected\" means left alone or uncared for."],
        },
        {
          q: "The panel's final report ran to nearly two hundred pages, cataloguing every one of the agency's oversight failures in methodical, exhaustive detail. Though the report was ______ in its criticism of the agency's failures, it stopped short of recommending anyone's removal. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["scathing", "exhaustive", "muted", "premature"],
          answer: 1,
          explain:
            "Predict your own word first: something like 'thorough' or 'detailed,' since the earlier context specifies the report cataloged failures thoroughly, not necessarily with a harsh tone. 'Scathing' is a very tempting choice, since it also describes strong criticism, but it specifically implies a harsh, biting tone the context never establishes. 'Muted' and 'premature' both contradict the thoroughness described. 'Exhaustive' matches the specific quality described (thorough coverage) without importing an assumption about tone.",
          difficulty: "hard",
          why: ["Tempting, but \"scathing\" means harsh and biting. The context stresses thoroughness, not a harsh tone.", null, "A 200-page catalogue of every failure is anything but muted.", "\"Premature\" means too early. Nothing in the context is about timing."],
        },
        {
          q: "Historians long treated the grain riots that broke out in a dozen towns of the Aurelle valley in 1788 as isolated local outbursts, each sparked by its own bread shortage. In her new study, however, historian Colette Arnaud ______ the riots, tracing shared pamphlets, overlapping lists of demands, and even individual organizers who traveled from one town to the next. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["chronicles", "corroborates", "reconceives", "trivializes"],
          answer: 2,
          explain:
            "The key clue is 'however': Arnaud's study breaks from the old view of the riots as isolated outbursts. The evidence she traces (shared pamphlets, overlapping demands, traveling organizers) shows the riots were connected, so the blank needs a word meaning 'thinks about in a new way.' 'Reconceives' fits. 'Chronicles' is the strongest trap: she does record events, but chronicling is something the earlier historians could have done too, so it doesn't deliver the break that 'however' sets up. 'Corroborates' means confirms, which would support the old view rather than break from it, and 'trivializes' means treats as unimportant, which her careful tracing contradicts.",
          difficulty: "hard",
          why: ["Close, but \"chronicles\" only means records in order. It doesn't capture the break from the old view that \"however\" signals.", "\"Corroborates\" means confirms. Her study overturns the old view rather than confirming it.", null, "\"Trivializes\" means treats as unimportant. Tracing pamphlets and organizers takes the riots seriously."],
        },
      ],
      traps: [
        "Choosing a word that's a synonym for a different, more common meaning of the word rather than the meaning that fits this sentence.",
        "Choosing the answer that sounds most sophisticated rather than the one that's actually most logically precise.",
        "Choosing a word that points in the right direction but has the wrong strength or tone (for example, 'hostile' where the context only supports 'skeptical').",
        "Skipping the context clue (a contrast word like 'although' or 'rather than,' a colon that restates, or a cause-and-effect link) and choosing a word that fits the topic but not the logic the sentence sets up.",
      ],
    },
    {
      name: "Multiple-Meaning Word Trap",
      explanation:
        "This pattern tests words with more than one common meaning, where the SAT deliberately uses the less common one. If a choice looks 'too obvious' or 'too easy,' double-check whether the sentence actually needs its secondary, less-familiar meaning. This is worth watching for closely — it's why strong readers sometimes miss questions that look easy.",
      examples: [
        {
          q: "In under three minutes, without a single wasted word, she laid out a case that even opposing counsel privately called impressive. Her argument, while ______, ultimately failed to address the panel's central concern. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["sound", "flawed", "irrelevant", "confusing"],
          answer: 0,
          explain:
            "The context establishes the argument was brief and well-reasoned, not weak. 'Flawed,' 'irrelevant,' and 'confusing' would all describe a genuinely poor argument, contradicting the established context. 'Sound' (meaning logically valid and well-reasoned, not its more common everyday sense) fits precisely: the argument was logically solid but still didn't address the panel's specific concern.",
          difficulty: "easy",
          why: [null, "The context says the case was impressive even to opponents. \"Flawed\" contradicts that.", "The argument was impressive; \"irrelevant\" contradicts that setup. The problem was one missed concern, not relevance overall.", "\"Without a single wasted word\" and \"impressive\" rule out confusing."],
        },
        {
          q: "The critic ultimately recommended the film, but not before spending three paragraphs detailing its uneven pacing and underwritten supporting characters. The critic's review was surprisingly ______ for a film so widely praised elsewhere. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["glowing", "qualified", "dismissive", "brief"],
          answer: 1,
          explain:
            "'Glowing' and 'dismissive' describe reactions more extreme than what's described: recommending with real flaws noted. 'Brief' doesn't capture the sentence's contrast with the film's wide praise elsewhere. 'Qualified' most commonly means having the right credentials, a meaning that makes no sense next to 'review', but its secondary meaning, praise held back by reservations, fits precisely: the critic recommended the film while still noting real flaws.",
          difficulty: "medium",
          why: ["Three paragraphs on flaws isn't glowing praise. The review was mixed.", null, "The critic recommended the film, so the review wasn't dismissive.", "Three paragraphs on flaws alone suggests the review wasn't brief, and length isn't the contrast the sentence draws."],
        },
        {
          q: "Political opponents who disagreed with nearly everything else the senator stood for still privately admitted her closing argument was tightly constructed and genuinely persuasive. Even her harshest critics conceded that the senator's closing argument was ______. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["arresting", "controversial", "predictable", "lengthy"],
          answer: 0,
          explain:
            "The most familiar meaning of 'arresting' involves police taking someone into custody, obviously not applicable here, which makes it tempting to cross off entirely. That's exactly the trap: 'arresting' also means strikingly impressive, attention-grabbing, with no connection to law enforcement at all. 'Controversial,' 'predictable,' and 'lengthy' don't match critics conceding the argument's quality. Since even critics who disagreed with her still admitted the argument was persuasive and well-constructed, 'arresting' in this second sense fits precisely.",
          difficulty: "hard",
          why: [null, "The critics concede it was strong. \"Controversial\" is about disagreement, not quality.", "\"Predictable\" would be a criticism, but the critics are conceding the argument was impressive.", "Length isn't what the critics are conceding. They're admitting it was persuasive."],
        },
        {
          q: "Nothing in the passage suggests a committee's move was morally wrong, only strategic. The committee's decision to postpone the vote was widely seen as a ______ move, buying time until public opinion shifted. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["reckless", "politic", "accidental", "unanimous"],
          answer: 1,
          explain:
            "'Reckless' and 'accidental' both contradict a deliberate, strategic decision, and 'unanimous' describes how a vote was decided, not the quality of the move itself. 'Politic' looks like it just means 'related to politics' at first glance, especially in a sentence already about a committee vote, but used this way it actually has a distinct, less common meaning: shrewd, sensible, strategically wise — which fits 'buying time until public opinion shifted' precisely.",
          difficulty: "easy",
          why: ["The move was deliberate and strategic, which is the opposite of reckless.", null, "Postponing to buy time was on purpose, not an accident.", "\"Unanimous\" describes how a vote went, not what kind of move postponing was."],
        },
        {
          q: "This sentence describes exceptional sensory precision, not a specific food preference. The chef's ______ palate could distinguish a dish seasoned moments ago from one that had rested for ten minutes. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["discriminating", "biased", "simple", "cautious"],
          answer: 0,
          explain:
            "'Biased' imports an unfair, negative meaning that has nothing to do with tasting food, and 'simple' and 'cautious' both contradict the exceptional precision described. 'Discriminating' most commonly triggers today's association with unfair bias, but its classic, still-valid meaning (having refined judgment, able to make fine distinctions) exactly matches a palate that can tell moments-ago seasoning from ten-minutes-rested seasoning.",
          difficulty: "medium",
          why: [null, "\"Biased\" means unfair, which has nothing to do with tasting fine differences in food.", "A palate that detects ten minutes of resting is exceptional, not simple.", "\"Cautious\" doesn't describe an ability to taste fine differences."],
        },
      ],
      traps: [
        "Assuming a word's most familiar meaning applies, when the sentence is actually using a specialized or secondary definition.",
        "Overlooking context clues elsewhere in the sentence (or in surrounding sentences) that clarify which meaning is intended.",
      ],
    },
    {
      name: "Word Meaning As Used in the Text",
      explanation:
        "These questions quote a short text, often from an older novel, memoir, or letter, and ask, 'As used in the text, what does the word \"X\" most nearly mean?' The four choices are usually different senses of that same word, so every choice is a real meaning; only one works in this sentence. Method: cover the choices, reread the full sentence and the one around it, and put your own simple word in place of the tested one. Then swap each choice into the sentence and keep the one that makes it say the same thing as your paraphrase. Sometimes the answer is a less common sense (a 'fast' knot is secure, not quick), and sometimes it's the plain everyday meaning, with the unusual senses as the traps. So don't assume it's a trick either way; let the sentence decide.",
      examples: [
        {
          q: "The following text is adapted from a novel.\n\nMiss Hartwell had a keen eye for small faults. She could spot a crooked hem from across the parlor, and no pupil of hers ever formed a letter carelessly without hearing about it the next morning.\n\nAs used in the text, what does the word “keen” most nearly mean?",
          underline: "keen",
          choices: ["eager", "perceptive", "sharp-edged", "bitterly cold"],
          answer: 1,
          explain:
            "Cover the choices and put your own word in: Miss Hartwell had a ___ eye for small faults, since she can spot a crooked hem from across the room. Something like 'sharp-sighted' fits, which matches 'perceptive.' The other choices are real senses of 'keen' that fail the swap: an 'eager eye' says she wants something, not that she notices things; 'sharp-edged' describes a blade; and 'bitterly cold' describes a keen wind.",
          difficulty: "easy",
          why: ["\"Keen\" can mean eager, but an eager eye doesn't spot a crooked hem. The point is how well she notices.", null, "\"Sharp-edged\" is the sense for a blade. An eye isn't literally sharp-edged.", "\"Bitterly cold\" is the sense for a keen wind, not an eye."],
        },
        {
          q: "The following text is adapted from a memoir.\n\nMy grandfather never threw away a letter. He kept every one he received in a tin biscuit box beneath his bed, tied in bundles by year, and on winter evenings he would take out a bundle and read the letters through again.\n\nAs used in the text, what does the word “kept” most nearly mean?",
          underline: "kept",
          choices: ["continued", "obeyed", "supported", "stored"],
          answer: 3,
          explain:
            "Swap in your own word: he ___ every letter in a tin box beneath his bed. The plain, everyday meaning fits: he put the letters away and held on to them, so 'stored' is right. The other choices are real senses of 'keep' (to keep talking, to keep the rules, to keep a family), but none works with letters in a box. Don't reject the ordinary meaning just because it seems too easy.",
          difficulty: "easy",
          why: ["\"Continued\" is the sense in \"kept talking.\" He didn't continue the letters; he put them in a box.", "\"Obeyed\" is the sense in \"kept the rules.\" Letters in a box aren't being obeyed.", "\"Supported\" is the sense in \"kept a family.\" Here he's holding on to letters.", null],
        },
        {
          q: "The following text is adapted from a novel.\n\nThe parlor was close that afternoon. No one had opened a window since the rain began three days earlier, and the air smelled of coal smoke and damp wool. Within an hour Harriet's head had begun to ache, and she asked her aunt whether they might walk in the garden instead.\n\nAs used in the text, what does the word “close” most nearly mean?",
          underline: "close",
          choices: ["stuffy", "nearby", "intimate", "careful"],
          answer: 0,
          explain:
            "Predict from the clues: no window opened in three days, the air smells of smoke and damp wool, and Harriet's head aches. The room lacks fresh air, so 'stuffy' fits. 'Nearby' is the most familiar meaning of 'close,' but 'the parlor was nearby that afternoon' makes no sense with the details that follow. 'Intimate' (close friends) and 'careful' (close attention) are other real senses that fail when swapped in.",
          difficulty: "medium",
          why: [null, "That's the familiar meaning, but the details are all about stale air, not distance.", "\"Intimate\" is the sense in \"close friends.\" A room isn't intimate because its windows are shut.", "\"Careful\" is the sense in \"close attention.\" A room can't be careful."],
        },
        {
          q: "The following text is adapted from a biography of a nineteenth-century naturalist.\n\nAt fifty-two, having raised four children and buried a husband, Margaret Ashby took up the study of mosses. Within five years she had filled eleven notebooks with drawings, and collectors from three counties were sending her specimens they could not identify.\n\nAs used in the text, what does the phrase “took up” most nearly mean?",
          underline: "took up",
          choices: ["occupied", "lifted", "began", "shortened"],
          answer: 2,
          explain:
            "Swap in your own phrase: at fifty-two she ___ the study of mosses, and within five years she'd filled eleven notebooks. She started a new pursuit, so 'began' fits. 'Occupied' is the sense in 'took up space,' 'lifted' is the literal sense of picking something up, and 'shortened' is the sense in 'took up a hem.' Each is a real meaning of 'took up,' but none makes sense with 'the study of mosses.'",
          difficulty: "medium",
          why: ["\"Occupied\" is the sense in \"took up space.\" She didn't occupy a study; she started one.", "\"Lifted\" is the literal sense of picking something up. You can't lift a field of study.", null, "\"Shortened\" is the sense in \"took up a hem,\" which doesn't fit a study."],
        },
        {
          q: "The following text is adapted from an 1880s novel.\n\nTobias said very little at supper, and his cousin supposed he had not noticed the trouble she had taken to find him a position at the bank. But he was sensible of the favor, more than she knew, and before the month was out he had quietly repaid it by settling a debt she had never mentioned to anyone.\n\nAs used in the text, what does the word “sensible” most nearly mean?",
          underline: "sensible",
          choices: ["reasonable", "aware", "practical", "noticeable"],
          answer: 1,
          explain:
            "The modern meaning, 'reasonable,' is the trap. Read the contrast instead: his cousin 'supposed he had not noticed' her help, 'But he was ___ of the favor, more than she knew,' and he repaid it. The word must mean the opposite of 'had not noticed,' so 'aware' fits; 'sensible of' is an older way of saying conscious of. 'Reasonable' and 'practical' are today's meanings, and 'he was reasonable of the favor' doesn't even make sense. 'Noticeable' is another real sense (a sensible change is one you can perceive), but it describes the thing noticed, not the person noticing it.",
          difficulty: "hard",
          why: ["That's the modern meaning, but \"reasonable of the favor\" makes no sense. The contrast is with \"had not noticed.\"", null, "\"Practical\" is a modern sense of \"sensible\" that doesn't fit \"of the favor.\" The point is that he noticed.", "\"Noticeable\" describes something that can be perceived. Here Tobias is the one perceiving the favor."],
        },
      ],
      traps: [
        "Picking a word's most familiar meaning out of habit when the sentence is using a less common or older sense.",
        "Rejecting the plain, everyday meaning because the question 'must be a trick,' when the sentence actually calls for the ordinary sense.",
        "Picking a real meaning of the word that fits the passage's general topic but makes no sense when swapped into the actual sentence.",
      ],
    },
  ],
  tipsAndTricks: [
    "Always predict your own word before looking at the choices — this prevents being seduced by a choice that sounds smart but doesn't fit.",
    "If a word feels 'too obvious,' pause: the SAT often hides its hardest Words in Context questions behind simple-looking vocabulary using secondary meanings.",
    "Cross out any choice that would work in a different, unrelated sentence — the correct answer must fit this exact sentence's specific logic and tone, not just be a loose synonym.",
  ],
};

const LC_RW_TEXT_STRUCTURE: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Main Purpose of the Whole Text",
      explanation:
        "'Which choice best states the main purpose of the text?' is the most common Text Structure question, and it shows up on informational texts and literary ones (novels, poems, letters, plays) alike. It asks what the author is DOING across the whole text, not what the text is about (that's a main-idea question) and not the order its parts come in (that's an overall-structure question). After reading, sum up the whole text as a verb phrase: 'to explain how a device works,' 'to report a discovery and give an example,' 'to show how a character feels about his son.' Then match your phrase to the choices, checking both the verb and what follows it. For literary texts, the purpose is usually to portray a setting, a character's feelings, or a relationship, so ask what the details of the scene add up to. Wrong answers usually name the purpose of only one part of the text, use a verb that's too strong (argue or criticize when the text only describes), or name a goal the text never pursues.",
      examples: [
        {
          q: "In 1923, Harriet Vance, a clerk at a busy seed company in Omaha, grew frustrated that customers' handwritten orders were often misread, so that farmers received the wrong seeds weeks too late to replant. She began sketching a paper form with a box for each seed variety and a column for quantities. Within a year, the company had printed thousands of her forms, and misfilled orders fell sharply. Other mail-order businesses soon copied the design.\n\nWhich choice best states the main purpose of the text?",
          choices: ["To argue that Vance deserves more recognition than other inventors of her era.", "To describe the problems farmers faced when their seed orders arrived late.", "To describe how a clerk's frustration with a recurring problem led her to create a widely adopted order form.", "To explain how mail-order businesses printed and distributed forms in the 1920s."],
          answer: 2,
          explain:
            "Sum up the whole text as a verb phrase before looking at the choices: it tells the story of a problem (misread orders), the clerk's fix (a printed form), and what happened next (fewer errors, copied by others), so its purpose is to describe how an invention came about. The choice about farmers' late seeds names only the problem in the first sentence. Nothing in the text compares Vance with other inventors, so 'argue that she deserves more recognition' is both too strong and a claim the text never makes. And the text never explains printing or distribution methods; it only says the forms were printed. Only the choice about a clerk's frustration leading to a widely adopted form covers the whole text.",
          difficulty: "easy",
          why: ["The text never compares Vance with other inventors or argues for anything. It simply tells how the form came about.", "The late seeds are just the problem in the first sentence. The text goes on to the form and its success.", null, "The text never explains how forms were printed or distributed. That's a goal it doesn't pursue."],
        },
        {
          q: "The following text is adapted from a novel. Eleven-year-old Mira has just arrived at the coast for the first time.\n\nMira let go of her uncle's hand at the top of the dunes and simply stood there. The water went on and on until it met the sky, and she could not tell where one stopped and the other began. Each wave rose, curled white at its edge, and spread itself across the sand as if it had traveled a very long way just to arrive at her feet. She had seen pictures, of course. None of them had been this large, or this loud, or this alive.\n\nWhich choice best states the main purpose of the text?",
          choices: ["To convey Mira's amazement at seeing the ocean for the first time.", "To explain why Mira's family traveled to the coast.", "To suggest that Mira is afraid of the water and wants to go home.", "To describe the pictures of the ocean that Mira had seen before the trip."],
          answer: 0,
          explain:
            "Ask what the whole scene is doing. Mira stops still, the water seems endless, the waves seem to travel just to reach her, and the real ocean is 'this large, or this loud, or this alive.' Every detail builds her sense of wonder, so the purpose is to convey her amazement. The text never says why the family came, so explaining the trip is a goal it doesn't pursue. Nothing suggests fear: she lets go of her uncle's hand and stares, which is awe, not wanting to leave. The pictures come up in one sentence, only to show that the real ocean outdoes them.",
          difficulty: "easy",
          why: [null, "The text never says why the family came to the coast. It stays on what Mira sees and feels.", "Nothing shows fear. She stands and stares at something \"alive,\" which is wonder, not wanting to leave.", "The pictures appear in one sentence, only to show that the real ocean is bigger than any of them."],
        },
        {
          q: "For more than a century, naturalists assumed that desert tortoises dig burrows mainly to escape daytime heat. To test this, ecologist Rosa Iturbe tracked 60 tortoises and recorded when each one entered its burrow. On hot afternoons, most did retreat underground, as expected. But the tortoises also spent long stretches in their burrows on cool, overcast days, and those stretches matched the hours when coyotes were most active nearby. Iturbe concludes that avoiding predators may be as important a reason for burrowing as avoiding heat.\n\nWhich choice best states the main purpose of the text?",
          choices: ["To argue that naturalists were wrong to think tortoises burrow to escape heat.", "To describe the method Iturbe used to track the tortoises.", "To explain how coyotes locate tortoises hidden in desert burrows.", "To present a study that tested a long-held explanation for a behavior and found that explanation incomplete."],
          answer: 3,
          explain:
            "Summarize the whole arc as a verb phrase: the text presents an old assumption, describes a study that tested it, and reports that heat isn't the whole story. Its purpose is to present a study that found a long-held explanation incomplete. Saying the naturalists were simply 'wrong' is too strong: the tortoises did retreat on hot afternoons, so heat still matters, and Iturbe adds a second reason rather than replacing the first. The tracking method is only one sentence of the text. And the text never explains how coyotes find tortoises; coyotes appear only as a possible reason the tortoises hide.",
          difficulty: "medium",
          why: ["Too strong. The tortoises did retreat on hot afternoons, so heat still matters. Iturbe adds a reason; she doesn't reject the old one.", "The tracking method is one sentence. The text is about what the study found, not just how it was run.", "The text never explains how coyotes find tortoises. Coyotes appear only as a possible reason for burrowing.", null],
        },
        {
          q: "The following text is adapted from a letter written by a young woman who has recently moved to a distant city to work as a typist. She is writing to her mother.\n\nYou must not worry about the room; it is small, but the window faces east, and I wake with the sun on my pillow as I did at home. The office is noisy, and the first week my fingers ached so that I could hardly hold a fork, but Mrs. Dunmore says my pages are now the cleanest in the building. I have found a church with a good choir and a bakery that sells bread almost as good as yours. Please tell Father I am eating properly.\n\nWhich choice best states the main purpose of the text?",
          choices: ["To complain to her mother about the hardships of her new job.", "To reassure her mother that she is settling into her new life, despite some early difficulties.", "To describe the view from the window of her rented room.", "To persuade her mother to join her in the city."],
          answer: 1,
          explain:
            "Ask what the writer is doing across the whole letter. Nearly every sentence answers a worry: the room is small but sunny, her fingers ached but her work is now praised, she has found a church and good bread, and she is eating properly. That adds up to reassurance that she is settling in. She does mention hardships (the noise, her aching fingers), but each one is followed by something better, so 'complain' misreads her tone. The window is one detail, not the letter's point. And she never invites her mother to the city.",
          difficulty: "medium",
          why: ["She mentions hardships only to show she's gotten past them: aching fingers, then the cleanest pages in the building. That's reassurance, not complaint.", null, "The window is one detail in the first sentence. The whole letter is about how she's settling in.", "She never asks her mother to come to the city. She's easing her mother's worries from far away."],
        },
        {
          q: "The following text is adapted from a novel. For forty years, Aurelio has run a small shoe-repair shop; his son Teo has recently begun working there.\n\nAurelio watched from the back bench as Teo took the customer's boots, turned them once in his hands, and named the problem before the woman had finished describing it. It was exactly what Aurelio would have said. He felt the old pleasure of a job well judged, and then, close behind it, something he did not care to name. The woman thanked Teo and did not look toward the back of the shop at all. Aurelio picked up a heel he had already finished and began, slowly, to polish it again.\n\nWhich choice best states the main purpose of the text?",
          choices: ["To show that Aurelio resents his son and regrets bringing him into the shop.", "To describe the process of diagnosing and repairing a pair of boots.", "To portray Aurelio's mixed feelings as he watches his son take over the role he has long filled.", "To suggest that Teo is not yet as skilled at shoe repair as his father."],
          answer: 2,
          explain:
            "Track what the whole scene is doing. Teo diagnoses the boots exactly as Aurelio would have, and Aurelio feels 'the old pleasure,' which is pride. But 'close behind it' comes a feeling he won't name, the customer never glances his way, and he re-polishes a finished heel just to keep his hands busy: a quiet sense of being displaced. The purpose is to portray both feelings at once. 'Resents' and 'regrets' flatten this into pure bitterness and ignore the pleasure. The boots are only the occasion for the scene, not its subject. And the text says Teo judged the job exactly as his father would have, the opposite of being less skilled.",
          difficulty: "hard",
          why: ["Too strong and one-sided. Aurelio feels real pride in Teo too; \"resents\" and \"regrets\" ignore that.", "The boots are just the occasion. The scene is about how Aurelio feels while watching his son.", null, "The text says Teo named the problem exactly as Aurelio would have. It shows skill, not a lack of it."],
        },
      ],
      traps: [
        "Choosing the purpose of just one part of the text, such as the problem in the first sentence or a single detail, instead of what the whole text does.",
        "Choosing a verb that's too strong for the text, like 'argue,' 'criticize,' or 'warn,' when the author only describes, explains, or reassures.",
        "Choosing a purpose that fits the topic but that the text never actually pursues, such as explaining something it only mentions or making a comparison it never draws.",
        "In literary texts, flattening or misreading a character's feelings: picking pure anger or pure happiness when the scene shows mixed feelings, or taking a character's words at face value when the actions say otherwise.",
      ],
    },
    {
      name: "Function of a Sentence Within a Paragraph",
      explanation:
        "This pattern asks what JOB a sentence is doing — not what it means, but its purpose in the argument. Common jobs: introducing a claim, giving a counterexample, qualifying an earlier point, or transitioning between ideas. Ask yourself: 'what would break in the passage's logic if I deleted this sentence?' That's more useful than just restating what the sentence says.",
      examples: [
        {
          q: "Traffic engineers have increasingly championed narrow city streets as a straightforward way to improve pedestrian safety, since narrower lanes naturally slow drivers down. However, narrow streets without clear sightlines at intersections can actually increase collision risk. Many cities that adopted narrow-street policies in the 1990s have since added painted sightline zones at intersections to offset this risk. Which choice best states the function of the underlined sentence in the text as a whole?",
          underline: "However, narrow streets without clear sightlines at intersections can actually increase collision risk.",
          choices: [
            "It introduces a qualification that limits the scope of the main claim, rather than fully rejecting it.",
            "It completely reverses the passage's argument, showing narrow streets are always more dangerous.",
            "It provides a specific statistic supporting the main claim about safety.",
            "It introduces an entirely unrelated topic about traffic sightlines.",
          ],
          answer: 0,
          explain:
            "If this sentence were deleted, the passage would seem to claim narrow streets are unconditionally safer, with no nuance. Its function is to complicate or qualify the main claim, not contradict it entirely — it adds a condition (sightlines) under which the benefit doesn't hold. Describing it as a complete reversal overstates it as a full reversal, describing it as a supporting statistic misreads it as supporting rather than qualifying, and calling it an unrelated topic ignores that it's directly tied to the main claim.",
          difficulty: "easy",
          why: [null, "The sentence adds a condition (sightlines), not a full reversal. It never says narrow streets are always more dangerous.", "There's no statistic in the sentence, and it limits the claim rather than supporting it.", "Sightlines are tied directly to the safety claim. It's a qualification, not a new topic."],
        },
        {
          q: "When a mid-sized consulting firm shifted every employee to remote work in 2021, leadership expected a uniform boost in morale and productivity. Surveys the following year largely confirmed this: most employees reported shorter commutes and greater overall satisfaction. Not every employee benefited equally, however — those with young children at home often found the change added new stressors rather than removing old ones. The firm later introduced a stipend for co-working space specifically to address this gap. Which choice best states the function of the underlined sentence in the text as a whole?",
          underline: "Not every employee benefited equally, however — those with young children at home often found the change added new stressors rather than removing old ones.",
          choices: [
            "It argues that the entire remote-work policy was a mistake.",
            "It complicates an otherwise uniformly positive account by noting the change didn't benefit every employee equally.",
            "It provides statistical evidence proving remote work reduces overall productivity.",
            "It restates the passage's main claim that remote work benefited the company.",
          ],
          answer: 1,
          explain:
            "If deleted, the passage would read as if the switch benefited everyone the same way, with no exceptions. Its job is to complicate that uniform picture by pointing out one specific group the change didn't help, not to argue the whole policy was a mistake, which the 'entire policy was a mistake' reading overstates. Claiming it proves remote work reduces productivity introduces an unrelated claim about productivity, and claiming it restates the main point misses that this sentence adds nuance rather than restating it.",
          difficulty: "medium",
          why: ["The sentence notes one group didn't benefit equally. It never calls the whole policy a mistake.", null, "The sentence is about stress for parents, not productivity, and it contains no statistics.", "It doesn't restate the main point. \"However\" signals it adds an exception."],
        },
        {
          q: "A new bus rapid transit line connecting downtown to the eastern suburbs began carrying passengers last spring, cutting the average commute by nearly twenty minutes. The city funded the project using a combination of state grants and a small increase in the local sales tax. Ridership has already exceeded initial projections, prompting officials to consider extending the line further east. Which choice best states the function of the underlined sentence in the text as a whole?",
          underline: "The city funded the project using a combination of state grants and a small increase in the local sales tax.",
          choices: [
            "It challenges the passage's earlier claim about the project's benefits.",
            "It introduces a counterexample to the project's success.",
            "It explains how the project was financed, supplying a supporting detail about its funding sources.",
            "It compares the project's cost to that of a similar project in another city.",
          ],
          answer: 2,
          explain:
            "If deleted, the passage would describe the transit line without explaining how it was paid for. Its job is simply to supply funding-source information, a supporting detail, not a qualification or counterexample, as reading it as a challenge or a counterexample both wrongly suggest. Comparing the project's cost to another city's invents a comparison the sentence never makes. Only 'it explains how the project was financed, supplying a supporting detail about its funding sources' plainly describes this detail-supplying function.",
          difficulty: "easy",
          why: ["The funding sentence doesn't question the project's benefits. It just says how it was paid for.", "How a project was funded isn't a counterexample to its success.", null, "No other city or project is mentioned, so there's no comparison."],
        },
        {
          q: "A four-day work week piloted at a mid-sized software company was initially met with skepticism from managers who worried that fewer hours would mean missed deadlines. A year into the pilot, however, project completion rates held steady and employee turnover fell by half. Even the initiative's most vocal early critics now describe the schedule as a net positive for the company. Company leadership has since made the policy permanent. Which choice best states the function of the underlined sentence in the text as a whole?",
          underline: "Even the initiative's most vocal early critics now describe the schedule as a net positive for the company.",
          choices: [
            "It introduces a new argument unrelated to employee morale.",
            "It strengthens the argument by showing that even initial skeptics now agree, which is stronger evidence than simply restating that morale improved.",
            "It qualifies the passage's claim by pointing out that some employees still oppose the schedule.",
            "It simply repeats the claim made earlier that morale improved company-wide.",
          ],
          answer: 1,
          explain:
            "If deleted, the passage would argue morale improved but wouldn't address that some people opposed the change initially. Its function is to strengthen the argument by showing that even skeptics changed their minds, stronger support than simply repeating 'morale improved,' which describing it as a repeated claim wrongly reduces it to. Reading it as pointing to ongoing opposition misreads the sentence, when it actually reports conversion, and calling it an unrelated new argument ignores that it's directly on-topic.",
          difficulty: "medium",
          why: ["It's directly about how people view the schedule, not a new, unrelated argument.", null, "The sentence says critics changed their minds. It doesn't say anyone still opposes the schedule.", "It adds something new: the critics themselves now agree. That's stronger than repeating the earlier point."],
        },
        {
          q: "Certain species of moth are known to locate distant mates not through vision but through scent, detecting pheromones carried on the wind from more than a mile away. In laboratory conditions with the moths' eyes temporarily covered, mate-location success rates remained statistically unchanged. Researchers now suspect that vision plays, at most, a minor supporting role once a moth has already closed most of the distance to a potential mate. Which choice best states the function of the underlined sentence in the text as a whole?",
          underline: "In laboratory conditions with the moths' eyes temporarily covered, mate-location success rates remained statistically unchanged.",
          choices: [
            "It provides direct experimental evidence supporting the main claim, by showing mate-location success is unaffected when vision is removed.",
            "It introduces a complication that weakens the passage's central claim about scent.",
            "It presents a counterexample showing sight is sometimes more important than scent.",
            "It describes a limitation of the laboratory methodology used in the study.",
          ],
          answer: 0,
          explain:
            "If deleted, the claim (scent, not sight) would remain an assertion without direct experimental support. This sentence's function is not to complicate or qualify the claim, which reading it as 'a complication that weakens the claim' wrongly suggests — it provides the controlled experimental evidence that directly confirms it, by showing performance is unaffected when vision is removed. Reading it as showing sight is sometimes more important misreads the finding entirely, and describing it as a methodology critique invents one the sentence doesn't make. It's actually the paragraph's strongest piece of direct support, even though the setup (covering eyes) might read as a complication at first.",
          difficulty: "hard",
          why: [null, "The sentence supports the scent claim; success didn't change without sight. It doesn't weaken anything.", "Covering the eyes had no effect, which shows sight isn't the key. This reverses the finding.", "The sentence reports a result. It doesn't criticize how the lab study was run."],
        },
      ],
      traps: [
        "Describing what the sentence says rather than what job it's doing in the passage's structure.",
        "Confusing a qualifying/complicating sentence with a full contradiction of the main argument.",
        "Overstating what a sentence does, such as calling supporting evidence proof or calling a qualification a refutation.",
      ],
    },
    {
      name: "Function of an Entire Paragraph",
      explanation:
        "This is the same skill applied to a whole paragraph instead of one sentence: what role does this paragraph play — giving context, presenting a counterargument, offering evidence, or drawing a conclusion? Use the same technique: look at what the paragraph does relative to the ones around it. Signal words like 'however,' 'for example,' and 'therefore' are strong clues to its job.",
      examples: [
        {
          q: "Long before she became known for her writing, the subject grew up in a small mill town where unmarried women were expected to work only until marriage, then leave paid employment entirely.\n\nAgainst this backdrop, her decision at twenty-three to turn down a marriage proposal and move to the city alone to pursue a writing career was a far more radical break than it might appear today.\n\nWhich choice best states the function of the first paragraph relative to the passage as a whole?",
          choices: [
            "It provides context that helps the reader understand the constraints shaping the subject's subsequent choices.",
            "It presents a counterargument to the biography's main thesis.",
            "It summarizes the entire biography's conclusion in advance.",
            "It criticizes the era's social norms as unjust.",
          ],
          answer: 0,
          explain:
            "Why would the author pause the personal narrative to describe social norms? This is a common structural move — providing context that helps explain constraints or pressures shaping the subject's later choices. Describing it as a counterargument, an advance conclusion, or a criticism of the era each invents a function the paragraph doesn't perform. Only 'it provides context that helps the reader understand the constraints shaping the subject's subsequent choices' correctly names this context-providing, explanatory role.",
          difficulty: "easy",
          why: [null, "The paragraph sets up her background. It doesn't argue against the biography's thesis.", "It describes her hometown's expectations, not the biography's conclusion.", "It describes the norms without calling them unjust. Its job is context, not criticism."],
        },
        {
          q: "A particular titanium alloy achieves its unusual strength-to-weight ratio through a manufacturing process that cools the metal in controlled stages, preventing the brittle crystal structures that form when titanium cools too quickly.\n\nThat same alloy made possible the record-setting span of the Cedar Point Bridge, whose designers could not have achieved its slender central arch with conventional steel.\n\nWhich choice best states the function of the first paragraph relative to the passage as a whole?",
          choices: [
            "It argues that the alloy's manufacturing process was flawed.",
            "It provides the technical background needed to understand and trust the design claims made about the bridge in the paragraph that follows.",
            "It compares the alloy to a competing material used in other bridges.",
            "It summarizes criticism the bridge's design later received.",
          ],
          answer: 1,
          explain:
            "Why would the author spend an entire paragraph on manufacturing detail before returning to the bridge itself? This is a common structural move — laying groundwork that makes the later, more impressive claims about the bridge's design easier to understand and trust. Describing it as arguing the process was flawed, comparing it to a competitor, or summarizing criticism of the bridge each invents content the paragraph doesn't contain. Only 'it provides the technical background needed to understand and trust the design claims made about the bridge' correctly names this groundwork-laying role.",
          difficulty: "medium",
          why: ["The paragraph explains the process that makes the alloy strong. It doesn't say the process was flawed.", null, "No competing material is described in the first paragraph.", "Neither paragraph mentions any criticism of the bridge."],
        },
        {
          q: "Many people assume a lightning rod works by attracting a strike to itself and drawing it away from a building, like a decoy.\n\nIn reality, a lightning rod works by providing a low-resistance path to the ground, so that if a strike does occur nearby, the current passes safely through the rod rather than through the building's structure.\n\nWhich choice best states the function of the first paragraph relative to the passage as a whole?",
          choices: [
            "It presents a common misconception, setting up a contrast with the accurate explanation that follows.",
            "It provides the historical origin of the lightning rod's invention.",
            "It argues that lightning rods are generally ineffective.",
            "It describes a rare exception to how lightning rods normally function.",
          ],
          answer: 0,
          explain:
            "Why would an author open with a misconception before explaining the truth? This is a common structural move — clearing away a wrong assumption first so the correct explanation that follows is easier to appreciate and contrast against. Describing it as giving the rod's invention history, arguing rods are ineffective, or describing a rare exception each invents content the paragraph doesn't contain. Only 'it presents a common misconception, setting up a contrast with the accurate explanation that follows' correctly describes this 'clear the misconception, then explain' role.",
          difficulty: "easy",
          why: [null, "The paragraph describes a common belief, not the history of the lightning rod's invention.", "The passage says rods do work, just not as a decoy. It never argues they're ineffective.", "The paragraph describes a common misconception, not an unusual exception."],
        },
        {
          q: "Many painters and composers now considered canonical spent the bulk of their careers in financial precarity, dependent on patrons, side jobs, or family support to keep working at all.\n\nOne such painter, Odille Marchetti, continued producing new canvases for nearly a decade without a single sale, turning down a steady teaching position that would have meant giving up painting almost entirely.\n\nWhich choice best states the function of the second paragraph relative to the passage as a whole?",
          choices: [
            "It contradicts the first paragraph's claim by describing an artist who succeeded quickly.",
            "It narrows the essay's general claim into one specific, detailed case, making the broader pattern more concrete.",
            "It shifts the essay's focus entirely away from financial struggle.",
            "It provides statistical data about how many artists face financial struggle.",
          ],
          answer: 1,
          explain:
            "Why zoom in on one specific case after a general survey? This is a common structural move — narrowing from a general pattern to one detailed, illustrative case, which makes the broader claim more concrete and persuasive. Claiming it contradicts the first paragraph misreads the example as contradicting the premise, and claiming it shifts focus away from financial struggle or provides statistical data each invents a shift or data the paragraph doesn't contain. Only 'it narrows the essay's general claim into one specific, detailed case, making the broader pattern more concrete' correctly names this narrowing-to-a-case function.",
          difficulty: "medium",
          why: ["Marchetti struggled for a decade without a sale. She illustrates the first paragraph, not a quick success.", null, "Her decade without a sale is financial struggle. The focus doesn't shift away from it.", "The paragraph tells one artist's story. It gives no statistics."],
        },
        {
          q: "A widely used classroom teaching method, adopted by thousands of schools over the past two decades, showed no measurable benefit to student test scores in a large randomized study published last year.\n\nThe study's authors were careful to note three possible limitations of their design — a short study window, an unusually experienced pool of teachers, and a test that may not have captured the skills the method targets — without concluding that any of these actually explains the result.\n\nWhich choice best states the function of the second paragraph relative to the passage as a whole?",
          choices: [
            "It definitively refutes the study's surprising finding.",
            "It raises possible limitations of the study without concluding any of them actually invalidate the finding.",
            "It confirms that the teaching method is indeed ineffective.",
            "It introduces a second, unrelated study with contradictory results.",
          ],
          answer: 1,
          explain:
            "If deleted, the surprising finding would stand unchallenged and unexamined. The second paragraph's function isn't to disprove the finding — it explicitly doesn't endorse any of the three possible flaws as the real explanation. Its function is to introduce reasonable doubt while leaving the question open. Claiming it definitively refutes the finding overstates this as a full refutation, which a non-committal list of possible flaws doesn't accomplish, and claiming it confirms the method is ineffective or introduces a second study each invent conclusions or evidence not present. Only 'it raises possible limitations of the study without concluding any of them actually invalidate the finding' correctly captures this cautious, doubt-raising role.",
          difficulty: "hard",
          why: ["The authors list possible limitations without saying any of them explains the result. That's not a refutation.", null, "The paragraph raises doubts about the study. It doesn't confirm the method is ineffective.", "No second study appears. The paragraph discusses the same study's limitations."],
        },
      ],
      traps: [
        "Treating a context-setting paragraph as if it were the passage's main argument.",
        "Missing signal words (however, similarly, for example) at the start of a paragraph that reveal its structural role.",
      ],
    },
    {
      name: "Describing the Structure of an Entire Passage",
      explanation:
        "These questions ask how a whole passage is organized from start to finish (its overall shape), not the role of one sentence or paragraph. Common shapes: a claim followed by an example; a common belief followed by a challenge to it; a problem followed by a solution; a question followed by an answer; or a small story that leads into a bigger point. Before reading the choices, sketch the shape yourself in one short phrase, like 'states a claim, then gives an example.' Then find the choice describing that same sequence of moves in the same order, rather than one that simply mentions the right topic.",
      examples: [
        {
          q: "Most migratory songbirds that breed in the Arctic follow strikingly similar north-south routes each year, funneling through the same narrow corridors as their ancestors. The Arctic tern, however, breaks from this pattern entirely: rather than following a direct corridor, its migration traces a wide, looping path that carries it across both the Atlantic and Pacific basins in a single year. Ornithologists still debate whether this looping route evolved to exploit favorable wind patterns or predates the more direct routes used by other species. Which choice best describes the passage's overall structure?",
          choices: [
            "It describes a general migratory pattern, then presents one species as a specific exception to that pattern.",
            "It presents a hypothesis about bird migration, then a series of experiments testing it.",
            "It describes two competing theories about why birds migrate.",
            "It narrates a single bird's journey from its own point of view.",
          ],
          answer: 0,
          explain:
            "Sketch the shape: general pattern first, then one specific case that stands out from it. The case isn't just an example of the general pattern — it's presented as an exception to it, a more specific relationship than plain illustration. Describing it as a hypothesis-then-experiments structure, competing theories, or a single bird's first-person narration each describes a structure the passage doesn't use. Only 'it describes a general migratory pattern, then presents one species as a specific exception to that pattern' captures 'general pattern, then a specific exception to it' precisely.",
          difficulty: "easy",
          why: [null, "There's no hypothesis tested by experiments. It's a general pattern followed by an exception.", "The debate at the end is about the tern's route, not two theories of why birds migrate.", "It's written about birds in general and the tern, not from one bird's point of view."],
        },
        {
          q: "For nearly a century, the collapse of the Ashgrove Bridge was attributed to a single overloaded delivery truck that crossed it on the day it fell. Engineering records rediscovered in a municipal archive last year, however, suggest a different, previously overlooked cause: corrosion in a support cable that had gone unreported for years. The records don't prove the truck played no role, but they complicate a story that had gone unquestioned for generations. Which choice best describes the passage's overall structure?",
          choices: [
            "It presents the long-accepted explanation for an event, then introduces newly discovered evidence that complicates that explanation.",
            "It proves the long-accepted explanation was entirely wrong using the new records.",
            "It describes two equally accepted explanations without favoring either.",
            "It opens with the newly discovered records, then moves to the older explanation.",
          ],
          answer: 0,
          explain:
            "Sketch the shape: an established, conventional account comes first, then new evidence complicates it. The passage doesn't say the old account was definitely wrong, only that the new records 'suggest' a different cause, so claiming the records prove the old explanation entirely wrong overstates this as a full refutation. Claiming both explanations are presented as equally accepted misreads them as equally weighted, and claiming the passage opens with the new records reverses the actual order. Only 'it presents the long-accepted explanation for an event, then introduces newly discovered evidence that complicates that explanation' matches both the sequence and the passage's cautious wording.",
          difficulty: "easy",
          why: [null, "The records \"suggest\" another cause and \"don't prove the truck played no role.\" Nothing is proven entirely wrong.", "One explanation was long accepted and the other is new. They aren't presented as equally accepted.", "The passage opens with the old explanation and then brings in the records. This reverses the order."],
        },
        {
          q: "A particular coral species off the coast of a Pacific island survives water temperatures that should, by every existing model, kill it outright. Curious researchers spent three years running a series of laboratory experiments, gradually eliminating possible explanations (first unusually thick tissue, then unusual feeding behavior), before finally isolating a heat-resistant protein produced by algae living inside the coral's own cells. That protein, researchers now believe, is the coral's actual defense. Which choice best describes the passage's overall structure?",
          choices: [
            "It presents a puzzling phenomenon, then narrates the experimental process that eventually explains it.",
            "It describes an experiment, then a puzzling phenomenon the experiment failed to explain.",
            "It compares the coral species to a second, unrelated species with similar heat resistance.",
            "It presents a solution first, then explains the problem it was designed to solve.",
          ],
          answer: 0,
          explain:
            "Sketch the shape: the passage opens with a puzzle or unexplained phenomenon, then works through an investigation that resolves it. This is a question-then-answer structure, delivered through a narrated process (a series of experiments) rather than a single stated hypothesis. Describing it as an experiment followed by an unexplained puzzle, or a solution followed by the problem it solves, both reverse the actual order, and comparing the coral to a second species invents a comparison never made. Only 'it presents a puzzling phenomenon, then narrates the experimental process that eventually explains it' mentions both the initial puzzle and the investigative process that resolves it.",
          difficulty: "medium",
          why: [null, "The puzzle comes first and the experiments explain it. This reverses the order and says they failed.", "No second species is mentioned. The passage stays on one coral.", "The puzzle comes first; the protein, the solution, comes last. This reverses the order."],
        },
        {
          q: "A small coastal town's water supply has been shrinking for over a decade as a nearby aquifer runs dry faster than it can recharge. City planners have proposed a desalination plant as a fix, capable of processing enough seawater to meet the town's needs well into the next century. That capacity comes at a cost, however: the plant's energy demands are high enough that the town would need to nearly double its current power generation, a drawback planners have yet to fully resolve. Which choice best describes the passage's overall structure?",
          choices: [
            "It describes a problem, proposes a solution to it, and then acknowledges a significant drawback of that proposed solution.",
            "It describes a problem and its solution, ending on an entirely positive note.",
            "It presents two competing solutions to the same problem.",
            "It describes a solution first, then reveals the problem it was meant to address.",
          ],
          answer: 0,
          explain:
            "This passage has three moves, not two: a problem, a proposed solution, and then a complication that qualifies the solution. Describing it as ending on an entirely positive note is incomplete — it leaves out the passage's actual ending, which raises a real drawback rather than closing on an unqualified fix. Claiming it presents two competing solutions invents a second solution never described, and claiming it opens with the solution reverses the order. Only 'it describes a problem, proposes a solution to it, and then acknowledges a significant drawback of that proposed solution' captures all three moves in order.",
          difficulty: "medium",
          why: [null, "The passage ends on a drawback: the plant would nearly double power needs. It doesn't end entirely positive.", "Only one solution is proposed: the desalination plant.", "The problem (the shrinking aquifer) comes first, then the plant. This reverses the order."],
        },
        {
          q: "At a regional tournament three years ago, a relatively unranked chess player won the championship match using an opening move so unconventional that commentators initially assumed it was a mistake. That win turned out to illustrate a broader principle: unconventional strategies often succeed not because they're objectively stronger, but because opponents haven't prepared a response to them. The player's opponent later admitted, in a post-match interview, that he had never once encountered that opening in years of studying the game. Which choice best describes the passage's overall structure?",
          choices: [
            "It opens with a specific anecdote, generalizes from it, and then returns to that same anecdote with an additional detail that reinforces the generalization.",
            "It opens with a general claim, then narrows to a single specific example that illustrates it.",
            "It presents two unrelated anecdotes about different chess players.",
            "It opens with a specific anecdote and generalizes from it, without returning to the anecdote again.",
          ],
          answer: 0,
          explain:
            "Sketch the shape carefully — this passage doesn't just move from specific to general; it returns to the opening anecdote at the end, adding a new detail that reinforces the general point. Describing it as opening with the anecdote and generalizing without returning describes only part of the structure, missing that final return to the anecdote, since the passage's structure is closer to a loop than a straight line. Claiming it opens with a general claim reverses the actual order, and claiming it presents two unrelated anecdotes invents a second one. Only 'it opens with a specific anecdote, generalizes from it, and then returns to that same anecdote with an additional detail that reinforces the generalization' captures all three moves: the anecdote, the generalization it leads to, and the passage's return to that anecdote with a reinforcing detail.",
          difficulty: "hard",
          why: [null, "It opens with the specific match, not a general claim. This reverses the order.", "Both parts are about the same match and the same player. There's only one anecdote.", "The passage does return to the anecdote at the end, with the opponent's admission. This misses that last move."],
        },
      ],
      traps: [
        "Choosing an answer that correctly names the passage's topic but gets the order of its structural moves wrong (for example, 'example then claim' when the passage actually goes claim then example).",
        "Choosing an answer that only accounts for part of the passage's structure (often missing a final pivot, complication, or return to an earlier point), rather than describing the whole arc.",
        "Overstating how strongly the passage commits to a position (treating 'suggests a different cause' as if it said 'proves the old account wrong'), which usually rules out an otherwise well-shaped answer choice.",
      ],
    },
  ],
  tipsAndTricks: [
    "Ask 'what would break in the passage's logic if this sentence/paragraph were deleted?' — this reveals its true function faster than reading for content alone.",
    "Signal words are free information: 'however' signals a qualification or contrast, 'for example' signals supporting evidence, 'therefore' signals a conclusion.",
    "Function questions are about role, not content — if your answer restates what the sentence says rather than what job it does, you've likely picked a trap.",
  ],
};

const LC_RW_CROSS_TEXT: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Finding Common Ground Between Disagreeing Authors",
      explanation:
        "You're given two passages that reach different conclusions, and asked what both authors would still agree on. Key insight: authors who disagree on a conclusion often still share the same underlying facts — they just interpret them differently. Technique: separate each passage's facts (what both would accept) from its conclusion (what only one author believes). Then look for overlap in the facts.",
      examples: [
        {
          q: "Passage 1: Social media platforms have given ordinary citizens direct channels to organize, mobilize, and participate in public debate in ways that were previously unavailable to most people, fundamentally increasing civic engagement. \n\nPassage 2: Social media platforms have changed how people interact so significantly that many users substitute brief online exchanges for the sustained, in-person relationships that once anchored community life, fostering isolation rather than connection.\n\nBased on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "Social media has significantly changed how people interact with one another.",
            "Social media increases civic engagement more than it fosters isolation.",
            "Social media should be regulated more strictly by governments.",
            "In-person relationships are becoming entirely obsolete.",
          ],
          answer: 0,
          explain:
            "Both authors are discussing the same underlying phenomenon: social media has changed how people interact and participate in public life. Their conclusions differ (engagement versus isolation), but the shared premise, that social media has significantly changed interaction patterns, is something both would accept, since it's the foundation their opposing arguments are built on. Claiming social media increases engagement more than isolation just restates one author's conclusion, and claims about government regulation or in-person relationships becoming obsolete are claims neither passage actually makes.",
          difficulty: "easy",
          why: [null, "That's Passage 1's side of the debate. Passage 2 argues the opposite, so both authors wouldn't agree.", "Neither passage mentions government regulation.", "Passage 2 says people substitute online exchanges for in-person ones, not that in-person relationships are gone. Neither says \"entirely obsolete.\""],
        },
        {
          q: "Passage 1: Standardized tests remain the most consistent, objective tool available for comparing applicants from vastly different schools and backgrounds, and scores on these tests should carry significant weight in college admissions decisions. \n\nPassage 2: Standardized test scores consistently differ across students from different socioeconomic backgrounds, not because of differences in underlying achievement, but because wealthier students have far greater access to test preparation resources; these tests should therefore be minimized in admissions decisions.\n\nBased on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "Test scores vary across students from different backgrounds.",
            "Standardized tests should be eliminated from the admissions process entirely.",
            "Access to test preparation resources has no effect on student performance.",
            "Standardized tests are the single best predictor of college success.",
          ],
          answer: 0,
          explain:
            "Both authors are working from the same observable fact: scores on these tests differ across students from different backgrounds. Their conclusions differ sharply (one trusts the test, one distrusts it), but they disagree about why scores vary, not whether they vary. Claiming tests should be eliminated, or that they're the single best predictor of success, each state only one author's conclusion, and claiming prep access has no effect directly contradicts Passage 2. Only 'test scores vary across students from different backgrounds' is the underlying pattern both authors would accept.",
          difficulty: "medium",
          why: [null, "That's closer to Passage 2's view, and even Passage 2 says \"minimized,\" not eliminated. Passage 1 disagrees.", "Passage 2's whole argument is that prep access affects scores. This contradicts it.", "Passage 1 calls tests consistent and objective, not the single best predictor of college success. Passage 2 wouldn't agree either."],
        },
        {
          q: "Passage 1: Clinical trials of a popular diet trend consistently show participants losing significant weight within the first eight weeks, making it an effective option for people seeking rapid short-term results. \n\nPassage 2: Follow-up studies of the same diet trend show that the vast majority of participants who lose weight in the first eight weeks regain it within a year, since the diet's restrictive rules are too difficult to maintain as a long-term lifestyle.\n\nBased on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "The diet produces noticeable results within the first eight weeks.",
            "The diet is not effective at producing any weight loss.",
            "The diet should be recommended as a permanent lifestyle change.",
            "Most participants find the diet easy to follow long-term.",
          ],
          answer: 0,
          explain:
            "Both authors are discussing the same underlying phenomenon: the diet produces some effect in the short term. Their conclusions differ (effective versus unsustainable), but the shared premise, that the diet does produce noticeable short-term change, is something both would likely accept, since Passage 2's critique is about long-term sustainability, not about whether short-term effects occur at all. B, C, and D each contradict what one or both passages actually say.",
          difficulty: "easy",
          why: [null, "Passage 1 says the diet works in the short term, and Passage 2 agrees people lose weight at first. This contradicts both.", "Passage 2 says the diet is too hard to keep up long-term, so it wouldn't recommend it as permanent.", "Passage 2 says the rules are too difficult to maintain long-term. This contradicts it."],
        },
        {
          q: "Passage 1: A city's new nighttime noise ordinance has measurably reduced late-night disturbances, and residents report sleeping better and feeling calmer in their own neighborhoods as a direct result. \n\nPassage 2: The same noise ordinance has cut deeply into revenue for small businesses that depend on customers arriving after 9 p.m., since those businesses can no longer legally operate with any amplified sound during peak evening hours.\n\nBased on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "The ordinance measurably reduced nighttime activity and noise.",
            "The ordinance has been an unambiguous success for the city.",
            "Small businesses were not affected by the ordinance in any way.",
            "The ordinance should be repealed as soon as possible.",
          ],
          answer: 0,
          explain:
            "Both authors discuss the same underlying fact: the ordinance changed nighttime activity patterns in the city. Their conclusions differ (benefit to residents versus burden on businesses), but the shared premise, that the ordinance measurably reduced nighttime activity and noise, is something both would accept, since it's the shared foundation each side interprets differently. Claiming it's been an unambiguous success, or that it should be repealed immediately, each state only one side's evaluation, and claiming businesses weren't affected contradicts Passage 2 directly.",
          difficulty: "medium",
          why: [null, "Passage 2 describes real harm to businesses, so it wouldn't call the ordinance an unambiguous success.", "Passage 2 is entirely about businesses being affected. This contradicts it.", "That might fit Passage 2's concerns, but neither author calls for repeal, and Passage 1 clearly supports the ordinance."],
        },
        {
          q: "Passage 1 (a historian): An ancient trade route's gradual decline over roughly a century coincided closely with a major shift in regional political power, as a newly dominant empire redirected trade through routes it could tax and control more directly. \n\nPassage 2 (an archaeologist): Sediment core samples show the same region's climate became significantly drier over the same century-long period, and the trade route's key water sources, on which caravans depended, appear to have dried up gradually before the route was finally abandoned.\n\nBased on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "The trade route's decline occurred gradually over an extended period.",
            "The trade route was of little economic importance to the region.",
            "Political power shifts were the sole cause of the route's decline.",
            "Climate change was the sole cause of the route's decline.",
          ],
          answer: 0,
          explain:
            "A tempting but too-generic shared-ground answer might claim the route was economically important — probably true, but it's assumed background, not the actual point either author argues about. The more precise shared ground is that both authors agree the decline occurred gradually over an extended period, since each proposes a different explanation (political vs. environmental) for that same observed pattern. Claiming political shifts or claiming climate change were the sole cause of the decline each state only one author's specific causal claim.",
          difficulty: "hard",
          why: [null, "Both authors treat the route as important enough to explain its decline. Neither says it had little value.", "That's only Passage 1's explanation. The archaeologist points to climate instead.", "That's only Passage 2's explanation. The historian points to politics instead."],
        },
      ],
      traps: [
        "Picking an answer that reflects only one author's conclusion, mistaking it for common ground.",
        "Picking an overly generic answer ('technology exists') that's too vague to reflect the specific shared premise.",
      ],
    },
    {
      name: "Predicting One Author's Response to the Other's Claim",
      explanation:
        "This pattern asks how one author would likely respond to a specific claim made in the OTHER passage. You have to apply that author's reasoning and values to a new claim rather than repeat their original argument. Find the core value driving each author's argument (for example, 'depth of connection' for an author focused on isolation). Then predict how that same value would react to the new claim.",
      examples: [
        {
          q: "Passage 1: Online communities built around shared interests give people meaningful, sustained connection with others who understand them, and for many users, these communities have effectively replaced the real-world social circles they struggled to find locally. \n\nPassage 2: Even the most active online community exchanges tend to be brief and text-based, lacking the shared physical presence, spontaneous conversation, and accumulated small moments that make in-person relationships feel deeply substantial over time.\n\nHow would the author of Passage 2 most likely respond to Passage 1's claim that online communities effectively replace real-world ones?",
          choices: [
            "By arguing that online interaction lacks the depth of in-person connection, regardless of how active it appears.",
            "By fully agreeing that online communities are an adequate substitute for in-person relationships.",
            "By ignoring the claim as irrelevant to their argument about isolation.",
            "By arguing that online communities should be banned for young people.",
          ],
          answer: 0,
          explain:
            "Passage 2's core concern is that online interaction lacks the depth of real connection. Applying that same concern to the new claim, an author worried about depth of connection would most likely argue that online communities, however active, don't fully replace the depth of in-person relationships. Fully agreeing that online communities are an adequate substitute would directly contradict their entire stated position, ignoring the claim as irrelevant misreads it as irrelevant when it's central to their argument, and arguing communities should be banned introduces a policy position never suggested.",
          difficulty: "easy",
          why: [null, "Passage 2 argues online exchanges lack depth, so full agreement would contradict its whole point.", "The claim that online communities replace real ones is exactly what Passage 2 disputes. It's central, not irrelevant.", "Passage 2 never suggests banning anything. It's about the depth of connection, not policy."],
        },
        {
          q: "Passage 1: Standardized tests remain the most consistent, objective tool available for comparing applicants from vastly different schools and backgrounds, and scores on these tests should carry significant weight in college admissions decisions. \n\nPassage 2: Some highly capable students perform poorly on standardized tests specifically because of test anxiety, a response unrelated to their actual academic ability, which means test scores can misrepresent exactly the students they are meant to accurately measure.\n\nHow would the author of Passage 1 most likely respond to Passage 2's claim about test anxiety?",
          choices: [
            "By arguing that some variation in any single measurement is expected, but this doesn't undermine the test's overall usefulness.",
            "By conceding that the test should be dropped from admissions decisions entirely.",
            "By arguing that test anxiety does not exist and is not a real phenomenon.",
            "By agreeing that test scores frequently misrepresent students' true ability.",
          ],
          answer: 0,
          explain:
            "Passage 1's core concern is that test scores are a reliable, trustworthy measure of achievement and deserve real weight in decisions. Applying that concern to the new claim, an author committed to defending the test's reliability would most likely argue that some variation in any single measurement is expected, but that this doesn't undermine the test's overall usefulness. Conceding the test should be dropped entirely, or agreeing scores frequently misrepresent ability, would both concede the test is fundamentally flawed, directly contradicting Passage 1's stated position, and denying test anxiety exists denies a real phenomenon rather than reframing its significance.",
          difficulty: "medium",
          why: [null, "Passage 1 argues tests deserve significant weight. Dropping them would abandon its own position.", "Denying test anxiety exists would be an extreme response, and Passage 1 has no reason to deny it; it would reframe its importance.", "Agreeing scores often misrepresent ability would undercut Passage 1's claim that tests are reliable."],
        },
        {
          q: "Passage 1: A city's new nighttime noise ordinance has measurably reduced late-night disturbances, and residents report sleeping better and feeling calmer in their own neighborhoods as a direct result. \n\nPassage 2: The same noise ordinance has cut deeply into revenue for small businesses that depend on customers arriving after 9 p.m., since those businesses can no longer legally operate with any amplified sound during peak evening hours.\n\nHow would the author of Passage 1 most likely respond to Passage 2's claim that the ordinance unfairly burdens small businesses?",
          choices: [
            "By arguing that the improvement to residents' quality of life outweighs the burden on businesses.",
            "By fully conceding that the ordinance was a mistake and should be repealed.",
            "By denying that any businesses have been affected by the ordinance.",
            "By arguing that businesses should relocate to a different city entirely.",
          ],
          answer: 0,
          explain:
            "Passage 1's core concern is improved quality of life for residents. Applying that concern to the new claim, an author focused on resident quality of life would most likely argue that the benefit to residents outweighs the inconvenience to businesses, or that businesses can adjust. Conceding the ordinance was a mistake would contradict their stated position entirely, and denying any businesses were affected or arguing they should relocate both go well beyond what a reasonable, consistent response would claim.",
          difficulty: "easy",
          why: [null, "Passage 1 praises the ordinance's benefits. Calling it a mistake would reverse its whole position.", "Passage 2 describes real revenue losses. Flatly denying them isn't a reasonable, consistent response.", "Telling businesses to leave the city goes far beyond anything Passage 1 argues."],
        },
        {
          q: "Passage 1: Clinical trials of a popular diet trend consistently show participants losing significant weight within the first eight weeks, making it an effective option for people seeking rapid short-term results. \n\nPassage 2: Follow-up studies of the same diet trend show that the vast majority of participants who lose weight in the first eight weeks regain it within a year, since the diet's restrictive rules are too difficult to maintain as a long-term lifestyle.\n\nHow would the author of Passage 2 most likely respond to Passage 1's claim that the diet produces measurable short-term weight loss?",
          choices: [
            "By conceding the short-term effect is real, but arguing it doesn't matter if it can't be sustained.",
            "By denying that any short-term weight loss occurs at all.",
            "By arguing the diet should be recommended more widely despite the risk of regaining weight.",
            "By ignoring the claim since it is unrelated to sustainability.",
          ],
          answer: 0,
          explain:
            "Passage 2's core concern is not whether short-term effects occur, but whether they can be sustained. Applying that concern to the new claim, this author would most likely concede the short-term effect is real, but argue it doesn't matter if it can't be maintained long-term. Denying any short-term weight loss occurs misreads their critique, which is about durability, not the initial result. Arguing the diet should be recommended more widely would contradict their own conclusion, and ignoring the claim as unrelated wrongly treats it as irrelevant when it's central to their argument.",
          difficulty: "medium",
          why: [null, "Passage 2 accepts that people lose weight at first; its point is that they regain it. It wouldn't deny the loss.", "Passage 2 argues the diet can't be sustained, so it wouldn't recommend it more widely.", "Short-term results are exactly what Passage 2 is responding to. The claim is central to its argument."],
        },
        {
          q: "Passage 1 (a historian): An ancient trade route's gradual decline over roughly a century coincided closely with a major shift in regional political power, as a newly dominant empire redirected trade through routes it could tax and control more directly. \n\nPassage 2 (an archaeologist): Sediment core samples show the same region's climate became significantly drier over the same century-long period, and the trade route's key water sources, on which caravans depended, appear to have dried up gradually before the route was finally abandoned.\n\nHow would the author of Passage 1 most likely respond to the sediment core evidence presented in Passage 2?",
          choices: [
            "By accepting the environmental evidence as accurate, but arguing it was a secondary factor compared to the political shift.",
            "By flatly denying that the region's climate changed during this period.",
            "By agreeing that environmental change was the true primary cause of the decline.",
            "By arguing that sediment core analysis is an unreliable scientific method.",
          ],
          answer: 0,
          explain:
            "Passage 1's core concern is that political shifts were the primary cause of the decline. A careful historian wouldn't necessarily dispute solid sediment-core data, since that's not their area of expertise or actual disagreement — their real disagreement is about which cause was primary, not whether the climate changed at all. Flatly denying the climate changed rejects data outside their argument, attacking sediment core analysis as unreliable attacks a scientific method without cause, and agreeing environmental change was the true primary cause would abandon their own thesis entirely. Only 'accepting the environmental evidence as accurate, but arguing it was a secondary factor' accepts the data but reframes its importance as secondary, the most consistent response.",
          difficulty: "hard",
          why: [null, "The historian has no reason to reject solid climate data. The disagreement is about which cause mattered most.", "That would abandon the historian's own thesis that politics was the main cause.", "Attacking the scientific method without cause isn't a reasonable response. The historian can accept the data and dispute its importance."],
        },
      ],
      traps: [
        "Having the author agree with a claim that directly contradicts their passage's established position.",
        "Predicting a response using generic reasoning rather than the specific concern that drives that particular author's argument.",
        "Having the author reject the other text's evidence outright, when their position can accept the evidence and reinterpret it.",
      ],
    },
  ],
  tipsAndTricks: [
    "Summarize each passage's core claim in one plain sentence before looking at the answer choices — cross-text questions become much easier once both positions are simplified.",
    "For 'common ground' questions, look for the shared premise or fact each argument is built on, not the (opposing) conclusions themselves.",
    "For 'how would author X respond' questions, identify author X's core value or concern first, then apply it consistently — an author's predicted response should never contradict their own passage's stance.",
  ],
};

const LC_RW_RHETORICAL_SYNTHESIS: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Goal-Filtered Selection",
      explanation:
        "You're given bullet-point notes and a specific goal (like 'emphasize the economic stakes'), then asked which sentence best accomplishes that goal using only those notes. The biggest mistake: treating this as a 'which sentence is true' question. Every choice is usually factually accurate! The real test is whether a sentence accomplishes the SPECIFIC stated goal — not just whether it's a correct statement.",
      examples: [
        {
          q: "A student has taken the following notes: (1) Bees pollinate about one-third of food crops grown for human consumption. (2) Bee populations have declined by 40% since 2006. (3) Colony collapse disorder is considered a leading cause of the decline. The student wants to emphasize the economic stakes of bee population decline. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          choices: [
            "Colony collapse disorder, a leading cause of bee decline, remains poorly understood by researchers.",
            "Because bees pollinate about one-third of food crops grown for human consumption, a 40% population decline since 2006 threatens a significant portion of the food supply.",
            "Bee populations have declined by 40% since 2006, a troubling trend for conservationists.",
            "Colony collapse disorder has caused bee populations to decline by 40% since 2006.",
          ],
          answer: 1,
          explain:
            "Re-read the goal: 'economic stakes,' not causes or general facts about bees. Note 1 (pollinating food crops) is the economic angle. Framing colony collapse disorder as poorly understood, or as the cause of the decline, focuses on the cause (note 3), not economic stakes, and reporting the decline alone leaves no economic connection. Only 'because bees pollinate about one-third of food crops grown for human consumption, a 40% population decline since 2006 threatens a significant portion of the food supply' combines the crop-pollination fact with the decline statistic, directly serving the stated goal.",
          difficulty: "easy",
          why: ["This focuses on the cause of the decline (note 3), not the economic stakes.", null, "The decline alone says nothing economic. It leaves out the crop-pollination fact that shows what's at stake.", "This is about the cause of the decline, not its economic stakes."],
        },
        {
          q: "A student has taken the following notes: (1) A city library added 12 self-checkout kiosks in 2022. (2) Average wait times at the checkout desk dropped by 6 minutes. (3) Staff reported spending more time helping patrons find books. The student wants to emphasize the impact of the kiosks on staff work, not on patron convenience. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          choices: [
            "After a city library added 12 self-checkout kiosks in 2022, average wait times at the checkout desk dropped by 6 minutes.",
            "A city library added 12 self-checkout kiosks in 2022, freeing staff to spend more time helping patrons find books.",
            "Average wait times at a city library's checkout desk dropped by 6 minutes after the library added self-checkout kiosks.",
            "A city library added 12 self-checkout kiosks in 2022, a significant investment in new technology.",
          ],
          answer: 1,
          explain:
            "Re-read the goal carefully: 'impact on staff work,' not patron convenience. The wait-time note is tempting because it's about the same event, but it's about patrons, exactly what the goal says to avoid, ruling out choices built around the wait-time drop. Mentioning only the installation as a technology investment leaves no effect on staff at all. Only 'a city library added 12 self-checkout kiosks in 2022, freeing staff to spend more time helping patrons find books' combines the kiosk installation with the staff time-reallocation note, directly serving the goal.",
          difficulty: "medium",
          why: ["Wait times are about patrons, the exact thing the goal says not to emphasize.", null, "This is only about patron wait times. The goal is the effect on staff.", "Calling the kiosks a technology investment says nothing about how staff work changed."],
        },
        {
          q: "A student has taken the following notes: (1) A nonprofit distributed 500 reusable water bottles at a summer festival. (2) The festival generated an estimated 3 tons of plastic waste the previous year. (3) A follow-up survey a month later found that 68% of attendees still used the bottles regularly. (4) The festival's ticket prices rose 10% this year. The student wants to emphasize the long-term environmental impact of the giveaway. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          choices: [
            "A nonprofit distributed 500 reusable water bottles at a summer festival that generated an estimated 3 tons of plastic waste the previous year.",
            "A nonprofit distributed 500 reusable water bottles at a summer festival, and a follow-up survey a month later found that 68% of attendees still used the bottles regularly.",
            "The festival's ticket prices rose 10% this year, the same year a nonprofit distributed 500 reusable water bottles there.",
            "The festival generated an estimated 3 tons of plastic waste the previous year, prompting a nonprofit to distribute 500 reusable water bottles.",
          ],
          answer: 1,
          explain:
            "Re-read the goal precisely: 'long-term environmental impact,' not just that the giveaway happened or general festival facts. Note 4 (ticket prices) is true but has nothing to do with the environment, ruling out the choice built around ticket prices. Note 2 (3 tons of plastic waste) sets the scale of the problem, but by itself doesn't show any actual impact from the giveaway — it's background, not an outcome, which is why choices pairing the giveaway with just the waste figure fall short. Note 3 (68% still using the bottles a month later) is the only note showing a real, lasting effect tied specifically to the giveaway, which is why 'a nonprofit distributed 500 reusable water bottles at a summer festival, and a follow-up survey a month later found that 68% of attendees still used the bottles regularly' is correct.",
          difficulty: "hard",
          why: ["The waste figure sets up the problem, but it doesn't show the giveaway had any lasting effect.", null, "Ticket prices have nothing to do with environmental impact.", "This explains why the giveaway happened, not what lasting effect it had."],
        },
        {
          q: "A student has taken the following notes: (1) A local bakery started using compostable packaging in 2021. (2) The switch increased packaging costs by 15%. (3) Customer surveys show that 68% of customers say they'd pay more for eco-friendly packaging. The student wants to emphasize customer support for the change. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          choices: [
            "A local bakery's switch to compostable packaging in 2021 increased packaging costs by 15%.",
            "A local bakery started using compostable packaging in 2021, and customer surveys show that 68% of customers say they'd pay more for eco-friendly packaging.",
            "The switch to compostable packaging increased a local bakery's packaging costs by 15%, despite customer surveys showing support for eco-friendly options.",
            "A local bakery's packaging costs rose 15% after it began using compostable packaging in 2021.",
          ],
          answer: 1,
          explain:
            "Re-read the goal: 'customer support,' not cost. Note 3 (68% would pay more) ties directly to customer support. Choices centered on the 15% cost increase both answer a different question, and the choice that mentions the survey only as a contrast to the cost increase frames it as a footnote rather than as the sentence's actual emphasis. Only 'a local bakery started using compostable packaging in 2021, and customer surveys show that 68% of customers say they'd pay more for eco-friendly packaging' combines the packaging change with the survey result, directly serving the stated goal.",
          difficulty: "easy",
          why: ["This emphasizes cost, not customer support.", null, "The survey appears only as a side note to the cost increase. The emphasis is still on cost.", "This is only about the cost increase. It never mentions customers."],
        },
        {
          q: "A student has taken the following notes: (1) A youth orchestra performed its first international tour in 2019. (2) The tour included stops in four countries. (3) Ticket sales from the tour funded new instruments for the following year. (4) The orchestra's conductor has led the group since 2015. The student wants to emphasize how the tour benefited the orchestra's future. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          choices: [
            "A youth orchestra's first international tour in 2019 included stops in four countries.",
            "A youth orchestra's first international tour in 2019 funded new instruments for the following year through ticket sales.",
            "A youth orchestra's conductor, who has led the group since 2015, organized its first international tour in 2019.",
            "A youth orchestra performed its first international tour in 2019, visiting four countries under a conductor who has led the group since 2015.",
          ],
          answer: 1,
          explain:
            "Re-read the goal: 'benefited the orchestra's future,' not how big the tour was or who leads the orchestra. Choices bringing in the conductor's tenure (note 4) are unrelated to the tour's benefit, and describing the tour's scope (note 2) alone doesn't address benefit. Only 'a youth orchestra's first international tour in 2019 funded new instruments for the following year through ticket sales' combines the tour with the instrument-funding outcome, the specific future benefit the goal asks about.",
          difficulty: "medium",
          why: ["The number of countries describes the tour's size, not how it helped the orchestra's future.", null, "The conductor's tenure has nothing to do with how the tour benefited the future.", "Countries visited and the conductor's tenure are details. Neither shows a benefit to the future."],
        },
        {
          q: "A student has taken the following notes: (1) A public library extended its hours to include Sunday openings starting in 2022. (2) Sunday visits now account for 18% of total weekly visits. (3) Before the change, the library was closed two days per week, Sunday and Monday. (4) A separate branch across town has had Sunday hours since 2015, with similar visit patterns. (5) The library's overall annual budget increased 5% the same year hours were extended. The student wants to emphasize that demand for Sunday access already existed before this library reacted to it. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
          choices: [
            "A public library extended its hours to include Sunday openings in 2022, and Sunday visits now account for 18% of total weekly visits.",
            "A public library extended its hours to include Sunday openings in 2022, the same year its overall annual budget increased 5%.",
            "A public library extended its hours to include Sunday openings in 2022, following years of similar Sunday demand at a separate branch across town that has offered Sunday hours since 2015.",
            "Before extending its hours in 2022, a public library was closed two days per week, Sunday and Monday.",
          ],
          answer: 2,
          explain:
            "Re-read the goal precisely: demand existed before the library reacted, not just that Sunday hours are popular now. The 18%-of-visits figure shows current usage, but that's after the change, so alone it doesn't prove demand existed beforehand — a tempting but incomplete choice. Pairing the change with the budget increase, or describing the old closure schedule, don't address demand at all. Only 'a public library extended its hours to include Sunday openings in 2022, following years of similar Sunday demand at a separate branch across town that has offered Sunday hours since 2015' combines this library's 2022 change with the comparable branch's years-long Sunday demand pattern, showing the demand pre-dated this library's own reaction.",
          difficulty: "hard",
          why: ["18% of visits shows demand after the change. The goal is to show demand existed before.", "The budget increase says nothing about demand for Sunday hours.", null, "The old schedule describes when the library was closed, not whether people wanted Sunday access."],
        },
      ],
      traps: [
        "Picking a true, well-written sentence that doesn't actually serve the specific stated goal.",
        "Picking a sentence that uses information not present in the given notes (even if it sounds plausible).",
        "Combining notes in a way that answers a different, related-sounding goal instead of the one actually stated.",
        "Missing a stated audience (\"an audience unfamiliar with...\") and choosing a sentence that uses a term or name the audience wouldn't know without explanation.",
      ],
    },
  ],
  tipsAndTricks: [
    "Underline the goal itself before reading any answer choices — it is the entire filter for the correct answer, and everything else is noise if it doesn't serve that goal.",
    "Cross out any choice using information not present in the given notes — rhetorical synthesis answers can only combine what's given, never outside knowledge.",
    "If two choices both use relevant notes, the correct one usually combines exactly the notes needed for the goal — no more, no less. An answer that leaves out a directly relevant note is often incomplete.",
  ],
};

const LC_RW_TRANSITIONS: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Identify the Logical Relationship First",
      explanation:
        "The most useful habit for transitions questions: figure out the logical relationship between the two ideas BEFORE looking at the choices. Is it contrast, cause-and-effect, addition, or example? Only after naming the relationship should you match it to a specific word. Many students instead try each word and see what 'sounds right' — that's slower and riskier, since several choices can sound fine grammatically.",
      examples: [
        {
          q: "The experiment produced promising initial results. ______, further trials failed to replicate the effect. Which choice completes the text with the most logical transition?",
          choices: ["Similarly,", "However,", "For example,", "As a result,"],
          answer: 1,
          explain:
            "What's the relationship between the two sentences? Promising results, then failure to replicate — this is a contrast, not an addition or cause-effect. 'Similarly' signals comparison, 'for example' signals illustration, and 'as a result' would wrongly imply the failure was caused by the promising results. 'However' is the only choice matching the actual contrast.",
          difficulty: "easy",
          why: ["\"Similarly\" signals the two ideas match. Promising results followed by failure is a contrast.", null, "The failed trials aren't an example of the promising results. They contradict them.", "The promising results didn't cause the failure to replicate. There's no cause and effect here."],
        },
        {
          q: "The bakery started sourcing flour from a local mill instead of a national distributor. ______, delivery times improved and ingredient costs actually dropped by 8%. Which choice completes the text with the most logical transition?",
          choices: ["In addition,", "However,", "As a result,", "For instance,"],
          answer: 2,
          explain:
            "What's the relationship here? The switch to a local mill directly produced two outcomes (faster deliveries and lower costs), a cause and its effects, not addition or contrast. 'In addition' would suggest these are just two more, separate facts, not results of the switch, and 'however' would suggest a contradiction that isn't there. 'As a result' is the only choice that correctly signals the second sentence describes consequences of the first.",
          difficulty: "medium",
          why: ["\"In addition\" treats these as two separate facts. The better deliveries and lower costs came from the switch.", "Nothing contradicts the switch. Faster deliveries and lower costs are good results, not a contrast.", null, "The improvements aren't an example of switching mills. They're what the switch produced."],
        },
        {
          q: "The museum extended its hours for the holiday season. ______, staff scheduled additional guided tours to meet the increased demand. Which choice completes the text with the most logical transition?",
          choices: ["However,", "For example,", "Similarly,", "As a result,"],
          answer: 3,
          explain:
            "What's the relationship here? Extending hours led directly to a response (more tours), a cause and its effect. 'However' signals contrast, 'for example' signals illustration, and 'similarly' signals comparison, none of which fit. 'As a result' is the only choice matching the actual cause-effect relationship.",
          difficulty: "easy",
          why: ["More tours don't contrast with longer hours. They're a response to them.", "Scheduling tours isn't an example of extending hours. It's a result of the demand.", "\"Similarly\" signals a parallel idea, but the tours were a response to the extended hours, not a separate similar move.", null],
        },
        {
          q: "The vaccine trial enrolled twice as many participants as originally planned. ______, the results were available nearly a year ahead of schedule. Which choice completes the text with the most logical transition?",
          choices: ["In addition,", "Consequently,", "Nevertheless,", "For example,"],
          answer: 1,
          explain:
            "What's the relationship? A larger enrollment led to faster results — a causal link, not just two separate facts about the trial. 'In addition' would present these as two unconnected facts, but the sentence's logic specifically connects the larger sample to the faster timeline, and 'nevertheless' signals contrast, which doesn't fit at all. 'Consequently' correctly matches the cause-effect relationship.",
          difficulty: "medium",
          why: ["\"In addition\" presents two unrelated facts. The larger enrollment is what made results come sooner.", null, "\"Nevertheless\" signals a contrast, but faster results are what you'd expect from more participants.", "Early results aren't an example of larger enrollment. They're a consequence of it."],
        },
        {
          q: "The company's revenue grew for the fifth consecutive quarter. ______, its stock price fell sharply after the earnings call. Which choice completes the text with the most logical transition?",
          choices: ["As a result,", "However,", "Similarly,", "For example,"],
          answer: 1,
          explain:
            "What's the relationship? Revenue grew, but stock fell — growth would normally be expected to raise or maintain stock price, so this is a contrast between expectation and outcome, not a cause producing an expected effect. 'As a result' is a tempting trap, since the events are chronologically connected, but it would imply the growth logically produced the drop, reversing the sentence's actual logic. 'Similarly' and 'for example' don't fit a contrast at all. 'However' correctly signals that the fall is surprising given the growth.",
          difficulty: "hard",
          why: ["Growth wouldn't normally cause a stock drop. \"As a result\" implies the growth produced the fall, which reverses the logic.", null, "A falling stock after growing revenue is a contrast, not a similarity.", "The stock drop isn't an example of revenue growth. It goes the other way."],
        },
      ],
      traps: [
        "Picking a transition that 'sounds fine' grammatically without checking if it matches the actual logical relationship.",
        "Confusing near-synonyms with different logical force (e.g., 'however' signals direct contrast, while 'nonetheless' signals contrast despite an acknowledged point — subtly different uses).",
        "Choosing a cause-and-effect transition ('therefore,' 'as a result') when the second sentence only adds information or follows in time, rather than resulting from the first.",
        "Choosing an example transition ('for instance') when the second sentence isn't an example of the first.",
      ],
    },
    {
      name: "Contrast vs. Concession",
      explanation:
        "This is a harder version of the same skill: telling apart direct contrast words (however, in contrast) from concession words (nonetheless, still, even so). Concession words mean the author acknowledges a point but sticks with their original position anyway. Knowing which flavor of 'contrast' is needed helps you choose between two options that both seem to fit at first.",
      examples: [
        {
          q: "The two proposals differ significantly in cost. ______, both aim to reduce the city's carbon footprint by the same percentage. Which choice completes the text with the most logical transition?",
          choices: ["Therefore,", "Nonetheless,", "For instance,", "Similarly,"],
          answer: 1,
          explain:
            "Is this a full contradiction, or an acknowledgment of a difference followed by a shared similarity? It's the latter: the cost difference is acknowledged, but doesn't prevent a shared goal from being true. 'Therefore' implies the second sentence follows as a consequence, which isn't the case here, and 'for instance' and 'similarly' don't fit either. 'Nonetheless' correctly signals a concession: the difference is acknowledged, but the shared goal still holds true despite it.",
          difficulty: "easy",
          why: ["A shared goal doesn't follow from the cost difference. \"Therefore\" implies a cause that isn't there.", null, "The shared goal isn't an example of the cost difference.", "\"Similarly\" can't follow a statement about how the proposals differ. The second sentence is a concession, not a parallel."],
        },
        {
          q: "The bridge repairs ran three months behind schedule. ______, the final structure passed every safety inspection without a single issue. Which choice completes the text with the most logical transition?",
          choices: ["Consequently,", "Nonetheless,", "Similarly,", "For example,"],
          answer: 1,
          explain:
            "Ask whether the two ideas actually contradict each other, or whether the second is simply true despite the first. Running behind schedule doesn't logically prevent a project from passing inspection later; these aren't direct opposites. 'Consequently' would wrongly suggest the delay caused the successful inspection, and 'similarly' and 'for example' don't fit at all. 'Nonetheless' is correct because nothing is actually being reversed or disproven: a positive result held up despite an earlier problem, exactly what concession language signals.",
          difficulty: "hard",
          why: ["The delay didn't cause the bridge to pass inspection. \"Consequently\" implies it did.", null, "Passing inspection isn't similar to running late. It's a positive result despite the delay.", "Passing inspection isn't an example of the delay."],
        },
        {
          q: "The two candidates disagree on nearly every policy issue. ______, both have pledged to accept the election results peacefully. Which choice completes the text with the most logical transition?",
          choices: ["Nonetheless,", "For example,", "As a result,", "Similarly,"],
          answer: 0,
          explain:
            "Is this a full contradiction, or an acknowledgment of one point followed by agreement on another? It's the latter: disagreeing on policy doesn't prevent a shared commitment on something else. 'As a result' would wrongly imply the disagreement caused the pledge, and 'for example' and 'similarly' don't fit either. 'Nonetheless' correctly signals a concession: the disagreement is acknowledged, but the shared commitment still holds true despite it.",
          difficulty: "easy",
          why: [null, "A shared pledge isn't an example of the candidates' disagreements.", "The disagreement didn't cause the pledge. \"As a result\" implies it did.", "\"Similarly\" can't follow \"they disagree.\" The pledge holds despite the disagreement."],
        },
        {
          q: "The renovation ran significantly over budget. ______, the building's new energy efficiency is expected to save the city money within five years. Which choice completes the text with the most logical transition?",
          choices: ["As a result,", "Nonetheless,", "For example,", "Moreover,"],
          answer: 1,
          explain:
            "Is this a flat contradiction, or does the second idea hold true despite the first? Running over budget doesn't logically prevent future energy savings — these aren't opposites, so this is a 'despite X, Y still holds' relationship. 'As a result' would wrongly suggest the overspending caused the savings, and 'for example' and 'moreover' don't fit either. 'Nonetheless' correctly signals a positive outcome holding true despite an earlier setback.",
          difficulty: "medium",
          why: ["Going over budget didn't cause the energy savings. \"As a result\" implies it did.", null, "Future savings aren't an example of going over budget.", "\"Moreover\" adds another point in the same direction, but savings push back against the overspending."],
        },
        {
          q: "Reviewers praised the film's visual effects as groundbreaking. ______, they panned its script as incoherent and poorly paced. Which choice completes the text with the most logical transition?",
          choices: ["Nonetheless,", "However,", "Similarly,", "As a result,"],
          answer: 1,
          explain:
            "Is this 'despite X, Y still holds,' or a direct two-sided contrast? Here, praise for the effects and criticism of the script are two separate, directly opposing assessments, not one idea holding true despite the other. A concession word like 'nonetheless' would subtly misrepresent this as one point overcoming a setback, when it's really just two contrasting judgments placed side by side. 'Similarly' and 'as a result' don't fit a contrast at all. 'However' is the cleaner, more accurate fit for this direct contrast.",
          difficulty: "medium",
          why: ["\"Nonetheless\" frames the criticism as holding true despite the praise. These are just two opposite judgments side by side.", null, "Praise for one part and criticism of another is a contrast, not a similarity.", "The praise didn't cause the criticism. There's no cause and effect."],
        },
      ],
      traps: [
        "Treating all 'contrast-flavored' transitions as interchangeable, when concession words specifically signal 'despite this, still...' rather than a flat contradiction.",
        "Choosing a cause-and-effect transition ('therefore,' 'accordingly') when the second sentence is true despite the first, not because of it.",
      ],
    },
  ],
  tipsAndTricks: [
    "Name the logical relationship (contrast, cause-effect, addition, example, concession) in your own head before reading the choices — this turns a 'which sounds right' guess into a targeted filter.",
    "Read the full sentences on both sides of the blank, not just a few words near it — the relationship often depends on the complete idea of each sentence.",
    "If stuck between two contrast-type words, ask whether the second idea fully contradicts the first (use 'however') or holds true despite the first (use a concession word like 'nonetheless' or 'still').",
  ],
};

const LC_RW_BOUNDARIES: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Independent Clause Joins (Comma, Semicolon, Period, or Conjunction)",
      explanation:
        "This pattern is about joining two complete, independent clauses — each one could stand alone as its own sentence. Everything hinges on one question: is each side of the punctuation a full independent clause (subject + verb, complete thought)? If both sides are independent, you have exactly four correct options: a period, a semicolon, a comma plus a word like 'and' or 'but,' or a colon (only if the second clause explains the first). A comma by itself joining two independent clauses (a 'comma splice') is a common wrong answer. Watch for this pattern whenever both clauses could be read as standalone sentences.",
      examples: [
        {
          q: "The results were surprising ______ no one had predicted such a sharp decline. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["; ", ", ", " so ", ", but "],
          answer: 0,
          explain:
            "Check both sides: 'The results were surprising' and 'no one had predicted such a sharp decline' are both complete, independent clauses. A lone comma alone would create a comma splice, and 'so' without a comma before it creates a run-on. 'But' signals a contrast, but these two ideas aren't in contrast. The semicolon correctly joins two closely related independent clauses without needing a conjunction.",
          difficulty: "easy",
          why: [null, "Both sides are complete sentences. A comma alone can't join them; that's a comma splice.", "\"So\" with no comma before it runs two complete sentences together, and the second isn't a result of the first anyway.", "The punctuation works, but \"but\" signals a contrast. The second clause explains why the results were surprising; it doesn't contrast with them."],
        },
        {
          q: "The lab technician double-checked every reading twice ______ a single miscalibration could invalidate months of data. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [": ", ", ", " so ", ", but "],
          answer: 0,
          explain:
            "Both sides are independent clauses ('The lab technician double-checked every reading twice' and 'a single miscalibration could invalidate months of data'), so a lone comma is wrong. The second clause explains why the technician was so careful — exactly the relationship a colon signals, more precisely than 'so' or the contrastive 'but,' which doesn't fit here at all.",
          difficulty: "medium",
          why: [null, "Both sides are complete sentences, so a comma alone creates a comma splice.", "\"So\" would mean the checking caused the risk. It's the other way around: the risk explains the checking.", "\"But\" signals a contrast, and there's none. The second clause explains the first."],
        },
        {
          q: "The negotiators extended the deadline by another week, ______ neither side had reviewed the full contract yet. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["for", "because", "so that", "although"],
          answer: 0,
          explain:
            "Both halves could stand alone as complete sentences, and a comma already sits right before the blank. 'For' links two complete sentences the same way 'and' or 'but' would, so it correctly takes a comma right before it. 'Because,' 'so that,' and 'although' all attach onto the second clause and turn it into a dependent clause that could no longer stand alone — used that way, none of them would take a comma directly in front of them the way this sentence already has.",
          difficulty: "hard",
          why: [null, "\"Because\" can't follow a comma here. It makes the second part dependent, and \"because\" clauses at the end don't take a comma.", "\"So that\" signals purpose, but not having reviewed the contract isn't the goal of the extension. It's the reason for it.", "\"Although\" signals contrast, but the second clause gives the reason for the extension, not a contrast with it."],
        },
        {
          q: "The council approved the budget unanimously ______ the mayor still vetoed it the next day. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [", but ", ", ", " so ", ": "],
          answer: 0,
          explain:
            "Both sides are complete sentences on their own, so a lone comma is a splice and 'so' without a comma is a run-on. The relationship here is a surprising contrast, not an explanation, so a colon doesn't fit either. A comma plus 'but' correctly joins the two independent clauses while signaling that direct contrast.",
          difficulty: "easy",
          why: [null, "Both sides are complete sentences, so a comma alone creates a comma splice.", "\"So\" with no comma runs the sentences together, and the veto isn't a result of the approval.", "A colon signals that the second part explains the first. The veto is a surprising contrast, not an explanation."],
        },
        {
          q: "The two departments rarely agree on budget priorities ______ this year's proposal passed with support from both. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["; ", ", ", " so ", ": "],
          answer: 0,
          explain:
            "Both sides are complete, independent clauses, so a lone comma would be a splice and 'so' without a comma is a run-on. A colon would incorrectly suggest the second clause explains or defines the first, when it's really a surprising contrast. A semicolon correctly joins the two independent clauses and lets that contrast speak for itself.",
          difficulty: "medium",
          why: [null, "Both sides are complete sentences, so a comma alone creates a comma splice.", "\"So\" implies the disagreement caused the joint support, which reverses the logic. It also runs the sentences together.", "A colon means the second part explains the first. Here it's a contrast, not an explanation."],
        },
      ],
      traps: [
        "Choosing a lone comma between two independent clauses (a comma splice) — one of the most common wrong answers on this pattern.",
        "Missing that a dependent clause (starting with 'because,' 'although,' 'since,' etc.) is NOT independent, even though it may look like a full sentence.",
        "Running two independent clauses together with no punctuation at all (a fused sentence).",
        "Pairing a semicolon with 'and,' 'but,' or 'so' ('; and'), or moving the comma after the conjunction ('and,') — the pattern is a comma before the conjunction, or a semicolon alone.",
      ],
    },
    {
      name: "Punctuating Around Conjunctive Adverbs",
      explanation:
        "These questions put a transition word like 'however,' 'therefore,' 'for example,' 'in fact,' or 'though' where two complete clauses meet, and the choices move a semicolon (or period) and a comma around it: 'X; however, Y' versus 'X, however; Y.' A transition isn't a joining word like 'but,' so commas alone on both sides still make a comma splice; one side needs a strong boundary. To pick the side, decide which clause the transition logically belongs to. If it tells how the second clause relates to the first (the second contrasts with, results from, or gives an example of the first), the strong mark goes before it: 'X; however, Y.' If it links the first clause back to an earlier sentence and the second clause just explains or lists what the first announced, the transition ends the first clause and the mark goes after it ('X, however; Y'), with a colon when what follows explains or lists. Either way, a comma separates the transition from the rest of its own clause, and if what follows isn't a complete clause (an '-ing' phrase, or a main clause after an introductory phrase), there's no seam at all, so no semicolon: just commas around the transition.",
      examples: [
        {
          q: "Engineers predicted that the prototype footbridge would begin to sag under a load of 40 metric ______ it held steady until the load reached 55 metric tons.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["tons, however, it", "tons; however, it", "tons, however; it", "tons however, it"],
          answer: 1,
          explain:
            "Both sides are complete sentences: 'Engineers predicted that the prototype footbridge would begin to sag under a load of 40 metric tons' and 'it held steady until the load reached 55 metric tons.' 'However' belongs to the second one, since it signals that the result contrasted with the prediction, so the semicolon goes before 'however' and a comma follows it. Commas on both sides make a comma splice, because 'however' can't join sentences the way 'but' can. A semicolon after 'however' attaches it to the prediction, where it contrasts with nothing, and leaving out punctuation before 'however' runs the two sentences together.",
          difficulty: "easy",
          why: ["\"However\" isn't a joining word like \"but,\" so commas on both sides leave two complete sentences joined by commas alone: a comma splice.", null, "This attaches \"however\" to the prediction. The contrast is between the prediction and the result, so \"however\" starts the second sentence.", "With nothing before \"however,\" the two complete sentences run together."],
        },
        {
          q: "The skin on a glass frog's underside is so transparent that an observer can watch the frog's heart ______ researchers can track the animal's heart rate without ever handling it.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["beat, as a result, researchers", "beat as a result, researchers", "beat, as a result; researchers", "beat. As a result, researchers"],
          answer: 3,
          explain:
            "Both sides are complete sentences, and 'as a result' tells how the second follows from the first: because the skin is see-through, researchers can track the heart rate without touching the frog. So 'as a result' opens the second sentence, with a strong boundary (here a period) before it and a comma after it. Commas on both sides make a comma splice. A semicolon after 'as a result' ties it to the first sentence, making the watching a result, when it's actually the cause. With no punctuation before 'as a result,' the two sentences run together.",
          difficulty: "easy",
          why: ["\"As a result\" can't join two complete sentences, so commas on both sides make a comma splice.", "Nothing separates the two complete sentences, so they run together.", "This ties \"as a result\" to the first sentence, but watching the heart is the cause here, not the result.", null],
        },
        {
          q: "Most frog species leave their eggs unattended once they are laid. Male coquí frogs ______ each one guards a clutch of eggs for about three weeks, pressing his body against them to keep them from drying out.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["are an exception, however; each", "are an exception; however, each", "are an exception, however, each", "are an exception however, each"],
          answer: 0,
          explain:
            "Both sides are complete sentences, so read for logic. 'However' contrasts male coquí frogs with the 'most frog species' of the previous sentence, so it belongs at the end of the first clause: 'Male coquí frogs are an exception, however.' The second clause doesn't contrast with being an exception; it explains what makes them one. So the semicolon goes after 'however.' Putting the semicolon before 'however' would present guarding eggs as a contrast to being an exception, which is backward. Commas on both sides, or no comma before 'however' and one after, join two complete sentences with a comma alone.",
          difficulty: "medium",
          why: [null, "This makes guarding the eggs a contrast to being an exception, but guarding the eggs is what makes them an exception.", "\"However\" can't join two complete sentences, so commas on both sides make a comma splice.", "With only a comma after \"however,\" the two complete sentences are joined by a comma alone, and \"however\" isn't set off from its clause."],
        },
        {
          q: "The first version of the solar-powered water pump broke down within a week of its installation in 2019. The redesigned pump fared much ______ it ran for eleven months before needing a single repair.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["better; though, it", "better, though, it", "better, though; it", "better though it"],
          answer: 2,
          explain:
            "'Though' here is a transition meaning 'however,' and it contrasts the redesigned pump with the first version from the previous sentence, so it ends the first clause: 'The redesigned pump fared much better, though.' The second clause is evidence of how much better the pump did, not a contrast, so the semicolon goes after 'though.' Moving the semicolon before 'though' makes the eleven months sound like a contrast with faring better. Commas on both sides make a comma splice. And with no punctuation, 'though it ran for eleven months' becomes a concession, as if the pump did better in spite of running for eleven months, which makes no sense.",
          difficulty: "medium",
          why: ["This makes the eleven months a contrast to faring better, but they're the proof of it. \"Though\" belongs with the first clause.", "Both sides are complete sentences, and \"though\" can't join them, so commas on both sides make a comma splice.", null, "Without punctuation, \"though it ran for eleven months\" reads as \"even though,\" as if running for months worked against the pump's success."],
        },
        {
          q: "Early marine chronometers kept excellent time in a clockmaker's workshop. Carrying one aboard a ship created three new ______ constant rocking, sudden swings in temperature, and damp sea air that corroded the delicate metal parts.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["problems; however, constant", "problems, however: constant", "problems, however, constant", "problems: however, constant"],
          answer: 1,
          explain:
            "'However' contrasts the ship with the workshop in the previous sentence, so it ends the first clause: 'Carrying one aboard a ship created three new problems, however.' What follows is a list of those three problems, not a complete sentence, so a semicolon can't come before it; a complete clause that announces a list takes a colon. So the comma goes before 'however' and the colon after it. Putting the semicolon or colon before 'however' would make the list contrast with the very problems it names, and a comma after 'however' can't introduce a list after a complete clause.",
          difficulty: "hard",
          why: ["A semicolon needs a complete sentence after it, and the list of problems isn't one. \"However\" also belongs with the first clause.", null, "A comma can't introduce a list after a complete clause; this needs a colon after \"however.\"", "This makes the list contrast with the problems it names. \"However\" contrasts the ship with the workshop, so it goes before the colon."],
        },
      ],
      traps: [
        "Setting off the transition with commas on both sides ('X, however, Y') when both sides are complete sentences — 'however' isn't a joining word like 'but,' so this is still a comma splice.",
        "Putting the semicolon on the wrong side of the transition — for example, choosing 'X; however, Y' when 'however' actually contrasts X with an earlier sentence and Y just explains X.",
        "Using a semicolon or period next to the transition when what follows isn't a complete clause, such as an '-ing' phrase, a list (which needs a colon), or a main clause after an introductory phrase.",
        "Dropping a needed comma or leaving out punctuation altogether, so the transition isn't set off from its clause or the two sentences run together.",
      ],
    },
    {
      name: "Semicolon-Separated Lists with Internal Commas",
      explanation:
        "This pattern covers lists where individual items already contain their own comma, most often a name followed by a description, like 'Chen Liu, a sculptor.' When every list item is a simple word or phrase, ordinary commas work fine. But once one item already has a comma inside it, more commas make it impossible to tell where one item ends and the next begins. That's your signal: introduce the list with a colon and separate items with semicolons instead. Watch for this whenever a sentence lists several people, places, or things: check if any single item already has its own comma.",
      examples: [
        {
          q: "The museum's newest exhibit features work by three artists______ Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            ": Chen Liu, a sculptor; Marisol Ortiz, a painter; and Amara Diallo, a photographer.",
            ": Chen Liu, a sculptor, Marisol Ortiz, a painter, and Amara Diallo, a photographer.",
            ", Chen Liu a sculptor, Marisol Ortiz a painter, and Amara Diallo a photographer.",
            "; Chen Liu, a sculptor; Marisol Ortiz, a painter; and Amara Diallo, a photographer.",
          ],
          answer: 0,
          explain:
            "This is a list, not two independent clauses, so it needs a colon to introduce it, not a semicolon or a plain comma beforehand. Each list item already contains its own internal comma (name, then role), so using only commas throughout makes it impossible to tell where one item ends and the next begins. The correct choice uses a colon to introduce the list and semicolons to separate the individual comma-containing items.",
          difficulty: "easy",
          why: [null, "With only commas, you can't tell where one person ends and the next begins, since each item has its own comma.", "This drops the commas around each role and uses a comma to introduce the list. A list after a full clause needs a colon.", "A semicolon can't introduce a list. It needs a complete sentence on both sides."],
        },
        {
          q: "Three volunteers organized the event______ Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            ": Priya Nair, a teacher; Sam Okoye, a nurse; and Lena Fischer, a chef.",
            ": Priya Nair, a teacher, Sam Okoye, a nurse, and Lena Fischer, a chef.",
            ", Priya Nair a teacher, Sam Okoye a nurse, and Lena Fischer a chef.",
            "; Priya Nair, a teacher; Sam Okoye, a nurse; and Lena Fischer, a chef.",
          ],
          answer: 0,
          explain:
            "This is a list, not two independent clauses, so a colon introduces it, not a semicolon or a plain comma beforehand. Each item has its own internal comma (name, then job), so plain commas throughout would make it impossible to tell where one item ends and the next begins.",
          difficulty: "easy",
          why: [null, "Each item already has a comma inside it, so plain commas between items make the list impossible to read.", "This drops the commas around each job and uses a comma to introduce the list instead of a colon.", "A semicolon can't introduce a list. Only a colon can do that here."],
        },
        {
          q: "The scholarship went to two applicants______ Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            ": Wren Castillo, a graduate student; and Uma Bhatt, an undergraduate.",
            ": Wren Castillo, a graduate student, and Uma Bhatt, an undergraduate.",
            ", Wren Castillo a graduate student and Uma Bhatt an undergraduate.",
            "; Wren Castillo, a graduate student; and Uma Bhatt, an undergraduate.",
          ],
          answer: 0,
          explain:
            "Even with only two applicants instead of three, the same signal applies: each item already contains its own internal comma (name, then status), so the list needs a colon to introduce it and semicolons, not plain commas, to separate the items. Using only commas throughout creates ambiguity about where one applicant's description ends and the next begins; dropping the commas around each description entirely loses necessary detail-marking; and using a semicolon instead of a colon to introduce the list breaks the intro punctuation.",
          difficulty: "medium",
          why: [null, "Each name already has a comma before its description, so commas between items blur where one applicant ends.", "This drops the commas around each description and uses a comma to introduce the list instead of a colon.", "A semicolon can't introduce a list. It needs a complete sentence on both sides."],
        },
        {
          q: "The panel featured three speakers______ Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            ": Renata Souza, an economist; Devon Marsh; and Tolu Adeyemi, a policy analyst.",
            ": Renata Souza, an economist, Devon Marsh, and Tolu Adeyemi, a policy analyst.",
            ", Renata Souza an economist, Devon Marsh, and Tolu Adeyemi a policy analyst.",
            "; Renata Souza, an economist; Devon Marsh; and Tolu Adeyemi, a policy analyst.",
          ],
          answer: 0,
          explain:
            "Most items have internal commas (name plus role), but 'Devon Marsh' alone has no descriptor. Since at least one item in the list has an internal comma, plain commas throughout would still create ambiguity about where items begin and end — the rule applies to the whole list, not just the items with descriptions. Dropping necessary commas around the descriptions, or using a semicolon instead of a colon to introduce the list, are both errors of the same kind.",
          difficulty: "medium",
          why: [null, "Two of the items have internal commas, so plain commas between items make it unclear who is described by what.", "This drops the commas around the descriptions and introduces the list with a comma instead of a colon.", "A semicolon can't introduce a list. A colon is needed after \"three speakers.\""],
        },
        {
          q: "The panel included three judges______, each bringing a different kind of expertise. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            ": Dana Wu, a former Olympic gymnast; Reyes Alvarado, a retired judge; and Priya Nathan, a sports physician",
            ": Dana Wu a former Olympic gymnast, Reyes Alvarado a retired judge, and Priya Nathan a sports physician",
            ", Dana Wu, a former Olympic gymnast, Reyes Alvarado, a retired judge, and Priya Nathan, a sports physician,",
            "; Dana Wu, a former Olympic gymnast; Reyes Alvarado, a retired judge; and Priya Nathan, a sports physician",
          ],
          answer: 0,
          explain:
            "Each judge's name is followed by its own extra descriptive detail requiring commas on both sides, so plain commas separating the three list items too would make it impossible to tell where one judge's entry ends and the next begins. Dropping the commas around each description, or using a semicolon instead of a colon to introduce the list, are both errors of the same kind. The correct choice uses a colon to introduce the list and semicolons between the three items, while keeping the commas around each individual description.",
          difficulty: "hard",
          why: [null, "This drops the commas that set off each judge's description.", "With commas everywhere, you can't tell where each judge's entry ends. It also introduces the list with a comma.", "A semicolon can't introduce a list. A colon is needed after \"three judges.\""],
        },
        {
          q: "The bakery sells ______ every morning. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "muffins, scones, and croissants",
            "muffins; scones; and croissants",
            "muffins, scones; and croissants",
            "muffins scones and croissants",
          ],
          answer: 0,
          explain:
            "None of the items (muffins, scones, croissants) contains its own internal comma, so plain commas between them are perfectly clear on their own, with a comma before 'and' following standard serial-comma convention. Semicolons throughout the list are unnecessary here and would actually be a mistake in the other direction, since there's no ambiguity for them to resolve; dropping punctuation entirely is a plain error.",
          difficulty: "hard",
          why: [null, "Semicolons are only for lists whose items contain commas. These single words don't, so plain commas are right.", "Mixing a comma and a semicolon in the same simple list is inconsistent and incorrect.", "The items need commas between them. Without any, the list runs together."],
        },
      ],
      traps: [
        "Using commas throughout a list whose items already contain commas, creating ambiguity about what belongs to which item.",
        "Forgetting that even one comma-containing item is enough to require semicolons throughout the entire list, not just between the items that have descriptions.",
        "Overcorrecting by using semicolons in a simple list where no item actually contains an internal comma.",
      ],
    },
    {
      name: "Nonessential Appositives and Descriptive Phrases",
      explanation:
        "This pattern covers appositives: a word or phrase that renames or describes a nearby noun, like 'a retired firefighter' describing 'my uncle Raymond.' This isn't about separating list items; it's about correctly bracketing one piece of extra, droppable information. The core test: if the phrase is essential to knowing who or what's being discussed, it gets no commas. If it's just extra detail (the noun is already clear without it), it must be boxed off with commas, on both sides if it's mid-sentence, or one comma if it opens or closes the sentence.",
      examples: [
        {
          q: "My uncle Raymond ______ still volunteers at the local station. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [", a retired firefighter, ", " a retired firefighter ", ", a retired firefighter ", " a retired firefighter, "],
          answer: 0,
          explain:
            "'A retired firefighter' is extra descriptive information about 'my uncle Raymond' — not needed to know who's being discussed, since the name already tells us exactly who that is. Extra descriptive information dropped into the middle of a sentence needs to be boxed off on both sides with commas, like parentheses, ruling out the choices missing one or both commas.",
          difficulty: "easy",
          why: [null, "\"A retired firefighter\" is extra detail about Raymond, so it needs commas on both sides.", "There's an opening comma but no closing one. The extra detail has to be boxed off on both sides.", "There's a closing comma but no opening one. The extra detail has to be boxed off on both sides."],
        },
        {
          q: "Our neighbor Dr. Alvarez ______ now volunteers at the community clinic twice a week. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [", a retired pediatrician, ", " a retired pediatrician ", ", a retired pediatrician ", " a retired pediatrician, "],
          answer: 0,
          explain:
            "'A retired pediatrician' describes 'Dr. Alvarez' with extra, droppable detail — 'our neighbor Dr. Alvarez' already tells us exactly who's meant. Since the phrase falls in the middle of the sentence, it needs to be boxed off on both sides with commas, the same mid-sentence bracketing rule as any nonessential appositive.",
          difficulty: "easy",
          why: [null, "\"A retired pediatrician\" is extra detail about Dr. Alvarez, so it needs commas on both sides.", "The opening comma is there, but the closing comma after \"pediatrician\" is missing.", "The closing comma is there, but the opening comma before \"a retired\" is missing."],
        },
        {
          q: "The author ______ became a recluse after her novel's unexpected success. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [", Min-jin Lee, ", " Min-jin Lee ", ", Min-jin Lee ", " Min-jin Lee, "],
          answer: 0,
          explain:
            "'The author' already identifies one specific, identifiable person in this context, so 'Min-jin Lee' is extra information, not essential to knowing who's meant — unlike a phrase such as 'the author who wrote the novel,' where the identifying clause is necessary and would take no commas at all. Because the name here is extra, it needs to be boxed off with commas on both sides.",
          difficulty: "medium",
          why: [null, "\"The author\" already points to one specific person, so her name is extra and needs commas on both sides.", "The opening comma is there, but the closing comma after \"Lee\" is missing.", "The closing comma is there, but the opening comma before \"Min-jin\" is missing."],
        },
        {
          q: "______ Dr. Alvarez has treated three generations of families at the clinic. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "A retired pediatrician who still volunteers twice a week, ",
            "A retired pediatrician who still volunteers twice a week ",
            "A retired pediatrician, who still volunteers twice a week, ",
            ", A retired pediatrician who still volunteers twice a week, ",
          ],
          answer: 0,
          explain:
            "'A retired pediatrician who still volunteers twice a week' describes 'Dr. Alvarez,' but the descriptive phrase comes first, before the name it describes. Since there's nothing before the phrase to bracket (it opens the sentence), only one comma is needed, right after the phrase and before the name, not commas on both sides as in a mid-sentence appositive, and not a comma splitting the phrase itself.",
          difficulty: "medium",
          why: [null, "An introductory phrase needs a comma after it, before the name it describes.", "The comma after \"pediatrician\" wrongly splits \"who still volunteers\" from the noun it describes.", "Nothing comes before the opening phrase, so there's nothing for a leading comma to separate."],
        },
        {
          q: "The award went to Naledi Khumalo______ a fact organizers highlighted throughout the ceremony. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            ", the youngest winner in the competition's history, ",
            " the youngest winner in the competition's history ",
            ", the youngest winner in the competition's history",
            " the youngest winner in the competition's history,",
          ],
          answer: 0,
          explain:
            "'The youngest winner in the competition's history' is a mid-sentence appositive describing Naledi Khumalo and needs commas on both sides. The final phrase, 'a fact organizers highlighted throughout the ceremony,' is a second, end-of-sentence appositive describing the whole preceding claim rather than a single noun, and it still needs a comma introducing it, which the correct choice supplies by closing the first appositive properly. Choices that drop either comma around the first appositive break that mid-sentence bracketing rule.",
          difficulty: "hard",
          why: [null, "With no commas, the description runs straight into the name and into \"a fact organizers...\"", "The closing comma after \"history\" is missing, so the description runs into \"a fact organizers highlighted.\"", "The opening comma before \"the youngest\" is missing. The description needs commas on both sides."],
        },
      ],
      traps: [
        "Treating an appositive as if it needed to be joined like an independent clause, rather than simply set off with commas.",
        "Forgetting that a MID-SENTENCE nonessential appositive needs punctuation on BOTH sides (not just before), since it's 'inserted' into the sentence.",
        "Using two commas (or none) for an appositive that opens or closes a sentence, where only a single comma is needed since there's nothing on the other side to bracket.",
      ],
    },
    {
      name: "Introductory Phrases and Single-Boundary Commas",
      explanation:
        "This often-overlooked pattern involves a dependent phrase at the START of a sentence, followed by an independent clause. Unlike the first Boundaries pattern (two independent clauses), only ONE side is independent here — so a period or semicolon would be wrong, since both need independent clauses on both sides. The correct boundary is almost always a single comma right after the introductory phrase.",
      examples: [
        {
          q: "______ the flight departed on time. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["Despite the storm, ", "Despite the storm; ", "Despite the storm ", "Despite, the storm, "],
          answer: 0,
          explain:
            "'Despite the storm' is not a complete sentence on its own (it's a dependent prepositional phrase) while 'the flight departed on time' is independent. Since only one side is independent, a semicolon (which requires independent clauses on both sides) is wrong. The correct choice uses a single comma after the introductory phrase, before the independent clause begins.",
          difficulty: "easy",
          why: [null, "A semicolon needs a complete sentence on both sides. \"Despite the storm\" can't stand alone.", "An introductory phrase like this needs a comma before the main clause begins.", "The comma after \"Despite\" splits the preposition from its object, \"the storm.\""],
        },
        {
          q: "______ the results still revealed a clear pattern. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "Although the survey received far fewer responses than expected, ",
            "Although the survey received far fewer responses than expected; ",
            "The survey received far fewer responses than expected, ",
            "Although the survey received far fewer responses than expected ",
          ],
          answer: 0,
          explain:
            "'The survey received far fewer responses than expected' has its own subject and verb, so it can look complete on its own, but 'although' at the front stops it from actually standing alone. Since only the second part can truly stand on its own, this is a single-boundary case: one comma after the lead-in, not a semicolon, which would require both sides to be independent.",
          difficulty: "medium",
          why: [null, "A semicolon needs a complete sentence on both sides, and \"Although...\" can't stand alone.", "Without \"although,\" the first part is a complete sentence, so joining it to the next one with only a comma is a comma splice.", "The introductory \"although\" clause needs a comma before the main clause."],
        },
        {
          q: "______ the festival finally opened to the public. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["After months of planning, ", "After months of planning; ", "After months of planning ", "After, months of planning, "],
          answer: 0,
          explain:
            "'After months of planning' is not a complete sentence on its own (it's a dependent introductory phrase) while 'the festival finally opened to the public' is independent. Since only one side is independent, a semicolon would be wrong. A single comma after the introductory phrase is correct.",
          difficulty: "easy",
          why: [null, "A semicolon needs a complete sentence on both sides. \"After months of planning\" can't stand alone.", "The introductory phrase needs a comma before the main clause begins.", "The comma after \"After\" splits the preposition from its object."],
        },
        {
          q: "______ doctors still lack a reliable early screening test. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "Despite years of research into the disease's underlying causes, ",
            "Despite years of research, into the disease's underlying causes, ",
            "Despite years of research into the disease's underlying causes; ",
            "Despite years of research into the disease's underlying causes ",
          ],
          answer: 0,
          explain:
            "The whole stretch 'Despite years of research into the disease's underlying causes,' including its own internal phrases, is still just one introductory unit modifying the independent clause that follows. Even though it's long, it still takes exactly one comma before the independent clause begins, placed after 'causes' — not earlier within the phrase, and not a semicolon, which would require independence on both sides.",
          difficulty: "medium",
          why: [null, "The comma after \"research\" breaks one introductory phrase in the middle. The only comma belongs after \"causes.\"", "A semicolon needs complete sentences on both sides, and the \"Despite...\" phrase can't stand alone.", "The long introductory phrase still needs a comma before the main clause."],
        },
        {
          q: "______ the committee still could not reach a unanimous decision. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "Having reviewed every application twice, ",
            "Having reviewed every application twice; ",
            "Having reviewed every application twice ",
            "Having, reviewed every application twice, ",
          ],
          answer: 0,
          explain:
            "'Having reviewed every application twice' has no subject of its own, since it's a participial phrase describing an implied actor (the committee), not a complete clause, while 'the committee still could not reach a unanimous decision' is independent. This is the same single-boundary case as an introductory phrase beginning with 'despite' or 'although,' even though this one opens with an '-ing' participle: a single comma after the introductory phrase is correct.",
          difficulty: "hard",
          why: [null, "A semicolon needs complete sentences on both sides. \"Having reviewed...\" has no subject and can't stand alone.", "The introductory phrase needs a comma before the main clause.", "The comma after \"Having\" splits the verb from its object."],
        },
      ],
      traps: [
        "Applying the 'semicolon or period' rule from the independent-clause pattern to a sentence where only one side is actually independent.",
        "Missing that dependent, introductory phrases (starting with prepositions like 'despite,' 'after,' 'because of,' or participles like 'having reviewed') still need a comma before the main clause, even though they're short or unfamiliar-looking.",
      ],
    },
    {
      name: "Possessive vs. Plural Noun Forms",
      explanation:
        "These questions test whether a noun needs a plain plural (-s), or a possessive (apostrophe+s, or just an apostrophe after an existing -s). All three sound identical out loud, so you can't rely on your ear — you have to check the grammar. Ask: what job is the noun doing? If it's just naming more than one of something, with nothing after it being 'owned,' use the plain plural with no apostrophe. If another noun right after it is being possessed, add an apostrophe: apostrophe+s for one owner, apostrophe alone (after the -s) for more than one owner. Count how many owners the sentence actually describes before deciding.",
      examples: [
        {
          q: "The two ______ identities have never been publicly confirmed. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["ghostwriters'", "ghostwriter's", "ghostwriters", "ghostwriters's"],
          answer: 0,
          explain:
            "'Identities' follows the noun — something the ghostwriters possess, so this needs a possessive form, not a plain plural. The sentence says 'two,' so this is plural possession, and for a plural owner the apostrophe goes after the existing -s: ghostwriters', not ghostwriter's, which would wrongly imply only one owner, or ghostwriters's, which isn't a standard English form at all.",
          difficulty: "easy",
          why: [null, "\"Ghostwriter's\" means one ghostwriter, but the sentence says \"two.\"", "Something belongs to them (identities), so this needs a possessive, not a plain plural.", "\"Ghostwriters's\" isn't a standard form. A plural ending in -s just takes an apostrophe after it."],
        },
        {
          q: "Many ______ personal stories go untold in official histories. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["immigrants'", "immigrant's", "immigrants", "immigrants's"],
          answer: 0,
          explain:
            "'Stories' follows the noun — these are stories the immigrants possess, so a plain plural won't work. 'Many' signals more than one owner, so this needs the plural possessive form, with the apostrophe after the -s: immigrants'.",
          difficulty: "easy",
          why: [null, "\"Immigrant's\" is one immigrant, but \"many\" means more than one.", "The stories belong to the immigrants, so this needs a possessive, not a plain plural.", "\"Immigrants's\" isn't a standard form. A plural ending in -s just takes an apostrophe."],
        },
        {
          q: "The research team credited three separate laboratories for the discovery; the ______ combined data made the pattern clear. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["laboratories'", "laboratory's", "laboratories", "laboratorys'"],
          answer: 0,
          explain:
            "'Combined data' follows the noun: data the laboratories possess together, so this needs a possessive, not a plain plural. The sentence explicitly says 'three separate laboratories,' confirming multiple owners, so the plural possessive is correct: laboratories', apostrophe after the existing -s, not laboratory's, which would wrongly suggest a single lab, and 'laboratorys'' isn't even how the plural is spelled.",
          difficulty: "medium",
          why: [null, "\"Laboratory's\" is one lab, but the sentence says three separate laboratories.", "The data belongs to the labs, so this needs a possessive, not a plain plural.", "The plural is spelled \"laboratories,\" not \"laboratorys.\""],
        },
        {
          q: "The final report was reviewed and approved by three ______ before publication. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["researchers", "researcher's", "researchers'", "researchers's"],
          answer: 0,
          explain:
            "Nothing directly after 'researchers' is being possessed; the sentence just moves on to 'before publication.' Since there's no noun being possessed, this is simply naming multiple people, not showing ownership, so a plain plural with no apostrophe is correct — both possessive forms are traps here.",
          difficulty: "medium",
          why: [null, "Nothing after the blank belongs to the researcher; \"before publication\" isn't something owned. No apostrophe is needed.", "Nothing follows that the researchers own, so a possessive has nothing to attach to.", "Nothing is being owned, and \"researchers's\" isn't a standard form anyway."],
        },
        {
          q: "The museum's newest exhibit displays several ______ early sketches alongside a single sculptor's finished bronze piece. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["artists'", "artist's", "artists", "artist's's"],
          answer: 0,
          explain:
            "The sentence already correctly uses two other possessives ('museum's' for one museum, 'sculptor's' for one sculptor) as a model. 'Sketches' follows the blank, and 'several' signals more than one artist possessing them jointly, so the plural possessive matches the pattern: artists', not artist's (one owner) or artists (no ownership at all).",
          difficulty: "hard",
          why: [null, "\"Artist's\" means one artist, but \"several\" means more than one.", "The sketches belong to the artists, so this needs a possessive, not a plain plural.", "\"Artist's's\" isn't a real form. Several artists need \"artists'.\""],
        },
      ],
      traps: [
        "Adding an apostrophe to a plain plural noun that isn't possessing anything in the sentence.",
        "Using the singular possessive form (apostrophe+s) when the sentence establishes more than one owner, which requires the apostrophe after the plural -s instead.",
        "Confusing this rule with the separate its/it's distinction — 'its' is already possessive with no apostrophe, while 'it's' is only ever a contraction of 'it is,' never a possessive.",
      ],
    },
    {
      name: "Recognizing When No Punctuation Is Needed",
      explanation:
        "Every other Boundaries pattern is about adding correct punctuation. This one's the opposite: sometimes the right answer has NO punctuation at all, and the wrong choices tempt you with a comma, dash, or colon that looks plausible but isn't actually justified. This usually happens between a subject and its verb, between a verb and its direct object, between a preposition and its object, or before a short phrase that isn't really nonessential. Two versions come up often. A short title or descriptor with no 'a' or 'the' in front of it, as in 'biologist Ana Ruiz,' works like part of the name, so no comma separates it from the name. And a 'that' clause is always essential, so it never takes a comma; when a noun is followed by a clause of its own, 'that' is often the word that attaches the clause and keeps the sentence from becoming a run-on, while the wrong choices swap in a comma plus 'it' or 'they' (a comma splice). Apply the same 'what's on each side' checks you use everywhere else in Boundaries — and don't assume one choice must add punctuation just because the others do. Treat 'no punctuation' as a real option every time.",
      examples: [
        {
          q: "The negotiators finally agreed ______ a compromise that satisfied both delegations. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["on", "on,", ", on", "to on"],
          answer: 0,
          explain:
            "'Agreed on' is a single verb phrase, and 'a compromise' is its direct object — there's no boundary here at all, just a verb followed by what it acts on. Inserting a comma between a verb phrase and its object breaks the sentence's core grammar, and 'to on' isn't idiomatic English at all. The correct choice has no punctuation and uses the correct preposition alone.",
          difficulty: "easy",
          why: [null, "A comma between \"agreed on\" and its object splits a verb from what it acts on.", "A comma between \"agreed\" and \"on\" breaks the verb phrase apart.", "\"Agreed to on\" isn't idiomatic English. It's \"agreed on.\""],
        },
        {
          q: "Visitors are asked to remain seated ______ performance to avoid disrupting other guests. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["during the", "during, the", "during the,", "during; the"],
          answer: 0,
          explain:
            "'During' is a preposition and 'the performance' is its object — together they form one tightly bound unit with no internal boundary. A comma or semicolon between a preposition and its object is never correct, regardless of how long the surrounding sentence is.",
          difficulty: "easy",
          why: [null, "A comma between \"during\" and \"the performance\" splits a preposition from its object.", "A comma between \"the\" and \"performance\" splits the noun phrase apart.", "A semicolon needs complete sentences on both sides. Here it breaks a preposition from its object."],
        },
        {
          q: "The committee's chair, Dr. Alvarez______ announced the new research funding priorities at the meeting. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [",", "", ";", ":"],
          answer: 0,
          explain:
            "Since 'the committee's chair' already uniquely identifies one specific person, the name that follows is a nonessential appositive and does need commas on both sides — this is a trap in the other direction, testing whether you over-correct toward 'no punctuation' once you've learned to watch for it. The correct choice keeps the comma after 'Alvarez,' matching the comma already present before the name.",
          difficulty: "medium",
          why: [null, "The name has a comma before it, so it needs a matching comma after it. Leaving it out breaks the pair.", "A semicolon needs complete sentences on both sides. Here it cuts the subject off from its verb.", "A colon here would cut the subject off from its verb, \"announced.\""],
        },
        {
          q: "The festival's organizers decided______ to postpone the outdoor concert until the storm passed. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["", ",", ";", ":"],
          answer: 0,
          explain:
            "'Decided' is the main verb, and 'to postpone the outdoor concert until the storm passed' is its infinitive-phrase object, answering 'decided what?' A verb and the infinitive phrase completing its meaning form one unbroken grammatical unit, just like a verb and a direct-object noun, so no punctuation belongs between them.",
          difficulty: "medium",
          why: [null, "A comma splits the verb \"decided\" from what was decided.", "A semicolon needs complete sentences on both sides, and \"to postpone...\" isn't one.", "A colon here would split the verb from its object. Nothing needs introducing."],
        },
        {
          q: "Employees who arrive after nine o'clock______ must sign in at the front desk before entering the building. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["", ",", ";", ":"],
          answer: 0,
          explain:
            "'Who arrive after nine o'clock' is a restrictive relative clause — it specifies which employees the sentence is about, not extra removable detail about all employees. Removing it would change the sentence's meaning entirely, from a rule about latecomers to a rule about everyone, which is the signature of an essential, restrictive clause. Restrictive clauses never take a comma (or semicolon or colon) before them, so no punctuation is correct.",
          difficulty: "hard",
          why: [null, "\"Who arrive after nine o'clock\" tells you which employees. Essential information like that takes no comma.", "A semicolon cuts the subject off from its verb, \"must sign in.\"", "A colon here would split the subject from its verb."],
        },
        {
          q: "Archaeologists excavating the Vessa hillfort in northern Portugal have uncovered the site's oldest known structure, a circular stone ______ the fort's defensive walls by roughly three centuries.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["hearth, it predates", "hearth that predates", "hearth, that predates", "hearth it predates"],
          answer: 1,
          explain:
            "Everything before the blank is already a complete sentence, ending with the phrase 'a circular stone hearth' that renames 'the site's oldest known structure.' The words after the blank need a verb and a way to attach to the sentence. 'That' does the attaching: 'a circular stone hearth that predates the fort's defensive walls' is one unit, and since 'that' clauses are essential, no comma goes before 'that.' Swapping 'that' for 'it' creates a second complete sentence: joined by only a comma it's a comma splice, and with no punctuation it's a run-on.",
          difficulty: "hard",
          why: ["\"It predates the fort's defensive walls...\" is a complete sentence, so joining it to the first with only a comma creates a comma splice.", null, "\"That\" clauses are essential and never take a comma before them.", "\"It predates...\" is a complete sentence, and with no punctuation or connecting word, the two sentences run together."],
        },
      ],
      traps: [
        "Inserting a comma between a verb (or preposition) and the object that directly completes it, just because a comma is offered as an option.",
        "Over-correcting once you've learned to watch for 'no punctuation needed' cases, and removing a comma that's actually required around a genuine nonessential element.",
        "Treating a restrictive (essential, no-comma) clause and a nonessential (comma-both-sides) clause as interchangeable — the test is always whether removing the clause changes who or what the sentence is actually about.",
        "Putting a comma between a short title and the name right after it ('biologist, Ana Ruiz') — with no 'a' or 'the' in front, the title works like part of the name.",
        "Adding a comma before a 'that' clause, or replacing 'that' with a comma plus 'it' or 'they' — 'that' never takes a comma, and without it the sentence becomes a comma splice or run-on.",
      ],
    },
    {
      name: "Using a Colon to Introduce a List, Explanation, or Elaboration",
      explanation:
        "A colon can introduce more than just a second independent clause; it can introduce a list, a phrase that renames something just mentioned, or an explanation. Unlike a semicolon, what follows a colon doesn't need to be a complete sentence; a list or a single explanatory phrase works fine. What matters is the OTHER side: everything before the colon must be a complete, independent clause that could stand on its own, even if what follows it can't.",
      examples: [
        {
          q: "The museum's mission statement emphasizes one goal above all others______ preserving the collection for future generations. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " and"],
          answer: 0,
          explain:
            "The left side, 'The museum's mission statement emphasizes one goal above all others,' is a complete, independent clause. The right side, 'preserving the collection for future generations,' is a phrase renaming that 'one goal,' not a full independent clause, so a semicolon (which needs independent clauses on both sides) won't work, and a plain comma would create a run-on. A colon is correct: independent clause on the left, an elaborating phrase on the right.",
          difficulty: "easy",
          why: [null, "A comma here runs the explanation onto the clause without signaling that it names the goal. A colon is what introduces it.", "A semicolon needs a complete sentence on both sides, but \"preserving the collection...\" isn't one.", "\"And\" would make preserving the collection a second thing, not the one goal being named."],
        },
        {
          q: "Before the expedition departed, the team packed everything they would need______ tents, dried food, water filters, and a satellite phone. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " like"],
          answer: 0,
          explain:
            "The part before the blank, 'the team packed everything they would need,' is a complete independent clause. What follows is a list of items, not an independent clause, so this isn't a case for a semicolon between two full sentences. A colon correctly introduces the list, since only the clause before it needs to be independent.",
          difficulty: "easy",
          why: [null, "A comma doesn't introduce a list after a complete sentence. That's a colon's job.", "A semicolon needs a complete sentence on both sides. A list of items isn't one.", "\"Like\" suggests these are just examples, but the sentence says they packed \"everything they would need.\""],
        },
        {
          q: "The engineers faced a single unavoidable constraint______ the bridge's total weight could not exceed the old foundation's original rating. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " and"],
          answer: 0,
          explain:
            "Both sides here happen to be complete independent clauses, so a semicolon would technically work grammatically too — but the second clause specifically explains and defines the 'single unavoidable constraint' named in the first, which is exactly the elaboration relationship a colon signals. A plain comma would create a run-on.",
          difficulty: "medium",
          why: [null, "Both sides are complete sentences, so a comma alone is a comma splice.", "A semicolon only says the ideas are related. The second clause defines the constraint the first announces, which is what a colon signals.", "\"And\" treats the second clause as a new point, when it actually spells out the constraint."],
        },
        {
          q: "Coral reefs depend on a delicate balance______ too much warming kills the algae reefs need, while too little sunlight starves that same algae. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " because"],
          answer: 0,
          explain:
            "'Coral reefs depend on a delicate balance' is a complete independent clause introducing an abstract idea that needs unpacking. What follows explains what that balance actually consists of, in two parts joined by 'while.' A colon correctly signals 'here's what that balance means,' even though what follows is a more complex, two-part explanation rather than a short phrase.",
          difficulty: "medium",
          why: [null, "The explanation that follows is a full clause, so a comma alone runs it onto the first sentence.", "A semicolon only says the ideas are related. The second part spells out what the balance is, which calls for a colon.", "\"Because\" makes it a cause, but what follows describes the balance itself rather than why reefs depend on it."],
        },
        {
          q: "The archive's newest acquisition is remarkable for a simple reason______ it is the only surviving copy of the pamphlet, the printer's original plates having been destroyed in a fire decades ago. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " and"],
          answer: 0,
          explain:
            "'The archive's newest acquisition is remarkable for a simple reason' is independent and sets up an expectation: what is that reason? What follows directly answers that expectation, ruling out a plain comma (which would create a run-on) and favoring the colon's 'here's the reason' function over a semicolon's 'separate but related' function. The trailing modifier about the printer's plates is nonessential background and doesn't change which mark belongs right after 'reason.'",
          difficulty: "hard",
          why: [null, "What follows is a complete sentence, so a comma alone creates a comma splice.", "A semicolon only links related ideas. The first clause promises a reason and the second delivers it, which is a colon's job.", "\"And\" treats the reason as a separate point instead of the reason the first clause promised."],
        },
      ],
      traps: [
        "Assuming a colon always needs a full independent clause on both sides, the way a semicolon does — a colon only requires that of the clause before it.",
        "Choosing a semicolon when the relationship between the two sides is 'this explains/defines that' rather than 'these are two separate, equally weighted points' — that explanatory relationship is a colon's specific job.",
        "Using a colon after an incomplete introductory phrase (like 'such as' or 'including') that isn't itself a full independent clause.",
        "Using a comma, or no punctuation, after a complete sentence that introduces a list or explanation — that 'here's what I mean' job belongs to a colon.",
      ],
    },
    {
      name: "Direct vs. Embedded Questions",
      explanation:
        "These questions end a sentence with a question-like clause, and the choices change the word order and the end mark: 'whether the birds had returned.' / 'had the birds returned?' / 'the birds had returned?' / 'whether had the birds returned?' First decide whether the text is actually asking a question or just reporting one. If the question is tucked inside a statement, after words like 'wondered,' 'asked,' 'investigated,' 'cannot say,' or 'to determine,' it's an embedded question: keep normal statement order, with the subject before the verb ('how the birds navigate'), and end with a period. If the text poses the question itself (as its own sentence, after a colon, or as the main clause after an 'if' clause), it's a direct question: put the helping verb before the subject ('How do the birds navigate?') and end with a question mark. Wrong answers mix the two, pairing question order with a period or statement order with a question mark.",
      examples: [
        {
          q: "For years, hikers on the Tallow Ridge trail noticed that one patch of snow near the summit survived long into August. Geologist Ines Varga wondered ______\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["why did the snow last so long?", "why the snow lasted so long?", "why the snow lasted so long.", "why did the snow last so long."],
          answer: 2,
          explain:
            "The sentence is a statement: it reports what Varga wondered rather than asking the question itself. A question folded into a statement like this is an embedded question, so it keeps statement order (the subject 'the snow' before the verb 'lasted') and ends with a period. Question order ('did the snow last') belongs only to a direct question, and a question mark doesn't fit a sentence that isn't asking anything.",
          difficulty: "easy",
          why: ["The sentence reports what Varga wondered; it doesn't ask the question directly. That calls for statement order and a period.", "The word order is right, but the sentence is a statement about her wondering, so it ends with a period.", null, "\"Did the snow last\" is direct-question order. Inside a statement after \"wondered,\" the order is \"the snow lasted.\""],
        },
        {
          q: "The bar-tailed godwit, a long-legged shorebird, can fly more than 11,000 kilometers from Alaska to New Zealand without stopping to eat or rest. ______ Researchers tracking the birds with tiny satellite tags have begun to piece together an answer.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["How does a bird fuel such a long journey?", "How a bird fuels such a long journey?", "How does a bird fuel such a long journey.", "How a bird fuels such a long journey."],
          answer: 0,
          explain:
            "The blank is a sentence of its own, and the next sentence talks about 'an answer,' so the text is posing a question directly. A direct question puts the helping verb before the subject ('does a bird fuel') and ends with a question mark. Statement order ('a bird fuels') can't make a question on its own: with a period it's just a fragment, and with a question mark it's still missing the helping verb. Question order with a period mixes the two forms.",
          difficulty: "easy",
          why: [null, "A direct question needs the helping verb before the subject: \"How does a bird fuel...\"", "This is a direct question, so it ends with a question mark, not a period.", "\"How a bird fuels such a long journey\" isn't a complete sentence; it's a fragment."],
        },
        {
          q: "Cuttlefish can match the colors of their surroundings in less than a second, yet their eyes contain only one type of light-sensitive cell, which suggests that they cannot see color at all. In a series of experiments, marine biologist Ruth Okafor investigated ______\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["how could the animals match colors they cannot see?", "how the animals could match colors they cannot see?", "how could the animals match colors they cannot see.", "how the animals could match colors they cannot see."],
          answer: 3,
          explain:
            "'Okafor investigated how...' is a statement reporting her research, so the question after 'investigated' is embedded. It keeps statement order (the subject 'the animals' before the helping verb 'could') and ends with a period. 'Could the animals match' is direct-question order, and a question mark doesn't belong at the end of a statement, even a statement about a question.",
          difficulty: "medium",
          why: ["After \"investigated,\" the question is part of a statement, so it takes statement order and a period, not \"could the animals\" and a question mark.", "The word order is right, but the sentence states what Okafor investigated; it isn't asking anything, so it ends with a period.", "\"Could the animals match\" is direct-question order. After \"investigated,\" the subject comes first: \"the animals could match.\"", null],
        },
        {
          q: "When the town of Ridley bought its abandoned train station in 2019, officials planned to turn the building into a public library. But the committee in charge of the project spent months on a question that divided residents: ______\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["whether the library should keep the station's brick front or replace it entirely?", "should the library keep the station's brick front or replace it entirely?", "the library should keep the station's brick front or replace it entirely?", "should the library keep the station's brick front or replace it entirely."],
          answer: 1,
          explain:
            "A colon can introduce a question that the text asks directly, and here the text is stating the committee's question itself. So it takes direct-question form: the helping verb 'should' comes before the subject 'the library,' and the sentence ends with a question mark. A 'whether' clause is an embedded question, so it can't end with a question mark. Statement order with a question mark isn't a real question, and question order needs a question mark, not a period.",
          difficulty: "medium",
          why: ["A \"whether\" clause is an embedded question, so it can't end with a question mark.", null, "Statement order (\"the library should\") with a question mark mixes the two forms. A direct question puts \"should\" first.", "\"Should the library keep...\" is a direct question, so it needs a question mark."],
        },
        {
          q: "Astronomers have long known that a comet's tail always points away from the sun, even after the comet swings around the sun and heads back toward the outer solar system. If the tail were simply dust and gas left behind by the moving comet, ______ Astronomer Leonora Hask was determined to find out.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["why it led the way as the comet traveled outward.", "why did it lead the way as the comet traveled outward.", "why did it lead the way as the comet traveled outward?", "why it led the way as the comet traveled outward?"],
          answer: 2,
          explain:
            "The sentence opens with an 'if' clause, which can't stand alone, so the words in the blank must supply the main clause. That main clause is a question the text asks outright, and the next sentence ('Hask was determined to find out') treats it as an open question. So it needs direct-question form: 'did' before the subject 'it,' and a question mark. Statement order ('why it led the way') can't serve as a main clause, so with either end mark the sentence would be left with nothing but an 'if' clause and an embedded question. Question order with a period mixes the two forms.",
          difficulty: "hard",
          why: ["\"Why it led the way...\" can't serve as the main clause, so the sentence is left with only an \"if\" clause and no main clause.", "\"Why did it lead the way\" is direct-question order, so it needs a question mark, not a period.", null, "Statement order with a question mark mixes the forms, and \"why it led the way\" still can't serve as the main clause after the \"if\" clause."],
        },
      ],
      traps: [
        "Ending an embedded question with a question mark — 'She wondered why the lake froze' is a statement about a question, so it ends with a period.",
        "Using question word order inside an embedded question ('investigated how did the birds navigate'); once a question is folded into a statement, the subject comes before the verb.",
        "Writing a direct question in statement order or with a period — a direct question needs the helping verb (do, did, could, should) before the subject and a question mark at the end.",
        "Missing the signs that the text is asking a question itself: the question stands as its own sentence, follows a colon, serves as the main clause after an 'if' clause, or is followed by a line like 'She was determined to find out.'",
      ],
    },
  ],
  tipsAndTricks: [
    "First diagnostic, always: is each side of the punctuation mark a complete, independent clause? This single question determines almost every Boundaries answer.",
    "If a list's items already contain internal commas (like a name plus a role), that's your signal to use semicolons between items and a colon to introduce the list.",
    "A comma alone between two full, independent sentences is called a comma splice, and it's wrong — this is the single most common trap on this subskill.",
    "Nonessential information (extra descriptive detail you could remove without losing the sentence's core meaning) needs punctuation on both sides, like a pair of parentheses.",
  ],
};

const LC_RW_FORM_STRUCTURE: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Subject-Verb Agreement with Distracting Phrases",
      explanation:
        "This pattern tests whether you can find a sentence's TRUE subject — especially when other nouns sit between the subject and its verb (often inside a prepositional phrase or between commas) and create a false impression of the right verb form. The fix: mentally cross out any phrase or clause that interrupts the subject and verb, then check agreement using only what's left.",
      examples: [
        {
          q: "The list of items ______ long. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["is", "are", "were", "have been"],
          answer: 0,
          explain:
            "Cross out the prepositional phrase 'of items' — it's not the subject, just a modifier. What remains is 'The list ______ long,' making 'list' (singular) the true subject, not 'items' (plural). A singular subject requires a singular verb.",
          difficulty: "easy",
          why: [null, "\"Items\" is inside the phrase \"of items.\" The subject is \"list,\" which is singular, so the verb must be singular.", "\"Were\" is plural, but the subject is \"list,\" which is singular. \"Items\" is part of a modifying phrase.", "\"Have been\" is plural, but the subject is \"list,\" which is singular."],
        },
        {
          q: "The collection of rare manuscripts ______ housed in a climate-controlled room. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["is", "are", "were", "have been"],
          answer: 0,
          explain:
            "Cross out 'of rare manuscripts' — it's just extra description, not the subject. What remains is 'The collection ______ housed,' making 'collection' (singular) the true subject, not 'manuscripts' (plural). A singular subject needs a singular verb.",
          difficulty: "medium",
          why: [null, "\"Manuscripts\" is inside \"of rare manuscripts.\" The subject is \"collection,\" singular, so it needs \"is.\"", "\"Were\" is plural and past tense, but the subject is \"collection,\" which is singular.", "\"Have been\" is plural, but the subject is \"collection,\" which is singular."],
        },
        {
          q: "The box of old photographs ______ in the attic. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["sits", "sit", "were sitting", "have sat"],
          answer: 0,
          explain:
            "Cross out 'of old photographs' — it's a modifier, not the subject. What remains is 'The box ______ in the attic,' making 'box' (singular) the true subject, not 'photographs' (plural). A singular subject needs a singular verb.",
          difficulty: "easy",
          why: [null, "\"Sit\" matches \"photographs,\" but that's inside the phrase \"of old photographs.\" The subject is \"box,\" singular.", "\"Were sitting\" is plural, but the subject is \"box,\" which is singular.", "\"Have sat\" is plural, but the subject is \"box,\" which is singular."],
        },
        {
          q: "The results of the survey conducted across all twelve regions ______ still being reviewed by the committee. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["are", "is", "was", "has been"],
          answer: 0,
          explain:
            "Cross out both modifying phrases ('of the survey' and 'conducted across all twelve regions') neither is the subject. What remains is 'The results ______ still being reviewed,' making 'results' (plural) the true subject, not the nearby singular 'survey.' A plural subject needs a plural verb.",
          difficulty: "medium",
          why: [null, "\"Is\" matches \"survey,\" but that's inside a modifying phrase. The subject is \"results,\" which is plural.", "\"Was\" is singular, but the subject is \"results,\" which is plural.", "\"Has been\" is singular, but the subject is \"results,\" which is plural."],
        },
        {
          q: "The committee ______ divided on how to proceed, with several members favoring a different plan than the majority. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["is", "are", "were", "have been"],
          answer: 0,
          explain:
            "'Committee' is a collective noun — in standard American usage, it's treated as singular even when the sentence describes disagreement among the individuals within it. The phrase 'with several members favoring a different plan' might tempt a plural verb, but the grammatical subject is still 'the committee' as one unit, not 'the members.'",
          difficulty: "hard",
          why: [null, "The subject is \"the committee,\" which is treated as one unit and takes a singular verb, even though its members disagree.", "\"Were\" is plural, but \"committee\" is a singular collective noun here.", "\"Have been\" is plural, but \"committee\" takes a singular verb."],
        },
      ],
      traps: [
        "Matching the verb to the nearest noun (often inside a prepositional phrase) instead of the sentence's true subject.",
        "Getting tripped up by collective nouns (like 'data' or 'the committee') that can take either singular or plural verbs depending on formal usage conventions.",
        "With 'either... or' and 'neither... nor,' matching the verb to the first subject instead of the one closest to the verb.",
      ],
    },
    {
      name: "Parallel Structure in Lists and Comparisons",
      explanation:
        "This pattern tests whether all items in a list (or both sides of a comparison) use matching grammatical forms: all -ing forms, all infinitives, or all plain verbs, never a mix. The trap answer usually shifts form partway through the list (two -ing verbs, then suddenly an infinitive), which sounds subtly 'off' even if you can't name the rule. The fix: find the form used by the first item or two, then require every other item to match it exactly.",
      examples: [
        {
          q: "She enjoys hiking, swimming, and ______. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["biking", "to bike", "bikes", "having biked"],
          answer: 0,
          explain:
            "'Hiking' and 'swimming' are both -ing (gerund) forms, so the third item in the list must match this same form to maintain parallel structure. 'To bike' (infinitive) and 'bikes' (plain verb) don't match the established -ing pattern.",
          difficulty: "easy",
          why: [null, "\"Hiking\" and \"swimming\" are -ing forms, so the third item must be too. \"To bike\" breaks the pattern.", "\"Bikes\" doesn't match the -ing pattern of \"hiking\" and \"swimming.\"", "\"Having biked\" isn't the same form as \"hiking\" and \"swimming.\" The list needs a plain -ing word."],
        },
        {
          q: "The workshop taught participants how to negotiate contracts, resolve disputes, and ______ effective teams. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["build", "building", "built", "to build"],
          answer: 0,
          explain:
            "After 'how to,' the list uses plain verb forms — 'negotiate' and 'resolve,' not 'negotiating' or 'to resolve.' The third item must match that same plain-verb form to stay parallel; 'building' breaks the pattern set by the first two items.",
          difficulty: "medium",
          why: [null, "After \"how to,\" the list uses plain verbs: \"negotiate,\" \"resolve.\" \"Building\" breaks that pattern.", "\"Built\" is past tense, but the list uses plain verbs after \"how to.\"", "\"To\" is already covered by \"how to\" at the start. Repeating it breaks the pattern of \"negotiate\" and \"resolve.\""],
        },
        {
          q: "The workshop covers writing clear emails, giving effective feedback, and ______. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "leading meetings efficiently",
            "to lead meetings efficiently",
            "leads meetings efficiently",
            "having led meetings efficiently",
          ],
          answer: 0,
          explain:
            "'Writing' and 'giving' are both -ing forms, so the third item must match this same -ing form. 'To lead' (infinitive), 'leads' (plain verb), and 'having led' (perfect participle) don't match the established pattern.",
          difficulty: "easy",
          why: [null, "\"Writing\" and \"giving\" are -ing forms, so the third item must be too. \"To lead\" breaks the pattern.", "\"Leads\" doesn't match the -ing pattern of \"writing\" and \"giving.\"", "\"Having led\" isn't the same form as \"writing\" and \"giving.\""],
        },
        {
          q: "The new policy was designed not only to reduce costs but also ______ employee satisfaction. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["to improve", "improving", "improves", "improved"],
          answer: 0,
          explain:
            "'To reduce' is an infinitive in the first half of the 'not only... but also' comparison, so the second half must match this same infinitive form. 'Improving' (gerund) and 'improves'/'improved' (plain verb forms) don't match — parallel structure applies to comparisons, not just lists.",
          difficulty: "medium",
          why: [null, "The first half uses \"to reduce,\" so the second half must also use a \"to\" verb. \"Improving\" breaks the parallel.", "\"Improves\" doesn't match \"to reduce.\" Both halves of \"not only... but also\" need the same form.", "\"Improved\" doesn't match \"to reduce\" in the first half."],
        },
        {
          q: "The report concluded that the delays were caused by outdated equipment, that funding had been mismanaged for years, and ______. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "that morale among staff had declined sharply",
            "declining staff morale",
            "staff morale had declined sharply",
            "morale among staff, which had declined sharply",
          ],
          answer: 0,
          explain:
            "The first two items are both full 'that + clause' structures, so the third item must match this same shape rather than shrink into a shorter noun phrase or drop 'that' entirely. A shorter phrase like 'declining staff morale' would be grammatical on its own but breaks the parallel pattern across the whole list.",
          difficulty: "hard",
          why: [null, "The first two items are full \"that\" clauses. A short noun phrase breaks the parallel structure.", "This drops \"that,\" so it no longer matches the first two items, which both start with \"that.\"", "This turns the item into a noun with a description instead of a \"that\" clause like the others."],
        },
      ],
      traps: [
        "Choosing a grammatically 'valid' phrase on its own that nonetheless breaks the parallel form established by the rest of the list.",
        "Missing parallel structure requirements in comparisons (not just lists) — e.g., 'not only... but also' constructions require matching forms on both sides.",
      ],
    },
    {
      name: "Pronoun Agreement and Reference",
      explanation:
        "This pattern checks whether a pronoun correctly matches the noun it refers back to, in number (singular or plural), and whether that noun is clear and unambiguous. One common trap: words like 'each' and 'neither' are singular, and need singular pronouns, even though they might feel like they're describing a group. Many of these questions also test form along with number by mixing possessives with sound-alike contractions. The possessives 'its,' 'their,' and 'whose' never take an apostrophe; 'it's,' 'they're,' and 'who's' are contractions meaning 'it is,' 'they are,' and 'who is' (or 'has'); and 'there' points to a place. So work in two steps: find the antecedent and decide singular or plural (two people, like 'Maria and her brother,' take 'their,' never 'its'), then check whether the blank needs a possessive in front of a noun or a subject and verb like 'they are.'",
      examples: [
        {
          q: "Each of the students submitted ______ essay by the deadline. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["his or her", "their", "its", "they're"],
          answer: 0,
          explain:
            "The antecedent is 'each' (not 'students,' which is inside a prepositional phrase modifying 'each'). 'Each' is grammatically singular, even though it refers to a group of students individually, so the pronoun must agree with 'each' in number.",
          difficulty: "easy",
          why: [null, "The subject is \"each,\" which is singular, so the pronoun must be singular too. \"Their\" is plural.", "\"Its\" is for things, not people. The students are people.", "\"They're\" means \"they are.\" The sentence needs a possessive."],
        },
        {
          q: "Neither of the twins finished ______ homework before dinner. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["his or her", "their", "its", "they're"],
          answer: 0,
          explain:
            "The antecedent is 'neither' (not 'twins,' which sits inside a prepositional phrase describing 'neither'). 'Neither' is grammatically singular, even though it's talking about two people.",
          difficulty: "medium",
          why: [null, "\"Neither\" is singular, even when talking about two people, so the pronoun must be singular.", "\"Its\" is for things, not people.", "\"They're\" means \"they are.\" The sentence needs a possessive."],
        },
        {
          q: "Every applicant must submit ______ portfolio by Friday. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["his or her", "their", "its", "they're"],
          answer: 0,
          explain:
            "'Every,' like 'each,' is grammatically singular, even though it refers to a whole group of applicants individually, so the pronoun must agree in number with 'every applicant.'",
          difficulty: "easy",
          why: [null, "\"Every applicant\" is singular, so the pronoun must be singular too.", "\"Its\" is for things, not people.", "\"They're\" means \"they are.\" The sentence needs a possessive."],
        },
        {
          q: "When Maria told her sister about the award, she was thrilled. Which choice best revises this sentence to fix its ambiguous pronoun?",
          choices: [
            "When Maria told her sister about the award, her sister was thrilled.",
            "When Maria told her sister about the award, they were thrilled.",
            "When Maria told her sister about the award, she herself was thrilled.",
            "When Maria told her sister about the award, it was thrilling.",
          ],
          answer: 0,
          explain:
            "'She' is ambiguous — it could refer to Maria or her sister, and nothing in the sentence clarifies which. This is a genuine ambiguity, not a number-agreement issue, and the fix is to name the specific person directly rather than leave 'she' to guess from. The other choices either don't resolve the ambiguity or change the sentence's meaning.",
          difficulty: "medium",
          why: [null, "\"They\" means both people were thrilled, which changes the meaning instead of clarifying who was.", "\"She herself\" is still \"she,\" so it's just as unclear which sister was thrilled.", "\"It was thrilling\" drops the person entirely and changes what the sentence says."],
        },
        {
          q: "Marine archaeologists Nadia Sorensen and Kwame Asante spent three summers searching Lake Superior for the cargo schooner Wren, which sank in a storm in 1919. When sonar images finally revealed the wreck in 2020, the images confirmed ______ theory that the storm had pushed the ship miles off course.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["it's", "their", "they're", "its"],
          answer: 1,
          explain:
            "First find who owns the theory: Sorensen and Asante, two people, so the pronoun must be plural. The blank also sits right before a noun ('theory'), so it needs a possessive, not a contraction. 'Their' is the plural possessive. 'Its' is singular and would wrongly point to a thing like the wreck or the ship, and 'it's' and 'they're' are contractions ('it is,' 'they are') that make no sense before 'theory.'",
          difficulty: "medium",
          why: ["\"It's\" means \"it is,\" and the theory belongs to two people anyway.", null, "\"They're\" means \"they are.\" The blank needs the possessive \"their.\"", "\"Its\" is singular and points to a thing, like the wreck. The theory belongs to two people."],
        },
        {
          q: "Either the manager or the interns will need to submit ______ report by Monday. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["their", "his or her", "its", "they're"],
          answer: 0,
          explain:
            "This is an 'either... or' compound subject, not a simple 'and' list — with 'or'/'nor,' the pronoun agrees with whichever subject is closer to it, not automatically the first one listed. Since 'the interns' (plural) is nearer to the blank, the pronoun should be plural, not singular just because 'the manager' appears first.",
          difficulty: "hard",
          why: [null, "With \"either... or,\" the pronoun agrees with the closer subject. \"The interns\" is closer, and it's plural.", "\"Its\" is for things, and the nearer subject, \"the interns,\" is plural people.", "\"They're\" means \"they are.\" The sentence needs a possessive."],
        },
      ],
      traps: [
        "Matching a pronoun to a nearby plural noun (like 'students') instead of the true, singular antecedent ('each').",
        "Overlooking ambiguous pronoun references, where it's unclear which of two nouns a pronoun is meant to replace.",
        "Using 'they' or 'their' for a singular group noun like 'the company' or 'the orchestra,' which takes 'it' and 'its.'",
        "Mixing up sound-alikes — its/it's, their/there/they're — where only one spelling is the possessive pronoun.",
        "Mixing up 'whose' and 'who's,' or using 'their' where the sentence needs 'whose' — 'whose' shows possession and links a describing clause to the noun before it ('the engineers, whose design...'), while 'who's' only ever means 'who is' or 'who has.'",
      ],
    },
    {
      name: "Verb Tense and Form Consistency",
      explanation:
        "This pattern is about whether a verb's TENSE or FORM matches the timeline the rest of the sentence sets up, separate from subject-verb agreement. First, figure out the timeline: a single past event, one past event before another, or something continuing up to now. Or check what form a nearby word requires: some verbs need 'to + verb' after them, others need the '-ing' form. Match the verb to that signal, instead of just picking whatever tense sounds natural on its own.",
      examples: [
        {
          q: "By the time the store closed, the clerk ______ every shelf twice. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["had restocked", "restocked", "has restocked", "was restocking"],
          answer: 0,
          explain:
            "This describes two past events, and restocking happened before closing. When one past event happens before another past event, the earlier one needs the past perfect tense ('had' + past participle); simple past would blur which action came first.",
          difficulty: "easy",
          why: [null, "Restocking happened before the store closed. When one past event comes before another, the earlier one needs \"had.\"", "\"Has restocked\" connects to the present, but this whole scene is in the past.", "\"Was restocking\" describes an ongoing action, but \"every shelf twice\" is completed work finished before closing."],
        },
        {
          q: "The museum's newest wing, completed last spring, ______ over 200,000 visitors since opening. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["has welcomed", "welcomed", "had welcomed", "welcomes"],
          answer: 0,
          explain:
            "'Since opening' specifically points to present perfect tense, an action that started at a past point and continues to matter up to now. Simple past 'welcomed' doesn't pair correctly with 'since.'",
          difficulty: "easy",
          why: [null, "\"Since opening\" means from then until now, which calls for \"has welcomed,\" not simple past.", "\"Had welcomed\" places this before some other past event, but the count runs up to the present.", "\"Welcomes\" is present tense, but \"since opening\" describes a total built up over time."],
        },
        {
          q: "After years of research, the team finally managed ______ a working prototype. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["to build", "building", "built", "builds"],
          answer: 0,
          explain:
            "This isn't about timeline — it's about which form 'managed' grammatically requires after it. 'Manage' is one of many verbs that must be followed by an infinitive, not the '-ing' form, unlike 'enjoy,' which instead requires the '-ing' form.",
          difficulty: "medium",
          why: [null, "\"Managed\" must be followed by \"to\" plus a verb, not an -ing form.", "\"Built\" is a past-tense verb. After \"managed,\" you need \"to build.\"", "\"Builds\" is a present-tense verb. After \"managed,\" you need \"to build.\""],
        },
        {
          q: "A decade after first publishing his theory, the physicist ______ additional evidence that ultimately confirmed it. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["gathered", "had gathered", "has gathered", "was gathering"],
          answer: 0,
          explain:
            "'A decade after first publishing' places us at one specific later point, and the sentence describes a single completed action at that point, not two separate past events and not something continuing to now. Simple past fits — not 'had gathered,' which would wrongly imply this happened before some other past event, and not 'has gathered,' which would wrongly imply relevance continuing to now.",
          difficulty: "medium",
          why: [null, "\"Had gathered\" would place this before another past event, but it's the single event the sentence describes.", "\"Has gathered\" connects to the present, but this happened at one specific past point.", "\"Was gathering\" describes ongoing action, but the gathering is presented as finished, since it confirmed the theory."],
        },
        {
          q: "Having ______ the same experiment for the third time, the researchers finally decided ______ their original hypothesis entirely. Which choice completes both blanks so that the text conforms to the conventions of Standard English?",
          choices: ["repeated / to abandon", "repeating / to abandon", "repeated / abandoning", "repeat / abandon"],
          answer: 0,
          explain:
            "The first blank follows 'Having,' which requires a past participle to form a perfect participial phrase showing a completed action before the main clause: 'Having repeated,' not 'having repeating' or 'having repeat.' The second blank follows 'decided,' a verb that requires an infinitive afterward, not a gerund: 'decided to abandon,' not 'decided abandoning.' Each blank follows its own specific rule.",
          difficulty: "hard",
          why: [null, "\"Having\" needs a past participle (\"repeated\"), not \"repeating.\"", "The first blank is right, but \"decided\" must be followed by \"to abandon,\" not \"abandoning.\"", "\"Having repeat\" isn't grammatical, and \"decided abandon\" is missing \"to.\""],
        },
      ],
      traps: [
        "Choosing a verb tense that matches the immediate local context but conflicts with a time marker or another verb established earlier in the sentence.",
        "Confusing which form certain words require after them (some verbs take 'to + verb,' others take the '-ing' form) — this is a specific-verb rule, not a general pattern.",
        "Defaulting to simple past or simple present out of habit, when the sentence's timeline actually calls for a perfect tense to show one event happened before, or continues up to, another point in time.",
      ],
    },
    {
      name: "Modifier Placement and Dangling Modifiers",
      explanation:
        "This pattern tests whether an introductory phrase correctly describes the subject right after it. A modifier (usually a phrase without its own subject, often starting with an '-ing' or '-ed' word) is only correctly placed if the noun right after the comma is the thing actually doing what the phrase describes. A 'dangling modifier' happens when the phrase describes someone who never actually shows up as the following subject. The fix is always the same: figure out who or what the modifier is really describing, then make sure that exact noun comes right after it as the sentence's subject.",
      examples: [
        {
          q: "______ the museum's new wing finally opened to visitors. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "After years of delays, ",
            "Delaying the project for years, ",
            "Having delayed the project for years, ",
            "To delay the project for years, ",
          ],
          answer: 0,
          explain:
            "'The museum's new wing' is the subject right after the comma. It makes sense as something that existed through years of delays (a state), not as something that was itself doing the delaying (an action) — the other choices would illogically suggest the wing delayed itself. 'After years of delays' doesn't require the following subject to be performing an action, so it pairs correctly.",
          difficulty: "easy",
          why: [null, "This says the museum wing delayed the project, which makes no sense.", "This says the wing itself did the delaying. A building can't delay a project.", "\"To delay\" suggests the wing opened in order to delay the project, which is illogical."],
        },
        {
          q: "______ the ancient manuscript was carefully restored. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "Discovered in a monastery archive, ",
            "Discovering it in a monastery archive, ",
            "Having discovered it in a monastery archive, ",
            "To discover it in a monastery archive, ",
          ],
          answer: 0,
          explain:
            "The manuscript is the one that was found, not the one doing the discovering, so the modifier needs the passive form 'discovered,' matching what the following subject experienced. The other choices all wrongly imply the manuscript actively discovered something.",
          difficulty: "easy",
          why: [null, "This says the manuscript did the discovering. It was discovered, not the discoverer.", "\"Having discovered it\" makes the manuscript the one who found something.", "\"To discover it\" suggests the manuscript was restored in order to discover itself."],
        },
        {
          q: "______ the results took the research team by surprise. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "After the data was analyzed for months, ",
            "After analyzing the data for months, ",
            "Having analyzed the data for months, ",
            "To analyze the data for months, ",
          ],
          answer: 0,
          explain:
            "The research team is the one doing the analyzing, not 'the results' — so a modifier requiring an active 'analyzing' subject would dangle, since results can't analyze data. 'After the data was analyzed for months' removes the mismatch entirely, since it describes a completed process rather than an actor, pairing safely with 'the results' as the subject.",
          difficulty: "medium",
          why: [null, "This makes \"the results\" the ones analyzing the data. Results can't analyze anything.", "Same problem: \"the results\" becomes the subject that analyzed the data.", "\"To analyze the data\" suggests the results surprised the team in order to analyze data, which is illogical."],
        },
        {
          q: "Which choice corrects the dangling modifier in this sentence: 'Frustrated by years of rejection, the manuscript was finally accepted by a small press.'?",
          choices: [
            "Frustrated by years of rejection, the author finally found a small press willing to accept the manuscript.",
            "Frustrated by years of rejection, the manuscript was finally accepted by a small press.",
            "The manuscript, frustrated by years of rejection, was finally accepted by a small press.",
            "Having been frustrated by years of rejection, the manuscript was finally accepted by a small press.",
          ],
          answer: 0,
          explain:
            "'Frustrated by years of rejection' describes a person's feeling, but 'the manuscript' (an object) can't feel frustration — only the author could be frustrated. The sentence needs the author, not the manuscript, as the subject immediately following the modifier, which only the first choice provides.",
          difficulty: "medium",
          why: [null, "This is the original sentence. A manuscript can't feel frustrated, so the modifier still dangles.", "Moving the phrase doesn't help. It still says the manuscript was frustrated.", "\"Having been frustrated\" still describes the manuscript as feeling frustration."],
        },
        {
          q: "A report states budget concerns were raised in an earlier meeting. Which choice best revises the following sentence to correct its dangling modifier: 'Having ignored those same concerns months earlier, the proposal was resubmitted without any changes.'?",
          choices: [
            "Having ignored those same concerns months earlier, the proposal's authors resubmitted it without any changes.",
            "Having ignored those same concerns months earlier, the proposal was resubmitted without any changes.",
            "The proposal, having ignored those same concerns months earlier, was resubmitted without any changes.",
            "Having been ignored months earlier, the proposal was resubmitted without any changes.",
          ],
          answer: 0,
          explain:
            "'Having ignored those concerns' requires a subject capable of ignoring something (a person or group, like the proposal's authors), not the proposal itself, which can't ignore anything. This dangling-modifier pattern applies to any sentence in a passage, not just the first one. Only the first choice supplies a subject capable of the action the modifier describes.",
          difficulty: "hard",
          why: [null, "This is the original sentence. A proposal can't ignore concerns, so the modifier still dangles.", "Moving the phrase still says the proposal ignored the concerns.", "This changes the meaning: now the proposal was ignored, instead of people ignoring the concerns."],
        },
      ],
      traps: [
        "Choosing an answer where the noun right after the modifier isn't actually the one performing the modifier's action, creating an illogical or unintentionally funny mismatch.",
        "Assuming any grammatically complete sentence following the modifier is correct, without checking whether the modifier's implied subject actually matches.",
        "Overlooking that passive constructions ('the report was released') can still dangle a modifier just as easily as active ones, and that the pattern applies to any sentence, not just an opening one.",
      ],
    },
    {
      name: "Finite vs. Non-Finite Verb Forms",
      explanation:
        "A finite verb can be a sentence's complete main verb on its own; it shows tense and matches its subject (runs, ran, is running). A non-finite form (an infinitive like 'to run,' a gerund like 'running' as a noun, or a participle like 'having run,' or an '-ing'/'-ed' modifier) can NOT stand alone as the main verb. These questions test which form a spot needs. Two shapes come up constantly: (1) a phrase attaches to an already-complete sentence, and using a finite verb there accidentally creates a run-on when a participle was needed instead; (2) a question gets embedded inside a bigger sentence, which needs plain statement word order (subject, then verb, no inversion, no question mark), not a standalone question's flipped order. The method: find the sentence's one true finite main verb first. Anything else that looks verb-like needs a non-finite form.",
      examples: [
        {
          q: "The committee, ______ every application twice, still could not reach a unanimous decision. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["reviewing", "reviewed", "reviews", "having review"],
          answer: 0,
          explain:
            "The sentence's one finite main verb is 'could not reach.' Since that spot is already filled, the phrase between the commas needs a non-finite form describing the committee's action. 'Reviewing' (a participle) correctly modifies 'the committee' without competing for the role of main verb; 'reviewed' or 'reviews' would each wrongly try to act as a second finite verb, creating a run-on.",
          difficulty: "easy",
          why: [null, "\"Reviewed\" would compete with \"could not reach\" as a second main verb, or read as \"the committee was reviewed.\"", "\"Reviews\" is a main verb, but the sentence already has one: \"could not reach.\"", "\"Having review\" isn't grammatical. It would need \"having reviewed.\""],
        },
        {
          q: "The scientists hoped ______ a treatment before the funding expired. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["to discover", "discovering", "discovered", "discovers"],
          answer: 0,
          explain:
            "'Hoped' is the sentence's finite main verb and specifically requires an infinitive to complete its meaning ('hoped to do something'), not a gerund or a second finite verb.",
          difficulty: "easy",
          why: [null, "\"Hoped\" must be followed by \"to\" plus a verb, not an -ing form.", "\"Discovered\" is a past-tense verb. After \"hoped,\" you need \"to discover.\"", "\"Discovers\" is a present-tense verb. After \"hoped,\" you need \"to discover.\""],
        },
        {
          q: "Nobody could explain ______ so abruptly. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "why the machine had stopped",
            "why had the machine stopped",
            "why did the machine stop",
            "why the machine did stopped",
          ],
          answer: 0,
          explain:
            "'Why the machine had stopped' functions as a noun clause (the object of 'explain'), not a standalone question. An embedded clause like this uses ordinary statement word order: subject before its verb, no inversion. The other choices incorrectly apply question-word-order inversion inside an embedded clause.",
          difficulty: "medium",
          why: [null, "This uses question word order (\"had the machine\") inside a sentence that isn't a question.", "\"Why did the machine stop\" is question order. Inside a statement, it should be \"why the machine had stopped.\"", "\"Did stopped\" isn't grammatical. After \"did,\" the verb would be \"stop.\""],
        },
        {
          q: "The engineer inspected the bridge's support beams, ______ three hairline cracks that had gone unnoticed for years. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["finding", "found", "finds", "having find"],
          answer: 0,
          explain:
            "The finite main verb is 'inspected.' Since the clause already has its finite verb, the phrase after the comma needs a non-finite form to attach to it, describing what the engineer discovered while inspecting. 'Finding' (participle) correctly attaches as a modifying phrase; 'found' would be a second finite verb with no conjunction connecting it, creating a comma splice.",
          difficulty: "medium",
          why: [null, "\"Found\" would be a second main verb with no \"and\" to join it, creating a comma splice.", "\"Finds\" is present tense and a second main verb. It doesn't fit after \"inspected.\"", "\"Having find\" isn't grammatical. It would need \"having found.\""],
        },
        {
          q: "Historians still debate ______ the empire's sudden decline, though few dispute that its trade routes shifted dramatically in the same period. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["what caused", "what did cause", "what has caused it", "what causing"],
          answer: 0,
          explain:
            "'What caused the empire's sudden decline' is an embedded noun clause functioning as the object of 'debate,' not a standalone question. Embedded clauses use statement word order, not the inverted 'did' construction a standalone question would use. The second half of the sentence is a separate, correctly-formed independent clause and doesn't affect which form belongs in the first blank.",
          difficulty: "hard",
          why: [null, "\"What did cause\" uses question-style \"did.\" Inside a statement, it's just \"what caused.\"", "\"It\" has nothing to refer to and leaves \"the empire's sudden decline\" stranded with no verb.", "\"What causing\" has no real verb, so the clause doesn't work."],
        },
      ],
      traps: [
        "Using a second finite verb in a phrase that attaches to an already-complete independent clause, accidentally creating a run-on or comma splice instead of the needed participle.",
        "Inverting the subject and verb (or adding 'do/does/did') inside an embedded question that functions as a noun clause, rather than using plain statement word order.",
        "Pairing a verb with the wrong non-finite form (an infinitive where that specific verb requires a gerund, or vice versa) — this sounds subtly wrong but is easy to miss when reading quickly.",
      ],
    },
  ],
  tipsAndTricks: [
    "For subject-verb agreement, mentally delete any prepositional phrase between the subject and the verb before checking agreement — the true subject is often not the closest noun.",
    "For parallel structure, identify the grammatical form of the first list item, then require every other item to match that exact form (all -ing, all infinitive, or all plain verb).",
    "Words like 'each,' 'either,' 'neither,' and 'every' are grammatically singular, even when they describe or modify a group — this trips up even strong writers.",
  ],
};

const LC_M_LINEAR_EQ_1VAR: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Standard Isolate-the-Variable Equations",
      explanation:
        "The most common pattern: a straightforward equation where you isolate x using inverse operations, working from the outside in. Undo addition and subtraction first, then multiplication and division — always doing the same thing to both sides. Most errors here aren't conceptual; they're sign mistakes while distributing or combining terms. Writing out each step explicitly, instead of doing several steps in your head, prevents most careless mistakes.",
      examples: [
        {
          q: "Solve for x: 5(x + 2) = 3x + 18",
          choices: ["4", "8", "1", "-4"],
          answer: 0,
          explain:
            "Distribute the 5: 5x + 10 = 3x + 18. Subtract 3x from both sides: 2x + 10 = 18. Subtract 10: 2x = 8. Divide by 2: x = 4. Getting 8 comes from forgetting to distribute the 5 across both terms. Getting 1 comes from adding 3x to both sides instead of subtracting. Getting -4 comes from a sign error in the final division.",
          difficulty: "easy",
          why: [null, "8 comes from not distributing the 5 to the 2: 5x + 2 = 3x + 18 gives x = 8. Distribute first: 5x + 10.", "1 comes from adding 3x to both sides instead of subtracting it: 8x + 10 = 18.", "Check it: 5(−4 + 2) = −10, but 3(−4) + 18 = 6. The sides don't match; this is a sign slip."],
        },
        {
          q: "Solve for x: -3(x - 4) + 2 = x - 10",
          choices: ["6", "0", "-6", "4"],
          answer: 0,
          explain:
            "Distribute the -3 carefully: -3x + 12 + 2 = x - 10, which simplifies to -3x + 14 = x - 10. Add 3x to both sides: 14 = 4x - 10. Add 10: 24 = 4x. Divide by 4: x = 6. Getting 0 comes from distributing -3 incorrectly as -3x - 12 instead of -3x + 12. Getting -6 comes from a sign error in the final step. Getting 4 comes from an arithmetic slip combining 14 and 10.",
          difficulty: "medium",
          why: [null, "0 comes from distributing −3 as −3x − 12. A negative times −4 is +12, so it's −3x + 12.", "Check it: −3(−6 − 4) + 2 = 32, but −6 − 10 = −16. This is a sign slip at the end; 4x = 24 gives x = 6.", "Check it: −3(4 − 4) + 2 = 2, but 4 − 10 = −6. From 14 = 4x − 10, add 10 to get 4x = 24."],
        },
        {
          q: "Solve for x: 3x - 4 = 11",
          choices: ["5", "15", "-5", "7"],
          answer: 0,
          explain:
            "Add 4 to both sides: 3x = 15. Divide by 3: x = 5. Getting 15 comes from forgetting to divide by 3 after isolating 3x. Getting -5 comes from a sign error. Getting 7 comes from subtracting 4 instead of adding it to both sides.",
          difficulty: "easy",
          why: [null, "15 is 3x, not x. After 3x = 15, divide by 3.", "A sign slip: 3(−5) − 4 = −19, not 11.", "7 is 11 − 4. You need to add 4 to both sides (3x = 15), then divide by 3."],
        },
        {
          q: "Solve for x: 2(3x - 1) + 5 = 4(x + 3)",
          choices: ["4.5", "9", "1.5", "-4.5"],
          answer: 0,
          explain:
            "Distribute on both sides: 6x - 2 + 5 = 4x + 12, simplifying to 6x + 3 = 4x + 12. Subtract 4x: 2x + 3 = 12. Subtract 3 and divide by 2: 2x = 9, so x = 4.5. Getting 9 comes from forgetting to divide by 2 in the final step. Getting 1.5 comes from a division error. Getting -4.5 comes from a sign error.",
          difficulty: "medium",
          why: [null, "9 is 2x, not x. After 2x = 9, divide by 2.", "Check it: 2(3·1.5 − 1) + 5 = 12, but 4(1.5 + 3) = 18. The sides don't match.", "A sign slip: 2x = 9 gives x = +4.5, not −4.5."],
        },
        {
          q: "Solve for x: x/4 + x/6 = 5",
          choices: ["12", "20", "10", "60"],
          answer: 0,
          explain:
            "Clear the fractions by multiplying every term by the least common denominator, 12: 3x + 2x = 60. Combine like terms: 5x = 60, so x = 12. Getting 20 comes from a common LCD error. Getting 10 comes from using an incorrect denominator guess instead of 12. Getting 60 comes from forgetting to divide by 5 in the last step.",
          difficulty: "hard",
          why: [null, "Check it: 20/4 + 20/6 = 5 + 3.33, which is about 8.3, not 5.", "Check it: 10/4 + 10/6 = 2.5 + 1.67, which is about 4.2, not 5. Multiply every term by 12 to clear the fractions.", "60 is 5x, not x. After 5x = 60, divide by 5."],
        },
      ],
      traps: [
        "Sign errors when distributing a negative number across parentheses.",
        "Forgetting to apply an operation to every term on both sides of the equation, not just one term.",
      ],
    },
    {
      name: "No-Solution and Infinite-Solution Equations",
      explanation:
        "This pattern involves equations where the x-terms cancel out completely when simplified, leaving either a false statement (no solution) or a true statement (infinite solutions). You'll spot it when, after simplifying both sides, the x-terms match exactly. If the leftover numbers are different, there's no solution (a false statement, like '5 = 7'). If the numbers also match, every real number works (a true statement, like '5 = 5').",
      examples: [
        {
          q: "For which value of k does the equation 4x + k = 4x + 7 have infinitely many solutions?",
          choices: ["7", "4", "0", "-7"],
          answer: 0,
          explain:
            "Subtract 4x from both sides: k = 7. Since the x-terms fully cancel, the equation's solutions depend entirely on whether this remaining statement is true. k = 7 makes it 7 = 7, true for every x, giving infinitely many solutions; any other value of k makes it false, giving no solution instead.",
          difficulty: "easy",
          why: [null, "4 is the coefficient of x, which cancels on both sides. What's left is k = 7.", "With k = 0, you get 0 = 7, which is never true. That gives no solution, not infinitely many.", "With k = −7, you get −7 = 7, which is never true, so there's no solution."],
        },
        {
          q: "For which value of k does the equation 3(x + 2) = 3x + k have infinitely many solutions?",
          choices: ["6", "2", "3", "-6"],
          answer: 0,
          explain:
            "Distribute the 3 on the left: 3x + 6 = 3x + k. Subtract 3x from both sides: 6 = k. The x-terms have fully canceled, so everything now depends on whether the remaining statement is true. If k = 6, the equation becomes 6 = 6, true no matter what x is, meaning every real number is a solution.",
          difficulty: "medium",
          why: [null, "2 is inside the parentheses. After distributing, the left side is 3x + 6, so k must be 6.", "With k = 3, you get 3x + 6 = 3x + 3, or 6 = 3, which is never true. No solution.", "With k = −6, you get 6 = −6, which is never true. The sign has to match: k = 6."],
        },
        {
          // Deliberately the "no solution" half of the same setup as the
          // first example above (same "for which value of k" phrasing,
          // same style of cancel-the-x-terms equation) -- every example in
          // this pattern used to ask for the infinitely-many-solutions
          // value only, so a student could clear the whole lesson without
          // ever actually working the no-solution case the pattern (and
          // the traps below) are named for.
          q: "Which choice describes all values of k for which the equation 2x + 5 = 2x + k has no solution?",
          choices: ["Any k ≠ 5", "5", "-5", "0"],
          answer: 0,
          explain:
            "Subtract 2x from both sides: 5 = k. The x-terms have fully canceled, so the equation's truth now depends only on this remaining statement. It's true only when k = 5, which instead gives infinitely many solutions — every other value of k makes '5 = k' false, so any k ≠ 5 gives no solution.",
          difficulty: "easy",
          why: [null, "k = 5 makes it 5 = 5, true for every x. That's infinitely many solutions, the opposite of none.", "−5 does give no solution, but it's only one such value. The question asks for all of them: every k except 5.", "0 does give no solution, but it's only one such value. Every k except 5 works."],
        },
        {
          q: "How many solutions does the equation 5x - 3(x + 4) = 2x + 3 have?",
          choices: ["No solution", "Exactly one solution", "Infinitely many solutions", "Exactly two solutions"],
          answer: 0,
          explain:
            "Simplify the left side first; distribute and combine like terms: 5x - 3x - 12 = 2x + 3, which becomes 2x - 12 = 2x + 3. The x-terms only visibly match after simplifying, so you have to distribute first to see it. Subtracting 2x from both sides leaves -12 = 3, false for every value of x, so the equation has no solution.",
          difficulty: "medium",
          why: [null, "The x-terms cancel (2x on both sides), leaving −12 = 3. There's no x left to solve for, so there isn't one solution.", "Infinitely many would need the leftover statement to be true, but −12 = 3 is false.", "A linear equation can't have exactly two solutions. It has none, one, or infinitely many."],
        },
        {
          // The second no-solution example -- unlike the k-based one two
          // examples up, this gives a fixed equation with no k at all and
          // asks for the solution count directly, the way an actual SAT
          // item would phrase either outcome.
          q: "How many solutions does the equation 0.5(4x + 6) = 2x + 5 have?",
          choices: ["No solution", "Exactly one solution", "Infinitely many solutions", "Cannot be determined"],
          answer: 0,
          explain:
            "Distribute the 0.5 on the left side: 0.5(4x) + 0.5(6) = 2x + 3. The equation is now 2x + 3 = 2x + 5, and the x-terms already match once distributed. Subtract 2x from both sides: 3 = 5 — false for every value of x, so there's no solution. Distributing the decimal coefficient first is the extra step that reveals the x-terms match at all.",
          difficulty: "hard",
          why: [null, "After distributing, 2x cancels on both sides, leaving 3 = 5. There's no single x that works.", "That would need the leftover statement to be true, but 3 = 5 is false.", "It can be determined: distribute, and the equation becomes 3 = 5, which has no solution."],
        },
      ],
      traps: [
        "Trying to solve for x algebraically when the x-terms have already canceled — there's no value of x to find in this scenario.",
        "Confusing 'no solution' (a false statement remains) with 'infinite solutions' (a true statement remains) after the x-terms cancel.",
      ],
    },
    {
      name: "Solving for a Related Expression Without Fully Isolating x",
      explanation:
        "Some questions ask for the value of an expression involving x (like x − 7 or 2x), instead of x itself. The fast method: manipulate the whole equation so it isolates the exact expression being asked for, instead of solving all the way down to x and substituting afterward. Watch for this whenever the question asks for an expression, not a plain 'what is x.' Dividing, adding, or combining terms to land exactly on that expression is almost always faster than solving for x first. A related version gives a ratio, like x/y = 3/4 or 2x = 5y (which means x/y = 5/2), and asks about an expression such as (x + y)/y or (kx − y)/y. Split the fraction so the ratio appears: (x + y)/y = x/y + y/y = x/y + 1, and (kx − y)/y = k(x/y) − 1. Then substitute the ratio and solve for the value or the unknown constant.",
      examples: [
        {
          q: "If 4x - 28 = -24, what is the value of x - 7?",
          choices: ["-6", "-1", "1", "6"],
          answer: 0,
          explain:
            "The equation already contains '4x,' and the target expression is 'x - 7' — dividing the entire equation by 4 directly produces 'x - 7' on the left side. Divide every term by 4: (4x - 28)/4 = -24/4, giving x - 7 = -6. There's no need to solve for x itself and then subtract 7 separately.",
          difficulty: "easy",
          why: [null, "Divide every term by 4: 4x/4 − 28/4 = −24/4, which is x − 7 = −6, not −1.", "1 is the value of x itself. The question asks for x − 7, which is −6.", "A sign slip: −24 ÷ 4 is −6, not 6."],
        },
        {
          q: "If 3x + 12 = 27, what is the value of x + 4?",
          choices: ["9", "5", "15", "-9"],
          answer: 0,
          explain:
            "The target expression 'x + 4' is exactly the original equation divided by 3 (3x/3 = x, 12/3 = 4). Divide every term by 3: (3x + 12)/3 = 27/3, giving x + 4 = 9 directly.",
          difficulty: "easy",
          why: [null, "5 is x itself. The question asks for x + 4, which is 9.", "15 is 3x (27 − 12). The question asks for x + 4.", "A sign slip: 27 ÷ 3 is 9, so x + 4 = 9."],
        },
        {
          q: "If 6x - 9 = 21, what is the value of 2x - 3?",
          choices: ["7", "5", "21", "-7"],
          answer: 0,
          explain:
            "'2x - 3' is exactly one-third of '6x - 9' (since 6x/3 = 2x and 9/3 = 3). Divide the entire equation by 3: (6x - 9)/3 = 21/3, giving 2x - 3 = 7 directly.",
          difficulty: "medium",
          why: [null, "5 is x itself. The question asks for 2x − 3, which is 7.", "21 is the value of 6x − 9. Divide the whole equation by 3 to get 2x − 3.", "A sign slip: 21 ÷ 3 is +7."],
        },
        {
          q: "If 5x + 2y = 18 and y = 4, what is the value of 5x?",
          choices: ["10", "2", "18", "26"],
          answer: 0,
          explain:
            "Substitute y = 4 directly into the equation: 5x + 2(4) = 18, which simplifies to 5x + 8 = 18. Subtract 8 from both sides to isolate the exact requested expression '5x': 5x = 10. There's no need to divide by 5 and find x itself, since the question only asks for '5x.'",
          difficulty: "medium",
          why: [null, "2 is x itself. The question asks for 5x, which is 10.", "18 is the whole left side, 5x + 2y. Subtract 2y = 8 to get 5x.", "26 comes from adding 8 instead of subtracting it. 5x + 8 = 18 gives 5x = 10."],
        },
        {
          q: "If 3x + 2y = 20 and x - 2y = 4, what is the value of 4x?",
          choices: ["24", "6", "16", "12"],
          answer: 0,
          explain:
            "Adding the two equations directly eliminates y: (3x + 2y) + (x - 2y) = 20 + 4, giving 4x = 24. This happens to be the exact requested expression already — no further work needed. Solving for x individually (x = 6) and then multiplying by 4 would reach the same answer but requires an unnecessary extra step.",
          difficulty: "hard",
          why: [null, "6 is x itself. The question asks for 4x, which is 24.", "16 comes from subtracting the equations instead of adding them. Adding cancels the 2y terms.", "12 is 2x. Adding the equations gives 4x = 24 directly."],
        },
        {
          q: "If x/y = 3/4 and (kx + y)/y = 7, where k is a constant, what is the value of k?",
          choices: ["9/2", "6", "8", "28/3"],
          answer: 2,
          explain:
            "Split the fraction so the given ratio appears: (kx + y)/y = k(x/y) + y/y = k(x/y) + 1. Substitute x/y = 3/4: k(3/4) + 1 = 7, so k(3/4) = 6 and k = 6 · (4/3) = 8. You never need x or y separately. The value 9/2 uses the flipped ratio 4/3, 6 is k(x/y) rather than k, and 28/3 drops the + 1 from y/y.",
          difficulty: "hard",
          why: ["This uses y/x = 4/3 instead of x/y = 3/4. Check it: (9/2)(3/4) + 1 = 35/8, not 7.", "6 is the value of k(x/y), not k. Divide by 3/4: k = 8.", null, "y/y = 1 has to be subtracted first: k(3/4) = 6, not 7. Check it: (28/3)(3/4) + 1 = 8, not 7."],
        },
      ],
      traps: [
        "Automatically solving all the way for x out of habit, even when the question never asks for x itself and a faster shortcut is available.",
        "Isolating the wrong combination of terms — one that looks similar to the requested expression but isn't an exact match.",
        "Making an arithmetic slip when scaling the equation to match the requested expression's exact coefficient.",
        "Flipping the given ratio: using y/x = 4/3 when the question gives x/y = 3/4, or reading 2x = 5y as x/y = 2/5.",
        "Not splitting a fraction like (x + y)/y into x/y + 1: dropping the + 1, or canceling the y's as if they were factors.",
      ],
    },
    {
      name: "Translating a Word Problem into an Equation",
      explanation:
        "Sometimes you need to build an equation from a word description before you can solve anything — and some questions stop right there, just asking which equation represents the situation. The method: assign a variable to the unknown, and write down in plain words what it stands for. Then translate piece by piece. 'More than' and 'increased by' mean addition. 'Less than' means subtraction, written in reverse order from how it's spoken. 'Times' or 'of' mean multiplication. 'Is' or 'equals' means the equals sign. Go slowly, phrase by phrase, instead of converting the whole sentence at once.",
      examples: [
        {
          q: "Eight times a number is 56. Which equation represents this situation, using n for the number?",
          choices: ["8n = 56", "n + 8 = 56", "8 + n = 56", "n/8 = 56"],
          answer: 0,
          explain:
            "'Eight times a number' translates directly to 8n, and 'is' becomes the equals sign, giving 8n = 56. The other choices each mistranslate 'times' as addition or division instead of multiplication.",
          difficulty: "easy",
          why: [null, "\"Times\" means multiply, not add. This says eight more than a number.", "This is also addition. \"Eight times a number\" is 8n.", "This divides the number by 8. \"Times\" means multiply."],
        },
        {
          q: "A rabbit eats 25 calories per hour while resting. Which equation gives the total calories, C, the rabbit eats resting for h hours?",
          choices: ["C = 25h", "C = 25 + h", "C = h/25", "C = 25 - h"],
          answer: 0,
          explain:
            "'Per hour' signals a rate that gets multiplied by the number of hours: total calories = rate × time, so C = 25h. The other choices each mistranslate the rate relationship as addition, division, or subtraction.",
          difficulty: "easy",
          why: [null, "25 calories per hour gets multiplied by the hours, not added to them.", "Dividing hours by 25 doesn't give calories. The rate times the time does.", "Subtracting hours from 25 would make calories go down the longer it rests."],
        },
        {
          q: "A number decreased by 12 is the same as 3 times the number. Which equation represents this situation, using n for the number?",
          choices: ["n - 12 = 3n", "12 - n = 3n", "n - 12 = n/3", "3n - 12 = n"],
          answer: 0,
          explain:
            "'A number decreased by 12' translates to n - 12 — 'decreased by' keeps the same word order as spoken, the number first, then subtract 12. '3 times the number' translates to 3n, and 'is the same as' becomes the equals sign: n - 12 = 3n. Writing '12 - n = 3n' reverses which quantity is subtracted from which.",
          difficulty: "medium",
          why: [null, "\"A number decreased by 12\" is n − 12. This reverses it into 12 minus the number.", "\"3 times the number\" is 3n, not n/3.", "This subtracts 12 from 3n instead of from the number itself."],
        },
        {
          q: "12 less than a number is 45. Which equation represents this situation, using n for the number?",
          choices: ["n - 12 = 45", "12 - n = 45", "n + 12 = 45", "12n = 45"],
          answer: 0,
          explain:
            "'12 less than a number' is a reversed-order phrase — despite '12' appearing first in the sentence, it's the number that comes first in the equation, with 12 subtracted from it: n - 12 = 45. Writing '12 - n = 45' is a common error that reverses which quantity is being subtracted from which.",
          difficulty: "medium",
          why: [null, "\"12 less than a number\" is the number minus 12. This reverses the order.", "\"Less than\" means subtract, not add.", "\"Less than\" means subtract. This multiplies instead."],
        },
        {
          q: "A plant is currently 8 centimeters tall and grows at a constant rate of 2 centimeters per week. Which equation gives the plant's height, H, after w weeks?",
          choices: ["H = 8 + 2w", "H = 2 + 8w", "H = 8w + 2", "H = 8 - 2w"],
          answer: 0,
          explain:
            "Identify the starting value (8, present even at w = 0) and the rate of change (2 centimeters per week, multiplied by w), then combine them: H = 8 + 2w. The other choices each swap which number is the fixed start and which is the rate, or use the wrong operation.",
          difficulty: "hard",
          why: [null, "This swaps the numbers: it starts at 2 and grows by 8 a week. The plant starts at 8 and grows by 2.", "Same swap: it treats 8 as the weekly growth and 2 as the starting height.", "The plant grows, so its height goes up each week. Subtracting 2w would make it shrink."],
        },
      ],
      traps: [
        "Translating 'less than' in the same left-to-right order it's spoken, instead of reversing which quantity comes first in the equation.",
        "Confusing which quantity is the rate (multiplied by the variable) and which is the fixed starting amount (added as a constant) in a per-unit word problem.",
        "Trying to translate an entire sentence in one pass instead of working through it phrase by phrase, which is where translation errors usually happen.",
      ],
    },
  ],
  tipsAndTricks: [
    "Write out every single step, including 'obvious' ones — nearly all errors on this subskill are careless sign or arithmetic mistakes, not conceptual gaps.",
    "If, after simplifying, the x-terms disappear entirely from both sides, stop trying to solve for x — check instead whether the remaining constants are equal (infinite solutions) or unequal (no solution).",
    "For word problems, write out in plain English what your variable represents before writing the equation (e.g., 'let x = number of miles driven') — this prevents setting up the wrong equation entirely.",
  ],
};

const LC_M_LINEAR_FUNC: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Extracting Slope and Intercept from a Real-World Scenario",
      explanation:
        "Many linear function questions are word problems where you translate a real-world description into slope and y-intercept. The reliable trick: the y-intercept is the 'starting value' or 'flat fee', the amount present when the input is zero. The slope is the 'rate' or 'per unit' language, like per mile or per month. Watch for a first unit that's priced differently: '$50 for the first day and $30 for each additional day' charges $30 for only d - 1 days, so C(d) = 30(d - 1) + 50 = 30d + 20. The slope is still the per-unit rate, but the intercept, 20, is not the first-day price; you only find it by simplifying. Once you know which number plays which role, writing the function is mechanical.",
      examples: [
        {
          q: "A taxi charges $3 plus $2 per mile. Which function models the cost C for m miles?",
          choices: ["C = 2m + 3", "C = 3m + 2", "C = 2m - 3", "C = 5m"],
          answer: 0,
          explain:
            "The flat fee (y-intercept) is $3, the amount charged even for zero miles. The rate (slope) is $2 per mile, the amount added for each additional mile. 'C = 3m + 2' swaps which number is the rate and which is the flat fee. 'C = 2m - 3' uses the wrong sign, and 'C = 5m' incorrectly adds the two numbers together into a single rate.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "y-int = 3", at: "left" }], slopeLabel: "slope = 2" },
          difficulty: "easy",
          why: [null, "This swaps the numbers: it charges $3 per mile with a $2 fee. The fee is $3 and the rate is $2 per mile.", "The $3 is added as a fee, not subtracted.", "Adding 2 and 3 into one rate charges $5 every mile. The $3 is charged only once."],
        },
        {
          q: "A water tank starts with 200 gallons and drains at a rate of 15 gallons per minute. Which function models the amount of water W remaining after m minutes?",
          choices: ["W = -15m + 200", "W = 15m + 200", "W = -15m - 200", "W = 200m - 15"],
          answer: 0,
          explain:
            "The starting value (y-intercept) is 200 gallons, the amount present at m = 0. The rate (slope) is 15 gallons per minute, but since the tank is draining, the amount is decreasing, so the rate needs a negative sign. 'W = 15m + 200' forgets the negative sign entirely, and 'W = -15m - 200' and 'W = 200m - 15' each misplace the negative sign or swap the roles of the two numbers.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "y-int = 200", at: "left" }], slopeLabel: "slope = -15" },
          difficulty: "medium",
          why: [null, "The tank drains, so the amount goes down. The rate needs a negative sign.", "The tank starts with 200 gallons, so the 200 is positive. Only the rate is negative.", "This swaps the roles: 200 is the starting amount, not the per-minute rate."],
        },
        {
          q: "A gym charges a $20 sign-up fee plus $15 per month. Which function models the total cost C after m months?",
          choices: ["C = 15m + 20", "C = 20m + 15", "C = 15m - 20", "C = 35m"],
          answer: 0,
          explain:
            "The flat fee (y-intercept) is $20, charged once regardless of months. The rate (slope) is $15 per month. 'C = 20m + 15' swaps which number is the rate and which is the flat fee, 'C = 15m - 20' uses the wrong sign, and 'C = 35m' incorrectly combines the two numbers into a single rate.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "y-int = 20", at: "left" }], slopeLabel: "slope = 15" },
          difficulty: "easy",
          why: [null, "This swaps the numbers: it charges $20 a month with a $15 fee. The fee is $20 and the monthly rate is $15.", "The $20 sign-up fee is added to the cost, not subtracted.", "Adding 15 and 20 into one rate charges the $20 fee every month. It's charged once."],
        },
        {
          q: "A candle is 8 inches tall when lit and burns down at a rate that reduces its height by half an inch every 20 minutes. Which function models the candle's height H after t minutes?",
          choices: ["H = -0.025t + 8", "H = 0.025t + 8", "H = -0.5t + 8", "H = -0.025t - 8"],
          answer: 0,
          explain:
            "The starting value (y-intercept) is 8 inches at t = 0. The tricky part is converting 'half an inch every 20 minutes' into a per-minute rate first: 0.5 / 20 = 0.025 inches per minute, and since the candle is burning down, this rate must be negative. 'H = 0.025t + 8' forgets the negative sign, 'H = -0.5t + 8' forgets to convert the rate to a per-minute basis, and 'H = -0.025t - 8' applies the negative sign to the wrong number.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "y-int = 8", at: "left" }], slopeLabel: "slope = -0.025" },
          difficulty: "medium",
          why: [null, "The candle burns down, so its height decreases. The rate needs a negative sign.", "The rate has to be per minute: 0.5 inch every 20 minutes is 0.025 inch per minute, not 0.5.", "The candle starts at +8 inches. Only the rate is negative."],
        },
        {
          q: "A moving company charges a flat fee plus a per-mile rate. A 50-mile move costs $350, and a 120-mile move costs $560. Which function models the cost C for a move of m miles?",
          choices: ["C = 3m + 200", "C = 3m + 350", "C = 7m + 200", "C = 3m - 200"],
          answer: 0,
          explain:
            "Unlike a scenario that states the flat fee and rate directly, here both must be derived from two cost/mileage pairs. The rate (slope) is (560 - 350) / (120 - 50) = 210 / 70 = 3 dollars per mile. Using the rate and one data point to find the flat fee: 350 = 3(50) + b, so b = 200, giving C = 3m + 200. 'C = 3m + 350' mistakes one of the cost values for the flat fee, 'C = 7m + 200' uses an incorrect rate, and 'C = 3m - 200' uses the wrong sign on the flat fee.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "(50, 350)", at: "left" }, { label: "(120, 560)", at: "right" }] },
          difficulty: "hard",
          why: [null, "$350 is the total for 50 miles, not the flat fee. Solve 350 = 3(50) + b to get b = 200.", "The rate is the change in cost over the change in miles: 210 ÷ 70 = 3, not 7.", "Check it: 3(50) − 200 = −50, not 350. The flat fee is +200."],
        },
        {
          q: "A boat rental shop charges $45 for the first hour and $25 for each additional hour. Which function gives the total cost C(h), in dollars, of renting a boat for h hours, where h is a positive whole number?",
          choices: ["C(h) = 25h + 45", "C(h) = 45h + 25", "C(h) = 25h + 20", "C(h) = 25h + 70"],
          answer: 2,
          explain:
            "Only the hours after the first cost $25, and there are h - 1 of them: C(h) = 45 + 25(h - 1) = 25h + 20. Check: one hour costs 25 + 20 = $45, and two hours cost 50 + 20 = $70. '25h + 45' charges $25 for the first hour on top of the $45, so one hour would cost $70. '45h + 25' swaps the rate and the fixed part, and '25h + 70' counts h + 1 additional hours instead of h - 1.",
          difficulty: "hard",
          why: ["This charges $25 for the first hour on top of $45: C(1) would be $70, not $45.", "This swaps the numbers: $25 is the hourly rate, and the first hour costs $45 total.", null, "This adds an extra hour instead of removing one: C(1) would be $95, not $45."],
        },
      ],
      traps: [
        "Swapping which number is the slope and which is the intercept, especially when the flat fee is mentioned first in the sentence.",
        "Forgetting that a decreasing quantity (like a draining tank) needs a negative sign on the rate term, not just the rate's numeric value.",
        "Using the first unit's price as the y-intercept when the first unit is priced differently: $50 for the first day plus $30 for each additional day is C = 30(d - 1) + 50 = 30d + 20, not 30d + 50.",
      ],
    },
    {
      name: "Reading Slope and Intercept Directly from a Graph",
      explanation:
        "This pattern gives you a line's graph (not an equation or table) and asks for its slope, y-intercept, or a specific value. No algebra needed: read the y-intercept where the line crosses the y-axis. Find the slope by picking two clearly marked points and computing rise over run, counting grid squares directly instead of estimating. Some questions describe the graph with conditions instead of showing it, such as 'the graph of f(x) = ax + b passes through (4, 0), and f(0) is negative,' and ask which inequality must be true. Sketch it: f(0) is the y-intercept, so b < 0, and a line rising from below the x-axis to (4, 0) has a > 0. Then use the x-intercept to connect the constants: 0 = 4a + b, so b = -4a.",
      examples: [
        {
          q: "A line is graphed passing through the marked points (0, 3) and (2, 7). What is the y-intercept of the line?",
          choices: ["3", "7", "2", "0"],
          answer: 0,
          explain:
            "The y-intercept is simply the point where the line crosses the y-axis, i.e., where x = 0. The graph shows the line passing through (0, 3) — that point directly is the y-intercept, read straight off the graph with no calculation needed.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "(0, 3)", at: "left" }, { label: "(2, 7)", at: "right" }] },
          difficulty: "easy",
          why: [null, "7 is the y-value of the other point, where x = 2. The y-intercept is where x = 0.", "2 is the x-value of the other point. The y-intercept is the y-value where x = 0.", "The line crosses the y-axis at (0, 3). 0 is its x-value there, not its y-value."],
        },
        {
          q: "A line is graphed passing through the marked points (1, 2) and (3, 8). What is the slope of the line?",
          choices: ["3", "6", "2", "1/3"],
          answer: 0,
          explain:
            "Compute rise over run between the two marked points: (8 - 2) / (3 - 1) = 6 / 2 = 3. Counting grid squares directly confirms it: from (1,2) to (3,8) is 2 squares right and 6 squares up, matching a slope of 3.",
          diagram: { kind: "lineGraph", direction: "steepPos", points: [{ label: "(1, 2)", at: "left" }, { label: "(3, 8)", at: "right" }] },
          difficulty: "easy",
          why: [null, "6 is the rise alone. Divide by the run, 3 − 1 = 2, to get a slope of 3.", "2 is the run alone. Slope is rise over run: 6 ÷ 2 = 3.", "This is run over rise, flipped. Slope is rise over run: 6/2 = 3."],
        },
        {
          q: "A line is graphed on axes where each gridline is worth 5 units, not 1. The line crosses the y-axis exactly 2 gridlines above the origin. What is the y-intercept of the line?",
          choices: ["10", "2", "7", "5"],
          answer: 0,
          explain:
            "The axes are scaled at 5 units per gridline, not the default 1 unit — easy to miss if you count gridlines as if each were worth 1. The line crosses the y-axis 2 gridlines up, and since each gridline equals 5 units, that's 2 × 5 = 10. Answering '2' is the trap that forgets to apply the scale.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "y-int", at: "left" }] },
          difficulty: "medium",
          why: [null, "2 counts gridlines as if each were 1 unit. Each is worth 5, so 2 gridlines is 10.", "7 adds 2 and 5. Two gridlines at 5 units each is 2 × 5 = 10.", "5 is the value of one gridline. The line crosses 2 gridlines up: 10."],
        },
        {
          q: "A line is graphed crossing the x-axis at (4, 0) and the y-axis at (0, 8). What is the slope of the line?",
          choices: ["-2", "2", "-1/2", "4"],
          answer: 0,
          explain:
            "Using the two marked points where the line crosses each axis, (4, 0) and (0, 8): slope = (8 - 0) / (0 - 4) = 8 / (-4) = -2. The line falling from upper-left to lower-right on the graph visually confirms a negative slope.",
          diagram: { kind: "lineGraph", direction: "steepNeg", points: [{ label: "(0, 8)", at: "left" }, { label: "(4, 0)", at: "right" }] },
          difficulty: "medium",
          why: [null, "The line falls from left to right, so the slope is negative: 8 ÷ (0 − 4) = −2.", "This is run over rise, flipped. Slope is rise over run: 8 ÷ (−4) = −2.", "4 is where the line crosses the x-axis, not its slope."],
        },
        {
          q: "A line is graphed on axes where each gridline represents 3 units. The line passes through the marked points (1 gridline right, 4 gridlines up) and (3 gridlines right, 2 gridlines up) from the origin. What is the y-intercept of the line, in actual units?",
          choices: ["15", "12", "-1", "3"],
          answer: 0,
          explain:
            "Convert grid positions to actual coordinates using the scale (3 units per gridline): the two points become (3, 12) and (9, 6). The slope is (6 - 12) / (9 - 3) = -6 / 6 = -1. Using one point and the slope to solve for the y-intercept: 12 = -1(3) + b, so b = 15 — this value isn't a point directly marked on the graph, so it has to be found by extending the line's equation back to x = 0.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "(3, 12)", at: "left" }, { label: "(9, 6)", at: "right" }] },
          difficulty: "hard",
          why: [null, "12 is the height of the first marked point, not where the line crosses the y-axis.", "−1 is the slope. The y-intercept comes from 12 = −1(3) + b, so b = 15.", "3 is the size of one gridline (or the first point's x-value), not the y-intercept."],
        },
        {
          q: "The function f is defined by f(x) = ax + b, where a and b are constants. In the xy-plane, the graph of y = f(x) passes through the point (-3, 0), and f(2) < 0. Which of the following must be true?",
          choices: ["a > 0", "b > 0", "b < a", "a < b"],
          answer: 2,
          explain:
            "Sketch it: the line crosses the x-axis at x = -3 and is below the x-axis at x = 2, so it falls from left to right: a < 0. Since x = 0 lies between -3 and 2, f(0) = b is also below the axis: b < 0. To compare them, use the x-intercept: 0 = a(-3) + b, so b = 3a. Tripling a negative number makes it smaller, so b < a. (For example, a = -1 gives b = -3.) 'a > 0' and 'b > 0' get the signs wrong, and 'a < b' reverses the true relationship.",
          difficulty: "hard",
          why: ["The line crosses the x-axis at −3 and is below it at x = 2, so it falls: a < 0.", "Between x = −3 and x = 2 the falling line is already below the x-axis, so b = f(0) < 0.", null, "b = 3a, and tripling a negative number makes it smaller, so b < a, not a < b."],
        },
      ],
      traps: [
        "Misreading which axis is which, especially when the graph's scale isn't 1 unit per gridline.",
        "Picking two points that aren't both exactly on the line (estimating rather than using clearly marked grid intersections).",
        "Confusing the x-intercept (where the line crosses the x-axis) with the y-intercept when the question asks for one specifically.",
        "In sign questions, deciding the slope's sign from the y-intercept's sign alone; the slope's direction comes from comparing two points, such as the x-intercept and the other point you're given.",
      ],
    },
    {
      name: "Finding Slope from Two Points or Function Values",
      explanation:
        "This pattern gives you two data points, either as coordinate pairs or as two function values like f(2) and f(5), and asks for the slope, or asks you to use the slope to find another value. The formula is always change in output divided by change in input. The same formula gives the average rate of change of data or of a nonlinear function over an interval: find the two points at the ends of the interval (read them from a scatterplot or table, or evaluate the function), then divide the change in y by the change in x. Points in between don't matter, even if the values rise and fall along the way. The real skill is correctly telling which numbers are inputs and which are outputs, especially in a word problem instead of plain coordinates.",
      examples: [
        {
          q: "A linear function f has f(0) = 4 and f(3) = 13. What is the slope of f?",
          choices: ["3", "9", "1/3", "4"],
          answer: 0,
          explain:
            "Translate function notation into coordinate pairs: f(0) = 4 means the point (0, 4); f(3) = 13 means the point (3, 13). The slope is (change in output) / (change in input) = (13 - 4) / (3 - 0) = 9 / 3 = 3.",
          diagram: { kind: "lineGraph", direction: "steepPos", points: [{ label: "(0, 4)", at: "left" }, { label: "(3, 13)", at: "right" }] },
          difficulty: "easy",
          why: [null, "9 is the change in output only. Divide by the change in input, 3, to get 3.", "This is flipped: change in input over change in output. Slope is 9 ÷ 3 = 3.", "4 is f(0), the y-intercept, not the slope."],
        },
        {
          q: "A linear function g has g(-2) = 9 and g(4) = -3. What is the slope of g?",
          choices: ["-2", "2", "-12", "-6"],
          answer: 0,
          explain:
            "Translate function notation into coordinate pairs: g(-2) = 9 means the point (-2, 9); g(4) = -3 means the point (4, -3). The slope is (-3 - 9) / (4 - (-2)) = -12 / 6 = -2 — the negative numbers make this a good check on sign carefulness.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "(-2, 9)", at: "left" }, { label: "(4, -3)", at: "right" }] },
          difficulty: "medium",
          why: [null, "The output drops from 9 to −3 as the input rises, so the slope is negative.", "−12 is the change in output only. Divide by the change in input, 6, to get −2.", "The change in input is 4 − (−2) = 6, not 2. Subtracting a negative adds."],
        },
        {
          q: "A linear function h has h(1) = 7 and h(4) = 16. What is the slope of h?",
          choices: ["3", "9", "23", "1/3"],
          answer: 0,
          explain:
            "Translate function notation into coordinate pairs: h(1) = 7 means (1, 7); h(4) = 16 means (4, 16). The slope is (16 - 7) / (4 - 1) = 9 / 3 = 3.",
          diagram: { kind: "lineGraph", direction: "steepPos", points: [{ label: "(1, 7)", at: "left" }, { label: "(4, 16)", at: "right" }] },
          difficulty: "easy",
          why: [null, "9 is the change in output only. Divide by the change in input, 3, to get 3.", "23 adds the two outputs. Slope is the difference in outputs over the difference in inputs.", "This is flipped: change in input over change in output. Slope is 9 ÷ 3 = 3."],
        },
        {
          q: "A linear function k has k(2) = 11 and a slope of 4. What is k(5)?",
          choices: ["23", "19", "15", "44"],
          answer: 0,
          explain:
            "Use the slope formula in reverse — each increase of 1 in input increases the output by the slope, 4. Going from x = 2 to x = 5 is an increase of 3 in input, so the output increases by 4 × 3 = 12, giving k(5) = 11 + 12 = 23.",
          diagram: {
            kind: "lineGraph",
            direction: "gentlePos",
            points: [{ label: "(2, 11)", at: "left" }, { label: "k(5) = ?", at: "right" }],
            slopeLabel: "slope = 4",
          },
          difficulty: "medium",
          why: [null, "19 adds only two steps of 4. From 2 to 5 is three steps: 11 + 3(4) = 23.", "15 adds only one step of 4. From 2 to 5 is three steps: 11 + 12 = 23.", "44 multiplies 11 by 4. The slope is added once for each 1-unit step, not multiplied."],
        },
        {
          q: "The function f is defined by f(x) = x² - 2x + 5. What is the average rate of change of f from x = 1 to x = 4?",
          choices: ["9", "1/3", "3", "8.5"],
          answer: 2,
          explain:
            "The graph of f isn't a line, but the average rate of change over an interval uses the same formula as slope, with the interval's endpoints. f(1) = 1 - 2 + 5 = 4 and f(4) = 16 - 8 + 5 = 13, so the average rate of change is (13 - 4)/(4 - 1) = 9/3 = 3. '9' is the change in output without dividing by the change in input, '1/3' flips the fraction, and '8.5' averages the two outputs instead of finding a rate.",
          difficulty: "medium",
          why: ["9 is the change in f(x) only. Divide by the change in x, 3.", "This is flipped: change in x over change in f(x). It's 9 ÷ 3 = 3.", null, "8.5 is the average of f(1) and f(4). A rate of change divides the change in output by the change in input."],
        },
        {
          q: "A linear function's values are shown in a table: when x = -3, y = 22; when x = 1, y = 10; when x = 6, y = -5. What is the slope of the function?",
          choices: ["-3", "3", "-12", "22"],
          answer: 0,
          explain:
            "Any two points from a linear function's table give the same slope, so pick a convenient pair: (10 - 22) / (1 - (-3)) = -12 / 4 = -3. Checking with the third point, from (1, 10) to (6, -5): (-5 - 10) / (6 - 1) = -15 / 5 = -3, the same value, confirming consistency.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "(-3, 22)", at: "left" }, { label: "(6, -5)", at: "right" }] },
          difficulty: "hard",
          why: [null, "y goes down as x goes up (22, then 10, then −5), so the slope is negative.", "−12 is the change in y only. Divide by the change in x, 4, to get −3.", "22 is a y-value from the table, not the slope."],
        },
      ],
      traps: [
        "Flipping the slope formula's numerator and denominator (using change in input over change in output).",
        "Misreading function notation, forgetting that f(3) means 'the output when input is 3,' not 'f times 3.'",
      ],
    },
    {
      name: "Writing a Line's Equation from Slope, a Point, or a Table",
      explanation:
        "These questions ask for a line's full equation, y = mx + b or f(x) = mx + b, built from the pieces you're handed: a slope and the y-intercept, a slope and some other point, or a short table of x- and y-values. First pin down the slope m: it's either given, or you find it from any two table rows as (change in y) / (change in x). Then find b, the y-intercept: if you're told the point (0, b), or the table has an x = 0 row, just read it; otherwise plug one known point into y = mx + b and solve for b. When the choices are in standard form (Ax + By = C), or the table's inputs use a letter like s, write y = mx + b first and then rearrange, or test each choice against every row, since the right equation has to fit all of them. If the equation is already in slope-intercept form, the slope is the coefficient of x and the y-intercept is the constant, so there's nothing to solve. Wrong choices usually use a given point's y-value as b, swap m and b, or fit only one row of the table.",
      examples: [
        {
          q: "A line in the xy-plane has a slope of 5 and passes through the point (0, -2). Which equation represents the line?",
          choices: ["y = -2x + 5", "y = 5x + 2", "y = 5x - 2", "y = -5x - 2"],
          answer: 2,
          explain:
            "The point (0, -2) has x = 0, so it's the y-intercept: b = -2. The slope is given: m = 5. Put them into y = mx + b to get y = 5x - 2. 'y = -2x + 5' swaps the slope and the intercept, 'y = 5x + 2' drops the negative sign on the intercept, and 'y = -5x - 2' puts a negative sign on the slope that isn't there.",
          difficulty: "easy",
          why: ["This swaps the numbers: the slope is 5 and the y-intercept is −2.", "The line crosses the y-axis at (0, −2), so b is −2, not 2.", null, "The slope is 5, not −5. Only the intercept is negative."],
        },
        {
          q: "The function f is defined by f(x) = 7 - 4x. What is the y-intercept of the graph of y = f(x) in the xy-plane?",
          choices: ["(0, 7)", "(0, -4)", "(7, 0)", "(7/4, 0)"],
          answer: 0,
          explain:
            "The y-intercept is the point where x = 0: f(0) = 7 - 4(0) = 7, so it's (0, 7). Written in the usual order the rule is f(x) = -4x + 7, so -4 is the slope, not the intercept. '(7, 0)' puts the 7 in the wrong coordinate, and '(7/4, 0)' is the x-intercept, where 7 - 4x = 0.",
          difficulty: "easy",
          why: [null, "−4 is the slope, the number multiplying x. The y-intercept is f(0) = 7.", "This swaps the coordinates. The y-intercept has x = 0: (0, 7).", "(7/4, 0) is where the graph crosses the x-axis, the x-intercept."],
        },
        {
          q: "A line in the xy-plane has a slope of -3 and passes through the point (4, 1). Which equation represents the line?",
          choices: ["y = -3x + 1", "y = -3x - 11", "y = 3x - 11", "y = -3x + 13"],
          answer: 3,
          explain:
            "The point (4, 1) isn't on the y-axis, so b has to be solved for. Plug the point and the slope into y = mx + b: 1 = -3(4) + b, so 1 = -12 + b and b = 13. The line is y = -3x + 13. 'y = -3x + 1' uses the point's y-value as the intercept, 'y = -3x - 11' subtracts 12 instead of adding it, and 'y = 3x - 11' does pass through (4, 1) but has slope 3, not -3.",
          difficulty: "medium",
          why: ["1 is the y-value at x = 4, not at x = 0. Solve 1 = −3(4) + b to get b = 13.", "A sign slip: 1 = −12 + b gives b = 1 + 12 = 13.", "This line passes through (4, 1), but its slope is 3, not −3.", null],
        },
        {
          q: "The table shows three values of x and their corresponding values of f(x), where f is a linear function.\n\nWhich equation defines f?",
          choices: ["f(x) = (4/3)x + 2", "f(x) = (3/4)x + 2", "f(x) = 3x + 2", "f(x) = (3/4)x - 1"],
          answer: 1,
          explain:
            "The row x = 0 gives the y-intercept directly: b = 2. For the slope, use two rows: from x = -4 to x = 0, f(x) goes from -1 to 2, so m = 3/4. Check the third row: (3/4)(6) + 2 = 6.5. So f(x) = (3/4)x + 2. '(4/3)x + 2' flips the slope, '3x + 2' uses the change in f(x), 3, without dividing by the change in x, 4, and '(3/4)x - 1' uses the first row's output as the intercept.",
          figure: {"kind": "table", "header": ["x", "f(x)"], "rows": [[-4, -1], [0, 2], [6, 6.5]]},
          difficulty: "medium",
          why: ["This flips the slope. f(x) rises 3 while x rises 4, so the slope is 3/4.", null, "3 is the change in f(x). Divide by the change in x, 4: the slope is 3/4.", "−1 is f(−4), not f(0). The x = 0 row shows the intercept is 2."],
        },
        {
          q: "The table shows three values of x and their corresponding values of y, where s is a constant. There is a linear relationship between x and y.\n\nWhich equation represents this relationship?",
          choices: ["2x + y = 2s + 9", "2x + y = s + 9", "2x - y = 2s - 9", "x + 2y = s + 18"],
          answer: 0,
          explain:
            "Each time x goes up by 2, y goes down by 4, so the slope is -4/2 = -2. Use the first row in point-slope form: y - 9 = -2(x - s), so y = -2x + 2s + 9, and moving -2x to the left gives 2x + y = 2s + 9. Check the second row: 2(s + 2) + 5 = 2s + 9. '2x + y = s + 9' forgets to multiply s by 2, and '2x - y = 2s - 9' (slope +2) and 'x + 2y = s + 18' (slope -1/2) each fit the first row but fail the other two.",
          figure: {"kind": "table", "header": ["x", "y"], "rows": [["s", 9], ["s + 2", 5], ["s + 4", 1]]},
          difficulty: "hard",
          why: [null, "This forgets to multiply s by the slope. y − 9 = −2(x − s) gives +2s, so the right side is 2s + 9.", "This uses a slope of +2, but y falls as x rises. It fits the first row only.", "This flips the slope to −1/2. It fits the first row, but the second row gives s + 12, not s + 18."],
        },
      ],
      traps: [
        "Using a given point's y-value as the y-intercept b when that point's x-value isn't 0.",
        "Finding the slope from a table by looking only at how much y changes between rows, without dividing by how much x changes (that shortcut only works when x goes up by exactly 1).",
        "Swapping the slope and the y-intercept, for example writing y = 4x + 3 for a line with slope 3 through (0, 4).",
        "Checking a choice against only one row of a table: several wrong equations fit one point, but only the right one fits every row.",
      ],
    },
    {
      name: "Evaluating a Function and Solving for Input Given Output",
      explanation:
        "This is the most basic linear-function skill, and it's easy to overlook: plug a given input directly into a function's rule to find its output, f(a), or run it backward, given an output, to solve for the input. Neither direction needs a graph or a second point; it's just substitution and algebra. To find f(a): substitute a for every x in the rule and simplify. To find x such that f(x) = b: set the rule equal to b and solve for x. The same substitution finds an unknown constant in the rule: if f(x) = kx - 7 and f(3) = 11, put 3 in for x and 11 in for f(x) to get 11 = 3k - 7, so k = 6. A value like f(0) is especially quick, since every x-term becomes 0 and only the constant is left.",
      examples: [
        {
          q: "The function is defined by f(x) = 7x + 1. What is f(4)?",
          choices: ["29", "28", "32", "11"],
          answer: 0,
          explain: "Substitute x = 4 into the rule: f(4) = 7(4) + 1 = 28 + 1 = 29.",
          difficulty: "easy",
          why: [null, "28 is 7(4) without the + 1.", "32 comes from adding 1 before multiplying: 7(4) + 1 is 28 + 1.", "11 adds 7 and 4. The rule multiplies: 7 times 4, then add 1."],
        },
        {
          q: "The function is defined by g(x) = -3x + 10. What is g(-2)?",
          choices: ["16", "4", "-16", "13"],
          answer: 0,
          explain:
            "Substitute x = -2 into the rule, being careful with the sign: g(-2) = -3(-2) + 10 = 6 + 10 = 16 — a negative input multiplied by a negative coefficient produces a positive term.",
          difficulty: "easy",
          why: [null, "4 treats −3 times −2 as −6. A negative times a negative is positive: +6, so 6 + 10 = 16.", "A sign slip: −3(−2) is +6, and 6 + 10 = +16.", "Check it: −3(−2) + 10 = 16, not 13."],
        },
        {
          q: "The function is defined by h(x) = 5x - 8. For what value of x does h(x) = 27?",
          choices: ["7", "35", "3.8", "19"],
          answer: 0,
          explain: "Set the rule equal to the given output: 5x - 8 = 27. Add 8 to both sides: 5x = 35. Divide by 5: x = 7.",
          difficulty: "medium",
          why: [null, "35 is 5x. Divide by 5 to get x = 7.", "3.8 comes from subtracting 8 instead of adding it: 5x = 19. Add 8 to both sides: 5x = 35.", "19 is 27 − 8. You need to add 8 to both sides, then divide by 5."],
        },
        {
          q: "The function is defined by f(x) = (2/3)x + 4. What is f(9)?",
          choices: ["10", "6", "13", "8.67"],
          answer: 0,
          explain: "Substitute x = 9: f(9) = (2/3)(9) + 4. Simplify the fraction times 9 first: (2/3)(9) = 6, then add: 6 + 4 = 10.",
          difficulty: "medium",
          why: [null, "6 is (2/3)(9) without the + 4.", "13 adds 9 and 4, skipping the multiplication by 2/3.", "(2/3)(9) is exactly 6, so f(9) = 6 + 4 = 10. There's no decimal."],
        },
        {
          q: "The function f is defined by f(x) = kx - 7, where k is a constant. If f(3) = 11, what is the value of k?",
          choices: ["10/11", "18", "6", "4/3"],
          answer: 2,
          explain:
            "f(3) = 11 says that when the input is 3, the output is 11. Substitute both: 11 = k(3) - 7. Add 7: 18 = 3k, so k = 6. Check: f(3) = 6(3) - 7 = 11. '10/11' puts 11 in as the input and 3 as the output, '18' is 3k, one step before dividing, and '4/3' subtracts 7 from 11 instead of adding it.",
          difficulty: "medium",
          why: ["This swaps the input and output: f(3) = 11 means x = 3 and f(x) = 11.", "18 is 3k. Divide by 3 to get k = 6.", null, "A sign slip: 11 = 3k − 7 gives 3k = 18, not 4."],
        },
        {
          q: "The function is defined by k(x) = 4x - 9. If k(2n) = 15, what is the value of n?",
          choices: ["3", "6", "1.5", "24"],
          answer: 0,
          explain:
            "The input here isn't a plain number but an expression, 2n — substitute it exactly as given: k(2n) = 4(2n) - 9 = 8n - 9. Set this equal to the given output: 8n - 9 = 15, so 8n = 24 and n = 3. The input being an expression rather than a plain number doesn't change the method, just the algebra required after substituting.",
          difficulty: "hard",
          why: [null, "6 is the value of 2n. The question asks for n, which is 3.", "Check it: if n = 1.5, then 2n = 3 and k(3) = 4(3) − 9 = 3, not 15.", "24 is 8n. Divide by 8 to get n = 3."],
        },
      ],
      traps: [
        "Substituting the given value for f(x) itself rather than for x — these are the output and input respectively, not interchangeable.",
        "Sign errors when substituting a negative input into a function with a negative coefficient.",
        "When the input is an expression rather than a plain number, forgetting to substitute the entire expression (not just part of it) everywhere x appears in the rule.",
      ],
    },
  ],
  tipsAndTricks: [
    "In word problems, 'per' always signals slope/rate, and a flat starting amount (with no 'per') always signals the y-intercept.",
    "If a quantity is decreasing over time (draining, depreciating, cooling), the slope in your function must be negative — double-check the sign, not just the magnitude.",
    "Function notation f(a) = b means the point (a, b) — converting to coordinate pairs first makes slope and intercept problems much more mechanical.",
  ],
};

const LC_M_LINEAR_EQ_2VAR: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Reading Slope and Intercepts from Standard Form",
      explanation:
        "Lines are often given in standard form (Ax + By = C) instead of slope-intercept form, and many students waste time trying to read the slope straight from it. For the slope, the reliable method is to convert to slope-intercept form (y = mx + b) first by isolating y, then read off the slope. For the intercepts, you don't need to convert: set y = 0 to get the x-intercept, x = C/A, and set x = 0 to get the y-intercept, y = C/B. Intercepts are the fastest way to match a standard-form equation to a graph: read where the line crosses each axis and pick the equation whose C/A and C/B match. In a context such as a budget, 4x + 10y = 200, an intercept means one quantity is zero: the x-intercept, 50, is how many of the $4 items you could buy with none of the $10 items, and a known intercept also lets you work backward to a missing coefficient.",
      examples: [
        {
          q: "What is the slope of the line 4x + 2y = 8?",
          choices: ["-2", "2", "4", "-4"],
          answer: 0,
          explain:
            "Isolate y by moving 4x to the other side: 2y = -4x + 8. Divide every term by 2: y = -2x + 4. The slope is directly readable as the coefficient of x: -2, not the coefficient from the original standard form.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -2" },
          difficulty: "easy",
          why: [null, "A sign slip: moving 4x across makes it −4x, so y = −2x + 4.", "4 is the x-coefficient in standard form. Solve for y first: y = −2x + 4.", "This forgets to divide by 2. From 2y = −4x + 8, dividing gives −2."],
        },
        {
          q: "What is the slope of the line 6x - 3y = 12?",
          choices: ["2", "-2", "6", "-6"],
          answer: 0,
          explain:
            "Isolate y by moving 6x to the other side: -3y = -6x + 12. Divide every term by -3, being careful with the negative signs: y = 2x - 4. Dividing by a negative coefficient here still produces a positive slope, since both terms being divided were negative.",
          diagram: { kind: "lineGraph", direction: "gentlePos", slopeLabel: "slope = 2" },
          difficulty: "medium",
          why: [null, "Dividing −6x by −3 gives +2x. Two negatives make a positive.", "6 is the x-coefficient in standard form. Solve for y first: y = 2x − 4.", "This forgets to divide by −3 after moving 6x across."],
        },
        {
          q: "What is the slope of the line 2x + y = 5?",
          choices: ["-2", "2", "5", "-5"],
          answer: 0,
          explain: "Isolate y by subtracting 2x from both sides: y = -2x + 5. The slope is directly readable as the coefficient of x: -2.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -2" },
          difficulty: "easy",
          why: [null, "A sign slip: moving 2x across makes it −2x, so y = −2x + 5.", "5 is the y-intercept, not the slope.", "−5 is the negative of the intercept. The slope is the coefficient of x: −2."],
        },
        {
          q: "What is the slope of the line 5x + 4y = 20?",
          choices: ["-5/4", "5/4", "5", "-4/5"],
          answer: 0,
          explain:
            "Isolate y by moving 5x to the other side: 4y = -5x + 20. Divide every term by 4: y = -(5/4)x + 5. The slope is the coefficient of x: -5/4 — the fraction just needs to be carried through the division carefully.",
          diagram: { kind: "lineGraph", direction: "steepNeg", slopeLabel: "slope = -5/4" },
          difficulty: "medium",
          why: [null, "A sign slip: moving 5x across makes it −5x, so the slope is −5/4.", "5 is the x-coefficient in standard form. Divide by 4 after isolating y.", "This is the flipped fraction. Slope is −5/4: the x-coefficient over the y-coefficient, with the sign changed."],
        },
        {
          q: "A club bought x T-shirts and y hats, spending all of its budget. The graph shows the possible combinations.\n\nWhich equation could represent the relationship between x and y?",
          choices: ["8x + 12y = 120", "12x + 8y = 120", "10x + 15y = 120", "12x - 8y = 120"],
          answer: 1,
          explain:
            "The graph crosses the x-axis at 10 and the y-axis at 15. For each choice, find the intercepts: the x-intercept is C/A and the y-intercept is C/B. For 12x + 8y = 120, those are 120/12 = 10 and 120/8 = 15, a match. '8x + 12y = 120' has intercepts 15 and 10, the reverse. '10x + 15y = 120' uses the intercepts as coefficients, which gives intercepts 12 and 8. '12x - 8y = 120' has a y-intercept of -15, below the x-axis.",
          figure: {"kind": "scatter", "x": {"label": "T-shirts, x", "min": 0, "max": 12, "step": 2}, "y": {"label": "Hats, y", "min": 0, "max": 18, "step": 3}, "points": [[0, 15], [10, 0]], "line": {"slope": -1.5, "intercept": 15}},
          difficulty: "medium",
          why: ["This swaps the intercepts: 120/8 = 15 on the x-axis and 120/12 = 10 on the y-axis.", null, "This uses the intercepts as coefficients. Its intercepts are 120/10 = 12 and 120/15 = 8.", "The minus sign makes the y-intercept 120/(−8) = −15, but the graph crosses the y-axis at +15."],
        },
        {
          q: "What is the slope of the line -3x - 6y = 18?",
          choices: ["-1/2", "1/2", "-2", "2"],
          answer: 0,
          explain:
            "Isolate y by adding 3x to both sides: -6y = 3x + 18. Divide every term by -6, tracking both sign flips carefully: y = -0.5x - 3. The slope is the coefficient of x: -1/2.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -1/2" },
          difficulty: "hard",
          why: [null, "A sign slip: 3x ÷ (−6) = −0.5x, so the slope is negative.", "This is the flipped fraction. 3 divided by −6 is −1/2, not −2.", "This is flipped and has the wrong sign. The slope is 3/(−6) = −1/2."],
        },
        {
          q: "A truck carries x boxes of tile and y bags of cement. The equation ax + 20y = 900 represents the situation in which the total mass of the load is 900 kilograms, where a is a constant. The graph of this equation is shown.\n\nWhat is the mass, in kilograms, of one box of tile?",
          choices: ["36", "20", "25", "45"],
          answer: 2,
          explain:
            "The x-intercept is where y = 0: a load of tile only. The graph crosses the x-axis at 36, so 36 boxes of tile weigh 900 kilograms: a(36) = 900, and a = 25. That's the mass of one box. '36' is the number of boxes (the intercept itself), not the mass of each. '20' is the mass of one bag of cement, the coefficient of y, and '45' is the y-intercept, the number of cement bags in a cement-only load.",
          figure: {"kind": "scatter", "x": {"label": "Boxes of tile, x", "min": 0, "max": 40, "step": 4}, "y": {"label": "Bags of cement, y", "min": 0, "max": 50, "step": 5}, "points": [[36, 0], [0, 45]], "line": {"slope": -1.25, "intercept": 45}},
          difficulty: "hard",
          why: ["36 is the number of boxes in a tile-only load. Each box weighs 900 ÷ 36 = 25 kg.", "20 multiplies y, so it's the mass of one bag of cement, not a box of tile.", null, "45 is the y-intercept: the number of cement bags in a cement-only load."],
        },
      ],
      traps: [
        "Reading the coefficient of x in standard form directly as the slope, without converting — this gives the wrong sign or value.",
        "Sign errors when dividing negative coefficients across the equation.",
        "Mixing up the intercepts: the x-intercept comes from setting y = 0 (C/A), and the y-intercept from setting x = 0 (C/B).",
        "Confusing an intercept with a coefficient in context: in 4x + 10y = 200, 4 is the cost of one item, while the x-intercept, 50, is how many of those items the budget covers.",
      ],
    },
    {
      name: "Parallel and Perpendicular Line Relationships",
      explanation:
        "This pattern tests how the slopes of parallel lines (identical) and perpendicular lines (negative reciprocals) relate to each other. The fastest approach: convert every line to slope-intercept form first, find the slope, then apply the right rule directly — don't waste time trying to visualize or graph the lines.",
      examples: [
        {
          q: "A line has slope -2. Which relationship does it have to the line y = (1/2)x + 3?",
          choices: ["Perpendicular", "Parallel", "The same line", "Neither parallel nor perpendicular"],
          answer: 0,
          explain:
            "The given line has slope 1/2. For a perpendicular line, take the negative reciprocal: flip the fraction (getting 2/1, or 2) and change the sign (making it -2). Since -2 is the negative reciprocal of 1/2, the lines are perpendicular.",
          diagram: { kind: "lineGraph", direction: "gentlePos", slopeLabel: "slope = 1/2", extra: { direction: "steepNeg", label: "perpendicular: slope = -2" } },
          difficulty: "easy",
          why: [null, "Parallel lines have the same slope. −2 and 1/2 are different.", "The same line would need the same slope, and −2 isn't 1/2.", "−2 is the negative reciprocal of 1/2 (flip it, change the sign), so the lines are perpendicular."],
        },
        {
          q: "A line has slope 3/2. Which relationship does it have to the line 3x - 2y = 8?",
          choices: ["Parallel", "Perpendicular", "The same line", "Neither parallel nor perpendicular"],
          answer: 0,
          explain:
            "Convert to slope-intercept form first: -2y = -3x + 8, so y = (3/2)x - 4. The slope of the given line is 3/2. Parallel lines share the exact same slope (unlike perpendicular lines, which need the negative reciprocal), so a line with slope 3/2 is parallel — this required converting from standard form first before the comparison was possible.",
          diagram: { kind: "lineGraph", direction: "gentlePos", slopeLabel: "slope = 3/2", extra: { direction: "gentlePos", label: "parallel: slope = 3/2" } },
          difficulty: "medium",
          why: [null, "Perpendicular would need the negative reciprocal, −2/3. The slopes here are equal.", "Only a slope is given. Being the same line would also require the same intercept, which isn't given.", "The given line's slope is 3/2 once you solve for y, so the slopes match. That's parallel."],
        },
        {
          q: "A line has slope 4. Which relationship does it have to the line y = 4x - 1?",
          choices: ["Parallel", "Perpendicular", "Neither parallel nor perpendicular", "The same line"],
          answer: 0,
          explain: "The given line's slope is 4. Parallel lines share the exact same slope, so a line with slope 4 is parallel.",
          diagram: { kind: "lineGraph", direction: "steepPos", slopeLabel: "slope = 4", extra: { direction: "steepPos", label: "parallel: slope = 4" } },
          difficulty: "easy",
          why: [null, "Perpendicular would need the negative reciprocal, −1/4. The slopes here are equal.", "Both slopes are 4, and equal slopes mean parallel.", "Only a slope is given. Being the same line would also require the same intercept, which isn't given."],
        },
        {
          q: "A line has slope 2. Which relationship does it have to the line 2x + 4y = 16?",
          choices: ["Perpendicular", "Parallel", "The same line", "Neither parallel nor perpendicular"],
          answer: 0,
          explain:
            "Convert to slope-intercept form first: 4y = -2x + 16, so y = -0.5x + 4. The given slope is -1/2. For a perpendicular line, take the negative reciprocal: flip the fraction (2/1) and change the sign, giving 2, which matches the described line.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -1/2", extra: { direction: "steepPos", label: "perpendicular: slope = 2" } },
          difficulty: "medium",
          why: [null, "Parallel would need the same slope. The given line's slope is −1/2, not 2.", "The same line would need the same slope. −1/2 and 2 are different.", "2 is the negative reciprocal of −1/2 (their product is −1), so they're perpendicular."],
        },
        {
          q: "Two lines are given: 4x + 6y = 12 and 6x - 4y = 8. Are these two lines parallel, perpendicular, or neither?",
          choices: ["Perpendicular", "Parallel", "Neither parallel nor perpendicular", "The same line"],
          answer: 0,
          explain:
            "Convert both to slope-intercept form. Line 1: 6y = -4x + 12, so y = -(2/3)x + 2, slope = -2/3. Line 2: -4y = -6x + 8, so y = (3/2)x - 2, slope = 3/2. Multiplying the two slopes gives (-2/3)(3/2) = -1, confirming they are negative reciprocals of each other, so the lines are perpendicular.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -2/3", extra: { direction: "steepPos", label: "slope = 3/2" } },
          difficulty: "hard",
          why: [null, "Parallel lines have equal slopes. These are −2/3 and 3/2.", "(−2/3)(3/2) = −1, so the slopes are negative reciprocals. That's perpendicular.", "The slopes are different, so they can't be the same line."],
        },
      ],
      traps: [
        "Taking only the reciprocal (flipping the fraction) without also changing the sign — perpendicular slopes require both steps.",
        "Confusing parallel (same slope) and perpendicular (negative reciprocal slope) rules under time pressure.",
      ],
    },
    {
      name: "Interpreting a Constant or Coefficient in a Real-World Equation",
      explanation:
        "This pattern gives you a linear equation that already models a real situation, and asks what a specific number in it represents: you're reading backward from a given equation, not building one from scratch. The method: figure out what each variable stands for from the setup, then match the number's role to what that means in context. A number multiplying a variable is a rate tied to that variable. A number standing alone (not multiplying anything) is a fixed amount, present no matter what the variables equal.",
      examples: [
        {
          q: "A store's total revenue from selling notebooks is represented by y = 3x + 50, where x is the number of notebooks sold. What does the 50 represent in this equation?",
          choices: [
            "A fixed amount of revenue that exists even if zero notebooks are sold",
            "The price, in dollars, of each notebook sold",
            "The total number of notebooks sold",
            "The maximum revenue the store can earn",
          ],
          answer: 0,
          explain:
            "3 multiplies x, making it the coefficient — a per-notebook rate. 50 stands alone, representing a fixed amount present even when x = 0, revenue from some source separate from notebook sales.",
          difficulty: "easy",
          why: [null, "The price per notebook is 3, the number multiplied by x. 50 stands alone.", "x is the number of notebooks. 50 isn't attached to x at all.", "Revenue keeps growing as x grows, so 50 isn't a maximum. It's the starting amount when x = 0."],
        },
        {
          q: "The equation y = 5x + 200 models the total cost, in dollars, of renting a hall for an event with x guests. What does the 5 represent?",
          choices: [
            "The additional cost, in dollars, per guest",
            "The flat rental fee charged regardless of guest count",
            "The total number of guests at the event",
            "The maximum number of guests allowed",
          ],
          answer: 0,
          explain:
            "5 multiplies x, making it the coefficient. A coefficient tied to the number of guests represents a per-guest rate; the 200, by contrast, is the flat rental fee charged regardless of guest count.",
          difficulty: "easy",
          why: [null, "The flat fee is 200, the number that stands alone. 5 is multiplied by the guest count.", "x is the number of guests. 5 is multiplied by x, so it's a per-guest amount.", "Nothing in the equation sets a maximum. 5 is the cost added per guest."],
        },
        {
          q: "A store sells two sizes of candles. The equation 4.51x + 6.07y = 896.86 represents last month's total sales, where x is the number of smaller candles sold and y is the number of larger candles sold. What does 6.07 represent?",
          choices: [
            "The price, in dollars, of each larger candle",
            "The price, in dollars, of each smaller candle",
            "The total number of larger candles sold",
            "The store's total sales for the month",
          ],
          answer: 0,
          explain:
            "6.07 multiplies y, the number of larger candles. Since the equation totals dollar sales, this term must represent dollars earned specifically from larger candles, making 6.07 the price of one larger candle — not the smaller candle's price (4.51, tied to x) or the total (896.86).",
          difficulty: "medium",
          why: [null, "The smaller candles are x, and x is multiplied by 4.51. 6.07 goes with y.", "y is the number of larger candles. 6.07 is multiplied by y, so it's a price.", "The total sales is 896.86, on the right side of the equation."],
        },
        {
          q: "The equation x + y = 1,440 represents the number of minutes of daylight, x, and minutes of non-daylight, y, in a day. What does the 1,440 represent?",
          choices: [
            "The total number of minutes in a full day",
            "The number of minutes of daylight",
            "The number of minutes of non-daylight",
            "The rate at which daylight changes per day",
          ],
          answer: 0,
          explain:
            "Neither x nor y is multiplied by 1,440 — it stands alone as the equation's total. Since x and y together make up all the minutes in a day, 1,440 must represent the total number of minutes in a full day, not a rate or either variable's individual value.",
          difficulty: "medium",
          why: [null, "x is the minutes of daylight. 1,440 is what x and y add up to.", "y is the minutes of non-daylight. 1,440 is the total of both.", "1,440 isn't multiplied by anything; it's the fixed total of x + y, not a rate."],
        },
        {
          q: "A company's weekly profit is given by P = 45n - 12n - 900, where n is the number of units produced. After simplifying the equation, what does the simplified coefficient of n represent?",
          choices: [
            "The net profit earned per unit, combining per-unit revenue and per-unit cost",
            "The per-unit revenue only, before costs are subtracted",
            "The per-unit cost only, before revenue is added",
            "The company's fixed weekly costs",
          ],
          answer: 0,
          explain:
            "Before interpreting anything, simplify by combining like terms: 45n - 12n - 900 = 33n - 900. In the original equation, 45 was per-unit revenue and 12 was per-unit cost, but the simplified coefficient, 33, already combines both, representing net profit per unit rather than either piece alone.",
          difficulty: "hard",
          why: [null, "45 was the per-unit revenue, but after subtracting 12, the combined 33 is net profit per unit.", "12 was the per-unit cost. The simplified 33 combines revenue and cost.", "The fixed cost is 900, the term with no n attached."],
        },
      ],
      traps: [
        "Confusing the coefficient (multiplies a variable, representing a rate) with the constant term (stands alone, representing a fixed starting amount).",
        "Assigning a number's meaning to the wrong variable when the equation involves two related quantities.",
        "Overlooking the units or context needed to state precisely what the number represents, rather than just restating the number itself.",
      ],
    },
    {
      name: "Translating a Word Scenario into a Two-Variable Equation",
      explanation:
        "Some questions ask you to build a two-variable equation from a word description, instead of analyzing one you're already given. The method: identify the two quantities the equation will relate — these become your two variables. Then find what connects them: often a fixed total the two quantities must add up to, or a per-unit rate multiplying each. Assign each variable to one quantity, write down in plain words what it represents, then translate using the same word cues as any equation-building question: 'per' or 'each' means multiplication by that variable, and a fixed total becomes the constant the equation equals.",
      examples: [
        {
          q: "A movie theater sells adult tickets for $12 each and child tickets for $8 each. Which equation shows that total ticket revenue was $840, where a is the number of adult tickets and c is the number of child tickets sold?",
          choices: ["12a + 8c = 840", "8a + 12c = 840", "12a + 8c = 840 - a - c", "(12 + 8)(a + c) = 840"],
          answer: 0,
          explain:
            "Each adult ticket contributes $12, so adult revenue is 12a; each child ticket contributes $8, so child revenue is 8c. The two revenues together equal the given total: 12a + 8c = 840.",
          difficulty: "easy",
          why: [null, "This swaps the prices. Adults pay $12 and children $8, so it's 12a + 8c.", "Subtracting a and c from 840 has no meaning here. The revenue simply equals 840.", "This charges $20 for every ticket, adults and children alike. Each type has its own price."],
        },
        {
          q: "A farm has both chickens and cows. Chickens have 2 legs and cows have 4 legs. Which equation shows that the animals on the farm have a total of 172 legs, where h is the number of chickens and w is the number of cows?",
          choices: ["2h + 4w = 172", "4h + 2w = 172", "2h + 4w = 172 - h - w", "h + w = 172"],
          answer: 0,
          explain:
            "Each chicken contributes 2 legs, so chicken legs total 2h; each cow contributes 4 legs, so cow legs total 4w. Together they equal the given total: 2h + 4w = 172.",
          difficulty: "easy",
          why: [null, "This gives chickens 4 legs and cows 2. It's 2 per chicken and 4 per cow.", "Subtracting h and w from 172 has no meaning here. The legs simply total 172.", "This counts animals, not legs. Each animal has 2 or 4 legs."],
        },
        {
          q: "A gym charges a one-time $50 enrollment fee plus $30 per month of membership. Which equation gives the total amount paid, T, after m months of membership?",
          choices: ["T = 50 + 30m", "T = 30 + 50m", "T = 50m + 30", "T = 80m"],
          answer: 0,
          explain:
            "The enrollment fee is paid once, regardless of how many months pass — it's a fixed constant, not multiplied by anything. The monthly charge, $30, is multiplied by the number of months, m: T = 50 + 30m.",
          difficulty: "medium",
          why: [null, "This swaps the numbers: $30 once and $50 a month. The fee is $50 once, $30 a month.", "This charges the $50 fee every month. It's paid only once.", "Adding 50 and 30 into one monthly charge charges the fee every month. It's a one-time cost."],
        },
        {
          q: "A rectangular garden's perimeter is 60 feet. Which equation relates its length, l, and width, w?",
          choices: ["2l + 2w = 60", "l + w = 60", "l × w = 60", "2l - 2w = 60"],
          answer: 0,
          explain:
            "Recall the perimeter formula for a rectangle: P = 2l + 2w, since there are two lengths and two widths. Substituting the given perimeter gives 2l + 2w = 60.",
          difficulty: "medium",
          why: [null, "l + w is only half the perimeter. A rectangle has two lengths and two widths.", "l × w is the area, not the perimeter.", "Perimeter adds all four sides. Nothing gets subtracted."],
        },
        {
          q: "A chemist mixes a solution that is 20% acid with a solution that is 50% acid to create 12 liters of a mixture. Which equation shows that the resulting mixture is 30% acid, where x is the number of liters of the 20% solution and y is the number of liters of the 50% solution?",
          choices: ["0.20x + 0.50y = 3.6", "0.20x + 0.50y = 0.30", "20x + 50y = 30", "0.20x + 0.50y = 12"],
          answer: 0,
          explain:
            "The total acid contributed by each solution is its concentration times its volume: 0.20x from the first, 0.50y from the second. The final mixture's total acid content is its concentration times its total volume: 0.30(12) = 3.6. Setting the sum of the contributed acid equal to that total gives 0.20x + 0.50y = 3.6.",
          difficulty: "hard",
          why: [null, "0.30 is the concentration, not the amount of acid. The mixture has 0.30 × 12 = 3.6 liters of acid.", "The percents must be decimals times volume, and 30 isn't the total acid. The total acid is 3.6 liters.", "12 is the total volume of the mixture, not the amount of acid in it."],
        },
      ],
      traps: [
        "Multiplying the wrong quantity by a rate or price — double-check which variable each per-unit value actually belongs to.",
        "Treating a one-time fixed cost as if it needed to be multiplied by a variable, when it should remain a standalone constant.",
        "In mixture problems, forgetting that both the total volume AND the total concentration need their own accounting — losing track of one of the two relationships the scenario describes.",
      ],
    },
    {
      name: "Solving for One Variable Given the Other's Value",
      explanation:
        "Given a two-variable equation and a value for one of the variables, substitute the known value in and solve the resulting one-variable equation for what's left. This is a much shorter skill than analyzing slope or intercepts — it's direct substitution and algebra, just like solving any one-variable equation, with one extra substitution step first.",
      examples: [
        {
          q: "If 3x + 2y = 22 and y = 5, what is the value of x?",
          choices: ["4", "6", "12", "17"],
          answer: 0,
          explain: "Substitute y = 5: 3x + 2(5) = 22, which simplifies to 3x + 10 = 22. Subtract 10: 3x = 12. Divide by 3: x = 4.",
          difficulty: "easy",
          why: [null, "Check it: 3(6) + 2(5) = 28, not 22.", "12 is 3x. Divide by 3 to get x = 4.", "17 comes from subtracting 5 instead of 2(5). y is multiplied by 2, so subtract 10."],
        },
        {
          q: "The equation 4a - b = 15 relates a and b. If a = 6, what is the value of b?",
          choices: ["9", "-9", "39", "3"],
          answer: 0,
          explain:
            "Substitute a = 6: 4(6) - b = 15, which simplifies to 24 - b = 15. Subtract 24 from both sides: -b = -9. Multiply both sides by -1: b = 9 — solving for a variable with a negative coefficient requires this extra sign flip at the end.",
          difficulty: "easy",
          why: [null, "−9 is −b, not b. Multiply both sides by −1: b = 9.", "39 comes from adding 15 to 24. Check: 4(6) − 39 = −15, not 15.", "Check it: 4(6) − 3 = 21, not 15."],
        },
        {
          q: "A city recorded x + y = 1,440 minutes of daylight (x) and non-daylight (y) in a day. If the city had 620 minutes of daylight, how many minutes of non-daylight did it have?",
          choices: ["820", "620", "1440", "2060"],
          answer: 0,
          explain: "Substitute x = 620 into the equation: 620 + y = 1,440. Subtract 620 from both sides: y = 820.",
          difficulty: "medium",
          why: [null, "620 is the daylight minutes, x. The question asks for y.", "1,440 is the total. Subtract the daylight: 1,440 − 620 = 820.", "2,060 adds 620 to the total instead of subtracting it."],
        },
        {
          q: "The equation 2x + 5y = 34 relates x and y. If y = 2x, what is the value of x?",
          choices: ["17/6", "17/3", "34/7", "2"],
          answer: 0,
          explain:
            "Here the 'known value' isn't a plain number but an expression in terms of the other variable — substitute y = 2x directly into the equation: 2x + 5(2x) = 34, which simplifies to 12x = 34, so x = 34/12 = 17/6. Getting 17/3 comes from dividing by 6 instead of 12, and getting 34/7 comes from adding the coefficients incorrectly.",
          difficulty: "medium",
          why: [null, "This divides 34 by 6 instead of 12. After substituting, 2x + 10x = 12x.", "34/7 treats y as x instead of 2x. Substitute y = 2x: 2x + 5(2x) = 12x.", "Check it: 2(2) + 5(4) = 24, not 34."],
        },
        {
          q: "A phone plan's monthly cost is modeled by C = 25 + 0.10m, where m is minutes used beyond the plan's included minutes. If a customer's bill was $52.50, how many minutes beyond the included minutes did they use?",
          choices: ["275", "27.5", "2.75", "525"],
          answer: 0,
          explain:
            "Substitute the known cost, C = 52.50: 52.50 = 25 + 0.10m. Subtract 25 from both sides: 27.50 = 0.10m. Divide both sides by 0.10: m = 275.",
          difficulty: "hard",
          why: [null, "27.5 is 0.10m. Divide by 0.10 to get m.", "2.75 multiplies 27.5 by 0.10 instead of dividing by it.", "525 divides the whole bill by 0.10, forgetting to subtract the $25 base first."],
        },
      ],
      traps: [
        "Substituting the known value for the wrong variable in the equation.",
        "Sign errors when isolating a variable that has a negative coefficient after substitution.",
        "Rushing the substitution step and simplifying incorrectly, especially when the known 'value' is itself an expression rather than a plain number.",
      ],
    },
  ],
  tipsAndTricks: [
    "Whenever a line is given in standard form (Ax + By = C), immediately convert to slope-intercept form before doing anything else — don't try to identify slope directly from standard form.",
    "For perpendicular slopes, remember it's two steps: flip the fraction AND flip the sign. Forgetting the sign flip is the single most common error here.",
    "A vertical line (x = constant) has an undefined slope, and a horizontal line (y = constant) has a slope of exactly 0 — these are easy to mix up under time pressure.",
  ],
};

const LC_M_SYSTEMS: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Solving by Substitution and Setting Up Systems from Words",
      explanation:
        "Some systems give you one equation that's already solved for a variable, like y = 3x - 2 or x = 5, and others come as a word problem you have to turn into two equations first. When one equation already reads 'y = ...' or 'x = ...', substitution beats elimination: replace that variable in the other equation with the expression, in parentheses, solve the one-variable equation, then plug back in if the question asks for the other variable. For word problems, name the two unknowns and translate phrase by phrase: 'a total of' or 'in all' means the two add to that number, 'the difference' or 'more than' (between two quantities) means subtract, and 'k times as many A as B' means A = kB, with 'more than' or 'less than' adding or subtracting after the multiplying ('6 more than twice S' is 2S + 6). The 'times as many' equation is usually already solved for one variable, so substitute it into the other equation. Before you pick an answer, check which quantity the question asks for, since the value of the other variable is always among the choices; other wrong answers come from reversing a 'times as many' relationship or dropping the parentheses when you substitute.",
      examples: [
        {
          q: "x = 4\n3x - 2y = 20\n\nIn the solution (x, y) to the system of equations above, what is the value of y?",
          choices: ["4", "-4", "-8", "8"],
          answer: 1,
          explain:
            "The first equation hands you x, so substitute it straight into the second: 3(4) - 2y = 20, so 12 - 2y = 20, -2y = 8, and y = -4. '4' is the value of x, not y. '-8' comes from substituting 4 without multiplying it by 3 (4 - 2y = 20), and '8' is the value of -2y, one step before dividing by -2.",
          difficulty: "easy",
          why: ["4 is the value of x. The question asks for y.", null, "This substitutes 4 for 3x instead of for x. It's 3(4) = 12, so −2y = 8.", "8 is −2y. Divide by −2 to get y = −4."],
        },
        {
          q: "y = 2x - 7\n5x + 3y = 34\n\nIn the solution (x, y) to the system of equations above, what is the value of x?",
          choices: ["3", "41/11", "13/11", "5"],
          answer: 3,
          explain:
            "The first equation is already solved for y, so substitute the whole expression, in parentheses: 5x + 3(2x - 7) = 34. Distribute: 5x + 6x - 21 = 34, so 11x = 55 and x = 5. '3' is y (2(5) - 7 = 3), not x. '41/11' multiplies only the 2x by 3 and leaves -7 alone, and '13/11' turns -21 into +21.",
          difficulty: "easy",
          why: ["3 is the value of y. The question asks for x.", "This drops the parentheses: 3(2x − 7) is 6x − 21, not 6x − 7.", "A sign slip: 3(−7) is −21, so 11x = 34 + 21 = 55.", null],
        },
        {
          q: "A community orchard has 3 times as many apple trees as pear trees. There are 84 more apple trees than pear trees. How many pear trees are in the orchard?",
          choices: ["126", "21", "42", "28"],
          answer: 2,
          explain:
            "Let a be the number of apple trees and p the number of pear trees. '3 times as many apple trees as pear trees' is a = 3p, and '84 more apple trees than pear trees' is a - p = 84. Substitute: 3p - p = 84, so 2p = 84 and p = 42. '126' is the number of apple trees. '21' treats 84 as the total (a + p = 84), and '28' treats 84 as the number of apple trees.",
          difficulty: "medium",
          why: ["126 is the number of apple trees, 3(42). The question asks for pear trees.", "This treats 84 as the total, a + p. \"84 more\" is a difference: a − p = 84.", null, "This treats 84 as the number of apple trees. 84 is how many more apple trees there are."],
        },
        {
          q: "A 51-foot rope is cut into two pieces. The longer piece is 6 feet more than twice the length of the shorter piece. What is the length, in feet, of the longer piece?",
          choices: ["36", "15", "38", "32"],
          answer: 0,
          explain:
            "Let L be the longer piece and S the shorter. The pieces make up the whole rope: L + S = 51. '6 more than twice the shorter' is L = 2S + 6. Substitute: (2S + 6) + S = 51, so 3S = 45, S = 15, and L = 2(15) + 6 = 36. '15' is the shorter piece. '38' writes L = 2(S + 6), doubling the 6 too, and '32' subtracts the 6 instead of adding it.",
          difficulty: "medium",
          why: [null, "15 is the shorter piece. The question asks for the longer one.", "This doubles the 6 too: L = 2(S + 6). \"6 more than twice S\" is 2S + 6.", "This subtracts 6. \"6 more than\" adds: L = 2S + 6."],
        },
        {
          q: "On Saturday, a museum sold 4 times as many student tickets as adult tickets. Student tickets cost $6 each, adult tickets cost $15 each, and ticket sales totaled $1,716. How many student tickets did the museum sell?",
          choices: ["44", "176", "26", "220"],
          answer: 1,
          explain:
            "Let s be student tickets and a adult tickets. 'Four times as many student tickets as adult tickets' is s = 4a, and the sales give 6s + 15a = 1,716. Since the question asks for s, find a first: 6(4a) + 15a = 1,716, so 39a = 1,716 and a = 44. Then s = 4(44) = 176. '44' is the number of adult tickets. '26' comes from reversing the relationship (a = 4s gives 66s = 1,716), and '220' is the total number of tickets, s + a.",
          difficulty: "hard",
          why: ["44 is the number of adult tickets. Student tickets are 4 times that: 176.", null, "This reverses the relationship. \"4 times as many student tickets as adult tickets\" means s = 4a, not a = 4s.", "220 is the total number of tickets sold, 176 + 44. The question asks for student tickets only."],
        },
      ],
      traps: [
        "Answering with the value of the other variable: solving correctly for x when the question asks for y (or giving one item's count when it asks for the other's).",
        "Reversing a 'times as many' phrase: '4 times as many students as adults' means s = 4a, not a = 4s.",
        "Dropping the parentheses when substituting an expression, so a coefficient multiplies only the first term: 3(2x - 7) becomes 6x - 7 instead of 6x - 21.",
        "Translating 'more than' or 'less than' in the wrong direction or place: '6 more than twice S' is 2S + 6, not 2S - 6 or 2(S + 6).",
      ],
    },
    {
      name: "Solving for a Specific Value via Elimination",
      explanation:
        "When neither equation is already solved for a variable, elimination is usually the fastest route: add or subtract the equations so one variable cancels, multiplying one equation first if the coefficients don't line up yet. It's especially quick when both equations are in the same ax + by = c form, and it can hand you a combined expression like x + y or 6x + 2y directly, without finding x and y separately. (When one equation already reads y = ... or x = ..., substitution is faster; see the substitution pattern.)",
      examples: [
        {
          q: "Solve the system: x + y = 10, x - y = 2. What is x?",
          choices: ["6", "4", "8", "12"],
          answer: 0,
          explain:
            "Adding the two equations directly cancels the y-terms (since one is +y and the other is -y): (x + y) + (x - y) = 10 + 2, giving 2x = 12, so x = 6.",
          difficulty: "easy",
          why: [null, "4 is y, not x. Adding the equations gives 2x = 12, so x = 6.", "8 is 10 − 2. Add the equations instead: 2x = 12, so x = 6.", "12 is 2x. Divide by 2 to get x = 6."],
        },
        {
          q: "Solve the system: 3x + 2y = 16, 3x - 5y = -12. What is y?",
          choices: ["4", "-4", "28", "7"],
          answer: 0,
          explain:
            "Both equations already have a matching 3x term, so subtracting one equation from the other eliminates x. Subtracting carefully, distributing the negative sign across the whole second equation: (3x + 2y) - (3x - 5y) = 16 - (-12), giving 7y = 28, so y = 4.",
          difficulty: "medium",
          why: [null, "A sign slip: 16 − (−12) = 28, and 2y − (−5y) = 7y, so y = +4.", "28 is 7y. Divide by 7 to get y = 4.", "7 is the coefficient of y after subtracting. y = 28 ÷ 7 = 4."],
        },
        {
          q: "Solve the system: x + 2y = 12, x - 2y = 4. What is x?",
          choices: ["8", "4", "16", "2"],
          answer: 0,
          explain: "Adding the two equations directly cancels the y-terms: (x + 2y) + (x - 2y) = 12 + 4, giving 2x = 16, so x = 8.",
          difficulty: "easy",
          why: [null, "Check it: if x = 4, the first equation gives y = 4, but then 4 − 2(4) = −4, not 4.", "16 is 2x. Divide by 2 to get x = 8.", "2 is y, not x."],
        },
        {
          q: "Solve the system: y = 2x + 1, 3x + y = 16. What is x?",
          choices: ["3", "5", "15", "17/5"],
          answer: 0,
          explain:
            "The first equation already has y isolated, so substitution is faster here than forcing elimination. Substituting y = 2x + 1 into the second equation: 3x + (2x + 1) = 16, giving 5x + 1 = 16, so x = 3.",
          difficulty: "medium",
          why: [null, "Check it: if x = 5, then y = 11, and 3(5) + 11 = 26, not 16.", "15 is 5x. Divide by 5 to get x = 3.", "17/5 comes from adding 1 instead of subtracting it: 5x + 1 = 16 gives 5x = 15."],
        },
        {
          q: "Solve the system: x + 2y = 11, 3x - y = 5. What is y?",
          choices: ["4", "33", "28", "3"],
          answer: 0,
          explain:
            "The x-coefficients don't already match (1 and 3), so direct elimination won't cancel anything yet. Multiplying the first equation by 3 so its x-coefficient matches the second gives 3x + 6y = 33. Subtracting the second equation from this new version: (3x + 6y) - (3x - y) = 33 - 5, giving 7y = 28, so y = 4.",
          difficulty: "hard",
          why: [null, "33 is the right side after multiplying the first equation by 3, not y.", "28 is 7y. Divide by 7 to get y = 4.", "3 is x, not y."],
        },
      ],
      traps: [
        "Defaulting to substitution when both equations are in ax + by = c form and the coefficients already line up, so elimination would be much faster, wasting time under exam conditions.",
        "Sign errors when subtracting (rather than adding) equations — subtracting requires distributing a negative sign across an entire equation.",
      ],
    },
    {
      name: "Determining the Number of Solutions Without Fully Solving",
      explanation:
        "This pattern asks how many solutions a system has, without requiring you to actually find them. It's purely about comparing slopes and intercepts: different slopes means exactly one solution; same slope with different intercepts means no solution (parallel lines); same slope AND same intercept means infinite solutions (identical lines). You can often answer this in seconds, with no solving at all. A harder version asks you to describe those infinitely many solutions with a constant r: since both equations are the same line, let x = r in either one and solve for y. For 2x + 3y = 12, that gives y = (12 - 2r)/3, so every point (r, (12 - 2r)/3) lies on both lines. To check a choice, plug its coordinates into one equation and make sure the r-terms cancel, or test an easy value like r = 0.",
      examples: [
        {
          q: "How many solutions does this system have? y = 2x + 1 and y = 2x - 3",
          choices: ["No solution", "Exactly one solution", "Infinitely many solutions", "Cannot be determined"],
          answer: 0,
          explain:
            "Compare the slopes: both are 2, identical. Compare the y-intercepts: 1 versus -3, different. Same slope with different intercepts means the lines are parallel and never intersect, so there's no solution, without needing to solve anything further.",
          diagram: { kind: "systemGraph", line1Direction: "gentlePos", line2Direction: "gentlePos", parallel: true },
          difficulty: "easy",
          why: [null, "One solution needs different slopes. Both slopes here are 2.", "Infinitely many would need the same intercept too, but 1 and −3 differ. These lines are parallel.", "It can be determined by comparing slopes and intercepts: same slope, different intercepts means no solution."],
        },
        {
          q: "How many solutions does this system have? 2x + y = 5 and 4x + 2y = 10",
          choices: ["Infinitely many solutions", "No solution", "Exactly one solution", "Cannot be determined"],
          answer: 0,
          explain:
            "Convert both to slope-intercept form before comparing anything. First equation: y = -2x + 5. Second equation: 2y = -4x + 10, which simplifies to y = -2x + 5 as well. Both the slope (-2) and the y-intercept (5) match exactly — this isn't just two parallel lines, it's the exact same line written two different ways, so every point on the line is a solution.",
          diagram: { kind: "systemGraph", line1Direction: "gentleNeg", line2Direction: "gentleNeg", sameLine: true },
          difficulty: "medium",
          why: [null, "No solution needs different intercepts, but both equations become y = −2x + 5. They're the same line.", "One solution needs different slopes. Both slopes are −2.", "It can be determined: the second equation is the first one doubled, so they're the same line."],
        },
        {
          q: "How many solutions does this system have? y = 3x - 2 and y = -x + 6",
          choices: ["Exactly one solution", "No solution", "Infinitely many solutions", "Cannot be determined"],
          answer: 0,
          explain: "Compare the slopes: 3 versus -1, different. Different slopes always mean exactly one solution, without needing to solve anything further.",
          diagram: { kind: "systemGraph", line1Direction: "steepPos", line2Direction: "gentleNeg", solutionLabel: "?" },
          difficulty: "easy",
          why: [null, "No solution needs the same slope. The slopes here are 3 and −1.", "Infinitely many needs the same line. These have different slopes.", "It can be determined: different slopes always cross exactly once."],
        },
        {
          q: "How many solutions does this system have? 2x + y = 7 and 4x + 2y = 9",
          choices: ["No solution", "Infinitely many solutions", "Exactly one solution", "Cannot be determined"],
          answer: 0,
          explain:
            "Convert both to slope-intercept form first. Equation 1: y = -2x + 7. Equation 2: 2y = -4x + 9, so y = -2x + 4.5. Both have slope -2, identical, but the intercepts (7 versus 4.5) are different. Same slope with different intercepts means the lines are parallel, so there's no solution.",
          diagram: { kind: "systemGraph", line1Direction: "gentleNeg", line2Direction: "gentleNeg", parallel: true },
          difficulty: "medium",
          why: [null, "Infinitely many needs the same intercept too. Here it's 7 versus 4.5, so the lines are parallel.", "One solution needs different slopes. Both slopes are −2.", "It can be determined: same slope, different intercepts means no solution."],
        },
        {
          q: "How many solutions does this system have? -3x + 6y = 12 and x - 2y = -4",
          choices: ["Infinitely many solutions", "No solution", "Exactly one solution", "Cannot be determined"],
          answer: 0,
          explain:
            "Convert both to slope-intercept form. Equation 1: 6y = 3x + 12, so y = 0.5x + 2. Equation 2: -2y = -x - 4, so y = 0.5x + 2. Both the slope and the intercept match exactly — despite looking like different equations at first glance, they're actually the same line (equation 1 is -3 times equation 2), so every point on the line is a solution.",
          diagram: { kind: "systemGraph", line1Direction: "gentlePos", line2Direction: "gentlePos", sameLine: true },
          difficulty: "hard",
          why: [null, "No solution needs different intercepts, but both equations become y = 0.5x + 2.", "One solution needs different slopes. Both slopes are 0.5.", "It can be determined: the first equation is −3 times the second, so they're the same line."],
        },
        {
          q: "4x - 6y = 18\n10x - 15y = 45\n\nThe system of equations above has infinitely many solutions. Which of the following points lies on the graphs of both equations for any real number r?",
          choices: ["(r, (9 - 2r)/3)", "(r, (3r - 9)/2)", "(r, 2r - 3)", "(r, (2r - 9)/3)"],
          answer: 3,
          explain:
            "Dividing the first equation by 2 and the second by 5 gives 2x - 3y = 9 both times, so it's one line. Let x = r and solve for y: 2r - 3y = 9, so -3y = 9 - 2r and y = (2r - 9)/3. Check with r = 0: y = -3, and 4(0) - 6(-3) = 18. '(9 - 2r)/3' drops the sign flip from dividing by -3, '(3r - 9)/2' mixes up the coefficients of x and y, and '2r - 3' divides only the 9 by 3.",
          difficulty: "hard",
          why: ["A sign slip: dividing −3y = 9 − 2r by −3 gives y = (2r − 9)/3.", "This swaps the roles of 2 and 3. It solves 3x − 2y = 9, which isn't the given line.", "This divides only the 9 by 3. Both terms of 2r − 9 must be divided by 3.", null],
        },
      ],
      traps: [
        "Attempting to fully solve the system algebraically when the question only asks for the *number* of solutions — a slope/intercept comparison is much faster.",
        "Forgetting to convert equations to a comparable form (like slope-intercept) before comparing slopes and intercepts.",
        "Writing the point for the infinitely-many-solutions case with a sign slip, or dividing only part of the expression: for x + 2y = 8, y = (8 - r)/2, not 8 - 2r or 4 - r.",
      ],
    },
    {
      name: "Reading the Solution Directly from a Graph",
      desmosCalculator: "graphing",
      desmosTrick:
        "Step 1: Open Desmos and type the first equation into the first line exactly as it's written; if it's in the form Ax + By = C, you can enter it in that form directly, no need to solve for y first. Step 2: Type the second equation into the next line the same way. Desmos draws both as straight lines. Step 3: Click on the point where the two lines cross (use the +/- zoom buttons if they cross off-screen); Desmos shows a small label with that point's exact coordinates. Step 4: Read the solution straight off that label: the first number is x, the second is y. No elimination or substitution required.",
      explanation:
        "This pattern shows the graphs of two lines (or a line and a curve) and asks for the system's solution: the point where they cross. No algebra needed: the solution is just the coordinates of that intersection point, read directly off the grid. This is different from counting solutions (no point needed) and from elimination (solved algebraically, no picture); here, the graph already shows you the answer. Some questions run it the other way: the graph shows two lines, often in a context, and the choices are systems of equations. Don't solve anything; for each equation, find where it crosses the axes (set x = 0, then y = 0) or check its slope, and see whether one of the graphed lines matches. The right system matches both lines, while wrong ones usually swap two coefficients or get one intercept wrong.",
      examples: [
        {
          q: "The graphs of two linear equations intersect at the point where x = 3 and y = 5, clearly marked on the grid. What is the solution to the system?",
          choices: ["(3, 5)", "(5, 3)", "(3, 0)", "(0, 5)"],
          answer: 0,
          explain: "The solution to a system, read from a graph, is simply the point where the two lines cross. That marked point is (3, 5).",
          diagram: { kind: "systemGraph", line1Direction: "steepPos", line2Direction: "gentleNeg", solutionLabel: "(3, 5)" },
          difficulty: "easy",
          why: [null, "This swaps the coordinates. The point is x = 3, y = 5, written (3, 5).", "(3, 0) is on the x-axis. The lines cross at y = 5.", "(0, 5) is on the y-axis. The lines cross at x = 3."],
        },
        {
          q: "Two lines are graphed. They cross at a marked grid point 4 units right and 2 units up from the origin. What is the solution (x, y) to the system?",
          choices: ["(4, 2)", "(2, 4)", "(4, 0)", "(0, 2)"],
          answer: 0,
          explain:
            "Convert the grid description directly into coordinates: 4 units right means x = 4, 2 units up means y = 2. The solution is the point where the lines actually cross, which is exactly this marked point.",
          diagram: { kind: "systemGraph", line1Direction: "gentlePos", line2Direction: "steepNeg", solutionLabel: "(4, 2)" },
          difficulty: "easy",
          why: [null, "This swaps the coordinates. 4 right is x = 4 and 2 up is y = 2.", "(4, 0) is on the x-axis. The crossing point is 2 units up.", "(0, 2) is on the y-axis. The crossing point is 4 units right."],
        },
        {
          q: "Two lines are graphed: one crosses the y-axis at (0, 6), the other crosses the y-axis at (0, 1), and the two lines cross each other at the point (2, 4). What is the solution to the system?",
          choices: ["(2, 4)", "(0, 6)", "(0, 1)", "(6, 1)"],
          answer: 0,
          explain:
            "A system's 'solution' specifically means the point where the two lines cross each other, not either line's own y-intercept. The y-intercepts, (0, 6) and (0, 1), describe where each line individually crosses the y-axis, not the answer to this question. The solution is the shared intersection point, (2, 4).",
          diagram: { kind: "systemGraph", line1Direction: "gentleNeg", line2Direction: "steepPos", solutionLabel: "(2, 4)" },
          difficulty: "medium",
          why: [null, "(0, 6) is where one line crosses the y-axis, not where the two lines cross each other.", "(0, 1) is the other line's y-intercept, not the intersection.", "This combines the two y-intercept values. The solution is where the lines meet: (2, 4)."],
        },
        {
          q: "The graphs of a linear equation and a nonlinear equation are shown, intersecting at exactly one marked point where x = -1 and y = 6. What is the solution (x, y) to this system?",
          choices: ["(-1, 6)", "(6, -1)", "(1, 6)", "(-1, -6)"],
          answer: 0,
          explain:
            "Even though one graph is a curve rather than a straight line, the method is identical: the solution is simply the point where the two graphs cross. The marked intersection point is at x = -1, y = 6.",
          difficulty: "medium",
          why: [null, "This swaps the coordinates. The point is x = −1, y = 6.", "The x-value is −1, not 1.", "The y-value is 6, not −6."],
        },
        {
          q: "A student bought x notebooks and y pens. The graph shows a system of two linear equations: one represents the total number of items bought, and the other represents the total cost, in dollars.\n\nWhich system of equations is represented by the graph?",
          choices: ["x + y = 6 and 3x + 1.5y = 12", "x + y = 6 and 1.5x + 3y = 12", "x + y = 8 and 3x + 1.5y = 12", "x + y = 6 and 3x - 1.5y = 12"],
          answer: 0,
          explain:
            "One line crosses both axes at 6, and the other crosses the x-axis at 4 and the y-axis at 8. Check each equation's intercepts. x + y = 6 has intercepts 6 and 6. 3x + 1.5y = 12 has x-intercept 12/3 = 4 and y-intercept 12/1.5 = 8. Both match. '1.5x + 3y = 12' has intercepts 8 and 4, reversed. 'x + y = 8' crosses both axes at 8, but no graphed line crosses the x-axis at 8, and '3x - 1.5y = 12' crosses the y-axis at -8.",
          figure: {"kind": "geometry", "points": {"p0": [0, 6], "p1": [6, 0], "p2": [0, 8], "p3": [4, 0]}, "dots": ["p0", "p1", "p2", "p3"], "paths": [{"points": [[0, 6], [6, 0]]}, {"points": [[0, 8], [4, 0]]}], "axes": {"x": [-1, 9], "y": [-1, 9], "step": 1}},
          difficulty: "medium",
          why: [null, "This line would cross the x-axis at 12/1.5 = 8 and the y-axis at 4, the reverse of the graph.", "x + y = 8 crosses the x-axis at 8, but the graphed lines cross it at 4 and 6.", "The minus sign makes the y-intercept 12/(−1.5) = −8, but the graph's line crosses at +8."],
        },
        {
          q: "The graphs of a line and a parabola are shown, crossing at two marked points: (-2, 3) and (5, 10). If the solution to the system must have a positive x-value, what is the solution (x, y)?",
          choices: ["(5, 10)", "(-2, 3)", "(10, 5)", "(3, -2)"],
          answer: 0,
          explain:
            "The graphs cross at two points, since a line can intersect a curve more than once, unlike the earlier examples, which had exactly one intersection. Applying the given constraint (positive x-value): (-2, 3) has a negative x-value, so it's excluded, while (5, 10) has a positive x-value and satisfies the constraint.",
          difficulty: "hard",
          why: [null, "(−2, 3) is an intersection, but its x-value is negative. The question requires a positive x.", "This swaps the coordinates of (5, 10).", "This swaps the coordinates of (−2, 3), which is excluded anyway."],
        },
      ],
      traps: [
        "Reading the intersection point's coordinates in the wrong order (mixing up x and y).",
        "Picking an intersection point that isn't exactly where the lines cross (misjudging a close-but-not-exact grid intersection).",
        "Confusing a graph's x-intercept or y-intercept with the actual intersection point of the two lines, when a question asks specifically for the system's solution.",
        "When matching a system to a graph, checking only one line (or one intercept of a line): every equation in the chosen system has to match a line on the graph.",
      ],
    },
  ],
  tipsAndTricks: [
    "If you have access to a graphing calculator during the test (or are practicing with one), and the system is asking for an intersection point, graphing both equations and reading the intersection is often faster and safer than algebra, and instantly reveals the answer if it's a 'nice' point.",
    "For 'how many solutions' questions, compare slopes and intercepts directly — you almost never need to fully solve the system to answer this specific question type.",
    "When equation forms line up well (matching or opposite coefficients on one variable), elimination is almost always faster than substitution — look for this before choosing a method.",
  ],
};

const LC_M_LINEAR_INEQ: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Solving with the Sign-Flip Rule",
      explanation:
        "Linear inequalities follow the same isolation steps as equations, with one big exception: multiplying or dividing both sides by a negative number flips the inequality sign. This is the single most important thing to check on every inequality problem — it's easy to forget under time pressure, especially when the negative division happens in a later step of a multi-step problem.",
      examples: [
        {
          q: "Solve: -3x + 6 > 0",
          choices: ["x < 2", "x > 2", "x < -2", "x > -2"],
          answer: 0,
          explain:
            "Subtract 6 from both sides: -3x > -6. Divide both sides by -3, and because we're dividing by a negative number, flip the inequality sign from > to <, giving x < 2.",
          difficulty: "easy",
          why: [null, "Dividing by −3 flips the inequality sign. It becomes x < 2.", "The boundary is +2: −6 ÷ −3 = 2.", "The boundary is +2, and the sign flips to <."],
        },
        {
          q: "Solve: 8 - 4x ≤ 20",
          choices: ["x ≥ -3", "x ≤ -3", "x ≥ 3", "x ≤ 3"],
          answer: 0,
          explain:
            "Subtract 8 from both sides: -4x ≤ 12. Divide both sides by -4, and since that's a negative number, flip the inequality sign from ≤ to ≥, giving x ≥ -3.",
          difficulty: "medium",
          why: [null, "Dividing by −4 flips the sign: ≤ becomes ≥.", "12 ÷ (−4) is −3, not 3.", "This has the wrong boundary and doesn't flip the sign."],
        },
        {
          q: "Solve: 5x + 2 < 17",
          choices: ["x < 3", "x > 3", "x < 5", "x > 15"],
          answer: 0,
          explain: "Subtract 2 from both sides: 5x < 15. Divide both sides by 5, a positive number, so the sign doesn't flip: x < 3.",
          difficulty: "easy",
          why: [null, "Dividing by 5, a positive number, doesn't flip the sign. It stays <.", "Check x = 4: 5(4) + 2 = 22, which isn't less than 17. The boundary is 15 ÷ 5 = 3.", "15 is 5x. Divide by 5, and keep the < sign."],
        },
        {
          q: "Solve: -2(x - 3) ≥ 10",
          choices: ["x ≤ -2", "x ≥ -2", "x ≤ 2", "x ≥ 8"],
          answer: 0,
          explain:
            "Distribute the -2: -2x + 6 ≥ 10. Subtract 6 from both sides: -2x ≥ 4. Divide both sides by -2, since that's negative, flip the inequality sign: x ≤ -2.",
          difficulty: "medium",
          why: [null, "Dividing by −2 flips the sign: ≥ becomes ≤.", "Check x = 0, which fits x ≤ 2: −2(0 − 3) = 6, which isn't ≥ 10.", "Check x = 8: −2(8 − 3) = −10, which isn't ≥ 10."],
        },
        {
          q: "Solve: 3 - 4x > 7x - 25",
          choices: ["x < 28/11", "x > 28/11", "x < 4", "x > -28/11"],
          answer: 0,
          explain:
            "Move the x-terms to one side by adding 4x to both sides: 3 > 11x - 25. Add 25 to both sides: 28 > 11x. Divide both sides by 11, and since 11 is positive, the inequality sign does not flip, even though a negative coefficient (-4x) appeared earlier: x < 28/11.",
          difficulty: "hard",
          why: [null, "Dividing by 11, a positive number, doesn't flip the sign. It stays <.", "Check x = 3, which fits x < 4: 3 − 12 = −9 isn't greater than 21 − 25 = −4.", "A sign slip on the boundary: 28 > 11x gives x < 28/11."],
        },
      ],
      traps: [
        "Forgetting to flip the inequality sign when dividing or multiplying by a negative number.",
        "Flipping the sign unnecessarily when the operation involved was addition/subtraction rather than multiplication/division by a negative.",
      ],
    },
    {
      name: "Word Problems with Inequality Language",
      explanation:
        "This pattern involves translating phrases like 'at least,' 'at most,' 'no more than,' and 'exceeds' into the right inequality symbol, then solving. The translation is usually the real difficulty here, not the algebra after it. 'At least' means the value can equal the number or be greater (≥). 'At most' means it can equal the number or be less (≤). 'More than' or 'exceeds' is strictly greater (>) — equality isn't allowed. Some problems give two conditions at once, like a budget and a minimum count: 'spend at most $200 on $12 shirts and $5 hats, and buy at least 10 hats.' Write the budget inequality, 12s + 5h ≤ 200, plug in the smallest count allowed for the other item (h = 10) to leave the most room, and solve: 12s ≤ 150, so s ≤ 12.5, and the most shirts is 12.",
      examples: [
        {
          q: "A student needs an average of at least 90 across 4 tests to earn an A. Scores so far are 85, 92, 88. What is the minimum score needed on the 4th test?",
          choices: ["95", "90", "93", "88"],
          answer: 0,
          explain:
            "Translate 'at least 90 average' into an inequality: (85 + 92 + 88 + x)/4 ≥ 90. Multiply both sides by 4: 265 + x ≥ 360. Subtract 265: x ≥ 95 — 'at least' translates to ≥, not a strict >.",
          difficulty: "easy",
          why: [null, "90 is the needed average. With 85, 92, and 88 so far, a 90 only brings the average to 88.75.", "Check it: (85 + 92 + 88 + 93) ÷ 4 = 89.5, still below 90.", "88 brings the average to 88.25, below 90."],
        },
        {
          q: "A rider has $12. Each snack from a vending machine costs $1.75, and the rider needs to keep at least $2.50 left over for the return bus fare. What is the maximum number of snacks n the rider can buy?",
          choices: ["5", "6", "4", "5.43"],
          answer: 0,
          explain:
            "Translate 'needs to keep at least $2.50' into an inequality about what's left after buying n snacks: 12 - 1.75n ≥ 2.50. Subtracting 12 and dividing by -1.75 (flipping the sign, since that's negative) gives n ≤ 5.43. Since n must be a whole number of snacks, the largest whole number satisfying the inequality is 5.",
          difficulty: "medium",
          why: [null, "Six snacks cost $10.50, leaving $1.50, less than the $2.50 needed for the bus.", "Four snacks works, but so does five ($8.75, leaving $3.25). The question asks for the maximum.", "You can't buy part of a snack. Round down to the largest whole number: 5."],
        },
        {
          q: "A parking garage charges $4 for the first hour and $2 for each additional hour. If a customer wants to pay no more than $16 total, what is the maximum number of additional hours a, beyond the first, they can park?",
          choices: ["6", "8", "5", "12"],
          answer: 0,
          explain: "Translate 'no more than $16' into an inequality: 4 + 2a ≤ 16. Subtract 4: 2a ≤ 12. Divide by 2: a ≤ 6.",
          difficulty: "easy",
          why: [null, "8 forgets the $4 first hour. Subtract it first: 4 + 2a ≤ 16 gives a ≤ 6.", "Five works, but six costs exactly $16, which is still \"no more than $16.\"", "12 is 2a, the money left for extra hours. At $2 each, that's 6 hours."],
        },
        {
          q: "A shipment is rejected if it weighs more than 500 pounds. Which inequality represents the weight w, in pounds, of a shipment that will be rejected?",
          choices: ["w > 500", "w ≥ 500", "w < 500", "w ≤ 500"],
          answer: 0,
          explain:
            "'More than 500 pounds' is strictly greater than, not '500 or more,' so the correct inequality is w > 500, not w ≥ 500. Contrast with 'at least 500,' which would include 500 itself (≥) — 'more than' specifically excludes the boundary value.",
          difficulty: "medium",
          why: [null, "\"More than 500\" doesn't include 500 itself. ≥ would reject a 500-pound shipment too.", "This describes shipments lighter than 500 pounds, the ones that are accepted.", "This describes shipments that are 500 pounds or less, which aren't rejected."],
        },
        {
          q: "A shipping company requires packages to weigh at least 2 pounds but no more than 70 pounds to qualify for standard shipping. Which choice correctly gives the compound inequality for the qualifying weights w, and states whether a 70-pound package qualifies?",
          choices: [
            "2 ≤ w ≤ 70, and a 70-pound package qualifies",
            "2 < w < 70, and a 70-pound package does not qualify",
            "2 ≤ w ≤ 70, and a 70-pound package does not qualify",
            "2 < w ≤ 70, and a 70-pound package qualifies",
          ],
          answer: 0,
          explain:
            "'At least 2 pounds' translates to w ≥ 2, and 'no more than 70 pounds' translates to w ≤ 70 — both boundary values are included, giving 2 ≤ w ≤ 70. Since 70 is included by 'no more than' (≤, not a strict <), a package weighing exactly 70 pounds does qualify.",
          difficulty: "hard",
          why: [null, "\"At least\" and \"no more than\" both include their boundary values, so the signs are ≤, and 70 qualifies.", "The inequality is right, but ≤ 70 includes 70, so a 70-pound package does qualify.", "\"At least 2\" includes 2, so the left side should be ≤, not <."],
        },
        {
          q: "An art club can spend at most $350 on supplies. Paint sets cost $18 each and brush packs cost $7 each. The club must buy at least 12 brush packs. What is the maximum number of paint sets the club can buy?",
          choices: ["19", "15", "14", "18"],
          answer: 2,
          explain:
            "The budget gives 18p + 7b ≤ 350. To leave the most money for paint sets, buy the fewest brush packs allowed, b = 12, which cost 7(12) = $84: 18p ≤ 266, so p ≤ 14.78. The club can't buy part of a set, so the maximum is 14 (14 sets cost $252, and 252 + 84 = $336 ≤ $350). '19' ignores the brush packs, '15' rounds up and goes over budget, and '18' subtracts 12 dollars instead of the cost of 12 brush packs.",
          difficulty: "hard",
          why: ["This ignores the 12 required brush packs: 350 ÷ 18 ≈ 19.4.", "15 sets cost $270, and with $84 of brush packs that's $354, over the $350 limit.", null, "This subtracts 12 dollars instead of the cost of 12 brush packs, 7 × 12 = $84."],
        },
      ],
      traps: [
        "Using strict inequality (> or <) when the phrase 'at least' or 'at most' actually requires ≥ or ≤ (allowing the boundary value itself).",
        "Forgetting to multiply through by the total count when solving an average-based inequality, leading to an incorrect setup.",
        "In two-condition problems, ignoring the minimum-count requirement, or rounding the answer up instead of down to a whole number that still fits the budget.",
      ],
    },
    {
      name: "Matching a Graph, Table, or Point to an Inequality or System",
      explanation:
        "These questions run the usual process backward: instead of solving an inequality, you're given a shaded graph region, a table of points, or a single point, and asked which inequality it matches, or whether the point is even a valid solution. For a point and an inequality: substitute the coordinates in and check if the result is true. For a table: every single row must satisfy the inequality for the table to match; one failing row rules it out. For a shaded region: find the boundary line's equation first, then test a point clearly inside the shading to see which direction (greater than or less than) it represents.",
      examples: [
        {
          q: "Does the point (3, 1) satisfy the inequality y > 2x - 4?",
          choices: [
            "No, because substituting gives 1 > 2, which is false",
            "Yes, because substituting gives 1 > 2, which is true",
            "No, because substituting gives 1 < 2, which is true",
            "Yes, because 3 > 1",
          ],
          answer: 0,
          explain: "Substitute the point's coordinates: 1 > 2(3) - 4. The right side simplifies to 2, so this checks whether 1 > 2 is true — it isn't.",
          difficulty: "easy",
          why: [null, "1 > 2 is false, not true. The point doesn't satisfy it.", "The test compares 1 > 2, which is false. Rewriting it as 1 < 2 changes the inequality being checked.", "Comparing the point's own coordinates isn't the test. Substitute into y > 2x − 4."],
        },
        {
          q: "Which of the following points satisfies the inequality y ≤ -x + 5: (1, 5) or (4, 3)?",
          choices: [
            "Neither point satisfies the inequality",
            "Only (1, 5) satisfies the inequality",
            "Only (4, 3) satisfies the inequality",
            "Both points satisfy the inequality",
          ],
          answer: 0,
          explain:
            "Test (1, 5): 5 ≤ -1 + 5 = 4 is false, since 5 is not ≤ 4. Test (4, 3): 3 ≤ -4 + 5 = 1 is also false, since 3 is not ≤ 1. Since both given points fail the test, neither satisfies the inequality.",
          difficulty: "easy",
          why: [null, "(1, 5) gives 5 ≤ 4, which is false.", "(4, 3) gives 3 ≤ 1, which is false.", "Both points fail: 5 ≤ 4 and 3 ≤ 1 are both false."],
        },
        {
          q: "A table lists three (x, y) pairs: (0, 4), (2, 9), and (5, 15). Does every point in this table satisfy the inequality y ≥ 2x + 3?",
          choices: [
            "Yes, all three points satisfy the inequality",
            "No, (0, 4) fails to satisfy the inequality",
            "No, (2, 9) fails to satisfy the inequality",
            "No, (5, 15) fails to satisfy the inequality",
          ],
          answer: 0,
          explain:
            "Test (0, 4): 4 ≥ 2(0) + 3 = 3, true. Test (2, 9): 9 ≥ 2(2) + 3 = 7, true. Test (5, 15): 15 ≥ 2(5) + 3 = 13, true. Since all three points satisfy the inequality, the whole table is consistent with it.",
          difficulty: "medium",
          why: [null, "(0, 4) gives 4 ≥ 3, which is true, so it satisfies the inequality.", "(2, 9) gives 9 ≥ 7, which is true.", "(5, 15) gives 15 ≥ 13, which is true."],
        },
        {
          q: "A graph shows a solid boundary line passing through (0, 2) and (4, 0), with shading below the line. Which inequality does the graph represent?",
          choices: ["y ≤ -1/2 x + 2", "y ≥ -1/2 x + 2", "y < -1/2 x + 2", "y > -1/2 x + 2"],
          answer: 0,
          explain:
            "Find the boundary line's equation using its two given points: slope = (0-2)/(4-0) = -1/2, and the y-intercept is 2, giving y = -1/2 x + 2. The line is solid, meaning the inequality includes equality. Testing a point clearly below the line, like (0, 0): 0 ≤ -1/2(0) + 2 = 2 is true, so shading below corresponds to ≤.",
          difficulty: "hard",
          why: [null, "Shading below the line means y is less than the line, so the sign is ≤, not ≥.", "The boundary line is solid, so points on it count. That's ≤, not <.", "This is shading above a dashed line. The graph shades below a solid line."],
        },
        {
          q: "A system consists of two inequalities. Point (2, 6) satisfies y ≥ x + 3 but not y ≤ -x + 7. Does (2, 6) satisfy the full system?",
          choices: [
            "No, because it must satisfy both inequalities to solve the system",
            "Yes, because it satisfies at least one of the inequalities",
            "Yes, because it satisfies the first inequality listed",
            "Cannot be determined from the given information",
          ],
          answer: 0,
          explain:
            "A point satisfies a system only if it satisfies every inequality in that system simultaneously. The point fails the second inequality, y ≤ -x + 7, so it cannot be a solution to the system as a whole, regardless of satisfying the first one.",
          difficulty: "hard",
          why: [null, "A system needs every inequality satisfied at once. Satisfying one isn't enough.", "Satisfying the first inequality isn't enough. The point must satisfy both.", "It can be determined: the point fails the second inequality, so it isn't a solution."],
        },
      ],
      traps: [
        "Concluding a table or graph matches an inequality after checking only some of the given points, rather than every single one.",
        "Testing a point that's exactly on the boundary line rather than clearly inside the shaded region, which doesn't reveal which direction the inequality points.",
        "Forgetting that a point must satisfy every inequality in a system to count as a solution — satisfying most of them isn't enough.",
      ],
    },
  ],
  tipsAndTricks: [
    "Every time you multiply or divide both sides of an inequality by a negative number, say 'flip the sign' out loud (or write it down) — this single habit prevents the most common error on this subskill.",
    "Translate word phrases carefully: 'at least' and 'at most' include the boundary value itself (≥, ≤); 'more than' and 'less than' do not (>, <).",
    "For inequalities in two variables, if you're unsure which side of a boundary line is the solution region, test a simple point like (0,0) directly in the inequality — if it's not on the line, this quickly tells you which side is correct.",
  ],
};

const LC_M_EQUIV_EXPR: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Factoring Out the Greatest Common Factor",
      explanation:
        "These questions give a polynomial like 12x⁴y² - 18x³y⁵ and ask which expression is equivalent. The right answer pulls the greatest common factor (GCF) out front. Build the GCF one piece at a time: the greatest number that divides every coefficient, then each variable that appears in every term, raised to its lowest power in any term. Next, divide every term by the GCF to fill in the parentheses, and check by distributing back. If the leading term is negative, the answer often pulls out a negative GCF, which flips the sign of every term inside the parentheses. Some versions show a partly factored form like 3x(ax² + 5) and ask for the missing coefficient: divide the matching term by the factor outside. Wrong answers usually use the highest power instead of the lowest, drop a variable, forget to divide one of the terms, or flip a sign.",
      examples: [
        {
          q: "Which expression is equivalent to 6x² + 15x?",
          choices: ["3x²(2 + 5x)", "3x(2x + 15)", "3x(2x + 5)", "3(2x + 5)"],
          answer: 2,
          explain:
            "Build the GCF: the greatest number dividing 6 and 15 is 3, and x appears in both terms with lowest power x¹, so the GCF is 3x. Divide each term by it: 6x² ÷ 3x = 2x and 15x ÷ 3x = 5, giving 3x(2x + 5). Pulling out x² fails because the second term has only one x, leaving 15 undivided fails the check (3x · 15 = 45x), and 3(2x + 5) divides out the x without writing it in front.",
          difficulty: "easy",
          why: ["Check it: 3x² · 5x = 15x³, not 15x. The second term has only one x, so the GCF can include only x, not x².", "The 15 wasn't divided by 3. Check it: 3x · 15 = 45x, not 15x.", null, "The x was divided out of both terms but never written in front. Check it: 3(2x + 5) = 6x + 15."],
        },
        {
          q: "The expression 10x³ + 35x is equivalent to 5x(ax² + 7), where a is a constant. What is the value of a?",
          choices: ["2", "5", "10", "50"],
          answer: 0,
          explain:
            "The factor outside is 5x, so each term inside is the original term divided by 5x. The first term gives 10x³ ÷ 5x = 2x², so a = 2 (and 35x ÷ 5x = 7 matches the second term). The value 5 is the factor outside, not a; 10 is the original coefficient before dividing; and 50 comes from multiplying 10 by 5 instead of dividing.",
          difficulty: "easy",
          why: [null, "5 is the coefficient of the factor outside the parentheses. Divide: 10x³ ÷ 5x = 2x², so a = 2.", "10 is the coefficient before factoring. Every term has to be divided by 5x: 10 ÷ 5 = 2.", "This multiplies by 5 instead of dividing. Check it: 5x · 50x² = 250x³, not 10x³."],
        },
        {
          q: "Which expression is equivalent to 16x⁵y³ - 24x²y⁴?",
          choices: ["8x⁵y⁴(2 - 3y)", "8x²(2x³ - 3y)", "8x²y³(2x³ + 3y)", "8x²y³(2x³ - 3y)"],
          answer: 3,
          explain:
            "Coefficient: the greatest number dividing 16 and 24 is 8. Variables: x appears as x⁵ and x², so take x²; y appears as y³ and y⁴, so take y³. The GCF is 8x²y³. Dividing: 16x⁵y³ ÷ 8x²y³ = 2x³ and 24x²y⁴ ÷ 8x²y³ = 3y, so the answer is 8x²y³(2x³ - 3y). Using x⁵ and y⁴ takes the highest powers, 8x²(2x³ - 3y) loses the y's entirely, and the + sign would make the second term +24x²y⁴.",
          difficulty: "medium",
          why: ["This uses the highest powers. Check it: 8x⁵y⁴ · 2 = 16x⁵y⁴, but the first term has only y³. The GCF takes the lowest power of each variable.", "y appears in both terms, so y³ belongs in the GCF. Check it: 8x² · 2x³ = 16x⁵, which has lost its y³.", "The sign flipped. Check it: 8x²y³ · 3y = +24x²y⁴, but the original term is −24x²y⁴.", null],
        },
        {
          q: "Which expression is equivalent to -6x³ + 9x² - 15x?",
          choices: ["-3x(2x² + 3x + 5)", "-3x(2x² - 3x - 5)", "-3x(2x² - 3x + 5)", "-3x(2x² - 3x + 15)"],
          answer: 2,
          explain:
            "Every choice pulls out -3x, so the work is dividing each term by -3x and watching the signs: -6x³ ÷ -3x = 2x², 9x² ÷ -3x = -3x, and -15x ÷ -3x = +5. That gives -3x(2x² - 3x + 5). A +3x inside would make the middle term -9x², a -5 would make the last term +15x, and a 15 means that term was never divided (-3x · 15 = -45x).",
          difficulty: "medium",
          why: ["Dividing by a negative flips the sign: 9x² ÷ (−3x) = −3x. Check it: −3x · 3x = −9x², not +9x².", "The last term flipped the wrong way: −15x ÷ (−3x) = +5. Check it: −3x · (−5) = +15x, not −15x.", null, "The 15 was never divided by 3. Check it: −3x · 15 = −45x, not −15x."],
        },
        {
          q: "The expression 24x⁶y⁴ - 40x⁴y⁷ + 8x³y⁴ is equivalent to kx^m y^n(3x³ - 5xy³ + 1), where k, m, and n are positive integers. What is the value of k + m + n?",
          choices: ["11", "15", "16", "21"],
          answer: 1,
          explain:
            "The factor outside must be the GCF of all three terms. Coefficient: the greatest number dividing 24, 40, and 8 is 8. Lowest powers: x appears as x⁶, x⁴, and x³, so x³; y appears as y⁴, y⁷, and y⁴, so y⁴. Check the parentheses: 24x⁶y⁴ ÷ 8x³y⁴ = 3x³, 40x⁴y⁷ ÷ 8x³y⁴ = 5xy³, and 8x³y⁴ ÷ 8x³y⁴ = 1, all matching. So k = 8, m = 3, n = 4, and k + m + n = 15. Leaving out the y gives 11, using only the first two terms (lowest x there is x⁴) gives 16, and using the highest powers gives 8 + 6 + 7 = 21.",
          difficulty: "hard",
          why: ["This leaves out y, which appears in every term. The GCF is 8x³y⁴, so n = 4 and the total is 15.", null, "x⁴ is the lowest power in the first two terms only. The last term, 8x³y⁴, has just x³, so m = 3.", "This uses the highest powers, x⁶ and y⁷. The GCF takes the lowest: x³ and y⁴."],
        },
      ],
      traps: [
        "Using the highest power of a variable instead of the lowest. You can pull out only as many copies of x as the term with the fewest x's has.",
        "Leaving a variable out of the GCF even though it appears in every term, so the parentheses end up missing it too.",
        "Not dividing every term by the GCF: copying a coefficient into the parentheses unchanged, or building the GCF from only some of the terms.",
        "Sign errors, especially when a negative factor comes out front and every term inside the parentheses has to flip sign.",
      ],
    },
    {
      name: "Recognizing Factoring Patterns Instantly",
      explanation:
        "Most equivalent-expression questions reward recognizing a pattern instantly, over working out algebra from scratch. Three patterns cover most factoring questions: difference of squares (a² - b² = (a-b)(a+b)), perfect square trinomials (a² ± 2ab + b² = (a±b)²), and simple trinomial factoring (finding two numbers that multiply to the constant and add to the middle coefficient). Training yourself to recognize these shapes ON SIGHT, instead of trial-and-error each time, is the single biggest speed gain on this subskill.",
      examples: [
        {
          q: "Factor completely: x² - 9",
          choices: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²"],
          answer: 0,
          explain:
            "Recognize the shape: a single squared term minus another squared term (x² and 9 = 3²) — the difference-of-squares pattern. Apply it directly: a² - b² = (a-b)(a+b), with a = x and b = 3, giving (x-3)(x+3).",
          difficulty: "easy",
          why: [null, "Multiply it out: (x − 9)(x + 1) = x² − 8x − 9, not x² − 9.", "(x − 3)² = x² − 6x + 9. A difference of squares has no middle term and ends in −9.", "(x + 3)² = x² + 6x + 9, which has a middle term and a +9."],
        },
        {
          q: "Factor completely: 4x² - 25",
          choices: ["(2x-5)(2x+5)", "(4x-25)(x+1)", "(2x-5)²", "(4x-5)(x+5)"],
          answer: 0,
          explain:
            "Recognize the shape, even with a coefficient present: 4x² is (2x)², and 25 is 5² — still a difference of squares, just with a squared term instead of a bare variable. Applying a² - b² = (a-b)(a+b) with a = 2x and b = 5 gives (2x-5)(2x+5).",
          difficulty: "medium",
          why: [null, "Multiply it out: (4x − 25)(x + 1) = 4x² − 21x − 25, which has an extra middle term.", "(2x − 5)² = 4x² − 20x + 25. A difference of squares has no middle term.", "Multiply it out: (4x − 5)(x + 5) = 4x² + 15x − 25, which has an extra middle term."],
        },
        {
          q: "Factor completely: x² - 16",
          choices: ["(x-4)(x+4)", "(x-16)(x+1)", "(x-4)²", "(x-8)(x+2)"],
          answer: 0,
          explain: "Recognize the shape: x² and 16 = 4² — a difference of squares. Applying the pattern gives (x-4)(x+4).",
          difficulty: "easy",
          why: [null, "Multiply it out: (x − 16)(x + 1) = x² − 15x − 16.", "(x − 4)² = x² − 8x + 16, which has a middle term and a +16.", "Multiply it out: (x − 8)(x + 2) = x² − 6x − 16."],
        },
        {
          q: "Factor completely: x² + 10x + 25",
          choices: ["(x+5)²", "(x+25)", "(x+5)(x-5)", "(x+10)(x+5)"],
          answer: 0,
          explain:
            "Check whether the middle term is twice the product of the square roots of the first and last terms: √(x²) = x, √25 = 5, and 2 × x × 5 = 10x — it matches exactly, confirming a perfect square trinomial: a² + 2ab + b² = (a+b)², giving (x+5)².",
          difficulty: "medium",
          why: [null, "x + 25 isn't a factorization of a squared expression. The x² term would be lost.", "(x + 5)(x − 5) = x² − 25. It has no 10x term.", "Multiply it out: (x + 10)(x + 5) = x² + 15x + 50."],
        },
        {
          q: "Factor completely: x² - 3x - 40",
          choices: ["(x-8)(x+5)", "(x+8)(x-5)", "(x-40)(x+1)", "(x-4)(x+10)"],
          answer: 0,
          explain:
            "This doesn't match difference-of-squares or perfect-square-trinomial shapes — it needs simple trinomial factoring. Find two numbers that multiply to -40 and add to -3: since the product is negative, the numbers have opposite signs; testing pairs, -8 and 5 work (-8 × 5 = -40, -8 + 5 = -3), giving (x-8)(x+5).",
          difficulty: "hard",
          why: [null, "The signs are swapped: (x + 8)(x − 5) = x² + 3x − 40. The middle term needs to be −3x.", "Multiply it out: (x − 40)(x + 1) = x² − 39x − 40.", "Multiply it out: (x − 4)(x + 10) = x² + 6x − 40."],
        },
      ],
      traps: [
        "Not recognizing perfect squares (like 9 = 3², 25 = 5², 49 = 7²) quickly enough to spot the difference-of-squares pattern.",
        "Attempting trial-and-error factoring on an expression that actually matches a recognizable, faster pattern.",
      ],
    },
    {
      name: "Simplifying and Combining Rational Expressions",
      explanation:
        "This pattern covers fractions whose top and bottom are polynomials: simplifying one, or combining two into a single fraction. To simplify, factor both the numerator and the denominator completely first, then cancel any shared factors. Trying to simplify without factoring first (like dividing term-by-term) is a common source of errors, and a factor like (3 - x) is the negative of (x - 3), so canceling it leaves a negative sign behind. To add or subtract, rewrite every term over one common denominator: multiply each numerator by whatever its own denominator is missing, then combine the numerators. A polynomial term like x counts as x/1, so it gets multiplied by the entire denominator. When the denominators are related, like x - 3 and x² - 9, factor them first; the larger one is often the common denominator, and the result may simplify again at the end. Wrong answers usually add straight across, multiply only part of a numerator, or drop the parentheses when subtracting a numerator.",
      examples: [
        {
          q: "Simplify the rational expression: (x² - 4)/(x - 2)",
          choices: ["x+2", "x-2", "x+4", "x²-2"],
          answer: 0,
          explain:
            "Factor the numerator: x² - 4 is a difference of squares, factoring to (x-2)(x+2). Rewriting the fraction as (x-2)(x+2) / (x-2) and canceling the shared factor of (x-2) leaves x+2.",
          difficulty: "easy",
          why: [null, "x − 2 is the factor that cancels. What's left is x + 2.", "The numerator factors to (x − 2)(x + 2). Nothing produces x + 4.", "You can't cancel terms that are added or subtracted. Factor first, then cancel the (x − 2)."],
        },
        {
          q: "Simplify the rational expression: (x² - 5x + 6)/(x - 3)",
          choices: ["x-2", "x+2", "x-3", "x-5"],
          answer: 0,
          explain:
            "The numerator isn't a difference of squares — it's a trinomial, so factor it by finding two numbers that multiply to 6 and add to -5: those numbers are -2 and -3, so x² - 5x + 6 factors to (x-2)(x-3). Canceling the shared (x-3) factor leaves x-2.",
          difficulty: "medium",
          why: [null, "The numerator factors to (x − 2)(x − 3). The remaining factor is x − 2, with a minus.", "x − 3 is the factor that cancels with the denominator. What's left is x − 2.", "−5 is the middle coefficient, not a factor. Factor the numerator: (x − 2)(x − 3)."],
        },
        {
          q: "Simplify the rational expression: (x² - 25)/(x + 5)",
          choices: ["x-5", "x+5", "x-25", "x²-5"],
          answer: 0,
          explain: "Factor the numerator: x² - 25 is a difference of squares, factoring to (x-5)(x+5). Canceling the shared (x+5) factor leaves x-5.",
          difficulty: "easy",
          why: [null, "x + 5 is the factor that cancels. What's left is x − 5.", "The numerator factors to (x − 5)(x + 5), not (x − 25).", "You can't cancel terms that are added or subtracted. Factor first: (x − 5)(x + 5)."],
        },
        {
          q: "Simplify the rational expression: (x² - 9)/(x² + x - 6)",
          choices: ["(x-3)/(x-2)", "(x+3)/(x-2)", "(x-3)/(x+2)", "x-3"],
          answer: 0,
          explain:
            "Factor the numerator: x² - 9 is a difference of squares, (x-3)(x+3). Factor the denominator too: x² + x - 6 needs two numbers multiplying to -6 and adding to 1, which are 3 and -2, giving (x+3)(x-2). Canceling the shared (x+3) factor leaves (x-3)/(x-2).",
          difficulty: "medium",
          why: [null, "x + 3 appears in both numerator and denominator, so it cancels. The x − 3 stays on top.", "The denominator factors to (x + 3)(x − 2), so the leftover factor is x − 2, not x + 2.", "After canceling (x + 3), the denominator still has (x − 2) left."],
        },
        {
          q: "For x ≠ 2, which expression is equivalent to 3/(x - 2) + x?",
          choices: ["(x + 3)/(x - 2)", "(x² - 2x + 3)/(x - 2)", "(x² + 3)/(x - 2)", "(x + 3)/(x - 1)"],
          answer: 1,
          explain:
            "Treat x as x/1 and rewrite it over the denominator (x - 2): x = x(x - 2)/(x - 2) = (x² - 2x)/(x - 2). Now add the numerators: (3 + x² - 2x)/(x - 2), which is (x² - 2x + 3)/(x - 2). Putting x on top without multiplying by (x - 2) gives (x + 3)/(x - 2), multiplying x by only the x in (x - 2) gives x² + 3, and adding straight across (3 + x over (x - 2) + 1) gives (x + 3)/(x - 1).",
          difficulty: "medium",
          why: ["x wasn't multiplied by the denominator. Check it at x = 4: the original is 1.5 + 4 = 5.5, but this gives 7/2 = 3.5.", null, "x has to multiply both terms of (x − 2): x(x − 2) = x² − 2x. Check it at x = 4: 19/2 = 9.5, not 5.5.", "This adds straight across: numerators together and denominators together. Check it at x = 4: 7/3, not 5.5."],
        },
        {
          q: "Simplify the rational expression: (x² - 9)/(3 - x)",
          choices: ["-(x+3)", "x+3", "-(x-3)", "x-3"],
          answer: 0,
          explain:
            "Factor the numerator as before: (x-3)(x+3). The denominator, (3-x), isn't identical to (x-3), but it is its negative: 3 - x = -(x-3). Rewriting the denominator that way and canceling the shared (x-3) factor leaves a negative sign behind: -(x+3).",
          difficulty: "hard",
          why: [null, "3 − x is the negative of x − 3, so canceling leaves a negative sign: −(x + 3).", "The factor that cancels is (x − 3). What's left is −(x + 3), not −(x − 3).", "x − 3 is the factor that cancels with the denominator. The leftover is −(x + 3)."],
        },
        {
          q: "For x ≠ 3 and x ≠ -3, which expression is equivalent to 2/(x - 3) - 12/(x² - 9)?",
          choices: ["-10/(x² - 9)", "2/(x + 3)", "(2x + 18)/(x² - 9)", "2/(x - 3)"],
          answer: 1,
          explain:
            "Factor first: x² - 9 = (x - 3)(x + 3), so it's already a multiple of the other denominator and works as the common denominator. The first fraction is missing a factor of (x + 3): 2(x + 3)/(x² - 9). Subtract the numerators: (2x + 6 - 12)/(x² - 9) = (2x - 6)/(x² - 9). This simplifies: 2(x - 3)/((x - 3)(x + 3)) = 2/(x + 3). Check at x = 0: the original is -2/3 + 12/9 = 2/3, and 2/(0 + 3) = 2/3. The -10 comes from subtracting 2 - 12 without multiplying the 2 by (x + 3), the +18 adds the 12 instead of subtracting, and 2/(x - 3) cancels the wrong factor.",
          difficulty: "hard",
          why: ["The 2 wasn't multiplied by (x + 3) before subtracting. Check it at x = 0: −10/(−9) = 10/9, but the original is 2/3.", null, "The 12 is subtracted, not added: 2(x + 3) − 12 = 2x − 6. Check it at x = 0: 18/(−9) = −2, not 2/3.", "The factor that cancels is (x − 3), leaving (x + 3) in the denominator. Check it at x = 0: 2/(−3) = −2/3, not 2/3."],
        },
      ],
      traps: [
        "Attempting to cancel individual terms (like the x² and x, or the 4 and 2) instead of fully factoring first and canceling entire shared factors.",
        "Forgetting that canceling is only valid for shared multiplicative factors, not for terms being added or subtracted.",
        "Missing that a denominator like (3 - x) is the negative of (x - 3), not an unrelated factor that can't be canceled.",
        "Adding or subtracting fractions straight across (numerator plus numerator over denominator plus denominator) instead of first rewriting over a common denominator.",
        "Rewriting over a common denominator but multiplying only part of a numerator, or forgetting that a whole-number or polynomial term must be multiplied by the entire denominator.",
        "Losing the minus sign in front of a subtracted fraction or polynomial, which applies to every term of what's being subtracted.",
      ],
    },
    {
      name: "Applying the Laws of Exponents",
      explanation:
        "These questions test the rules for combining and rewriting exponents. Multiplying same-base powers: add the exponents (x^a · x^b = x^(a+b)). Dividing: subtract them (x^a / x^b = x^(a-b)). Raising a power to a power: multiply the exponents ((x^a)^b = x^(ab)). A fractional exponent represents a radical: x^(1/n) means the nth root of x, and x^(m/n) means the nth root of x, raised to the m power. Both directions of this conversion (exponent to radical, and back) show up on the test. A negative exponent means reciprocal, not a negative value: x^(-n) = 1/x^n.",
      examples: [
        {
          q: "Simplify: x^5 · x^3",
          choices: ["x^8", "x^15", "x^2", "2x^8"],
          answer: 0,
          explain: "Both terms share the same base, x. When multiplying same-base powers, add the exponents: 5 + 3 = 8, giving x^8.",
          difficulty: "easy",
          why: [null, "Multiplying same-base powers adds the exponents (5 + 3), not multiplies them.", "Subtracting exponents is for dividing. For multiplying, add: 5 + 3 = 8.", "Nothing doubles the coefficient. x⁵ · x³ has a coefficient of 1."],
        },
        {
          q: "Rewrite x^(1/2) using radical notation.",
          choices: ["√x", "x²", "2√x", "1/√x"],
          answer: 0,
          explain: "A rational exponent of 1/n corresponds to the nth root. Here n = 2, so x^(1/2) means the square root of x.",
          difficulty: "easy",
          why: [null, "x² means x squared. An exponent of 1/2 means the square root.", "The 2 in 1/2 tells you which root; it's not a coefficient in front.", "1/√x would be x to the −1/2. The exponent here is positive."],
        },
        {
          q: "Simplify: (x³y²)⁴ / x²",
          choices: ["x^10 y^8", "x^12 y^8", "x^6 y^8", "x^10 y^6"],
          answer: 0,
          explain:
            "Apply the power-of-a-power rule to each factor inside the parentheses: (x³)⁴ = x^12, and (y²)⁴ = y^8, giving x^12 y^8. Dividing by x², since the bases match, subtract the exponents: x^(12-2) = x^10. The y term has no matching factor to combine with in the denominator, so it stays as is: x^10 y^8.",
          difficulty: "medium",
          why: [null, "This forgets to divide by x². Subtract the exponents: x¹² ÷ x² = x¹⁰.", "Dividing powers subtracts exponents (12 − 2 = 10); it doesn't divide them (12 ÷ 2).", "(y²)⁴ multiplies the exponents: y⁸, not y⁶."],
        },
        {
          q: "Rewrite x^(2/3) using radical notation.",
          choices: [
            "the cube root of x², or (∛x)²",
            "the square root of x³",
            "x raised to the 3/2 power",
            "the cube root of x",
          ],
          answer: 0,
          explain:
            "For a rational exponent m/n, the denominator n gives the root and the numerator m gives the power. Here n = 3 (cube root) and m = 2 (squared), so x^(2/3) equals the cube root of x², or equivalently, the cube root of x, squared.",
          difficulty: "medium",
          why: [null, "This swaps the root and the power. The denominator, 3, is the root; the numerator, 2, is the power.", "x to the 3/2 is a different number. The exponent here is 2/3.", "This drops the power of 2. x to the 2/3 is the cube root, squared."],
        },
        {
          q: "If x > 0 and x^(3/4) = 8, what is the value of x?",
          choices: ["16", "6", "8", "64"],
          answer: 0,
          explain:
            "Rewrite the rational exponent as a radical: x^(3/4) means the 4th root of x, cubed, which equals 8. To undo the cube, take the cube root of both sides: the 4th root of x = 8^(1/3) = 2. To undo the 4th root, raise both sides to the 4th power: x = 2^4 = 16.",
          difficulty: "hard",
          why: [null, "Check it: 6 to the 3/4 is about 3.8, not 8.", "8 is the value of x to the 3/4. Solve for x: the 4th root of x is 2, so x = 16.", "Check it: 64 to the 3/4 is about 22.6, not 8."],
        },
      ],
      traps: [
        "Multiplying exponents when the operation is actually multiplication of same-base terms (which requires adding exponents), or vice versa.",
        "Treating a negative exponent as making the value negative, rather than correctly taking its reciprocal.",
        "Mixing up which number in a rational exponent m/n is the root (the denominator) and which is the power (the numerator).",
      ],
    },
    {
      name: "Expanding and Combining Polynomial Expressions",
      explanation:
        "This is the reverse of factoring: multiplying out (distributing) an expression like (x+3)(x-5), or adding, subtracting, and combining like terms across polynomials. Distribute every term in the first factor across every term in the second (the same idea as FOIL, just extended to any size polynomial) then combine the like terms that result. When adding or subtracting whole polynomials, line up matching powers of x before combining coefficients. Be extra careful to distribute a negative sign across EVERY term when subtracting one polynomial from another. Some questions run this in reverse to find unknown constants: if (ax + 5)(x - b) = 3x² - 10x - 25 for all values of x, expand the side with the unknowns and set the coefficients of matching powers equal (x² terms to x² terms, x terms to x terms, constants to constants). Solve the simplest match first, then check the answer against the remaining terms. The same matching tells you which expression has a given factor, or which quantity must be an integer when all the constants are integers.",
      examples: [
        {
          q: "Simplify: (2x³ - 5x + 1) + (x³ + 4x - 6)",
          choices: ["3x³ - x - 5", "3x³ + x - 5", "3x³ - x + 5", "3x³ - 9x - 5"],
          answer: 0,
          explain: "Line up like terms by matching powers of x: (2x³ + x³) + (-5x + 4x) + (1 - 6), giving 3x³ - x - 5.",
          difficulty: "easy",
          why: [null, "The x terms are −5x + 4x, which is −x, not +x.", "The constants are 1 − 6 = −5, not +5.", "The x terms add: −5x + 4x = −x. This subtracts 4x instead."],
        },
        {
          q: "Expand: (x + 4)(x + 7)",
          choices: ["x² + 11x + 28", "x² + 28x + 11", "x² + 7x + 28", "x² + 11x + 11"],
          answer: 0,
          explain: "Distribute each term in the first factor across the second: x(x+7) + 4(x+7) = x² + 7x + 4x + 28, which combines to x² + 11x + 28.",
          difficulty: "easy",
          why: [null, "This swaps the numbers: the middle term is 4 + 7 = 11, and the constant is 4 × 7 = 28.", "The middle term needs both 7x and 4x, which make 11x.", "The constant is 4 × 7 = 28, not 4 + 7."],
        },
        {
          q: "Simplify: (5x² - 3x + 8) - (2x² - 6x + 1)",
          choices: ["3x² + 3x + 7", "3x² - 9x + 7", "3x² + 3x + 9", "7x² + 3x + 7"],
          answer: 0,
          explain:
            "Subtracting a polynomial means distributing a negative sign across every one of its terms: 5x² - 3x + 8 - 2x² + 6x - 1 — the middle term's sign flips from -6x to +6x. Combining like terms: (5x² - 2x²) + (-3x + 6x) + (8 - 1) = 3x² + 3x + 7.",
          difficulty: "medium",
          why: [null, "Subtracting −6x adds 6x: −3x + 6x = +3x.", "The constant is 8 − 1 = 7. Subtracting the 1 isn't the same as adding it.", "The x² terms subtract: 5x² − 2x² = 3x², not 7x²."],
        },
        {
          q: "Expand: (2x - 3)(x² + 4x - 1)",
          choices: ["2x³ + 5x² - 14x + 3", "2x³ + 8x² - 2x + 3", "2x³ + 5x² - 10x + 3", "2x³ - 5x² - 14x + 3"],
          answer: 0,
          explain:
            "Distribute each term of the binomial across all three terms of the trinomial: 2x(x²+4x-1) - 3(x²+4x-1) = (2x³ + 8x² - 2x) + (-3x² - 12x + 3). Combining like terms gives 2x³ + 5x² - 14x + 3.",
          difficulty: "medium",
          why: [null, "−3 must multiply every term too: that adds −3x² and −12x.", "The x terms are −2x and −12x, which make −14x.", "The x² terms are 8x² and −3x², which make +5x²."],
        },
        {
          q: "If (ax + 5)(x - b) = 3x² - 10x - 25 for all values of x, where a and b are constants, what is the value of b?",
          choices: ["-5", "3", "5", "25"],
          answer: 2,
          explain:
            "Expand the left side: ax² - abx + 5x - 5b = ax² + (5 - ab)x - 5b. Match coefficients: the x² terms give a = 3, and the constants give -5b = -25, so b = 5. Check the x-term: 5 - (3)(5) = -10, which matches. The value -5 drops the minus sign in (x - b), 3 is a rather than b, and 25 is the size of the constant term, not b.",
          difficulty: "medium",
          why: ["The factor is (x − b), so b = −5 would make it (x + 5). Check it: (3x + 5)(x + 5) = 3x² + 20x + 25.", "3 is the value of a, from matching the x² terms. Match the constants for b: −5b = −25.", null, "25 is the size of the constant term. The constant is −5b, so −5b = −25 and b = 5."],
        },
        {
          q: "If P(x) = 3x² - 2x + 5 and Q(x) = x² + 4x - 7, what is 2P(x) - Q(x)?",
          choices: ["5x² - 8x + 17", "7x² - 8x - 2", "5x² + 8x + 3", "5x² - 8x + 3"],
          answer: 0,
          explain:
            "Apply the coefficient 2 to every term of P(x) first: 2P(x) = 6x² - 4x + 10. Distribute the negative sign across every term of Q(x): -Q(x) = -x² - 4x + 7. Adding the results together, combining like terms: (6x² - x²) + (-4x - 4x) + (10 + 7) = 5x² - 8x + 17.",
          difficulty: "hard",
          why: [null, "Check the constant: 2(5) − (−7) = 17, not −2.", "The x terms: 2(−2x) − 4x = −8x, not +8x.", "Subtracting −7 adds 7: 10 + 7 = 17, not 3."],
        },
        {
          q: "The equation 8x² + bx + 15 = (px + 3)(qx + r) is true for all values of x, where b, p, q, and r are positive integers. Which of the following must be an integer?",
          choices: ["b/5", "8/r", "(b - 5p)/3", "15/q"],
          answer: 2,
          explain:
            "Expand the right side: pqx² + (pr + 3q)x + 3r. Match coefficients: pq = 8, 3r = 15, and b = pr + 3q. The constants force r = 5, so b = 5p + 3q, which rearranges to (b - 5p)/3 = q, a positive integer. The other choices aren't guaranteed. With p = 1 and q = 8, b = 29, so b/5 isn't an integer. Since r = 5, 8/r = 8/5. With q = 2, 15/q = 7.5.",
          difficulty: "hard",
          why: ["b = 5p + 3q, and 3q need not be a multiple of 5. With p = 1 and q = 8, b = 29, and 29/5 isn't an integer.", "Matching the constants gives 3r = 15, so r = 5 and 8/r = 8/5, which isn't an integer.", null, "q can be 1, 2, 4, or 8 (since pq = 8). With q = 2, 15/q = 7.5, which isn't an integer."],
        },
      ],
      traps: [
        "Forgetting to distribute a negative sign across every term of the second polynomial when subtracting one polynomial from another — only flipping the first term's sign.",
        "Combining terms with different powers of x as if they were like terms (for example, adding x² and x directly).",
        "Making a sign error while distributing a binomial across a longer polynomial, especially when the binomial itself contains a subtraction.",
        "Squaring a binomial term by term — (x + 4)² is not x² + 16; the middle term 2·4·x is required.",
        "Matching only one pair of coefficients: a value that makes the x-terms match must also make the constant and x² terms match, so check every power of x.",
        "Answering with the wrong number, such as the constant term of the expanded form or a different unknown, instead of the constant the question asks for.",
      ],
    },
    {
      name: "Rearranging a Formula to Isolate a Variable",
      explanation:
        "These questions give a formula with several letters, often from physics, finance, or geometry, and ask something like 'Which equation correctly expresses C in terms of P, N, and k?' Treat every letter except the target as if it were a known number, and undo the operations around the target in reverse order: first whatever was done last (usually adding or subtracting), then multiplying or dividing. Keep any group that contains the target together; in P = N(k - C), divide both sides by N before you touch the parentheses. If the target is in a denominator, multiply both sides by that denominator first; if the formula is a sum of reciprocals, combine them into one fraction before flipping both sides. If the target is under a square root, isolate the root, then square both sides. If the target shows up in two places, collect those terms on one side and factor the target out. Wrong answers usually undo steps in the wrong order, apply an operation to only one term of a side, or flip a sign, so check your choice by plugging in easy numbers.",
      examples: [
        {
          q: "The formula d = rt gives the distance d traveled at a constant rate r for a time t. Which equation correctly expresses t in terms of d and r?",
          choices: ["t = dr", "t = d/r", "t = r/d", "t = d - r"],
          answer: 1,
          explain:
            "In d = rt, the target t is multiplied by r, so undo that by dividing both sides by r: d/r = t. Plug in easy numbers to check: going 60 miles at 30 miles per hour takes 60/30 = 2 hours. Multiplying d by r does the opposite of what's needed, r/d divides the wrong way, and d - r subtracts when r was never added.",
          difficulty: "easy",
          why: ["This multiplies by r instead of dividing. Check it: 60 miles at 30 miles per hour would take 1,800 hours.", null, "This divides the wrong way. Check it: 60 miles at 30 miles per hour would take 30/60 = 1/2 hour instead of 2 hours.", "r multiplies t, so undo it by dividing, not subtracting. Check it: 60 − 30 = 30 hours, not 2."],
        },
        {
          q: "The perimeter P of a rectangle with length l and width w is given by P = 2l + 2w. Which equation correctly expresses w in terms of P and l?",
          choices: ["w = 2(P - 2l)", "w = P/2 - 2l", "w = (P + 2l)/2", "w = (P - 2l)/2"],
          answer: 3,
          explain:
            "Undo the operations on w in reverse order. The 2l was added last, so subtract it from both sides: P - 2l = 2w. Then divide the whole side by 2: w = (P - 2l)/2. Check with a 5-by-3 rectangle: P = 16, and (16 - 10)/2 = 3. Multiplying by 2 undoes nothing, dividing only P by 2 leaves the 2l undivided, and adding 2l is a sign slip.",
          difficulty: "easy",
          why: ["The 2 multiplies w, so divide by 2 instead of multiplying. Check it with P = 16 and l = 5: 2(16 − 10) = 12, not 3.", "Only P was divided by 2; the 2l has to be divided too. Check it with P = 16 and l = 5: 8 − 10 = −2.", "Moving +2l to the other side subtracts it. Check it with P = 16 and l = 5: (16 + 10)/2 = 13.", null],
        },
        {
          q: "A shop's profit P, in dollars, from selling N copies of an item is given by P = N(k - C), where k is the selling price per copy and C is the cost per copy, both in dollars. Which equation correctly expresses C in terms of P, N, and k?",
          choices: ["C = k - P/N", "C = P/N - k", "C = (k - P)/N", "C = k - PN"],
          answer: 0,
          explain:
            "N multiplies the whole group (k - C), so divide both sides by N first: P/N = k - C. Then move C and P/N across: C = k - P/N. Check with N = 10, k = 8, C = 5: P = 30, and 8 - 30/10 = 5. Writing P/N - k flips the sign; (k - P)/N comes from pulling k out before dividing by N, which undoes the steps in the wrong order; and k - PN multiplies by N instead of dividing.",
          difficulty: "medium",
          why: [null, "The sign is flipped. From P/N = k − C, solving gives C = k − P/N. Check it with P = 30, N = 10, k = 8: 3 − 8 = −5, not 5.", "N multiplies k too, so you can't move k before dividing by N. Check it with P = 30, N = 10, k = 8: (8 − 30)/10 = −2.2, not 5.", "This multiplies by N instead of dividing. Check it with P = 30, N = 10, k = 8: 8 − 300 = −292, not 5."],
        },
        {
          q: "Two pipes fill a tank together. The time T, in minutes, to fill the tank is T = V/(r + s), where V is the tank's volume, in gallons, and r and s are the pipes' rates, in gallons per minute. Which equation correctly expresses r in terms of T, V, and s?",
          choices: ["r = (V - s)/T", "r = VT - s", "r = V/T - s", "r = T/V - s"],
          answer: 2,
          explain:
            "The target sits in the denominator, so multiply both sides by (r + s): T(r + s) = V. Divide both sides by T: r + s = V/T. Then subtract s: r = V/T - s. Check with V = 120, r = 5, s = 3: T = 120/8 = 15, and 120/15 - 3 = 5. Subtracting s before dividing by T undoes the steps in the wrong order, VT multiplies where it should divide, and T/V is the reciprocal of what you need.",
          difficulty: "medium",
          why: ["s was never divided by T, so subtract it after dividing, not before. Check it with V = 120, T = 15, s = 3: 117/15 = 7.8, not 5.", "From T(r + s) = V, divide by T; don't multiply. Check it with V = 120, T = 15, s = 3: 1,800 − 3 = 1,797.", null, "This flips the fraction. r + s equals V/T, not T/V. Check it with V = 120, T = 15, s = 3: 0.125 − 3 is negative."],
        },
        {
          q: "A biologist models the growth rate R of a bacterial culture with the formula R = 4c/(c + k), where c is the nutrient concentration and k is a positive constant. Which equation correctly expresses c in terms of R and k?",
          choices: ["c = k/(4 - R)", "c = (Rk)/(4 - R)", "c = (Rk)/(R - 4)", "c = (4 - R)/(Rk)"],
          answer: 1,
          explain:
            "The target appears twice, so collect it. Multiply both sides by (c + k) and distribute R to both terms: Rc + Rk = 4c. Move the c terms to one side: Rk = 4c - Rc. Factor out c: Rk = c(4 - R). Divide: c = (Rk)/(4 - R). Check with k = 2 and c = 6: R = 24/8 = 3, and (3 · 2)/(4 - 3) = 6. Multiplying R by only the c term loses the R in Rk, subtracting in the wrong order flips the sign of the denominator, and the last choice is the reciprocal.",
          difficulty: "hard",
          why: ["R multiplies both terms of (c + k): R(c + k) = Rc + Rk. Check it with R = 3, k = 2: 2/1 = 2, not 6.", null, "The sign is flipped. Rk = 4c − Rc = c(4 − R). Check it with R = 3, k = 2: 6/(−1) = −6, not 6.", "This is the reciprocal of c. Check it with R = 3, k = 2: 1/6, not 6."],
        },
      ],
      traps: [
        "Undoing operations in the wrong order: moving a term out of a group before dividing by the factor that multiplies the whole group, as in treating P = N(k - C) as if N multiplied only C.",
        "Applying an operation to only one term of a side: dividing just the first term by 2, or multiplying R by only one of the terms in (c + k).",
        "Sign errors when moving a term across the equals sign or pulling the target out of a subtraction like k - C.",
        "Mishandling reciprocals, squares, or a target in two places: flipping 1/x + 1/y term by term, forgetting to flip or square the final result, or leaving the target on both sides instead of factoring it out.",
      ],
    },
  ],
  tipsAndTricks: [
    "Memorize perfect squares up through at least 15² and common products, so difference-of-squares and perfect-square-trinomial patterns jump out immediately rather than requiring calculation.",
    "Before doing anything else with a rational expression (a fraction with polynomials), factor the numerator and denominator completely first — simplifying without factoring first is a common source of errors.",
    "For trinomial factoring (x² + bx + c), find two numbers that multiply to c and add to b — writing out a few factor pairs of c quickly narrows this down.",
  ],
};

const LC_M_NONLINEAR_EQ: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Solving a Quadratic by Factoring or the Quadratic Formula",
      explanation:
        "This is the baseline method the rest of this skill builds on: actually finding the solution(s) to a quadratic equation, not just how many it has. First, get the equation into 'expression = 0' form by moving everything to one side. Then try factoring: look for two numbers that multiply to the constant term and add to the middle coefficient. Once you have two factors, use the zero product property — if (x - p)(x - q) = 0, then x = p or x = q. If it doesn't factor into nice integers, fall back to the quadratic formula, x = (-b ± √(b²-4ac)) / 2a, which always works. If a question asks only for the sum or the product of the solutions, you don't need the solutions at all: once the equation is in ax² + bx + c = 0 form, the sum of the solutions is -b/a and the product is c/a. This shortcut is made for messy, unexpanded equations like (3x + 1)(x - 2) = (x - 1)² + 4, but expand both sides and move everything to one side first, because -b/a and c/a only apply to that final form.",
      examples: [
        {
          q: "Solve for x: x² - 3x - 10 = 0",
          choices: ["x = 5 or x = -2", "x = -5 or x = 2", "x = 5 or x = 2", "x = -5 or x = -2"],
          answer: 0,
          explain:
            "The equation is already in 'expression = 0' form. Look for two numbers that multiply to -10 and add to -3: -5 and 2 work. Factoring gives (x - 5)(x + 2) = 0, and the zero product property gives x = 5 or x = -2.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-2", "5"] },
          difficulty: "easy",
          why: [null, "The signs are flipped. (x − 5)(x + 2) = 0 gives x = 5 or x = −2.", "Check x = 2: 4 − 6 − 10 = −12, not 0.", "Check x = −5: 25 + 15 − 10 = 30, not 0."],
        },
        {
          q: "Solve for d: (d - 30)(d + 30) - 7 = -7",
          choices: ["d = 30 or d = -30", "d = 7 or d = -7", "d = 30 only", "d = 60 or d = 0"],
          answer: 0,
          explain:
            "This isn't in 'expression = 0' form yet — add 7 to both sides first: (d-30)(d+30) = 0. The expression is now already factored, so applying the zero product property directly gives d = 30 or d = -30.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-30", "30"] },
          difficulty: "easy",
          why: [null, "The −7s cancel when you add 7 to both sides. They aren't solutions; the factors (d − 30)(d + 30) give them.", "d + 30 = 0 also works, so d = −30 is a second solution.", "Check d = 0: (−30)(30) − 7 = −907, not −7."],
        },
        {
          q: "Solve for x: 2x² + 5x - 3 = 0",
          choices: ["x = 1/2 or x = -3", "x = -1/2 or x = 3", "x = 1 or x = -3/2", "x = 3 or x = -1/2"],
          answer: 0,
          explain:
            "The leading coefficient isn't 1, which makes integer factoring trickier, so use the quadratic formula: a=2, b=5, c=-3, giving x = (-5 ± √(25-4(2)(-3))) / 4 = (-5 ± √49) / 4 = (-5 ± 7) / 4, so x = 1/2 or x = -3.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-3", "1/2"] },
          difficulty: "medium",
          why: [null, "The signs are flipped. (−5 + 7)/4 = 1/2 and (−5 − 7)/4 = −3.", "Check x = 1: 2 + 5 − 3 = 4, not 0.", "The signs are flipped. The solutions are 1/2 and −3."],
        },
        {
          q: "Solve for x: 3x² = 12x",
          choices: ["x = 0 or x = 4", "x = 4 only", "x = 0 or x = -4", "x = 3 or x = 0"],
          answer: 0,
          explain:
            "Move everything to one side: 3x² - 12x = 0. Factor out the greatest common factor first: 3x(x - 4) = 0. The zero product property gives 3x = 0 or x - 4 = 0, so x = 0 or x = 4 — dividing both sides by x instead would illegally lose the x = 0 solution.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["0", "4"] },
          difficulty: "medium",
          why: [null, "Dividing both sides by x throws away the solution x = 0. Factor instead: 3x(x − 4) = 0.", "x − 4 = 0 gives x = +4, not −4.", "3 is the coefficient, not a solution. Check: 3(9) = 27, but 12(3) = 36."],
        },
        {
          q: "Solve for x: x² + 6x + 4 = 0",
          choices: [
            "x = -3 + √5 or x = -3 - √5",
            "x = 3 + √5 or x = 3 - √5",
            "x = -6 + √5 or x = -6 - √5",
            "x = -3 + √20 or x = -3 - √20",
          ],
          answer: 0,
          explain:
            "Integer factors of 4 that add to 6 don't exist, so this won't factor cleanly. Use the quadratic formula with a=1, b=6, c=4: x = (-6 ± √(36-16)) / 2 = (-6 ± √20) / 2. Simplifying the radical, √20 = 2√5, so x = -3 ± √5.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-3-√5", "-3+√5"] },
          difficulty: "hard",
          why: [null, "A sign slip: the formula starts with −b = −6, so the center is −3.", "The whole numerator is divided by 2, so −6 becomes −3, not just the radical.", "√20 also gets divided by 2: √20 = 2√5, so (−6 ± 2√5)/2 = −3 ± √5."],
        },
        {
          q: "What is the sum of the solutions to (3x + 1)(x - 2) = (x - 1)² + 4?",
          choices: ["-3/2", "5/3", "3/2", "-7/2"],
          answer: 2,
          explain:
            "The question asks only for the sum, so use the shortcut instead of solving. First expand both sides: the left side is 3x² - 5x - 2, and the right side is x² - 2x + 1 + 4 = x² - 2x + 5. Moving everything to the left gives 2x² - 3x - 7 = 0, so a = 2, b = -3, c = -7, and the sum of the solutions is -b/a = 3/2. (The solutions themselves are (3 ± √65)/4, which is why solving directly is slow.) -3/2 drops the minus sign in -b/a, 5/3 uses only the left side before the right side was moved over, and -7/2 is c/a, the product rather than the sum.",
          difficulty: "hard",
          why: ["The sum is −b/a, not b/a. Here b = −3, so −b/a = 3/2.", "That's the sum for 3x² − 5x − 2 = 0, the left side alone. Move the right side over first: 2x² − 3x − 7 = 0.", null, "That's c/a, the product of the solutions. The sum is −b/a = 3/2."],
        },
      ],
      traps: [
        "Dividing both sides of an equation like 3x² = 12x by x to 'simplify' — this illegally loses the x = 0 solution; factor out the shared term instead of dividing by a variable.",
        "Forgetting to move all terms to one side before attempting to factor or apply the zero product property — factoring only works once the equation equals zero.",
        "Spending too long forcing integer factoring on an expression that doesn't factor neatly — if two integers that work aren't apparent within a few tries, switch to the quadratic formula.",
        "Mixing up the sum-and-product shortcut — the sum of the solutions is -b/a (the minus sign matters) and the product is c/a; dropping the minus, forgetting to divide by a, or reporting the product when the question asks for the sum all give a wrong answer that's among the choices.",
      ],
    },
    {
      name: "Solving Absolute Value Equations",
      explanation:
        "An absolute value equation like |expression| = k has two cases, because whatever's inside the bars could have started out positive or negative: expression = k, or expression = -k. Solve both separately to get up to two solutions. If k is negative, there's no solution at all — an absolute value can never equal a negative number, so check this before doing any algebra. The absolute value can also be hidden inside a function, as in f(x) = |x - 3| + 2 with a condition like f(a) - f(1) = 6. Turn that into a plain equation first: evaluate the known value (f(1) = 4), so f(a) = 10, then write f(a) with its formula, isolate the bars (|a - 3| = 8), and split into cases; if the question limits the answer (say, a > 0), use that to pick the case. Once you have candidate solutions, check them back in the original equation. It's the same habit that catches extraneous solutions in radical equations.",
      examples: [
        {
          q: "Solve for x: |x - 5| = 10",
          choices: ["x = 15 or x = -5", "x = 15 or x = 5", "x = -15 or x = 5", "x = 5 only"],
          answer: 0,
          explain: "Split into two cases: x - 5 = 10, or x - 5 = -10. Solving each gives x = 15 or x = -5.",
          difficulty: "easy",
          why: [null, "Check x = 5: |5 − 5| = 0, not 10. The second case is x − 5 = −10, so x = −5.", "The signs are flipped. x − 5 = 10 gives 15, and x − 5 = −10 gives −5.", "Check x = 5: |0| = 0, not 10. There are two solutions: 15 and −5."],
        },
        {
          q: "Solve for x: |2x + 3| = 9",
          choices: ["x = 3 or x = -6", "x = 3 or x = 6", "x = -3 or x = 6", "x = 6 or x = -3"],
          answer: 0,
          explain:
            "Split into two cases: 2x + 3 = 9, or 2x + 3 = -9. Solving the first gives 2x = 6, so x = 3; solving the second gives 2x = -12, so x = -6.",
          difficulty: "easy",
          why: [null, "Check x = 6: |12 + 3| = 15, not 9.", "Check x = −3: |−6 + 3| = 3, not 9.", "Check x = 6: |15| = 15, not 9. The solutions are 3 and −6."],
        },
        {
          q: "Solve for x: |4x - 1| = -6",
          choices: ["No solution", "x = 7/4 or x = -5/4", "x = -6 only", "x = 6 or x = -6"],
          answer: 0,
          explain:
            "Before splitting into cases, check the right side: it's -6, a negative number. An absolute value expression can never equal a negative number, no matter what x is, so this equation has no solution.",
          difficulty: "medium",
          why: [null, "Those values make 4x − 1 equal 6 or −6, but an absolute value can never equal −6.", "An absolute value is never negative, so it can't equal −6 for any x.", "No x works: an absolute value can't equal a negative number."],
        },
        {
          q: "Solve for x: 3|x + 2| - 4 = 11",
          choices: ["x = 3 or x = -7", "x = 5 or x = -9", "x = 3 or x = -2", "x = 7 or x = -3"],
          answer: 0,
          explain:
            "Isolate the absolute value expression before splitting into cases: add 4 to both sides (3|x+2| = 15), then divide by 3 (|x+2| = 5). Splitting into two cases, x + 2 = 5 or x + 2 = -5, gives x = 3 or x = -7.",
          difficulty: "medium",
          why: [null, "Check x = 5: 3|7| − 4 = 17, not 11.", "Check x = −2: 3|0| − 4 = −4, not 11.", "Check x = 7: 3|9| − 4 = 23, not 11."],
        },
        {
          q: "The function f is defined by f(x) = |x - 3| + 2. If f(a) - f(1) = 6 and a > 0, what is the value of a?",
          choices: ["7", "11", "9", "-5"],
          answer: 1,
          explain:
            "Start with the value you can compute: f(1) = |1 - 3| + 2 = 2 + 2 = 4. Then f(a) - 4 = 6, so f(a) = 10, which means |a - 3| + 2 = 10 and |a - 3| = 8. The two cases give a - 3 = 8 (a = 11) or a - 3 = -8 (a = -5), and the condition a > 0 keeps a = 11. Choosing 7 sets f(a) itself equal to 6, choosing 9 forgets the + 2 when evaluating f(1), and -5 is the case the condition a > 0 rules out.",
          difficulty: "medium",
          why: ["This sets f(a) = 6, but f(a) − f(1) = 6 and f(1) = 4, so f(a) = 10. Check: f(7) − f(1) = 6 − 4 = 2.", null, "f(1) = |1 − 3| + 2 = 4, not 2. Check: f(9) − f(1) = 8 − 4 = 4, not 6.", "a = −5 does make f(a) = 10, but the question says a > 0."],
        },
        {
          q: "Find the sum of all solutions to the equation |2x - 7| = 3x - 1.",
          choices: ["8/5", "-22/5", "-6", "-8/5"],
          answer: 0,
          explain:
            "Split into two cases: 2x - 7 = 3x - 1, giving x = -6; or 2x - 7 = -(3x - 1), giving 5x = 8, so x = 8/5. Since the right side contains a variable, each candidate must be checked in the original equation — substituting x = -6 gives 3(-6) - 1 = -19, and an absolute value can't equal a negative number, so x = -6 is extraneous and must be discarded (a student who forgets this check would wrongly report the sum as -22/5). Only x = 8/5 is valid, so the sum of all solutions is 8/5.",
          difficulty: "hard",
          why: [null, "This includes x = −6, but then the right side is 3(−6) − 1 = −19, and an absolute value can't be negative.", "x = −6 is extraneous: it makes the right side −19. The only real solution is 8/5.", "A sign slip: 5x = 8 gives x = +8/5."],
        },
      ],
      traps: [
        "Forgetting the negative case entirely and reporting only one solution when the equation has two.",
        "Not checking whether the right side of the equation is negative before splitting into cases — if it is, there's no solution at all.",
        "When a variable appears on both sides of the equation, forgetting to check candidate solutions back in the original equation — one of them can turn out to be extraneous, just as with radical equations.",
        "In a function question like f(a) - f(1) = 6, splitting into cases too early — first evaluate the known function value, add it over so f(a) equals a number, and isolate the absolute value (constants outside the bars and all) before writing the two cases.",
      ],
    },
    {
      name: "Determining the Number of Solutions via the Discriminant",
      desmosCalculator: "graphing",
      desmosTrick:
        "Step 1: If the equation isn't already in 'expression = 0' form, move everything to one side first. Step 2: Type y = [that side] into Desmos as a new line. Step 3: Look at how many times the curve crosses the x-axis — two crossings means two real solutions, one crossing where the curve just touches the axis (without crossing through) means exactly one repeated solution, and zero crossings means no real solutions. You can count crossings by eye instead of computing b²-4ac.",
      explanation:
        "For a quadratic ax² + bx + c = 0, the discriminant (b² - 4ac) tells you the number of real solutions without solving the whole equation. Positive means two real solutions. Zero means exactly one repeated solution. Negative means no real solutions. This is much faster than factoring or using the full quadratic formula when a question only asks 'how many solutions' — not what they are. The same idea handles a line and a parabola that meet at exactly one point: set the two expressions equal, move everything to one side, and set the discriminant of that single quadratic equal to 0 to find the unknown constant. When the discriminant is 0, the one solution is x = -b/(2a) of that combined quadratic, which gives the meeting point's x-coordinate directly. For a horizontal line y = k there's an even faster shortcut: it meets a parabola exactly once only at the vertex, so k is the vertex's y-value.",
      examples: [
        {
          q: "How many real solutions does x² + 4x + 5 = 0 have?",
          choices: ["No real solutions", "Exactly one real solution", "Two real solutions", "Cannot be determined"],
          answer: 0,
          explain: "Identify a=1, b=4, c=5. The discriminant is b² - 4ac = 16 - 20 = -4. Since it's negative, there are no real solutions.",
          diagram: { kind: "parabolaGraph", opensUp: true, vertexLabel: "No real solutions" },
          difficulty: "easy",
          why: [null, "One solution needs a discriminant of exactly 0. Here it's 16 − 20 = −4.", "Two solutions need a positive discriminant. Here it's −4.", "It can be determined: the discriminant is 16 − 20 = −4, which is negative."],
        },
        {
          q: "How many real solutions does 2x² - 4x + 2 = 0 have?",
          choices: ["Exactly one real solution", "No real solutions", "Two real solutions", "Cannot be determined"],
          answer: 0,
          explain:
            "Identify a=2, b=-4, c=2. The discriminant is b² - 4ac = 16 - 16 = 0. A discriminant of exactly zero is a distinct case from both positive and negative — it means exactly one repeated real solution.",
          diagram: { kind: "parabolaGraph", opensUp: true, touchesAxis: true, vertexLabel: "1 solution" },
          difficulty: "medium",
          why: [null, "No real solutions needs a negative discriminant. Here it's 16 − 16 = 0.", "Two solutions needs a positive discriminant. Here it's exactly 0.", "It can be determined: the discriminant is 0, which means one repeated solution."],
        },
        {
          q: "How many real solutions does x² - 6x + 8 = 0 have?",
          choices: ["Two real solutions", "No real solutions", "Exactly one real solution", "Cannot be determined"],
          answer: 0,
          explain: "Identify a=1, b=-6, c=8. The discriminant is b² - 4ac = 36 - 32 = 4. Since it's positive, there are two real solutions.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["", ""], vertexLabel: "2 solutions" },
          difficulty: "easy",
          why: [null, "No real solutions needs a negative discriminant. Here it's 36 − 32 = 4.", "One solution needs a discriminant of 0. Here it's 4, positive.", "It can be determined: the discriminant is 4, which is positive."],
        },
        {
          q: "How many real solutions does -2x² + 3x - 5 = 0 have?",
          choices: ["No real solutions", "Exactly one real solution", "Two real solutions", "Cannot be determined"],
          answer: 0,
          explain:
            "Identify a=-2, b=3, c=-5. Computing the discriminant carefully with the negative values: b² - 4ac = 9 - 4(-2)(-5) = 9 - 40 = -31. Since it's negative, there are no real solutions.",
          diagram: { kind: "parabolaGraph", opensUp: false, vertexLabel: "No real solutions" },
          difficulty: "medium",
          why: [null, "One solution needs a discriminant of 0. Here it's 9 − 40 = −31.", "Two solutions need a positive discriminant. Here it's −31.", "It can be determined: 9 − 4(−2)(−5) = −31, which is negative."],
        },
        {
          q: "For what values of k does the equation x² + 6x + k = 0 have two real solutions?",
          choices: ["k < 9", "k > 9", "k ≤ 9", "k = 9"],
          answer: 0,
          explain:
            "Set up the discriminant using the given coefficients, with k as the unknown: b² - 4ac = 36 - 4k. 'Two real solutions' requires the discriminant to be strictly positive (not just non-negative, since exactly one solution needs it to equal zero), so 36 - 4k > 0, giving k < 9.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["", ""], vertexLabel: "2 solutions when k < 9" },
          difficulty: "hard",
          why: [null, "k > 9 makes 36 − 4k negative, which gives no real solutions.", "At k = 9, the discriminant is 0, which gives only one solution. It must be strictly less than 9.", "k = 9 gives a discriminant of 0, which is exactly one solution, not two."],
        },
        {
          q: "In the xy-plane, the graph of y = x² - 4x + 7 and the line y = 2x + k, where k is a constant, intersect at exactly one point. What is the x-coordinate of that point?",
          choices: ["-2", "2", "3", "4"],
          answer: 2,
          explain:
            "Set the expressions equal and move everything to one side: x² - 4x + 7 = 2x + k becomes x² - 6x + (7 - k) = 0. Exactly one intersection point means the discriminant is 0: 36 - 4(7 - k) = 0, so 8 + 4k = 0 and k = -2. The equation is then x² - 6x + 9 = 0, or (x - 3)² = 0, so x = 3. (Shortcut: with a zero discriminant the single solution is -b/(2a) = 6/2 = 3, no k needed.) -2 is the value of k, 2 is the x-coordinate of the parabola's vertex, and 4 is the y-coordinate of the point, 2(3) - 2.",
          difficulty: "hard",
          why: ["That's k, the line's intercept. The question asks for the x-coordinate of the meeting point.", "That's the vertex of y = x² − 4x + 7. The line isn't horizontal, so it touches somewhere else: x = 3.", null, "That's the y-coordinate, 2(3) − 2 = 4. The x-coordinate is 3."],
        },
      ],
      traps: [
        "Attempting to factor or use the full quadratic formula when the question only asks for the number of solutions — the discriminant alone answers this faster.",
        "Sign errors when computing -4ac, especially when a or c is negative.",
        "With a line and a parabola, taking a discriminant before setting the equations equal and moving everything to one side — the line's slope and intercept must be combined into the b and c of one quadratic first.",
        "Answering with the wrong number — the constant k when the question asks for the x-coordinate of the meeting point, or the vertex's x-coordinate when it asks for the value of the horizontal line y = k.",
      ],
    },
    {
      name: "Solving Radical and Rational Equations (Checking for Extraneous Solutions)",
      explanation:
        "Radical (square root) equations require squaring both sides to get rid of the radical — but that step can introduce 'extraneous' solutions: values that satisfy the squared equation but not the original one. Rational equations, which have the variable in a denominator, like (x² + 2x)/(x - 1) = 3/(x - 1), carry the same risk for a different reason. Clear the fractions by multiplying every term, plain constants included, by the common denominator, then solve what's left. Any value that makes an original denominator equal zero must be thrown out, because the original equation isn't defined there; if every candidate gets thrown out, the equation has no solution. If the equation includes a constant like c, follow the same steps and treat c as a number, so the answer is an expression in c. The critical, often-skipped last step for both types: plug your solution back into the ORIGINAL equation to verify it actually works.",
      examples: [
        {
          q: "Solve for x: √(x + 3) = 5",
          choices: ["22", "2", "25", "28"],
          answer: 0,
          explain:
            "Square both sides to eliminate the square root: x + 3 = 25, so x = 22. Check by substituting back into the original equation: √(22 + 3) = √25 = 5, which matches the right side — the solution is valid, not extraneous.",
          difficulty: "easy",
          why: [null, "2 is 5 − 3. Square both sides first: x + 3 = 25.", "25 is x + 3. Subtract 3 to get x = 22.", "28 adds 3 instead of subtracting it: x + 3 = 25 gives x = 22."],
        },
        {
          q: "Solve for x: √(2x - 1) = x - 2",
          choices: ["5", "1 or 5", "1", "-5"],
          answer: 0,
          explain:
            "Square both sides: 2x - 1 = (x-2)² = x² - 4x + 4. Rearranging: x² - 6x + 5 = 0, which factors to (x-1)(x-5) = 0, giving candidates x = 1 and x = 5. Checking both in the original equation: for x = 1, the left side is 1 but the right side is -1, so x = 1 is extraneous; for x = 5, both sides equal 3, so x = 5 is the only valid solution.",
          difficulty: "medium",
          why: [null, "x = 1 is extraneous: √1 = 1, but 1 − 2 = −1. Only 5 works.", "Check x = 1: the left side is 1 and the right side is −1. It doesn't work.", "Check x = −5: √(−11) isn't a real number."],
        },
        {
          q: "Solve for x: √(x - 2) = 4",
          choices: ["18", "14", "16", "2"],
          answer: 0,
          explain: "Square both sides: x - 2 = 16, so x = 18. Check: √(18-2) = √16 = 4, which matches — valid, not extraneous.",
          difficulty: "easy",
          why: [null, "14 subtracts 2 instead of adding it: x − 2 = 16 gives x = 18.", "16 is x − 2. Add 2 to get x = 18.", "2 is 4 − 2. Square both sides first: x − 2 = 16."],
        },
        {
          q: "Solve for x: 3√(x + 1) = 12",
          choices: ["15", "3", "35", "11"],
          answer: 0,
          explain:
            "Before squaring, isolate the radical completely — divide both sides by 3 first: √(x+1) = 4. Squaring both sides: x + 1 = 16, so x = 15. Checking in the original equation: 3√(15+1) = 3(4) = 12, which matches.",
          difficulty: "medium",
          why: [null, "3 is 4 − 1, skipping the squaring step. √(x + 1) = 4 means x + 1 = 16.", "Check x = 35: 3√36 = 18, not 12.", "11 is 12 − 1. Divide by 3 and square first: x + 1 = 16."],
        },
        {
          q: "Solve for x: (x² + 2x)/(x - 1) = 3/(x - 1)",
          choices: ["1", "-3 or 1", "3", "-3"],
          answer: 3,
          explain:
            "Both sides share the denominator x - 1, so multiply both sides by it: x² + 2x = 3. Rearranging: x² + 2x - 3 = 0, which factors to (x + 3)(x - 1) = 0, giving candidates x = -3 and x = 1. But x = 1 makes the denominator x - 1 equal 0, so the original equation isn't defined there and x = 1 is extraneous. Checking x = -3: both sides equal -3/4, so x = -3 is the only solution. 1 and '-3 or 1' both keep the extraneous value, and 3 comes from flipping the signs in the factoring.",
          difficulty: "medium",
          why: ["x = 1 makes x − 1 = 0, so both fractions are undefined there.", "x = 1 is extraneous: it makes the denominator x − 1 equal 0.", "The signs are flipped: (x − 3)(x + 1) = x² − 2x − 3. Check x = 3: 15/2 on the left, 3/2 on the right.", null],
        },
        {
          q: "Solve for x: √(3x + 7) = x - 1",
          choices: ["6", "-1 or 6", "-1", "7"],
          answer: 0,
          explain:
            "Square both sides: 3x + 7 = (x-1)² = x² - 2x + 1. Rearranging into standard form: 0 = x² - 5x - 6, which factors to (x-6)(x+1) = 0, giving x = 6 or x = -1. Checking both: x = 6 gives √25 = 5 and 6-1 = 5, valid; x = -1 gives √4 = 2 but -1-1 = -2, and a square root can never equal a negative number, so it fails.",
          difficulty: "hard",
          why: [null, "x = −1 is extraneous: √4 = 2, but −1 − 1 = −2.", "Check x = −1: the left side is 2 and the right side is −2. It doesn't work.", "Check x = 7: √28 isn't 6."],
        },
        {
          q: "3/(x + c) + 2 = (x + 7)/(x + c)\n\nIn the given equation, c is a constant and c < 4. Which expression represents the solution to the equation?",
          choices: ["4 - c", "4 + 2c", "4 - 2c", "(4 - 2c)/3"],
          answer: 2,
          explain:
            "Multiply every term by the common denominator x + c, including the plain 2: 3 + 2(x + c) = x + 7. Distribute: 3 + 2x + 2c = x + 7. Subtract x and 3 from both sides: x + 2c = 4, so x = 4 - 2c. The only value to rule out is one that makes x + c = 0; here x + c = 4 - c, which is never 0 because c < 4, so 4 - 2c is a valid solution. 4 - c distributes the 2 to only the x (2x + c instead of 2x + 2c), 4 + 2c moves 2c across without changing its sign, and (4 - 2c)/3 adds x to the left side instead of subtracting it.",
          difficulty: "hard",
          why: ["2(x + c) is 2x + 2c, not 2x + c. That slip gives 4 − c.", "A sign slip: subtracting 2c from both sides gives x = 4 − 2c.", null, "Subtract x from both sides, don't add it: 2x − x = x, so x = 4 − 2c."],
        },
      ],
      traps: [
        "Skipping the final check, and reporting a solution that actually fails when substituted back into the original (unsquared) equation.",
        "Forgetting that squaring both sides can turn a valid equation into one with extra, invalid solutions — this check is not optional busywork.",
        "Multiplying only the fractions by the common denominator and skipping a plain constant — in x/(x - 5) = 5/(x - 5) + 2, the 2 must become 2(x - 5).",
        "Keeping a value that makes a denominator equal zero — the original equation isn't defined there, so it must be thrown out even though it solves the cleared equation.",
      ],
    },
    {
      name: "Solving a Linear-Quadratic System by Substitution",
      desmosCalculator: "graphing",
      desmosTrick:
        "Step 1: Type the linear equation into the first line and the quadratic equation into the second line, exactly as given — Desmos accepts input like y = x^2 + 3x - 4 directly. Desmos graphs a line and a parabola. Step 2: Every point where they cross is a solution to the system, so click each crossing point to read off its exact coordinates. Step 3: If the line touches the parabola at exactly one point, there's one solution; if it never touches, there are none. This replaces the whole substitute-and-solve process with reading a picture.",
      explanation:
        "Some systems pair one linear equation with one nonlinear (usually quadratic) equation. Elimination doesn't really work here the way it does for two linear equations; the reliable method is substitution. Solve the linear equation for one variable, then substitute that expression into the nonlinear equation. This gives you a single-variable equation (often quadratic) to solve. Watch for two valid solutions: a line can cross a parabola at up to two points. Don't stop after finding just one, unless something in the question rules the other out.",
      examples: [
        {
          q: "Solve the system: y = x + 1, y = x² - 5. What is the value of x, given x > 0?",
          choices: ["3", "-2", "3 or -2", "1"],
          answer: 0,
          explain:
            "Substitute the linear expression for y into the quadratic equation: x + 1 = x² - 5. Rearranging: 0 = x² - x - 6, which factors to (x-3)(x+2) = 0, giving x = 3 or x = -2. Applying the constraint x > 0 keeps x = 3 and rejects x = -2.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [{ label: "x = -2", accepted: false }, { label: "x = 3", accepted: true }] },
          difficulty: "easy",
          why: [null, "x = −2 is a solution to the system, but the question requires x > 0.", "The condition x > 0 rules out −2, leaving only 3.", "Check x = 1: y = 1 + 1 = 2, but 1² − 5 = −4. The equations don't match."],
        },
        {
          q: "Solve the system: y = 2x, y = x² - 3x. What are the possible values of x?",
          choices: ["x = 0 or x = 5", "x = 5 only", "x = 0 only", "x = -5 or x = 0"],
          answer: 0,
          explain: "Substitute y = 2x into the second equation: 2x = x² - 3x. Rearranging: 0 = x² - 5x, which factors to x(x-5) = 0, giving x = 0 or x = 5.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [{ label: "x = 0", accepted: true }, { label: "x = 5", accepted: true }] },
          difficulty: "easy",
          why: [null, "Dividing by x throws away x = 0. Factor instead: x(x − 5) = 0.", "x − 5 = 0 also works, so x = 5 is a second solution.", "x − 5 = 0 gives x = +5, not −5."],
        },
        {
          q: "Solve the system: y = 4x, y = x² - 12. What is the value of x, given x > 0?",
          choices: ["6", "-2", "6 or -2", "4"],
          answer: 0,
          explain:
            "Substitute 4x for y: 4x = x² - 12. Rearranging: 0 = x² - 4x - 12, which factors to (x-6)(x+2) = 0, giving x = 6 or x = -2. Applying the constraint x > 0 keeps x = 6.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [{ label: "x = -2", accepted: false }, { label: "x = 6", accepted: true }] },
          difficulty: "medium",
          why: [null, "x = −2 is a solution, but the question requires x > 0.", "The condition x > 0 rules out −2, leaving only 6.", "Check x = 4: 4(4) = 16, but 16 − 12 = 4. The equations don't match."],
        },
        {
          q: "Solve the system: x + y = 10, y = x² - 4x + 6. What is the value of x, given x < 3?",
          choices: ["-1", "4", "-1 or 4", "3"],
          answer: 0,
          explain:
            "Solve the linear equation for y: y = 10 - x. Substituting into the quadratic equation: 10 - x = x² - 4x + 6. Rearranging: 0 = x² - 3x - 4, which factors to (x-4)(x+1) = 0, giving x = 4 or x = -1. Applying the constraint x < 3 rejects x = 4 and keeps x = -1.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [{ label: "x = 4", accepted: false }, { label: "x = -1", accepted: true }] },
          difficulty: "medium",
          why: [null, "4 is a solution, but the question requires x < 3.", "The condition x < 3 rules out 4, leaving only −1.", "Check x = 3: y = 10 − 3 = 7, but 9 − 12 + 6 = 3. The equations don't match."],
        },
        {
          q: "Does the system y = x + 8, y = x² + 2x + 10 have any real solutions?",
          choices: ["No real solutions", "One real solution", "Two real solutions", "Cannot be determined without graphing"],
          answer: 0,
          explain:
            "Substitute the linear expression into the quadratic equation: x + 8 = x² + 2x + 10. Rearranging into standard form: 0 = x² + x + 2. Rather than forcing a factoring attempt, check the discriminant: 1² - 4(1)(2) = -7, which is negative, meaning the line and the parabola never intersect.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [], noSolutions: true },
          difficulty: "hard",
          why: [null, "One solution needs a discriminant of 0. x² + x + 2 has 1 − 8 = −7.", "Two solutions need a positive discriminant. Here it's −7.", "No graph needed: the discriminant of x² + x + 2 is −7, so they never meet."],
        },
      ],
      traps: [
        "Attempting to use elimination on a linear-quadratic system, which generally doesn't work the way it does for two linear equations.",
        "Forgetting that a linear-quadratic system can have two valid solutions (two intersection points), not just one — stopping after finding only one.",
        "Substituting into the wrong equation, or losing track of which expression represents which variable after rearranging.",
      ],
    },
    {
      name: "Finding an Unknown Constant from a Given Point or Root, Then Evaluating",
      explanation:
        "Some questions give a function with an unknown constant, tell you a point its graph passes through (or one value it takes), and ask you to first solve for that constant, then use it to evaluate the function somewhere else or find an input. The function might be a factored polynomial, an exponential like f(x) = a(b)^x or f(x) = a^x + b, or a real-world model like h(t) = -16t² + c. The method has two stages: substitute the given point into the function to solve for the unknown constant, then substitute that constant back in (along with the NEW input or output you're asked about) to get the final answer. Translate the wording carefully: 'passes through (p, q)' means f(p) = q, and a y-intercept or an 'initial' value is the output at x = 0 (or t = 0). Since any positive base to the power 0 is 1, a(b)^0 = a, but a^0 + b = 1 + b, not b. When the unknown is an exponential's base, undo the power with a root: b² = 9 means b = 3 when b is positive. Don't stop after finding the constant if the question asks for more.",
      examples: [
        {
          q: "The function f is defined by f(x) = (x - 3)(x - k), where k is a constant. The graph of y = f(x) passes through the point (5, 0). What is f(0)?",
          choices: ["15", "-15", "8", "2"],
          answer: 0,
          explain:
            "'Passes through (5, 0)' means f(5) = 0. Substitute x = 5: (5-3)(5-k) = 2(5-k) = 0, so k = 5. Evaluate f(0) using k = 5: f(0) = (0-3)(0-5) = (-3)(-5) = 15.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["3", "5"] },
          difficulty: "easy",
          why: [null, "A sign slip: (−3)(−5) is +15.", "8 adds 3 and 5. f(0) multiplies: (0 − 3)(0 − 5) = 15.", "2 is 5 − 3, the first factor at x = 5. f(0) = (−3)(−5) = 15."],
        },
        {
          q: "The function g is defined by g(x) = (x + 2)(x - k). The graph of y = g(x) passes through (6, 0). What is g(0)?",
          choices: ["-12", "12", "8", "-8"],
          answer: 0,
          explain:
            "'Passes through (6, 0)' means g(6) = 0. Substitute x = 6: (6+2)(6-k) = 8(6-k) = 0, so k = 6. Evaluate g(0) using k = 6: g(0) = (0+2)(0-6) = 2(-6) = -12.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-2", "6"] },
          difficulty: "easy",
          why: [null, "A sign slip: (2)(−6) is −12.", "8 is the first factor at x = 6. g(0) = (2)(−6) = −12.", "g(0) = (0 + 2)(0 − 6) = −12, not −8."],
        },
        {
          q: "The function g is defined by g(x) = (x + 14)(t - x), where t is a constant. The graph of y = g(x) passes through the point (24, 0). What is g(0)?",
          choices: ["336", "-336", "38", "560"],
          answer: 0,
          explain:
            "'(24, 0)' means g(24) = 0. Substitute x = 24: (24+14)(t-24) = 38(t-24) = 0; since 38 ≠ 0, t = 24. Substitute x = 0 and t = 24 into g(x) = (x+14)(t-x): g(0) = (0+14)(24-0) = 14 × 24 = 336.",
          diagram: { kind: "parabolaGraph", opensUp: false, rootLabels: ["-14", "24"] },
          difficulty: "medium",
          why: [null, "A sign slip: (14)(24) is +336.", "38 is 24 + 14. g(0) multiplies: 14 × 24 = 336.", "g(0) = (0 + 14)(24 − 0) = 14 × 24 = 336, not 560."],
        },
        {
          q: "The function h is defined by h(x) = (x - 4)(x + k). If h(2) = -6, what is the value of k?",
          choices: ["1", "3", "-1", "-3"],
          answer: 0,
          explain:
            "Unlike a root (where the output is 0), here the given point tells us h(2) = -6, a nonzero value — the same substitution method still applies, just without one factor automatically equaling zero. Substitute x = 2: (2-4)(2+k) = -2(2+k) = -6. Dividing both sides by -2: 2 + k = 3, so k = 1.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-1", "4"] },
          difficulty: "medium",
          why: [null, "3 is the value of 2 + k. Subtract 2 to get k = 1.", "Check k = −1: (2 − 4)(2 − 1) = −2, not −6.", "Check k = −3: (−2)(−1) = 2, not −6."],
        },
        {
          q: "The function f is defined by f(x) = 5(b)^x, where b is a positive constant. If f(2) = 45, what is the value of f(3)?",
          choices: ["3", "135", "3,375", "3,645"],
          answer: 1,
          explain:
            "Substitute the given value: f(2) = 5(b)² = 45, so b² = 9, and since b is positive, b = 3. Now evaluate at the new input: f(3) = 5(3)³ = 5 × 27 = 135. 3 stops at the constant b, 3,375 multiplies 5 by 3 before cubing (15³), and 3,645 skips the square root and uses b = 9.",
          difficulty: "medium",
          why: ["3 is b. The question asks for f(3) = 5(3)³ = 135.", null, "That's 15³. The exponent applies only to b: 5 × 3³ = 5 × 27 = 135.", "That uses b = 9. b² = 9 means b = 3, so f(3) = 5 × 27 = 135."],
        },
        {
          q: "The function p is defined by p(x) = (x + 6)(x - m), where m is a constant. The graph of y = p(x) passes through (10, 0). What is p(-2)?",
          choices: ["-48", "48", "-32", "64"],
          answer: 0,
          explain:
            "'(10, 0)' means p(10) = 0. Substitute x = 10: (10+6)(10-m) = 16(10-m) = 0; since 16 ≠ 0, m = 10. Substitute x = -2 and m = 10 into p(x) = (x+6)(x-m): p(-2) = (-2+6)(-2-10) = (4)(-12) = -48.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-6", "10"] },
          difficulty: "hard",
          why: [null, "A sign slip: (4)(−12) is −48.", "With m = 10, p(−2) = (−2 + 6)(−2 − 10) = (4)(−12) = −48, not −32.", "64 multiplies 16 by 4. Plug in x = −2: (4)(−12) = −48."],
        },
        {
          q: "The function f is defined by f(x) = a^x + b, where a and b are constants and a > 0. The graph of y = f(x) in the xy-plane passes through the points (0, -3) and (2, 5). What is the value of a + b?",
          choices: ["-7", "5", "2√2 - 3", "-1"],
          answer: 3,
          explain:
            "Use the y-intercept first: f(0) = a^0 + b = 1 + b = -3, so b = -4 (not -3, because a^0 is 1, not 0). Then use the second point: f(2) = a² - 4 = 5, so a² = 9, and since a > 0, a = 3. So a + b = 3 + (-4) = -1. -7 uses a = -3, which the condition a > 0 rules out; 5 adds a² instead of a; and 2√2 - 3 comes from assuming the y-intercept is b, which gives b = -3 and a² = 8.",
          difficulty: "hard",
          why: ["That uses a = −3, but the question says a > 0.", "That's a² + b = 5, which is f(2). a + b uses a = 3, not a² = 9.", "This treats the y-intercept as b. But f(0) = a^0 + b = 1 + b, so b = −4.", null],
        },
      ],
      traps: [
        "Stopping after solving for the unknown constant, without completing the second step the question actually asks for.",
        "Substituting the given point's coordinates into the wrong position (input vs. output) when solving for the constant.",
        "Forgetting that 'the graph passes through (a, 0)' means the function's value at x = a is 0 — the point's x-coordinate is not itself the constant being solved for.",
        "Assuming the y-intercept of f(x) = a^x + b is just b — at x = 0, a^0 = 1, so the y-intercept is 1 + b.",
        "Mishandling the exponent — multiplying the coefficient into the base before applying the power (5(3)³ is 5 × 27, not 15³), or stopping at b² = 9 or t² = 16 without taking the square root.",
      ],
    },
  ],
  tipsAndTricks: [
    "If a question only asks 'how many real solutions' rather than asking for the solutions themselves, compute the discriminant (b²-4ac) directly rather than fully solving — it's much faster.",
    "Always substitute your final answer back into the ORIGINAL equation (before squaring) when solving radical equations — this is the only reliable way to catch extraneous solutions.",
    "For quadratics that don't factor neatly, don't force factoring — switch directly to the quadratic formula rather than spending time guessing factor pairs that don't exist.",
  ],
};

const LC_M_NONLINEAR_FUNC: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Reading Vertex Form Directly",
      explanation:
        "A quadratic written in vertex form, f(x) = a(x-h)² + k, reveals its vertex (h, k) with zero calculation — one of the fastest free points on the whole test, if you recognize the form. The one common error: a sign mix-up. Since the form has (x - h), a function written as (x + 3)² actually means h = -3, not h = 3. Vertex form also works in reverse, to build a model: when a problem gives the maximum or minimum point (h, k) and one other point, such as the time an object hits the ground (height 0), write y = a(x - h)² + k, plug in the other point to solve for a, and then evaluate at whatever input the question asks about.",
      examples: [
        {
          q: "The vertex of f(x) = (x - 2)² + 5 is which of the following points?",
          choices: ["(2, 5)", "(-2, 5)", "(2, -5)", "(-2, -5)"],
          answer: 0,
          explain:
            "A quadratic in vertex form a(x-h)² + k has vertex (h, k) with no calculation needed. Here the function subtracts 2 inside the parentheses, so h = 2, and it adds 5, so k = 5, giving vertex (2, 5). (-2, 5) comes from flipping the sign on h and mistakenly treating (x-2) as meaning h = -2; (2, -5) flips the sign on k instead; (-2, -5) flips both.",
          diagram: { kind: "parabolaGraph", opensUp: true, vertexLabel: "(2, 5)" },
          difficulty: "easy",
          why: [null, "(x − 2) means h = +2. The sign inside the parentheses is the opposite of h's sign.", "+ 5 outside means k = +5. The y-value keeps its sign.", "Both signs are flipped. (x − 2)² + 5 has its vertex at (2, 5)."],
        },
        {
          q: "The vertex of f(x) = -2(x + 3)² - 1 is which of the following points?",
          choices: ["(-3, -1)", "(3, -1)", "(-3, 1)", "(3, 1)"],
          answer: 0,
          explain:
            "Matching to a(x-h)² + k, the function has (x+3), which means x - (-3), so h = -3, not h = 3 — since the template subtracts h, a plus sign inside means h is negative. It also subtracts 1, so k = -1, giving vertex (-3, -1). (3, -1) comes from the common sign error of reading (x+3) as h = 3. (-3, 1) and (3, 1) additionally flip the sign of k. The negative leading coefficient (-2) doesn't affect how h and k are read; it just makes this vertex a maximum instead of a minimum.",
          diagram: { kind: "parabolaGraph", opensUp: false, vertexLabel: "(-3, -1)" },
          difficulty: "medium",
          why: [null, "(x + 3) means x − (−3), so h = −3, not 3.", "− 1 outside means k = −1. The y-value keeps its sign.", "Both signs are flipped. The vertex is (−3, −1)."],
        },
        {
          q: "The vertex of f(x) = (x - 7)² + 2 is which of the following points?",
          choices: ["(7, 2)", "(-7, 2)", "(7, -2)", "(-7, -2)"],
          answer: 0,
          explain:
            "Since the function has (x - 7), h = 7, and since it adds 2, k = 2, giving vertex (7, 2) read directly from vertex form. The other choices all come from flipping the sign of h, k, or both.",
          diagram: { kind: "parabolaGraph", opensUp: true, vertexLabel: "(7, 2)" },
          difficulty: "easy",
          why: [null, "(x − 7) means h = +7.", "+ 2 outside means k = +2.", "Both signs are flipped. The vertex is (7, 2)."],
        },
        {
          q: "The vertex of f(x) = 3(x + 4)² is which of the following points?",
          choices: ["(-4, 0)", "(4, 0)", "(-4, 3)", "(0, -4)"],
          answer: 0,
          explain:
            "The function has (x+4), meaning x - (-4), so h = -4. There's no constant added or subtracted after the squared term, which means k = 0, not that k is missing entirely — the vertex's y-coordinate is exactly 0, giving vertex (-4, 0). (4, 0) comes from misreading the sign on h. (-4, 3) comes from mistakenly using the leading coefficient 3 as k. (0, -4) swaps the coordinates.",
          diagram: { kind: "parabolaGraph", opensUp: true, vertexLabel: "(-4, 0)" },
          difficulty: "medium",
          why: [null, "(x + 4) means x − (−4), so h = −4.", "3 is the leading coefficient, not k. With nothing added outside, k = 0.", "This swaps the coordinates. The vertex is (h, k) = (−4, 0)."],
        },
        {
          q: "A quadratic is given as y - 4 = -(x - 6)². What is the vertex of this parabola?",
          choices: ["(6, 4)", "(6, -4)", "(-6, 4)", "(-6, -4)"],
          answer: 0,
          explain:
            "This isn't yet written in the standard y = a(x-h)² + k template — isolating y first by adding 4 to both sides gives y = -(x-6)² + 4, so h = 6 and k = 4, giving vertex (6, 4). (6, -4) comes from skipping the rearranging step and keeping the original equation's subtracted 4. (-6, 4) and (-6, -4) come from misreading the sign on h.",
          diagram: { kind: "parabolaGraph", opensUp: false, vertexLabel: "(6, 4)" },
          difficulty: "hard",
          why: [null, "Rearrange first: y = −(x − 6)² + 4. Moving the 4 across makes it +4.", "(x − 6) means h = +6.", "Both are off: h is +6, and after rearranging, k is +4."],
        },
        {
          q: "A ball is thrown from the top of a tower. Its height above the ground, in meters, t seconds after it is thrown is modeled by a quadratic function h. The ball reaches its maximum height of 50 meters at t = 2 and hits the ground at t = 7. According to the model, what is the height of the ball, in meters, at t = 5?",
          choices: ["41", "20", "32", "44"],
          answer: 2,
          explain:
            "The maximum point (2, 50) is the vertex, so start from vertex form: h(t) = a(t - 2)² + 50. The value of a isn't given, so use the other known point: the ball hits the ground at t = 7, meaning h(7) = 0. Then 0 = a(7 - 2)² + 50 = 25a + 50, so a = -2 and h(t) = -2(t - 2)² + 50. Now evaluate: h(5) = -2(3)² + 50 = -18 + 50 = 32. 41 assumes a = -1 instead of solving for it. 20 treats the fall as a straight line from 50 meters to 0 over 5 seconds, but a quadratic model isn't linear. 44 forgets to square: -2(3) + 50.",
          difficulty: "hard",
          why: ["This uses a = −1. Solve for a with h(7) = 0: 25a + 50 = 0, so a = −2.", "A quadratic isn't a straight line. With a = −2, h(5) = −2(9) + 50 = 32.", null, "Square before multiplying: −2(5 − 2)² = −2(9) = −18, so h(5) = 32."],
        },
      ],
      traps: [
        "Misreading the sign inside the parentheses — (x + 3)² corresponds to h = -3, not h = 3, since the template is (x - h).",
        "Forgetting that a negative leading coefficient (a) means the vertex is a maximum, not a minimum, even though h and k are read the same way.",
        "Using a = 1 or a = -1 without solving for it when building vertex form — plug in the one extra known point, like a landing time where the height is 0, to find a first.",
      ],
    },
    {
      name: "Modeling Growth and Decay with Exponential Functions",
      explanation:
        "Word problems describing repeated percentage growth or decay (population growth, compound interest, radioactive decay, depreciation) need an exponential function, not a linear one. (Using a linear model here is a common early mistake.) The base of the exponential directly captures the rate: for growth of r% per period, the base is (1 + r/100); for decay of r% per period, it's (1 - r/100).",
      examples: [
        {
          q: "A car's value decreases by 12% each year from an initial price of $30,000. Which of the following gives the car's value after 2 years?",
          choices: ["30000(0.88)^2", "30000(0.12)^2", "30000 - 2(0.12)(30000)", "30000(1.12)^2"],
          answer: 0,
          explain:
            "This is repeated percentage decay, which needs an exponential model, not a linear one that just subtracts a flat amount each year. Since the value decreases by 12% each year, 88% remains each year, giving a base of 0.88 (not the raw rate 0.12), so 30000(0.88)^2 = 23,232 is correct. 30000(0.12)^2 mistakes the decay rate for the base. 30000 - 2(0.12)(30000) applies the loss linearly, subtracting a flat 12% of the original value each year instead of compounding. 30000(1.12)^2 uses a growth base for a decay scenario.",
          diagram: { kind: "exponentialGraph", growth: false, yInterceptLabel: "$30,000" },
          difficulty: "easy",
          why: [null, "0.12 is the amount lost each year. What remains each year is 88%, so the base is 0.88.", "This subtracts the same $3,600 each year. A 12% loss applies to the current value, so it compounds.", "1.12 is growth. The value is decreasing, so the base is 1 − 0.12 = 0.88."],
        },
        {
          q: "A population of bacteria grows by 8% every hour, starting from 500 bacteria. Which function models the population P after t hours?",
          choices: ["P = 500(1.08)^t", "P = 500(0.08)^t", "P = 500 + 8t", "P = 500(1.8)^t"],
          answer: 0,
          explain:
            "This is repeated percentage growth, which needs an exponential model. Growth of 8% per hour means the base is 1 + 0.08 = 1.08, not the raw rate 0.08 itself, so P = 500(1.08)^t is correct. P = 500(0.08)^t mistakes the growth rate for the base. P = 500 + 8t models the growth linearly, adding a flat amount each hour instead of compounding. P = 500(1.8)^t confuses 8% with 80%.",
          diagram: { kind: "exponentialGraph", growth: true, yInterceptLabel: "500" },
          difficulty: "medium",
          why: [null, "0.08 is the growth rate. Each hour the population is 108% of before, so the base is 1.08.", "Adding 8 each hour is linear. Growing by 8% compounds, so it's exponential.", "1.8 means 80% growth. 8% growth is 1.08."],
        },
        {
          q: "A population of 800 fish decreases by 5% each year. Which function models the population P after t years?",
          choices: ["P = 800(0.95)^t", "P = 800(0.05)^t", "P = 800 - 40t", "P = 800(1.05)^t"],
          answer: 0,
          explain:
            "A 5% decrease means 95% remains each year, giving a base of 0.95, so P = 800(0.95)^t is correct. P = 800(0.05)^t mistakes the decay rate for the base. P = 800 - 40t models the loss linearly (a flat 5% of the original 800 subtracted each year) rather than compounding. P = 800(1.05)^t uses a growth base for a decay scenario.",
          diagram: { kind: "exponentialGraph", growth: false, yInterceptLabel: "800" },
          difficulty: "easy",
          why: [null, "0.05 is the amount lost. What remains each year is 95%, so the base is 0.95.", "Subtracting 40 each year is linear. A 5% loss applies to the current population, so it compounds.", "1.05 is growth. The population is decreasing, so the base is 0.95."],
        },
        {
          q: "An investment of $2,000 earns 8% annual interest, compounded quarterly. Which function models the value V after t years?",
          choices: ["V = 2000(1.02)^(4t)", "V = 2000(1.08)^(4t)", "V = 2000(1.02)^t", "V = 2000(1.08)^t"],
          answer: 0,
          explain:
            "Because 8% is an annual rate but interest compounds quarterly, the rate per period is 0.08/4 = 0.02, not 0.08, and since there are 4 compounding periods per year, the exponent must count total quarters over t years, giving 4t — so V = 2000(1.02)^(4t) is correct. V = 2000(1.08)^(4t) uses the annual rate instead of dividing it by 4. V = 2000(1.02)^t correctly adjusts the rate but forgets to adjust the exponent for the number of periods. V = 2000(1.08)^t makes both mistakes at once.",
          diagram: { kind: "exponentialGraph", growth: true, yInterceptLabel: "$2,000" },
          difficulty: "medium",
          why: [null, "The rate per quarter is 8% ÷ 4 = 2%, so the base is 1.02, not 1.08.", "The rate is right, but there are 4 quarters per year, so the exponent is 4t.", "This uses the annual rate and yearly periods. Quarterly compounding means 1.02 and 4t."],
        },
        {
          q: "A city's population grew from 40,000 to 44,000 over one year, and continues to grow at the same constant percentage rate each year. Which function models the population P after t years?",
          choices: ["P = 40000(1.1)^t", "P = 40000(0.1)^t", "P = 40000(1.4)^t", "P = 44000(1.1)^t"],
          answer: 0,
          explain:
            "Since no percentage is stated directly, the growth multiplier is found by dividing the new value by the original: 44000/40000 = 1.1, and that multiplier IS the base of the exponential function directly, giving P = 40000(1.1)^t. P = 40000(0.1)^t mistakes the multiplier for a rate that still needs 1 added to it. P = 40000(1.4)^t misreads the 4,000-person increase as 40% rather than computing the actual ratio. P = 44000(1.1)^t incorrectly uses the later population as the starting value instead of the original 40,000.",
          diagram: { kind: "exponentialGraph", growth: true, yInterceptLabel: "40,000" },
          difficulty: "hard",
          why: [null, "The multiplier is 44,000 ÷ 40,000 = 1.1. Using 0.1 would shrink the population.", "4,000 out of 40,000 is 10%, not 40%. The base is 1.1.", "The starting value is 40,000, the population before the year of growth."],
        },
      ],
      traps: [
        "Modeling percentage-based growth or decay with a linear function (subtracting a flat amount each year) instead of an exponential one.",
        "Using the percentage rate itself (like 0.12) as the base, instead of correctly computing (1 - rate) for decay or (1 + rate) for growth.",
      ],
    },
    {
      name: "Initial Value and Growth Factor in Any Exponential Form",
      explanation:
        "In an exponential function written f(x) = a(b)^x, the coefficient a is the initial value, f(0), which is also the y-intercept of the graph, and the base b is the growth or decay factor: the number the output is multiplied by each time x goes up by 1. Questions ask what a number in a model means in context, which equation matches a table, or which of several equivalent forms shows a particular value. From a table, read a from the x = 0 row and find b by dividing an output by the one before it; if x jumps by 2 between rows, that ratio is b², so take its square root. When the exponent is shifted, as in f(x) = 40(3)^(x-2), the coefficient is the output where the exponent equals 0, so 40 is f(2), not f(0); since 3^(x-2) is 3^x divided by 9, the same function is f(x) = (40/9)(3)^x, which shows f(0) = 40/9. Wrong answers usually treat any coefficient as the starting value, mix up a and b, or read a factor like 0.85 as an 85% decrease instead of a 15% one.",
      examples: [
        {
          q: "A library launched an e-book app, and the number of e-books borrowed through the app in month m after the launch is modeled by L(m) = 250(1.15)^m. What is the best interpretation of 250 in this context?",
          choices: ["Each month, 250 more e-books are borrowed than in the month before.", "The percent by which borrowing increases each month", "The estimated number of e-books borrowed in the month the app launched", "The estimated number of e-books borrowed 1 month after the launch"],
          answer: 2,
          explain:
            "In a(b)^m, the coefficient a is the value when m = 0: L(0) = 250(1.15)^0 = 250(1) = 250, so 250 is the estimated number of e-books borrowed in the launch month. A fixed 250 more each month would be a linear model; this one multiplies by 1.15 each month instead of adding. The percent increase lives in the base: 1.15 means borrowing grows by 15% a month, and 250 isn't a percent at all. One month after the launch is L(1) = 250(1.15) = 287.5, so 250 is the value a month before that.",
          difficulty: "easy",
          why: ["Adding 250 each month would be linear. Here the count is multiplied by 1.15 each month.", "The monthly percent increase comes from the base: 1.15 means 15% per month.", null, "One month after launch is L(1) = 250(1.15) = 287.5. 250 is the value at m = 0."],
        },
        {
          q: "The table shows four values of the exponential function f. Which equation defines f?",
          choices: ["f(x) = 320(4)^x", "f(x) = (1/4)(320)^x", "f(x) = 80(1/4)^x", "f(x) = 320(1/4)^x"],
          answer: 3,
          explain:
            "Read a from the x = 0 row: f(0) = 320. Find b by dividing each output by the one before it: 80/320 = 1/4, 20/80 = 1/4, and 5/20 = 1/4, so every step multiplies by 1/4 and f(x) = 320(1/4)^x. A base of 4 flips the ratio: it would make the output grow to 1,280 at x = 1 instead of shrinking to 80. Putting 1/4 in front and 320 as the base swaps the two roles, giving f(0) = 1/4. Starting at 80 uses the x = 1 row as the initial value, so f(0) would be 80, not 320.",
          figure: {"kind": "table", "header": ["x", "f(x)"], "rows": [[0, 320], [1, 80], [2, 20], [3, 5]]},
          difficulty: "easy",
          why: ["A base of 4 would make f(1) = 1,280. The outputs shrink: 80/320 = 1/4, so the base is 1/4.", "This swaps the parts. The coefficient is f(0) = 320, and the base is the ratio, 1/4.", "80 is f(1). The coefficient is the value at x = 0, which is 320.", null],
        },
        {
          q: "The table shows values of the exponential function g for four values of x. Which equation defines g?",
          choices: ["g(x) = 5(4)^x", "g(x) = 5(2)^x", "g(x) = 4(5)^x", "g(x) = 5 + 7.5x"],
          answer: 1,
          explain:
            "g(0) = 5, so a = 5. The outputs are multiplied by 4 from row to row (20/5 = 4 and 80/20 = 4), but x goes up by 2 between rows, not 1. That means b² = 4, so b = 2 and g(x) = 5(2)^x; check it: g(4) = 5(2)^4 = 80. Using 4 as the base treats each row as a single step of x, which gives g(2) = 5(4)^2 = 80 instead of 20. Putting 4 in front swaps the coefficient and the base, so it doesn't even give g(0) = 5. The linear rule 5 + 7.5x matches the first two rows but gives g(4) = 35, not 80, because the outputs don't rise by a constant amount.",
          figure: {"kind": "table", "header": ["x", "g(x)"], "rows": [[0, 5], [2, 20], [4, 80], [6, 320]]},
          difficulty: "medium",
          why: ["x goes up by 2 between rows, so 4 is the factor for 2 steps. For one step, b = √4 = 2.", null, "The coefficient must be g(0) = 5. This form gives g(0) = 4.", "Check it: 5 + 7.5(4) = 35, not 80. The outputs multiply, so g is exponential."],
        },
        {
          q: "The function f is defined by f(x) = 18(3)^(x-2). Which of the following is an equivalent form of f that displays the value of f(0) as the coefficient?",
          choices: ["f(x) = 2(3)^x", "f(x) = 18(3)^x", "f(x) = 162(3)^x", "f(x) = 6(3)^(x-1)"],
          answer: 0,
          explain:
            "The coefficient of a form like a(b)^(x-k) is the output where the exponent is 0, which for the given form is at x = 2: f(2) = 18(3)^0 = 18. To show f(0), split off the shift: 3^(x-2) is 3^x divided by 3², so f(x) = (18/9)(3)^x = 2(3)^x, and f(0) = 2. Dropping the shift to get 18(3)^x changes the function: its value at 0 is 18, but f(0) = 18(3)^(-2) = 2. Multiplying by 9 instead of dividing gives 162(3)^x, which is 81 times too big. 6(3)^(x-1) is equivalent to f, but its exponent is 0 at x = 1, so its coefficient is f(1) = 6, not f(0).",
          difficulty: "medium",
          why: [null, "Dropping the − 2 changes the function. 18 is f(2); f(0) = 18/9 = 2.", "3^(x − 2) is 3^x divided by 9, not multiplied by 9. f(0) = 18/9 = 2.", "This form is equivalent, but its exponent is 0 at x = 1, so 6 is f(1). f(0) is 2."],
        },
        {
          q: "The function g is defined by g(x) = 80(0.8)^(x-1). Which of the following equivalent forms of g displays the y-intercept of the graph of y = g(x) as a coefficient?\nI. g(x) = 125(0.8)^(x+1)\nII. g(x) = 100(1.25)^(-x)",
          choices: ["I only", "II only", "I and II", "Neither I nor II"],
          answer: 1,
          explain:
            "First find the y-intercept: g(0) = 80(0.8)^(-1) = 80/0.8 = 100. In form I, the coefficient 125 is the output where the exponent x + 1 equals 0, which is at x = -1, so 125 is g(-1), not the y-intercept (at x = 0, form I gives 125(0.8) = 100, which isn't displayed). In form II, the exponent -x is 0 exactly when x = 0, so the coefficient 100 is g(0). Form II may look like a different function because its base is 1.25, but (1.25)^(-x) = (1/1.25)^x = (0.8)^x, so it's the same decay. Choosing I only, or I and II, treats 125 as the starting value; choosing Neither misses that a base of 1.25 with exponent -x is still decay by a factor of 0.8.",
          difficulty: "hard",
          why: ["In form I the exponent is 0 at x = −1, so 125 is g(−1). The y-intercept is g(0) = 100.", null, "Form I's coefficient, 125, is g(−1), not g(0) = 100. Only form II shows 100.", "Form II works: (1.25)^(−x) = (0.8)^x, and its exponent is 0 at x = 0, so 100 is g(0)."],
        },
      ],
      traps: [
        "Assuming the coefficient in front is always f(0). That's only true for the plain form a(b)^x: in 40(3)^(x-2), the 40 is f(2), the value where the exponent is 0, and in a(b)^x + c, the y-intercept is a + c.",
        "Mixing up the two parts: calling the base b the starting amount, or the coefficient a the factor the output is multiplied by each step.",
        "Misreading a table: subtracting outputs instead of dividing them, using the ratio across an x-jump of 2 as the factor for a single step, or taking the first row as f(0) when that row isn't x = 0.",
        "Reading the factor as the percent change itself: 0.85 means each value is 85% of the one before (a 15% decrease), not an 85% decrease, and 1.15 means a 15% increase, not 115%.",
      ],
    },
    {
      name: "Exponential Models with a Time Period in the Exponent",
      explanation:
        "Some exponential models put the time period inside the exponent, like P(t) = 500(2)^(t/6): the t/6 counts how many 6-year periods have passed, so the quantity is multiplied by the base once every 6 years (here, it doubles every 6 years). Decay reads the same way: A(t) = 80(1/2)^(t/12) halves every 12 units, so its half-life is 12. To write a model from 'doubles every k years, starting at A,' use A(2)^(t/k); to work backward from a later value, count the full periods that passed and divide by 2 once for each, which is 2^n in total, not 2n. To find the percent change for a single unit, use the exponent rule b^(x/k) = (b^(1/k))^x, so a(1.21)^(x/2) = a(1.1)^x, a 10% increase per unit, and watch the units: an exponent of m/12 with m in months means one full factor of b per year. Wrong answers usually multiply t by the period instead of dividing, swap the base and the period, split a percent evenly (21% ÷ 2 = 10.5%) instead of taking a root, or mix up months and years.",
      examples: [
        {
          q: "The number of bees in a hive t weeks after a colony is introduced is modeled by N(t) = 3200(2)^(t/4). According to the model, how many weeks does it take for the number of bees to double?",
          choices: ["1/4", "2", "4", "8"],
          answer: 2,
          explain:
            "The exponent t/4 counts how many 4-week periods have passed, and each period multiplies the count by the base, 2. So the bee count doubles every 4 weeks: N(4) = 3200(2)^1 = 6400, twice the starting 3,200. 1/4 is the fraction of a doubling that happens each week, not the doubling time; the count doubles when t/4 = 1, not when t = 1/4. 2 is the base, which says the count doubles, not how long that takes. 8 weeks is two periods: after 8 weeks the count has doubled twice, to 12,800.",
          difficulty: "easy",
          why: ["The count doubles when t/4 = 1, so t = 4, not 1/4.", "2 is the base: it tells you the count doubles. The 4 under t tells you how often.", null, "After 8 weeks, t/4 = 2, so the count has doubled twice, to 12,800."],
        },
        {
          q: "An investment of $1,200 doubles in value every 9 years. Which function gives the value V, in dollars, of the investment t years after it was made?",
          choices: ["V = 1200(2)^(9t)", "V = 1200(9)^(t/2)", "V = 1200 + 1200(t/9)", "V = 1200(2)^(t/9)"],
          answer: 3,
          explain:
            "Start with the initial value, 1,200, and multiply by 2 once per 9-year period. After t years, t/9 periods have passed, so V = 1200(2)^(t/9); check it: at t = 9, V = 1200(2)^1 = 2400. An exponent of 9t would double the value 9 times every year. A base of 9 with an exponent of t/2 swaps the roles, making the value grow ninefold every 2 years. 1200 + 1200(t/9) adds the same $1,200 every 9 years, which matches the first doubling but then falls behind: at t = 18 it gives 3,600 instead of 4,800.",
          difficulty: "easy",
          why: ["9t would double the value 9 times each year. It doubles once every 9 years: t/9.", "This swaps the numbers. The base is 2 (doubling), and 9 is how many years each doubling takes.", "This adds $1,200 every 9 years. Doubling multiplies, so at t = 18 the value is 4,800, not 3,600.", null],
        },
        {
          q: "The population of a town has doubled every 15 years since 1980. In 2025, the town's population was 36,000. Based on this, what was the town's population in 1980?",
          choices: ["12,000", "4,500", "6,000", "288,000"],
          answer: 1,
          explain:
            "From 1980 to 2025 is 45 years, which is 45/15 = 3 doubling periods. So the 2025 population is the 1980 population times 2³ = 8: P(2)³ = 36,000, and P = 36,000/8 = 4,500. Dividing by 3 undoes the number of periods, not the growth, as if the town had tripled once. Dividing by 6 (2 × 3) treats three doublings as a factor of 6, but doubling three times multiplies by 2 × 2 × 2 = 8. 288,000 multiplies by 8 instead of dividing, running the model forward to 2070 instead of back to 1980.",
          difficulty: "medium",
          why: ["Check it: 12,000 doubled three times is 96,000, not 36,000. Three doublings multiply by 2³ = 8.", null, "Doubling three times multiplies by 2 × 2 × 2 = 8, not 2 × 3 = 6.", "This multiplies by 8, which runs forward in time. To go back to 1980, divide: 36,000/8 = 4,500."],
        },
        {
          q: "The number of views of an online video x days after it was posted is modeled by V(x) = 5000(1.44)^(x/2). The model can be rewritten as V(x) = 5000(1 + p/100)^x, where p is a constant. What is the value of p?",
          choices: ["20", "22", "44", "88"],
          answer: 0,
          explain:
            "Use the exponent rule b^(x/2) = (b^(1/2))^x: (1.44)^(x/2) = (√1.44)^x = (1.2)^x. So 1 + p/100 = 1.2, p/100 = 0.2, and p = 20: the views grow 20% per day. 22 splits the 44% two-day increase evenly over the two days, but growth compounds: 1.22 × 1.22 ≈ 1.49, not 1.44. 44 is the percent increase over one full period of 2 days, not over a single day. 88 multiplies the two-day rate by 2, but the daily rate has to be smaller than the two-day rate, not larger.",
          difficulty: "medium",
          why: [null, "Growth compounds, so 44% doesn't split evenly: 1.22 × 1.22 ≈ 1.49. Take √1.44 = 1.2.", "44% is the increase over one 2-day period, not one day. Per day it's √1.44 = 1.2, or 20%.", "The daily rate must be smaller than the 2-day rate, not double it. √1.44 = 1.2 gives 20%."],
        },
        {
          q: "The value, in dollars, of a piece of equipment m months after it was purchased is modeled by V(m) = 18000(0.64)^(m/24). According to the model, by what percent does the equipment's value decrease each year?",
          choices: ["1.5%", "18%", "20%", "36%"],
          answer: 2,
          explain:
            "One year is 12 months, so each year the exponent m/24 goes up by 12/24 = 1/2, and the value is multiplied by (0.64)^(1/2) = √0.64 = 0.8. Keeping 80% of the value means losing 20% a year. 36% is the decrease over 24 months, one full period of the model, which is 2 years, not 1. 18% splits that 36% evenly over the 2 years, but decreases compound: 0.82 × 0.82 ≈ 0.67, not 0.64. 1.5% spreads the 36% evenly over 24 months, which is both the wrong unit (a month, not a year) and an even split of a compounding change.",
          difficulty: "hard",
          why: ["36% ÷ 24 spreads the 2-year drop evenly over months. The yearly factor is √0.64 = 0.8, a 20% drop.", "Decreases compound, so 36% doesn't split evenly: 0.82 × 0.82 ≈ 0.67. The yearly factor is √0.64 = 0.8.", null, "36% is the drop over 24 months, which is 2 years. Per year it's √0.64 = 0.8, a 20% drop."],
        },
      ],
      traps: [
        "Misplacing the period: t/6 means one doubling every 6 years, so writing 2^(6t), or ignoring the 6 and treating the change as happening every single year, gets the timing wrong.",
        "Swapping the base and the period: in 500(2)^(t/6), the base 2 says what happens (doubling) and the 6 says how often, not the other way around.",
        "Treating repeated multiplication as repeated addition: splitting 21% over 2 years into 10.5% a year instead of taking √1.21 = 1.1, or undoing 3 doublings by dividing by 6 (or 3) instead of by 2³ = 8.",
        "Mixing units: if t is in months but the period is given in years (or hours versus minutes), convert first; doubling every 2 years is t/24 when t counts months.",
      ],
    },
    {
      name: "Telling Linear from Exponential Growth (Table, Graph, or Words)",
      explanation:
        "This pattern asks whether a function is linear or exponential, and increasing or decreasing, and the function can come as a table, a graph, or a description in words. In a table, check how the output changes each time the input goes up by the same amount: the same ADDED amount each time means linear, and the same MULTIPLIED factor each time means exponential. Check at least two consecutive differences or ratios before deciding, since one matching pair isn't enough to confirm the pattern. In words, a fixed amount ('increases by 3 each year') is linear, while a fixed percent of the current amount ('increases by 3% each year') is exponential; but 'f(x) is 40% of x' is linear, because it just means f(x) = 0.4x, a percent of x rather than of the previous output. On a graph, a straight line is linear and a curve that bends is exponential; read from left to right to decide increasing or decreasing, and remember that a decreasing exponential flattens out toward a horizontal line as it falls.",
      examples: [
        {
          q: "A table shows x: -1, 0, 1, 2 with f(x): 16, 17, 18, 19. Which best describes f?",
          choices: ["Increasing linear", "Increasing exponential", "Decreasing linear", "Decreasing exponential"],
          answer: 0,
          explain:
            "Checking the differences between consecutive outputs gives 17-16=1, 18-17=1, 19-18=1, a constant added amount, which is the signature of a linear function — and since the outputs are getting larger, it's increasing linear. The exponential options are ruled out because the outputs don't share a constant ratio (17/16 ≠ 18/17), and the decreasing options are ruled out because the values are rising, not falling.",
          difficulty: "easy",
          why: [null, "The outputs go up by the same amount (1) each time, which is linear, not exponential.", "The outputs go up (16, 17, 18, 19), so it's increasing.", "The values are rising, and they change by a constant amount, not a constant ratio."],
        },
        {
          q: "A table shows x: 0, 1, 2, 3 with g(x): 5, 10, 20, 40. Which best describes g?",
          choices: ["Increasing exponential", "Increasing linear", "Decreasing exponential", "Decreasing linear"],
          answer: 0,
          explain:
            "The differences between consecutive outputs (10-5=5, 20-10=10) are not constant, which rules out linear. The ratios, though, are constant: 10/5=2, 20/10=2, 40/20=2 — a constant ratio is the signature of exponential growth, and since the values are rising, it's increasing exponential.",
          difficulty: "easy",
          why: [null, "The differences (5, 10, 20) aren't constant, so it's not linear. The ratio is constant: ×2.", "The values are rising (5, 10, 20, 40), so it's increasing.", "The values are rising and double each time. That's increasing exponential."],
        },
        {
          q: "Which of the following describes a quantity that decreases linearly?",
          choices: ["A car's value falls by 15% each year.", "A water tank loses 15 liters every hour.", "For every value of x, g(x) is 15% of x.", "Each year, a town's population is 85% of what it was the year before."],
          answer: 1,
          explain:
            "Look for a fixed AMOUNT versus a fixed PERCENT of the current amount. Losing 15 liters every hour subtracts the same amount each hour, so the volume falls by a constant difference: decreasing linear. Falling by 15% each year takes 15% of whatever the value is that year, so the yearly drop shrinks as the value shrinks; the value is multiplied by 0.85 each year, which is decreasing exponential. 'g(x) is 15% of x' sounds like a percent change, but it just means g(x) = 0.15x, a straight line with a positive slope: increasing linear, not decreasing. 'Each year is 85% of the year before' is the same multiply-by-0.85 rule as the car, so it's decreasing exponential too.",
          difficulty: "medium",
          why: ["15% of a shrinking value is a smaller amount each year. The value is multiplied by 0.85: exponential.", null, "g(x) = 0.15x is linear, but its slope is positive, so it increases.", "Multiplying by 0.85 each year is exponential decay, not a constant drop."],
        },
        {
          q: "A table shows x: 0, 1, 2, 3 with h(x): 50, 44, 38, 32. Which best describes h?",
          choices: ["Decreasing linear", "Decreasing exponential", "Increasing linear", "Increasing exponential"],
          answer: 0,
          explain:
            "The differences between consecutive outputs are constant (44-50=-6, 38-44=-6, 32-38=-6), which is the signature of linear behavior, not exponential — even though the values are shrinking, that alone doesn't mean decay. Confirming with ratios shows they are NOT constant (44/50 ≈ 0.88, 38/44 ≈ 0.864), ruling out exponential decay. Since the values fall by a constant amount, this is decreasing linear.",
          difficulty: "medium",
          why: [null, "The values drop by the same amount (6) each time. A constant difference is linear.", "The values are falling (50, 44, 38, 32), so it's decreasing.", "The values fall by a constant amount. That's decreasing linear."],
        },
        {
          q: "A table shows x: 0, 1, 2, 3 with k(x): 200, 150, 112.5, 84.375. Which best describes k?",
          choices: ["Decreasing exponential", "Decreasing linear", "Increasing exponential", "Increasing linear"],
          answer: 0,
          explain:
            "The differences between consecutive outputs (150-200=-50, 112.5-150=-37.5) are not constant, ruling out linear. The ratios are constant instead: 150/200=0.75, 112.5/150=0.75 — a constant ratio, even one less than 1, is the signature of exponential decay, so this is decreasing exponential.",
          difficulty: "medium",
          why: [null, "The drops (50, then 37.5) aren't constant, so it's not linear. The ratio is constant: ×0.75.", "The values are falling, so it's decreasing.", "The values fall, and by a constant ratio, not a constant amount."],
        },
        {
          q: "The graph of y = h(x) is shown in the xy-plane, with the points (0, 8), (1, 4), (2, 2), and (3, 1) marked. Which best describes h?",
          choices: ["Increasing linear", "Decreasing linear", "Decreasing exponential", "Increasing exponential"],
          answer: 2,
          explain:
            "The graph is a curve, not a straight line, and the marked points confirm it: each time x increases by 1, y is multiplied by 1/2 (8, 4, 2, 1), while the drops (4, 2, 1) keep shrinking instead of staying constant. Reading from left to right, the graph falls, so h is decreasing exponential. Either linear choice would need a straight line with equal drops. The curve does bend upward and flatten out toward the x-axis as x grows, which can tempt 'increasing,' but its y-values keep getting smaller from left to right, never larger.",
          figure: {"kind": "geometry", "points": {"p0": [0, 8], "p1": [1, 4], "p2": [2, 2], "p3": [3, 1]}, "dots": ["p0", "p1", "p2", "p3"], "paths": [{"points": [[-0.2, 9.1896], [-0.1, 8.5742], [0, 8], [0.1, 7.4643], [0.2, 6.9644], [0.3, 6.498], [0.4, 6.0629], [0.5, 5.6569], [0.6, 5.278], [0.7, 4.9246], [0.8, 4.5948], [0.9, 4.2871], [1, 4], [1.1, 3.7321], [1.2, 3.4822], [1.3, 3.249], [1.4, 3.0314], [1.5, 2.8284], [1.6, 2.639], [1.7, 2.4623], [1.8, 2.2974], [1.9, 2.1435], [2, 2], [2.1, 1.8661], [2.2, 1.7411], [2.3, 1.6245], [2.4, 1.5157], [2.5, 1.4142], [2.6, 1.3195], [2.7, 1.2311], [2.8, 1.1487], [2.9, 1.0718], [3, 1], [3.1, 0.933], [3.2, 0.8706], [3.3, 0.8123], [3.4, 0.7579], [3.5, 0.7071], [3.6, 0.6598], [3.7, 0.6156], [3.8, 0.5743], [3.9, 0.5359], [4, 0.5], [4.1, 0.4665], [4.2, 0.4353], [4.3, 0.4061], [4.4, 0.3789], [4.5, 0.3536], [4.6, 0.3299], [4.7, 0.3078], [4.8, 0.2872], [4.9, 0.2679], [5, 0.25], [5.1, 0.2333], [5.2, 0.2176], [5.3, 0.2031], [5.4, 0.1895], [5.5, 0.1768], [5.6, 0.1649], [5.7, 0.1539], [5.8, 0.1436], [5.9, 0.134], [6, 0.125], [6.1, 0.1166], [6.2, 0.1088], [6.3, 0.1015], [6.4, 0.0947], [6.5, 0.0884], [6.6, 0.0825], [6.7, 0.0769], [6.8, 0.0718], [6.9, 0.067], [7, 0.0625]]}], "axes": {"x": [-1, 7], "y": [-1, 9], "step": 1, "labelEvery": 2}},
          difficulty: "medium",
          why: ["The graph falls from left to right, and it curves rather than following a straight line.", "A line would drop by the same amount each step. The drops here are 4, 2, and 1.", null, "The curve bends upward, but the y-values fall from left to right: 8, 4, 2, 1."],
        },
        {
          q: "A table shows x: 0, 1, 2, 3 with m(x): 3, 6, 12, 20. Based on the first three values (3, 6, 12), a student concludes the function is exponential with a growth factor of 2. Is this conclusion fully supported by the table?",
          choices: [
            "No, because the ratio between the last two values (20/12 ≈ 1.67) doesn't match the ratio of 2 found earlier",
            "Yes, because two consecutive ratios of 2 are enough to confirm an exponential pattern",
            "No, because the differences between all four values are constant, meaning the table is actually linear",
            "Yes, because the values are increasing, which always indicates exponential growth",
          ],
          answer: 0,
          explain:
            "The ratio between the first two pairs (6/3=2, 12/6=2) does look exponential, which is what tempts the quick conclusion, but checking one more pair is essential: 20/12 ≈ 1.67, not 2, so the pattern breaks. Since the ratio isn't consistent across the whole table, two matching ratios weren't enough evidence to confirm the model. The differences (3, 6, 8) aren't constant either, so the table isn't linear. And rising values alone never guarantee exponential growth — both linear and exponential functions can increase.",
          difficulty: "hard",
          why: [null, "Every ratio has to match. 20 ÷ 12 is about 1.67, not 2, so the pattern breaks.", "The differences are 3, 6, and 8, which aren't constant, so the table isn't linear either.", "Linear functions can increase too. Rising values alone don't prove exponential growth."],
        },
      ],
      traps: [
        "Assuming a table shows exponential growth just because the numbers are getting bigger, without checking whether the differences (linear) or ratios (exponential) are actually constant.",
        "Checking only one pair of consecutive values instead of at least two, which can miss a table that isn't following a clean pattern all the way through.",
        "Confusing a constant ratio less than 1 (exponential decay) with a constant negative difference (linear decrease) — both shrink the output, but through different mechanisms.",
        "Treating any percent as exponential: 'f(x) is 40% of x' means f(x) = 0.4x, a straight line, because the percent is taken of x, not of the previous output.",
        "Mixing up 'increases by 3 each year' (a fixed amount added: linear) with 'increases by 3% each year' (a fixed percent of the current amount: exponential).",
        "Misjudging a graph: calling a curve linear because it falls steadily, or calling a decreasing exponential 'increasing' because it bends upward as it flattens out. Read the direction from left to right.",
      ],
    },
    {
      name: "Graph Transformations (Shifts)",
      explanation:
        "This pattern gives a function f, as a graph or an equation, and asks about a transformed version, like f(x) + k (vertical shift) or f(x - h) (horizontal shift). Know the shift rules directly: adding a constant OUTSIDE the function shifts it vertically — up if positive, down if negative. Adding or subtracting a constant INSIDE the function's input shifts it horizontally, and counterintuitively in the OPPOSITE direction of the sign (f(x-3) shifts right, f(x+3) shifts left). Apply the shift to a few key reference points to see exactly where they land. When f is given as an equation, such as a factored cubic or a quadratic in standard form, track its key points instead of expanding: find f's zeros or vertex first, then move them. g(x) = f(x + 3) moves every zero and the vertex 3 units left, so a zero at 1 becomes a zero at -2. A vertical shift works differently: f(x) - 4 lowers every output by 4, so the vertex drops 4, and each old zero of f now has output -4 and is no longer a zero.",
      examples: [
        {
          q: "The graph of f passes through the point (2, 5). If g(x) = f(x) + 3, what corresponding point lies on the graph of g?",
          choices: ["(2, 8)", "(5, 5)", "(2, 2)", "(-1, 5)"],
          answer: 0,
          explain:
            "g(x) = f(x) + 3 is a vertical shift — every output increases by 3 while inputs stay the same, so (2, 5) becomes (2, 5+3) = (2, 8). (5, 5) mistakenly adds 3 to the x-coordinate instead of the y-coordinate. (2, 2) subtracts instead of adds. (-1, 5) shifts the x-coordinate as if this were a horizontal shift, which it isn't.",
          difficulty: "easy",
          why: [null, "+ 3 outside the function shifts the graph up, which changes y, not x.", "+ 3 moves the point up by 3: 5 + 3 = 8, not 5 − 3.", "+ 3 outside is a vertical shift. The x-value stays 2."],
        },
        {
          q: "The graph of f passes through the point (4, 1). If g(x) = f(x - 2), what corresponding point lies on the graph of g?",
          choices: ["(6, 1)", "(2, 1)", "(4, 3)", "(4, -1)"],
          answer: 0,
          explain:
            "g(x) = f(x-2) is a horizontal shift, and since the template subtracts h, the graph moves right, meaning 2 is added to the x-coordinate: (4, 1) becomes (4+2, 1) = (6, 1). (2, 1) subtracts instead of adds, moving the point the wrong direction. (4, 3) and (4, -1) mistakenly shift the y-coordinate instead of the x-coordinate for what is purely a horizontal shift.",
          difficulty: "easy",
          why: [null, "f(x − 2) shifts the graph right by 2: 4 + 2 = 6.", "A change inside the parentheses shifts left or right, not up or down.", "This changes y. f(x − 2) only moves the point horizontally."],
        },
        {
          q: "The graph of f has a minimum point at (-3, -6). If g(x) = f(x + 5), what is the minimum point of g?",
          choices: ["(-8, -6)", "(2, -6)", "(-8, -1)", "(2, -11)"],
          answer: 0,
          explain:
            "g(x) = f(x+5) is a horizontal shift, but the plus sign inside shifts the graph LEFT, not right — the opposite of what the sign might suggest. Subtracting 5 from the original x-coordinate gives -3-5 = -8, and the y-coordinate stays -6 since this is purely horizontal, giving (-8, -6). (2, -6) shifts right instead of left. (-8, -1) and (2, -11) incorrectly also change the y-coordinate.",
          difficulty: "medium",
          why: [null, "f(x + 5) shifts left, not right: −3 − 5 = −8.", "The shift is purely horizontal. The y-value stays −6.", "This shifts right instead of left and also changes y. The minimum moves to (−8, −6)."],
        },
        {
          q: "The graph of f has a maximum point at (1, 9). If g(x) = f(x - 4) - 2, what is the maximum point of g?",
          choices: ["(5, 7)", "(-3, 7)", "(5, 11)", "(-3, 11)"],
          answer: 0,
          explain:
            "This transformation combines two shifts: f(x-4) shifts right by 4 (horizontal), and the -2 outside shifts down by 2 (vertical). Applying both to the original point gives x-coordinate 1+4=5 and y-coordinate 9-2=7, so the maximum point of g is (5, 7). (-3, 7) shifts left instead of right. (5, 11) and (-3, 11) add instead of subtract for the vertical shift.",
          difficulty: "medium",
          why: [null, "f(x − 4) shifts right by 4, so x becomes 1 + 4 = 5.", "− 2 outside shifts down, so y becomes 9 − 2 = 7.", "Both shifts go the wrong way. Right 4 and down 2 gives (5, 7)."],
        },
        {
          q: "The function f is defined by f(x) = (x - 1)(x + 2)(x - 4). The function g is defined by g(x) = f(x + 3). What is the sum of the x-intercepts of the graph of y = g(x)?",
          choices: ["12", "-6", "3", "-12"],
          answer: 1,
          explain:
            "Track the zeros instead of expanding. The zeros of f are x = 1, -2, and 4. g(x) = f(x + 3) is f shifted 3 units LEFT, so every zero moves left 3: g's zeros are -2, -5, and 1. (Check one: g(-2) = f(-2 + 3) = f(1) = 0.) Their sum is -2 + (-5) + 1 = -6. 12 shifts each zero right instead of left. 3 is the sum of f's zeros, with no shift at all. -12 reads the zeros with flipped signs (-1, 2, -4) before shifting them left.",
          difficulty: "medium",
          why: ["f(x + 3) shifts left, not right: each zero goes down by 3, to −2, −5, and 1.", null, "3 is the sum of f's zeros. Shifting left 3 moves each one: 3 − 9 = −6.", "The zeros of f are 1, −2, and 4 (opposite signs from the factors), then each moves left 3."],
        },
        {
          q: "The graph of a rational function f is shown, with a horizontal asymptote at y = 0 for x ≥ 0, starting high near x = 0 and decreasing toward that asymptote as x increases. Which best describes the graph of y = f(x) + 5, where x ≥ 0?",
          choices: [
            "It still decreases toward a horizontal asymptote, but that asymptote is now at y = 5 instead of y = 0",
            "It still decreases toward a horizontal asymptote at y = 0, since adding a constant doesn't affect the asymptote",
            "It now increases toward a horizontal asymptote at y = 5",
            "The asymptote becomes vertical instead of horizontal",
          ],
          answer: 0,
          explain:
            "f(x) + 5 is a vertical shift: every point on the original graph moves up by 5, including the asymptote itself, so the asymptote moves from y = 0 to y = 5, and the curve still decreases toward that new level. It's incorrect to think the asymptote stays put; a vertical shift moves every part of the graph, including the level it flattens toward. The overall shape (still decreasing, not increasing) doesn't change, and the asymptote remains horizontal, not vertical; only its vertical position moves.",
          difficulty: "hard",
          why: [null, "Adding 5 moves every point up, including the level the curve flattens toward. The asymptote moves to y = 5.", "A vertical shift doesn't change the shape. The curve still decreases.", "Shifting up doesn't turn a horizontal asymptote vertical. It just moves it to y = 5."],
        },
        {
          q: "The function f is defined by f(x) = 3x² - 24x + 50. The function g is defined by g(x) = f(x + 7). For what value of x does g(x) reach its minimum?",
          choices: ["-3", "11", "4", "-11"],
          answer: 0,
          explain:
            "First find where f reaches its minimum: the vertex of f is at x = -b/(2a) = -(-24)/(2 · 3) = 4. g(x) = f(x + 7) is f shifted 7 units LEFT, so g's vertex is at 4 - 7 = -3. (Check: g(-3) = f(-3 + 7) = f(4), f's minimum value.) 11 shifts right instead of left. 4 is where f reaches its minimum, before the shift. -11 makes a sign slip in -b/(2a), getting -4, and then shifts left.",
          difficulty: "hard",
          why: [null, "f(x + 7) shifts the graph left, so the vertex moves from 4 to 4 − 7 = −3.", "4 is where f has its minimum. g is f moved 7 units left.", "A sign slip: −(−24)/(2 · 3) = +4, not −4. Then 4 − 7 = −3."],
        },
      ],
      traps: [
        "Shifting the graph in the wrong direction for a horizontal shift, since f(x-h) moves right for positive h, which feels backward compared to vertical shifts.",
        "Confusing a vertical shift (add/subtract outside the function) with a horizontal shift (add/subtract inside the function's parentheses).",
        "Applying the shift amount to only part of the graph's key features instead of every point uniformly, including asymptotes.",
        "Assuming a vertical shift keeps the same x-intercepts: in f(x) - 4, every output drops by 4, so each old zero of f now has output -4 and is no longer an x-intercept.",
      ],
    },
    {
      name: "Minimum, Maximum, and Asymptote Reasoning for Exponential Functions",
      explanation:
        "This pattern asks about the minimum or maximum value of an exponential function, or where it levels off — no vertex form here, since exponential functions don't have vertices. The key fact: for f(x) = a·b^x + c, the graph gets closer and closer to c but never actually reaches it (that's the horizontal asymptote), and c acts as the function's effective floor or ceiling. Whether the function increases or decreases, and whether c is a floor or a ceiling, depends on the signs of a and b, not on c alone.",
      examples: [
        {
          q: "What value does the function f(x) = 3(2)^x + 4 approach but never reach as x decreases toward negative infinity?",
          choices: ["4", "3", "2", "7"],
          answer: 0,
          explain:
            "The constant added at the end (4) is what the function approaches, not the coefficient (3) or the base (2). As x gets very negative, 2^x shrinks toward 0, so 3(2)^x also shrinks toward 0, leaving the function approaching just the constant term, 4. 3 mistakes the coefficient for the asymptote. 2 mistakes the base for the asymptote. 7 comes from adding the coefficient and constant together.",
          difficulty: "easy",
          why: [null, "3 is the coefficient. As x decreases, 3(2)^x shrinks to 0, leaving just the + 4.", "2 is the base. The function levels off at the added constant, 4.", "7 adds the coefficient and constant, but the 3(2)^x term goes to 0, not 3."],
        },
        {
          q: "What is the horizontal asymptote of g(x) = -5(0.5)^x - 2?",
          choices: ["y = -2", "y = -5", "y = 0.5", "y = -7"],
          answer: 0,
          explain:
            "As x increases, (0.5)^x shrinks toward 0, so -5(0.5)^x also shrinks toward 0, leaving the function approaching just the constant term, -2, so the asymptote is y = -2. y = -5 mistakes the coefficient for the asymptote. y = 0.5 mistakes the base for the asymptote. y = -7 comes from combining the coefficient and constant.",
          difficulty: "easy",
          why: [null, "−5 is the coefficient. As x increases, −5(0.5)^x shrinks to 0, leaving −2.", "0.5 is the base. The asymptote is the added constant, −2.", "−7 adds the coefficient and constant, but the −5(0.5)^x term goes to 0."],
        },
        {
          q: "For which of the following functions is every output value less than -3?\nI. h(x) = -4(2)^x - 3\nII. k(x) = 4(2)^x - 3",
          choices: ["Only function I", "Only function II", "Both function I and II", "Neither function I nor II"],
          answer: 0,
          explain:
            "Both functions share the same constant (-3), so both approach -3 as x decreases; the sign of the coefficient decides which side they stay on. Since (2)^x is always positive, in function I the term -4(2)^x is always negative, so every output is below -3: -3 is a ceiling the function approaches but never reaches. In function II, 4(2)^x is always positive, so every output is above -3. Only function I qualifies.",
          difficulty: "medium",
          why: [null, "4(2)^x is always positive, so function II's outputs are always above −3, not below.", "Function II's outputs are all above −3, so only function I qualifies.", "Function I's term −4(2)^x is always negative, so all its outputs are below −3."],
        },
        {
          q: "A cup of coffee's temperature, in degrees Fahrenheit, is modeled by T(t) = 70(0.9)^t + 68, where t is the number of minutes since it was poured. What temperature does the coffee approach as time goes on?",
          choices: ["68°F", "70°F", "0.9°F", "138°F"],
          answer: 0,
          explain:
            "As t increases, (0.9)^t shrinks toward 0 (since 0.9 < 1), so 70(0.9)^t also shrinks toward 0, leaving the function approaching just the constant, 68. This matches real cooling behavior — the coffee cools toward room temperature but never quite reaches it. 70°F mistakes the coefficient for the asymptote. 0.9°F mistakes the base for the asymptote. 138°F comes from adding the coefficient and constant together.",
          difficulty: "medium",
          why: [null, "70 is the coefficient. The 70(0.9)^t term shrinks to 0, leaving 68.", "0.9 is the base. The coffee levels off at the added constant, 68.", "138 is the starting temperature (70 + 68), not where it ends up."],
        },
        {
          q: "Two bacterial cultures are modeled by P(t) = 200(1.05)^t and Q(t) = 500(0.92)^t, where t is measured in hours. Which statement is true about their long-term behavior?",
          choices: [
            "P eventually exceeds Q and continues growing without bound, while Q shrinks toward (but never reaches) 0",
            "Q eventually exceeds P and continues growing without bound, since it starts with a larger value",
            "Both P and Q grow without bound, but P grows faster",
            "Both P and Q shrink toward 0, but Q shrinks faster",
          ],
          answer: 0,
          explain:
            "P's base (1.05) is greater than 1, meaning P grows without bound as t increases, with no upper asymptote. Q's base (0.92) is less than 1, meaning Q shrinks toward (but never reaches) 0 as t increases. Comparing the two bases (greater than 1 versus less than 1) determines the long-term outcome regardless of which starting value was larger, so P eventually overtakes Q permanently. Q's larger starting value (500) doesn't matter for the long-term comparison, since Q is shrinking while P keeps growing. And Q isn't growing at all — its base below 1 means it shrinks, not grows.",
          difficulty: "hard",
          why: [null, "Q's base, 0.92, is less than 1, so Q shrinks. A bigger start doesn't matter long-term.", "Q's base is below 1, so Q shrinks toward 0 instead of growing.", "P's base, 1.05, is greater than 1, so P grows without bound."],
        },
      ],
      traps: [
        "Using the coefficient (a) as the function's minimum or maximum instead of the constant added or subtracted at the end (c).",
        "Assuming every exponential function has a true minimum or maximum the way a parabola does, rather than a value it only approaches.",
        "Mixing up whether a negative leading coefficient makes the function open toward positive or negative infinity, which determines whether c acts as an upper or lower bound.",
      ],
    },
    {
      name: "Finding the Vertex of a Quadratic from Standard or Factored Form",
      explanation:
        "When a quadratic is given in standard form, f(x) = ax² + bx + c, instead of vertex form, its vertex isn't visible at a glance; you have to find it. The fastest method: the vertex's x-coordinate is always -b/2a. Substitute that back into the function to get the y-coordinate. Completing the square works too, and rewrites the function in vertex form directly, useful when the question asks for the rewritten equation itself, beyond the vertex's coordinates alone. If the quadratic is in factored form, f(x) = a(x - r)(x - s), skip the formula: the zeros r and s are visible, and since a parabola is symmetric, the vertex's x-coordinate is their midpoint, (r + s)/2. Watch the signs, since (x + 11) means a zero at -11, and substitute the midpoint back in if the question asks for the minimum or maximum value itself.",
      examples: [
        {
          q: "What is the vertex of f(x) = x² - 6x + 5?",
          choices: ["(3, -4)", "(-3, -4)", "(3, 4)", "(6, 5)"],
          answer: 0,
          explain:
            "With a = 1 and b = -6, the vertex's x-coordinate is -b/2a = -(-6)/(2·1) = 3. Substituting x = 3 back into the original function gives f(3) = 9 - 18 + 5 = -4, so the vertex is (3, -4). (-3, -4) flips the sign of the x-coordinate from a sign error in -b/2a. (3, 4) flips the sign of the y-coordinate. (6, 5) comes from misreading b and c directly as coordinates instead of computing the vertex.",
          difficulty: "easy",
          why: [null, "A sign slip: −b/2a = −(−6)/2 = +3.", "f(3) = 9 − 18 + 5 = −4, not +4.", "6 and 5 are b and c read straight off the equation. Compute the vertex instead: x = 3."],
        },
        {
          q: "What is the minimum value of f(x) = x² + 8x + 10?",
          choices: ["-6", "-4", "10", "-16"],
          answer: 0,
          explain:
            "Since a = 1 is positive, the parabola opens upward, so its vertex is a minimum. The x-coordinate of the vertex is -b/2a = -8/2 = -4, and substituting back in gives f(-4) = 16 - 32 + 10 = -6, which is the minimum value — the vertex's y-coordinate, not its x-coordinate. -4 mistakenly reports the x-coordinate of the vertex instead of the minimum value itself. 10 mistakes the constant term c for the minimum. -16 comes from an arithmetic slip when substituting back in.",
          difficulty: "easy",
          why: [null, "−4 is the x-value where the minimum happens. The minimum value is f(−4) = −6.", "10 is the value at x = 0, not the minimum.", "−16 forgets the + 10: 16 − 32 + 10 = −6."],
        },
        {
          q: "What is the vertex of g(x) = 2x² - 12x + 7?",
          choices: ["(3, -11)", "(6, -11)", "(3, 7)", "(-3, -11)"],
          answer: 0,
          explain:
            "With a = 2 and b = -12 (the leading coefficient must be included in the formula, not dropped), the x-coordinate is -b/2a = -(-12)/(2·2) = 3. Substituting back in gives g(3) = 2(9) - 36 + 7 = -11, so the vertex is (3, -11). (6, -11) comes from dropping the leading coefficient and computing -b/2 instead of -b/2a. (3, 7) mistakenly uses the constant term c as the y-coordinate. (-3, -11) flips the sign of the x-coordinate.",
          difficulty: "medium",
          why: [null, "6 comes from −b/2 instead of −b/2a. Include a = 2: 12 ÷ 4 = 3.", "7 is g(0), the constant term. Plug in x = 3: g(3) = −11.", "A sign slip: −(−12)/4 = +3."],
        },
        {
          q: "Which of the following is the vertex form of f(x) = x² + 10x + 21, found by completing the square?",
          choices: ["(x+5)² - 4", "(x+5)² + 21", "(x-5)² - 4", "(x+10)² - 79"],
          answer: 0,
          explain:
            "Taking half of the x-coefficient and squaring it gives (10/2)² = 25; adding and subtracting this value rewrites the expression without changing it: x² + 10x + 25 - 25 + 21. The first three terms form a perfect square, giving (x+5)² - 25 + 21 = (x+5)² - 4. (x+5)² + 21 correctly completes the square but forgets to subtract the 25 that was added. (x-5)² - 4 gets the sign inside the parentheses wrong. (x+10)² - 79 incorrectly uses the full x-coefficient (10) instead of half of it.",
          difficulty: "medium",
          why: [null, "This adds 25 to complete the square but doesn't subtract it back out: 21 − 25 = −4.", "x² + 10x comes from (x + 5)², not (x − 5)².", "Take half the x-coefficient: 10 ÷ 2 = 5, so it's (x + 5)², not (x + 10)²."],
        },
        {
          q: "The function f is defined by f(x) = (x - 3)(x + 11). For what value of x does f(x) reach its minimum?",
          choices: ["4", "-49", "-4", "-8"],
          answer: 2,
          explain:
            "In factored form, the zeros are visible right away: x - 3 = 0 gives x = 3, and x + 11 = 0 gives x = -11. A parabola is symmetric, so its vertex sits exactly halfway between its zeros, at their average: x = (3 + (-11))/2 = -8/2 = -4. Since the leading coefficient is positive, the parabola opens up and the vertex is a minimum, at x = -4. 4 reads the zeros with flipped signs, -3 and 11. -49 is the minimum value, f(-4) = (-7)(7), not the x-value where it occurs. -8 adds the zeros but forgets to divide by 2.",
          difficulty: "medium",
          why: ["The zeros are 3 and −11 (the opposite signs from inside the factors), so the midpoint is −4, not 4.", "−49 is the minimum value, f(−4). The question asks for the x-value: −4.", null, "−8 is the sum of the zeros. The vertex is halfway between them: −8 ÷ 2 = −4."],
        },
        {
          q: "A ball's height in feet is modeled by h(t) = -16t² + 64t + 5, where t is time in seconds after launch. What is the maximum height the ball reaches?",
          choices: ["69 feet", "2 feet", "5 feet", "64 feet"],
          answer: 0,
          explain:
            "Since a = -16 is negative, the parabola opens downward, so its vertex is a maximum — exactly what's being asked. The x-coordinate (representing time) is -b/2a = -64/(2·-16) = 2, and substituting t = 2 back into the function gives h(2) = -16(4) + 64(2) + 5 = -64 + 128 + 5 = 69. 2 feet mistakenly reports the vertex's x-coordinate (when the maximum occurs) instead of the maximum height itself. 5 feet mistakes the initial height (the constant term) for the maximum. 64 feet misreads the coefficient of t as the answer.",
          difficulty: "hard",
          why: [null, "2 seconds is when the maximum happens. The height then is h(2) = 69.", "5 feet is the launch height, h(0), not the maximum.", "64 is the coefficient of t, not a height. Plug in t = 2 to get 69."],
        },
      ],
      traps: [
        "Reporting the vertex's x-coordinate (-b/2a) as the answer when the question asks for the maximum or minimum value, which is actually the y-coordinate found by substituting back in.",
        "Dropping the leading coefficient a from the -b/2a formula when it isn't 1.",
        "Sign errors when substituting a negative b into -b/2a — double negatives here are a common place to lose a point.",
        "Reading the zeros from factored form with the wrong signs — (x + 11) means x = -11 — or adding the two zeros without dividing by 2 to find the midpoint.",
      ],
    },
    {
      name: "Evaluating a Function and Interpreting Its Output in Context",
      explanation:
        "These questions ask you to either compute a quadratic or exponential function's output at a given input, or interpret what an already-computed output means in the real-world scenario it describes. Unlike the vertex, growth-rate, or table patterns, there's no shortcut here beyond careful substitution: plug the input into the function, simplify, and follow order of operations exactly. When interpreting an output, connect the input and output variables back to what they mean in the scenario (like 'time in seconds' and 'height in feet'), and state the result using those units, not just as a bare number. Some questions run the function backward: they give the output and ask for the input. Set the function equal to that value, solve (usually by factoring), and keep only the solution that fits the context; a negative time or width gets thrown out. Others give a table of values and ask which quadratic rule produced it: test each choice on every row, not just one, and use symmetry as a shortcut, since two inputs with equal outputs sit equally far from the vertex.",
      examples: [
        {
          q: "The function is defined by f(x) = 2x² - 5x + 1. What is f(3)?",
          choices: ["4", "10", "-14", "22"],
          answer: 0,
          explain:
            "Substituting x = 3 into every instance of x gives f(3) = 2(3)² - 5(3) + 1. Applying order of operations, exponents first: 2(9) - 5(3) + 1 = 18 - 15 + 1 = 4. -14 leaves out the 2x² term entirely (just -15 + 1). 22 comes from squaring 2 × 3 together, (6)² = 36, when the exponent applies only to the 3.",
          difficulty: "easy",
          why: [null, "Check it: 2(9) − 15 + 1 = 4, not 10.", "−14 leaves out the 2x² term. It's just −15 + 1.", "22 squares 2 × 3 together: 36 − 15 + 1. The exponent applies only to the 3: 2(9) = 18."],
        },
        {
          q: "A diver's height above the water, in feet, is modeled by H(t) = -16t² + 8t + 10, where t is time in seconds after leaving the platform. What does H(0) represent in this context?",
          choices: [
            "The platform's height above the water, at the instant the diver leaves it",
            "The diver's height above the water after falling for 1 second",
            "The total time the diver spends in the air",
            "The height of the water itself, which is always 0",
          ],
          answer: 0,
          explain:
            "Substituting t = 0 gives H(0) = -16(0) + 8(0) + 10 = 10. Since t represents time since leaving the platform, t = 0 is the instant the diver leaves it, so H(0) = 10 represents the platform's starting height above the water at that moment. The second choice confuses t = 0 with t = 1. The third choice confuses an output (height) with a completely different quantity (total airtime). The fourth choice misreads the function's output as describing the water rather than the diver.",
          difficulty: "easy",
          why: [null, "t = 0 is the moment the diver leaves, not one second later.", "H(0) is a height, not an amount of time.", "H gives the diver's height. At t = 0 that's 10 feet, the platform."],
        },
        {
          q: "A population is modeled by P(t) = 500(1.08)^t, where t is measured in years. What is P(0)?",
          choices: ["500", "0", "540", "1.08"],
          answer: 0,
          explain:
            "Substituting t = 0 gives P(0) = 500(1.08)^0. Any nonzero number raised to the power 0 equals 1, so (1.08)^0 = 1, and P(0) = 500(1) = 500 — the initial population, before any growth has occurred. 0 mistakenly treats t = 0 as making the whole expression 0. 540 comes from computing one year of growth (500 × 1.08) instead of recognizing that t = 0 means no time has passed. 1.08 mistakes the growth base itself for the population value.",
          difficulty: "medium",
          why: [null, "Anything to the 0 power is 1, not 0: 500 × 1 = 500.", "540 is one year of growth, P(1). At t = 0, no time has passed.", "1.08 is the growth base, not the population."],
        },
        {
          q: "A rock's height above a canyon floor, in meters, is modeled by h(t) = -5t² + 30, where t is seconds after it's dropped. Which statement correctly interprets h(2) = 10?",
          choices: [
            "2 seconds after being dropped, the rock is 10 meters above the canyon floor",
            "10 seconds after being dropped, the rock is 2 meters above the canyon floor",
            "The rock was dropped from a height of 2 meters and fell for 10 seconds",
            "The rock falls at a constant rate of 10 meters every 2 seconds",
          ],
          answer: 0,
          explain:
            "Confirming the substitution: h(2) = -5(4) + 30 = -20 + 30 = 10, so the given value checks out. In context, the input (2) is a time in seconds and the output (10) is a height in meters, so the correct interpretation keeps them in their proper roles: 2 seconds after being dropped, the rock is 10 meters above the canyon floor. The second choice swaps which number is the time and which is the height. The third choice misreads the input/output as describing the drop height and duration instead of time-at-a-given-height. The fourth choice invents a constant rate that isn't supported by a quadratic (non-constant-rate) model.",
          difficulty: "medium",
          why: [null, "This swaps them. The input (2) is the time and the output (10) is the height.", "The rock was dropped from h(0) = 30 meters. h(2) = 10 describes where it is at 2 seconds.", "A quadratic model doesn't fall at a constant rate. h(2) = 10 is a single moment."],
        },
        {
          q: "A rectangular garden is 6 feet longer than it is wide. Its area, in square feet, is given by A(x) = x(x + 6), where x is the garden's width, in feet. If the area of the garden is 40 square feet, what is its width, in feet?",
          choices: ["-10", "4", "10", "34"],
          answer: 1,
          explain:
            "This runs the function backward: instead of plugging in x, set the output equal to 40 and solve for x. x(x + 6) = 40 becomes x² + 6x - 40 = 0, which factors as (x + 10)(x - 4) = 0, so x = -10 or x = 4. A width can't be negative, so keep the root that fits the context: x = 4. (Check: 4 · 10 = 40.) -10 is a solution of the equation but not a possible width. 10 flips the sign of that root, and it's actually the length, 4 + 6; a width of 10 gives an area of 10 · 16 = 160. 34 subtracts 6 from 40, treating the area as if it were x + 6.",
          difficulty: "medium",
          why: ["−10 solves the equation, but a width can't be negative. Keep x = 4.", null, "A width of 10 gives an area of 10(16) = 160, not 40.", "34 is 40 − 6, which treats the area as x + 6. The area is x(x + 6)."],
        },
        {
          q: "An object's velocity in meters per second is modeled by v(x) = 3x² - 12x + 9, where x is the number of seconds since a sensor started recording, valid only for 0 ≤ x ≤ 5. For how many values of x in this interval is the object's velocity equal to 0?",
          choices: ["2", "1", "3", "0"],
          answer: 0,
          explain:
            "Setting the function equal to 0 gives 3x² - 12x + 9 = 0. Dividing every term by 3 simplifies to x² - 4x + 3 = 0, which factors as (x-1)(x-3) = 0, giving x = 1 or x = 3. Both values fall within the given domain (0 ≤ x ≤ 5), so both are valid, giving 2 total solutions. Answering 1 would mean incorrectly discarding one of the two valid roots. Answering 3 overcounts, likely from an arithmetic slip while factoring. Answering 0 would incorrectly assume neither root falls in the domain, when both do.",
          difficulty: "hard",
          why: [null, "Both roots, x = 1 and x = 3, fall in 0 ≤ x ≤ 5, so there are 2.", "A quadratic has at most two roots. Factoring gives (x − 1)(x − 3).", "Both roots, 1 and 3, are inside the interval 0 to 5."],
        },
        {
          q: "The table shows three values of the quadratic function f.\n\nWhich equation defines f?",
          choices: ["f(x) = -4x + 6", "f(x) = x² - 2x + 3", "f(x) = 2x² - 4x + 4", "f(x) = 2x² + 4x + 4"],
          answer: 2,
          explain:
            "Test each equation on every row, because a wrong equation can match one or two rows by luck. A shortcut narrows it first: f(-1) and f(3) are equal, so the parabola is symmetric about the x-value halfway between them, x = 1, which makes (1, 2) the vertex. f(x) = 2x² - 4x + 4 has its vertex at x = -(-4)/(2 · 2) = 1, and it fits all three rows: 2 + 4 + 4 = 10, 2 - 4 + 4 = 2, and 18 - 12 + 4 = 10. f(x) = -4x + 6 matches the first two rows but gives -6 at x = 3; it isn't even quadratic. f(x) = x² - 2x + 3 has the right vertex, (1, 2), but gives 6 at x = -1, so its a is wrong. f(x) = 2x² + 4x + 4 has its vertex at x = -1 and gives 2, not 10, at x = -1.",
          figure: {"kind": "table", "header": ["x", "f(x)"], "rows": [[-1, 10], [1, 2], [3, 10]]},
          difficulty: "hard",
          why: ["This matches the first two rows, but f(3) = −4(3) + 6 = −6, not 10.", "The vertex (1, 2) is right, but f(−1) = 1 + 2 + 3 = 6, not 10.", null, "This gives f(−1) = 2 − 4 + 4 = 2, not 10. Its vertex is at x = −1, not 1."],
        },
      ],
      traps: [
        "Substitution errors from skipping steps — especially forgetting to square the entire input, including its sign, before multiplying by other terms.",
        "Swapping which variable represents the input and which represents the output when writing an interpretation in words.",
        "Forgetting to check a solution against a stated domain restriction when a real-world scenario limits which input values actually make sense.",
        "Choosing an equation after checking only one or two rows of a table — a wrong equation can match some rows by coincidence, so test every row (or use symmetry: equal outputs sit equally far from the vertex).",
      ],
    },
    {
      name: "Reading Key Features from a Nonlinear Graph",
      explanation:
        "These questions show the graph of a nonlinear function (a parabola, an exponential curve, or a cubic, often modeling something real like a drone's height over time) and ask you to read one feature off it: the y-intercept, the x-intercepts, the highest or lowest point, or an interval where the graph rises or falls. First name the feature and where it lives: the y-intercept is where the graph crosses x = 0 (the starting value in a model), the x-intercepts are where y = 0, and a maximum is the peak, whose y-value is the maximum and whose x-value is where it happens. Intervals of increase or decrease are written with x-values: trace the graph left to right and note where it turns. In context, translate back into words: for a height model, an x-intercept is the time the height is 0, when the object reaches the ground. The hardest versions run backward: the y-intercept of y = ax² + bx + c is c, and with a known, the vertex's x-value, -b/(2a), gives b. Wrong answers usually report the other coordinate, read an exponential's asymptote as its y-intercept, or give an interval where the graph is falling.",
      examples: [
        {
          q: "The graph of y = f(x), where f is an exponential function, is shown in the xy-plane. The dashed line is the horizontal asymptote of the graph.\n\nWhat is the y-intercept of the graph?",
          choices: ["(0, 2)", "(0, 6)", "(6, 0)", "(1, 4)"],
          answer: 1,
          explain:
            "The y-intercept is where the graph crosses the y-axis, the vertical line x = 0. Follow the curve to x = 0: it crosses at height 6, so the y-intercept is (0, 6). (0, 2) is the dashed asymptote, the level the curve flattens toward as x grows; the curve gets close to y = 2 but never touches it, and it is nowhere near the y-axis crossing. (6, 0) swaps the coordinates: a y-intercept always has x-coordinate 0. (1, 4) is a real point on the curve, but it sits at x = 1, one unit to the right of the y-axis.",
          figure: {"kind": "geometry", "points": {"p0": [0, 6]}, "dots": ["p0"], "paths": [{"points": [[-0.5219, 7.7433], [-0.4649, 7.5207], [-0.4078, 7.3068], [-0.3508, 7.1012], [-0.2938, 6.9035], [-0.2368, 6.7135], [-0.1798, 6.5308], [-0.1228, 6.3553], [-0.0657, 6.1865], [-0.0087, 6.0243], [0.0483, 5.8683], [0.1053, 5.7184], [0.1623, 5.5743], [0.2193, 5.4358], [0.2764, 5.3027], [0.3334, 5.1747], [0.3904, 5.0517], [0.4474, 4.9334], [0.5044, 4.8198], [0.5614, 4.7105], [0.6185, 4.6055], [0.6755, 4.5045], [0.7325, 4.4074], [0.7895, 4.3142], [0.8465, 4.2245], [0.9036, 4.1383], [0.9606, 4.0554], [1.0176, 3.9758], [1.0746, 3.8992], [1.1316, 3.8256], [1.1886, 3.7549], [1.2457, 3.6869], [1.3027, 3.6215], [1.3597, 3.5587], [1.4167, 3.4983], [1.4737, 3.4402], [1.5307, 3.3844], [1.5878, 3.3308], [1.6448, 3.2792], [1.7018, 3.2296], [1.7588, 3.182], [1.8158, 3.1362], [1.8728, 3.0921], [1.9299, 3.0498], [1.9869, 3.0091], [2.0439, 2.97], [2.1009, 2.9324], [2.1579, 2.8963], [2.2149, 2.8616], [2.272, 2.8282], [2.329, 2.7961], [2.386, 2.7653], [2.443, 2.7356], [2.5, 2.7071], [2.557, 2.6797], [2.6141, 2.6534], [2.6711, 2.628], [2.7281, 2.6037], [2.7851, 2.5803], [2.8421, 2.5578], [2.8991, 2.5362], [2.9562, 2.5154], [3.0132, 2.4955], [3.0702, 2.4763], [3.1272, 2.4578], [3.1842, 2.4401], [3.2412, 2.423], [3.2983, 2.4066], [3.3553, 2.3909], [3.4123, 2.3757], [3.4693, 2.3612], [3.5263, 2.3472], [3.5834, 2.3337], [3.6404, 2.3208], [3.6974, 2.3083], [3.7544, 2.2964], [3.8114, 2.2849], [3.8684, 2.2739], [3.9255, 2.2633], [3.9825, 2.2531], [4.0395, 2.2432], [4.0965, 2.2338], [4.1535, 2.2248], [4.2105, 2.2161], [4.2676, 2.2077], [4.3246, 2.1996], [4.3816, 2.1919], [4.4386, 2.1845], [4.4956, 2.1773], [4.5526, 2.1704], [4.6097, 2.1638], [4.6667, 2.1575], [4.7237, 2.1514], [4.7807, 2.1455], [4.8377, 2.1399], [4.8947, 2.1345], [4.9518, 2.1293], [5.0088, 2.1242], [5.0658, 2.1194], [5.1228, 2.1148], [5.1798, 2.1104], [5.2368, 2.1061], [5.2939, 2.102], [5.3509, 2.098], [5.4079, 2.0942], [5.4649, 2.0906], [5.5219, 2.0871], [5.5789, 2.0837], [5.636, 2.0804], [5.693, 2.0773], [5.75, 2.0743]], "arrows": true}, {"points": [[-2, 2], [6, 2]], "dashed": true}], "axes": {"x": [-2, 6], "y": [-1, 8], "step": 1}},
          difficulty: "easy",
          why: ["y = 2 is the asymptote, the level the curve flattens toward. The curve crosses x = 0 at y = 6.", null, "This swaps the coordinates. A y-intercept has x = 0, so it's (0, 6).", "(1, 4) is on the curve, but at x = 1. The y-intercept is where x = 0."],
        },
        {
          q: "A drone takes off from the roof of a building and later lands on the ground. The graph of y = h(x) models the drone's height above the ground, in meters, x minutes after takeoff. The graph's x-intercept is marked.\n\nWhat is the best interpretation of the x-intercept (8, 0) in this context?",
          choices: ["The drone is 8 meters above the ground when it takes off.", "The drone reaches its maximum height 8 minutes after takeoff.", "The drone travels 8 meters before it lands.", "The drone lands on the ground 8 minutes after takeoff."],
          answer: 3,
          explain:
            "An x-intercept is a point where y = 0. Here y is the drone's height, so y = 0 means the drone is on the ground, and x = 8 is the time, in minutes, when that happens: the drone lands 8 minutes after takeoff. The first choice treats 8 as a height, which is what a y-intercept would give; the graph actually starts at (0, 4), a 4-meter roof. The second choice describes the peak of the graph, which is near x = 3, not the point where the graph meets the x-axis. The third choice treats x as a distance, but x counts minutes.",
          figure: {"kind": "geometry", "points": {"p0": [8, 0]}, "dots": ["p0"], "paths": [{"points": [[0, 4], [0.0727, 4.1078], [0.1455, 4.2129], [0.2182, 4.3154], [0.2909, 4.4152], [0.3636, 4.5124], [0.4364, 4.6069], [0.5091, 4.6988], [0.5818, 4.7881], [0.6545, 4.8747], [0.7273, 4.9587], [0.8, 5.04], [0.8727, 5.1187], [0.9455, 5.1947], [1.0182, 5.2681], [1.0909, 5.3388], [1.1636, 5.4069], [1.2364, 5.4724], [1.3091, 5.5352], [1.3818, 5.5954], [1.4545, 5.6529], [1.5273, 5.7078], [1.6, 5.76], [1.6727, 5.8096], [1.7455, 5.8565], [1.8182, 5.9008], [1.8909, 5.9425], [1.9636, 5.9815], [2.0364, 6.0179], [2.1091, 6.0516], [2.1818, 6.0826], [2.2545, 6.1111], [2.3273, 6.1369], [2.4, 6.16], [2.4727, 6.1805], [2.5455, 6.1983], [2.6182, 6.2136], [2.6909, 6.2261], [2.7636, 6.236], [2.8364, 6.2433], [2.9091, 6.2479], [2.9818, 6.2499], [3.0545, 6.2493], [3.1273, 6.246], [3.2, 6.24], [3.2727, 6.2314], [3.3455, 6.2202], [3.4182, 6.2063], [3.4909, 6.1898], [3.5636, 6.1706], [3.6364, 6.1488], [3.7091, 6.1243], [3.7818, 6.0972], [3.8545, 6.0674], [3.9273, 6.035], [4, 6], [4.0727, 5.9623], [4.1455, 5.922], [4.2182, 5.879], [4.2909, 5.8334], [4.3636, 5.7851], [4.4364, 5.7342], [4.5091, 5.6807], [4.5818, 5.6245], [4.6545, 5.5656], [4.7273, 5.5041], [4.8, 5.44], [4.8727, 5.3732], [4.9455, 5.3038], [5.0182, 5.2317], [5.0909, 5.157], [5.1636, 5.0797], [5.2364, 4.9997], [5.3091, 4.917], [5.3818, 4.8317], [5.4545, 4.7438], [5.5273, 4.6532], [5.6, 4.56], [5.6727, 4.4641], [5.7455, 4.3656], [5.8182, 4.2645], [5.8909, 4.1607], [5.9636, 4.0542], [6.0364, 3.9451], [6.1091, 3.8334], [6.1818, 3.719], [6.2545, 3.602], [6.3273, 3.4823], [6.4, 3.36], [6.4727, 3.235], [6.5455, 3.1074], [6.6182, 2.9772], [6.6909, 2.8443], [6.7636, 2.7088], [6.8364, 2.5706], [6.9091, 2.4298], [6.9818, 2.2863], [7.0545, 2.1402], [7.1273, 1.9914], [7.2, 1.84], [7.2727, 1.686], [7.3455, 1.5293], [7.4182, 1.3699], [7.4909, 1.2079], [7.5636, 1.0433], [7.6364, 0.876], [7.7091, 0.7061], [7.7818, 0.5336], [7.8545, 0.3583], [7.9273, 0.1805], [8, 0]]}], "axes": {"x": [-1, 9], "y": [-1, 7], "step": 1}},
          difficulty: "easy",
          why: ["That reads 8 as a height. The x-intercept's 8 is a time, and its height is 0.", "The highest point is near x = 3. At x = 8 the height is 0: the drone is on the ground.", "x is time in minutes, not distance in meters.", null],
        },
        {
          q: "A toy rocket is launched from a platform. The graph of y = r(x) models the rocket's height above the ground, in meters, x seconds after launch, until it lands at x = 5.\n\nOn which interval is the rocket's height increasing?",
          choices: ["0 < x < 2", "2 < x < 5", "0 < x < 4.5", "2.5 < x < 4.5"],
          answer: 0,
          explain:
            "A function is increasing where its graph rises as you move to the right, and the interval is written with x-values (here, times). The curve rises from the launch at x = 0 up to its peak at x = 2, then falls until it lands at x = 5, so the height increases on 0 < x < 2. 2 < x < 5 is the part after the peak, where the rocket is coming down. 0 < x < 4.5 uses the maximum height, 4.5, as if it were a time. 2.5 < x < 4.5 runs from the starting height to the maximum height: those are y-values, not the x-values an interval needs.",
          figure: {"kind": "geometry", "points": {"p0": [2, 4.5]}, "dots": ["p0"], "paths": [{"points": [[0, 2.5], [0.0455, 2.5899], [0.0909, 2.6777], [0.1364, 2.7634], [0.1818, 2.8471], [0.2273, 2.9287], [0.2727, 3.0083], [0.3182, 3.0857], [0.3636, 3.1612], [0.4091, 3.2345], [0.4545, 3.3058], [0.5, 3.375], [0.5455, 3.4421], [0.5909, 3.5072], [0.6364, 3.5702], [0.6818, 3.6312], [0.7273, 3.6901], [0.7727, 3.7469], [0.8182, 3.8017], [0.8636, 3.8543], [0.9091, 3.905], [0.9545, 3.9535], [1, 4], [1.0455, 4.0444], [1.0909, 4.0868], [1.1364, 4.1271], [1.1818, 4.1653], [1.2273, 4.2014], [1.2727, 4.2355], [1.3182, 4.2676], [1.3636, 4.2975], [1.4091, 4.3254], [1.4545, 4.3512], [1.5, 4.375], [1.5455, 4.3967], [1.5909, 4.4163], [1.6364, 4.4339], [1.6818, 4.4494], [1.7273, 4.4628], [1.7727, 4.4742], [1.8182, 4.4835], [1.8636, 4.4907], [1.9091, 4.4959], [1.9545, 4.499], [2, 4.5], [2.0455, 4.499], [2.0909, 4.4959], [2.1364, 4.4907], [2.1818, 4.4835], [2.2273, 4.4742], [2.2727, 4.4628], [2.3182, 4.4494], [2.3636, 4.4339], [2.4091, 4.4163], [2.4545, 4.3967], [2.5, 4.375], [2.5455, 4.3512], [2.5909, 4.3254], [2.6364, 4.2975], [2.6818, 4.2676], [2.7273, 4.2355], [2.7727, 4.2014], [2.8182, 4.1653], [2.8636, 4.1271], [2.9091, 4.0868], [2.9545, 4.0444], [3, 4], [3.0455, 3.9535], [3.0909, 3.905], [3.1364, 3.8543], [3.1818, 3.8017], [3.2273, 3.7469], [3.2727, 3.6901], [3.3182, 3.6312], [3.3636, 3.5702], [3.4091, 3.5072], [3.4545, 3.4421], [3.5, 3.375], [3.5455, 3.3058], [3.5909, 3.2345], [3.6364, 3.1612], [3.6818, 3.0857], [3.7273, 3.0083], [3.7727, 2.9287], [3.8182, 2.8471], [3.8636, 2.7634], [3.9091, 2.6777], [3.9545, 2.5899], [4, 2.5], [4.0455, 2.4081], [4.0909, 2.314], [4.1364, 2.218], [4.1818, 2.1198], [4.2273, 2.0196], [4.2727, 1.9174], [4.3182, 1.813], [4.3636, 1.7066], [4.4091, 1.5981], [4.4545, 1.4876], [4.5, 1.375], [4.5455, 1.2603], [4.5909, 1.1436], [4.6364, 1.0248], [4.6818, 0.9039], [4.7273, 0.781], [4.7727, 0.656], [4.8182, 0.5289], [4.8636, 0.3998], [4.9091, 0.2686], [4.9545, 0.1353], [5, 0]]}], "axes": {"x": [-1, 6], "y": [-1, 6], "step": 1}},
          difficulty: "medium",
          why: [null, "After the peak at x = 2, the graph falls. That's where the height is decreasing.", "4.5 is the maximum height, a y-value. The peak happens at x = 2.", "2.5 and 4.5 are heights (y-values). The interval should list times: 0 < x < 2."],
        },
        {
          q: "The graph of the polynomial function y = f(x) is shown in the xy-plane. The points where the graph crosses the axes are marked.\n\nWhich of the following statements about f is true?",
          choices: ["The graph of y = f(x) has exactly two x-intercepts.", "f is increasing for all x between -2 and 1.", "f(x) < 0 for all x > 1.", "The y-intercept of the graph is (0, 3)."],
          answer: 3,
          explain:
            "Check each statement against the graph, one feature at a time. The graph crosses the y-axis at (0, 3), so the last statement is true. The graph meets the x-axis at three marked points, x = -2, 1, and 3, so it has three x-intercepts, not two. Between x = -2 and x = 1 the graph rises to a peak just left of the y-axis and then falls, so f is not increasing on that whole interval; it is increasing only up to the peak. And f(x) is negative only between x = 1 and x = 3: to the right of x = 3 the graph climbs back above the x-axis, so f(x) < 0 fails for x > 3.",
          figure: {"kind": "geometry", "points": {"p0": [-2, 0], "p1": [1, 0], "p2": [3, 0], "p3": [0, 3]}, "dots": ["p0", "p1", "p2", "p3"], "paths": [{"points": [[-2.407, -3.7488], [-2.3521, -3.158], [-2.2971, -2.5946], [-2.2422, -2.058], [-2.1872, -1.5478], [-2.1323, -1.0634], [-2.0774, -0.6043], [-2.0224, -0.1701], [-1.9675, 0.2397], [-1.9125, 0.6257], [-1.8576, 0.9884], [-1.8027, 1.3282], [-1.7477, 1.6456], [-1.6928, 1.9412], [-1.6378, 2.2154], [-1.5829, 2.4687], [-1.5279, 2.7017], [-1.473, 2.9147], [-1.4181, 3.1085], [-1.3631, 3.2833], [-1.3082, 3.4397], [-1.2532, 3.5783], [-1.1983, 3.6995], [-1.1434, 3.8038], [-1.0884, 3.8917], [-1.0335, 3.9637], [-0.9785, 4.0203], [-0.9236, 4.062], [-0.8687, 4.0893], [-0.8137, 4.1028], [-0.7588, 4.1028], [-0.7038, 4.0899], [-0.6489, 4.0646], [-0.594, 4.0273], [-0.539, 3.9787], [-0.4841, 3.9191], [-0.4291, 3.8492], [-0.3742, 3.7693], [-0.3192, 3.6799], [-0.2643, 3.5817], [-0.2094, 3.475], [-0.1544, 3.3604], [-0.0995, 3.2383], [-0.0445, 3.1093], [0.0104, 2.9739], [0.0653, 2.8325], [0.1203, 2.6857], [0.1752, 2.5339], [0.2302, 2.3777], [0.2851, 2.2175], [0.34, 2.0539], [0.395, 1.8873], [0.4499, 1.7183], [0.5049, 1.5473], [0.5598, 1.3748], [0.6147, 1.2014], [0.6697, 1.0275], [0.7246, 0.8536], [0.7796, 0.6802], [0.8345, 0.5079], [0.8895, 0.3371], [0.9444, 0.1683], [0.9993, 0.002], [1.0543, -0.1613], [1.1092, -0.321], [1.1642, -0.4768], [1.2191, -0.628], [1.274, -0.7743], [1.329, -0.915], [1.3839, -1.0498], [1.4389, -1.178], [1.4938, -1.2993], [1.5487, -1.4131], [1.6037, -1.5188], [1.6586, -1.6161], [1.7136, -1.7044], [1.7685, -1.7833], [1.8234, -1.8521], [1.8784, -1.9105], [1.9333, -1.9579], [1.9883, -1.9939], [2.0432, -2.0178], [2.0982, -2.0293], [2.1531, -2.0279], [2.208, -2.013], [2.263, -1.9841], [2.3179, -1.9407], [2.3729, -1.8825], [2.4278, -1.8087], [2.4827, -1.719], [2.5377, -1.6129], [2.5926, -1.4898], [2.6476, -1.3493], [2.7025, -1.1909], [2.7574, -1.014], [2.8124, -0.8182], [2.8673, -0.6029], [2.9223, -0.3677], [2.9772, -0.1121], [3.0322, 0.1644], [3.0871, 0.4623], [3.142, 0.7822], [3.197, 1.1245], [3.2519, 1.4897], [3.3069, 1.8783], [3.3618, 2.2908], [3.4167, 2.7277], [3.4717, 3.1895], [3.5266, 3.6768], [3.5816, 4.1899], [3.6365, 4.7294]], "arrows": true}], "axes": {"x": [-4, 5], "y": [-4, 5], "step": 1}},
          difficulty: "medium",
          why: ["The graph crosses the x-axis at three points: x = −2, 1, and 3.", "The graph rises to a peak just left of x = 0, then falls. It isn't increasing on the whole interval.", "Past x = 3 the graph is back above the x-axis, so f(x) is positive there.", null],
        },
        {
          q: "The graph of y = (1/2)x² + bx + c, where b and c are constants, is shown in the xy-plane. The vertex and the y-intercept are marked.\n\nWhat is the value of bc?",
          choices: ["-6", "10", "12", "6"],
          answer: 3,
          explain:
            "Work backward from two features. The y-intercept is the value at x = 0, and plugging in x = 0 leaves just c, so c = -3 from the marked point (0, -3). The vertex is at x = 2, and the vertex of ax² + bx + c is at x = -b/(2a). With a = 1/2, that's -b/(2 · 1/2) = -b, so -b = 2 and b = -2. Then bc = (-2)(-3) = 6. -6 gets the sign of b wrong (b = 2). 10 uses the vertex's y-value, -5, as c; c is the y-intercept, not the minimum. 12 drops a from the formula, solving -b/2 = 2 to get b = -4.",
          figure: {"kind": "geometry", "points": {"p0": [2, -5], "p1": [0, -3]}, "dots": ["p0", "p1"], "paths": [{"points": [[-2.1824, 3.7461], [-2.1063, 3.431], [-2.0303, 3.1216], [-1.9542, 2.818], [-1.8782, 2.5202], [-1.8022, 2.2282], [-1.7261, 1.942], [-1.6501, 1.6615], [-1.574, 1.3868], [-1.498, 1.118], [-1.4219, 0.8548], [-1.3459, 0.5975], [-1.2699, 0.346], [-1.1938, 0.1002], [-1.1178, -0.1398], [-1.0417, -0.3739], [-0.9657, -0.6024], [-0.8896, -0.825], [-0.8136, -1.0418], [-0.7376, -1.2529], [-0.6615, -1.4582], [-0.5855, -1.6577], [-0.5094, -1.8514], [-0.4334, -2.0393], [-0.3573, -2.2215], [-0.2813, -2.3978], [-0.2053, -2.5684], [-0.1292, -2.7332], [-0.0532, -2.8923], [0.0229, -3.0455], [0.0989, -3.1929], [0.175, -3.3346], [0.251, -3.4705], [0.3271, -3.6006], [0.4031, -3.7249], [0.4791, -3.8435], [0.5552, -3.9562], [0.6312, -4.0632], [0.7073, -4.1644], [0.7833, -4.2598], [0.8594, -4.3495], [0.9354, -4.4333], [1.0114, -4.5114], [1.0875, -4.5837], [1.1635, -4.6502], [1.2396, -4.7109], [1.3156, -4.7658], [1.3917, -4.815], [1.4677, -4.8583], [1.5437, -4.8959], [1.6198, -4.9277], [1.6958, -4.9537], [1.7719, -4.974], [1.8479, -4.9884], [1.924, -4.9971], [2, -5], [2.076, -4.9971], [2.1521, -4.9884], [2.2281, -4.974], [2.3042, -4.9537], [2.3802, -4.9277], [2.4563, -4.8959], [2.5323, -4.8583], [2.6083, -4.815], [2.6844, -4.7658], [2.7604, -4.7109], [2.8365, -4.6502], [2.9125, -4.5837], [2.9886, -4.5114], [3.0646, -4.4333], [3.1406, -4.3495], [3.2167, -4.2598], [3.2927, -4.1644], [3.3688, -4.0632], [3.4448, -3.9562], [3.5209, -3.8435], [3.5969, -3.7249], [3.673, -3.6006], [3.749, -3.4705], [3.825, -3.3346], [3.9011, -3.1929], [3.9771, -3.0455], [4.0532, -2.8923], [4.1292, -2.7332], [4.2053, -2.5684], [4.2813, -2.3978], [4.3573, -2.2215], [4.4334, -2.0393], [4.5094, -1.8514], [4.5855, -1.6577], [4.6615, -1.4582], [4.7376, -1.2529], [4.8136, -1.0418], [4.8896, -0.825], [4.9657, -0.6024], [5.0417, -0.3739], [5.1178, -0.1398], [5.1938, 0.1002], [5.2699, 0.346], [5.3459, 0.5975], [5.4219, 0.8548], [5.498, 1.118], [5.574, 1.3868], [5.6501, 1.6615], [5.7261, 1.942], [5.8022, 2.2282], [5.8782, 2.5202], [5.9542, 2.818], [6.0303, 3.1216], [6.1063, 3.431], [6.1824, 3.7461]], "arrows": true}], "axes": {"x": [-3, 7], "y": [-6, 4], "step": 1}},
          difficulty: "hard",
          why: ["Check the sign of b: −b/(2 · 1/2) = 2 gives −b = 2, so b = −2, not 2.", "c is the y-intercept, −3. The vertex's y-value, −5, is the minimum, not c.", "This drops a from −b/(2a). With a = 1/2, the denominator is 1, so b = −2.", null],
        },
      ],
      traps: [
        "Reporting the wrong coordinate or the wrong feature — giving the time of the maximum instead of the maximum value, or treating the y-intercept (the starting value) as the point where the height reaches 0 (an x-intercept).",
        "Reading the horizontal asymptote, the level an exponential curve flattens toward, as the y-intercept, which is where the curve actually crosses x = 0.",
        "Choosing an interval where the graph falls instead of rises, or writing an increasing interval with y-values instead of the x-values it runs between.",
        "Slipping when working backward to a coefficient: from the vertex at x = -b/(2a), b = -2a·(vertex x), so dropping a or losing a negative sign gives the wrong b.",
      ],
    },
    {
      name: "Zeros, Factors, and x-Intercepts of Polynomials",
      explanation:
        "These questions connect three views of one fact: if p(a) = 0, then a is a zero of p, the graph of p meets the x-axis at (a, 0), and (x - a) is a factor of p(x). So x-intercepts at 3 and -2 mean (x - 3) and (x + 2) are factors; the sign in the factor is always the opposite of the zero. Going the other way, set each factor of a factored polynomial equal to 0 (the zero product property): 2x + 3 = 0 gives x = -3/2, and a repeated factor like (x - 1)² gives just one zero, where the graph touches the axis without crossing. To build a quadratic from its zeros, write a(x - r)(x - s) with the given leading coefficient and expand. To count distinct real solutions, list the different real values: x² = -4 has none, x³ = 8 has one, and x^4 = 16 has two (2 and -2). When the input is shifted, as in p(k - 2) = 0, set k - 2 equal to each zero and solve for k. Wrong answers usually flip a sign between a zero and its factor, count a repeated or non-real solution, or shift the wrong way.",
      examples: [
        {
          q: "The graph of the polynomial function y = p(x) is shown in the xy-plane. The graph crosses the x-axis only at the marked points.\n\nWhich of the following must be a factor of p(x)?",
          choices: ["x + 2", "x - 2", "x + 1", "x + 4"],
          answer: 0,
          explain:
            "Each x-intercept of a polynomial's graph is a zero, and every zero gives a factor: if p(a) = 0, then (x - a) is a factor of p(x). The graph crosses the x-axis at x = -2, 1, and 4, so the factors are (x - (-2)) = (x + 2), (x - 1), and (x - 4). Only x + 2 is among the choices. x - 2 flips the sign of the zero at -2: it would mean a zero at x = 2, where the graph doesn't touch the axis. x + 1 flips the sign of the zero at 1, and x + 4 flips the sign of the zero at 4; the correct factors for those are x - 1 and x - 4.",
          figure: {"kind": "geometry", "points": {"p0": [-2, 0], "p1": [1, 0], "p2": [4, 0]}, "dots": ["p0", "p1", "p2"], "paths": [{"points": [[-2.6244, -3.7477], [-2.5585, -3.2585], [-2.4926, -2.7924], [-2.4267, -2.3491], [-2.3608, -1.9281], [-2.2949, -1.5291], [-2.229, -1.1514], [-2.1631, -0.7948], [-2.0972, -0.4589], [-2.0313, -0.143], [-1.9654, 0.153], [-1.8995, 0.4298], [-1.8336, 0.6876], [-1.7677, 0.9271], [-1.7018, 1.1484], [-1.6359, 1.3522], [-1.57, 1.5388], [-1.5041, 1.7087], [-1.4382, 1.8623], [-1.3723, 1.9999], [-1.3064, 2.1222], [-1.2405, 2.2294], [-1.1746, 2.322], [-1.1087, 2.4004], [-1.0428, 2.4651], [-0.9769, 2.5165], [-0.911, 2.555], [-0.8451, 2.5811], [-0.7792, 2.5952], [-0.7133, 2.5976], [-0.6474, 2.5889], [-0.5815, 2.5695], [-0.5156, 2.5398], [-0.4498, 2.5002], [-0.3839, 2.4511], [-0.318, 2.3931], [-0.2521, 2.3264], [-0.1862, 2.2516], [-0.1203, 2.1691], [-0.0544, 2.0793], [0.0115, 1.9826], [0.0774, 1.8795], [0.1433, 1.7703], [0.2092, 1.6556], [0.2751, 1.5357], [0.341, 1.4112], [0.4069, 1.2823], [0.4728, 1.1495], [0.5387, 1.0134], [0.6046, 0.8742], [0.6705, 0.7324], [0.7364, 0.5885], [0.8023, 0.4429], [0.8682, 0.296], [0.9341, 0.1482], [1, 0], [1.0659, -0.1482], [1.1318, -0.296], [1.1977, -0.4429], [1.2636, -0.5885], [1.3295, -0.7324], [1.3954, -0.8742], [1.4613, -1.0134], [1.5272, -1.1495], [1.5931, -1.2823], [1.659, -1.4112], [1.7249, -1.5357], [1.7908, -1.6556], [1.8567, -1.7703], [1.9226, -1.8795], [1.9885, -1.9826], [2.0544, -2.0793], [2.1203, -2.1691], [2.1862, -2.2516], [2.2521, -2.3264], [2.318, -2.3931], [2.3839, -2.4511], [2.4497, -2.5002], [2.5156, -2.5398], [2.5815, -2.5695], [2.6474, -2.5889], [2.7133, -2.5976], [2.7792, -2.5952], [2.8451, -2.5811], [2.911, -2.555], [2.9769, -2.5165], [3.0428, -2.4651], [3.1087, -2.4004], [3.1746, -2.322], [3.2405, -2.2294], [3.3064, -2.1222], [3.3723, -1.9999], [3.4382, -1.8623], [3.5041, -1.7087], [3.57, -1.5388], [3.6359, -1.3522], [3.7018, -1.1484], [3.7677, -0.9271], [3.8336, -0.6876], [3.8995, -0.4298], [3.9654, -0.153], [4.0313, 0.143], [4.0972, 0.4589], [4.1631, 0.7948], [4.229, 1.1514], [4.2949, 1.5291], [4.3608, 1.9281], [4.4267, 2.3491], [4.4926, 2.7924], [4.5585, 3.2585], [4.6244, 3.7477]], "arrows": true}], "axes": {"x": [-3, 5], "y": [-4, 4], "step": 1}},
          difficulty: "easy",
          why: [null, "x − 2 would mean a zero at x = +2. The intercept is at −2, which gives x + 2.", "The zero at x = 1 gives the factor x − 1, not x + 1.", "The zero at x = 4 gives the factor x − 4, not x + 4."],
        },
        {
          q: "The function f is defined by f(x) = (x - 4)(2x + 3)(x + 1). Which of the following is an x-intercept of the graph of y = f(x) in the xy-plane?",
          choices: ["(3/2, 0)", "(1, 0)", "(-3/2, 0)", "(-3, 0)"],
          answer: 2,
          explain:
            "An x-intercept is where f(x) = 0, and a product is 0 only when one of its factors is 0 (the zero product property). Set each factor equal to 0: x - 4 = 0 gives x = 4; 2x + 3 = 0 gives 2x = -3, so x = -3/2; and x + 1 = 0 gives x = -1. So (-3/2, 0) is an x-intercept. (3/2, 0) solves 2x - 3 = 0, flipping the sign. (1, 0) flips the sign of the zero from x + 1, which is x = -1. (-3, 0) stops at 2x = -3 without dividing by 2.",
          difficulty: "easy",
          why: ["2x + 3 = 0 gives x = −3/2. The sign is negative.", "x + 1 = 0 gives x = −1, not 1.", null, "2x + 3 = 0 gives 2x = −3; divide by 2 to get x = −3/2."],
        },
        {
          q: "How many distinct real solutions does the equation (x - 3)²(x² - 9)(x² + 4) = 0 have?",
          choices: ["3", "4", "6", "2"],
          answer: 3,
          explain:
            "Set each factor equal to 0 and collect the different real values of x. (x - 3)² = 0 gives x = 3. x² - 9 = 0 gives x² = 9, so x = 3 or x = -3. x² + 4 = 0 gives x² = -4, and no real number squared is negative, so this factor adds nothing. The distinct real solutions are 3 and -3: two in all. 3 counts x = 3 twice, once from each factor that produces it. 4 treats x² = -4 as if it gave x = 2 and x = -2; it gives no real solutions (2² is 4, not -4). 6 is the degree of the polynomial, which counts every solution with repeats and non-real ones included.",
          difficulty: "medium",
          why: ["x = 3 comes from two factors, but it's one solution. The distinct real solutions are 3 and −3.", "x² = −4 has no real solutions: 2² is 4, not −4.", "6 is the degree. It counts x = 3 more than once and includes the non-real solutions of x² = −4.", null],
        },
        {
          q: "The function f(x) = ax² + bx + c, where a, b, and c are constants, has zeros at x = -1 and x = 5, and a = 2. What is the value of b + c?",
          choices: ["-2", "-18", "-9", "2"],
          answer: 1,
          explain:
            "Zeros at -1 and 5 mean (x + 1) and (x - 5) are factors, and the leading coefficient 2 multiplies the whole product: f(x) = 2(x + 1)(x - 5). Expanding, (x + 1)(x - 5) = x² - 4x - 5, so f(x) = 2x² - 8x - 10. Then b = -8 and c = -10, and b + c = -18. -2 comes from the factors (x - 1)(x + 5), which flip both zeros' signs: 2(x² + 4x - 5) gives b + c = 8 - 10. -9 forgets to multiply by a = 2, using x² - 4x - 5. 2 slips the sign of the constant: -8 + 10.",
          difficulty: "medium",
          why: ["These factors, (x − 1)(x + 5), give zeros at 1 and −5. A zero at −1 means x + 1.", null, "This forgets a = 2. Multiply every term: 2x² − 8x − 10.", "The constant is 2(1)(−5) = −10, so b + c = −8 + (−10) = −18."],
        },
        {
          q: "The function p is defined by p(x) = (x + 4)(x - 1)(x - 6). If p(k - 2) = 0, what is the sum of all possible values of k?",
          choices: ["9", "3", "-3", "-9"],
          answer: 0,
          explain:
            "p equals 0 only at its zeros, x = -4, 1, and 6. So p(k - 2) = 0 means the input k - 2 must be one of those zeros: k - 2 = -4, k - 2 = 1, or k - 2 = 6. Adding 2 to each gives k = -2, 3, or 8, and the sum is -2 + 3 + 8 = 9. (Each k is exactly 2 more than a zero, so the sum is 3 + 3 · 2.) 3 is the sum of the zeros themselves, forgetting that the input is k - 2, not k. -3 subtracts 2 from each zero instead of adding it. -9 also flips the zeros' signs, reading (x + 4) as a zero at 4.",
          difficulty: "hard",
          why: [null, "3 is the sum of p's zeros. Here k − 2 is the zero, so each k is 2 more.", "If k − 2 = −4, then k = −2: add 2 to each zero, don't subtract.", "The zeros are −4, 1, and 6 (opposite signs from the factors), and each k is 2 more than a zero."],
        },
      ],
      traps: [
        "Flipping the sign between a zero and its factor — an x-intercept at 3 gives the factor (x - 3), and the factor (x + 4) gives the zero x = -4.",
        "Miscounting solutions: counting a repeated value like x = 3 more than once, treating x² = -4 as if it had real solutions, or missing one, such as the zero x = 0 from a factor of x or the negative solution of x^4 = 16.",
        "Stopping one step early on a factor with a coefficient: 2x + 3 = 0 gives x = -3/2, not -3.",
        "Shifting in the wrong direction when the input is changed: if p(k - 2) = 0, then k - 2 is a zero of p, so k is 2 more than that zero, not 2 less.",
      ],
    },
  ],
  tipsAndTricks: [
    "If a function is already in vertex form, a(x-h)² + k, the vertex (h, k) can be read directly — don't waste time completing the square or using other methods when this shortcut applies.",
    "Any 'percent per period' word problem (growth, decay, interest, depreciation) needs an exponential model, not a linear one — spot the phrase 'percent' or '% per year/month' as your signal.",
    "For exponential decay, the base is (1 - rate), not the rate itself; for growth, it's (1 + rate) — writing this formula down before plugging in numbers prevents a common setup error.",
  ],
};

const LC_M_RATIOS_RATES: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Setting Up Proportions Correctly",
      explanation:
        "The most reliable trick for ratio and rate word problems: set up two fractions with matching units in matching positions (both numerators are the same kind of quantity, both denominators are the same kind of quantity) then cross-multiply. Errors here almost always come from a mismatched setup, not from the arithmetic itself. Some questions need only one division: a unit rate such as population density (people per square mile) or density (grams per cubic centimeter). Let the units tell you the direction: 'people per square mile' means people ÷ square miles. To work backward from a rate, multiply the rate by the amount (people = density × area) or divide by the rate (area = people ÷ density).",
      examples: [
        {
          q: "A recipe uses 2 cups of flour for 12 cookies. How many cups are needed for 30 cookies?",
          choices: ["5", "180", "0.8", "20"],
          answer: 0,
          explain:
            "Setting up a proportion with matching units, (cups)/(cookies) = (cups)/(cookies), gives 2/12 = x/30; cross-multiplying gives 12x = 60, so x = 5. 180 comes from flipping which side of the proportion is numerator vs. denominator (setting up 2/12 = 30/x instead), producing the reciprocal relationship. 0.8 comes from dividing in the wrong direction entirely (2×12/30). 20 comes from treating the given numbers as if they could simply be added and subtracted instead of set into a proportion.",
          difficulty: "easy",
          why: [null, "180 comes from setting up 2/12 = 30/x, which flips one side. Keep cups over cookies on both sides: 2/12 = x/30.", "0.8 divides in the wrong direction. More cookies need more flour, so the answer must be more than 2.", "Check it: 2 cups for 12 cookies is 1 cup per 6 cookies, so 30 cookies need 5 cups, not 20."],
        },
        {
          q: "A factory produces 45 units in 3 hours. At this rate, how many hours will it take to produce 225 units?",
          choices: ["15", "3", "5", "675"],
          answer: 0,
          explain:
            "Setting up a proportion with matching units, (units)/(hours) = (units)/(hours), gives 45/3 = 225/x; cross-multiplying gives 45x = 675, so x = 15. 3 mistakes the original given hours for the answer, without doing any calculation. 5 comes from computing the scale factor 225/45 = 5 correctly but forgetting to multiply it by the original 3 hours. 675 comes from cross-multiplying correctly but forgetting the final division step, leaving 45x itself as the answer.",
          difficulty: "medium",
          why: [null, "3 hours is how long 45 units take. 225 units is five times as many.", "5 is the scale factor (225 ÷ 45). Multiply it by 3 hours to get 15.", "675 is 45x. Divide by 45 to get x = 15."],
        },
        {
          q: "A car uses 3 gallons of gas to travel 75 miles. How many gallons are needed to travel 200 miles?",
          choices: ["8", "8.33", "5", "600"],
          answer: 0,
          explain:
            "Setting up a proportion with matching units, 3/75 = x/200, and cross-multiplying gives 75x = 600, so x = 8. 8.33 comes from an arithmetic slip in the final division step. 5 confuses this problem with a similar-looking one, using the wrong given numbers. 600 comes from cross-multiplying correctly but forgetting to complete the final division step.",
          difficulty: "easy",
          why: [null, "The division comes out exactly: 600 ÷ 75 = 8. There's no decimal.", "Check it: 5 gallons at 25 miles per gallon goes only 125 miles.", "600 is 75x. Divide by 75 to get 8."],
        },
        {
          q: "A recipe uses 3/4 cup of sugar for 18 cookies. How many cups of sugar are needed for 30 cookies?",
          choices: ["1.25", "0.75", "1.8", "22.5"],
          answer: 0,
          explain:
            "Setting up a proportion with matching units, (3/4)/18 = x/30, and cross-multiplying gives 18x = 30 × (3/4) = 22.5, so x = 22.5/18 = 1.25. 0.75 just restates the original 3/4 cup without scaling it to the new number of cookies. 1.8 comes from a division error when finishing the last step. 22.5 comes from cross-multiplying correctly but forgetting to divide by 18 to isolate x.",
          difficulty: "medium",
          why: [null, "0.75 is the sugar for 18 cookies. 30 cookies need more.", "Check it: 1.8 cups for 30 cookies is 0.06 cups each, but the recipe uses 0.75 ÷ 18, about 0.042 cups each.", "22.5 is 18x. Divide by 18 to get 1.25."],
        },
        {
          q: "In 2020, Marlow County had a population of 52,650 and a land area of 390 square miles. Neighboring Pell County had a population of 61,200 and a land area of 510 square miles. How many more people per square mile lived in Marlow County than in Pell County?",
          choices: ["8,550", "15", "71.25", "120"],
          answer: 1,
          explain:
            "Population density is people per square mile, so divide each county's population by its own area. Marlow: 52,650 ÷ 390 = 135. Pell: 61,200 ÷ 510 = 120. Marlow has 135 − 120 = 15 more people per square mile, even though Pell has more people. 8,550 compares total populations and ignores area. 71.25 divides the difference in population by the difference in area, which isn't either county's density. 120 is Pell County's density alone.",
          difficulty: "medium",
          why: ["8,550 is the difference in total population. Density divides each population by its own area first.", null, "71.25 divides the population difference by the area difference. Find each density on its own: 135 and 120.", "120 is Pell County's density. Marlow's is 52,650 ÷ 390 = 135, so the difference is 15."],
        },
        {
          q: "A factory's 5 machines produce 600 units in 4 hours. If 2 of the machines break down, how many units will the remaining machines produce in 6 hours, assuming each machine works at the same constant rate?",
          choices: ["540", "900", "360", "450"],
          answer: 0,
          explain:
            "Finding the rate per single machine first, 600 units ÷ 5 machines ÷ 4 hours = 30 units per machine per hour; applying this to 3 remaining machines over 6 hours gives 3 × 30 × 6 = 540 units. 900 comes from forgetting to reduce the number of machines from 5 to 3 in the final multiplication. 360 comes from using the original 4 hours instead of the new 6 hours. 450 comes from using 2 (the number that broke down) instead of the 3 machines that remain.",
          difficulty: "hard",
          why: [null, "900 uses all 5 machines. Only 3 are still working.", "360 uses the original 4 hours. The question asks about 6 hours.", "450 isn't 3 machines × 30 units × 6 hours. Use the 3 machines that still work: 540."],
        },
      ],
      traps: [
        "Setting up the proportion with mismatched units (e.g., cups over cookies on one side, cookies over cups on the other).",
        "Cross-multiplying correctly but from an incorrectly set-up proportion, producing a confidently wrong answer.",
        "Dividing a unit rate the wrong way (square miles per person instead of people per square mile), or multiplying when the rate calls for division; the units in the question tell you which quantity goes on top.",
      ],
    },
    {
      name: "Unit Conversion Chains",
      explanation:
        "This pattern requires converting between units (like miles to feet, or hours to seconds), before or after a rate calculation. The safest method: write out a chain of conversion factors, each one arranged so the unwanted unit cancels out (appearing once on top, once on bottom). That's more reliable than trying to remember whether to multiply or divide by the conversion number. Areas and volumes need the factor more than once: because 1 yard = 3 feet, 1 square yard = 3 × 3 = 9 square feet and 1 cubic yard = 3 × 3 × 3 = 27 cubic feet. So square the length conversion for square units, cube it for cubic units, and put every length in the same unit before multiplying dimensions together.",
      examples: [
        {
          q: "A car travels at 60 miles per hour. What is this speed in feet per minute? (1 mile = 5,280 feet)",
          choices: ["5,280", "316,800", "88", "63,360"],
          answer: 0,
          explain:
            "Chaining conversions so units cancel, 60 miles/hour × 5,280 feet/mile × 1 hour/60 minutes leaves (60 × 5,280)/60 = 5,280 feet per minute. 316,800 comes from forgetting to divide by 60 to convert hours to minutes — that's feet per hour, not per minute. 88 confuses this with the well-known fact that 60 mph equals 88 feet per second, applying that conversion to the wrong unit of time. 63,360 comes from a units mix-up that leaves an extra, unneeded factor in the computation.",
          difficulty: "easy",
          why: [null, "316,800 is feet per hour. Divide by 60 to get feet per minute.", "88 is feet per second. The question asks for feet per minute.", "63,360 is the number of inches in a mile, not a speed in feet per minute."],
        },
        {
          q: "A runner's pace is 9 minutes per mile. What is this pace in seconds per 100 meters? (1 mile ≈ 1,609 meters)",
          choices: ["≈33.6 seconds", "≈5.4 seconds", "≈540 seconds", "≈3.36 seconds"],
          answer: 0,
          explain:
            "Converting minutes to seconds first gives 9 min/mile × 60 sec/min = 540 sec/mile; dividing by the meters in a mile (540/1,609 ≈ 0.336 sec/meter) and scaling to 100 meters (0.336 × 100) gives about 33.6 seconds. ≈5.4 seconds comes from scaling to 100 meters before finishing the meters conversion, an out-of-order calculation. ≈540 seconds mistakenly reports the seconds-per-mile figure without scaling it down to the smaller 100-meter distance. ≈3.36 seconds comes from a misplaced decimal point when scaling to 100 meters.",
          difficulty: "medium",
          why: [null, "5.4 divides 540 by 100 instead of by the meters in a mile first.", "540 seconds is the time for a whole mile, not 100 meters.", "The decimal is off by a factor of 10: 0.336 seconds per meter × 100 = 33.6."],
        },
        {
          q: "A container holds 3 liters of liquid. How many milliliters is this? (1 liter = 1,000 milliliters)",
          choices: ["3,000", "300", "0.003", "30"],
          answer: 0,
          explain:
            "Multiplying 3 liters by the conversion factor 1,000 milliliters/liter gives 3 × 1,000 = 3,000 milliliters. 300 and 30 come from misplaced decimal points using the wrong power of ten. 0.003 comes from dividing instead of multiplying by the conversion factor, inverting the relationship entirely.",
          difficulty: "easy",
          why: [null, "A liter is 1,000 milliliters, so multiply by 1,000, not 100.", "Milliliters are smaller than liters, so the number should get bigger. This divides instead.", "A liter is 1,000 milliliters, so it's 3 × 1,000 = 3,000."],
        },
        {
          q: "A rectangular room measures 4 yards by 3 yards. What is its area in square feet? (1 yard = 3 feet)",
          choices: ["108", "36", "12", "324"],
          answer: 0,
          explain:
            "Since 1 yard = 3 feet, converting an area (not a length) requires squaring the linear conversion factor, giving 1 square yard = 9 square feet; the room's area is 4 × 3 = 12 square yards, so in square feet it's 12 × 9 = 108. 36 mistakenly converts only one of the two dimensions instead of accounting for both. 12 reports the area in square yards without ever converting to square feet. 324 comes from squaring the total square-yard area itself (12²) instead of just the conversion factor.",
          difficulty: "medium",
          why: [null, "36 converts only one side to feet. Both sides need converting: 12 × 9 = 108.", "12 is the area in square yards. Each square yard is 9 square feet.", "324 multiplies by 27, the conversion for cubic yards. Area uses 3² = 9."],
        },
        {
          q: "A cyclist travels at 8 meters per second. What is this speed in miles per hour, rounded to the nearest whole number? (1 mile ≈ 1,609 meters)",
          choices: ["≈18", "≈8", "≈29", "≈4,969"],
          answer: 0,
          explain:
            "Converting seconds to hours first gives 8 meters/second × 3,600 seconds/hour = 28,800 meters/hour; dividing by the meters in a mile (28,800/1,609 ≈ 17.9) rounds to about 18 miles per hour. ≈8 mistakenly reports the original speed in meters per second as if it were already in miles per hour. ≈29 comes from converting meters to miles before converting seconds to hours, an out-of-order calculation that produces the wrong scale. ≈4,969 comes from forgetting to divide by 1,609 at all, leaving the answer in meters per hour.",
          difficulty: "hard",
          why: [null, "8 is meters per second, not miles per hour.", "29 is about kilometers per hour (28,800 ÷ 1,000). A mile is 1,609 meters.", "The speed is 28,800 meters per hour. Divide by 1,609 to get about 18 miles per hour."],
        },
        {
          q: "A landscaper will spread mulch 4 inches deep over a rectangular yard that is 30 feet long and 18 feet wide. Mulch is sold by the cubic yard. To the nearest tenth, how many cubic yards of mulch are needed? (1 yard = 3 feet, 1 foot = 12 inches)",
          choices: ["80", "6.7", "20", "60"],
          answer: 1,
          explain:
            "Put every length in feet first: 4 inches is 4 ÷ 12 = 1/3 foot, so the mulch fills 30 × 18 × 1/3 = 180 cubic feet. A cubic yard is 3 × 3 × 3 = 27 cubic feet, because the 3-feet-per-yard factor applies once for each of the three dimensions. So 180 ÷ 27 ≈ 6.7 cubic yards. 80 uses 4 feet as the depth instead of 4 inches (30 × 18 × 4 = 2,160, and 2,160 ÷ 27 = 80). 20 divides 180 by 9, the factor for square yards, and 60 divides by 3, the factor for plain yards of length.",
          difficulty: "hard",
          why: ["80 treats the 4-inch depth as 4 feet. Convert first: 4 inches = 1/3 foot.", null, "20 divides by 9, the conversion for square yards. Volume needs cubic yards: 3 × 3 × 3 = 27 cubic feet each.", "60 divides by 3, the conversion for yards of length. A cubic yard is 27 cubic feet."],
        },
      ],
      traps: [
        "Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).",
        "Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.",
        "Using the plain length conversion for an area or volume (dividing square feet by 3 to get square yards) instead of squaring it for area or cubing it for volume.",
      ],
    },
    {
      name: "Expressing One Quantity as an Algebraic Ratio Expression",
      explanation:
        "This pattern doesn't ask for a specific number — it asks you to write an algebraic expression for one quantity in terms of another, using a given ratio. The method: translate the ratio into a fraction exactly as stated, then multiply or divide the given variable by that fraction. Double-check that the variable ends up multiplied or divided in the direction that actually matches the ratio.",
      examples: [
        {
          q: "At a bakery, the ratio of loaves of bread baked to bags of flour used is 4 to 1. If f bags of flour are used, which expression represents the number of loaves baked?",
          choices: ["4f", "f/4", "f + 4", "4 + f"],
          answer: 0,
          explain:
            "For every 1 bag of flour there are 4 loaves, so loaves = 4 × flour, giving 4f for f bags. f/4 reverses the ratio, expressing flour in terms of loaves instead. f + 4 and 4 + f incorrectly treat the ratio as an additive relationship rather than a multiplicative one.",
          difficulty: "easy",
          why: [null, "This reverses the ratio. There are more loaves than bags, so multiply: 4f.", "A ratio of 4 to 1 means multiply, not add.", "Same problem: a ratio is multiplication, not addition."],
        },
        {
          q: "A school's ratio of teachers to students is 1 to 22. If there are s students, which expression represents the number of teachers?",
          choices: ["s/22", "22s", "s - 22", "s/1"],
          answer: 0,
          explain:
            "There's 1 teacher for every 22 students, so teachers = students ÷ 22, giving s/22. 22s reverses the ratio, as if there were 22 teachers per student. s - 22 incorrectly treats the ratio as additive. s/1 drops the ratio's denominator entirely.",
          difficulty: "easy",
          why: [null, "22s would mean 22 teachers per student. There's 1 teacher per 22 students.", "A ratio means divide, not subtract 22.", "s/1 is just the number of students. Divide by 22 for teachers."],
        },
        {
          q: "At a robotics competition, the ratio of judges to teams is 1 to 8. If there are j judges at the competition, which expression represents the number of teams?",
          choices: ["8j", "j/8", "j + 8", "8 - j"],
          answer: 0,
          explain:
            "For every 1 judge there are 8 teams, so teams = 8 × judges, giving 8j for j judges. j/8 reverses the ratio, representing judges in terms of a given number of teams instead. j + 8 and 8 - j incorrectly treat the ratio as additive rather than multiplicative.",
          difficulty: "medium",
          why: [null, "This reverses the ratio. There are more teams than judges, so multiply: 8j.", "A ratio of 1 to 8 means multiply, not add.", "A ratio means multiply. Subtracting j from 8 makes no sense here."],
        },
        {
          q: "In a bag of marbles, 3 out of every 10 marbles are blue. If the bag contains m marbles total, which expression represents the number of blue marbles?",
          choices: ["(3/10)m", "(10/3)m", "3m - 10", "m/3"],
          answer: 0,
          explain:
            "Since the ratio compares blue marbles to the TOTAL (3 out of every 10 total, a part-to-whole ratio), blue marbles = 3/10 of the total, giving (3/10)m. (10/3)m inverts the fraction, as if 3 were the total and 10 were the part. 3m - 10 incorrectly treats the ratio as an additive adjustment. m/3 drops the numerator of the ratio entirely.",
          difficulty: "medium",
          why: [null, "This flips the fraction. Blue marbles are 3 out of every 10, so 3/10 of the total.", "A ratio means multiply by a fraction, not subtract.", "m/3 would make a third of the marbles blue. It's 3 out of 10."],
        },
        {
          q: "At a company, the ratio of managers to engineers is 1 to 6, and the ratio of engineers to interns is 3 to 10. If there are m managers, which expression represents the number of interns, in terms of m?",
          choices: ["20m", "18m", "m/20", "60m"],
          answer: 0,
          explain:
            "Translating managers to engineers first gives engineers = 6 × managers = 6m; translating engineers to interns using the second ratio (engineers:interns = 3:10) gives interns = (10/3) × engineers, and substituting 6m gives (10/3)(6m) = 20m. 18m comes from multiplying the two ratio numbers (6 × 3) directly instead of correctly chaining the ratios. m/20 inverts the final relationship. 60m comes from multiplying together all the given ratio numbers without correctly inverting the second ratio (3/10 vs. 10/3).",
          difficulty: "hard",
          why: [null, "18m multiplies 6 by 3. Engineers to interns is 3 to 10, so interns = (10/3) × 6m = 20m.", "This flips the result. There are more interns than managers.", "60m multiplies 6 by 10 without dividing by 3. Interns = (10/3)(6m) = 20m."],
        },
      ],
      traps: [
        "Flipping the ratio's fraction upside down, expressing the reciprocal relationship instead of the one actually described.",
        "Confusing a part-to-part ratio (like judges to teams) with a part-to-whole ratio (like blue marbles to all marbles), which require different expressions.",
        "Multiplying by the ratio when division was needed, or vice versa, especially across similar-looking problems where the given variable's role changes.",
      ],
    },
  ],
  tipsAndTricks: [
    "Always write units next to every number in a ratio/rate problem — if the units don't visually cancel correctly in your setup, the setup is wrong, regardless of how the arithmetic looks.",
    "For proportions, keep the same type of quantity in the same position (numerator or denominator) on both sides of the equation before cross-multiplying.",
    "For multi-step unit conversions, chain the conversion factors so each unwanted unit appears once on top and once on bottom, letting them cancel algebraically rather than guessing multiply vs. divide.",
  ],
};

const LC_M_PERCENTAGES: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Straightforward Percent Change and Discount Problems",
      explanation:
        "Basic percentage problems (discounts, tax, tips, simple percent change) all follow the same formula: percent change = (new - old)/old × 100. For direct calculations, like 'find the sale price,' it's often faster to think in multipliers: a 25% discount means the customer pays 75% of the original price, so just multiply by 0.75 instead of calculating the discount amount and subtracting it. To reverse a change and find the original, divide by the multiplier: if a jacket costs $64 after a 20% discount, the original price was 64 ÷ 0.80 = $80. Adding 20% of $64 back on doesn't work, because the 20% was taken from the original price, not from $64. For a chain of percent relations ('the sale price is 15% less than the regular price, which is 40% more than the cost'), write each one as a multiplier on the quantity it refers to (sale = 0.85 × regular, regular = 1.40 × cost), then divide back through the chain one step at a time.",
      examples: [
        {
          q: "A shirt originally $40 is discounted 25%. What is the sale price?",
          choices: ["$30", "$10", "$35", "$50"],
          answer: 0,
          explain:
            "A 25% discount means the customer pays 100%-25%=75% of the original price; multiplying directly by that multiplier, 40 × 0.75 = $30. $10 mistakenly reports the discount amount itself instead of the sale price. $35 comes from subtracting the wrong amount, like a flat $5, instead of 25% of the price. $50 comes from adding the discount instead of subtracting it.",
          difficulty: "easy",
          why: [null, "$10 is the discount amount. The sale price is $40 − $10 = $30.", "$35 takes off only $5. 25% of $40 is $10.", "$50 adds the discount instead of subtracting it."],
        },
        {
          q: "A wholesaler buys an item for $50 and marks it up 40% to set the retail price. What is the retail price?",
          choices: ["$70", "$20", "$90", "$50.40"],
          answer: 0,
          explain:
            "A 40% markup means the retail price is 100%+40%=140% of the wholesale price; multiplying directly, 50 × 1.40 = $70. $20 mistakenly reports just the markup amount instead of the full retail price. $90 comes from misapplying the multiplier, like adding the markup twice. $50.40 comes from confusing 40% with 0.4%, a decimal-placement slip.",
          difficulty: "medium",
          why: [null, "$20 is the markup amount. The retail price is $50 + $20 = $70.", "$90 adds $40 instead of 40% of $50, which is $20.", "40% is 0.40, not 0.004. The markup is $20."],
        },
        {
          q: "A meal costs $60 before an 8% sales tax. What is the total cost including tax?",
          choices: ["$64.80", "$4.80", "$68", "$55.20"],
          answer: 0,
          explain:
            "An 8% tax means the customer pays 100%+8%=108% of the meal price; multiplying directly, 60 × 1.08 = $64.80. $4.80 mistakenly reports just the tax amount instead of the total cost. $68 comes from a rounding or arithmetic slip while adding the tax. $55.20 comes from subtracting the tax instead of adding it.",
          difficulty: "easy",
          why: [null, "$4.80 is the tax alone. Add it to the meal: $64.80.", "$68 adds $8 instead of 8% of $60, which is $4.80.", "$55.20 subtracts the tax. Tax gets added."],
        },
        {
          q: "After a 20% discount, a jacket costs $64. What was the original price?",
          choices: ["$80", "$76.80", "$51.20", "$84"],
          answer: 0,
          explain:
            "Since the discounted price is 80% of the original, 64 = original × 0.80, so dividing (not multiplying) gives original = 64/0.80 = $80. $76.80 adds 20% of $64 back on, but the 20% was taken from the original price, not from $64. $51.20 applies the discount a second time (64 × 0.80). $84 adds a flat $20 instead of reversing the percentage.",
          difficulty: "medium",
          why: [null, "$76.80 adds 20% of $64. The 20% was taken from the original price, so divide: 64 ÷ 0.80.", "$51.20 applies the discount again. Undo it by dividing: 64 ÷ 0.80 = 80.", "$84 adds $20. Undo the 20% discount by dividing by 0.80."],
        },
        {
          q: "A $50 meal has an 18% tip added first, and then a $10 discount coupon is applied to the total. What is the final price?",
          choices: ["$49", "$47.20", "$41.80", "$59"],
          answer: 0,
          explain:
            "Applying the operations in the stated order, the tip is calculated first: 50 × 1.18 = 59, and then the flat $10 discount is applied to that new total: 59 - 10 = 49. $47.20 comes from applying the $10 discount before the tip (50-10=40, ×1.18=47.20), reversing the correct order. $41.80 makes a similar order-and-arithmetic error. $59 mistakenly reports the pre-discount total, forgetting to subtract the coupon at all.",
          difficulty: "hard",
          why: [null, "$47.20 applies the coupon before the tip. The tip comes first: 50 × 1.18 = 59, then subtract 10.", "Check it: 50 × 1.18 = 59, and 59 − 10 = 49, not 41.80.", "$59 is the total with tip, before the $10 coupon."],
        },
        {
          q: "At a furniture store, the sale price of a desk is 15% less than its regular price, and the regular price is 40% more than the store's cost for the desk. If the sale price of the desk is $238, what is the store's cost for the desk?",
          choices: ["$280", "$190.40", "$200", "$164.22"],
          answer: 2,
          explain:
            "Write each relation as a multiplier on the quantity it refers to: sale = 0.85 × regular, and regular = 1.40 × cost. Then work backward by dividing. Regular price: 238 ÷ 0.85 = 280. Cost: 280 ÷ 1.40 = 200. (Check: 200 × 1.40 × 0.85 = 238.) $280 stops at the regular price, one step short. $190.40 combines the percents into a single 25% increase (40% − 15%) and divides 238 by 1.25, but the two percents are taken of different prices, so they can't be combined that way. $164.22 undoes each change with the opposite percent of the new value, adding 15% to $238 and then taking 40% off, instead of dividing by each multiplier.",
          difficulty: "hard",
          why: ["$280 is the regular price. One more step: the regular price is 40% more than the cost, so cost = 280 ÷ 1.40 = 200.", "$190.40 adds the percents into one 25% increase. The 40% and the 15% are taken of different prices, so undo them one at a time: 238 ÷ 0.85 ÷ 1.40.", null, "$164.22 adds 15% of $238 and then takes off 40%. Undo each change by dividing: 238 ÷ 0.85 = 280, and 280 ÷ 1.40 = 200."],
        },
      ],
      traps: [
        "Calculating the discount amount correctly but then forgetting to subtract it from the original price (reporting the discount amount itself as the final answer).",
        "Confusing 'the price is 25% off' with 'the price is 25% of the original' — these produce very different final prices.",
        "Undoing a percent change by applying the opposite percent to the new value (adding 20% back onto a sale price) instead of dividing by the multiplier.",
        "In a chain of percent relations, stopping partway, combining the percents by adding them, or applying a percent to the wrong quantity, instead of dividing by each multiplier in turn.",
      ],
    },
    {
      name: "Successive Percent Changes (Compounding, Not Additive)",
      explanation:
        "This trap pattern involves two or more percentage changes applied in sequence — like a 20% increase followed by a 20% decrease. Students often assume these cancel out to zero net change. They don't: percentage changes compound by multiplying, not adding. Apply them in sequence using multipliers to find the real (non-zero) net effect.",
      examples: [
        {
          q: "An item's price increases by 20% and then decreases by 20%. Compared to the original price, the final price is:",
          choices: ["4% lower", "The same (0% net change)", "4% higher", "40% lower"],
          answer: 0,
          explain:
            "Representing the original price as 100, a 20% increase gives 100×1.20=120, and a 20% decrease applied to that new price of 120 (not the original 100) gives 120×0.80=96 — a net 4% decrease, not zero. Assuming the changes cancel to 0% net change is the classic trap: percentage changes compound multiplicatively, not additively. 4% higher flips the direction of the net change. 40% lower comes from simply adding the two percentages together instead of applying them as sequential multipliers.",
          difficulty: "easy",
          why: [null, "The second 20% is taken from 120, not 100. 120 × 0.80 = 96, which is 4% lower.", "The price ends at 96, which is lower than 100, not higher.", "Adding the percents doesn't work. Apply them in turn: 100 → 120 → 96."],
        },
        {
          q: "A stock's price increases by 50% one month, then decreases by 50% the next month. Compared to the original price, the final price is:",
          choices: ["25% lower", "The same (0% net change)", "25% higher", "100% lower"],
          answer: 0,
          explain:
            "Representing the original as 100, a 50% increase gives 150, and a 50% decrease applied to the new 150 gives 75 — a net 25% decrease. Assuming the two 50% swings cancel out is the same additive-thinking trap that fails for any pair of equal-and-opposite percentages. 25% higher flips the direction. 100% lower would mean the price hit zero, which isn't what a 50% decrease does.",
          difficulty: "medium",
          why: [null, "The 50% drop is taken from 150, not 100. 150 × 0.5 = 75, which is 25% lower.", "The price ends at 75, lower than 100, not higher.", "100% lower would mean the price hit zero. A 50% drop from 150 leaves 75."],
        },
        {
          q: "A price increases by 10% and then increases by another 10%. Compared to the original price, the final price is:",
          choices: ["21% higher", "20% higher", "22% higher", "10% higher"],
          answer: 0,
          explain:
            "Representing the original as 100, the first 10% increase gives 110, and the second 10% increase applied to the new 110 (not the original 100) gives 121 — a 21% increase. 20% higher comes from simply adding the two percentages together instead of compounding them. 22% higher overcorrects, perhaps from a slip in the compounding calculation. 10% higher mistakenly ignores the second increase entirely.",
          difficulty: "easy",
          why: [null, "The second 10% is taken from 110, not 100. 110 × 1.1 = 121, a 21% increase.", "Check it: 100 × 1.1 × 1.1 = 121, not 122.", "This ignores the second increase. Both apply: 100 → 110 → 121."],
        },
        {
          q: "A stock's price decreases by 30% one month, then increases by 40% the next month. Compared to the original price, the final price is:",
          choices: ["2% lower", "10% higher", "2% higher", "10% lower"],
          answer: 0,
          explain:
            "Representing the original as 100, a 30% decrease gives 70, and a 40% increase applied to the new 70 (not the original 100) gives 98 — a net 2% decrease. 10% higher comes from simply subtracting the percentages (40%-30%=10%) instead of compounding them. 2% higher flips the direction of the correct net change. 10% lower makes the same additive mistake in the opposite direction.",
          difficulty: "medium",
          why: [null, "Subtracting the percents doesn't work. Apply them in turn: 100 → 70 → 98.", "The price ends at 98, below 100, so it's lower, not higher.", "Check it: 70 × 1.4 = 98, which is 2% lower, not 10%."],
        },
        {
          q: "A company's revenue increases by 10% in year one, decreases by 10% in year two, and increases by 10% again in year three. Compared to the original revenue, what is the revenue after year three?",
          choices: ["8.9% higher", "10% higher", "9% higher", "The same (0% net change)"],
          answer: 0,
          explain:
            "Applying each year's multiplier in sequence to the original 100 gives 110 after year one, 99 after year two's 10% decrease (applied to 110, not 100), and 108.9 after year three's 10% increase (applied to 99) — an 8.9% net increase. 10% higher mistakenly assumes the middle decrease exactly cancels one of the increases. 9% higher is a close but incorrect rounding of the compounding effect. Assuming 0% net change misapplies the same additive-cancellation error as the two-step cases, compounded across three steps instead of two.",
          difficulty: "hard",
          why: [null, "The decrease is taken from 110, so it removes more than 10 points. 100 → 110 → 99 → 108.9.", "The exact result is 108.9, an 8.9% increase. Nothing rounds here.", "The changes don't cancel. Applying them in turn gives 108.9."],
        },
      ],
      traps: [
        "Assuming a percentage increase and an equal percentage decrease cancel out to no net change — they don't, because the second percentage is applied to a different (already changed) base value.",
        "Adding or subtracting percentages directly (20% + (-20%) = 0%) instead of applying them as sequential multipliers.",
      ],
    },
    {
      name: "Percent, Part, and Whole: Solving for the Missing One",
      explanation:
        "Not every percentage question involves a change or discount; many just connect three numbers with no 'before and after': a part, a whole, and the percent the part is of the whole. The relationship is part = (percent ÷ 100) × whole, and the question gives two of the three and asks for the missing one. First label them: the whole is whatever's being compared TO, usually right after the word 'of,' and the part is the piece of it. To find the part, multiply: 40% of 150 is 0.40 × 150 = 60. To find the percent, divide the part by the whole: 75 out of 300 is 75 ÷ 300 = 0.25, or 25%. To find the whole, divide the part by the percent's decimal: if 18 is 30% of a number, the number is 18 ÷ 0.30 = 60. Convert small percents carefully (0.4% is 0.004), and don't be alarmed by a percent over 100, which just means the part is larger than the whole.",
      examples: [
        {
          q: "What percent of 300 is 75?",
          choices: ["25%", "4%", "225%", "75%"],
          answer: 0,
          explain:
            "Identifying the part (75) and the whole (300, since it follows 'of'), the ratio is 75/300=0.25, or 25%. 4% comes from dividing the whole by the part instead (300/75), inverting the ratio. 225% comes from an unrelated arithmetic slip, like subtracting instead of dividing. 75% mistakenly restates the part itself as if it were already the percent.",
          difficulty: "easy",
          why: [null, "4% divides 300 by 75. The part goes on top: 75 ÷ 300 = 25%.", "225 is 300 − 75, not a percent.", "75 is the part, not the percent. 75 is a quarter of 300: 25%."],
        },
        {
          q: "What is 40% of 150?",
          choices: ["60", "40", "110", "375"],
          answer: 0,
          explain:
            "Converting 40% to a decimal (0.40) and multiplying by the whole, 0.40 × 150 = 60. 40 mistakenly restates the percent itself as if it were the answer. 110 comes from subtracting the percent as if it were a flat quantity (150-40) instead of multiplying. 375 comes from dividing instead of multiplying (150/0.40).",
          difficulty: "easy",
          why: [null, "40 is the percent itself. 40% of 150 is 0.40 × 150 = 60.", "110 subtracts 40 from 150. A percent means multiply: 0.40 × 150.", "375 divides by 0.40. \"Of\" means multiply: 0.40 × 150 = 60."],
        },
        {
          q: "A class has 20 students, and 8 of them ride the bus to school. What percent of the class rides the bus?",
          choices: ["40%", "8%", "20%", "60%"],
          answer: 0,
          explain:
            "Identifying the part (8, the bus riders) and the whole (20, the total class), the ratio is 8/20=0.4, or 40%. 8% mistakes the raw count of bus riders for a percent. 20% mistakes the total class size for the percent. 60% reports the percent of students who do NOT ride the bus instead of who does.",
          difficulty: "medium",
          why: [null, "8 is the number of bus riders, not a percent. 8 out of 20 is 40%.", "20 is the class size, not a percent.", "60% is the share who don't ride the bus."],
        },
        {
          q: "45 is what percent of 36?",
          choices: ["125%", "80%", "9%", "100%"],
          answer: 0,
          explain:
            "Identifying the part (45) and the whole (36, following 'of'), noting that the part is larger than the whole here, the ratio is 45/36=1.25, or 125%; a result over 100% is valid and expected whenever the part exceeds the whole. 80% comes from inverting the ratio (36/45) instead of dividing the part by the whole. 9% comes from an unrelated arithmetic slip. 100% incorrectly assumes the two quantities must be treated as equal since they're being compared.",
          difficulty: "medium",
          why: [null, "80% divides 36 by 45. The part goes on top: 45 ÷ 36 = 125%.", "9 is 45 − 36, not a percent.", "45 is larger than 36, so it's more than 100% of it."],
        },
        {
          q: "A 2,500-milliliter water sample is 0.4% salt by volume. How many milliliters of salt are in the sample?",
          choices: ["100", "10", "625,000", "2,490"],
          answer: 1,
          explain:
            "The whole (2,500 milliliters) and the percent (0.4%) are given, so the missing piece is the part: multiply. As a decimal, 0.4% is 0.4 ÷ 100 = 0.004, and 0.004 × 2,500 = 10 milliliters. 100 converts 0.4% to 0.04, moving the decimal one place too few. 625,000 divides 2,500 by 0.004, which is how you'd find a whole from a part, not a part from a whole. 2,490 is the amount of the sample that is not salt.",
          difficulty: "medium",
          why: ["100 uses 0.04 for 0.4%. Percent means divide by 100: 0.4% = 0.004, and 0.004 × 2,500 = 10.", null, "625,000 divides by 0.004. The salt is a part of the sample, so multiply: 0.004 × 2,500.", "2,490 is the part of the sample that isn't salt."],
        },
        {
          q: "In a survey, 63 out of 180 respondents preferred option A, and the rest preferred option B. What percent of respondents preferred option B?",
          choices: ["65%", "35%", "63%", "31.5%"],
          answer: 0,
          explain:
            "Since the question doesn't give the part for option B directly, it must be found first: 180-63=117 respondents preferred option B, and the ratio 117/180=0.65, or 65%. 35% mistakenly reports the percent who preferred option A instead of B. 63% mistakes the raw count of option A responses for a percent. 31.5% comes from an unrelated miscalculation, like halving the wrong quantity.",
          difficulty: "hard",
          why: [null, "35% is the share who preferred option A (63 of 180).", "63 is the number who chose option A, not a percent.", "Option B has 180 − 63 = 117 people, and 117 ÷ 180 = 65%."],
        },
      ],
      traps: [
        "Reversing the part and the whole — dividing the whole by the part instead of the part by the whole.",
        "Treating a result over 100% as a sign of a mistake, when it's a completely valid outcome whenever the 'part' is actually larger than the 'whole.'",
        "Using the wrong quantity as the 'part' when the question requires an extra subtraction step to find it first (like a 'remaining' or 'the rest' amount).",
        "Dividing when you should multiply, or the reverse: to find the part, multiply the whole by the percent's decimal; to find the whole, divide the part by it.",
        "Converting a percent to a decimal incorrectly, especially a small one (0.4% is 0.004, not 0.04).",
      ],
    },
  ],
  tipsAndTricks: [
    "Convert percentages to multipliers immediately: a 25% discount is a ×0.75 multiplier; a 30% increase is a ×1.30 multiplier. This is faster and less error-prone than calculating the change amount separately.",
    "Successive percent changes never simply cancel or add together — always apply them one at a time, each to the current (updated) value, not the original value.",
    "For percent change questions, the formula is always (new - old)/old — using the wrong value as the denominator (the 'old' or original value) is the most common setup error.",
  ],
};

const LC_M_ONE_VAR_DATA: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Comparing Mean and Median to Detect Skew",
      explanation:
        "This pattern tests whether you understand how outliers pull the mean away from the median. If the mean is noticeably higher than the median, a few unusually high values (right skew) are pulling the average up. If the mean is lower, unusually low values (left skew) are pulling it down. The median resists outliers much better, since it only depends on the middle of the ordered data, not the extreme values.",
      examples: [
        {
          q: "A data set: 4, 6, 6, 8, 10, 50. Which measure of center best represents a 'typical' value, given the outlier?",
          choices: [
            "The median, since the high outlier (50) pulls the mean up, making it unrepresentative",
            "The mean, since it uses every value in the data set",
            "The mean, since it's always the best measure of a 'typical' value",
            "The median, since it's always larger than the mean",
          ],
          answer: 0,
          explain:
            "The value 50 is far from the rest of the data (4-10), a clear outlier that pulls the mean substantially higher than most of the actual values, while the median (based on the middle values 6 and 8, averaging to 7) stays representative of the typical cluster, unaffected by the extreme value. Choosing the mean because it 'uses every value' ignores that using every value is exactly why it's distorted by the outlier here. Choosing the mean as 'always' the best measure is a general misconception — outliers are exactly when the median becomes more reliable. The median isn't always larger than the mean; here it happens to be smaller, since a high outlier pulls the mean up, not down.",
          difficulty: "easy",
          why: [null, "Using every value is the problem here: the outlier 50 drags the mean far above most of the data.", "The mean isn't always best. With an outlier, the median better shows a typical value.", "The median isn't always larger. Here it's smaller, because the high outlier pulls the mean up."],
        },
        {
          q: "Home sale prices (in thousands of dollars): 240, 210, 890, 230, 225. What is the median sale price?",
          choices: ["230", "359", "890", "225"],
          answer: 0,
          explain:
            "Sorting the data first (210, 225, 230, 240, 890) reveals 890 as a clear outlier far above the rest; the mean would be pulled substantially higher by that one sale, while the median (the middle value once sorted, 230) stays representative of the typical price. 359 is the actual mean of this data set, exactly the distorted value the outlier produces. 890 mistakes the outlier itself for a typical value. 225 comes from picking a value near the middle without correctly sorting the list first.",
          difficulty: "medium",
          why: [null, "359 is the mean, pulled up by the $890,000 sale. The median is the middle value once sorted: 230.", "890 is the outlier, the least typical price.", "225 is second in the sorted list (210, 225, 230, 240, 890). The middle value is 230."],
        },
        {
          q: "A data set: 12, 15, 15, 18, 20, 95. What is the median of this data set?",
          choices: ["16.5", "40.83", "95", "18"],
          answer: 0,
          explain:
            "95 is far from the rest of the data (12-20), a clear outlier that pulls the mean substantially higher; the median, based on the middle values (15 and 18, averaging to 16.5), remains representative of the typical cluster. 40.83 is the actual mean of this data set, distorted upward by the outlier. 95 mistakes the outlier itself for a representative value. 18 picks one of the two middle values without correctly averaging them.",
          difficulty: "easy",
          why: [null, "40.83 is the mean, pulled up by 95. The median averages the two middle values: (15 + 18) ÷ 2.", "95 is the outlier, not the middle of the data.", "With six values, the median is the average of the 3rd and 4th: (15 + 18) ÷ 2 = 16.5."],
        },
        {
          q: "A data set of quiz scores: 2, 78, 81, 85, 88, 90. What is the median score?",
          choices: ["83", "70.67", "2", "84.4"],
          answer: 0,
          explain:
            "2 is far below the rest of the data (78-90), a low outlier that pulls the MEAN down substantially (left skew); the median, based on the middle values (81 and 85, averaging to 83), stays representative of the typical cluster, unaffected by the one very low score. 70.67 is the actual mean of this data set, distorted downward by the outlier — the opposite direction from the earlier high-outlier examples, but the same underlying principle. 2 mistakes the outlier itself for a typical score. 84.4 comes from averaging the wrong pair of middle values.",
          difficulty: "medium",
          why: [null, "70.67 is the mean, dragged down by the score of 2. The median is (81 + 85) ÷ 2 = 83.", "2 is the outlier, not a typical score.", "84.4 is the mean of the other five scores. The median averages the middle pair, 81 and 85."],
        },
        {
          q: "A real estate report states that the mean home price in a neighborhood is $420,000, while the median home price is $350,000. What does this comparison most likely indicate about the distribution of home prices?",
          choices: [
            "A small number of unusually expensive homes are pulling the mean above the median (right skew)",
            "A small number of unusually cheap homes are pulling the mean below the median (left skew)",
            "The data must be symmetric, since both a mean and median were reported",
            "The median must be incorrect, since means are always more reliable",
          ],
          answer: 0,
          explain:
            "Comparing the two values directly, the mean ($420,000) is noticeably higher than the median ($350,000); when the mean exceeds the median, a small number of unusually HIGH values are pulling the average up (right skew), meaning a few unusually expensive homes are inflating the mean while most homes are priced closer to the median. The left-skew option describes the opposite pattern (mean below median), which doesn't match what's given here. Reporting both a mean and median says nothing about symmetry; this large a gap between them is actually a sign of skew, not symmetry. And the median isn't 'incorrect': in a skewed distribution, the median is the more representative statistic, not a flawed one.",
          difficulty: "hard",
          why: [null, "The mean here is higher than the median. Cheap outliers would pull the mean below the median.", "Reporting both numbers says nothing about symmetry. A $70,000 gap between them points to skew.", "The median isn't wrong. In skewed data like this, it's the more representative measure."],
        },
      ],
      traps: [
        "Defaulting to the mean as 'the' measure of center without checking whether outliers are present that would make the median more representative.",
        "Misinterpreting which direction skew pulls the mean — right skew (high outliers) pulls the mean UP relative to the median, not down.",
      ],
    },
    {
      name: "Interpreting Standard Deviation as Spread",
      explanation:
        "Questions comparing two data sets' standard deviations are testing whether you understand standard deviation as a measure of spread around the mean — not the size of the mean itself. Two data sets can have identical means but very different standard deviations: one set's values might be clustered tightly, while the other's are spread out widely.",
      examples: [
        {
          q: "Two data sets have the same mean but Data Set A has a much larger standard deviation than Data Set B. What does this indicate?",
          choices: [
            "Set A's values are more spread out around the shared mean than Set B's",
            "Set A's mean is larger than Set B's mean",
            "Set A has more data points than Set B",
            "Set A's values are all higher than Set B's values",
          ],
          answer: 0,
          explain:
            "Standard deviation measures the typical distance of data points from the mean, not the mean's value itself; since the means are equal, a larger standard deviation for Set A means its values are more spread out around that shared mean than Set B's, which are more tightly clustered. Saying Set A's mean is larger contradicts the given fact that the means are equal. Standard deviation says nothing about how many data points a set has. And a larger spread doesn't mean the values are all higher — it means they're farther from the mean in either direction.",
          difficulty: "easy",
          why: [null, "The means are stated to be equal. Standard deviation is about spread, not the mean.", "Standard deviation measures spread, not how many data points there are.", "More spread means values sit farther from the mean in both directions, not that they're all higher."],
        },
        {
          q: "Two classes take the same exam. Class A's scores are tightly clustered close to a mean of 78. Class B has the same mean of 78, but individual scores range widely, from 40 to 100. Which class most likely has the larger standard deviation?",
          choices: [
            "Class B, since its scores range much more widely around the same mean",
            "Class A, since its scores range much more widely around the same mean",
            "Neither, since they share the same mean",
            "It cannot be determined without knowing the exact scores",
          ],
          answer: 0,
          explain:
            "Both classes share the same mean, so the mean itself gives no useful information here — the question is entirely about spread. Class B's scores range all the way from 40 to 100 around that same 78, while Class A's stay tightly clustered close to it; a wider range of individual scores around the same mean is a sign of a larger standard deviation. The second choice reverses which class has the wider range. Assuming a shared mean means the standard deviations must also match ignores that the two statistics measure completely different things. And enough is given here (the described spread of each class) to determine which has the wider variability, even without every individual score.",
          difficulty: "medium",
          why: [null, "This reverses them. Class A is tightly clustered; Class B ranges from 40 to 100.", "The same mean doesn't mean the same spread. They measure different things.", "The described spread is enough: a range of 40 to 100 around 78 is far wider than a tight cluster."],
        },
        {
          q: "Two vending machines dispense the same average amount of soda per cup, but Machine A has a much smaller standard deviation in fill amount than Machine B. What does this indicate?",
          choices: [
            "Machine A fills cups more consistently, with less variation from cup to cup",
            "Machine A dispenses more soda per cup on average",
            "Machine A dispenses less soda per cup on average",
            "Machine A and Machine B are equally consistent",
          ],
          answer: 0,
          explain:
            "Since the average fill amount is the same for both machines, the difference must be about consistency, not typical amount; a smaller standard deviation means Machine A's fill amounts vary less from cup to cup, making it more consistent. The second and third choices both incorrectly assume the standard deviation comparison says something about the average amount, when the averages are explicitly stated to be equal. And a smaller standard deviation for A specifically means the two machines are NOT equally consistent.",
          difficulty: "easy",
          why: [null, "The averages are stated to be equal. Standard deviation is about consistency, not amount.", "The averages are the same. A smaller standard deviation means more consistent fills, not less soda.", "Different standard deviations mean different consistency. A's smaller one means it's more consistent."],
        },
        {
          q: "A data set has a standard deviation of exactly 0. What must be true about the data set?",
          choices: [
            "Every value in the data set is exactly the same",
            "The data set contains only one value",
            "The mean of the data set must be 0",
            "The data set has no outliers, but the values can still vary",
          ],
          answer: 0,
          explain:
            "Standard deviation measures how spread out values are from the mean, and a standard deviation of exactly 0 means there's no spread at all — the only way for that to happen is if every single value in the data set is identical. A data set can have any number of values (not just one) and still have zero spread, as long as they're all the same number. The mean can be any value, not necessarily 0, since standard deviation measures spread around whatever the mean happens to be, not the mean's actual value. And 'no outliers, but values can still vary' misses that zero standard deviation rules out any variation at all, not just outliers.",
          difficulty: "medium",
          why: [null, "A set can have many values and still have zero spread, as long as they're all the same.", "The mean can be any number. Zero standard deviation means no spread around that mean.", "Zero standard deviation rules out any variation at all, not just outliers."],
        },
        {
          q: "Two dot plots show quiz scores for two classes, both centered around the same mean of 75. Class X's dots are tightly clustered within a few points of 75. Class Y's dots are spread out widely, with several students scoring near 50 and several near 100. Which class has the larger standard deviation, and what does this suggest about performance consistency?",
          choices: [
            "Class Y has the larger standard deviation, suggesting less consistent performance than Class X",
            "Class X has the larger standard deviation, suggesting less consistent performance than Class Y",
            "Both classes have the same standard deviation, since they share the same mean",
            "Class Y has the larger standard deviation, suggesting more consistent performance than Class X",
          ],
          answer: 0,
          explain:
            "Both classes share the same mean, so the visual spread of the dots is what determines the standard deviation comparison; Class Y's dots span a much wider range around the same center (50 to 100) compared to Class X's tight clustering, meaning Class Y has the larger standard deviation and, in context, less consistent performance across students. The second choice reverses which class has the wider spread. Sharing a mean doesn't imply sharing a standard deviation, since the two statistics measure different things. And a larger standard deviation indicates LESS consistency, not more, since it means scores sit farther from the mean on average.",
          difficulty: "hard",
          why: [null, "This reverses them. Class Y's scores spread from 50 to 100; Class X is tightly clustered.", "Sharing a mean doesn't mean sharing a spread.", "A larger standard deviation means less consistency, not more."],
        },
      ],
      traps: [
        "Confusing standard deviation (a measure of spread) with the mean (a measure of center) — they answer different questions entirely.",
        "Assuming a larger standard deviation implies a larger or smaller mean, when the two statistics are independent of each other.",
      ],
    },
    {
      name: "Reading Values and Basic Statistics Directly from a Graph or Table",
      explanation:
        "Not every data question requires heavy computation: many just ask you to read a value, count, or range directly off a graph or table, or compute a simple mean or median. It's mostly about careful reading: find exactly which bar, dot, or row the question means, read its value precisely, and watch for off-by-one errors when counting. For a plain range: subtract the smallest value from the largest. For a plain mean: add every value and divide by the count. For a median from a frequency table, don't just pick the middle row: find the middle position (with n values, the average of the n/2-th and next values when n is even, or the (n + 1)/2-th value when n is odd), then add the frequencies row by row until you reach that position; in a grouped table, that tells you which interval the median falls in. To combine two groups' means, turn each mean back into a total (total = count × mean), add the totals, and divide by the combined count; simply averaging the two means only works when the groups are the same size.",
      examples: [
        {
          q: "A bar graph shows the number of books read by each of 5 students: 3, 5, 2, 6, 4. What is the range of this data set?",
          choices: ["4", "6", "2", "5"],
          answer: 0,
          explain:
            "The range is the largest value minus the smallest: 6 - 2 = 4. 6 mistakenly reports just the largest value instead of the range. 2 mistakenly reports just the smallest value. 5 comes from an off-by-one counting error.",
          difficulty: "easy",
          why: [null, "6 is the largest value. The range is largest minus smallest: 6 − 2 = 4.", "2 is the smallest value. The range is 6 − 2 = 4.", "5 is the number of students, not the range."],
        },
        {
          q: "A dot plot shows the number of pets owned by each student in a class: 2 students with 0 pets, 5 students with 1 pet, 4 students with 2 pets, and 1 student with 3 pets. How many students are in the class?",
          choices: ["12", "4", "11", "3"],
          answer: 0,
          explain:
            "This asks for a total count, found by adding up the number of students represented at each value: 2 + 5 + 4 + 1 = 12. 4 mistakes the number of distinct pet-count categories (0, 1, 2, 3) for the total number of students. 11 comes from an arithmetic slip while adding. 3 mistakes the highest pet count (3 pets) for the total number of students.",
          difficulty: "easy",
          why: [null, "4 is the number of categories (0 to 3 pets). Add the students in each: 2 + 5 + 4 + 1.", "Check the sum: 2 + 5 + 4 + 1 = 12, not 11.", "3 is the most pets anyone owns, not the number of students."],
        },
        {
          q: "A store recorded daily sales (in dollars) for 6 days: 210, 340, 275, 300, 265, 290. What is the mean daily sales?",
          choices: ["$280", "$300", "$1,680", "$210"],
          answer: 0,
          explain:
            "Adding all six values gives 210+340+275+300+265+290=1,680, and dividing by the count of values, 6, gives 1,680/6=280. $300 comes from an arithmetic slip in the division. $1,680 mistakenly reports the sum itself without dividing by the count. $210 mistakes the smallest individual value for the mean.",
          difficulty: "medium",
          why: [null, "Check it: 1,680 ÷ 6 = 280, not 300.", "$1,680 is the total. Divide by the 6 days to get the mean.", "$210 is the smallest single day, not the average."],
        },
        {
          q: "A frequency table shows quiz scores for a class: 2 students scored 70, 6 students scored 80, 9 students scored 90, and 3 students scored 100. What was the highest individual score earned by any student?",
          choices: ["100", "3", "90", "9"],
          answer: 0,
          explain:
            "This asks for the maximum individual score value, not a frequency or count — scanning the table for the largest score with a nonzero frequency gives 100, since 3 students scored it. 3 mistakenly reports the frequency at that score instead of the score value itself. 90 and 9 both confuse the score with a value or frequency from a different row of the table.",
          difficulty: "medium",
          why: [null, "3 is how many students scored 100, not the score itself.", "90 is a score, but 100 is higher and at least one student earned it.", "9 is how many students scored 90. The question asks for the highest score."],
        },
        {
          q: "The table shows the number of students in each of two sections of a chemistry course and the mean score of each section on a lab exam.\n\nWhat is the mean score of all 30 students in the two sections combined?",
          choices: ["81.5", "82", "81", "2,460"],
          answer: 1,
          explain:
            "Turn each mean back into a total: Section A's 18 students scored 18 × 84 = 1,512 points, and Section B's 12 students scored 12 × 79 = 948 points. Together that's 2,460 points for 30 students, so the combined mean is 2,460 ÷ 30 = 82. 81.5 averages the two means as if the sections were the same size, but the larger Section A pulls the combined mean toward 84. 81 pairs each mean with the other section's size. 2,460 is the total of all the scores, not yet divided by the 30 students.",
          figure: {"kind": "table", "header": ["Section", "Number of students", "Mean score"], "rows": [["A", 18, 84], ["B", 12, 79]]},
          difficulty: "medium",
          why: ["81.5 averages 84 and 79 as if the sections were the same size. Section A has more students, so its mean counts more.", null, "81 gives Section A's mean only 12 students' weight and Section B's 18. Use 18 × 84 + 12 × 79.", "2,460 is the total of all 30 scores. Divide by 30 to get the mean."],
        },
        {
          q: "A histogram groups delivery times (in minutes) into bins: 10 deliveries took 0-10 minutes, 25 took 10-20 minutes, 40 took 20-30 minutes, 15 took 30-40 minutes, and 10 took 40-50 minutes. What percent of deliveries took 20 minutes or more?",
          choices: ["65%", "40%", "75%", "35%"],
          answer: 0,
          explain:
            "Identifying the bins that satisfy '20 minutes or more' (the 20-30, 30-40, and 40-50 bins) and summing their frequencies gives 40+15+10=65, and dividing by the total across all bins (10+25+40+15+10=100) gives 65/100=65%. 40% mistakenly reports only the largest single bin (20-30) instead of summing every qualifying bin. 75% comes from including one extra bin that doesn't satisfy the condition, like the 10-20 bin. 35% reports the percent of deliveries that took LESS than 20 minutes instead of 20 minutes or more.",
          difficulty: "hard",
          why: [null, "40% counts only the 20–30 bin. The 30–40 and 40–50 bins also qualify: 40 + 15 + 10 = 65.", "75 includes a bin that doesn't qualify. Only 20–30, 30–40, and 40–50 count: 65 of 100.", "35% is the share that took less than 20 minutes (10 + 25), the opposite of what's asked."],
        },
        {
          q: "The table summarizes the wait times, rounded to the nearest minute, of 40 customers at a clinic.\n\nWhich of the following could be the median wait time, in minutes, of these 40 customers?",
          choices: ["5", "25", "20", "15"],
          answer: 3,
          explain:
            "With 40 values, the median is the average of the 20th and 21st values in order. Count down the table: the first row holds values 1 through 13, and the second row holds values 14 through 22. Both the 20th and 21st values fall in the 10–19 row, so the median is between 10 and 19, and only 15 fits. 5 comes from the row with the most customers, which locates the mode, not the median. 25 comes from the middle row of the table, but the rows hold different numbers of customers. 20 treats the middle position (the 20th value) as if it were a wait time.",
          figure: {"kind": "table", "header": ["Wait time (minutes)", "Number of customers"], "rows": [["0–9", 13], ["10–19", 9], ["20–29", 8], ["30–39", 6], ["40–49", 4]]},
          difficulty: "hard",
          why: ["5 is in the 0–9 row, the most common interval. The 20th and 21st values, which set the median, are in the 10–19 row.", "25 is in the middle row, but the rows hold different numbers of customers. Counting 13 + 9 = 22 already passes the 21st value.", "20 is the middle position (the 20th value), not a wait time. That 20th value falls in the 10–19 row.", null],
        },
      ],
      traps: [
        "Misreading a bar's height or a dot's position against the axis, especially when gridlines aren't spaced at intervals of 1.",
        "Confusing a value's frequency (how many data points have that value) with the value itself.",
        "For a histogram question about a range of values ('20 or more'), forgetting to include every bin that satisfies the condition, not just the first one.",
        "Averaging two group means directly instead of weighting each by its group size (turn each mean into a total first: total = count × mean).",
        "Taking the middle row of a frequency table, or the row with the largest frequency, as the median's location instead of counting through the frequencies to the middle position.",
      ],
    },
    {
      name: "How Changing a Data Set Changes Its Statistics",
      explanation:
        "These questions ask what happens to a data set's mean, median, or range after a change: adding a point, removing one, or shifting every value by the same amount. Key distinction: shifting every value by a constant moves the mean and median by that same constant, and leaves the range unchanged, since every value moved together. Adding or removing a single point is different — it changes the mean by a calculable amount, but its effect on the median depends on where the new point falls, and its effect on the range depends on whether the new point is more extreme than the current min or max.",
      examples: [
        {
          q: "A data set has a mean of 20. If 5 is added to every value in the data set, what is the new mean?",
          choices: ["25", "20", "5", "100"],
          answer: 0,
          explain:
            "Adding the same constant to every value shifts the mean by that exact constant, so the new mean is 20+5=25. 20 mistakenly assumes the mean is unaffected by a uniform shift. 5 mistakenly reports just the constant added, not the new mean itself. 100 comes from multiplying the original mean by the constant instead of adding it.",
          difficulty: "easy",
          why: [null, "Adding 5 to every value raises the mean by 5 too.", "5 is the amount added, not the new mean.", "100 multiplies the mean by 5. Adding 5 to every value adds 5 to the mean."],
        },
        {
          q: "A data set has a range of 12. If every value in the data set is increased by 3, what is the new range?",
          choices: ["12", "15", "9", "36"],
          answer: 0,
          explain:
            "Adding the same constant to every value shifts the whole data set uniformly — the maximum and minimum both increase by 3, so their difference (the range) stays exactly the same at 12. 15 mistakenly adds the constant to the range itself, as if the spread grew along with the values. 9 mistakenly subtracts the constant from the range instead. 36 comes from multiplying the range by the constant, an unrelated operation.",
          difficulty: "easy",
          why: [null, "The max and min both rise by 3, so their difference, the range, doesn't change.", "Nothing is subtracted. Shifting every value by the same amount leaves the range at 12.", "36 multiplies the range by 3. Adding 3 to every value doesn't change the spread."],
        },
        {
          q: "Five test scores have a mean of 80. A sixth score of 92 is added. What is the new mean?",
          choices: ["82", "86", "80", "92"],
          answer: 0,
          explain:
            "Reconstructing the original total from the mean and count, 5 scores × 80 = 400; adding the new score gives 400+92=492, and dividing by the new count of 6 gives 492/6=82. 86 comes from averaging the old mean and the new score directly ((80+92)/2) instead of correctly reconstructing the total. 80 mistakenly assumes adding one new score doesn't change the mean at all. 92 mistakes the new score itself for the new mean.",
          difficulty: "medium",
          why: [null, "86 averages 80 and 92 as if they had equal weight. The old mean stands for five scores: (400 + 92) ÷ 6 = 82.", "92 is above the old mean, so adding it pulls the mean up.", "92 is just the new score. The mean includes all six: 82."],
        },
        {
          q: "The data set 42, 45, 48, 50, 52, 55, 58 has a median of 50. If a new value of 200 is added to the data set, what happens to the median?",
          choices: [
            "The median shifts only slightly, since one extreme value mainly affects which value sits in the middle, not the overall balance",
            "The median jumps dramatically higher, since 200 is far above the rest of the data",
            "The median stays at exactly 50, since adding any single value never changes the median",
            "The median becomes 200, since that's now the largest value",
          ],
          answer: 0,
          explain:
            "With 7 values, the median is the 4th (middle) value; adding one very high value (200) makes 8 values, so the new median is the average of the 4th and 5th values in the new ordering; since 200 just becomes the new maximum, the middle pair is 50 and 52, so the median shifts only slightly, to 51, unlike the mean, which the extreme value would pull noticeably higher. Assuming a dramatic jump confuses how the median behaves with how the mean would behave here. Assuming the median never changes when a value is added overstates the median's resistance to change: it's resistant to outliers, not literally frozen. And the median is a measure of the middle of the data, so it can never simply equal the new maximum value.",
          difficulty: "hard",
          why: [null, "200 becomes the new maximum. The middle pair is now 50 and 52, so the median moves only to 51.", "The median does change: with eight values, it's the average of 50 and 52, which is 51.", "The median is the middle of the data, not the largest value."],
        },
        {
          q: "A biologist recorded the wingspan of 9 birds, with a mean of 24 cm and a range of 10 cm. A 10th bird is measured with a wingspan of 24 cm, exactly equal to the current mean. What happens to the mean and the range?",
          choices: [
            "Both the mean and the range stay the same",
            "The mean stays the same, but the range increases",
            "The mean increases slightly, and the range stays the same",
            "Both the mean and the range increase slightly",
          ],
          answer: 0,
          explain:
            "Adding a value exactly equal to the current mean doesn't pull the average up or down at all, so the mean stays 24 cm; and since the range only changes if the new value is more extreme than the current minimum or maximum, and 24 falls between them (as the mean typically does), the range stays 10 cm too. Assuming the range increases ignores that a new value must be more extreme than the existing min or max to affect the range, and 24 isn't. Assuming the mean increases ignores that a value exactly at the current mean, by definition, doesn't shift the average in either direction. So neither statistic changes.",
          difficulty: "hard",
          why: [null, "The new value, 24, lies between the old minimum and maximum, so the range doesn't change.", "A value exactly equal to the mean leaves the mean unchanged.", "24 equals the mean and lies inside the range, so neither one changes."],
        },
      ],
      traps: [
        "Assuming a new data point always shifts the median the same way it shifts the mean — the median only changes based on where the new point falls in the sorted order.",
        "Assuming the range changes whenever a new point is added — it only changes if the new point is more extreme than the existing minimum or maximum.",
        "Forgetting that shifting every value by a constant leaves the range (and standard deviation) unchanged, even though it does shift the mean and median.",
      ],
    },
  ],
  tipsAndTricks: [
    "If mean > median, suspect high-value outliers (right skew); if mean < median, suspect low-value outliers (left skew) — this comparison alone often answers the question without needing to see the raw data.",
    "The median is your 'outlier-resistant' measure of center; the mean is sensitive to outliers — pick the median when a question specifically mentions or implies unusual/extreme values.",
    "Standard deviation and mean answer different questions: standard deviation is about spread/consistency, mean is about central value. Don't let a comparison of one imply anything about the other.",
  ],
};

const LC_M_TWO_VAR_DATA: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Choosing the Right Model Shape from a Scatterplot's Pattern",
      desmosCalculator: "graphing",
      desmosTrick:
        "Step 1: Click the '+' menu and add a table, then enter the given data points as x1, y1 columns, one point per row. Step 2: On the next line, type a regression template matching the shape you're testing: y1 ~ mx1+b for a straight-line trend, y1 ~ ax1^2+bx1+c for a curve that bends once, or y1 ~ a*b^x1 for growth or decay that speeds up or slows down over time. Step 3: Desmos fits that shape through your points and reports the actual values of m, b, a, and c, so instead of guessing which shape 'looks right' by eye, you can check exactly how well each one fits.",
      explanation:
        "This pattern asks you to match a scatterplot's shape to the correct model type. A straight-line pattern with a constant rate of change is linear. A pattern that gets increasingly steep is exponential. A pattern with a single peak or trough is quadratic. The key is looking at HOW the rate of change behaves (constant, accelerating, or reversing), rather than the general 'up and to the right' shape alone.",
      examples: [
        {
          q: "A scatterplot shows points rising steadily at a constant rate, forming a straight-line pattern. Which model best fits?",
          choices: ["Linear", "Exponential", "Quadratic", "Cannot be determined"],
          answer: 0,
          explain:
            "A constant rate of increase forming a straight-line pattern is the defining characteristic of a linear relationship: linear models have a constant rate of change, unlike exponential (accelerating rate) or quadratic (a rate that changes direction at a vertex) models. Exponential is ruled out because its rate of change isn't constant, it grows. Quadratic is ruled out because it changes direction at a peak or trough, which isn't described here. And the description gives enough information (a clear constant-rate straight-line pattern) to determine the model.",
          diagram: { kind: "scatterGraph", trend: "linearPos" },
          difficulty: "easy",
          why: [null, "Exponential growth speeds up. A constant rate is linear.", "A quadratic changes direction at a peak or low point. A steady straight line doesn't.", "A constant rate in a straight line is enough to identify a linear model."],
        },
        {
          q: "A scatterplot shows points rising slowly at first, then increasingly steeply as x increases, with each step producing a noticeably bigger jump than the last. Which model best fits?",
          choices: ["Exponential", "Linear", "Quadratic", "None of these models could produce this pattern"],
          answer: 0,
          explain:
            "The rate of increase itself keeps growing (each step's jump is bigger than the last), which rules out linear (constant rate) immediately. It's tempting to think 'curving upward' means quadratic, but a quadratic model eventually turns and changes direction at its vertex, while this pattern just keeps accelerating in the same direction without turning around, matching exponential growth specifically. Linear is ruled out by the changing rate. Quadratic is ruled out because nothing here describes a reversal in direction. And this is a textbook match for exponential growth, so it's certainly produced by one of the standard models.",
          diagram: { kind: "scatterGraph", trend: "exponential" },
          difficulty: "medium",
          why: [null, "The jumps keep getting bigger, so the rate isn't constant. That rules out linear.", "A quadratic eventually turns around. This keeps speeding up in one direction, which is exponential.", "Ever-growing jumps are exactly what exponential growth looks like."],
        },
        {
          q: "A scatterplot shows points that rise, reach a peak around the middle of the data, then fall back down, forming a symmetric arc shape. Which model best fits?",
          choices: ["Quadratic", "Linear", "Exponential", "Cannot be determined without more data"],
          answer: 0,
          explain:
            "The data doesn't just keep increasing or decreasing — it changes direction once, at a single peak, which is the defining feature of a quadratic model. Linear is ruled out because a constant rate never changes direction. Exponential is ruled out because it keeps accelerating in one direction and never turns around. And the description (a full rise, peak, and fall) is a clear, specific signature that's enough to identify the model shape.",
          diagram: { kind: "scatterGraph", trend: "quadratic" },
          difficulty: "easy",
          why: [null, "A line never rises and then falls. It can't change direction.", "Exponential curves keep going one way. They never peak and turn back down.", "A rise, a peak, and a fall is enough to identify a quadratic."],
        },
        {
          q: "A scatterplot shows points that appear to rise at a roughly constant rate, but closer inspection shows the amount of increase between consecutive points is slightly smaller near the right side of the graph than near the left. Which model best fits?",
          choices: ["Quadratic", "Linear", "Exponential", "Cubic"],
          answer: 0,
          explain:
            "The rate of increase itself is changing (specifically getting smaller), which rules out a purely linear model (constant rate) and also rules out exponential growth, which would have an ACCELERATING rate, the opposite direction. A rate of increase that's shrinking while still positive matches the rising portion of a quadratic model, before it reaches its peak and turns downward. Linear is ruled out by the changing rate. Exponential moves the wrong direction entirely. Cubic isn't one of the model shapes this method distinguishes between, and the described behavior specifically matches quadratic's pre-vertex behavior.",
          diagram: { kind: "scatterGraph", trend: "quadratic" },
          difficulty: "medium",
          why: [null, "The increase shrinks toward the right, so the rate isn't constant. That rules out linear.", "Exponential growth speeds up. Here the increases get smaller.", "The pattern matches the rising side of a quadratic, where increases shrink before the peak."],
        },
        {
          q: "A linear model is fit to a data set, and the residuals show a clear pattern: strongly negative for small x-values, positive in the middle, and strongly negative again for large x-values. What does this residual pattern suggest about the true relationship between the variables?",
          choices: [
            "The true relationship is curved (likely quadratic), not linear",
            "The linear model is a perfect fit, since residuals were calculated at all",
            "The true relationship is exponential, since the residuals change sign",
            "The data must contain measurement errors, not a real underlying pattern",
          ],
          answer: 0,
          explain:
            "A good linear fit's residuals should scatter randomly above and below zero, with no systematic pattern; here the residuals follow a clear pattern (negative, then positive, then negative again), meaning the linear model consistently over- or under-predicts in a structured way, which is a strong signal that the true relationship is curved (like quadratic), not actually linear. Claiming the fit is perfect ignores that a truly perfect fit would have residuals of zero, not a systematic pattern. Concluding exponential overreaches: this negative-positive-negative shape specifically matches a relationship that turns around, which is quadratic behavior, not accelerating exponential behavior. And a systematic pattern like this is a sign of the wrong model, not necessarily flawed data.",
          difficulty: "hard",
          why: [null, "Calculating residuals doesn't make a fit perfect. A clear pattern in them shows the model is wrong.", "Negative, then positive, then negative again is a curve that turns around, which is quadratic, not exponential.", "A systematic pattern points to the wrong model, not to measurement errors."],
        },
      ],
      traps: [
        "Assuming any 'increasing' pattern must be linear, without checking whether the rate of increase itself is constant, accelerating, or otherwise.",
        "Confusing exponential growth (accelerating rate) with linear growth (constant rate) when a scatterplot's curve is subtle.",
      ],
    },
    {
      name: "Using a Line of Best Fit",
      explanation:
        "These questions show a scatterplot with its line of best fit drawn in and ask you to use the line: pick its equation, estimate its slope, read off a prediction, say what the slope means, or tell how the line changes when every data value changes. Work from the line, not the dots. For the slope, find two points where the line crosses gridline intersections and divide the change in y by the change in x, using the numbers on the axes rather than a count of gridlines; in context, the slope is the predicted change in y for each increase of 1 in x. To match an equation, check the sign first (a line that falls from left to right has a negative slope), then the y-intercept, which is where the line meets x = 0, then the steepness. A prediction is the line's height at the given x, even when a data point sits right there. If every y-value is multiplied by a number, the slope and the intercept are both multiplied by it; if a number is added to every y-value, only the intercept changes.",
      examples: [
        {
          q: "The scatterplot shows the number of days x after a spring snowstorm and the depth of snow y, in inches, measured at a weather station, along with a line of best fit.\n\nWhich equation best represents the line of best fit?",
          choices: ["y = 2x + 24", "y = -2x + 12", "y = -2x + 24", "y = -0.5x + 24"],
          answer: 2,
          explain:
            "Start with the sign: the line falls from left to right, so the slope is negative. The line meets the y-axis at 24 and reaches 0 at x = 12, so the slope is (0 - 24)/12 = -2, giving y = -2x + 24. y = 2x + 24 has the right intercept but a positive slope, which would make the line rise. y = -2x + 12 uses 12, where the line meets the x-axis, as if it were the y-intercept. y = -0.5x + 24 reads the slope upside down, dividing the change in x (12) by the change in y (24).",
          figure: {"kind": "scatter", "x": {"label": "Days after storm", "min": 0, "max": 12, "step": 1}, "y": {"label": "Snow depth (inches)", "min": 0, "max": 28, "step": 4}, "points": [[1, 23.5], [2, 18], [3, 20], [4, 15], [5, 14.5], [6, 13.5], [7, 7.5], [8, 9], [9, 5], [10, 4.5], [11, 1.5]], "line": {"slope": -2, "intercept": 24}},
          difficulty: "easy",
          why: ["A slope of 2 would make the line rise from left to right, but this line falls.", "12 is where the line meets the x-axis. The y-intercept is where it meets the y-axis, at 24.", null, "−0.5 is the slope upside down. The line drops 24 inches over 12 days: −24 ÷ 12 = −2."],
        },
        {
          q: "The scatterplot shows the air temperature x, in degrees Fahrenheit, and the number of chirps per minute y made by a snowy tree cricket on 12 evenings, along with a line of best fit.\n\nAccording to the line of best fit, how many chirps per minute are predicted when the air temperature is 65°F?",
          choices: ["108", "100", "120", "80"],
          answer: 1,
          explain:
            "Go up from 65 on the horizontal axis to the line, then across to the vertical axis: the line is at 100. 108 is the actual count on the evening it was 65°F, but that data point sits above the line, and the question asks what the line predicts. 120 is the line's height at 70°F, and 80 is its height at 60°F; both read the line at the wrong temperature.",
          figure: {"kind": "scatter", "x": {"label": "Temperature (°F)", "min": 50, "max": 90, "step": 5}, "y": {"label": "Chirps per minute", "min": 0, "max": 200, "step": 20}, "points": [[52, 54], [55, 52], [58, 77], [60, 76], [63, 85], [65, 108], [68, 115], [71, 118], [74, 143], [77, 143], [80, 164], [84, 173]], "line": {"slope": 4, "intercept": -160}},
          difficulty: "easy",
          why: ["108 is the chirp count on the evening that was actually 65°F. The line, which is what the question asks about, is at 100 there.", null, "120 is the line's height at 70°F. At 65°F the line is at 100.", "80 is the line's height at 60°F, one gridline too far left."],
        },
        {
          q: "The scatterplot shows the age x, in years, and the trunk diameter y, in centimeters, of 12 oak trees in a park, along with a line of best fit.\n\nWhich of the following is closest to the slope of the line of best fit?",
          choices: ["0.75", "1.33", "0.875", "-0.75"],
          answer: 0,
          explain:
            "Pick two points where the line crosses gridlines: (0, 5) and (40, 35). The slope is the change in y over the change in x: (35 - 5)/(40 - 0) = 30/40 = 0.75, so the model predicts about 0.75 centimeter of growth in diameter per year. 1.33 divides the change in x by the change in y (40 ÷ 30). 0.875 divides 35 by 40 as if the line started at 0, ignoring that it starts at 5. -0.75 has the wrong sign for a line that rises from left to right.",
          figure: {"kind": "scatter", "x": {"label": "Age (years)", "min": 0, "max": 40, "step": 5}, "y": {"label": "Trunk diameter (cm)", "min": 0, "max": 40, "step": 5}, "points": [[4, 6.5], [7, 12], [10, 10], [13, 16], [16, 16], [20, 22.5], [23, 20], [26, 25.5], [30, 26], [33, 32], [36, 33], [38, 32]], "line": {"slope": 0.75, "intercept": 5}},
          difficulty: "medium",
          why: [null, "1.33 is the change in x over the change in y (40 ÷ 30). Slope is change in y over change in x: 30 ÷ 40.", "0.875 divides 35 by 40 as if the line started at 0. It starts at 5, so the rise is 35 − 5 = 30.", "The line rises from left to right, so its slope is positive."],
        },
        {
          q: "The scatterplot shows the high temperature x, in degrees Fahrenheit, and the number of cups of hot cocoa y sold at a café on 12 days, along with a line of best fit.\n\nWhich statement is the best interpretation of the slope of the line of best fit?",
          choices: ["For each increase of 1°F in the high temperature, the predicted number of cups sold increases by about 2.5.", "For each increase of 1°F in the high temperature, the predicted number of cups sold decreases by about 0.4.", "For each increase of 1°F in the high temperature, the predicted number of cups sold decreases by about 25.", "For each increase of 1°F in the high temperature, the predicted number of cups sold decreases by about 2.5."],
          answer: 3,
          explain:
            "The line passes through (20, 150) and (60, 50), so the slope is (50 - 150)/(60 - 20) = -100/40 = -2.5: predicted sales drop about 2.5 cups for each degree warmer. The 'increases' choice has the right size but the wrong direction for a falling line. 0.4 divides degrees by cups (40 ÷ 100), the slope upside down. 25 is the drop per gridline, but each gridline on the temperature axis is 10°F, not 1°F.",
          figure: {"kind": "scatter", "x": {"label": "High temperature (°F)", "min": 0, "max": 80, "step": 10}, "y": {"label": "Cups of cocoa sold", "min": 0, "max": 200, "step": 25}, "points": [[15, 170], [20, 140], [25, 144], [30, 120], [35, 124], [40, 93], [45, 92], [50, 66], [55, 70], [60, 53], [65, 32], [70, 23]], "line": {"slope": -2.5, "intercept": 200}},
          difficulty: "medium",
          why: ["The line falls from left to right, so predicted sales go down as the temperature goes up.", "0.4 is the change in temperature over the change in cups (40 ÷ 100). Slope is cups per degree: 100 ÷ 40 = 2.5.", "25 is the drop per gridline, and each gridline on the temperature axis is 10°F. Per 1°F, the drop is 2.5.", null],
        },
        {
          q: "The scatterplot shows the time x, in seconds, after a toy boat was released and its distance y, in yards, from a dock, measured 12 times, along with a line of best fit. Each distance is then converted from yards to feet (1 yard = 3 feet), and a new line of best fit is found for the time and the distance in feet.\n\nWhich equation best represents the new line of best fit?",
          choices: ["y = 0.5x + 12", "y = 1.5x + 4", "y = 1.5x + 12", "y = 6x + 12"],
          answer: 2,
          explain:
            "First read the original line: it meets the y-axis at 4 and rises from 4 to 14 over 20 seconds, a slope of 10/20 = 0.5, so y = 0.5x + 4 in yards. Converting to feet multiplies every y-value by 3, which stretches the whole line by 3: y = 3(0.5x + 4) = 1.5x + 12. y = 0.5x + 12 triples only the intercept, and y = 1.5x + 4 triples only the slope; every point moves, so both change. y = 6x + 12 comes from reading the slope upside down as 2 and then tripling it.",
          figure: {"kind": "scatter", "x": {"label": "Time (seconds)", "min": 0, "max": 20, "step": 2}, "y": {"label": "Distance from dock (yards)", "min": 0, "max": 16, "step": 2}, "points": [[1, 5], [3, 4.5], [4, 7], [6, 6.5], [8, 9], [9, 7.5], [11, 10], [13, 9.5], [14, 12], [16, 12.5], [18, 12.5], [19, 13]], "line": {"slope": 0.5, "intercept": 4}},
          difficulty: "hard",
          why: ["This triples the intercept but not the slope. Every distance triples, so the rise per second triples too: 0.5 × 3 = 1.5.", "This triples the slope but not the intercept. The starting distance, 4 yards, is also 12 feet.", null, "6 comes from reading the slope upside down (2 instead of 0.5) and tripling it. The line rises 0.5 yard per second."],
        },
      ],
      traps: [
        "Choosing an equation whose slope has the wrong sign, or whose intercept doesn't match where the line meets the y-axis (not where it meets the x-axis, and not the left edge of a graph whose x-axis doesn't start at 0).",
        "Getting rise over run wrong: dividing the change in x by the change in y, counting gridlines instead of reading the axis values, or forgetting to divide by the change in x at all.",
        "Reading a nearby data point, or the line at the wrong x-value, instead of the line's height at the x the question gives.",
        "Mishandling a change to every y-value: multiplying every y-value by a number multiplies both the slope and the intercept, while adding a number to every y-value changes only the intercept.",
      ],
    },
    {
      name: "Interpreting Residuals",
      explanation:
        "A residual is the difference between an actual data point and what a model predicts for that same input: residual = actual - predicted. Questions often give you a predicted and an actual value and ask you to compute or interpret the residual directly — or ask what a residual pattern, like residuals growing larger for bigger x-values, says about how well the model fits.",
      examples: [
        {
          q: "A line of best fit predicts y = 45 for a given x-value, but the actual observed y-value is 50. What is the residual?",
          choices: ["5", "-5", "45", "95"],
          answer: 0,
          explain:
            "The residual formula is actual minus predicted, not the reverse: 50 - 45 = 5. -5 comes from reversing the formula (predicted minus actual), flipping the sign. 45 mistakenly reports the predicted value itself instead of the residual. 95 comes from adding the two values instead of subtracting.",
          difficulty: "easy",
          why: [null, "Residual is actual minus predicted: 50 − 45 = 5, not 45 − 50.", "45 is the predicted value, not the residual.", "95 adds the two values. Residual subtracts: actual minus predicted."],
        },
        {
          q: "A line of best fit predicts a plant will be 24 cm tall after 6 weeks, but its actual measured height is 19 cm. What is the residual, and what does its sign tell you?",
          choices: [
            "-5, meaning the plant grew less than predicted",
            "5, meaning the plant grew less than predicted",
            "-5, meaning the plant grew more than predicted",
            "5, meaning the plant grew more than predicted",
          ],
          answer: 0,
          explain:
            "Applying the residual formula, actual minus predicted, gives 19 - 24 = -5; the negative sign specifically means the actual height fell short of the model's prediction, not just that there was some difference. Reporting a residual of 5 instead of -5 comes from reversing the subtraction order. Saying the negative residual means the plant grew MORE than predicted has the sign's meaning backwards — a negative residual always means the actual value came in below the prediction.",
          difficulty: "medium",
          why: [null, "Actual minus predicted is 19 − 24 = −5, a negative number.", "A negative residual means the actual value was below the prediction: the plant grew less.", "The residual is −5, and the plant came in 5 cm short, so it grew less."],
        },
        {
          q: "A line of best fit predicts a car will sell for $18,000, but it actually sells for $16,500. What is the residual?",
          choices: ["-1,500", "1,500", "18,000", "34,500"],
          answer: 0,
          explain:
            "Applying the residual formula, actual minus predicted, gives 16,500 - 18,000 = -1,500. 1,500 comes from reversing the formula, flipping the sign. 18,000 mistakenly reports the predicted value itself. 34,500 comes from adding the two values instead of subtracting.",
          difficulty: "easy",
          why: [null, "Residual is actual minus predicted: 16,500 − 18,000 = −1,500.", "18,000 is the predicted price, not the residual.", "34,500 adds the two prices. Residual subtracts them."],
        },
        {
          q: "A model predicts a runner will finish a race in 52 minutes, but the runner actually finishes in 49 minutes. What is the residual, and what does its sign indicate about the runner's performance relative to the prediction?",
          choices: [
            "-3, meaning the runner performed better than predicted",
            "3, meaning the runner performed better than predicted",
            "-3, meaning the runner performed worse than predicted",
            "3, meaning the runner performed worse than predicted",
          ],
          answer: 0,
          explain:
            "Applying the residual formula, actual minus predicted, gives 49 - 52 = -3. In most contexts a negative residual means underperforming, but here LOWER race times are BETTER, so this negative residual actually means the runner finished faster than predicted — better performance, not worse. Reporting 3 instead of -3 reverses the subtraction order. Interpreting the negative sign as 'worse' applies the typical higher-is-better assumption to a context where it doesn't hold, since faster (lower) times are the good outcome in a race.",
          difficulty: "medium",
          why: [null, "Actual minus predicted is 49 − 52 = −3, a negative number.", "In a race, a lower time is better. Finishing below the prediction means a better run.", "The residual is −3, and finishing faster than predicted is better, not worse."],
        },
        {
          q: "A line of best fit predicts a plant's height based on weeks since planting. For a particular plant, the residual was calculated as 4.5. If the model predicted a height of 22 cm for that plant, what was its actual height?",
          choices: ["26.5", "17.5", "22", "4.5"],
          answer: 0,
          explain:
            "Using the residual formula in reverse, residual = actual - predicted, gives 4.5 = actual - 22, so actual = 4.5 + 22 = 26.5. 17.5 comes from subtracting the residual from the predicted value instead of adding it, effectively flipping the formula's sign. 22 mistakenly reports just the predicted value, ignoring the residual entirely. 4.5 mistakenly reports the residual itself as if it were the actual height.",
          difficulty: "hard",
          why: [null, "17.5 subtracts the residual. Actual = predicted + residual = 22 + 4.5.", "22 is the predicted height. The positive residual means the actual height was 4.5 cm more.", "4.5 is the residual, not the height."],
        },
      ],
      traps: [
        "Reversing the residual formula (predicted minus actual instead of actual minus predicted), which flips the sign of the answer.",
        "Confusing a residual (a single point's deviation) with the overall correlation or fit quality of the entire model.",
      ],
    },
  ],
  tipsAndTricks: [
    "To distinguish linear from exponential patterns quickly, check whether the amount of increase between consecutive points stays the same (linear) or keeps growing (exponential).",
    "Residual is always actual minus predicted — memorize the order, since reversing it silently flips the sign of your answer.",
    "Be cautious about extrapolating a model far beyond the range of the actual data collected — the relationship may not hold outside that observed range, and SAT questions sometimes test this reasoning directly.",
  ],
};

const LC_M_PROBABILITY: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Basic and Compound Probability",
      explanation:
        "Simple probability questions use one formula: favorable outcomes divided by total outcomes. Compound probability questions (the ones with 'and' or 'or') need you to recognize whether events are independent (multiply, for 'and') or need the addition rule (for 'or': add the individual probabilities, then subtract any overlap so you don't double-count).",
      examples: [
        {
          q: "Two independent events A and B have P(A) = 0.5 and P(B) = 0.4. What is P(A and B)?",
          choices: ["0.2", "0.9", "0.1", "0.45"],
          answer: 0,
          explain:
            "Since A and B are independent and the question asks for 'and,' the probabilities multiply: P(A and B) = 0.5 × 0.4 = 0.2. 0.9 comes from adding the two probabilities instead of multiplying, the rule for 'or,' not 'and.' 0.1 comes from an arithmetic slip in the multiplication. 0.45 comes from averaging the two probabilities instead of multiplying them.",
          difficulty: "easy",
          why: [null, "Adding is for \"or.\" For \"and\" with independent events, multiply: 0.5 × 0.4.", "0.1 is the difference between the probabilities. For \"and,\" multiply: 0.2.", "Averaging doesn't apply. For independent events, \"and\" means multiply."],
        },
        {
          q: "A jar contains 5 red marbles and 3 blue marbles. One marble is drawn and replaced, then a second marble is drawn. What is the probability that the first marble is red OR the second marble is blue?",
          choices: ["49/64", "1", "5/8", "15/64"],
          answer: 0,
          explain:
            "Since these two events can both happen at once, the addition rule applies: P(A or B) = P(A) + P(B) - P(A and B). With P(first red)=5/8 and P(second blue)=3/8, and since the marble is replaced (making the draws independent), the overlap is 5/8 × 3/8 = 15/64, giving 5/8+3/8-15/64 = 49/64. 1 comes from simply adding 5/8 and 3/8 without subtracting any overlap, over-counting the outcome where both happen. 5/8 mistakenly reports just one of the two individual probabilities. 15/64 mistakenly reports just the overlap term itself instead of the final combined probability.",
          difficulty: "medium",
          why: [null, "Adding 5/8 and 3/8 counts the outcome where both happen twice. Subtract the overlap, 15/64.", "5/8 is only the chance the first is red. \"Or\" also includes the second being blue.", "15/64 is the chance both happen, not either one."],
        },
        {
          q: "A spinner has 4 equal sections numbered 1-4. What is the probability of spinning an even number?",
          choices: ["1/2", "1/4", "3/4", "2"],
          answer: 0,
          explain:
            "The favorable outcomes are 2 and 4, out of 4 total sections, giving 2/4 = 1/2. 1/4 comes from counting only one of the two even numbers. 3/4 reports the probability of an odd number instead. 2 mistakenly reports the count of favorable outcomes without dividing by the total.",
          difficulty: "easy",
          why: [null, "There are two even numbers, 2 and 4, not one.", "3/4 counts three sections, but only 2 and 4 are even.", "A probability can't be more than 1. 2 is the count of even sections; divide by 4."],
        },
        {
          q: "A fair coin is flipped 3 times. What is the probability of getting at least one heads?",
          choices: ["7/8", "1/8", "3/8", "1/2"],
          answer: 0,
          explain:
            "'At least one' is found using the complement rule: P(at least one) = 1 - P(none); P(all three tails) = (1/2)^3 = 1/8, so P(at least one heads) = 1 - 1/8 = 7/8. 1/8 mistakenly reports the complement itself instead of subtracting it from 1. 3/8 comes from an unrelated miscalculation across the three flips. 1/2 mistakenly applies the single-flip probability to the three-flip scenario.",
          difficulty: "medium",
          why: [null, "1/8 is the chance of no heads at all. Subtract it from 1.", "3/8 is the chance of exactly one heads. \"At least one\" also includes two or three heads.", "1/2 is for a single flip. With three flips, the only way to miss is all tails: 1 − 1/8."],
        },
        {
          q: "A jar contains 5 red and 3 blue marbles. Two marbles are drawn WITHOUT replacement. What is the probability that both are red?",
          choices: ["5/14", "25/64", "5/8", "4/7"],
          answer: 0,
          explain:
            "Since the draws are without replacement, the two events are dependent: P(first red) = 5/8, and given the first was red, only 4 red marbles remain out of 7 total, so P(second red | first red) = 4/7; multiplying gives 5/8 × 4/7 = 20/56 = 5/14. 25/64 comes from incorrectly treating the draws as independent and using 5/8 twice, as if the marble were replaced. 5/8 mistakenly reports just the first draw's probability. 4/7 mistakenly reports just the second draw's conditional probability.",
          difficulty: "hard",
          why: [null, "25/64 treats the draws as if the first marble were put back. Without replacement, the second draw is 4/7.", "5/8 is only the first draw. Both need to be red: 5/8 × 4/7.", "4/7 is only the second draw. Multiply by the first: 5/8 × 4/7."],
        },
      ],
      traps: [
        "Adding probabilities for an 'and' scenario instead of multiplying (that rule is for independent 'and' events specifically).",
        "Forgetting to subtract the overlap when using the addition rule for 'or' scenarios with events that can both occur.",
      ],
    },
    {
      name: "Conditional Probability",
      explanation:
        "Conditional probability questions shrink the total sample space down to a specific subgroup, signaled by phrases like 'given that' or 'if we know.' The key move: identify that restricted group first, then calculate probability using ONLY that subgroup as your new total, not the entire original data set.",
      examples: [
        {
          q: "A deck has 52 cards. What is the probability of drawing a card that is a heart, given that the card drawn is red?",
          choices: ["1/2", "1/4", "13/52", "1"],
          answer: 0,
          explain:
            "Restricting to the 26 red cards (hearts and diamonds), as specified by 'given that the card is red,' 13 of those are hearts, giving 13/26 = 1/2. 1/4 comes from using the full deck of 52 as the denominator instead of the restricted 26. 13/52 makes the same mistake in unreduced form. 1 would only be correct if every red card were a heart, which isn't the case.",
          difficulty: "easy",
          why: [null, "\"Given red\" limits you to the 26 red cards, and 13 are hearts: 13/26.", "13/52 uses the whole deck. The condition limits it to the 26 red cards.", "Not every red card is a heart. Half are diamonds."],
        },
        {
          q: "A survey of 200 students found that 120 play a sport, and of those 120, 45 also play a musical instrument. What is the probability that a student plays an instrument, given that they play a sport?",
          choices: ["3/8", "45/200", "9/40", "45/80"],
          answer: 0,
          explain:
            "Restricting to the 120 sport-playing students, as specified by 'given that they play a sport,' 45 of those also play an instrument, giving 45/120 = 3/8. 45/200 mistakenly uses the full 200 surveyed students as the denominator instead of the restricted 120. 9/40 comes from an unreduced or miscalculated fraction using the wrong denominator. 45/80 uses an unrelated, incorrect subgroup size.",
          difficulty: "medium",
          why: [null, "45/200 uses everyone surveyed. \"Given they play a sport\" limits it to the 120 who do.", "9/40 is 45/200 reduced, which still uses all 200 students instead of the 120 who play a sport.", "80 is the number who don't play a sport. The condition limits you to the 120 who do."],
        },
        {
          q: "A box contains 10 pens: 6 blue and 4 black. What is the probability that a randomly selected pen is black, given that it is not blue?",
          choices: ["1", "4/10", "6/10", "0"],
          answer: 0,
          explain:
            "Since every pen is either blue or black, 'not blue' restricts the group to just the 4 black pens; within that group, all 4 are black, giving 4/4 = 1. 4/10 mistakenly uses the full 10 pens as the denominator instead of the restricted group. 6/10 reports the probability of blue from the full set, unrelated to what's asked. 0 would only be correct if none of the 'not blue' pens were black, which contradicts the setup.",
          difficulty: "easy",
          why: [null, "4/10 uses all 10 pens. \"Not blue\" limits you to the 4 black pens, and all are black.", "6/10 is the chance of blue, which is ruled out by the condition.", "Every pen that isn't blue is black, so the probability is 1, not 0."],
        },
        {
          q: "A survey of 150 students found: 90 play a sport, 60 do not. Of the 90 who play a sport, 36 also work a part-time job. Of the 60 who don't play a sport, 24 work a part-time job. What is the probability that a student works a part-time job, given that they play a sport?",
          choices: ["2/5", "36/150", "24/60", "36/60"],
          answer: 0,
          explain:
            "Restricting to the 90 sport-playing students, as specified by 'given that they play a sport,' 36 of those also work a part-time job, giving 36/90 = 2/5. 36/150 mistakenly uses the full 150 students surveyed instead of the restricted 90. 24/60 pulls from the wrong subgroup (non-sport-players) entirely. 36/60 uses an unrelated, incorrect denominator.",
          difficulty: "medium",
          why: [null, "36/150 uses all students. \"Given they play a sport\" limits it to the 90 who do.", "24/60 is about the students who don't play a sport.", "The denominator should be the 90 sport players, not 60."],
        },
        {
          q: "Using the same survey (150 students: 90 play a sport, of whom 36 work a part-time job; 60 don't play a sport, of whom 24 work a part-time job), what is the probability a student plays a sport, given that they work a part-time job, and is this the same as the probability a student works a part-time job given that they play a sport?",
          choices: [
            "3/5, and it is NOT the same as P(part-time | sport) = 2/5",
            "2/5, and it IS the same as P(part-time | sport)",
            "3/5, and it IS the same as P(part-time | sport)",
            "2/5, and it is NOT the same as P(part-time | sport)",
          ],
          answer: 0,
          explain:
            "This restriction is different: 'given that they work a part-time job' restricts the total to all part-time workers, 36+24=60; within that group of 60, 36 also play a sport, giving P(sport | part-time) = 36/60 = 3/5 — which is NOT the same as P(part-time | sport) = 36/90 = 2/5, since the two conditional probabilities use different restricted totals (60 vs. 90) even though they share the same 36 students. Reporting 2/5 here confuses this calculation with the previous example's, using the wrong denominator (90 instead of 60). Claiming the two conditional probabilities are equal ignores that reversing which condition restricts the group changes the denominator, even when the numerator (36) stays the same.",
          difficulty: "hard",
          why: [null, "Given part-time work, the group is the 60 workers, and 36 play a sport: 3/5, not 2/5.", "3/5 is right, but it's not the same as P(part-time | sport) = 36/90 = 2/5.", "Given part-time work, the group is 60, not 90, so the probability is 3/5."],
        },
      ],
      traps: [
        "Using the full original sample size (52 cards) as the denominator instead of the restricted subgroup specified by the 'given that' condition.",
        "Confusing P(A given B) with P(B given A) — these can have very different values depending on the group sizes involved.",
      ],
    },
  ],
  tipsAndTricks: [
    "'And' with independent events means multiply; 'or' with events that could overlap means add the individual probabilities and then subtract the overlap.",
    "Any phrase like 'given that' signals conditional probability — immediately restrict your total sample size to just the specified subgroup before calculating.",
    "When in doubt about independence, ask: does the outcome of one event change the probability of the other? If yes, it's not independent, and simple multiplication doesn't apply.",
  ],
};

const LC_M_INFERENCE: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Interpreting Confidence Intervals Correctly",
      explanation:
        "Confidence interval questions test whether you understand what the interval actually claims: a plausible range for the TRUE population value, based on the sampling method — not a claim about individual data points, and not a guarantee. A common trap: picking an answer that misapplies the interval to individual observations, instead of to the population as a whole.",
      examples: [
        {
          q: "A 95% confidence interval for a population mean is (48, 56). Which statement correctly interprets this interval?",
          choices: [
            "The interval reflects a plausible range for the true population mean, based on the sampling method",
            "95% of individual data points in the population fall between 48 and 56",
            "There is a 95% probability that any individual observation falls between 48 and 56",
            "The true population mean is guaranteed to be between 48 and 56",
          ],
          answer: 0,
          explain:
            "A confidence interval describes a plausible range for the population MEAN, not for individual data points, and it's tied to the reliability of the sampling method, not a guarantee. Claiming 95% of individual data points fall in the range describes a completely different concept, like a percentile range. Claiming a 95% probability for any individual observation makes the same mistake, applying the interval to individual data instead of the population parameter. And 'guaranteed' overstates what a confidence interval claims — it's a plausible range, not a certainty.",
          difficulty: "easy",
          why: [null, "A confidence interval is about the population mean, not where individual data points fall.", "The interval is about the mean, not about any single observation.", "A confidence interval gives a plausible range, not a guarantee."],
        },
        {
          q: "A 90% confidence interval for the average commute time of employees at a company is (22, 28) minutes. Which statement correctly interprets this interval?",
          choices: [
            "The interval reflects a plausible range for the true average commute time across all employees, based on the sampling method",
            "90% of employees commute between 22 and 28 minutes",
            "Every employee's commute time falls between 22 and 28 minutes",
            "There is a 90% chance any randomly chosen employee commutes between 22 and 28 minutes",
          ],
          answer: 0,
          explain:
            "The interval describes a plausible range for the AVERAGE commute time across all employees, not for any individual employee's commute, and it's tied to the sampling method used to estimate that average. Claiming '90% of employees commute' within the range describes individual variation, a completely different idea from an interval around an average. Claiming 'every employee's' commute falls in the range overstates the claim even further. And describing a 90% chance for any individual employee makes the same individual-vs-average confusion.",
          difficulty: "medium",
          why: [null, "The interval estimates the average commute, not how many individual employees fall in the range.", "Individual commutes vary far more than the average does. The interval is only about the average.", "The interval is about the average commute, not the chance for any one employee."],
        },
        {
          q: "A 95% confidence interval for the average weight of apples in an orchard is (150, 170) grams. Which statement correctly interprets this interval?",
          choices: [
            "The interval reflects a plausible range for the true average apple weight in the orchard, based on the sampling method",
            "95% of apples weigh between 150 and 170 grams",
            "Every apple in the orchard weighs between 150 and 170 grams",
            "There is a 95% chance any individual apple weighs between 150 and 170 grams",
          ],
          answer: 0,
          explain:
            "The interval describes a plausible range for the population's mean weight, not for any individual apple's weight. Claiming '95% of apples weigh' within the range describes a different concept, individual variation rather than an interval around an average. Claiming 'every apple' weighs within the range overstates the claim entirely. And describing a 95% chance for any individual apple repeats the same individual-vs-average confusion.",
          difficulty: "easy",
          why: [null, "The interval estimates the average weight, not the share of apples in that range.", "Individual apples vary more than the average. The interval is only about the average.", "The interval is about the mean weight, not any single apple."],
        },
        {
          q: "A company claims its light bulbs last an average of 1,000 hours. A 90% confidence interval for the true mean lifespan, based on a sample, is (920, 980) hours. What does this suggest about the company's claim?",
          choices: [
            "The company's claim is questionable, since 1,000 hours falls outside the plausible range",
            "The company's claim is confirmed, since the interval is close to 1,000 hours",
            "The interval proves the true average is exactly 950 hours",
            "The sample size must have been too small to draw any conclusion",
          ],
          answer: 0,
          explain:
            "Checking whether the claimed value (1,000 hours) falls inside the interval (920, 980), it falls OUTSIDE, above the upper bound, suggesting the company's claim isn't well supported by the sample data. Saying the claim is 'confirmed' because the interval is 'close' misunderstands that being outside the interval means the claim isn't well supported, regardless of how close the numbers look. The interval doesn't prove any exact value — it establishes a plausible range, not a single confirmed number like 950. And nothing in the problem indicates the sample size was inadequate; the interval is simply informative on its own.",
          difficulty: "medium",
          why: [null, "1,000 is outside (920, 980), so the data doesn't support the claim, however close it looks.", "An interval gives a plausible range, not one exact value like 950.", "Nothing suggests the sample was too small. The interval itself is informative."],
        },
        {
          q: "A researcher claims that the average commute time in a city is 27 minutes. A 95% confidence interval for the true mean, based on a sample, is (24, 30) minutes. Does this data contradict the researcher's claim?",
          choices: [
            "No, the data does not contradict the claim, since 27 minutes falls within the plausible range",
            "Yes, the data contradicts the claim, since 27 is not exactly at the center of the interval",
            "Yes, the data proves the true mean cannot be 27 minutes",
            "No, the data proves the true mean is exactly 27 minutes",
          ],
          answer: 0,
          explain:
            "Checking whether the claimed value (27) falls inside the interval (24, 30), it does, so the sample data is consistent with the claim, not contradicting it, though this doesn't PROVE the true mean is exactly 27, since other values in the range are equally plausible. Claiming contradiction because 27 isn't exactly centered misunderstands that any value within the interval, not just the midpoint, is considered plausible. Claiming the data proves the mean cannot be 27 gets the conclusion backwards, since 27 falls inside, not outside, the range. And claiming the data proves the mean IS exactly 27 overstates what a confidence interval can establish: it supports plausibility, not certainty of one exact value.",
          difficulty: "hard",
          why: [null, "Any value inside the interval is plausible, not just the center. 27 is inside (24, 30).", "27 is inside the interval, so the data doesn't rule it out.", "Being inside the interval makes 27 plausible, not proven. Other values in the range are just as plausible."],
        },
      ],
      traps: [
        "Interpreting a confidence interval as describing where individual data points fall, rather than describing the population parameter.",
        "Treating the confidence interval as an absolute guarantee rather than a statement tied to the reliability of the sampling method.",
      ],
    },
    {
      name: "Sample Size's Effect on Margin of Error",
      explanation:
        "This pattern tests the relationship between sample size and precision: larger samples generally produce smaller margins of error (more precise estimates) as long as the confidence level stays the same. This is worth just memorizing directly, since it shows up often in slightly different phrasings.",
      examples: [
        {
          q: "A researcher increases the sample size from 100 to 400 while keeping the same confidence level. What is the most likely effect on the width of the confidence interval?",
          choices: [
            "The confidence interval will narrow",
            "The confidence interval will widen",
            "The confidence interval will stay exactly the same width",
            "The confidence level will decrease",
          ],
          answer: 0,
          explain:
            "Larger sample size leads to a smaller margin of error and thus a narrower confidence interval, all else equal, so increasing from 100 to 400 should narrow the interval. Claiming it will widen reverses the correct relationship. Claiming no change ignores that sample size directly affects precision. And the confidence level isn't affected by sample size at all — it's a separate, chosen value, unrelated to what happens here.",
          difficulty: "easy",
          why: [null, "A larger sample gives a smaller margin of error, which narrows the interval.", "Sample size affects precision. Quadrupling it narrows the interval.", "The confidence level is chosen separately. The sample size doesn't change it."],
        },
        {
          q: "A pollster wants a narrower margin of error for an upcoming election poll while keeping the same 95% confidence level. What should they do to their sample size?",
          choices: [
            "Increase the sample size",
            "Decrease the sample size",
            "Increase the confidence level",
            "Decrease the confidence level",
          ],
          answer: 0,
          explain:
            "Larger sample size produces a smaller margin of error, holding confidence level constant, so increasing the sample size is exactly what a narrower margin requires. Decreasing the sample size would widen the interval, the opposite of the desired outcome. Changing the confidence level doesn't address the goal here, since the pollster explicitly wants to KEEP the same 95% confidence level — and increasing confidence level would widen the interval anyway, working against the goal. Decreasing the confidence level would narrow the interval but abandon the stated 95% requirement, which isn't what was asked.",
          difficulty: "medium",
          why: [null, "A smaller sample makes the margin of error larger, the opposite of the goal.", "The pollster wants to keep 95%, and a higher level would widen the interval anyway.", "That would narrow the margin, but it abandons the required 95% level."],
        },
        {
          q: "A researcher decreases the sample size from 500 to 200 while keeping the same confidence level. What is the most likely effect on the width of the confidence interval?",
          choices: [
            "The confidence interval will widen",
            "The confidence interval will narrow",
            "The confidence interval will stay exactly the same width",
            "The confidence level will increase",
          ],
          answer: 0,
          explain:
            "Smaller sample size leads to a larger margin of error and thus a wider confidence interval, all else equal, so decreasing from 500 to 200 should widen the interval. Claiming it will narrow reverses the correct relationship. Claiming no change ignores that sample size directly affects precision. And the confidence level isn't affected by sample size — it's a separately chosen value.",
          difficulty: "easy",
          why: [null, "A smaller sample gives a larger margin of error, which widens the interval.", "Sample size affects precision. Cutting it from 500 to 200 widens the interval.", "The confidence level is chosen separately. The sample size doesn't change it."],
        },
        {
          q: "A pollster increases the confidence level from 90% to 99% while keeping the same sample size. What is the most likely effect on the width of the confidence interval?",
          choices: [
            "The confidence interval will widen",
            "The confidence interval will narrow",
            "The confidence interval will stay exactly the same width",
            "The sample size effectively increases",
          ],
          answer: 0,
          explain:
            "Increasing the confidence level runs the OPPOSITE direction from the sample-size relationship: to be more confident (99% vs. 90%) that the interval actually contains the true value, the range needs to be broader, so increasing from 90% to 99% should widen the interval. Claiming it will narrow confuses this with the sample-size relationship, which runs the opposite direction. Claiming no change ignores that confidence level directly affects interval width. And the sample size doesn't change here at all; only the confidence level does.",
          difficulty: "medium",
          why: [null, "Being more confident requires a wider range, not a narrower one.", "The confidence level directly affects the width. Going to 99% widens it.", "The sample size stays the same. Only the confidence level changes."],
        },
        {
          q: "A study increases both its sample size and its confidence level at the same time. A colleague claims the resulting confidence interval must be narrower, since larger samples always produce narrower intervals. Is the colleague's reasoning fully correct?",
          choices: [
            "The colleague's reasoning is incomplete, since the confidence level increase pushes the interval width in the opposite direction",
            "The colleague is fully correct, since increasing sample size always narrows the interval regardless of anything else",
            "The colleague is fully correct, since increasing confidence level always narrows the interval too",
            "Neither change affects the interval's width unless both happen at the exact same rate",
          ],
          answer: 0,
          explain:
            "Larger sample size narrows the interval, but higher confidence level widens it (two changes pushing the interval's width in OPPOSITE directions), so since both changed at once, the net result depends on the size of each change and can't be determined from the sample-size effect alone; the colleague's reasoning is incomplete because it ignores the confidence level's opposing effect. Saying the colleague is 'fully correct' ignores that a second, competing change (confidence level) was also made. Claiming confidence level 'also narrows' the interval gets that specific relationship backwards: confidence level increases widen intervals, they don't narrow them. And it's not true that the changes must happen 'at the exact same rate' to have any effect; it's just that the net direction isn't determinable without knowing those sizes.",
          difficulty: "hard",
          why: [null, "The confidence level also changed, and a higher level widens the interval. The net effect isn't certain.", "A higher confidence level widens an interval; it doesn't narrow it.", "Each change affects the width on its own. The net direction just can't be determined without their sizes."],
        },
      ],
      traps: [
        "Reversing the relationship and assuming larger samples produce wider (less precise) intervals.",
        "Confusing sample size effects with confidence level effects — increasing confidence level (e.g., 95% to 99%) actually widens the interval, the opposite direction from increasing sample size.",
      ],
    },
    {
      name: "Estimating a Population Count from a Sample Proportion",
      explanation:
        "The most common version of this subskill doesn't involve confidence intervals or margin of error at all; it just asks you to scale up a proportion from a random sample to estimate a count in the full population. The method: find the sample's proportion (favorable outcomes divided by sample size), then apply that same proportion to the full population size. This only works reliably when the sample was actually random; always check that before trusting a scaled-up estimate.",
      examples: [
        {
          q: "A researcher randomly selects 20 employees from a company of 400 and finds that 16 of them are enrolled in a wellness program. Based on this sample, what is the best estimate of the number of employees at the company enrolled in the wellness program?",
          choices: ["320", "16", "80", "384"],
          answer: 0,
          explain:
            "Finding the sample proportion, 16/20=0.8, and applying it to the full population, 0.8 × 400 = 320. 16 mistakenly reports the raw sample count instead of scaling it up. 80 comes from applying the wrong proportion, like 20% instead of 80%, to the population. 384 comes from an unrelated miscalculation, like using the wrong population size in the multiplication.",
          difficulty: "easy",
          why: [null, "16 is the count in the sample. Scale it up: 16/20 = 80% of 400.", "80 is the estimate of employees not enrolled (4 of every 20).", "384 subtracts 16 from 400. Use the sample proportion: 80% of 400 = 320."],
        },
        {
          q: "A quality inspector randomly samples 50 bolts from a shipment of 3,000 and finds 3 are defective. Based on this sample, what is the best estimate of the total number of defective bolts in the shipment?",
          choices: ["180", "3", "60", "150"],
          answer: 0,
          explain:
            "Finding the sample proportion, 3/50=0.06, and applying it to the full shipment, 0.06 × 3,000 = 180. 3 mistakenly reports the raw sample count instead of scaling it up. 60 comes from applying a rate ten times too small. 150 comes from an unrelated arithmetic slip in the multiplication.",
          difficulty: "easy",
          why: [null, "3 is the count in the sample. Scale up: 3/50 = 6% of 3,000.", "60 is how many groups of 50 fit in 3,000. Multiply by the 3 defects per group: 180.", "150 uses 5%. The sample rate is 3/50 = 6%."],
        },
        {
          q: "A random sample of 250 voters from a district of 60,000 found that 175 support a proposed measure. Based on this sample, what is the best estimate of the number of voters in the district who do NOT support the measure?",
          choices: ["18,000", "42,000", "175", "12,000"],
          answer: 0,
          explain:
            "Finding the sample proportion who support, 175/250=0.7, and since the question asks about those who do NOT support, the complement proportion is 1-0.7=0.3, applied to the full population: 0.3 × 60,000 = 18,000. 42,000 mistakenly scales up the 'support' proportion (0.7) instead of finding the complement first, answering the wrong question. 175 mistakenly reports the raw sample count instead of scaling it up at all. 12,000 comes from an unrelated arithmetic slip in the final multiplication.",
          difficulty: "medium",
          why: [null, "42,000 estimates the supporters. The question asks for those who don't support: 30%.", "175 is the number of supporters in the sample, not an estimate for the district.", "12,000 uses 20%. Non-supporters are 75 of 250, which is 30%."],
        },
        {
          q: "An online news site posts a poll on its website, and 2,400 of its 3,000 respondents say they prefer streaming over cable TV. The site's editor claims this shows 80% of ALL adults in the country prefer streaming. Is this estimate valid?",
          choices: [
            "No — the sample was self-selected rather than randomly drawn, so it can't reliably estimate the broader population",
            "Yes — 80% is an accurate estimate, since 3,000 respondents is a large enough sample size",
            "Yes — any online poll can be scaled up to the general population as long as the percentage is reported correctly",
            "No — the estimate is invalid because 80% is too high a percentage to be realistic",
          ],
          answer: 0,
          explain:
            "This is a self-selected online poll (only people who chose to visit the site and respond are included, not a random sample of all adults), so even though 80% is accurate for the poll's respondents, it can't be reliably scaled up to represent all adults nationally, regardless of the sample's size. Claiming validity based on the large sample size (3,000) ignores that sample size doesn't fix a lack of random selection; a big biased sample is still biased. Claiming any online poll can be scaled up as long as the percentage is reported correctly ignores the random-sampling requirement entirely. And there's nothing inherently unrealistic about an 80% figure: the problem is the sampling method, not the size of the percentage itself.",
          difficulty: "medium",
          why: [null, "A big sample doesn't fix how it was chosen. People who opted in to a website poll aren't a random sample.", "Scaling up requires a random sample. An opt-in online poll isn't one.", "The problem isn't that 80% is too high. It's that the sample wasn't random."],
        },
        {
          q: "A city's parks department randomly surveys 80 out of 5,000 registered users of a park app and finds that 12 reported visiting a park at least 3 times per week. If each 'frequent visitor' uses park facilities worth about $45 per month in maintenance costs, what is the best estimate of total monthly maintenance costs attributable to frequent visitors, based on this sample?",
          choices: ["$33,750", "$540", "$3,600", "$225,000"],
          answer: 0,
          explain:
            "Finding the sample proportion of frequent visitors, 12/80=0.15, scaling up to the full population, 0.15 × 5,000 = 750 estimated frequent visitors, and applying the given per-visitor cost, 750 × $45 = $33,750. $540 mistakenly applies the per-visitor cost to the sample's raw count (12) instead of the scaled-up population estimate. $3,600 comes from an incomplete calculation that stops partway through the two-step process. $225,000 comes from applying the per-visitor cost to the full population size (5,000) instead of just the estimated frequent-visitor subset.",
          difficulty: "hard",
          why: [null, "$540 uses the 12 people in the sample. Scale up first: 15% of 5,000 = 750 people.", "$3,600 multiplies the 80 people sampled by $45. Use the estimated 750 frequent visitors.", "$225,000 charges every user $45. Only the estimated 750 frequent visitors count."],
        },
      ],
      traps: [
        "Applying the sample's raw count directly to the population instead of first converting it to a proportion or rate.",
        "Estimating a population count from a sample that wasn't randomly selected, when the problem specifically flags a biased or self-selected sample.",
        "Rounding or presenting the final estimate in a way that doesn't make sense for the context.",
      ],
    },
  ],
  tipsAndTricks: [
    "A confidence interval is about the population parameter's plausible range, not about individual data points — this distinction resolves most interpretation questions instantly.",
    "Bigger sample size → smaller margin of error → narrower interval. Bigger confidence level (95% → 99%) → WIDER interval. These two relationships go in opposite directions — don't mix them up.",
    "Random sampling supports generalizing results to a broader population; it does NOT by itself support a causal claim — that distinction shows up constantly in this domain.",
  ],
};

const LC_M_STATISTICAL_CLAIMS: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Distinguishing Correlation from Causation",
      explanation:
        "This is the single most-tested concept in this subskill: an observational study (no random assignment) can only show correlation, never causation, because some hidden confounding variable could actually explain the relationship. Only a randomized controlled experiment, with random assignment to groups, can support a causal claim. Recognizing which type of study design is described is the entire key to these questions.",
      examples: [
        {
          q: "An observational study finds ice cream sales correlate with drowning incidents. What's the best interpretation?",
          choices: [
            "A confounding variable, like summer heat, most likely explains both trends",
            "Ice cream consumption directly causes drowning",
            "Drowning incidents directly cause higher ice cream sales",
            "The correlation proves a causal relationship exists in one direction or the other",
          ],
          answer: 0,
          explain:
            "This is an observational study (no random assignment of who eats ice cream), so causation cannot be concluded; hot summer weather likely increases both ice cream sales and swimming (and therefore drowning risk), making it a confounding variable and the most reasonable explanation. Claiming ice cream causes drowning ignores that no plausible mechanism connects the two directly. Claiming drowning causes ice cream sales reverses an already-implausible causal claim. And claiming the correlation 'proves' causation in either direction ignores the defining limitation of an observational study.",
          difficulty: "easy",
          why: [null, "There's no plausible way ice cream causes drowning. Hot weather drives both.", "Drowning doesn't cause ice cream sales. A third factor, heat, explains both.", "An observational study shows correlation, not proof of cause in either direction."],
        },
        {
          q: "A city notices that neighborhoods with more coffee shops also tend to have higher average rents. A local blogger claims that opening coffee shops causes rent increases. What's the best interpretation?",
          choices: [
            "A confounding variable, like a neighborhood becoming more desirable, most likely explains both trends",
            "Opening coffee shops directly causes rent increases",
            "Rising rents directly cause more coffee shops to open",
            "The correlation is coincidental and has no underlying explanation",
          ],
          answer: 0,
          explain:
            "This is observational (no one randomly assigned coffee shops to neighborhoods), so causation can't be concluded from the correlation alone; a neighborhood becoming more desirable or seeing more investment could independently attract both new coffee shops and rising rents, making that shared trend a far more plausible confounding variable than coffee shops directly driving up rent. Claiming coffee shops directly cause rent increases is exactly the unsupported leap the blogger made. Claiming rents cause coffee shops reverses that same unsupported leap. And dismissing the correlation as purely coincidental ignores that a real, identifiable confounding variable is a much more likely explanation than pure chance.",
          difficulty: "medium",
          why: [null, "That's the blogger's leap. Without random assignment, a correlation doesn't show cause.", "This reverses the same unsupported leap. Both likely come from a third factor.", "A real confounding variable, like the area becoming more desirable, is more likely than pure chance."],
        },
        {
          q: "An observational study finds that students who eat breakfast tend to have higher test scores than students who skip breakfast. What's the best interpretation?",
          choices: [
            "A confounding variable, like family routine or income, most likely explains both trends",
            "Eating breakfast directly causes higher test scores",
            "Higher test scores directly cause students to eat breakfast",
            "No relationship exists between breakfast and test scores at all",
          ],
          answer: 0,
          explain:
            "This is observational (no random assignment of who eats breakfast), so causation cannot be concluded; family routines, income, or overall health habits could independently affect both breakfast habits and test performance, making a confounding variable the most reasonable explanation. Claiming breakfast directly causes higher scores is exactly the unsupported leap an observational study can't justify. Claiming test scores cause breakfast-eating reverses that same unsupported leap and doesn't even make logical sense as a causal direction. And denying any relationship contradicts the correlation the study actually found.",
          difficulty: "easy",
          why: [null, "An observational study can't show that breakfast itself raises scores. Other factors may drive both.", "Test scores can't cause breakfast habits, and the study can't show cause anyway.", "The study found a relationship. It just can't say what causes it."],
        },
        {
          q: "A study finds that neighborhoods with more public libraries have lower rates of teen crime. A city council member proposes building more libraries specifically to reduce crime. What is the main weakness in this reasoning?",
          choices: [
            "A confounding variable, like overall neighborhood investment, likely explains both trends, so adding libraries elsewhere may not replicate the effect",
            "The study proves libraries directly reduce crime, so the proposal is fully justified",
            "The sample size of neighborhoods studied was too small to matter",
            "Crime rates directly cause neighborhoods to build fewer libraries",
          ],
          answer: 0,
          explain:
            "This is observational (no random assignment of libraries to neighborhoods), so causation can't be concluded from the correlation alone; neighborhoods with more overall public investment or resources might have both more libraries AND lower crime, independent of any direct effect of libraries themselves, so building more libraries in a different neighborhood without those other resources might not produce the same crime reduction. Claiming the study proves a direct causal effect ignores the defining limitation of an observational design. Blaming sample size misidentifies the actual flaw, which is the confounding variable, not the amount of data collected. And claiming crime causes fewer libraries reverses the correlation in a way not supported by the study at all.",
          difficulty: "medium",
          why: [null, "An observational study can't prove libraries reduce crime.", "The flaw is the likely confounding variable, not the sample size.", "This reverses the relationship and isn't supported by the study."],
        },
        {
          q: "Researchers randomly assign 200 volunteers to either take a new supplement or a placebo, without either group knowing which they received, then measure changes in blood pressure after 8 weeks. The supplement group shows a significantly larger decrease. Can this study support a causal claim?",
          choices: [
            "Yes — with random assignment and a placebo control group, this is a randomized controlled experiment, which can support causation",
            "No — correlation never implies causation under any circumstances",
            "No — a sample of 200 volunteers is too small to ever support a causal claim",
            "Yes — but only because the supplement group showed a significant decrease, regardless of the study's design",
          ],
          answer: 0,
          explain:
            "Checking the study design, there was random assignment (yes) and a control (placebo) group (yes), so with both randomization and a control group in place, this design CAN support a causal claim, unlike a purely observational study. Claiming correlation never implies causation 'under any circumstances' overgeneralizes: a properly designed randomized controlled experiment is specifically the tool that CAN support causal claims. Objecting to the sample size misidentifies what actually determines whether a study can support causation, which is the design, not simply how many participants were involved. And crediting the significant result alone, regardless of design, ignores that the same significant result from a poorly designed observational study would NOT support causation: the design is what earns the causal conclusion, not the result's size.",
          difficulty: "hard",
          why: [null, "A randomized controlled experiment is exactly the kind of study that can support causation.", "What allows a causal claim is the design (random assignment and a control), not a certain sample size.", "The significant result supports causation because of the randomized design, not regardless of it."],
        },
      ],
      traps: [
        "Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.",
        "Failing to identify a plausible confounding variable that could explain both observed trends simultaneously.",
      ],
    },
    {
      name: "Evaluating Study Design for Causal Claims",
      explanation:
        "This pattern asks you to evaluate whether a specific study design actually supports the causal claim being made. Checklist: was there random assignment to treatment/control groups? Was there a control or placebo group, to isolate the treatment's effect from other factors? If either is missing, the strongest honest conclusion is 'association only' — no matter how compelling the result looks.",
      examples: [
        {
          q: "A company claims a new supplement causes weight loss based on a study with no control group. What is the primary weakness of this claim?",
          choices: [
            "Without a control group, other factors like diet or exercise changes cannot be ruled out as the actual cause",
            "The weakness is that the study didn't use random sampling of participants",
            "The weakness is that the sample size was too small to detect any effect",
            "The weakness is that weight loss cannot be measured accurately in any study",
          ],
          answer: 0,
          explain:
            "Checking the study design against the causal-claim checklist, there is no control group to compare against, so other explanations for the weight change (like diet changes, exercise changes, or simply time passing) cannot be ruled out; this missing comparison is the primary weakness, not the sample size or any other factor. Random sampling is a different concept from random assignment and isn't the specific issue described here. Blaming sample size misidentifies the actual flaw, which is the missing comparison group. And claiming weight loss can never be measured accurately is an unsupported, overly broad claim unrelated to this study's actual design flaw.",
          difficulty: "easy",
          why: [null, "Random sampling is a different issue. The key flaw is having no control group to compare against.", "The main problem is the missing control group, not the sample size.", "Weight can be measured accurately. The flaw is having no comparison group."],
        },
        {
          q: "A researcher wants to test whether a new tutoring method improves test scores. Students are randomly assigned to either the new method or the standard method, and both groups take the same final test, with the new-method group scoring higher. Does this design support a causal claim?",
          choices: [
            "Yes — with random assignment and a comparison group, the higher scores can reasonably be attributed to the tutoring method",
            "No — an observational study can never support a causal claim, and this is no exception",
            "No — the standard-method group doesn't count as a real control group",
            "Yes — but only because more students scored higher in the new-method group, regardless of assignment",
          ],
          answer: 0,
          explain:
            "Running the causal-claim checklist, there was random assignment (yes) and a comparison group (yes, the standard-method group serves as the control), so since both boxes are checked, this design does isolate the tutoring method's effect from other explanations, unlike the earlier supplement study. Claiming this is observational and therefore can't support causation misreads the design — random assignment is specifically what makes this NOT a purely observational study. Denying that the standard-method group is a real control misunderstands what a control group is: a comparison group that didn't receive the treatment being tested, which is exactly what it is here. And crediting the result alone, regardless of assignment, ignores that random assignment is precisely what allows the result to be attributed to the tutoring method rather than some other factor.",
          difficulty: "medium",
          why: [null, "Random assignment is what makes this an experiment, not an observational study.", "The standard-method group didn't get the new method, which is exactly what a control group is.", "The result can be credited to the method because of random assignment, not regardless of it."],
        },
        {
          q: "A researcher wants to test whether a new fertilizer increases crop yield. They apply the fertilizer to one field and compare its yield to that same field's yield from the previous year, when no fertilizer was used. What is the primary weakness of this design?",
          choices: [
            "The lack of a genuine same-time control means other year-to-year factors, like weather, can't be ruled out",
            "The weakness is that only one field was studied instead of many",
            "The weakness is that fertilizer effects can never be measured through yield comparisons",
            "The weakness is that the researcher didn't use random assignment of fertilizer amounts",
          ],
          answer: 0,
          explain:
            "Checking the study design against the causal-claim checklist, there is no genuine control group tested under the same conditions (this compares the same field across two different years, not two groups under the same conditions), so other factors that changed between years, like weather, rainfall, or soil conditions, can't be ruled out as explanations for any yield difference; this missing same-time comparison is the primary weakness. Blaming the use of only one field misidentifies the flaw, which is the lack of a same-time comparison, not simply the amount of data. Claiming yield comparisons can never measure fertilizer effects is an overly broad claim unrelated to this study's specific flaw. And while random assignment would help, the immediately identifiable weakness here is the missing same-time control, the more specific and direct issue described.",
          difficulty: "easy",
          why: [null, "The key flaw is comparing different years, when weather and other factors change, not the number of fields.", "Yield comparisons can work with a proper same-time control. This design lacks one.", "The more direct flaw is the lack of a comparison group grown at the same time."],
        },
        {
          q: "Researchers randomly assign participants to either receive a new pain medication or a sugar pill (placebo), but everyone (participants and researchers alike) knows who received which. Pain levels are then assessed through interviews. What is a specific weakness of this design?",
          choices: [
            "The lack of blinding means self-reported outcomes could be biased by knowing who received which treatment",
            "The weakness is that there was no random assignment of participants",
            "The weakness is that there was no placebo group used for comparison",
            "The weakness is that pain cannot be measured through interviews under any circumstances",
          ],
          answer: 0,
          explain:
            "Checking the checklist, random assignment (yes) and a control/placebo group (yes) are both present, so the study isn't missing those basics; but because everyone knows who received the real medication, participants' self-reported pain levels (and researchers' assessments of them) could be influenced by expectation rather than the medication itself, a lack of 'blinding.' Claiming there was no random assignment contradicts what's explicitly stated in the setup. Claiming there was no placebo group also contradicts the setup, which explicitly includes one. And claiming pain can never be measured through interviews is an overly broad claim unrelated to this study's specific, identifiable flaw.",
          difficulty: "medium",
          why: [null, "The setup says participants were randomly assigned.", "The setup includes a placebo group.", "Interviews can measure pain. The problem is that everyone knew who got what."],
        },
        {
          q: "A gym's marketing claims 'attending our gym causes higher life satisfaction, and gym attendance improves cardiovascular health.' Life satisfaction was measured through an observational self-report survey with no random assignment; cardiovascular health was measured separately through a randomized 12-week trial comparing gym attendance to a non-exercise control group. Which part of the marketing claim is better supported by evidence?",
          choices: [
            "The cardiovascular health claim is better supported, since it comes from a randomized controlled trial",
            "The life satisfaction claim is better supported, since it was measured through a direct survey",
            "Both claims are equally well supported, since both come from the same marketing campaign",
            "Neither claim is well supported, since gym marketing is inherently unreliable",
          ],
          answer: 0,
          explain:
            "This compound claim rests on two different pieces of evidence with different designs, evaluated separately: the life satisfaction claim comes from an observational survey with no random assignment, so it can only support correlation, not the causal wording used, while the cardiovascular health claim comes from a randomized controlled trial with a control group, which CAN support a causal claim — making the cardiovascular claim the better-supported one. Claiming the life satisfaction claim is better supported because it was 'measured through a direct survey' confuses direct measurement with a design that can establish causation, which the survey's lack of random assignment prevents. Claiming both are equally supported ignores that they come from two genuinely different study designs. And dismissing both as unreliable ignores that one of the two claims does come from a well-designed randomized controlled trial, a specific and legitimate reason to distinguish between them rather than lumping them together.",
          difficulty: "hard",
          why: [null, "A survey measures directly but can't show cause without random assignment.", "The two claims come from different designs, and only one was a randomized trial.", "The cardiovascular claim comes from a randomized controlled trial, which is solid evidence."],
        },
      ],
      traps: [
        "Attributing a study's weakness to sample size or public perception when the actual, specific flaw is a missing control group or missing random assignment.",
        "Accepting a causal claim as fully proven just because a study reports a statistically notable result, without checking the underlying design.",
      ],
    },
  ],
  tipsAndTricks: [
    "Ask two design questions on every causal-claim problem: (1) was there random assignment to groups? (2) was there a control/comparison group? If either answer is no, the claim can only be association, not causation.",
    "When two variables move together in an observational study, always consider whether a third, confounding variable could explain both — this is almost always the 'correct' skeptical interpretation.",
    "Random SAMPLING (who you survey) supports generalizing results to a population; random ASSIGNMENT (which group each subject is placed in) supports causal claims — these are different tools solving different problems, and mixing them up is a common trap.",
  ],
};

const LC_M_AREA_VOLUME: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Scale Factor Effects on Area and Volume",
      explanation:
        "This pattern tests whether you know that a linear scale factor doesn't apply directly to area or volume. If every linear dimension of a shape scales by a factor of k, area scales by k² (not k), and volume scales by k³ (not k). This is a very common trap: correctly finding the scale factor, then applying it directly to area or volume instead of squaring or cubing it first.",
      examples: [
        {
          q: "If a square's side length doubles, by what factor does its area increase?",
          choices: ["4", "2", "8", "16"],
          answer: 0,
          explain:
            "The linear scale factor is k=2 (side length doubles); area scales by k², not k, so the area increases by 2²=4. 2 mistakenly applies the linear scale factor directly to area instead of squaring it. 8 comes from confusing the volume rule (k³) with the area rule. 16 comes from squaring the wrong quantity, like squaring the area's own factor instead of the linear factor.",
          diagram: { kind: "scaleCompare", shape: "square", factorLabel: "2" },
          difficulty: "easy",
          why: [null, "Area uses two dimensions, so the factor is squared: 2² = 4.", "8 is 2³, the factor for volume. Area uses 2² = 4.", "16 is 4², which squares twice. Area scales by 2² = 4."],
        },
        {
          q: "A cube's side length is tripled. By what factor does its volume increase?",
          choices: ["27", "3", "9", "6"],
          answer: 0,
          explain:
            "The linear scale factor is k=3 (side length triples); volume scales by k³, not k or k², so the volume increases by 3³=27. 3 mistakenly applies the linear scale factor directly to volume. 9 comes from confusing the area rule (k²) with the volume rule. 6 comes from multiplying the scale factor by the number of dimensions instead of raising it to a power.",
          diagram: { kind: "scaleCompare", shape: "cube", factorLabel: "3" },
          difficulty: "medium",
          why: [null, "Volume uses three dimensions, so the factor is cubed: 3³ = 27.", "9 is 3², the factor for area. Volume uses 3³.", "6 is 3 × 2. The factor is raised to a power, not multiplied: 3³ = 27."],
        },
        {
          q: "If a circle's radius triples, by what factor does its area increase?",
          choices: ["9", "3", "27", "6"],
          answer: 0,
          explain:
            "The linear scale factor is k=3 (radius triples); area scales by k², not k, so the area increases by 3²=9. 3 mistakenly applies the linear scale factor directly to area. 27 comes from confusing the volume rule (k³) with the area rule. 6 comes from multiplying instead of squaring the scale factor.",
          diagram: { kind: "scaleCompare", shape: "circle", factorLabel: "3" },
          difficulty: "easy",
          why: [null, "Area scales by the square of the factor: 3² = 9.", "27 is 3³, the factor for volume.", "6 is 3 × 2. Square the factor instead: 3² = 9."],
        },
        {
          q: "A square's area increases by a factor of 16 after being enlarged. By what factor did its side length increase?",
          choices: ["4", "16", "8", "256"],
          answer: 0,
          explain:
            "Since area scales by k², an area scale factor of 16 means k²=16, so k=4 (the positive root, since a scale factor can't be negative) — the side length increased by a factor of 4, not 16. 16 mistakenly reports the area scale factor itself as if it were the linear scale factor. 8 comes from halving 16 instead of taking its square root. 256 comes from squaring 16 instead of taking its square root, moving in the wrong direction entirely.",
          diagram: { kind: "scaleCompare", shape: "square", factorLabel: "?" },
          difficulty: "medium",
          why: [null, "16 is the area factor. The side factor is its square root: 4.", "8 is half of 16. Take the square root instead: 4.", "256 squares 16. Go the other way: the square root of 16 is 4."],
        },
        {
          q: "A cube's side length doubles. By what factor does the ratio of its surface area to its volume change?",
          choices: ["1/2", "2", "4", "8"],
          answer: 0,
          explain:
            "Surface area scales by k² and volume scales by k³, with k=2 here: surface area scales by 2²=4, volume scales by 2³=8, so the RATIO of surface area to volume scales by 4/8=1/2 — the ratio is cut in half, since volume grows faster than surface area as an object scales up. 2 mistakenly applies the linear scale factor directly to the ratio. 4 mistakenly reports just the surface area's scale factor as if it were the ratio's. 8 mistakenly reports just the volume's scale factor as if it were the ratio's.",
          diagram: { kind: "scaleCompare", shape: "cube", factorLabel: "2" },
          difficulty: "hard",
          why: [null, "The ratio changes by 4/8, since area grows by 4 and volume by 8.", "4 is only the surface area's factor. The volume grows by 8, so the ratio changes by 4/8.", "8 is only the volume's factor. The ratio changes by 4/8 = 1/2."],
        },
      ],
      traps: [
        "Applying the linear scale factor directly to area or volume instead of squaring (for area) or cubing (for volume) it first.",
        "Mixing up which scaling rule (k² or k³) applies to area versus volume.",
      ],
    },
    {
      name: "Composite Figures and Formula Selection",
      explanation:
        "This pattern involves picking and correctly applying the right area, perimeter, or volume formula for a shape — often in a word problem that disguises what the shape actually is (a 'can' is a cylinder, a 'ball' is a sphere). The reliable approach: figure out exactly which formula applies before calculating anything, and write it out explicitly instead of trying to recall it from memory mid-problem. Flat figures follow the same rule. Perimeter is just the sum of the side lengths, so a missing side is the perimeter minus all the known sides. A right triangle's area is (1/2)(leg)(leg): if you're given all three sides, the longest one is the hypotenuse, and it never goes into the area. With radical side lengths, compare them by squaring ((4√3)² = 48, (6√2)² = 72), and check that the two smaller squares add to the largest.",
      examples: [
        {
          q: "A cylindrical water tank has a radius of 3 and a height of 10. What is its volume in terms of π?",
          choices: ["90π", "30π", "60π", "270π"],
          answer: 0,
          explain:
            "A cylinder's volume is πr²h; substituting r=3, h=10 gives π(3²)(10)=π(9)(10)=90π. 30π comes from forgetting to square the radius, using πrh instead. 60π comes from an arithmetic slip in the multiplication. 270π comes from mistakenly cubing the radius instead of squaring it.",
          diagram: { kind: "solid", shape: "cylinder", labels: { r: "3", h: "10" } },
          difficulty: "easy",
          why: [null, "30π forgets to square the radius: π(3)(10). It's π(3²)(10).", "60π uses 2r instead of r². The formula is πr²h = π(9)(10).", "270π cubes the radius. The formula uses r²."],
        },
        {
          q: "A cone-shaped paper cup has a radius of 3 cm and a height of 8 cm. What is its volume in terms of π?",
          choices: ["24π", "72π", "8π", "216π"],
          answer: 0,
          explain:
            "A cone's volume is (1/3)πr²h, which needs the extra factor of 1/3 that a cylinder's formula doesn't have; substituting r=3, h=8 gives (1/3)π(9)(8)=(1/3)(72π)=24π. 72π mistakenly uses the cylinder formula (without the 1/3 factor) for what is actually a cone. 8π comes from an arithmetic slip in the multiplication. 216π comes from mistakenly cubing the radius instead of squaring it.",
          diagram: { kind: "solid", shape: "cone", labels: { r: "3", h: "8" } },
          difficulty: "medium",
          why: [null, "72π is the cylinder formula. A cone is one-third of that: 24π.", "8π forgets to square the radius: (1/3)π(3)(8).", "216π cubes the radius and skips the 1/3."],
        },
        {
          q: "A sphere-shaped water tank has a radius of 6 feet. What is its volume in terms of π?",
          choices: ["288π", "144π", "216π", "48π"],
          answer: 0,
          explain:
            "A sphere's volume is (4/3)πr³; substituting r=6 gives (4/3)π(216)=288π. 144π comes from forgetting the 4/3 factor and only using half of it correctly. 216π mistakenly reports r³ itself without multiplying by 4/3. 48π comes from an arithmetic slip in the multiplication.",
          diagram: { kind: "solid", shape: "sphere", labels: { r: "6" } },
          difficulty: "easy",
          why: [null, "144π is the surface area, 4πr². Volume is (4/3)πr³.", "216π is πr³ without the 4/3.", "48π squares the radius instead of cubing it: (4/3)π(36)."],
        },
        {
          q: "A silo is shaped like a cylinder with a hemisphere on top. The cylinder has a radius of 4 feet and a height of 10 feet, and the hemisphere has the same radius. What is the silo's total volume in terms of π?",
          choices: ["(608/3)π", "160π", "(128/3)π", "288π"],
          answer: 0,
          explain:
            "This composite figure requires two separate formulas added together: cylinder volume π(4²)(10)=160π, plus hemisphere volume (half a sphere) (1/2)(4/3)π(64)=(128/3)π, giving a total of 160π+(128/3)π=(480/3)π+(128/3)π=(608/3)π. 160π mistakenly reports just the cylinder's volume, forgetting to add the hemisphere. (128/3)π mistakenly reports just the hemisphere's volume, forgetting to add the cylinder. 288π comes from an unrelated miscalculation, like using the full sphere volume instead of the hemisphere.",
          diagram: { kind: "solid", shape: "cylinderHemisphere", labels: { r: "4", h: "10" } },
          difficulty: "medium",
          why: [null, "160π is only the cylinder. Add the hemisphere, (128/3)π.", "(128/3)π is only the hemisphere. Add the cylinder, 160π.", "288π adds 128π for the hemisphere, forgetting to divide by 3."],
        },
        {
          q: "A right triangle has side lengths of √10, 2√7, and 3√2 units, as shown. What is the area of the triangle, in square units?",
          choices: ["3√14", "3√5", "√70", "6√5"],
          answer: 1,
          explain:
            "Square each side to find the hypotenuse: (√10)² = 10, (2√7)² = 28, and (3√2)² = 18. The largest, 2√7, is the hypotenuse (and 10 + 18 = 28 confirms the right angle), so the legs are √10 and 3√2. The area is (1/2)(√10)(3√2) = (1/2)(3√20) = (1/2)(6√5) = 3√5. 3√14 uses 3√2 and the hypotenuse 2√7 as the base and height. √70 uses √10 and the hypotenuse. 6√5 multiplies the legs correctly but forgets the 1/2.",
          figure: {"kind": "geometry", "points": {"C": [0, 0], "B": [4.2426, 0], "A": [0, 3.1623]}, "polygons": [{"points": ["A", "B", "C"]}], "segments": [{"from": "C", "to": "B", "label": "3√2"}, {"from": "C", "to": "A", "label": "√10"}, {"from": "A", "to": "B", "label": "2√7"}], "angles": [{"vertex": "C", "from": "B", "to": "A", "right": true}]},
          difficulty: "medium",
          why: ["3√14 uses the hypotenuse, 2√7. The area uses the two legs, √10 and 3√2.", null, "√70 uses the hypotenuse, 2√7. The legs are √10 and 3√2.", "6√5 is the product of the legs. A triangle's area is half of that: 3√5."],
        },
        {
          q: "A cylindrical pipe has an outer radius of 5 cm and an inner radius of 3 cm (it's hollow), and a length of 20 cm. What is the volume of the material making up the pipe, in terms of π?",
          choices: ["320π", "500π", "180π", "680π"],
          answer: 0,
          explain:
            "This composite figure requires subtracting one shape from another: the outer cylinder's volume, π(5²)(20)=500π, minus the inner hollow cylinder's volume, π(3²)(20)=180π, gives 500π-180π=320π. 500π mistakenly reports just the outer cylinder's volume, forgetting to subtract the hollow interior. 180π mistakenly reports just the inner cylinder's volume instead of the material's volume. 680π comes from adding the two volumes instead of subtracting them.",
          diagram: { kind: "solid", shape: "hollowCylinder", labels: { outerR: "5", innerR: "3", len: "20" } },
          difficulty: "hard",
          why: [null, "500π is the whole outer cylinder. Subtract the hollow inside, 180π.", "180π is the hollow part, not the material around it.", "680π adds the hollow inside. Subtract it: 500π − 180π."],
        },
      ],
      traps: [
        "Confusing similar formulas (e.g., using the cone volume formula, which includes a factor of 1/3, for what is actually a cylinder).",
        "Substituting the diameter where the radius is needed (or vice versa), especially when a problem gives diameter directly.",
        "Using the hypotenuse in a right triangle's area — the area uses the two legs, which meet at the right angle, and the longest side is the hypotenuse.",
        "Forgetting the 1/2 in a triangle's area formula.",
        "Finding a missing side from a perimeter by subtracting only one of the known sides (or adding the known sides to the perimeter).",
      ],
    },
    {
      name: "Building an Area, Surface Area, or Volume Expression from a Description",
      explanation:
        "This pattern gives no numeric dimensions at all; it describes a figure's dimensions in words, often with one dimension defined in terms of another using a variable, and asks for an area, surface area, or volume FORMULA, not a number. The method: find the correct formula for the shape first, then carefully translate each worded dimension into algebra before substituting. Pay close attention to phrases like '3 more than,' 'twice,' or 'half of': they describe one dimension in terms of another. Some versions make you back out a missing dimension first: if a rectangle's area is 3x(x + 7) and its width is 3x, the length is the other factor, x + 7 (area ÷ width); if a square's perimeter is 12 more than another square's, each side is only 12/4 = 3 more, so its area is (s + 3)². Surface area of a rectangular prism adds all six faces, which come in three matching pairs: SA = 2(lw + lh + wh).",
      examples: [
        {
          q: "A rectangular box has a length of x, a width of 3, and a height of 5. Which expression gives the volume V of the box, in terms of x?",
          choices: ["V = 15x", "V = 8x", "V = 15 + x", "V = x/15"],
          answer: 0,
          explain:
            "Rectangular box volume is length × width × height; substituting the given dimensions gives V = x × 3 × 5 = 15x. V = 8x comes from adding the width and height (3+5=8) instead of multiplying them into the coefficient. V = 15 + x incorrectly treats the volume formula as additive instead of multiplicative. V = x/15 comes from dividing instead of multiplying.",
          diagram: { kind: "solid", shape: "box", labels: { l: "x", w: "3", h: "5" } },
          difficulty: "easy",
          why: [null, "8x adds the width and height. Volume multiplies them: x × 3 × 5.", "Volume multiplies the dimensions, not adds them.", "Volume multiplies. Dividing by 15 has no basis."],
        },
        {
          q: "A cylinder has a radius of r and a height of 4. Which expression gives the volume V of the cylinder, in terms of r?",
          choices: ["V = 4πr²", "V = πr²/4", "V = 4πr", "V = πr⁴"],
          answer: 0,
          explain:
            "Cylinder volume is πr²h; substituting r and h=4 gives V = πr²(4) = 4πr². V = πr²/4 divides by the height instead of multiplying by it. V = 4πr forgets to square the radius. V = πr⁴ mistakenly multiplies the exponents on r instead of multiplying the height in as a separate coefficient.",
          diagram: { kind: "solid", shape: "cylinder", labels: { r: "r", h: "4" } },
          difficulty: "easy",
          why: [null, "This divides by the height. Volume multiplies: πr² × 4.", "4πr forgets to square the radius.", "The height is a separate factor of 4, not an exponent: 4πr²."],
        },
        {
          q: "A rectangular prism has a height of 8 inches. The length of its base is x inches, which is 3 inches more than the width of the base. Which function V gives the volume, in cubic inches, in terms of x?",
          choices: ["V(x) = 8x(x-3)", "V(x) = 8x(x+3)", "V(x) = 8(x-3)", "V(x) = x(x-3)"],
          answer: 0,
          explain:
            "Rectangular prism volume is length × width × height; translating 'length is 3 more than width' into width = x-3 and substituting all three dimensions gives V = x(x-3)(8) = 8x(x-3). V(x) = 8x(x+3) mistranslates the comparative phrase, adding 3 instead of subtracting it. V(x) = 8(x-3) forgets to include the length (x) as a separate factor. V(x) = x(x-3) forgets to include the given height of 8 entirely.",
          diagram: { kind: "solid", shape: "box", labels: { l: "x", w: "x-3", h: "8" } },
          difficulty: "medium",
          why: [null, "The length is 3 more than the width, so the width is x − 3, not x + 3.", "This leaves out the length, x. Volume multiplies all three dimensions.", "This leaves out the height of 8."],
        },
        {
          q: "A cylindrical can has a height that is twice its radius r. Which expression gives the volume V of the can, in terms of r?",
          choices: ["V = 2πr³", "V = πr³", "V = 2πr²", "V = πr²+2r"],
          answer: 0,
          explain:
            "Cylinder volume is πr²h; translating 'height that is twice its radius' into height = 2r (a multiplicative relationship, not additive) and substituting gives V = πr²(2r) = 2πr³. V = πr³ forgets to include the factor of 2 from the height. V = 2πr² forgets to multiply in the extra factor of r from the height being expressed in terms of r. V = πr²+2r incorrectly treats the height as something added to the formula instead of multiplied into it.",
          diagram: { kind: "solid", shape: "cylinder", labels: { r: "r", h: "2r" } },
          difficulty: "medium",
          why: [null, "The height is 2r, so there's a factor of 2: πr²(2r) = 2πr³.", "This forgets that the height 2r includes another r: πr² × 2r = 2πr³.", "The height gets multiplied in, not added: πr² × 2r."],
        },
        {
          q: "Square A has a side length of s centimeters. The perimeter of square B is 12 centimeters greater than the perimeter of square A. Which expression gives the area, in square centimeters, of square B?",
          choices: ["(s + 12)²", "s² + 9", "(s + 3)²", "4s + 12"],
          answer: 2,
          explain:
            "Square A's perimeter is 4s, so square B's perimeter is 4s + 12. A square's side is its perimeter divided by 4: (4s + 12)/4 = s + 3. Its area is the side squared: (s + 3)². (s + 12)² adds the whole perimeter difference to one side, but that extra 12 is shared among four sides, so each side grows by only 3. s² + 9 squares s + 3 incorrectly, dropping the middle term: (s + 3)² = s² + 6s + 9. 4s + 12 is square B's perimeter, not its area.",
          difficulty: "medium",
          why: ["The extra 12 is spread over four sides, so each side is only 3 longer: (s + 3)².", "(s + 3)² = s² + 6s + 9. This drops the middle term.", null, "4s + 12 is square B's perimeter. Its area is the side squared, and the side is (4s + 12)/4 = s + 3."],
        },
        {
          q: "A rectangular box has a length of x. Its width is half its length, and its height is 4 inches less than its width. Which expression gives the volume V of the box, in terms of x?",
          choices: ["V = x³/4 - 2x²", "V = x³/2 - 4x", "V = x²/2 - 4x", "V = x³/4 + 2x²"],
          answer: 0,
          explain:
            "Rectangular box volume is length × width × height; translating 'width = half the length' as x/2 and 'height = 4 less than the width' as (x/2)-4, then substituting and expanding: x × (x/2) × ((x/2)-4) = (x²/2) × ((x/2)-4) = x³/4 - 2x². V = x³/2 - 4x comes from an incomplete expansion that mishandles the distribution. V = x²/2 - 4x forgets to include one of the three dimensions in the multiplication. V = x³/4 + 2x² gets the sign wrong on the second term, from a distribution error.",
          diagram: { kind: "solid", shape: "box", labels: { l: "x", w: "x/2", h: "x/2 - 4" } },
          difficulty: "hard",
          why: [null, "Multiply it out: x · (x/2) · (x/2 − 4) = x³/4 − 2x², not x³/2 − 4x.", "This has only two dimensions multiplied. Volume needs all three.", "The height is x/2 − 4, so the second term is negative: −2x²."],
        },
        {
          q: "A rectangular prism has a height of 4 centimeters. The area of its base is (x² + 5x) square centimeters, and one side of the base has a length of x centimeters. Which expression gives the surface area, in square centimeters, of the prism?",
          choices: ["x² + 13x + 20", "2x² + 26x + 40", "4x² + 20x", "2x² + 26x"],
          answer: 1,
          explain:
            "First find the missing side of the base: x² + 5x = x(x + 5), so if one side is x, the other is x + 5. The six faces come in three pairs: two bases, each x² + 5x; two side faces that are x by 4, each 4x; and two side faces that are (x + 5) by 4, each 4x + 20. The total is 2(x² + 5x) + 2(4x) + 2(4x + 20) = 2x² + 10x + 8x + 8x + 40 = 2x² + 26x + 40. x² + 13x + 20 counts only one face from each pair. 4x² + 20x is the volume, base area times height. 2x² + 26x treats all four side faces as x by 4, but two of them are (x + 5) by 4.",
          difficulty: "hard",
          why: ["This counts one face from each pair. A prism has six faces, so double it: 2x² + 26x + 40.", null, "4x² + 20x is the volume, base area × height. Surface area adds the six faces.", "This makes all four side faces x by 4. Two of them are (x + 5) by 4, which adds 40 more."],
        },
      ],
      traps: [
        "Substituting a worded dimension into the wrong part of the formula (e.g., swapping which expression represents length vs. width).",
        "Mistranslating a comparative phrase like '5 more than the width' as '5 times the width,' or vice versa.",
        "Forgetting to expand or simplify the resulting algebraic expression into its most standard form once it's fully substituted.",
        "Adding a perimeter difference straight onto a side length: if one square's perimeter is 12 more than another's, each side is 12/4 = 3 more, not 12 more.",
        "Counting only three faces of a rectangular prism, or treating every side face as the same size — the six faces come in three matching pairs, so SA = 2(lw + lh + wh).",
        "Backing out a missing dimension with the wrong operation: the missing side is the area divided by the known side, which is the other factor of a factored area expression.",
      ],
    },
  ],
  tipsAndTricks: [
    "Whenever a scale factor is applied to a shape, remember: length scales by k, area scales by k², and volume scales by k³ — write out which one applies before calculating.",
    "Before substituting any numbers, write out the specific formula you're using — this catches formula mix-ups (like using a cone formula for a cylinder) before they turn into wrong answers.",
    "If a problem gives a diameter, always convert to radius (divide by 2) before using standard area/volume/circumference formulas, which are written in terms of radius.",
  ],
};

const LC_M_LINES_ANGLES_TRI: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "Triangle Angle Sum and Exterior Angles",
      explanation:
        "Every triangle's interior angles add up to exactly 180°, so you can always find a missing angle if you know the other two. A related, often-overlooked rule: a triangle's exterior angle equals the sum of the two non-adjacent interior angles. This can shortcut problems that would otherwise take two separate steps. Isosceles triangles add one more fact: the two angles opposite the equal sides are equal. When tick marks show two equal sides, find the angles across from those sides (they aren't always the two at the bottom of the figure), then use the 180° rule; the angle between the equal sides is 180° minus twice one of the equal angles.",
      examples: [
        {
          q: "A triangle's exterior angle measures 110°, and it is not adjacent to one of the triangle's interior angles of 40°. What is the measure of the third interior angle?",
          choices: ["70°", "110°", "40°", "150°"],
          answer: 0,
          explain:
            "The exterior angle rule states an exterior angle equals the sum of the two non-adjacent interior angles: 110 = 40 + x, so x = 70°. 110° mistakenly restates the exterior angle itself. 40° mistakenly restates the given interior angle instead of solving for the unknown one. 150° comes from adding the two given angles (110+40) instead of subtracting.",
          diagram: { kind: "triangleAngles", angleA: "?", angleB: "40°", exterior: { at: "C", label: "110°" } },
          difficulty: "easy",
          why: [null, "110° is the exterior angle itself. It equals the sum of the two far interior angles: 110 = 40 + x.", "40° is the angle you're given. The unknown one is 110 − 40 = 70°.", "150° adds 110 and 40. The exterior angle is the sum, so subtract: 110 − 40."],
        },
        {
          q: "A triangle has interior angles measuring 55° and 65°. What is the measure of the exterior angle at the triangle's third vertex?",
          choices: ["120°", "60°", "115°", "180°"],
          answer: 0,
          explain:
            "The exterior angle rule states an exterior angle equals the sum of the two interior angles NOT adjacent to it, and the two given angles (55° and 65°) are exactly that pair, so 55+65=120°. 60° mistakenly reports the triangle's third interior angle (180-55-65=60°) instead of the exterior angle. 115° comes from an arithmetic slip in the addition. 180° comes from confusing this with the straight-line supplementary relationship instead of the sum-of-non-adjacent-angles rule.",
          diagram: { kind: "triangleAngles", angleA: "55°", angleB: "65°", exterior: { at: "C", label: "?" } },
          difficulty: "medium",
          why: [null, "60° is the third interior angle. The exterior angle next to it is 55 + 65 = 120°.", "Check the sum: 55 + 65 = 120, not 115.", "180° is a straight line. The exterior angle equals the two far interior angles added: 120°."],
        },
        {
          q: "A triangle has interior angles measuring 50° and 70°. What is the measure of the third interior angle?",
          choices: ["60°", "120°", "20°", "180°"],
          answer: 0,
          explain:
            "A triangle's interior angles sum to 180°, so subtracting the two known angles gives 180-50-70=60°. 120° comes from adding the two given angles instead of subtracting them from 180. 20° comes from an arithmetic slip in the subtraction. 180° mistakenly restates the total angle sum itself instead of the missing angle.",
          diagram: { kind: "triangleAngles", angleA: "50°", angleB: "70°", angleC: "?" },
          difficulty: "easy",
          why: [null, "120° adds the two angles. Subtract them from 180: 180 − 120 = 60.", "20° is 70 − 50. The three angles must total 180: 180 − 50 − 70 = 60.", "180° is the total of all three angles, not the missing one."],
        },
        {
          q: "In the figure, PQ = QR, and the measure of angle QPR is 48°.\n\nWhat is the value of x?",
          choices: ["66", "48", "132", "84"],
          answer: 3,
          explain:
            "The tick marks show PQ = QR. The angles opposite those sides are equal: angle R (across from PQ) and angle P (across from QR). So angle R = 48°, and x = 180 - 48 - 48 = 84. 66 treats angle Q as one of the equal angles: (180 - 48)/2 = 66 assumes the 48° angle is the one between the equal sides. 48 makes angle Q equal to angle P, but Q is the angle between the two marked sides, not across from one. 132 subtracts only one 48° angle from 180.",
          figure: {"kind": "geometry", "points": {"Q": [0, 0], "P": [6, 0], "R": [0.6272, 5.9671]}, "names": ["P", "Q", "R"], "polygons": [{"points": ["P", "Q", "R"]}], "segments": [{"from": "Q", "to": "P", "ticks": 1}, {"from": "Q", "to": "R", "ticks": 1}], "angles": [{"vertex": "P", "from": "R", "to": "Q", "label": "48°"}, {"vertex": "Q", "from": "P", "to": "R", "label": "x°"}]},
          difficulty: "medium",
          why: ["66 treats 48° as the angle between the equal sides. It's one of the equal angles, so angle R is also 48°.", "Angle Q sits between the two marked sides. The equal angles are P and R, across from them.", "132 subtracts only one 48° angle. Angle R is also 48°: 180 − 96 = 84.", null],
        },
        {
          q: "A triangle's exterior angle measures 115°. What is the measure of the interior angle adjacent to this exterior angle?",
          choices: ["65°", "115°", "55°", "180°"],
          answer: 0,
          explain:
            "Since this asks for the ADJACENT interior angle, not a non-adjacent one, the relevant rule is that an exterior angle and its adjacent interior angle form a straight line and are supplementary: 180-115=65°. 115° mistakenly restates the exterior angle itself. 55° comes from an arithmetic slip in the subtraction. 180° mistakenly restates the straight-line total instead of the missing angle.",
          diagram: { kind: "triangleAngles", angleC: "?", exterior: { at: "C", label: "115°" } },
          difficulty: "medium",
          why: [null, "115° is the exterior angle itself. The interior angle beside it adds with it to 180.", "Check it: 180 − 115 = 65, not 55.", "180° is the straight-line total, not the missing angle."],
        },
        {
          q: "In triangle ABC, angle A = 55° and angle B = 60°. Side BC is extended beyond C to point D, forming triangle ACD, where angle ADC = 35°. What is the measure of angle DAC?",
          choices: ["30°", "65°", "115°", "45°"],
          answer: 0,
          explain:
            "Finding the third angle of triangle ABC first, angle ACB=180-55-60=65°; since angle ACD and angle ACB form a straight line, angle ACD=180-65=115°; treating angle ACD as an interior angle of triangle ACD and applying the 180° rule again, 115+35+angle DAC=180, so angle DAC=30°. 65° mistakenly reports angle ACB instead of continuing the chain to find angle DAC. 115° mistakenly reports angle ACD, an intermediate value, instead of the final answer. 45° comes from an arithmetic slip in the final subtraction.",
          diagram: { kind: "triangleAngles", chained: { angleB: "60°", angleBAC: "55°", angleD: "35°", angleDAC: "?" } },
          difficulty: "hard",
          why: [null, "65° is angle ACB. Keep going: ACD = 115°, then DAC = 180 − 115 − 35.", "115° is angle ACD, a step along the way. DAC = 180 − 115 − 35 = 30°.", "Check it: 115 + 35 + 45 = 195, more than 180."],
        },
      ],
      traps: [
        "Not recognizing the exterior angle shortcut, and instead trying to first find the triangle's adjacent interior angle (180° - exterior angle) before proceeding — this works but takes an unnecessary extra step.",
        "Confusing which two angles are 'non-adjacent' to a given exterior angle.",
        "In an isosceles triangle, making the wrong pair of angles equal — the equal angles are the ones opposite the equal sides, not the angle between those sides.",
      ],
    },
    {
      name: "Parallel Lines Cut by a Transversal",
      explanation:
        "When two parallel lines are cut by a transversal, a few angle-pair relationships always hold: corresponding angles are equal, alternate interior angles are equal, and same-side interior angles are supplementary (add to 180°). The key skill is correctly identifying which relationship applies, based on the angles' positions relative to the two lines and the transversal — the right answer depends entirely on which pair type is involved.",
      examples: [
        {
          q: "Two parallel lines are cut by a transversal. If one angle measures 65°, what is the measure of its co-interior (same-side interior) angle?",
          choices: ["115°", "65°", "25°", "180°"],
          answer: 0,
          explain:
            "Co-interior (same-side interior) angles are supplementary, summing to 180°, unlike corresponding or alternate interior angles, which are equal: 180-65=115°. 65° mistakenly applies the equal-angle rule that belongs to corresponding or alternate interior angles instead of the supplementary co-interior rule. 25° comes from an arithmetic slip in the subtraction. 180° mistakenly restates the total instead of the missing angle.",
          diagram: { kind: "parallelTransversal", givenLabel: "65°", givenPosition: 3, askedLabel: "?", askedPosition: 5 },
          difficulty: "easy",
          why: [null, "Equal angles are for corresponding or alternate pairs. Same-side interior angles add to 180.", "25° is 90 − 65. Same-side interior angles add to 180, not 90.", "180° is their total, not the missing angle."],
        },
        {
          q: "Two parallel lines are cut by a transversal. If one angle measures 72°, what is the measure of its alternate exterior angle?",
          choices: ["72°", "108°", "18°", "144°"],
          answer: 0,
          explain:
            "Alternate exterior angles are equal, not supplementary (the opposite relationship from the co-interior pair), so the alternate exterior angle also measures 72°. 108° mistakenly applies the supplementary rule that belongs to co-interior angles instead of the equal rule for alternate exterior angles. 18° comes from an unrelated miscalculation. 144° comes from doubling the given angle instead of simply restating it.",
          diagram: { kind: "parallelTransversal", givenLabel: "72°", givenPosition: 1, askedLabel: "?", askedPosition: 8 },
          difficulty: "medium",
          why: [null, "Alternate exterior angles are equal. 108° treats them as adding to 180.", "18° is 90 − 72. Alternate exterior angles are simply equal.", "144° doubles the angle. Alternate exterior angles are equal: 72°."],
        },
        {
          q: "Two parallel lines are cut by a transversal. If one angle measures 110°, what is the measure of its corresponding angle?",
          choices: ["110°", "70°", "55°", "220°"],
          answer: 0,
          explain:
            "Corresponding angles, which sit in the same relative position at each intersection, are always equal, so the corresponding angle also measures 110°. 70° mistakenly applies the supplementary rule that belongs to co-interior angles instead of the equal rule for corresponding angles. 55° comes from halving the given angle instead of restating it. 220° comes from doubling the given angle instead of restating it.",
          diagram: { kind: "parallelTransversal", givenLabel: "110°", givenPosition: 2, askedLabel: "?", askedPosition: 6 },
          difficulty: "easy",
          why: [null, "Corresponding angles are equal. 70° treats them as adding to 180.", "55° halves the angle. Corresponding angles are equal.", "220° doubles the angle. Corresponding angles are equal."],
        },
        {
          q: "Two parallel lines are cut by a transversal. One angle measures 75°. What is the measure of the angle that is vertical to its co-interior (same-side interior) angle?",
          choices: ["105°", "75°", "15°", "45°"],
          answer: 0,
          explain:
            "First finding the co-interior angle to the given 75° angle using the supplementary rule, 180-75=105°, then applying the vertical-angles-are-equal rule (which leaves the value unchanged, since vertical angles formed by two intersecting lines are always equal), the vertical angle also measures 105°. 75° mistakenly restates the original given angle instead of chaining through both rules. 15° comes from an arithmetic slip. 45° comes from an unrelated miscalculation.",
          diagram: {
            kind: "parallelTransversal",
            givenLabel: "75°",
            givenPosition: 3,
            askedLabel: "?",
            askedPosition: 8,
            extraLabel: "105°",
            extraPosition: 5,
          },
          difficulty: "medium",
          why: [null, "75° skips a step. The same-side interior angle is 180 − 75 = 105°, and its vertical angle equals that.", "15° is 90 − 75. Same-side interior angles add to 180, not 90.", "Check it: the same-side interior angle is 180 − 75 = 105°, and vertical angles are equal."],
        },
        {
          q: "Lines p and q are parallel. A zigzag path runs from line p to line q, bending at point B between them. Inside the zigzag, the first segment meets line p at a 35° angle and the second meets line q at a 50° angle. What is the measure of the angle at B, inside the zigzag?",
          choices: ["85°", "15°", "180°", "70°"],
          answer: 0,
          explain:
            "This classic 'bent path between two parallel lines' setup is solved by drawing an auxiliary line through the bend point B, parallel to both given lines; this splits the angle at B into two pieces, each an alternate interior angle with one of the given angles (one piece equals 35°, the other equals 50°), so the full angle at B is 35+50=85°. 15° comes from subtracting the two given angles instead of adding them. 180° mistakenly treats the two given angles and the unknown as summing to a straight line instead of correctly splitting the unknown into two alternate-interior pieces. 70° comes from doubling one of the given angles instead of adding both distinct pieces.",
          diagram: { kind: "bentPath", angle1: "35°", angle2: "50°", unknown: "?" },
          difficulty: "hard",
          why: [null, "15° subtracts. A line through B parallel to both splits the bend into 35° and 50°, which add.", "The three angles don't form a straight line. The bend is 35° + 50°.", "70° doubles one angle. The two pieces are different: 35° + 50° = 85°."],
        },
      ],
      traps: [
        "Applying the 'equal angles' rule (correct for corresponding/alternate interior angles) to a co-interior angle pair, which is actually supplementary, not equal.",
        "Misidentifying which specific angle pair type is shown in a given diagram or description.",
      ],
    },
    {
      name: "Similar and Congruent Triangles: Corresponding Parts",
      explanation:
        "Similar triangles have the same shape, possibly in different sizes; congruent triangles have the same shape AND the same size. A statement like triangle ABC ~ triangle DEF (or ≅) lists the vertices in matching order: A↔D, B↔E, C↔F. Corresponding angles are always equal, because scaling a triangle never changes its angles. Corresponding sides keep a constant ratio, the scale factor k (new length = k × original length), so k > 1 enlarges and 0 < k < 1 shrinks. To find a missing side, match it to its partner using the vertex order or the matching angles, rather than which sides look similar in length or happen to be listed near each other, then apply k. The proportion itself is rarely the hard part; mismatching which parts correspond is. Two pairs of equal angles prove similarity (AA) but not congruence: congruence also needs one pair of corresponding sides equal (ASA or AAS), or SAS or SSS. When triangles are given by coordinates, read the side lengths off the coordinates and match angles the same way.",
      examples: [
        {
          q: "Triangle ABC is similar to triangle DEF. If AB = 6, DE = 9, and BC = 8, what is EF?",
          choices: ["12", "10.67", "6", "9"],
          answer: 0,
          explain:
            "AB corresponds to DE (matching the vertex order in the similarity statement), giving scale=DE/AB=9/6=1.5; applying that scale factor to BC's corresponding side EF gives EF=8×1.5=12. 10.67 comes from inverting the scale factor (dividing instead of multiplying). 6 mistakenly restates AB's own length instead of solving for EF. 9 mistakenly restates DE's length instead of computing EF.",
          diagram: {
            kind: "similarTriangles",
            leftLabels: ["A", "B", "C"],
            leftSides: ["6", "8", ""],
            rightLabels: ["D", "E", "F"],
            rightSides: ["9", "?", ""],
          },
          difficulty: "easy",
          why: [null, "The scale factor from ABC to DEF is 9/6 = 1.5, so EF = 8 × 1.5 = 12.", "6 is AB. EF corresponds to BC, so scale BC: 8 × 1.5.", "9 is DE. EF corresponds to BC: 8 × 1.5 = 12."],
        },
        {
          q: "Triangle PQR is similar to triangle XYZ with a scale factor of 2/3 from PQR to XYZ. If PQ = 12, what is XY?",
          choices: ["8", "18", "6", "4"],
          answer: 0,
          explain:
            "The scale factor from PQR to XYZ is given directly as 2/3, so applying it to PQ gives XY=12×(2/3)=8. 18 comes from inverting the scale factor and using 3/2 instead of 2/3. 6 comes from an unrelated miscalculation, like using half of PQ instead of two-thirds. 4 comes from a similar arithmetic slip in the multiplication.",
          diagram: {
            kind: "similarTriangles",
            leftLabels: ["P", "Q", "R"],
            leftSides: ["12", "", ""],
            rightLabels: ["X", "Y", "Z"],
            rightSides: ["?", "", ""],
          },
          difficulty: "easy",
          why: [null, "18 multiplies by 3/2. The scale factor from PQR to XYZ is 2/3: 12 × 2/3 = 8.", "6 is half of 12. The scale factor is 2/3: 12 × 2/3 = 8.", "4 is one-third of 12. Two-thirds of 12 is 8."],
        },
        {
          q: "Triangle ABC is similar to triangle EFD (note the vertex order). If AB = 10, EF = 15, and CA = 8, what is DE?",
          choices: ["12", "8", "10", "13.33"],
          answer: 0,
          explain:
            "Matching vertices in the order given (A↔E, B↔F, C↔D), the scale factor from the known pair AB and EF is 15/10=1.5; since CA corresponds to DE (because C↔D and A↔E), DE=CA×1.5=8×1.5=12. 8 mistakenly restates CA's own length instead of solving for DE. 10 mistakenly restates AB's length instead of computing DE. 13.33 comes from inverting the scale factor (dividing instead of multiplying).",
          diagram: {
            kind: "similarTriangles",
            leftLabels: ["A", "B", "C"],
            leftSides: ["10", "", "8"],
            rightLabels: ["E", "F", "D"],
            rightSides: ["15", "", "?"],
          },
          difficulty: "medium",
          why: [null, "8 is CA. DE corresponds to CA, so scale it: 8 × 1.5.", "10 is AB, not DE.", "The scale factor is 15/10 = 1.5, so DE = 8 × 1.5 = 12."],
        },
        {
          q: "Triangle GHI is similar to triangle JKL. GH = 14, HI = 21, JK = 6. What is KL?",
          choices: ["9", "49", "3", "14"],
          answer: 0,
          explain:
            "Finding the scale factor from the fully-known corresponding pair, GH and JK, gives scale=JK/GH=6/14=3/7; applying that to HI (which corresponds to KL) gives KL=21×(3/7)=9. 49 comes from inverting the scale factor and multiplying incorrectly. 3 comes from an arithmetic slip in the multiplication. 14 mistakenly restates GH's length instead of solving for KL.",
          diagram: {
            kind: "similarTriangles",
            leftLabels: ["G", "H", "I"],
            leftSides: ["14", "21", ""],
            rightLabels: ["J", "K", "L"],
            rightSides: ["6", "?", ""],
          },
          difficulty: "medium",
          why: [null, "49 multiplies by 7/3. The scale factor from GHI to JKL is 6/14 = 3/7: 21 × 3/7.", "Check it: 21 × 3/7 = 9, not 3.", "14 is GH. KL corresponds to HI: 21 × 3/7 = 9."],
        },
        {
          q: "Right triangles JKL and PQR are similar, with vertices J, K, and L corresponding to vertices P, Q, and R, respectively. Angles K and Q are right angles, and the measure of angle L is 34°. Each side of triangle PQR is 3 times as long as the corresponding side of triangle JKL. What is the measure of angle P?",
          choices: ["34°", "56°", "102°", "146°"],
          answer: 1,
          explain:
            "The vertex order gives the matching angles: J↔P, K↔Q, L↔R. So angle P equals angle J. In triangle JKL, angle K is 90° and angle L is 34°, so angle J = 180 - 90 - 34 = 56°, and angle P = 56°. The scale factor of 3 changes only the side lengths; angles never scale. 34° is angle L, which matches angle R, not angle P. 102° multiplies 34° by the scale factor, but angles stay the same size when a triangle is enlarged. 146° is 180 - 34, which leaves out the right angle.",
          difficulty: "medium",
          why: ["34° is angle L, which corresponds to R. P corresponds to J.", null, "Angles don't scale. Enlarging a triangle keeps every angle the same.", "146° is 180 − 34, which forgets the right angle at K."],
        },
        {
          q: "Triangle ABC has angle A = 50° and angle B = 70°. Triangle DEF has angle D = 50° and angle F = 60°. Are triangles ABC and DEF similar? If so, and if AB = 9 while DE = 6, what is the scale factor from ABC to DEF?",
          choices: [
            "Similar, with a scale factor of 2/3 from ABC to DEF",
            "Not similar, since only one angle (50°) is confirmed to match",
            "Similar, with a scale factor of 3/2 from ABC to DEF",
            "Not enough information is given to determine similarity",
          ],
          answer: 0,
          explain:
            "Finding each triangle's missing angle first (ABC's third angle: 180-50-70=60°; DEF's third angle: 180-50-60=70°) shows both triangles share the same angle set (50°, 70°, 60°), confirming similarity; matching sides by their EQUAL angles (angle C, 60°, matches angle F, 60°) shows side AB (opposite C) corresponds to side DE (opposite F), giving a scale factor of DE/AB=6/9=2/3. Claiming the triangles aren't similar because only one angle is confirmed ignores that computing the missing angles reveals all three angles actually match. Reporting a scale factor of 3/2 inverts the correct ratio, using AB/DE instead of DE/AB. And claiming there isn't enough information ignores that the given angles and side lengths are sufficient to both confirm similarity and compute the scale factor.",
          diagram: {
            kind: "similarTriangles",
            leftLabels: ["A", "B", "C"],
            leftSides: ["9", "", ""],
            rightLabels: ["D", "E", "F"],
            rightSides: ["6", "", ""],
          },
          difficulty: "hard",
          why: [null, "Find the missing angles: ABC has 60° and DEF has 70°, so all three angles match.", "3/2 is flipped. From ABC to DEF, sides shrink: 6/9 = 2/3.", "The missing angles can be found (180 minus the other two), which is enough to show similarity."],
        },
        {
          q: "In triangles ABC and DEF, angle A is congruent to angle D, and angle B is congruent to angle E. Which additional piece of information is enough to prove that triangle ABC is congruent to triangle DEF?",
          choices: ["Angle C is congruent to angle F.", "AB/DE = BC/EF", "AB = EF", "AB = DE"],
          answer: 3,
          explain:
            "Two pairs of congruent angles already make the triangles similar (AA): the same shape, but possibly different sizes. To be congruent, they also need the same size, so one pair of CORRESPONDING sides must be equal. AB and DE correspond (A↔D and B↔E), and AB = DE gives two angles and the side between them (ASA), so the triangles are congruent. Angle C ≅ angle F adds nothing new: the third angles are already equal, since each is 180° minus the other two. AB/DE = BC/EF says the sides are in proportion, which is true of any two similar triangles, whatever their sizes. AB = EF pairs sides that don't correspond, so it doesn't force the triangles to be the same size.",
          difficulty: "hard",
          why: ["The third angles are already equal, since each is 180° minus the other two. That still shows only similarity.", "Proportional sides describe any two similar triangles, of any size.", "AB corresponds to DE, not EF. Unmatched sides can be equal without the triangles being the same size.", null],
        },
      ],
      traps: [
        "Matching sides based on their order of appearance in the problem rather than their actual corresponding angles, leading to an incorrect ratio.",
        "Setting up the scale factor upside down (e.g., using the smaller triangle's side over the larger one when the reverse was needed).",
        "Assuming triangles are similar just because one angle matches, without checking that a second angle (or proportional sides) confirms it.",
        "Scaling an angle by the scale factor — corresponding angles stay equal no matter how much a triangle grows or shrinks.",
        "Treating two pairs of equal angles (or proportional sides) as proof of congruence — that only proves similarity; congruence also needs a pair of equal corresponding sides.",
        "Choosing a scale factor between 0 and 1 for an enlargement (or greater than 1 for a reduction).",
      ],
    },
    {
      name: "Vertical Angles and Basic Angle Relationships",
      explanation:
        "When two straight lines cross, they form two pairs of vertical angles (directly across from each other) and pairs of adjacent angles along each line. Vertical angles are always exactly equal, no calculation needed once you spot them. Adjacent angles along a straight line are supplementary, adding to 180°, since a straight line always measures 180°. These facts apply with just two crossing lines: no triangle, no parallel-lines setup required, unlike the other patterns in this subskill.",
      examples: [
        {
          q: "Two lines intersect, forming an angle of 65°. What is the measure of the angle vertical to it?",
          choices: ["65°", "115°", "25°", "180°"],
          answer: 0,
          explain:
            "Vertical angles (directly across from each other at an intersection) are always equal, so the vertical angle also measures 65°. 115° mistakenly applies the supplementary rule that belongs to adjacent angles along a line instead of the equal rule for vertical angles. 25° comes from an unrelated miscalculation. 180° mistakenly restates the straight-line total instead of the vertical angle itself.",
          diagram: {
            kind: "intersectingLines",
            lines: 2,
            angles: [
              { label: "65°", position: 0 },
              { label: "?", position: 2 },
            ],
          },
          difficulty: "easy",
          why: [null, "Vertical angles are equal. 115° is the angle beside it on the line.", "25° is 90 − 65. Vertical angles are simply equal.", "180° is a straight line, not the vertical angle."],
        },
        {
          q: "Two lines intersect, forming an angle of 110° next to (adjacent to) an unknown angle along the same straight line. What is the measure of the unknown angle?",
          choices: ["70°", "110°", "180°", "55°"],
          answer: 0,
          explain:
            "Angles adjacent to each other along a straight line are supplementary, adding to 180°, so 180-110=70°. 110° mistakenly applies the equal rule that belongs to vertical angles instead of the supplementary rule for adjacent angles. 180° mistakenly restates the straight-line total instead of the missing angle. 55° comes from halving the given angle instead of subtracting it from 180.",
          diagram: {
            kind: "intersectingLines",
            lines: 2,
            angles: [
              { label: "110°", position: 0 },
              { label: "?", position: 1 },
            ],
          },
          difficulty: "easy",
          why: [null, "Angles side by side on a line add to 180. Equal angles are the vertical ones.", "180° is the total, not the missing angle.", "55° halves 110. The two angles add to 180: 180 − 110 = 70."],
        },
        {
          q: "Two lines intersect at a point. One of the four angles formed measures (3x + 15)°, and its vertical angle measures (5x - 25)°. What is x?",
          choices: ["20", "5", "40", "-20"],
          answer: 0,
          explain:
            "Since these two angles are vertical angles, they must be equal: 3x+15=5x-25; subtracting 3x from both sides gives 15=2x-25, and adding 25 to both sides gives 40=2x, so x=20. 5 comes from an arithmetic slip while isolating x. 40 mistakenly reports the intermediate value (2x) instead of solving for x itself. -20 comes from a sign error while moving terms across the equation.",
          diagram: {
            kind: "intersectingLines",
            lines: 2,
            angles: [
              { label: "(3x+15)°", position: 0 },
              { label: "(5x-25)°", position: 2 },
            ],
          },
          difficulty: "medium",
          why: [null, "Check x = 5: 3(5) + 15 = 30, but 5(5) − 25 = 0.", "40 is 2x. Divide by 2: x = 20.", "A sign slip: 15 + 25 = 2x gives x = +20."],
        },
        {
          q: "Two lines intersect at a point, forming four angles. One angle measures (2x + 10)°, and the angle adjacent to it along the same line measures (3x - 30)°. What is the measure of the larger of the two angles?",
          choices: ["90°", "40°", "110°", "70°"],
          answer: 0,
          explain:
            "Since these two angles are adjacent along a straight line, they're supplementary: (2x+10)+(3x-30)=180; combining like terms gives 5x-20=180, so 5x=200 and x=40; substituting back, 2(40)+10=90° and 3(40)-30=90° — both angles happen to be equal at 90° each, so the larger angle is 90°. 40° mistakenly reports the value of x itself instead of substituting it back into either angle expression. 110° and 70° come from arithmetic slips while substituting x back into the angle expressions.",
          diagram: {
            kind: "intersectingLines",
            lines: 2,
            angles: [
              { label: "(2x+10)°", position: 0 },
              { label: "(3x-30)°", position: 1 },
            ],
          },
          difficulty: "medium",
          why: [null, "40 is x. Plug it back in: 2(40) + 10 = 90°.", "Check it: with x = 40, both angles are 90°. Neither is 110°.", "With x = 40, both angles are 90°, not 70°."],
        },
        {
          q: "Three lines all pass through the same single point. One of the six angles formed measures 40°, and it is adjacent (with no other angle between them) to a second angle, which is itself adjacent to a third angle that is vertical to the original 40° angle. What is the measure of the second angle?",
          choices: ["100°", "140°", "40°", "80°"],
          answer: 0,
          explain:
            "The third angle described is vertical to the 40° angle, so it also measures 40°; since the first, second, and third angles together span a straight line (180°) along one of the three lines, 40+(second angle)+40=180, so the second angle=100°. 140° comes from only subtracting one 40° angle instead of both. 40° mistakenly restates one of the given angles instead of solving for the unknown second angle. 80° comes from an arithmetic slip, like doubling the wrong value.",
          diagram: {
            kind: "intersectingLines",
            lines: 3,
            angles: [
              { label: "40°", position: 0 },
              { label: "?", position: 1 },
              { label: "40°", position: 2, muted: true },
            ],
          },
          difficulty: "hard",
          why: [null, "140° subtracts only one 40° angle. The straight line holds both: 40 + x + 40 = 180.", "40° is one of the given angles. The second angle is 180 − 80 = 100°.", "80° is the two 40° angles together. The second angle is what's left: 180 − 80."],
        },
      ],
      traps: [
        "Confusing vertical angles (equal) with adjacent angles along a line (supplementary, adding to 180°) — these are opposite relationships and easy to mix up under time pressure.",
        "Assuming two angles are vertical just because they look similar in size, without confirming they're actually positioned directly across the intersection from each other.",
        "In multi-line intersection problems, losing track of which angles lie along the same straight line when applying the 180° rule.",
      ],
    },
  ],
  tipsAndTricks: [
    "Memorize which angle pairs from a transversal are equal (corresponding, alternate interior, alternate exterior) versus which are supplementary (co-interior/same-side interior) — mixing these up is the most common error in this subskill.",
    "The exterior angle of a triangle equals the sum of the two non-adjacent interior angles — this shortcut often saves a step compared to using the 180° rule twice.",
    "For similar triangles, set up your ratio of corresponding sides carefully, matching each side to its correct counterpart in the other triangle before cross-multiplying.",
  ],
};

const LC_M_RIGHT_TRI_TRIG: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "SOH-CAH-TOA Setup",
      explanation:
        "The foundational skill here: correctly identify which sides are 'opposite,' 'adjacent,' and 'hypotenuse' relative to the specific angle in question, then apply the matching trig ratio. SOH: sine = opposite/hypotenuse. CAH: cosine = adjacent/hypotenuse. TOA: tangent = opposite/adjacent. The most common error isn't the formula — it's misidentifying which side is 'opposite' versus 'adjacent' for the angle being used. Trig ratios depend only on the angle, not the triangle's size, so similar right triangles share them: if angle A corresponds to angle D, then sin A = sin D, even when every side of one triangle is 3 times the other's. The altitude drawn from the right angle to the hypotenuse splits a right triangle into two smaller right triangles, each similar to the original, so an angle's ratio can come from whichever of the three triangles has the sides you know; just keep both sides of a ratio from the same right triangle.",
      examples: [
        {
          q: "A support cable is anchored 15 feet from the base of a pole and meets the top of the pole at a 40° angle of elevation. Which expression gives the pole's height?",
          choices: ["15 · tan(40°)", "15 · sin(40°)", "15 · cos(40°)", "15 / tan(40°)"],
          answer: 0,
          explain:
            "The pole's height is opposite the 40° angle and the 15-foot distance is adjacent to it, so relating opposite and adjacent calls for tangent (TOA): tan(40°)=height/15, giving height=15·tan(40°). 15·sin(40°) mistakenly uses sine, which relates opposite and hypotenuse, but the hypotenuse (the cable) isn't the given side here. 15·cos(40°) mistakenly uses cosine, which relates adjacent and hypotenuse, the same mismatch. 15/tan(40°) inverts the correct relationship, effectively swapping which side is opposite and which is adjacent.",
          diagram: { kind: "rightTriangle", base: "15", angle: "40°", height: "?", solveFor: "height" },
          difficulty: "easy",
          why: [null, "Sine uses the hypotenuse (the cable), which isn't given. Height and ground distance call for tangent.", "Cosine uses the hypotenuse too. The height is opposite and the 15 feet is adjacent: tangent.", "This divides instead of multiplying: tan(40°) = height/15, so height = 15 · tan(40°)."],
        },
        {
          q: "A ladder leans against a wall, reaching a point 12 feet up the wall. The base of the ladder sits 5 feet from the wall. What angle does the ladder make with the ground?",
          choices: ["tan⁻¹(12/5)", "tan⁻¹(5/12)", "sin⁻¹(12/5)", "cos⁻¹(5/12)"],
          answer: 0,
          explain:
            "The wall height (12) is opposite the ground angle and the base distance (5) is adjacent to it, so relating opposite and adjacent calls for tangent; solving for the angle itself uses the inverse: angle=tan⁻¹(12/5). tan⁻¹(5/12) inverts the ratio, swapping opposite and adjacent. sin⁻¹(12/5) misapplies sine to a ratio greater than 1, which isn't valid for sine, and confuses the hypotenuse relationship with the opposite/adjacent one. cos⁻¹(5/12) makes the same mismatch.",
          diagram: { kind: "rightTriangle", base: "5", height: "12", angle: "?", solveFor: "angle" },
          difficulty: "medium",
          why: [null, "This flips the ratio. The wall height, 12, is opposite the ground angle and goes on top.", "Sine can't be greater than 1, and 12/5 is. Sine also needs the ladder's length.", "Cosine needs the ladder (the hypotenuse), not the wall height."],
        },
        {
          q: "In a right triangle, the side opposite a 30° angle is 5, and the hypotenuse is 10. What is sin(30°) based on this triangle?",
          choices: ["1/2", "2", "5/√75", "10/5"],
          answer: 0,
          explain:
            "5 is opposite the 30° angle and 10 is the hypotenuse; sine relates opposite and hypotenuse (SOH), so sin(30°)=5/10=1/2. 2 inverts the correct ratio. 5/√75 comes from an unrelated miscalculation, like invoking the Pythagorean theorem when it isn't needed here. 10/5 also inverts the ratio, restating hypotenuse over opposite instead of opposite over hypotenuse.",
          diagram: { kind: "rightTriangle", height: "5", hypotenuse: "10", angle: "30°" },
          difficulty: "easy",
          why: [null, "2 flips the ratio. Sine is opposite over hypotenuse: 5/10.", "5/√75 is opposite over the other leg, which is tangent. Sine uses the hypotenuse, 10.", "10/5 is flipped. Sine is 5/10."],
        },
        {
          q: "A 20-foot ramp rises at an angle of 15° from the ground to a loading dock. Which expression gives the horizontal distance the ramp covers?",
          choices: ["20cos(15°)", "20sin(15°)", "20tan(15°)", "20/cos(15°)"],
          answer: 0,
          explain:
            "The ramp (20 feet) is the hypotenuse and the horizontal distance is adjacent to the 15° angle, so relating adjacent and hypotenuse calls for cosine (CAH): cos(15°)=horizontal/20, giving horizontal=20cos(15°). 20sin(15°) mistakenly uses sine, which would give the vertical rise (opposite), not the horizontal distance. 20tan(15°) mistakenly uses tangent, which relates opposite and adjacent, neither of which is the hypotenuse given here. 20/cos(15°) inverts the correct relationship.",
          diagram: { kind: "rightTriangle", hypotenuse: "20", angle: "15°", base: "?", solveFor: "base" },
          difficulty: "medium",
          why: [null, "Sine gives the vertical rise (opposite the angle), not the horizontal distance.", "Tangent relates the two legs. The ramp is the hypotenuse, so use cosine.", "This divides by cosine. cos(15°) = horizontal/20, so multiply: 20cos(15°)."],
        },
        {
          q: "Right triangles ABC and DEF are similar, with vertices A, B, and C corresponding to vertices D, E, and F, respectively. Angles C and F are right angles, and sin A = 12/13. Each side of triangle DEF is 3 times as long as the corresponding side of triangle ABC. What is the value of sin E?",
          choices: ["12/13", "5/13", "15/13", "5/12"],
          answer: 1,
          explain:
            "Angle E corresponds to angle B, and corresponding angles of similar triangles have equal trig ratios, so sin E = sin B. In triangle ABC, sin A = 12/13, so take the side opposite A (BC) as 12 and the hypotenuse (AB) as 13; the third side is AC = √(13² - 12²) = 5. AC is opposite angle B, so sin B = 5/13, and sin E = 5/13. The scale factor of 3 doesn't matter: tripling both the opposite side and the hypotenuse leaves their ratio unchanged. 12/13 is sin D (and sin A), the other acute angle. 15/13 multiplies by the scale factor, and a sine can never be greater than 1. 5/12 is tan E, opposite over adjacent, not opposite over hypotenuse.",
          difficulty: "medium",
          why: ["12/13 is sin D, which matches sin A. Angle E matches angle B.", null, "The scale factor cancels in a ratio. Also, a sine can never be greater than 1.", "5/12 is tan E, opposite over adjacent. Sine uses the hypotenuse: 5/13."],
        },
        {
          q: "An isosceles triangle has two equal sides of length 13 and a base of 10. An altitude is drawn from the apex to the midpoint of the base, forming two right triangles. What is the sine of the angle between one of the equal sides and the base?",
          choices: ["12/13", "5/13", "5/12", "12/5"],
          answer: 0,
          explain:
            "The altitude from the apex to the base's midpoint creates two congruent right triangles, with the hypotenuse as the original equal side (13) and half the base (5) adjacent to the angle in question; finding the altitude (opposite) via the Pythagorean theorem gives √(13²-5²)=√144=12, so sine=opposite/hypotenuse=12/13. 5/13 mistakenly reports the adjacent side over the hypotenuse (cosine) instead. 5/12 mistakenly reports adjacent over opposite, a tangent-style ratio using the wrong sides. 12/5 mistakenly reports opposite over adjacent instead of opposite over hypotenuse.",
          diagram: { kind: "isoscelesAltitude", equalSide: "13", halfBase: "5", altitude: "?", solveFor: "altitude" },
          difficulty: "hard",
          why: [null, "5/13 is adjacent over hypotenuse, which is cosine.", "5/12 is adjacent over opposite. Sine uses the hypotenuse: 12/13.", "12/5 is opposite over adjacent, which is tangent."],
        },
        {
          q: "In the figure, angle ACB is a right angle, and CD is perpendicular to AB. AD = 9 and CD = 12.\n\nWhat is the value of tan B?",
          choices: ["4/3", "3/5", "3/4", "4/5"],
          answer: 2,
          explain:
            "Triangle ADC has its right angle at D, and its angle at C, angle ACD, is 90° minus angle A. Angle B is also 90° minus angle A (in the large triangle), so angle ACD = angle B: the altitude made triangle ADC similar to triangle ACB. In triangle ADC, the side opposite angle ACD is AD = 9 and the side adjacent is CD = 12, so tan B = 9/12 = 3/4. Check it another way: tan A = 12/9 = 4/3, so DB = 12 × 4/3 = 16, and in triangle CDB, tan B = CD/DB = 12/16 = 3/4. 4/3 is tan A, the other acute angle. 3/5 is sin B: CB = √(12² + 16²) = 20, and 12/20 = 3/5. 4/5 is cos B, 16/20.",
          figure: {"kind": "geometry", "points": {"A": [0, 0], "B": [25, 0], "C": [9, 12], "D": [9, 0]}, "names": ["A", "B", "C", "D"], "polygons": [{"points": ["A", "B", "C"]}], "segments": [{"from": "A", "to": "D", "label": "9"}, {"from": "C", "to": "D", "label": "12"}], "angles": [{"vertex": "C", "from": "A", "to": "B", "right": true}, {"vertex": "D", "from": "B", "to": "C", "right": true}]},
          difficulty: "hard",
          why: ["4/3 is tan A. Angle B is the other acute angle, so its tangent is the reciprocal.", "3/5 is sin B, which uses the hypotenuse CB = 20. Tangent is opposite over adjacent: 12/16.", null, "4/5 is cos B, 16/20. Tangent is 12/16 = 3/4."],
        },
      ],
      traps: [
        "Misidentifying which side is opposite versus adjacent relative to the specific angle being used — this depends on the angle's position, not just the shape of the triangle.",
        "Choosing the wrong trig ratio (sine instead of tangent, etc.) because the opposite/adjacent/hypotenuse sides weren't correctly identified first.",
        "Multiplying a trig ratio by the scale factor between similar triangles — corresponding angles are equal, so their trig ratios are exactly equal.",
        "In a right triangle split by the altitude to the hypotenuse, taking the two sides of one ratio from different small triangles, or naming the wrong side as opposite in the small triangle.",
      ],
    },
    {
      name: "Special Right Triangles (30-60-90 and 45-45-90)",
      explanation:
        "Special right triangles have fixed, memorizable side ratios that let you skip the Pythagorean theorem entirely. In a 45-45-90 triangle, both legs are equal, and the hypotenuse is a leg times √2. In a 30-60-90 triangle, the side opposite 30° is the shortest side (call it x), the side opposite 60° is x√3, and the hypotenuse (opposite 90°) is 2x. Recognizing these specific angle measures gives you every side length instantly, with no further calculation.",
      examples: [
        {
          q: "In a right triangle, the side opposite a 30° angle is 5. What is the hypotenuse?",
          choices: ["10", "5√3", "5√2", "2.5"],
          answer: 0,
          explain:
            "This is a 30-60-90 triangle; if the side opposite 30° is x, the hypotenuse is always 2x, so with x=5, hypotenuse=2(5)=10. 5√3 mistakenly computes the side opposite 60° instead of the hypotenuse. 5√2 mistakenly applies the 45-45-90 ratio instead of the 30-60-90 ratio. 2.5 comes from halving x instead of doubling it.",
          diagram: { kind: "rightTriangle", height: "5", angle: "30°", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
          why: [null, "5√3 is the side opposite 60°. The hypotenuse is twice the shortest side: 10.", "5√2 comes from a 45-45-90 triangle. This one is 30-60-90.", "2.5 halves the side. The hypotenuse is double the side opposite 30°."],
        },
        {
          q: "In a right triangle, both legs measure 7√2. What is the length of the hypotenuse?",
          choices: ["14", "7√2", "49", "14√2"],
          answer: 0,
          explain:
            "This is a 45-45-90 triangle, since both legs are equal; if a leg is x, the hypotenuse is x√2, so hypotenuse=7√2×√2=7×2=14. 7√2 mistakenly restates the leg length itself instead of computing the hypotenuse. 49 comes from squaring the leg instead of multiplying it by √2. 14√2 multiplies the leg by 2 instead of by √2.",
          diagram: {
            kind: "rightTriangle",
            base: "7√2",
            height: "7√2",
            angle: "45°",
            hypotenuse: "?",
            solveFor: "hypotenuse",
          },
          difficulty: "medium",
          why: [null, "7√2 is a leg. The hypotenuse is a leg times √2: 7√2 × √2 = 14.", "49 squares the leg. Multiply by √2 instead: 14.", "14√2 multiplies by 2. In a 45-45-90 triangle, the hypotenuse is a leg times √2."],
        },
        {
          q: "In a right triangle, both legs measure 9. What is the length of the hypotenuse?",
          choices: ["9√2", "18", "9", "81"],
          answer: 0,
          explain:
            "This is a 45-45-90 triangle, since both legs are equal; if a leg is x, the hypotenuse is x√2, so with x=9, hypotenuse=9√2. 18 mistakenly doubles the leg instead of multiplying by √2. 9 mistakenly restates the leg length itself instead of computing the hypotenuse. 81 comes from squaring the leg, an unrelated operation.",
          diagram: { kind: "rightTriangle", base: "9", height: "9", angle: "45°", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
          why: [null, "18 doubles the leg. The hypotenuse is a leg times √2.", "9 is a leg. The hypotenuse is always longer than either leg.", "81 squares the leg. The hypotenuse is 9√2."],
        },
        {
          q: "In a right triangle, the hypotenuse measures 14, and one angle measures 30°. What is the length of the side opposite the 30° angle?",
          choices: ["7", "14", "7√3", "28"],
          answer: 0,
          explain:
            "This is a 30-60-90 triangle; if the side opposite 30° is x, the hypotenuse is 2x, so working backward from the given hypotenuse, 2x=14, giving x=7. 14 mistakenly restates the hypotenuse itself instead of solving for x. 7√3 mistakenly computes the side opposite 60° instead of the side opposite 30°. 28 comes from doubling the hypotenuse instead of halving it.",
          diagram: { kind: "rightTriangle", hypotenuse: "14", angle: "30°", height: "?", solveFor: "height" },
          difficulty: "medium",
          why: [null, "14 is the hypotenuse. The side opposite 30° is half of it.", "7√3 is the side opposite 60°.", "28 doubles the hypotenuse. The side opposite 30° is half: 7."],
        },
        {
          q: "In a right triangle, the hypotenuse measures 16, and one angle measures 60°. What is the length of the side opposite the 60° angle?",
          choices: ["8√3", "8", "16√3", "4√3"],
          answer: 0,
          explain:
            "Since one angle is 60°, this is a 30-60-90 triangle; using the hypotenuse to find x first, 16=2x gives x=8 (the side opposite 30°), and the side opposite 60° is x√3, not x itself, giving 8√3. 8 mistakenly reports x, the side opposite 30°, instead of the side opposite 60°. 16√3 mistakenly uses the full hypotenuse instead of x in the x√3 formula. 4√3 comes from an arithmetic slip while solving for x from the hypotenuse.",
          diagram: { kind: "rightTriangle", hypotenuse: "16", angle: "60°", height: "?", solveFor: "height" },
          difficulty: "hard",
          why: [null, "8 is the side opposite 30°. The side opposite 60° is 8√3.", "16√3 uses the hypotenuse. Start from the short side, 8: 8√3.", "4√3 halves twice. The short side is 16 ÷ 2 = 8, so the answer is 8√3."],
        },
      ],
      traps: [
        "Using the Pythagorean theorem from scratch on a special right triangle, when the fixed ratio would give the answer faster and with less room for arithmetic error.",
        "Mixing up the 30-60-90 ratio (x, x√3, 2x) with the 45-45-90 ratio (x, x, x√2) under time pressure.",
      ],
    },
    {
      name: "Using the Pythagorean Theorem Before Computing a Trig Ratio",
      explanation:
        "Some problems give a right triangle with two side lengths, no angle measures, and ask for a trig ratio of one of the acute angles. A trig ratio needs two sides, but sometimes you're given the wrong two — so the Pythagorean theorem has to find the missing third side FIRST, before SOH-CAH-TOA can be applied. Watch for this whenever a question gives exactly two side lengths and asks for a trig ratio, not an angle. But check first: if the ratio you need (like tangent, using only the two legs) doesn't require the missing side, you can skip this step.",
      examples: [
        {
          q: "In a right triangle, the two legs measure 6 and 8. What is the sine of the angle opposite the side of length 6?",
          choices: ["3/5", "4/5", "6/8", "8/6"],
          answer: 0,
          explain:
            "Sine needs the hypotenuse, found first via the Pythagorean theorem: √(6²+8²)=√100=10; sine=opposite/hypotenuse=6/10=3/5. 4/5 mistakenly reports the sine of the OTHER acute angle (opposite the side of length 8) instead. 6/8 mistakenly uses a tangent-style ratio (leg over leg) instead of opposite over hypotenuse. 8/6 makes the same mistake, using the wrong pair of sides entirely.",
          diagram: { kind: "rightTriangle", base: "8", height: "6", angle: "θ", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
          why: [null, "4/5 is the sine of the other angle, the one opposite 8.", "6/8 divides the two legs, which is tangent. Sine uses the hypotenuse, 10.", "8/6 divides the legs, which isn't sine. Sine is 6/10."],
        },
        {
          q: "In a right triangle, one leg measures 5 and the hypotenuse measures 13. What is the tangent of the angle for which the leg of length 5 is adjacent?",
          choices: ["12/5", "5/12", "5/13", "12/13"],
          answer: 0,
          explain:
            "Tangent needs opposite/adjacent, so the missing leg is found first via the Pythagorean theorem: √(13²-5²)=√144=12; tangent=opposite/adjacent=12/5. 5/12 inverts the correct ratio, swapping opposite and adjacent. 5/13 and 12/13 both mistakenly involve the hypotenuse, which tangent doesn't use at all.",
          diagram: { kind: "rightTriangle", base: "5", angle: "θ", height: "?", hypotenuse: "13", solveFor: "height" },
          difficulty: "easy",
          why: [null, "This is flipped. Tangent is opposite over adjacent: 12/5.", "5/13 uses the hypotenuse. Tangent uses only the two legs.", "12/13 uses the hypotenuse. Tangent is 12/5."],
        },
        {
          q: "In a right triangle, the two legs measure 4 and 4. What is the sine of one of the acute angles?",
          choices: ["√2/2", "1/2", "√2", "√2/4"],
          answer: 0,
          explain:
            "The hypotenuse is found via the Pythagorean theorem: √(4²+4²)=√32=4√2 after simplifying; sine=opposite/hypotenuse=4/(4√2)=1/√2, which rationalizes to √2/2. 1/2 comes from an unrelated miscalculation that drops the radical entirely. √2 comes from inverting the correctly rationalized ratio. √2/4 comes from a slip when rationalizing: 1/√2 = √2/2, not √2/4.",
          diagram: { kind: "rightTriangle", base: "4", height: "4", angle: "θ", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "medium",
          why: [null, "1/2 drops the radical. The hypotenuse is 4√2, so sine is 4/(4√2) = √2/2.", "√2 is flipped. Sine is opposite over hypotenuse, which is less than 1.", "1/√2 rationalizes to √2/2, not √2/4."],
        },
        {
          q: "In a right triangle, one leg measures 9 and the hypotenuse measures 15. What is the cosine of the acute angle that is NOT adjacent to the leg of length 9?",
          choices: ["4/5", "3/5", "9/15", "12/9"],
          answer: 0,
          explain:
            "The missing leg is found first: √(15²-9²)=√144=12; since the question asks for the angle NOT adjacent to the 9-leg, that means 9 is actually opposite this angle and 12 is adjacent to it, so cosine=adjacent/hypotenuse=12/15=4/5. 3/5 mistakenly computes sine (using 9 as opposite over the hypotenuse) instead of cosine. 9/15 mistakenly treats the 9-leg as adjacent, misreading which angle is being asked about. 12/9 divides the two legs (adjacent over opposite) instead of using the hypotenuse.",
          diagram: { kind: "rightTriangle", height: "9", hypotenuse: "15", angle: "θ", base: "?", solveFor: "base" },
          difficulty: "medium",
          why: [null, "3/5 is sine (9 over 15). The question asks for cosine.", "9/15 treats 9 as the adjacent side. For this angle, 9 is opposite and 12 is adjacent.", "12/9 divides the two legs. Cosine uses the hypotenuse: 12/15 = 4/5."],
        },
        {
          q: "A support wire runs from the top of a 24-foot pole to a point on the ground 18 feet from the pole's base. What is the sine of the angle the wire makes with the ground?",
          choices: ["4/5", "3/5", "24/18", "18/24"],
          answer: 0,
          explain:
            "The wire (hypotenuse) isn't given directly and must be found via the Pythagorean theorem: √(24²+18²)=√900=30; sine=opposite/hypotenuse=24/30=4/5. 3/5 mistakenly computes cosine (adjacent over hypotenuse, 18/30) instead of sine. 24/18 mistakenly uses a tangent-style ratio (leg over leg) instead of opposite over hypotenuse. 18/24 makes the same mistake with the legs reversed.",
          diagram: { kind: "rightTriangle", base: "18", height: "24", angle: "θ", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "hard",
          why: [null, "3/5 is cosine: the ground distance over the wire.", "24/18 divides the two legs, which is tangent.", "18/24 divides the legs the other way. Sine is 24/30."],
        },
      ],
      traps: [
        "Attempting to apply a trig ratio directly with only two known sides, without first solving for the missing third side.",
        "Using the Pythagorean theorem correctly but then misidentifying which of the three sides is opposite versus adjacent to the specific angle in question.",
        "Forgetting to simplify a radical result from the Pythagorean theorem before using it in the trig ratio.",
      ],
    },
    {
      name: "Radian Measure and Coterminal Angles",
      explanation:
        "This pattern tests angles measured in radians instead of degrees, especially values larger than 2π (a full circle) or negative angles. The method: find a coterminal angle within the standard 0-to-2π range, by adding or subtracting multiples of 2π until it lands there. Then evaluate the trig function using that simpler, equivalent angle. Coterminal angles always share identical trig values, since they land in the exact same position on the circle. Some questions just convert units: π radians = 180°, so multiply by 180/π to go from radians to degrees and by π/180 to go from degrees to radians. If two angles are given in radians and you need their total in degrees, add them first over a common denominator (π/3 + π/2 = 2π/6 + 3π/6 = 5π/6), then convert once.",
      examples: [
        {
          q: "What is the value of cos(2π + π/3)?",
          choices: ["1/2", "√3/2", "-1/2", "1"],
          answer: 0,
          explain:
            "Adding a full 2π rotation doesn't change where the angle points, so cos(2π+π/3) equals the simpler cos(π/3)=1/2. √3/2 mistakenly reports sin(π/3) instead of cos(π/3), confusing the two trig functions. -1/2 comes from an incorrect sign, as if the angle landed in a different quadrant. 1 mistakenly evaluates the reduced angle as if it were 0 instead of π/3.",
          diagram: { kind: "unitCircleAngle", rawLabel: "2π + π/3", angleDegrees: 60 },
          difficulty: "easy",
          why: [null, "√3/2 is sin(π/3). The question asks for cosine: 1/2.", "2π + π/3 points the same way as π/3, where cosine is positive.", "1 is cos(0). The angle reduces to π/3, not 0."],
        },
        {
          q: "What is the value of sin(-π/6)?",
          choices: ["-1/2", "1/2", "-√3/2", "√3/2"],
          answer: 0,
          explain:
            "Converting the negative angle to its positive coterminal angle by adding 2π gives -π/6+2π=11π/6, which lies in the fourth quadrant, where sine is negative; the reference angle is π/6, and sin(π/6)=1/2, so with the fourth-quadrant sign, sin(11π/6)=-1/2. 1/2 forgets to apply the negative sign for the fourth quadrant. -√3/2 and √3/2 both mistakenly report cosine's reference value instead of sine's.",
          diagram: { kind: "unitCircleAngle", rawLabel: "-π/6", angleDegrees: -30 },
          difficulty: "easy",
          why: [null, "The angle is below the x-axis, where sine is negative.", "√3/2 is the cosine value for π/6. Sine of π/6 is 1/2.", "√3/2 is cosine's value, and the sign should be negative."],
        },
        {
          q: "Angle P measures 3π/4 radians, and angle Q measures 5π/6 radians. What is the sum of the measures of the two angles, in degrees?",
          choices: ["144", "285", "570", "19π/12"],
          answer: 1,
          explain:
            "Add first, over a common denominator of 12: 3π/4 + 5π/6 = 9π/12 + 10π/12 = 19π/12. Then convert by multiplying by 180/π: (19/12)(180) = 285. Converting each angle separately gives the same total, 135 + 150 = 285. 144 adds straight across, (3 + 5)π/(4 + 6) = 4π/5, which isn't how fractions add. 570 uses 360° for π, but π radians is 180°. 19π/12 is the correct sum, but in radians, not degrees.",
          difficulty: "medium",
          why: ["144 comes from adding numerators and denominators: 8π/10. With a common denominator, the sum is 19π/12 = 285°.", null, "570 treats π as 360°. π radians is 180°: (19/12)(180) = 285.", "19π/12 is the sum in radians. Multiply by 180/π to get degrees: 285."],
        },
        {
          q: "What is the value of tan(13π/4)?",
          choices: ["1", "-1", "√2", "-√2"],
          answer: 0,
          explain:
            "Since 13π/4 is larger than 2π (which is 8π/4), subtracting one full rotation gives 13π/4-8π/4=5π/4, which lies in the third quadrant, where tangent is positive; the reference angle is π/4, and tan(π/4)=1, so tan(5π/4)=1. -1 mistakenly applies a negative sign, as if the angle landed in a quadrant where tangent is negative. √2 and -√2 both mistakenly report a sine or cosine reference value instead of tangent's.",
          diagram: { kind: "unitCircleAngle", rawLabel: "13π/4", angleDegrees: 585 },
          difficulty: "medium",
          why: [null, "13π/4 reduces to 5π/4, in the third quadrant, where tangent is positive.", "√2 isn't a tangent value for π/4. tan(π/4) = 1.", "Tangent of π/4 is 1, and it's positive in the third quadrant."],
        },
        {
          q: "What is the value of sin(17π/2)?",
          choices: ["1", "-1", "0", "1/2"],
          answer: 0,
          explain:
            "Since 17π/2 is much larger than 2π, multiple full rotations must be subtracted: 17π/2 ÷ (4π/2) = 4.25, meaning 4 full rotations (16π/2) fit inside, leaving 17π/2-16π/2=π/2, and sin(π/2)=1. -1 comes from subtracting one too many or too few rotations, landing on the wrong angle. 0 mistakenly evaluates the angle as if it reduced to 0 or π instead of π/2. 1/2 mistakenly reports a different reference value entirely.",
          diagram: { kind: "unitCircleAngle", rawLabel: "17π/2", angleDegrees: 1530 },
          difficulty: "medium",
          why: [null, "17π/2 reduces to π/2, not 3π/2. sin(π/2) = 1.", "The angle reduces to π/2, not 0 or π.", "sin(π/2) is 1. 1/2 is sin(π/6)."],
        },
        {
          q: "What is the value of cos(-11π/3)?",
          choices: ["1/2", "-1/2", "√3/2", "-√3/2"],
          answer: 0,
          explain:
            "This angle is both negative and large in magnitude, needing 2π added twice to reach the standard range: -11π/3+6π/3=-5π/3 (still negative), then -5π/3+6π/3=π/3; cos(π/3)=1/2. -1/2 comes from stopping after adding 2π only once, landing on the wrong (still-negative) angle and misapplying a sign. √3/2 and -√3/2 both mistakenly report sine's reference value instead of cosine's.",
          diagram: { kind: "unitCircleAngle", rawLabel: "-11π/3", angleDegrees: -660 },
          difficulty: "hard",
          why: [null, "Add 2π twice: −11π/3 + 4π = π/3, where cosine is +1/2.", "√3/2 is sin(π/3). cos(π/3) = 1/2.", "√3/2 is a sine value, and the sign here is positive."],
        },
      ],
      traps: [
        "Trying to evaluate a trig function directly at a large or negative radian value without first reducing it to a coterminal angle within one full rotation.",
        "Subtracting or adding the wrong number of full rotations (2π), leaving an angle that's still outside the standard range or overshoots into the wrong quadrant.",
        "Converting between radians and degrees incorrectly, especially forgetting that π radians equals 180°, not 360°.",
        "Adding radian fractions by adding the numerators and the denominators (π/3 + π/2 is not 2π/5) instead of using a common denominator.",
      ],
    },
    {
      name: "Using the Pythagorean Theorem Alone to Find a Missing Side",
      explanation:
        "Not every right-triangle question needs a trig ratio; plenty just ask for a missing side length, which the Pythagorean theorem (a² + b² = c²) finds directly. Remember c is always the hypotenuse: opposite the right angle, and always the longest side. If the hypotenuse is missing, add the two legs' squares and take the square root. If a leg is missing, subtract the other leg's square from the hypotenuse's square first. Many answers come out as a simplified radical, not a whole number: know how to simplify a square root (pull out the largest perfect-square factor) instead of leaving it unsimplified or rounding early.",
      examples: [
        {
          q: "A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?",
          choices: ["10", "14", "√28", "48"],
          answer: 0,
          explain:
            "Applying the Pythagorean theorem, 6²+8²=c², gives 36+64=100=c², so c=10, a recognizable 6-8-10 triangle (a scaled-up 3-4-5). 14 comes from simply adding the two legs instead of applying the theorem. √28 comes from an unrelated miscalculation, like subtracting instead of adding the squares. 48 mistakenly reports the product of the two legs instead of the hypotenuse.",
          diagram: { kind: "rightTriangle", base: "6", height: "8", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
          why: [null, "14 adds the legs. The theorem adds their squares: 36 + 64 = 100.", "√28 subtracts the squares. For the hypotenuse, add them.", "48 multiplies the legs. The hypotenuse is √(36 + 64) = 10."],
        },
        {
          q: "A right triangle has a hypotenuse of length 13 and one leg of length 5. What is the length of the other leg?",
          choices: ["12", "18", "8", "√194"],
          answer: 0,
          explain:
            "Since the hypotenuse is known, the missing leg is found by subtracting: b²=13²-5²=169-25=144, so b=12. 18 comes from adding the squares instead of subtracting them, treating the hypotenuse as if it were a missing leg. 8 comes from an arithmetic slip in the subtraction. √194 comes from adding the squares (169+25) instead of subtracting them.",
          diagram: { kind: "rightTriangle", hypotenuse: "13", base: "5", height: "?", solveFor: "height" },
          difficulty: "easy",
          why: [null, "18 adds 13 and 5. Subtract the squares: 169 − 25 = 144.", "8 is 13 − 5. Subtract the squares, then take the root: √144 = 12.", "√194 adds the squares. A missing leg subtracts: 169 − 25."],
        },
        {
          q: "A right triangle has legs of length 5 and 9. What is the length of the hypotenuse, in simplest radical form?",
          choices: ["√106", "14", "√56", "106"],
          answer: 0,
          explain:
            "Applying the theorem, 5²+9²=c², gives 25+81=106=c², so c=√106; since 106 has no perfect-square factors other than 1 (its factors are 2×53, neither a perfect square), this radical is already fully simplified. 14 comes from simply adding the two legs instead of applying the theorem. √56 comes from an arithmetic slip in the addition. 106 mistakenly reports c² itself instead of taking the square root.",
          diagram: { kind: "rightTriangle", base: "5", height: "9", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "medium",
          why: [null, "14 adds the legs. Add their squares instead: 25 + 81 = 106.", "√56 subtracts the squares. For the hypotenuse, add them.", "106 is c². Take the square root: √106."],
        },
        {
          q: "A ladder 15 feet long leans against a wall, with its base 9 feet from the wall. How high up the wall does the ladder reach?",
          choices: ["12 feet", "18 feet", "6 feet", "√306 feet"],
          answer: 0,
          explain:
            "Translating the scenario into a right triangle, the ladder is the hypotenuse (15) and the ground distance is one leg (9); applying the theorem, 9²+b²=15², gives 81+b²=225, so b²=144 and b=12 feet. 18 feet comes from adding the squares instead of subtracting them, treating the hypotenuse as if it were a missing leg. 6 feet comes from an arithmetic slip in the subtraction. √306 feet comes from adding the squares (81+225) instead of subtracting them.",
          diagram: { kind: "rightTriangle", hypotenuse: "15", base: "9", height: "?", solveFor: "height" },
          difficulty: "medium",
          why: [null, "18 is longer than the 15-foot ladder, which is impossible. Subtract squares: 225 − 81 = 144.", "6 is 15 − 9. Subtract the squares instead: √144 = 12.", "√306 adds the squares. The ladder is the hypotenuse, so subtract."],
        },
        {
          q: "A right triangle has legs of length 4√3 and 4. Find the length of the hypotenuse, and simplify your answer completely.",
          choices: ["8", "4√7", "64", "4√3+4"],
          answer: 0,
          explain:
            "Applying the theorem and squaring each leg carefully, (4√3)²+4²=c²; squaring the radical term correctly gives (4√3)²=16×3=48, and combining, 48+16=64=c², so c=8. 4√7 comes from incorrectly adding the two legs' values under one radical instead of squaring each separately. 64 mistakenly reports c² itself instead of taking the square root. 4√3+4 mistakenly adds the two original leg lengths together instead of applying the Pythagorean theorem at all.",
          diagram: { kind: "rightTriangle", base: "4√3", height: "4", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "hard",
          why: [null, "(4√7)² = 112. The actual sum of squares is 48 + 16 = 64.", "64 is c². Take the square root: 8.", "Adding the legs isn't the Pythagorean theorem. Square each, add, then take the root."],
        },
      ],
      traps: [
        "Adding the hypotenuse's square to a leg's square when solving for the other leg, instead of subtracting — the hypotenuse only gets added when it's the value being solved FOR.",
        "Forgetting to fully simplify a radical answer, or trying to round it when an exact simplified form is expected.",
        "Squaring a radical leg length incorrectly — (a√b)² = a²b, not a²+b or a·b.",
      ],
    },
    {
      name: "The Sine-Cosine Complementary Angle Relationship",
      explanation:
        "In any right triangle, the two non-right angles are always complementary: they add to 90°. That creates a direct shortcut: the sine of one acute angle always equals the cosine of the other, since each angle's 'opposite' side is the other angle's 'adjacent' side. As an identity: sin(x°) = cos(90° - x°), for any angle x. So a question can hand you sin(x°) = cos(y°) and ask for the relationship between x and y with no triangle and no side lengths at all; the answer is always that x and y add up to 90.",
      examples: [
        {
          q: "If sin(40°) = cos(y°), what is the value of y?",
          choices: ["50", "40", "130", "90"],
          answer: 0,
          explain:
            "Applying the identity sin(x°)=cos(90°-x°) with x=40 gives y=90-40=50. 40 mistakenly restates the given angle itself instead of solving for its complement. 130 comes from adding the two angles instead of subtracting. 90 mistakenly reports the full complementary sum itself instead of the missing angle y.",
          diagram: { kind: "rightTriangle", angle: "40°", topAngle: "y°" },
          difficulty: "easy",
          why: [null, "40 is the given angle. Sine of an angle equals cosine of its complement: 90 − 40.", "130 adds 90 and 40. The complement subtracts: 90 − 40 = 50.", "90 is the total of the two angles, not y."],
        },
        {
          q: "In a right triangle, angle A and angle B are the two non-right angles. If sin(A) = 0.6, what is cos(B)?",
          choices: ["0.6", "0.4", "0.8", "1.6"],
          answer: 0,
          explain:
            "In any right triangle, the two non-right angles are always complementary, and by the complementary angle identity, sin(A)=cos(B) whenever A and B are complementary, so cos(B)=0.6 with no calculation needed. 0.4 comes from an unrelated miscalculation, like subtracting from 1. 0.8 mistakenly computes a different ratio, as if using the Pythagorean theorem on an assumed 3-4-5 triangle instead of applying the direct identity. 1.6 comes from adding 1 to the given value, an arithmetic error.",
          diagram: { kind: "rightTriangle", angle: "A", topAngle: "B" },
          difficulty: "easy",
          why: [null, "0.4 is 1 − 0.6. A and B are complementary, so cos(B) = sin(A) = 0.6.", "0.8 is cos(A). The question asks for cos(B), which equals sin(A).", "1.6 adds 1. cos(B) equals sin(A) exactly: 0.6."],
        },
        {
          q: "If sin(3x°) = cos(2x° + 15°), what is the value of x?",
          choices: ["15", "25", "5", "37.5"],
          answer: 0,
          explain:
            "Since sin of one angle equals cos of its complement, 3x and (2x+15) must sum to 90: 3x+(2x+15)=90; combining like terms gives 5x+15=90, so 5x=75, giving x=15. 25 comes from an arithmetic slip while isolating x. 5 comes from a similar arithmetic slip in a different direction. 37.5 comes from forgetting to subtract the 15 before dividing by 5.",
          diagram: { kind: "rightTriangle", angle: "3x°", topAngle: "(2x+15)°" },
          difficulty: "medium",
          why: [null, "Check x = 25: 3(25) + 2(25) + 15 = 140, not 90.", "Check x = 5: 15 + 25 = 40, not 90.", "Check x = 37.5: 3x alone is 112.5, already over 90."],
        },
        {
          q: "In right triangle KLM, with the right angle at L, sin(K) = cos(K + 20°). What is the measure of angle K?",
          choices: ["35°", "70°", "20°", "55°"],
          answer: 0,
          explain:
            "Since K and M (where M=K+20) are complementary, K+(K+20)=90; combining gives 2K+20=90, so 2K=70, giving K=35°. 70° mistakenly reports 2K, an intermediate value, instead of solving for K itself. 20° mistakenly restates the given offset instead of solving for K. 55° comes from an arithmetic slip while isolating K.",
          diagram: { kind: "rightTriangle", angle: "K", topAngle: "K+20°" },
          difficulty: "hard",
          why: [null, "70° is 2K. Divide by 2: K = 35°.", "20° is the offset between the angles, not K.", "55° is angle M, which is K + 20. K itself is 35°."],
        },
        {
          q: "Right triangle PQR has its right angle at Q. If sin(P) = 5/13, what is cos(P) + sin(R)?",
          choices: ["24/13", "12/13", "10/13", "17/13"],
          answer: 0,
          explain:
            "Since P and R are complementary, sin(R)=cos(P) by the identity, meaning the two quantities being added are equal to each other; since sin(P)=5/13 describes a 5-12-13 right triangle (opposite=5, hypotenuse=13, so adjacent=12), cos(P)=12/13, and cos(P)+sin(R)=12/13+12/13=24/13. 12/13 mistakenly reports only one of the two equal terms instead of their sum. 10/13 comes from doubling the wrong ratio (5/13 instead of 12/13). 17/13 comes from an arithmetic slip in the final addition.",
          diagram: { kind: "rightTriangle", angle: "P", topAngle: "R", base: "12", height: "5", hypotenuse: "13" },
          difficulty: "hard",
          why: [null, "12/13 is only cos(P). sin(R) equals it too, so double it: 24/13.", "10/13 doubles sin(P). The terms are cos(P) and sin(R), each 12/13.", "17/13 adds sin(P) and cos(P). sin(R) equals cos(P), so it's 12/13 + 12/13."],
        },
      ],
      traps: [
        "Assuming sin and cos of the SAME angle are related this way — the identity only connects sin of one angle to cos of its complement (a different angle), not sin and cos of one angle to each other.",
        "Forgetting that the two non-right angles of any right triangle are automatically complementary, and trying to look for an explicitly stated 90° sum instead of recognizing it from the triangle itself.",
        "Setting up the complementary equation backward (subtracting 90 from x instead of x from 90).",
      ],
    },
  ],
  tipsAndTricks: [
    "Before applying any trig ratio, explicitly label which side is opposite, which is adjacent, and which is the hypotenuse RELATIVE TO THE SPECIFIC ANGLE given — this single habit prevents most errors on this subskill.",
    "Memorize both special right triangle ratios cold: 45-45-90 is (x, x, x√2); 30-60-90 is (x, x√3, 2x) — recognizing these angles instantly skips the Pythagorean theorem and saves real time.",
    "Remember the complementary angle identity: sin(x) = cos(90° - x). This lets you answer some questions immediately without any triangle at all, just angle arithmetic.",
  ],
};

const LC_M_CIRCLES: { patterns: Pattern[]; tipsAndTricks: string[] } = {
  patterns: [
    {
      name: "The Circle Equation (Center-Radius Form)",
      desmosCalculator: "graphing",
      desmosTrick:
        "Step 1: Type the equation exactly as given, using ^2 for squares — for example (x-3)^2+(y+1)^2=25. Desmos draws the circle immediately. Step 2: Read the center straight off what's being subtracted from x and y inside the parentheses (watch the sign carefully: (x-3) means the center's x-coordinate is +3, not -3). Step 3: The radius is the square root of the number on the right side. Step 4: You can also click any point on the drawn circle to read its coordinates directly, instead of plugging a value into the equation algebraically.",
      explanation:
        "A circle's equation in the form (x-h)² + (y-k)² = r² directly encodes its center (h, k) and radius r. Just like with vertex form for parabolas, the most common error is a sign mix-up: an equation with (x+3)² actually means h = -3, not h = 3, since the template subtracts h. If the equation comes expanded, like x² + y² + 6x - 4y - 12 = 0, complete the square in x and in y: make the x² and y² coefficients 1, move the constant to the right, and add (half the x-coefficient)² and (half the y-coefficient)² to BOTH sides; the right side becomes r². Once you have the center and radius, you know where the circle reaches: every point on it has an x-coordinate from h - r to h + r and a y-coordinate from k - r to k + r. That also tells you when a circle touches an axis at exactly one point (is tangent to it): the y-axis when |h| = r, and the x-axis when |k| = r.",
      examples: [
        {
          q: "What is the equation of a circle with center (2, -3) and radius 5?",
          choices: ["(x-2)² + (y+3)² = 25", "(x+2)² + (y-3)² = 25", "(x-2)² + (y-3)² = 25", "(x-2)² + (y+3)² = 5"],
          answer: 0,
          explain:
            "Substituting h=2, k=-3, r=5 into the template (x-h)²+(y-k)²=r² gives (x-2)²+(y-(-3))²=5², which simplifies to (x-2)²+(y+3)²=25 — the '+3' is correct because subtracting a negative k flips the sign. (x+2)²+(y-3)²=25 flips both signs incorrectly, treating the center as if it were (-2,3). (x-2)²+(y-3)²=25 forgets to flip the sign on the negative k-coordinate at all. (x-2)²+(y+3)²=5 correctly handles the center but forgets to square the radius on the right side.",
          diagram: { kind: "circleCoordinate", h: 2, k: -3, r: 5 },
          difficulty: "easy",
          why: [null, "Both signs are flipped. The center (2, −3) gives (x − 2) and (y + 3).", "The y-coordinate is −3, so it's y − (−3) = y + 3.", "The right side is r², not r: 5² = 25."],
        },
        {
          q: "What is the equation of a circle with center (-4, 1) and radius 6?",
          choices: ["(x+4)² + (y-1)² = 36", "(x-4)² + (y+1)² = 36", "(x+4)² + (y-1)² = 6", "(x+4)² + (y+1)² = 36"],
          answer: 0,
          explain:
            "Substituting h=-4, k=1, r=6 gives (x-(-4))²+(y-1)²=6², which simplifies to (x+4)²+(y-1)²=36 — the '+4' is correct because subtracting a negative h flips the sign. (x-4)²+(y+1)²=36 flips both signs incorrectly, treating the center as if it were (4,-1). (x+4)²+(y-1)²=6 correctly handles the center but forgets to square the radius. (x+4)²+(y+1)²=36 correctly flips the sign for h but incorrectly flips the sign for the positive k as well.",
          diagram: { kind: "circleCoordinate", h: -4, k: 1, r: 6 },
          difficulty: "medium",
          why: [null, "Both signs are flipped. The center (−4, 1) gives (x + 4) and (y − 1).", "The right side is r², not r: 6² = 36.", "The y-coordinate is +1, so it's (y − 1), not (y + 1)."],
        },
        {
          q: "What is the equation of a circle with center (5, 2) and radius 3?",
          choices: ["(x-5)² + (y-2)² = 9", "(x+5)² + (y+2)² = 9", "(x-5)² + (y-2)² = 3", "(x-5)² + (y-2)² = 6"],
          answer: 0,
          explain:
            "Substituting h=5, k=2, r=3 directly into the template gives (x-5)²+(y-2)²=3², which simplifies to (x-5)²+(y-2)²=9. (x+5)²+(y+2)²=9 incorrectly flips both signs, even though both coordinates of the center are positive and need no flip. (x-5)²+(y-2)²=3 forgets to square the radius. (x-5)²+(y-2)²=6 comes from an arithmetic slip, like doubling the radius instead of squaring it.",
          diagram: { kind: "circleCoordinate", h: 5, k: 2, r: 3 },
          difficulty: "easy",
          why: [null, "Both center coordinates are positive, so both terms subtract: (x − 5) and (y − 2).", "The right side is r²: 3² = 9.", "6 doubles the radius. The right side is r²: 9."],
        },
        {
          q: "A circle has the equation (x+1)² + (y-8)² = 49. What are the circle's center and radius?",
          choices: ["Center (-1, 8), radius 7", "Center (1, 8), radius 7", "Center (-1, 8), radius 49", "Center (-1, -8), radius 7"],
          answer: 0,
          explain:
            "Since the equation has (x+1), that's (x-(-1)), so h=-1; since it has (y-8), k=8; and the radius is the square root of the right side, √49=7, not 49 itself. Reporting center (1,8) misreads (x+1) as meaning h=1 instead of correctly flipping the sign to h=-1. Reporting radius 49 forgets to take the square root of the right side. Reporting center (-1,-8) incorrectly flips the sign on k, which doesn't need flipping since (y-8) already matches the template directly.",
          diagram: { kind: "circleCoordinate", h: -1, k: 8, r: 7 },
          difficulty: "medium",
          why: [null, "(x + 1) means x − (−1), so the x-coordinate is −1.", "The radius is the square root of 49: 7.", "(y − 8) means the y-coordinate is +8."],
        },
        {
          q: "Which equation represents a circle in the xy-plane that intersects the y-axis at exactly one point?",
          choices: ["(x - 3)² + (y - 4)² = 16", "(x - 4)² + (y - 3)² = 4", "(x - 4)² + (y - 3)² = 16", "(x - 16)² + (y - 3)² = 16"],
          answer: 2,
          explain:
            "A circle touches the y-axis at exactly one point when the distance from its center to the y-axis, |h|, equals its radius. For (x - 4)² + (y - 3)² = 16, the center is (4, 3) and the radius is √16 = 4: the center is 4 units from the y-axis, so the circle just touches it, at (0, 3). (x - 3)² + (y - 4)² = 16 has radius 4 but a center only 3 units from the y-axis, so it crosses the y-axis twice; it's the x-axis this circle touches once, since k = 4. (x - 4)² + (y - 3)² = 4 has radius 2, not 4, so it never reaches the y-axis. (x - 16)² + (y - 3)² = 16 treats 16 as the radius; its radius is 4 and its center is 16 units away, so it misses the y-axis completely.",
          difficulty: "medium",
          why: ["The center is only 3 units from the y-axis, less than the radius 4, so it crosses twice. It touches the x-axis once.", "The radius is √4 = 2, not 4. A center 4 units away never reaches the y-axis.", null, "The radius is √16 = 4, not 16. A center 16 units away misses the y-axis."],
        },
        {
          q: "A circle has the equation x² + y² + 6x - 4y - 12 = 0. What is the circle's radius?",
          choices: ["5", "25", "12", "3"],
          answer: 0,
          explain:
            "Completing the square for both x and y, grouping terms as (x²+6x)+(y²-4y)=12, then adding (6/2)²=9 and (-4/2)²=4 to both sides gives (x²+6x+9)+(y²-4y+4)=12+9+4=25, which simplifies to (x+3)²+(y-2)²=25, so the radius is √25=5. 25 mistakenly reports the right side of the equation itself instead of taking its square root. 12 mistakenly restates the original constant from the equation instead of completing the square first. 3 comes from an arithmetic slip while completing the square.",
          diagram: { kind: "circleCoordinate", h: -3, k: 2, r: 5 },
          difficulty: "hard",
          why: [null, "25 is r². The radius is √25 = 5.", "12 is the constant before completing the square. Add 9 and 4 to get 25, then take the root.", "3 is how far the center is from the y-axis, not the radius."],
        },
        {
          q: "The graph of the equation x² + y² - 10x + 4y + 13 = 0 in the xy-plane is a circle. Which of the following could be the x-coordinate of a point on the circle?",
          choices: ["-8", "8", "10", "20"],
          answer: 1,
          explain:
            "Complete the square in x and in y. Move the constant: x² - 10x + y² + 4y = -13. Add (-10/2)² = 25 and (4/2)² = 4 to both sides: (x - 5)² + (y + 2)² = -13 + 25 + 4 = 16. The center is (5, -2) and the radius is 4, so every point on the circle has an x-coordinate from 5 - 4 = 1 to 5 + 4 = 9. Only 8 is in that range. -8 comes from reading the center as (-5, 2), with the signs flipped, which would put x between -9 and -1. 10 comes from forgetting to move the 13 across, which makes r² = 29 and the radius about 5.4. 20 uses r² = 16 as the reach instead of r = 4.",
          difficulty: "hard",
          why: ["The center is (5, −2), not (−5, 2). x runs from 5 − 4 = 1 to 5 + 4 = 9.", null, "Once the 13 moves across, r² = −13 + 25 + 4 = 16, so r = 4 and x can go only as high as 9.", "20 uses 16 as the reach. The radius is √16 = 4, so x stops at 9."],
        },
      ],
      traps: [
        "Writing the wrong sign for a negative coordinate in the center — forgetting that subtracting a negative number flips to addition.",
        "Forgetting to square the radius on the right side of the equation (writing r instead of r²), or forgetting to take the square root when working backward from an equation to find r.",
        "Mishandling the steps of completing the square: divide so x² and y² have a coefficient of 1, move the constant across (flipping its sign), and add each (half the coefficient)² to BOTH sides.",
        "Mixing up which coordinate controls tangency: the distance from the center to the y-axis is |h|, and the distance to the x-axis is |k|.",
        "Using r² instead of r for how far the circle reaches: its points run from h − r to h + r, not h − r² to h + r².",
      ],
    },
    {
      name: "Arc Length and Sector Area as Fractions of the Whole Circle",
      explanation:
        "Both arc length and sector area work the same way: take the central angle as a fraction of the full 360°, then apply that same fraction to the circle's total circumference (for arc length) or total area (for sector area). Recognizing this 'fraction of the whole' idea lets you derive both formulas on the spot, instead of memorizing them separately.",
      examples: [
        {
          q: "A sector has a central angle of 90° in a circle of radius 4. What is its area?",
          choices: ["4π", "16π", "π", "2π"],
          answer: 0,
          explain:
            "This sector represents 90°/360°=1/4 of the full circle; the full circle's area is πr²=π(16)=16π, so applying the fraction gives (1/4)(16π)=4π. 16π mistakenly reports the full circle's area instead of the sector's fraction of it. π comes from an arithmetic slip in the fraction multiplication. 2π comes from using the wrong fraction, like confusing the angle with a different value.",
          diagram: { kind: "sector", radiusLabel: "4", angleLabel: "90°", angleDegrees: 90, askFor: "area" },
          difficulty: "easy",
          why: [null, "16π is the whole circle. 90° is a quarter: 4π.", "Check it: a quarter of 16π is 4π, not π.", "2π is a quarter of the circumference, the arc length. Area uses πr² = 16π."],
        },
        {
          q: "An arc has a central angle of 120° in a circle of radius 9. What is the arc length, in terms of π?",
          choices: ["6π", "18π", "9π", "2π"],
          answer: 0,
          explain:
            "This arc represents 120°/360°=1/3 of the full circle; the full circumference is 2πr=2π(9)=18π, so applying the fraction gives (1/3)(18π)=6π. 18π mistakenly reports the full circumference instead of the arc's fraction of it. 9π comes from an arithmetic slip in the fraction multiplication. 2π comes from using the wrong fraction entirely.",
          diagram: { kind: "sector", radiusLabel: "9", angleLabel: "120°", angleDegrees: 120, askFor: "arcLength" },
          difficulty: "medium",
          why: [null, "18π is the whole circumference. 120° is a third: 6π.", "9π is half the circumference. 120° is a third.", "Check it: a third of 18π is 6π, not 2π."],
        },
        {
          q: "A sector has a central angle of 60° in a circle of radius 6. What is its area?",
          choices: ["6π", "36π", "3π", "12π"],
          answer: 0,
          explain:
            "This sector represents 60°/360°=1/6 of the full circle; the full circle's area is πr²=π(36)=36π, so applying the fraction gives (1/6)(36π)=6π. 36π mistakenly reports the full circle's area instead of the sector's fraction of it. 3π comes from an arithmetic slip in the fraction multiplication. 12π comes from using an incorrect fraction, like 1/3 instead of 1/6.",
          diagram: { kind: "sector", radiusLabel: "6", angleLabel: "60°", angleDegrees: 60, askFor: "area" },
          difficulty: "easy",
          why: [null, "36π is the whole circle. 60° is a sixth: 6π.", "3π is a twelfth. 60° out of 360° is a sixth.", "12π is a third. 60° out of 360° is a sixth."],
        },
        {
          q: "An arc has a length of 5π in a circle of radius 10. What is the measure of the central angle, in degrees?",
          choices: ["90°", "45°", "18°", "180°"],
          answer: 0,
          explain:
            "The full circumference is 2πr=2π(10)=20π; the given arc length represents a fraction of 5π/20π=1/4 of that circumference, so applying that same fraction to the full 360° gives (1/4)(360°)=90°. 45° comes from an arithmetic slip in computing the fraction. 18° comes from using the arc length itself (5) as a fraction of 360 without properly relating it to the circumference. 180° mistakenly reports half the circle instead of the correct 1/4.",
          diagram: { kind: "sector", radiusLabel: "10", angleLabel: "?", angleDegrees: 90, askFor: "angle" },
          difficulty: "medium",
          why: [null, "The fraction is 5π/20π = 1/4, and 1/4 of 360° is 90°.", "18° treats the 5 as a share of 360. Compare to the circumference: 5π out of 20π.", "180° is half the circle. The arc is a quarter: 5π of 20π."],
        },
        {
          q: "A sector has a central angle of 2π/3 radians in a circle of radius 9. What is the arc length of the sector?",
          choices: ["6π", "18π", "3π", "2π/3"],
          answer: 0,
          explain:
            "Since the angle is given in radians, arc length equals radius times angle directly (rθ), without needing a fraction of 360°: 9×(2π/3)=18π/3=6π. 18π mistakenly reports radius times the numerator of the angle without dividing by the denominator. 3π comes from an arithmetic slip in the multiplication. 2π/3 mistakenly restates the angle itself instead of computing the arc length.",
          diagram: { kind: "sector", radiusLabel: "9", angleLabel: "2π/3", angleDegrees: 120, askFor: "arcLength" },
          difficulty: "hard",
          why: [null, "18π multiplies 9 by 2π, forgetting to divide by 3.", "Check it: 9 × 2π/3 = 6π, not 3π.", "2π/3 is the angle, not the arc length. Multiply by the radius: 9 × 2π/3."],
        },
      ],
      traps: [
        "Forgetting to convert the central angle into a fraction of 360° before applying it to the circumference or area.",
        "Confusing arc length (a fraction of the circumference, a length) with sector area (a fraction of the area) and using the wrong base formula.",
      ],
    },
    {
      name: "Solving the Circle Equation for a Coordinate's Possible Values",
      explanation:
        "This pattern gives a circle's equation and one coordinate of a point on the circle, then asks for the possible value(s) of the OTHER coordinate. Since a circle equation is quadratic in both x and y, substituting a known coordinate usually gives two possible values for the unknown one — unless that coordinate is at the circle's most extreme point in that direction (only one value), or the point isn't actually on the circle at all (no values). The method: substitute the known value, then solve for what's left, watching for a plus-or-minus square root step.",
      examples: [
        {
          q: "The circle (x-2)² + (y-3)² = 25 passes through a point where x=2. What are the possible value(s) of y at this point?",
          choices: ["y=8 or y=-2", "y=5 or y=1", "y=8 only", "y=-8 or y=2"],
          answer: 0,
          explain:
            "Substituting x=2 gives (2-2)²+(y-3)²=25, which simplifies to (y-3)²=25; taking the square root of both sides (remembering both the positive and negative root) gives y-3=±5, so y=8 or y=-2. y=5 or y=1 comes from adding/subtracting the wrong value, like the center's y-coordinate itself, instead of the radius. y=8 only forgets the negative root, missing one of the two valid solutions. y=-8 or y=2 comes from a sign error while solving y-3=±5.",
          diagram: { kind: "circleCoordinate", h: 2, k: 3, r: 5, verticalLineAtX: 2, markPoints: true },
          difficulty: "easy",
          why: [null, "y − 3 = ±5, so y = 3 + 5 or 3 − 5. These values come from ±2 instead of ±5.", "Taking a square root gives two answers: y − 3 = 5 or y − 3 = −5.", "A sign slip: y = 3 ± 5 gives 8 or −2."],
        },
        {
          q: "The circle x² + y² = 100 passes through a point where x=6. What are the possible value(s) of y?",
          choices: ["y=8 or y=-8", "y=64 or y=-64", "y=8 only", "y=4 or y=-4"],
          answer: 0,
          explain:
            "Substituting x=6 gives 36+y²=100, so y²=64, and taking the square root of both sides gives y=±8. y=64 or y=-64 mistakenly reports y² itself instead of taking the square root. y=8 only forgets the negative root. y=4 or y=-4 comes from an arithmetic slip, like taking the square root of 64 incorrectly.",
          diagram: { kind: "circleCoordinate", h: 0, k: 0, r: 10, verticalLineAtX: 6, markPoints: true },
          difficulty: "easy",
          why: [null, "64 is y². Take the square root: ±8.", "y² = 64 has two answers: 8 and −8.", "The square root of 64 is 8, not 4."],
        },
        {
          q: "The circle (x+1)² + (y-4)² = 40 passes through a point where x=5. What are the possible value(s) of y?",
          choices: ["y=6 or y=2", "y=8 or y=0", "y=6 only", "y=-6 or y=-2"],
          answer: 0,
          explain:
            "Substituting x=5 gives (5+1)²+(y-4)²=40, which simplifies to 36+(y-4)²=40, so (y-4)²=4; taking the square root of both sides gives y-4=±2, so y=6 or y=2. y=8 or y=0 comes from an arithmetic slip while isolating the squared term. y=6 only forgets the negative root, missing one of the two valid solutions. y=-6 or y=-2 comes from a sign error while solving y-4=±2.",
          diagram: { kind: "circleCoordinate", h: -1, k: 4, r: 6, verticalLineAtX: 5, markPoints: true },
          difficulty: "medium",
          why: [null, "Check y = 8: 6² + (8 − 4)² = 36 + 16 = 52, not 40.", "(y − 4)² = 4 has two answers: y − 4 = 2 or −2.", "A sign slip: y = 4 ± 2 gives 6 or 2."],
        },
        {
          q: "The circle (x-3)² + (y+2)² = 16 passes through a point where x=7. What is the value of y at this point?",
          choices: [
            "y=-2, and only one value, since x=7 is the circle's rightmost point",
            "y=-2 and y=2, since squaring always gives two solutions",
            "y=2 only",
            "No real value of y works, since the result is negative",
          ],
          answer: 0,
          explain:
            "Substituting x=7 gives (7-3)²+(y+2)²=16, which simplifies to 16+(y+2)²=16, so (y+2)²=0, giving y+2=0 and y=-2 — only ONE solution, because x=7 is the circle's most extreme point in that direction (center x=3 plus radius 4), where the vertical line only touches the circle once. Assuming two solutions here misapplies the usual ± rule to a case where the squared term equals exactly 0, which has only one square root. y=2 only gets the sign wrong while solving y+2=0. And claiming no real value works misreads (y+2)²=0 as if it were negative, when 0 is a perfectly valid, non-negative result with exactly one solution.",
          diagram: { kind: "circleCoordinate", h: 3, k: -2, r: 4, verticalLineAtX: 7, singlePoint: true },
          difficulty: "medium",
          why: [null, "(y + 2)² = 0 has only one root, 0. x = 7 is the circle's far right edge, where it touches once.", "A sign slip: y + 2 = 0 gives y = −2.", "The squared term equals 0, not a negative number, so there's exactly one solution."],
        },
        {
          q: "The circle (x-2)² + (y-5)² = 9 is claimed to pass through a point where x=8. Is this possible, and why or why not?",
          choices: [
            "Not possible, since (y-5)² would have to equal -27, which no real y can satisfy",
            "Possible, with y=5±√27",
            "Possible, with y=5 only",
            "Not possible, since x=8 is not an integer multiple of the radius",
          ],
          answer: 0,
          explain:
            "Substituting x=8 gives (8-2)²+(y-5)²=9, which simplifies to 36+(y-5)²=9, so (y-5)²=9-36=-27; since a squared real number can never be negative, no real value of y satisfies this, meaning the circle does NOT actually pass through any point where x=8. Claiming y=5±√27 works ignores that the squared expression equals a negative number, which has no real square root at all. Claiming y=5 only misreads the negative result as if it simplified to a single solution instead of having none. And 'not an integer multiple of the radius' is not a real mathematical requirement — the actual reason is the negative squared value, unrelated to whether x is a multiple of the radius.",
          diagram: { kind: "circleCoordinate", h: 2, k: 5, r: 3, verticalLineAtX: 8, noIntersect: true },
          difficulty: "hard",
          why: [null, "(y − 5)² would have to equal −27, and no real number squared is negative.", "The squared term would have to be −27, which has no real solution, not a single one.", "Being a multiple of the radius has nothing to do with it. The real reason is (y − 5)² = −27."],
        },
      ],
      traps: [
        "Reporting only one solution when the equation actually produces two valid values (missing the ± from a square root).",
        "Forgetting to check that a reported value keeps the expression under the square root non-negative — an impossible point isn't actually on the circle.",
        "Substituting the known coordinate into the wrong position in the equation (mixing up which part corresponds to x and which to y).",
      ],
    },
    {
      name: "Circle Theorems: Central Angles, Arcs, and Tangent Lines",
      explanation:
        "Not every circle question involves the coordinate-plane equation — many are classic geometry facts about a circle drawn with no coordinates at all. Core facts: a central angle (vertex at the circle's center) always equals the arc it cuts off, in degrees. A radius drawn to where a tangent line touches the circle is always perpendicular to that tangent line, which often creates a right triangle you can solve with the Pythagorean theorem. Two radii of the same circle are always equal in length, which often makes a triangle formed by two radii isosceles. Basic area and circumference (A = πr², C = 2πr) show up here too, with no coordinate equation involved. The tangent fact also works in the xy-plane: if the center and the point of tangency are given as coordinates, find the slope of the radius between them; the tangent line is perpendicular to it, so its slope is the negative reciprocal (a radius slope of 4/3 means a tangent slope of -3/4). Write that line through the point of tangency, not the center, then use it to test points or match an equation.",
      examples: [
        {
          q: "A central angle in a circle measures 70°. What is the measure of the arc it intercepts?",
          choices: ["70°", "35°", "140°", "110°"],
          answer: 0,
          explain:
            "A central angle's measure always equals its intercepted arc's measure in degrees, so the arc also measures 70°. 35° mistakenly halves the angle, confusing this with the different rule for inscribed angles, which equal half their intercepted arc. 140° mistakenly doubles the angle instead of restating it directly. 110° comes from an unrelated miscalculation, like subtracting from 180°.",
          diagram: { kind: "circleBasic", centralAngleLabel: "70°", arcLabel: "?" },
          difficulty: "easy",
          why: [null, "Half the arc is the rule for inscribed angles. A central angle equals its arc.", "140° doubles the angle. A central angle equals its arc.", "110° is 180 − 70. A central angle equals its arc: 70°."],
        },
        {
          q: "A circle has a radius of 6. What is its area, in terms of π?",
          choices: ["36π", "12π", "6π", "18π"],
          answer: 0,
          explain:
            "Applying the area formula A=πr² with r=6 gives A=π(6)²=36π. 12π mistakenly uses the circumference formula (2πr) instead of the area formula. 6π mistakenly restates the radius times π without squaring it. 18π comes from an unrelated miscalculation, like using half of the correct area.",
          diagram: { kind: "circleBasic", radiusLabel: "6" },
          difficulty: "easy",
          why: [null, "12π is the circumference, 2πr. Area is πr² = 36π.", "6π forgets to square the radius.", "18π is half the area. Area is π(6²) = 36π."],
        },
        {
          q: "Line segment PQ is tangent to a circle at point Q, where O is the circle's center. If OQ = 5 and OP = 13, what is the length of PQ?",
          choices: ["12", "18", "8", "√194"],
          answer: 0,
          explain:
            "Since PQ is tangent to the circle at Q, radius OQ is perpendicular to PQ, making triangle OQP a right triangle with OP as the hypotenuse; applying the Pythagorean theorem, 5²+PQ²=13², gives 25+PQ²=169, so PQ²=144 and PQ=12. 18 comes from adding the squares instead of subtracting, treating OP as if it were a leg instead of the hypotenuse. 8 comes from an arithmetic slip in the subtraction. √194 comes from adding the squares (25+169) instead of subtracting them.",
          diagram: { kind: "circleBasic", tangent: { radius: "5", tangentSeg: "?", hyp: "13" } },
          difficulty: "medium",
          why: [null, "18 is 13 + 5. OP is the hypotenuse, so subtract squares: 169 − 25 = 144.", "8 is 13 − 5. Subtract the squares, then take the root: 12.", "√194 adds the squares. OP is the hypotenuse, so subtract."],
        },
        {
          q: "Points A and B lie on a circle centered at O, with OA = OB = 9. If the angle AOB measures 60°, what is the length of chord AB?",
          choices: ["9", "9√3", "18", "4.5"],
          answer: 0,
          explain:
            "Since OA and OB are both radii of the same circle, they're equal, making triangle AOB isosceles with a 60° angle between the two equal sides; an isosceles triangle with a 60° angle between its equal sides is actually equilateral, since its base angles must also each be 60° to sum to 180°, so all three sides are equal and AB=OA=OB=9. 9√3 comes from an unrelated miscalculation, like applying a 30-60-90 ratio that doesn't actually apply to this equilateral setup. 18 mistakenly doubles the radius instead of recognizing the chord equals it directly. 4.5 comes from halving the radius instead of restating it.",
          diagram: { kind: "circleBasic", chordTriangle: { radius: "9", angle: "60°", chord: "?" } },
          difficulty: "hard",
          why: [null, "The triangle has two sides of 9 with 60° between them, so it's equilateral. All sides are 9.", "18 doubles the radius. In an equilateral triangle, the chord equals the radius.", "4.5 halves the radius. The chord equals the radius here."],
        },
        {
          q: "A circle has a circumference of 24π. A central angle intercepts an arc with a length of 4π. What is the measure of the central angle, in degrees?",
          choices: ["60°", "90°", "30°", "45°"],
          answer: 0,
          explain:
            "An arc's length is the same fraction of the full circumference as its central angle is of 360°; the fraction here is arc length/circumference=4π/24π=1/6, so applying that fraction to 360° gives (1/6)×360°=60°. 90° comes from using the wrong fraction, like 1/4 instead of 1/6. 30° comes from an arithmetic slip in the fraction multiplication. 45° comes from an unrelated miscalculation.",
          diagram: { kind: "circleBasic", centralAngleLabel: "?", arcLabel: "4π" },
          difficulty: "hard",
          why: [null, "90° is a quarter of the circle. The arc is 4π of 24π, a sixth.", "30° is a twelfth. The arc is a sixth: 360 ÷ 6 = 60°.", "45° is an eighth. The arc is a sixth of the circle."],
        },
        {
          q: "In the xy-plane, a circle has center (2, -1). Line ℓ is tangent to the circle at the point (5, 3), as shown. Which of the following points also lies on line ℓ?",
          choices: ["(8, 7)", "(9, 6)", "(-2, 2)", "(9, 0)"],
          answer: 3,
          explain:
            "The radius from the center (2, -1) to the point of tangency (5, 3) has slope (3 - (-1))/(5 - 2) = 4/3. A tangent line is perpendicular to that radius, so ℓ has slope -3/4 and passes through (5, 3): y - 3 = -(3/4)(x - 5). At x = 9, y = 3 - (3/4)(4) = 0, so (9, 0) is on ℓ. (8, 7) is on the line through (5, 3) with slope 4/3, which just extends the radius. (9, 6) uses slope 3/4, the reciprocal without the sign change, which isn't perpendicular. (-2, 2) is on the line with slope -3/4 through the center, (2, -1), rather than through the point of tangency.",
          figure: {"kind": "geometry", "points": {"C": [2, -1], "T": [5, 3], "L1": [1, 6], "L2": [7, 1.5]}, "dots": ["C", "T"], "circles": [{"center": "C", "radius": 5}], "segments": [{"from": "C", "to": "T", "dashed": true}, {"from": "L1", "to": "L2", "arrows": true}], "angles": [{"vertex": "T", "from": "C", "to": "L2", "right": true}], "axes": {"x": [-4, 11], "y": [-7, 7], "step": 1, "labelEvery": 2}, "notes": [{"at": [0.4, 6.4], "text": "ℓ"}]},
          difficulty: "hard",
          why: ["(8, 7) continues the radius, with slope 4/3. The tangent is perpendicular: slope −3/4.", "Slope 3/4 isn't perpendicular to 4/3. Flip the fraction and change the sign: −3/4.", "This line has the right slope but runs through the center. The tangent passes through (5, 3).", null],
        },
      ],
      traps: [
        "Confusing a central angle (vertex at the circle's center, equal to its arc) with an inscribed angle (vertex on the circle itself, equal to HALF its intercepted arc) — these follow different rules.",
        "Forgetting that a tangent line and the radius drawn to the point of tangency are perpendicular, missing an available right angle and Pythagorean setup.",
        "Not recognizing when two radii of the same circle create an isosceles (or, with a 60° angle between them, equilateral) triangle.",
        "Giving the tangent line the radius's slope, or only flipping its sign, or only taking its reciprocal — a perpendicular slope is the negative reciprocal.",
        "Running the tangent line through the circle's center instead of through the point of tangency.",
      ],
    },
    {
      name: "Inscribed Figures and Radii as Equal Sides",
      explanation:
        "Many circle questions hide a triangle or polygon built from the circle's radii. When a triangle has one vertex at the center and two on the circle, two of its sides are radii, so it's isosceles: its base angles are equal, each (180° − central angle)/2, and a right central angle makes an isosceles right triangle whose chord is r√2 (a 60° central angle makes it equilateral, so the chord equals r). When a polygon is inscribed, with every vertex on the circle, draw a diagonal or the radii to the vertices: a square's or rectangle's diagonal is a diameter, 2r; an equilateral triangle's radii make three 120° angles at the center, and a regular hexagon's make six 60° angles, so the hexagon's side equals r and the triangle's side is r√3. Then work from what's given (a perimeter, an area, a radius) to the length you need with the Pythagorean theorem or a special right triangle. Wrong answers usually use the radius where the diameter belongs, assume a chord equals the radius, or forget that both radii count toward a perimeter.",
      examples: [
        {
          q: "In the figure, O is the center of the circle, and points A and B lie on the circle. The measure of angle AOB is 110°.\n\nWhat is the value of x?",
          choices: ["70", "55", "35", "110"],
          answer: 2,
          explain:
            "OA and OB are both radii, so they're equal, and triangle AOB is isosceles: the angles at A and B, across from those equal sides, are equal. Together they take up 180 - 110 = 70°, so each one is 70/2 = 35°, and x = 35. 70 is both base angles together; it stops before splitting what's left evenly between A and B. 55 is half the central angle, which borrows the inscribed-angle rule, but no angle here has its vertex on the circle facing arc AB. 110 is the central angle itself, not the angle at A.",
          figure: {"kind": "geometry", "points": {"O": [0, 0], "A": [-4.0958, -2.8679], "B": [4.0958, -2.8679]}, "names": ["O", "A", "B"], "namePos": {"O": 90}, "dots": ["O"], "circles": [{"center": "O", "radius": 5}], "segments": [{"from": "O", "to": "A"}, {"from": "O", "to": "B"}, {"from": "A", "to": "B"}], "angles": [{"vertex": "O", "from": "A", "to": "B", "label": "110°"}, {"vertex": "A", "from": "O", "to": "B", "label": "x°"}]},
          difficulty: "easy",
          why: ["70 is both base angles together. Split it evenly between A and B: 35.", "55 is half of 110, the inscribed-angle rule. Here the angles at A and B share 180 − 110 = 70.", null, "110 is the angle at the center, O. x is the angle at A."],
        },
        {
          q: "In the figure, square ABCD is inscribed in a circle with center O. The radius of the circle is 3√2.\n\nWhat is the side length of the square?",
          choices: ["6", "3", "3√2", "6√2"],
          answer: 0,
          explain:
            "Every vertex of the square is on the circle, so a diagonal of the square, like AC, passes through the center and is a diameter: 2 × 3√2 = 6√2. A diagonal cuts the square into two 45-45-90 triangles, where the diagonal is a side times √2, so the side is 6√2/√2 = 6. 3 divides the radius by √2, treating the radius as if it were the whole diagonal. 3√2 assumes the side equals the radius. 6√2 is the diagonal (the diameter), not a side.",
          figure: {"kind": "geometry", "points": {"O": [0, 0], "A": [-3, 3], "B": [3, 3], "C": [3, -3], "D": [-3, -3]}, "names": ["A", "B", "C", "D", "O"], "namePos": {"O": 0}, "dots": ["O"], "circles": [{"center": "O", "radius": 4.242641}], "polygons": [{"points": ["A", "B", "C", "D"]}], "segments": [{"from": "A", "to": "C", "dashed": true}, {"from": "O", "to": "B", "label": "3√2"}]},
          difficulty: "easy",
          why: [null, "3 treats the radius as the diagonal. The diagonal is the diameter, 6√2, so the side is 6√2/√2 = 6.", "The side isn't the radius. The diagonal is the diameter, 6√2, and the side is 6√2/√2 = 6.", "6√2 is the diagonal, a diameter. A side is the diagonal divided by √2: 6."],
        },
        {
          q: "In the figure, O is the center of the circle, and points P and Q lie on the circle. The radius of the circle is 9, and the perimeter of triangle OPQ is 34.\n\nWhat is the length of PQ?",
          choices: ["25", "9", "18", "16"],
          answer: 3,
          explain:
            "OP and OQ are both radii, so each is 9. The perimeter adds all three sides: 9 + 9 + PQ = 34, so PQ = 34 - 18 = 16. 25 subtracts only one radius from the perimeter, forgetting that OQ is also 9. 9 assumes the chord equals the radius, which is true only when the angle at O is 60°. 18 is the diameter; a chord that doesn't pass through the center is shorter than that, and 9 + 9 + 18 would make the perimeter 36, not 34.",
          figure: {"kind": "geometry", "points": {"O": [0, 0], "P": [-8, -4.1231], "Q": [8, -4.1231]}, "names": ["O", "P", "Q"], "namePos": {"O": 90}, "dots": ["O"], "circles": [{"center": "O", "radius": 9}], "segments": [{"from": "O", "to": "P", "label": "9"}, {"from": "O", "to": "Q"}, {"from": "P", "to": "Q"}]},
          difficulty: "medium",
          why: ["25 subtracts only one radius. OQ is a radius too: 34 − 9 − 9 = 16.", "The chord equals the radius only when angle POQ is 60°. Use the perimeter: 34 − 18 = 16.", "18 is the diameter. PQ doesn't pass through O, and 9 + 9 + 18 would be 36, not 34.", null],
        },
        {
          q: "In the figure, an equilateral triangle ABC is inscribed in a circle with center O. The perimeter of the triangle is 36.\n\nWhat is the radius of the circle?",
          choices: ["12", "4√3", "6√3", "2√3"],
          answer: 1,
          explain:
            "Each side is 36/3 = 12. The radii to the three vertices split the 360° around O into three 120° angles. The perpendicular from O to side BC cuts BC in half (6 on each side) and splits that 120° angle into two 60° angles, making 30-60-90 triangles. In the one with hypotenuse OC, the 6 is opposite the 60° angle at O, so it's the long leg: x√3 = 6 gives x = 6/√3 = 2√3 for the short leg, and the hypotenuse, the radius, is 2x = 4√3. 12 assumes the side equals the radius, which is true for a regular hexagon, not a triangle. 6√3 is the triangle's height from A down to BC; the center sits only two-thirds of the way down it. 2√3 is the distance from the center to a side, not to a vertex.",
          figure: {"kind": "geometry", "points": {"O": [0, 0], "A": [0, 6.9282], "B": [-6, -3.4641], "C": [6, -3.4641], "M": [0, -3.4641]}, "names": ["A", "B", "C", "O"], "namePos": {"O": 180}, "dots": ["O"], "circles": [{"center": "O", "radius": 6.928203}], "polygons": [{"points": ["A", "B", "C"]}], "segments": [{"from": "O", "to": "C", "dashed": true}, {"from": "O", "to": "M", "dashed": true}], "angles": [{"vertex": "M", "from": "C", "to": "O", "right": true}]},
          difficulty: "medium",
          why: ["A side equals the radius in a regular hexagon, not a triangle. Here the radius is 12/√3 = 4√3.", null, "6√3 is the triangle's height. The center is only two-thirds of the way down it: 4√3.", "2√3 is the distance from the center to a side. The radius reaches a vertex: twice that, 4√3."],
        },
        {
          q: "A rectangle is inscribed in a circle, as shown. The length of the rectangle's diagonal is twice the length of its shorter side, and the area of the rectangle is 36√3 square units.\n\nWhat is the diameter of the circle, in units?",
          choices: ["6", "6√3", "12", "12√3"],
          answer: 2,
          explain:
            "Call the shorter side s, so the diagonal is 2s. The diagonal splits the rectangle into two right triangles with short leg s and hypotenuse 2s, which is a 30-60-90 triangle, so the longer side is s√3. The area is s × s√3 = s²√3 = 36√3, so s² = 36 and s = 6. The diagonal is 2s = 12, and because every vertex is on the circle, the diagonal is a diameter: 12. 6 is the shorter side (and the radius), not the diameter. 6√3 is the rectangle's longer side. 12√3 comes from solving s²√3 = 36√3 as s² = 108 instead of dividing both sides by √3.",
          figure: {"kind": "geometry", "points": {"O": [0, 0], "A": [-5.1962, 3], "B": [5.1962, 3], "C": [5.1962, -3], "D": [-5.1962, -3]}, "dots": ["O"], "circles": [{"center": "O", "radius": 6}], "polygons": [{"points": ["A", "B", "C", "D"]}], "segments": [{"from": "A", "to": "C", "dashed": true}], "angles": [{"vertex": "D", "from": "C", "to": "A", "right": true}, {"vertex": "B", "from": "A", "to": "C", "right": true}]},
          difficulty: "hard",
          why: ["6 is the shorter side, which also equals the radius. The diameter is the diagonal: 2 × 6 = 12.", "6√3 is the rectangle's longer side. The diameter is the diagonal, 12.", null, "Dividing s²√3 = 36√3 by √3 gives s² = 36, not 108. So s = 6 and the diagonal is 12."],
        },
      ],
      traps: [
        "Using the radius where the diameter belongs (or the reverse): an inscribed square's or rectangle's diagonal is the full diameter, 2r, not r.",
        "Forgetting that two sides of a center-and-chord triangle are both radii — for example, subtracting only one radius from a perimeter, or not making the two base angles equal.",
        "Assuming a chord equals the radius for any central angle. That's only true at 60°; at 90° the chord is r√2, and at 120° it's r√3.",
        "Mixing up the special-right-triangle ratios (√2 where √3 belongs, or the short leg where the hypotenuse belongs) when converting between a side of the figure and the radius.",
      ],
    },
  ],
  tipsAndTricks: [
    "In the circle equation (x-h)² + (y-k)² = r², a negative coordinate in the center flips the visible sign in the equation — double-check this specifically when the center has a negative x or y value.",
    "Both arc length and sector area follow the same 'fraction of the whole circle' logic: (central angle / 360°) times the full circumference or full area — you don't need two separate memorized formulas if you internalize this structure.",
    "A tangent line to a circle is always perpendicular to the radius drawn to the point of tangency — this fact alone unlocks many circle problems involving right angles.",
  ],
};

export const CURRICULUM: Section[] = [
  {
    section: "Reading and Writing",
    domains: [
      {
        domain: "Information and Ideas",
        subskills: [
          {
            id: "rw-central-ideas",
            name: "Central Ideas and Details",
            blurb: "Identify the main idea of a text and locate specific supporting details.",
            patterns: LC_RW_CENTRAL_IDEAS.patterns,
            tipsAndTricks: LC_RW_CENTRAL_IDEAS.tipsAndTricks,
          },
          {
            id: "rw-evidence",
            name: "Command of Evidence",
            blurb: "Choose the quotation, data point, or example that best supports a claim.",
            patterns: LC_RW_EVIDENCE.patterns,
            tipsAndTricks: LC_RW_EVIDENCE.tipsAndTricks,
          },
          {
            id: "rw-inferences",
            name: "Inferences",
            blurb: "Determine what logically follows from the text, especially in completion-style questions.",
            patterns: LC_RW_INFERENCES.patterns,
            tipsAndTricks: LC_RW_INFERENCES.tipsAndTricks,
          },
        ],
      },
      {
        domain: "Craft and Structure",
        subskills: [
          {
            id: "rw-words-context",
            name: "Words in Context",
            blurb: "Determine the most precise or logical word given surrounding context.",
            patterns: LC_RW_WORDS_CONTEXT.patterns,
            tipsAndTricks: LC_RW_WORDS_CONTEXT.tipsAndTricks,
          },
          {
            id: "rw-text-structure",
            name: "Text Structure and Purpose",
            blurb: "Explain the function of a sentence, phrase, or the passage as a whole.",
            patterns: LC_RW_TEXT_STRUCTURE.patterns,
            tipsAndTricks: LC_RW_TEXT_STRUCTURE.tipsAndTricks,
          },
          {
            id: "rw-cross-text",
            name: "Cross-Text Connections",
            blurb: "Compare and relate ideas or perspectives across two passages.",
            patterns: LC_RW_CROSS_TEXT.patterns,
            tipsAndTricks: LC_RW_CROSS_TEXT.tipsAndTricks,
          },
        ],
      },
      {
        domain: "Expression of Ideas",
        subskills: [
          {
            id: "rw-rhetorical-synthesis",
            name: "Rhetorical Synthesis",
            blurb: "Use bullet-point notes to accomplish a specific rhetorical goal.",
            patterns: LC_RW_RHETORICAL_SYNTHESIS.patterns,
            tipsAndTricks: LC_RW_RHETORICAL_SYNTHESIS.tipsAndTricks,
          },
          {
            id: "rw-transitions",
            name: "Transitions",
            blurb: "Choose the logical transition word or phrase connecting ideas.",
            patterns: LC_RW_TRANSITIONS.patterns,
            tipsAndTricks: LC_RW_TRANSITIONS.tipsAndTricks,
          },
        ],
      },
      {
        domain: "Standard English Conventions",
        subskills: [
          {
            id: "rw-boundaries",
            name: "Boundaries",
            blurb: "Punctuation options: commas, semicolons, colons, and sentence boundaries.",
            patterns: LC_RW_BOUNDARIES.patterns,
            tipsAndTricks: LC_RW_BOUNDARIES.tipsAndTricks,
          },
          {
            id: "rw-form-structure",
            name: "Form, Structure, and Sense",
            blurb: "Grammar and usage: verb agreement, pronouns, modifiers, parallel structure.",
            patterns: LC_RW_FORM_STRUCTURE.patterns,
            tipsAndTricks: LC_RW_FORM_STRUCTURE.tipsAndTricks,
          },
        ],
      },
    ],
  },
  {
    section: "Math",
    domains: [
      {
        domain: "Algebra",
        subskills: [
          {
            id: "m-linear-eq-1var",
            name: "Linear Equations in One Variable",
            blurb: "Create, interpret, and solve linear equations with one variable.",
            patterns: LC_M_LINEAR_EQ_1VAR.patterns,
            tipsAndTricks: LC_M_LINEAR_EQ_1VAR.tipsAndTricks,
          },
          {
            id: "m-linear-func",
            name: "Linear Functions",
            blurb: "Model relationships with linear functions; interpret rate of change and intercepts.",
            patterns: LC_M_LINEAR_FUNC.patterns,
            tipsAndTricks: LC_M_LINEAR_FUNC.tipsAndTricks,
          },
          {
            id: "m-linear-eq-2var",
            name: "Linear Equations in Two Variables",
            blurb: "Work with Ax + By = C; find slopes, parallel/perpendicular lines.",
            patterns: LC_M_LINEAR_EQ_2VAR.patterns,
            tipsAndTricks: LC_M_LINEAR_EQ_2VAR.tipsAndTricks,
          },
          {
            id: "m-systems",
            name: "Systems of Two Linear Equations",
            blurb: "Determine number of solutions; solve by substitution or elimination.",
            patterns: LC_M_SYSTEMS.patterns,
            tipsAndTricks: LC_M_SYSTEMS.tipsAndTricks,
          },
          {
            id: "m-linear-ineq",
            name: "Linear Inequalities",
            blurb: "Solve and interpret linear inequalities in one or two variables.",
            patterns: LC_M_LINEAR_INEQ.patterns,
            tipsAndTricks: LC_M_LINEAR_INEQ.tipsAndTricks,
          },
        ],
      },
      {
        domain: "Advanced Math",
        subskills: [
          {
            id: "m-equiv-expr",
            name: "Equivalent Expressions",
            blurb: "Factor, expand, and rewrite polynomial and rational expressions.",
            patterns: LC_M_EQUIV_EXPR.patterns,
            tipsAndTricks: LC_M_EQUIV_EXPR.tipsAndTricks,
          },
          {
            id: "m-nonlinear-eq",
            name: "Nonlinear Equations and Systems",
            blurb: "Solve quadratic, radical, rational, and polynomial equations.",
            patterns: LC_M_NONLINEAR_EQ.patterns,
            tipsAndTricks: LC_M_NONLINEAR_EQ.tipsAndTricks,
          },
          {
            id: "m-nonlinear-func",
            name: "Nonlinear Functions",
            blurb: "Model and interpret quadratic and exponential functions.",
            patterns: LC_M_NONLINEAR_FUNC.patterns,
            tipsAndTricks: LC_M_NONLINEAR_FUNC.tipsAndTricks,
          },
        ],
      },
      {
        domain: "Problem-Solving and Data Analysis",
        subskills: [
          {
            id: "m-ratios-rates",
            name: "Ratios, Rates, Proportions, and Units",
            blurb: "Solve using proportional relationships, rates, and unit conversion.",
            patterns: LC_M_RATIOS_RATES.patterns,
            tipsAndTricks: LC_M_RATIOS_RATES.tipsAndTricks,
          },
          {
            id: "m-percentages",
            name: "Percentages",
            blurb: "Solve percent problems: discounts, interest, tax, tips, percent change.",
            patterns: LC_M_PERCENTAGES.patterns,
            tipsAndTricks: LC_M_PERCENTAGES.tipsAndTricks,
          },
          {
            id: "m-one-var-data",
            name: "One-Variable Data",
            blurb: "Interpret distributions: mean, median, spread, and outliers.",
            patterns: LC_M_ONE_VAR_DATA.patterns,
            tipsAndTricks: LC_M_ONE_VAR_DATA.tipsAndTricks,
          },
          {
            id: "m-two-var-data",
            name: "Two-Variable Data",
            blurb: "Analyze scatterplots; fit linear, quadratic, and exponential models.",
            patterns: LC_M_TWO_VAR_DATA.patterns,
            tipsAndTricks: LC_M_TWO_VAR_DATA.tipsAndTricks,
          },
          {
            id: "m-probability",
            name: "Probability and Conditional Probability",
            blurb: "Calculate probability using tables, area models, or descriptions.",
            patterns: LC_M_PROBABILITY.patterns,
            tipsAndTricks: LC_M_PROBABILITY.tipsAndTricks,
          },
          {
            id: "m-inference",
            name: "Inference from Sample Statistics",
            blurb: "Use sample statistics to estimate population parameters; interpret margin of error.",
            patterns: LC_M_INFERENCE.patterns,
            tipsAndTricks: LC_M_INFERENCE.tipsAndTricks,
          },
          {
            id: "m-statistical-claims",
            name: "Evaluating Statistical Claims",
            blurb: "Determine if a study supports causation vs. correlation; evaluate sampling methods.",
            patterns: LC_M_STATISTICAL_CLAIMS.patterns,
            tipsAndTricks: LC_M_STATISTICAL_CLAIMS.tipsAndTricks,
          },
        ],
      },
      {
        domain: "Geometry and Trigonometry",
        subskills: [
          {
            id: "m-area-volume",
            name: "Area and Volume",
            blurb: "Solve problems involving area, perimeter, surface area, and volume.",
            patterns: LC_M_AREA_VOLUME.patterns,
            tipsAndTricks: LC_M_AREA_VOLUME.tipsAndTricks,
          },
          {
            id: "m-lines-angles-tri",
            name: "Lines, Angles, and Triangles",
            blurb: "Apply theorems on congruence, similarity, and parallel lines cut by a transversal.",
            patterns: LC_M_LINES_ANGLES_TRI.patterns,
            tipsAndTricks: LC_M_LINES_ANGLES_TRI.tipsAndTricks,
          },
          {
            id: "m-right-tri-trig",
            name: "Right Triangles and Trigonometry",
            blurb: "Use the Pythagorean theorem, special right triangles, and sine/cosine/tangent.",
            patterns: LC_M_RIGHT_TRI_TRIG.patterns,
            tipsAndTricks: LC_M_RIGHT_TRI_TRIG.tipsAndTricks,
          },
          {
            id: "m-circles",
            name: "Circles",
            blurb: "Apply circle theorems: radii, tangents, arcs, sectors, and equations of circles.",
            patterns: LC_M_CIRCLES.patterns,
            tipsAndTricks: LC_M_CIRCLES.tipsAndTricks,
          },
        ],
      },
    ],
  },
];

// Flattened lookup list used across the app.
export const ALL_SUBSKILLS: Subskill[] = CURRICULUM.flatMap((sec) =>
  sec.domains.flatMap((d) =>
    d.subskills.map((s) => ({ ...s, domain: d.domain, section: sec.section }))
  )
);

export function getSubskill(id: string): Subskill | undefined {
  return ALL_SUBSKILLS.find((s) => s.id === id);
}

// The 8 official College Board score-report domains (4 per section), used
// as the subject-breakdown categories on the practice-test analysis page.
export const ALL_DOMAINS: { domain: string; section: string }[] = CURRICULUM.flatMap((sec) =>
  sec.domains.map((d) => ({ domain: d.domain, section: sec.section }))
);

// Study plan: every subskill spread evenly across the course, with the 8
// official full-length practice tests spaced throughout the whole timeline
// (not clustered at the end) so testing tracks progress as it happens. A
// week can carry subskills, a practice test, or (usually) both.
export interface PlanWeek {
  week: number;
  subskillIds: string[];
  testNumbers: number[]; // which of the 8 full-length tests (1-8) land this week, if any
}

export const SUBSKILL_WEEK_COUNT = 23;
export const FULLTEST_WEEK_COUNT = 3;
export const STUDY_PLAN_WEEK_COUNT = SUBSKILL_WEEK_COUNT + FULLTEST_WEEK_COUNT;
export const NUM_FULL_LENGTH_TESTS = 8;

/**
 * Builds a study plan of `totalWeeks` weeks.
 *
 * The 8 full-length practice tests are placed at even fractions of the
 * course (1/9, 2/9, ... 8/9 through), so the first test comes only after
 * some real content is covered, later tests land further apart in absolute
 * terms on a longer timeline and closer together on a short one, and the
 * final test always lands on the very last week -- a capstone right before
 * the real SAT. The last week is reserved for that final test plus review,
 * with no brand-new material, matching the usual advice not to cram new
 * content the day before the exam.
 *
 * All 29 subskills are spread evenly across the remaining weeks (a week may
 * get more than one if the count doesn't divide evenly). A week that also
 * hosts a practice test still gets subskills -- see buildDayPlan, which
 * fits both into the week's 7 days.
 *
 * `subskillOrder`, when given, replaces the default curriculum-authoring
 * order those subskills get scheduled in -- see
 * lib/mastery.ts's orderSubskillsByWeakness, which produces a weakest-
 * domains-first ordering from a student's actual practice-test and quiz
 * performance so the plan spends more of a student's *remaining* time on
 * what they're worst at, not just marching through the syllabus in a
 * fixed sequence regardless of how it's going. Must be a permutation of
 * ALL_SUBSKILLS' own ids -- same set, just reordered -- since this
 * function's whole guarantee is that every subskill gets scheduled
 * exactly once; omit it to get the original authored order (also what
 * every call site got before this parameter existed).
 */
export function buildStudyPlan(totalWeeks: number = STUDY_PLAN_WEEK_COUNT, subskillOrder?: string[]): PlanWeek[] {
  const safeTotalWeeks = Math.max(2, Math.round(totalWeeks));
  const contentWeeks = Math.max(1, safeTotalWeeks - 1);

  const testsByWeek = new Map<number, number[]>();
  for (let t = 1; t <= NUM_FULL_LENGTH_TESTS; t++) {
    const w = Math.max(1, Math.min(safeTotalWeeks, Math.round((t / NUM_FULL_LENGTH_TESTS) * safeTotalWeeks)));
    testsByWeek.set(w, [...(testsByWeek.get(w) ?? []), t]);
  }

  const order = subskillOrder ?? ALL_SUBSKILLS.map((s) => s.id);
  const weeks: PlanWeek[] = [];
  let i = 0;
  for (let w = 1; w <= contentWeeks; w++) {
    // Spread any remainder across the earliest weeks so every subskill in
    // ALL_SUBSKILLS ends up scheduled, even when its length isn't a clean
    // multiple of contentWeeks.
    const remainingWeeks = contentWeeks - w + 1;
    const remainingSubskills = order.length - i;
    const count = remainingSubskills > 0 ? Math.ceil(remainingSubskills / remainingWeeks) : 0;
    weeks.push({ week: w, subskillIds: order.slice(i, i + count), testNumbers: testsByWeek.get(w) ?? [] });
    i += count;
  }
  if (safeTotalWeeks > contentWeeks) {
    weeks.push({ week: safeTotalWeeks, subskillIds: [], testNumbers: testsByWeek.get(safeTotalWeeks) ?? [] });
  }
  return weeks;
}

export const STUDY_PLAN = buildStudyPlan();
