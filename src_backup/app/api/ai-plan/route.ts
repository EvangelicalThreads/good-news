// src/app/api/ai-plan/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validate as isUUID, v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface AiTask {
  id: string;
  day_number: number;
  task_text: string;
}

// -----------------------
// Fallback tasks if AI fails
// -----------------------
function fallbackTasks(): AiTask[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: uuidv4(),
    day_number: i + 1,
    task_text: "Reflect and pray today.",
  }));
}

// -----------------------
// Strong content filter
// Blocks anything harmful, sinful, or not honoring God
// -----------------------
function isSafeGoal(goal: string) {
  if (!goal) return false;
  let text = goal.toLowerCase().replace(/\s+/g, " ").trim();
  text = text.normalize("NFKC"); // normalize Unicode

  const blockedKeywords = [
  // 1. Substance abuse
  "self-harm", "suicide", "cutting", "burning", "overdose", "hang", "choke", 
  "smoke", "smoking", "cigarette", "vape", "vaping", "nicotine", "tobacco",
  "alcohol", "drink", "beer", "wine", "liquor", "vodka", "whiskey", "rum", "cocktail",
  "drugs", "cocaine", "heroin", "meth", "methamphetamine", "ecstasy", "lsd", 
  "marijuana", "weed", "pot", "opioid", "painkiller", "pill", "inject", "snort",
  "hash", "shrooms", "psychedelic", "opiate", "tranquilizer", "adderall", "cannabis",

  // 2. Violence & crime
  "kill", "murder", "assault", "abuse", "rape", "sexual assault", "fight", 
  "weapon", "gun", "knife", "bomb", "terrorism", "hate", "bully", "harass", 
  "kidnap", "threat", "arson", "vandalize", "rob", "steal", "theft", "fraud", 
  "cheat", "corrupt", "smuggle", "extort", "bribe", "riot", "terror", "shoot", 
  "stab", "torture", "poison", "lynch", "hang", "maim", "behead", "explosive", 
  "violence", "abduction", "gang", "mob", "hitman", "assassin",

  // 3. Sexual immorality
  "sex", "porn", "nsfw", "adult", "nude", "fetish", "masturbate", "mastubation",
  "prostitute", "hookup", "infidelity", "adultery", "affair", "lust", "erotic", 
  "incest", "pedophile", "obscene", "sex act", "sexual harassment", "sexual content", 
  "rape", "molest", "pornography", "orgy", "erotica", "sexual desire", "pornhub", 
  "xvideos", "adult film", "strip club", "escort", "naked", "explicit","seggs",

  // 4. Lies, deception, and blasphemy
  "lie", "cheat", "deceive", "false", "curse", "blasphemy", "idolatry", 
  "witchcraft", "occult", "satan", "demon", "cult", "magic", "fortune telling", 
  "tarot", "divination", "seance", "necromancy", "black magic", "voodoo", 
  "spiritism", "summon demon", "evil spirits", "heretical", "apostasy", "heresy", 
  "false prophet", "demonic", "possession", "black arts", "occultism",

  // 5. Gambling, greed, and materialism
  "gamble", "bet", "casino", "lottery", "greed", "envy", "covet", "hoard", 
  "vanity", "pride", "ego", "selfish", "scam", "extortion", "money worship", 
  "idolize wealth", "corruption", "bribery", "materialism", "luxury obsession",

  // 6. Physical harm and unhealthy habits
  "overeating", "binge", "fasting gone wrong", "anorexia", "bulimia", 
  "self-neglect", "reckless driving", "speeding", "reckless stunt", "starve", 
  "overexercise", "unsafe sex", "drugging", "poison", "gore", "graphic content", 
  "blood", "torture", "maim", "suicidal thoughts", "self-mutilation", "burning", 
  "hang", "choke",

  // 7. Spiritually harmful or dark things
  "occult", "sorcery", "divination", "astrology", "horoscope", "demonology", 
  "witch", "summon demon", "curses", "evil spirits", "necromancy", "spiritism", 
  "satanism", "devil worship", "ritual sacrifice", "black magic", "voodoo", 
  "summoning", "hell worship", "false gods", "idols", "idol worship", "demonic", 
  "curse words", "blasphemous", "witchcraft spells", "sorcery rituals",

  // 8. Morally wrong, sinful, or socially harmful
  "envy", "jealousy", "bitterness", "grudge", "resentment", "anger", "malice", 
  "sloth", "laziness", "gluttony", "fornication", "lust", "idleness", "rebellion", 
  "disobedience", "profanity", "swear", "obscenity", "vulgarity", "hate speech", 
  "gossip", "backstab", "cheating", "manipulate", "exploit", "dishonor", 
  "disrespect", "unforgiveness", "prideful", "self-centered", "egoistic", 
  "boast", "arrogance", "mock", "ridicule", "humiliate", "condemn", "judgmental",

  // 9. Illegal or cybercrime
  "hack", "hacking", "illegal", "piracy", "virus", "malware", "phishing", 
  "theft", "trespass", "bribe", "smuggle", "extortion", "terror", "cybercrime", 
  "identity theft", "scam", "spyware", "spy", "unauthorized access", "dark web", 
  "ransomware", "credit card fraud", "money laundering",

  // 10. Harm to animals or nature
  "animal abuse", "poaching", "kill animal", "torture animal", "pollute", "litter", 
  "destroy nature", "deforestation", "illegal hunting", "endanger species", 
  "cruelty", "animal cruelty", "abandon animal", "neglect animal", "kill wildlife",

  // 11. Anything inappropriate for minors
  "drug use", "sex act", "nudity", "explicit", "adult content", "violent content", 
  "graphic content", "gore", "blood", "torture", "obscene content", "harassment", 
  "bullying", "threat", "self-harm content", "suicide content", "alcohol promotion",
  "gambling promotion", "crime promotion", "violence promotion",

  // 12. Misc sinful/immoral tendencies
  "lying", "cheating", "manipulation", "corruption", "envy", "coveting", "greed", 
  "idolatry", "occultism", "witchcraft", "divination", "sorcery", "demonic influence", 
  "dark arts", "slander", "backbiting", "mockery", "blaspheme", "heresy", 
  "apostasy", "ungodly desire", "sexual immorality", "adultery", "fornication", 
  "pornography", "lust", "depravity", "corrupt thoughts", "vanity", "pride", 
  "selfishness", "materialism", "envy", "jealousy", "malice", "bitterness"
];

   for (const word of blockedKeywords) {
    const regex = new RegExp(`\\b${word.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')}\\b`, "i");
    if (regex.test(text)) return false;
  }

  const badPattern = /(smoke|drink|drug|porn|gamble|kill|murder).*/i;
  if (badPattern.test(goal)) return false;

    // Catch symbol/spacing variations
  const variationsPattern = /(s\W*m\W*o\W*k\W*e|d\W*r\W*u\W*g|p\W*o\W*r\W*n|k\W*i\W*l\W*l)/i;
  if (variationsPattern.test(text)) return false;

  return true;
}

