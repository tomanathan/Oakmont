import type { LessonVideoScript } from "../types";

export const CENTRAL_IDEAS: LessonVideoScript[] = [
  {
    subskillId: "rw-central-ideas",
    pattern: "Whole-Passage Main Idea",
    example: 0,
    excerpt:
      "reefs with high genetic diversity consistently survived heat waves that wiped out genetically uniform reefs nearby. The team now argues that conservation policy should prioritize preserving genetic diversity, not just controlling temperature.",
    hook: "Main idea questions aren't asking what the passage mentions. They're asking what it's for.",
    idea: [
      { point: "The one sentence that explains the rest", say: "Ask yourself: if I could keep only one sentence, which one explains why all the others are there?" },
      { point: "Rarely the first sentence", say: "The main idea is almost never handed to you up top. You build it from the whole passage." },
      { point: "Wrong: too narrow or too broad", say: "Wrong answers usually grab one small detail, or go so vague they could describe a totally different passage." },
    ],
    steps: [
      {
        say: "Before this part, the team thought temperature was the big threat. Then fifteen years of data changed their minds.",
      },
      {
        say: "Genetically diverse reefs survived the heat waves. Uniform ones didn't. And the last sentence turns that into advice: protect diversity, not just temperature.",
        highlight: ["reefs with high genetic diversity consistently survived heat waves", "prioritize preserving genetic diversity"],
      },
      {
        say: "Temperature as the biggest threat? That's the belief they moved past. And how long they studied is true, but it's just a detail.",
        strike: [0, 3],
      },
      {
        say: "A wide variety of threats could describe any reef article ever written. It never mentions what this study found.",
        strike: [2],
      },
    ],
    answer: "Genetic diversity, not temperature alone. That's the finding and the point, so that's the answer.",
    trap: { point: "Trap: the opening belief, not the conclusion", say: "Passages love to open with an idea just so they can overturn it. Don't pick the idea they overturned." },
    recap: { point: "Say what the whole passage builds to", say: "Find the sentence that makes all the others make sense. Then pick the choice that says it. No bigger, no smaller." },
  },
  {
    subskillId: "rw-central-ideas",
    pattern: "Detail Comprehension in Informational Texts",
    example: 0,
    hook: "Detail questions don't want your opinion. They want you to find one sentence and say it back accurately.",
    idea: [
      { point: "Find the exact sentence", say: "However the question is worded, the move is the same. Find the sentence that answers it, then read it again." },
      { point: "Match it: don't add or flip", say: "The right choice says what that sentence says. No outside knowledge, no flipped direction, no bigger claim." },
      { point: "Watch for overstating", say: "Slowing isn't stopping. Some isn't all. If a choice makes the finding sound stronger, be suspicious." },
    ],
    steps: [
      {
        say: "The question asks what she found, not what she did. The finding is right here: thirty-four of the forty came back.",
        highlight: ["34 returned to the same nesting beach"],
      },
      {
        say: "Tagging turtles over two years is what she did. It's true, but it isn't a finding.",
        strike: [2],
      },
      {
        say: "All forty? The text says thirty-four, so that's overstating it. And six is the number that didn't come back.",
        strike: [1, 3],
      },
    ],
    answer: "Thirty-four of forty, exactly the way the text says it. Nothing added, nothing flipped.",
    trap: { point: "Trap: a real number, wrong group", say: "Six and thirty-four both describe this study. Only one answers the question. Go back and check instead of trusting memory." },
    recap: { point: "Find it, reread it, match it", say: "Find the sentence, read it again, and pick the choice that says the same thing at the same strength." },
  },
  {
    subskillId: "rw-central-ideas",
    pattern: "Reading Literary Narratives and Poetry",
    example: 1,
    excerpt:
      "My grandfather never mentioned it to anyone, not even to my grandmother that evening at dinner. When I brought it up later, all he said was, \"That's between me and the young man,\" and reached for the newspaper, as though the conversation were already over.",
    hook: "Stories and poems feel harder, but the question is the same one: what does the text actually show?",
    idea: [
      { point: "Read what's shown, not assumed", say: "Go by what the character actually does and says. Not by what a character like that would usually feel." },
      { point: "Quiet doesn't mean upset", say: "Nervous doesn't always mean unhappy. Silence doesn't always mean disapproval. Let the text tell you." },
      { point: "No invented backstory", say: "And don't add a motive or a habit the text never mentions, no matter how believable it sounds." },
    ],
    steps: [
      {
        say: "Setup: Wen's grandfather just paid for a stranger's groceries. Then he tells no one. Not even his wife.",
        highlight: ["never mentioned it to anyone", "not even to my grandmother"],
      },
      {
        say: "When Wen brings it up, he gives a short answer and picks up the paper. He's closing the subject.",
        highlight: ["That's between me and the young man", "reached for the newspaper"],
      },
      {
        say: "Wanting recognition is the opposite of telling no one. And regularly? We only see him do this once.",
        strike: [0, 1],
      },
      {
        say: "Disapproves of his grandson? He's dodging the topic, not scolding anyone. Nothing shows he's annoyed at Wen.",
        strike: [3],
      },
    ],
    answer: "He keeps his kindness private. That matches everything he actually does.",
    trap: { point: "Trap: reading silence as disapproval", say: "A short reply feels cold, so disapproval sounds right. But the text only shows him keeping something private." },
    recap: { point: "What's shown beats what's assumed", say: "Stick to what the character does and says. If the text doesn't show it, don't pick it." },
  },
  {
    subskillId: "rw-central-ideas",
    pattern: "Reasonable Conclusions Supported by the Text",
    example: 0,
    excerpt:
      "Of respondents who had used the program at least once, 91% said they would use it again. However, only 12% of all surveyed residents reported having used the program at all.",
    hook: "Conclusion questions ask for something the text never says out loud. But it has to follow from what it does say.",
    idea: [
      { point: "Connect two stated facts", say: "Take two facts the passage gives you and put them together. The conclusion lives where they meet." },
      { point: "Must follow, not just sound fine", say: "It has to follow from the text, not just sound plausible. If the text could be true and the choice false, drop it." },
      { point: "Wrong: adds, overstates, or flips cause", say: "Wrong answers add outside information, make the conclusion stronger than it is, or flip what caused what." },
    ],
    steps: [
      {
        say: "Fact one: ninety-one percent of people who tried the bike-share would use it again. They like it.",
        highlight: ["91% said they would use it again"],
      },
      {
        say: "Fact two: only twelve percent of residents have tried it at all. So most people haven't given it a shot.",
        highlight: ["only 12% of all surveyed residents reported having used the program"],
      },
      {
        say: "Most residents dislike it? We don't know what non-users think. Not trying something isn't the same as disliking it.",
        strike: [0],
      },
      {
        say: "Getting canceled, being too expensive: the text never mentions either one. Those choices are invented.",
        strike: [2, 3],
      },
    ],
    answer: "Liked by the people who tried it, but most haven't tried it yet. Both facts, nothing extra.",
    trap: { point: "Trap: plausible but unsupported", say: "Low usage makes dislike sound reasonable. But reasonable isn't enough. The text has to back it up." },
    recap: { point: "Two facts in, one conclusion out", say: "Put the stated facts together and pick the choice that follows from them. Nothing added, nothing stretched." },
  },
];
