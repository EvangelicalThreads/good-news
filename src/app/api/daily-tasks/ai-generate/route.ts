// src/app/api/daily-tasks/ai-generate/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

    // Call AI service to generate task
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'user',
            content: `Generate a concise recurring daily task for: "${prompt}". Return JSON { "title": "...", "description": "..." }`,
          },
        ],
      }),
    });

    const data = await aiResponse.json();
    let aiTask;
    try {
      aiTask = JSON.parse(data?.choices?.[0]?.message?.content ?? '{}');
    } catch {
      aiTask = { title: prompt, description: prompt };
    }

    // Save as recurring AI daily task
    const task = await prisma.dailyTask.create({
      data: {
        user_id: userId,
        title: aiTask.title ?? prompt,
        description: aiTask.description ?? '',
        is_recurring: true,
        ai_generated: true,
      },
    });

    return NextResponse.json({ task });
  } catch (err) {
    console.error('Error generating AI daily task:', err);
    return NextResponse.json({ error: 'Failed to generate AI daily task' }, { status: 500 });
  }
}
