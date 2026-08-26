// Curriculum structure based on the official SAT Suite Question Bank
// domains and skills (College Board), current as of the 2025-2026 digital SAT.
// Source: satsuite.collegeboard.org/practice/student-question-bank

import type { DiagramSpec } from "@/lib/diagramTypes";

export interface WorkedExample {
  prompt: string;
  walkthrough: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  // Hand-authored schematic figure for geometry examples (right triangles,
  // circles, parallel lines, solids, etc.) -- see lib/diagramTypes.ts and
  // components/GeometryDiagram.tsx. Left unset for non-geometry examples.
  diagram?: DiagramSpec;
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
          prompt:
            "A passage opens by describing a coral reef study that initially focused on rising ocean temperatures as the main threat to reef health. It then describes how, over 15 years, the same research team found that reefs with higher genetic diversity survived heat waves that killed off genetically uniform reefs nearby. The passage closes by arguing that conservation policy should prioritize genetic diversity over temperature control efforts alone.",
          walkthrough:
            "Step 1: Identify the shift. The passage doesn't just describe temperature as a threat — it tracks a change in the researchers' understanding, from 'temperature is the threat' to 'genetic diversity is the deciding factor.' Step 2: Identify the ending's function. The final sentence about conservation policy tells you *why* this shift matters — it's not just a scientific curiosity, it's a call to action. Step 3: Test candidate answers against both the shift and the policy conclusion. An answer that only mentions temperature is too narrow (ignores the reversal). An answer that only says 'reefs face many threats' is too broad (ignores the specific genetic-diversity argument).",
          answer:
            "The best answer states that genetic diversity, not temperature alone, is the key factor in reef resilience — capturing both the finding and its implied policy stakes, without overreaching into unstated territory.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage's first paragraph describes a city's plan to turn vacant lots into community gardens, framed as a way to beautify neglected blocks. The second paragraph reports that two years in, coordinators tracked participating families' grocery receipts and found a real drop in produce spending, along with more variety in what families ate. The third paragraph notes that several local schools have since asked to build their own teaching gardens, citing these results. No single sentence directly states an overall conclusion.",
          walkthrough:
            "Step 1: Notice what each paragraph adds. The program started as a beautification idea, but paragraph two reveals a real, measurable benefit to families' food access, and paragraph three shows other institutions responding to that benefit — not to the beautification. Step 2: Since nothing states a conclusion outright, build it from what changes across the paragraphs: the program's real value turned out to be practical, not just visual, and that's what ended up spreading its influence. Step 3: Reject an answer that just says 'a city built community gardens' — that's true but misses the entire point of what the passage is actually tracking.",
          answer:
            "The best answer captures that the program, introduced as a beautification effort, turned out to have real practical value for participating families — a shift the whole passage builds toward even without a single stated conclusion sentence.",
          difficulty: "medium",
        },
        {
          prompt:
            "A passage describes a jazz musician's rigorous classical training, then explains that critics initially dismissed her improvisational recordings as undisciplined. Decades later, the passage says, music historians recognized that her improvisation was deliberately built on the very classical structures those critics assumed she had abandoned.",
          walkthrough:
            "Step 1: Track the shift: technical training, then dismissed as a break from that training, then later understood as an extension of it. Step 2: A very tempting wrong answer would say something like 'critics misjudge artists' — that's true, but it's generic enough to fit thousands of other passages, and it leaves out the specific thing critics got wrong. Step 3: The correct answer needs both pieces: what was actually misunderstood (that her improvising was built on, not opposed to, her training) and that this was eventually recognized — the specific claim this particular passage is making.",
          answer:
            "The main idea is that her improvisation, initially dismissed as a break from her training, was actually a sophisticated extension of it — a specific claim that a vaguer 'critics can be unfair' answer misses entirely.",
          difficulty: "hard",
        },
        {
          prompt:
            "A passage's first paragraph describes a small town's decision to convert an unused rail line into a walking trail. It then reports that the project came in well under its projected budget, and closes by noting that businesses along the trail have seen a rise in customers since it opened.",
          walkthrough:
            "Step 1: Identify what the passage tracks: a project, its cost outcome (under budget), and its economic effect (more customers). Step 2: These aren't separate trivia — together they build toward one point: the project turned out to be both a financial and economic success. Step 3: An answer mentioning only the trail's construction is too narrow (ignores the outcomes); one about 'public projects helping small towns' in general is too broad to capture this project's specific results.",
          answer:
            "The best answer states that the trail project succeeded both financially (under budget) and economically (more customers) — capturing both outcomes together, not just the fact that a trail was built.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage's first paragraph describes a historic theater's decline and closure. The second explains that the preservation group restoring it chose not to recreate its original 1920s look, but instead adapted it for modern accessibility and acoustics while preserving only the facade. The third reports that attendance since reopening has exceeded even the theater's historic peak.",
          walkthrough:
            "Step 1: Notice the shift: closure, then a deliberate choice (adapt rather than restore), then an outcome (record attendance). Step 2: The main idea isn't just 'the theater reopened' — it's that choosing adaptation over strict historical restoration is specifically what made the reopening succeed, evidenced by the attendance figures. Step 3: An answer saying only 'the theater was renovated' is too narrow; one focused only on preserving the facade misses the adaptation-versus-restoration decision and its payoff.",
          answer:
            "The best answer captures that adapting the theater for modern use, rather than restoring it exactly to its original form, is what enabled its successful reopening — the specific claim the passage builds toward across all three paragraphs.",
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
      name: "Explicit Detail Retrieval",
      explanation:
        "These questions are simpler than main-idea questions: you just report what the text directly says about one specific fact, number, or finding — no piecing-together required. This is different from 'function of a detail' questions too, since you're not explaining why the detail is there, just what it says. The method: find the exact sentence that answers the question, then pick the choice that restates it accurately. Don't add outside knowledge, reverse a direction, or borrow a fact from somewhere else in the passage.",
      examples: [
        {
          prompt:
            "A passage explains that a marine biologist tagged 40 sea turtles over a two-year study and found that 34 of them returned to the same nesting beach the following year. According to the text, what did the biologist find?",
          walkthrough:
            "Step 1: Locate the exact sentence answering 'what did she find' — the return-rate detail (34 of 40 returned). Step 2: Match the choice that restates this fact accurately, without changing the numbers or adding a claim about why it happened. Step 3: Reject a choice describing the tagging method itself (that's what she did, not what she found) or one that generalizes beyond the specific numbers given.",
          answer:
            "34 of the 40 tagged turtles returned to the same nesting beach the following year — a direct restatement of the finding, not the method or an inference about why.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage states that a city's recycling program initially accepted only paper and glass, but after a 2019 policy change, began accepting most plastics as well. According to the text, what changed about the program in 2019?",
          walkthrough:
            "Step 1: Locate the sentence describing the 2019 change specifically — the expansion to include most plastics. Step 2: Match a choice stating this addition accurately. Step 3: Reject a choice claiming paper and glass were removed (reverses what's stated — those were already accepted; plastics were added) or one describing a change at an unspecified date.",
          answer:
            "Most plastics were added to the list of accepted materials in 2019 — paper and glass remained accepted; nothing was removed.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage on a bridge inspection states that of the 12 support cables inspected, 2 showed early signs of corrosion, while the other 10 met all safety standards; a follow-up inspection is scheduled in 18 months rather than the standard 36. According to the text, how many of the inspected cables showed early signs of corrosion?",
          walkthrough:
            "Step 1: Several numbers appear in the passage (12 total, 10 fine, 18 months, 36 months) — locate specifically the one answering 'how many showed corrosion,' not the others. Step 2: The correct number is 2. Step 3: Reject a choice reporting 10 (the number that did NOT show corrosion) or 12 (the total), or one that reports the re-inspection timeline instead of the corrosion count.",
          answer:
            "2 cables showed early signs of corrosion — with several other numbers doing different jobs in the passage, it's easy to grab the wrong one without re-locating the exact sentence.",
          difficulty: "medium",
        },
        {
          prompt:
            "A passage states that before a particular drug was approved, clinical trials required a median of 8.5 years; that median has since fallen to 6.2 years following a set of regulatory reforms in 2015. According to the text, what was true of clinical trial length before the 2015 reforms?",
          walkthrough:
            "Step 1: Locate exactly what's being asked — the BEFORE value, not the after value. Step 2: The text states the before-value was a median of 8.5 years. Step 3: Reject a choice reporting 6.2 years (that's the after value) or one that reverses direction (claiming trial length increased after reforms, when it actually fell).",
          answer:
            "Before the 2015 reforms, the median clinical trial length was 8.5 years — the 6.2-year figure is the AFTER value, and swapping which number belongs to which time period is the main trap here.",
          difficulty: "medium",
        },
        {
          prompt:
            "A passage discusses two research teams studying coral bleaching: one, working in the Pacific, found bleaching events becoming more frequent but less severe; a second, working in the Caribbean, found the opposite pattern — less frequent but more severe events. According to the text, what did the Caribbean team find?",
          walkthrough:
            "Step 1: Notice the passage describes two teams with contrasting, easy-to-swap findings — that's the core difficulty here. Step 2: Carefully match 'Caribbean' to its specific finding: less frequent but more severe events, not the Pacific team's finding. Step 3: Reject an answer describing 'more frequent, less severe' — that's the Pacific team's result, and it's a natural slip to attach it to the wrong team while skimming.",
          answer:
            "The Caribbean team found bleaching events becoming less frequent but more severe — the opposite of the Pacific team's finding, and mixing up which team found what is exactly the trap this question is built around.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Choosing an answer accurate for a different part of the passage (a different number, entity, or time period) than the one actually asked about — always re-locate the exact sentence rather than relying on memory.",
        "Choosing an answer that reverses a stated direction or relationship (before/after, increase/decrease) from the text.",
        "Choosing an answer that sounds plausible and passage-adjacent but isn't actually stated anywhere in the text — explicit detail questions never require outside inference.",
      ],
    },
    {
      name: "Function of a Specific Detail",
      explanation:
        "These questions zoom in on one detail — a statistic, an example, a quotation — and ask what job it's doing for the passage's larger claim. You're not summarizing the whole passage here; you're explaining why this one piece of evidence was included. First, find the specific claim the detail is attached to (usually the sentence right before or after it). Then check whether the answer choice correctly describes the detail's relationship to that claim — does it support it, complicate it, or offer a contrasting case? Don't just pick the choice that restates what the detail says.",
      examples: [
        {
          prompt:
            "A passage argues that a mentorship program reduced high school dropout rates, then states: 'In the program's pilot neighborhood, dropout rates fell from 22% to 4% over three years, a decline not observed in demographically similar neighborhoods without the program.'",
          walkthrough:
            "Step 1: What claim does this detail attach to? The program's effectiveness. Step 2: What does the detail actually do, logically? It doesn't just describe a decline — it compares the pilot neighborhood to similar neighborhoods without the program, which rules out the alternative explanation that the decline was just a broader regional trend. Step 3: The correct answer choice should mention this comparative, evidence-strengthening function specifically, not just 'it shows dropout rates went down.'",
          answer:
            "The detail functions to rule out an alternative explanation (a general regional trend) by comparing the pilot area to similar areas without the program, strengthening the causal claim about the program's effect.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage argues that a new traffic law reduced pedestrian injuries, then adds: 'In the two neighboring towns that later adopted similar crosswalk timing rules, injury rates fell by a comparable margin within a year.'",
          walkthrough:
            "Step 1: What claim is this attached to? That the traffic law reduced pedestrian injuries. Step 2: What is this detail actually doing? It's not just repeating the original town's numbers — it shows the same pattern showing up again, independently, in two other towns after they adopted the rule. Step 3: That's a different job than the pilot-neighborhood example above: instead of ruling out another cause in one place, this detail shows the effect wasn't a one-time fluke tied to a single town, which strengthens the claim in a different way.",
          answer:
            "The detail functions to show the effect reproduced independently in other towns, strengthening the claim by showing it wasn't a one-off result specific to a single location.",
          difficulty: "medium",
        },
        {
          prompt:
            "A passage argues that a company's new onboarding program improved employee retention, then adds: 'Departments that delayed adopting the new process the longest also had the highest turnover during that period — though those same departments already had reputations for higher-than-average turnover before the program existed.'",
          walkthrough:
            "Step 1: The claim being tested: the new onboarding process improved retention. Step 2: At first glance, the detail (longer delay, higher turnover) looks like it supports that claim. But the passage adds a wrinkle: those exact departments already had a turnover problem before the program even started. Step 3: That wrinkle means the detail doesn't cleanly support the claim — its real function is to flag a complication, since the departments' pre-existing reputation offers another possible explanation for their high turnover.",
          answer:
            "The detail's function is to acknowledge a complication in the evidence, not to straightforwardly support the retention claim, since the passage itself notes those departments already had elevated turnover before the program existed.",
          difficulty: "hard",
        },
        {
          prompt:
            "A passage argues that a new crosswalk signal reduced pedestrian wait times, then states: 'At the intersection where the signal was installed, average pedestrian wait time fell from 45 seconds to 18 seconds.'",
          walkthrough:
            "Step 1: What claim is this attached to? That the new signal reduced wait times. Step 2: What does the detail do? It gives specific before-and-after numbers for exactly the claim being made — no comparison group, no complication, just a direct measurement. Step 3: Its function is the most straightforward kind: it measures the claimed outcome (wait time) at the exact location the change occurred.",
          answer:
            "The detail functions as direct evidence for the claim — it measures the exact outcome (wait time) the claim is about, at the exact location the change occurred.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage argues that a particular bird species shows unusually flexible migration behavior, then states: 'One tagged individual, expected to winter in the species' usual coastal range, instead traveled over 600 miles inland after unseasonable storms altered food availability.'",
          walkthrough:
            "Step 1: What claim is this attached to? That the species' migration is unusually flexible. Step 2: What does the detail do? It isn't a statistic or a comparison group — it's one vivid, specific case that makes the abstract claim ('flexible migration') concrete and easy to picture. Step 3: This illustrating function is different from ruling out alternatives or showing an effect replicated elsewhere: it simply makes a general claim tangible through one specific example.",
          answer:
            "The detail functions to illustrate the abstract claim (flexible migration) with one concrete case, making the general claim easier to grasp rather than adding statistical or comparative support.",
          difficulty: "medium",
        },
        {
          prompt:
            "A passage makes two separate claims about a company's remote-work policy — that it boosted productivity, and that it improved employee retention — then states: 'Survey responses showed that 72% of remote employees cited flexible scheduling, not the ability to skip a commute, as the policy's most valued feature.'",
          walkthrough:
            "Step 1: This passage has two different claims — first identify which one this detail is actually attached to, not just the general topic (remote work). Step 2: The detail describes what employees VALUE about the policy, which speaks to why they'd want to keep the job — that's closer to the retention claim than to a direct productivity measurement. Step 3: A common mistake is assuming any work-policy detail supports whichever claim comes to mind first (productivity); this detail's specific content (what employees value) ties it to retention instead.",
          answer:
            "The detail functions to support the retention claim specifically, since it explains what employees value about the policy — not the productivity claim, even though both claims involve the same policy.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Picking an answer that just paraphrases the detail's content ('dropout rates decreased') instead of describing its function (why it was included).",
        "Missing the comparison built into the detail (pilot vs. similar neighborhoods), which is often the entire point of the evidence.",
        "Assuming a detail always 'supports' the main claim when sometimes it's included specifically to acknowledge a limitation or complication.",
      ],
    },
  ],
  tipsAndTricks: [
    "Before reading answer choices, try to state the main idea in your own words in under 10 words. If none of the choices match your version, re-read the passage's last two sentences — conclusions often carry the thesis.",
    "For 'detail' questions, always re-locate the sentence in the passage rather than relying on memory — SAT wrong answers are specifically designed to sound like things the passage 'probably' said.",
    "If two answer choices seem both partially true, the correct one is usually the one that connects to the passage's actual argument, not just its topic.",
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
          prompt:
            "Claim: 'Urban tree cover reduces summer energy costs.' Which choice best supports this?",
          walkthrough:
            "Step 1: Identify what would actually prove this claim — a direct link between tree cover and energy costs, ideally with numbers. Step 2: Scan choices for a specific comparison. 'Trees are common in residential areas' is true but proves nothing about energy costs. 'Neighborhoods with over 30% tree canopy showed 20% lower average summer electricity bills' directly measures the claimed relationship.",
          answer:
            "The quantitative comparison (tree canopy percentage tied to a specific electricity bill reduction) is correct because it directly measures the claimed relationship, not just the topic.",
          difficulty: "easy",
        },
        {
          prompt:
            "Claim: 'A new bike lane network reduced downtown traffic congestion.' Which choice best supports this?",
          walkthrough:
            "Step 1: Figure out what would actually prove this — a number about congestion (like commute times or traffic volume) tied to the bike lanes. Step 2: A choice like 'the city spent $12 million building the bike lane network' is a real, specific number, and it sounds impressive — but it measures cost, not congestion, so it doesn't touch the actual claim at all. Step 3: A choice like 'average downtown commute times fell 15% in the two years after the bike lanes were completed' directly measures the outcome the claim is about.",
          answer:
            "The commute-time statistic is correct because it directly measures the claimed outcome (congestion); the cost figure is specific and real but measures something the claim never mentions.",
          difficulty: "medium",
        },
        {
          prompt:
            "Claim: 'A public awareness campaign decreased littering in city parks.' Which choice best supports this?",
          walkthrough:
            "Step 1: The claim is specifically about litter going down — not about parks in general. Step 2: A choice like 'park attendance increased by 30% during the campaign's first year' is tempting: it's specific, it's about the same parks and campaign, and 'increased' sounds like good news. But it says nothing about litter, and more visitors could just as easily mean more litter, not less. Step 3: A choice like 'weekly litter counts in the campaigned parks fell from an average of 40 items to 11 items over the same year' is the only one that measures both the right variable (litter) and the right direction (a decrease).",
          answer:
            "The litter-count figure is correct because it directly measures the claimed variable in the claimed direction; the attendance figure is specific and campaign-related but doesn't measure litter, and its 'increase' doesn't match the claim's direction at all.",
          difficulty: "hard",
        },
        {
          prompt:
            "Claim: 'A new office lighting system reduced employee eye strain complaints.' Which choice best supports this?",
          walkthrough:
            "Step 1: Figure out what would prove this — a number tied specifically to eye strain complaints. Step 2: A choice like 'the lighting system uses LED bulbs, which are common in modern offices' is true and topic-related, but it's generic — it says nothing about complaints going down. Step 3: A choice like 'eye strain complaints dropped from 22 per month to 6 per month after installation' directly measures the claimed outcome.",
          answer:
            "The complaint-count comparison is correct because it directly measures the claimed outcome; the LED-bulb fact is true but generic and proves nothing about eye strain specifically.",
          difficulty: "easy",
        },
        {
          prompt:
            "Claim: 'A city's new streetlight upgrade reduced nighttime traffic accidents.' Which choice best supports this?",
          walkthrough:
            "Step 1: Identify what would actually prove this — a number about accidents, not about the lights themselves. Step 2: A choice like 'the city installed 1,200 new LED streetlights across 40 miles of road' sounds impressive and is specific and real, but it measures the scope of installation, not accidents. Step 3: A choice like 'nighttime accidents in the upgraded areas fell from an average of 14 per month to 9 per month in the year after installation' directly measures the claim.",
          answer:
            "The accident-count comparison is correct because it directly measures the claimed outcome (nighttime accidents); the installation-scale figure is specific but measures something the claim never mentions.",
          difficulty: "medium",
        },
        {
          prompt:
            "Claim: 'A public health campaign increased vaccination rates among teenagers.' Which choice best supports this?",
          walkthrough:
            "Step 1: The claim is about an increase caused by the campaign specifically after it launched. Step 2: A choice like 'in the year before the campaign launched, vaccination rates among teenagers had already been declining for three consecutive years' is tempting — it's specific and about the exact topic (teen vaccination) — but it describes the opposite direction, before the campaign even started, so it can't support a claim about the campaign's effect. Step 3: A choice like 'teen vaccination rates rose from 61% to 78% in the twelve months following the campaign's launch' is the only one measuring the right variable, in the right direction, during the right time period.",
          answer:
            "The post-campaign rate increase is correct because it measures the claimed effect in the right direction during the right time period; the pre-campaign decline figure is real and topic-related but describes the opposite trend before the campaign even started.",
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
          prompt:
            "Claim: 'A city's new bike-share program reduced short-distance car trips.' Which choice best supports this?",
          walkthrough:
            "Step 1: Notice the causal claim — reduced *because of* the program, not just 'car trips went down around the same time.' Step 2: The strongest evidence would isolate the program's effect from other possible causes (gas prices, weather, etc.). Step 3: A choice showing 'traffic sensor data showed a 12% drop in car trips under two miles within the program's first year' is good, but even stronger would be evidence showing this pattern didn't occur in similar cities without the program.",
          answer:
            "Direct measurement of the specific outcome (short car trips) during the program's timeline is the strongest available evidence, especially if paired with a comparison ruling out other causes.",
          difficulty: "easy",
        },
        {
          prompt:
            "Claim: 'A factory's new safety training program reduced workplace injuries.' Which choice best supports this?",
          walkthrough:
            "Step 1: Notice the causal claim again — reduced because of the training, not just that injuries happened to drop around the same time. Step 2: The strongest evidence would separate the training's effect from other possible causes, like a slower production period needing less equipment use. Step 3: A choice showing 'injury rates fell 18% at the factory after training began, while a similar sister factory that didn't adopt the training saw no meaningful change over the same period' directly compares against a similar case without the program, which rules out an explanation like a company-wide slowdown.",
          answer:
            "The comparison to a similar factory without the training is strongest, because it rules out other explanations — like a slow season affecting the whole company — that could otherwise explain the drop on their own.",
          difficulty: "medium",
        },
        {
          prompt:
            "Claim: 'A community garden program reduced grocery spending among participating families.' Which choice best supports this?",
          walkthrough:
            "Step 1: Notice the causal claim — reduced because families joined, not just 'spending went down around the same time.' Step 2: The strongest evidence isolates the program's effect using a comparison group of similar families who didn't join. Step 3: A choice like 'participating families' grocery receipts, tracked before and after joining, showed a decline not seen in a comparison group of similar families who didn't join' is stronger than a choice that only reports the decline among participants alone, since it rules out general food-price trends as the real cause.",
          answer:
            "The comparison-group evidence is strongest because it rules out other explanations (like general food-price trends) that could explain the decline on their own.",
          difficulty: "easy",
        },
        {
          prompt:
            "Claim: 'A workplace mentorship program increased promotion rates among mentees.' Which choice best supports this?",
          walkthrough:
            "Step 1: Notice the causal claim — increased because of mentorship, not because mentees were simply more ambitious to begin with. Step 2: The strongest comparison group needs to share that same ambition level, so it can't just be 'employees who never applied.' Step 3: A choice like 'employees who participated in the mentorship program were promoted at twice the rate of a comparable group of employees who applied but weren't matched with a mentor due to limited mentor availability' controls for ambition, since everyone in both groups applied — only the matching was random.",
          answer:
            "The comparison to equally motivated employees who applied but weren't matched (due to limited availability, not lack of interest) is strongest, because it rules out the alternative explanation that mentees were simply more ambitious to begin with.",
          difficulty: "medium",
        },
        {
          prompt:
            "Claim: 'A four-day work week caused a rise in employee output per hour.' Which choice best supports this?",
          walkthrough:
            "Step 1: The claim is specifically about output per hour, caused by the schedule change. Step 2: A choice like 'a survey of employees found that 85% reported feeling less stressed after the switch to a four-day week' is tempting — it's plausible, and less stress could plausibly raise output — but it never actually measures output, so it doesn't directly support the specific causal claim being tested. Step 3: A choice like 'output per hour at the company rose after the switch, while output per hour at a similar company in the same industry that kept a five-day week stayed flat over the same period' directly measures output and rules out industry-wide trends as the real cause.",
          answer:
            "The similar-company comparison is strongest because it directly measures output (the claimed outcome) while ruling out industry-wide trends as an alternative explanation; the stress-survey choice is plausible-sounding but never actually measures the outcome the claim is about.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Accepting correlation-only evidence for a causation claim without checking if alternative causes are addressed.",
        "Missing that the strongest evidence choice will often specifically reference a comparison group or a 'before vs. after' structure.",
      ],
    },
    {
      name: "Selecting the Best Illustrative Quotation",
      explanation:
        "This Command of Evidence pattern applies to literary texts. You're given a claim about a character's feeling, an author's style, or a story's theme, and asked which quotation best illustrates it. There's no data to weigh here. Instead: figure out exactly what quality or emotion the claim names, then find the quotation that embodies that specific quality — not just one that mentions the same character or scene.",
      examples: [
        {
          prompt:
            "A short story states that a young sailor feels profound relief upon finally spotting land after weeks lost at sea. Which quotation from the story most effectively illustrates this claim?",
          walkthrough:
            "Step 1: Identify exactly what the claim names — relief, specifically after a long ordeal. Step 2: A line like 'The gulls circled twice before he even trusted his own eyes' shows disbelief and tension, not relief. A line like 'His knees buckled and he laughed, a short broken sound, as the shoreline steadied into something real' shows the physical release of built-up tension — a strong match for relief. Step 3: Choose the quotation showing the emotional release itself, not just a neutral description of spotting land.",
          answer:
            "The quotation describing his knees buckling and a released, broken laugh best illustrates relief — it shows the physical release of tension, not just the neutral fact of seeing land.",
          difficulty: "easy",
        },
        {
          prompt:
            "A novel states that a seamstress feels quiet pride in a dress she has just finished. Which quotation most effectively illustrates this claim?",
          walkthrough:
            "Step 1: The claim names a specific, understated emotion — quiet pride, not loud celebration. Step 2: A line like 'She held it up to the window and said nothing for a long moment, smoothing one seam with her thumb' shows restrained, private satisfaction, matching 'quiet.' A line like 'She announced to the whole shop that it was the finest dress she had ever made' shows pride, but loudly — it doesn't match the claim's specific wording. Step 3: Choose the quotation whose tone matches the claim's specific word ('quiet'), not just its general topic (pride).",
          answer:
            "The quotation showing her silently smoothing the seam by the window best illustrates 'quiet pride' — its restrained, private tone matches the claim's specific wording, unlike a louder announcement of pride.",
          difficulty: "easy",
        },
        {
          prompt:
            "A short story states that a man feels a growing sense of unease about a business decision he has already made. Which quotation most effectively illustrates this claim?",
          walkthrough:
            "Step 1: The claim specifies growing unease about something already decided — not doubt before deciding. Step 2: A line like 'He hesitated for a moment before signing, pen hovering over the page' shows doubt BEFORE the decision — the wrong timing. A line like 'Each time the phone rang that week, he was certain it would be the call undoing everything' shows unease that persists and builds AFTER the decision — matching both the emotion and its timing. Step 3: Choose the quotation matching both the feeling and its specific position in the timeline.",
          answer:
            "The quotation about dreading each phone call that week best illustrates growing post-decision unease — the hesitation-before-signing quotation shows doubt at the wrong point in the timeline.",
          difficulty: "medium",
        },
        {
          prompt:
            "A poem is said to convey grief through concrete, sensory imagery rather than abstract description. Which quotation from the poem most effectively illustrates this claim?",
          walkthrough:
            "Step 1: The claim specifies HOW grief is conveyed — through sensory detail, not by naming the emotion directly. Step 2: A line like 'Grief is a heavy and unbearable thing' states the emotion abstractly — it names grief but uses no sensory imagery, so it doesn't match the claim's specific technique. A line like 'The coat still hung by the door, and I could not make myself move it' conveys grief through a concrete, physical detail without ever naming the emotion — this matches the claim precisely. Step 3: Choose the quotation matching the specific literary technique named in the claim, not just one that's generally sad.",
          answer:
            "The quotation about the coat still hanging by the door best illustrates the claim, since it conveys grief through concrete sensory detail rather than stating the emotion abstractly.",
          difficulty: "medium",
        },
        {
          prompt:
            "A novel states that a character maintains an outward appearance of composure even while privately furious during a tense meeting. Which quotation most effectively illustrates this claim?",
          walkthrough:
            "Step 1: The claim requires BOTH halves at once — outward composure AND private anger underneath. Step 2: A line like 'She slammed the folder shut and stormed out of the room' shows anger, but openly, which actually contradicts the 'outward composure' half of the claim. A line like 'She thanked the committee calmly, her voice even, while her hand, hidden beneath the table, was clenched so tightly her knuckles had gone white' shows both halves simultaneously: calm on the surface, fury concealed beneath it. Step 3: Reject the more dramatic, obviously-angry quotation in favor of the quieter one that actually satisfies both parts of the claim.",
          answer:
            "The quotation describing her calm voice and hidden, clenched hand best illustrates the claim, since it shows both the outward composure and the concealed anger at once — the 'slammed the folder' quotation shows anger but not the required mask of composure over it.",
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
      name: "Evaluating a Hypothetical Finding's Support for a Claim",
      explanation:
        "These questions describe a hypothesis or claim, then ask which new fact — one not already in the passage — would most strengthen it (sometimes, most weaken it). There's no graph to read, and none of the choices are real quotes; they're all hypothetical findings you're judging for logical fit. The method: turn the hypothesis into a prediction ('if this is true, we'd expect to see ___'), then pick the choice that matches that prediction exactly. For a 'weaken' question, pick the choice that reports the opposite.",
      examples: [
        {
          prompt:
            "Researchers hypothesize that a species of beetle locates rotting fruit primarily by scent rather than by sight. Which finding, if true, would most strongly support this hypothesis?",
          walkthrough:
            "Step 1: Turn the hypothesis into a prediction: if it's true, blocking the beetles' sense of smell should stop them from finding fruit, while blocking their vision shouldn't matter much. Step 2: A finding that beetles with their sense of smell experimentally blocked took far longer to locate fruit than beetles with their vision blocked matches that exact prediction. Step 3: A finding about fruit color or daylight brightness tests sight, not smell, and wouldn't specifically confirm the 'scent, not sight' claim either way.",
          answer:
            "The finding that scent-blocked beetles struggled to locate fruit while sight-blocked beetles did not most strongly supports the hypothesis, since it matches the predicted outcome exactly.",
          difficulty: "easy",
        },
        {
          prompt:
            "A transportation researcher claims that a city's new rapid-transit line reduced the number of people driving downtown for work. Which finding, if true, would most strongly support this claim?",
          walkthrough:
            "Step 1: The predicted effect is fewer downtown drivers after the line opened. Step 2: A finding that downtown parking permit purchases dropped significantly in the months after the line opened directly reports that predicted drop. Step 3: A finding about how many people ride the line overall doesn't by itself show driving went down — riders could simply be new commuters who never drove, so it doesn't confirm the specific claim about reduced driving.",
          answer:
            "The drop in downtown parking permit purchases after the line opened most strongly supports the claim, since it directly reports the predicted decrease in driving.",
          difficulty: "easy",
        },
        {
          prompt:
            "A psychologist hypothesizes that background music containing lyrics impairs reading comprehension more than instrumental music does. Which finding, if true, would most strongly support this hypothesis?",
          walkthrough:
            "Step 1: The prediction is a specific comparison: comprehension should be lower with lyrical music than with instrumental music, all else being equal. Step 2: A finding that participants scored lower on reading tests while lyrical music played than while instrumental music played at the same volume matches that exact comparison. Step 3: A finding that participants generally read less when any music was playing, without distinguishing lyrical from instrumental, doesn't test the specific comparison the hypothesis makes.",
          answer:
            "Lower test scores during lyrical-music trials than during instrumental-music trials (volume held constant) most strongly supports the hypothesis, since it isolates the lyrics-versus-no-lyrics comparison the claim depends on.",
          difficulty: "medium",
        },
        {
          prompt:
            "An archaeologist proposes that an ancient trade network extended much farther than previously believed, based on a distinctive pottery style found at a distant site. Which finding, if true, would most strongly support this proposal?",
          walkthrough:
            "Step 1: The proposal's weak point is that the distant pottery could have been made locally by potters who simply copied the style, without any actual trade occurring. Step 2: A finding that chemical analysis shows the distant pottery's clay matches a mineral source found only in the original region rules out local imitation, since the physical material itself must have traveled. Step 3: A finding that the two regions' pottery looks similar doesn't add anything beyond what's already known — the passage already establishes the styles match.",
          answer:
            "The clay-source chemical match most strongly supports the proposal, since it rules out the main alternative explanation (local imitation) rather than just restating the stylistic similarity already given.",
          difficulty: "medium",
        },
        {
          prompt:
            "A biologist hypothesizes that a particular enzyme causes faster wound healing in a species of fish. Which finding, if true, would most strongly support this hypothesis?",
          walkthrough:
            "Step 1: A hypothesis using 'causes' needs evidence that isolates the enzyme as the cause, not just evidence that the enzyme and fast healing tend to occur together. Step 2: A finding that fish naturally carrying more of the enzyme heal faster than fish with less of it is only a correlation — some other trait shared by high-enzyme fish could be the real cause. Step 3: A finding that fish given an experimental injection of the enzyme healed faster than untreated fish, with all other conditions matched, directly tests cause and effect by controlling everything except the enzyme itself.",
          answer:
            "The controlled-injection finding most strongly supports the hypothesis, since it isolates the enzyme as the one difference between the two groups — the natural-variation finding is only a correlation and could have another explanation.",
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
          prompt:
            "'The lab's results contradicted decades of prior research, so the team knew their next step would have to be ______.'",
          walkthrough:
            "Step 1: What does 'contradicted decades of prior research' imply about the reliability of this new, surprising result? It means the result is unusual and needs verification before being trusted. Step 2: What is the standard, logical next step in scientific practice when a surprising result appears? Replication — checking if the result holds up. Step 3: Reject dramatic options ('abandoning the field') since nothing in the text supports such an extreme reaction to one surprising result.",
          answer:
            "Replicating the experiment to confirm the surprising result follows logically and conservatively from a single contradictory finding.",
          difficulty: "easy",
        },
        {
          prompt:
            "'The bridge inspectors found hairline cracks in three support beams that hadn't been present during the previous year's inspection, so the city announced that the bridge would need to ______.'",
          walkthrough:
            "Step 1: What does finding new cracks in support beams imply? That something changed for the worse since last year, in a structurally important part of the bridge. Step 2: What's the standard, cautious next step when new damage like this is found? Closer inspection and repair — not necessarily a dramatic action. Step 3: Reject a completion like 'be demolished immediately' — three hairline cracks are concerning, but concluding the entire bridge must come down is a bigger leap than the text actually supports.",
          answer:
            "Undergoing repairs or further inspection follows logically and conservatively from newly found cracks — 'demolished' goes further than the text supports.",
          difficulty: "medium",
        },
        {
          prompt:
            "'The recipe had never failed before, so when the cake collapsed in the oven, the baker assumed the problem was most likely ______.'",
          walkthrough:
            "Step 1: 'Had never failed before' implies the recipe itself is generally reliable, so a cautious first explanation points to something specific to this attempt, not the recipe's design. Step 2: Standard troubleshooting logic starts with the most immediate variable — oven temperature, a mismeasured ingredient — not a rewrite of the whole recipe. Step 3: Reject a completion like 'the recipe itself was flawed,' since that directly contradicts 'had never failed before.'",
          answer:
            "A specific error in this attempt (like oven temperature) follows logically, since 'had never failed before' rules out blaming the recipe's basic design.",
          difficulty: "easy",
        },
        {
          prompt:
            "'The new bridge design used 40% less steel than the previous model while passing every load test, so engineers concluded that ______.'",
          walkthrough:
            "Step 1: What does using less steel while passing every load test actually establish? That this design achieves comparable strength with less material — nothing more. Step 2: Reject a dramatic completion like 'steel-free bridges are now possible' (far beyond what one reduction shows) or 'this design should replace all older bridges immediately' (a policy leap the data doesn't support). Step 3: The correct completion stays close to what's shown: comparable strength, less material.",
          answer:
            "The design achieved comparable structural strength using less material follows conservatively; leaping to 'steel is no longer needed' or a sweeping replacement policy goes beyond what one successful test demonstrates.",
          difficulty: "medium",
        },
        {
          prompt:
            "'Despite requiring twice the initial investment, the new water filtration system removed contaminants at a rate the older systems could never approach, so the utility company reasoned that ______.'",
          walkthrough:
            "Step 1: What's actually established — a costlier system that performs much better at contaminant removal. Step 2: A tempting completion says all future systems should switch to this method regardless of cost — but nothing in the text supports ignoring cost everywhere, only that the tradeoff might be worth it where the performance gain specifically matters. Step 3: The conservative completion limits the conclusion to situations where the specific benefit (superior removal) justifies the specific cost, not a blanket policy.",
          answer:
            "The utility company most likely concluded the higher cost could be justified specifically where superior contaminant removal is especially needed — a blanket 'always use this system' completion ignores the stated cost tradeoff.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Choosing the most dramatic or interesting-sounding completion rather than the most logically necessary one.",
        "Choosing an answer that requires assuming something not stated (e.g., that the lab has unlimited funding, or that other labs already tried to replicate it).",
      ],
    },
    {
      name: "What Can Be Reasonably Concluded",
      explanation:
        "This pattern gives you a full passage — not a fill-in-the-blank — and asks what can be 'most reasonably inferred' from it. The trap is overreaching: turning one small observation into a sweeping general claim. The correct answer is usually the narrowest inference the text actually supports — about the specific case described, not the whole category it belongs to.",
      examples: [
        {
          prompt:
            "A text states that a species thought extinct was recently photographed in a remote forest.",
          walkthrough:
            "Step 1: What does the photograph directly prove? That the species survived, at least in that specific forest. Step 2: What would be an overreach? Concluding that the species is thriving everywhere, or that all 'extinct' species will eventually reappear — neither is supported by one photograph in one location. Step 3: The correct inference stays narrow: the species persisted in that specific region.",
          answer:
            "The most reasonable, narrow inference is that the species survived specifically in that forest — not a broader claim about the species' status everywhere or about extinct species in general.",
          difficulty: "easy",
        },
        {
          prompt:
            "A text states that a small business began offering online ordering during a period when in-person sales were down, and that its total revenue grew over the following year.",
          walkthrough:
            "Step 1: What does the text directly establish? That online ordering was added, and that total revenue grew over the following year. Step 2: What would be an overreach? Concluding that online ordering alone caused the growth — the text never rules out other explanations, like the in-person slump simply ending on its own. Step 3: The most reasonable inference stays close to what's stated: revenue grew during a period that included the change, not that the change was definitely the cause.",
          answer:
            "The most reasonable inference is that the business's revenue grew during the same period it introduced online ordering — concluding that online ordering directly caused the growth goes beyond what the text supports.",
          difficulty: "medium",
        },
        {
          prompt:
            "A text states that a museum's newly acquired painting was examined by conservators and found to contain pigments not commercially available until the 1850s.",
          walkthrough:
            "Step 1: What does this directly establish? That the painting, or at least its pigments, dates to no earlier than the 1850s. Step 2: Overreach would be concluding the exact artist, the painting's precise date, or that the whole painting is a forgery — none of these follow from a pigment date alone. Step 3: The correct, narrow inference stays limited to what the pigment evidence shows: the painting can't be older than the 1850s.",
          answer:
            "The most reasonable, narrow inference is that the painting was created no earlier than the 1850s — not a claim about who painted it, its exact date, or whether it's authentic overall.",
          difficulty: "easy",
        },
        {
          prompt:
            "A text states that a city's downtown parking garage began charging a small overnight fee at the same time that overnight street parking violations rose by 30%.",
          walkthrough:
            "Step 1: What does the text directly establish? A new fee and a rise in street violations occurring around the same time. Step 2: Overreach would be flatly concluding the fee CAUSED the rise — that requires ruling out other explanations, which the text doesn't do. Step 3: The most reasonable inference, without assuming causation, is narrower: some drivers appear to have shifted from the garage to the street around the same time.",
          answer:
            "The most reasonable inference is that some drivers shifted from the garage to street parking around the same time the fee began — asserting the fee definitely 'caused' the violation increase goes beyond what a simple timing coincidence supports.",
          difficulty: "medium",
        },
        {
          prompt:
            "A text states that a species of frog thought to communicate only through croaking was recently observed producing calls at frequencies too high for human hearing, detected only with specialized equipment, at three separate wetland sites.",
          walkthrough:
            "Step 1: What's directly established — one species, observed at three specific sites, producing previously undetected high-frequency calls. Step 2: A tempting overreach generalizes to ALL frog species — nothing in the text supports extending findings about one species to the entire category. Step 3: The conservative inference stays narrow: this specific species, not frogs generally, has more complex communication than assumed, at least at the studied sites.",
          answer:
            "The most reasonable, narrow inference is that this specific frog species' communication is more complex than previously understood — extending the finding to all frog species would be an unsupported generalization from a single species.",
          difficulty: "hard",
        },
      ],
      traps: [
        "Generalizing a specific, local finding into a universal claim ('this proves all X do Y').",
        "Choosing an answer that would require additional, unstated information to be true.",
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
          prompt: "'The committee's ______ approach to spending drew criticism from departments hoping for expanded budgets.'",
          walkthrough:
            "Step 1: Predict your own word: something like 'strict' or 'tight-fisted,' since departments wanted more money and are unhappy. Step 2: Compare to choices like 'austere,' 'generous,' 'confusing,' 'enthusiastic.' Step 3: 'Generous' is the opposite of what's needed (departments wouldn't be upset by generosity). 'Austere' matches your predicted meaning of strict/minimal spending.",
          answer: "'Austere' is correct because it precisely matches strict, minimal spending — consistent with departments being unhappy about it.",
          difficulty: "easy",
        },
        {
          prompt: "'The negotiator's ______ tone put both sides at ease during an otherwise tense meeting.'",
          walkthrough:
            "Step 1: Predict your own word first: something like 'calming' or 'soothing,' since the tone is what put both sides at ease. Step 2: Compare to choices like 'diplomatic' and 'conciliatory.' 'Diplomatic' just means tactful — a diplomatic tone could still leave real tension in the room. 'Conciliatory' specifically means aimed at reducing conflict, which is the actual effect the sentence describes. Step 3: Pick the word that matches the stated effect (tension eased), not the word that just sounds generally positive.",
          answer: "'Conciliatory' is correct because it precisely matches a tone aimed at reducing tension — 'diplomatic' is close, but doesn't guarantee that calming effect.",
          difficulty: "medium",
        },
        {
          prompt: "'The professor's ______ feedback left little room for misinterpretation, since every point was stated in exact, unambiguous terms.'",
          walkthrough:
            "Step 1: Predict your own word: something like 'clear' or 'precise,' since the feedback left no room for misinterpretation. Step 2: Compare to choices like 'explicit,' 'brief,' 'harsh,' 'generous.' 'Brief' only describes length — short feedback could still be vague, so it doesn't guarantee the described precision. Step 3: 'Explicit' precisely matches 'stated in exact, unambiguous terms.'",
          answer: "'Explicit' is correct because it precisely matches stated, unambiguous clarity — 'brief' only describes length, which doesn't guarantee that precision.",
          difficulty: "easy",
        },
        {
          prompt: "'Rather than adopting the committee's plan outright, the director chose to ______ several of its individual provisions, discarding the rest.'",
          walkthrough:
            "Step 1: Predict your own word: something like 'keep only some parts of,' since the plan wasn't adopted outright and the rest was discarded. Step 2: Compare to choices like 'salvage,' 'endorse,' 'ratify,' 'overturn.' 'Endorse' and 'ratify' both imply approving something as a whole, which doesn't match 'several... provisions' being kept while 'the rest' is discarded. 'Overturn' means to reject — the opposite direction. Step 3: 'Salvage' precisely captures retaining select useful parts from something otherwise not adopted.",
          answer: "'Salvage' is correct because it precisely captures retaining only select useful parts of a larger plan — 'endorse' and 'ratify' both wrongly imply approving the plan as a whole.",
          difficulty: "medium",
        },
        {
          prompt: "'Though the panel's final report was ______ in its criticism of the agency's oversight failures, it stopped short of recommending anyone's removal.' (Context: earlier sentences establish the report was detailed and thorough in cataloguing the failures, not necessarily harsh in tone.)",
          walkthrough:
            "Step 1: Predict your own word: something like 'thorough' or 'detailed,' since the context specifies the report cataloged failures thoroughly, not necessarily with a harsh tone. Step 2: 'Scathing' is a very tempting choice, since it also describes strong criticism — but it specifically implies a harsh, biting TONE, which the context never establishes. Step 3: 'Exhaustive' matches the specific quality described (thorough coverage) without importing an assumption about tone the sentence doesn't support.",
          answer: "'Exhaustive' is correct because it matches the report's thoroughness specifically, without assuming the harsh tone that 'scathing' — a very tempting near-synonym — would imply but that the context never establishes.",
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
          prompt: "'Her argument, while ______, ultimately failed to address the panel's central concern.' (Context: earlier sentences describe the argument as brief and to the point, not lacking in quality.)",
          walkthrough:
            "Step 1: Notice that 'terse' has a common negative connotation (curt, rude) but here the context describes brevity, not rudeness. Step 2: If a choice like 'sound' (meaning valid/well-reasoned) is offered, recognize the less common meaning fits: the argument was logically sound but still didn't address the concern. Step 3: Reject a choice that only fits the more common meaning of a similar-looking word if it contradicts the sentence's actual logic.",
          answer: "The correct choice uses the word's secondary or less obvious meaning that logically fits the sentence, not the surface-level common meaning.",
          difficulty: "easy",
        },
        {
          prompt: "'The critic's review was surprisingly ______ for a film so widely praised elsewhere.' (Context: earlier sentences make clear the critic still recommended the film, but pointed out several real flaws.)",
          walkthrough:
            "Step 1: A word like 'qualified' most commonly means 'having the right skills or credentials' — a meaning that makes no sense next to 'review.' Step 2: Recall its less common meaning: 'qualified' can also mean held back by reservations, not fully unconditional (as in the phrase 'qualified praise'). Step 3: Since the critic still recommended the film but flagged real flaws, that secondary meaning — praise with reservations attached — fits precisely, while sentence-scanners who only know the 'credentials' meaning would likely skip right past it.",
          answer: "'Qualified' is correct in its secondary meaning — praise held back by reservations — matching a critic who recommended the film while still noting real flaws.",
          difficulty: "medium",
        },
        {
          prompt: "'Even her harshest critics conceded that the senator's closing argument was ______.' (Context: earlier text makes clear critics disagreed with her politics but admitted the speech itself was persuasive and well-built.)",
          walkthrough:
            "Step 1: The most familiar meaning of a word like 'arresting' has to do with police taking someone into custody — obviously not what a 'closing argument' can be. Step 2: Because the obvious meaning fails so completely, it's tempting to cross the word off entirely rather than check for another meaning. That's exactly the trap: 'arresting' also means strikingly impressive, attention-grabbing — with no connection to law enforcement at all. Step 3: Since even critics who disagreed with her still admitted the argument was persuasive and well-constructed, 'arresting' in this second sense fits precisely.",
          answer: "'Arresting' is correct in its secondary sense of strikingly impressive — its far more common meaning doesn't fit here at all, which is exactly why this word is easy to wrongly dismiss.",
          difficulty: "hard",
        },
        {
          prompt: "'The committee's decision to postpone the vote was widely seen as a ______ move, buying time until public opinion shifted.' (Context: nothing in the passage suggests the move was morally wrong — only strategic.)",
          walkthrough:
            "Step 1: A word like 'politic' looks like it just means 'related to politics' at first glance, especially in a sentence already about a committee vote. Step 2: But 'politic' used this way actually has a distinct, less common meaning: shrewd, sensible, strategically wise — which fits 'buying time until public opinion shifted' precisely. Step 3: Reject reading it as a simple synonym for 'political' just because of the shared root and political-sounding context.",
          answer: "'Politic' is correct in its less common meaning — shrewd or strategically wise — which fits 'buying time' precisely; it's easy to misread as just meaning 'political' because of the shared root.",
          difficulty: "easy",
        },
        {
          prompt: "'The chef's ______ palate could distinguish a dish seasoned moments ago from one that had rested for ten minutes.' (Context: describes exceptional sensory precision, not a specific food preference.)",
          walkthrough:
            "Step 1: A word like 'discriminating' most commonly triggers today's association with unfair bias — but that meaning doesn't fit a sentence about tasting food. Step 2: Recall its older, still-valid meaning: having refined judgment, able to make fine distinctions — exactly matching a palate that can tell moments-ago seasoning from ten-minutes-rested seasoning. Step 3: Reject the modern 'biased' connotation, since nothing in the sentence involves unfair treatment of anything.",
          answer: "'Discriminating' is correct in its classic sense — capable of fine, refined judgment — which matches the chef's sensory precision; the modern 'biased' connotation doesn't fit this context at all.",
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
          prompt:
            "A passage argues that narrow city streets improve safety. Partway through, a sentence states: 'However, narrow streets without clear sightlines at intersections can actually increase collision risk.'",
          walkthrough:
            "Step 1: What would be missing if this sentence were deleted? The passage would seem to claim narrow streets are unconditionally safer, with no nuance. Step 2: This sentence's function is to complicate or qualify the main claim, not contradict it entirely — it adds a condition (sightlines) under which the benefit doesn't hold. Step 3: The correct function description should mention this qualifying role, not just restate the sentence's content about collisions.",
          answer: "The sentence functions to introduce a qualification that limits the scope of the main claim, rather than fully rejecting the earlier argument.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage explains a company's decision to switch entirely to remote work. Partway through, a sentence states: 'Not every employee benefited equally — those with young children at home often found the change added new stressors rather than removing old ones.'",
          walkthrough:
            "Step 1: What would be missing if this sentence were deleted? The passage would read as if the switch benefited everyone the same way, with no exceptions. Step 2: This sentence's job is to complicate that uniform picture by pointing out one specific group the change didn't help — it's not arguing the whole policy was a mistake. Step 3: The correct answer should describe this narrowing, exception-flagging role, not just restate the detail about children.",
          answer: "The sentence functions to complicate an otherwise uniformly positive account by noting the change didn't benefit every employee equally, without arguing the policy was wrong overall.",
          difficulty: "medium",
        },
        {
          prompt:
            "A passage describes a new bus rapid transit line. Partway through, a sentence states: 'The city funded the project using a combination of state grants and a small increase in the local sales tax.'",
          walkthrough:
            "Step 1: What would be missing if this sentence were deleted? The passage would describe the transit line without explaining how it was paid for. Step 2: This sentence's job is simply to supply funding-source information — a supporting detail, not a qualification or counterexample. Step 3: The correct answer should describe this detail-supplying function plainly, not treat it as complicating anything.",
          answer: "The sentence functions to explain how the project was financed, supplying a supporting detail about its funding sources.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage argues that a company's four-day work week improved morale. Partway through, a sentence states: 'Even the initiative's most vocal early critics now describe the schedule as a net positive for the company.'",
          walkthrough:
            "Step 1: What would be missing if deleted? The passage would argue morale improved but wouldn't address that some people opposed the change initially. Step 2: This sentence's function is to strengthen the argument by showing that even skeptics changed their minds — stronger support than simply repeating 'morale improved.' Step 3: The correct answer should name this specific persuasive function (a skeptic's view converting), not just restate that morale improved.",
          answer: "The sentence functions to strengthen the argument by showing that even initial skeptics now agree, which is stronger evidence than simply restating that morale improved.",
          difficulty: "medium",
        },
        {
          prompt:
            "A passage argues that a particular species of moth locates mates over long distances using scent, not sight. Partway through, a sentence states: 'In laboratory conditions with the moths' eyes temporarily covered, mate-location success rates remained statistically unchanged.'",
          walkthrough:
            "Step 1: What would be missing if deleted? The claim (scent, not sight) would remain an assertion without direct experimental support. Step 2: This sentence's function is not to complicate or qualify the claim — it provides the controlled experimental evidence that directly confirms it, by showing performance is unaffected when vision is removed. Step 3: Reject describing this as a 'complication' or 'counterexample,' which the setup (covering eyes) might suggest at first glance — it's actually the paragraph's strongest piece of direct support.",
          answer: "The sentence functions to provide direct experimental evidence supporting the main claim, by showing mate-location success is unaffected when vision is removed — confirming support, not a complication, even though the setup might read that way at first.",
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
          prompt:
            "The first paragraph of a biography describes the social norms of the era the subject lived in. The second paragraph returns to describing the subject's personal choices.",
          walkthrough:
            "Step 1: Ask why the author would pause the personal narrative to describe social norms. Step 2: This is a common structural move — providing context that helps explain constraints or pressures shaping the subject's later choices. Step 3: The correct function answer should mention this context-providing, explanatory role — not describe the historical content itself.",
          answer: "The paragraph functions to provide context that helps the reader understand the constraints shaping the subject's subsequent choices.",
          difficulty: "easy",
        },
        {
          prompt:
            "The first paragraph of an article describes, in technical detail, how a particular metal alloy is manufactured. The second paragraph shifts to describing how that alloy changed what was possible in the design of a well-known bridge.",
          walkthrough:
            "Step 1: Ask why the author would spend an entire paragraph on manufacturing detail before returning to the bridge itself. Step 2: This is a common structural move — laying groundwork that makes the later, more impressive claims about the bridge's design easier to understand and trust. Step 3: The correct function answer should mention this groundwork-laying role, not restate the manufacturing details themselves.",
          answer: "The paragraph functions to provide the technical background needed to understand and trust the design claims made about the bridge in the paragraph that follows.",
          difficulty: "medium",
        },
        {
          prompt:
            "The first paragraph of an article describes a common misconception about how a lightning rod protects a building. The second paragraph explains how a lightning rod actually works.",
          walkthrough:
            "Step 1: Why would an author open with a misconception before explaining the truth? Step 2: This is a common structural move — clearing away a wrong assumption first so the correct explanation that follows is easier to appreciate and contrast against. Step 3: The correct function answer should describe this 'clear the misconception, then explain' role, not just describe the lightning rod's mechanics.",
          answer: "The paragraph functions to present a common misconception, setting up a contrast with the accurate explanation that follows.",
          difficulty: "easy",
        },
        {
          prompt:
            "The first paragraph of an essay describes several artists who struggled financially throughout their careers despite later fame. The second paragraph focuses specifically on one such artist's decision to keep working despite years without a single sale.",
          walkthrough:
            "Step 1: Why zoom in on one specific case after a general survey? Step 2: This is a common structural move — narrowing from a general pattern to one detailed, illustrative case, which makes the broader claim more concrete and persuasive. Step 3: The correct answer should mention this narrowing-to-a-case function, not just describe the artist's biography.",
          answer: "The paragraph functions to narrow the essay's general claim into one specific, detailed case, making the broader pattern more concrete.",
          difficulty: "medium",
        },
        {
          prompt:
            "The first paragraph of a report presents a study's surprising finding: a widely used teaching method showed no measurable benefit. The second paragraph outlines three possible flaws in the study's methodology, without endorsing any of them as the actual explanation.",
          walkthrough:
            "Step 1: What would be missing if deleted? The surprising finding would stand unchallenged and unexamined. Step 2: The second paragraph's function isn't to disprove the finding — it explicitly doesn't endorse any of the three possible flaws as the real explanation. Its function is to introduce reasonable doubt while leaving the question open. Step 3: Reject describing this paragraph as 'refuting' or 'disproving' the study, which overstates what a non-committal list of possible flaws actually accomplishes.",
          answer: "The paragraph functions to raise possible limitations of the study without concluding any of them actually invalidate the finding — a more cautious, doubt-raising role than fully refuting the result.",
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
          prompt:
            "A passage opens by observing that many migratory bird species travel similar north-south routes each year. It then narrows to describe one species whose migration route instead loops in a wide, unusual circle. Which choice best describes the passage's overall structure?",
          walkthrough:
            "Step 1: Sketch the shape: general pattern first, then one specific case that stands out from it. Step 2: The case isn't just an example of the general pattern — it's presented as an exception to it, which is a slightly different, more specific relationship than plain illustration. Step 3: The correct choice should capture 'general pattern, then a specific exception to it,' not merely 'general claim, then an example of it.'",
          answer:
            "The passage first describes a general migratory pattern, then presents one species as a specific exception to that pattern.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage begins by summarizing the long-accepted account of how a particular bridge collapsed. It then describes a set of engineering records recently rediscovered that suggest a different, previously overlooked cause. Which choice best describes the passage's overall structure?",
          walkthrough:
            "Step 1: Sketch the shape: an established, conventional account comes first, then new evidence complicates it. Step 2: The passage doesn't say the old account was definitely wrong — only that the new records 'suggest' a different cause — so the correct choice shouldn't overstate this as a full refutation. Step 3: Look for a choice describing 'a conventional explanation, followed by newly surfaced evidence that complicates it,' matching both the sequence and the passage's cautious wording.",
          answer:
            "The passage presents the long-accepted explanation for an event, then introduces newly discovered evidence that complicates that explanation.",
          difficulty: "easy",
        },
        {
          prompt:
            "A passage opens by noting that a certain coral species survives water temperatures that should be lethal to it. It then walks through a series of lab experiments that eventually identify a heat-resistant protein as the explanation. Which choice best describes the passage's overall structure?",
          walkthrough:
            "Step 1: Sketch the shape: the passage opens with a puzzle or unexplained phenomenon, then works through an investigation that resolves it. Step 2: This is a question-then-answer structure, but delivered through a narrated process (a series of experiments) rather than a single stated hypothesis. Step 3: The correct choice should mention both the initial puzzle and the investigative process that resolves it, not just 'a scientific finding is explained.'",
          answer:
            "The passage presents a puzzling phenomenon, then narrates the experimental process that eventually explains it.",
          difficulty: "medium",
        },
        {
          prompt:
            "A passage describes a small town's declining water supply, then presents a proposed desalination project as a potential fix, closing by noting the project's high energy cost as an unresolved drawback. Which choice best describes the passage's overall structure?",
          walkthrough:
            "Step 1: This passage has three moves, not two: a problem, a proposed solution, and then a complication that qualifies the solution. Step 2: A choice that only mentions 'a problem and its solution' is incomplete — it leaves out the passage's actual ending, which raises a real drawback rather than closing on an unqualified fix. Step 3: The correct choice needs to capture all three moves in order: problem, proposed solution, acknowledged limitation.",
          answer:
            "The passage describes a problem, proposes a solution to it, and then acknowledges a significant drawback of that proposed solution.",
          difficulty: "medium",
        },
        {
          prompt:
            "A passage opens with a brief anecdote about a chess player who won a tournament using an unconventional opening move. It then broadens into a discussion of how unconventional strategies can succeed precisely because opponents haven't prepared for them. It closes by returning to note that the same player's opponent later admitted having no prepared response. Which choice best describes the passage's overall structure?",
          walkthrough:
            "Step 1: Sketch the shape carefully — this passage doesn't just move from specific to general; it returns to the opening anecdote at the end, adding a new detail that reinforces the general point. Step 2: A choice describing only 'a specific example leading to a general claim' misses that final return to the anecdote — the passage's structure is closer to a loop than a straight line. Step 3: The correct choice should capture all three moves: the anecdote, the generalization it leads to, and the passage's return to that same anecdote to reinforce the generalization with a new detail.",
          answer:
            "The passage opens with a specific anecdote, generalizes from it, and then returns to that same anecdote with an additional detail that reinforces the generalization.",
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
          prompt:
            "Passage 1 argues social media increases civic engagement. Passage 2 argues it fosters isolation.",
          walkthrough:
            "Step 1: Identify each author's premise vs. conclusion. Both are discussing the same underlying phenomenon: social media has changed how people interact and participate in public life. Step 2: Their conclusions differ (engagement vs. isolation), but the shared premise — that social media has significantly changed interaction patterns — is something both would accept, since it's the shared foundation their opposing arguments are built on.",
          answer: "Both authors would most likely agree that social media has significantly changed how people interact, even though they draw opposite conclusions from that shared premise.",
          difficulty: "easy",
        },
        {
          prompt:
            "Passage 1 argues that standardized testing accurately measures student achievement and should carry significant weight in college admissions. Passage 2 argues that these same tests are biased against under-resourced students and should be minimized in admissions decisions.",
          walkthrough:
            "Step 1: Identify each author's premise vs. conclusion. Both are working from the same observable fact: scores on these tests differ across students from different backgrounds. Step 2: Their conclusions differ sharply — one trusts the test, one distrusts it — but they disagree about WHY scores vary, not WHETHER they vary. Step 3: The shared ground is the underlying pattern itself (scores differ by background), not either author's explanation for it.",
          answer: "Both authors would most likely agree that test scores vary across students from different backgrounds — they simply disagree about why that pattern exists (a real difference in achievement vs. bias in the test itself).",
          difficulty: "medium",
        },
        {
          prompt:
            "Passage 1 argues a popular diet trend is effective for short-term weight loss. Passage 2 argues the same diet trend is not sustainable as a long-term lifestyle.",
          walkthrough:
            "Step 1: Identify each author's premise vs. conclusion. Both are discussing the same underlying phenomenon: the diet produces some effect in the short term. Step 2: Their conclusions differ (effective vs. unsustainable), but the shared premise — that the diet does produce noticeable short-term change — is something both would likely accept, since Passage 2's critique is about long-term sustainability, not about whether short-term effects occur at all.",
          answer: "Both authors would most likely agree that the diet produces noticeable short-term results — they disagree specifically about whether those results can be sustained long-term.",
          difficulty: "easy",
        },
        {
          prompt:
            "Passage 1 argues a city's new noise ordinance improved residents' quality of life. Passage 2 argues the same ordinance unfairly burdens small businesses that rely on evening foot traffic.",
          walkthrough:
            "Step 1: Identify each author's premise vs. conclusion — both discuss the same underlying fact: the ordinance changed nighttime activity patterns in the city. Step 2: Their conclusions differ (benefit to residents vs. burden on businesses), but the shared premise — that the ordinance measurably reduced nighttime activity and noise — is something both would accept, since it's the shared foundation each side interprets differently.",
          answer: "Both authors would most likely agree that the ordinance measurably reduced nighttime activity and noise — they simply disagree about whether that reduction is a benefit (Passage 1) or a cost (Passage 2).",
          difficulty: "medium",
        },
        {
          prompt:
            "Passage 1, written by a historian, argues an ancient trade route's decline was caused primarily by a shift in regional political power. Passage 2, written by an archaeologist, argues the decline was caused primarily by environmental changes that made the route impassable.",
          walkthrough:
            "Step 1: Identify each author's premise vs. conclusion. Passage 1: political power shifted around the same time; this caused the decline. Passage 2: environmental conditions changed around the same time; this caused the decline. Step 2: A tempting but too-generic shared-ground answer would say 'both agree the route was economically important' — probably true, but it's assumed background, not the actual point either author argues about. Step 3: The more precise shared ground is that both authors agree the decline occurred gradually over an extended period, since each is proposing a different explanation for that same observed pattern.",
          answer: "Both authors would most likely agree that the trade route's decline occurred gradually over an extended period — each proposes a different cause (political vs. environmental) for that same shared observation, rather than disagreeing about the pattern of decline itself.",
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
          prompt:
            "Passage 2 (isolation-focused) is asked how its author would respond to Passage 1's claim that online communities effectively replace real-world ones.",
          walkthrough:
            "Step 1: Identify Passage 2's core concern — that online interaction lacks the depth of real connection. Step 2: Apply that same concern to the new claim: an author worried about depth of connection would likely argue that online communities, however active, don't fully replace the depth of in-person relationships. Step 3: Reject options where the author would simply agree (that would contradict their entire stated position) or ignore the claim (unlikely, since it's directly relevant to their thesis).",
          answer: "Passage 2's author would most likely argue that online interaction lacks the depth of in-person connection, consistent with their isolation-focused concern.",
          difficulty: "easy",
        },
        {
          prompt:
            "Passage 1 (pro-testing) is asked how its author would respond to Passage 2's claim that some highly capable students perform poorly on standardized tests because of test anxiety, unrelated to their actual ability.",
          walkthrough:
            "Step 1: Identify Passage 1's core concern — that test scores are a reliable, trustworthy measure of achievement and deserve real weight in decisions. Step 2: Apply that same concern to the new claim: an author committed to defending the test's reliability would most likely argue that some variation in any single measurement is expected, but that this doesn't undermine the test's overall usefulness. Step 3: Reject an option where the author simply concedes the test is flawed and should be dropped — that would contradict their entire stated position.",
          answer: "Passage 1's author would most likely argue that occasional cases of test anxiety don't undermine the test's overall reliability, consistent with their pro-testing position — not concede that the test should be abandoned.",
          difficulty: "medium",
        },
        {
          prompt:
            "Passage 1 (pro-ordinance) is asked how its author would respond to Passage 2's claim that the noise ordinance unfairly burdens small businesses reliant on evening foot traffic.",
          walkthrough:
            "Step 1: Identify Passage 1's core concern — improved quality of life for residents. Step 2: Apply that concern to the new claim: an author focused on resident quality of life would likely argue that the benefit to residents outweighs the inconvenience to businesses, or that businesses can adjust. Step 3: Reject an option where the author fully concedes the ordinance was a mistake — that would contradict their stated position.",
          answer: "Passage 1's author would most likely argue that the improvement to residents' quality of life outweighs the burden on businesses, consistent with their pro-ordinance position — not concede the policy was wrong.",
          difficulty: "easy",
        },
        {
          prompt:
            "Passage 2 (sustainability-focused) is asked how its author would respond to Passage 1's claim that the diet trend produces measurable short-term weight loss.",
          walkthrough:
            "Step 1: Identify Passage 2's core concern — not whether short-term effects occur, but whether they can be sustained. Step 2: Apply that concern to the new claim: this author would most likely concede the short-term effect is real, but argue it doesn't matter if it can't be maintained long-term. Step 3: Reject an option where the author denies the short-term effect happened at all — that's not what their passage actually argues; their critique is about durability, not the initial result.",
          answer: "Passage 2's author would most likely concede that short-term weight loss occurs, but argue it doesn't matter if the diet can't be sustained — consistent with their sustainability-focused concern, not a denial that any effect occurred.",
          difficulty: "medium",
        },
        {
          prompt:
            "Passage 1 (the historian, political cause) is asked how its author would respond to a specific piece of Passage 2's evidence: sediment core samples showing the region's climate became significantly drier in the decades before the trade route's decline.",
          walkthrough:
            "Step 1: Identify Passage 1's core concern — that political shifts were the PRIMARY cause of the decline. Step 2: A careful historian wouldn't necessarily dispute solid sediment-core data — that's not their area of expertise or actual disagreement. Their real disagreement is about which cause was primary, not whether the climate changed at all. Step 3: Reject an option having the historian flatly deny the climate data; a more consistent response accepts the data but reframes its importance as secondary.",
          answer: "Passage 1's author would most likely accept the environmental evidence as accurate but argue it was a secondary factor, maintaining that political shifts were the primary cause — not deny data outside their own area of argument.",
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
          prompt:
            "Notes: (1) Bees pollinate 1/3 of food crops. (2) Bee populations declined 40% since 2006. (3) Colony collapse disorder is a leading cause. Goal: emphasize the economic stakes of bee decline.",
          walkthrough:
            "Step 1: Re-read the goal — 'economic stakes,' not 'causes' or 'general facts about bees.' Step 2: Identify which note ties directly to economic relevance: note 1 (pollinating food crops) is the economic angle. Step 3: The best sentence combines the economic-relevance note with the decline statistic, since the goal is specifically about the economic implications of the decline, not the decline alone or its cause.",
          answer:
            "The correct choice combines the crop-pollination fact (the economic angle) with the population decline statistic — directly serving the stated goal about economic stakes, unlike choices that only mention causes or unrelated facts.",
          difficulty: "easy",
        },
        {
          prompt:
            "Notes: (1) A city library added 12 self-checkout kiosks in 2022. (2) Average wait times at the checkout desk dropped by 6 minutes. (3) Staff reported spending more time helping patrons find books. Goal: emphasize the impact on staff work, not patron convenience.",
          walkthrough:
            "Step 1: Re-read the goal carefully — 'impact on staff work,' not patron convenience. Note 2 (wait times) is tempting because it's about the same event, but it's about patrons, which is exactly what the goal says to avoid. Step 2: Identify which note ties to staff specifically: note 3, staff spending more time helping patrons find books. Step 3: The best sentence combines the kiosk installation (note 1, the cause) with the staff time note (note 3, the effect on staff) — not the wait-time note, which answers a different, off-topic goal.",
          answer:
            "The correct choice combines the kiosk installation (note 1) with the staff time-reallocation note (note 3) — directly serving the stated goal about staff impact, unlike a choice built around patron wait times, which is true but answers a different goal.",
          difficulty: "medium",
        },
        {
          prompt:
            "Notes: (1) A nonprofit distributed 500 reusable water bottles at a summer festival. (2) The festival generated an estimated 3 tons of plastic waste the previous year. (3) A follow-up survey a month later found 68% of attendees still used the bottles regularly. (4) The festival's ticket prices rose 10% this year. Goal: emphasize the long-term environmental impact of the giveaway.",
          walkthrough:
            "Step 1: Re-read the goal precisely — 'long-term environmental impact,' not just 'the giveaway happened' or general festival facts. Note 4 (ticket prices) is true but has nothing to do with the environment, so it's easy to drop. Step 2: Note 2 (3 tons of plastic waste) sets the scale of the problem, but by itself it doesn't show any actual impact from the giveaway — it's background, not an outcome. Note 3 (68% still using the bottles a month later) is the only note that shows a real, lasting effect tied specifically to the giveaway. Step 3: The best sentence combines what was given away (note 1) with evidence that the effect lasted (note 3). Adding note 2 without connecting it to an actual result would make the sentence feel relevant while actually diluting how precisely it serves this specific goal.",
          answer:
            "The correct choice combines the giveaway itself (note 1) with the survey data showing lasting use (note 3) — the only notes that together demonstrate a long-term impact. The waste-tonnage note is real but only establishes background context, not an outcome, and the ticket-price note is unrelated entirely.",
          difficulty: "hard",
        },
        {
          prompt:
            "Notes: (1) A local bakery started using compostable packaging in 2021. (2) The switch increased packaging costs by 15%. (3) Customer surveys show 68% say they'd pay more for eco-friendly packaging. Goal: emphasize customer support for the change.",
          walkthrough:
            "Step 1: Re-read the goal — 'customer support,' not 'cost.' Step 2: Identify which note ties directly to customer support: note 3 (68% would pay more). Step 3: The best sentence combines the packaging change (note 1) with the survey result (note 3), since the goal is about customer support for that specific change, not its cost impact.",
          answer:
            "The correct choice combines the packaging switch (note 1) with the customer survey result (note 3) — serving the stated goal about customer support, unlike a choice built around the cost increase, which answers a different (also true) question.",
          difficulty: "easy",
        },
        {
          prompt:
            "Notes: (1) A youth orchestra performed its first international tour in 2019. (2) The tour included stops in four countries. (3) Ticket sales from the tour funded new instruments for the following year. (4) The orchestra's conductor has led the group since 2015. Goal: emphasize how the tour benefited the orchestra's future.",
          walkthrough:
            "Step 1: Re-read the goal — 'benefited the orchestra's future,' not 'how big the tour was' or 'who leads the orchestra.' Step 2: Eliminate note 4 immediately (about the conductor, unrelated to the tour's benefit). Note 2 (four countries) is tempting since it's about the tour, but it describes scope, not benefit. Step 3: The best sentence combines the tour (note 1) with the funding outcome (note 3), since that's the specific future benefit the goal asks about.",
          answer:
            "The correct choice combines the 2019 tour (note 1) with the instrument-funding outcome (note 3) — directly serving the goal about future benefit, unlike a choice built around the tour's scope or the conductor's tenure, both true but off-goal.",
          difficulty: "medium",
        },
        {
          prompt:
            "Notes: (1) A public library extended its hours to include Sunday openings starting in 2022. (2) Sunday visits now account for 18% of total weekly visits. (3) Before the change, the library was closed two days per week (Sunday and Monday). (4) A separate branch across town has had Sunday hours since 2015, with similar visit patterns. (5) The library's overall annual budget increased 5% the same year hours were extended. Goal: emphasize that demand for Sunday access already existed before this library reacted to it.",
          walkthrough:
            "Step 1: Re-read the goal precisely — demand existed BEFORE the library reacted, not just 'Sunday hours are popular now.' Step 2: Note 2 (18% of visits now) shows current usage, but that's AFTER the change, so alone it doesn't prove demand existed beforehand — a tempting but incomplete choice. Step 3: Note 4 (a separate branch had Sunday hours with similar patterns since 2015) is the key piece: it shows the same demand pattern existing elsewhere for years, independent of and before this library's own 2022 decision.",
          answer:
            "The correct choice combines this library's 2022 change (note 1) with the comparable branch's years-long Sunday demand pattern (note 4) — the only combination showing the demand pre-dated this library's own reaction, unlike the current 18%-of-visits figure (note 2), which only shows demand after the change.",
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
          prompt:
            "'The experiment produced promising initial results. ______, further trials failed to replicate the effect.'",
          walkthrough:
            "Step 1: What's the relationship between the two sentences? Promising results, then failure to replicate — this is a contrast/contradiction, not an addition or cause-effect. Step 2: Filter answer choices by relationship type: 'similarly' (addition/comparison — wrong direction), 'however' (contrast — correct direction), 'for example' (illustration — wrong), 'as a result' (cause-effect — wrong, since failure to replicate isn't caused by promising results). Step 3: 'However' is the only choice matching the actual logical relationship.",
          answer: "'However' is correct because it's the only choice that matches the contrast between promising initial results and a failed replication.",
          difficulty: "easy",
        },
        {
          prompt:
            "'The bakery started sourcing flour from a local mill instead of a national distributor. ______, delivery times improved and ingredient costs actually dropped by 8%.'",
          walkthrough:
            "Step 1: What's the relationship here? The switch to a local mill directly produced two outcomes — faster deliveries and lower costs. That's cause-and-effect, not addition or contrast. Step 2: 'In addition' would suggest these are just two more, separate facts, not results of the switch — wrong. 'However' would suggest a contradiction, but nothing here contradicts anything — wrong. Step 3: 'As a result' is the only choice that correctly signals the second sentence describes consequences of the first.",
          answer: "'As a result' is correct because the second sentence describes outcomes caused directly by the switch described in the first — 'in addition' and 'however' don't capture that causal link.",
          difficulty: "medium",
        },
        {
          prompt:
            "'The museum extended its hours for the holiday season. ______, staff scheduled additional guided tours to meet the increased demand.'",
          walkthrough:
            "Step 1: What's the relationship here? Extending hours led directly to a response — more tours — a cause and its effect. Step 2: Filter the choices by relationship type: 'however' (contrast — wrong), 'for example' (illustration — wrong), 'similarly' (comparison — wrong), 'as a result' (cause-effect — correct direction). Step 3: 'As a result' is the only choice matching the actual logical relationship.",
          answer: "'As a result' is correct because scheduling more tours is a direct consequence of extending the museum's hours.",
          difficulty: "easy",
        },
        {
          prompt:
            "'The vaccine trial enrolled twice as many participants as originally planned. ______, the results were available nearly a year ahead of schedule.'",
          walkthrough:
            "Step 1: What's the relationship? A larger enrollment led to faster results — a causal link, not just two separate facts about the trial. Step 2: 'In addition' would present these as two unconnected facts, but the sentence's logic specifically connects the larger sample to the faster timeline. Step 3: A cause-effect word matches best, not an addition word.",
          answer: "'Consequently' is correct because faster results followed specifically from the larger participant pool — 'in addition' would wrongly present these as two separate, unconnected facts rather than a cause and its effect.",
          difficulty: "medium",
        },
        {
          prompt:
            "'The company's revenue grew for the fifth consecutive quarter. ______, its stock price fell sharply after the earnings call.'",
          walkthrough:
            "Step 1: What's the relationship? Revenue grew, but stock fell — growth would normally be expected to raise or maintain stock price, so this is a contrast between expectation and outcome, not a cause producing an expected effect. Step 2: 'As a result' is a tempting trap, since the events are chronologically connected — but 'as a result' would imply the growth logically produced the drop, reversing the sentence's actual logic (growth typically wouldn't cause a price fall). Step 3: A contrast word correctly signals that the fall is surprising given the growth.",
          answer: "'However' is correct because the stock falling despite revenue growth is a contrary, unexpected outcome — 'as a result' would wrongly suggest growth directly caused the drop.",
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
          prompt:
            "'The two proposals differ significantly in cost. ______, both aim to reduce the city's carbon footprint by the same percentage.'",
          walkthrough:
            "Step 1: Is this a full contradiction, or an acknowledgment of a difference followed by a shared similarity? It's the latter — the cost difference is acknowledged, but doesn't prevent a shared goal from being true. Step 2: This calls for a concession-style transition ('nonetheless') rather than a pure contrast word implying the two ideas can't both be true.",
          answer: "'Nonetheless' is correct because it signals a concession — the cost difference is acknowledged, but a shared underlying goal still holds true despite it.",
          difficulty: "easy",
        },
        {
          prompt:
            "'The bridge repairs ran three months behind schedule. ______, the final structure passed every safety inspection without a single issue.'",
          walkthrough:
            "Step 1: Ask whether the two ideas actually contradict each other, or whether the second is simply true despite the first. Running behind schedule doesn't logically prevent a project from passing inspection later — these aren't opposites the way 'promising results' and 'failed to replicate' are in the earlier example. Step 2: Because there's no real contradiction here, only an earlier setback that didn't end up mattering, this calls for a concession word ('nonetheless' or 'still') rather than a flat contrast word that would imply the delay and the good outcome can't both be true. Step 3: The key difference from a simpler contrast case: here, nothing is actually being reversed or disproven — a positive result just held up despite an earlier problem, which is exactly what concession language signals.",
          answer: "'Nonetheless' is correct because the delay doesn't actually contradict passing every inspection — it signals that a positive outcome held true despite an earlier setback, which is a concession, not a flat contradiction.",
          difficulty: "hard",
        },
        {
          prompt:
            "'The two candidates disagree on nearly every policy issue. ______, both have pledged to accept the election results peacefully.'",
          walkthrough:
            "Step 1: Is this a full contradiction, or an acknowledgment of one point followed by agreement on another? It's the latter — disagreeing on policy doesn't prevent a shared commitment on something else. Step 2: This calls for a concession-style word ('nonetheless') rather than a pure contrast word implying the two ideas can't coexist.",
          answer: "'Nonetheless' is correct because it signals a concession — the policy disagreement is acknowledged, but a shared commitment still holds true despite it.",
          difficulty: "easy",
        },
        {
          prompt:
            "'The renovation ran significantly over budget. ______, the building's new energy efficiency is expected to save the city money within five years.'",
          walkthrough:
            "Step 1: Is this a flat contradiction, or does the second idea hold true despite the first? Running over budget doesn't logically prevent future energy savings — these aren't opposites, so this is a 'despite X, Y still holds' relationship. Step 2: This calls for 'nonetheless' or 'still,' not a flat contrast word implying the two facts can't coexist.",
          answer: "'Nonetheless' is correct because going over budget doesn't actually contradict future energy savings — it signals a positive outcome holding true despite an earlier setback.",
          difficulty: "medium",
        },
        {
          prompt:
            "'Reviewers praised the film's visual effects as groundbreaking. ______, they panned its script as incoherent and poorly paced.'",
          walkthrough:
            "Step 1: Is this 'despite X, Y still holds,' or a direct two-sided contrast? Here, praise for the effects and criticism of the script are two separate, directly opposing assessments — not one idea holding true 'despite' the other. Step 2: A concession word like 'nonetheless' would subtly misrepresent this as one point overcoming a setback, when it's really just two contrasting judgments placed side by side. Step 3: A plain contrast word is the cleaner, more accurate fit here.",
          answer: "'However' is correct because this is a direct contrast between two separate judgments (praised effects, criticized script), not a case of one positive holding true despite an earlier negative — a concession word like 'nonetheless' would misrepresent the relationship.",
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
          prompt: "'The results were surprising ______ no one had predicted such a sharp decline.'",
          walkthrough:
            "Step 1: Check both sides. 'The results were surprising' is a complete sentence. 'No one had predicted such a sharp decline' is also a complete sentence. Both are independent clauses. Step 2: Since both sides are independent, a lone comma is wrong (that would be a comma splice) — you need a semicolon, a period, or a comma plus conjunction. Step 3: Among the given choices, the semicolon correctly joins the two related independent clauses without needing an added conjunction.",
          answer: "A semicolon correctly joins the two independent clauses, since both sides express a complete thought and are closely related.",
          difficulty: "easy",
        },
        {
          prompt: "'The lab technician double-checked every reading twice ______ a single miscalibration could invalidate months of data.'",
          walkthrough:
            "Step 1: Check both sides. 'The lab technician double-checked every reading twice' could stand alone as its own sentence, and so could 'a single miscalibration could invalidate months of data.' Both work on their own. Step 2: Since both sides work as complete sentences, a lone comma won't do — you need something stronger: a period, a semicolon, a comma plus a joining word like 'and' or 'but,' or a colon. Step 3: Notice what the second half is actually doing: it's explaining *why* the technician was so careful. When the second half explains the reasoning behind the first, a colon is the cleanest fit — it signals 'here's the explanation' more precisely than a semicolon would.",
          answer: "A colon is correct: both halves could stand alone, and the second one explains the reasoning behind the first — exactly the job a colon does.",
          difficulty: "medium",
        },
        {
          prompt: "'The negotiators extended the deadline by another week ______ neither side had reviewed the full contract yet.'",
          walkthrough:
            "Step 1: Both halves of this sentence could stand alone: 'The negotiators extended the deadline by another week' and 'neither side had reviewed the full contract yet.' Step 2: The tricky part is that 'for' and 'because' both seem to explain a reason here, but they behave differently. 'For' acts like 'and' or 'but' — it links two complete sentences together and needs a comma right before it. 'Because' instead attaches itself onto the second sentence and changes it so it can no longer stand alone on its own — used this way, it wouldn't take a comma in front of it at all. Step 3: Since a comma is already placed right before the blank, the word that belongs there is the one that links two complete sentences — 'for.'",
          answer: "'For' is correct — it links two complete sentences the same way 'and' or 'but' would, so it belongs right after a comma. 'Because' would attach itself to the second sentence instead and change how the whole thing needs to be punctuated.",
          difficulty: "hard",
        },
        {
          prompt: "'The council approved the budget unanimously ______ the mayor still vetoed it the next day.'",
          walkthrough:
            "Step 1: Check both sides. 'The council approved the budget unanimously' could stand alone, and so could 'the mayor still vetoed it the next day.' Both are complete on their own. Step 2: Since both sides work as complete sentences, a lone comma is wrong — this needs a semicolon, a period, or a comma plus a joining word. Step 3: Given the surprising, contrary relationship between the two events, a comma plus 'but' (or a semicolon alone) correctly joins them without a comma splice.",
          answer: "A comma plus 'but' correctly joins the two independent clauses, since both sides are complete sentences and the relationship between them is a direct contrast.",
          difficulty: "easy",
        },
        {
          prompt: "'The two departments rarely agree on budget priorities ______ this year's proposal passed with support from both.'",
          walkthrough:
            "Step 1: Check both sides. 'The two departments rarely agree on budget priorities' is a complete sentence, and so is 'this year's proposal passed with support from both.' Step 2: Since both sides are independent, a lone comma won't work — this needs a semicolon, a period, or a comma plus conjunction. Step 3: The relationship here is a surprising contrast (rarely agree, yet agreed this time), which a semicolon can join cleanly without needing to spell out a specific conjunction.",
          answer: "A semicolon correctly joins the two independent clauses — both express complete, related thoughts, and the semicolon lets the contrast speak for itself without an added conjunction.",
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
          prompt:
            "'The museum's newest exhibit features work by three artists Chen Liu a sculptor Marisol Ortiz a painter and Amara Diallo a photographer.'",
          walkthrough:
            "Step 1: Recognize this is a list, not two independent clauses — 'three artists' is being defined by the list that follows. Step 2: Notice that each list item itself contains an internal comma (name, then role) — 'Chen Liu, a sculptor' is one item, not two. Step 3: Because list items contain internal commas, using only commas throughout would make it impossible to tell where one item ends and the next begins — this calls for a colon to introduce the list, and semicolons to separate the individual (comma-containing) items.",
          answer:
            "A colon introduces the list, and semicolons separate the list items — because each item already contains a comma (name plus description), semicolons prevent ambiguity about where each item begins and ends.",
          difficulty: "easy",
        },
        {
          prompt: "'Three volunteers organized the event Priya Nair a teacher Sam Okoye a nurse and Lena Fischer a chef.'",
          walkthrough:
            "Step 1: Recognize this is a list, not two independent clauses — 'three volunteers' is being defined by the list that follows. Step 2: Notice each item has its own internal comma (name, then job) — 'Priya Nair, a teacher' is one item, not two. Step 3: Because the list items contain internal commas, a colon introduces the list and semicolons separate the (comma-containing) items.",
          answer: "A colon introduces the list, and semicolons separate the three volunteers — each item already has its own comma (name plus job), so semicolons keep it clear where one item ends and the next begins.",
          difficulty: "easy",
        },
        {
          prompt: "'The scholarship went to two applicants Wren Castillo a graduate student and Uma Bhatt an undergraduate.'",
          walkthrough:
            "Step 1: Recognize this is a list of two applicants, not two independent clauses. Step 2: Each applicant's name is followed by its own internal comma (name, then status) — 'Wren Castillo, a graduate student' is one item. Step 3: Even with only two items instead of three, the same signal applies: since each item already contains a comma, semicolons — not plain commas — separate them.",
          answer: "Semicolons separate the two list items — even with just two items instead of three, the rule is the same: each item already contains its own comma, so semicolons prevent ambiguity.",
          difficulty: "medium",
        },
        {
          prompt: "'The panel featured three speakers Renata Souza an economist Devon Marsh and Tolu Adeyemi a policy analyst.'",
          walkthrough:
            "Step 1: Notice most items have internal commas (name plus role), but 'Devon Marsh' alone has no descriptor and no internal comma. Step 2: Since at least one item in the list has an internal comma, plain commas throughout would still create ambiguity about where items begin and end — the rule applies to the whole list, not just the items that happen to have descriptions. Step 3: Semicolons still separate all three items consistently, even though one of them is just a plain name.",
          answer: "Semicolons still separate all three list items, even though 'Devon Marsh' alone has no internal comma — once any item in the list has one, the whole list needs semicolons for consistency.",
          difficulty: "medium",
        },
        {
          prompt:
            "'The panel included three judges Dana Wu a former Olympic gymnast Reyes Alvarado a retired judge and Priya Nathan a sports physician each bringing a different kind of expertise.'",
          walkthrough:
            "Step 1: This sentence introduces a list of three judges after a colon. Step 2: But look closely — each judge's name is followed by its own extra descriptive detail (what they used to do), and that detail needs a comma on each side. Step 3: That means each item in the list already has a comma built into it. If plain commas were also used to separate the three list items from each other, a reader couldn't tell where one judge's entry ends and the next one begins. Step 4: The fix is to separate the three list items with semicolons instead, while still keeping the commas around each judge's individual description.",
          answer: "Semicolons should separate the three judges in the list, while commas stay around each individual description — because every item in the list already contains its own comma, only semicolons between items keep it clear where one item ends and the next begins.",
          difficulty: "hard",
        },
        {
          prompt: "'The bakery sells muffins scones and croissants every morning.'",
          walkthrough:
            "Step 1: Check whether any list item itself contains a comma — 'muffins,' 'scones,' and 'croissants' are each single words with no internal punctuation needed. Step 2: Since no item has an internal comma, plain commas between items are perfectly clear on their own — semicolons would be unnecessary here, and using them would actually be wrong. Step 3: Use ordinary commas, with a comma before 'and' following standard serial-comma convention.",
          answer: "Plain commas are correct — 'muffins, scones, and croissants' — because none of the items contains its own internal comma, so there's no ambiguity for semicolons to resolve; reaching for semicolons in a simple list like this would be a mistake in the other direction.",
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
          prompt: "'My uncle Raymond a retired firefighter still volunteers at the local station.'",
          walkthrough:
            "Step 1: 'A retired firefighter' is extra descriptive information about 'my uncle Raymond' — it's not needed to know who's being talked about, since 'my uncle Raymond' already tells us exactly who that is. Step 2: Extra descriptive information dropped into the middle of a sentence needs to be boxed off on both sides with commas, like putting it in parentheses — not just introduced with one comma and left open on the other end. Step 3: Add a comma right after 'Raymond' and another right after 'firefighter.'",
          answer: "Commas belong on both sides of 'a retired firefighter' because it's extra descriptive detail, not information needed to identify who's being discussed — and extra detail dropped into the middle of a sentence needs to be closed off on both ends, not just opened on one.",
          difficulty: "easy",
        },
        {
          prompt: "'Our neighbor Dr. Alvarez a retired pediatrician now volunteers at the community clinic twice a week.'",
          walkthrough:
            "Step 1: 'A retired pediatrician' describes 'Dr. Alvarez' with extra, droppable detail — 'our neighbor Dr. Alvarez' already tells us exactly who's meant. Step 2: Since the phrase falls in the middle of the sentence, it needs to be boxed off on both sides. Step 3: Add a comma right after 'Alvarez' and another right after 'pediatrician.'",
          answer: "Commas belong on both sides of 'a retired pediatrician,' the same mid-sentence bracketing rule as any nonessential appositive.",
          difficulty: "easy",
        },
        {
          prompt:
            "Compare two sentences: (1) 'The author who wrote the novel became a recluse after its unexpected success.' (2) 'The author Min-jin Lee became a recluse after her novel's unexpected success.' Which one needs commas around its descriptive phrase, and which doesn't?",
          walkthrough:
            "Step 1: In sentence (1), 'who wrote the novel' is the only thing telling us which author is meant — without it, 'The author became a recluse' doesn't identify anyone. Since this information is necessary to know who's being discussed, it stays comma-free. Step 2: In sentence (2), the name 'Min-jin Lee' is extra: 'the author' already points to one specific, identifiable person, and the name is just filling in who that is rather than narrowing anything down. Since it's extra rather than necessary, it needs commas on both sides. Step 3: The test to use every time: if removing the phrase would make it unclear who or what is being talked about, leave it comma-free; if removing it still leaves a clear, complete idea, box it off with commas.",
          answer: "Sentence (1) needs no commas, because 'who wrote the novel' is necessary to know which author is meant. Sentence (2) needs commas around 'Min-jin Lee,' because the name is extra detail once 'the author' is already specific enough on its own.",
          difficulty: "medium",
        },
        {
          prompt: "'A retired pediatrician who still volunteers twice a week Dr. Alvarez has treated three generations of families at the clinic.'",
          walkthrough:
            "Step 1: 'A retired pediatrician who still volunteers twice a week' describes 'Dr. Alvarez,' but this time the descriptive phrase comes FIRST, before the name it describes. Step 2: Since there's nothing before the phrase to bracket — it's the very start of the sentence — only one comma is needed, after the phrase and before the name, not commas on both sides like a mid-sentence appositive. Step 3: This is the same core rule (nonessential information gets set off with commas), just applied at a different position in the sentence.",
          answer: "A single comma after 'week' correctly sets off the introductory appositive, since it opens the sentence — there's nothing before it needing a matching comma, unlike an appositive placed mid-sentence.",
          difficulty: "medium",
        },
        {
          prompt:
            "'The award went to Naledi Khumalo the youngest winner in the competition's history a fact organizers highlighted throughout the ceremony.'",
          walkthrough:
            "Step 1: Identify the first appositive: 'the youngest winner in the competition's history' describes 'Naledi Khumalo' — it falls mid-sentence, so it needs commas on both sides. Step 2: Identify the second phrase: 'a fact organizers highlighted throughout the ceremony' doesn't describe a single noun — it describes the entire claim just made (that she's the youngest winner ever). It's still extra, droppable information, so it still needs a comma before it, but since it falls at the very end of the sentence, only one comma is needed there. Step 3: The sentence needs three commas total: two bracketing the first appositive, and one introducing the second.",
          answer: "Three commas are needed: two bracketing 'the youngest winner in the competition's history' (a mid-sentence appositive describing Naledi Khumalo), and one before 'a fact organizers highlighted throughout the ceremony' (an end-of-sentence appositive describing the whole preceding claim, not a single noun).",
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
          prompt: "'Despite the storm the flight departed on time.'",
          walkthrough:
            "Step 1: Check both sides of where punctuation might go. 'Despite the storm' is NOT a complete sentence on its own (it's a dependent prepositional phrase). 'The flight departed on time' IS independent. Step 2: Since only one side is independent, semicolons and periods (which require independent clauses on both sides) are wrong here. Step 3: The correct choice is a single comma after the introductory phrase, before the independent clause begins.",
          answer: "A comma after 'storm' correctly separates the introductory dependent phrase from the independent clause that follows.",
          difficulty: "easy",
        },
        {
          prompt: "'Although the survey received far fewer responses than expected the results still revealed a clear pattern.'",
          walkthrough:
            "Step 1: 'The survey received far fewer responses than expected' has its own subject and its own verb, so at a glance it can look like a complete sentence on its own. Step 2: But the word 'Although' at the front changes that — it sets this part up as a lead-in to something else, and it can't actually stand alone no matter how complete it looks. Step 3: Since only the second part ('the results still revealed a clear pattern') can truly stand on its own, this is a single-boundary case: one comma after the lead-in, not a semicolon, which would require both sides to be able to stand alone.",
          answer: "A single comma after 'expected' is correct. 'Although...' looks complete on its own, but the word 'although' stops it from actually standing alone — so a semicolon, which needs both sides to be independent, would be wrong here.",
          difficulty: "medium",
        },
        {
          prompt: "'After months of planning the festival finally opened to the public.'",
          walkthrough:
            "Step 1: Check both sides. 'After months of planning' is not a complete sentence on its own — it's a dependent introductory phrase. 'The festival finally opened to the public' is independent. Step 2: Since only one side is independent, a semicolon or period (which both require independence on both sides) would be wrong. Step 3: The correct choice is a single comma after the introductory phrase.",
          answer: "A comma after 'planning' correctly separates the introductory phrase from the independent clause that follows.",
          difficulty: "easy",
        },
        {
          prompt: "'Despite years of research into the disease's underlying causes doctors still lack a reliable early screening test.'",
          walkthrough:
            "Step 1: Identify the introductory phrase: 'Despite years of research into the disease's underlying causes' — this whole stretch, including its own internal phrases ('of research,' 'into the disease's underlying causes'), is still just one introductory unit modifying the clause that follows. Step 2: 'Doctors still lack a reliable early screening test' is the independent clause. Step 3: Even though the introductory phrase is long, it still takes exactly one comma before the independent clause begins — placed after 'causes,' not earlier within the phrase.",
          answer: "A single comma after 'causes' is correct — even though the introductory phrase is long and contains its own smaller phrases, it's still one unit that takes exactly one comma before the independent clause begins.",
          difficulty: "medium",
        },
        {
          prompt: "'Having reviewed every application twice the committee still could not reach a unanimous decision.'",
          walkthrough:
            "Step 1: Check both sides. 'Having reviewed every application twice' has no subject of its own — it's a participial phrase describing an implied actor (the committee), not a complete clause. 'The committee still could not reach a unanimous decision' IS independent. Step 2: Since only one side is independent, this is the same single-boundary case as an intro phrase beginning with 'despite' or 'although' — even though this one opens with an '-ing' participle instead of a familiar preposition. Step 3: The correct choice is still a single comma after the introductory phrase.",
          answer: "A comma after 'twice' correctly separates the introductory participial phrase from the independent clause — the same single-boundary rule applies even though this opener uses an '-ing' participle instead of a word like 'although' or 'despite.'",
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
          prompt:
            "'The two ghostwriters' [ghostwriters/ghostwriter's/ghostwriters] identities have never been publicly confirmed.'",
          walkthrough:
            "Step 1: What follows the noun? 'Identities' — something the ghostwriters possess, so this needs a possessive form, not a plain plural. Step 2: How many ghostwriters? The sentence says 'two,' so this is plural possession. Step 3: For a plural owner, the apostrophe goes after the existing -s: ghostwriters', not ghostwriter's (which would wrongly imply only one).",
          answer:
            "'Ghostwriters'' is correct — two owners means the apostrophe goes after the plural -s, not before it.",
          difficulty: "easy",
        },
        {
          prompt: "'Many [immigrant's/immigrants/immigrants'] personal stories go untold in official histories.'",
          walkthrough:
            "Step 1: 'Stories' follows the noun — these are stories the immigrants possess, so a plain plural won't work here. Step 2: 'Many' signals more than one owner, so this needs the plural possessive form. Step 3: Apostrophe after the -s: immigrants'.",
          answer:
            "'Immigrants'' is correct — 'many' establishes multiple owners, so the apostrophe follows the plural -s.",
          difficulty: "easy",
        },
        {
          prompt:
            "'The research team credited three separate laboratories for the discovery; the [laboratory's/laboratories/laboratories'] combined data made the pattern clear.'",
          walkthrough:
            "Step 1: 'Combined data' follows the noun — data the laboratories possess together, so this needs a possessive, not a plain plural. Step 2: The sentence explicitly says 'three separate laboratories,' confirming multiple owners. Step 3: Plural possessive: laboratories', apostrophe after the existing -s — not laboratory's, which would wrongly suggest a single lab.",
          answer:
            "'Laboratories'' is correct — the sentence establishes three labs as joint owners of the data, requiring the plural possessive form.",
          difficulty: "medium",
        },
        {
          prompt: "'The final report was reviewed and approved by three [researcher's/researchers/researchers'] before publication.'",
          walkthrough:
            "Step 1: Check what follows 'researchers' — nothing; the sentence just moves on to 'before publication.' Step 2: Since there's no noun directly after it being possessed, this is simply naming multiple people, not showing ownership. Step 3: A plain plural is correct, with no apostrophe at all — both possessive options are traps here.",
          answer:
            "'Researchers' (no apostrophe) is correct — the noun isn't possessing anything in this sentence, so neither possessive form applies.",
          difficulty: "medium",
        },
        {
          prompt:
            "'The museum's newest exhibit displays several [artist's/artists/artists'] early sketches alongside a single sculptor's finished bronze piece.'",
          walkthrough:
            "Step 1: This sentence already correctly uses two other possessives ('museum's' for one museum, 'sculptor's' for one sculptor) — use those as a model. Step 2: 'Sketches' follows the blank, and 'several' signals more than one artist possessing them jointly. Step 3: Match the plural-possessive pattern already established by the sentence's structure: artists', not artist's (one owner) or artists (no ownership at all).",
          answer:
            "'Artists'' is correct — 'several' establishes multiple owners of the sketches, paralleling the already-correct singular possessives elsewhere in the sentence.",
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
          prompt:
            "'The negotiators finally agreed [to, on/on/to on] a compromise that satisfied both delegations.'",
          walkthrough:
            "Step 1: 'Agreed on' is a single verb phrase, and 'a compromise' is its direct object — there's no boundary here at all, just a verb followed by what it acts on. Step 2: Inserting a comma between a verb phrase and its object breaks the sentence's core grammar, the same error as splitting any verb from its object. Step 3: The correct choice has no punctuation between 'on' and 'a compromise.'",
          answer: "No punctuation is correct — 'agreed on' and its object 'a compromise' must stay directly connected.",
          difficulty: "easy",
        },
        {
          prompt:
            "'Visitors are asked to remain seated [during, the/during the/during, the,] performance to avoid disrupting other guests.'",
          walkthrough:
            "Step 1: 'During' is a preposition and 'the performance' is its object — together they form one tightly bound unit with no internal boundary. Step 2: A comma between a preposition and its object is never correct, regardless of how long the surrounding sentence is. Step 3: The correct choice has no punctuation anywhere inside 'during the performance.'",
          answer: "No punctuation is correct — a preposition and its object never take punctuation between them.",
          difficulty: "easy",
        },
        {
          prompt:
            "'The committee's chair, Dr. Alvarez[,/ ][no comma] announced the new research funding priorities at the meeting.'",
          walkthrough:
            "Step 1: Check whether 'Dr. Alvarez' is nonessential (removable) or essential here. Step 2: Since 'the committee's chair' already uniquely identifies one specific person, the name that follows is a nonessential appositive and does need commas on both sides — so this one is a trap in the other direction, testing whether you over-correct toward 'no punctuation' once you've learned to watch for it. Step 3: The correct choice keeps the comma after 'Alvarez,' matching the comma already present before the name.",
          answer:
            "A comma after 'Alvarez' is correct — this is a genuine nonessential appositive needing punctuation on both sides, not a case where punctuation should be dropped.",
          difficulty: "medium",
        },
        {
          prompt:
            "'The festival's organizers decided[,/ ] to postpone the outdoor concert until the storm passed.'",
          walkthrough:
            "Step 1: 'Decided' is the main verb, and 'to postpone the outdoor concert until the storm passed' is its infinitive-phrase object, answering 'decided what?' Step 2: A verb and the infinitive phrase completing its meaning form one unbroken grammatical unit, just like a verb and a direct-object noun. Step 3: No comma belongs between 'decided' and 'to postpone.'",
          answer: "No punctuation is correct — the verb 'decided' and its infinitive-phrase object must stay connected.",
          difficulty: "medium",
        },
        {
          prompt:
            "'Employees who arrive after nine o'clock[,/ ] must sign in at the front desk before entering the building.'",
          walkthrough:
            "Step 1: 'Who arrive after nine o'clock' is a restrictive relative clause — it specifies WHICH employees the sentence is about, not extra removable detail about all employees. Step 2: Test it: removing the clause changes the sentence's meaning entirely, from a rule about latecomers to a rule about everyone — that's the signature of an essential, restrictive clause. Step 3: Restrictive clauses never take a comma before them, so the correct choice has no punctuation after 'o'clock.'",
          answer:
            "No punctuation is correct — 'who arrive after nine o'clock' is a restrictive clause essential to the sentence's meaning, and restrictive clauses don't take a comma.",
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
          prompt:
            "'The museum's mission statement emphasizes one goal above all others[:/,/;] preserving the collection for future generations.'",
          walkthrough:
            "Step 1: Check the left side. 'The museum's mission statement emphasizes one goal above all others' is a complete, independent clause. Step 2: Check the right side. 'Preserving the collection for future generations' is a phrase renaming that 'one goal' — not a full independent clause, so a semicolon (which needs independent clauses on both sides) won't work. Step 3: A colon is correct: independent clause on the left, an elaborating phrase (not required to be independent) on the right.",
          answer:
            "A colon is correct — the left side is a full independent clause, and the right side is a phrase elaborating on 'one goal,' which a colon allows but a semicolon does not.",
          difficulty: "easy",
        },
        {
          prompt:
            "'Before the expedition departed, the team packed everything they would need[:/,/;] tents, dried food, water filters, and a satellite phone.'",
          walkthrough:
            "Step 1: The part before the colon, 'the team packed everything they would need,' is a complete independent clause. Step 2: What follows is a list of items, not an independent clause — so this isn't a case for a semicolon between two full sentences. Step 3: A colon correctly introduces the list, since only the clause before it needs to be independent.",
          answer: "A colon is correct — it introduces a list following a complete independent clause.",
          difficulty: "easy",
        },
        {
          prompt:
            "'The engineers faced a single unavoidable constraint[:/,/;] the bridge's total weight could not exceed the old foundation's original rating.'",
          walkthrough:
            "Step 1: 'The engineers faced a single unavoidable constraint' stands alone as a complete clause. Step 2: What follows, 'the bridge's total weight could not exceed the old foundation's original rating,' happens to ALSO be a complete independent clause — so a semicolon would technically work grammatically here too, but the sentence's tone (announcing then explaining a specific constraint) fits the colon's 'here's what I mean' function better than the semicolon's 'here's a closely related but separate point' function. Step 3: For this question, the colon is favored because the second clause specifically explains and defines the 'single unavoidable constraint' named in the first, which is exactly what a colon signals.",
          answer:
            "A colon is correct — the second clause defines exactly what the 'unavoidable constraint' is, the elaboration relationship a colon signals.",
          difficulty: "medium",
        },
        {
          prompt:
            "'Coral reefs depend on a delicate balance[:/,/;] too much warming kills the algae reefs need, while too little sunlight starves that same algae.'",
          walkthrough:
            "Step 1: 'Coral reefs depend on a delicate balance' is a complete independent clause introducing an abstract idea ('a delicate balance') that needs unpacking. Step 2: What follows explains what that balance actually consists of, in two parts joined by 'while.' Step 3: A colon correctly signals 'here's what that balance means,' even though what follows is a more complex, two-part explanation rather than a short phrase.",
          answer:
            "A colon is correct — it introduces the explanation of what the 'delicate balance' named in the first clause actually is.",
          difficulty: "medium",
        },
        {
          prompt:
            "'The archive's newest acquisition is remarkable for a simple reason[:/,/;] it is the only surviving copy of the pamphlet, the printer's original plates having been destroyed in a fire decades ago.'",
          walkthrough:
            "Step 1: 'The archive's newest acquisition is remarkable for a simple reason' is independent and sets up an expectation: what is that reason? Step 2: What follows, 'it is the only surviving copy of the pamphlet,' directly answers that expectation — it's the reason itself, not a separate, only-loosely-related fact, which rules out a plain comma (which would create a run-on) and favors the colon's 'here's the reason' function over a semicolon's 'separate but related' function. Step 3: The trailing modifier about the printer's plates is nonessential background and doesn't change which mark belongs right after 'reason.'",
          answer:
            "A colon is correct — what follows directly answers the 'simple reason' the first clause promises, the exact relationship a colon is used to signal.",
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
          prompt: "'The list of items ______ long.'",
          walkthrough:
            "Step 1: Identify the true subject. Cross out the prepositional phrase 'of items' — it's not the subject, just a modifier. Step 2: What remains is 'The list ______ long,' making 'list' (singular) the true subject, not 'items' (plural). Step 3: A singular subject requires a singular verb: 'is,' not 'are.'",
          answer: "'Is' is correct because the true subject is the singular noun 'list,' not the plural noun 'items' inside the prepositional phrase.",
          difficulty: "easy",
        },
        {
          prompt: "'The collection of rare manuscripts ______ housed in a climate-controlled room.'",
          walkthrough:
            "Step 1: Cross out 'of rare manuscripts' — it's just extra description, not the subject. Step 2: What remains is 'The collection ______ housed,' making 'collection' (singular) the true subject, not 'manuscripts' (plural). Step 3: A singular subject needs a singular verb: 'is,' not 'are.'",
          answer: "'Is' is correct because the true subject is the singular noun 'collection,' not the plural noun 'manuscripts' tucked inside the descriptive phrase.",
          difficulty: "medium",
        },
        {
          prompt: "'The box of old photographs ______ in the attic.'",
          walkthrough:
            "Step 1: Cross out 'of old photographs' — it's a modifier, not the subject. Step 2: What remains is 'The box ______ in the attic,' making 'box' (singular) the true subject, not 'photographs' (plural). Step 3: A singular subject needs a singular verb: 'sits,' not 'sit.'",
          answer: "'Sits' is correct because the true subject is the singular noun 'box,' not the plural noun 'photographs' inside the prepositional phrase.",
          difficulty: "easy",
        },
        {
          prompt: "'The results of the survey conducted across all twelve regions ______ still being reviewed by the committee.'",
          walkthrough:
            "Step 1: Cross out both modifying phrases — 'of the survey' and 'conducted across all twelve regions' — neither is the subject. Step 2: What remains is 'The results ______ still being reviewed,' making 'results' (plural) the true subject, not the nearby singular 'survey.' Step 3: A plural subject needs a plural verb: 'are,' not 'is.'",
          answer: "'Are' is correct because the true subject is the plural noun 'results,' not the singular 'survey' buried inside the modifying phrase.",
          difficulty: "medium",
        },
        {
          prompt: "'The committee ______ divided on how to proceed, with several members favoring a different plan than the majority.'",
          walkthrough:
            "Step 1: 'Committee' is a collective noun — in standard American usage, it's treated as singular even when the sentence describes disagreement among the individuals within it. Step 2: The phrase 'with several members favoring a different plan' might tempt a plural verb, since the sentence literally describes internal division among people — but the grammatical subject is still 'the committee' as one unit, not 'the members.' Step 3: Choose the singular verb, matching the collective noun as a single entity.",
          answer: "'Is' is correct in standard American usage because 'committee' is treated as a singular collective noun, even though the sentence describes disagreement among its individual members.",
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
          prompt: "'She enjoys hiking, swimming, and ______.'",
          walkthrough:
            "Step 1: Identify the form used so far: 'hiking' and 'swimming' are both -ing (gerund) forms. Step 2: The third item in the list must match this same -ing form to maintain parallel structure. Step 3: Reject 'to bike' (infinitive form) and 'bikes' (plain verb form) since neither matches the established -ing pattern; 'biking' is correct.",
          answer: "'Biking' is correct because it matches the -ing form established by 'hiking' and 'swimming' earlier in the list.",
          difficulty: "easy",
        },
        {
          prompt: "'The workshop taught participants how to negotiate contracts, resolve disputes, and ______ effective teams.'",
          walkthrough:
            "Step 1: Identify the form used so far: after 'how to,' the list uses plain verb forms — 'negotiate' and 'resolve,' not 'negotiating' or 'to resolve.' Step 2: The third item must match that same plain-verb form to stay parallel. Step 3: Reject 'building' (an -ing form) since it breaks the pattern set by the first two items; 'build' matches.",
          answer: "'Build' is correct because it matches the plain verb form established by 'negotiate' and 'resolve' earlier in the list.",
          difficulty: "medium",
        },
        {
          prompt: "'The workshop covers writing clear emails, giving effective feedback, and ______.'",
          walkthrough:
            "Step 1: Identify the form used so far: 'writing' and 'giving' are both -ing forms. Step 2: The third item must match this same -ing form. Step 3: Reject 'to lead' (infinitive) or 'leads' (plain verb) since neither matches the established -ing pattern; 'leading' is correct.",
          answer: "'Leading' is correct because it matches the -ing form established by 'writing' and 'giving' earlier in the list.",
          difficulty: "easy",
        },
        {
          prompt: "'The new policy was designed not only to reduce costs but also ______ employee satisfaction.'",
          walkthrough:
            "Step 1: Identify the form used in the first half of the 'not only... but also' comparison: 'to reduce' is an infinitive. Step 2: The second half must match this same infinitive form. Step 3: Reject 'improving' (gerund) or 'improves' (plain verb), since neither matches 'to reduce'; 'to improve' is correct.",
          answer: "'To improve' is correct because it matches the infinitive form ('to reduce') established in the first half of the 'not only... but also' comparison — parallel structure applies to comparisons, not just lists.",
          difficulty: "medium",
        },
        {
          prompt: "'The report concluded that the delays were caused by outdated equipment, that funding had been mismanaged for years, and ______.'",
          walkthrough:
            "Step 1: Identify the form used by the first two items: both are full 'that + clause' structures. Step 2: The third item must match this same 'that + clause' shape, not shrink into a shorter noun phrase. Step 3: Reject a choice like 'declining staff morale' (a noun phrase) since it breaks the parallel 'that...' structure, even though it's grammatical on its own; 'that morale among staff had declined sharply' matches.",
          answer: "'That morale among staff had declined sharply' is correct because it matches the 'that + clause' structure of the first two items — a shorter noun phrase would be grammatical alone but breaks the parallel pattern across the whole list.",
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
          prompt: "'Each of the students submitted ______ essay by the deadline.'",
          walkthrough:
            "Step 1: Identify the antecedent: 'each' (not 'students,' which is inside a prepositional phrase modifying 'each'). Step 2: 'Each' is grammatically singular, even though it refers to a group of students individually. Step 3: The pronoun must agree with 'each' in number: singular ('his or her'), not plural ('their').",
          answer: "'His or her' is correct in formal written English because 'each' is a singular antecedent, despite referring to multiple students individually.",
          difficulty: "easy",
        },
        {
          prompt: "'Neither of the twins finished ______ homework before dinner.'",
          walkthrough:
            "Step 1: Identify the antecedent: 'neither' (not 'twins,' which sits inside a prepositional phrase describing 'neither'). Step 2: 'Neither' is grammatically singular, even though it's talking about two people. Step 3: The pronoun must agree with 'neither' in number: singular ('his or her'), not plural ('their').",
          answer: "'His or her' is correct in formal usage because 'neither' is a singular antecedent, despite describing two people.",
          difficulty: "medium",
        },
        {
          prompt: "'Every applicant must submit ______ portfolio by Friday.'",
          walkthrough:
            "Step 1: Identify the antecedent: 'every applicant.' Step 2: 'Every,' like 'each,' is grammatically singular, even though it refers to a whole group of applicants individually. Step 3: The pronoun must agree in number: singular ('his or her'), not plural ('their').",
          answer: "'His or her' is correct in formal written English because 'every' makes the antecedent singular, despite referring to a whole group of applicants.",
          difficulty: "easy",
        },
        {
          prompt: "'When Maria told her sister about the award, she was thrilled.'",
          walkthrough:
            "Step 1: Identify what 'she' could refer to — both 'Maria' and 'her sister' are grammatically possible antecedents. Step 2: Nothing else in the sentence clarifies which one felt thrilled — this is a genuine ambiguity, not a number-agreement issue. Step 3: The fix isn't about singular vs. plural at all; it's recognizing the sentence needs to name which woman was thrilled rather than leave 'she' to guess from.",
          answer: "The pronoun 'she' is ambiguous — it could refer to Maria or her sister, and nothing in the sentence clarifies which. The fix is to name the person directly, a different problem from singular/plural agreement.",
          difficulty: "medium",
        },
        {
          prompt: "'Either the manager or the interns will need to submit ______ report by Monday.'",
          walkthrough:
            "Step 1: Recognize this is an 'either... or' compound subject, not a simple 'and' list — with 'or'/'nor,' the pronoun agrees with whichever subject is CLOSER to it, not automatically the first one listed. Step 2: Since 'the interns' (plural) is nearer to the blank, the pronoun should be plural. Step 3: Reject a singular pronoun just because 'the manager' appears first in the sentence — proximity to the blank, not order of appearance, determines agreement here.",
          answer: "'Their' is correct because with 'either... or' compound subjects, the pronoun agrees with the CLOSER subject ('the interns,' plural), not the one that happens to appear first ('the manager,' singular).",
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
          prompt: "'By the time the store closed, the clerk ______ every shelf twice.'",
          walkthrough:
            "Step 1: Identify the timeline — two past events, and restocking happened BEFORE closing. Step 2: When one past event happens before another past event, the earlier one needs the past perfect tense ('had' + past participle), not simple past. Step 3: 'Had restocked' correctly shows the restocking was already complete by the time the store closed; simple past 'restocked' would blur which action came first.",
          answer: "'Had restocked' is correct because the past perfect tense signals the restocking was already finished before the store closed — the earlier of two past actions needs its own past-perfect marker.",
          difficulty: "easy",
        },
        {
          prompt: "'The museum's newest wing, completed last spring, ______ over 200,000 visitors since opening.'",
          walkthrough:
            "Step 1: Identify the timeline signal — 'since opening' specifically points to present perfect tense, an action that started at a past point and continues to matter up to now. Step 2: 'Has welcomed' correctly uses present perfect to match 'since.' Step 3: Reject simple past 'welcomed,' which suggests one completed event and doesn't pair grammatically with 'since.'",
          answer: "'Has welcomed' is correct because 'since opening' signals present perfect tense; simple past 'welcomed' doesn't pair correctly with 'since.'",
          difficulty: "easy",
        },
        {
          prompt: "'After years of research, the team finally managed ______ a working prototype.'",
          walkthrough:
            "Step 1: This isn't about timeline — it's about which form 'managed' grammatically requires after it. Step 2: 'Manage' is one of many verbs that must be followed by 'to + verb' (an infinitive), not the '-ing' form — compare to 'enjoy,' which instead requires the '-ing' form ('enjoy building,' not 'enjoy to build'). Step 3: 'To build' is correct after 'managed'; 'building' would be an error here even though it sounds natural in other contexts.",
          answer: "'To build' is correct because 'managed' requires an infinitive after it, not the '-ing' form — a specific-verb rule to memorize, not a timeline issue.",
          difficulty: "medium",
        },
        {
          prompt: "'A decade after first publishing his theory, the physicist ______ additional evidence that ultimately confirmed it.'",
          walkthrough:
            "Step 1: Identify the timeline — 'a decade after first publishing' places us at one specific later point, and the sentence describes a single action (gathering evidence) happening AT that point, not two separate past events and not something continuing to now. Step 2: Since this is one completed action at one specific past time, simple past fits — not 'had gathered' (which would wrongly imply this happened before some other past event already mentioned) and not 'has gathered' (which would wrongly imply relevance continuing to now). Step 3: 'Gathered' (simple past) is correct.",
          answer: "'Gathered' (simple past) is correct because the sentence describes one completed action at one specific past point — not two past events needing 'had,' and not an ongoing-to-now action needing 'has.'",
          difficulty: "medium",
        },
        {
          prompt: "'Having ______ the same experiment for the third time, the researchers finally decided ______ their original hypothesis entirely.'",
          walkthrough:
            "Step 1: The first blank follows 'Having,' which requires a past participle to form a perfect participial phrase showing a completed action before the main clause — 'Having repeated,' not 'having repeat' or 'having repeating.' Step 2: The second blank follows 'decided,' a verb that (like 'managed' above) requires an infinitive afterward, not a gerund — 'decided to abandon,' not 'decided abandoning.' Step 3: Each blank follows its own specific rule, and mixing up which rule applies to which blank is the real difficulty here.",
          answer: "'Having repeated' and 'decided to abandon' are correct: 'having' requires a past participle to form a completed-action phrase, while 'decided' requires a following infinitive — two different form-selection rules applied within the same sentence.",
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
          prompt: "'______, the museum's new wing finally opened to visitors.' Which opening correctly avoids a dangling modifier: 'After years of delays' or 'Delaying the project for years'?",
          walkthrough:
            "Step 1: Identify what the modifier should logically describe — whatever caused or experienced the delay. Step 2: 'The museum's new wing' is the subject right after the comma. Step 3: 'The museum's new wing' makes sense as something that existed through years of delays (a state), not as something that was itself doing the delaying (an action) — 'delaying the project' would illogically suggest the wing delayed itself. 'After years of delays' doesn't require the following subject to be performing an action, so it pairs correctly.",
          answer: "'After years of delays' is correct — it doesn't require the following subject to be the one performing an action, unlike 'Delaying the project for years,' which would illogically suggest the museum wing delayed itself.",
          difficulty: "easy",
        },
        {
          prompt: "'______, the ancient manuscript was carefully restored.' Which opening correctly avoids a dangling modifier: 'Discovered in a monastery archive' or 'Discovering it in a monastery archive'?",
          walkthrough:
            "Step 1: Identify what 'discovered' or 'discovering' should logically describe — the manuscript itself, since it's the thing that was found. Step 2: The subject right after the comma is 'the ancient manuscript.' Step 3: 'Discovered in a monastery archive' correctly matches, since the manuscript is the one being discovered, not doing the discovering. 'Discovering it in a monastery archive' would illogically suggest the manuscript discovered itself.",
          answer: "'Discovered in a monastery archive' is correct — the manuscript is the one that was found, so the modifier needs the passive form 'discovered,' matching what the following subject experienced, not performed.",
          difficulty: "easy",
        },
        {
          prompt: "'______, the results took the research team by surprise.' Which opening correctly avoids a dangling modifier: 'After analyzing the data for months' or 'After the data was analyzed for months'?",
          walkthrough:
            "Step 1: Identify what 'analyzing' should logically describe — the research team is the one doing the analyzing, not 'the results.' Step 2: Check the subject immediately after the comma: 'the results' — this is NOT the team, so a modifier requiring an active 'analyzing' subject would dangle, since results can't analyze data. Step 3: 'After the data was analyzed for months' removes the mismatch entirely, since it describes a completed process rather than an actor, pairing safely with 'the results' as the subject.",
          answer: "'After the data was analyzed for months' is correct — 'After analyzing the data' would require the team, not 'the results,' to be the very next subject, since the team is who did the analyzing.",
          difficulty: "medium",
        },
        {
          prompt: "'Frustrated by years of rejection, the manuscript was finally accepted by a small press.' Does this sentence contain a dangling modifier, and if so, what's the fix?",
          walkthrough:
            "Step 1: Identify what 'frustrated by years of rejection' logically describes — a person capable of feeling frustration, not an object. Step 2: The subject right after the comma is 'the manuscript' — but a manuscript cannot feel frustration; only the author could be frustrated. Step 3: This is a dangling modifier — the sentence needs the author, not the manuscript, as the subject immediately following the modifier, such as 'Frustrated by years of rejection, the author finally found a small press willing to accept the manuscript.'",
          answer: "Yes, this is a dangling modifier — 'frustrated' describes a person's feeling, but 'the manuscript' (an object) can't feel frustration; the author needs to be the subject right after the modifier instead.",
          difficulty: "medium",
        },
        {
          prompt: "A report states budget concerns were raised in an earlier meeting. A later sentence reads: 'Having ignored those same concerns months earlier, the proposal was resubmitted without any changes.' Does this sentence contain a dangling modifier?",
          walkthrough:
            "Step 1: Identify what 'having ignored those concerns' logically describes — whoever chose to disregard the budget concerns, i.e., a person or group (like the proposal's authors), not the proposal itself. Step 2: The subject right after the comma is 'the proposal' — but a proposal can't ignore anything; only people can. Step 3: This is a dangling modifier, even though it isn't the very first sentence of the passage — the rule applies the same way regardless of where in a passage it appears. The fix requires naming the people who ignored the concerns, e.g., 'Having ignored those same concerns months earlier, the proposal's authors resubmitted it without any changes.'",
          answer: "Yes — 'having ignored' requires a subject capable of ignoring something, but 'the proposal' can't ignore anything; only the people who wrote it could. This dangling-modifier pattern applies to any sentence in a passage, not just the first one.",
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
          prompt:
            "'The committee, [reviewing/reviewed/reviews] every application twice, still could not reach a unanimous decision.'",
          walkthrough:
            "Step 1: Find the sentence's one finite main verb: 'could not reach.' Step 2: Since that spot is already filled, the phrase between the commas needs a non-finite form describing the committee's action, not a second finite verb. Step 3: 'Reviewing' (a participle) correctly modifies 'the committee' without competing for the role of main verb; 'reviewed' or 'reviews' would each wrongly try to act as a second finite verb, creating a run-on.",
          answer: "'Reviewing' is correct — the sentence already has its finite main verb ('could not reach'), so this spot needs a non-finite participle.",
          difficulty: "easy",
        },
        {
          prompt: "'The scientists hoped [to discover/discovering/discovered] a treatment before the funding expired.'",
          walkthrough:
            "Step 1: 'Hoped' is the sentence's finite main verb. Step 2: 'Hoped' specifically requires an infinitive to complete its meaning (hoped to do something), not a gerund or a second finite verb. Step 3: 'To discover' is the correct non-finite infinitive form; 'discovering' would be the right form after a different verb (like 'avoided'), and 'discovered' would wrongly create a second finite verb.",
          answer: "'To discover' is correct — 'hoped' specifically takes an infinitive to complete its meaning.",
          difficulty: "easy",
        },
        {
          prompt: "'Nobody could explain [why the machine had stopped/why had the machine stopped] so abruptly.'",
          walkthrough:
            "Step 1: 'Why the machine had stopped' functions as a noun clause — the object of 'explain' — not a standalone question. Step 2: An embedded clause like this uses ordinary statement word order: subject ('the machine') before its verb ('had stopped'), no inversion. Step 3: 'Why had the machine stopped' incorrectly applies question-word-order inversion inside an embedded clause, which is only correct for an actual standalone question ending in a question mark.",
          answer: "'Why the machine had stopped' is correct — an embedded question uses statement word order, not the inverted order of a standalone question.",
          difficulty: "medium",
        },
        {
          prompt:
            "'The engineer inspected the bridge's support beams, [finding/found] three hairline cracks that had gone unnoticed for years.'",
          walkthrough:
            "Step 1: Find the finite main verb: 'inspected.' Step 2: Since the clause already has its finite verb, the phrase after the comma needs a non-finite form to attach to it, describing what the engineer discovered while inspecting. Step 3: 'Finding' (participle) correctly attaches as a modifying phrase; 'found' would be a second finite verb with no conjunction connecting it, creating a comma splice.",
          answer: "'Finding' is correct — 'inspected' is already the finite main verb, so 'found' here would create a comma splice.",
          difficulty: "medium",
        },
        {
          prompt:
            "'Historians still debate [what caused/what did cause] the empire's sudden decline, though few dispute that its trade routes shifted dramatically in the same period.'",
          walkthrough:
            "Step 1: 'What caused the empire's sudden decline' is an embedded noun clause functioning as the object of 'debate,' not a standalone question. Step 2: Embedded clauses use statement word order — 'what caused' (subject-verb order for the embedded clause), not 'what did cause,' which inserts the 'do'-support inversion that only belongs in a standalone question. Step 3: The second half of the sentence ('though few dispute...') is a separate, correctly-formed independent clause and doesn't affect which form belongs in the first blank.",
          answer:
            "'What caused' is correct — the embedded clause needs plain statement order, without the inverted 'did' construction a standalone question would use.",
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
          prompt: "Solve for x: 5(x + 2) = 3x + 18",
          walkthrough:
            "Step 1: Distribute the 5: 5x + 10 = 3x + 18. Step 2: Move variable terms to one side by subtracting 3x from both sides: 2x + 10 = 18. Step 3: Subtract 10 from both sides: 2x = 8. Step 4: Divide by 2: x = 4.",
          answer: "x = 4, found by distributing, collecting like terms, and isolating x through inverse operations.",
          difficulty: "easy",
        },
        {
          prompt: "Solve for x: -3(x - 4) + 2 = x - 10",
          walkthrough:
            "Step 1: Distribute the -3 across the parentheses carefully: -3x + 12 + 2 = x - 10, which simplifies to -3x + 14 = x - 10. Step 2: Move variable terms to one side by adding 3x to both sides: 14 = 4x - 10. Step 3: Add 10 to both sides: 24 = 4x. Step 4: Divide by 4: x = 6.",
          answer: "x = 6, found by carefully distributing the negative sign, then collecting like terms and isolating x.",
          difficulty: "medium",
        },
        {
          prompt: "Solve for x: 3x - 4 = 11",
          walkthrough:
            "Step 1: Add 4 to both sides: 3x = 15. Step 2: Divide by 3: x = 5.",
          answer: "x = 5, found through the same two inverse operations as any straightforward isolate-the-variable equation.",
          difficulty: "easy",
        },
        {
          prompt: "Solve for x: 2(3x - 1) + 5 = 4(x + 3)",
          walkthrough:
            "Step 1: Distribute on both sides: 6x - 2 + 5 = 4x + 12, which simplifies to 6x + 3 = 4x + 12. Step 2: Subtract 4x from both sides: 2x + 3 = 12. Step 3: Subtract 3 and divide by 2: 2x = 9, so x = 4.5.",
          answer: "x = 4.5, found by distributing on both sides of the equation before combining like terms.",
          difficulty: "medium",
        },
        {
          prompt: "Solve for x: x/4 + x/6 = 5",
          walkthrough:
            "Step 1: Clear the fractions by multiplying every term by the least common denominator, 12: 12(x/4) + 12(x/6) = 12(5). Step 2: Simplify each term: 3x + 2x = 60. Step 3: Combine like terms and solve: 5x = 60, so x = 12.",
          answer: "x = 12, found by multiplying every term by the least common denominator (12) first to clear the fractions, rather than trying to combine unlike fractions directly.",
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
          prompt: "For which value of k does the equation 4x + k = 4x + 7 have no solution when k ≠ 7?",
          walkthrough:
            "Step 1: Subtract 4x from both sides: k = 7. Step 2: Notice the x-terms have fully canceled — this is the signature of a no-solution or infinite-solution scenario, not a normal equation to solve for x. Step 3: Since the problem specifies k ≠ 7, the remaining equation (k = 7) is false for any such k, meaning the original equation has no solution for any value of k except 7 itself.",
          answer: "For any k ≠ 7, the equation reduces to a false statement once the x-terms cancel, meaning there is no solution.",
          difficulty: "easy",
        },
        {
          prompt: "For which value of k does the equation 3(x + 2) = 3x + k have infinitely many solutions?",
          walkthrough:
            "Step 1: Distribute the 3 on the left: 3x + 6 = 3x + k. Step 2: Subtract 3x from both sides: 6 = k. Step 3: The x-terms have fully canceled, so everything now depends on whether the remaining statement is true or false. If k = 6, the equation becomes 6 = 6 — true no matter what x is, meaning every real number is a solution. Any other value of k would make it false, giving no solution instead.",
          answer: "k = 6 gives infinitely many solutions, since that's the only value that makes the reduced equation (6 = k) a true statement, meaning it holds for every value of x.",
          difficulty: "medium",
        },
        {
          prompt: "For which value of k does the equation 2x + 5 = 2x + k have infinitely many solutions?",
          walkthrough:
            "Step 1: Subtract 2x from both sides: 5 = k. Step 2: The x-terms have fully canceled, so the equation's truth now depends only on this remaining statement. Step 3: k = 5 makes it 5 = 5, true for every value of x — giving infinitely many solutions.",
          answer: "k = 5 gives infinitely many solutions, since it's the value that makes the reduced equation a true statement for every x.",
          difficulty: "easy",
        },
        {
          prompt: "For any value of k ≠ -12, how many solutions does the equation 5x - 3(x + 4) = 2x + k have?",
          walkthrough:
            "Step 1: Simplify the left side first — distribute and combine like terms: 5x - 3x - 12 = 2x + k, which becomes 2x - 12 = 2x + k. Step 2: The x-terms only visibly match AFTER simplifying — this is the signature of a no-solution or infinite-solution scenario, but you have to distribute first to see it. Step 3: Subtracting 2x from both sides leaves -12 = k; since the problem specifies k ≠ -12, the remaining equation is false for any such k.",
          answer: "No solution for any k ≠ -12 — the x-terms only visibly match after distributing and combining like terms first, unlike a case where matching coefficients are already obvious.",
          difficulty: "medium",
        },
        {
          prompt: "For which value of k does the equation 0.5(4x + 6) = 2x + k have infinitely many solutions?",
          walkthrough:
            "Step 1: Distribute the 0.5 on the left side: 0.5(4x) + 0.5(6) = 2x + 3. Step 2: The equation is now 2x + 3 = 2x + k — the x-terms already match. Step 3: Subtract 2x from both sides: 3 = k. For infinitely many solutions, this remaining statement needs to be true, so k = 3 gives 3 = 3.",
          answer: "k = 3 gives infinitely many solutions — distributing the decimal coefficient first (0.5 × 4x = 2x) is the extra step that reveals the matching x-terms.",
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
          prompt: "If 4x - 28 = -24, what is the value of x - 7?",
          walkthrough:
            "Step 1: Notice the equation already contains '4x,' and the target expression is 'x - 7' — dividing the entire equation by 4 would directly produce 'x - 7' on the left side. Step 2: Divide every term by 4: (4x - 28)/4 = -24/4, giving x - 7 = -6. Step 3: There's no need to solve for x itself and then subtract 7 separately — the division does both steps at once.",
          answer: "x - 7 = -6, found by dividing the entire equation by 4 directly, which produces the exact requested expression without solving for x itself first.",
          difficulty: "easy",
        },
        {
          prompt: "If 3x + 12 = 27, what is the value of x + 4?",
          walkthrough:
            "Step 1: Notice the target expression 'x + 4' is exactly the original equation divided by 3 (3x/3 = x, 12/3 = 4). Step 2: Divide every term by 3: (3x + 12)/3 = 27/3. Step 3: This gives x + 4 = 9 directly.",
          answer: "x + 4 = 9, found by dividing the whole equation by 3 to land directly on the requested expression.",
          difficulty: "easy",
        },
        {
          prompt: "If 6x - 9 = 21, what is the value of 2x - 3?",
          walkthrough:
            "Step 1: Notice '2x - 3' is exactly one-third of '6x - 9' (since 6x/3 = 2x and 9/3 = 3). Step 2: Divide the entire equation by 3: (6x - 9)/3 = 21/3. Step 3: This gives 2x - 3 = 7 directly.",
          answer: "2x - 3 = 7, found by recognizing the target expression is exactly the original equation scaled by 1/3, and dividing both sides by 3 accordingly.",
          difficulty: "medium",
        },
        {
          prompt: "If 5x + 2y = 18 and y = 4, what is the value of 5x?",
          walkthrough:
            "Step 1: Substitute y = 4 directly into the equation: 5x + 2(4) = 18, which simplifies to 5x + 8 = 18. Step 2: Subtract 8 from both sides to isolate the exact requested expression '5x': 5x = 10. Step 3: There's no need to divide by 5 and find x itself, since the question only asks for '5x,' not x.",
          answer: "5x = 10, found by substituting y = 4 and then isolating '5x' directly — dividing further to solve for x itself would be unnecessary extra work.",
          difficulty: "medium",
        },
        {
          prompt: "If 3x + 2y = 20 and x - 2y = 4, what is the value of 4x?",
          walkthrough:
            "Step 1: Notice that adding the two equations directly eliminates y: (3x + 2y) + (x - 2y) = 20 + 4, giving 4x = 24. Step 2: This happens to BE the exact requested expression already — no further work needed. Step 3: Solving for x individually (x = 6) and then multiplying by 4 would reach the same answer but requires an unnecessary extra step.",
          answer: "4x = 24, found by adding the two equations directly, which eliminates y and produces the exact requested expression in one step.",
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
          prompt: "Eight times a number is 56. Which equation represents this situation, using n for the number?",
          walkthrough:
            "Step 1: 'Eight times a number' translates directly to 8n. Step 2: 'Is' becomes the equals sign. Step 3: Put it together: 8n = 56.",
          answer: "8n = 56, translating 'times' as multiplication and 'is' as the equals sign.",
          difficulty: "easy",
        },
        {
          prompt:
            "A rabbit eats 25 calories per hour while resting. Which equation gives the total calories, C, the rabbit eats resting for h hours?",
          walkthrough:
            "Step 1: 'Per hour' signals a rate that gets multiplied by the number of hours. Step 2: Total calories = rate × time: C = 25h.",
          answer: "C = 25h — a 'per hour' rate is multiplied by the number of hours to get a total.",
          difficulty: "easy",
        },
        {
          prompt:
            "A number decreased by 12 is the same as 3 times the number. Which equation represents this situation, using n for the number?",
          walkthrough:
            "Step 1: 'A number decreased by 12' translates to n - 12 — note that 'decreased by' means the 12 comes after and is subtracted, matching the order it's spoken in. Step 2: '3 times the number' translates to 3n. Step 3: 'Is the same as' becomes the equals sign: n - 12 = 3n.",
          answer: "n - 12 = 3n — 'decreased by' keeps the same word order as spoken (the number first, then subtract 12).",
          difficulty: "medium",
        },
        {
          prompt:
            "12 less than a number is 45. Which equation represents this situation, using n for the number?",
          walkthrough:
            "Step 1: '12 less than a number' is a reversed-order phrase — despite '12' appearing first in the sentence, it's the number that comes first in the equation, with 12 subtracted from it: n - 12. Step 2: 'Is' becomes the equals sign: n - 12 = 45. Step 3: A common error is writing 12 - n instead, which reverses which quantity is being subtracted from which.",
          answer:
            "n - 12 = 45 — 'less than' reverses the spoken word order: the number comes first in the equation, even though '12' is spoken first in the sentence.",
          difficulty: "medium",
        },
        {
          prompt:
            "A plant is currently 8 centimeters tall and grows at a constant rate of 2 centimeters per week. Which equation gives the plant's height, H, after w weeks, and after how many weeks will the plant be 30 centimeters tall?",
          walkthrough:
            "Step 1: Identify the starting value (8, present even at w=0) and the rate of change (2 centimeters per week, multiplied by w). Step 2: Combine them: H = 8 + 2w. Step 3: To answer the second part, substitute H = 30 and solve: 30 = 8 + 2w, so 2w = 22, and w = 11.",
          answer:
            "H = 8 + 2w, and the plant reaches 30 cm after 11 weeks — the equation combines a fixed starting value with a rate multiplied by time, the same structure used throughout linear word problems.",
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
          prompt: "A taxi charges $3 plus $2 per mile. Which function models the cost C for m miles?",
          walkthrough:
            "Step 1: Identify the flat fee (y-intercept): $3, the amount charged even for zero miles. Step 2: Identify the rate (slope): $2 per mile, the amount added for each additional mile. Step 3: Write the function with the rate multiplying the input variable, plus the flat fee: C = 2m + 3.",
          answer: "C = 2m + 3, where 2 is the per-mile rate (slope) and 3 is the flat starting fee (y-intercept).",
          difficulty: "easy",
        },
        {
          prompt: "A water tank starts with 200 gallons and drains at a rate of 15 gallons per minute. Which function models the amount of water W remaining after m minutes?",
          walkthrough:
            "Step 1: Identify the starting value (y-intercept): 200 gallons, the amount present at m = 0. Step 2: Identify the rate (slope): 15 gallons per minute — but since the tank is draining, the amount is decreasing, so the rate needs a negative sign: -15. Step 3: Write the function: W = -15m + 200.",
          answer: "W = -15m + 200, where -15 (negative, since the tank is draining) is the rate and 200 is the starting amount.",
          difficulty: "medium",
        },
        {
          prompt: "A gym charges a $20 sign-up fee plus $15 per month. Which function models the total cost C after m months?",
          walkthrough:
            "Step 1: Identify the flat fee (y-intercept): $20, charged once regardless of months. Step 2: Identify the rate (slope): $15 per month. Step 3: Write the function: C = 15m + 20.",
          answer: "C = 15m + 20, where 15 is the monthly rate (slope) and 20 is the one-time sign-up fee (y-intercept).",
          difficulty: "easy",
        },
        {
          prompt: "A candle is 8 inches tall when lit and burns down at a rate that reduces its height by half an inch every 20 minutes. Which function models the candle's height H after t minutes?",
          walkthrough:
            "Step 1: Identify the starting value (y-intercept): 8 inches at t = 0. Step 2: Identify the rate: half an inch per 20 minutes needs converting to a per-minute rate first: 0.5 / 20 = 0.025 inches per minute — and since the candle is burning down, this rate must be negative. Step 3: Write the function: H = -0.025t + 8.",
          answer: "H = -0.025t + 8 — the tricky part is converting 'half an inch every 20 minutes' into a per-minute rate before assigning it a negative sign for the decreasing height.",
          difficulty: "medium",
        },
        {
          prompt: "A moving company charges a flat fee plus a per-mile rate. A 50-mile move costs $350, and a 120-mile move costs $560. Which function models the cost C for a move of m miles?",
          walkthrough:
            "Step 1: Unlike a scenario that states the flat fee and rate directly, here neither is given — both must be derived from two cost/mileage pairs. Step 2: Find the rate (slope) using the two data points: (560 - 350) / (120 - 50) = 210 / 70 = 3 dollars per mile. Step 3: Use the rate and one data point to find the flat fee (intercept): 350 = 3(50) + b, so b = 200. Step 4: C = 3m + 200.",
          answer: "C = 3m + 200, found by first computing the rate from two given cost/mileage pairs (like a slope-from-two-points calculation), then using that rate and one pair to solve for the flat fee.",
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
          prompt: "A line is graphed passing through the marked points (0, 3) and (2, 7). What is the y-intercept of the line?",
          walkthrough:
            "Step 1: The y-intercept is simply the point where the line crosses the y-axis, i.e., where x = 0. Step 2: The graph shows the line passing through (0, 3) — that point directly IS the y-intercept. Step 3: Read it straight off the graph, no calculation needed.",
          answer: "The y-intercept is 3 (the point (0,3)), read directly from where the line crosses the y-axis.",
          difficulty: "easy",
        },
        {
          prompt: "A line is graphed passing through the marked points (1, 2) and (3, 8). What is the slope of the line?",
          walkthrough:
            "Step 1: Pick the two clearly marked points. Step 2: Compute rise over run: (8 - 2) / (3 - 1) = 6 / 2 = 3. Step 3: Counting grid squares directly confirms it: from (1,2) to (3,8) is 2 squares right and 6 squares up, matching a slope of 3.",
          answer: "The slope is 3, found by computing rise over run between the two marked points — counting grid squares directly confirms the calculation.",
          difficulty: "easy",
        },
        {
          prompt: "A line is graphed on axes where each gridline is worth 5 units, not 1. The line crosses the y-axis exactly 2 gridlines above the origin. What is the y-intercept of the line?",
          walkthrough:
            "Step 1: Notice the axes are scaled at 5 units per gridline, not the default 1 unit — easy to miss if you count gridlines as if each were worth 1. Step 2: The line crosses the y-axis 2 gridlines up, and since each gridline = 5 units, that's 2 × 5 = 10. Step 3: The y-intercept is 10, not 2.",
          answer: "The y-intercept is 10, not 2 — since each gridline represents 5 units, the 'crossing at 2 gridlines up' must be multiplied by the scale before reporting the answer.",
          difficulty: "medium",
        },
        {
          prompt: "A line is graphed crossing the x-axis at (4, 0) and the y-axis at (0, 8). What is the slope of the line?",
          walkthrough:
            "Step 1: Identify the two marked points where the line crosses each axis: (4, 0) and (0, 8). Step 2: Compute the slope: (8 - 0) / (0 - 4) = 8 / (-4) = -2. Step 3: The line falling from upper-left to lower-right on the graph visually confirms a negative slope.",
          answer: "The slope is -2, found using the x-intercept and y-intercept as the two known points — the line's downward direction visually confirms the negative sign.",
          difficulty: "medium",
        },
        {
          prompt: "A line is graphed on axes where each gridline represents 3 units. The line passes through the marked points (1 gridline right, 4 gridlines up) and (3 gridlines right, 2 gridlines up) from the origin. What is the y-intercept of the line, in actual units?",
          walkthrough:
            "Step 1: Convert grid positions to actual coordinates using the scale (3 units per gridline): the two points become (3, 12) and (9, 6). Step 2: Compute the slope: (6 - 12) / (9 - 3) = -6 / 6 = -1. Step 3: Use one point and the slope to solve for the y-intercept: 12 = -1(3) + b, so b = 15. Step 4: This value isn't a point directly marked on the graph — it has to be found by extending the line's equation back to x = 0.",
          answer: "The y-intercept is 15, found by first converting the grid positions to actual coordinates using the scale, computing the slope, and then solving for b, since x = 0 isn't one of the directly marked points here.",
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
          prompt: "A linear function f has f(0) = 4 and f(3) = 13. What is the slope of f?",
          walkthrough:
            "Step 1: Translate function notation into coordinate pairs: f(0) = 4 means the point (0, 4); f(3) = 13 means the point (3, 13). Step 2: Apply the slope formula: (change in output) / (change in input) = (13 - 4) / (3 - 0). Step 3: Simplify: 9 / 3 = 3.",
          answer: "The slope is 3, found by dividing the change in function output (9) by the change in input (3).",
          difficulty: "easy",
        },
        {
          prompt: "A linear function g has g(-2) = 9 and g(4) = -3. What is the slope of g?",
          walkthrough:
            "Step 1: Translate function notation into coordinate pairs: g(-2) = 9 means the point (-2, 9); g(4) = -3 means the point (4, -3). Step 2: Apply the slope formula: (change in output) / (change in input) = (-3 - 9) / (4 - (-2)). Step 3: Simplify carefully with the negative numbers: -12 / 6 = -2.",
          answer: "The slope is -2, found by dividing the change in output (-12) by the change in input (6) — the negative numbers make this a good check on sign carefulness.",
          difficulty: "medium",
        },
        {
          prompt: "A linear function h has h(1) = 7 and h(4) = 16. What is the slope of h?",
          walkthrough:
            "Step 1: Translate function notation into coordinate pairs: h(1) = 7 means (1, 7); h(4) = 16 means (4, 16). Step 2: Apply the slope formula: (16 - 7) / (4 - 1). Step 3: Simplify: 9 / 3 = 3.",
          answer: "The slope is 3, found by dividing the change in output (9) by the change in input (3).",
          difficulty: "easy",
        },
        {
          prompt: "A linear function k has k(2) = 11 and a slope of 4. What is k(5)?",
          walkthrough:
            "Step 1: Use the slope formula in reverse — each increase of 1 in input increases the output by the slope, 4. Step 2: Going from x = 2 to x = 5 is an increase of 3 in input, so the output increases by 4 × 3 = 12. Step 3: k(5) = 11 + 12 = 23.",
          answer: "k(5) = 23, found by applying the slope (4) across the 3-unit increase in input, rather than needing two given points to compute a new slope.",
          difficulty: "medium",
        },
        {
          prompt: "A linear function's values are shown in a table: when x = -3, y = 22; when x = 1, y = 10; when x = 6, y = -5. What is the slope of the function?",
          walkthrough:
            "Step 1: Any two points from a linear function's table give the same slope, so pick a convenient pair — say (-3, 22) and (1, 10). Step 2: Apply the slope formula: (10 - 22) / (1 - (-3)) = -12 / 4 = -3. Step 3: Checking with the third point, from (1, 10) to (6, -5): (-5 - 10) / (6 - 1) = -15 / 5 = -3 — the same value, confirming consistency.",
          answer: "The slope is -3, found using any two of the given points, since a linear function has one constant slope everywhere — checking with the third point confirms it.",
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
          prompt: "The function is defined by f(x) = 7x + 1. What is f(4)?",
          walkthrough: "Step 1: Substitute x = 4 into the rule: f(4) = 7(4) + 1. Step 2: Simplify: 28 + 1 = 29.",
          answer: "f(4) = 29, found by direct substitution.",
          difficulty: "easy",
        },
        {
          prompt: "The function is defined by g(x) = -3x + 10. What is g(-2)?",
          walkthrough:
            "Step 1: Substitute x = -2 into the rule, being careful with the sign: g(-2) = -3(-2) + 10. Step 2: Simplify: 6 + 10 = 16.",
          answer: "g(-2) = 16 — a negative input multiplied by a negative coefficient produces a positive term.",
          difficulty: "easy",
        },
        {
          prompt: "The function is defined by h(x) = 5x - 8. For what value of x does h(x) = 27?",
          walkthrough:
            "Step 1: Set the rule equal to the given output: 5x - 8 = 27. Step 2: Add 8 to both sides: 5x = 35. Step 3: Divide by 5: x = 7.",
          answer: "x = 7, found by setting the function's rule equal to the given output and solving the resulting equation.",
          difficulty: "medium",
        },
        {
          prompt: "The function is defined by f(x) = (2/3)x + 4. What is f(9)?",
          walkthrough:
            "Step 1: Substitute x = 9: f(9) = (2/3)(9) + 4. Step 2: Simplify the fraction times 9 first: (2/3)(9) = 6. Step 3: Add: 6 + 4 = 10.",
          answer: "f(9) = 10 — with a fractional coefficient, simplify the multiplication first before adding the constant.",
          difficulty: "medium",
        },
        {
          prompt:
            "The function is defined by k(x) = 4x - 9. If k(2n) = 15, what is the value of n?",
          walkthrough:
            "Step 1: The input here isn't a plain number but an expression, 2n — substitute it exactly as given: k(2n) = 4(2n) - 9 = 8n - 9. Step 2: Set this equal to the given output: 8n - 9 = 15. Step 3: Add 9 to both sides: 8n = 24. Step 4: Divide by 8: n = 3.",
          answer:
            "n = 3 — the input being an expression (2n) rather than a plain number doesn't change the method, just the algebra required after substituting.",
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
          prompt: "What is the slope of the line 4x + 2y = 8?",
          walkthrough:
            "Step 1: Isolate y by moving 4x to the other side: 2y = -4x + 8. Step 2: Divide every term by 2: y = -2x + 4. Step 3: Now the slope is directly readable as the coefficient of x: -2.",
          answer: "The slope is -2, found by converting to slope-intercept form first, rather than trying to read the slope directly from standard form.",
          difficulty: "easy",
        },
        {
          prompt: "What is the slope of the line 6x - 3y = 12?",
          walkthrough:
            "Step 1: Isolate y by moving 6x to the other side: -3y = -6x + 12. Step 2: Divide every term by -3, being careful with the negative signs: y = 2x - 4. Step 3: The slope is directly readable as the coefficient of x: 2.",
          answer: "The slope is 2 — note that dividing by a negative coefficient here still produces a positive slope, since both terms being divided were negative.",
          difficulty: "medium",
        },
        {
          prompt: "What is the slope of the line 2x + y = 5?",
          walkthrough:
            "Step 1: Isolate y by subtracting 2x from both sides: y = -2x + 5. Step 2: The slope is directly readable as the coefficient of x: -2.",
          answer: "The slope is -2, found by converting to slope-intercept form first.",
          difficulty: "easy",
        },
        {
          prompt: "What is the slope of the line 5x + 4y = 20?",
          walkthrough:
            "Step 1: Isolate y by moving 5x to the other side: 4y = -5x + 20. Step 2: Divide every term by 4: y = -(5/4)x + 5. Step 3: The slope is the coefficient of x: -5/4.",
          answer: "The slope is -5/4 — the fraction just needs to be carried through the division carefully rather than rounded or simplified incorrectly.",
          difficulty: "medium",
        },
        {
          prompt: "What is the slope of the line -3x - 6y = 18?",
          walkthrough:
            "Step 1: Isolate y by adding 3x to both sides: -6y = 3x + 18. Step 2: Divide every term by -6, tracking both sign flips carefully: y = -0.5x - 3. Step 3: The slope is the coefficient of x: -1/2.",
          answer: "The slope is -1/2 — dividing by a negative coefficient (-6) here means both terms flip sign at once, which is where errors tend to happen.",
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
          prompt: "Which line is perpendicular to y = (1/2)x + 3?",
          walkthrough:
            "Step 1: Identify the given slope: 1/2. Step 2: For a perpendicular line, take the negative reciprocal: flip the fraction (getting 2/1, or 2) and change the sign (making it -2). Step 3: Look for the answer choice with slope -2.",
          answer: "The line with slope -2 is perpendicular to the given line, since -2 is the negative reciprocal of 1/2.",
          difficulty: "easy",
        },
        {
          prompt: "Which line is parallel to 3x - 2y = 8?",
          walkthrough:
            "Step 1: Convert to slope-intercept form first: -2y = -3x + 8, so y = (3/2)x - 4. Step 2: The slope of the given line is 3/2. Step 3: Parallel lines share the exact same slope (unlike perpendicular lines, which need the negative reciprocal), so look for the answer choice with slope 3/2 as well.",
          answer: "A line with slope 3/2 is parallel to the given line, since parallel lines share identical slopes — this one required converting from standard form first before that comparison was even possible.",
          difficulty: "medium",
        },
        {
          prompt: "Which line is parallel to y = 4x - 1?",
          walkthrough:
            "Step 1: Identify the given slope: 4. Step 2: Parallel lines share the exact same slope. Step 3: Look for the answer choice with slope 4.",
          answer: "The line with slope 4 is parallel to the given line, since parallel lines share identical slopes.",
          difficulty: "easy",
        },
        {
          prompt: "Which line is perpendicular to 2x + 4y = 16?",
          walkthrough:
            "Step 1: Convert to slope-intercept form first: 4y = -2x + 16, so y = -0.5x + 4. Step 2: The given slope is -1/2. Step 3: For a perpendicular line, take the negative reciprocal: flip the fraction (2/1) and change the sign, giving 2.",
          answer: "The line with slope 2 is perpendicular to the given line, since 2 is the negative reciprocal of -1/2 — and this one required converting from standard form before that comparison was possible.",
          difficulty: "medium",
        },
        {
          prompt: "Two lines are given: 4x + 6y = 12 and 6x - 4y = 8. Are these two lines parallel, perpendicular, or neither?",
          walkthrough:
            "Step 1: Convert both to slope-intercept form. Line 1: 6y = -4x + 12, so y = -(2/3)x + 2, slope = -2/3. Line 2: -4y = -6x + 8, so y = (3/2)x - 2, slope = 3/2. Step 2: Check the relationship between the two slopes: the negative reciprocal of -2/3 is 3/2 (flip to 3/2, then flip the sign of the original before flipping — or just check that multiplying the two slopes gives -1). Step 3: Since the slopes are negative reciprocals of each other, the lines are perpendicular.",
          answer: "The lines are perpendicular — after converting both to slope-intercept form, their slopes (-2/3 and 3/2) are negative reciprocals of each other.",
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
          prompt: "A store's total revenue from selling notebooks is represented by y = 3x + 50, where x is the number of notebooks sold. What does the 50 represent in this equation?",
          walkthrough:
            "Step 1: Identify what multiplies x (3) versus what stands alone (50). Step 2: 3 is the coefficient of x, representing a per-notebook rate. Step 3: 50 stands alone, representing a fixed amount present even when x = 0 — revenue from some source separate from notebook sales.",
          answer: "The 50 represents a fixed amount of revenue that exists even if zero notebooks are sold, separate from the $3 earned per notebook.",
          difficulty: "easy",
        },
        {
          prompt: "The equation y = 5x + 200 models the total cost, in dollars, of renting a hall for an event with x guests. What does the 5 represent?",
          walkthrough:
            "Step 1: 5 multiplies x, making it the coefficient. Step 2: A coefficient tied to the number of guests represents a per-guest rate. Step 3: The 200, by contrast, would be the flat rental fee charged regardless of guest count.",
          answer: "The 5 represents the additional cost, in dollars, per guest.",
          difficulty: "easy",
        },
        {
          prompt: "A store sells two sizes of candles. The equation 4.51x + 6.07y = 896.86 represents last month's total sales, where x is the number of smaller candles sold and y is the number of larger candles sold. What does 6.07 represent?",
          walkthrough:
            "Step 1: Identify which variable 6.07 multiplies — y, the number of larger candles. Step 2: Since the equation totals dollar sales, this term (6.07 times the number of larger candles) must represent dollars earned specifically from larger candles. Step 3: That makes 6.07 the price of one larger candle, not the smaller candle's price (that's 4.51, tied to x) or the total (896.86).",
          answer: "6.07 represents the price, in dollars, of each larger candle — the coefficient multiplying y, the number of larger candles sold.",
          difficulty: "medium",
        },
        {
          prompt: "The equation x + y = 1,440 represents the number of minutes of daylight, x, and minutes of non-daylight, y, in a day. What does the 1,440 represent?",
          walkthrough:
            "Step 1: Notice neither x nor y is multiplied by 1,440 — it stands alone as the equation's total. Step 2: Since x and y together make up all the minutes in a day, 1,440 must represent the total number of minutes in a full day. Step 3: Reject describing it as a rate or a price, since it isn't multiplying any variable.",
          answer: "1,440 represents the total number of minutes in a full day — the fixed sum that daylight and non-daylight minutes must add up to.",
          difficulty: "medium",
        },
        {
          prompt: "A company's weekly profit is given by P = 45n - 12n - 900, where n is the number of units produced. After simplifying the equation, what does the simplified coefficient of n represent?",
          walkthrough:
            "Step 1: Before interpreting anything, simplify by combining like terms: 45n - 12n - 900 = 33n - 900. Step 2: In the original equation, 45 was per-unit revenue and 12 was per-unit cost — but the question asks about the simplified coefficient, 33, which already combines both. Step 3: 33 represents the net profit earned per unit, after per-unit revenue and per-unit cost have already been combined — not just one or the other on its own.",
          answer: "The simplified coefficient, 33, represents the net profit per unit — it already combines the per-unit revenue and per-unit cost from the original equation.",
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
          prompt:
            "A movie theater sells adult tickets for $12 each and child tickets for $8 each. Which equation shows that total ticket revenue was $840, where a is the number of adult tickets and c is the number of child tickets sold?",
          walkthrough:
            "Step 1: Each adult ticket contributes $12, so adult revenue is 12a. Step 2: Each child ticket contributes $8, so child revenue is 8c. Step 3: The two revenues together equal the given total: 12a + 8c = 840.",
          answer: "12a + 8c = 840 — each ticket type's price multiplies its variable, and the two revenue terms sum to the given total.",
          difficulty: "easy",
        },
        {
          prompt:
            "A farm has both chickens and cows. Chickens have 2 legs and cows have 4 legs. Which equation shows that the animals on the farm have a total of 172 legs, where h is the number of chickens and w is the number of cows?",
          walkthrough:
            "Step 1: Each chicken contributes 2 legs, so chicken legs total 2h. Step 2: Each cow contributes 4 legs, so cow legs total 4w. Step 3: Together they equal the given total: 2h + 4w = 172.",
          answer: "2h + 4w = 172 — each animal type's leg count multiplies its variable, summing to the given total.",
          difficulty: "easy",
        },
        {
          prompt:
            "A gym charges a one-time $50 enrollment fee plus $30 per month of membership. Which equation gives the total amount paid, T, after m months of membership?",
          walkthrough:
            "Step 1: The enrollment fee is paid once, regardless of how many months pass — it's a fixed constant, not multiplied by anything. Step 2: The monthly charge, $30, is multiplied by the number of months, m. Step 3: Combine the fixed fee and the variable monthly cost: T = 50 + 30m.",
          answer: "T = 50 + 30m — the one-time fee is a constant, while the monthly rate is multiplied by the number of months.",
          difficulty: "medium",
        },
        {
          prompt:
            "A rectangular garden's perimeter is 60 feet. Which equation relates its length, l, and width, w?",
          walkthrough:
            "Step 1: Recall the perimeter formula for a rectangle: P = 2l + 2w, since there are two lengths and two widths. Step 2: Substitute the given perimeter: 2l + 2w = 60. Step 3: This can optionally be simplified by dividing every term by 2: l + w = 30, an equally valid equivalent equation.",
          answer:
            "2l + 2w = 60 (or the simplified equivalent, l + w = 30) — built from the standard rectangle perimeter formula with the given total substituted in.",
          difficulty: "medium",
        },
        {
          prompt:
            "A chemist mixes a solution that is 20% acid with a solution that is 50% acid to create 12 liters of a mixture. Which equation shows that the resulting mixture is 30% acid, where x is the number of liters of the 20% solution and y is the number of liters of the 50% solution?",
          walkthrough:
            "Step 1: The total acid contributed by each solution is its concentration times its volume: 0.20x from the first solution, 0.50y from the second. Step 2: The final mixture's total acid content is its concentration times its total volume: 0.30(12). Step 3: Set the sum of the contributed acid equal to the final total: 0.20x + 0.50y = 0.30(12), which simplifies to 0.20x + 0.50y = 3.6.",
          answer:
            "0.20x + 0.50y = 3.6 — each solution's acid contribution (concentration times volume) sums to the final mixture's total acid content, the standard setup for a mixture problem.",
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
          prompt: "If 3x + 2y = 22 and y = 5, what is the value of x?",
          walkthrough:
            "Step 1: Substitute y = 5: 3x + 2(5) = 22, which simplifies to 3x + 10 = 22. Step 2: Subtract 10 from both sides: 3x = 12. Step 3: Divide by 3: x = 4.",
          answer: "x = 4, found by substituting the given value of y, then solving the resulting one-variable equation.",
          difficulty: "easy",
        },
        {
          prompt: "The equation 4a - b = 15 relates a and b. If a = 6, what is the value of b?",
          walkthrough:
            "Step 1: Substitute a = 6: 4(6) - b = 15, which simplifies to 24 - b = 15. Step 2: Subtract 24 from both sides: -b = -9. Step 3: Multiply both sides by -1: b = 9.",
          answer: "b = 9 — after substituting, solving for a variable with a negative coefficient requires an extra sign flip at the end.",
          difficulty: "easy",
        },
        {
          prompt:
            "A city recorded x + y = 1,440 minutes of daylight (x) and non-daylight (y) in a day. If the city had 620 minutes of daylight, how many minutes of non-daylight did it have?",
          walkthrough:
            "Step 1: Substitute x = 620 into the equation: 620 + y = 1,440. Step 2: Subtract 620 from both sides: y = 820.",
          answer: "820 minutes — substituting the known daylight value and solving for the remaining variable.",
          difficulty: "medium",
        },
        {
          prompt: "The equation 2x + 5y = 34 relates x and y. If y = 2x, what is the value of x?",
          walkthrough:
            "Step 1: Here, the 'known value' isn't a plain number but an expression in terms of the other variable — substitute y = 2x directly into the equation: 2x + 5(2x) = 34. Step 2: Simplify: 2x + 10x = 34, so 12x = 34. Step 3: Divide: x = 34/12 = 17/6.",
          answer:
            "x = 17/6 — the same substitution method works even when the 'known' relationship is an expression involving the other variable, not just a plain number.",
          difficulty: "medium",
        },
        {
          prompt:
            "A phone plan's monthly cost is modeled by C = 25 + 0.10m, where m is minutes used beyond the plan's included minutes. If a customer's bill was $52.50, how many minutes beyond the included minutes did they use?",
          walkthrough:
            "Step 1: Substitute the known cost, C = 52.50: 52.50 = 25 + 0.10m. Step 2: Subtract 25 from both sides: 27.50 = 0.10m. Step 3: Divide both sides by 0.10: m = 275.",
          answer:
            "275 minutes — substituting the known total cost into the equation and solving for the remaining variable, the same method as any one-variable equation once the known value is plugged in.",
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
          prompt: "Solve the system: x + y = 10, x - y = 2. What is x?",
          walkthrough:
            "Step 1: Notice that adding the two equations directly cancels the y-terms (since one is +y and the other is -y). Step 2: Add: (x + y) + (x - y) = 10 + 2, giving 2x = 12. Step 3: Divide by 2: x = 6.",
          answer: "x = 6, found by adding the equations directly to eliminate y without needing substitution.",
          difficulty: "easy",
        },
        {
          prompt: "Solve the system: 3x + 2y = 16, 3x - 5y = -12. What is y?",
          walkthrough:
            "Step 1: Notice both equations already have a matching 3x term, so subtracting one equation from the other will eliminate x. Step 2: Subtract carefully, distributing the negative sign across the whole second equation: (3x + 2y) - (3x - 5y) = 16 - (-12), which gives 7y = 28. Step 3: Divide by 7: y = 4.",
          answer: "y = 4, found by subtracting the two equations to eliminate x directly, since both have matching 3x coefficients.",
          difficulty: "medium",
        },
        {
          prompt: "Solve the system: x + 2y = 12, x - 2y = 4. What is x?",
          walkthrough:
            "Step 1: Notice that adding the two equations directly cancels the y-terms. Step 2: Add: (x + 2y) + (x - 2y) = 12 + 4, giving 2x = 16. Step 3: Divide by 2: x = 8.",
          answer: "x = 8, found by adding the equations directly to eliminate y.",
          difficulty: "easy",
        },
        {
          prompt: "Solve the system: y = 2x + 1, 3x + y = 16. What is x?",
          walkthrough:
            "Step 1: Notice the first equation already has y isolated — substitution is faster here than trying to force elimination. Step 2: Substitute y = 2x + 1 into the second equation: 3x + (2x + 1) = 16, giving 5x + 1 = 16. Step 3: Subtract 1 and divide by 5: x = 3.",
          answer: "x = 3, found using substitution since one equation already had y isolated — recognizing when substitution beats elimination is part of choosing the right method.",
          difficulty: "medium",
        },
        {
          prompt: "Solve the system: x + 2y = 11, 3x - y = 5. What is y?",
          walkthrough:
            "Step 1: Notice the x-coefficients don't already match (1 and 3), so direct elimination won't cancel anything yet. Step 2: Multiply the first equation by 3 so its x-coefficient matches the second: 3x + 6y = 33. Step 3: Subtract the second equation from this new version: (3x + 6y) - (3x - y) = 33 - 5, giving 7y = 28, so y = 4.",
          answer: "y = 4, found by first multiplying the first equation by 3 to match x-coefficients, since the two equations didn't already line up for direct elimination.",
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
          prompt: "How many solutions does this system have? y = 2x + 1 and y = 2x - 3",
          walkthrough:
            "Step 1: Compare the slopes: both are 2 — identical. Step 2: Compare the y-intercepts: 1 versus -3 — different. Step 3: Same slope with different intercepts means the lines are parallel and never intersect — no solution, without needing to solve anything further.",
          answer: "No solution — the lines share the same slope but have different y-intercepts, making them parallel.",
          difficulty: "easy",
        },
        {
          prompt: "How many solutions does this system have? 2x + y = 5 and 4x + 2y = 10",
          walkthrough:
            "Step 1: Convert both to slope-intercept form before comparing anything. First equation: y = -2x + 5. Second equation: 2y = -4x + 10, which simplifies to y = -2x + 5 as well. Step 2: Compare: both the slope (-2) and the y-intercept (5) match exactly — this isn't just two parallel lines, it's the exact same line written two different ways. Step 3: Same slope and same intercept means every point on the line is a solution.",
          answer: "Infinitely many solutions — both equations describe the exact same line once simplified, which is a step further than the merely-parallel (no solution) case.",
          difficulty: "medium",
        },
        {
          prompt: "How many solutions does this system have? y = 3x - 2 and y = -x + 6",
          walkthrough:
            "Step 1: Compare the slopes: 3 versus -1 — different. Step 2: Different slopes always mean exactly one solution, without needing to solve anything further.",
          answer: "Exactly one solution — the lines have different slopes, so they cross at exactly one point.",
          difficulty: "easy",
        },
        {
          prompt: "How many solutions does this system have? 2x + y = 7 and 4x + 2y = 9",
          walkthrough:
            "Step 1: Convert both to slope-intercept form first. Equation 1: y = -2x + 7. Equation 2: 2y = -4x + 9, so y = -2x + 4.5. Step 2: Compare: both have slope -2 — identical. Step 3: Compare the intercepts: 7 versus 4.5 — different. Same slope with different intercepts means the lines are parallel — no solution.",
          answer: "No solution — the lines share the same slope but have different y-intercepts, making them parallel.",
          difficulty: "medium",
        },
        {
          prompt: "How many solutions does this system have? -3x + 6y = 12 and x - 2y = -4",
          walkthrough:
            "Step 1: Convert both to slope-intercept form. Equation 1: 6y = 3x + 12, so y = 0.5x + 2. Equation 2: -2y = -x - 4, so y = 0.5x + 2. Step 2: Both the slope AND the intercept match exactly — despite looking like different equations at first glance (different coefficients, one negative), they're actually the same line (equation 1 is -3 times equation 2). Step 3: Same slope and same intercept means every point on the line is a solution.",
          answer: "Infinitely many solutions — despite looking different at first, converting both to slope-intercept form reveals they describe the exact same line.",
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
          prompt: "The graphs of two linear equations intersect at the point where x = 3 and y = 5, clearly marked on the grid. What is the solution to the system?",
          walkthrough:
            "Step 1: The solution to a system, read from a graph, is simply the point where the two lines cross. Step 2: That marked point is (3, 5). Step 3: Report the coordinates directly — no algebra needed.",
          answer: "(3, 5) is the solution, read directly from the marked intersection point.",
          difficulty: "easy",
        },
        {
          prompt: "Two lines are graphed. They cross at a marked grid point 4 units right and 2 units up from the origin. What is the solution (x, y) to the system?",
          walkthrough:
            "Step 1: Convert the grid description directly into coordinates: 4 units right means x = 4, 2 units up means y = 2. Step 2: The solution is the point where the lines actually cross, which is exactly this marked point.",
          answer: "(4, 2) is the solution, read directly from the marked intersection point.",
          difficulty: "easy",
        },
        {
          prompt: "Two lines are graphed: one crosses the y-axis at (0, 6), the other crosses the y-axis at (0, 1), and the two lines cross each other at the point (2, 4). What is the solution to the system?",
          walkthrough:
            "Step 1: A system's 'solution' specifically means the point where the two lines cross EACH OTHER, not either line's own y-intercept. Step 2: The y-intercepts, (0, 6) and (0, 1), describe where each line individually crosses the y-axis — not the answer to this question. Step 3: The solution is the shared intersection point, (2, 4).",
          answer: "(2, 4) is the solution — the two individual y-intercepts describe where each line crosses the y-axis on its own, not where the lines meet each other.",
          difficulty: "medium",
        },
        {
          prompt: "The graphs of a linear equation and a nonlinear equation are shown, intersecting at exactly one marked point where x = -1 and y = 6. What is the solution (x, y) to this system?",
          walkthrough:
            "Step 1: Even though one graph is a curve rather than a straight line, the method is identical: the solution is simply the point where the two graphs cross. Step 2: The marked intersection point is at x = -1, y = 6. Step 3: Read the coordinates directly, in the correct order.",
          answer: "(-1, 6) is the solution — the method is the same whether both graphs are lines or one is a curve: read the coordinates of the point where they cross.",
          difficulty: "medium",
        },
        {
          prompt: "The graphs of a line and a parabola are shown, crossing at two marked points: (-2, 3) and (5, 10). If the solution to the system must have a positive x-value, what is the solution (x, y)?",
          walkthrough:
            "Step 1: Notice the graphs cross at two points, since a line can intersect a curve more than once — unlike the earlier examples, which had exactly one intersection. Step 2: Apply the given constraint (positive x-value) to narrow down which point is the actual answer: (-2, 3) has a negative x-value, so it's excluded. Step 3: (5, 10) has a positive x-value and satisfies the constraint.",
          answer: "(5, 10) is the solution — with two intersection points visible, the constraint that x must be positive is what narrows it down, ruling out (-2, 3).",
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
          prompt: "Solve: -3x + 6 > 0",
          walkthrough:
            "Step 1: Subtract 6 from both sides: -3x > -6. Step 2: Divide both sides by -3 — and because we're dividing by a negative number, flip the inequality sign from > to <. Step 3: The result is x < 2.",
          answer: "x < 2 — note the inequality sign flipped because both sides were divided by a negative number.",
          difficulty: "easy",
        },
        {
          prompt: "Solve: 8 - 4x ≤ 20",
          walkthrough:
            "Step 1: Subtract 8 from both sides: -4x ≤ 12. Step 2: Divide both sides by -4 — since that's dividing by a negative number, flip the inequality sign from ≤ to ≥. Step 3: The result is x ≥ -3.",
          answer: "x ≥ -3 — the inequality sign flipped because both sides were divided by a negative number.",
          difficulty: "medium",
        },
        {
          prompt: "Solve: 5x + 2 < 17",
          walkthrough:
            "Step 1: Subtract 2 from both sides: 5x < 15. Step 2: Divide both sides by 5 — a positive number, so the sign doesn't flip. Step 3: x < 3.",
          answer: "x < 3, solved the same way as an equation since dividing by a positive number never requires a sign flip.",
          difficulty: "easy",
        },
        {
          prompt: "Solve: -2(x - 3) ≥ 10",
          walkthrough:
            "Step 1: Distribute the -2: -2x + 6 ≥ 10. Step 2: Subtract 6 from both sides: -2x ≥ 4. Step 3: Divide both sides by -2 — since that's negative, flip the inequality sign: x ≤ -2.",
          answer: "x ≤ -2 — the sign flipped because the final step divided both sides by a negative number.",
          difficulty: "medium",
        },
        {
          prompt: "Solve: 3 - 4x > 7x - 25",
          walkthrough:
            "Step 1: Move the x-terms to one side by adding 4x to both sides: 3 > 11x - 25. Step 2: Add 25 to both sides: 28 > 11x. Step 3: Divide both sides by 11 — since 11 is POSITIVE, the inequality sign does NOT flip, even though a negative coefficient (-4x) appeared earlier in the problem. Step 4: x < 28/11.",
          answer: "x < 28/11 — no sign flip is needed here, since the final division is by positive 11; a negative coefficient appearing earlier doesn't by itself require flipping the sign.",
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
          prompt: "A student needs an average of at least 90 across 4 tests to earn an A. Scores so far are 85, 92, 88. What is the minimum score needed on the 4th test?",
          walkthrough:
            "Step 1: Translate 'at least 90 average' into an inequality: (85 + 92 + 88 + x)/4 ≥ 90. Step 2: Multiply both sides by 4: 265 + x ≥ 360. Step 3: Subtract 265: x ≥ 95.",
          answer: "The student needs a score of at least 95 on the fourth test, since 'at least' translates to ≥, not a strict >.",
          difficulty: "easy",
        },
        {
          prompt: "A rider has $12. Each snack from a vending machine costs $1.75, and the rider needs to keep at least $2.50 left over for the return bus fare. What is the maximum number of snacks n the rider can buy?",
          walkthrough:
            "Step 1: Translate 'needs to keep at least $2.50' into an inequality about what's left after buying n snacks: 12 - 1.75n ≥ 2.50. Step 2: Subtract 12 from both sides: -1.75n ≥ -9.50. Step 3: Divide by -1.75 — since that's a negative number, flip the inequality sign: n ≤ 5.43 (rounded). Step 4: Since n has to be a whole number of snacks, and 5.43 snacks isn't possible, the largest whole number satisfying the inequality is 5.",
          answer: "The maximum is 5 snacks — the algebra gives n ≤ 5.43, but since n must be a whole number, 5 is the largest value that still leaves enough for the fare.",
          difficulty: "medium",
        },
        {
          prompt: "A parking garage charges $4 for the first hour and $2 for each additional hour. If a customer wants to pay no more than $16 total, what is the maximum number of additional hours a, beyond the first, they can park?",
          walkthrough:
            "Step 1: Translate 'no more than $16' into an inequality: 4 + 2a ≤ 16. Step 2: Subtract 4 from both sides: 2a ≤ 12. Step 3: Divide by 2: a ≤ 6.",
          answer: "The customer can park a maximum of 6 additional hours, since 'no more than' translates to ≤.",
          difficulty: "easy",
        },
        {
          prompt: "A shipment is rejected if it weighs more than 500 pounds. Which inequality represents the weight w, in pounds, of a shipment that will be rejected?",
          walkthrough:
            "Step 1: Translate 'more than 500 pounds' carefully — this is strictly greater than, not '500 or more.' Step 2: Use w > 500, not w ≥ 500. Step 3: Contrast with 'at least 500,' which WOULD include 500 itself (≥) — 'more than' specifically excludes the boundary value.",
          answer: "w > 500 is correct — 'more than' translates to a strict inequality, excluding 500 itself, unlike 'at least,' which would include it.",
          difficulty: "medium",
        },
        {
          prompt: "A shipping company requires packages to weigh at least 2 pounds but no more than 70 pounds to qualify for standard shipping. Which compound inequality represents the qualifying weights w, and does a 70-pound package qualify?",
          walkthrough:
            "Step 1: Translate 'at least 2 pounds' into w ≥ 2, and 'no more than 70 pounds' into w ≤ 70 — both boundary values are included. Step 2: Combine both conditions into one compound inequality: 2 ≤ w ≤ 70. Step 3: Since 70 is included by 'no more than' (≤, not a strict <), a package weighing exactly 70 pounds does qualify.",
          answer: "2 ≤ w ≤ 70, and yes, a 70-pound package qualifies, since 'no more than 70' is inclusive rather than a strict less-than.",
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
          prompt: "Does the point (3, 1) satisfy the inequality y > 2x - 4?",
          walkthrough:
            "Step 1: Substitute the point's coordinates: 1 > 2(3) - 4. Step 2: Simplify the right side: 2(3) - 4 = 2. Step 3: Check whether 1 > 2 is a true statement — it isn't.",
          answer: "No, the point does not satisfy the inequality, since substituting gives the false statement 1 > 2.",
          difficulty: "easy",
        },
        {
          prompt: "Which of the following points satisfies the inequality y ≤ -x + 5: (1, 5) or (4, 3)?",
          walkthrough:
            "Step 1: Test (1, 5): 5 ≤ -1 + 5 = 4 — this is false, since 5 is not ≤ 4. Step 2: Test (4, 3): 3 ≤ -4 + 5 = 1 — this is also false, since 3 is not ≤ 1. Step 3: Since both given points fail the test, neither satisfies the inequality — double-checking the substitution for each point confirms both results.",
          answer: "Neither point satisfies the inequality — checking each one by direct substitution shows both produce a false statement.",
          difficulty: "easy",
        },
        {
          prompt:
            "A table lists three (x, y) pairs: (0, 4), (2, 9), and (5, 15). Does every point in this table satisfy the inequality y ≥ 2x + 3?",
          walkthrough:
            "Step 1: Test (0, 4): 4 ≥ 2(0) + 3 = 3 — true. Step 2: Test (2, 9): 9 ≥ 2(2) + 3 = 7 — true. Step 3: Test (5, 15): 15 ≥ 2(5) + 3 = 13 — true. Step 4: Since all three points satisfy the inequality, the whole table is consistent with it.",
          answer: "Yes — every point in the table satisfies the inequality, since each one checks out individually when substituted in.",
          difficulty: "medium",
        },
        {
          prompt:
            "A graph shows a solid boundary line passing through (0, 2) and (4, 0), with shading below the line. Which inequality does the graph represent?",
          walkthrough:
            "Step 1: Find the boundary line's equation using its two given points: slope = (0-2)/(4-0) = -1/2, and the y-intercept is 2, giving y = -1/2 x + 2. Step 2: The line is solid, meaning the inequality includes equality (≤ or ≥, not < or >). Step 3: Test a point clearly below the line, like (0, 0): is 0 ≤ or ≥ -1/2(0) + 2 = 2? Since 0 ≤ 2 is true and (0,0) is below the line, shading below corresponds to ≤.",
          answer:
            "y ≤ -1/2 x + 2 — found by determining the boundary line's equation, then testing a point in the shaded region to confirm the inequality's direction.",
          difficulty: "hard",
        },
        {
          prompt:
            "A system consists of two inequalities. Point (2, 6) satisfies y ≥ x + 3 but not y ≤ -x + 10. Does (2, 6) satisfy the full system?",
          walkthrough:
            "Step 1: Recall that a point satisfies a system only if it satisfies every inequality in that system simultaneously. Step 2: The problem states the point fails the second inequality, y ≤ -x + 10. Step 3: Since it fails even one of the two inequalities, it cannot be a solution to the system as a whole, regardless of satisfying the first one.",
          answer:
            "No — a point must satisfy every inequality in a system to count as a solution to the system; failing even one disqualifies it, no matter how many others it satisfies.",
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
          prompt: "Factor completely: x² - 9",
          walkthrough:
            "Step 1: Recognize the shape: a single squared term minus another squared term (x² and 9 = 3²) — this is the difference-of-squares pattern. Step 2: Apply the pattern directly: a² - b² = (a-b)(a+b), with a = x and b = 3. Step 3: Write the factored form: (x-3)(x+3).",
          answer: "(x-3)(x+3), recognized instantly as a difference-of-squares pattern rather than solved through trial and error.",
          difficulty: "easy",
        },
        {
          prompt: "Factor completely: 4x² - 25",
          walkthrough:
            "Step 1: Recognize the shape, even with a coefficient present: 4x² is (2x)², and 25 is 5² — still a difference of squares, just with a squared term instead of a bare variable. Step 2: Apply the pattern directly: a² - b² = (a-b)(a+b), with a = 2x and b = 5. Step 3: Write the factored form: (2x-5)(2x+5).",
          answer: "(2x-5)(2x+5), recognized as a difference of squares once 4x² is seen as (2x)² and 25 as 5² — the coefficient just changes what 'a' is, not the pattern itself.",
          difficulty: "medium",
        },
        {
          prompt: "Factor completely: x² - 16",
          walkthrough:
            "Step 1: Recognize the shape: x² and 16 = 4² — a difference of squares. Step 2: Apply the pattern: a² - b² = (a-b)(a+b), with a = x and b = 4. Step 3: Write the factored form: (x-4)(x+4).",
          answer: "(x-4)(x+4), recognized instantly as a difference-of-squares pattern.",
          difficulty: "easy",
        },
        {
          prompt: "Factor completely: x² + 10x + 25",
          walkthrough:
            "Step 1: Check whether the middle term is twice the product of the square roots of the first and last terms: √(x²) = x, √25 = 5, and 2 × x × 5 = 10x — it matches exactly. Step 2: This confirms a perfect square trinomial: a² + 2ab + b² = (a+b)². Step 3: Write the factored form: (x+5)².",
          answer: "(x+5)², recognized as a perfect square trinomial since the middle term (10x) equals twice the product of the square roots of the first and last terms.",
          difficulty: "medium",
        },
        {
          prompt: "Factor completely: x² - 3x - 40",
          walkthrough:
            "Step 1: This doesn't match difference-of-squares or perfect-square-trinomial shapes — it needs simple trinomial factoring. Step 2: Find two numbers that multiply to -40 and add to -3: since the product is negative, the numbers have opposite signs; testing pairs, -8 and 5 work (-8 × 5 = -40, -8 + 5 = -3). Step 3: Write the factored form using these numbers: (x-8)(x+5).",
          answer: "(x-8)(x+5), found by identifying two numbers (-8 and 5) that multiply to -40 and add to -3 — the negative product signals opposite-sign factors, narrowing the search.",
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
          prompt: "Simplify the rational expression: (x² - 4)/(x - 2)",
          walkthrough:
            "Step 1: Factor the numerator: x² - 4 is a difference of squares, factoring to (x-2)(x+2). Step 2: Rewrite the fraction with the factored numerator: (x-2)(x+2) / (x-2). Step 3: Cancel the shared factor of (x-2) from top and bottom, leaving (x+2).",
          answer: "x + 2, found by factoring the numerator first and then canceling the shared factor with the denominator.",
          difficulty: "easy",
        },
        {
          prompt: "Simplify the rational expression: (x² - 5x + 6)/(x - 3)",
          walkthrough:
            "Step 1: This time the numerator isn't a difference of squares — it's a trinomial, so factor it by finding two numbers that multiply to 6 and add to -5: those numbers are -2 and -3. So x² - 5x + 6 factors to (x-2)(x-3). Step 2: Rewrite the fraction with the factored numerator: (x-2)(x-3) / (x-3). Step 3: Cancel the shared factor of (x-3) from top and bottom, leaving (x-2).",
          answer: "x - 2, found by factoring the trinomial numerator first (a different factoring move than a difference of squares), then canceling the shared (x-3) factor with the denominator.",
          difficulty: "medium",
        },
        {
          prompt: "Simplify the rational expression: (x² - 25)/(x + 5)",
          walkthrough:
            "Step 1: Factor the numerator: x² - 25 is a difference of squares, factoring to (x-5)(x+5). Step 2: Rewrite the fraction: (x-5)(x+5) / (x+5). Step 3: Cancel the shared factor of (x+5), leaving (x-5).",
          answer: "x - 5, found by factoring the numerator and canceling the shared factor with the denominator.",
          difficulty: "easy",
        },
        {
          prompt: "Simplify the rational expression: (x² - 9)/(x² + x - 6)",
          walkthrough:
            "Step 1: Factor the numerator: x² - 9 is a difference of squares, (x-3)(x+3). Step 2: Factor the denominator too this time, not just the numerator: x² + x - 6 needs two numbers multiplying to -6 and adding to 1 — those are 3 and -2, giving (x+3)(x-2). Step 3: Rewrite as (x-3)(x+3) / [(x+3)(x-2)] and cancel the shared (x+3) factor, leaving (x-3)/(x-2).",
          answer: "(x-3)/(x-2), found by factoring BOTH the numerator and denominator this time, then canceling the shared (x+3) factor between them.",
          difficulty: "medium",
        },
        {
          prompt: "Simplify the rational expression: (x² - 9)/(3 - x)",
          walkthrough:
            "Step 1: Factor the numerator as before: (x-3)(x+3). Step 2: Notice the denominator, (3-x), isn't identical to (x-3), but it IS its negative: 3 - x = -(x-3). Step 3: Rewrite the denominator as -(x-3), then cancel the shared (x-3) factor, leaving a negative sign behind: -(x+3).",
          answer: "-(x+3), found by recognizing that (3-x) is the negative of (x-3) — not a different, uncancelable factor — which lets the (x-3) terms cancel once the sign is pulled out.",
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
          prompt: "Simplify: x^5 · x^3",
          walkthrough:
            "Step 1: Both terms share the same base, x. Step 2: When multiplying same-base powers, add the exponents: 5 + 3 = 8.",
          answer: "x^8, found by adding the exponents of the two same-base factors.",
          difficulty: "easy",
        },
        {
          prompt: "Rewrite x^(1/2) using radical notation.",
          walkthrough:
            "Step 1: A rational exponent of 1/n corresponds to the nth root. Step 2: Here n = 2, so x^(1/2) means the square root of x.",
          answer: "√x — an exponent of 1/2 always means the square root.",
          difficulty: "easy",
        },
        {
          prompt: "Simplify: (x³y²)⁴ / x²",
          walkthrough:
            "Step 1: Apply the power-of-a-power rule to each factor inside the parentheses: (x³)⁴ = x^12, and (y²)⁴ = y^8, giving x^12 y^8. Step 2: Now divide by x²: since the bases match, subtract the exponents: x^(12-2) = x^10. Step 3: The y term has no matching factor to combine with in the denominator, so it stays as is: x^10 y^8.",
          answer: "x^10 y^8, applying the power rule to each factor first, then the division rule to the matching x terms.",
          difficulty: "medium",
        },
        {
          prompt: "Rewrite x^(2/3) using radical notation.",
          walkthrough:
            "Step 1: For a rational exponent m/n, the denominator n gives the root and the numerator m gives the power. Step 2: Here n = 3 (cube root) and m = 2 (squared). Step 3: x^(2/3) equals the cube root of x², or equivalently, the cube root of x, squared.",
          answer: "The cube root of x² (∛(x²)) — the denominator of the exponent gives the root, and the numerator gives the power applied to x.",
          difficulty: "medium",
        },
        {
          prompt: "If x > 0 and x^(3/4) = 8, what is the value of x?",
          walkthrough:
            "Step 1: Rewrite the rational exponent as a radical: x^(3/4) means the 4th root of x, cubed, which equals 8. Step 2: To undo the cube, take the cube root of both sides: the 4th root of x = 8^(1/3) = 2. Step 3: To undo the 4th root, raise both sides to the 4th power: x = 2^4 = 16.",
          answer:
            "x = 16 — undoing a rational exponent means applying the inverse operations in reverse order: here, cube-root first, then raise to the 4th power.",
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
          prompt: "Simplify: (2x³ - 5x + 1) + (x³ + 4x - 6)",
          walkthrough:
            "Step 1: Line up like terms by matching powers of x: (2x³ + x³) + (-5x + 4x) + (1 - 6). Step 2: Combine each group: 3x³ - x - 5.",
          answer: "3x³ - x - 5, found by combining coefficients of matching powers of x.",
          difficulty: "easy",
        },
        {
          prompt: "Expand: (x + 4)(x + 7)",
          walkthrough:
            "Step 1: Distribute each term in the first factor across the second: x(x+7) + 4(x+7). Step 2: Multiply out: x² + 7x + 4x + 28. Step 3: Combine like terms: x² + 11x + 28.",
          answer: "x² + 11x + 28.",
          difficulty: "easy",
        },
        {
          prompt: "Simplify: (5x² - 3x + 8) - (2x² - 6x + 1)",
          walkthrough:
            "Step 1: Subtracting a polynomial means distributing a negative sign across every one of its terms: 5x² - 3x + 8 - 2x² + 6x - 1 — note the middle term's sign flips from -6x to +6x. Step 2: Combine like terms: (5x² - 2x²) + (-3x + 6x) + (8 - 1). Step 3: Simplify each group: 3x² + 3x + 7.",
          answer:
            "3x² + 3x + 7 — the negative sign must be distributed across every term of the second polynomial, not just its first term.",
          difficulty: "medium",
        },
        {
          prompt: "Expand: (2x - 3)(x² + 4x - 1)",
          walkthrough:
            "Step 1: Distribute each term of the binomial across all three terms of the trinomial: 2x(x²+4x-1) - 3(x²+4x-1). Step 2: Multiply out each part: (2x³ + 8x² - 2x) + (-3x² - 12x + 3). Step 3: Combine like terms: 2x³ + (8x² - 3x²) + (-2x - 12x) + 3 = 2x³ + 5x² - 14x + 3.",
          answer: "2x³ + 5x² - 14x + 3, distributing the binomial across all three terms of the trinomial, then combining like terms.",
          difficulty: "medium",
        },
        {
          prompt: "If P(x) = 3x² - 2x + 5 and Q(x) = x² + 4x - 7, what is 2P(x) - Q(x)?",
          walkthrough:
            "Step 1: Apply the coefficient 2 to every term of P(x) first: 2P(x) = 6x² - 4x + 10. Step 2: Distribute the negative sign across every term of Q(x): -Q(x) = -x² - 4x + 7. Step 3: Add the results together, combining like terms: (6x² - x²) + (-4x - 4x) + (10 + 7) = 5x² - 8x + 17.",
          answer:
            "5x² - 8x + 17 — this combines two steps at once (scaling P by 2, then subtracting Q), so it's worth doing each transformation separately before combining, rather than trying to do both at once.",
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
          prompt: "Solve for x: x² - 3x - 10 = 0",
          walkthrough:
            "Step 1: The equation is already in 'expression = 0' form. Step 2: Look for two numbers that multiply to -10 and add to -3: -5 and 2 work (-5 × 2 = -10, -5 + 2 = -3). Step 3: Factor: (x - 5)(x + 2) = 0. Step 4: Apply the zero product property: x - 5 = 0 or x + 2 = 0, so x = 5 or x = -2.",
          answer: "x = 5 or x = -2, found by factoring into (x-5)(x+2) and setting each factor equal to zero.",
          difficulty: "easy",
        },
        {
          prompt: "Solve for d: (d - 30)(d + 30) - 7 = -7",
          walkthrough:
            "Step 1: This isn't in 'expression = 0' form yet — add 7 to both sides first: (d-30)(d+30) = 0. Step 2: The equation is now already factored, so apply the zero product property directly without expanding: d - 30 = 0 or d + 30 = 0. Step 3: Solve each: d = 30 or d = -30.",
          answer: "d = 30 or d = -30 — after isolating the product on one side, the expression was already factored, so no expansion was needed.",
          difficulty: "easy",
        },
        {
          prompt: "Solve for x: 2x² + 5x - 3 = 0",
          walkthrough:
            "Step 1: The leading coefficient isn't 1, which makes integer factoring trickier — check whether the quadratic formula is faster here. Step 2: Identify a=2, b=5, c=-3 and substitute: x = (-5 ± √(25-4(2)(-3))) / (2·2) = (-5 ± √49) / 4 = (-5 ± 7) / 4. Step 3: Compute both cases: x = 2/4 = 1/2, or x = -12/4 = -3.",
          answer: "x = 1/2 or x = -3, found with the quadratic formula since the leading coefficient of 2 makes clean integer factoring less obvious.",
          difficulty: "medium",
        },
        {
          prompt: "Solve for x: 3x² = 12x",
          walkthrough:
            "Step 1: Move everything to one side: 3x² - 12x = 0. Step 2: Factor out the greatest common factor first, before trying to factor further: 3x(x - 4) = 0. Step 3: Apply the zero product property: 3x = 0 or x - 4 = 0, giving x = 0 or x = 4.",
          answer:
            "x = 0 or x = 4 — the key step is factoring out the shared 3x first rather than dividing both sides by x, which would illegally lose the x = 0 solution.",
          difficulty: "medium",
        },
        {
          prompt: "Solve for x: x² + 6x + 4 = 0",
          walkthrough:
            "Step 1: Look for integer factors of 4 that add to 6 — none exist (1×4 and 2×2 don't add to 6), so this won't factor cleanly. Step 2: Use the quadratic formula with a=1, b=6, c=4: x = (-6 ± √(36-16)) / 2 = (-6 ± √20) / 2. Step 3: Simplify the radical: √20 = √(4·5) = 2√5, so x = (-6 ± 2√5) / 2 = -3 ± √5.",
          answer:
            "x = -3 + √5 or x = -3 - √5 — recognizing early that the expression won't factor into integers saves time otherwise spent guessing factor pairs.",
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
          prompt: "Solve for x: |x - 5| = 10",
          walkthrough:
            "Step 1: Split into two cases: x - 5 = 10, or x - 5 = -10. Step 2: Solve the first case: x = 15. Step 3: Solve the second case: x = -5.",
          answer: "x = 15 or x = -5, found by splitting the equation into its positive and negative cases.",
          difficulty: "easy",
        },
        {
          prompt: "Solve for x: |2x + 3| = 9",
          walkthrough:
            "Step 1: Split into two cases: 2x + 3 = 9, or 2x + 3 = -9. Step 2: Solve the first case: 2x = 6, so x = 3. Step 3: Solve the second case: 2x = -12, so x = -6.",
          answer: "x = 3 or x = -6.",
          difficulty: "easy",
        },
        {
          prompt: "Solve for x: |4x - 1| = -6",
          walkthrough:
            "Step 1: Before splitting into cases, check the right side: it's -6, a negative number. Step 2: An absolute value expression can never equal a negative number, no matter what x is, since absolute value always produces a result of 0 or greater. Step 3: This equation has no solution — recognizing this immediately saves the time of incorrectly splitting into two cases.",
          answer: "No solution — an absolute value can never equal a negative number, so no value of x can make this equation true.",
          difficulty: "medium",
        },
        {
          prompt: "Solve for x: 3|x + 2| - 4 = 11",
          walkthrough:
            "Step 1: Isolate the absolute value expression before splitting into cases: add 4 to both sides (3|x+2| = 15), then divide by 3 (|x+2| = 5). Step 2: Now split into two cases: x + 2 = 5, or x + 2 = -5. Step 3: Solve each: x = 3, or x = -7.",
          answer:
            "x = 3 or x = -7 — the absolute value expression must be fully isolated (no coefficient or added/subtracted term outside the bars) before splitting into cases.",
          difficulty: "medium",
        },
        {
          prompt: "Find the sum of all solutions to the equation |2x - 7| = 3x - 1.",
          walkthrough:
            "Step 1: Split into two cases as usual: 2x - 7 = 3x - 1, or 2x - 7 = -(3x - 1). Step 2: Solve the first case: -7 + 1 = 3x - 2x, so x = -6. Step 3: Solve the second case: 2x - 7 = -3x + 1, so 5x = 8, x = 8/5. Step 4: Since the right side of the original equation (3x - 1) contains a variable, each candidate solution must be checked in the original equation — substituting x = -6 gives 3(-6) - 1 = -19, but an absolute value can't equal a negative number, so x = -6 is extraneous and must be discarded. Substituting x = 8/5 checks out. Step 5: Only x = 8/5 is a valid solution, so the sum of all solutions is 8/5.",
          answer:
            "8/5 — this equation has a variable on both sides, so each candidate solution must be checked in the original equation; x = -6 turns out to be extraneous and must be thrown out.",
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
          prompt: "How many real solutions does x² + 4x + 5 = 0 have?",
          walkthrough:
            "Step 1: Identify a, b, and c: a=1, b=4, c=5. Step 2: Compute the discriminant: b² - 4ac = 16 - 4(1)(5) = 16 - 20 = -4. Step 3: Since the discriminant is negative, there are no real solutions — no further work (like attempting to factor or use the quadratic formula) is needed.",
          answer: "No real solutions, determined directly from a negative discriminant without needing to solve the equation further.",
          difficulty: "easy",
        },
        {
          prompt: "How many real solutions does 2x² - 4x + 2 = 0 have?",
          walkthrough:
            "Step 1: Identify a, b, and c: a=2, b=-4, c=2. Step 2: Compute the discriminant: b² - 4ac = 16 - 4(2)(2) = 16 - 16 = 0. Step 3: A discriminant of exactly zero is a distinct case from both the positive and negative ones — it means exactly one repeated real solution, not zero and not two.",
          answer: "Exactly one real solution (a repeated root), since the discriminant equals zero — a case worth knowing separately from 'no solutions' and 'two solutions.'",
          difficulty: "medium",
        },
        {
          prompt: "How many real solutions does x² - 6x + 8 = 0 have?",
          walkthrough:
            "Step 1: Identify a, b, and c: a=1, b=-6, c=8. Step 2: Compute the discriminant: b² - 4ac = 36 - 4(1)(8) = 36 - 32 = 4. Step 3: Since the discriminant is positive, there are two real solutions.",
          answer: "Two real solutions, determined directly from a positive discriminant.",
          difficulty: "easy",
        },
        {
          prompt: "How many real solutions does -2x² + 3x - 5 = 0 have?",
          walkthrough:
            "Step 1: Identify a, b, and c: a=-2, b=3, c=-5. Step 2: Compute the discriminant carefully with the negative values: b² - 4ac = 9 - 4(-2)(-5) = 9 - 40 = -31. Step 3: Since the discriminant is negative, there are no real solutions.",
          answer: "No real solutions — the negative coefficients make the -4ac computation a good place to double-check signs (4 × -2 × -5 = 40, a positive number being subtracted).",
          difficulty: "medium",
        },
        {
          prompt: "For what values of k does the equation x² + 6x + k = 0 have two real solutions?",
          walkthrough:
            "Step 1: Set up the discriminant using the given coefficients, with k as the unknown: b² - 4ac = 36 - 4(1)(k) = 36 - 4k. Step 2: 'Two real solutions' requires the discriminant to be strictly positive (not just non-negative, since exactly one solution needs it to equal zero), so set up the inequality: 36 - 4k > 0. Step 3: Solve for k: 36 > 4k, so k < 9.",
          answer: "k < 9 — set up the discriminant as an expression in k, then solve the strict inequality discriminant > 0, since two solutions specifically requires a positive discriminant, not zero.",
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
          prompt: "Solve for x: √(x + 3) = 5",
          walkthrough:
            "Step 1: Square both sides to eliminate the square root: x + 3 = 25. Step 2: Solve: x = 22. Step 3: Check by substituting back into the ORIGINAL equation: √(22 + 3) = √25 = 5, which matches the right side — the solution is valid, not extraneous.",
          answer: "x = 22, verified by substituting back into the original radical equation to confirm it's not an extraneous solution.",
          difficulty: "easy",
        },
        {
          prompt: "Solve for x: √(2x - 1) = x - 2",
          walkthrough:
            "Step 1: Square both sides: 2x - 1 = (x - 2)², which expands to 2x - 1 = x² - 4x + 4. Step 2: Move everything to one side: x² - 6x + 5 = 0, which factors to (x-1)(x-5) = 0, giving two candidate solutions: x = 1 and x = 5. Step 3: Check BOTH in the original equation, not just the squared one. For x = 1: left side is √(2(1)-1) = √1 = 1, but the right side is 1 - 2 = -1 — these don't match, so x = 1 is extraneous. For x = 5: left side is √(2(5)-1) = √9 = 3, and the right side is 5 - 2 = 3 — these match, so x = 5 is valid.",
          answer: "x = 5 is the only solution. x = 1 satisfies the squared version of the equation but fails the original equation, which is exactly what makes it extraneous rather than a second valid answer.",
          difficulty: "medium",
        },
        {
          prompt: "Solve for x: √(x - 2) = 4",
          walkthrough:
            "Step 1: Square both sides: x - 2 = 16. Step 2: Solve: x = 18. Step 3: Check: √(18-2) = √16 = 4, which matches — valid, not extraneous.",
          answer: "x = 18, verified by substituting back into the original equation.",
          difficulty: "easy",
        },
        {
          prompt: "Solve for x: 3√(x + 1) = 12",
          walkthrough:
            "Step 1: Before squaring, isolate the radical completely — divide both sides by 3 first: √(x+1) = 4. Step 2: Now square both sides: x + 1 = 16. Step 3: Solve: x = 15. Step 4: Check in the original equation: 3√(15+1) = 3√16 = 3(4) = 12, which matches.",
          answer: "x = 15 — the key extra step is isolating the radical (dividing by 3) BEFORE squaring; squaring too early with the 3 still attached would produce the wrong equation.",
          difficulty: "medium",
        },
        {
          prompt: "Solve for x: √(3x + 7) = x - 1",
          walkthrough:
            "Step 1: Square both sides: 3x + 7 = (x-1)² = x² - 2x + 1. Step 2: Rearrange into standard quadratic form: 0 = x² - 5x - 6, which factors to (x-6)(x+1) = 0, giving x = 6 or x = -1. Step 3: Check BOTH in the original equation. x = 6: √25 = 5, and 6-1 = 5 — matches, valid. x = -1: √4 = 2, but -1-1 = -2 — a square root can never equal a negative number, so this fails.",
          answer: "x = 6 is the only solution; x = -1 satisfies the squared quadratic but fails the original, since a square root can never equal a negative number — a useful quick check when the variable appears on both sides.",
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
          prompt: "Solve the system: y = x + 1, y = x² - 5. What is the value of x, given x > 0?",
          walkthrough:
            "Step 1: Substitute the linear expression for y into the quadratic equation: x + 1 = x² - 5. Step 2: Rearrange: 0 = x² - x - 6, which factors to (x-3)(x+2) = 0, giving x = 3 or x = -2. Step 3: Apply the constraint x > 0: keep x = 3, reject x = -2.",
          answer: "x = 3, found by substituting, factoring the resulting quadratic, and applying the given constraint to pick the correct root.",
          difficulty: "easy",
        },
        {
          prompt: "Solve the system: y = 2x, y = x² - 3x. What are the possible values of x?",
          walkthrough:
            "Step 1: Substitute y = 2x into the second equation: 2x = x² - 3x. Step 2: Move everything to one side: 0 = x² - 5x. Step 3: Factor: x(x-5) = 0, giving x = 0 or x = 5.",
          answer: "x = 0 or x = 5, found by substituting the linear expression for y into the quadratic equation and solving by factoring.",
          difficulty: "easy",
        },
        {
          prompt: "Solve the system: y = 4x, y = x² - 12. What is the value of x, given x > 0?",
          walkthrough:
            "Step 1: Substitute 4x for y: 4x = x² - 12. Step 2: Rearrange: 0 = x² - 4x - 12, which factors to (x-6)(x+2) = 0, giving x = 6 or x = -2. Step 3: Apply the constraint x > 0: keep x = 6, reject x = -2.",
          answer: "x = 6, found the same way as the easier version, just with less immediately obvious factoring.",
          difficulty: "medium",
        },
        {
          prompt: "Solve the system: x + y = 10, y = x² - 4x + 6. What is the value of x, given x < 3?",
          walkthrough:
            "Step 1: Solve the linear equation for y: y = 10 - x. Step 2: Substitute into the quadratic equation: 10 - x = x² - 4x + 6. Step 3: Rearrange: 0 = x² - 3x - 4, which factors to (x-4)(x+1) = 0, giving x = 4 or x = -1. Step 4: Apply the constraint x < 3: reject x = 4 (not less than 3), keep x = -1.",
          answer: "x = -1 — after substituting and factoring, two candidate values emerge (4 and -1), and the given constraint is what narrows it down to the correct one.",
          difficulty: "medium",
        },
        {
          prompt: "Does the system y = x + 8, y = x² + 2x + 10 have any real solutions?",
          walkthrough:
            "Step 1: Substitute the linear expression into the quadratic equation: x + 8 = x² + 2x + 10. Step 2: Rearrange into standard form: 0 = x² + x + 2. Step 3: Rather than forcing a factoring attempt, check the discriminant: 1² - 4(1)(2) = 1 - 8 = -7, which is negative. Step 4: A negative discriminant means no real solutions — the line and the parabola never intersect.",
          answer: "No real solutions — after substituting, the resulting quadratic has a negative discriminant, meaning the line and parabola never intersect; checking the discriminant is faster than forcing a factoring attempt that won't work.",
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
          prompt: "The function f is defined by f(x) = (x - 3)(x - k), where k is a constant. The graph of y = f(x) passes through the point (5, 0). What is f(0)?",
          walkthrough:
            "Step 1: 'Passes through (5, 0)' means f(5) = 0. Substitute x = 5: (5-3)(5-k) = 2(5-k) = 0, so 5 - k = 0, giving k = 5. Step 2: Now evaluate f(0) using k = 5: f(0) = (0-3)(0-5) = (-3)(-5) = 15.",
          answer: "f(0) = 15 — first solve for k using the given point (k = 5), then substitute both x = 0 and k = 5 into the function for the final answer.",
          difficulty: "easy",
        },
        {
          prompt: "The function g is defined by g(x) = (x + 2)(x - k). The graph of y = g(x) passes through (6, 0). What is g(0)?",
          walkthrough:
            "Step 1: 'Passes through (6, 0)' means g(6) = 0. Substitute x = 6: (6+2)(6-k) = 8(6-k) = 0, so 6 - k = 0, giving k = 6. Step 2: Evaluate g(0) using k = 6: g(0) = (0+2)(0-6) = 2(-6) = -12.",
          answer: "g(0) = -12, found by solving for k first, then substituting both x = 0 and the now-known k.",
          difficulty: "easy",
        },
        {
          prompt: "The function g is defined by g(x) = (x + 14)(t - x), where t is a constant. The graph of y = g(x) passes through the point (24, 0). What is g(0)?",
          walkthrough:
            "Step 1: '(24, 0)' means g(24) = 0. Substitute x = 24: (24+14)(t-24) = 38(t-24) = 0; since 38 ≠ 0, the second factor must be zero, so t = 24. Step 2: Substitute x = 0 and t = 24 into g(x) = (x+14)(t-x): g(0) = (0+14)(24-0) = 14 × 24 = 336.",
          answer: "g(0) = 336 — first solve for t using the given root, then substitute x = 0 and the now-known t back into the function.",
          difficulty: "medium",
        },
        {
          prompt: "The function h is defined by h(x) = (x - 4)(x + k). If h(2) = -6, what is the value of k?",
          walkthrough:
            "Step 1: Unlike a root (where the output is 0), here the given point tells us h(2) = -6, a nonzero value — the same substitution method still applies, just without one factor automatically equaling zero. Step 2: Substitute x = 2: (2-4)(2+k) = (-2)(2+k) = -6. Step 3: Divide both sides by -2: 2 + k = 3, so k = 1.",
          answer: "k = 1 — since the given point isn't a root this time, solving for k requires dividing through by the known factor rather than simply setting a factor equal to zero.",
          difficulty: "medium",
        },
        {
          prompt: "The function p is defined by p(x) = (x + 6)(x - m), where m is a constant. The graph of y = p(x) passes through (10, 0). What is p(-2)?",
          walkthrough:
            "Step 1: '(10, 0)' means p(10) = 0. Substitute x = 10: (10+6)(10-m) = 16(10-m) = 0; since 16 ≠ 0, 10 - m = 0, so m = 10. Step 2: Substitute x = -2 and m = 10 into p(x) = (x+6)(x-m): p(-2) = (-2+6)(-2-10) = (4)(-12) = -48. Step 3: The negative arithmetic in the second factor (-2 - 10) is the easiest place to drop a sign, so it's worth double-checking.",
          answer: "p(-2) = -48 — first solve for m using the given root (m = 10), then substitute x = -2 and m = 10 back into the function, watching the sign in (-2-10) carefully.",
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
          prompt: "The vertex of f(x) = (x-2)² + 5 is:",
          walkthrough:
            "Step 1: Match the given function to the vertex form template, a(x-h)² + k. Step 2: Identify h and k directly: since the function has (x - 2), h = 2; since it adds 5, k = 5. Step 3: The vertex is (h, k) = (2, 5), read directly with no further calculation needed.",
          answer: "(2, 5), read directly from vertex form without any calculation.",
          difficulty: "easy",
        },
        {
          prompt: "The vertex of f(x) = -2(x+3)² - 1 is:",
          walkthrough:
            "Step 1: Match to the template a(x-h)² + k. Step 2: The function has (x + 3), not (x - 3) — since the template subtracts h, this means h = -3, not h = 3. It also subtracts 1, so k = -1. Step 3: The vertex is (h, k) = (-3, -1). The negative leading coefficient (a = -2) doesn't change how h and k are read; it just means this vertex is the graph's maximum point rather than its minimum.",
          answer: "(-3, -1), read directly from vertex form — note that (x+3) means h = -3, not h = 3, since the template is written as (x - h).",
          difficulty: "medium",
        },
        {
          prompt: "The vertex of f(x) = (x-7)² + 2 is:",
          walkthrough:
            "Step 1: Match to the template a(x-h)² + k. Step 2: Since the function has (x - 7), h = 7; since it adds 2, k = 2. Step 3: The vertex is (7, 2), read directly.",
          answer: "(7, 2), read directly from vertex form.",
          difficulty: "easy",
        },
        {
          prompt: "The vertex of f(x) = 3(x+4)² is:",
          walkthrough:
            "Step 1: Match to the template a(x-h)² + k. Step 2: Since the function has (x + 4), meaning (x - (-4)), h = -4. Step 3: There's no added or subtracted constant after the squared term — that means k = 0, not that there's no k at all; the vertex's y-coordinate is exactly 0.",
          answer: "(-4, 0) — even though no constant is explicitly added, k is still 0, not absent.",
          difficulty: "medium",
        },
        {
          prompt: "A quadratic is given as y - 4 = -(x - 6)². What is the vertex of this parabola?",
          walkthrough:
            "Step 1: This isn't written in the standard y = a(x-h)² + k template yet — isolate y first by adding 4 to both sides: y = -(x-6)² + 4. Step 2: Now match to the template: h = 6, k = 4. Step 3: The vertex is (6, 4), read the same way as always, just after one rearranging step first.",
          answer: "(6, 4) — the equation needed to be rearranged into standard vertex form (adding 4 to isolate y) before the vertex could be read off directly.",
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
          prompt: "A car's value decreases by 12% each year from an initial price of $30,000. What is the value after 2 years?",
          walkthrough:
            "Step 1: Recognize this is percentage decay, not a flat dollar amount lost each year — this requires an exponential model, not a linear one. Step 2: Since the value decreases by 12% each year, 88% remains each year, giving a base of 0.88. Step 3: Apply the model: 30000 × (0.88)^2 = 30000 × 0.7744 = 23,232.",
          answer: "$23,232, found using an exponential decay model with a base of 0.88 (representing 88% remaining each year) raised to the number of years.",
          difficulty: "easy",
        },
        {
          prompt: "A population of bacteria grows by 8% every hour, starting from 500 bacteria. Which function models the population P after t hours?",
          walkthrough:
            "Step 1: Recognize this is percentage growth repeated every hour — this needs an exponential model, not a model that just adds a flat number of bacteria each hour. Step 2: Growth of 8% per hour means the base is 1 + 0.08 = 1.08, not 0.08 itself. Step 3: Write the model with the starting amount out front and the growth base raised to the number of hours: P = 500(1.08)^t.",
          answer: "P = 500(1.08)^t — 500 is the starting population and 1.08 is the growth multiplier per hour (1 + 0.08), not the raw 0.08 rate.",
          difficulty: "medium",
        },
        {
          prompt: "A population of 800 fish decreases by 5% each year. Which function models the population P after t years?",
          walkthrough:
            "Step 1: Recognize this is percentage decay — needs an exponential model. Step 2: A 5% decrease means 95% remains each year, giving a base of 0.95. Step 3: P = 800(0.95)^t.",
          answer: "P = 800(0.95)^t, using a base of 0.95 (95% remaining each year).",
          difficulty: "easy",
        },
        {
          prompt: "An investment of $2,000 earns 8% annual interest, compounded quarterly. Which function models the value V after t years?",
          walkthrough:
            "Step 1: This needs adjusting for compounding frequency — 8% is an ANNUAL rate, but interest compounds quarterly, so the rate per period is 0.08/4 = 0.02, not 0.08. Step 2: Since there are 4 compounding periods per year, the exponent must count total quarters over t years: 4t, not just t. Step 3: V = 2000(1.02)^(4t).",
          answer: "V = 2000(1.02)^(4t) — the annual rate is divided by 4 for the quarterly rate, and the exponent counts total quarters, not years.",
          difficulty: "medium",
        },
        {
          prompt: "A city's population grew from 40,000 to 44,000 over one year, and continues to grow at the same constant percentage rate each year. Which function models the population P after t years?",
          walkthrough:
            "Step 1: Since no percentage is stated directly, find the growth multiplier by dividing the new value by the original: 44,000 / 40,000 = 1.1. Step 2: This multiplier (1.1) IS the base of the exponential function directly — no need to separately identify '10%' and re-add 1. Step 3: P = 40000(1.1)^t.",
          answer: "P = 40000(1.1)^t — the growth multiplier is found directly by dividing the new population by the original, without needing to separately convert a stated percentage.",
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
          prompt: "A table shows x: -1, 0, 1, 2 with f(x): 16, 17, 18, 19. Which best describes f?",
          walkthrough:
            "Step 1: Check the differences between consecutive outputs: 17-16=1, 18-17=1, 19-18=1 — constant. Step 2: A constant added amount each step is the signature of a linear function.",
          answer: "Increasing linear — the outputs increase by a constant amount (1) each step.",
          difficulty: "easy",
        },
        {
          prompt: "A table shows x: 0, 1, 2, 3 with g(x): 5, 10, 20, 40. Which best describes g?",
          walkthrough:
            "Step 1: Check the differences first: 10-5=5, 20-10=10 — NOT constant, ruling out linear. Step 2: Check the ratios instead: 10/5=2, 20/10=2, 40/20=2 — constant. Step 3: A constant ratio is the signature of exponential growth.",
          answer: "Increasing exponential — the outputs multiply by a constant ratio (2) each step.",
          difficulty: "easy",
        },
        {
          prompt: "A table shows x: 0, 1, 2, 3 with h(x): 50, 44, 38, 32. Which best describes h?",
          walkthrough:
            "Step 1: Check the differences between consecutive outputs: 44-50=-6, 38-44=-6, 32-38=-6 — constant. Step 2: A constant added (or subtracted) amount each time is the signature of linear behavior, not exponential — even though the values are shrinking, that alone doesn't mean decay. Step 3: Confirm by checking ratios too: 44/50 ≈ 0.88, 38/44 ≈ 0.864 — NOT constant, ruling out exponential.",
          answer: "Decreasing linear — the outputs shrink by a constant amount (-6) each step, not a constant ratio, which is what actually distinguishes linear decrease from exponential decay.",
          difficulty: "medium",
        },
        {
          prompt: "A table shows x: 0, 1, 2, 3 with k(x): 200, 150, 112.5, 84.375. Which best describes k?",
          walkthrough:
            "Step 1: Check differences first: 150-200=-50, 112.5-150=-37.5 — NOT constant, ruling out linear. Step 2: Check ratios instead: 150/200=0.75, 112.5/150=0.75 — constant. Step 3: A constant ratio, even one less than 1, is the signature of exponential decay.",
          answer: "Decreasing exponential — the outputs shrink by a constant ratio (0.75) each step, confirmed by checking that the differences themselves are NOT constant first.",
          difficulty: "medium",
        },
        {
          prompt: "A table shows x: 0, 1, 2, 3 with m(x): 3, 6, 12, 20. Based on the first three values (3, 6, 12), a student concludes the function is exponential with a growth factor of 2. Is this conclusion fully supported by the table?",
          walkthrough:
            "Step 1: Check the ratio between the first two pairs: 6/3=2, 12/6=2 — this does look exponential so far, which is what tempts the quick conclusion. Step 2: But checking one more pair is essential: 20/12 ≈ 1.67, NOT 2 — the pattern breaks. Step 3: Since the ratio isn't consistently 2 across the whole table (and the differences — 3, 6, 8 — aren't constant either), two matching ratios weren't enough evidence.",
          answer: "No — the ratio holds for the first three values but breaks down between the last two (20/12 ≈ 1.67), so the table doesn't actually support a clean exponential model across all four points.",
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
          prompt: "The graph of f passes through the point (2, 5). If g(x) = f(x) + 3, what corresponding point lies on the graph of g?",
          walkthrough:
            "Step 1: g(x) = f(x) + 3 is a vertical shift — every output increases by 3, while inputs stay the same. Step 2: The point (2, 5) on f becomes (2, 5+3) = (2, 8) on g. Step 3: Only the y-coordinate changes for a vertical shift.",
          answer: "(2, 8) — a vertical shift like +3 outside the function adds directly to every output, leaving the input unchanged.",
          difficulty: "easy",
        },
        {
          prompt: "The graph of f passes through the point (4, 1). If g(x) = f(x - 2), what corresponding point lies on the graph of g?",
          walkthrough:
            "Step 1: g(x) = f(x - 2) is a horizontal shift. Step 2: To find where a point moves, add 2 to the x-coordinate (a subtraction inside shifts right): (4, 1) becomes (4+2, 1) = (6, 1). Step 3: Only the x-coordinate changes for a horizontal shift.",
          answer: "(6, 1) — a horizontal shift like f(x-2) moves the graph right by 2, so every x-coordinate increases by 2 while y stays the same.",
          difficulty: "easy",
        },
        {
          prompt: "The graph of f has a minimum point at (-3, -6). If g(x) = f(x + 5), what is the minimum point of g?",
          walkthrough:
            "Step 1: g(x) = f(x + 5) is a horizontal shift — but the PLUS sign inside shifts the graph LEFT, not right (the opposite of what the sign might suggest). Step 2: Subtract 5 from the x-coordinate of the original minimum: -3 - 5 = -8. Step 3: The y-coordinate doesn't change for a purely horizontal shift: still -6.",
          answer: "(-8, -6) — f(x+5) shifts the graph LEFT by 5, the opposite direction the plus sign might suggest; the y-coordinate stays the same.",
          difficulty: "medium",
        },
        {
          prompt: "The graph of f has a maximum point at (1, 9). If g(x) = f(x - 4) - 2, what is the maximum point of g?",
          walkthrough:
            "Step 1: This transformation combines two shifts at once: f(x-4) shifts right by 4 (horizontal), and the -2 outside shifts down by 2 (vertical). Step 2: Apply both to the original point: x-coordinate 1+4=5; y-coordinate 9-2=7. Step 3: The maximum point of g is (5, 7).",
          answer: "(5, 7) — apply the horizontal shift (right 4) and the vertical shift (down 2) to the original point separately, since they affect different coordinates.",
          difficulty: "medium",
        },
        {
          prompt: "The graph of a rational function f is shown, with a horizontal asymptote at y = 0 for x ≥ 0, starting high near x = 0 and decreasing toward that asymptote as x increases. Which best describes the graph of y = f(x) + 5, where x ≥ 0?",
          walkthrough:
            "Step 1: f(x) + 5 is a vertical shift — every point on the original graph moves up by 5, including the asymptote itself. Step 2: Since the original horizontal asymptote was at y = 0, the new graph's asymptote shifts to y = 5 — the curve now decreases toward 5 instead of toward 0. Step 3: The overall shape (still decreasing, still curving toward a horizontal asymptote) stays the same; only its vertical position, including where it levels off, moves up by 5.",
          answer: "The graph still decreases toward a horizontal asymptote, but that asymptote is now at y = 5 instead of y = 0 — every part of the curve shifts up by 5, including the level it flattens toward.",
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
          prompt: "What value does the function f(x) = 3(2)^x + 4 approach but never reach as x decreases toward negative infinity?",
          walkthrough:
            "Step 1: The constant added at the end (4) is what the function approaches, not the coefficient (3) or the base (2). Step 2: As x gets very negative, 2^x shrinks toward 0, so 3(2)^x also shrinks toward 0, leaving the function approaching just the constant. Step 3: That value, 4, is the horizontal asymptote.",
          answer: "The function approaches 4 — the constant added at the end of the expression, not the coefficient in front of the exponential term.",
          difficulty: "easy",
        },
        {
          prompt: "What is the horizontal asymptote of g(x) = -5(0.5)^x - 2?",
          walkthrough:
            "Step 1: As x increases, (0.5)^x shrinks toward 0, so -5(0.5)^x also shrinks toward 0. Step 2: This leaves the function approaching just the constant term, -2.",
          answer: "The horizontal asymptote is y = -2.",
          difficulty: "easy",
        },
        {
          prompt: "Which of the following functions has a maximum value at y = -3? I. h(x) = -4(2)^x - 3   II. k(x) = 4(2)^x - 3",
          walkthrough:
            "Step 1: Both functions share the same constant (-3), but that alone doesn't determine max vs. min — the sign of the coefficient does. Step 2: In function I, the coefficient is -4 (negative); since the base (2) is greater than 1, a negative coefficient means the function's values become more negative as x increases and approach -3 from BELOW as x decreases — making -3 a ceiling. Step 3: In function II, the coefficient is 4 (positive), so the function grows without bound as x increases and approaches -3 from ABOVE as x decreases — making -3 a floor, not a maximum.",
          answer: "Only function I has a maximum at y = -3 — its negative coefficient means the function approaches -3 from below (a ceiling), while function II's positive coefficient approaches -3 from above (a floor).",
          difficulty: "medium",
        },
        {
          prompt: "A cup of coffee's temperature, in degrees Fahrenheit, is modeled by T(t) = 70(0.9)^t + 68, where t is the number of minutes since it was poured. What temperature does the coffee approach as time goes on?",
          walkthrough:
            "Step 1: As t increases, (0.9)^t shrinks toward 0 (since 0.9 < 1), so 70(0.9)^t also shrinks toward 0. Step 2: This leaves the function approaching just the constant, 68. Step 3: In context, this matches real cooling behavior — the coffee cools toward room temperature but never quite reaches it exactly.",
          answer: "The coffee's temperature approaches 68°F — the constant term, which the model approaches as the exponential part shrinks toward 0 over time.",
          difficulty: "medium",
        },
        {
          prompt: "Two bacterial cultures are modeled by P(t) = 200(1.05)^t and Q(t) = 500(0.92)^t, where t is measured in hours. Which statement is true about their long-term behavior?",
          walkthrough:
            "Step 1: P's base (1.05) is greater than 1, meaning P grows without bound as t increases — it has no upper asymptote at all. Step 2: Q's base (0.92) is less than 1, meaning Q shrinks toward 0 as t increases, approaching (but never reaching) 0. Step 3: Putting these together: no matter how large Q's starting value (500) is compared to P's (200), P will eventually overtake Q permanently, since P keeps growing while Q keeps shrinking toward 0.",
          answer: "P eventually exceeds Q and continues growing without bound, while Q shrinks toward (but never reaches) 0 — comparing the two bases (greater than 1 vs. less than 1) determines this, regardless of which starting value was larger.",
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
          prompt: "Find the vertex of f(x) = x² - 6x + 5.",
          walkthrough:
            "Step 1: Identify a = 1, b = -6. Step 2: Compute the x-coordinate: -b/2a = -(-6)/(2·1) = 6/2 = 3. Step 3: Substitute x = 3 back into the original function to get the y-coordinate: f(3) = 9 - 18 + 5 = -4.",
          answer: "(3, -4), found using x = -b/2a for the x-coordinate, then substituting back in for the y-coordinate.",
          difficulty: "easy",
        },
        {
          prompt: "What is the minimum value of f(x) = x² + 8x + 10?",
          walkthrough:
            "Step 1: Since a = 1 is positive, the parabola opens upward, so its vertex is a minimum. Step 2: Compute the x-coordinate of the vertex: -b/2a = -8/2 = -4. Step 3: Substitute back in: f(-4) = 16 - 32 + 10 = -6. The minimum value is the vertex's y-coordinate.",
          answer: "-6 — the minimum value is the y-coordinate of the vertex, found by substituting x = -4 back into the function.",
          difficulty: "easy",
        },
        {
          prompt: "Find the vertex of g(x) = 2x² - 12x + 7.",
          walkthrough:
            "Step 1: Identify a = 2, b = -12 — don't forget to include the leading coefficient in the formula. Step 2: Compute the x-coordinate: -b/2a = -(-12)/(2·2) = 12/4 = 3. Step 3: Substitute back in: g(3) = 2(9) - 36 + 7 = 18 - 36 + 7 = -11.",
          answer: "(3, -11) — a leading coefficient other than 1 must still be included in the -b/2a formula, not dropped.",
          difficulty: "medium",
        },
        {
          prompt: "Rewrite f(x) = x² + 10x + 21 in vertex form by completing the square.",
          walkthrough:
            "Step 1: Take half of the x-coefficient and square it: (10/2)² = 25. Step 2: Add and subtract this value to rewrite the expression without changing it: x² + 10x + 25 - 25 + 21. Step 3: The first three terms form a perfect square: (x+5)² - 25 + 21 = (x+5)² - 4.",
          answer: "f(x) = (x+5)² - 4 — found by adding and subtracting the square of half the x-coefficient to create a perfect square trinomial.",
          difficulty: "medium",
        },
        {
          prompt:
            "A ball's height in feet is modeled by h(t) = -16t² + 64t + 5, where t is time in seconds after launch. What is the maximum height the ball reaches?",
          walkthrough:
            "Step 1: Since a = -16 is negative, the parabola opens downward, so its vertex is a maximum — exactly what the question is asking for. Step 2: Compute the x-coordinate (which represents time here): -b/2a = -64/(2·-16) = -64/-32 = 2. Step 3: Substitute t = 2 back into the original function: h(2) = -16(4) + 64(2) + 5 = -64 + 128 + 5 = 69.",
          answer:
            "69 feet — the maximum height is the y-coordinate of the vertex; in this context the x-coordinate (2 seconds) answers a different question (when the maximum occurs), so it's important to report the right coordinate for what's actually asked.",
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
          prompt: "The function is defined by f(x) = 2x² - 5x + 1. What is f(3)?",
          walkthrough:
            "Step 1: Substitute x = 3 into every instance of x in the function: f(3) = 2(3)² - 5(3) + 1. Step 2: Apply order of operations — exponents first: 2(9) - 5(3) + 1. Step 3: Multiply, then combine: 18 - 15 + 1 = 4.",
          answer: "f(3) = 4, found by direct substitution and careful order of operations.",
          difficulty: "easy",
        },
        {
          prompt:
            "A diver's height above the water, in feet, is modeled by H(t) = -16t² + 8t + 10, where t is time in seconds after leaving the platform. What does H(0) represent in this context?",
          walkthrough:
            "Step 1: Substitute t = 0: H(0) = -16(0) + 8(0) + 10 = 10. Step 2: In this context, t represents time since leaving the platform, so t = 0 is the instant the diver leaves it. Step 3: H(0) = 10 represents the platform's height above the water, the diver's starting height at the moment of departure.",
          answer:
            "H(0) = 10 represents the diver's starting height (the platform's height above the water) at the instant t = 0, before any time has passed.",
          difficulty: "easy",
        },
        {
          prompt: "A population is modeled by P(t) = 500(1.08)^t, where t is measured in years. What does P(0) tell you, and what is its value?",
          walkthrough:
            "Step 1: Substitute t = 0: P(0) = 500(1.08)^0. Step 2: Any nonzero number raised to the power 0 equals 1, so (1.08)^0 = 1. Step 3: P(0) = 500(1) = 500 — this is the initial population, at the very start of the time period the model describes, before any growth has occurred.",
          answer: "P(0) = 500, the initial population at t = 0, before any growth has taken place.",
          difficulty: "medium",
        },
        {
          prompt:
            "A rock's height above a canyon floor, in meters, is modeled by h(t) = -5t² + 30, where t is seconds after it's dropped. Which statement correctly interprets h(2) = 10?",
          walkthrough:
            "Step 1: Confirm the substitution is correct: h(2) = -5(4) + 30 = -20 + 30 = 10 — the given value checks out. Step 2: In context, the input (2) is a time in seconds, and the output (10) is a height in meters. Step 3: The correct interpretation connects both: 2 seconds after being dropped, the rock is 10 meters above the canyon floor — not '2 meters after 10 seconds' or any interpretation that swaps which variable is which.",
          answer:
            "2 seconds after being dropped, the rock is 10 meters above the canyon floor — the interpretation must keep the input (time) and output (height) in their correct roles.",
          difficulty: "medium",
        },
        {
          prompt:
            "An object's velocity in meters per second is modeled by v(x) = 3x² - 12x + 9, where x is the number of seconds since a sensor started recording, valid only for 0 ≤ x ≤ 5. For how many values of x in this interval is the object's velocity equal to 0?",
          walkthrough:
            "Step 1: Set the function equal to 0 and solve: 3x² - 12x + 9 = 0. Step 2: Divide every term by 3 to simplify first: x² - 4x + 3 = 0. Step 3: Factor: (x-1)(x-3) = 0, giving x = 1 or x = 3. Step 4: Check both solutions against the given domain restriction (0 ≤ x ≤ 5) — both 1 and 3 fall within it, so both are valid.",
          answer:
            "2 — both x = 1 and x = 3 make the velocity zero and both fall within the given domain, which is worth checking explicitly whenever a problem specifies a restricted interval.",
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
          prompt: "A recipe uses 2 cups of flour for 12 cookies. How many cups are needed for 30 cookies?",
          walkthrough:
            "Step 1: Set up a proportion with matching units: (cups)/(cookies) = (cups)/(cookies), giving 2/12 = x/30. Step 2: Cross-multiply: 12x = 2(30) = 60. Step 3: Divide: x = 60/12 = 5.",
          answer: "5 cups, found by setting up a proportion with matching units in matching positions before cross-multiplying.",
          difficulty: "easy",
        },
        {
          prompt: "A factory produces 45 units in 3 hours. At this rate, how many hours will it take to produce 225 units?",
          walkthrough:
            "Step 1: Set up a proportion with matching units in matching positions: (units)/(hours) = (units)/(hours), giving 45/3 = 225/x. Step 2: Cross-multiply: 45x = 3(225) = 675. Step 3: Divide: x = 675/45 = 15.",
          answer: "15 hours, found the same way as the flour example, but this time solving for the unknown in the denominator rather than the numerator.",
          difficulty: "medium",
        },
        {
          prompt: "A car uses 3 gallons of gas to travel 75 miles. How many gallons are needed to travel 200 miles?",
          walkthrough:
            "Step 1: Set up a proportion with matching units: 3/75 = x/200. Step 2: Cross-multiply: 75x = 3(200) = 600. Step 3: Divide: x = 600/75 = 8.",
          answer: "8 gallons, found by setting up a proportion with matching units before cross-multiplying.",
          difficulty: "easy",
        },
        {
          prompt: "A recipe uses 3/4 cup of sugar for 18 cookies. How many cups of sugar are needed for 30 cookies?",
          walkthrough:
            "Step 1: Set up a proportion with matching units: (3/4)/18 = x/30. Step 2: Cross-multiply carefully with the fraction: 18x = 30 × (3/4) = 22.5. Step 3: Divide: x = 22.5/18 = 1.25.",
          answer: "1.25 cups, found with the same proportion technique, just with a fractional starting quantity requiring careful cross-multiplication.",
          difficulty: "medium",
        },
        {
          prompt: "A factory's 5 machines produce 600 units in 4 hours. If 2 of the machines break down, how many units will the remaining machines produce in 6 hours, assuming each machine works at the same constant rate?",
          walkthrough:
            "Step 1: This needs an intermediate step before a final proportion — first find the rate per single machine: 600 units ÷ 5 machines ÷ 4 hours = 30 units per machine per hour. Step 2: Apply this per-machine rate to the new scenario: 3 remaining machines × 30 units/machine/hour × 6 hours. Step 3: 3 × 30 × 6 = 540 units.",
          answer: "540 units, found by first breaking the rate down to a single machine's per-hour output, then scaling that rate up to the new number of machines and hours.",
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
          prompt: "A car travels at 60 miles per hour. What is this speed in feet per minute? (1 mile = 5,280 feet)",
          walkthrough:
            "Step 1: Set up a chain of conversions where units cancel: 60 miles/hour × 5280 feet/mile × 1 hour/60 minutes. Step 2: Cancel 'miles' (appears in numerator and denominator) and 'hour' (same). Step 3: Compute what's left: (60 × 5280) / 60 = 5,280 feet per minute.",
          answer: "5,280 feet per minute, found by chaining conversion factors so that unwanted units cancel out algebraically.",
          difficulty: "easy",
        },
        {
          prompt: "A runner's pace is 9 minutes per mile. What is this pace in seconds per 100 meters? (1 mile ≈ 1,609 meters)",
          walkthrough:
            "Step 1: This needs three conversions chained together, not just one. First convert minutes to seconds: 9 min/mile × 60 sec/min = 540 sec/mile. Step 2: Convert the 'per mile' part to 'per meter' by dividing by the number of meters in a mile: 540 sec / 1,609 meters ≈ 0.336 sec/meter. Step 3: Scale up to 100 meters by multiplying: 0.336 × 100 ≈ 33.6 seconds.",
          answer: "About 33.6 seconds per 100 meters, found by chaining three conversions in sequence (minutes to seconds, miles to meters, then scaling to 100 meters) rather than trying to jump straight from minutes-per-mile to seconds-per-100-meters.",
          difficulty: "medium",
        },
        {
          prompt: "A container holds 3 liters of liquid. How many milliliters is this? (1 liter = 1,000 milliliters)",
          walkthrough:
            "Step 1: Set up the conversion: 3 liters × 1,000 milliliters/liter. Step 2: Multiply: 3 × 1,000 = 3,000 milliliters.",
          answer: "3,000 milliliters, found with a single direct conversion factor.",
          difficulty: "easy",
        },
        {
          prompt: "A rectangular room measures 4 yards by 3 yards. What is its area in square feet? (1 yard = 3 feet)",
          walkthrough:
            "Step 1: This isn't a simple linear conversion — converting an AREA means the conversion factor must be squared, not just multiplied directly. Step 2: Since 1 yard = 3 feet, 1 square yard = 3² = 9 square feet. Step 3: The room's area is 4 × 3 = 12 square yards, so in square feet: 12 × 9 = 108 square feet.",
          answer: "108 square feet — converting an area requires squaring the linear conversion factor (3² = 9), not just multiplying by 3 directly, since area is a two-dimensional measurement.",
          difficulty: "medium",
        },
        {
          prompt: "A cyclist travels at 8 meters per second. What is this speed in miles per hour, rounded to the nearest whole number? (1 mile ≈ 1,609 meters)",
          walkthrough:
            "Step 1: Convert seconds to hours first: 8 meters/second × 3,600 seconds/hour = 28,800 meters/hour. Step 2: Convert meters to miles by dividing by the meters-per-mile figure: 28,800 / 1,609 ≈ 17.9. Step 3: Rounded to the nearest whole number: 18 miles per hour.",
          answer: "About 18 miles per hour, found by chaining two conversions (seconds to hours, then meters to miles) in sequence.",
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
          prompt: "At a bakery, the ratio of loaves of bread baked to bags of flour used is 4 to 1. If f bags of flour are used, which expression represents the number of loaves baked?",
          walkthrough:
            "Step 1: Translate the ratio directly: for every 1 bag of flour, there are 4 loaves. Step 2: Loaves = 4 × flour. Step 3: With f bags of flour, that's 4f.",
          answer: "4f is correct, since for every 1 bag of flour there are 4 loaves baked.",
          difficulty: "easy",
        },
        {
          prompt: "A school's ratio of teachers to students is 1 to 22. If there are s students, which expression represents the number of teachers?",
          walkthrough:
            "Step 1: Translate the ratio directly: for every 22 students, there is 1 teacher. Step 2: Teachers = students ÷ 22. Step 3: With s students, that's s/22.",
          answer: "s/22 is correct, since there's 1 teacher for every 22 students.",
          difficulty: "easy",
        },
        {
          prompt: "At a robotics competition, the ratio of judges to teams is 1 to 8. If there are j judges at the competition, which expression represents the number of teams?",
          walkthrough:
            "Step 1: Translate the ratio directly: for every 1 judge, there are 8 teams — so teams = 8 × judges. Step 2: With j judges, that's 8j. Step 3: Reject an expression like j/8, which would reverse the ratio (representing judges in terms of a given number of teams instead).",
          answer: "8j is correct — for every 1 judge there are 8 teams, so teams = 8 times the number of judges; j/8 would be the reversed relationship.",
          difficulty: "medium",
        },
        {
          prompt: "In a bag of marbles, 3 out of every 10 marbles are blue. If the bag contains m marbles total, which expression represents the number of blue marbles?",
          walkthrough:
            "Step 1: Notice this ratio compares blue marbles to the TOTAL (3 out of every 10 total), not blue to some other specific color — a part-to-whole ratio, different from a part-to-part ratio like 'judges to teams.' Step 2: Translate directly: blue marbles = 3/10 of the total. Step 3: With m total marbles, that's (3/10)m.",
          answer: "(3/10)m is correct — since the ratio compares blue marbles to the TOTAL, the fraction is applied directly to the total m.",
          difficulty: "medium",
        },
        {
          prompt: "At a company, the ratio of managers to engineers is 1 to 6, and the ratio of engineers to interns is 3 to 10. If there are m managers, which expression represents the number of interns, in terms of m?",
          walkthrough:
            "Step 1: This requires chaining two ratios rather than reading one directly. First translate managers to engineers: engineers = 6 × managers = 6m. Step 2: Translate engineers to interns using the second ratio: since engineers:interns = 3:10, interns = (10/3) × engineers. Step 3: Substitute engineers = 6m: interns = (10/3)(6m) = 20m.",
          answer: "20m is correct, found by chaining both given ratios — first expressing engineers in terms of m, then using that expression to find interns in terms of m.",
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
          prompt: "A shirt originally $40 is discounted 25%. What is the sale price?",
          walkthrough:
            "Step 1: A 25% discount means the customer pays 100% - 25% = 75% of the original price. Step 2: Convert 75% to a multiplier: 0.75. Step 3: Multiply directly: 40 × 0.75 = 30, skipping the intermediate step of calculating the discount amount separately.",
          answer: "$30, found by multiplying directly by the 'percent remaining' multiplier (0.75) rather than calculating and subtracting the discount separately.",
          difficulty: "easy",
        },
        {
          prompt: "A wholesaler buys an item for $50 and marks it up 40% to set the retail price. What is the retail price?",
          walkthrough:
            "Step 1: A 40% markup means the retail price is 100% + 40% = 140% of the wholesale price — this is the mirror image of a discount, building up instead of subtracting. Step 2: Convert 140% to a multiplier: 1.40. Step 3: Multiply directly: 50 × 1.40 = 70.",
          answer: "$70, found by multiplying directly by the 'percent of original' multiplier (1.40) — the same technique as a discount, just added on top of 100% instead of subtracted from it.",
          difficulty: "medium",
        },
        {
          prompt: "A meal costs $60 before an 8% sales tax. What is the total cost including tax?",
          walkthrough:
            "Step 1: An 8% tax means the customer pays 100% + 8% = 108% of the meal price. Step 2: Convert to a multiplier: 1.08. Step 3: Multiply directly: 60 × 1.08 = 64.80.",
          answer: "$64.80, found by multiplying directly by the 'percent of original' multiplier (1.08).",
          difficulty: "easy",
        },
        {
          prompt: "After a 20% discount, a jacket costs $64. What was the original price?",
          walkthrough:
            "Step 1: Recognize this asks for the ORIGINAL price given the discounted price — the reverse of the usual direction. Step 2: A 20% discount means the discounted price is 80% of the original: 64 = original × 0.80. Step 3: Divide (don't multiply) to undo the discount: original = 64 / 0.80 = 80.",
          answer: "$80 — since we're given the discounted price and need the original, divide by the multiplier (0.80) rather than multiplying, reversing the usual direction of the calculation.",
          difficulty: "medium",
        },
        {
          prompt: "A $50 meal has an 18% tip added first, and then a $10 discount coupon is applied to the total. What is the final price?",
          walkthrough:
            "Step 1: Apply the operations in the stated order — tip first: 50 × 1.18 = 59. Step 2: Then apply the flat $10 discount to that new total, not to the original $50: 59 - 10 = 49. Step 3: Order matters here, since the tip is calculated on the pre-discount amount.",
          answer: "$49 — the tip is calculated on the original $50 first, and only then is the flat $10 discount subtracted; reversing the order would produce a different result.",
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
          prompt: "An item's price increases by 20% and then decreases by 20%. Compared to the original price, the final price is:",
          walkthrough:
            "Step 1: Represent the original price as 100 for simplicity. Step 2: After a 20% increase: 100 × 1.20 = 120. Step 3: After a 20% decrease applied to the NEW price of 120 (not the original 100): 120 × 0.80 = 96. Step 4: Compare 96 to the original 100 — a net 4% decrease, not zero.",
          answer: "The final price is 4% lower than the original — successive percent changes compound multiplicatively and do not cancel out to zero.",
          difficulty: "easy",
        },
        {
          prompt: "A stock's price increases by 50% one month, then decreases by 50% the next month. Compared to the original price, the final price is:",
          walkthrough:
            "Step 1: Represent the original price as 100. Step 2: After a 50% increase: 100 × 1.50 = 150. Step 3: After a 50% decrease applied to the NEW price of 150 (not the original 100): 150 × 0.50 = 75. Step 4: Compare 75 to the original 100 — a net 25% decrease, an even bigger gap than the 20%/20% case, since a 50% cut applied to the larger, already-increased value removes more than half of the original amount's worth.",
          answer: "The final price is 25% lower than the original — a starker example than 20%/20% of the same rule: equal percentage swings never fully cancel, and larger percentages create a bigger gap.",
          difficulty: "medium",
        },
        {
          prompt: "A price increases by 10% and then increases by another 10%. Compared to the original price, the final price is:",
          walkthrough:
            "Step 1: Represent the original price as 100. Step 2: After the first 10% increase: 100 × 1.1 = 110. Step 3: After the second 10% increase, applied to the NEW price of 110: 110 × 1.1 = 121. Step 4: Compare 121 to the original 100 — a 21% increase, not simply 20%.",
          answer: "The final price is 21% higher than the original — two successive 10% increases compound to slightly more than 20%, since the second increase applies to the already-larger amount.",
          difficulty: "easy",
        },
        {
          prompt: "A stock's price decreases by 30% one month, then increases by 40% the next month. Compared to the original price, the final price is:",
          walkthrough:
            "Step 1: Represent the original price as 100. Step 2: After a 30% decrease: 100 × 0.70 = 70. Step 3: After a 40% increase applied to the NEW price of 70 (not the original 100): 70 × 1.40 = 98. Step 4: Compare 98 to the original 100 — a net 2% decrease, even though the second percentage (40%) is larger than the first (30%), since it's applied to the smaller, already-decreased base.",
          answer: "The final price is 2% lower than the original — even though the increase is larger than the decrease, it's applied to a smaller base, so the two don't offset evenly.",
          difficulty: "medium",
        },
        {
          prompt: "A company's revenue increases by 10% in year one, decreases by 10% in year two, and increases by 10% again in year three. Compared to the original revenue, what is the revenue after year three?",
          walkthrough:
            "Step 1: Represent the original revenue as 100, and apply each year's multiplier in sequence, one at a time. Step 2: Year one (+10%): 100 × 1.1 = 110. Step 3: Year two (-10%, applied to 110, not 100): 110 × 0.9 = 99. Step 4: Year three (+10%, applied to 99): 99 × 1.1 = 108.9. Step 5: Compare to the original 100 — an 8.9% net increase, not exactly 10%, since the middle decrease doesn't cleanly cancel one of the increases.",
          answer: "Revenue ends up 8.9% higher than the original — applying three sequential multipliers one at a time, rather than assuming the middle decrease exactly cancels one increase, is what reveals the actual net change.",
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
          prompt: "What percent of 300 is 75?",
          walkthrough:
            "Step 1: Identify the part (75) and the whole (300, since it follows 'of'). Step 2: Compute the ratio: 75/300 = 0.25. Step 3: Convert to a percent: 0.25 × 100 = 25%.",
          answer: "25% — found by dividing the part by the whole and converting to a percent.",
          difficulty: "easy",
        },
        {
          prompt: "What is 40% of 150?",
          walkthrough:
            "Step 1: Convert the percent to a decimal: 40% = 0.40. Step 2: Multiply by the whole: 0.40 × 150 = 60.",
          answer: "60, found by converting the percent to a decimal and multiplying by the given quantity.",
          difficulty: "easy",
        },
        {
          prompt: "A class has 20 students, and 8 of them ride the bus to school. What percent of the class rides the bus?",
          walkthrough:
            "Step 1: Identify the part (8, the students who ride the bus) and the whole (20, the total class). Step 2: Compute the ratio: 8/20 = 0.4. Step 3: Convert to a percent: 40%.",
          answer: "40% — the part (bus riders) divided by the whole (total class), converted to a percent.",
          difficulty: "medium",
        },
        {
          prompt: "45 is what percent of 36?",
          walkthrough:
            "Step 1: Identify the part (45) and the whole (36, following 'of') — notice the part is larger than the whole this time. Step 2: Compute the ratio: 45/36 = 1.25. Step 3: Convert to a percent: 125% — a percent greater than 100 simply means the part exceeds the whole, which is a valid, common result, not a sign of an error.",
          answer: "125% — a result over 100% is correct and expected whenever the 'part' is larger than the 'whole' being compared to.",
          difficulty: "medium",
        },
        {
          prompt:
            "In a survey, 63 out of 180 respondents preferred option A, and the rest preferred option B. What percent of respondents preferred option B?",
          walkthrough:
            "Step 1: This question doesn't give the part for option B directly — find it first: 180 - 63 = 117 respondents preferred option B. Step 2: Compute the ratio using the correct part and whole: 117/180 = 0.65. Step 3: Convert to a percent: 65%.",
          answer:
            "65% — the extra step here is finding the correct 'part' (117, option B's respondents) before applying the percent formula, rather than mistakenly using option A's count.",
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
          prompt: "A data set: 4, 6, 6, 8, 10, 50. Which measure of center best represents a 'typical' value, given the outlier?",
          walkthrough:
            "Step 1: Notice the value 50 is far from the rest of the data (4-10) — a clear outlier. Step 2: Consider how this affects the mean: it will be pulled substantially higher than most of the actual values. Step 3: The median, based on the middle values (6 and 8, averaging to 7), remains representative of the typical cluster, unaffected by the extreme value.",
          answer: "The median best represents a typical value here, since the mean is distorted upward by the single high outlier (50).",
          difficulty: "easy",
        },
        {
          prompt: "Home sale prices (in thousands of dollars): 240, 210, 890, 230, 225. Which measure of center best represents a 'typical' sale price?",
          walkthrough:
            "Step 1: Unlike the easy example, this list isn't already in order — sort it first: 210, 225, 230, 240, 890. Step 2: Now the outlier is easy to spot: 890 is far above the rest (210-240). Step 3: The mean will be pulled substantially higher by that one sale. The median — the middle value once sorted, 230 — stays representative of the typical price, unaffected by the outlier.",
          answer: "The median (230) best represents a typical sale price, since the mean is distorted upward by the single high-priced outlier (890) — this time the extra step of sorting the data first is part of the difficulty.",
          difficulty: "medium",
        },
        {
          prompt: "A data set: 12, 15, 15, 18, 20, 95. Which measure of center best represents a 'typical' value, given the outlier?",
          walkthrough:
            "Step 1: Notice 95 is far from the rest of the data (12-20) — a clear outlier. Step 2: The mean will be pulled substantially higher than most of the actual values. Step 3: The median, based on the middle values (15 and 18, averaging to 16.5), remains representative of the typical cluster.",
          answer: "The median best represents a typical value here, since the mean is distorted upward by the single high outlier (95).",
          difficulty: "easy",
        },
        {
          prompt: "A data set of quiz scores: 2, 78, 81, 85, 88, 90. Which measure of center best represents a 'typical' score?",
          walkthrough:
            "Step 1: Notice 2 is far below the rest of the data (78-90) — a low outlier, the opposite situation from the earlier examples' high outliers. Step 2: This pulls the MEAN down substantially (left skew), unlike a high outlier, which pulls the mean up. Step 3: The median, based on the middle values, stays representative of the typical cluster (78-90), unaffected by the one very low score.",
          answer: "The median best represents a typical score here, since the mean is pulled DOWN by the single low outlier (2) — the opposite direction from a high-outlier case, but the same underlying principle.",
          difficulty: "medium",
        },
        {
          prompt: "A real estate report states that the mean home price in a neighborhood is $420,000, while the median home price is $350,000. What does this comparison most likely indicate about the distribution of home prices?",
          walkthrough:
            "Step 1: Compare the given mean and median directly, without needing the raw data: the mean ($420,000) is noticeably higher than the median ($350,000). Step 2: Recall the skew rule: when the mean exceeds the median, a small number of unusually HIGH values are pulling the average up — right skew. Step 3: In context, that most likely means a few unusually expensive homes are inflating the mean, while most homes are actually priced closer to the median.",
          answer: "The comparison suggests a small number of unusually expensive homes are pulling the mean above the median (right skew) — most homes are likely priced closer to the $350,000 median than the $420,000 mean suggests.",
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
          prompt: "Two data sets have the same mean but Data Set A has a much larger standard deviation than Data Set B. What does this indicate?",
          walkthrough:
            "Step 1: Recall what standard deviation measures: the typical distance of data points from the mean, not the mean's value itself. Step 2: Since the means are equal, the difference must be about how spread out the values are around that shared mean. Step 3: A larger standard deviation for Set A means its values are more spread out (more variable) than Set B's, which are more tightly clustered.",
          answer: "Set A's values are more spread out around the shared mean than Set B's, since standard deviation measures variability, not central tendency.",
          difficulty: "easy",
        },
        {
          prompt: "Two classes take the same exam. Class A's scores are tightly clustered close to a mean of 78. Class B has the same mean of 78, but individual scores range widely, from 40 to 100. Which class most likely has the larger standard deviation?",
          walkthrough:
            "Step 1: Both classes share the same mean, so the mean itself gives no useful information here — the question is entirely about spread. Step 2: Class A's scores stay close to 78; Class B's scores range all the way from 40 to 100 around that same 78. Step 3: A wider range of individual scores around the same mean is a sign of a larger standard deviation, since more values sit farther from the mean.",
          answer: "Class B most likely has the larger standard deviation, since its scores are spread across a much wider range around the same mean, while Class A's scores stay tightly clustered near it.",
          difficulty: "medium",
        },
        {
          prompt: "Two vending machines dispense the same average amount of soda per cup, but Machine A has a much smaller standard deviation in fill amount than Machine B. What does this indicate?",
          walkthrough:
            "Step 1: Since the average fill amount is the same for both, the difference must be about consistency, not typical amount. Step 2: A smaller standard deviation means Machine A's fill amounts vary less from cup to cup.",
          answer: "Machine A fills cups more consistently (with less variation from cup to cup) than Machine B, even though both average the same amount.",
          difficulty: "easy",
        },
        {
          prompt: "A data set has a standard deviation of exactly 0. What must be true about the data set?",
          walkthrough:
            "Step 1: Recall that standard deviation measures how spread out values are from the mean. Step 2: A standard deviation of exactly 0 means there is NO spread at all. Step 3: The only way for there to be zero spread is if every single value in the data set is identical.",
          answer: "Every value in the data set must be exactly the same — a standard deviation of 0 means there is no variability at all.",
          difficulty: "medium",
        },
        {
          prompt: "Two dot plots show quiz scores for two classes, both centered around the same mean of 75. Class X's dots are tightly clustered within a few points of 75. Class Y's dots are spread out widely, with several students scoring near 50 and several near 100. Which class has the larger standard deviation, and what does this suggest about performance consistency?",
          walkthrough:
            "Step 1: Both classes share the same mean, so the visual spread of the dots is what determines the standard deviation comparison. Step 2: Class Y's dots span a much wider range around the same center (50 to 100) compared to Class X's tight clustering — visually, wider spread means larger standard deviation. Step 3: In context, this suggests Class X's students performed more consistently, while Class Y had much more variable performance.",
          answer: "Class Y has the larger standard deviation — its scores are visually spread much wider around the same mean, suggesting far less consistent performance across students than Class X.",
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
          prompt: "A bar graph shows the number of books read by each of 5 students: 3, 5, 2, 6, 4. What is the range of this data set?",
          walkthrough:
            "Step 1: Identify the largest and smallest values: 6 and 2. Step 2: Subtract: 6 - 2 = 4.",
          answer: "4 — the range is simply the largest value minus the smallest.",
          difficulty: "easy",
        },
        {
          prompt:
            "A dot plot shows the number of pets owned by each student in a class. The dot plot shows 2 students with 0 pets, 5 students with 1 pet, 4 students with 2 pets, and 1 student with 3 pets. How many students are in the class?",
          walkthrough:
            "Step 1: This question asks for a total count, not a statistic — add up the number of students represented at each value. Step 2: 2 + 5 + 4 + 1 = 12.",
          answer: "12 students, found by adding up the counts at every value shown on the dot plot.",
          difficulty: "easy",
        },
        {
          prompt: "A store recorded daily sales (in dollars) for 6 days: 210, 340, 275, 300, 265, 290. What is the mean daily sales?",
          walkthrough:
            "Step 1: Add all six values: 210 + 340 + 275 + 300 + 265 + 290 = 1680. Step 2: Divide by the count of values, 6: 1680 / 6 = 280.",
          answer: "$280, found by summing all values and dividing by how many values there are.",
          difficulty: "medium",
        },
        {
          prompt:
            "A frequency table shows quiz scores for a class: 2 students scored 70, 6 students scored 80, 9 students scored 90, and 3 students scored 100. What was the highest individual score earned by any student?",
          walkthrough:
            "Step 1: This asks for the maximum individual value, not the mode or a count. Step 2: Scan the table for the largest score value with a nonzero frequency — 100, with 3 students. Step 3: The frequency (3) isn't the answer here; the score value itself (100) is what's being asked for.",
          answer: "100 — the highest score value listed with at least one student earning it, not the frequency count at that score.",
          difficulty: "medium",
        },
        {
          prompt:
            "A histogram groups delivery times (in minutes) into bins: 10 deliveries took 0-10 minutes, 25 took 10-20 minutes, 40 took 20-30 minutes, 15 took 30-40 minutes, and 10 took 40-50 minutes. What percent of deliveries took 20 minutes or more?",
          walkthrough:
            "Step 1: Identify which bins satisfy '20 minutes or more': the 20-30, 30-40, and 40-50 bins. Step 2: Add those frequencies: 40 + 15 + 10 = 65. Step 3: Find the total number of deliveries across all bins: 10+25+40+15+10 = 100. Step 4: Compute the percent: 65/100 = 65%.",
          answer: "65% — found by summing the frequencies of every bin meeting the stated condition, then dividing by the overall total.",
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
          prompt:
            "A data set has a mean of 20. If 5 is added to every value in the data set, what is the new mean?",
          walkthrough:
            "Step 1: Adding the same constant to every value shifts the mean by that exact constant. Step 2: New mean = 20 + 5 = 25.",
          answer: "25 — adding a constant to every value shifts the mean by that same constant.",
          difficulty: "easy",
        },
        {
          prompt: "A data set has a range of 12. If every value in the data set is increased by 3, what is the new range?",
          walkthrough:
            "Step 1: Adding the same constant to every value shifts the whole data set uniformly — the maximum and minimum both increase by 3. Step 2: Since both the max and min shift by the same amount, their difference (the range) stays exactly the same.",
          answer: "12 — the range is unchanged, since shifting every value by the same amount doesn't change the spread between the largest and smallest.",
          difficulty: "easy",
        },
        {
          prompt: "Five test scores have a mean of 80. A sixth score of 92 is added. What is the new mean?",
          walkthrough:
            "Step 1: Recover the original total from the original mean: 5 scores × mean of 80 = a total of 400. Step 2: Add the new score to the total: 400 + 92 = 492. Step 3: Divide by the new count of scores, 6: 492/6 = 82.",
          answer: "82 — found by reconstructing the original total from the mean and count, adding the new value, then dividing by the new count.",
          difficulty: "medium",
        },
        {
          prompt:
            "A data set of 7 values has a median of 50. If a new value of 200 is added to the data set, what happens to the median?",
          walkthrough:
            "Step 1: With 7 values, the median is the 4th value when ordered — the middle one. Step 2: Adding one very high value (200) makes the data set have 8 values, so the new median is the average of the 4th and 5th values in the new ordering. Step 3: Since 200 is far above the rest of the data, it just becomes the new maximum and doesn't affect which values sit in the middle — the median typically shifts only slightly (toward the average of the two middle values of the original data), unlike the mean, which the extreme value would pull noticeably higher.",
          answer:
            "The median shifts only slightly, since adding one extreme value mainly affects which value(s) sit exactly in the middle, not the overall balance the way it affects the mean — this resistance to outliers is the median's defining property.",
          difficulty: "hard",
        },
        {
          prompt:
            "A biologist recorded the wingspan of 9 birds, with a mean of 24 cm and a range of 10 cm. A 10th bird is measured with a wingspan of 24 cm, exactly equal to the current mean. What happens to the mean and the range?",
          walkthrough:
            "Step 1: Consider the mean: adding a value exactly equal to the current mean doesn't pull the average up or down at all, so the mean stays 24 cm. Step 2: Consider the range: the range only changes if the new value is more extreme than the current minimum or maximum. Step 3: Since 24 cm is the mean, it falls somewhere between the current min and max (unless the data set is unusually shaped), so it doesn't become a new extreme — the range stays 10 cm.",
          answer:
            "Both the mean and the range stay the same — a new value exactly at the current mean doesn't shift the average, and since it isn't more extreme than the existing minimum or maximum, it doesn't change the range either.",
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
          prompt: "A scatterplot shows points rising steadily at a constant rate, forming a straight-line pattern. Which model best fits?",
          walkthrough:
            "Step 1: Notice the key phrase 'constant rate' and 'straight-line pattern' — this describes a fixed amount of increase for each fixed step along the x-axis. Step 2: Compare to model behaviors: linear models have constant rate of change; exponential models have accelerating rate of change; quadratic models change direction at a vertex. Step 3: A constant rate of change specifically matches the definition of a linear relationship.",
          answer: "A linear model fits best, since a constant rate of increase forming a straight-line pattern is the defining characteristic of linear relationships.",
          difficulty: "easy",
        },
        {
          prompt: "A scatterplot shows points rising slowly at first, then increasingly steeply as x increases, with each step producing a noticeably bigger jump than the last. Which model best fits?",
          walkthrough:
            "Step 1: The key phrase is that the rate of increase itself keeps growing — each step's jump is bigger than the one before, unlike the constant jumps of a linear pattern. Step 2: This rules out linear (constant rate) immediately. It's tempting to think 'curving upward' means quadratic, but a quadratic model eventually turns and changes direction at its vertex — this pattern just keeps accelerating in the same direction without turning around. Step 3: A rate of increase that keeps growing, without reversing direction, matches exponential growth specifically.",
          answer: "An exponential model fits best, since the rate of increase itself keeps growing rather than staying constant (ruling out linear) or reversing direction at a peak (ruling out quadratic).",
          difficulty: "medium",
        },
        {
          prompt: "A scatterplot shows points that rise, reach a peak around the middle of the data, then fall back down, forming a symmetric arc shape. Which model best fits?",
          walkthrough:
            "Step 1: Notice the data doesn't just keep increasing or decreasing — it changes direction once, at a single peak. Step 2: Neither linear (constant rate, never changes direction) nor exponential (keeps accelerating in one direction) matches a shape that turns around. Step 3: A single peak or trough is the defining feature of a quadratic model.",
          answer: "A quadratic model fits best, since a single symmetric peak — the data rising, then falling — is the defining shape of a quadratic relationship.",
          difficulty: "easy",
        },
        {
          prompt: "A scatterplot shows points that appear to rise at a roughly constant rate, but closer inspection shows the amount of increase between consecutive points is slightly smaller near the right side of the graph than near the left. Which model best fits?",
          walkthrough:
            "Step 1: The rate of increase itself is changing — specifically getting SMALLER — which rules out a purely linear model (constant rate). Step 2: This also rules out exponential growth, which would have an ACCELERATING rate, the opposite direction. Step 3: A rate of increase that's shrinking while still positive matches the rising portion of a quadratic model, before it reaches its peak and turns downward.",
          answer: "A quadratic model fits best — even though the points are still rising throughout, the shrinking rate of increase matches the beginning portion of a curve that will eventually peak and turn around.",
          difficulty: "medium",
        },
        {
          prompt: "A linear model is fit to a data set, and the residuals show a clear pattern: strongly negative for small x-values, positive in the middle, and strongly negative again for large x-values. What does this residual pattern suggest about the true relationship between the variables?",
          walkthrough:
            "Step 1: Recall what a good linear fit's residuals should look like: scattered randomly above and below zero, with no systematic pattern. Step 2: Here, the residuals follow a clear pattern — negative, then positive, then negative again — meaning the linear model consistently over- or under-predicts in a structured way. Step 3: This systematic curved pattern in the residuals is a strong signal that the true relationship is curved (like quadratic), not actually linear, even though a line was the model that got fit.",
          answer: "This residual pattern suggests the true relationship is curved (likely quadratic), not linear — a good linear fit's residuals should scatter randomly around zero, and a systematic negative-positive-negative pattern reveals real curvature the line is missing.",
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
          prompt: "A line of best fit predicts y = 45 for a given x-value, but the actual observed y-value is 50. What is the residual?",
          walkthrough:
            "Step 1: Recall the residual formula: actual minus predicted, not the reverse. Step 2: Identify the actual value (50) and predicted value (45) from the problem. Step 3: Subtract: 50 - 45 = 5.",
          answer: "The residual is 5, calculated as actual value minus predicted value.",
          difficulty: "easy",
        },
        {
          prompt: "A line of best fit predicts a plant will be 24 cm tall after 6 weeks, but its actual measured height is 19 cm. What is the residual, and what does its sign tell you?",
          walkthrough:
            "Step 1: Apply the same formula as before: actual minus predicted. Step 2: Actual is 19, predicted is 24, so the residual is 19 - 24 = -5. Step 3: Beyond just computing the number, notice what the negative sign means: since actual came in below predicted, the plant grew less than the model expected — a positive residual would instead mean the actual value exceeded the prediction.",
          answer: "The residual is -5; the negative sign specifically means the actual height fell short of the model's prediction, not just that there was some difference.",
          difficulty: "medium",
        },
        {
          prompt: "A line of best fit predicts a car will sell for $18,000, but it actually sells for $16,500. What is the residual?",
          walkthrough:
            "Step 1: Recall the residual formula: actual minus predicted. Step 2: Identify the actual value ($16,500) and predicted value ($18,000). Step 3: Subtract: 16,500 - 18,000 = -1,500.",
          answer: "The residual is -1,500, calculated as actual value minus predicted value.",
          difficulty: "easy",
        },
        {
          prompt: "A model predicts a runner will finish a race in 52 minutes, but the runner actually finishes in 49 minutes. What is the residual, and what does its sign indicate about the runner's performance relative to the prediction?",
          walkthrough:
            "Step 1: Apply the residual formula as always: actual minus predicted = 49 - 52 = -3. Step 2: In most contexts (like test scores), a negative residual means underperforming the prediction — but here, LOWER race times are BETTER, so a negative residual actually means the runner finished faster than predicted, not worse. Step 3: The formula never changes, but interpreting what the sign means depends on whether higher or lower values represent better performance in this specific context.",
          answer: "The residual is -3; because lower times are better in a race, this negative residual means the runner performed BETTER than predicted, not worse — the meaning of the sign depends on context, even though the formula never changes.",
          difficulty: "medium",
        },
        {
          prompt: "A line of best fit predicts a plant's height based on weeks since planting. For a particular plant, the residual was calculated as 4.5. If the model predicted a height of 22 cm for that plant, what was its actual height?",
          walkthrough:
            "Step 1: Use the residual formula in reverse, since we're given the residual and the predicted value, and need the actual value: residual = actual - predicted. Step 2: Substitute what's known: 4.5 = actual - 22. Step 3: Solve for actual: actual = 4.5 + 22 = 26.5.",
          answer: "The actual height was 26.5 cm — rearranging the residual formula to solve for the actual value is the reverse application of the same relationship.",
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
          prompt: "Two independent events A and B have P(A) = 0.5 and P(B) = 0.4. What is P(A and B)?",
          walkthrough:
            "Step 1: Recognize the keyword 'and' combined with 'independent events' — this signals multiplication. Step 2: Apply the independence rule: P(A and B) = P(A) × P(B). Step 3: Multiply: 0.5 × 0.4 = 0.2.",
          answer: "0.2, found by multiplying the individual probabilities since the events are independent.",
          difficulty: "easy",
        },
        {
          prompt: "A jar contains 5 red marbles and 3 blue marbles. One marble is drawn and replaced, then a second marble is drawn. What is the probability that the first marble is red OR the second marble is blue?",
          walkthrough:
            "Step 1: Recognize the 'or' language, and notice these two events CAN both happen at once (first being red doesn't stop second from being blue) — so this needs the addition rule with an overlap subtracted, not just adding the two probabilities directly. Step 2: Find each individual probability: P(first red) = 5/8, P(second blue) = 3/8. Step 3: Find the overlap — since the marble is replaced, the two draws are independent, so P(both) = 5/8 × 3/8 = 15/64. Step 4: Apply the addition rule: P(A or B) = P(A) + P(B) - P(A and B) = 5/8 + 3/8 - 15/64 = 40/64 + 24/64 - 15/64 = 49/64.",
          answer: "49/64, found using the addition rule for 'or' — adding the individual probabilities and then subtracting the overlap — rather than just adding 5/8 and 3/8 directly, which would double-count the outcome where both happen.",
          difficulty: "medium",
        },
        {
          prompt: "A spinner has 4 equal sections numbered 1-4. What is the probability of spinning an even number?",
          walkthrough:
            "Step 1: Identify the favorable outcomes: 2 and 4 are even, out of 4 total sections. Step 2: Apply the basic probability formula: favorable / total = 2/4.",
          answer: "1/2, found by dividing the number of even sections (2) by the total number of sections (4).",
          difficulty: "easy",
        },
        {
          prompt: "A fair coin is flipped 3 times. What is the probability of getting at least one heads?",
          walkthrough:
            "Step 1: 'At least one' is often easier to find using the complement rule: P(at least one) = 1 - P(none). Step 2: Find the complement first: P(all three flips are tails) = (1/2) × (1/2) × (1/2) = 1/8. Step 3: Subtract from 1: 1 - 1/8 = 7/8.",
          answer: "7/8, found using the complement rule — it's much faster to find P(no heads at all) and subtract from 1 than to add up every individual way of getting at least one heads.",
          difficulty: "medium",
        },
        {
          prompt: "A jar contains 5 red and 3 blue marbles. Two marbles are drawn WITHOUT replacement. What is the probability that both are red?",
          walkthrough:
            "Step 1: Notice this says 'without replacement' — the two draws are NOT independent, since removing the first marble changes what's left for the second draw. Step 2: P(first marble red) = 5/8. Step 3: Given the first was red, only 4 red marbles remain out of 7 total: P(second red | first red) = 4/7. Step 4: Multiply the two probabilities together, since both must happen: 5/8 × 4/7 = 20/56 = 5/14.",
          answer: "5/14, found by multiplying two DIFFERENT probabilities, since removing the first marble without replacing it changes the odds for the second draw — dependent probability, not the independent 'same fraction twice' case.",
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
          prompt: "A deck has 52 cards. What is the probability of drawing a card that is a heart, given that the card drawn is red?",
          walkthrough:
            "Step 1: Identify the restriction: 'given that the card is red' means we only consider the 26 red cards (hearts and diamonds), not all 52 cards. Step 2: Within that restricted group of 26 red cards, count how many are hearts: 13. Step 3: Calculate the probability using the restricted total: 13/26 = 1/2.",
          answer: "1/2, found by using the restricted subgroup (26 red cards) as the total, not the full deck of 52.",
          difficulty: "easy",
        },
        {
          prompt: "A survey of 200 students found that 120 play a sport, and of those 120, 45 also play a musical instrument. What is the probability that a student plays an instrument, given that they play a sport?",
          walkthrough:
            "Step 1: Identify the restriction: 'given that they play a sport' means the total is only the 120 sport-playing students, not all 200 surveyed. Step 2: Within that restricted group of 120, count how many also play an instrument: 45. Step 3: Calculate the probability using the restricted total: 45/120 = 3/8.",
          answer: "3/8, found by using the restricted subgroup (120 sport-players) as the total, not the full 200 students surveyed — the same technique as the deck-of-cards example, just pulled from a word problem instead of a familiar object.",
          difficulty: "medium",
        },
        {
          prompt: "A box contains 10 pens: 6 blue and 4 black. What is the probability that a randomly selected pen is black, given that it is not blue?",
          walkthrough:
            "Step 1: Identify the restriction: 'given that it is not blue' — since every pen is either blue or black, 'not blue' means the pen must be black, restricting the group to just the 4 black pens. Step 2: Within that restricted group of 4, all 4 are black. Step 3: Calculate the probability using the restricted total: 4/4 = 1.",
          answer: "1 (certain) — once restricted to 'not blue' pens, every pen left in that group is black by definition in this two-category box.",
          difficulty: "easy",
        },
        {
          prompt: "A survey of 150 students found: 90 play a sport, 60 do not. Of the 90 who play a sport, 36 also work a part-time job. Of the 60 who don't play a sport, 24 work a part-time job. What is the probability that a student works a part-time job, given that they play a sport?",
          walkthrough:
            "Step 1: Identify the restriction: 'given that they play a sport' — restrict the total to the 90 sport-playing students, ignoring the 60 who don't. Step 2: Within that group of 90, 36 also work a part-time job. Step 3: Calculate the probability using the restricted total: 36/90 = 2/5.",
          answer: "2/5, found by using the restricted subgroup (90 sport-players) as the total — the non-sport-players and their numbers are irrelevant once the condition restricts us to sport-players only.",
          difficulty: "medium",
        },
        {
          prompt: "Using the same survey (150 students: 90 play a sport, of whom 36 work a part-time job; 60 don't play a sport, of whom 24 work a part-time job), what is the probability a student plays a sport, given that they work a part-time job? Is this the same as the probability a student works a part-time job, given that they play a sport?",
          walkthrough:
            "Step 1: This time the restriction is different: 'given that they work a part-time job' restricts the total to all part-time workers, 36 + 24 = 60, not the 90 sport-players from before. Step 2: Within that restricted group of 60, 36 also play a sport. Step 3: P(sport | part-time) = 36/60 = 3/5 — compare this to P(part-time | sport) = 36/90 = 2/5: these are NOT the same value, since the two conditional probabilities use different restricted totals (60 vs. 90) even though they share the same 36 students.",
          answer: "P(sport | part-time) = 3/5, which is different from P(part-time | sport) = 2/5 — reversing which condition restricts the group changes the denominator, even though the same 36 students appear in both calculations.",
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
          prompt: "A 95% confidence interval for a population mean is (48, 56). Which statement correctly interprets this interval?",
          walkthrough:
            "Step 1: Recall what a confidence interval actually describes: a plausible range for the population MEAN, not for individual data points. Step 2: Reject any interpretation claiming '95% of individual data points fall in this range' — that describes a different concept (like a percentile range), not a confidence interval. Step 3: The correct interpretation focuses on the population parameter and acknowledges this is based on the sampling method, not a certainty.",
          answer: "The interval reflects a plausible range for the true population mean, based on the sampling method — not a claim about individual data points.",
          difficulty: "easy",
        },
        {
          prompt: "A 90% confidence interval for the average commute time of employees at a company is (22, 28) minutes. Which statement correctly interprets this interval?",
          walkthrough:
            "Step 1: Recall what the interval describes: a plausible range for the AVERAGE commute time across all employees, not for any individual employee's commute. Step 2: Reject a statement like '90% of employees commute between 22 and 28 minutes' — that's describing individual variation, a completely different idea from an interval around an average. Step 3: The correct interpretation stays focused on the average, tied to the reliability of the sampling method used to estimate it.",
          answer: "The interval reflects a plausible range for the true average commute time across all employees, based on the sampling method — not a claim about how long any individual employee's commute is.",
          difficulty: "medium",
        },
        {
          prompt: "A 95% confidence interval for the average weight of apples in an orchard is (150, 170) grams. Which statement correctly interprets this interval?",
          walkthrough:
            "Step 1: Recall what a confidence interval describes: a plausible range for the population mean weight, not for any individual apple's weight. Step 2: Reject an interpretation like '95% of apples weigh between 150 and 170 grams' — that's a different concept entirely. Step 3: The correct interpretation focuses on the average weight across all apples in the orchard.",
          answer: "The interval reflects a plausible range for the true average apple weight in the orchard, based on the sampling method — not a claim about any individual apple.",
          difficulty: "easy",
        },
        {
          prompt: "A company claims its light bulbs last an average of 1,000 hours. A 90% confidence interval for the true mean lifespan, based on a sample, is (920, 980) hours. What does this suggest about the company's claim?",
          walkthrough:
            "Step 1: A confidence interval gives a plausible range for the true population mean. Step 2: Check whether the claimed value (1,000 hours) falls inside or outside the interval (920, 980) — it falls OUTSIDE, above the upper bound. Step 3: Since the plausible range doesn't include 1,000, this suggests the company's claim isn't well supported by the sample data.",
          answer: "The interval suggests the company's claim is questionable — since 1,000 hours falls outside the plausible range, the sample data doesn't support that the true average lifespan is actually 1,000 hours.",
          difficulty: "medium",
        },
        {
          prompt: "A researcher claims that the average commute time in a city is 27 minutes. A 95% confidence interval for the true mean, based on a sample, is (24, 30) minutes. Does this data contradict the researcher's claim?",
          walkthrough:
            "Step 1: Check whether the claimed value (27) falls inside the interval (24, 30) — yes, it does. Step 2: Since the claimed value falls within the plausible range, the sample data is consistent with the claim, not contradicting it. Step 3: This doesn't PROVE the true mean is exactly 27, though — it just means 27 remains a plausible value; other values in the range are equally plausible.",
          answer: "No, this data does not contradict the claim — 27 minutes falls within the plausible range, meaning the claim is consistent with the sample data, though not proven exactly correct by it.",
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
          prompt: "A researcher increases the sample size from 100 to 400 while keeping the same confidence level. What is the most likely effect on the width of the confidence interval?",
          walkthrough:
            "Step 1: Recall the general relationship: larger sample size → smaller margin of error → narrower confidence interval, all else equal. Step 2: Apply this directly: increasing the sample size from 100 to 400 should narrow the interval, not widen it.",
          answer: "The confidence interval will narrow, since larger sample sizes generally produce smaller margins of error at the same confidence level.",
          difficulty: "easy",
        },
        {
          prompt: "A pollster wants a narrower margin of error for an upcoming election poll while keeping the same 95% confidence level. What should they do to their sample size?",
          walkthrough:
            "Step 1: Recall the same relationship as before: larger sample size → smaller margin of error, holding confidence level constant. Step 2: This time, apply the relationship in reverse — starting from the desired outcome (a narrower margin of error) and working out what needs to change (the sample size) to get there, rather than being told the sample size changed and asked to predict the effect.",
          answer: "The pollster should increase the sample size — larger samples produce smaller margins of error at a fixed confidence level, which is exactly what a narrower margin requires.",
          difficulty: "medium",
        },
        {
          prompt: "A researcher decreases the sample size from 500 to 200 while keeping the same confidence level. What is the most likely effect on the width of the confidence interval?",
          walkthrough:
            "Step 1: Recall the relationship: smaller sample size → larger margin of error → wider confidence interval, all else equal. Step 2: Apply this directly: decreasing the sample size from 500 to 200 should widen the interval, not narrow it.",
          answer: "The confidence interval will widen, since smaller sample sizes generally produce larger margins of error at the same confidence level.",
          difficulty: "easy",
        },
        {
          prompt: "A pollster increases the confidence level from 90% to 99% while keeping the same sample size. What is the most likely effect on the width of the confidence interval?",
          walkthrough:
            "Step 1: Recall the confidence-level relationship, which runs the OPPOSITE direction from the sample-size relationship: increasing confidence level makes the interval WIDER, not narrower. Step 2: This makes intuitive sense: to be more confident (99% vs. 90%) that the interval actually contains the true value, the range needs to be broader. Step 3: Apply directly: increasing from 90% to 99% should widen the interval.",
          answer: "The confidence interval will widen — unlike increasing sample size (which narrows the interval), increasing the confidence level widens it, since more confidence requires a broader range.",
          difficulty: "medium",
        },
        {
          prompt: "A study increases both its sample size and its confidence level at the same time. A colleague claims the resulting confidence interval must be narrower, since larger samples always produce narrower intervals. Is the colleague's reasoning fully correct?",
          walkthrough:
            "Step 1: Recall both relationships: larger sample size narrows the interval, but higher confidence level widens it — two changes pushing the interval's width in OPPOSITE directions. Step 2: Since both changed at once, the two effects compete, and the net result depends on the size of each change — it can't be determined from the sample-size effect alone. Step 3: The colleague's reasoning is incomplete because it ignores that the confidence level increase pushes in the opposite direction.",
          answer: "The colleague's reasoning is incomplete — while a larger sample size alone would narrow the interval, the confidence level increase pushes in the opposite direction, so the net effect can't be determined without knowing the size of each change.",
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
          prompt: "A researcher randomly selects 20 employees from a company of 400 and finds that 16 of them are enrolled in a wellness program. Based on this sample, what is the best estimate of the number of employees at the company enrolled in the wellness program?",
          walkthrough:
            "Step 1: Find the sample proportion: 16/20 = 0.8. Step 2: Apply that proportion to the full population: 0.8 × 400 = 320.",
          answer: "320 employees, estimated by scaling the sample's proportion (0.8) up to the full company size.",
          difficulty: "easy",
        },
        {
          prompt: "A quality inspector randomly samples 50 bolts from a shipment of 3,000 and finds 3 are defective. Based on this sample, what is the best estimate of the total number of defective bolts in the shipment?",
          walkthrough:
            "Step 1: Find the sample proportion: 3/50 = 0.06. Step 2: Apply that proportion to the full shipment: 0.06 × 3,000 = 180.",
          answer: "180 bolts, estimated by scaling the sample's defect rate up to the full shipment.",
          difficulty: "easy",
        },
        {
          prompt: "A random sample of 250 voters from a district of 60,000 found that 175 support a proposed measure. Based on this sample, what is the best estimate of the number of voters in the district who do NOT support the measure?",
          walkthrough:
            "Step 1: Find the sample proportion who support: 175/250 = 0.7. Step 2: Since the question asks about those who do NOT support, find the complement proportion first: 1 - 0.7 = 0.3. Step 3: Apply that proportion to the full population: 0.3 × 60,000 = 18,000.",
          answer: "18,000 — the extra step is finding the complement (those who do NOT support) before scaling up, rather than scaling the 'support' proportion up directly.",
          difficulty: "medium",
        },
        {
          prompt: "An online news site posts a poll on its website, and 2,400 of its 3,000 respondents say they prefer streaming over cable TV. The site's editor claims this shows 80% of ALL adults in the country prefer streaming. Is this estimate valid?",
          walkthrough:
            "Step 1: Check whether the sample was randomly selected from the population being estimated (all adults in the country). Step 2: This is a self-selected online poll — only people who chose to visit the site and respond are included, not a random sample of all adults. Step 3: Because the sample isn't random, the 80% figure only describes the people who happened to respond, and can't be reliably scaled up to represent all adults nationally, regardless of the sample's size.",
          answer: "No — even though 80% is accurate for the poll's respondents, the sample was self-selected rather than randomly drawn from all adults, so it can't be reliably used to estimate the broader population's preferences.",
          difficulty: "medium",
        },
        {
          prompt: "A city's parks department randomly surveys 80 out of 5,000 registered users of a park app and finds that 12 reported visiting a park at least 3 times per week. If each 'frequent visitor' uses park facilities worth about $45 per month in maintenance costs, what is the best estimate of total monthly maintenance costs attributable to frequent visitors, based on this sample?",
          walkthrough:
            "Step 1: Find the sample proportion of frequent visitors: 12/80 = 0.15. Step 2: Scale up to the full population of 5,000 registered users: 0.15 × 5,000 = 750 estimated frequent visitors. Step 3: Apply the given per-visitor cost to find the total: 750 × $45 = $33,750.",
          answer: "$33,750 — this requires two steps beyond the basic scale-up: first estimating the number of frequent visitors, then multiplying by the given per-visitor cost.",
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
          prompt: "An observational study finds ice cream sales correlate with drowning incidents. What's the best interpretation?",
          walkthrough:
            "Step 1: Identify the study type: this is observational (no random assignment of who eats ice cream), so causation cannot be concluded. Step 2: Consider what might explain both variables at once: hot summer weather increases both ice cream sales and swimming (and therefore drowning risk). Step 3: This shared underlying cause is called a confounding variable, and it's the most reasonable explanation for the correlation — not that one causes the other.",
          answer: "A confounding variable (like summer heat) most likely explains both trends, since this is an observational study and cannot establish causation on its own.",
          difficulty: "easy",
        },
        {
          prompt: "A city notices that neighborhoods with more coffee shops also tend to have higher average rents. A local blogger claims that opening coffee shops causes rent increases. What's the best interpretation?",
          walkthrough:
            "Step 1: Identify the study type: this is observational — no one randomly assigned coffee shops to neighborhoods — so causation can't be concluded from the correlation alone. Step 2: Consider what might explain both trends at once: a neighborhood that's becoming more desirable or seeing more investment could independently attract both new coffee shops and rising rents. Step 3: That shared underlying trend (rising desirability) is a confounding variable, and it's a far more plausible explanation than coffee shops directly driving up rent.",
          answer: "A confounding variable (like a neighborhood becoming more desirable) most likely explains both trends, since this is an observational study and cannot establish that coffee shops cause rent increases.",
          difficulty: "medium",
        },
        {
          prompt: "An observational study finds that students who eat breakfast tend to have higher test scores than students who skip breakfast. What's the best interpretation?",
          walkthrough:
            "Step 1: Identify the study type: observational (no random assignment of who eats breakfast), so causation cannot be concluded. Step 2: Consider what might explain both variables at once: family routines, income, or overall health habits could independently affect both breakfast habits and test performance. Step 3: A confounding variable is the most reasonable explanation for the correlation, not that breakfast itself directly causes higher scores.",
          answer: "A confounding variable (like family routine or income) most likely explains both trends, since this is an observational study and cannot establish that breakfast itself causes higher test scores.",
          difficulty: "easy",
        },
        {
          prompt: "A study finds that neighborhoods with more public libraries have lower rates of teen crime. A city council member proposes building more libraries specifically to reduce crime. What is the main weakness in this reasoning?",
          walkthrough:
            "Step 1: Identify the study type: observational (no random assignment of libraries to neighborhoods), so causation can't be concluded from the correlation alone. Step 2: Consider what might explain both: neighborhoods with more overall public investment or resources might have both more libraries AND lower crime, independent of any direct effect of libraries themselves. Step 3: Because of this confound, building more libraries in a different neighborhood without those other resources might not produce the same crime reduction.",
          answer: "The main weakness is that a confounding variable (like overall neighborhood investment) likely explains both the library access and the lower crime rate, so adding libraries elsewhere may not replicate the same effect.",
          difficulty: "medium",
        },
        {
          prompt: "Researchers randomly assign 200 volunteers to either take a new supplement or a placebo, without either group knowing which they received, then measure changes in blood pressure after 8 weeks. The supplement group shows a significantly larger decrease. Can this study support a causal claim?",
          walkthrough:
            "Step 1: Unlike the previous examples, check the study design here specifically: was there random assignment? Yes. Was there a control (placebo) group? Yes. Step 2: With both randomization and a control group in place, this design CAN support a causal claim, unlike a purely observational study. Step 3: The key skill is recognizing when a study's design actually earns the stronger causal conclusion, rather than defaulting to 'correlation isn't causation' for every study without checking the design first.",
          answer: "Yes — with random assignment and a placebo control group, this is a randomized controlled experiment, not an observational study, which is exactly what's needed to support causation.",
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
          prompt: "A company claims a new supplement causes weight loss based on a study with no control group. What is the primary weakness of this claim?",
          walkthrough:
            "Step 1: Check the study design against the causal-claim checklist: is there a control group to compare against? No. Step 2: Without a control group, there's no way to rule out other explanations for the weight change (diet changes, exercise changes, or simply time passing). Step 3: The primary weakness is specifically this missing comparison, not the sample size or any other factor.",
          answer: "Without a control group, other factors (like diet or exercise changes) cannot be ruled out as the actual cause of the weight loss.",
          difficulty: "easy",
        },
        {
          prompt: "A researcher wants to test whether a new tutoring method improves test scores. Students are randomly assigned to either the new method or the standard method, and both groups take the same final test, with the new-method group scoring higher. Does this design support a causal claim?",
          walkthrough:
            "Step 1: Run the same checklist as before, but this time check whether it's satisfied rather than assuming it's flawed: was there random assignment? Yes. Was there a comparison group? Yes — the standard-method group serves as the control. Step 2: Since both boxes are checked, unlike the supplement study above, this design does isolate the tutoring method's effect from other explanations. Step 3: The key skill here is recognizing that a well-designed study CAN support a causal claim — not every study-evaluation question is pointing at a flaw.",
          answer: "Yes — with both random assignment and a comparison group in place, the higher scores can be reasonably attributed to the tutoring method itself, unlike the earlier supplement study, which lacked a control group.",
          difficulty: "medium",
        },
        {
          prompt: "A researcher wants to test whether a new fertilizer increases crop yield. They apply the fertilizer to one field and compare its yield to that same field's yield from the previous year, when no fertilizer was used. What is the primary weakness of this design?",
          walkthrough:
            "Step 1: Check the study design against the causal-claim checklist: is there a genuine control group tested under the same conditions? No — this compares the same field across two different years, not two groups under the same conditions. Step 2: Without a same-time comparison, other factors that changed between years (weather, rainfall, soil conditions) can't be ruled out as explanations for any yield difference. Step 3: The primary weakness is this missing same-time comparison, not simply that one field isn't enough data.",
          answer: "The primary weakness is the lack of a genuine same-time control — comparing the same field across two different years can't rule out other year-to-year factors as the real cause of any yield difference.",
          difficulty: "easy",
        },
        {
          prompt: "Researchers randomly assign participants to either receive a new pain medication or a sugar pill (placebo), but everyone — participants and researchers alike — knows who received which. Pain levels are then assessed through interviews. What is a specific weakness of this design?",
          walkthrough:
            "Step 1: Check the checklist: random assignment (yes) and a control/placebo group (yes) are both present, so this isn't missing those basics. Step 2: But there's still a specific weakness: because everyone knows who received the real medication, participants' self-reported pain levels — and researchers' assessments of them — could be influenced by expectation rather than the medication itself. Step 3: This is a lack of 'blinding': a properly blinded study keeps both participants and researchers unaware of who received which treatment.",
          answer: "The specific weakness is the lack of blinding — even with random assignment and a placebo group, both sides knowing who received which treatment can bias self-reported outcomes like pain levels.",
          difficulty: "medium",
        },
        {
          prompt: "A gym's marketing claims 'attending our gym causes higher life satisfaction, and gym attendance improves cardiovascular health.' Life satisfaction was measured through an observational self-report survey with no random assignment; cardiovascular health was measured separately through a randomized 12-week trial comparing gym attendance to a non-exercise control group. Which part of the marketing claim is better supported by evidence?",
          walkthrough:
            "Step 1: Notice this compound claim rests on two DIFFERENT pieces of evidence with different designs — evaluate each separately rather than treating the whole claim as one unit. Step 2: The life satisfaction claim is based on an observational survey with no random assignment, so it can only support correlation, not the causal wording used. Step 3: The cardiovascular health claim comes from a randomized controlled trial with a control group, which CAN support a causal claim.",
          answer: "The cardiovascular health claim is better supported, since it's based on a randomized controlled trial; the life satisfaction claim is not well supported as a causal claim, since it comes from an observational survey — a compound claim can mix well-supported and poorly-supported parts, so each needs checking separately.",
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
          prompt: "If a square's side length doubles, by what factor does its area increase?",
          walkthrough:
            "Step 1: Identify the linear scale factor: the side length doubles, so k = 2. Step 2: Recall the rule for area: area scales by k², not k. Step 3: Compute: 2² = 4 — the area increases by a factor of 4, not 2.",
          answer: "The area increases by a factor of 4 (2², not just 2), since area scales with the square of the linear scale factor.",
          diagram: { kind: "scaleCompare", shape: "square", factorLabel: "2" },
          difficulty: "easy",
        },
        {
          prompt: "A cube's side length is tripled. By what factor does its volume increase?",
          walkthrough:
            "Step 1: Identify the linear scale factor: the side length triples, so k = 3. Step 2: Recall the rule for volume specifically (not area this time): volume scales by k³, not k or k². Step 3: Compute: 3³ = 27 — the volume increases by a factor of 27, not 3 or 9.",
          answer: "The volume increases by a factor of 27 (3³, not just 3), since volume scales with the cube of the linear scale factor — a different exponent than the area case above.",
          diagram: { kind: "scaleCompare", shape: "cube", factorLabel: "3" },
          difficulty: "medium",
        },
        {
          prompt: "If a circle's radius triples, by what factor does its area increase?",
          walkthrough:
            "Step 1: Identify the linear scale factor: the radius triples, so k = 3. Step 2: Area scales by k², not k. Step 3: Compute: 3² = 9 — the area increases by a factor of 9.",
          answer: "The area increases by a factor of 9, since area scales with the square of the linear scale factor.",
          diagram: { kind: "scaleCompare", shape: "circle", factorLabel: "3" },
          difficulty: "easy",
        },
        {
          prompt: "A square's area increases by a factor of 16 after being enlarged. By what factor did its side length increase?",
          walkthrough:
            "Step 1: Recall the rule: area scales by k², so if the area increased by a factor of 16, that means k² = 16. Step 2: Solve for k by taking the square root: k = 4 (the positive root, since a scale factor can't be negative). Step 3: The side length increased by a factor of 4, not 16.",
          answer: "The side length increased by a factor of 4 — working backward from an area scale factor requires taking the square root, not using 16 directly.",
          diagram: { kind: "scaleCompare", shape: "square", factorLabel: "?" },
          difficulty: "medium",
        },
        {
          prompt: "A cube's side length doubles. By what factor does the ratio of its surface area to its volume change?",
          walkthrough:
            "Step 1: Recall both rules at once: surface area scales by k² and volume scales by k³, with k = 2 here. Step 2: Surface area scales by 2² = 4; volume scales by 2³ = 8. Step 3: The RATIO of surface area to volume scales by 4/8 = 1/2 — the ratio is cut in half, since volume grows faster than surface area as an object scales up.",
          answer: "The surface-area-to-volume ratio is cut in half — since volume grows by k³ while surface area only grows by k², the ratio between them shrinks as an object scales up, even though both individual measurements increase.",
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
          prompt: "A cylindrical water tank has a radius of 3 and a height of 10. What is its volume in terms of π?",
          walkthrough:
            "Step 1: Identify the shape and its formula: a cylinder's volume is πr²h. Step 2: Identify the given values: r = 3, h = 10. Step 3: Substitute and compute: π(3²)(10) = π(9)(10) = 90π.",
          answer: "90π, found by correctly identifying the cylinder volume formula (πr²h) before substituting the given values.",
          diagram: { kind: "solid", shape: "cylinder", labels: { r: "3", h: "10" } },
          difficulty: "easy",
        },
        {
          prompt: "A cone-shaped paper cup has a radius of 3 cm and a height of 8 cm. What is its volume in terms of π?",
          walkthrough:
            "Step 1: Identify the shape and its formula — a cone, not a cylinder, which means the formula needs the extra factor of 1/3 that a cylinder's formula doesn't have: V = (1/3)πr²h. Step 2: Identify the given values: r = 3, h = 8. Step 3: Substitute and compute: (1/3)π(3²)(8) = (1/3)π(9)(8) = (1/3)(72π) = 24π.",
          answer: "24π, found by correctly identifying and applying the cone volume formula (with its 1/3 factor) rather than mistakenly using the cylinder formula from the example above.",
          diagram: { kind: "solid", shape: "cone", labels: { r: "3", h: "8" } },
          difficulty: "medium",
        },
        {
          prompt: "A sphere-shaped water tank has a radius of 6 feet. What is its volume in terms of π?",
          walkthrough:
            "Step 1: Identify the shape and its formula: a sphere's volume is (4/3)πr³. Step 2: Identify the given value: r = 6. Step 3: Substitute and compute: (4/3)π(6³) = (4/3)π(216) = 288π.",
          answer: "288π, found by correctly identifying and applying the sphere volume formula.",
          diagram: { kind: "solid", shape: "sphere", labels: { r: "6" } },
          difficulty: "easy",
        },
        {
          prompt: "A silo is shaped like a cylinder with a hemisphere on top. The cylinder has a radius of 4 feet and a height of 10 feet, and the hemisphere has the same radius. What is the silo's total volume in terms of π?",
          walkthrough:
            "Step 1: Recognize this is a composite figure — two shapes combined, requiring two separate formulas added together, not just one shape's formula. Step 2: Cylinder volume: πr²h = π(4²)(10) = 160π. Step 3: Hemisphere volume (half a sphere): (1/2)(4/3)πr³ = (1/2)(4/3)π(64) = (128/3)π. Step 4: Add the two volumes together: 160π + (128/3)π = (480/3)π + (128/3)π = (608/3)π.",
          answer: "(608/3)π, found by computing the cylinder's volume and the hemisphere's volume separately, then adding them together — the defining move for any composite-figure problem.",
          diagram: { kind: "solid", shape: "cylinderHemisphere", labels: { r: "4", h: "10" } },
          difficulty: "medium",
        },
        {
          prompt: "A cylindrical pipe has an outer radius of 5 cm and an inner radius of 3 cm (it's hollow), and a length of 20 cm. What is the volume of the material making up the pipe, in terms of π?",
          walkthrough:
            "Step 1: Recognize this composite figure requires SUBTRACTING one shape from another, not adding — the pipe's material is the outer cylinder minus the hollow inner cylinder. Step 2: Compute the outer cylinder's volume: π(5²)(20) = 500π. Step 3: Compute the inner (hollow) cylinder's volume: π(3²)(20) = 180π. Step 4: Subtract: 500π - 180π = 320π.",
          answer: "320π, found by subtracting the hollow inner cylinder's volume from the outer cylinder's volume — composite figures sometimes require subtracting a removed shape, not just adding two shapes together.",
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
          prompt: "A rectangular box has a length of x, a width of 3, and a height of 5. Which expression gives the volume V of the box, in terms of x?",
          walkthrough:
            "Step 1: Identify the formula: rectangular box volume = length × width × height. Step 2: Substitute the given dimensions: V = x × 3 × 5. Step 3: Simplify: V = 15x.",
          answer: "V = 15x, found by substituting the given dimensions directly into the volume formula.",
          diagram: { kind: "solid", shape: "box", labels: { l: "x", w: "3", h: "5" } },
          difficulty: "easy",
        },
        {
          prompt: "A cylinder has a radius of r and a height of 4. Which expression gives the volume V of the cylinder, in terms of r?",
          walkthrough:
            "Step 1: Identify the formula: cylinder volume = πr²h. Step 2: Substitute the given dimensions: V = πr²(4). Step 3: Simplify: V = 4πr².",
          answer: "V = 4πr², found by substituting the given dimensions into the cylinder volume formula.",
          diagram: { kind: "solid", shape: "cylinder", labels: { r: "r", h: "4" } },
          difficulty: "easy",
        },
        {
          prompt: "A rectangular prism has a height of 8 inches. The length of its base is x inches, which is 3 inches more than the width of the base. Which function V gives the volume, in cubic inches, in terms of x?",
          walkthrough:
            "Step 1: Identify the formula: rectangular prism volume = length × width × height. Step 2: Translate the worded dimensions: length = x (given directly); 'length is 3 more than width' means width = x - 3. Step 3: Height is given directly as 8. Step 4: Substitute: V = x(x-3)(8) = 8x(x-3).",
          answer: "V(x) = 8x(x-3), found by translating 'length is 3 more than width' into width = x-3, then substituting all three dimensions into the volume formula.",
          diagram: { kind: "solid", shape: "box", labels: { l: "x", w: "x-3", h: "8" } },
          difficulty: "medium",
        },
        {
          prompt: "A cylindrical can has a height that is twice its radius r. Which expression gives the volume V of the can, in terms of r?",
          walkthrough:
            "Step 1: Identify the formula: cylinder volume = πr²h. Step 2: Translate 'height that is twice its radius' into height = 2r — a multiplicative relationship, not additive. Step 3: Substitute: V = πr²(2r) = 2πr³.",
          answer: "V = 2πr³, found by translating 'twice its radius' into height = 2r, then substituting into the cylinder volume formula and simplifying.",
          diagram: { kind: "solid", shape: "cylinder", labels: { r: "r", h: "2r" } },
          difficulty: "medium",
        },
        {
          prompt: "A rectangular box has a length of x. Its width is half its length, and its height is 4 inches less than its width. Which expression gives the volume V of the box, in terms of x?",
          walkthrough:
            "Step 1: Identify the formula: rectangular box volume = length × width × height. Step 2: Translate both worded relationships in sequence: width = half the length = x/2; height = 4 less than the width = (x/2) - 4. Step 3: Substitute all three into the formula: V = x × (x/2) × ((x/2) - 4). Step 4: Expand and simplify: x × (x/2) = x²/2, then (x²/2) × ((x/2) - 4) = x³/4 - 2x².",
          answer: "V = x³/4 - 2x², found by translating two chained comparative relationships before substituting into the volume formula and fully expanding.",
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
          prompt: "A triangle's exterior angle measures 110°, and it is not adjacent to one of the triangle's interior angles of 40°. What is the measure of the third interior angle?",
          walkthrough:
            "Step 1: Recall the exterior angle rule: an exterior angle equals the sum of the two non-adjacent interior angles. Step 2: Set up the equation directly: 110 = 40 + x, where x is the unknown non-adjacent interior angle. Step 3: Solve: x = 70.",
          answer: "70°, found directly using the exterior angle rule rather than first finding the triangle's third angle via the 180° rule and then subtracting.",
          diagram: { kind: "triangleAngles", angleA: "?", angleB: "40°", exterior: { at: "C", label: "110°" } },
          difficulty: "easy",
        },
        {
          prompt: "A triangle has interior angles measuring 55° and 65°. What is the measure of the exterior angle at the triangle's third vertex?",
          walkthrough:
            "Step 1: Recall the exterior angle rule: an exterior angle equals the sum of the two interior angles that are NOT adjacent to it. Step 2: The two given angles (55° and 65°) are exactly the pair non-adjacent to the exterior angle at the third vertex, so they can be added directly. Step 3: Add: 55 + 65 = 120.",
          answer: "120°, found by adding the two known interior angles directly — this time both non-adjacent angles were given up front, rather than needing to solve for one of them first.",
          diagram: { kind: "triangleAngles", angleA: "55°", angleB: "65°", exterior: { at: "C", label: "?" } },
          difficulty: "medium",
        },
        {
          prompt: "A triangle has interior angles measuring 50° and 70°. What is the measure of the third interior angle?",
          walkthrough:
            "Step 1: Recall that a triangle's interior angles always sum to 180°. Step 2: Subtract the two known angles: 180 - 50 - 70 = 60.",
          answer: "60°, found directly using the 180° rule.",
          diagram: { kind: "triangleAngles", angleA: "50°", angleB: "70°", angleC: "?" },
          difficulty: "easy",
        },
        {
          prompt: "A triangle's exterior angle measures 115°. What is the measure of the interior angle adjacent to this exterior angle?",
          walkthrough:
            "Step 1: Recognize this asks for the ADJACENT interior angle, not a non-adjacent one — the exterior-angle shortcut (exterior = sum of non-adjacent angles) doesn't directly apply here. Step 2: Instead, use the fact that an exterior angle and its adjacent interior angle form a straight line, summing to 180°. Step 3: 180 - 115 = 65.",
          answer: "65° — since this asks for the ADJACENT interior angle, the relevant rule is that an exterior angle and its adjacent interior angle are supplementary, not the sum-of-non-adjacent-angles shortcut.",
          diagram: { kind: "triangleAngles", angleC: "?", exterior: { at: "C", label: "115°" } },
          difficulty: "medium",
        },
        {
          prompt: "In triangle ABC, angle A = 55° and angle B = 60°. Side BC is extended beyond C to point D, forming triangle ACD, where angle ADC = 35°. What is the measure of angle DAC?",
          walkthrough:
            "Step 1: Find the third angle of triangle ABC first: angle ACB = 180 - 55 - 60 = 65°. Step 2: Since angle ACD and angle ACB form a straight line along BD, they're supplementary: angle ACD = 180 - 65 = 115°. Step 3: Now treat angle ACD as one interior angle of the second triangle, ACD, and apply the 180° rule to that triangle: 115 + 35 + angle DAC = 180, so angle DAC = 30°.",
          answer: "30° — this requires chaining two triangles together: finding an angle in triangle ABC, using it to find the adjacent angle at C, then using that as an interior angle of triangle ACD to apply the 180° rule again.",
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
          prompt: "Two parallel lines are cut by a transversal. If one angle measures 65°, what is the measure of its co-interior (same-side interior) angle?",
          walkthrough:
            "Step 1: Identify the angle relationship at play: co-interior (same-side interior) angles, not corresponding or alternate interior angles. Step 2: Recall the rule for this specific pair: co-interior angles are supplementary, summing to 180° (unlike corresponding or alternate interior angles, which are equal). Step 3: Solve: 180 - 65 = 115°.",
          answer: "115°, using the co-interior angle rule (supplementary, summing to 180°) rather than the equal-angle rule that applies to corresponding or alternate interior angles.",
          diagram: { kind: "parallelTransversal", givenLabel: "65°", givenPosition: 3, askedLabel: "?", askedPosition: 5 },
          difficulty: "easy",
        },
        {
          prompt: "Two parallel lines are cut by a transversal. If one angle measures 72°, what is the measure of its alternate exterior angle?",
          walkthrough:
            "Step 1: Identify the angle relationship at play: alternate exterior angles this time, not co-interior. Step 2: Recall the rule for this specific pair: alternate exterior angles are equal, not supplementary — the opposite relationship from the co-interior pair in the example above. Step 3: Since the angles are equal, the alternate exterior angle also measures 72°.",
          answer: "72° — alternate exterior angles are equal, which is the opposite rule from the supplementary co-interior pair covered above, and mixing the two up is the single most common error in this subskill.",
          diagram: { kind: "parallelTransversal", givenLabel: "72°", givenPosition: 1, askedLabel: "?", askedPosition: 8 },
          difficulty: "medium",
        },
        {
          prompt: "Two parallel lines are cut by a transversal. If one angle measures 110°, what is the measure of its corresponding angle?",
          walkthrough:
            "Step 1: Identify the angle relationship: corresponding angles, which sit in the same relative position at each intersection. Step 2: Recall the rule: corresponding angles are equal. Step 3: The corresponding angle also measures 110°.",
          answer: "110° — corresponding angles are always equal.",
          diagram: { kind: "parallelTransversal", givenLabel: "110°", givenPosition: 2, askedLabel: "?", askedPosition: 6 },
          difficulty: "easy",
        },
        {
          prompt: "Two parallel lines are cut by a transversal. One angle measures 75°. What is the measure of the angle that is vertical to its co-interior (same-side interior) angle?",
          walkthrough:
            "Step 1: First find the co-interior angle to the given 75° angle: co-interior angles are supplementary, so 180 - 75 = 105°. Step 2: The question then asks for the angle VERTICAL to that 105° angle — vertical angles (formed by two intersecting lines) are always equal to each other, regardless of the parallel-lines context. Step 3: The vertical angle also measures 105°.",
          answer: "105° — this chains two separate rules: the co-interior (supplementary) relationship to get 105°, then the vertical-angles-are-equal rule, which leaves that value unchanged.",
          diagram: { kind: "parallelTransversal", givenLabel: "75°", givenPosition: 3, askedLabel: "?", askedPosition: 8, extraLabel: "105°", extraPosition: 5 },
          difficulty: "medium",
        },
        {
          prompt: "Lines p and q are parallel. A zigzag path starts on line p, bends at a point B between the lines, and ends on line q. The angle between line p and the first segment (on the interior side) is 35°, and the angle between line q and the second segment (on the interior side) is 50°. What is the measure of the angle at the bend point B, on the interior side of the zigzag?",
          walkthrough:
            "Step 1: This classic 'bent path between two parallel lines' setup is solved by drawing an auxiliary line through the bend point B, parallel to both p and q. Step 2: This auxiliary line splits the angle at B into two pieces, each an alternate interior angle with one of the given angles — one piece equals 35°, and the other equals 50°. Step 3: Add the two pieces together to get the full angle at B: 35 + 50 = 85°.",
          answer: "85° — this zigzag setup is solved by drawing an auxiliary line through the bend point parallel to both given lines, splitting the unknown angle into two alternate-interior-angle pieces that add up to the given angles.",
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
          prompt: "Triangle ABC is similar to triangle DEF. If AB = 6, DE = 9, and BC = 8, what is EF?",
          walkthrough:
            "Step 1: Identify the scale factor using the pair of corresponding sides that are both given: AB corresponds to DE (since the triangles' names list vertices in matching order), so scale = DE/AB = 9/6 = 1.5. Step 2: Apply that same scale factor to BC's corresponding side, EF: EF = BC × 1.5 = 8 × 1.5 = 12.",
          answer: "EF = 12, found by first finding the scale factor between the two known corresponding sides, then applying it to BC to find EF.",
          diagram: { kind: "similarTriangles", leftLabels: ["A", "B", "C"], leftSides: ["6", "8", ""], rightLabels: ["D", "E", "F"], rightSides: ["9", "?", ""] },
          difficulty: "easy",
        },
        {
          prompt: "Triangle PQR is similar to triangle XYZ with a scale factor of 2/3 from PQR to XYZ. If PQ = 12, what is XY?",
          walkthrough:
            "Step 1: Unlike some problems, the scale factor is given directly here: 2/3. Step 2: Apply it to the known side, PQ, to find its corresponding side, XY: XY = 12 × (2/3) = 8.",
          answer: "XY = 8, found by applying the given scale factor directly to the known side PQ.",
          diagram: { kind: "similarTriangles", leftLabels: ["P", "Q", "R"], leftSides: ["12", "", ""], rightLabels: ["X", "Y", "Z"], rightSides: ["?", "", ""] },
          difficulty: "easy",
        },
        {
          prompt: "Triangle ABC is similar to triangle EFD (note the vertex order). If AB = 10, EF = 15, and CA = 8, what is DE?",
          walkthrough:
            "Step 1: Carefully match vertices according to the order given in the similarity statement: triangle ABC ~ triangle EFD means A corresponds to E, B corresponds to F, and C corresponds to D — not necessarily the order you'd guess from how the sides are listed. Step 2: Find the scale factor from the known pair: AB corresponds to EF, so scale = EF/AB = 15/10 = 1.5. Step 3: CA corresponds to DE (since C↔D and A↔E), so DE = CA × 1.5 = 8 × 1.5 = 12.",
          answer: "DE = 12 — the key challenge is correctly matching CA to DE based on the vertex order in 'triangle ABC ~ triangle EFD,' not just guessing based on which sides are listed near each other.",
          diagram: { kind: "similarTriangles", leftLabels: ["A", "B", "C"], leftSides: ["10", "", "8"], rightLabels: ["E", "F", "D"], rightSides: ["15", "", "?"] },
          difficulty: "medium",
        },
        {
          prompt: "Triangle GHI is similar to triangle JKL. GH = 14, HI = 21, JK = 6. What is KL?",
          walkthrough:
            "Step 1: Find the scale factor using the one pair of corresponding sides given completely (GH and JK): scale = JK/GH = 6/14 = 3/7. Step 2: Apply that scale factor to HI (which corresponds to KL) to find the unknown: KL = 21 × (3/7) = 9.",
          answer: "KL = 9, found by first computing the scale factor from the one fully-known corresponding pair, then applying it to HI to find KL.",
          diagram: { kind: "similarTriangles", leftLabels: ["G", "H", "I"], leftSides: ["14", "21", ""], rightLabels: ["J", "K", "L"], rightSides: ["6", "?", ""] },
          difficulty: "medium",
        },
        {
          prompt: "Triangle ABC has angle A = 50° and angle B = 70°. Triangle DEF has angle D = 50° and angle F = 60°. Are triangles ABC and DEF similar? If so, and if AB = 9 while DE = 6, what is the scale factor from ABC to DEF?",
          walkthrough:
            "Step 1: Before applying any proportion, confirm similarity — find the missing angle in each triangle. Triangle ABC's third angle: 180 - 50 - 70 = 60°. Triangle DEF's third angle (angle E): 180 - 50 - 60 = 70°. Step 2: Compare the full angle sets: ABC has 50°, 70°, 60°; DEF has 50°, 70°, 60° too — since all corresponding angles match, the triangles ARE similar, a step the problem doesn't hand you directly. Step 3: Match sides by their EQUAL angles, not listed order: angle A (50°) matches angle D (50°), and since angle C (60°) matches angle F (60°), side AB (opposite C) corresponds to side DE (opposite F). The scale factor from ABC to DEF is DE/AB = 6/9 = 2/3.",
          answer: "The triangles are similar (all three corresponding angles match once the missing angles are found), and the scale factor from ABC to DEF is 2/3 — found by first computing each triangle's missing angle to confirm similarity, then matching sides by equal angles rather than listed order.",
          diagram: { kind: "similarTriangles", leftLabels: ["A", "B", "C"], leftSides: ["9", "", ""], rightLabels: ["D", "E", "F"], rightSides: ["6", "", ""] },
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
          prompt: "Two lines intersect, forming an angle of 65°. What is the measure of the angle vertical to it?",
          walkthrough: "Step 1: Vertical angles (directly across from each other at an intersection) are always equal. Step 2: The vertical angle also measures 65°.",
          answer: "65° — vertical angles are always equal, with no further calculation needed.",
          diagram: { kind: "intersectingLines", lines: 2, angles: [{ label: "65°", position: 0 }, { label: "?", position: 2 }] },
          difficulty: "easy",
        },
        {
          prompt: "Two lines intersect, forming an angle of 110° next to (adjacent to) an unknown angle along the same straight line. What is the measure of the unknown angle?",
          walkthrough:
            "Step 1: Angles adjacent to each other along a straight line are supplementary, adding to 180°. Step 2: Subtract: 180 - 110 = 70°.",
          answer: "70° — adjacent angles along a straight line always sum to 180°.",
          diagram: { kind: "intersectingLines", lines: 2, angles: [{ label: "110°", position: 0 }, { label: "?", position: 1 }] },
          difficulty: "easy",
        },
        {
          prompt:
            "Two lines intersect at a point. One of the four angles formed measures (3x + 15)°, and its vertical angle measures (5x - 25)°. What is x?",
          walkthrough:
            "Step 1: Since these two angles are vertical angles, they must be equal — set their expressions equal to each other: 3x + 15 = 5x - 25. Step 2: Subtract 3x from both sides: 15 = 2x - 25. Step 3: Add 25 to both sides: 40 = 2x, so x = 20.",
          answer: "x = 20, found by setting the two vertical angles' expressions equal to each other, since vertical angles are always equal.",
          diagram: { kind: "intersectingLines", lines: 2, angles: [{ label: "(3x+15)°", position: 0 }, { label: "(5x-25)°", position: 2 }] },
          difficulty: "medium",
        },
        {
          prompt:
            "Two lines intersect at a point, forming four angles. One angle measures (2x + 10)°, and the angle adjacent to it along the same line measures (3x - 30)°. What is the measure of the larger of the two angles?",
          walkthrough:
            "Step 1: Since these two angles are adjacent along a straight line, they're supplementary: (2x+10) + (3x-30) = 180. Step 2: Combine like terms: 5x - 20 = 180, so 5x = 200, giving x = 40. Step 3: Substitute back to find each angle: 2(40)+10 = 90°, and 3(40)-30 = 90° — both angles happen to be equal in this case (90° each), so the 'larger' angle is 90°.",
          answer: "90° — solving for x using the supplementary-angle relationship, then substituting back into both expressions to compare them.",
          diagram: { kind: "intersectingLines", lines: 2, angles: [{ label: "(2x+10)°", position: 0 }, { label: "(3x-30)°", position: 1 }] },
          difficulty: "medium",
        },
        {
          prompt:
            "Three lines all pass through the same single point. One of the six angles formed measures 40°, and it is adjacent (with no other angle between them) to a second angle, which is itself adjacent to a third angle that is vertical to the original 40° angle. What is the measure of the second angle?",
          walkthrough:
            "Step 1: With three lines through one point, six angles are formed, but the straight-line (180°) rule still applies along each of the three lines individually. Step 2: The third angle described is vertical to the 40° angle, so it also measures 40°. Step 3: The first, second, and third angles together must span a straight line (180°) along one of the three lines, since they're described as consecutively adjacent: 40 + (second angle) + 40 = 180, so the second angle = 100°.",
          answer:
            "100° — even with three intersecting lines, the straight-line (180°) and vertical-angle (equal) rules still apply to each individual line, just with more angles to track.",
          diagram: { kind: "intersectingLines", lines: 3, angles: [{ label: "40°", position: 0 }, { label: "?", position: 1 }, { label: "40°", position: 2, muted: true }] },
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
          prompt: "A support cable is anchored 15 feet from the base of a pole and meets the top of the pole at a 40° angle of elevation. Which expression gives the pole's height?",
          walkthrough:
            "Step 1: Identify the triangle: the pole's height is opposite the 40° angle, and the 15-foot distance is adjacent to it (the cable itself is the hypotenuse). Step 2: Since we relate opposite and adjacent, this calls for tangent (TOA: opposite/adjacent). Step 3: Set up: tan(40°) = height/15, so height = 15 · tan(40°).",
          answer: "15 · tan(40°), found by correctly identifying the height as 'opposite' the given angle and the 15-foot distance as 'adjacent' to it.",
          diagram: { kind: "rightTriangle", base: "15", angle: "40°", height: "?", solveFor: "height" },
          difficulty: "easy",
        },
        {
          prompt: "A ladder leans against a wall, reaching a point 12 feet up the wall. The base of the ladder sits 5 feet from the wall. What angle does the ladder make with the ground?",
          walkthrough:
            "Step 1: Identify the triangle relative to the angle at the ground: the wall height (12 feet) is opposite that angle, and the base distance (5 feet) is adjacent to it — the ladder itself is the hypotenuse. Step 2: Relating opposite and adjacent calls for tangent, same as the cable example — but this time the angle itself is unknown, not a side length. Step 3: Set up tan(angle) = 12/5, then undo the tangent with its inverse to solve for the angle itself: angle = tan⁻¹(12/5).",
          answer: "The angle equals tan⁻¹(12/5) — the same opposite/adjacent setup as the cable example, but solved for the angle itself using an inverse trig function instead of for a side length.",
          diagram: { kind: "rightTriangle", base: "5", height: "12", angle: "?", solveFor: "angle" },
          difficulty: "medium",
        },
        {
          prompt: "In a right triangle, the side opposite a 30° angle is 5, and the hypotenuse is 10. What is sin(30°) based on this triangle?",
          walkthrough:
            "Step 1: Identify the sides relative to the 30° angle: 5 is opposite, 10 is the hypotenuse. Step 2: Sine relates opposite and hypotenuse (SOH). Step 3: sin(30°) = 5/10 = 1/2.",
          answer: "1/2, found by directly applying opposite over hypotenuse.",
          diagram: { kind: "rightTriangle", height: "5", hypotenuse: "10", angle: "30°" },
          difficulty: "easy",
        },
        {
          prompt: "A 20-foot ramp rises at an angle of 15° from the ground to a loading dock. Which expression gives the horizontal distance the ramp covers?",
          walkthrough:
            "Step 1: Identify the triangle: the ramp itself (20 feet) is the hypotenuse, and the horizontal distance is adjacent to the 15° angle (the vertical rise would be opposite). Step 2: Since we relate adjacent and hypotenuse, this calls for cosine (CAH: adjacent/hypotenuse). Step 3: Set up: cos(15°) = horizontal/20, so horizontal = 20cos(15°).",
          answer: "20cos(15°), found by correctly identifying the horizontal distance as 'adjacent' to the given angle and the ramp as the hypotenuse — calling for cosine, not tangent or sine.",
          diagram: { kind: "rightTriangle", hypotenuse: "20", angle: "15°", base: "?", solveFor: "base" },
          difficulty: "medium",
        },
        {
          prompt: "An isosceles triangle has two equal sides of length 13 and a base of 10. An altitude is drawn from the apex to the midpoint of the base, forming two right triangles. What is the sine of the angle between one of the equal sides and the base?",
          walkthrough:
            "Step 1: Recognize that the altitude from the apex to the base's midpoint creates two congruent RIGHT triangles — the key setup insight before any trig can be applied. Step 2: In one of these right triangles, the hypotenuse is the original equal side (13), and half the base (5) is adjacent to the angle in question. Step 3: Find the altitude (opposite that angle) using the Pythagorean theorem: √(13² - 5²) = √144 = 12. Step 4: Sine = opposite/hypotenuse = 12/13.",
          answer: "12/13 — the key step is recognizing that the altitude creates a right triangle within the isosceles triangle, with half the base and the equal side as two of its sides, before the Pythagorean theorem and SOH-CAH-TOA can even be applied.",
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
          prompt: "In a right triangle, the side opposite a 30° angle is 5. What is the hypotenuse?",
          walkthrough:
            "Step 1: Recognize this as a 30-60-90 triangle based on the given 30° angle. Step 2: Recall the fixed ratio: if the side opposite 30° is x, the hypotenuse is always 2x. Step 3: Substitute x = 5: hypotenuse = 2(5) = 10.",
          answer: "10, found instantly using the memorized 30-60-90 ratio (hypotenuse = 2 × side opposite 30°) without needing the Pythagorean theorem.",
          diagram: { kind: "rightTriangle", height: "5", angle: "30°", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
        },
        {
          prompt: "In a right triangle, both legs measure 7√2. What is the length of the hypotenuse?",
          walkthrough:
            "Step 1: Recognize this as a 45-45-90 triangle, since both legs are equal. Step 2: Recall the fixed ratio: if a leg is x, the hypotenuse is x√2 — this still applies even though the given leg length already contains a radical. Step 3: Substitute x = 7√2: hypotenuse = 7√2 × √2 = 7 × 2 = 14.",
          answer: "14 — the same 45-45-90 ratio as always, it just takes an extra moment of care since the leg's length already has a √2 in it before multiplying by another √2.",
          diagram: { kind: "rightTriangle", base: "7√2", height: "7√2", angle: "45°", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "medium",
        },
        {
          prompt: "In a right triangle, both legs measure 9. What is the length of the hypotenuse?",
          walkthrough:
            "Step 1: Recognize this as a 45-45-90 triangle, since both legs are equal. Step 2: Recall the ratio: if a leg is x, the hypotenuse is x√2. Step 3: Substitute x = 9: hypotenuse = 9√2.",
          answer: "9√2, found instantly using the 45-45-90 ratio.",
          diagram: { kind: "rightTriangle", base: "9", height: "9", angle: "45°", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
        },
        {
          prompt: "In a right triangle, the hypotenuse measures 14, and one angle measures 30°. What is the length of the side opposite the 30° angle?",
          walkthrough:
            "Step 1: Recognize this as a 30-60-90 triangle. Step 2: Recall the ratio: if the side opposite 30° is x, the hypotenuse is 2x — but this time the hypotenuse is given, and x must be found by working backward. Step 3: Set up: 2x = 14, so x = 7.",
          answer: "7, found by working backward from the hypotenuse using the same 30-60-90 ratio, rather than starting from the short leg.",
          diagram: { kind: "rightTriangle", hypotenuse: "14", angle: "30°", height: "?", solveFor: "height" },
          difficulty: "medium",
        },
        {
          prompt: "In a right triangle, the hypotenuse measures 16, and one angle measures 60°. What is the length of the side opposite the 60° angle?",
          walkthrough:
            "Step 1: Recognize this as a 30-60-90 triangle (since one angle is 60°, the other non-right angle must be 30°). Step 2: Use the hypotenuse to find x first: since hypotenuse = 2x, 16 = 2x, so x = 8 (the side opposite the 30° angle, the shortest side). Step 3: The side opposite 60° is x√3, not x itself: 8√3.",
          answer: "8√3 — this requires two steps: first finding x from the hypotenuse (x = 8), then correctly applying x√3 (not x) for the side opposite 60°.",
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
          prompt: "In a right triangle, the two legs measure 6 and 8. What is the sine of the angle opposite the side of length 6?",
          walkthrough:
            "Step 1: Sine needs the hypotenuse, which isn't given directly — find it first with the Pythagorean theorem: √(6² + 8²) = √(36+64) = √100 = 10. Step 2: Sine = opposite/hypotenuse = 6/10.",
          answer: "3/5, found by first computing the missing hypotenuse (10) via the Pythagorean theorem, then applying opposite over hypotenuse.",
          diagram: { kind: "rightTriangle", base: "8", height: "6", angle: "θ", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
        },
        {
          prompt: "In a right triangle, one leg measures 5 and the hypotenuse measures 13. What is the tangent of the angle for which the leg of length 5 is adjacent?",
          walkthrough:
            "Step 1: Notice only two sides are given (5 and 13, a leg and the hypotenuse) — tangent needs opposite/adjacent, so the missing leg must be found first. Step 2: Apply the Pythagorean theorem: missing leg = √(13² - 5²) = √(169-25) = √144 = 12. Step 3: Tangent = opposite/adjacent = 12/5.",
          answer: "12/5, found by first using the Pythagorean theorem to find the missing leg, since tangent requires both the opposite and adjacent sides, and only one was given directly.",
          diagram: { kind: "rightTriangle", base: "5", angle: "θ", height: "?", hypotenuse: "13", solveFor: "height" },
          difficulty: "easy",
        },
        {
          prompt: "In a right triangle, the two legs measure 4 and 4. What is the sine of one of the acute angles?",
          walkthrough:
            "Step 1: Apply the Pythagorean theorem to find the hypotenuse: √(4² + 4²) = √32. Step 2: Simplify the radical before using it: √32 = √(16×2) = 4√2. Step 3: Sine = opposite/hypotenuse = 4/(4√2) = 1/√2, which rationalizes to √2/2.",
          answer: "√2/2, found by first simplifying the radical hypotenuse before computing and rationalizing the sine ratio — skipping the simplification step makes the final ratio much messier to work with.",
          diagram: { kind: "rightTriangle", base: "4", height: "4", angle: "θ", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "medium",
        },
        {
          prompt: "In a right triangle, one leg measures 9 and the hypotenuse measures 15. What is the cosine of the acute angle that is NOT adjacent to the leg of length 9?",
          walkthrough:
            "Step 1: Find the missing leg first: √(15² - 9²) = √(225-81) = √144 = 12. Step 2: Carefully identify sides relative to the specific angle asked about — since the question asks for the angle NOT adjacent to the 9-leg, that means 9 is actually OPPOSITE this angle, and the other leg (12) is adjacent to it instead. Step 3: Cosine = adjacent/hypotenuse = 12/15 = 4/5.",
          answer: "4/5 — the missing leg is found first via the Pythagorean theorem, but the harder part is correctly identifying that the 9-leg is OPPOSITE (not adjacent to) the specific angle asked about.",
          diagram: { kind: "rightTriangle", height: "9", hypotenuse: "15", angle: "θ", base: "?", solveFor: "base" },
          difficulty: "medium",
        },
        {
          prompt: "A support wire runs from the top of a 24-foot pole to a point on the ground 18 feet from the pole's base. What is the sine of the angle the wire makes with the ground?",
          walkthrough:
            "Step 1: Identify the triangle: the pole's height (24) is opposite the ground angle, the ground distance (18) is adjacent, and the wire itself is the hypotenuse — which isn't given directly and must be found. Step 2: Apply the Pythagorean theorem: √(24² + 18²) = √(576+324) = √900 = 30. Step 3: Sine = opposite/hypotenuse = 24/30 = 4/5.",
          answer: "4/5, found by first using the Pythagorean theorem to find the wire's length (30 feet), since sine specifically requires the hypotenuse — unlike tangent, which could have been found directly from the pole height and ground distance alone.",
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
          prompt: "What is the value of cos(2π + π/3)?",
          walkthrough:
            "Step 1: Adding a full 2π rotation to any angle doesn't change its trig function values — it lands on the exact same position. Step 2: So cos(2π + π/3) is the same as cos(π/3). Step 3: cos(π/3) = 1/2.",
          answer: "1/2 — adding a full 2π rotation doesn't change where the angle points, so cos(2π + π/3) equals the much simpler cos(π/3).",
          diagram: { kind: "unitCircleAngle", rawLabel: "2π + π/3", angleDegrees: 60 },
          difficulty: "easy",
        },
        {
          prompt: "What is the value of sin(-π/6)?",
          walkthrough:
            "Step 1: A negative angle means rotating clockwise instead of counterclockwise; find its coterminal positive angle by adding 2π: -π/6 + 2π = 11π/6. Step 2: 11π/6 lies in the fourth quadrant, where sine values are negative. Step 3: The reference angle is π/6, and sin(π/6) = 1/2, so with the fourth-quadrant sign: sin(11π/6) = -1/2.",
          answer: "-1/2 — converting the negative angle to its positive coterminal angle (11π/6) places it in the fourth quadrant, where sine is negative, with a reference angle of π/6.",
          diagram: { kind: "unitCircleAngle", rawLabel: "-π/6", angleDegrees: -30 },
          difficulty: "easy",
        },
        {
          prompt: "What is the value of tan(13π/4)?",
          walkthrough:
            "Step 1: 13π/4 is larger than 2π (which is 8π/4), so subtract one full rotation: 13π/4 - 8π/4 = 5π/4. Step 2: 5π/4 lies in the third quadrant, where tangent is positive. Step 3: The reference angle is π/4, and tan(π/4) = 1, so tan(5π/4) = 1.",
          answer: "1, found by subtracting one full 2π rotation from 13π/4 to get the coterminal angle 5π/4, then applying the reference angle with the correct sign for the third quadrant.",
          diagram: { kind: "unitCircleAngle", rawLabel: "13π/4", angleDegrees: 585 },
          difficulty: "medium",
        },
        {
          prompt: "What is the value of sin(17π/2)?",
          walkthrough:
            "Step 1: 17π/2 is much larger than 2π, so it needs MULTIPLE full rotations subtracted, not just one — 17π/2 ÷ (4π/2) = 4.25, meaning 4 full rotations fit inside. Step 2: Subtract 4 full rotations (4 × 4π/2 = 16π/2) from the original angle: 17π/2 - 16π/2 = π/2. Step 3: sin(π/2) = 1.",
          answer: "1 — this angle needed FOUR full 2π rotations subtracted, not just one, to reduce it down to the simple coterminal angle π/2.",
          diagram: { kind: "unitCircleAngle", rawLabel: "17π/2", angleDegrees: 1530 },
          difficulty: "medium",
        },
        {
          prompt: "What is the value of cos(-11π/3)?",
          walkthrough:
            "Step 1: This angle is both negative AND large in magnitude, so it may need multiple additions of 2π to reach the standard range. Step 2: Add 2π (6π/3) once: -11π/3 + 6π/3 = -5π/3 — still negative, so add 2π again: -5π/3 + 6π/3 = π/3, now within the standard range. Step 3: cos(π/3) = 1/2.",
          answer: "1/2 — this angle needed 2π added TWICE, since it was both negative and large in magnitude, before landing on the simple coterminal angle π/3.",
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
          prompt: "A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?",
          walkthrough: "Step 1: Apply the Pythagorean theorem: 6² + 8² = c². Step 2: Simplify: 36 + 64 = 100 = c². Step 3: Take the square root: c = 10.",
          answer: "10 — a recognizable 6-8-10 right triangle (a scaled-up 3-4-5).",
          diagram: { kind: "rightTriangle", base: "6", height: "8", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "easy",
        },
        {
          prompt: "A right triangle has a hypotenuse of length 13 and one leg of length 5. What is the length of the other leg?",
          walkthrough:
            "Step 1: Since the hypotenuse is known, solve for the missing leg by subtracting: b² = 13² - 5². Step 2: Simplify: 169 - 25 = 144 = b². Step 3: Take the square root: b = 12.",
          answer: "12 — subtracting the known leg's square from the hypotenuse's square, since the hypotenuse (not a leg) was given.",
          diagram: { kind: "rightTriangle", hypotenuse: "13", base: "5", height: "?", solveFor: "height" },
          difficulty: "easy",
        },
        {
          prompt: "A right triangle has legs of length 5 and 9. What is the length of the hypotenuse, in simplest radical form?",
          walkthrough:
            "Step 1: Apply the theorem: 5² + 9² = c². Step 2: Simplify: 25 + 81 = 106 = c². Step 3: Take the square root: c = √106 — since 106 has no perfect-square factors other than 1 (its factors are 2 × 53, neither a perfect square), this radical is already fully simplified.",
          answer: "√106 — the radical doesn't simplify further, since 106 has no perfect-square factor greater than 1.",
          diagram: { kind: "rightTriangle", base: "5", height: "9", hypotenuse: "?", solveFor: "hypotenuse" },
          difficulty: "medium",
        },
        {
          prompt:
            "A ladder 15 feet long leans against a wall, with its base 9 feet from the wall. How high up the wall does the ladder reach?",
          walkthrough:
            "Step 1: Translate the scenario into a right triangle: the ladder is the hypotenuse (15), the distance from the wall is one leg (9), and the height up the wall is the missing leg. Step 2: Apply the theorem: 9² + b² = 15². Step 3: Simplify: 81 + b² = 225, so b² = 144, and b = 12 feet.",
          answer: "12 feet — after translating the word problem into a right triangle, the ladder (hypotenuse) and the ground distance (one leg) solve for the missing height (the other leg).",
          diagram: { kind: "rightTriangle", hypotenuse: "15", base: "9", height: "?", solveFor: "height" },
          difficulty: "medium",
        },
        {
          prompt:
            "A right triangle has legs of length 4√3 and 4. Find the length of the hypotenuse, and simplify your answer completely.",
          walkthrough:
            "Step 1: Apply the theorem, squaring each leg carefully: (4√3)² + 4² = c². Step 2: Square the radical term correctly: (4√3)² = 16 × 3 = 48 (don't forget to square both the 4 and the √3 separately, then multiply). Step 3: Combine: 48 + 16 = 64 = c². Step 4: Take the square root: c = 8.",
          answer:
            "8 — the key step is correctly squaring the radical leg, (4√3)² = 48, not just 4² = 16 or accidentally dropping the radical.",
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
          prompt: "If sin(40°) = cos(y°), what is the value of y?",
          walkthrough: "Step 1: Apply the identity sin(x°) = cos(90° - x°) with x = 40. Step 2: y = 90 - 40 = 50.",
          answer: "y = 50 — sin and cos of complementary angles (summing to 90°) are always equal.",
          diagram: { kind: "rightTriangle", angle: "40°", topAngle: "y°" },
          difficulty: "easy",
        },
        {
          prompt: "In a right triangle, angle A and angle B are the two non-right angles. If sin(A) = 0.6, what is cos(B)?",
          walkthrough:
            "Step 1: In any right triangle, the two non-right angles are always complementary (sum to 90°). Step 2: By the complementary angle identity, sin(A) = cos(B) whenever A and B are complementary. Step 3: cos(B) = 0.6, the same value as sin(A), with no calculation needed.",
          answer: "0.6 — sin(A) and cos(B) are automatically equal whenever A and B are a right triangle's two non-right (complementary) angles.",
          diagram: { kind: "rightTriangle", angle: "A", topAngle: "B" },
          difficulty: "easy",
        },
        {
          prompt: "If sin(3x°) = cos(2x° + 15°), what is the value of x?",
          walkthrough:
            "Step 1: Apply the identity: sin of one angle equals cos of its complement, so 3x and (2x+15) must sum to 90. Step 2: Set up the equation: 3x + (2x + 15) = 90. Step 3: Combine like terms: 5x + 15 = 90, so 5x = 75, giving x = 15.",
          answer: "x = 15, found by setting the two angle expressions equal to a sum of 90°, since sin and cos of complementary angles are equal.",
          diagram: { kind: "rightTriangle", angle: "3x°", topAngle: "(2x+15)°" },
          difficulty: "medium",
        },
        {
          prompt: "In right triangle KLM, with the right angle at L, sin(K) = cos(K + 20°). What is the measure of angle K?",
          walkthrough:
            "Step 1: The identity sin(x) = cos(90-x) applies here, but written differently: sin(K) = cos(M) where K and M are complementary, and the problem restates cos(M) as cos(K+20°) — meaning M = K + 20. Step 2: Since K and M are complementary: K + (K + 20) = 90. Step 3: Combine: 2K + 20 = 90, so 2K = 70, giving K = 35°.",
          answer:
            "35° — recognizing that the angle inside cos(K+20°) is really playing the role of the complementary angle M lets the same identity apply, just with an algebraic expression instead of a plain number.",
          diagram: { kind: "rightTriangle", angle: "K", topAngle: "K+20°" },
          difficulty: "hard",
        },
        {
          prompt:
            "Right triangle PQR has its right angle at Q. If sin(P) = 5/13, what is cos(P) + sin(R)?",
          walkthrough:
            "Step 1: This combines two ideas — sin(R) requires the complementary angle identity, but cos(P) requires knowing the actual triangle side ratio, which isn't directly given. Step 2: Since P and R are complementary (both non-right angles in the triangle), sin(R) = cos(P) by the identity — meaning the two quantities being added are actually equal to each other. Step 3: Since sin(P) = 5/13 describes a 5-12-13 right triangle (opposite=5, hypotenuse=13, so adjacent=12), cos(P) = 12/13. Step 4: cos(P) + sin(R) = 12/13 + 12/13 = 24/13.",
          answer:
            "24/13 — recognizing that sin(R) equals cos(P) via the complementary angle identity turns this into doubling a single ratio, found from the 5-12-13 triangle implied by sin(P) = 5/13.",
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
          prompt: "What is the equation of a circle with center (2, -3) and radius 5?",
          walkthrough:
            "Step 1: Start from the template: (x-h)² + (y-k)² = r². Step 2: Substitute h = 2, k = -3, and r = 5, being careful with the sign for k: (x - 2)² + (y - (-3))² = 5², which simplifies to (x-2)² + (y+3)² = 25. Step 3: Double check: since k = -3, the template's '(y - k)' becomes '(y - (-3))' = '(y+3)' — the plus sign is correct, not a typo.",
            answer: "(x-2)² + (y+3)² = 25 — note the '+3' is correct because the center's y-coordinate is negative, flipping the sign from the template's subtraction.",
          diagram: { kind: "circleCoordinate", h: 2, k: -3, r: 5 },
          difficulty: "easy",
        },
        {
          prompt: "What is the equation of a circle with center (-4, 1) and radius 6?",
          walkthrough:
            "Step 1: Start from the template: (x-h)² + (y-k)² = r². Step 2: Substitute h = -4, k = 1, and r = 6, being careful with the sign for h this time: (x - (-4))² + (y - 1)² = 6², which simplifies to (x+4)² + (y-1)² = 36. Step 3: Double check: since h = -4, the template's '(x - h)' becomes '(x - (-4))' = '(x+4)' — the same sign-flip rule as before, just showing up on the x-coordinate instead of the y-coordinate.",
          answer: "(x+4)² + (y-1)² = 36 — the '+4' is correct because the center's x-coordinate is negative, the same flip-the-sign rule as the earlier example, applied to the other coordinate.",
          diagram: { kind: "circleCoordinate", h: -4, k: 1, r: 6 },
          difficulty: "medium",
        },
        {
          prompt: "What is the equation of a circle with center (5, 2) and radius 3?",
          walkthrough:
            "Step 1: Start from the template: (x-h)² + (y-k)² = r². Step 2: Substitute h = 5, k = 2, r = 3: (x-5)² + (y-2)² = 3². Step 3: Simplify: (x-5)² + (y-2)² = 9.",
          answer: "(x-5)² + (y-2)² = 9, found by substituting directly into the template.",
          diagram: { kind: "circleCoordinate", h: 5, k: 2, r: 3 },
          difficulty: "easy",
        },
        {
          prompt: "A circle has the equation (x+1)² + (y-8)² = 49. What are the circle's center and radius?",
          walkthrough:
            "Step 1: Match the given equation to the template (x-h)² + (y-k)² = r². Step 2: Since the equation has (x+1), that's (x-(-1)), so h = -1; since it has (y-8), k = 8. Step 3: The radius is the square root of the right side: √49 = 7, not 49 itself.",
          answer: "Center (-1, 8), radius 7 — read from the equation by matching to the template, remembering to take the SQUARE ROOT of the right side to get the radius.",
          diagram: { kind: "circleCoordinate", h: -1, k: 8, r: 7 },
          difficulty: "medium",
        },
        {
          prompt: "A circle has the equation x² + y² + 6x - 4y - 12 = 0. What is the circle's radius?",
          walkthrough:
            "Step 1: This equation isn't in center-radius form yet — it needs completing the square for both x and y. Step 2: Group x-terms and y-terms, moving the constant to the other side: (x²+6x) + (y²-4y) = 12. Step 3: Complete the square for each group: for x²+6x, add (6/2)²=9; for y²-4y, add (-4/2)²=4 — adding these same amounts to the right side too: (x²+6x+9)+(y²-4y+4) = 12+9+4 = 25. Step 4: This simplifies to (x+3)² + (y-2)² = 25, so the radius is √25 = 5.",
          answer: "5, found by first completing the square on both x and y terms to rewrite the equation in center-radius form before reading off the radius.",
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
          prompt: "A sector has a central angle of 90° in a circle of radius 4. What is its area?",
          walkthrough:
            "Step 1: Determine what fraction of the full circle this sector represents: 90°/360° = 1/4. Step 2: Calculate the full circle's area: πr² = π(16) = 16π. Step 3: Apply the fraction to the full area: (1/4)(16π) = 4π.",
          answer: "4π, found by taking the appropriate fraction (90°/360° = 1/4) of the full circle's area (16π).",
          diagram: { kind: "sector", radiusLabel: "4", angleLabel: "90°", angleDegrees: 90, askFor: "area" },
          difficulty: "easy",
        },
        {
          prompt: "An arc has a central angle of 120° in a circle of radius 9. What is the arc length, in terms of π?",
          walkthrough:
            "Step 1: Determine what fraction of the full circle this arc represents: 120°/360° = 1/3. Step 2: Calculate the full circle's circumference this time, not its area: 2πr = 2π(9) = 18π. Step 3: Apply the same fraction to the circumference: (1/3)(18π) = 6π.",
          answer: "6π, found using the same 'fraction of the whole' logic as sector area above — just applied to circumference instead of area, which is exactly the connection worth internalizing between the two formulas.",
          diagram: { kind: "sector", radiusLabel: "9", angleLabel: "120°", angleDegrees: 120, askFor: "arcLength" },
          difficulty: "medium",
        },
        {
          prompt: "A sector has a central angle of 60° in a circle of radius 6. What is its area?",
          walkthrough:
            "Step 1: Determine the fraction of the full circle: 60°/360° = 1/6. Step 2: Calculate the full circle's area: πr² = π(36) = 36π. Step 3: Apply the fraction: (1/6)(36π) = 6π.",
          answer: "6π, found by taking the appropriate fraction (1/6) of the full circle's area.",
          diagram: { kind: "sector", radiusLabel: "6", angleLabel: "60°", angleDegrees: 60, askFor: "area" },
          difficulty: "easy",
        },
        {
          prompt: "An arc has a length of 5π in a circle of radius 10. What is the measure of the central angle, in degrees?",
          walkthrough:
            "Step 1: Instead of finding a fraction of the circle from a given angle, work backward: find what FRACTION of the full circumference the given arc length represents. Step 2: Full circumference = 2πr = 2π(10) = 20π; fraction = 5π/20π = 1/4. Step 3: Apply that same fraction to the full 360°: (1/4)(360°) = 90°.",
          answer: "90°, found by first determining what fraction of the full circumference the given arc length represents, then applying that fraction to 360° — working backward from the usual direction.",
          diagram: { kind: "sector", radiusLabel: "10", angleLabel: "?", angleDegrees: 90, askFor: "angle" },
          difficulty: "medium",
        },
        {
          prompt: "A sector has a central angle of 2π/3 radians in a circle of radius 9. What is the arc length of the sector?",
          walkthrough:
            "Step 1: Notice the angle is given in RADIANS, not degrees — this changes the method: when using radians, arc length = radius × angle, directly, without needing a fraction of 360° at all. Step 2: Apply directly: arc length = 9 × (2π/3). Step 3: Simplify: 9 × (2π/3) = 18π/3 = 6π.",
          answer: "6π — when the central angle is already in radians, arc length is simply radius times angle (rθ) directly; converting to the degrees/360° method first would be an unnecessary extra step here.",
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
          prompt: "The circle (x-2)² + (y-3)² = 25 passes through a point where x=2. What are the possible value(s) of y at this point?",
          walkthrough:
            "Step 1: Substitute x=2 into the equation: (2-2)² + (y-3)² = 25, which simplifies to (y-3)² = 25. Step 2: Take the square root of both sides, remembering both the positive AND negative root: y-3 = ±5. Step 3: Solve both cases: y = 3+5 = 8, or y = 3-5 = -2.",
          answer: "y=8 or y=-2 — since x=2 is the circle's center x-coordinate, this vertical line passes through both the top and bottom of the circle, giving two valid y-values.",
          diagram: { kind: "circleCoordinate", h: 2, k: 3, r: 5, verticalLineAtX: 2, markPoints: true },
          difficulty: "easy",
        },
        {
          prompt: "The circle x² + y² = 100 passes through a point where x=6. What are the possible value(s) of y?",
          walkthrough:
            "Step 1: Substitute x=6: 36 + y² = 100. Step 2: Isolate y²: y² = 64. Step 3: Take the square root of both sides: y = ±8.",
          answer: "y=8 or y=-8, found by substituting and applying the ± square root.",
          diagram: { kind: "circleCoordinate", h: 0, k: 0, r: 10, verticalLineAtX: 6, markPoints: true },
          difficulty: "easy",
        },
        {
          prompt: "The circle (x+1)² + (y-4)² = 40 passes through a point where x=5. What are the possible value(s) of y?",
          walkthrough:
            "Step 1: Substitute x=5: (5+1)² + (y-4)² = 40, which simplifies to 36 + (y-4)² = 40. Step 2: Isolate the squared term by subtracting 36 from both sides: (y-4)² = 4. Step 3: Take the square root of both sides: y-4 = ±2, giving y = 6 or y = 2.",
          answer: "y=6 or y=2, found by substituting the known x-value, isolating the squared y-term, and applying the ± square root.",
          diagram: { kind: "circleCoordinate", h: -1, k: 4, r: 6, verticalLineAtX: 5, markPoints: true },
          difficulty: "medium",
        },
        {
          prompt: "The circle (x-3)² + (y+2)² = 16 passes through a point where x=7. What is the value of y at this point?",
          walkthrough:
            "Step 1: Substitute x=7: (7-3)² + (y+2)² = 16, which simplifies to 16 + (y+2)² = 16. Step 2: Isolate the squared term: (y+2)² = 0. Step 3: Unlike the earlier examples, this produces only ONE solution: y+2 = 0, so y = -2 — because x=7 happens to be the circle's most extreme point in that direction (center x=3 plus radius 4), where the circle only touches that vertical line once.",
          answer: "y=-2, and only one value this time — x=7 is the circle's rightmost point, so the vertical line at x=7 touches the circle at only a single point instead of passing through two.",
          diagram: { kind: "circleCoordinate", h: 3, k: -2, r: 4, verticalLineAtX: 7, singlePoint: true },
          difficulty: "medium",
        },
        {
          prompt: "The circle (x-2)² + (y-5)² = 9 is claimed to pass through a point where x=8. Is this possible, and why or why not?",
          walkthrough:
            "Step 1: Substitute x=8: (8-2)² + (y-5)² = 9, which simplifies to 36 + (y-5)² = 9. Step 2: Isolate the squared term: (y-5)² = 9 - 36 = -27. Step 3: Since a squared real number can never be negative, there's no real value of y that satisfies this — the circle does NOT actually pass through any point where x=8.",
          answer: "This is not possible — substituting x=8 leads to (y-5)² = -27, and since a square can never be negative, no real y-value works; x=8 is outside the circle's reach entirely, given its center's x-coordinate of 2 and radius of just 3.",
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
          prompt: "A central angle in a circle measures 70°. What is the measure of the arc it intercepts?",
          walkthrough: "Step 1: Recall that a central angle's measure always equals its intercepted arc's measure in degrees. Step 2: The arc also measures 70°.",
          answer: "70° — a central angle and the arc it cuts off always share the same degree measure.",
          diagram: { kind: "circleBasic", centralAngleLabel: "70°", arcLabel: "?" },
          difficulty: "easy",
        },
        {
          prompt: "A circle has a radius of 6. What is its area, in terms of π?",
          walkthrough: "Step 1: Apply the area formula: A = πr². Step 2: Substitute r = 6: A = π(6)² = 36π.",
          answer: "36π, found by substituting the radius directly into A = πr².",
          diagram: { kind: "circleBasic", radiusLabel: "6" },
          difficulty: "easy",
        },
        {
          prompt:
            "Line segment PQ is tangent to a circle at point Q, where O is the circle's center. If OQ = 5 and OP = 13, what is the length of PQ?",
          walkthrough:
            "Step 1: Since PQ is tangent to the circle at Q, the radius OQ is perpendicular to PQ at that point, making triangle OQP a right triangle with the right angle at Q. Step 2: OP is the hypotenuse (it doesn't touch the circle at a right angle the way OQ and PQ do), so apply the Pythagorean theorem: OQ² + PQ² = OP². Step 3: Substitute known values: 5² + PQ² = 13², so 25 + PQ² = 169, giving PQ² = 144 and PQ = 12.",
          answer:
            "12 — the tangent-radius perpendicularity fact turns this into a standard Pythagorean theorem problem, with OP (not touching the circle) as the hypotenuse.",
          diagram: { kind: "circleBasic", tangent: { radius: "5", tangentSeg: "?", hyp: "13" } },
          difficulty: "medium",
        },
        {
          prompt:
            "Points A and B lie on a circle centered at O, with OA = OB = 9. If the angle AOB measures 60°, what is the length of chord AB?",
          walkthrough:
            "Step 1: Since OA and OB are both radii of the same circle, they're equal, making triangle AOB isosceles with a 60° angle between the two equal sides. Step 2: An isosceles triangle with a 60° angle between its two equal sides is actually equilateral — its other two angles must also be 60° each, since the triangle's two base angles are equal (isosceles) and all three angles sum to 180°, forcing each to be 60°. Step 3: Since the triangle is equilateral, all three sides are equal, so AB = OA = OB = 9.",
          answer:
            "9 — recognizing that two equal radii with a 60° angle between them force an equilateral triangle is the key insight, avoiding any trig or law of cosines calculation.",
          diagram: { kind: "circleBasic", chordTriangle: { radius: "9", angle: "60°", chord: "?" } },
          difficulty: "hard",
        },
        {
          prompt:
            "A circle has a circumference of 24π. A central angle intercepts an arc with a length of 4π. What is the measure of the central angle, in degrees?",
          walkthrough:
            "Step 1: An arc's length is the same fraction of the full circumference as its central angle is of 360°. Step 2: Find that fraction: arc length / circumference = 4π / 24π = 1/6. Step 3: Apply that same fraction to 360°: (1/6) × 360° = 60°.",
          answer:
            "60° — the arc-length-to-circumference ratio equals the angle-to-360° ratio, so finding one fraction gives you the other directly.",
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
