import Groq from 'groq-sdk';

export interface AIConfig {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface GenerateOptions {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

class GroqClient {
    private client: Groq;
    private model: string;
    private defaultTemperature: number;

    constructor(config?: Partial<AIConfig>) {
        const apiKey = config?.apiKey || process.env.GROQ_API_KEY;

        if (!apiKey) {
            throw new Error('GROQ_API_KEY is required. Get your free API key at https://console.groq.com');
        }

        this.client = new Groq({ apiKey });
        this.model = config?.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
        this.defaultTemperature = config?.temperature || parseFloat(process.env.GROQ_TEMPERATURE || '0.7');
    }

    /**
     * Check if Groq service is accessible
     */
    async healthCheck(): Promise<boolean> {
        try {
            // Try a minimal request to check connectivity
            await this.client.chat.completions.create({
                messages: [{ role: 'user', content: 'test' }],
                model: this.model,
                max_tokens: 5,
            });
            return true;
        } catch (error) {
            console.error('❌ Groq health check failed:', error);
            return false;
        }
    }

    /**
     * Generate a completion from a prompt
     */
    async generate(prompt: string, options?: GenerateOptions): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.model,
                temperature: options?.temperature || this.defaultTemperature,
                max_tokens: options?.max_tokens || 1024,
                stream: false,
            });

            return response.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('❌ Groq generate error:', error);
            throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Chat with conversation history
     */
    async chat(messages: ChatMessage[], options?: GenerateOptions): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                messages: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                model: this.model,
                temperature: options?.temperature || this.defaultTemperature,
                max_tokens: options?.max_tokens || 1024,
                stream: false,
            });

            return response.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('❌ Groq chat error:', error);
            throw new Error(`Failed to chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Stream chat responses (for real-time chatbot)
     */
    async *chatStream(messages: ChatMessage[], options?: GenerateOptions): AsyncGenerator<string> {
        try {
            const stream = await this.client.chat.completions.create({
                messages: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                model: this.model,
                temperature: options?.temperature || this.defaultTemperature,
                max_tokens: options?.max_tokens || 1024,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        } catch (error) {
            console.error('❌ Groq stream error:', error);
            throw new Error(`Failed to stream chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get available models
     */
    async listModels(): Promise<any> {
        try {
            return await this.client.models.list();
        } catch (error) {
            console.error('❌ Failed to list models:', error);
            return null;
        }
    }
}

// Export singleton instance
export const groqClient = new GroqClient();

// Export class for custom instances
export default GroqClient;
