import { NextRequest } from 'next/server';
import { groqClient } from '@/lib/ai/groq-client';

export const runtime = 'nodejs';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response('Invalid request', { status: 400 });
        }

        // Add system prompt for DocShield assistant
        const systemMessage: ChatMessage = {
            role: 'system',
            content: `You are DocShield Assistant, a helpful AI chatbot for the DocShield quantum-safe document verification platform. 

Your role:
- Help users understand document verification processes
- Explain cybersecurity and quantum cryptography concepts
- Guide users through the platform features
- Answer questions about document security
- Be friendly, concise, and professional

Platform features:
- Quantum-resistant digital signatures (RSA-2048, migrating to Dilithium3)
- AI-powered document authenticity analysis with Groq & Llama 3.3
- Support for certificates, IDs, contracts, and other documents
- Real-time verification with blockchain-style certificate chains
- Educational modules on cybersecurity

Keep responses helpful and under 200 words unless asked for detailed explanations.`,
        };

        const allMessages = [systemMessage, ...messages];

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of groqClient.chatStream(allMessages, {
                        temperature: 0.7,
                        max_tokens: 500,
                    })) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to process chat request'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