// -----------------------
// GET: Fetch last saved plan
// -----------------------
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId || !isUUID(userId)) return NextResponse.json(null);

    const lastPlan = await prisma.aiPlan.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      include: { tasks: true },
    });

    if (!lastPlan) return NextResponse.json(null);

    return NextResponse.json({
      savedPlanId: lastPlan.id,
      tasks: lastPlan.tasks.map((t) => ({
        id: t.id,
        day_number: t.day_number,
        task_text: t.task_text,
      })),
    });
  } catch (err) {
    console.error("GET /api/ai-plan error:", err);
    return NextResponse.json(null);
  }
}

// -----------------------
// POST: Generate new AI plan
// -----------------------
export async function POST(req: Request) {
  try {
    const { goal } = await req.json();

    if (!goal)
      return NextResponse.json({ error: "Missing goal" }, { status: 400 });

    // -----------------------
    // Block unsafe goals immediately
    // -----------------------
    if (!isSafeGoal(goal)) {
      return NextResponse.json({ error: "This goal is not allowed." }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId || !isUUID(userId))
      return NextResponse.json({ error: "Invalid or missing user ID" }, { status: 400 });

    // -----------------------
    // AI prompt: return 30 tasks as JSON
    // -----------------------
    const prompt = `
Generate a 30-day devotional plan for the goal: "${goal}".
Return as a JSON array:
[
  { "day_number": 1, "task_text": "Task description for day 1" },
  ...
  { "day_number": 30, "task_text": "Task description for day 30" }
]
Ensure exactly 30 tasks, each unique, no extra text outside JSON.
`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await aiResponse.json();
    const aiPlanText = data?.choices?.[0]?.message?.content || "[]";

    // -----------------------
    // Parse AI JSON, fallback to default tasks
    // -----------------------
    let taskData: AiTask[];
    try {
      const parsed = JSON.parse(aiPlanText);
      taskData = parsed.map((t: any) => ({
        id: uuidv4(),
        day_number: t.day_number,
        task_text: t.task_text,
      }));

      // Ensure exactly 30 tasks
      if (taskData.length < 30) {
        const missing = 30 - taskData.length;
        for (let i = 0; i < missing; i++) {
          taskData.push({
            id: uuidv4(),
            day_number: taskData.length + 1,
            task_text: "Reflect and pray today.",
          });
        }
      } else if (taskData.length > 30) {
        taskData = taskData.slice(0, 30);
      }
    } catch (err) {
      console.error("AI JSON parse failed, using fallback tasks", err);
      taskData = fallbackTasks();
    }

    // -----------------------
    // Save AI plan + tasks
    // -----------------------
    const savedPlan = await prisma.aiPlan.create({
      data: {
        user_id: userId,
        title: goal.slice(0, 50) || "My AI Plan",
        description: aiPlanText,
        tasks: {
          create: taskData.map((t) => ({
            id: t.id,
            day_number: t.day_number,
            task_text: t.task_text,
          })),
        },
      },
      include: { tasks: true },
    });

    return NextResponse.json({
      plan: aiPlanText,
      savedPlanId: savedPlan.id,
      tasks: savedPlan.tasks,
    });
  } catch (error: any) {
    console.error("Error generating AI plan:", error);
    return NextResponse.json({ error: "Failed to generate AI plan" }, { status: 500 });
  }
}
