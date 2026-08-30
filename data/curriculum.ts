// Curriculum structure based on the official SAT Suite Question Bank
// domains and skills (College Board), current as of the 2025-2026 digital SAT.
// Source: satsuite.collegeboard.org/practice/student-question-bank

import type { DiagramSpec } from "@/lib/diagramTypes";

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
  // For RW passage-based questions that reference one specific sentence
  // (e.g. "the underlined sentence") -- the exact substring of `q`, as it
  // literally appears there, to render underlined so the student sees it
  // highlighted directly in the passage rather than having to relocate it.
  underline?: string;
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
        "These questions ask what the whole passage is really about. The trap: the main idea is almost never stated in the first sentence — you have to piece it together from the whole passage. After reading, ask yourself: 'If I could keep only one sentence, which one explains why all the others exist?' The right answer covers the whole passage, not just one part of it. It also shouldn't be so broad that it could describe a totally different passage. Wrong answers are usually too narrow (about just one detail) or too broad (vague and generic).",
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
            "The passage's whole arc is a revision: from believing temperature was the main threat, to finding genetic diversity determines survival, ending in a policy recommendation built on that finding. Choice A restates the original, now-revised belief. C is generic enough to describe almost any conservation passage without engaging the study's specific finding. D is a true but trivial detail (how long they studied), not the passage's point. B is the only choice that captures both the finding and the stakes the final sentence signals.",
          difficulty: "easy",
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
            "Nothing states a conclusion outright, so build it from what changes across the passage: presented as beautification, but paragraph two reveals a measurable food-access benefit, and paragraph three shows other institutions responding to that practical benefit, not the visual one. A covers only the setup. B is a downstream detail. D overstates scope — only participating families, not most families citywide — and is a supporting fact rather than the throughline. C is the only choice capturing the shift from framing to actual impact.",
          difficulty: "medium",
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
            "Track the shift: technical training, then dismissed as a break from it, then later understood as an extension of it. A is tempting because it's true, but it's generic enough to fit thousands of passages and ignores the specific misunderstanding this one describes. C invents a comparison the text never makes. D adds a claim ('her best work') the passage doesn't support — historians recognized structural continuity, not superiority. B is the only choice with both required pieces: what was misunderstood, and that it was later corrected.",
          difficulty: "hard",
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
            "The passage tracks two outcomes for one project — a financial one (under budget) and an economic one (more customers) — and the main idea has to capture both, not just one. D reports only the budget half. B reports the initial mixed reaction, a detail from the opening, not the passage's point. C generalizes beyond what this passage actually supports. A is the only choice combining both outcomes into the passage's real claim.",
          difficulty: "easy",
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
            "The passage moves from decline, to a deliberate adaptation-over-restoration decision, to a record-attendance outcome, and ties the outcome to the decision. B states the outcome but not the reasoning that makes it the passage's actual point. A misreads facade preservation as a limitation rather than a deliberate choice. D stretches one theater's result into a claim about historic theaters generally, which the passage never argues. C is the only choice linking the specific decision to the specific result.",
          difficulty: "medium",
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
        "These questions ask what the text directly states, or reports, about one specific fact, number, finding, or reason — not the whole passage's point, just one piece of it accurately restated. The stems vary: 'According to the text, what is true about X?' 'Why does X believe Y?' 'What did the study find?' 'Which question does the text most directly attempt to answer?' The method is the same regardless of phrasing: locate the exact sentence(s) answering the question, then pick the choice matching what's actually said — no outside knowledge, no reversed direction, and no overstating a modest finding into a stronger one.",
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
            "Locate the exact sentence answering 'what did she find' — the return count, 34 of 40. C describes what she did (tagged turtles), not what she found. D reports the number that did NOT return (40 minus 34), a classic swapped-number trap. B overstates the finding to 'all,' which the passage doesn't say. A restates the finding exactly, without adding or reversing anything.",
          difficulty: "easy",
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
            "Locate the sentence describing the 2019 change specifically: plastics were added. A reverses the facts — paper and glass remained accepted, nothing was removed. D misattributes the original materials to the 2019 change. C invents an event the passage never mentions. B is the only choice matching exactly what changed and when.",
          difficulty: "easy",
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
            "The text gives one specific, stated reason for concern: slowing growth, tied to deer grazing on saplings. D overstates 'slowing' into 'stopped entirely' — a common trap where a moderate finding gets pushed into an absolute one. B and C both invent causes and vulnerabilities the text never mentions. A is the only choice restating the actual reason given, at the actual degree the text supports.",
          difficulty: "medium",
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
            "The question asks specifically for the before value. Choice A reports the after value (6.2 years) — swapping the two time periods is the main trap built into this question. C reverses the direction entirely (the median fell, not rose). D denies that any change occurred, which contradicts the passage. B is the only choice reporting the correct number for the correct time period.",
          difficulty: "medium",
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
            "The text explains where the greeting came from and notes that it has outlasted the economic conditions that originally made it useful — together, that's an explanation for why it persisted. A, C, and D are all questions a reader might reasonably have, but none of them is addressed anywhere in the text: no count of other towns, no date for the economic shift, no mention of visitors' comprehension. B is the only question the passage actually answers.",
          difficulty: "hard",
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
            "The text states she has already run through her opening line so many times the words 'started to lose their shape,' and that her hands keep restlessly refolding themselves — repetition plus a physical sign of nerves. A misreads 'said it so many times' as revising it; she's repeating the same line, not changing it. C and D both describe actions the text never depicts. B is the only choice matching both details the text actually gives.",
          difficulty: "easy",
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
            "He tells no one, including his own wife, and shuts down the topic with a brief, deflecting answer before changing the subject — all signs of someone who doesn't want the act discussed. A is directly contradicted: avoiding mention of it is the opposite of wanting recognition. B describes a pattern the text never establishes; this is one instance. D misreads a short, matter-of-fact reply as disapproval, which the text doesn't support. C is the only choice matching his actual behavior.",
          difficulty: "easy",
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
            "The final lines state directly that beneath what's visibly pruned, 'growth continues, quiet, unconsoled' — unseen, but not absent. A directly contradicts 'continues.' C overreaches: the poem never claims growth always escapes its container, only that it persists internally. D isn't supported; no damage to the pot is described anywhere. B is the only choice matching what the poem actually states about the unseen growth.",
          difficulty: "medium",
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
            "The text explicitly rules out both A and D — her silence 'proceeded from neither cause,' meaning neither shyness nor dullness explains it. It states instead that she has quietly detected something dishonest in Halloway and has deliberately chosen to watch rather than speak 'for the present.' B invents a reason (finances) the text never mentions; her judgment concerns his truthfulness, not his wealth. C is the only choice matching what the text directly states about her silence.",
          difficulty: "medium",
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
            "She hesitates in the doorway for 'a long moment' and has to make herself walk in — both signal a reaction strong enough to slow her down, without the text stating exactly what that reaction is. A invents a feeling (gratitude) never mentioned. C isn't supported; nothing in the text reads as complaint. D is directly undercut by the pause and the effort it takes her to enter — that's the opposite of no response. B is the only choice matching the hesitation the text actually depicts, without overstating what emotion is behind it.",
          difficulty: "hard",
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
        "These questions ask what can reasonably be concluded from the text, even though the conclusion itself is never stated outright — 'based on the text, what can be concluded,' 'what does the text most strongly suggest,' or 'what would most likely have been true if X hadn't happened.' This differs from pure detail retrieval: instead of restating one stated fact, you connect two or more stated facts (or a stated fact and its logical consequence) into a conclusion the text supports without spelling out. The right answer follows necessarily, or very nearly necessarily, from what's given — not just plausibly. Wrong answers typically add outside information, overstate the conclusion's certainty, or invert which fact caused which effect.",
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
            "The 91% figure shows strong approval among people who actually tried the program, while the 12% figure shows that few residents have tried it at all — two separate facts that combine into a specific, supported conclusion. A conflates low usage with dislike, but the text gives no information about what non-users think. C invents a future outcome never suggested by the text. D invents a reason (cost) that's never mentioned. B is the only choice that follows from both given figures without adding anything.",
          difficulty: "easy",
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
            "Fewer bags used, combined with a steady customer count, points to existing customers switching their own behavior — not to more people showing up. A is directly contradicted: customer count 'stayed about the same,' not increased. C and D both introduce financial claims the text never addresses at all. B is the only conclusion that follows from the two stated facts.",
          difficulty: "easy",
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
            "The tools are what raised weekly output from about three chairs to about nine; without them, that constraint on output would remain. A is wrong because hand-finishing — the step that actually preserves quality — continued even after the tools were introduced, so quality isn't what the tools changed. C inverts the text: hand-finishing is exactly what stayed the same, tools or not. D invents a pricing response never discussed. B is the only choice following directly from the stated cause of the output increase.",
          difficulty: "medium",
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
            "The schedule applied 'regardless of visible wear' because testing individual condition was too costly — meaning it tracked age, not actual condition — and the sensor data confirms this by showing some cables safely outlasting the schedule by years. B misreads the reasoning: the fixed schedule was a workaround for the cost of testing, not a cost-reduction goal in itself. C overstates the finding into a safety verdict the text never makes; some cables lasting longer doesn't mean the schedule was unsafe. D goes beyond what the text describes about un-sensored bridges. A is the only choice following directly from what the text establishes about the schedule's basis.",
          difficulty: "medium",
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
            "Without the genetic test, the faster growth could be explained by a pre-existing genetic difference between the two groups rather than by the environment itself; confirming genetic identity closes off that alternative explanation and strengthens the water-speed conclusion specifically. A overstates the finding into 'permanent adaptation,' which the identical genetics actually argue against — no genetic change occurred at all. C and D both invent claims about genetic diversity the text never addresses; the test showed sameness between two groups, not diversity within the species. B is the only choice describing the test's actual logical role.",
          difficulty: "hard",
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
        "This is the most common Command of Evidence pattern: you're given a claim and asked which choice provides the strongest factual support. The winning answer is almost always the one with the most specific, directly relevant number or fact — not just the choice that's 'related' to the topic. Fast filter: cross out any choice that's a general statement about the topic (those are bait). Keep only choices with a specific measurement, comparison, or named data point.",
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
            "What would actually prove this claim is a number about congestion — like commute times — tied to the bike lanes. The cost figure is a real, specific number, but it measures spending, not congestion, so it never touches the actual claim. The mileage figure measures the network's size, not its effect. The safety-feeling choice reports a feeling, not a traffic measurement. Only the commute-time statistic directly measures the claimed outcome.",
          difficulty: "medium",
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
            "The claim is specifically about litter decreasing, not about parks in general. The attendance figure is tempting — it's specific, about the same parks and campaign, and 'increased' sounds like good news — but it says nothing about litter, and more visitors could just as easily mean more litter. The poster-awareness figure measures whether people saw the campaign, not whether behavior changed. The activities list describes the campaign's methods, not its effect. Only the litter-count figure measures the right variable in the right direction.",
          difficulty: "hard",
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
            "The claim is about an increase caused by the campaign specifically after it launched. The pre-campaign decline is tempting — it's specific and about the exact topic — but it describes the opposite direction, before the campaign even started, so it can't support a claim about the campaign's effect. The advertising-channels and general-trust choices don't measure vaccination rates at all. Only the post-campaign rate increase measures the right variable, in the right direction, during the right time period.",
          difficulty: "hard",
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
        "This is a harder Command of Evidence pattern, used for causal claims. Here, the best evidence isn't just a supporting number — it's a comparison that rules out some other explanation. Look for a control group, a similar-but-different comparison case, or a 'before vs. after' setup with a comparison group. You'll know this pattern applies when the claim uses causal language like 'caused' or 'led to,' not just descriptive language like 'is associated with.'",
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
            "This is a causal claim — reduced because of the program, not just 'car trips went down around the same time.' The plain 12%-drop figure alone doesn't rule out other explanations like gas prices or weather that could affect any city that year. The fleet-size and enjoyment figures don't measure car trips at all. Only the first choice reports that same drop while also showing a comparable city without the program saw no such drop, ruling out those other explanations.",
          difficulty: "easy",
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
            "This is a causal claim again — reduced because of the training, not just that injuries happened to drop around the same time. The plain 18%-drop figure alone doesn't rule out something like a slower production period needing less equipment use. The session-length and helpfulness-rating choices don't measure injuries at all. Only the sister-factory comparison rules out a company-wide explanation like a slowdown, by showing a similar factory without the training saw no meaningful change.",
          difficulty: "medium",
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
            "This is a causal claim — reduced because families joined, not just 'spending went down around the same time.' The plain 15%-decline figure doesn't rule out something like a general drop in food prices that year. The seeds-and-tools and hobby-enjoyment choices don't measure grocery spending. Only the first choice adds a comparison group of similar families who didn't join, ruling out that kind of alternative explanation.",
          difficulty: "easy",
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
            "The claim is that mentorship, not pre-existing ambition, drove the promotions. The first choice's comparison group — employees who never applied — likely differs in ambition from the start, so it doesn't rule out that alternative explanation. The pairing-description and confidence-survey choices don't measure promotions. The second choice's comparison group applied but wasn't matched only due to limited availability, meaning both groups share the same ambition level and only the mentor-matching differed — that's the comparison that actually controls for the variable that matters.",
          difficulty: "medium",
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
            "The claim is specifically about output per hour, caused by the schedule change. The stress-survey choice is tempting — less stress could plausibly raise output — but it never actually measures output. The plain 9%-rise figure and the hours-reduction fact don't rule out an industry-wide trend that year. Only the second choice directly measures output while also ruling out that alternative, using a similar company that kept a five-day week as a comparison.",
          difficulty: "hard",
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
        "Many Command of Evidence questions hand you a graph or table directly, then ask one of two things: to complete a statement using the data ('which choice most effectively uses data from the graph to complete the text'), or to identify which choice describes data that supports or weakens a stated conclusion. There's no trick beyond careful, literal reading: find the exact category, time period, or comparison the question asks about, and check every number and label in each answer choice against the data — not just the first choice that looks plausible. Wrong answers are built by swapping a category, a time period, a direction, or a single digit from the real data, or by citing real numbers that don't actually address what the question is asking.",
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
            "Q3 (4.8) is lower than Q2 (5.1) — a slight fall — and Q4 (6.3) is higher again — a rise. 'Fell in every quarter' overstates that one dip into a full decline through year's end. 'Remained flat' ignores that the values changed at all. 'Rose in every quarter' ignores the Q3 dip entirely.",
          difficulty: "easy",
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
            "The conclusion is causal — the app specifically drove the improvement — so the strongest support is the size of Chain A's rise (19 points) compared to Chain B's much smaller rise (3 points) without an app, ruling out a general trend affecting both chains equally. Comparing the two chains' raw scores at a single point in time doesn't address which company changed more. Noting that 'both increased' actually undercuts the app's unique effect, since Chain B improved too without one.",
          difficulty: "medium",
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
            "If parks without any new fountains saw almost the same percentage increase, that points to some other citywide factor — like weather or a general rise in park use — driving attendance up everywhere, not the fountains specifically, which weakens the causal claim. The pre-existing attendance gap and the raw increase at the fountain parks are both true but don't address whether the fountains specifically caused the rise. The fountain-count detail is background information, not evidence either way.",
          difficulty: "medium",
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
            "The claim is specifically about variation — which commute type's rate swings more across the three neighborhoods — so the relevant comparison is each variable's range: transit spans 28 points (12% to 40%) while car spans only 7 points (55% to 62%), directly supporting the claim that transit use varies more. The second choice reports the identical two numbers but swaps which variable they belong to, which would actually support the opposite conclusion. The Neighborhood Z choice and the car-is-most-common choice are both true statements, but each describes a single data point or a consistent pattern rather than the spread across neighborhoods the claim is actually about.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Citing real numbers from the graph or table that don't actually address what the question is asking (the right city, but the wrong statistic; the right trend, but the wrong time period).",
        "Reporting two real values but swapping which category or variable each one belongs to, which can flip a supporting statement into its opposite.",
        "Overstating what the data shows — a single dip becomes 'fell every quarter,' or a modest gap becomes framed as if it were the entire story.",
      ],
    },
    {
      name: "Selecting the Best Supporting Quotation",
      explanation:
        "This Command of Evidence pattern applies to literary texts, poems, and passages about a historian's or researcher's work. You're given a claim — about a character's feeling, an author's style, a poem's theme, or a scholar's finding — and asked which quotation best supports or illustrates it. There's no data to weigh here. Instead: figure out exactly what quality, emotion, or specific point the claim names, then find the quotation that embodies that specific thing — not just one that mentions the same character, scene, or general topic.",
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
            "The claim names a specific emotion — relief, after a long ordeal. The gulls quotation shows disbelief and tension, not relief. The sunrise-count and sail-trimming quotations are neutral descriptions with no emotional content at all. Only the second quotation shows the physical release of built-up tension — buckled knees, a broken laugh — capturing the emotional release itself.",
          difficulty: "easy",
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
            "The claim names a specific, understated emotion — quiet pride, not loud celebration. The announcement quotation shows pride, but loudly, which doesn't match the claim's specific wording. The doubt quotation shows uncertainty, not pride. The hours-spent quotation is a neutral fact with no emotional content. Only the second quotation shows restrained, private satisfaction — silently smoothing the seam by the window — matching 'quiet' precisely.",
          difficulty: "easy",
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
            "The claim is specific: rooftops are chosen deliberately to keep hives away from pedestrians. The first quotation mentions rooftop experience generally but never states a reason for the choice. The second describes a personal feeling unrelated to location. The fourth describes a general trend in rooftop gardening, not a reason for hive placement. Only the third quotation directly states the beekeeper's actual motivation — distance from pedestrians — matching the claim exactly.",
          difficulty: "medium",
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
        "These questions describe a hypothesis or claim, then ask which new fact — one not already in the passage — would most strengthen it, or, just as often, most weaken it. There's no graph to read, and none of the choices are real quotes; they're all hypothetical findings you're judging for logical fit. The method: turn the hypothesis into a prediction ('if this is true, we'd expect to see ___'), then pick the choice that matches that prediction exactly. For a 'weaken' question, pick the choice that reports the opposite of that prediction, or that shows the same outcome would have happened anyway, without the supposed cause.",
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
        },
      ],
      traps: [
        "Choosing the most dramatic or interesting-sounding completion rather than the most logically necessary one.",
        "Choosing an answer that requires assuming something not stated (e.g., that the lab has unlimited funding, or that other labs already tried to replicate it).",
      ],
    },
    {
      name: "Multi-Step and Conditional Inferences",
      explanation:
        "Some of the hardest Inferences questions don't ask you to extend a single stated fact — they ask you to combine two or more stated facts into one conclusion, rule out a competing explanation the text has quietly set up, or reason forward from a stated hypothesis as if it's true ('assuming this view is correct...', 'if these findings are valid...'). The method is the same discipline as basic completion, just with more moving parts: track each fact separately, notice what a second or third fact rules in or out, and accept any stated premise as true for the purposes of the question, even if it's phrased as someone's belief or assumption. As always, the correct completion is the narrowest one the combined facts actually support — not a sweeping generalization.",
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
        },
      ],
      traps: [
        "Using only the passage's first fact and ignoring a second fact that changes or complicates the picture.",
        "Treating a stated hypothesis or assumption ('if this view is correct...', 'assuming this analysis is accurate...') as something to question, rather than accepting it as true and reasoning forward from it.",
        "Picking a conclusion that resolves only part of the tension between two facts, instead of the choice that accounts for both.",
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
        "You're given a sentence with a blank and four choices that all mean roughly the same thing — but only one fits this sentence's exact tone and logic. The trap: picking the most common synonym instead of the most precise one. Fix: cover the choices, read the sentence, and guess your own word first (often something simple, like 'strict'). Then pick the choice closest to your guess — not the fanciest-sounding option.",
      examples: [
        {
          q: "The committee's ______ approach to spending drew criticism from departments hoping for expanded budgets. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["generous", "austere", "confusing", "enthusiastic"],
          answer: 1,
          explain:
            "Predict your own word first: something like 'strict' or 'tight-fisted,' since departments wanted more money and are unhappy. 'Generous' is the opposite of what's needed — departments wouldn't be upset by generosity. 'Confusing' and 'enthusiastic' don't match the criticism described at all. 'Austere' precisely matches strict, minimal spending, consistent with departments being unhappy about it.",
          difficulty: "easy",
        },
        {
          q: "The negotiator's ______ tone put both sides at ease during an otherwise tense meeting. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["diplomatic", "conciliatory", "formal", "assertive"],
          answer: 1,
          explain:
            "Predict your own word first: something like 'calming' or 'soothing,' since the tone is what put both sides at ease. 'Diplomatic' is tempting since it sounds similar, but it just means tactful — a diplomatic tone could still leave real tension in the room. 'Formal' and 'assertive' don't match an easing effect at all. 'Conciliatory' specifically means aimed at reducing conflict, the actual effect the sentence describes.",
          difficulty: "medium",
        },
        {
          q: "The professor's ______ feedback left little room for misinterpretation, since every point was stated in exact, unambiguous terms. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["brief", "harsh", "explicit", "generous"],
          answer: 2,
          explain:
            "Predict your own word first: something like 'clear' or 'precise,' since the feedback left no room for misinterpretation. 'Brief' only describes length — short feedback could still be vague, so it doesn't guarantee the described precision. 'Harsh' and 'generous' describe tone, not clarity. 'Explicit' precisely matches 'stated in exact, unambiguous terms.'",
          difficulty: "easy",
        },
        {
          q: "Rather than adopting the committee's plan outright, the director chose to ______ several of its individual provisions, discarding the rest. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["endorse", "salvage", "ratify", "overturn"],
          answer: 1,
          explain:
            "Predict your own word first: something like 'keep only some parts of,' since the plan wasn't adopted outright and the rest was discarded. 'Endorse' and 'ratify' both imply approving something as a whole, which doesn't match 'several... provisions' being kept while 'the rest' is discarded. 'Overturn' means to reject — the opposite direction. 'Salvage' precisely captures retaining select useful parts from something otherwise not adopted.",
          difficulty: "medium",
        },
        {
          q: "The panel's final report ran to nearly two hundred pages, cataloguing every one of the agency's oversight failures in methodical, exhaustive detail. Though the report was ______ in its criticism of the agency's failures, it stopped short of recommending anyone's removal. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["scathing", "exhaustive", "muted", "premature"],
          answer: 1,
          explain:
            "Predict your own word first: something like 'thorough' or 'detailed,' since the earlier context specifies the report cataloged failures thoroughly, not necessarily with a harsh tone. 'Scathing' is a very tempting choice, since it also describes strong criticism, but it specifically implies a harsh, biting tone the context never establishes. 'Muted' and 'premature' both contradict the thoroughness described. 'Exhaustive' matches the specific quality described — thorough coverage — without importing an assumption about tone.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Choosing a word that's a synonym for a different, more common meaning of the word rather than the meaning that fits this sentence.",
        "Choosing the answer that sounds most sophisticated rather than the one that's actually most logically precise.",
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
            "The context establishes the argument was brief and well-reasoned, not weak. 'Flawed,' 'irrelevant,' and 'confusing' would all describe a genuinely poor argument, contradicting the established context. 'Sound' — meaning logically valid and well-reasoned, not its more common everyday sense — fits precisely: the argument was logically solid but still didn't address the panel's specific concern.",
          difficulty: "easy",
        },
        {
          q: "The critic ultimately recommended the film, but not before spending three paragraphs detailing its uneven pacing and underwritten supporting characters. The critic's review was surprisingly ______ for a film so widely praised elsewhere. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["glowing", "qualified", "dismissive", "brief"],
          answer: 1,
          explain:
            "'Glowing' and 'dismissive' describe reactions more extreme than what's described — recommending with real flaws noted. 'Brief' doesn't capture the sentence's contrast with the film's wide praise elsewhere. 'Qualified' most commonly means having the right credentials, a meaning that makes no sense next to 'review' — but its secondary meaning, praise held back by reservations, fits precisely: the critic recommended the film while still noting real flaws.",
          difficulty: "medium",
        },
        {
          q: "Political opponents who disagreed with nearly everything else the senator stood for still privately admitted her closing argument was tightly constructed and genuinely persuasive. Even her harshest critics conceded that the senator's closing argument was ______. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["arresting", "controversial", "predictable", "lengthy"],
          answer: 0,
          explain:
            "The most familiar meaning of 'arresting' involves police taking someone into custody, obviously not applicable here, which makes it tempting to cross off entirely. That's exactly the trap: 'arresting' also means strikingly impressive, attention-grabbing, with no connection to law enforcement at all. 'Controversial,' 'predictable,' and 'lengthy' don't match critics conceding the argument's quality. Since even critics who disagreed with her still admitted the argument was persuasive and well-constructed, 'arresting' in this second sense fits precisely.",
          difficulty: "hard",
        },
        {
          q: "Nothing in the passage suggests a committee's move was morally wrong, only strategic. The committee's decision to postpone the vote was widely seen as a ______ move, buying time until public opinion shifted. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["reckless", "politic", "accidental", "unanimous"],
          answer: 1,
          explain:
            "'Reckless' and 'accidental' both contradict a deliberate, strategic decision, and 'unanimous' describes how a vote was decided, not the quality of the move itself. 'Politic' looks like it just means 'related to politics' at first glance, especially in a sentence already about a committee vote, but used this way it actually has a distinct, less common meaning: shrewd, sensible, strategically wise — which fits 'buying time until public opinion shifted' precisely.",
          difficulty: "easy",
        },
        {
          q: "This sentence describes exceptional sensory precision, not a specific food preference. The chef's ______ palate could distinguish a dish seasoned moments ago from one that had rested for ten minutes. Which choice completes the text with the most logical and precise word or phrase?",
          choices: ["discriminating", "biased", "simple", "cautious"],
          answer: 0,
          explain:
            "'Biased' imports an unfair, negative meaning that has nothing to do with tasting food, and 'simple' and 'cautious' both contradict the exceptional precision described. 'Discriminating' most commonly triggers today's association with unfair bias, but its classic, still-valid meaning — having refined judgment, able to make fine distinctions — exactly matches a palate that can tell moments-ago seasoning from ten-minutes-rested seasoning.",
          difficulty: "medium",
        },
      ],
      traps: [
        "Assuming a word's most familiar meaning applies, when the sentence is actually using a specialized or secondary definition.",
        "Overlooking context clues elsewhere in the sentence (or in surrounding sentences) that clarify which meaning is intended.",
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
            "If this sentence were deleted, the passage would seem to claim narrow streets are unconditionally safer, with no nuance. Its function is to complicate or qualify the main claim, not contradict it entirely — it adds a condition (sightlines) under which the benefit doesn't hold. Choice B overstates this as a full reversal, C misreads it as supporting rather than qualifying, and D ignores that it's directly tied to the main claim.",
          difficulty: "easy",
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
            "If deleted, the passage would read as if the switch benefited everyone the same way, with no exceptions. Its job is to complicate that uniform picture by pointing out one specific group the change didn't help, not to argue the whole policy was a mistake, which A overstates. C introduces an unrelated claim about productivity, and D misses that this sentence adds nuance rather than restating the main point.",
          difficulty: "medium",
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
            "If deleted, the passage would describe the transit line without explaining how it was paid for. Its job is simply to supply funding-source information, a supporting detail, not a qualification or counterexample as A and B both wrongly suggest. D invents a comparison the sentence never makes. C plainly describes this detail-supplying function.",
          difficulty: "easy",
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
            "If deleted, the passage would argue morale improved but wouldn't address that some people opposed the change initially. Its function is to strengthen the argument by showing that even skeptics changed their minds, stronger support than simply repeating 'morale improved,' which D wrongly describes it as. C misreads the sentence as ongoing opposition, when it actually reports conversion, and A ignores that it's directly on-topic.",
          difficulty: "medium",
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
            "If deleted, the claim (scent, not sight) would remain an assertion without direct experimental support. This sentence's function is not to complicate or qualify the claim, which B wrongly suggests — it provides the controlled experimental evidence that directly confirms it, by showing performance is unaffected when vision is removed. C misreads the finding entirely, and D invents a methodological critique the sentence doesn't make. It's actually the paragraph's strongest piece of direct support, even though the setup (covering eyes) might read as a complication at first.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Describing what the sentence says rather than what job it's doing in the passage's structure.",
        "Confusing a qualifying/complicating sentence with a full contradiction of the main argument.",
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
            "Why would the author pause the personal narrative to describe social norms? This is a common structural move — providing context that helps explain constraints or pressures shaping the subject's later choices. Choices B, C, and D each invent a function (counterargument, conclusion, criticism) the paragraph doesn't perform. A correctly names this context-providing, explanatory role.",
          difficulty: "easy",
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
            "Why would the author spend an entire paragraph on manufacturing detail before returning to the bridge itself? This is a common structural move — laying groundwork that makes the later, more impressive claims about the bridge's design easier to understand and trust. A, C, and D each invent content the paragraph doesn't contain. B correctly names this groundwork-laying role.",
          difficulty: "medium",
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
            "Why would an author open with a misconception before explaining the truth? This is a common structural move — clearing away a wrong assumption first so the correct explanation that follows is easier to appreciate and contrast against. B, C, and D each invent content the paragraph doesn't contain. A correctly describes this 'clear the misconception, then explain' role.",
          difficulty: "easy",
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
            "Why zoom in on one specific case after a general survey? This is a common structural move — narrowing from a general pattern to one detailed, illustrative case, which makes the broader claim more concrete and persuasive. A misreads the example as contradicting the premise, and C and D each invent a shift or data the paragraph doesn't contain. B correctly names this narrowing-to-a-case function.",
          difficulty: "medium",
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
            "If deleted, the surprising finding would stand unchallenged and unexamined. The second paragraph's function isn't to disprove the finding — it explicitly doesn't endorse any of the three possible flaws as the real explanation. Its function is to introduce reasonable doubt while leaving the question open. A overstates this as a full refutation, which a non-committal list of possible flaws doesn't accomplish, and C and D each invent conclusions or evidence not present. B correctly captures this cautious, doubt-raising role.",
          difficulty: "hard",
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
        "These questions ask how a whole passage is organized from start to finish — its overall shape — not the role of one sentence or paragraph. Common shapes: a claim followed by an example; a common belief followed by a challenge to it; a problem followed by a solution; a question followed by an answer; or a small story that leads into a bigger point. Before reading the choices, sketch the shape yourself in one short phrase, like 'states a claim, then gives an example.' Then find the choice describing that same sequence of moves in the same order — not just one that mentions the right topic.",
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
            "Sketch the shape: general pattern first, then one specific case that stands out from it. The case isn't just an example of the general pattern — it's presented as an exception to it, a more specific relationship than plain illustration. B, C, and D each describe a structure the passage doesn't use. A captures 'general pattern, then a specific exception to it' precisely.",
          difficulty: "easy",
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
            "Sketch the shape: an established, conventional account comes first, then new evidence complicates it. The passage doesn't say the old account was definitely wrong, only that the new records 'suggest' a different cause, so B overstates this as a full refutation. C misreads the two explanations as equally weighted, and D reverses the actual order. A matches both the sequence and the passage's cautious wording.",
          difficulty: "easy",
        },
        {
          q: "A particular coral species off the coast of a Pacific island survives water temperatures that should, by every existing model, kill it outright. Curious researchers spent three years running a series of laboratory experiments, gradually eliminating possible explanations — first unusually thick tissue, then unusual feeding behavior — before finally isolating a heat-resistant protein produced by algae living inside the coral's own cells. That protein, researchers now believe, is the coral's actual defense. Which choice best describes the passage's overall structure?",
          choices: [
            "It presents a puzzling phenomenon, then narrates the experimental process that eventually explains it.",
            "It describes an experiment, then a puzzling phenomenon the experiment failed to explain.",
            "It compares the coral species to a second, unrelated species with similar heat resistance.",
            "It presents a solution first, then explains the problem it was designed to solve.",
          ],
          answer: 0,
          explain:
            "Sketch the shape: the passage opens with a puzzle or unexplained phenomenon, then works through an investigation that resolves it. This is a question-then-answer structure, delivered through a narrated process (a series of experiments) rather than a single stated hypothesis. B and D both reverse the actual order, and C invents a comparison never made. A mentions both the initial puzzle and the investigative process that resolves it.",
          difficulty: "medium",
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
            "This passage has three moves, not two: a problem, a proposed solution, and then a complication that qualifies the solution. B is incomplete — it leaves out the passage's actual ending, which raises a real drawback rather than closing on an unqualified fix. C invents a second solution never described, and D reverses the order. A captures all three moves in order.",
          difficulty: "medium",
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
            "Sketch the shape carefully — this passage doesn't just move from specific to general; it returns to the opening anecdote at the end, adding a new detail that reinforces the general point. D describes only part of the structure, missing that final return to the anecdote, since the passage's structure is closer to a loop than a straight line. B reverses the actual order, and C invents a second anecdote. A captures all three moves: the anecdote, the generalization it leads to, and the passage's return to that anecdote with a reinforcing detail.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Choosing an answer that correctly names the passage's topic but gets the order of its structural moves wrong (for example, 'example then claim' when the passage actually goes claim then example).",
        "Choosing an answer that only accounts for part of the passage's structure — often missing a final pivot, complication, or return to an earlier point — rather than describing the whole arc.",
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
          q: "Passage 1: Social media platforms have given ordinary citizens direct channels to organize, mobilize, and participate in public debate in ways that were previously unavailable to most people, fundamentally increasing civic engagement. Passage 2: Social media platforms have changed how people interact so significantly that many users substitute brief online exchanges for the sustained, in-person relationships that once anchored community life, fostering isolation rather than connection. Based on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "Social media has significantly changed how people interact with one another.",
            "Social media increases civic engagement more than it fosters isolation.",
            "Social media should be regulated more strictly by governments.",
            "In-person relationships are becoming entirely obsolete.",
          ],
          answer: 0,
          explain:
            "Both authors are discussing the same underlying phenomenon: social media has changed how people interact and participate in public life. Their conclusions differ — engagement versus isolation — but the shared premise, that social media has significantly changed interaction patterns, is something both would accept, since it's the foundation their opposing arguments are built on. B just restates one author's conclusion, and C and D are claims neither passage actually makes.",
          difficulty: "easy",
        },
        {
          q: "Passage 1: Standardized tests remain the most consistent, objective tool available for comparing applicants from vastly different schools and backgrounds, and scores on these tests should carry significant weight in college admissions decisions. Passage 2: Standardized test scores consistently differ across students from different socioeconomic backgrounds, not because of differences in underlying achievement, but because wealthier students have far greater access to test preparation resources; these tests should therefore be minimized in admissions decisions. Based on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "Test scores vary across students from different backgrounds.",
            "Standardized tests should be eliminated from the admissions process entirely.",
            "Access to test preparation resources has no effect on student performance.",
            "Standardized tests are the single best predictor of college success.",
          ],
          answer: 0,
          explain:
            "Both authors are working from the same observable fact: scores on these tests differ across students from different backgrounds. Their conclusions differ sharply — one trusts the test, one distrusts it — but they disagree about why scores vary, not whether they vary. B and D each state only one author's conclusion, and C directly contradicts Passage 2. A is the underlying pattern both authors would accept.",
          difficulty: "medium",
        },
        {
          q: "Passage 1: Clinical trials of a popular diet trend consistently show participants losing significant weight within the first eight weeks, making it an effective option for people seeking rapid short-term results. Passage 2: Follow-up studies of the same diet trend show that the vast majority of participants who lose weight in the first eight weeks regain it within a year, since the diet's restrictive rules are too difficult to maintain as a long-term lifestyle. Based on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "The diet produces noticeable results within the first eight weeks.",
            "The diet is not effective at producing any weight loss.",
            "The diet should be recommended as a permanent lifestyle change.",
            "Most participants find the diet easy to follow long-term.",
          ],
          answer: 0,
          explain:
            "Both authors are discussing the same underlying phenomenon: the diet produces some effect in the short term. Their conclusions differ — effective versus unsustainable — but the shared premise, that the diet does produce noticeable short-term change, is something both would likely accept, since Passage 2's critique is about long-term sustainability, not about whether short-term effects occur at all. B, C, and D each contradict what one or both passages actually say.",
          difficulty: "easy",
        },
        {
          q: "Passage 1: A city's new nighttime noise ordinance has measurably reduced late-night disturbances, and residents report sleeping better and feeling calmer in their own neighborhoods as a direct result. Passage 2: The same noise ordinance has cut deeply into revenue for small businesses that depend on customers arriving after 9 p.m., since those businesses can no longer legally operate with any amplified sound during peak evening hours. Based on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "The ordinance measurably reduced nighttime activity and noise.",
            "The ordinance has been an unambiguous success for the city.",
            "Small businesses were not affected by the ordinance in any way.",
            "The ordinance should be repealed as soon as possible.",
          ],
          answer: 0,
          explain:
            "Both authors discuss the same underlying fact: the ordinance changed nighttime activity patterns in the city. Their conclusions differ — benefit to residents versus burden on businesses — but the shared premise, that the ordinance measurably reduced nighttime activity and noise, is something both would accept, since it's the shared foundation each side interprets differently. B and D each state only one side's evaluation, and C contradicts Passage 2 directly.",
          difficulty: "medium",
        },
        {
          q: "Passage 1 (a historian): An ancient trade route's gradual decline over roughly a century coincided closely with a major shift in regional political power, as a newly dominant empire redirected trade through routes it could tax and control more directly. Passage 2 (an archaeologist): Sediment core samples show the same region's climate became significantly drier over the same century-long period, and the trade route's key water sources, on which caravans depended, appear to have dried up gradually before the route was finally abandoned. Based on the two passages, with which of the following statements would both authors most likely agree?",
          choices: [
            "The trade route's decline occurred gradually over an extended period.",
            "The trade route was of little economic importance to the region.",
            "Political power shifts were the sole cause of the route's decline.",
            "Climate change was the sole cause of the route's decline.",
          ],
          answer: 0,
          explain:
            "A tempting but too-generic shared-ground answer might claim the route was economically important — probably true, but it's assumed background, not the actual point either author argues about. The more precise shared ground is that both authors agree the decline occurred gradually over an extended period, since each proposes a different explanation (political vs. environmental) for that same observed pattern. C and D each state only one author's specific causal claim.",
          difficulty: "hard",
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
        "This pattern asks how one author would likely respond to a specific claim made in the OTHER passage. You have to apply that author's reasoning and values to a new claim — not just repeat their original argument. Find the core value driving each author's argument (for example, 'depth of connection' for an author focused on isolation). Then predict how that same value would react to the new claim.",
      examples: [
        {
          q: "Passage 1: Online communities built around shared interests give people meaningful, sustained connection with others who understand them, and for many users, these communities have effectively replaced the real-world social circles they struggled to find locally. Passage 2: Even the most active online community exchanges tend to be brief and text-based, lacking the shared physical presence, spontaneous conversation, and accumulated small moments that make in-person relationships feel deeply substantial over time. How would the author of Passage 2 most likely respond to Passage 1's claim that online communities effectively replace real-world ones?",
          choices: [
            "By arguing that online interaction lacks the depth of in-person connection, regardless of how active it appears.",
            "By fully agreeing that online communities are an adequate substitute for in-person relationships.",
            "By ignoring the claim as irrelevant to their argument about isolation.",
            "By arguing that online communities should be banned for young people.",
          ],
          answer: 0,
          explain:
            "Passage 2's core concern is that online interaction lacks the depth of real connection. Applying that same concern to the new claim, an author worried about depth of connection would most likely argue that online communities, however active, don't fully replace the depth of in-person relationships. B would directly contradict their entire stated position, C misreads the claim as irrelevant when it's central to their argument, and D introduces a policy position never suggested.",
          difficulty: "easy",
        },
        {
          q: "Passage 1: Standardized tests remain the most consistent, objective tool available for comparing applicants from vastly different schools and backgrounds, and scores on these tests should carry significant weight in college admissions decisions. Passage 2: Some highly capable students perform poorly on standardized tests specifically because of test anxiety, a response unrelated to their actual academic ability, which means test scores can misrepresent exactly the students they are meant to accurately measure. How would the author of Passage 1 most likely respond to Passage 2's claim about test anxiety?",
          choices: [
            "By arguing that some variation in any single measurement is expected, but this doesn't undermine the test's overall usefulness.",
            "By conceding that the test should be dropped from admissions decisions entirely.",
            "By arguing that test anxiety does not exist and is not a real phenomenon.",
            "By agreeing that test scores frequently misrepresent students' true ability.",
          ],
          answer: 0,
          explain:
            "Passage 1's core concern is that test scores are a reliable, trustworthy measure of achievement and deserve real weight in decisions. Applying that concern to the new claim, an author committed to defending the test's reliability would most likely argue that some variation in any single measurement is expected, but that this doesn't undermine the test's overall usefulness. B and D would both concede the test is fundamentally flawed, directly contradicting Passage 1's stated position, and C denies a real phenomenon rather than reframing its significance.",
          difficulty: "medium",
        },
        {
          q: "Passage 1: A city's new nighttime noise ordinance has measurably reduced late-night disturbances, and residents report sleeping better and feeling calmer in their own neighborhoods as a direct result. Passage 2: The same noise ordinance has cut deeply into revenue for small businesses that depend on customers arriving after 9 p.m., since those businesses can no longer legally operate with any amplified sound during peak evening hours. How would the author of Passage 1 most likely respond to Passage 2's claim that the ordinance unfairly burdens small businesses?",
          choices: [
            "By arguing that the improvement to residents' quality of life outweighs the burden on businesses.",
            "By fully conceding that the ordinance was a mistake and should be repealed.",
            "By denying that any businesses have been affected by the ordinance.",
            "By arguing that businesses should relocate to a different city entirely.",
          ],
          answer: 0,
          explain:
            "Passage 1's core concern is improved quality of life for residents. Applying that concern to the new claim, an author focused on resident quality of life would most likely argue that the benefit to residents outweighs the inconvenience to businesses, or that businesses can adjust. B would contradict their stated position entirely, and C and D both go well beyond what a reasonable, consistent response would claim.",
          difficulty: "easy",
        },
        {
          q: "Passage 1: Clinical trials of a popular diet trend consistently show participants losing significant weight within the first eight weeks, making it an effective option for people seeking rapid short-term results. Passage 2: Follow-up studies of the same diet trend show that the vast majority of participants who lose weight in the first eight weeks regain it within a year, since the diet's restrictive rules are too difficult to maintain as a long-term lifestyle. How would the author of Passage 2 most likely respond to Passage 1's claim that the diet produces measurable short-term weight loss?",
          choices: [
            "By conceding the short-term effect is real, but arguing it doesn't matter if it can't be sustained.",
            "By denying that any short-term weight loss occurs at all.",
            "By arguing the diet should be recommended more widely despite the risk of regaining weight.",
            "By ignoring the claim since it is unrelated to sustainability.",
          ],
          answer: 0,
          explain:
            "Passage 2's core concern is not whether short-term effects occur, but whether they can be sustained. Applying that concern to the new claim, this author would most likely concede the short-term effect is real, but argue it doesn't matter if it can't be maintained long-term. B misreads their critique, which is about durability, not the initial result. C would contradict their own conclusion, and D wrongly treats the claim as irrelevant when it's central to their argument.",
          difficulty: "medium",
        },
        {
          q: "Passage 1 (a historian): An ancient trade route's gradual decline over roughly a century coincided closely with a major shift in regional political power, as a newly dominant empire redirected trade through routes it could tax and control more directly. Passage 2 (an archaeologist): Sediment core samples show the same region's climate became significantly drier over the same century-long period, and the trade route's key water sources, on which caravans depended, appear to have dried up gradually before the route was finally abandoned. How would the author of Passage 1 most likely respond to the sediment core evidence presented in Passage 2?",
          choices: [
            "By accepting the environmental evidence as accurate, but arguing it was a secondary factor compared to the political shift.",
            "By flatly denying that the region's climate changed during this period.",
            "By agreeing that environmental change was the true primary cause of the decline.",
            "By arguing that sediment core analysis is an unreliable scientific method.",
          ],
          answer: 0,
          explain:
            "Passage 1's core concern is that political shifts were the primary cause of the decline. A careful historian wouldn't necessarily dispute solid sediment-core data, since that's not their area of expertise or actual disagreement — their real disagreement is about which cause was primary, not whether the climate changed at all. B has the historian flatly deny data outside their argument, D attacks a scientific method without cause, and C would abandon their own thesis entirely. A accepts the data but reframes its importance as secondary, the most consistent response.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Having the author agree with a claim that directly contradicts their passage's established position.",
        "Predicting a response using generic reasoning rather than the specific concern that drives that particular author's argument.",
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
            "Re-read the goal: 'economic stakes,' not causes or general facts about bees. Note 1 (pollinating food crops) is the economic angle. Choices A and D focus on the cause (note 3), not economic stakes, and C reports the decline alone with no economic connection. B is the only choice combining the crop-pollination fact with the decline statistic, directly serving the stated goal.",
          difficulty: "easy",
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
            "Re-read the goal carefully: 'impact on staff work,' not patron convenience. The wait-time note is tempting because it's about the same event, but it's about patrons, exactly what the goal says to avoid, ruling out A and C. D mentions only the installation, with no effect on staff at all. B combines the kiosk installation with the staff time-reallocation note, directly serving the goal.",
          difficulty: "medium",
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
            "Re-read the goal precisely: 'long-term environmental impact,' not just that the giveaway happened or general festival facts. Note 4 (ticket prices) is true but has nothing to do with the environment, ruling out C. Note 2 (3 tons of plastic waste) sets the scale of the problem, but by itself doesn't show any actual impact from the giveaway — it's background, not an outcome, which is why A and D fall short. Note 3 (68% still using the bottles a month later) is the only note showing a real, lasting effect tied specifically to the giveaway, which is why B is correct.",
          difficulty: "hard",
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
            "Re-read the goal: 'customer support,' not cost. Note 3 (68% would pay more) ties directly to customer support. A and D both center the cost increase, answering a different question, and C mentions the survey but frames it as a contrast to the cost increase rather than as the sentence's actual emphasis. B combines the packaging change with the survey result, directly serving the stated goal.",
          difficulty: "easy",
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
            "Re-read the goal: 'benefited the orchestra's future,' not how big the tour was or who leads the orchestra. C and D both bring in the conductor's tenure (note 4), unrelated to the tour's benefit, and A describes scope (note 2), not benefit. B combines the tour with the instrument-funding outcome, the specific future benefit the goal asks about.",
          difficulty: "medium",
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
            "Re-read the goal precisely: demand existed before the library reacted, not just that Sunday hours are popular now. Choice A's 18%-of-visits figure shows current usage, but that's after the change, so alone it doesn't prove demand existed beforehand — a tempting but incomplete choice. B and D don't address demand at all. C is the only choice combining this library's 2022 change with the comparable branch's years-long Sunday demand pattern, showing the demand pre-dated this library's own reaction.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Picking a true, well-written sentence that doesn't actually serve the specific stated goal.",
        "Picking a sentence that uses information not present in the given notes (even if it sounds plausible).",
        "Combining notes in a way that answers a different, related-sounding goal instead of the one actually stated.",
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
        },
        {
          q: "The bakery started sourcing flour from a local mill instead of a national distributor. ______, delivery times improved and ingredient costs actually dropped by 8%. Which choice completes the text with the most logical transition?",
          choices: ["In addition,", "However,", "As a result,", "For instance,"],
          answer: 2,
          explain:
            "What's the relationship here? The switch to a local mill directly produced two outcomes — faster deliveries and lower costs — a cause and its effects, not addition or contrast. 'In addition' would suggest these are just two more, separate facts, not results of the switch, and 'however' would suggest a contradiction that isn't there. 'As a result' is the only choice that correctly signals the second sentence describes consequences of the first.",
          difficulty: "medium",
        },
        {
          q: "The museum extended its hours for the holiday season. ______, staff scheduled additional guided tours to meet the increased demand. Which choice completes the text with the most logical transition?",
          choices: ["However,", "For example,", "Similarly,", "As a result,"],
          answer: 3,
          explain:
            "What's the relationship here? Extending hours led directly to a response — more tours — a cause and its effect. 'However' signals contrast, 'for example' signals illustration, and 'similarly' signals comparison, none of which fit. 'As a result' is the only choice matching the actual cause-effect relationship.",
          difficulty: "easy",
        },
        {
          q: "The vaccine trial enrolled twice as many participants as originally planned. ______, the results were available nearly a year ahead of schedule. Which choice completes the text with the most logical transition?",
          choices: ["In addition,", "Consequently,", "Nevertheless,", "For example,"],
          answer: 1,
          explain:
            "What's the relationship? A larger enrollment led to faster results — a causal link, not just two separate facts about the trial. 'In addition' would present these as two unconnected facts, but the sentence's logic specifically connects the larger sample to the faster timeline, and 'nevertheless' signals contrast, which doesn't fit at all. 'Consequently' correctly matches the cause-effect relationship.",
          difficulty: "medium",
        },
        {
          q: "The company's revenue grew for the fifth consecutive quarter. ______, its stock price fell sharply after the earnings call. Which choice completes the text with the most logical transition?",
          choices: ["As a result,", "However,", "Similarly,", "For example,"],
          answer: 1,
          explain:
            "What's the relationship? Revenue grew, but stock fell — growth would normally be expected to raise or maintain stock price, so this is a contrast between expectation and outcome, not a cause producing an expected effect. 'As a result' is a tempting trap, since the events are chronologically connected, but it would imply the growth logically produced the drop, reversing the sentence's actual logic. 'Similarly' and 'for example' don't fit a contrast at all. 'However' correctly signals that the fall is surprising given the growth.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Picking a transition that 'sounds fine' grammatically without checking if it matches the actual logical relationship.",
        "Confusing near-synonyms with different logical force (e.g., 'however' signals direct contrast, while 'nonetheless' signals contrast despite an acknowledged point — subtly different uses).",
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
            "Is this a full contradiction, or an acknowledgment of a difference followed by a shared similarity? It's the latter — the cost difference is acknowledged, but doesn't prevent a shared goal from being true. 'Therefore' implies the second sentence follows as a consequence, which isn't the case here, and 'for instance' and 'similarly' don't fit either. 'Nonetheless' correctly signals a concession — the difference is acknowledged, but the shared goal still holds true despite it.",
          difficulty: "easy",
        },
        {
          q: "The bridge repairs ran three months behind schedule. ______, the final structure passed every safety inspection without a single issue. Which choice completes the text with the most logical transition?",
          choices: ["Consequently,", "Nonetheless,", "Similarly,", "For example,"],
          answer: 1,
          explain:
            "Ask whether the two ideas actually contradict each other, or whether the second is simply true despite the first. Running behind schedule doesn't logically prevent a project from passing inspection later — these aren't direct opposites. 'Consequently' would wrongly suggest the delay caused the successful inspection, and 'similarly' and 'for example' don't fit at all. 'Nonetheless' is correct because nothing is actually being reversed or disproven — a positive result held up despite an earlier problem, exactly what concession language signals.",
          difficulty: "hard",
        },
        {
          q: "The two candidates disagree on nearly every policy issue. ______, both have pledged to accept the election results peacefully. Which choice completes the text with the most logical transition?",
          choices: ["Nonetheless,", "For example,", "As a result,", "Similarly,"],
          answer: 0,
          explain:
            "Is this a full contradiction, or an acknowledgment of one point followed by agreement on another? It's the latter — disagreeing on policy doesn't prevent a shared commitment on something else. 'As a result' would wrongly imply the disagreement caused the pledge, and 'for example' and 'similarly' don't fit either. 'Nonetheless' correctly signals a concession — the disagreement is acknowledged, but the shared commitment still holds true despite it.",
          difficulty: "easy",
        },
        {
          q: "The renovation ran significantly over budget. ______, the building's new energy efficiency is expected to save the city money within five years. Which choice completes the text with the most logical transition?",
          choices: ["As a result,", "Nonetheless,", "For example,", "Moreover,"],
          answer: 1,
          explain:
            "Is this a flat contradiction, or does the second idea hold true despite the first? Running over budget doesn't logically prevent future energy savings — these aren't opposites, so this is a 'despite X, Y still holds' relationship. 'As a result' would wrongly suggest the overspending caused the savings, and 'for example' and 'moreover' don't fit either. 'Nonetheless' correctly signals a positive outcome holding true despite an earlier setback.",
          difficulty: "medium",
        },
        {
          q: "Reviewers praised the film's visual effects as groundbreaking. ______, they panned its script as incoherent and poorly paced. Which choice completes the text with the most logical transition?",
          choices: ["Nonetheless,", "However,", "Similarly,", "As a result,"],
          answer: 1,
          explain:
            "Is this 'despite X, Y still holds,' or a direct two-sided contrast? Here, praise for the effects and criticism of the script are two separate, directly opposing assessments, not one idea holding true despite the other. A concession word like 'nonetheless' would subtly misrepresent this as one point overcoming a setback, when it's really just two contrasting judgments placed side by side. 'Similarly' and 'as a result' don't fit a contrast at all. 'However' is the cleaner, more accurate fit for this direct contrast.",
          difficulty: "medium",
        },
      ],
      traps: [
        "Treating all 'contrast-flavored' transitions as interchangeable, when concession words specifically signal 'despite this, still...' rather than a flat contradiction.",
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
        "This pattern is about joining two complete, independent clauses — each one could stand alone as its own sentence. Everything hinges on one question: is each side of the punctuation a full independent clause (subject + verb, complete thought)? If both sides are independent, you have exactly four correct options: a period, a semicolon, a comma plus a word like 'and' or 'but,' or a colon (only if the second clause explains the first). A comma by itself joining two independent clauses — a 'comma splice' — is a common wrong answer. Watch for this pattern whenever both clauses could be read as standalone sentences.",
      examples: [
        {
          q: "The results were surprising ______ no one had predicted such a sharp decline. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["; ", ", ", " so ", ", but "],
          answer: 0,
          explain:
            "Check both sides: 'The results were surprising' and 'no one had predicted such a sharp decline' are both complete, independent clauses. A lone comma alone would create a comma splice, and 'so' without a comma before it creates a run-on. 'But' signals a contrast, but these two ideas aren't in contrast. The semicolon correctly joins two closely related independent clauses without needing a conjunction.",
          difficulty: "easy",
        },
        {
          q: "The lab technician double-checked every reading twice ______ a single miscalibration could invalidate months of data. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [": ", ", ", " so ", ", but "],
          answer: 0,
          explain:
            "Both sides are independent clauses ('The lab technician double-checked every reading twice' and 'a single miscalibration could invalidate months of data'), so a lone comma is wrong. The second clause explains why the technician was so careful — exactly the relationship a colon signals, more precisely than 'so' or the contrastive 'but,' which doesn't fit here at all.",
          difficulty: "medium",
        },
        {
          q: "The negotiators extended the deadline by another week, ______ neither side had reviewed the full contract yet. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["for", "because", "so that", "although"],
          answer: 0,
          explain:
            "Both halves could stand alone as complete sentences, and a comma already sits right before the blank. 'For' links two complete sentences the same way 'and' or 'but' would, so it correctly takes a comma right before it. 'Because,' 'so that,' and 'although' all attach onto the second clause and turn it into a dependent clause that could no longer stand alone — used that way, none of them would take a comma directly in front of them the way this sentence already has.",
          difficulty: "hard",
        },
        {
          q: "The council approved the budget unanimously ______ the mayor still vetoed it the next day. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [", but ", ", ", " so ", ": "],
          answer: 0,
          explain:
            "Both sides are complete sentences on their own, so a lone comma is a splice and 'so' without a comma is a run-on. The relationship here is a surprising contrast, not an explanation, so a colon doesn't fit either. A comma plus 'but' correctly joins the two independent clauses while signaling that direct contrast.",
          difficulty: "easy",
        },
        {
          q: "The two departments rarely agree on budget priorities ______ this year's proposal passed with support from both. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["; ", ", ", " so ", ": "],
          answer: 0,
          explain:
            "Both sides are complete, independent clauses, so a lone comma would be a splice and 'so' without a comma is a run-on. A colon would incorrectly suggest the second clause explains or defines the first, when it's really a surprising contrast. A semicolon correctly joins the two independent clauses and lets that contrast speak for itself.",
          difficulty: "medium",
        },
      ],
      traps: [
        "Choosing a lone comma between two independent clauses (a comma splice) — one of the most common wrong answers on this pattern.",
        "Missing that a dependent clause (starting with 'because,' 'although,' 'since,' etc.) is NOT independent, even though it may look like a full sentence.",
      ],
    },
    {
      name: "Semicolon-Separated Lists with Internal Commas",
      explanation:
        "This pattern covers lists where individual items already contain their own comma — most often a name followed by a description, like 'Chen Liu, a sculptor.' When every list item is a simple word or phrase, ordinary commas work fine. But once one item already has a comma inside it, more commas make it impossible to tell where one item ends and the next begins. That's your signal: introduce the list with a colon and separate items with semicolons instead. Watch for this whenever a sentence lists several people, places, or things — check if any single item already has its own comma.",
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
            "This is a list, not two independent clauses, so it needs a colon to introduce it, not a semicolon (choice D) or comma (choice C) beforehand. Each list item already contains its own internal comma (name, then role), so using only commas throughout (choice B) makes it impossible to tell where one item ends and the next begins. The correct choice uses a colon to introduce the list and semicolons to separate the individual comma-containing items.",
          difficulty: "easy",
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
            "This is a list, not two independent clauses, so a colon introduces it, not a semicolon (choice D) or comma (choice C) beforehand. Each item has its own internal comma (name, then job), so plain commas throughout (choice B) would make it impossible to tell where one item ends and the next begins.",
          difficulty: "easy",
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
            "Even with only two applicants instead of three, the same signal applies: each item already contains its own internal comma (name, then status), so the list needs a colon to introduce it and semicolons, not plain commas, to separate the items. Choice B uses only commas throughout, creating ambiguity about where one applicant's description ends and the next begins; choice C drops the commas around each description entirely; choice D uses a semicolon instead of a colon to introduce the list.",
          difficulty: "medium",
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
            "Most items have internal commas (name plus role), but 'Devon Marsh' alone has no descriptor. Since at least one item in the list has an internal comma, plain commas throughout (choice B) would still create ambiguity about where items begin and end — the rule applies to the whole list, not just the items with descriptions. Choice C drops necessary commas, and choice D uses a semicolon instead of a colon to introduce the list.",
          difficulty: "medium",
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
            "Each judge's name is followed by its own extra descriptive detail requiring commas on both sides, so plain commas separating the three list items too (choice C) would make it impossible to tell where one judge's entry ends and the next begins. Choice B drops the commas around each description, and choice D uses a semicolon instead of a colon to introduce the list. The correct choice uses a colon to introduce the list and semicolons between the three items, while keeping the commas around each individual description.",
          difficulty: "hard",
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
            "None of the items — muffins, scones, croissants — contains its own internal comma, so plain commas between them are perfectly clear on their own, with a comma before 'and' following standard serial-comma convention. Semicolons (choices B and C) are unnecessary here and would actually be a mistake in the other direction, since there's no ambiguity for them to resolve; dropping punctuation entirely (choice D) is a plain error.",
          difficulty: "hard",
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
        "This pattern covers appositives — a word or phrase that renames or describes a nearby noun, like 'a retired firefighter' describing 'my uncle Raymond.' This isn't about separating list items; it's about correctly bracketing one piece of extra, droppable information. The core test: if the phrase is essential to knowing who or what's being discussed, it gets no commas. If it's just extra detail — the noun is already clear without it — it must be boxed off with commas, on both sides if it's mid-sentence, or one comma if it opens or closes the sentence.",
      examples: [
        {
          q: "My uncle Raymond ______ still volunteers at the local station. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [", a retired firefighter, ", " a retired firefighter ", ", a retired firefighter ", " a retired firefighter, "],
          answer: 0,
          explain:
            "'A retired firefighter' is extra descriptive information about 'my uncle Raymond' — not needed to know who's being discussed, since the name already tells us exactly who that is. Extra descriptive information dropped into the middle of a sentence needs to be boxed off on both sides with commas, like parentheses, ruling out the choices missing one or both commas.",
          difficulty: "easy",
        },
        {
          q: "Our neighbor Dr. Alvarez ______ now volunteers at the community clinic twice a week. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [", a retired pediatrician, ", " a retired pediatrician ", ", a retired pediatrician ", " a retired pediatrician, "],
          answer: 0,
          explain:
            "'A retired pediatrician' describes 'Dr. Alvarez' with extra, droppable detail — 'our neighbor Dr. Alvarez' already tells us exactly who's meant. Since the phrase falls in the middle of the sentence, it needs to be boxed off on both sides with commas, the same mid-sentence bracketing rule as any nonessential appositive.",
          difficulty: "easy",
        },
        {
          q: "The author ______ became a recluse after her novel's unexpected success. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [", Min-jin Lee, ", " Min-jin Lee ", ", Min-jin Lee ", " Min-jin Lee, "],
          answer: 0,
          explain:
            "'The author' already identifies one specific, identifiable person in this context, so 'Min-jin Lee' is extra information, not essential to knowing who's meant — unlike a phrase such as 'the author who wrote the novel,' where the identifying clause is necessary and would take no commas at all. Because the name here is extra, it needs to be boxed off with commas on both sides.",
          difficulty: "medium",
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
            "'A retired pediatrician who still volunteers twice a week' describes 'Dr. Alvarez,' but the descriptive phrase comes first, before the name it describes. Since there's nothing before the phrase to bracket — it opens the sentence — only one comma is needed, right after the phrase and before the name, not commas on both sides as in a mid-sentence appositive, and not a comma splitting the phrase itself.",
          difficulty: "medium",
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
            "'Despite the storm' is not a complete sentence on its own — it's a dependent prepositional phrase — while 'the flight departed on time' is independent. Since only one side is independent, a semicolon (which requires independent clauses on both sides) is wrong. The correct choice uses a single comma after the introductory phrase, before the independent clause begins.",
          difficulty: "easy",
        },
        {
          q: "______ the results still revealed a clear pattern. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [
            "Although the survey received far fewer responses than expected, ",
            "Although the survey received far fewer responses than expected; ",
            "The survey received far fewer responses than expected; ",
            "Although the survey received far fewer responses than expected ",
          ],
          answer: 0,
          explain:
            "'The survey received far fewer responses than expected' has its own subject and verb, so it can look complete on its own, but 'although' at the front stops it from actually standing alone. Since only the second part can truly stand on its own, this is a single-boundary case: one comma after the lead-in, not a semicolon, which would require both sides to be independent.",
          difficulty: "medium",
        },
        {
          q: "______ the festival finally opened to the public. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["After months of planning, ", "After months of planning; ", "After months of planning ", "After, months of planning, "],
          answer: 0,
          explain:
            "'After months of planning' is not a complete sentence on its own — it's a dependent introductory phrase — while 'the festival finally opened to the public' is independent. Since only one side is independent, a semicolon would be wrong. A single comma after the introductory phrase is correct.",
          difficulty: "easy",
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
            "'Having reviewed every application twice' has no subject of its own — it's a participial phrase describing an implied actor (the committee), not a complete clause — while 'the committee still could not reach a unanimous decision' is independent. This is the same single-boundary case as an introductory phrase beginning with 'despite' or 'although,' even though this one opens with an '-ing' participle: a single comma after the introductory phrase is correct.",
          difficulty: "hard",
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
        },
        {
          q: "Many ______ personal stories go untold in official histories. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["immigrants'", "immigrant's", "immigrants", "immigrants's"],
          answer: 0,
          explain:
            "'Stories' follows the noun — these are stories the immigrants possess, so a plain plural won't work. 'Many' signals more than one owner, so this needs the plural possessive form, with the apostrophe after the -s: immigrants'.",
          difficulty: "easy",
        },
        {
          q: "The research team credited three separate laboratories for the discovery; the ______ combined data made the pattern clear. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["laboratories'", "laboratory's", "laboratories", "laboratorys'"],
          answer: 0,
          explain:
            "'Combined data' follows the noun — data the laboratories possess together, so this needs a possessive, not a plain plural. The sentence explicitly says 'three separate laboratories,' confirming multiple owners, so the plural possessive is correct: laboratories', apostrophe after the existing -s — not laboratory's, which would wrongly suggest a single lab, and 'laboratorys'' isn't even how the plural is spelled.",
          difficulty: "medium",
        },
        {
          q: "The final report was reviewed and approved by three ______ before publication. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["researchers", "researcher's", "researchers'", "researchers's"],
          answer: 0,
          explain:
            "Nothing directly after 'researchers' is being possessed; the sentence just moves on to 'before publication.' Since there's no noun being possessed, this is simply naming multiple people, not showing ownership, so a plain plural with no apostrophe is correct — both possessive forms are traps here.",
          difficulty: "medium",
        },
        {
          q: "The museum's newest exhibit displays several ______ early sketches alongside a single sculptor's finished bronze piece. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["artists'", "artist's", "artists", "artist's's"],
          answer: 0,
          explain:
            "The sentence already correctly uses two other possessives — 'museum's' for one museum, 'sculptor's' for one sculptor — as a model. 'Sketches' follows the blank, and 'several' signals more than one artist possessing them jointly, so the plural possessive matches the pattern: artists', not artist's (one owner) or artists (no ownership at all).",
          difficulty: "hard",
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
        "Every other Boundaries pattern is about adding correct punctuation. This one's the opposite: sometimes the right answer has NO punctuation at all, and the wrong choices tempt you with a comma, dash, or colon that looks plausible but isn't actually justified. This usually happens between a verb and its direct object, between a preposition and its object, or before a short phrase that isn't really nonessential. Apply the same 'what's on each side' checks you use everywhere else in Boundaries — and don't assume one choice must add punctuation just because the others do. Treat 'no punctuation' as a real option every time.",
      examples: [
        {
          q: "The negotiators finally agreed ______ a compromise that satisfied both delegations. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["on", "on,", ", on", "to on"],
          answer: 0,
          explain:
            "'Agreed on' is a single verb phrase, and 'a compromise' is its direct object — there's no boundary here at all, just a verb followed by what it acts on. Inserting a comma between a verb phrase and its object breaks the sentence's core grammar, and 'to on' isn't idiomatic English at all. The correct choice has no punctuation and uses the correct preposition alone.",
          difficulty: "easy",
        },
        {
          q: "Visitors are asked to remain seated ______ performance to avoid disrupting other guests. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["during the", "during, the", "during the,", "during; the"],
          answer: 0,
          explain:
            "'During' is a preposition and 'the performance' is its object — together they form one tightly bound unit with no internal boundary. A comma or semicolon between a preposition and its object is never correct, regardless of how long the surrounding sentence is.",
          difficulty: "easy",
        },
        {
          q: "The committee's chair, Dr. Alvarez______ announced the new research funding priorities at the meeting. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [",", "", ";", ":"],
          answer: 0,
          explain:
            "Since 'the committee's chair' already uniquely identifies one specific person, the name that follows is a nonessential appositive and does need commas on both sides — this is a trap in the other direction, testing whether you over-correct toward 'no punctuation' once you've learned to watch for it. The correct choice keeps the comma after 'Alvarez,' matching the comma already present before the name.",
          difficulty: "medium",
        },
        {
          q: "The festival's organizers decided______ to postpone the outdoor concert until the storm passed. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["", ",", ";", ":"],
          answer: 0,
          explain:
            "'Decided' is the main verb, and 'to postpone the outdoor concert until the storm passed' is its infinitive-phrase object, answering 'decided what?' A verb and the infinitive phrase completing its meaning form one unbroken grammatical unit, just like a verb and a direct-object noun, so no punctuation belongs between them.",
          difficulty: "medium",
        },
        {
          q: "Employees who arrive after nine o'clock______ must sign in at the front desk before entering the building. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["", ",", ";", ":"],
          answer: 0,
          explain:
            "'Who arrive after nine o'clock' is a restrictive relative clause — it specifies which employees the sentence is about, not extra removable detail about all employees. Removing it would change the sentence's meaning entirely, from a rule about latecomers to a rule about everyone, which is the signature of an essential, restrictive clause. Restrictive clauses never take a comma (or semicolon or colon) before them, so no punctuation is correct.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Inserting a comma between a verb (or preposition) and the object that directly completes it, just because a comma is offered as an option.",
        "Over-correcting once you've learned to watch for 'no punctuation needed' cases, and removing a comma that's actually required around a genuine nonessential element.",
        "Treating a restrictive (essential, no-comma) clause and a nonessential (comma-both-sides) clause as interchangeable — the test is always whether removing the clause changes who or what the sentence is actually about.",
      ],
    },
    {
      name: "Using a Colon to Introduce a List, Explanation, or Elaboration",
      explanation:
        "A colon can introduce more than just a second independent clause — it can introduce a list, a phrase that renames something just mentioned, or an explanation. Unlike a semicolon, what follows a colon doesn't need to be a complete sentence; a list or a single explanatory phrase works fine. What matters is the OTHER side: everything before the colon must be a complete, independent clause that could stand on its own — even if what follows it can't.",
      examples: [
        {
          q: "The museum's mission statement emphasizes one goal above all others______ preserving the collection for future generations. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " and"],
          answer: 0,
          explain:
            "The left side, 'The museum's mission statement emphasizes one goal above all others,' is a complete, independent clause. The right side, 'preserving the collection for future generations,' is a phrase renaming that 'one goal,' not a full independent clause, so a semicolon (which needs independent clauses on both sides) won't work, and a plain comma would create a run-on. A colon is correct: independent clause on the left, an elaborating phrase on the right.",
          difficulty: "easy",
        },
        {
          q: "Before the expedition departed, the team packed everything they would need______ tents, dried food, water filters, and a satellite phone. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " like"],
          answer: 0,
          explain:
            "The part before the blank, 'the team packed everything they would need,' is a complete independent clause. What follows is a list of items, not an independent clause, so this isn't a case for a semicolon between two full sentences. A colon correctly introduces the list, since only the clause before it needs to be independent.",
          difficulty: "easy",
        },
        {
          q: "The engineers faced a single unavoidable constraint______ the bridge's total weight could not exceed the old foundation's original rating. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " and"],
          answer: 0,
          explain:
            "Both sides here happen to be complete independent clauses, so a semicolon would technically work grammatically too — but the second clause specifically explains and defines the 'single unavoidable constraint' named in the first, which is exactly the elaboration relationship a colon signals. A plain comma would create a run-on.",
          difficulty: "medium",
        },
        {
          q: "Coral reefs depend on a delicate balance______ too much warming kills the algae reefs need, while too little sunlight starves that same algae. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " because"],
          answer: 0,
          explain:
            "'Coral reefs depend on a delicate balance' is a complete independent clause introducing an abstract idea that needs unpacking. What follows explains what that balance actually consists of, in two parts joined by 'while.' A colon correctly signals 'here's what that balance means,' even though what follows is a more complex, two-part explanation rather than a short phrase.",
          difficulty: "medium",
        },
        {
          q: "The archive's newest acquisition is remarkable for a simple reason______ it is the only surviving copy of the pamphlet, the printer's original plates having been destroyed in a fire decades ago. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: [":", ",", ";", " and"],
          answer: 0,
          explain:
            "'The archive's newest acquisition is remarkable for a simple reason' is independent and sets up an expectation: what is that reason? What follows directly answers that expectation, ruling out a plain comma (which would create a run-on) and favoring the colon's 'here's the reason' function over a semicolon's 'separate but related' function. The trailing modifier about the printer's plates is nonessential background and doesn't change which mark belongs right after 'reason.'",
          difficulty: "hard",
        },
      ],
      traps: [
        "Assuming a colon always needs a full independent clause on both sides, the way a semicolon does — a colon only requires that of the clause before it.",
        "Choosing a semicolon when the relationship between the two sides is 'this explains/defines that' rather than 'these are two separate, equally weighted points' — that explanatory relationship is a colon's specific job.",
        "Using a colon after an incomplete introductory phrase (like 'such as' or 'including') that isn't itself a full independent clause.",
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
        },
        {
          q: "The collection of rare manuscripts ______ housed in a climate-controlled room. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["is", "are", "were", "have been"],
          answer: 0,
          explain:
            "Cross out 'of rare manuscripts' — it's just extra description, not the subject. What remains is 'The collection ______ housed,' making 'collection' (singular) the true subject, not 'manuscripts' (plural). A singular subject needs a singular verb.",
          difficulty: "medium",
        },
        {
          q: "The box of old photographs ______ in the attic. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["sits", "sit", "were sitting", "have sat"],
          answer: 0,
          explain:
            "Cross out 'of old photographs' — it's a modifier, not the subject. What remains is 'The box ______ in the attic,' making 'box' (singular) the true subject, not 'photographs' (plural). A singular subject needs a singular verb.",
          difficulty: "easy",
        },
        {
          q: "The results of the survey conducted across all twelve regions ______ still being reviewed by the committee. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["are", "is", "was", "has been"],
          answer: 0,
          explain:
            "Cross out both modifying phrases — 'of the survey' and 'conducted across all twelve regions' — neither is the subject. What remains is 'The results ______ still being reviewed,' making 'results' (plural) the true subject, not the nearby singular 'survey.' A plural subject needs a plural verb.",
          difficulty: "medium",
        },
        {
          q: "The committee ______ divided on how to proceed, with several members favoring a different plan than the majority. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["is", "are", "were", "have been"],
          answer: 0,
          explain:
            "'Committee' is a collective noun — in standard American usage, it's treated as singular even when the sentence describes disagreement among the individuals within it. The phrase 'with several members favoring a different plan' might tempt a plural verb, but the grammatical subject is still 'the committee' as one unit, not 'the members.'",
          difficulty: "hard",
        },
      ],
      traps: [
        "Matching the verb to the nearest noun (often inside a prepositional phrase) instead of the sentence's true subject.",
        "Getting tripped up by collective nouns (like 'data' or 'the committee') that can take either singular or plural verbs depending on formal usage conventions.",
      ],
    },
    {
      name: "Parallel Structure in Lists and Comparisons",
      explanation:
        "This pattern tests whether all items in a list — or both sides of a comparison — use matching grammatical forms: all -ing forms, all infinitives, or all plain verbs, never a mix. The trap answer usually shifts form partway through the list (two -ing verbs, then suddenly an infinitive), which sounds subtly 'off' even if you can't name the rule. The fix: find the form used by the first item or two, then require every other item to match it exactly.",
      examples: [
        {
          q: "She enjoys hiking, swimming, and ______. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["biking", "to bike", "bikes", "having biked"],
          answer: 0,
          explain:
            "'Hiking' and 'swimming' are both -ing (gerund) forms, so the third item in the list must match this same form to maintain parallel structure. 'To bike' (infinitive) and 'bikes' (plain verb) don't match the established -ing pattern.",
          difficulty: "easy",
        },
        {
          q: "The workshop taught participants how to negotiate contracts, resolve disputes, and ______ effective teams. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["build", "building", "built", "to build"],
          answer: 0,
          explain:
            "After 'how to,' the list uses plain verb forms — 'negotiate' and 'resolve,' not 'negotiating' or 'to resolve.' The third item must match that same plain-verb form to stay parallel; 'building' breaks the pattern set by the first two items.",
          difficulty: "medium",
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
        },
        {
          q: "The new policy was designed not only to reduce costs but also ______ employee satisfaction. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["to improve", "improving", "improves", "improved"],
          answer: 0,
          explain:
            "'To reduce' is an infinitive in the first half of the 'not only... but also' comparison, so the second half must match this same infinitive form. 'Improving' (gerund) and 'improves'/'improved' (plain verb forms) don't match — parallel structure applies to comparisons, not just lists.",
          difficulty: "medium",
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
        "This pattern checks whether a pronoun correctly matches the noun it refers back to — in number (singular or plural) — and whether that noun is clear and unambiguous. One common trap: words like 'each' and 'neither' are singular, and need singular pronouns, even though they might feel like they're describing a group.",
      examples: [
        {
          q: "Each of the students submitted ______ essay by the deadline. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["his or her", "their", "its", "they're"],
          answer: 0,
          explain:
            "The antecedent is 'each' (not 'students,' which is inside a prepositional phrase modifying 'each'). 'Each' is grammatically singular, even though it refers to a group of students individually, so the pronoun must agree with 'each' in number.",
          difficulty: "easy",
        },
        {
          q: "Neither of the twins finished ______ homework before dinner. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["his or her", "their", "its", "they're"],
          answer: 0,
          explain:
            "The antecedent is 'neither' (not 'twins,' which sits inside a prepositional phrase describing 'neither'). 'Neither' is grammatically singular, even though it's talking about two people.",
          difficulty: "medium",
        },
        {
          q: "Every applicant must submit ______ portfolio by Friday. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["his or her", "their", "its", "they're"],
          answer: 0,
          explain:
            "'Every,' like 'each,' is grammatically singular, even though it refers to a whole group of applicants individually, so the pronoun must agree in number with 'every applicant.'",
          difficulty: "easy",
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
        },
        {
          q: "Either the manager or the interns will need to submit ______ report by Monday. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["their", "his or her", "its", "they're"],
          answer: 0,
          explain:
            "This is an 'either... or' compound subject, not a simple 'and' list — with 'or'/'nor,' the pronoun agrees with whichever subject is closer to it, not automatically the first one listed. Since 'the interns' (plural) is nearer to the blank, the pronoun should be plural, not singular just because 'the manager' appears first.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Matching a pronoun to a nearby plural noun (like 'students') instead of the true, singular antecedent ('each').",
        "Overlooking ambiguous pronoun references, where it's unclear which of two nouns a pronoun is meant to replace.",
      ],
    },
    {
      name: "Verb Tense and Form Consistency",
      explanation:
        "This pattern is about whether a verb's TENSE or FORM matches the timeline the rest of the sentence sets up — separate from subject-verb agreement. First, figure out the timeline: a single past event, one past event before another, or something continuing up to now. Or check what form a nearby word requires — some verbs need 'to + verb' after them, others need the '-ing' form. Match the verb to that signal, instead of just picking whatever tense sounds natural on its own.",
      examples: [
        {
          q: "By the time the store closed, the clerk ______ every shelf twice. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["had restocked", "restocked", "has restocked", "was restocking"],
          answer: 0,
          explain:
            "This describes two past events, and restocking happened before closing. When one past event happens before another past event, the earlier one needs the past perfect tense ('had' + past participle); simple past would blur which action came first.",
          difficulty: "easy",
        },
        {
          q: "The museum's newest wing, completed last spring, ______ over 200,000 visitors since opening. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["has welcomed", "welcomed", "had welcomed", "welcomes"],
          answer: 0,
          explain:
            "'Since opening' specifically points to present perfect tense, an action that started at a past point and continues to matter up to now. Simple past 'welcomed' doesn't pair correctly with 'since.'",
          difficulty: "easy",
        },
        {
          q: "After years of research, the team finally managed ______ a working prototype. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["to build", "building", "built", "builds"],
          answer: 0,
          explain:
            "This isn't about timeline — it's about which form 'managed' grammatically requires after it. 'Manage' is one of many verbs that must be followed by an infinitive, not the '-ing' form, unlike 'enjoy,' which instead requires the '-ing' form.",
          difficulty: "medium",
        },
        {
          q: "A decade after first publishing his theory, the physicist ______ additional evidence that ultimately confirmed it. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["gathered", "had gathered", "has gathered", "was gathering"],
          answer: 0,
          explain:
            "'A decade after first publishing' places us at one specific later point, and the sentence describes a single completed action at that point, not two separate past events and not something continuing to now. Simple past fits — not 'had gathered,' which would wrongly imply this happened before some other past event, and not 'has gathered,' which would wrongly imply relevance continuing to now.",
          difficulty: "medium",
        },
        {
          q: "Having ______ the same experiment for the third time, the researchers finally decided ______ their original hypothesis entirely. Which choice completes both blanks so that the text conforms to the conventions of Standard English?",
          choices: ["repeated / to abandon", "repeating / to abandon", "repeated / abandoning", "repeat / abandon"],
          answer: 0,
          explain:
            "The first blank follows 'Having,' which requires a past participle to form a perfect participial phrase showing a completed action before the main clause — 'Having repeated,' not 'having repeating' or 'having repeat.' The second blank follows 'decided,' a verb that requires an infinitive afterward, not a gerund — 'decided to abandon,' not 'decided abandoning.' Each blank follows its own specific rule.",
          difficulty: "hard",
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
        "This pattern tests whether an introductory phrase correctly describes the subject right after it. A modifier — usually a phrase without its own subject, often starting with an '-ing' or '-ed' word — is only correctly placed if the noun right after the comma is the thing actually doing what the phrase describes. A 'dangling modifier' happens when the phrase describes someone who never actually shows up as the following subject. The fix is always the same: figure out who or what the modifier is really describing, then make sure that exact noun comes right after it as the sentence's subject.",
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
            "'Having ignored those concerns' requires a subject capable of ignoring something — a person or group, like the proposal's authors — not the proposal itself, which can't ignore anything. This dangling-modifier pattern applies to any sentence in a passage, not just the first one. Only the first choice supplies a subject capable of the action the modifier describes.",
          difficulty: "hard",
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
        "A finite verb can be a sentence's complete main verb on its own — it shows tense and matches its subject (runs, ran, is running). A non-finite form — an infinitive ('to run'), a gerund ('running' as a noun), or a participle ('having run,' or '-ing'/'-ed' as a modifier) — can NOT stand alone as the main verb. These questions test which form a spot needs. Two shapes come up constantly: (1) a phrase attaches to an already-complete sentence, and using a finite verb there accidentally creates a run-on — a participle was needed instead; (2) a question gets embedded inside a bigger sentence, which needs plain statement word order (subject, then verb — no inversion, no question mark), not a standalone question's flipped order. The method: find the sentence's one true finite main verb first. Anything else that looks verb-like needs a non-finite form.",
      examples: [
        {
          q: "The committee, ______ every application twice, still could not reach a unanimous decision. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["reviewing", "reviewed", "reviews", "having review"],
          answer: 0,
          explain:
            "The sentence's one finite main verb is 'could not reach.' Since that spot is already filled, the phrase between the commas needs a non-finite form describing the committee's action. 'Reviewing' (a participle) correctly modifies 'the committee' without competing for the role of main verb; 'reviewed' or 'reviews' would each wrongly try to act as a second finite verb, creating a run-on.",
          difficulty: "easy",
        },
        {
          q: "The scientists hoped ______ a treatment before the funding expired. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["to discover", "discovering", "discovered", "discovers"],
          answer: 0,
          explain:
            "'Hoped' is the sentence's finite main verb and specifically requires an infinitive to complete its meaning ('hoped to do something'), not a gerund or a second finite verb.",
          difficulty: "easy",
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
            "'Why the machine had stopped' functions as a noun clause — the object of 'explain' — not a standalone question. An embedded clause like this uses ordinary statement word order: subject before its verb, no inversion. The other choices incorrectly apply question-word-order inversion inside an embedded clause.",
          difficulty: "medium",
        },
        {
          q: "The engineer inspected the bridge's support beams, ______ three hairline cracks that had gone unnoticed for years. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["finding", "found", "finds", "having find"],
          answer: 0,
          explain:
            "The finite main verb is 'inspected.' Since the clause already has its finite verb, the phrase after the comma needs a non-finite form to attach to it, describing what the engineer discovered while inspecting. 'Finding' (participle) correctly attaches as a modifying phrase; 'found' would be a second finite verb with no conjunction connecting it, creating a comma splice.",
          difficulty: "medium",
        },
        {
          q: "Historians still debate ______ the empire's sudden decline, though few dispute that its trade routes shifted dramatically in the same period. Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: ["what caused", "what did cause", "what has caused it", "what causing"],
          answer: 0,
          explain:
            "'What caused the empire's sudden decline' is an embedded noun clause functioning as the object of 'debate,' not a standalone question. Embedded clauses use statement word order, not the inverted 'did' construction a standalone question would use. The second half of the sentence is a separate, correctly-formed independent clause and doesn't affect which form belongs in the first blank.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Using a second finite verb in a phrase that attaches to an already-complete independent clause, accidentally creating a run-on or comma splice instead of the needed participle.",
        "Inverting the subject and verb — or adding 'do/does/did' — inside an embedded question that functions as a noun clause, rather than using plain statement word order.",
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
            "Distribute the 5: 5x + 10 = 3x + 18. Subtract 3x from both sides: 2x + 10 = 18. Subtract 10: 2x = 8. Divide by 2: x = 4. Choice B comes from forgetting to distribute the 5 across both terms. Choice C comes from adding 3x to both sides instead of subtracting. Choice D comes from a sign error in the final division.",
          difficulty: "easy",
        },
        {
          q: "Solve for x: -3(x - 4) + 2 = x - 10",
          choices: ["6", "0", "-6", "4"],
          answer: 0,
          explain:
            "Distribute the -3 carefully: -3x + 12 + 2 = x - 10, which simplifies to -3x + 14 = x - 10. Add 3x to both sides: 14 = 4x - 10. Add 10: 24 = 4x. Divide by 4: x = 6. Choice B comes from distributing -3 incorrectly as -3x - 12 instead of -3x + 12. Choice C comes from a sign error in the final step. Choice D comes from an arithmetic slip combining 14 and 10.",
          difficulty: "medium",
        },
        {
          q: "Solve for x: 3x - 4 = 11",
          choices: ["5", "15", "-5", "7"],
          answer: 0,
          explain:
            "Add 4 to both sides: 3x = 15. Divide by 3: x = 5. Choice B comes from forgetting to divide by 3 after isolating 3x. Choice C comes from a sign error. Choice D comes from subtracting 4 instead of adding it to both sides.",
          difficulty: "easy",
        },
        {
          q: "Solve for x: 2(3x - 1) + 5 = 4(x + 3)",
          choices: ["4.5", "9", "1.5", "-4.5"],
          answer: 0,
          explain:
            "Distribute on both sides: 6x - 2 + 5 = 4x + 12, simplifying to 6x + 3 = 4x + 12. Subtract 4x: 2x + 3 = 12. Subtract 3 and divide by 2: 2x = 9, so x = 4.5. Choice B comes from forgetting to divide by 2 in the final step. Choice C comes from a division error. Choice D comes from a sign error.",
          difficulty: "medium",
        },
        {
          q: "Solve for x: x/4 + x/6 = 5",
          choices: ["12", "20", "10", "60"],
          answer: 0,
          explain:
            "Clear the fractions by multiplying every term by the least common denominator, 12: 3x + 2x = 60. Combine like terms: 5x = 60, so x = 12. Choice B comes from a common LCD error. Choice C comes from using an incorrect denominator guess instead of 12. Choice D comes from forgetting to divide by 5 in the last step.",
          difficulty: "hard",
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
        },
        {
          q: "For which value of k does the equation 3(x + 2) = 3x + k have infinitely many solutions?",
          choices: ["6", "2", "3", "-6"],
          answer: 0,
          explain:
            "Distribute the 3 on the left: 3x + 6 = 3x + k. Subtract 3x from both sides: 6 = k. The x-terms have fully canceled, so everything now depends on whether the remaining statement is true. If k = 6, the equation becomes 6 = 6, true no matter what x is, meaning every real number is a solution.",
          difficulty: "medium",
        },
        {
          q: "For which value of k does the equation 2x + 5 = 2x + k have infinitely many solutions?",
          choices: ["5", "2", "0", "-5"],
          answer: 0,
          explain:
            "Subtract 2x from both sides: 5 = k. The x-terms have fully canceled, so the equation's truth now depends only on this remaining statement. k = 5 makes it 5 = 5, true for every value of x, giving infinitely many solutions.",
          difficulty: "easy",
        },
        {
          q: "For which value of k does the equation 5x - 3(x + 4) = 2x + k have infinitely many solutions?",
          choices: ["-12", "12", "-3", "0"],
          answer: 0,
          explain:
            "Simplify the left side first — distribute and combine like terms: 5x - 3x - 12 = 2x + k, which becomes 2x - 12 = 2x + k. The x-terms only visibly match after simplifying, so you have to distribute first to see it. Subtracting 2x from both sides leaves -12 = k, so k = -12 makes the remaining statement true for every x.",
          difficulty: "medium",
        },
        {
          q: "For which value of k does the equation 0.5(4x + 6) = 2x + k have infinitely many solutions?",
          choices: ["3", "6", "2", "-3"],
          answer: 0,
          explain:
            "Distribute the 0.5 on the left side: 0.5(4x) + 0.5(6) = 2x + 3. The equation is now 2x + 3 = 2x + k, and the x-terms already match. Subtract 2x from both sides: 3 = k. Distributing the decimal coefficient first is the extra step that reveals the matching x-terms.",
          difficulty: "hard",
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
        "Some questions ask for the value of an expression involving x — like x − 7 or 2x — instead of x itself. The fast method: manipulate the whole equation so it isolates the exact expression being asked for, instead of solving all the way down to x and substituting afterward. Watch for this whenever the question asks for an expression, not a plain 'what is x.' Dividing, adding, or combining terms to land exactly on that expression is almost always faster than solving for x first.",
      examples: [
        {
          q: "If 4x - 28 = -24, what is the value of x - 7?",
          choices: ["-6", "-1", "1", "6"],
          answer: 0,
          explain:
            "The equation already contains '4x,' and the target expression is 'x - 7' — dividing the entire equation by 4 directly produces 'x - 7' on the left side. Divide every term by 4: (4x - 28)/4 = -24/4, giving x - 7 = -6. There's no need to solve for x itself and then subtract 7 separately.",
          difficulty: "easy",
        },
        {
          q: "If 3x + 12 = 27, what is the value of x + 4?",
          choices: ["9", "5", "15", "-9"],
          answer: 0,
          explain:
            "The target expression 'x + 4' is exactly the original equation divided by 3 (3x/3 = x, 12/3 = 4). Divide every term by 3: (3x + 12)/3 = 27/3, giving x + 4 = 9 directly.",
          difficulty: "easy",
        },
        {
          q: "If 6x - 9 = 21, what is the value of 2x - 3?",
          choices: ["7", "5", "21", "-7"],
          answer: 0,
          explain:
            "'2x - 3' is exactly one-third of '6x - 9' (since 6x/3 = 2x and 9/3 = 3). Divide the entire equation by 3: (6x - 9)/3 = 21/3, giving 2x - 3 = 7 directly.",
          difficulty: "medium",
        },
        {
          q: "If 5x + 2y = 18 and y = 4, what is the value of 5x?",
          choices: ["10", "2", "18", "26"],
          answer: 0,
          explain:
            "Substitute y = 4 directly into the equation: 5x + 2(4) = 18, which simplifies to 5x + 8 = 18. Subtract 8 from both sides to isolate the exact requested expression '5x': 5x = 10. There's no need to divide by 5 and find x itself, since the question only asks for '5x.'",
          difficulty: "medium",
        },
        {
          q: "If 3x + 2y = 20 and x - 2y = 4, what is the value of 4x?",
          choices: ["24", "6", "16", "12"],
          answer: 0,
          explain:
            "Adding the two equations directly eliminates y: (3x + 2y) + (x - 2y) = 20 + 4, giving 4x = 24. This happens to be the exact requested expression already — no further work needed. Solving for x individually (x = 6) and then multiplying by 4 would reach the same answer but requires an unnecessary extra step.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Automatically solving all the way for x out of habit, even when the question never asks for x itself and a faster shortcut is available.",
        "Isolating the wrong combination of terms — one that looks similar to the requested expression but isn't an exact match.",
        "Making an arithmetic slip when scaling the equation to match the requested expression's exact coefficient.",
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
        },
        {
          q: "A rabbit eats 25 calories per hour while resting. Which equation gives the total calories, C, the rabbit eats resting for h hours?",
          choices: ["C = 25h", "C = 25 + h", "C = h/25", "C = 25 - h"],
          answer: 0,
          explain:
            "'Per hour' signals a rate that gets multiplied by the number of hours: total calories = rate × time, so C = 25h. The other choices each mistranslate the rate relationship as addition, division, or subtraction.",
          difficulty: "easy",
        },
        {
          q: "A number decreased by 12 is the same as 3 times the number. Which equation represents this situation, using n for the number?",
          choices: ["n - 12 = 3n", "12 - n = 3n", "n - 12 = n/3", "3n - 12 = n"],
          answer: 0,
          explain:
            "'A number decreased by 12' translates to n - 12 — 'decreased by' keeps the same word order as spoken, the number first, then subtract 12. '3 times the number' translates to 3n, and 'is the same as' becomes the equals sign: n - 12 = 3n. Choice B reverses which quantity is subtracted from which.",
          difficulty: "medium",
        },
        {
          q: "12 less than a number is 45. Which equation represents this situation, using n for the number?",
          choices: ["n - 12 = 45", "12 - n = 45", "n + 12 = 45", "12n = 45"],
          answer: 0,
          explain:
            "'12 less than a number' is a reversed-order phrase — despite '12' appearing first in the sentence, it's the number that comes first in the equation, with 12 subtracted from it: n - 12 = 45. Choice B is a common error that reverses which quantity is being subtracted from which.",
          difficulty: "medium",
        },
        {
          q: "A plant is currently 8 centimeters tall and grows at a constant rate of 2 centimeters per week. Which equation gives the plant's height, H, after w weeks?",
          choices: ["H = 8 + 2w", "H = 2 + 8w", "H = 8w + 2", "H = 8 - 2w"],
          answer: 0,
          explain:
            "Identify the starting value (8, present even at w = 0) and the rate of change (2 centimeters per week, multiplied by w), then combine them: H = 8 + 2w. The other choices each swap which number is the fixed start and which is the rate, or use the wrong operation.",
          difficulty: "hard",
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
        "Many linear function questions are word problems where you translate a real-world description into slope and y-intercept. The reliable trick: the y-intercept is always the 'starting value' or 'flat fee' — the amount present when the input is zero. The slope is always the 'rate' or 'per unit' language, like per mile or per month. Once you know which number plays which role, writing the function is just mechanical.",
      examples: [
        {
          q: "A taxi charges $3 plus $2 per mile. Which function models the cost C for m miles?",
          choices: ["C = 2m + 3", "C = 3m + 2", "C = 2m - 3", "C = 5m"],
          answer: 0,
          explain:
            "The flat fee (y-intercept) is $3, the amount charged even for zero miles. The rate (slope) is $2 per mile, the amount added for each additional mile. Choice B swaps which number is the rate and which is the flat fee. Choice C uses the wrong sign, and choice D incorrectly adds the two numbers together into a single rate.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "y-int = 3", at: "left" }], slopeLabel: "slope = 2" },
          difficulty: "easy",
        },
        {
          q: "A water tank starts with 200 gallons and drains at a rate of 15 gallons per minute. Which function models the amount of water W remaining after m minutes?",
          choices: ["W = -15m + 200", "W = 15m + 200", "W = -15m - 200", "W = 200m - 15"],
          answer: 0,
          explain:
            "The starting value (y-intercept) is 200 gallons, the amount present at m = 0. The rate (slope) is 15 gallons per minute, but since the tank is draining, the amount is decreasing, so the rate needs a negative sign. Choice B forgets the negative sign entirely, and choices C and D each misplace the negative sign or swap the roles of the two numbers.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "y-int = 200", at: "left" }], slopeLabel: "slope = -15" },
          difficulty: "medium",
        },
        {
          q: "A gym charges a $20 sign-up fee plus $15 per month. Which function models the total cost C after m months?",
          choices: ["C = 15m + 20", "C = 20m + 15", "C = 15m - 20", "C = 35m"],
          answer: 0,
          explain:
            "The flat fee (y-intercept) is $20, charged once regardless of months. The rate (slope) is $15 per month. Choice B swaps which number is the rate and which is the flat fee, choice C uses the wrong sign, and choice D incorrectly combines the two numbers into a single rate.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "y-int = 20", at: "left" }], slopeLabel: "slope = 15" },
          difficulty: "easy",
        },
        {
          q: "A candle is 8 inches tall when lit and burns down at a rate that reduces its height by half an inch every 20 minutes. Which function models the candle's height H after t minutes?",
          choices: ["H = -0.025t + 8", "H = 0.025t + 8", "H = -0.5t + 8", "H = -0.025t - 8"],
          answer: 0,
          explain:
            "The starting value (y-intercept) is 8 inches at t = 0. The tricky part is converting 'half an inch every 20 minutes' into a per-minute rate first: 0.5 / 20 = 0.025 inches per minute, and since the candle is burning down, this rate must be negative. Choice B forgets the negative sign, choice C forgets to convert the rate to a per-minute basis, and choice D applies the negative sign to the wrong number.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "y-int = 8", at: "left" }], slopeLabel: "slope = -0.025" },
          difficulty: "medium",
        },
        {
          q: "A moving company charges a flat fee plus a per-mile rate. A 50-mile move costs $350, and a 120-mile move costs $560. Which function models the cost C for a move of m miles?",
          choices: ["C = 3m + 200", "C = 3m + 350", "C = 7m + 200", "C = 3m - 200"],
          answer: 0,
          explain:
            "Unlike a scenario that states the flat fee and rate directly, here both must be derived from two cost/mileage pairs. The rate (slope) is (560 - 350) / (120 - 50) = 210 / 70 = 3 dollars per mile. Using the rate and one data point to find the flat fee: 350 = 3(50) + b, so b = 200, giving C = 3m + 200. Choice B mistakes one of the cost values for the flat fee, choice C uses an incorrect rate, and choice D uses the wrong sign on the flat fee.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "(50, 350)", at: "left" }, { label: "(120, 560)", at: "right" }] },
          difficulty: "hard",
        },
      ],
      traps: [
        "Swapping which number is the slope and which is the intercept, especially when the flat fee is mentioned first in the sentence.",
        "Forgetting that a decreasing quantity (like a draining tank) needs a negative sign on the rate term, not just the rate's numeric value.",
      ],
    },
    {
      name: "Reading Slope and Intercept Directly from a Graph",
      explanation:
        "This pattern gives you a line's graph — not an equation or table — and asks for its slope, y-intercept, or a specific value. No algebra needed: read the y-intercept where the line crosses the y-axis. Find the slope by picking two clearly marked points and computing rise over run — count grid squares directly instead of estimating.",
      examples: [
        {
          q: "A line is graphed passing through the marked points (0, 3) and (2, 7). What is the y-intercept of the line?",
          choices: ["3", "7", "2", "0"],
          answer: 0,
          explain:
            "The y-intercept is simply the point where the line crosses the y-axis, i.e., where x = 0. The graph shows the line passing through (0, 3) — that point directly is the y-intercept, read straight off the graph with no calculation needed.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "(0, 3)", at: "left" }, { label: "(2, 7)", at: "right" }] },
          difficulty: "easy",
        },
        {
          q: "A line is graphed passing through the marked points (1, 2) and (3, 8). What is the slope of the line?",
          choices: ["3", "6", "2", "1/3"],
          answer: 0,
          explain:
            "Compute rise over run between the two marked points: (8 - 2) / (3 - 1) = 6 / 2 = 3. Counting grid squares directly confirms it: from (1,2) to (3,8) is 2 squares right and 6 squares up, matching a slope of 3.",
          diagram: { kind: "lineGraph", direction: "steepPos", points: [{ label: "(1, 2)", at: "left" }, { label: "(3, 8)", at: "right" }] },
          difficulty: "easy",
        },
        {
          q: "A line is graphed on axes where each gridline is worth 5 units, not 1. The line crosses the y-axis exactly 2 gridlines above the origin. What is the y-intercept of the line?",
          choices: ["10", "2", "7", "5"],
          answer: 0,
          explain:
            "The axes are scaled at 5 units per gridline, not the default 1 unit — easy to miss if you count gridlines as if each were worth 1. The line crosses the y-axis 2 gridlines up, and since each gridline equals 5 units, that's 2 × 5 = 10. Choice B is the trap that forgets to apply the scale.",
          diagram: { kind: "lineGraph", direction: "gentlePos", points: [{ label: "y-int", at: "left" }] },
          difficulty: "medium",
        },
        {
          q: "A line is graphed crossing the x-axis at (4, 0) and the y-axis at (0, 8). What is the slope of the line?",
          choices: ["-2", "2", "-1/2", "4"],
          answer: 0,
          explain:
            "Using the two marked points where the line crosses each axis, (4, 0) and (0, 8): slope = (8 - 0) / (0 - 4) = 8 / (-4) = -2. The line falling from upper-left to lower-right on the graph visually confirms a negative slope.",
          diagram: { kind: "lineGraph", direction: "steepNeg", points: [{ label: "(0, 8)", at: "left" }, { label: "(4, 0)", at: "right" }] },
          difficulty: "medium",
        },
        {
          q: "A line is graphed on axes where each gridline represents 3 units. The line passes through the marked points (1 gridline right, 4 gridlines up) and (3 gridlines right, 2 gridlines up) from the origin. What is the y-intercept of the line, in actual units?",
          choices: ["15", "12", "-1", "3"],
          answer: 0,
          explain:
            "Convert grid positions to actual coordinates using the scale (3 units per gridline): the two points become (3, 12) and (9, 6). The slope is (6 - 12) / (9 - 3) = -6 / 6 = -1. Using one point and the slope to solve for the y-intercept: 12 = -1(3) + b, so b = 15 — this value isn't a point directly marked on the graph, so it has to be found by extending the line's equation back to x = 0.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "(3, 12)", at: "left" }, { label: "(9, 6)", at: "right" }] },
          difficulty: "hard",
        },
      ],
      traps: [
        "Misreading which axis is which, especially when the graph's scale isn't 1 unit per gridline.",
        "Picking two points that aren't both exactly on the line (estimating rather than using clearly marked grid intersections).",
        "Confusing the x-intercept (where the line crosses the x-axis) with the y-intercept when the question asks for one specifically.",
      ],
    },
    {
      name: "Finding Slope from Two Points or Function Values",
      explanation:
        "This pattern gives you two data points — either as coordinate pairs, or as two function values like f(2) and f(5) — and asks for the slope, or asks you to use the slope to find another value. The formula is always change in output divided by change in input. The real skill is correctly telling which numbers are inputs and which are outputs, especially in a word problem instead of plain coordinates.",
      examples: [
        {
          q: "A linear function f has f(0) = 4 and f(3) = 13. What is the slope of f?",
          choices: ["3", "9", "1/3", "4"],
          answer: 0,
          explain:
            "Translate function notation into coordinate pairs: f(0) = 4 means the point (0, 4); f(3) = 13 means the point (3, 13). The slope is (change in output) / (change in input) = (13 - 4) / (3 - 0) = 9 / 3 = 3.",
          diagram: { kind: "lineGraph", direction: "steepPos", points: [{ label: "(0, 4)", at: "left" }, { label: "(3, 13)", at: "right" }] },
          difficulty: "easy",
        },
        {
          q: "A linear function g has g(-2) = 9 and g(4) = -3. What is the slope of g?",
          choices: ["-2", "2", "-12", "-6"],
          answer: 0,
          explain:
            "Translate function notation into coordinate pairs: g(-2) = 9 means the point (-2, 9); g(4) = -3 means the point (4, -3). The slope is (-3 - 9) / (4 - (-2)) = -12 / 6 = -2 — the negative numbers make this a good check on sign carefulness.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "(-2, 9)", at: "left" }, { label: "(4, -3)", at: "right" }] },
          difficulty: "medium",
        },
        {
          q: "A linear function h has h(1) = 7 and h(4) = 16. What is the slope of h?",
          choices: ["3", "9", "23", "1/3"],
          answer: 0,
          explain:
            "Translate function notation into coordinate pairs: h(1) = 7 means (1, 7); h(4) = 16 means (4, 16). The slope is (16 - 7) / (4 - 1) = 9 / 3 = 3.",
          diagram: { kind: "lineGraph", direction: "steepPos", points: [{ label: "(1, 7)", at: "left" }, { label: "(4, 16)", at: "right" }] },
          difficulty: "easy",
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
        },
        {
          q: "A linear function's values are shown in a table: when x = -3, y = 22; when x = 1, y = 10; when x = 6, y = -5. What is the slope of the function?",
          choices: ["-3", "3", "-12", "22"],
          answer: 0,
          explain:
            "Any two points from a linear function's table give the same slope, so pick a convenient pair: (10 - 22) / (1 - (-3)) = -12 / 4 = -3. Checking with the third point, from (1, 10) to (6, -5): (-5 - 10) / (6 - 1) = -15 / 5 = -3, the same value, confirming consistency.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", points: [{ label: "(-3, 22)", at: "left" }, { label: "(6, -5)", at: "right" }] },
          difficulty: "hard",
        },
      ],
      traps: [
        "Flipping the slope formula's numerator and denominator (using change in input over change in output).",
        "Misreading function notation, forgetting that f(3) means 'the output when input is 3,' not 'f times 3.'",
      ],
    },
    {
      name: "Evaluating a Function and Solving for Input Given Output",
      explanation:
        "This is the most basic linear-function skill, and it's easy to overlook: plug a given input directly into a function's rule to find its output, f(a) — or run it backward, given an output, to solve for the input. Neither direction needs a graph or a second point; it's just substitution and algebra. To find f(a): substitute a for every x in the rule and simplify. To find x such that f(x) = b: set the rule equal to b and solve for x.",
      examples: [
        {
          q: "The function is defined by f(x) = 7x + 1. What is f(4)?",
          choices: ["29", "28", "32", "11"],
          answer: 0,
          explain: "Substitute x = 4 into the rule: f(4) = 7(4) + 1 = 28 + 1 = 29.",
          difficulty: "easy",
        },
        {
          q: "The function is defined by g(x) = -3x + 10. What is g(-2)?",
          choices: ["16", "4", "-16", "13"],
          answer: 0,
          explain:
            "Substitute x = -2 into the rule, being careful with the sign: g(-2) = -3(-2) + 10 = 6 + 10 = 16 — a negative input multiplied by a negative coefficient produces a positive term.",
          difficulty: "easy",
        },
        {
          q: "The function is defined by h(x) = 5x - 8. For what value of x does h(x) = 27?",
          choices: ["7", "35", "3.8", "19"],
          answer: 0,
          explain: "Set the rule equal to the given output: 5x - 8 = 27. Add 8 to both sides: 5x = 35. Divide by 5: x = 7.",
          difficulty: "medium",
        },
        {
          q: "The function is defined by f(x) = (2/3)x + 4. What is f(9)?",
          choices: ["10", "6", "13", "8.67"],
          answer: 0,
          explain: "Substitute x = 9: f(9) = (2/3)(9) + 4. Simplify the fraction times 9 first: (2/3)(9) = 6, then add: 6 + 4 = 10.",
          difficulty: "medium",
        },
        {
          q: "The function is defined by k(x) = 4x - 9. If k(2n) = 15, what is the value of n?",
          choices: ["3", "6", "1.5", "24"],
          answer: 0,
          explain:
            "The input here isn't a plain number but an expression, 2n — substitute it exactly as given: k(2n) = 4(2n) - 9 = 8n - 9. Set this equal to the given output: 8n - 9 = 15, so 8n = 24 and n = 3. The input being an expression rather than a plain number doesn't change the method, just the algebra required after substituting.",
          difficulty: "hard",
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
      name: "Extracting Slope from Standard Form",
      explanation:
        "Lines are often given in standard form (Ax + By = C) instead of slope-intercept form, and many students waste time trying to read the slope straight from it. The reliable method: always convert to slope-intercept form (y = mx + b) first by isolating y, then read off the slope. This one habit eliminates nearly all errors on this pattern.",
      examples: [
        {
          q: "What is the slope of the line 4x + 2y = 8?",
          choices: ["-2", "2", "4", "-4"],
          answer: 0,
          explain:
            "Isolate y by moving 4x to the other side: 2y = -4x + 8. Divide every term by 2: y = -2x + 4. The slope is directly readable as the coefficient of x: -2, not the coefficient from the original standard form.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -2" },
          difficulty: "easy",
        },
        {
          q: "What is the slope of the line 6x - 3y = 12?",
          choices: ["2", "-2", "6", "-6"],
          answer: 0,
          explain:
            "Isolate y by moving 6x to the other side: -3y = -6x + 12. Divide every term by -3, being careful with the negative signs: y = 2x - 4. Dividing by a negative coefficient here still produces a positive slope, since both terms being divided were negative.",
          diagram: { kind: "lineGraph", direction: "gentlePos", slopeLabel: "slope = 2" },
          difficulty: "medium",
        },
        {
          q: "What is the slope of the line 2x + y = 5?",
          choices: ["-2", "2", "5", "-5"],
          answer: 0,
          explain: "Isolate y by subtracting 2x from both sides: y = -2x + 5. The slope is directly readable as the coefficient of x: -2.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -2" },
          difficulty: "easy",
        },
        {
          q: "What is the slope of the line 5x + 4y = 20?",
          choices: ["-5/4", "5/4", "5", "-4/5"],
          answer: 0,
          explain:
            "Isolate y by moving 5x to the other side: 4y = -5x + 20. Divide every term by 4: y = -(5/4)x + 5. The slope is the coefficient of x: -5/4 — the fraction just needs to be carried through the division carefully.",
          diagram: { kind: "lineGraph", direction: "steepNeg", slopeLabel: "slope = -5/4" },
          difficulty: "medium",
        },
        {
          q: "What is the slope of the line -3x - 6y = 18?",
          choices: ["-1/2", "1/2", "-2", "2"],
          answer: 0,
          explain:
            "Isolate y by adding 3x to both sides: -6y = 3x + 18. Divide every term by -6, tracking both sign flips carefully: y = -0.5x - 3. The slope is the coefficient of x: -1/2.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -1/2" },
          difficulty: "hard",
        },
      ],
      traps: [
        "Reading the coefficient of x in standard form directly as the slope, without converting — this gives the wrong sign or value.",
        "Sign errors when dividing negative coefficients across the equation.",
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
        },
        {
          q: "A line has slope 3/2. Which relationship does it have to the line 3x - 2y = 8?",
          choices: ["Parallel", "Perpendicular", "The same line", "Neither parallel nor perpendicular"],
          answer: 0,
          explain:
            "Convert to slope-intercept form first: -2y = -3x + 8, so y = (3/2)x - 4. The slope of the given line is 3/2. Parallel lines share the exact same slope (unlike perpendicular lines, which need the negative reciprocal), so a line with slope 3/2 is parallel — this required converting from standard form first before the comparison was possible.",
          diagram: { kind: "lineGraph", direction: "gentlePos", slopeLabel: "slope = 3/2", extra: { direction: "gentlePos", label: "parallel: slope = 3/2" } },
          difficulty: "medium",
        },
        {
          q: "A line has slope 4. Which relationship does it have to the line y = 4x - 1?",
          choices: ["Parallel", "Perpendicular", "Neither parallel nor perpendicular", "The same line"],
          answer: 0,
          explain: "The given line's slope is 4. Parallel lines share the exact same slope, so a line with slope 4 is parallel.",
          diagram: { kind: "lineGraph", direction: "steepPos", slopeLabel: "slope = 4", extra: { direction: "steepPos", label: "parallel: slope = 4" } },
          difficulty: "easy",
        },
        {
          q: "A line has slope 2. Which relationship does it have to the line 2x + 4y = 16?",
          choices: ["Perpendicular", "Parallel", "The same line", "Neither parallel nor perpendicular"],
          answer: 0,
          explain:
            "Convert to slope-intercept form first: 4y = -2x + 16, so y = -0.5x + 4. The given slope is -1/2. For a perpendicular line, take the negative reciprocal: flip the fraction (2/1) and change the sign, giving 2, which matches the described line.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -1/2", extra: { direction: "steepPos", label: "perpendicular: slope = 2" } },
          difficulty: "medium",
        },
        {
          q: "Two lines are given: 4x + 6y = 12 and 6x - 4y = 8. Are these two lines parallel, perpendicular, or neither?",
          choices: ["Perpendicular", "Parallel", "Neither parallel nor perpendicular", "The same line"],
          answer: 0,
          explain:
            "Convert both to slope-intercept form. Line 1: 6y = -4x + 12, so y = -(2/3)x + 2, slope = -2/3. Line 2: -4y = -6x + 8, so y = (3/2)x - 2, slope = 3/2. Multiplying the two slopes gives (-2/3)(3/2) = -1, confirming they are negative reciprocals of each other, so the lines are perpendicular.",
          diagram: { kind: "lineGraph", direction: "gentleNeg", slopeLabel: "slope = -2/3", extra: { direction: "steepPos", label: "slope = 3/2" } },
          difficulty: "hard",
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
        "This pattern gives you a linear equation that already models a real situation, and asks what a specific number in it represents — you're reading backward from a given equation, not building one from scratch. The method: figure out what each variable stands for from the setup, then match the number's role to what that means in context. A number multiplying a variable is a rate tied to that variable. A number standing alone — not multiplying anything — is a fixed amount, present no matter what the variables equal.",
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
        },
        {
          q: "A farm has both chickens and cows. Chickens have 2 legs and cows have 4 legs. Which equation shows that the animals on the farm have a total of 172 legs, where h is the number of chickens and w is the number of cows?",
          choices: ["2h + 4w = 172", "4h + 2w = 172", "2h + 4w = 172 - h - w", "h + w = 172"],
          answer: 0,
          explain:
            "Each chicken contributes 2 legs, so chicken legs total 2h; each cow contributes 4 legs, so cow legs total 4w. Together they equal the given total: 2h + 4w = 172.",
          difficulty: "easy",
        },
        {
          q: "A gym charges a one-time $50 enrollment fee plus $30 per month of membership. Which equation gives the total amount paid, T, after m months of membership?",
          choices: ["T = 50 + 30m", "T = 30 + 50m", "T = 50m + 30", "T = 80m"],
          answer: 0,
          explain:
            "The enrollment fee is paid once, regardless of how many months pass — it's a fixed constant, not multiplied by anything. The monthly charge, $30, is multiplied by the number of months, m: T = 50 + 30m.",
          difficulty: "medium",
        },
        {
          q: "A rectangular garden's perimeter is 60 feet. Which equation relates its length, l, and width, w?",
          choices: ["2l + 2w = 60", "l + w = 60", "l × w = 60", "2l - 2w = 60"],
          answer: 0,
          explain:
            "Recall the perimeter formula for a rectangle: P = 2l + 2w, since there are two lengths and two widths. Substituting the given perimeter gives 2l + 2w = 60.",
          difficulty: "medium",
        },
        {
          q: "A chemist mixes a solution that is 20% acid with a solution that is 50% acid to create 12 liters of a mixture. Which equation shows that the resulting mixture is 30% acid, where x is the number of liters of the 20% solution and y is the number of liters of the 50% solution?",
          choices: ["0.20x + 0.50y = 3.6", "0.20x + 0.50y = 0.30", "20x + 50y = 30", "0.20x + 0.50y = 12"],
          answer: 0,
          explain:
            "The total acid contributed by each solution is its concentration times its volume: 0.20x from the first, 0.50y from the second. The final mixture's total acid content is its concentration times its total volume: 0.30(12) = 3.6. Setting the sum of the contributed acid equal to that total gives 0.20x + 0.50y = 3.6.",
          difficulty: "hard",
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
        },
        {
          q: "The equation 4a - b = 15 relates a and b. If a = 6, what is the value of b?",
          choices: ["9", "-9", "39", "3"],
          answer: 0,
          explain:
            "Substitute a = 6: 4(6) - b = 15, which simplifies to 24 - b = 15. Subtract 24 from both sides: -b = -9. Multiply both sides by -1: b = 9 — solving for a variable with a negative coefficient requires this extra sign flip at the end.",
          difficulty: "easy",
        },
        {
          q: "A city recorded x + y = 1,440 minutes of daylight (x) and non-daylight (y) in a day. If the city had 620 minutes of daylight, how many minutes of non-daylight did it have?",
          choices: ["820", "620", "1440", "2060"],
          answer: 0,
          explain: "Substitute x = 620 into the equation: 620 + y = 1,440. Subtract 620 from both sides: y = 820.",
          difficulty: "medium",
        },
        {
          q: "The equation 2x + 5y = 34 relates x and y. If y = 2x, what is the value of x?",
          choices: ["17/6", "17/3", "34/7", "2"],
          answer: 0,
          explain:
            "Here the 'known value' isn't a plain number but an expression in terms of the other variable — substitute y = 2x directly into the equation: 2x + 5(2x) = 34, which simplifies to 12x = 34, so x = 34/12 = 17/6. Choice B comes from dividing by 6 instead of 12, and choice C comes from adding the coefficients incorrectly.",
          difficulty: "medium",
        },
        {
          q: "A phone plan's monthly cost is modeled by C = 25 + 0.10m, where m is minutes used beyond the plan's included minutes. If a customer's bill was $52.50, how many minutes beyond the included minutes did they use?",
          choices: ["275", "27.5", "2.75", "525"],
          answer: 0,
          explain:
            "Substitute the known cost, C = 52.50: 52.50 = 25 + 0.10m. Subtract 25 from both sides: 27.50 = 0.10m. Divide both sides by 0.10: m = 275.",
          difficulty: "hard",
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
      name: "Solving for a Specific Value via Elimination",
      explanation:
        "The most common systems pattern asks you to solve for one variable (or a specific expression) using two equations. Elimination — adding or subtracting the equations to cancel one variable — is almost always faster than substitution, especially when the equations are already in a similar form and the coefficients line up or can be easily matched.",
      examples: [
        {
          q: "Solve the system: x + y = 10, x - y = 2. What is x?",
          choices: ["6", "4", "8", "12"],
          answer: 0,
          explain:
            "Adding the two equations directly cancels the y-terms (since one is +y and the other is -y): (x + y) + (x - y) = 10 + 2, giving 2x = 12, so x = 6.",
          difficulty: "easy",
        },
        {
          q: "Solve the system: 3x + 2y = 16, 3x - 5y = -12. What is y?",
          choices: ["4", "-4", "28", "7"],
          answer: 0,
          explain:
            "Both equations already have a matching 3x term, so subtracting one equation from the other eliminates x. Subtracting carefully, distributing the negative sign across the whole second equation: (3x + 2y) - (3x - 5y) = 16 - (-12), giving 7y = 28, so y = 4.",
          difficulty: "medium",
        },
        {
          q: "Solve the system: x + 2y = 12, x - 2y = 4. What is x?",
          choices: ["8", "4", "16", "2"],
          answer: 0,
          explain: "Adding the two equations directly cancels the y-terms: (x + 2y) + (x - 2y) = 12 + 4, giving 2x = 16, so x = 8.",
          difficulty: "easy",
        },
        {
          q: "Solve the system: y = 2x + 1, 3x + y = 16. What is x?",
          choices: ["3", "5", "15", "17/5"],
          answer: 0,
          explain:
            "The first equation already has y isolated, so substitution is faster here than forcing elimination. Substituting y = 2x + 1 into the second equation: 3x + (2x + 1) = 16, giving 5x + 1 = 16, so x = 3.",
          difficulty: "medium",
        },
        {
          q: "Solve the system: x + 2y = 11, 3x - y = 5. What is y?",
          choices: ["4", "33", "28", "3"],
          answer: 0,
          explain:
            "The x-coefficients don't already match (1 and 3), so direct elimination won't cancel anything yet. Multiplying the first equation by 3 so its x-coefficient matches the second gives 3x + 6y = 33. Subtracting the second equation from this new version: (3x + 6y) - (3x - y) = 33 - 5, giving 7y = 28, so y = 4.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Defaulting to substitution even when elimination would be much faster, wasting time under exam conditions.",
        "Sign errors when subtracting (rather than adding) equations — subtracting requires distributing a negative sign across an entire equation.",
      ],
    },
    {
      name: "Determining the Number of Solutions Without Fully Solving",
      explanation:
        "This pattern asks how many solutions a system has, without requiring you to actually find them. It's purely about comparing slopes and intercepts: different slopes means exactly one solution; same slope with different intercepts means no solution (parallel lines); same slope AND same intercept means infinite solutions (identical lines). You can often answer this in seconds, with no solving at all.",
      examples: [
        {
          q: "How many solutions does this system have? y = 2x + 1 and y = 2x - 3",
          choices: ["No solution", "Exactly one solution", "Infinitely many solutions", "Cannot be determined"],
          answer: 0,
          explain:
            "Compare the slopes: both are 2, identical. Compare the y-intercepts: 1 versus -3, different. Same slope with different intercepts means the lines are parallel and never intersect, so there's no solution, without needing to solve anything further.",
          diagram: { kind: "systemGraph", line1Direction: "gentlePos", line2Direction: "gentlePos", parallel: true },
          difficulty: "easy",
        },
        {
          q: "How many solutions does this system have? 2x + y = 5 and 4x + 2y = 10",
          choices: ["Infinitely many solutions", "No solution", "Exactly one solution", "Cannot be determined"],
          answer: 0,
          explain:
            "Convert both to slope-intercept form before comparing anything. First equation: y = -2x + 5. Second equation: 2y = -4x + 10, which simplifies to y = -2x + 5 as well. Both the slope (-2) and the y-intercept (5) match exactly — this isn't just two parallel lines, it's the exact same line written two different ways, so every point on the line is a solution.",
          diagram: { kind: "systemGraph", line1Direction: "gentleNeg", line2Direction: "gentleNeg", sameLine: true },
          difficulty: "medium",
        },
        {
          q: "How many solutions does this system have? y = 3x - 2 and y = -x + 6",
          choices: ["Exactly one solution", "No solution", "Infinitely many solutions", "Cannot be determined"],
          answer: 0,
          explain: "Compare the slopes: 3 versus -1, different. Different slopes always mean exactly one solution, without needing to solve anything further.",
          diagram: { kind: "systemGraph", line1Direction: "steepPos", line2Direction: "gentleNeg", solutionLabel: "?" },
          difficulty: "easy",
        },
        {
          q: "How many solutions does this system have? 2x + y = 7 and 4x + 2y = 9",
          choices: ["No solution", "Infinitely many solutions", "Exactly one solution", "Cannot be determined"],
          answer: 0,
          explain:
            "Convert both to slope-intercept form first. Equation 1: y = -2x + 7. Equation 2: 2y = -4x + 9, so y = -2x + 4.5. Both have slope -2, identical, but the intercepts (7 versus 4.5) are different. Same slope with different intercepts means the lines are parallel, so there's no solution.",
          diagram: { kind: "systemGraph", line1Direction: "gentleNeg", line2Direction: "gentleNeg", parallel: true },
          difficulty: "medium",
        },
        {
          q: "How many solutions does this system have? -3x + 6y = 12 and x - 2y = -4",
          choices: ["Infinitely many solutions", "No solution", "Exactly one solution", "Cannot be determined"],
          answer: 0,
          explain:
            "Convert both to slope-intercept form. Equation 1: 6y = 3x + 12, so y = 0.5x + 2. Equation 2: -2y = -x - 4, so y = 0.5x + 2. Both the slope and the intercept match exactly — despite looking like different equations at first glance, they're actually the same line (equation 1 is -3 times equation 2), so every point on the line is a solution.",
          diagram: { kind: "systemGraph", line1Direction: "gentlePos", line2Direction: "gentlePos", sameLine: true },
          difficulty: "hard",
        },
      ],
      traps: [
        "Attempting to fully solve the system algebraically when the question only asks for the *number* of solutions — a slope/intercept comparison is much faster.",
        "Forgetting to convert equations to a comparable form (like slope-intercept) before comparing slopes and intercepts.",
      ],
    },
    {
      name: "Reading the Solution Directly from a Graph",
      desmosTrick:
        "Step 1: Open Desmos and type the first equation into the first line exactly as it's written — if it's in the form Ax + By = C, you can enter it in that form directly, no need to solve for y first. Step 2: Type the second equation into the next line the same way. Desmos draws both as straight lines. Step 3: Click on the point where the two lines cross (use the +/- zoom buttons if they cross off-screen) — Desmos shows a small label with that point's exact coordinates. Step 4: Read the solution straight off that label: the first number is x, the second is y. No elimination or substitution required.",
      explanation:
        "This pattern shows the graphs of two lines (or a line and a curve) and asks for the system's solution — the point where they cross. No algebra needed: the solution is just the coordinates of that intersection point, read directly off the grid. This is different from counting solutions (no point needed) and from elimination (solved algebraically, no picture) — here, the graph already shows you the answer.",
      examples: [
        {
          q: "The graphs of two linear equations intersect at the point where x = 3 and y = 5, clearly marked on the grid. What is the solution to the system?",
          choices: ["(3, 5)", "(5, 3)", "(3, 0)", "(0, 5)"],
          answer: 0,
          explain: "The solution to a system, read from a graph, is simply the point where the two lines cross. That marked point is (3, 5).",
          diagram: { kind: "systemGraph", line1Direction: "steepPos", line2Direction: "gentleNeg", solutionLabel: "(3, 5)" },
          difficulty: "easy",
        },
        {
          q: "Two lines are graphed. They cross at a marked grid point 4 units right and 2 units up from the origin. What is the solution (x, y) to the system?",
          choices: ["(4, 2)", "(2, 4)", "(4, 0)", "(0, 2)"],
          answer: 0,
          explain:
            "Convert the grid description directly into coordinates: 4 units right means x = 4, 2 units up means y = 2. The solution is the point where the lines actually cross, which is exactly this marked point.",
          diagram: { kind: "systemGraph", line1Direction: "gentlePos", line2Direction: "steepNeg", solutionLabel: "(4, 2)" },
          difficulty: "easy",
        },
        {
          q: "Two lines are graphed: one crosses the y-axis at (0, 6), the other crosses the y-axis at (0, 1), and the two lines cross each other at the point (2, 4). What is the solution to the system?",
          choices: ["(2, 4)", "(0, 6)", "(0, 1)", "(6, 1)"],
          answer: 0,
          explain:
            "A system's 'solution' specifically means the point where the two lines cross each other, not either line's own y-intercept. The y-intercepts, (0, 6) and (0, 1), describe where each line individually crosses the y-axis, not the answer to this question. The solution is the shared intersection point, (2, 4).",
          diagram: { kind: "systemGraph", line1Direction: "gentleNeg", line2Direction: "steepPos", solutionLabel: "(2, 4)" },
          difficulty: "medium",
        },
        {
          q: "The graphs of a linear equation and a nonlinear equation are shown, intersecting at exactly one marked point where x = -1 and y = 6. What is the solution (x, y) to this system?",
          choices: ["(-1, 6)", "(6, -1)", "(1, 6)", "(-1, -6)"],
          answer: 0,
          explain:
            "Even though one graph is a curve rather than a straight line, the method is identical: the solution is simply the point where the two graphs cross. The marked intersection point is at x = -1, y = 6.",
          difficulty: "medium",
        },
        {
          q: "The graphs of a line and a parabola are shown, crossing at two marked points: (-2, 3) and (5, 10). If the solution to the system must have a positive x-value, what is the solution (x, y)?",
          choices: ["(5, 10)", "(-2, 3)", "(10, 5)", "(3, -2)"],
          answer: 0,
          explain:
            "The graphs cross at two points, since a line can intersect a curve more than once, unlike the earlier examples, which had exactly one intersection. Applying the given constraint (positive x-value): (-2, 3) has a negative x-value, so it's excluded, while (5, 10) has a positive x-value and satisfies the constraint.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Reading the intersection point's coordinates in the wrong order (mixing up x and y).",
        "Picking an intersection point that isn't exactly where the lines cross (misjudging a close-but-not-exact grid intersection).",
        "Confusing a graph's x-intercept or y-intercept with the actual intersection point of the two lines, when a question asks specifically for the system's solution.",
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
        },
        {
          q: "Solve: 8 - 4x ≤ 20",
          choices: ["x ≥ -3", "x ≤ -3", "x ≥ 3", "x ≤ 3"],
          answer: 0,
          explain:
            "Subtract 8 from both sides: -4x ≤ 12. Divide both sides by -4, and since that's a negative number, flip the inequality sign from ≤ to ≥, giving x ≥ -3.",
          difficulty: "medium",
        },
        {
          q: "Solve: 5x + 2 < 17",
          choices: ["x < 3", "x > 3", "x < 5", "x > 15"],
          answer: 0,
          explain: "Subtract 2 from both sides: 5x < 15. Divide both sides by 5, a positive number, so the sign doesn't flip: x < 3.",
          difficulty: "easy",
        },
        {
          q: "Solve: -2(x - 3) ≥ 10",
          choices: ["x ≤ -2", "x ≥ -2", "x ≤ 2", "x ≥ 8"],
          answer: 0,
          explain:
            "Distribute the -2: -2x + 6 ≥ 10. Subtract 6 from both sides: -2x ≥ 4. Divide both sides by -2, since that's negative, flip the inequality sign: x ≤ -2.",
          difficulty: "medium",
        },
        {
          q: "Solve: 3 - 4x > 7x - 25",
          choices: ["x < 28/11", "x > 28/11", "x < 4", "x > -28/11"],
          answer: 0,
          explain:
            "Move the x-terms to one side by adding 4x to both sides: 3 > 11x - 25. Add 25 to both sides: 28 > 11x. Divide both sides by 11, and since 11 is positive, the inequality sign does not flip, even though a negative coefficient (-4x) appeared earlier: x < 28/11.",
          difficulty: "hard",
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
        "This pattern involves translating phrases like 'at least,' 'at most,' 'no more than,' and 'exceeds' into the right inequality symbol, then solving. The translation is usually the real difficulty here, not the algebra after it. 'At least' means the value can equal the number or be greater (≥). 'At most' means it can equal the number or be less (≤). 'More than' or 'exceeds' is strictly greater (>) — equality isn't allowed.",
      examples: [
        {
          q: "A student needs an average of at least 90 across 4 tests to earn an A. Scores so far are 85, 92, 88. What is the minimum score needed on the 4th test?",
          choices: ["95", "90", "93", "88"],
          answer: 0,
          explain:
            "Translate 'at least 90 average' into an inequality: (85 + 92 + 88 + x)/4 ≥ 90. Multiply both sides by 4: 265 + x ≥ 360. Subtract 265: x ≥ 95 — 'at least' translates to ≥, not a strict >.",
          difficulty: "easy",
        },
        {
          q: "A rider has $12. Each snack from a vending machine costs $1.75, and the rider needs to keep at least $2.50 left over for the return bus fare. What is the maximum number of snacks n the rider can buy?",
          choices: ["5", "6", "4", "5.43"],
          answer: 0,
          explain:
            "Translate 'needs to keep at least $2.50' into an inequality about what's left after buying n snacks: 12 - 1.75n ≥ 2.50. Subtracting 12 and dividing by -1.75 (flipping the sign, since that's negative) gives n ≤ 5.43. Since n must be a whole number of snacks, the largest whole number satisfying the inequality is 5.",
          difficulty: "medium",
        },
        {
          q: "A parking garage charges $4 for the first hour and $2 for each additional hour. If a customer wants to pay no more than $16 total, what is the maximum number of additional hours a, beyond the first, they can park?",
          choices: ["6", "8", "5", "12"],
          answer: 0,
          explain: "Translate 'no more than $16' into an inequality: 4 + 2a ≤ 16. Subtract 4: 2a ≤ 12. Divide by 2: a ≤ 6.",
          difficulty: "easy",
        },
        {
          q: "A shipment is rejected if it weighs more than 500 pounds. Which inequality represents the weight w, in pounds, of a shipment that will be rejected?",
          choices: ["w > 500", "w ≥ 500", "w < 500", "w ≤ 500"],
          answer: 0,
          explain:
            "'More than 500 pounds' is strictly greater than, not '500 or more,' so the correct inequality is w > 500, not w ≥ 500. Contrast with 'at least 500,' which would include 500 itself (≥) — 'more than' specifically excludes the boundary value.",
          difficulty: "medium",
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
        },
      ],
      traps: [
        "Using strict inequality (> or <) when the phrase 'at least' or 'at most' actually requires ≥ or ≤ (allowing the boundary value itself).",
        "Forgetting to multiply through by the total count when solving an average-based inequality, leading to an incorrect setup.",
      ],
    },
    {
      name: "Matching a Graph, Table, or Point to an Inequality or System",
      explanation:
        "These questions run the usual process backward: instead of solving an inequality, you're given a shaded graph region, a table of points, or a single point, and asked which inequality it matches — or whether the point is even a valid solution. For a point and an inequality: substitute the coordinates in and check if the result is true. For a table: every single row must satisfy the inequality for the table to match — one failing row rules it out. For a shaded region: find the boundary line's equation first, then test a point clearly inside the shading to see which direction (greater than or less than) it represents.",
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
        },
        {
          q: "A graph shows a solid boundary line passing through (0, 2) and (4, 0), with shading below the line. Which inequality does the graph represent?",
          choices: ["y ≤ -1/2 x + 2", "y ≥ -1/2 x + 2", "y < -1/2 x + 2", "y > -1/2 x + 2"],
          answer: 0,
          explain:
            "Find the boundary line's equation using its two given points: slope = (0-2)/(4-0) = -1/2, and the y-intercept is 2, giving y = -1/2 x + 2. The line is solid, meaning the inequality includes equality. Testing a point clearly below the line, like (0, 0): 0 ≤ -1/2(0) + 2 = 2 is true, so shading below corresponds to ≤.",
          difficulty: "hard",
        },
        {
          q: "A system consists of two inequalities. Point (2, 6) satisfies y ≥ x + 3 but not y ≤ -x + 10. Does (2, 6) satisfy the full system?",
          choices: [
            "No, because it must satisfy both inequalities to solve the system",
            "Yes, because it satisfies at least one of the inequalities",
            "Yes, because it satisfies the first inequality listed",
            "Cannot be determined from the given information",
          ],
          answer: 0,
          explain:
            "A point satisfies a system only if it satisfies every inequality in that system simultaneously. The point fails the second inequality, y ≤ -x + 10, so it cannot be a solution to the system as a whole, regardless of satisfying the first one.",
          difficulty: "hard",
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
        },
        {
          q: "Factor completely: 4x² - 25",
          choices: ["(2x-5)(2x+5)", "(4x-25)(x+1)", "(2x-5)²", "(4x-5)(x+5)"],
          answer: 0,
          explain:
            "Recognize the shape, even with a coefficient present: 4x² is (2x)², and 25 is 5² — still a difference of squares, just with a squared term instead of a bare variable. Applying a² - b² = (a-b)(a+b) with a = 2x and b = 5 gives (2x-5)(2x+5).",
          difficulty: "medium",
        },
        {
          q: "Factor completely: x² - 16",
          choices: ["(x-4)(x+4)", "(x-16)(x+1)", "(x-4)²", "(x-8)(x+2)"],
          answer: 0,
          explain: "Recognize the shape: x² and 16 = 4² — a difference of squares. Applying the pattern gives (x-4)(x+4).",
          difficulty: "easy",
        },
        {
          q: "Factor completely: x² + 10x + 25",
          choices: ["(x+5)²", "(x+25)", "(x+5)(x-5)", "(x+10)(x+5)"],
          answer: 0,
          explain:
            "Check whether the middle term is twice the product of the square roots of the first and last terms: √(x²) = x, √25 = 5, and 2 × x × 5 = 10x — it matches exactly, confirming a perfect square trinomial: a² + 2ab + b² = (a+b)², giving (x+5)².",
          difficulty: "medium",
        },
        {
          q: "Factor completely: x² - 3x - 40",
          choices: ["(x-8)(x+5)", "(x+8)(x-5)", "(x-40)(x+1)", "(x-4)(x+10)"],
          answer: 0,
          explain:
            "This doesn't match difference-of-squares or perfect-square-trinomial shapes — it needs simple trinomial factoring. Find two numbers that multiply to -40 and add to -3: since the product is negative, the numbers have opposite signs; testing pairs, -8 and 5 work (-8 × 5 = -40, -8 + 5 = -3), giving (x-8)(x+5).",
          difficulty: "hard",
        },
      ],
      traps: [
        "Not recognizing perfect squares (like 9 = 3², 25 = 5², 49 = 7²) quickly enough to spot the difference-of-squares pattern.",
        "Attempting trial-and-error factoring on an expression that actually matches a recognizable, faster pattern.",
      ],
    },
    {
      name: "Simplifying Rational Expressions via Factoring",
      explanation:
        "This pattern involves simplifying a fraction where both the top and bottom are polynomials. The key move is always the same: factor both completely first, then cancel any shared factors. Trying to simplify without factoring first — like dividing term-by-term — is a common source of errors.",
      examples: [
        {
          q: "Simplify the rational expression: (x² - 4)/(x - 2)",
          choices: ["x+2", "x-2", "x+4", "x²-2"],
          answer: 0,
          explain:
            "Factor the numerator: x² - 4 is a difference of squares, factoring to (x-2)(x+2). Rewriting the fraction as (x-2)(x+2) / (x-2) and canceling the shared factor of (x-2) leaves x+2.",
          difficulty: "easy",
        },
        {
          q: "Simplify the rational expression: (x² - 5x + 6)/(x - 3)",
          choices: ["x-2", "x+2", "x-3", "x-5"],
          answer: 0,
          explain:
            "The numerator isn't a difference of squares — it's a trinomial, so factor it by finding two numbers that multiply to 6 and add to -5: those numbers are -2 and -3, so x² - 5x + 6 factors to (x-2)(x-3). Canceling the shared (x-3) factor leaves x-2.",
          difficulty: "medium",
        },
        {
          q: "Simplify the rational expression: (x² - 25)/(x + 5)",
          choices: ["x-5", "x+5", "x-25", "x²-5"],
          answer: 0,
          explain: "Factor the numerator: x² - 25 is a difference of squares, factoring to (x-5)(x+5). Canceling the shared (x+5) factor leaves x-5.",
          difficulty: "easy",
        },
        {
          q: "Simplify the rational expression: (x² - 9)/(x² + x - 6)",
          choices: ["(x-3)/(x-2)", "(x+3)/(x-2)", "(x-3)/(x+2)", "x-3"],
          answer: 0,
          explain:
            "Factor the numerator: x² - 9 is a difference of squares, (x-3)(x+3). Factor the denominator too: x² + x - 6 needs two numbers multiplying to -6 and adding to 1, which are 3 and -2, giving (x+3)(x-2). Canceling the shared (x+3) factor leaves (x-3)/(x-2).",
          difficulty: "medium",
        },
        {
          q: "Simplify the rational expression: (x² - 9)/(3 - x)",
          choices: ["-(x+3)", "x+3", "-(x-3)", "x-3"],
          answer: 0,
          explain:
            "Factor the numerator as before: (x-3)(x+3). The denominator, (3-x), isn't identical to (x-3), but it is its negative: 3 - x = -(x-3). Rewriting the denominator that way and canceling the shared (x-3) factor leaves a negative sign behind: -(x+3).",
          difficulty: "hard",
        },
      ],
      traps: [
        "Attempting to cancel individual terms (like the x² and x, or the 4 and 2) instead of fully factoring first and canceling entire shared factors.",
        "Forgetting that canceling is only valid for shared multiplicative factors, not for terms being added or subtracted.",
        "Missing that a denominator like (3 - x) is the negative of (x - 3), not an unrelated factor that can't be canceled.",
      ],
    },
    {
      name: "Applying the Laws of Exponents",
      explanation:
        "These questions test the rules for combining and rewriting exponents. Multiplying same-base powers: add the exponents (x^a · x^b = x^(a+b)). Dividing: subtract them (x^a / x^b = x^(a-b)). Raising a power to a power: multiply the exponents ((x^a)^b = x^(ab)). A fractional exponent represents a radical: x^(1/n) means the nth root of x, and x^(m/n) means the nth root of x, raised to the m power. Both directions of this conversion — exponent to radical, and back — show up on the test. A negative exponent means reciprocal, not a negative value: x^(-n) = 1/x^n.",
      examples: [
        {
          q: "Simplify: x^5 · x^3",
          choices: ["x^8", "x^15", "x^2", "2x^8"],
          answer: 0,
          explain: "Both terms share the same base, x. When multiplying same-base powers, add the exponents: 5 + 3 = 8, giving x^8.",
          difficulty: "easy",
        },
        {
          q: "Rewrite x^(1/2) using radical notation.",
          choices: ["√x", "x²", "2√x", "1/√x"],
          answer: 0,
          explain: "A rational exponent of 1/n corresponds to the nth root. Here n = 2, so x^(1/2) means the square root of x.",
          difficulty: "easy",
        },
        {
          q: "Simplify: (x³y²)⁴ / x²",
          choices: ["x^10 y^8", "x^12 y^8", "x^6 y^8", "x^10 y^6"],
          answer: 0,
          explain:
            "Apply the power-of-a-power rule to each factor inside the parentheses: (x³)⁴ = x^12, and (y²)⁴ = y^8, giving x^12 y^8. Dividing by x², since the bases match, subtract the exponents: x^(12-2) = x^10. The y term has no matching factor to combine with in the denominator, so it stays as is: x^10 y^8.",
          difficulty: "medium",
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
        },
        {
          q: "If x > 0 and x^(3/4) = 8, what is the value of x?",
          choices: ["16", "6", "8", "64"],
          answer: 0,
          explain:
            "Rewrite the rational exponent as a radical: x^(3/4) means the 4th root of x, cubed, which equals 8. To undo the cube, take the cube root of both sides: the 4th root of x = 8^(1/3) = 2. To undo the 4th root, raise both sides to the 4th power: x = 2^4 = 16.",
          difficulty: "hard",
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
        "This is the reverse of factoring: multiplying out (distributing) an expression like (x+3)(x-5), or adding, subtracting, and combining like terms across polynomials. Distribute every term in the first factor across every term in the second — the same idea as FOIL, just extended to any size polynomial — then combine the like terms that result. When adding or subtracting whole polynomials, line up matching powers of x before combining coefficients. Be extra careful to distribute a negative sign across EVERY term when subtracting one polynomial from another.",
      examples: [
        {
          q: "Simplify: (2x³ - 5x + 1) + (x³ + 4x - 6)",
          choices: ["3x³ - x - 5", "3x³ + x - 5", "3x³ - x + 5", "3x³ - 9x - 5"],
          answer: 0,
          explain: "Line up like terms by matching powers of x: (2x³ + x³) + (-5x + 4x) + (1 - 6), giving 3x³ - x - 5.",
          difficulty: "easy",
        },
        {
          q: "Expand: (x + 4)(x + 7)",
          choices: ["x² + 11x + 28", "x² + 28x + 11", "x² + 7x + 28", "x² + 11x + 11"],
          answer: 0,
          explain: "Distribute each term in the first factor across the second: x(x+7) + 4(x+7) = x² + 7x + 4x + 28, which combines to x² + 11x + 28.",
          difficulty: "easy",
        },
        {
          q: "Simplify: (5x² - 3x + 8) - (2x² - 6x + 1)",
          choices: ["3x² + 3x + 7", "3x² - 9x + 7", "3x² + 3x + 9", "7x² + 3x + 7"],
          answer: 0,
          explain:
            "Subtracting a polynomial means distributing a negative sign across every one of its terms: 5x² - 3x + 8 - 2x² + 6x - 1 — the middle term's sign flips from -6x to +6x. Combining like terms: (5x² - 2x²) + (-3x + 6x) + (8 - 1) = 3x² + 3x + 7.",
          difficulty: "medium",
        },
        {
          q: "Expand: (2x - 3)(x² + 4x - 1)",
          choices: ["2x³ + 5x² - 14x + 3", "2x³ + 8x² - 2x + 3", "2x³ + 5x² - 10x + 3", "2x³ - 5x² - 14x + 3"],
          answer: 0,
          explain:
            "Distribute each term of the binomial across all three terms of the trinomial: 2x(x²+4x-1) - 3(x²+4x-1) = (2x³ + 8x² - 2x) + (-3x² - 12x + 3). Combining like terms gives 2x³ + 5x² - 14x + 3.",
          difficulty: "medium",
        },
        {
          q: "If P(x) = 3x² - 2x + 5 and Q(x) = x² + 4x - 7, what is 2P(x) - Q(x)?",
          choices: ["5x² - 8x + 17", "7x² - 8x - 2", "5x² + 8x + 3", "5x² - 8x + 3"],
          answer: 0,
          explain:
            "Apply the coefficient 2 to every term of P(x) first: 2P(x) = 6x² - 4x + 10. Distribute the negative sign across every term of Q(x): -Q(x) = -x² - 4x + 7. Adding the results together, combining like terms: (6x² - x²) + (-4x - 4x) + (10 + 7) = 5x² - 8x + 17.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Forgetting to distribute a negative sign across every term of the second polynomial when subtracting one polynomial from another — only flipping the first term's sign.",
        "Combining terms with different powers of x as if they were like terms (for example, adding x² and x directly).",
        "Making a sign error while distributing a binomial across a longer polynomial, especially when the binomial itself contains a subtraction.",
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
        "This is the baseline method every other pattern in this subskill builds on: actually finding the solution(s) to a quadratic equation, not just how many it has. First, get the equation into 'expression = 0' form by moving everything to one side. Then try factoring: look for two numbers that multiply to the constant term and add to the middle coefficient. Once you have two factors, use the zero product property — if (x - p)(x - q) = 0, then x = p or x = q. If it doesn't factor into nice integers, fall back to the quadratic formula, x = (-b ± √(b²-4ac)) / 2a, which always works.",
      examples: [
        {
          q: "Solve for x: x² - 3x - 10 = 0",
          choices: ["x = 5 or x = -2", "x = -5 or x = 2", "x = 5 or x = 2", "x = -5 or x = -2"],
          answer: 0,
          explain:
            "The equation is already in 'expression = 0' form. Look for two numbers that multiply to -10 and add to -3: -5 and 2 work. Factoring gives (x - 5)(x + 2) = 0, and the zero product property gives x = 5 or x = -2.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-2", "5"] },
          difficulty: "easy",
        },
        {
          q: "Solve for d: (d - 30)(d + 30) - 7 = -7",
          choices: ["d = 30 or d = -30", "d = 7 or d = -7", "d = 30 only", "d = 60 or d = 0"],
          answer: 0,
          explain:
            "This isn't in 'expression = 0' form yet — add 7 to both sides first: (d-30)(d+30) = 0. The expression is now already factored, so applying the zero product property directly gives d = 30 or d = -30.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-30", "30"] },
          difficulty: "easy",
        },
        {
          q: "Solve for x: 2x² + 5x - 3 = 0",
          choices: ["x = 1/2 or x = -3", "x = -1/2 or x = 3", "x = 1 or x = -3/2", "x = 3 or x = -1/2"],
          answer: 0,
          explain:
            "The leading coefficient isn't 1, which makes integer factoring trickier, so use the quadratic formula: a=2, b=5, c=-3, giving x = (-5 ± √(25-4(2)(-3))) / 4 = (-5 ± √49) / 4 = (-5 ± 7) / 4, so x = 1/2 or x = -3.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-3", "1/2"] },
          difficulty: "medium",
        },
        {
          q: "Solve for x: 3x² = 12x",
          choices: ["x = 0 or x = 4", "x = 4 only", "x = 0 or x = -4", "x = 3 or x = 0"],
          answer: 0,
          explain:
            "Move everything to one side: 3x² - 12x = 0. Factor out the greatest common factor first: 3x(x - 4) = 0. The zero product property gives 3x = 0 or x - 4 = 0, so x = 0 or x = 4 — dividing both sides by x instead would illegally lose the x = 0 solution.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["0", "4"] },
          difficulty: "medium",
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
        },
      ],
      traps: [
        "Dividing both sides of an equation like 3x² = 12x by x to 'simplify' — this illegally loses the x = 0 solution; factor out the shared term instead of dividing by a variable.",
        "Forgetting to move all terms to one side before attempting to factor or apply the zero product property — factoring only works once the equation equals zero.",
        "Spending too long forcing integer factoring on an expression that doesn't factor neatly — if two integers that work aren't apparent within a few tries, switch to the quadratic formula.",
      ],
    },
    {
      name: "Solving Absolute Value Equations",
      explanation:
        "An absolute value equation like |expression| = k has two cases, because whatever's inside the bars could have started out positive or negative: expression = k, or expression = -k. Solve both separately to get up to two solutions. If k is negative, there's no solution at all — an absolute value can never equal a negative number, so check this before doing any algebra. Once you have candidate solutions, check both back in the original equation. It's the same habit that catches extraneous solutions in radical equations.",
      examples: [
        {
          q: "Solve for x: |x - 5| = 10",
          choices: ["x = 15 or x = -5", "x = 15 or x = 5", "x = -15 or x = 5", "x = 5 only"],
          answer: 0,
          explain: "Split into two cases: x - 5 = 10, or x - 5 = -10. Solving each gives x = 15 or x = -5.",
          difficulty: "easy",
        },
        {
          q: "Solve for x: |2x + 3| = 9",
          choices: ["x = 3 or x = -6", "x = 3 or x = 6", "x = -3 or x = 6", "x = 6 or x = -3"],
          answer: 0,
          explain:
            "Split into two cases: 2x + 3 = 9, or 2x + 3 = -9. Solving the first gives 2x = 6, so x = 3; solving the second gives 2x = -12, so x = -6.",
          difficulty: "easy",
        },
        {
          q: "Solve for x: |4x - 1| = -6",
          choices: ["No solution", "x = 7/4 or x = -5/4", "x = -6 only", "x = 6 or x = -6"],
          answer: 0,
          explain:
            "Before splitting into cases, check the right side: it's -6, a negative number. An absolute value expression can never equal a negative number, no matter what x is, so this equation has no solution.",
          difficulty: "medium",
        },
        {
          q: "Solve for x: 3|x + 2| - 4 = 11",
          choices: ["x = 3 or x = -7", "x = 5 or x = -9", "x = 3 or x = -2", "x = 7 or x = -3"],
          answer: 0,
          explain:
            "Isolate the absolute value expression before splitting into cases: add 4 to both sides (3|x+2| = 15), then divide by 3 (|x+2| = 5). Splitting into two cases, x + 2 = 5 or x + 2 = -5, gives x = 3 or x = -7.",
          difficulty: "medium",
        },
        {
          q: "Find the sum of all solutions to the equation |2x - 7| = 3x - 1.",
          choices: ["8/5", "-22/5", "-6", "-8/5"],
          answer: 0,
          explain:
            "Split into two cases: 2x - 7 = 3x - 1, giving x = -6; or 2x - 7 = -(3x - 1), giving 5x = 8, so x = 8/5. Since the right side contains a variable, each candidate must be checked in the original equation — substituting x = -6 gives 3(-6) - 1 = -19, and an absolute value can't equal a negative number, so x = -6 is extraneous and must be discarded (a student who forgets this check would wrongly report the sum as -22/5). Only x = 8/5 is valid, so the sum of all solutions is 8/5.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Forgetting the negative case entirely and reporting only one solution when the equation has two.",
        "Not checking whether the right side of the equation is negative before splitting into cases — if it is, there's no solution at all.",
        "When a variable appears on both sides of the equation, forgetting to check candidate solutions back in the original equation — one of them can turn out to be extraneous, just as with radical equations.",
      ],
    },
    {
      name: "Determining the Number of Solutions via the Discriminant",
      desmosTrick:
        "Step 1: If the equation isn't already in 'expression = 0' form, move everything to one side first. Step 2: Type y = [that side] into Desmos as a new line. Step 3: Look at how many times the curve crosses the x-axis — two crossings means two real solutions, one crossing where the curve just touches the axis (without crossing through) means exactly one repeated solution, and zero crossings means no real solutions. You can count crossings by eye instead of computing b²-4ac.",
      explanation:
        "For a quadratic ax² + bx + c = 0, the discriminant (b² - 4ac) tells you the number of real solutions without solving the whole equation. Positive means two real solutions. Zero means exactly one repeated solution. Negative means no real solutions. This is much faster than factoring or using the full quadratic formula when a question only asks 'how many solutions' — not what they are.",
      examples: [
        {
          q: "How many real solutions does x² + 4x + 5 = 0 have?",
          choices: ["No real solutions", "Exactly one real solution", "Two real solutions", "Cannot be determined"],
          answer: 0,
          explain: "Identify a=1, b=4, c=5. The discriminant is b² - 4ac = 16 - 20 = -4. Since it's negative, there are no real solutions.",
          diagram: { kind: "parabolaGraph", opensUp: true, vertexLabel: "No real solutions" },
          difficulty: "easy",
        },
        {
          q: "How many real solutions does 2x² - 4x + 2 = 0 have?",
          choices: ["Exactly one real solution", "No real solutions", "Two real solutions", "Cannot be determined"],
          answer: 0,
          explain:
            "Identify a=2, b=-4, c=2. The discriminant is b² - 4ac = 16 - 16 = 0. A discriminant of exactly zero is a distinct case from both positive and negative — it means exactly one repeated real solution.",
          diagram: { kind: "parabolaGraph", opensUp: true, touchesAxis: true, vertexLabel: "1 solution" },
          difficulty: "medium",
        },
        {
          q: "How many real solutions does x² - 6x + 8 = 0 have?",
          choices: ["Two real solutions", "No real solutions", "Exactly one real solution", "Cannot be determined"],
          answer: 0,
          explain: "Identify a=1, b=-6, c=8. The discriminant is b² - 4ac = 36 - 32 = 4. Since it's positive, there are two real solutions.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["", ""], vertexLabel: "2 solutions" },
          difficulty: "easy",
        },
        {
          q: "How many real solutions does -2x² + 3x - 5 = 0 have?",
          choices: ["No real solutions", "Exactly one real solution", "Two real solutions", "Cannot be determined"],
          answer: 0,
          explain:
            "Identify a=-2, b=3, c=-5. Computing the discriminant carefully with the negative values: b² - 4ac = 9 - 4(-2)(-5) = 9 - 40 = -31. Since it's negative, there are no real solutions.",
          diagram: { kind: "parabolaGraph", opensUp: false, vertexLabel: "No real solutions" },
          difficulty: "medium",
        },
        {
          q: "For what values of k does the equation x² + 6x + k = 0 have two real solutions?",
          choices: ["k < 9", "k > 9", "k ≤ 9", "k = 9"],
          answer: 0,
          explain:
            "Set up the discriminant using the given coefficients, with k as the unknown: b² - 4ac = 36 - 4k. 'Two real solutions' requires the discriminant to be strictly positive (not just non-negative, since exactly one solution needs it to equal zero), so 36 - 4k > 0, giving k < 9.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["", ""], vertexLabel: "2 solutions when k < 9" },
          difficulty: "hard",
        },
      ],
      traps: [
        "Attempting to factor or use the full quadratic formula when the question only asks for the number of solutions — the discriminant alone answers this faster.",
        "Sign errors when computing -4ac, especially when a or c is negative.",
      ],
    },
    {
      name: "Solving Radical Equations and Checking for Extraneous Solutions",
      explanation:
        "Radical (square root) equations require squaring both sides to get rid of the radical — but that step can introduce 'extraneous' solutions: values that satisfy the squared equation but not the original one. The critical, often-skipped last step: plug your solution back into the ORIGINAL equation to verify it actually works.",
      examples: [
        {
          q: "Solve for x: √(x + 3) = 5",
          choices: ["22", "2", "25", "28"],
          answer: 0,
          explain:
            "Square both sides to eliminate the square root: x + 3 = 25, so x = 22. Check by substituting back into the original equation: √(22 + 3) = √25 = 5, which matches the right side — the solution is valid, not extraneous.",
          difficulty: "easy",
        },
        {
          q: "Solve for x: √(2x - 1) = x - 2",
          choices: ["5", "1 or 5", "1", "-5"],
          answer: 0,
          explain:
            "Square both sides: 2x - 1 = (x-2)² = x² - 4x + 4. Rearranging: x² - 6x + 5 = 0, which factors to (x-1)(x-5) = 0, giving candidates x = 1 and x = 5. Checking both in the original equation: for x = 1, the left side is 1 but the right side is -1, so x = 1 is extraneous; for x = 5, both sides equal 3, so x = 5 is the only valid solution.",
          difficulty: "medium",
        },
        {
          q: "Solve for x: √(x - 2) = 4",
          choices: ["18", "14", "16", "2"],
          answer: 0,
          explain: "Square both sides: x - 2 = 16, so x = 18. Check: √(18-2) = √16 = 4, which matches — valid, not extraneous.",
          difficulty: "easy",
        },
        {
          q: "Solve for x: 3√(x + 1) = 12",
          choices: ["15", "3", "35", "11"],
          answer: 0,
          explain:
            "Before squaring, isolate the radical completely — divide both sides by 3 first: √(x+1) = 4. Squaring both sides: x + 1 = 16, so x = 15. Checking in the original equation: 3√(15+1) = 3(4) = 12, which matches.",
          difficulty: "medium",
        },
        {
          q: "Solve for x: √(3x + 7) = x - 1",
          choices: ["6", "-1 or 6", "-1", "7"],
          answer: 0,
          explain:
            "Square both sides: 3x + 7 = (x-1)² = x² - 2x + 1. Rearranging into standard form: 0 = x² - 5x - 6, which factors to (x-6)(x+1) = 0, giving x = 6 or x = -1. Checking both: x = 6 gives √25 = 5 and 6-1 = 5, valid; x = -1 gives √4 = 2 but -1-1 = -2, and a square root can never equal a negative number, so it fails.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Skipping the final check, and reporting a solution that actually fails when substituted back into the original (unsquared) equation.",
        "Forgetting that squaring both sides can turn a valid equation into one with extra, invalid solutions — this check is not optional busywork.",
      ],
    },
    {
      name: "Solving a Linear-Quadratic System by Substitution",
      desmosTrick:
        "Step 1: Type the linear equation into the first line and the quadratic equation into the second line, exactly as given — Desmos accepts input like y = x^2 + 3x - 4 directly. Desmos graphs a line and a parabola. Step 2: Every point where they cross is a solution to the system, so click each crossing point to read off its exact coordinates. Step 3: If the line touches the parabola at exactly one point, there's one solution; if it never touches, there are none. This replaces the whole substitute-and-solve process with reading a picture.",
      explanation:
        "Some systems pair one linear equation with one nonlinear (usually quadratic) equation. Elimination doesn't really work here the way it does for two linear equations — the reliable method is substitution. Solve the linear equation for one variable, then substitute that expression into the nonlinear equation. This gives you a single-variable equation (often quadratic) to solve. Watch for two valid solutions — a line can cross a parabola at up to two points. Don't stop after finding just one, unless something in the question rules the other out.",
      examples: [
        {
          q: "Solve the system: y = x + 1, y = x² - 5. What is the value of x, given x > 0?",
          choices: ["3", "-2", "3 or -2", "1"],
          answer: 0,
          explain:
            "Substitute the linear expression for y into the quadratic equation: x + 1 = x² - 5. Rearranging: 0 = x² - x - 6, which factors to (x-3)(x+2) = 0, giving x = 3 or x = -2. Applying the constraint x > 0 keeps x = 3 and rejects x = -2.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [{ label: "x = -2", accepted: false }, { label: "x = 3", accepted: true }] },
          difficulty: "easy",
        },
        {
          q: "Solve the system: y = 2x, y = x² - 3x. What are the possible values of x?",
          choices: ["x = 0 or x = 5", "x = 5 only", "x = 0 only", "x = -5 or x = 0"],
          answer: 0,
          explain: "Substitute y = 2x into the second equation: 2x = x² - 3x. Rearranging: 0 = x² - 5x, which factors to x(x-5) = 0, giving x = 0 or x = 5.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [{ label: "x = 0", accepted: true }, { label: "x = 5", accepted: true }] },
          difficulty: "easy",
        },
        {
          q: "Solve the system: y = 4x, y = x² - 12. What is the value of x, given x > 0?",
          choices: ["6", "-2", "6 or -2", "4"],
          answer: 0,
          explain:
            "Substitute 4x for y: 4x = x² - 12. Rearranging: 0 = x² - 4x - 12, which factors to (x-6)(x+2) = 0, giving x = 6 or x = -2. Applying the constraint x > 0 keeps x = 6.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [{ label: "x = -2", accepted: false }, { label: "x = 6", accepted: true }] },
          difficulty: "medium",
        },
        {
          q: "Solve the system: x + y = 10, y = x² - 4x + 6. What is the value of x, given x < 3?",
          choices: ["-1", "4", "-1 or 4", "3"],
          answer: 0,
          explain:
            "Solve the linear equation for y: y = 10 - x. Substituting into the quadratic equation: 10 - x = x² - 4x + 6. Rearranging: 0 = x² - 3x - 4, which factors to (x-4)(x+1) = 0, giving x = 4 or x = -1. Applying the constraint x < 3 rejects x = 4 and keeps x = -1.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [{ label: "x = 4", accepted: false }, { label: "x = -1", accepted: true }] },
          difficulty: "medium",
        },
        {
          q: "Does the system y = x + 8, y = x² + 2x + 10 have any real solutions?",
          choices: ["No real solutions", "One real solution", "Two real solutions", "Cannot be determined without graphing"],
          answer: 0,
          explain:
            "Substitute the linear expression into the quadratic equation: x + 8 = x² + 2x + 10. Rearranging into standard form: 0 = x² + x + 2. Rather than forcing a factoring attempt, check the discriminant: 1² - 4(1)(2) = -7, which is negative, meaning the line and the parabola never intersect.",
          diagram: { kind: "lineParabolaSystem", opensUp: true, points: [], noSolutions: true },
          difficulty: "hard",
        },
      ],
      traps: [
        "Attempting to use elimination on a linear-quadratic system, which generally doesn't work the way it does for two linear equations.",
        "Forgetting that a linear-quadratic system can have two valid solutions (two intersection points), not just one — stopping after finding only one.",
        "Substituting into the wrong equation, or losing track of which expression represents which variable after rearranging.",
      ],
    },
    {
      name: "Finding an Unknown Constant from a Given Root, Then Evaluating",
      explanation:
        "Some questions give a function in factored form with an unknown constant, tell you one point its graph passes through, and ask you to first solve for that constant — then use it to evaluate the function somewhere else. The method has two stages: substitute the given point into the function to solve for the unknown constant, then substitute that constant back in — along with the NEW input you're asked about — to get the final answer. Don't stop after finding the constant if the question asks for more.",
      examples: [
        {
          q: "The function f is defined by f(x) = (x - 3)(x - k), where k is a constant. The graph of y = f(x) passes through the point (5, 0). What is f(0)?",
          choices: ["15", "-15", "8", "2"],
          answer: 0,
          explain:
            "'Passes through (5, 0)' means f(5) = 0. Substitute x = 5: (5-3)(5-k) = 2(5-k) = 0, so k = 5. Evaluate f(0) using k = 5: f(0) = (0-3)(0-5) = (-3)(-5) = 15.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["3", "5"] },
          difficulty: "easy",
        },
        {
          q: "The function g is defined by g(x) = (x + 2)(x - k). The graph of y = g(x) passes through (6, 0). What is g(0)?",
          choices: ["-12", "12", "8", "-8"],
          answer: 0,
          explain:
            "'Passes through (6, 0)' means g(6) = 0. Substitute x = 6: (6+2)(6-k) = 8(6-k) = 0, so k = 6. Evaluate g(0) using k = 6: g(0) = (0+2)(0-6) = 2(-6) = -12.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-2", "6"] },
          difficulty: "easy",
        },
        {
          q: "The function g is defined by g(x) = (x + 14)(t - x), where t is a constant. The graph of y = g(x) passes through the point (24, 0). What is g(0)?",
          choices: ["336", "-336", "38", "560"],
          answer: 0,
          explain:
            "'(24, 0)' means g(24) = 0. Substitute x = 24: (24+14)(t-24) = 38(t-24) = 0; since 38 ≠ 0, t = 24. Substitute x = 0 and t = 24 into g(x) = (x+14)(t-x): g(0) = (0+14)(24-0) = 14 × 24 = 336.",
          diagram: { kind: "parabolaGraph", opensUp: false, rootLabels: ["-14", "24"] },
          difficulty: "medium",
        },
        {
          q: "The function h is defined by h(x) = (x - 4)(x + k). If h(2) = -6, what is the value of k?",
          choices: ["1", "3", "-1", "-3"],
          answer: 0,
          explain:
            "Unlike a root (where the output is 0), here the given point tells us h(2) = -6, a nonzero value — the same substitution method still applies, just without one factor automatically equaling zero. Substitute x = 2: (2-4)(2+k) = -2(2+k) = -6. Dividing both sides by -2: 2 + k = 3, so k = 1.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-1", "4"] },
          difficulty: "medium",
        },
        {
          q: "The function p is defined by p(x) = (x + 6)(x - m), where m is a constant. The graph of y = p(x) passes through (10, 0). What is p(-2)?",
          choices: ["-48", "48", "-32", "64"],
          answer: 0,
          explain:
            "'(10, 0)' means p(10) = 0. Substitute x = 10: (10+6)(10-m) = 16(10-m) = 0; since 16 ≠ 0, m = 10. Substitute x = -2 and m = 10 into p(x) = (x+6)(x-m): p(-2) = (-2+6)(-2-10) = (4)(-12) = -48.",
          diagram: { kind: "parabolaGraph", opensUp: true, rootLabels: ["-6", "10"] },
          difficulty: "hard",
        },
      ],
      traps: [
        "Stopping after solving for the unknown constant, without completing the second step the question actually asks for.",
        "Substituting the given point's coordinates into the wrong position (input vs. output) when solving for the constant.",
        "Forgetting that 'the graph passes through (a, 0)' means the function's value at x = a is 0 — the point's x-coordinate is not itself the constant being solved for.",
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
        "A quadratic written in vertex form, f(x) = a(x-h)² + k, reveals its vertex (h, k) with zero calculation — one of the fastest free points on the whole test, if you recognize the form. The one common error: a sign mix-up. Since the form has (x - h), a function written as (x + 3)² actually means h = -3, not h = 3.",
      examples: [
        {
          q: "The vertex of f(x) = (x - 2)² + 5 is which of the following points?",
          choices: ["(2, 5)", "(-2, 5)", "(2, -5)", "(-2, -5)"],
          answer: 0,
          explain:
            "A quadratic in vertex form a(x-h)² + k has vertex (h, k) with no calculation needed. Here the function subtracts 2 inside the parentheses, so h = 2, and it adds 5, so k = 5, giving vertex (2, 5). (-2, 5) comes from flipping the sign on h and mistakenly treating (x-2) as meaning h = -2; (2, -5) flips the sign on k instead; (-2, -5) flips both.",
          diagram: { kind: "parabolaGraph", opensUp: true, vertexLabel: "(2, 5)" },
          difficulty: "easy",
        },
        {
          q: "The vertex of f(x) = -2(x + 3)² - 1 is which of the following points?",
          choices: ["(-3, -1)", "(3, -1)", "(-3, 1)", "(3, 1)"],
          answer: 0,
          explain:
            "Matching to a(x-h)² + k, the function has (x+3), which means x - (-3), so h = -3, not h = 3 — since the template subtracts h, a plus sign inside means h is negative. It also subtracts 1, so k = -1, giving vertex (-3, -1). (3, -1) comes from the common sign error of reading (x+3) as h = 3. (-3, 1) and (3, 1) additionally flip the sign of k. The negative leading coefficient (-2) doesn't affect how h and k are read; it just makes this vertex a maximum instead of a minimum.",
          diagram: { kind: "parabolaGraph", opensUp: false, vertexLabel: "(-3, -1)" },
          difficulty: "medium",
        },
        {
          q: "The vertex of f(x) = (x - 7)² + 2 is which of the following points?",
          choices: ["(7, 2)", "(-7, 2)", "(7, -2)", "(-7, -2)"],
          answer: 0,
          explain:
            "Since the function has (x - 7), h = 7, and since it adds 2, k = 2, giving vertex (7, 2) read directly from vertex form. The other choices all come from flipping the sign of h, k, or both.",
          diagram: { kind: "parabolaGraph", opensUp: true, vertexLabel: "(7, 2)" },
          difficulty: "easy",
        },
        {
          q: "The vertex of f(x) = 3(x + 4)² is which of the following points?",
          choices: ["(-4, 0)", "(4, 0)", "(-4, 3)", "(0, -4)"],
          answer: 0,
          explain:
            "The function has (x+4), meaning x - (-4), so h = -4. There's no constant added or subtracted after the squared term, which means k = 0, not that k is missing entirely — the vertex's y-coordinate is exactly 0, giving vertex (-4, 0). (4, 0) comes from misreading the sign on h. (-4, 3) comes from mistakenly using the leading coefficient 3 as k. (0, -4) swaps the coordinates.",
          diagram: { kind: "parabolaGraph", opensUp: true, vertexLabel: "(-4, 0)" },
          difficulty: "medium",
        },
        {
          q: "A quadratic is given as y - 4 = -(x - 6)². What is the vertex of this parabola?",
          choices: ["(6, 4)", "(6, -4)", "(-6, 4)", "(-6, -4)"],
          answer: 0,
          explain:
            "This isn't yet written in the standard y = a(x-h)² + k template — isolating y first by adding 4 to both sides gives y = -(x-6)² + 4, so h = 6 and k = 4, giving vertex (6, 4). (6, -4) comes from skipping the rearranging step and keeping the original equation's subtracted 4. (-6, 4) and (-6, -4) come from misreading the sign on h.",
          diagram: { kind: "parabolaGraph", opensUp: false, vertexLabel: "(6, 4)" },
          difficulty: "hard",
        },
      ],
      traps: [
        "Misreading the sign inside the parentheses — (x + 3)² corresponds to h = -3, not h = 3, since the template is (x - h).",
        "Forgetting that a negative leading coefficient (a) means the vertex is a maximum, not a minimum, even though h and k are read the same way.",
      ],
    },
    {
      name: "Modeling Growth and Decay with Exponential Functions",
      explanation:
        "Word problems describing repeated percentage growth or decay — population growth, compound interest, radioactive decay, depreciation — need an exponential function, not a linear one. (Using a linear model here is a common early mistake.) The base of the exponential directly captures the rate: for growth of r% per period, the base is (1 + r/100); for decay of r% per period, it's (1 - r/100).",
      examples: [
        {
          q: "A car's value decreases by 12% each year from an initial price of $30,000. Which of the following gives the car's value after 2 years?",
          choices: ["30000(0.88)^2", "30000(0.12)^2", "30000 - 2(0.12)(30000)", "30000(1.12)^2"],
          answer: 0,
          explain:
            "This is repeated percentage decay, which needs an exponential model, not a linear one that just subtracts a flat amount each year. Since the value decreases by 12% each year, 88% remains each year, giving a base of 0.88 — not the raw rate 0.12 — so 30000(0.88)^2 = 23,232 is correct. 30000(0.12)^2 mistakes the decay rate for the base. 30000 - 2(0.12)(30000) applies the loss linearly, subtracting a flat 12% of the original value each year instead of compounding. 30000(1.12)^2 uses a growth base for a decay scenario.",
          diagram: { kind: "exponentialGraph", growth: false, yInterceptLabel: "$30,000" },
          difficulty: "easy",
        },
        {
          q: "A population of bacteria grows by 8% every hour, starting from 500 bacteria. Which function models the population P after t hours?",
          choices: ["P = 500(1.08)^t", "P = 500(0.08)^t", "P = 500 + 8t", "P = 500(1.8)^t"],
          answer: 0,
          explain:
            "This is repeated percentage growth, which needs an exponential model. Growth of 8% per hour means the base is 1 + 0.08 = 1.08, not the raw rate 0.08 itself, so P = 500(1.08)^t is correct. P = 500(0.08)^t mistakes the growth rate for the base. P = 500 + 8t models the growth linearly, adding a flat amount each hour instead of compounding. P = 500(1.8)^t confuses 8% with 80%.",
          diagram: { kind: "exponentialGraph", growth: true, yInterceptLabel: "500" },
          difficulty: "medium",
        },
        {
          q: "A population of 800 fish decreases by 5% each year. Which function models the population P after t years?",
          choices: ["P = 800(0.95)^t", "P = 800(0.05)^t", "P = 800 - 40t", "P = 800(1.05)^t"],
          answer: 0,
          explain:
            "A 5% decrease means 95% remains each year, giving a base of 0.95, so P = 800(0.95)^t is correct. P = 800(0.05)^t mistakes the decay rate for the base. P = 800 - 40t models the loss linearly (a flat 5% of the original 800 subtracted each year) rather than compounding. P = 800(1.05)^t uses a growth base for a decay scenario.",
          diagram: { kind: "exponentialGraph", growth: false, yInterceptLabel: "800" },
          difficulty: "easy",
        },
        {
          q: "An investment of $2,000 earns 8% annual interest, compounded quarterly. Which function models the value V after t years?",
          choices: ["V = 2000(1.02)^(4t)", "V = 2000(1.08)^(4t)", "V = 2000(1.02)^t", "V = 2000(1.08)^t"],
          answer: 0,
          explain:
            "Because 8% is an annual rate but interest compounds quarterly, the rate per period is 0.08/4 = 0.02, not 0.08, and since there are 4 compounding periods per year, the exponent must count total quarters over t years, giving 4t — so V = 2000(1.02)^(4t) is correct. V = 2000(1.08)^(4t) uses the annual rate instead of dividing it by 4. V = 2000(1.02)^t correctly adjusts the rate but forgets to adjust the exponent for the number of periods. V = 2000(1.08)^t makes both mistakes at once.",
          diagram: { kind: "exponentialGraph", growth: true, yInterceptLabel: "$2,000" },
          difficulty: "medium",
        },
        {
          q: "A city's population grew from 40,000 to 44,000 over one year, and continues to grow at the same constant percentage rate each year. Which function models the population P after t years?",
          choices: ["P = 40000(1.1)^t", "P = 40000(0.1)^t", "P = 40000(1.4)^t", "P = 44000(1.1)^t"],
          answer: 0,
          explain:
            "Since no percentage is stated directly, the growth multiplier is found by dividing the new value by the original: 44000/40000 = 1.1, and that multiplier IS the base of the exponential function directly, giving P = 40000(1.1)^t. P = 40000(0.1)^t mistakes the multiplier for a rate that still needs 1 added to it. P = 40000(1.4)^t misreads the 4,000-person increase as 40% rather than computing the actual ratio. P = 44000(1.1)^t incorrectly uses the later population as the starting value instead of the original 40,000.",
          diagram: { kind: "exponentialGraph", growth: true, yInterceptLabel: "40,000" },
          difficulty: "hard",
        },
      ],
      traps: [
        "Modeling percentage-based growth or decay with a linear function (subtracting a flat amount each year) instead of an exponential one.",
        "Using the percentage rate itself (like 0.12) as the base, instead of correctly computing (1 - rate) for decay or (1 + rate) for growth.",
      ],
    },
    {
      name: "Reading Linear vs. Exponential Growth From a Table",
      explanation:
        "This pattern gives you a table of x and y values — not an equation or word problem — and asks whether the function is linear or exponential, and increasing or decreasing. The method: check how the output changes as the input increases by a constant amount. If it changes by the same ADDED amount each time, it's linear. If it changes by the same MULTIPLIED factor each time, it's exponential. Check at least two consecutive differences or ratios before deciding — one matching pair isn't enough to confirm the pattern.",
      examples: [
        {
          q: "A table shows x: -1, 0, 1, 2 with f(x): 16, 17, 18, 19. Which best describes f?",
          choices: ["Increasing linear", "Increasing exponential", "Decreasing linear", "Decreasing exponential"],
          answer: 0,
          explain:
            "Checking the differences between consecutive outputs gives 17-16=1, 18-17=1, 19-18=1, a constant added amount, which is the signature of a linear function — and since the outputs are getting larger, it's increasing linear. The exponential options are ruled out because the outputs don't share a constant ratio (17/16 ≠ 18/17), and the decreasing options are ruled out because the values are rising, not falling.",
          difficulty: "easy",
        },
        {
          q: "A table shows x: 0, 1, 2, 3 with g(x): 5, 10, 20, 40. Which best describes g?",
          choices: ["Increasing exponential", "Increasing linear", "Decreasing exponential", "Decreasing linear"],
          answer: 0,
          explain:
            "The differences between consecutive outputs (10-5=5, 20-10=10) are not constant, which rules out linear. The ratios, though, are constant: 10/5=2, 20/10=2, 40/20=2 — a constant ratio is the signature of exponential growth, and since the values are rising, it's increasing exponential.",
          difficulty: "easy",
        },
        {
          q: "A table shows x: 0, 1, 2, 3 with h(x): 50, 44, 38, 32. Which best describes h?",
          choices: ["Decreasing linear", "Decreasing exponential", "Increasing linear", "Increasing exponential"],
          answer: 0,
          explain:
            "The differences between consecutive outputs are constant (44-50=-6, 38-44=-6, 32-38=-6), which is the signature of linear behavior, not exponential — even though the values are shrinking, that alone doesn't mean decay. Confirming with ratios shows they are NOT constant (44/50 ≈ 0.88, 38/44 ≈ 0.864), ruling out exponential decay. Since the values fall by a constant amount, this is decreasing linear.",
          difficulty: "medium",
        },
        {
          q: "A table shows x: 0, 1, 2, 3 with k(x): 200, 150, 112.5, 84.375. Which best describes k?",
          choices: ["Decreasing exponential", "Decreasing linear", "Increasing exponential", "Increasing linear"],
          answer: 0,
          explain:
            "The differences between consecutive outputs (150-200=-50, 112.5-150=-37.5) are not constant, ruling out linear. The ratios are constant instead: 150/200=0.75, 112.5/150=0.75 — a constant ratio, even one less than 1, is the signature of exponential decay, so this is decreasing exponential.",
          difficulty: "medium",
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
        },
      ],
      traps: [
        "Assuming a table shows exponential growth just because the numbers are getting bigger, without checking whether the differences (linear) or ratios (exponential) are actually constant.",
        "Checking only one pair of consecutive values instead of at least two, which can miss a table that isn't following a clean pattern all the way through.",
        "Confusing a constant ratio less than 1 (exponential decay) with a constant negative difference (linear decrease) — both shrink the output, but through different mechanisms.",
      ],
    },
    {
      name: "Graph Transformations (Shifts)",
      explanation:
        "This pattern shows the graph of a function f and asks you to identify a transformed version, like f(x) + k (vertical shift) or f(x - h) (horizontal shift). Know the shift rules directly: adding a constant OUTSIDE the function shifts it vertically — up if positive, down if negative. Adding or subtracting a constant INSIDE the function's input shifts it horizontally, and counterintuitively in the OPPOSITE direction of the sign (f(x-3) shifts right, f(x+3) shifts left). Apply the shift to a few key reference points from the original graph to see exactly where they land.",
      examples: [
        {
          q: "The graph of f passes through the point (2, 5). If g(x) = f(x) + 3, what corresponding point lies on the graph of g?",
          choices: ["(2, 8)", "(5, 5)", "(2, 2)", "(-1, 5)"],
          answer: 0,
          explain:
            "g(x) = f(x) + 3 is a vertical shift — every output increases by 3 while inputs stay the same, so (2, 5) becomes (2, 5+3) = (2, 8). (5, 5) mistakenly adds 3 to the x-coordinate instead of the y-coordinate. (2, 2) subtracts instead of adds. (-1, 5) shifts the x-coordinate as if this were a horizontal shift, which it isn't.",
          difficulty: "easy",
        },
        {
          q: "The graph of f passes through the point (4, 1). If g(x) = f(x - 2), what corresponding point lies on the graph of g?",
          choices: ["(6, 1)", "(2, 1)", "(4, 3)", "(4, -1)"],
          answer: 0,
          explain:
            "g(x) = f(x-2) is a horizontal shift, and since the template subtracts h, the graph moves right, meaning 2 is added to the x-coordinate: (4, 1) becomes (4+2, 1) = (6, 1). (2, 1) subtracts instead of adds, moving the point the wrong direction. (4, 3) and (4, -1) mistakenly shift the y-coordinate instead of the x-coordinate for what is purely a horizontal shift.",
          difficulty: "easy",
        },
        {
          q: "The graph of f has a minimum point at (-3, -6). If g(x) = f(x + 5), what is the minimum point of g?",
          choices: ["(-8, -6)", "(2, -6)", "(-8, -1)", "(2, -11)"],
          answer: 0,
          explain:
            "g(x) = f(x+5) is a horizontal shift, but the plus sign inside shifts the graph LEFT, not right — the opposite of what the sign might suggest. Subtracting 5 from the original x-coordinate gives -3-5 = -8, and the y-coordinate stays -6 since this is purely horizontal, giving (-8, -6). (2, -6) shifts right instead of left. (-8, -1) and (2, -11) incorrectly also change the y-coordinate.",
          difficulty: "medium",
        },
        {
          q: "The graph of f has a maximum point at (1, 9). If g(x) = f(x - 4) - 2, what is the maximum point of g?",
          choices: ["(5, 7)", "(-3, 7)", "(5, 11)", "(-3, 11)"],
          answer: 0,
          explain:
            "This transformation combines two shifts: f(x-4) shifts right by 4 (horizontal), and the -2 outside shifts down by 2 (vertical). Applying both to the original point gives x-coordinate 1+4=5 and y-coordinate 9-2=7, so the maximum point of g is (5, 7). (-3, 7) shifts left instead of right. (5, 11) and (-3, 11) add instead of subtract for the vertical shift.",
          difficulty: "medium",
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
            "f(x) + 5 is a vertical shift — every point on the original graph moves up by 5, including the asymptote itself, so the asymptote moves from y = 0 to y = 5, and the curve still decreases toward that new level. It's incorrect to think the asymptote stays put; a vertical shift moves every part of the graph, including the level it flattens toward. The overall shape (still decreasing, not increasing) doesn't change, and the asymptote remains horizontal, not vertical — only its vertical position moves.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Shifting the graph in the wrong direction for a horizontal shift, since f(x-h) moves right for positive h, which feels backward compared to vertical shifts.",
        "Confusing a vertical shift (add/subtract outside the function) with a horizontal shift (add/subtract inside the function's parentheses).",
        "Applying the shift amount to only part of the graph's key features instead of every point uniformly, including asymptotes.",
      ],
    },
    {
      name: "Minimum, Maximum, and Asymptote Reasoning for Exponential Functions",
      explanation:
        "This pattern asks about the minimum or maximum value of an exponential function, or where it levels off — no vertex form here, since exponential functions don't have vertices. The key fact: for f(x) = a·b^x + c, the graph gets closer and closer to c but never actually reaches it — that's the horizontal asymptote — and c acts as the function's effective floor or ceiling. Whether the function increases or decreases, and whether c is a floor or a ceiling, depends on the signs of a and b — not on c alone.",
      examples: [
        {
          q: "What value does the function f(x) = 3(2)^x + 4 approach but never reach as x decreases toward negative infinity?",
          choices: ["4", "3", "2", "7"],
          answer: 0,
          explain:
            "The constant added at the end (4) is what the function approaches, not the coefficient (3) or the base (2). As x gets very negative, 2^x shrinks toward 0, so 3(2)^x also shrinks toward 0, leaving the function approaching just the constant term, 4. 3 mistakes the coefficient for the asymptote. 2 mistakes the base for the asymptote. 7 comes from adding the coefficient and constant together.",
          difficulty: "easy",
        },
        {
          q: "What is the horizontal asymptote of g(x) = -5(0.5)^x - 2?",
          choices: ["y = -2", "y = -5", "y = 0.5", "y = -7"],
          answer: 0,
          explain:
            "As x increases, (0.5)^x shrinks toward 0, so -5(0.5)^x also shrinks toward 0, leaving the function approaching just the constant term, -2, so the asymptote is y = -2. y = -5 mistakes the coefficient for the asymptote. y = 0.5 mistakes the base for the asymptote. y = -7 comes from combining the coefficient and constant.",
          difficulty: "easy",
        },
        {
          q: "Which of the following functions has a maximum value at y = -3?\nI. h(x) = -4(2)^x - 3\nII. k(x) = 4(2)^x - 3",
          choices: ["Only function I", "Only function II", "Both function I and II", "Neither function I nor II"],
          answer: 0,
          explain:
            "Both functions share the same constant (-3), but that alone doesn't determine max vs. min — the sign of the coefficient does. In function I, the coefficient is -4 (negative); since the base (2) is greater than 1, a negative coefficient means the function approaches -3 from below as x decreases, making -3 a ceiling and thus a maximum. In function II, the coefficient is 4 (positive), so the function approaches -3 from above as x decreases, making -3 a floor, not a maximum — so only function I qualifies.",
          difficulty: "medium",
        },
        {
          q: "A cup of coffee's temperature, in degrees Fahrenheit, is modeled by T(t) = 70(0.9)^t + 68, where t is the number of minutes since it was poured. What temperature does the coffee approach as time goes on?",
          choices: ["68°F", "70°F", "0.9°F", "138°F"],
          answer: 0,
          explain:
            "As t increases, (0.9)^t shrinks toward 0 (since 0.9 < 1), so 70(0.9)^t also shrinks toward 0, leaving the function approaching just the constant, 68. This matches real cooling behavior — the coffee cools toward room temperature but never quite reaches it. 70°F mistakes the coefficient for the asymptote. 0.9°F mistakes the base for the asymptote. 138°F comes from adding the coefficient and constant together.",
          difficulty: "medium",
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
            "P's base (1.05) is greater than 1, meaning P grows without bound as t increases, with no upper asymptote. Q's base (0.92) is less than 1, meaning Q shrinks toward (but never reaches) 0 as t increases. Comparing the two bases — greater than 1 versus less than 1 — determines the long-term outcome regardless of which starting value was larger, so P eventually overtakes Q permanently. Q's larger starting value (500) doesn't matter for the long-term comparison, since Q is shrinking while P keeps growing. And Q isn't growing at all — its base below 1 means it shrinks, not grows.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Using the coefficient (a) as the function's minimum or maximum instead of the constant added or subtracted at the end (c).",
        "Assuming every exponential function has a true minimum or maximum the way a parabola does, rather than a value it only approaches.",
        "Mixing up whether a negative leading coefficient makes the function open toward positive or negative infinity, which determines whether c acts as an upper or lower bound.",
      ],
    },
    {
      name: "Finding the Vertex of a Quadratic from Standard Form",
      explanation:
        "When a quadratic is given in standard form, f(x) = ax² + bx + c, instead of vertex form, its vertex isn't visible at a glance — you have to find it. The fastest method: the vertex's x-coordinate is always -b/2a. Substitute that back into the function to get the y-coordinate. Completing the square works too, and rewrites the function in vertex form directly — useful when the question also asks for the rewritten equation, not just the vertex's coordinates.",
      examples: [
        {
          q: "What is the vertex of f(x) = x² - 6x + 5?",
          choices: ["(3, -4)", "(-3, -4)", "(3, 4)", "(6, 5)"],
          answer: 0,
          explain:
            "With a = 1 and b = -6, the vertex's x-coordinate is -b/2a = -(-6)/(2·1) = 3. Substituting x = 3 back into the original function gives f(3) = 9 - 18 + 5 = -4, so the vertex is (3, -4). (-3, -4) flips the sign of the x-coordinate from a sign error in -b/2a. (3, 4) flips the sign of the y-coordinate. (6, 5) comes from misreading b and c directly as coordinates instead of computing the vertex.",
          difficulty: "easy",
        },
        {
          q: "What is the minimum value of f(x) = x² + 8x + 10?",
          choices: ["-6", "-4", "10", "-16"],
          answer: 0,
          explain:
            "Since a = 1 is positive, the parabola opens upward, so its vertex is a minimum. The x-coordinate of the vertex is -b/2a = -8/2 = -4, and substituting back in gives f(-4) = 16 - 32 + 10 = -6, which is the minimum value — the vertex's y-coordinate, not its x-coordinate. -4 mistakenly reports the x-coordinate of the vertex instead of the minimum value itself. 10 mistakes the constant term c for the minimum. -16 comes from an arithmetic slip when substituting back in.",
          difficulty: "easy",
        },
        {
          q: "What is the vertex of g(x) = 2x² - 12x + 7?",
          choices: ["(3, -11)", "(6, -11)", "(3, 7)", "(-3, -11)"],
          answer: 0,
          explain:
            "With a = 2 and b = -12 — the leading coefficient must be included in the formula, not dropped — the x-coordinate is -b/2a = -(-12)/(2·2) = 3. Substituting back in gives g(3) = 2(9) - 36 + 7 = -11, so the vertex is (3, -11). (6, -11) comes from dropping the leading coefficient and computing -b/2 instead of -b/2a. (3, 7) mistakenly uses the constant term c as the y-coordinate. (-3, -11) flips the sign of the x-coordinate.",
          difficulty: "medium",
        },
        {
          q: "Which of the following is the vertex form of f(x) = x² + 10x + 21, found by completing the square?",
          choices: ["(x+5)² - 4", "(x+5)² + 21", "(x-5)² - 4", "(x+10)² - 79"],
          answer: 0,
          explain:
            "Taking half of the x-coefficient and squaring it gives (10/2)² = 25; adding and subtracting this value rewrites the expression without changing it: x² + 10x + 25 - 25 + 21. The first three terms form a perfect square, giving (x+5)² - 25 + 21 = (x+5)² - 4. (x+5)² + 21 correctly completes the square but forgets to subtract the 25 that was added. (x-5)² - 4 gets the sign inside the parentheses wrong. (x+10)² - 79 incorrectly uses the full x-coefficient (10) instead of half of it.",
          difficulty: "medium",
        },
        {
          q: "A ball's height in feet is modeled by h(t) = -16t² + 64t + 5, where t is time in seconds after launch. What is the maximum height the ball reaches?",
          choices: ["69 feet", "2 feet", "5 feet", "64 feet"],
          answer: 0,
          explain:
            "Since a = -16 is negative, the parabola opens downward, so its vertex is a maximum — exactly what's being asked. The x-coordinate (representing time) is -b/2a = -64/(2·-16) = 2, and substituting t = 2 back into the function gives h(2) = -16(4) + 64(2) + 5 = -64 + 128 + 5 = 69. 2 feet mistakenly reports the vertex's x-coordinate (when the maximum occurs) instead of the maximum height itself. 5 feet mistakes the initial height (the constant term) for the maximum. 64 feet misreads the coefficient of t as the answer.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Reporting the vertex's x-coordinate (-b/2a) as the answer when the question asks for the maximum or minimum value, which is actually the y-coordinate found by substituting back in.",
        "Dropping the leading coefficient a from the -b/2a formula when it isn't 1.",
        "Sign errors when substituting a negative b into -b/2a — double negatives here are a common place to lose a point.",
      ],
    },
    {
      name: "Evaluating a Function and Interpreting Its Output in Context",
      explanation:
        "These questions ask you to either compute a quadratic or exponential function's output at a given input, or interpret what an already-computed output means in the real-world scenario it describes. Unlike the vertex, growth-rate, or table patterns, there's no shortcut here beyond careful substitution: plug the input into the function, simplify, and follow order of operations exactly. When interpreting an output, connect the input and output variables back to what they mean in the scenario — like 'time in seconds' and 'height in feet' — and state the result using those units, not just as a bare number.",
      examples: [
        {
          q: "The function is defined by f(x) = 2x² - 5x + 1. What is f(3)?",
          choices: ["4", "10", "-14", "22"],
          answer: 0,
          explain:
            "Substituting x = 3 into every instance of x gives f(3) = 2(3)² - 5(3) + 1. Applying order of operations, exponents first: 2(9) - 5(3) + 1 = 18 - 15 + 1 = 4. 10 comes from computing 2(3)² correctly but mishandling the subtraction of 5(3). -14 comes from squaring 3 as if it applied to the whole term 2(3) instead of just 3. 22 comes from adding instead of subtracting the middle term.",
          difficulty: "easy",
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
        },
        {
          q: "A population is modeled by P(t) = 500(1.08)^t, where t is measured in years. What is P(0)?",
          choices: ["500", "0", "540", "1.08"],
          answer: 0,
          explain:
            "Substituting t = 0 gives P(0) = 500(1.08)^0. Any nonzero number raised to the power 0 equals 1, so (1.08)^0 = 1, and P(0) = 500(1) = 500 — the initial population, before any growth has occurred. 0 mistakenly treats t = 0 as making the whole expression 0. 540 comes from computing one year of growth (500 × 1.08) instead of recognizing that t = 0 means no time has passed. 1.08 mistakes the growth base itself for the population value.",
          difficulty: "medium",
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
        },
        {
          q: "An object's velocity in meters per second is modeled by v(x) = 3x² - 12x + 9, where x is the number of seconds since a sensor started recording, valid only for 0 ≤ x ≤ 5. For how many values of x in this interval is the object's velocity equal to 0?",
          choices: ["2", "1", "3", "0"],
          answer: 0,
          explain:
            "Setting the function equal to 0 gives 3x² - 12x + 9 = 0. Dividing every term by 3 simplifies to x² - 4x + 3 = 0, which factors as (x-1)(x-3) = 0, giving x = 1 or x = 3. Both values fall within the given domain (0 ≤ x ≤ 5), so both are valid, giving 2 total solutions. Answering 1 would mean incorrectly discarding one of the two valid roots. Answering 3 overcounts, likely from an arithmetic slip while factoring. Answering 0 would incorrectly assume neither root falls in the domain, when both do.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Substitution errors from skipping steps — especially forgetting to square the entire input, including its sign, before multiplying by other terms.",
        "Swapping which variable represents the input and which represents the output when writing an interpretation in words.",
        "Forgetting to check a solution against a stated domain restriction when a real-world scenario limits which input values actually make sense.",
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
        "The most reliable trick for ratio and rate word problems: set up two fractions with matching units in matching positions — both numerators are the same kind of quantity, both denominators are the same kind of quantity — then cross-multiply. Errors here almost always come from a mismatched setup, not from the arithmetic itself.",
      examples: [
        {
          q: "A recipe uses 2 cups of flour for 12 cookies. How many cups are needed for 30 cookies?",
          choices: ["5", "180", "0.8", "20"],
          answer: 0,
          explain:
            "Setting up a proportion with matching units, (cups)/(cookies) = (cups)/(cookies), gives 2/12 = x/30; cross-multiplying gives 12x = 60, so x = 5. 180 comes from flipping which side of the proportion is numerator vs. denominator (setting up 2/12 = 30/x instead), producing the reciprocal relationship. 0.8 comes from dividing in the wrong direction entirely (2×12/30). 20 comes from treating the given numbers as if they could simply be added and subtracted instead of set into a proportion.",
          difficulty: "easy",
        },
        {
          q: "A factory produces 45 units in 3 hours. At this rate, how many hours will it take to produce 225 units?",
          choices: ["15", "3", "5", "675"],
          answer: 0,
          explain:
            "Setting up a proportion with matching units, (units)/(hours) = (units)/(hours), gives 45/3 = 225/x; cross-multiplying gives 45x = 675, so x = 15. 3 mistakes the original given hours for the answer, without doing any calculation. 5 comes from computing the scale factor 225/45 = 5 correctly but forgetting to multiply it by the original 3 hours. 675 comes from cross-multiplying correctly but forgetting the final division step, leaving 45x itself as the answer.",
          difficulty: "medium",
        },
        {
          q: "A car uses 3 gallons of gas to travel 75 miles. How many gallons are needed to travel 200 miles?",
          choices: ["8", "8.33", "5", "600"],
          answer: 0,
          explain:
            "Setting up a proportion with matching units, 3/75 = x/200, and cross-multiplying gives 75x = 600, so x = 8. 8.33 comes from an arithmetic slip in the final division step. 5 confuses this problem with a similar-looking one, using the wrong given numbers. 600 comes from cross-multiplying correctly but forgetting to complete the final division step.",
          difficulty: "easy",
        },
        {
          q: "A recipe uses 3/4 cup of sugar for 18 cookies. How many cups of sugar are needed for 30 cookies?",
          choices: ["1.25", "0.75", "1.8", "22.5"],
          answer: 0,
          explain:
            "Setting up a proportion with matching units, (3/4)/18 = x/30, and cross-multiplying gives 18x = 30 × (3/4) = 22.5, so x = 22.5/18 = 1.25. 0.75 just restates the original 3/4 cup without scaling it to the new number of cookies. 1.8 comes from a division error when finishing the last step. 22.5 comes from cross-multiplying correctly but forgetting to divide by 18 to isolate x.",
          difficulty: "medium",
        },
        {
          q: "A factory's 5 machines produce 600 units in 4 hours. If 2 of the machines break down, how many units will the remaining machines produce in 6 hours, assuming each machine works at the same constant rate?",
          choices: ["540", "900", "360", "450"],
          answer: 0,
          explain:
            "Finding the rate per single machine first, 600 units ÷ 5 machines ÷ 4 hours = 30 units per machine per hour; applying this to 3 remaining machines over 6 hours gives 3 × 30 × 6 = 540 units. 900 comes from forgetting to reduce the number of machines from 5 to 3 in the final multiplication. 360 comes from using the original 4 hours instead of the new 6 hours. 450 comes from using 2 (the number that broke down) instead of the 3 machines that remain.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Setting up the proportion with mismatched units (e.g., cups over cookies on one side, cookies over cups on the other).",
        "Cross-multiplying correctly but from an incorrectly set-up proportion, producing a confidently wrong answer.",
      ],
    },
    {
      name: "Unit Conversion Chains",
      explanation:
        "This pattern requires converting between units — like miles to feet, or hours to seconds — before or after a rate calculation. The safest method: write out a chain of conversion factors, each one arranged so the unwanted unit cancels out (appearing once on top, once on bottom). That's more reliable than trying to remember whether to multiply or divide by the conversion number.",
      examples: [
        {
          q: "A car travels at 60 miles per hour. What is this speed in feet per minute? (1 mile = 5,280 feet)",
          choices: ["5,280", "316,800", "88", "63,360"],
          answer: 0,
          explain:
            "Chaining conversions so units cancel, 60 miles/hour × 5,280 feet/mile × 1 hour/60 minutes leaves (60 × 5,280)/60 = 5,280 feet per minute. 316,800 comes from forgetting to divide by 60 to convert hours to minutes — that's feet per hour, not per minute. 88 confuses this with the well-known fact that 60 mph equals 88 feet per second, applying that conversion to the wrong unit of time. 63,360 comes from a units mix-up that leaves an extra, unneeded factor in the computation.",
          difficulty: "easy",
        },
        {
          q: "A runner's pace is 9 minutes per mile. What is this pace in seconds per 100 meters? (1 mile ≈ 1,609 meters)",
          choices: ["≈33.6 seconds", "≈5.4 seconds", "≈540 seconds", "≈3.36 seconds"],
          answer: 0,
          explain:
            "Converting minutes to seconds first gives 9 min/mile × 60 sec/min = 540 sec/mile; dividing by the meters in a mile (540/1,609 ≈ 0.336 sec/meter) and scaling to 100 meters (0.336 × 100) gives about 33.6 seconds. ≈5.4 seconds comes from scaling to 100 meters before finishing the meters conversion, an out-of-order calculation. ≈540 seconds mistakenly reports the seconds-per-mile figure without scaling it down to the smaller 100-meter distance. ≈3.36 seconds comes from a misplaced decimal point when scaling to 100 meters.",
          difficulty: "medium",
        },
        {
          q: "A container holds 3 liters of liquid. How many milliliters is this? (1 liter = 1,000 milliliters)",
          choices: ["3,000", "300", "0.003", "30"],
          answer: 0,
          explain:
            "Multiplying 3 liters by the conversion factor 1,000 milliliters/liter gives 3 × 1,000 = 3,000 milliliters. 300 and 30 come from misplaced decimal points using the wrong power of ten. 0.003 comes from dividing instead of multiplying by the conversion factor, inverting the relationship entirely.",
          difficulty: "easy",
        },
        {
          q: "A rectangular room measures 4 yards by 3 yards. What is its area in square feet? (1 yard = 3 feet)",
          choices: ["108", "36", "12", "324"],
          answer: 0,
          explain:
            "Since 1 yard = 3 feet, converting an area (not a length) requires squaring the linear conversion factor, giving 1 square yard = 9 square feet; the room's area is 4 × 3 = 12 square yards, so in square feet it's 12 × 9 = 108. 36 mistakenly converts only one of the two dimensions instead of accounting for both. 12 reports the area in square yards without ever converting to square feet. 324 comes from squaring the total square-yard area itself (12²) instead of just the conversion factor.",
          difficulty: "medium",
        },
        {
          q: "A cyclist travels at 8 meters per second. What is this speed in miles per hour, rounded to the nearest whole number? (1 mile ≈ 1,609 meters)",
          choices: ["≈18", "≈8", "≈29", "≈4,969"],
          answer: 0,
          explain:
            "Converting seconds to hours first gives 8 meters/second × 3,600 seconds/hour = 28,800 meters/hour; dividing by the meters in a mile (28,800/1,609 ≈ 17.9) rounds to about 18 miles per hour. ≈8 mistakenly reports the original speed in meters per second as if it were already in miles per hour. ≈29 comes from converting meters to miles before converting seconds to hours, an out-of-order calculation that produces the wrong scale. ≈4,969 comes from forgetting to divide by 1,609 at all, leaving the answer in meters per hour.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).",
        "Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.",
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
        },
        {
          q: "A school's ratio of teachers to students is 1 to 22. If there are s students, which expression represents the number of teachers?",
          choices: ["s/22", "22s", "s - 22", "s/1"],
          answer: 0,
          explain:
            "There's 1 teacher for every 22 students, so teachers = students ÷ 22, giving s/22. 22s reverses the ratio, as if there were 22 teachers per student. s - 22 incorrectly treats the ratio as additive. s/1 drops the ratio's denominator entirely.",
          difficulty: "easy",
        },
        {
          q: "At a robotics competition, the ratio of judges to teams is 1 to 8. If there are j judges at the competition, which expression represents the number of teams?",
          choices: ["8j", "j/8", "j + 8", "8 - j"],
          answer: 0,
          explain:
            "For every 1 judge there are 8 teams, so teams = 8 × judges, giving 8j for j judges. j/8 reverses the ratio, representing judges in terms of a given number of teams instead. j + 8 and 8 - j incorrectly treat the ratio as additive rather than multiplicative.",
          difficulty: "medium",
        },
        {
          q: "In a bag of marbles, 3 out of every 10 marbles are blue. If the bag contains m marbles total, which expression represents the number of blue marbles?",
          choices: ["(3/10)m", "(10/3)m", "3m - 10", "m/3"],
          answer: 0,
          explain:
            "Since the ratio compares blue marbles to the TOTAL (3 out of every 10 total, a part-to-whole ratio), blue marbles = 3/10 of the total, giving (3/10)m. (10/3)m inverts the fraction, as if 3 were the total and 10 were the part. 3m - 10 incorrectly treats the ratio as an additive adjustment. m/3 drops the numerator of the ratio entirely.",
          difficulty: "medium",
        },
        {
          q: "At a company, the ratio of managers to engineers is 1 to 6, and the ratio of engineers to interns is 3 to 10. If there are m managers, which expression represents the number of interns, in terms of m?",
          choices: ["20m", "18m", "m/20", "60m"],
          answer: 0,
          explain:
            "Translating managers to engineers first gives engineers = 6 × managers = 6m; translating engineers to interns using the second ratio (engineers:interns = 3:10) gives interns = (10/3) × engineers, and substituting 6m gives (10/3)(6m) = 20m. 18m comes from multiplying the two ratio numbers (6 × 3) directly instead of correctly chaining the ratios. m/20 inverts the final relationship. 60m comes from multiplying together all the given ratio numbers without correctly inverting the second ratio (3/10 vs. 10/3).",
          difficulty: "hard",
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
        "Basic percentage problems — discounts, tax, tips, simple percent change — all follow the same formula: percent change = (new - old)/old × 100. For direct calculations, like 'find the sale price,' it's often faster to think in multipliers: a 25% discount means the customer pays 75% of the original price. Just multiply by 0.75 directly, instead of calculating the discount amount and subtracting it.",
      examples: [
        {
          q: "A shirt originally $40 is discounted 25%. What is the sale price?",
          choices: ["$30", "$10", "$35", "$50"],
          answer: 0,
          explain:
            "A 25% discount means the customer pays 100%-25%=75% of the original price; multiplying directly by that multiplier, 40 × 0.75 = $30. $10 mistakenly reports the discount amount itself instead of the sale price. $35 comes from subtracting the wrong amount, like a flat $5, instead of 25% of the price. $50 comes from adding the discount instead of subtracting it.",
          difficulty: "easy",
        },
        {
          q: "A wholesaler buys an item for $50 and marks it up 40% to set the retail price. What is the retail price?",
          choices: ["$70", "$20", "$90", "$50.40"],
          answer: 0,
          explain:
            "A 40% markup means the retail price is 100%+40%=140% of the wholesale price; multiplying directly, 50 × 1.40 = $70. $20 mistakenly reports just the markup amount instead of the full retail price. $90 comes from misapplying the multiplier, like adding the markup twice. $50.40 comes from confusing 40% with 0.4%, a decimal-placement slip.",
          difficulty: "medium",
        },
        {
          q: "A meal costs $60 before an 8% sales tax. What is the total cost including tax?",
          choices: ["$64.80", "$4.80", "$68", "$55.20"],
          answer: 0,
          explain:
            "An 8% tax means the customer pays 100%+8%=108% of the meal price; multiplying directly, 60 × 1.08 = $64.80. $4.80 mistakenly reports just the tax amount instead of the total cost. $68 comes from a rounding or arithmetic slip while adding the tax. $55.20 comes from subtracting the tax instead of adding it.",
          difficulty: "easy",
        },
        {
          q: "After a 20% discount, a jacket costs $64. What was the original price?",
          choices: ["$80", "$76.80", "$51.20", "$84"],
          answer: 0,
          explain:
            "Since the discounted price is 80% of the original, 64 = original × 0.80, so dividing (not multiplying) gives original = 64/0.80 = $80. $76.80 comes from mistakenly multiplying 64 by 0.80 again instead of dividing, as if the given price needed another discount applied. $51.20 comes from a similar multiply-instead-of-divide error. $84 comes from simply adding back 20% of $64 rather than correctly reversing the multiplier.",
          difficulty: "medium",
        },
        {
          q: "A $50 meal has an 18% tip added first, and then a $10 discount coupon is applied to the total. What is the final price?",
          choices: ["$49", "$47.20", "$41.80", "$59"],
          answer: 0,
          explain:
            "Applying the operations in the stated order, the tip is calculated first: 50 × 1.18 = 59, and then the flat $10 discount is applied to that new total: 59 - 10 = 49. $47.20 comes from applying the $10 discount before the tip (50-10=40, ×1.18=47.20), reversing the correct order. $41.80 makes a similar order-and-arithmetic error. $59 mistakenly reports the pre-discount total, forgetting to subtract the coupon at all.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Calculating the discount amount correctly but then forgetting to subtract it from the original price (reporting the discount amount itself as the final answer).",
        "Confusing 'the price is 25% off' with 'the price is 25% of the original' — these produce very different final prices.",
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
        },
        {
          q: "A stock's price increases by 50% one month, then decreases by 50% the next month. Compared to the original price, the final price is:",
          choices: ["25% lower", "The same (0% net change)", "25% higher", "100% lower"],
          answer: 0,
          explain:
            "Representing the original as 100, a 50% increase gives 150, and a 50% decrease applied to the new 150 gives 75 — a net 25% decrease. Assuming the two 50% swings cancel out is the same additive-thinking trap that fails for any pair of equal-and-opposite percentages. 25% higher flips the direction. 100% lower would mean the price hit zero, which isn't what a 50% decrease does.",
          difficulty: "medium",
        },
        {
          q: "A price increases by 10% and then increases by another 10%. Compared to the original price, the final price is:",
          choices: ["21% higher", "20% higher", "22% higher", "10% higher"],
          answer: 0,
          explain:
            "Representing the original as 100, the first 10% increase gives 110, and the second 10% increase applied to the new 110 (not the original 100) gives 121 — a 21% increase. 20% higher comes from simply adding the two percentages together instead of compounding them. 22% higher overcorrects, perhaps from a slip in the compounding calculation. 10% higher mistakenly ignores the second increase entirely.",
          difficulty: "easy",
        },
        {
          q: "A stock's price decreases by 30% one month, then increases by 40% the next month. Compared to the original price, the final price is:",
          choices: ["2% lower", "10% higher", "2% higher", "10% lower"],
          answer: 0,
          explain:
            "Representing the original as 100, a 30% decrease gives 70, and a 40% increase applied to the new 70 (not the original 100) gives 98 — a net 2% decrease. 10% higher comes from simply subtracting the percentages (40%-30%=10%) instead of compounding them. 2% higher flips the direction of the correct net change. 10% lower makes the same additive mistake in the opposite direction.",
          difficulty: "medium",
        },
        {
          q: "A company's revenue increases by 10% in year one, decreases by 10% in year two, and increases by 10% again in year three. Compared to the original revenue, what is the revenue after year three?",
          choices: ["8.9% higher", "10% higher", "9% higher", "The same (0% net change)"],
          answer: 0,
          explain:
            "Applying each year's multiplier in sequence to the original 100 gives 110 after year one, 99 after year two's 10% decrease (applied to 110, not 100), and 108.9 after year three's 10% increase (applied to 99) — an 8.9% net increase. 10% higher mistakenly assumes the middle decrease exactly cancels one of the increases. 9% higher is a close but incorrect rounding of the compounding effect. Assuming 0% net change misapplies the same additive-cancellation error as the two-step cases, compounded across three steps instead of two.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Assuming a percentage increase and an equal percentage decrease cancel out to no net change — they don't, because the second percentage is applied to a different (already changed) base value.",
        "Adding or subtracting percentages directly (20% + (-20%) = 0%) instead of applying them as sequential multipliers.",
      ],
    },
    {
      name: "Finding What Percent One Number Is of Another",
      explanation:
        "Not every percentage question involves a change or discount — some just ask what percent one quantity is of another, with no 'before and after' at all. The formula: percent = (part / whole) × 100. The main skill is correctly telling which quantity is the 'part' and which is the 'whole' — the whole is whatever's being compared TO, usually right after the word 'of.'",
      examples: [
        {
          q: "What percent of 300 is 75?",
          choices: ["25%", "4%", "225%", "75%"],
          answer: 0,
          explain:
            "Identifying the part (75) and the whole (300, since it follows 'of'), the ratio is 75/300=0.25, or 25%. 4% comes from dividing the whole by the part instead (300/75), inverting the ratio. 225% comes from an unrelated arithmetic slip, like subtracting instead of dividing. 75% mistakenly restates the part itself as if it were already the percent.",
          difficulty: "easy",
        },
        {
          q: "What is 40% of 150?",
          choices: ["60", "40", "110", "375"],
          answer: 0,
          explain:
            "Converting 40% to a decimal (0.40) and multiplying by the whole, 0.40 × 150 = 60. 40 mistakenly restates the percent itself as if it were the answer. 110 comes from subtracting the percent as if it were a flat quantity (150-40) instead of multiplying. 375 comes from dividing instead of multiplying (150/0.40).",
          difficulty: "easy",
        },
        {
          q: "A class has 20 students, and 8 of them ride the bus to school. What percent of the class rides the bus?",
          choices: ["40%", "8%", "20%", "60%"],
          answer: 0,
          explain:
            "Identifying the part (8, the bus riders) and the whole (20, the total class), the ratio is 8/20=0.4, or 40%. 8% mistakes the raw count of bus riders for a percent. 20% mistakes the total class size for the percent. 60% reports the percent of students who do NOT ride the bus instead of who does.",
          difficulty: "medium",
        },
        {
          q: "45 is what percent of 36?",
          choices: ["125%", "80%", "9%", "100%"],
          answer: 0,
          explain:
            "Identifying the part (45) and the whole (36, following 'of') — the part is larger than the whole here — the ratio is 45/36=1.25, or 125%; a result over 100% is valid and expected whenever the part exceeds the whole. 80% comes from inverting the ratio (36/45) instead of dividing the part by the whole. 9% comes from an unrelated arithmetic slip. 100% incorrectly assumes the two quantities must be treated as equal since they're being compared.",
          difficulty: "medium",
        },
        {
          q: "In a survey, 63 out of 180 respondents preferred option A, and the rest preferred option B. What percent of respondents preferred option B?",
          choices: ["65%", "35%", "63%", "31.5%"],
          answer: 0,
          explain:
            "Since the question doesn't give the part for option B directly, it must be found first: 180-63=117 respondents preferred option B, and the ratio 117/180=0.65, or 65%. 35% mistakenly reports the percent who preferred option A instead of B. 63% mistakes the raw count of option A responses for a percent. 31.5% comes from an unrelated miscalculation, like halving the wrong quantity.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Reversing the part and the whole — dividing the whole by the part instead of the part by the whole.",
        "Treating a result over 100% as a sign of a mistake, when it's a completely valid outcome whenever the 'part' is actually larger than the 'whole.'",
        "Using the wrong quantity as the 'part' when the question requires an extra subtraction step to find it first (like a 'remaining' or 'the rest' amount).",
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
        },
        {
          q: "Home sale prices (in thousands of dollars): 240, 210, 890, 230, 225. What is the median sale price?",
          choices: ["230", "359", "890", "225"],
          answer: 0,
          explain:
            "Sorting the data first (210, 225, 230, 240, 890) reveals 890 as a clear outlier far above the rest; the mean would be pulled substantially higher by that one sale, while the median — the middle value once sorted, 230 — stays representative of the typical price. 359 is the actual mean of this data set, exactly the distorted value the outlier produces. 890 mistakes the outlier itself for a typical value. 225 comes from picking a value near the middle without correctly sorting the list first.",
          difficulty: "medium",
        },
        {
          q: "A data set: 12, 15, 15, 18, 20, 95. What is the median of this data set?",
          choices: ["16.5", "40.83", "95", "18"],
          answer: 0,
          explain:
            "95 is far from the rest of the data (12-20), a clear outlier that pulls the mean substantially higher; the median, based on the middle values (15 and 18, averaging to 16.5), remains representative of the typical cluster. 40.83 is the actual mean of this data set, distorted upward by the outlier. 95 mistakes the outlier itself for a representative value. 18 picks one of the two middle values without correctly averaging them.",
          difficulty: "easy",
        },
        {
          q: "A data set of quiz scores: 2, 78, 81, 85, 88, 90. What is the median score?",
          choices: ["83", "70.67", "2", "84.4"],
          answer: 0,
          explain:
            "2 is far below the rest of the data (78-90), a low outlier that pulls the MEAN down substantially (left skew); the median, based on the middle values (81 and 85, averaging to 83), stays representative of the typical cluster, unaffected by the one very low score. 70.67 is the actual mean of this data set, distorted downward by the outlier — the opposite direction from the earlier high-outlier examples, but the same underlying principle. 2 mistakes the outlier itself for a typical score. 84.4 comes from averaging the wrong pair of middle values.",
          difficulty: "medium",
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
            "Comparing the two values directly, the mean ($420,000) is noticeably higher than the median ($350,000); when the mean exceeds the median, a small number of unusually HIGH values are pulling the average up — right skew — meaning a few unusually expensive homes are inflating the mean while most homes are priced closer to the median. The left-skew option describes the opposite pattern (mean below median), which doesn't match what's given here. Reporting both a mean and median says nothing about symmetry — this large a gap between them is actually a sign of skew, not symmetry. And the median isn't 'incorrect' — in a skewed distribution, the median is the more representative statistic, not a flawed one.",
          difficulty: "hard",
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
        "Not every data question requires computing a statistic — many just ask you to read a value, count, or range directly off a graph or table, or compute a simple mean or range from a short list. It's mostly about careful reading: find exactly which bar, dot, or row the question means, read its value precisely, and watch for off-by-one errors when counting. For a plain range: subtract the smallest value from the largest. For a plain mean: add every value and divide by the count.",
      examples: [
        {
          q: "A bar graph shows the number of books read by each of 5 students: 3, 5, 2, 6, 4. What is the range of this data set?",
          choices: ["4", "6", "2", "5"],
          answer: 0,
          explain:
            "The range is the largest value minus the smallest: 6 - 2 = 4. 6 mistakenly reports just the largest value instead of the range. 2 mistakenly reports just the smallest value. 5 comes from an off-by-one counting error.",
          difficulty: "easy",
        },
        {
          q: "A dot plot shows the number of pets owned by each student in a class: 2 students with 0 pets, 5 students with 1 pet, 4 students with 2 pets, and 1 student with 3 pets. How many students are in the class?",
          choices: ["12", "4", "11", "3"],
          answer: 0,
          explain:
            "This asks for a total count, found by adding up the number of students represented at each value: 2 + 5 + 4 + 1 = 12. 4 mistakes the number of distinct pet-count categories (0, 1, 2, 3) for the total number of students. 11 comes from an arithmetic slip while adding. 3 mistakes the highest pet count (3 pets) for the total number of students.",
          difficulty: "easy",
        },
        {
          q: "A store recorded daily sales (in dollars) for 6 days: 210, 340, 275, 300, 265, 290. What is the mean daily sales?",
          choices: ["$280", "$300", "$1,680", "$210"],
          answer: 0,
          explain:
            "Adding all six values gives 210+340+275+300+265+290=1,680, and dividing by the count of values, 6, gives 1,680/6=280. $300 comes from an arithmetic slip in the division. $1,680 mistakenly reports the sum itself without dividing by the count. $210 mistakes the smallest individual value for the mean.",
          difficulty: "medium",
        },
        {
          q: "A frequency table shows quiz scores for a class: 2 students scored 70, 6 students scored 80, 9 students scored 90, and 3 students scored 100. What was the highest individual score earned by any student?",
          choices: ["100", "3", "90", "9"],
          answer: 0,
          explain:
            "This asks for the maximum individual score value, not a frequency or count — scanning the table for the largest score with a nonzero frequency gives 100, since 3 students scored it. 3 mistakenly reports the frequency at that score instead of the score value itself. 90 and 9 both confuse the score with a value or frequency from a different row of the table.",
          difficulty: "medium",
        },
        {
          q: "A histogram groups delivery times (in minutes) into bins: 10 deliveries took 0-10 minutes, 25 took 10-20 minutes, 40 took 20-30 minutes, 15 took 30-40 minutes, and 10 took 40-50 minutes. What percent of deliveries took 20 minutes or more?",
          choices: ["65%", "40%", "75%", "35%"],
          answer: 0,
          explain:
            "Identifying the bins that satisfy '20 minutes or more' (the 20-30, 30-40, and 40-50 bins) and summing their frequencies gives 40+15+10=65, and dividing by the total across all bins (10+25+40+15+10=100) gives 65/100=65%. 40% mistakenly reports only the largest single bin (20-30) instead of summing every qualifying bin. 75% comes from including one extra bin that doesn't satisfy the condition, like the 10-20 bin. 35% reports the percent of deliveries that took LESS than 20 minutes instead of 20 minutes or more.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Misreading a bar's height or a dot's position against the axis, especially when gridlines aren't spaced at intervals of 1.",
        "Confusing a value's frequency (how many data points have that value) with the value itself.",
        "For a histogram question about a range of values ('20 or more'), forgetting to include every bin that satisfies the condition, not just the first one.",
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
        },
        {
          q: "A data set has a range of 12. If every value in the data set is increased by 3, what is the new range?",
          choices: ["12", "15", "9", "36"],
          answer: 0,
          explain:
            "Adding the same constant to every value shifts the whole data set uniformly — the maximum and minimum both increase by 3, so their difference (the range) stays exactly the same at 12. 15 mistakenly adds the constant to the range itself, as if the spread grew along with the values. 9 mistakenly subtracts the constant from the range instead. 36 comes from multiplying the range by the constant, an unrelated operation.",
          difficulty: "easy",
        },
        {
          q: "Five test scores have a mean of 80. A sixth score of 92 is added. What is the new mean?",
          choices: ["82", "86", "80", "92"],
          answer: 0,
          explain:
            "Reconstructing the original total from the mean and count, 5 scores × 80 = 400; adding the new score gives 400+92=492, and dividing by the new count of 6 gives 492/6=82. 86 comes from averaging the old mean and the new score directly ((80+92)/2) instead of correctly reconstructing the total. 80 mistakenly assumes adding one new score doesn't change the mean at all. 92 mistakes the new score itself for the new mean.",
          difficulty: "medium",
        },
        {
          q: "A data set of 7 values has a median of 50. If a new value of 200 is added to the data set, what happens to the median?",
          choices: [
            "The median shifts only slightly, since one extreme value mainly affects which value sits in the middle, not the overall balance",
            "The median jumps dramatically higher, since 200 is far above the rest of the data",
            "The median stays at exactly 50, since adding any single value never changes the median",
            "The median becomes 200, since that's now the largest value",
          ],
          answer: 0,
          explain:
            "With 7 values, the median is the 4th (middle) value; adding one very high value (200) makes 8 values, so the new median is the average of the 4th and 5th values in the new ordering — since 200 just becomes the new maximum, it doesn't affect which values sit in the middle, so the median shifts only slightly, unlike the mean, which the extreme value would pull noticeably higher. Assuming a dramatic jump confuses how the median behaves with how the mean would behave here. Assuming the median never changes when a value is added overstates the median's resistance to change — it's resistant to outliers, not literally frozen. And the median is a measure of the middle of the data, so it can never simply equal the new maximum value.",
          difficulty: "hard",
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
      desmosTrick:
        "Step 1: Click the '+' menu and add a table, then enter the given data points as x1, y1 columns — one point per row. Step 2: On the next line, type a regression template matching the shape you're testing: y1 ~ mx1+b for a straight-line trend, y1 ~ ax1^2+bx1+c for a curve that bends once, or y1 ~ a*b^x1 for growth or decay that speeds up or slows down over time. Step 3: Desmos fits that shape through your points and reports the actual values of m, b, a, and c — so instead of guessing which shape 'looks right' by eye, you can check exactly how well each one fits.",
      explanation:
        "This pattern asks you to match a scatterplot's shape to the correct model type. A straight-line pattern with a constant rate of change is linear. A pattern that gets increasingly steep is exponential. A pattern with a single peak or trough is quadratic. The key is looking at HOW the rate of change behaves — constant, accelerating, or reversing — not just the general 'up and to the right' shape.",
      examples: [
        {
          q: "A scatterplot shows points rising steadily at a constant rate, forming a straight-line pattern. Which model best fits?",
          choices: ["Linear", "Exponential", "Quadratic", "Cannot be determined"],
          answer: 0,
          explain:
            "A constant rate of increase forming a straight-line pattern is the defining characteristic of a linear relationship — linear models have a constant rate of change, unlike exponential (accelerating rate) or quadratic (a rate that changes direction at a vertex) models. Exponential is ruled out because its rate of change isn't constant, it grows. Quadratic is ruled out because it changes direction at a peak or trough, which isn't described here. And the description gives enough information — a clear constant-rate straight-line pattern — to determine the model.",
          diagram: { kind: "scatterGraph", trend: "linearPos" },
          difficulty: "easy",
        },
        {
          q: "A scatterplot shows points rising slowly at first, then increasingly steeply as x increases, with each step producing a noticeably bigger jump than the last. Which model best fits?",
          choices: ["Exponential", "Linear", "Quadratic", "None of these models could produce this pattern"],
          answer: 0,
          explain:
            "The rate of increase itself keeps growing — each step's jump is bigger than the last — which rules out linear (constant rate) immediately. It's tempting to think 'curving upward' means quadratic, but a quadratic model eventually turns and changes direction at its vertex, while this pattern just keeps accelerating in the same direction without turning around, matching exponential growth specifically. Linear is ruled out by the changing rate. Quadratic is ruled out because nothing here describes a reversal in direction. And this is a textbook match for exponential growth, so it's certainly produced by one of the standard models.",
          diagram: { kind: "scatterGraph", trend: "exponential" },
          difficulty: "medium",
        },
        {
          q: "A scatterplot shows points that rise, reach a peak around the middle of the data, then fall back down, forming a symmetric arc shape. Which model best fits?",
          choices: ["Quadratic", "Linear", "Exponential", "Cannot be determined without more data"],
          answer: 0,
          explain:
            "The data doesn't just keep increasing or decreasing — it changes direction once, at a single peak, which is the defining feature of a quadratic model. Linear is ruled out because a constant rate never changes direction. Exponential is ruled out because it keeps accelerating in one direction and never turns around. And the description — a full rise, peak, and fall — is a clear, specific signature that's enough to identify the model shape.",
          diagram: { kind: "scatterGraph", trend: "quadratic" },
          difficulty: "easy",
        },
        {
          q: "A scatterplot shows points that appear to rise at a roughly constant rate, but closer inspection shows the amount of increase between consecutive points is slightly smaller near the right side of the graph than near the left. Which model best fits?",
          choices: ["Quadratic", "Linear", "Exponential", "Cubic"],
          answer: 0,
          explain:
            "The rate of increase itself is changing — specifically getting smaller — which rules out a purely linear model (constant rate) and also rules out exponential growth, which would have an ACCELERATING rate, the opposite direction. A rate of increase that's shrinking while still positive matches the rising portion of a quadratic model, before it reaches its peak and turns downward. Linear is ruled out by the changing rate. Exponential moves the wrong direction entirely. Cubic isn't one of the model shapes this method distinguishes between, and the described behavior specifically matches quadratic's pre-vertex behavior.",
          diagram: { kind: "scatterGraph", trend: "quadratic" },
          difficulty: "medium",
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
            "A good linear fit's residuals should scatter randomly above and below zero, with no systematic pattern; here the residuals follow a clear pattern — negative, then positive, then negative again — meaning the linear model consistently over- or under-predicts in a structured way, which is a strong signal that the true relationship is curved (like quadratic), not actually linear. Claiming the fit is perfect ignores that a truly perfect fit would have residuals of zero, not a systematic pattern. Concluding exponential overreaches — this negative-positive-negative shape specifically matches a relationship that turns around, which is quadratic behavior, not accelerating exponential behavior. And a systematic pattern like this is a sign of the wrong model, not necessarily flawed data.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Assuming any 'increasing' pattern must be linear, without checking whether the rate of increase itself is constant, accelerating, or otherwise.",
        "Confusing exponential growth (accelerating rate) with linear growth (constant rate) when a scatterplot's curve is subtle.",
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
        },
        {
          q: "A line of best fit predicts a car will sell for $18,000, but it actually sells for $16,500. What is the residual?",
          choices: ["-1,500", "1,500", "18,000", "34,500"],
          answer: 0,
          explain:
            "Applying the residual formula, actual minus predicted, gives 16,500 - 18,000 = -1,500. 1,500 comes from reversing the formula, flipping the sign. 18,000 mistakenly reports the predicted value itself. 34,500 comes from adding the two values instead of subtracting.",
          difficulty: "easy",
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
        },
        {
          q: "A line of best fit predicts a plant's height based on weeks since planting. For a particular plant, the residual was calculated as 4.5. If the model predicted a height of 22 cm for that plant, what was its actual height?",
          choices: ["26.5", "17.5", "22", "4.5"],
          answer: 0,
          explain:
            "Using the residual formula in reverse, residual = actual - predicted, gives 4.5 = actual - 22, so actual = 4.5 + 22 = 26.5. 17.5 comes from subtracting the residual from the predicted value instead of adding it, effectively flipping the formula's sign. 22 mistakenly reports just the predicted value, ignoring the residual entirely. 4.5 mistakenly reports the residual itself as if it were the actual height.",
          difficulty: "hard",
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
        "Simple probability questions use one formula: favorable outcomes divided by total outcomes. Compound probability questions — the ones with 'and' or 'or' — need you to recognize whether events are independent (multiply, for 'and') or need the addition rule (for 'or': add the individual probabilities, then subtract any overlap so you don't double-count).",
      examples: [
        {
          q: "Two independent events A and B have P(A) = 0.5 and P(B) = 0.4. What is P(A and B)?",
          choices: ["0.2", "0.9", "0.1", "0.45"],
          answer: 0,
          explain:
            "Since A and B are independent and the question asks for 'and,' the probabilities multiply: P(A and B) = 0.5 × 0.4 = 0.2. 0.9 comes from adding the two probabilities instead of multiplying, the rule for 'or,' not 'and.' 0.1 comes from an arithmetic slip in the multiplication. 0.45 comes from averaging the two probabilities instead of multiplying them.",
          difficulty: "easy",
        },
        {
          q: "A jar contains 5 red marbles and 3 blue marbles. One marble is drawn and replaced, then a second marble is drawn. What is the probability that the first marble is red OR the second marble is blue?",
          choices: ["49/64", "1", "5/8", "15/64"],
          answer: 0,
          explain:
            "Since these two events can both happen at once, the addition rule applies: P(A or B) = P(A) + P(B) - P(A and B). With P(first red)=5/8 and P(second blue)=3/8, and since the marble is replaced (making the draws independent), the overlap is 5/8 × 3/8 = 15/64, giving 5/8+3/8-15/64 = 49/64. 1 comes from simply adding 5/8 and 3/8 without subtracting any overlap, over-counting the outcome where both happen. 5/8 mistakenly reports just one of the two individual probabilities. 15/64 mistakenly reports just the overlap term itself instead of the final combined probability.",
          difficulty: "medium",
        },
        {
          q: "A spinner has 4 equal sections numbered 1-4. What is the probability of spinning an even number?",
          choices: ["1/2", "1/4", "3/4", "2"],
          answer: 0,
          explain:
            "The favorable outcomes are 2 and 4, out of 4 total sections, giving 2/4 = 1/2. 1/4 comes from counting only one of the two even numbers. 3/4 reports the probability of an odd number instead. 2 mistakenly reports the count of favorable outcomes without dividing by the total.",
          difficulty: "easy",
        },
        {
          q: "A fair coin is flipped 3 times. What is the probability of getting at least one heads?",
          choices: ["7/8", "1/8", "3/8", "1/2"],
          answer: 0,
          explain:
            "'At least one' is found using the complement rule: P(at least one) = 1 - P(none); P(all three tails) = (1/2)^3 = 1/8, so P(at least one heads) = 1 - 1/8 = 7/8. 1/8 mistakenly reports the complement itself instead of subtracting it from 1. 3/8 comes from an unrelated miscalculation across the three flips. 1/2 mistakenly applies the single-flip probability to the three-flip scenario.",
          difficulty: "medium",
        },
        {
          q: "A jar contains 5 red and 3 blue marbles. Two marbles are drawn WITHOUT replacement. What is the probability that both are red?",
          choices: ["5/14", "25/64", "5/8", "4/7"],
          answer: 0,
          explain:
            "Since the draws are without replacement, the two events are dependent: P(first red) = 5/8, and given the first was red, only 4 red marbles remain out of 7 total, so P(second red | first red) = 4/7; multiplying gives 5/8 × 4/7 = 20/56 = 5/14. 25/64 comes from incorrectly treating the draws as independent and using 5/8 twice, as if the marble were replaced. 5/8 mistakenly reports just the first draw's probability. 4/7 mistakenly reports just the second draw's conditional probability.",
          difficulty: "hard",
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
        "Conditional probability questions shrink the total sample space down to a specific subgroup — signaled by phrases like 'given that' or 'if we know.' The key move: identify that restricted group first, then calculate probability using ONLY that subgroup as your new total — not the entire original data set.",
      examples: [
        {
          q: "A deck has 52 cards. What is the probability of drawing a card that is a heart, given that the card drawn is red?",
          choices: ["1/2", "1/4", "13/52", "1"],
          answer: 0,
          explain:
            "Restricting to the 26 red cards (hearts and diamonds), as specified by 'given that the card is red,' 13 of those are hearts, giving 13/26 = 1/2. 1/4 comes from using the full deck of 52 as the denominator instead of the restricted 26. 13/52 makes the same mistake in unreduced form. 1 would only be correct if every red card were a heart, which isn't the case.",
          difficulty: "easy",
        },
        {
          q: "A survey of 200 students found that 120 play a sport, and of those 120, 45 also play a musical instrument. What is the probability that a student plays an instrument, given that they play a sport?",
          choices: ["3/8", "45/200", "9/40", "45/80"],
          answer: 0,
          explain:
            "Restricting to the 120 sport-playing students, as specified by 'given that they play a sport,' 45 of those also play an instrument, giving 45/120 = 3/8. 45/200 mistakenly uses the full 200 surveyed students as the denominator instead of the restricted 120. 9/40 comes from an unreduced or miscalculated fraction using the wrong denominator. 45/80 uses an unrelated, incorrect subgroup size.",
          difficulty: "medium",
        },
        {
          q: "A box contains 10 pens: 6 blue and 4 black. What is the probability that a randomly selected pen is black, given that it is not blue?",
          choices: ["1", "4/10", "6/10", "0"],
          answer: 0,
          explain:
            "Since every pen is either blue or black, 'not blue' restricts the group to just the 4 black pens; within that group, all 4 are black, giving 4/4 = 1. 4/10 mistakenly uses the full 10 pens as the denominator instead of the restricted group. 6/10 reports the probability of blue from the full set, unrelated to what's asked. 0 would only be correct if none of the 'not blue' pens were black, which contradicts the setup.",
          difficulty: "easy",
        },
        {
          q: "A survey of 150 students found: 90 play a sport, 60 do not. Of the 90 who play a sport, 36 also work a part-time job. Of the 60 who don't play a sport, 24 work a part-time job. What is the probability that a student works a part-time job, given that they play a sport?",
          choices: ["2/5", "36/150", "24/60", "36/60"],
          answer: 0,
          explain:
            "Restricting to the 90 sport-playing students, as specified by 'given that they play a sport,' 36 of those also work a part-time job, giving 36/90 = 2/5. 36/150 mistakenly uses the full 150 students surveyed instead of the restricted 90. 24/60 pulls from the wrong subgroup (non-sport-players) entirely. 36/60 uses an unrelated, incorrect denominator.",
          difficulty: "medium",
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
            "Checking whether the claimed value (27) falls inside the interval (24, 30), it does, so the sample data is consistent with the claim, not contradicting it — though this doesn't PROVE the true mean is exactly 27, since other values in the range are equally plausible. Claiming contradiction because 27 isn't exactly centered misunderstands that any value within the interval, not just the midpoint, is considered plausible. Claiming the data proves the mean cannot be 27 gets the conclusion backwards, since 27 falls inside, not outside, the range. And claiming the data proves the mean IS exactly 27 overstates what a confidence interval can establish — it supports plausibility, not certainty of one exact value.",
          difficulty: "hard",
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
        "This pattern tests the relationship between sample size and precision: larger samples generally produce smaller margins of error — more precise estimates — as long as the confidence level stays the same. This is worth just memorizing directly, since it shows up often in slightly different phrasings.",
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
            "Increasing the confidence level runs the OPPOSITE direction from the sample-size relationship — to be more confident (99% vs. 90%) that the interval actually contains the true value, the range needs to be broader, so increasing from 90% to 99% should widen the interval. Claiming it will narrow confuses this with the sample-size relationship, which runs the opposite direction. Claiming no change ignores that confidence level directly affects interval width. And the sample size doesn't change here at all — only the confidence level does.",
          difficulty: "medium",
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
            "Larger sample size narrows the interval, but higher confidence level widens it — two changes pushing the interval's width in OPPOSITE directions — so since both changed at once, the net result depends on the size of each change and can't be determined from the sample-size effect alone; the colleague's reasoning is incomplete because it ignores the confidence level's opposing effect. Saying the colleague is 'fully correct' ignores that a second, competing change (confidence level) was also made. Claiming confidence level 'also narrows' the interval gets that specific relationship backwards — confidence level increases widen intervals, they don't narrow them. And it's not true that the changes must happen 'at the exact same rate' to have any effect; it's just that the net direction isn't determinable without knowing those sizes.",
          difficulty: "hard",
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
        "The most common version of this subskill doesn't involve confidence intervals or margin of error at all — it just asks you to scale up a proportion from a random sample to estimate a count in the full population. The method: find the sample's proportion (favorable outcomes divided by sample size), then apply that same proportion to the full population size. This only works reliably when the sample was actually random — always check that before trusting a scaled-up estimate.",
      examples: [
        {
          q: "A researcher randomly selects 20 employees from a company of 400 and finds that 16 of them are enrolled in a wellness program. Based on this sample, what is the best estimate of the number of employees at the company enrolled in the wellness program?",
          choices: ["320", "16", "80", "384"],
          answer: 0,
          explain:
            "Finding the sample proportion, 16/20=0.8, and applying it to the full population, 0.8 × 400 = 320. 16 mistakenly reports the raw sample count instead of scaling it up. 80 comes from applying the wrong proportion, like 20% instead of 80%, to the population. 384 comes from an unrelated miscalculation, like using the wrong population size in the multiplication.",
          difficulty: "easy",
        },
        {
          q: "A quality inspector randomly samples 50 bolts from a shipment of 3,000 and finds 3 are defective. Based on this sample, what is the best estimate of the total number of defective bolts in the shipment?",
          choices: ["180", "3", "60", "150"],
          answer: 0,
          explain:
            "Finding the sample proportion, 3/50=0.06, and applying it to the full shipment, 0.06 × 3,000 = 180. 3 mistakenly reports the raw sample count instead of scaling it up. 60 comes from applying a rate ten times too small. 150 comes from an unrelated arithmetic slip in the multiplication.",
          difficulty: "easy",
        },
        {
          q: "A random sample of 250 voters from a district of 60,000 found that 175 support a proposed measure. Based on this sample, what is the best estimate of the number of voters in the district who do NOT support the measure?",
          choices: ["18,000", "42,000", "175", "12,000"],
          answer: 0,
          explain:
            "Finding the sample proportion who support, 175/250=0.7, and since the question asks about those who do NOT support, the complement proportion is 1-0.7=0.3, applied to the full population: 0.3 × 60,000 = 18,000. 42,000 mistakenly scales up the 'support' proportion (0.7) instead of finding the complement first, answering the wrong question. 175 mistakenly reports the raw sample count instead of scaling it up at all. 12,000 comes from an unrelated arithmetic slip in the final multiplication.",
          difficulty: "medium",
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
            "This is a self-selected online poll — only people who chose to visit the site and respond are included, not a random sample of all adults — so even though 80% is accurate for the poll's respondents, it can't be reliably scaled up to represent all adults nationally, regardless of the sample's size. Claiming validity based on the large sample size (3,000) ignores that sample size doesn't fix a lack of random selection — a big biased sample is still biased. Claiming any online poll can be scaled up as long as the percentage is reported correctly ignores the random-sampling requirement entirely. And there's nothing inherently unrealistic about an 80% figure — the problem is the sampling method, not the size of the percentage itself.",
          difficulty: "medium",
        },
        {
          q: "A city's parks department randomly surveys 80 out of 5,000 registered users of a park app and finds that 12 reported visiting a park at least 3 times per week. If each 'frequent visitor' uses park facilities worth about $45 per month in maintenance costs, what is the best estimate of total monthly maintenance costs attributable to frequent visitors, based on this sample?",
          choices: ["$33,750", "$540", "$3,600", "$225,000"],
          answer: 0,
          explain:
            "Finding the sample proportion of frequent visitors, 12/80=0.15, scaling up to the full population, 0.15 × 5,000 = 750 estimated frequent visitors, and applying the given per-visitor cost, 750 × $45 = $33,750. $540 mistakenly applies the per-visitor cost to the sample's raw count (12) instead of the scaled-up population estimate. $3,600 comes from an incomplete calculation that stops partway through the two-step process. $225,000 comes from applying the per-visitor cost to the full population size (5,000) instead of just the estimated frequent-visitor subset.",
          difficulty: "hard",
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
        "This is the single most-tested concept in this subskill: an observational study — no random assignment — can only show correlation, never causation, because some hidden confounding variable could actually explain the relationship. Only a randomized controlled experiment, with random assignment to groups, can support a causal claim. Recognizing which type of study design is described is the entire key to these questions.",
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
            "This is observational — no one randomly assigned coffee shops to neighborhoods — so causation can't be concluded from the correlation alone; a neighborhood becoming more desirable or seeing more investment could independently attract both new coffee shops and rising rents, making that shared trend a far more plausible confounding variable than coffee shops directly driving up rent. Claiming coffee shops directly cause rent increases is exactly the unsupported leap the blogger made. Claiming rents cause coffee shops reverses that same unsupported leap. And dismissing the correlation as purely coincidental ignores that a real, identifiable confounding variable is a much more likely explanation than pure chance.",
          difficulty: "medium",
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
            "Checking the study design, there was random assignment (yes) and a control (placebo) group (yes), so with both randomization and a control group in place, this design CAN support a causal claim, unlike a purely observational study. Claiming correlation never implies causation 'under any circumstances' overgeneralizes — a properly designed randomized controlled experiment is specifically the tool that CAN support causal claims. Objecting to the sample size misidentifies what actually determines whether a study can support causation, which is the design, not simply how many participants were involved. And crediting the significant result alone, regardless of design, ignores that the same significant result from a poorly designed observational study would NOT support causation — the design is what earns the causal conclusion, not the result's size.",
          difficulty: "hard",
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
            "Checking the study design against the causal-claim checklist, there is no control group to compare against, so other explanations for the weight change — like diet changes, exercise changes, or simply time passing — cannot be ruled out; this missing comparison is the primary weakness, not the sample size or any other factor. Random sampling is a different concept from random assignment and isn't the specific issue described here. Blaming sample size misidentifies the actual flaw, which is the missing comparison group. And claiming weight loss can never be measured accurately is an unsupported, overly broad claim unrelated to this study's actual design flaw.",
          difficulty: "easy",
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
            "Checking the study design against the causal-claim checklist, there is no genuine control group tested under the same conditions — this compares the same field across two different years, not two groups under the same conditions — so other factors that changed between years, like weather, rainfall, or soil conditions, can't be ruled out as explanations for any yield difference; this missing same-time comparison is the primary weakness. Blaming the use of only one field misidentifies the flaw, which is the lack of a same-time comparison, not simply the amount of data. Claiming yield comparisons can never measure fertilizer effects is an overly broad claim unrelated to this study's specific flaw. And while random assignment would help, the immediately identifiable weakness here is the missing same-time control, the more specific and direct issue described.",
          difficulty: "easy",
        },
        {
          q: "Researchers randomly assign participants to either receive a new pain medication or a sugar pill (placebo), but everyone — participants and researchers alike — knows who received which. Pain levels are then assessed through interviews. What is a specific weakness of this design?",
          choices: [
            "The lack of blinding means self-reported outcomes could be biased by knowing who received which treatment",
            "The weakness is that there was no random assignment of participants",
            "The weakness is that there was no placebo group used for comparison",
            "The weakness is that pain cannot be measured through interviews under any circumstances",
          ],
          answer: 0,
          explain:
            "Checking the checklist, random assignment (yes) and a control/placebo group (yes) are both present, so the study isn't missing those basics; but because everyone knows who received the real medication, participants' self-reported pain levels — and researchers' assessments of them — could be influenced by expectation rather than the medication itself, a lack of 'blinding.' Claiming there was no random assignment contradicts what's explicitly stated in the setup. Claiming there was no placebo group also contradicts the setup, which explicitly includes one. And claiming pain can never be measured through interviews is an overly broad claim unrelated to this study's specific, identifiable flaw.",
          difficulty: "medium",
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
        "This pattern tests whether you know that a linear scale factor doesn't apply directly to area or volume. If every linear dimension of a shape scales by a factor of k, area scales by k² — not k — and volume scales by k³ — not k. This is a very common trap: correctly finding the scale factor, then applying it directly to area or volume instead of squaring or cubing it first.",
      examples: [
        {
          q: "If a square's side length doubles, by what factor does its area increase?",
          choices: ["4", "2", "8", "16"],
          answer: 0,
          explain:
            "The linear scale factor is k=2 (side length doubles); area scales by k², not k, so the area increases by 2²=4. 2 mistakenly applies the linear scale factor directly to area instead of squaring it. 8 comes from confusing the volume rule (k³) with the area rule. 16 comes from squaring the wrong quantity, like squaring the area's own factor instead of the linear factor.",
          diagram: { kind: "scaleCompare", shape: "square", factorLabel: "2" },
          difficulty: "easy",
        },
        {
          q: "A cube's side length is tripled. By what factor does its volume increase?",
          choices: ["27", "3", "9", "6"],
          answer: 0,
          explain:
            "The linear scale factor is k=3 (side length triples); volume scales by k³, not k or k², so the volume increases by 3³=27. 3 mistakenly applies the linear scale factor directly to volume. 9 comes from confusing the area rule (k²) with the volume rule. 6 comes from multiplying the scale factor by the number of dimensions instead of raising it to a power.",
          diagram: { kind: "scaleCompare", shape: "cube", factorLabel: "3" },
          difficulty: "medium",
        },
        {
          q: "If a circle's radius triples, by what factor does its area increase?",
          choices: ["9", "3", "27", "6"],
          answer: 0,
          explain:
            "The linear scale factor is k=3 (radius triples); area scales by k², not k, so the area increases by 3²=9. 3 mistakenly applies the linear scale factor directly to area. 27 comes from confusing the volume rule (k³) with the area rule. 6 comes from multiplying instead of squaring the scale factor.",
          diagram: { kind: "scaleCompare", shape: "circle", factorLabel: "3" },
          difficulty: "easy",
        },
        {
          q: "A square's area increases by a factor of 16 after being enlarged. By what factor did its side length increase?",
          choices: ["4", "16", "8", "256"],
          answer: 0,
          explain:
            "Since area scales by k², an area scale factor of 16 means k²=16, so k=4 (the positive root, since a scale factor can't be negative) — the side length increased by a factor of 4, not 16. 16 mistakenly reports the area scale factor itself as if it were the linear scale factor. 8 comes from halving 16 instead of taking its square root. 256 comes from squaring 16 instead of taking its square root, moving in the wrong direction entirely.",
          diagram: { kind: "scaleCompare", shape: "square", factorLabel: "?" },
          difficulty: "medium",
        },
        {
          q: "A cube's side length doubles. By what factor does the ratio of its surface area to its volume change?",
          choices: ["1/2", "2", "4", "8"],
          answer: 0,
          explain:
            "Surface area scales by k² and volume scales by k³, with k=2 here: surface area scales by 2²=4, volume scales by 2³=8, so the RATIO of surface area to volume scales by 4/8=1/2 — the ratio is cut in half, since volume grows faster than surface area as an object scales up. 2 mistakenly applies the linear scale factor directly to the ratio. 4 mistakenly reports just the surface area's scale factor as if it were the ratio's. 8 mistakenly reports just the volume's scale factor as if it were the ratio's.",
          diagram: { kind: "scaleCompare", shape: "cube", factorLabel: "2" },
          difficulty: "hard",
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
        "This pattern involves picking and correctly applying the right area or volume formula for a shape — often in a word problem that disguises what the shape actually is (a 'can' is a cylinder, a 'ball' is a sphere). The reliable approach: figure out exactly which formula applies before calculating anything, and write it out explicitly instead of trying to recall it from memory mid-problem.",
      examples: [
        {
          q: "A cylindrical water tank has a radius of 3 and a height of 10. What is its volume in terms of π?",
          choices: ["90π", "30π", "60π", "270π"],
          answer: 0,
          explain:
            "A cylinder's volume is πr²h; substituting r=3, h=10 gives π(3²)(10)=π(9)(10)=90π. 30π comes from forgetting to square the radius, using πrh instead. 60π comes from an arithmetic slip in the multiplication. 270π comes from mistakenly cubing the radius instead of squaring it.",
          diagram: { kind: "solid", shape: "cylinder", labels: { r: "3", h: "10" } },
          difficulty: "easy",
        },
        {
          q: "A cone-shaped paper cup has a radius of 3 cm and a height of 8 cm. What is its volume in terms of π?",
          choices: ["24π", "72π", "8π", "216π"],
          answer: 0,
          explain:
            "A cone's volume is (1/3)πr²h, which needs the extra factor of 1/3 that a cylinder's formula doesn't have; substituting r=3, h=8 gives (1/3)π(9)(8)=(1/3)(72π)=24π. 72π mistakenly uses the cylinder formula (without the 1/3 factor) for what is actually a cone. 8π comes from an arithmetic slip in the multiplication. 216π comes from mistakenly cubing the radius instead of squaring it.",
          diagram: { kind: "solid", shape: "cone", labels: { r: "3", h: "8" } },
          difficulty: "medium",
        },
        {
          q: "A sphere-shaped water tank has a radius of 6 feet. What is its volume in terms of π?",
          choices: ["288π", "144π", "216π", "48π"],
          answer: 0,
          explain:
            "A sphere's volume is (4/3)πr³; substituting r=6 gives (4/3)π(216)=288π. 144π comes from forgetting the 4/3 factor and only using half of it correctly. 216π mistakenly reports r³ itself without multiplying by 4/3. 48π comes from an arithmetic slip in the multiplication.",
          diagram: { kind: "solid", shape: "sphere", labels: { r: "6" } },
          difficulty: "easy",
        },
        {
          q: "A silo is shaped like a cylinder with a hemisphere on top. The cylinder has a radius of 4 feet and a height of 10 feet, and the hemisphere has the same radius. What is the silo's total volume in terms of π?",
          choices: ["(608/3)π", "160π", "(128/3)π", "288π"],
          answer: 0,
          explain:
            "This composite figure requires two separate formulas added together: cylinder volume π(4²)(10)=160π, plus hemisphere volume (half a sphere) (1/2)(4/3)π(64)=(128/3)π, giving a total of 160π+(128/3)π=(480/3)π+(128/3)π=(608/3)π. 160π mistakenly reports just the cylinder's volume, forgetting to add the hemisphere. (128/3)π mistakenly reports just the hemisphere's volume, forgetting to add the cylinder. 288π comes from an unrelated miscalculation, like using the full sphere volume instead of the hemisphere.",
          diagram: { kind: "solid", shape: "cylinderHemisphere", labels: { r: "4", h: "10" } },
          difficulty: "medium",
        },
        {
          q: "A cylindrical pipe has an outer radius of 5 cm and an inner radius of 3 cm (it's hollow), and a length of 20 cm. What is the volume of the material making up the pipe, in terms of π?",
          choices: ["320π", "500π", "180π", "680π"],
          answer: 0,
          explain:
            "This composite figure requires subtracting one shape from another: the outer cylinder's volume, π(5²)(20)=500π, minus the inner hollow cylinder's volume, π(3²)(20)=180π, gives 500π-180π=320π. 500π mistakenly reports just the outer cylinder's volume, forgetting to subtract the hollow interior. 180π mistakenly reports just the inner cylinder's volume instead of the material's volume. 680π comes from adding the two volumes instead of subtracting them.",
          diagram: { kind: "solid", shape: "hollowCylinder", labels: { outerR: "5", innerR: "3", len: "20" } },
          difficulty: "hard",
        },
      ],
      traps: [
        "Confusing similar formulas (e.g., using the cone volume formula, which includes a factor of 1/3, for what is actually a cylinder).",
        "Substituting the diameter where the radius is needed (or vice versa), especially when a problem gives diameter directly.",
      ],
    },
    {
      name: "Building a Volume Expression Algebraically from a Word Description",
      explanation:
        "This pattern gives no numeric dimensions at all — it describes a solid's dimensions in words, often with one dimension defined in terms of another using a variable, and asks for a volume FORMULA, not a number. The method: find the correct volume formula for the shape first, then carefully translate each worded dimension into algebra before substituting. Pay close attention to phrases like '3 more than,' 'twice,' or 'half of' — they describe one dimension in terms of another.",
      examples: [
        {
          q: "A rectangular box has a length of x, a width of 3, and a height of 5. Which expression gives the volume V of the box, in terms of x?",
          choices: ["V = 15x", "V = 8x", "V = 15 + x", "V = x/15"],
          answer: 0,
          explain:
            "Rectangular box volume is length × width × height; substituting the given dimensions gives V = x × 3 × 5 = 15x. V = 8x comes from adding the width and height (3+5=8) instead of multiplying them into the coefficient. V = 15 + x incorrectly treats the volume formula as additive instead of multiplicative. V = x/15 comes from dividing instead of multiplying.",
          diagram: { kind: "solid", shape: "box", labels: { l: "x", w: "3", h: "5" } },
          difficulty: "easy",
        },
        {
          q: "A cylinder has a radius of r and a height of 4. Which expression gives the volume V of the cylinder, in terms of r?",
          choices: ["V = 4πr²", "V = πr²/4", "V = 4πr", "V = πr⁴"],
          answer: 0,
          explain:
            "Cylinder volume is πr²h; substituting r and h=4 gives V = πr²(4) = 4πr². V = πr²/4 divides by the height instead of multiplying by it. V = 4πr forgets to square the radius. V = πr⁴ mistakenly multiplies the exponents on r instead of multiplying the height in as a separate coefficient.",
          diagram: { kind: "solid", shape: "cylinder", labels: { r: "r", h: "4" } },
          difficulty: "easy",
        },
        {
          q: "A rectangular prism has a height of 8 inches. The length of its base is x inches, which is 3 inches more than the width of the base. Which function V gives the volume, in cubic inches, in terms of x?",
          choices: ["V(x) = 8x(x-3)", "V(x) = 8x(x+3)", "V(x) = 8(x-3)", "V(x) = x(x-3)"],
          answer: 0,
          explain:
            "Rectangular prism volume is length × width × height; translating 'length is 3 more than width' into width = x-3 and substituting all three dimensions gives V = x(x-3)(8) = 8x(x-3). V(x) = 8x(x+3) mistranslates the comparative phrase, adding 3 instead of subtracting it. V(x) = 8(x-3) forgets to include the length (x) as a separate factor. V(x) = x(x-3) forgets to include the given height of 8 entirely.",
          diagram: { kind: "solid", shape: "box", labels: { l: "x", w: "x-3", h: "8" } },
          difficulty: "medium",
        },
        {
          q: "A cylindrical can has a height that is twice its radius r. Which expression gives the volume V of the can, in terms of r?",
          choices: ["V = 2πr³", "V = πr³", "V = 2πr²", "V = πr²+2r"],
          answer: 0,
          explain:
            "Cylinder volume is πr²h; translating 'height that is twice its radius' into height = 2r (a multiplicative relationship, not additive) and substituting gives V = πr²(2r) = 2πr³. V = πr³ forgets to include the factor of 2 from the height. V = 2πr² forgets to multiply in the extra factor of r from the height being expressed in terms of r. V = πr²+2r incorrectly treats the height as something added to the formula instead of multiplied into it.",
          diagram: { kind: "solid", shape: "cylinder", labels: { r: "r", h: "2r" } },
          difficulty: "medium",
        },
        {
          q: "A rectangular box has a length of x. Its width is half its length, and its height is 4 inches less than its width. Which expression gives the volume V of the box, in terms of x?",
          choices: ["V = x³/4 - 2x²", "V = x³/2 - 4x", "V = x²/2 - 4x", "V = x³/4 + 2x²"],
          answer: 0,
          explain:
            "Rectangular box volume is length × width × height; translating 'width = half the length' as x/2 and 'height = 4 less than the width' as (x/2)-4, then substituting and expanding: x × (x/2) × ((x/2)-4) = (x²/2) × ((x/2)-4) = x³/4 - 2x². V = x³/2 - 4x comes from an incomplete expansion that mishandles the distribution. V = x²/2 - 4x forgets to include one of the three dimensions in the multiplication. V = x³/4 + 2x² gets the sign wrong on the second term, from a distribution error.",
          diagram: { kind: "solid", shape: "box", labels: { l: "x", w: "x/2", h: "x/2 - 4" } },
          difficulty: "hard",
        },
      ],
      traps: [
        "Substituting a worded dimension into the wrong part of the formula (e.g., swapping which expression represents length vs. width).",
        "Mistranslating a comparative phrase like '5 more than the width' as '5 times the width,' or vice versa.",
        "Forgetting to expand or simplify the resulting algebraic expression into its most standard form once it's fully substituted.",
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
        "Every triangle's interior angles add up to exactly 180°, so you can always find a missing angle if you know the other two. A related, often-overlooked rule: a triangle's exterior angle equals the sum of the two non-adjacent interior angles. This can shortcut problems that would otherwise take two separate steps.",
      examples: [
        {
          q: "A triangle's exterior angle measures 110°, and it is not adjacent to one of the triangle's interior angles of 40°. What is the measure of the third interior angle?",
          choices: ["70°", "110°", "40°", "150°"],
          answer: 0,
          explain:
            "The exterior angle rule states an exterior angle equals the sum of the two non-adjacent interior angles: 110 = 40 + x, so x = 70°. 110° mistakenly restates the exterior angle itself. 40° mistakenly restates the given interior angle instead of solving for the unknown one. 150° comes from adding the two given angles (110+40) instead of subtracting.",
          diagram: { kind: "triangleAngles", angleA: "?", angleB: "40°", exterior: { at: "C", label: "110°" } },
          difficulty: "easy",
        },
        {
          q: "A triangle has interior angles measuring 55° and 65°. What is the measure of the exterior angle at the triangle's third vertex?",
          choices: ["120°", "60°", "115°", "180°"],
          answer: 0,
          explain:
            "The exterior angle rule states an exterior angle equals the sum of the two interior angles NOT adjacent to it, and the two given angles (55° and 65°) are exactly that pair, so 55+65=120°. 60° mistakenly reports the triangle's third interior angle (180-55-65=60°) instead of the exterior angle. 115° comes from an arithmetic slip in the addition. 180° comes from confusing this with the straight-line supplementary relationship instead of the sum-of-non-adjacent-angles rule.",
          diagram: { kind: "triangleAngles", angleA: "55°", angleB: "65°", exterior: { at: "C", label: "?" } },
          difficulty: "medium",
        },
        {
          q: "A triangle has interior angles measuring 50° and 70°. What is the measure of the third interior angle?",
          choices: ["60°", "120°", "20°", "180°"],
          answer: 0,
          explain:
            "A triangle's interior angles sum to 180°, so subtracting the two known angles gives 180-50-70=60°. 120° comes from adding the two given angles instead of subtracting them from 180. 20° comes from an arithmetic slip in the subtraction. 180° mistakenly restates the total angle sum itself instead of the missing angle.",
          diagram: { kind: "triangleAngles", angleA: "50°", angleB: "70°", angleC: "?" },
          difficulty: "easy",
        },
        {
          q: "A triangle's exterior angle measures 115°. What is the measure of the interior angle adjacent to this exterior angle?",
          choices: ["65°", "115°", "55°", "180°"],
          answer: 0,
          explain:
            "Since this asks for the ADJACENT interior angle, not a non-adjacent one, the relevant rule is that an exterior angle and its adjacent interior angle form a straight line and are supplementary: 180-115=65°. 115° mistakenly restates the exterior angle itself. 55° comes from an arithmetic slip in the subtraction. 180° mistakenly restates the straight-line total instead of the missing angle.",
          diagram: { kind: "triangleAngles", angleC: "?", exterior: { at: "C", label: "115°" } },
          difficulty: "medium",
        },
        {
          q: "In triangle ABC, angle A = 55° and angle B = 60°. Side BC is extended beyond C to point D, forming triangle ACD, where angle ADC = 35°. What is the measure of angle DAC?",
          choices: ["30°", "65°", "115°", "45°"],
          answer: 0,
          explain:
            "Finding the third angle of triangle ABC first, angle ACB=180-55-60=65°; since angle ACD and angle ACB form a straight line, angle ACD=180-65=115°; treating angle ACD as an interior angle of triangle ACD and applying the 180° rule again, 115+35+angle DAC=180, so angle DAC=30°. 65° mistakenly reports angle ACB instead of continuing the chain to find angle DAC. 115° mistakenly reports angle ACD, an intermediate value, instead of the final answer. 45° comes from an arithmetic slip in the final subtraction.",
          diagram: { kind: "triangleAngles", chained: { angleB: "60°", angleBAC: "55°", angleD: "35°", angleDAC: "?" } },
          difficulty: "hard",
        },
      ],
      traps: [
        "Not recognizing the exterior angle shortcut, and instead trying to first find the triangle's adjacent interior angle (180° - exterior angle) before proceeding — this works but takes an unnecessary extra step.",
        "Confusing which two angles are 'non-adjacent' to a given exterior angle.",
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
        },
        {
          q: "Two parallel lines are cut by a transversal. If one angle measures 72°, what is the measure of its alternate exterior angle?",
          choices: ["72°", "108°", "18°", "144°"],
          answer: 0,
          explain:
            "Alternate exterior angles are equal, not supplementary — the opposite relationship from the co-interior pair — so the alternate exterior angle also measures 72°. 108° mistakenly applies the supplementary rule that belongs to co-interior angles instead of the equal rule for alternate exterior angles. 18° comes from an unrelated miscalculation. 144° comes from doubling the given angle instead of simply restating it.",
          diagram: { kind: "parallelTransversal", givenLabel: "72°", givenPosition: 1, askedLabel: "?", askedPosition: 8 },
          difficulty: "medium",
        },
        {
          q: "Two parallel lines are cut by a transversal. If one angle measures 110°, what is the measure of its corresponding angle?",
          choices: ["110°", "70°", "55°", "220°"],
          answer: 0,
          explain:
            "Corresponding angles, which sit in the same relative position at each intersection, are always equal, so the corresponding angle also measures 110°. 70° mistakenly applies the supplementary rule that belongs to co-interior angles instead of the equal rule for corresponding angles. 55° comes from halving the given angle instead of restating it. 220° comes from doubling the given angle instead of restating it.",
          diagram: { kind: "parallelTransversal", givenLabel: "110°", givenPosition: 2, askedLabel: "?", askedPosition: 6 },
          difficulty: "easy",
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
        },
        {
          q: "Lines p and q are parallel. A zigzag path starts on line p, bends at a point B between the lines, and ends on line q. The angle between line p and the first segment (on the interior side) is 35°, and the angle between line q and the second segment (on the interior side) is 50°. What is the measure of the angle at the bend point B, on the interior side of the zigzag?",
          choices: ["85°", "15°", "180°", "70°"],
          answer: 0,
          explain:
            "This classic 'bent path between two parallel lines' setup is solved by drawing an auxiliary line through the bend point B, parallel to both given lines; this splits the angle at B into two pieces, each an alternate interior angle with one of the given angles — one piece equals 35°, the other equals 50° — so the full angle at B is 35+50=85°. 15° comes from subtracting the two given angles instead of adding them. 180° mistakenly treats the two given angles and the unknown as summing to a straight line instead of correctly splitting the unknown into two alternate-interior pieces. 70° comes from doubling one of the given angles instead of adding both distinct pieces.",
          diagram: { kind: "bentPath", angle1: "35°", angle2: "50°", unknown: "?" },
          difficulty: "hard",
        },
      ],
      traps: [
        "Applying the 'equal angles' rule (correct for corresponding/alternate interior angles) to a co-interior angle pair, which is actually supplementary, not equal.",
        "Misidentifying which specific angle pair type is shown in a given diagram or description.",
      ],
    },
    {
      name: "Similar Triangles and Proportional Sides",
      explanation:
        "This pattern tests whether corresponding sides of two similar triangles — same shape, possibly different size — keep a constant ratio, called the scale factor. The method: first match each side of one triangle to its corresponding side in the other. Matching is based on the triangles' matching angles, not just which sides look similar in length or happen to be listed near each other. Then set up a proportion using that scale factor to solve for the unknown side. The proportion itself is rarely the hard part — mismatching which sides actually correspond is.",
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
        },
      ],
      traps: [
        "Matching sides based on their order of appearance in the problem rather than their actual corresponding angles, leading to an incorrect ratio.",
        "Setting up the scale factor upside down (e.g., using the smaller triangle's side over the larger one when the reverse was needed).",
        "Assuming triangles are similar just because one angle matches, without checking that a second angle (or proportional sides) confirms it.",
      ],
    },
    {
      name: "Vertical Angles and Basic Angle Relationships",
      explanation:
        "When two straight lines cross, they form two pairs of vertical angles (directly across from each other) and pairs of adjacent angles along each line. Vertical angles are always exactly equal — no calculation needed once you spot them. Adjacent angles along a straight line are supplementary, adding to 180°, since a straight line always measures 180°. These facts apply with just two crossing lines — no triangle, no parallel-lines setup required, unlike the other patterns in this subskill.",
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
        "The foundational skill here: correctly identify which sides are 'opposite,' 'adjacent,' and 'hypotenuse' relative to the specific angle in question, then apply the matching trig ratio. SOH: sine = opposite/hypotenuse. CAH: cosine = adjacent/hypotenuse. TOA: tangent = opposite/adjacent. The most common error isn't the formula — it's misidentifying which side is 'opposite' versus 'adjacent' for the angle being used.",
      examples: [
        {
          q: "A support cable is anchored 15 feet from the base of a pole and meets the top of the pole at a 40° angle of elevation. Which expression gives the pole's height?",
          choices: ["15 · tan(40°)", "15 · sin(40°)", "15 · cos(40°)", "15 / tan(40°)"],
          answer: 0,
          explain:
            "The pole's height is opposite the 40° angle and the 15-foot distance is adjacent to it, so relating opposite and adjacent calls for tangent (TOA): tan(40°)=height/15, giving height=15·tan(40°). 15·sin(40°) mistakenly uses sine, which relates opposite and hypotenuse, but the hypotenuse (the cable) isn't the given side here. 15·cos(40°) mistakenly uses cosine, which relates adjacent and hypotenuse, the same mismatch. 15/tan(40°) inverts the correct relationship, effectively swapping which side is opposite and which is adjacent.",
          diagram: { kind: "rightTriangle", base: "15", angle: "40°", height: "?", solveFor: "height" },
          difficulty: "easy",
        },
        {
          q: "A ladder leans against a wall, reaching a point 12 feet up the wall. The base of the ladder sits 5 feet from the wall. What angle does the ladder make with the ground?",
          choices: ["tan⁻¹(12/5)", "tan⁻¹(5/12)", "sin⁻¹(12/5)", "cos⁻¹(5/12)"],
          answer: 0,
          explain:
            "The wall height (12) is opposite the ground angle and the base distance (5) is adjacent to it, so relating opposite and adjacent calls for tangent; solving for the angle itself uses the inverse: angle=tan⁻¹(12/5). tan⁻¹(5/12) inverts the ratio, swapping opposite and adjacent. sin⁻¹(12/5) misapplies sine to a ratio greater than 1, which isn't valid for sine, and confuses the hypotenuse relationship with the opposite/adjacent one. cos⁻¹(5/12) makes the same mismatch.",
          diagram: { kind: "rightTriangle", base: "5", height: "12", angle: "?", solveFor: "angle" },
          difficulty: "medium",
        },
        {
          q: "In a right triangle, the side opposite a 30° angle is 5, and the hypotenuse is 10. What is sin(30°) based on this triangle?",
          choices: ["1/2", "2", "5/√75", "10/5"],
          answer: 0,
          explain:
            "5 is opposite the 30° angle and 10 is the hypotenuse; sine relates opposite and hypotenuse (SOH), so sin(30°)=5/10=1/2. 2 inverts the correct ratio. 5/√75 comes from an unrelated miscalculation, like invoking the Pythagorean theorem when it isn't needed here. 10/5 also inverts the ratio, restating hypotenuse over opposite instead of opposite over hypotenuse.",
          diagram: { kind: "rightTriangle", height: "5", hypotenuse: "10", angle: "30°" },
          difficulty: "easy",
        },
        {
          q: "A 20-foot ramp rises at an angle of 15° from the ground to a loading dock. Which expression gives the horizontal distance the ramp covers?",
          choices: ["20cos(15°)", "20sin(15°)", "20tan(15°)", "20/cos(15°)"],
          answer: 0,
          explain:
            "The ramp (20 feet) is the hypotenuse and the horizontal distance is adjacent to the 15° angle, so relating adjacent and hypotenuse calls for cosine (CAH): cos(15°)=horizontal/20, giving horizontal=20cos(15°). 20sin(15°) mistakenly uses sine, which would give the vertical rise (opposite), not the horizontal distance. 20tan(15°) mistakenly uses tangent, which relates opposite and adjacent, neither of which is the hypotenuse given here. 20/cos(15°) inverts the correct relationship.",
          diagram: { kind: "rightTriangle", hypotenuse: "20", angle: "15°", base: "?", solveFor: "base" },
          difficulty: "medium",
        },
        {
          q: "An isosceles triangle has two equal sides of length 13 and a base of 10. An altitude is drawn from the apex to the midpoint of the base, forming two right triangles. What is the sine of the angle between one of the equal sides and the base?",
          choices: ["12/13", "5/13", "5/12", "12/5"],
          answer: 0,
          explain:
            "The altitude from the apex to the base's midpoint creates two congruent right triangles, with the hypotenuse as the original equal side (13) and half the base (5) adjacent to the angle in question; finding the altitude (opposite) via the Pythagorean theorem gives √(13²-5²)=√144=12, so sine=opposite/hypotenuse=12/13. 5/13 mistakenly reports the adjacent side over the hypotenuse (cosine) instead. 5/12 mistakenly reports adjacent over opposite, a tangent-style ratio using the wrong sides. 12/5 mistakenly reports opposite over adjacent instead of opposite over hypotenuse.",
          diagram: { kind: "isoscelesAltitude", equalSide: "13", halfBase: "5", altitude: "?", solveFor: "altitude" },
          difficulty: "hard",
        },
      ],
      traps: [
        "Misidentifying which side is opposite versus adjacent relative to the specific angle being used — this depends on the angle's position, not just the shape of the triangle.",
        "Choosing the wrong trig ratio (sine instead of tangent, etc.) because the opposite/adjacent/hypotenuse sides weren't correctly identified first.",
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
        },
        {
          q: "In a right triangle, both legs measure 7√2. What is the length of the hypotenuse?",
          choices: ["14", "7√2", "49", "7√4"],
          answer: 0,
          explain:
            "This is a 45-45-90 triangle, since both legs are equal; if a leg is x, the hypotenuse is x√2, so hypotenuse=7√2×√2=7×2=14. 7√2 mistakenly restates the leg length itself instead of computing the hypotenuse. 49 comes from squaring the leg instead of multiplying it by √2. 7√4 comes from a computational slip that doesn't correctly simplify √2×√2 to 2.",
          diagram: {
            kind: "rightTriangle",
            base: "7√2",
            height: "7√2",
            angle: "45°",
            hypotenuse: "?",
            solveFor: "hypotenuse",
          },
          difficulty: "medium",
        },
        {
          q: "In a right triangle, both legs measure 9. What is the length of the hypotenuse?",
          choices: ["9√2", "18", "9", "81"],
          answer: 0,
          explain:
            "This is a 45-45-90 triangle, since both legs are equal; if a leg is x, the hypotenuse is x√2, so with x=9, hypotenuse=9√2. 18 mistakenly doubles the leg instead of multiplying by √2. 9 mistakenly restates the leg length itself instead of computing the hypotenuse. 81 comes from squaring the leg, an unrelated operation.",
          diagram: { kind: "rightTriangle", base: "9", height: "9", angle: "45°", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
        },
        {
          q: "In a right triangle, the hypotenuse measures 14, and one angle measures 30°. What is the length of the side opposite the 30° angle?",
          choices: ["7", "14", "7√3", "28"],
          answer: 0,
          explain:
            "This is a 30-60-90 triangle; if the side opposite 30° is x, the hypotenuse is 2x, so working backward from the given hypotenuse, 2x=14, giving x=7. 14 mistakenly restates the hypotenuse itself instead of solving for x. 7√3 mistakenly computes the side opposite 60° instead of the side opposite 30°. 28 comes from doubling the hypotenuse instead of halving it.",
          diagram: { kind: "rightTriangle", hypotenuse: "14", angle: "30°", height: "?", solveFor: "height" },
          difficulty: "medium",
        },
        {
          q: "In a right triangle, the hypotenuse measures 16, and one angle measures 60°. What is the length of the side opposite the 60° angle?",
          choices: ["8√3", "8", "16√3", "4√3"],
          answer: 0,
          explain:
            "Since one angle is 60°, this is a 30-60-90 triangle; using the hypotenuse to find x first, 16=2x gives x=8 (the side opposite 30°), and the side opposite 60° is x√3, not x itself, giving 8√3. 8 mistakenly reports x, the side opposite 30°, instead of the side opposite 60°. 16√3 mistakenly uses the full hypotenuse instead of x in the x√3 formula. 4√3 comes from an arithmetic slip while solving for x from the hypotenuse.",
          diagram: { kind: "rightTriangle", hypotenuse: "16", angle: "60°", height: "?", solveFor: "height" },
          difficulty: "hard",
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
        },
        {
          q: "In a right triangle, one leg measures 5 and the hypotenuse measures 13. What is the tangent of the angle for which the leg of length 5 is adjacent?",
          choices: ["12/5", "5/12", "5/13", "12/13"],
          answer: 0,
          explain:
            "Tangent needs opposite/adjacent, so the missing leg is found first via the Pythagorean theorem: √(13²-5²)=√144=12; tangent=opposite/adjacent=12/5. 5/12 inverts the correct ratio, swapping opposite and adjacent. 5/13 and 12/13 both mistakenly involve the hypotenuse, which tangent doesn't use at all.",
          diagram: { kind: "rightTriangle", base: "5", angle: "θ", height: "?", hypotenuse: "13", solveFor: "height" },
          difficulty: "easy",
        },
        {
          q: "In a right triangle, the two legs measure 4 and 4. What is the sine of one of the acute angles?",
          choices: ["√2/2", "1/2", "√2", "4/√32"],
          answer: 0,
          explain:
            "The hypotenuse is found via the Pythagorean theorem: √(4²+4²)=√32=4√2 after simplifying; sine=opposite/hypotenuse=4/(4√2)=1/√2, which rationalizes to √2/2. 1/2 comes from an unrelated miscalculation that drops the radical entirely. √2 comes from inverting the correctly rationalized ratio. 4/√32 is the correct ratio before rationalizing, left in a non-simplified form rather than the fully simplified answer.",
          diagram: { kind: "rightTriangle", base: "4", height: "4", angle: "θ", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "medium",
        },
        {
          q: "In a right triangle, one leg measures 9 and the hypotenuse measures 15. What is the cosine of the acute angle that is NOT adjacent to the leg of length 9?",
          choices: ["4/5", "3/5", "9/15", "12/15"],
          answer: 0,
          explain:
            "The missing leg is found first: √(15²-9²)=√144=12; since the question asks for the angle NOT adjacent to the 9-leg, that means 9 is actually opposite this angle and 12 is adjacent to it, so cosine=adjacent/hypotenuse=12/15=4/5. 3/5 mistakenly computes sine (using 9 as opposite over the hypotenuse) instead of cosine. 9/15 mistakenly treats the 9-leg as adjacent, misreading which angle is being asked about. 12/15 correctly identifies 12 as adjacent but isn't reduced to its simplest form, unlike the fully simplified 4/5.",
          diagram: { kind: "rightTriangle", height: "9", hypotenuse: "15", angle: "θ", base: "?", solveFor: "base" },
          difficulty: "medium",
        },
        {
          q: "A support wire runs from the top of a 24-foot pole to a point on the ground 18 feet from the pole's base. What is the sine of the angle the wire makes with the ground?",
          choices: ["4/5", "3/5", "24/18", "18/24"],
          answer: 0,
          explain:
            "The wire (hypotenuse) isn't given directly and must be found via the Pythagorean theorem: √(24²+18²)=√900=30; sine=opposite/hypotenuse=24/30=4/5. 3/5 mistakenly computes cosine (adjacent over hypotenuse, 18/30) instead of sine. 24/18 mistakenly uses a tangent-style ratio (leg over leg) instead of opposite over hypotenuse. 18/24 makes the same mistake with the legs reversed.",
          diagram: { kind: "rightTriangle", base: "18", height: "24", angle: "θ", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "hard",
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
        "This pattern tests angles measured in radians instead of degrees, especially values larger than 2π (a full circle) or negative angles. The method: find a coterminal angle within the standard 0-to-2π range, by adding or subtracting multiples of 2π until it lands there. Then evaluate the trig function using that simpler, equivalent angle. Coterminal angles always share identical trig values, since they land in the exact same position on the circle.",
      examples: [
        {
          q: "What is the value of cos(2π + π/3)?",
          choices: ["1/2", "√3/2", "-1/2", "1"],
          answer: 0,
          explain:
            "Adding a full 2π rotation doesn't change where the angle points, so cos(2π+π/3) equals the simpler cos(π/3)=1/2. √3/2 mistakenly reports sin(π/3) instead of cos(π/3), confusing the two trig functions. -1/2 comes from an incorrect sign, as if the angle landed in a different quadrant. 1 mistakenly evaluates the reduced angle as if it were 0 instead of π/3.",
          diagram: { kind: "unitCircleAngle", rawLabel: "2π + π/3", angleDegrees: 60 },
          difficulty: "easy",
        },
        {
          q: "What is the value of sin(-π/6)?",
          choices: ["-1/2", "1/2", "-√3/2", "√3/2"],
          answer: 0,
          explain:
            "Converting the negative angle to its positive coterminal angle by adding 2π gives -π/6+2π=11π/6, which lies in the fourth quadrant, where sine is negative; the reference angle is π/6, and sin(π/6)=1/2, so with the fourth-quadrant sign, sin(11π/6)=-1/2. 1/2 forgets to apply the negative sign for the fourth quadrant. -√3/2 and √3/2 both mistakenly report cosine's reference value instead of sine's.",
          diagram: { kind: "unitCircleAngle", rawLabel: "-π/6", angleDegrees: -30 },
          difficulty: "easy",
        },
        {
          q: "What is the value of tan(13π/4)?",
          choices: ["1", "-1", "√2", "-√2"],
          answer: 0,
          explain:
            "Since 13π/4 is larger than 2π (which is 8π/4), subtracting one full rotation gives 13π/4-8π/4=5π/4, which lies in the third quadrant, where tangent is positive; the reference angle is π/4, and tan(π/4)=1, so tan(5π/4)=1. -1 mistakenly applies a negative sign, as if the angle landed in a quadrant where tangent is negative. √2 and -√2 both mistakenly report a sine or cosine reference value instead of tangent's.",
          diagram: { kind: "unitCircleAngle", rawLabel: "13π/4", angleDegrees: 585 },
          difficulty: "medium",
        },
        {
          q: "What is the value of sin(17π/2)?",
          choices: ["1", "-1", "0", "1/2"],
          answer: 0,
          explain:
            "Since 17π/2 is much larger than 2π, multiple full rotations must be subtracted: 17π/2 ÷ (4π/2) = 4.25, meaning 4 full rotations (16π/2) fit inside, leaving 17π/2-16π/2=π/2, and sin(π/2)=1. -1 comes from subtracting one too many or too few rotations, landing on the wrong angle. 0 mistakenly evaluates the angle as if it reduced to 0 or π instead of π/2. 1/2 mistakenly reports a different reference value entirely.",
          diagram: { kind: "unitCircleAngle", rawLabel: "17π/2", angleDegrees: 1530 },
          difficulty: "medium",
        },
        {
          q: "What is the value of cos(-11π/3)?",
          choices: ["1/2", "-1/2", "√3/2", "-√3/2"],
          answer: 0,
          explain:
            "This angle is both negative and large in magnitude, needing 2π added twice to reach the standard range: -11π/3+6π/3=-5π/3 (still negative), then -5π/3+6π/3=π/3; cos(π/3)=1/2. -1/2 comes from stopping after adding 2π only once, landing on the wrong (still-negative) angle and misapplying a sign. √3/2 and -√3/2 both mistakenly report sine's reference value instead of cosine's.",
          diagram: { kind: "unitCircleAngle", rawLabel: "-11π/3", angleDegrees: -660 },
          difficulty: "hard",
        },
      ],
      traps: [
        "Trying to evaluate a trig function directly at a large or negative radian value without first reducing it to a coterminal angle within one full rotation.",
        "Subtracting or adding the wrong number of full rotations (2π), leaving an angle that's still outside the standard range or overshoots into the wrong quadrant.",
        "Converting between radians and degrees incorrectly, especially forgetting that π radians equals 180°, not 360°.",
      ],
    },
    {
      name: "Using the Pythagorean Theorem Alone to Find a Missing Side",
      explanation:
        "Not every right-triangle question needs a trig ratio — plenty just ask for a missing side length, which the Pythagorean theorem (a² + b² = c²) finds directly. Remember c is always the hypotenuse: opposite the right angle, and always the longest side. If the hypotenuse is missing, add the two legs' squares and take the square root. If a leg is missing, subtract the other leg's square from the hypotenuse's square first. Many answers come out as a simplified radical, not a whole number — know how to simplify a square root (pull out the largest perfect-square factor) instead of leaving it unsimplified or rounding early.",
      examples: [
        {
          q: "A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?",
          choices: ["10", "14", "√28", "48"],
          answer: 0,
          explain:
            "Applying the Pythagorean theorem, 6²+8²=c², gives 36+64=100=c², so c=10, a recognizable 6-8-10 triangle (a scaled-up 3-4-5). 14 comes from simply adding the two legs instead of applying the theorem. √28 comes from an unrelated miscalculation, like subtracting instead of adding the squares. 48 mistakenly reports the product of the two legs instead of the hypotenuse.",
          diagram: { kind: "rightTriangle", base: "6", height: "8", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
        },
        {
          q: "A right triangle has a hypotenuse of length 13 and one leg of length 5. What is the length of the other leg?",
          choices: ["12", "18", "8", "√194"],
          answer: 0,
          explain:
            "Since the hypotenuse is known, the missing leg is found by subtracting: b²=13²-5²=169-25=144, so b=12. 18 comes from adding the squares instead of subtracting them, treating the hypotenuse as if it were a missing leg. 8 comes from an arithmetic slip in the subtraction. √194 comes from adding the squares (169+25) instead of subtracting them.",
          diagram: { kind: "rightTriangle", hypotenuse: "13", base: "5", height: "?", solveFor: "height" },
          difficulty: "easy",
        },
        {
          q: "A right triangle has legs of length 5 and 9. What is the length of the hypotenuse, in simplest radical form?",
          choices: ["√106", "14", "√56", "106"],
          answer: 0,
          explain:
            "Applying the theorem, 5²+9²=c², gives 25+81=106=c², so c=√106; since 106 has no perfect-square factors other than 1 (its factors are 2×53, neither a perfect square), this radical is already fully simplified. 14 comes from simply adding the two legs instead of applying the theorem. √56 comes from an arithmetic slip in the addition. 106 mistakenly reports c² itself instead of taking the square root.",
          diagram: { kind: "rightTriangle", base: "5", height: "9", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "medium",
        },
        {
          q: "A ladder 15 feet long leans against a wall, with its base 9 feet from the wall. How high up the wall does the ladder reach?",
          choices: ["12 feet", "18 feet", "6 feet", "√306 feet"],
          answer: 0,
          explain:
            "Translating the scenario into a right triangle, the ladder is the hypotenuse (15) and the ground distance is one leg (9); applying the theorem, 9²+b²=15², gives 81+b²=225, so b²=144 and b=12 feet. 18 feet comes from adding the squares instead of subtracting them, treating the hypotenuse as if it were a missing leg. 6 feet comes from an arithmetic slip in the subtraction. √306 feet comes from adding the squares (81+225) instead of subtracting them.",
          diagram: { kind: "rightTriangle", hypotenuse: "15", base: "9", height: "?", solveFor: "height" },
          difficulty: "medium",
        },
        {
          q: "A right triangle has legs of length 4√3 and 4. Find the length of the hypotenuse, and simplify your answer completely.",
          choices: ["8", "4√7", "64", "4√3+4"],
          answer: 0,
          explain:
            "Applying the theorem and squaring each leg carefully, (4√3)²+4²=c²; squaring the radical term correctly gives (4√3)²=16×3=48, and combining, 48+16=64=c², so c=8. 4√7 comes from incorrectly adding the two legs' values under one radical instead of squaring each separately. 64 mistakenly reports c² itself instead of taking the square root. 4√3+4 mistakenly adds the two original leg lengths together instead of applying the Pythagorean theorem at all.",
          diagram: { kind: "rightTriangle", base: "4√3", height: "4", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "hard",
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
        "In any right triangle, the two non-right angles are always complementary — they add to 90°. That creates a direct shortcut: the sine of one acute angle always equals the cosine of the other, since each angle's 'opposite' side is the other angle's 'adjacent' side. As an identity: sin(x°) = cos(90° - x°), for any angle x. So a question can hand you sin(x°) = cos(y°) and ask for the relationship between x and y with no triangle and no side lengths at all — the answer is always that x and y add up to 90.",
      examples: [
        {
          q: "If sin(40°) = cos(y°), what is the value of y?",
          choices: ["50", "40", "130", "90"],
          answer: 0,
          explain:
            "Applying the identity sin(x°)=cos(90°-x°) with x=40 gives y=90-40=50. 40 mistakenly restates the given angle itself instead of solving for its complement. 130 comes from adding the two angles instead of subtracting. 90 mistakenly reports the full complementary sum itself instead of the missing angle y.",
          diagram: { kind: "rightTriangle", angle: "40°", topAngle: "y°" },
          difficulty: "easy",
        },
        {
          q: "In a right triangle, angle A and angle B are the two non-right angles. If sin(A) = 0.6, what is cos(B)?",
          choices: ["0.6", "0.4", "0.8", "1.6"],
          answer: 0,
          explain:
            "In any right triangle, the two non-right angles are always complementary, and by the complementary angle identity, sin(A)=cos(B) whenever A and B are complementary, so cos(B)=0.6 with no calculation needed. 0.4 comes from an unrelated miscalculation, like subtracting from 1. 0.8 mistakenly computes a different ratio, as if using the Pythagorean theorem on an assumed 3-4-5 triangle instead of applying the direct identity. 1.6 comes from adding 1 to the given value, an arithmetic error.",
          diagram: { kind: "rightTriangle", angle: "A", topAngle: "B" },
          difficulty: "easy",
        },
        {
          q: "If sin(3x°) = cos(2x° + 15°), what is the value of x?",
          choices: ["15", "25", "5", "37.5"],
          answer: 0,
          explain:
            "Since sin of one angle equals cos of its complement, 3x and (2x+15) must sum to 90: 3x+(2x+15)=90; combining like terms gives 5x+15=90, so 5x=75, giving x=15. 25 comes from an arithmetic slip while isolating x. 5 comes from a similar arithmetic slip in a different direction. 37.5 comes from forgetting to subtract the 15 before dividing by 5.",
          diagram: { kind: "rightTriangle", angle: "3x°", topAngle: "(2x+15)°" },
          difficulty: "medium",
        },
        {
          q: "In right triangle KLM, with the right angle at L, sin(K) = cos(K + 20°). What is the measure of angle K?",
          choices: ["35°", "70°", "20°", "55°"],
          answer: 0,
          explain:
            "Since K and M (where M=K+20) are complementary, K+(K+20)=90; combining gives 2K+20=90, so 2K=70, giving K=35°. 70° mistakenly reports 2K, an intermediate value, instead of solving for K itself. 20° mistakenly restates the given offset instead of solving for K. 55° comes from an arithmetic slip while isolating K.",
          diagram: { kind: "rightTriangle", angle: "K", topAngle: "K+20°" },
          difficulty: "hard",
        },
        {
          q: "Right triangle PQR has its right angle at Q. If sin(P) = 5/13, what is cos(P) + sin(R)?",
          choices: ["24/13", "12/13", "10/13", "17/13"],
          answer: 0,
          explain:
            "Since P and R are complementary, sin(R)=cos(P) by the identity, meaning the two quantities being added are equal to each other; since sin(P)=5/13 describes a 5-12-13 right triangle (opposite=5, hypotenuse=13, so adjacent=12), cos(P)=12/13, and cos(P)+sin(R)=12/13+12/13=24/13. 12/13 mistakenly reports only one of the two equal terms instead of their sum. 10/13 comes from doubling the wrong ratio (5/13 instead of 12/13). 17/13 comes from an arithmetic slip in the final addition.",
          diagram: { kind: "rightTriangle", angle: "P", topAngle: "R", base: "12", height: "5", hypotenuse: "13" },
          difficulty: "hard",
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
      desmosTrick:
        "Step 1: Type the equation exactly as given, using ^2 for squares — for example (x-3)^2+(y+1)^2=25. Desmos draws the circle immediately. Step 2: Read the center straight off what's being subtracted from x and y inside the parentheses (watch the sign carefully: (x-3) means the center's x-coordinate is +3, not -3). Step 3: The radius is the square root of the number on the right side. Step 4: You can also click any point on the drawn circle to read its coordinates directly, instead of plugging a value into the equation algebraically.",
      explanation:
        "A circle's equation in the form (x-h)² + (y-k)² = r² directly encodes its center (h, k) and radius r. Just like with vertex form for parabolas, the most common error is a sign mix-up: an equation with (x+3)² actually means h = -3, not h = 3, since the template subtracts h.",
      examples: [
        {
          q: "What is the equation of a circle with center (2, -3) and radius 5?",
          choices: ["(x-2)² + (y+3)² = 25", "(x+2)² + (y-3)² = 25", "(x-2)² + (y-3)² = 25", "(x-2)² + (y+3)² = 5"],
          answer: 0,
          explain:
            "Substituting h=2, k=-3, r=5 into the template (x-h)²+(y-k)²=r² gives (x-2)²+(y-(-3))²=5², which simplifies to (x-2)²+(y+3)²=25 — the '+3' is correct because subtracting a negative k flips the sign. (x+2)²+(y-3)²=25 flips both signs incorrectly, treating the center as if it were (-2,3). (x-2)²+(y-3)²=25 forgets to flip the sign on the negative k-coordinate at all. (x-2)²+(y+3)²=5 correctly handles the center but forgets to square the radius on the right side.",
          diagram: { kind: "circleCoordinate", h: 2, k: -3, r: 5 },
          difficulty: "easy",
        },
        {
          q: "What is the equation of a circle with center (-4, 1) and radius 6?",
          choices: ["(x+4)² + (y-1)² = 36", "(x-4)² + (y+1)² = 36", "(x+4)² + (y-1)² = 6", "(x+4)² + (y+1)² = 36"],
          answer: 0,
          explain:
            "Substituting h=-4, k=1, r=6 gives (x-(-4))²+(y-1)²=6², which simplifies to (x+4)²+(y-1)²=36 — the '+4' is correct because subtracting a negative h flips the sign. (x-4)²+(y+1)²=36 flips both signs incorrectly, treating the center as if it were (4,-1). (x+4)²+(y-1)²=6 correctly handles the center but forgets to square the radius. (x+4)²+(y+1)²=36 correctly flips the sign for h but incorrectly flips the sign for the positive k as well.",
          diagram: { kind: "circleCoordinate", h: -4, k: 1, r: 6 },
          difficulty: "medium",
        },
        {
          q: "What is the equation of a circle with center (5, 2) and radius 3?",
          choices: ["(x-5)² + (y-2)² = 9", "(x+5)² + (y+2)² = 9", "(x-5)² + (y-2)² = 3", "(x-5)² + (y-2)² = 6"],
          answer: 0,
          explain:
            "Substituting h=5, k=2, r=3 directly into the template gives (x-5)²+(y-2)²=3², which simplifies to (x-5)²+(y-2)²=9. (x+5)²+(y+2)²=9 incorrectly flips both signs, even though both coordinates of the center are positive and need no flip. (x-5)²+(y-2)²=3 forgets to square the radius. (x-5)²+(y-2)²=6 comes from an arithmetic slip, like doubling the radius instead of squaring it.",
          diagram: { kind: "circleCoordinate", h: 5, k: 2, r: 3 },
          difficulty: "easy",
        },
        {
          q: "A circle has the equation (x+1)² + (y-8)² = 49. What are the circle's center and radius?",
          choices: ["Center (-1, 8), radius 7", "Center (1, 8), radius 7", "Center (-1, 8), radius 49", "Center (-1, -8), radius 7"],
          answer: 0,
          explain:
            "Since the equation has (x+1), that's (x-(-1)), so h=-1; since it has (y-8), k=8; and the radius is the square root of the right side, √49=7, not 49 itself. Reporting center (1,8) misreads (x+1) as meaning h=1 instead of correctly flipping the sign to h=-1. Reporting radius 49 forgets to take the square root of the right side. Reporting center (-1,-8) incorrectly flips the sign on k, which doesn't need flipping since (y-8) already matches the template directly.",
          diagram: { kind: "circleCoordinate", h: -1, k: 8, r: 7 },
          difficulty: "medium",
        },
        {
          q: "A circle has the equation x² + y² + 6x - 4y - 12 = 0. What is the circle's radius?",
          choices: ["5", "25", "12", "3"],
          answer: 0,
          explain:
            "Completing the square for both x and y, grouping terms as (x²+6x)+(y²-4y)=12, then adding (6/2)²=9 and (-4/2)²=4 to both sides gives (x²+6x+9)+(y²-4y+4)=12+9+4=25, which simplifies to (x+3)²+(y-2)²=25, so the radius is √25=5. 25 mistakenly reports the right side of the equation itself instead of taking its square root. 12 mistakenly restates the original constant from the equation instead of completing the square first. 3 comes from an arithmetic slip while completing the square.",
          diagram: { kind: "circleCoordinate", h: -3, k: 2, r: 5 },
          difficulty: "hard",
        },
      ],
      traps: [
        "Writing the wrong sign for a negative coordinate in the center — forgetting that subtracting a negative number flips to addition.",
        "Forgetting to square the radius on the right side of the equation (writing r instead of r²), or forgetting to take the square root when working backward from an equation to find r.",
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
        },
        {
          q: "An arc has a central angle of 120° in a circle of radius 9. What is the arc length, in terms of π?",
          choices: ["6π", "18π", "9π", "2π"],
          answer: 0,
          explain:
            "This arc represents 120°/360°=1/3 of the full circle; the full circumference is 2πr=2π(9)=18π, so applying the fraction gives (1/3)(18π)=6π. 18π mistakenly reports the full circumference instead of the arc's fraction of it. 9π comes from an arithmetic slip in the fraction multiplication. 2π comes from using the wrong fraction entirely.",
          diagram: { kind: "sector", radiusLabel: "9", angleLabel: "120°", angleDegrees: 120, askFor: "arcLength" },
          difficulty: "medium",
        },
        {
          q: "A sector has a central angle of 60° in a circle of radius 6. What is its area?",
          choices: ["6π", "36π", "3π", "12π"],
          answer: 0,
          explain:
            "This sector represents 60°/360°=1/6 of the full circle; the full circle's area is πr²=π(36)=36π, so applying the fraction gives (1/6)(36π)=6π. 36π mistakenly reports the full circle's area instead of the sector's fraction of it. 3π comes from an arithmetic slip in the fraction multiplication. 12π comes from using an incorrect fraction, like 1/3 instead of 1/6.",
          diagram: { kind: "sector", radiusLabel: "6", angleLabel: "60°", angleDegrees: 60, askFor: "area" },
          difficulty: "easy",
        },
        {
          q: "An arc has a length of 5π in a circle of radius 10. What is the measure of the central angle, in degrees?",
          choices: ["90°", "45°", "18°", "180°"],
          answer: 0,
          explain:
            "The full circumference is 2πr=2π(10)=20π; the given arc length represents a fraction of 5π/20π=1/4 of that circumference, so applying that same fraction to the full 360° gives (1/4)(360°)=90°. 45° comes from an arithmetic slip in computing the fraction. 18° comes from using the arc length itself (5) as a fraction of 360 without properly relating it to the circumference. 180° mistakenly reports half the circle instead of the correct 1/4.",
          diagram: { kind: "sector", radiusLabel: "10", angleLabel: "?", angleDegrees: 90, askFor: "angle" },
          difficulty: "medium",
        },
        {
          q: "A sector has a central angle of 2π/3 radians in a circle of radius 9. What is the arc length of the sector?",
          choices: ["6π", "18π", "3π", "2π/3"],
          answer: 0,
          explain:
            "Since the angle is given in radians, arc length equals radius times angle directly (rθ), without needing a fraction of 360°: 9×(2π/3)=18π/3=6π. 18π mistakenly reports radius times the numerator of the angle without dividing by the denominator. 3π comes from an arithmetic slip in the multiplication. 2π/3 mistakenly restates the angle itself instead of computing the arc length.",
          diagram: { kind: "sector", radiusLabel: "9", angleLabel: "2π/3", angleDegrees: 120, askFor: "arcLength" },
          difficulty: "hard",
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
        },
        {
          q: "The circle x² + y² = 100 passes through a point where x=6. What are the possible value(s) of y?",
          choices: ["y=8 or y=-8", "y=64 or y=-64", "y=8 only", "y=4 or y=-4"],
          answer: 0,
          explain:
            "Substituting x=6 gives 36+y²=100, so y²=64, and taking the square root of both sides gives y=±8. y=64 or y=-64 mistakenly reports y² itself instead of taking the square root. y=8 only forgets the negative root. y=4 or y=-4 comes from an arithmetic slip, like taking the square root of 64 incorrectly.",
          diagram: { kind: "circleCoordinate", h: 0, k: 0, r: 10, verticalLineAtX: 6, markPoints: true },
          difficulty: "easy",
        },
        {
          q: "The circle (x+1)² + (y-4)² = 40 passes through a point where x=5. What are the possible value(s) of y?",
          choices: ["y=6 or y=2", "y=8 or y=0", "y=6 only", "y=-6 or y=-2"],
          answer: 0,
          explain:
            "Substituting x=5 gives (5+1)²+(y-4)²=40, which simplifies to 36+(y-4)²=40, so (y-4)²=4; taking the square root of both sides gives y-4=±2, so y=6 or y=2. y=8 or y=0 comes from an arithmetic slip while isolating the squared term. y=6 only forgets the negative root, missing one of the two valid solutions. y=-6 or y=-2 comes from a sign error while solving y-4=±2.",
          diagram: { kind: "circleCoordinate", h: -1, k: 4, r: 6, verticalLineAtX: 5, markPoints: true },
          difficulty: "medium",
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
        "Not every circle question involves the coordinate-plane equation — many are classic geometry facts about a circle drawn with no coordinates at all. Core facts: a central angle (vertex at the circle's center) always equals the arc it cuts off, in degrees. A radius drawn to where a tangent line touches the circle is always perpendicular to that tangent line, which often creates a right triangle you can solve with the Pythagorean theorem. Two radii of the same circle are always equal in length, which often makes a triangle formed by two radii isosceles. Basic area and circumference (A = πr², C = 2πr) show up here too, with no coordinate equation involved.",
      examples: [
        {
          q: "A central angle in a circle measures 70°. What is the measure of the arc it intercepts?",
          choices: ["70°", "35°", "140°", "110°"],
          answer: 0,
          explain:
            "A central angle's measure always equals its intercepted arc's measure in degrees, so the arc also measures 70°. 35° mistakenly halves the angle, confusing this with the different rule for inscribed angles, which equal half their intercepted arc. 140° mistakenly doubles the angle instead of restating it directly. 110° comes from an unrelated miscalculation, like subtracting from 180°.",
          diagram: { kind: "circleBasic", centralAngleLabel: "70°", arcLabel: "?" },
          difficulty: "easy",
        },
        {
          q: "A circle has a radius of 6. What is its area, in terms of π?",
          choices: ["36π", "12π", "6π", "18π"],
          answer: 0,
          explain:
            "Applying the area formula A=πr² with r=6 gives A=π(6)²=36π. 12π mistakenly uses the circumference formula (2πr) instead of the area formula. 6π mistakenly restates the radius times π without squaring it. 18π comes from an unrelated miscalculation, like using half of the correct area.",
          diagram: { kind: "circleBasic", radiusLabel: "6" },
          difficulty: "easy",
        },
        {
          q: "Line segment PQ is tangent to a circle at point Q, where O is the circle's center. If OQ = 5 and OP = 13, what is the length of PQ?",
          choices: ["12", "18", "8", "√194"],
          answer: 0,
          explain:
            "Since PQ is tangent to the circle at Q, radius OQ is perpendicular to PQ, making triangle OQP a right triangle with OP as the hypotenuse; applying the Pythagorean theorem, 5²+PQ²=13², gives 25+PQ²=169, so PQ²=144 and PQ=12. 18 comes from adding the squares instead of subtracting, treating OP as if it were a leg instead of the hypotenuse. 8 comes from an arithmetic slip in the subtraction. √194 comes from adding the squares (25+169) instead of subtracting them.",
          diagram: { kind: "circleBasic", tangent: { radius: "5", tangentSeg: "?", hyp: "13" } },
          difficulty: "medium",
        },
        {
          q: "Points A and B lie on a circle centered at O, with OA = OB = 9. If the angle AOB measures 60°, what is the length of chord AB?",
          choices: ["9", "9√3", "18", "4.5"],
          answer: 0,
          explain:
            "Since OA and OB are both radii of the same circle, they're equal, making triangle AOB isosceles with a 60° angle between the two equal sides; an isosceles triangle with a 60° angle between its equal sides is actually equilateral, since its base angles must also each be 60° to sum to 180°, so all three sides are equal and AB=OA=OB=9. 9√3 comes from an unrelated miscalculation, like applying a 30-60-90 ratio that doesn't actually apply to this equilateral setup. 18 mistakenly doubles the radius instead of recognizing the chord equals it directly. 4.5 comes from halving the radius instead of restating it.",
          diagram: { kind: "circleBasic", chordTriangle: { radius: "9", angle: "60°", chord: "?" } },
          difficulty: "hard",
        },
        {
          q: "A circle has a circumference of 24π. A central angle intercepts an arc with a length of 4π. What is the measure of the central angle, in degrees?",
          choices: ["60°", "90°", "30°", "45°"],
          answer: 0,
          explain:
            "An arc's length is the same fraction of the full circumference as its central angle is of 360°; the fraction here is arc length/circumference=4π/24π=1/6, so applying that fraction to 360° gives (1/6)×360°=60°. 90° comes from using the wrong fraction, like 1/4 instead of 1/6. 30° comes from an arithmetic slip in the fraction multiplication. 45° comes from an unrelated miscalculation.",
          diagram: { kind: "circleBasic", centralAngleLabel: "?", arcLabel: "4π" },
          difficulty: "hard",
        },
      ],
      traps: [
        "Confusing a central angle (vertex at the circle's center, equal to its arc) with an inscribed angle (vertex on the circle itself, equal to HALF its intercepted arc) — these follow different rules.",
        "Forgetting that a tangent line and the radius drawn to the point of tangency are perpendicular, missing an available right angle and Pythagorean setup.",
        "Not recognizing when two radii of the same circle create an isosceles (or, with a 60° angle between them, equilateral) triangle.",
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
 */
export function buildStudyPlan(totalWeeks: number = STUDY_PLAN_WEEK_COUNT): PlanWeek[] {
  const safeTotalWeeks = Math.max(2, Math.round(totalWeeks));
  const contentWeeks = Math.max(1, safeTotalWeeks - 1);

  const testsByWeek = new Map<number, number[]>();
  for (let t = 1; t <= NUM_FULL_LENGTH_TESTS; t++) {
    const w = Math.max(1, Math.min(safeTotalWeeks, Math.round((t / NUM_FULL_LENGTH_TESTS) * safeTotalWeeks)));
    testsByWeek.set(w, [...(testsByWeek.get(w) ?? []), t]);
  }

  const order = ALL_SUBSKILLS.map((s) => s.id);
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
