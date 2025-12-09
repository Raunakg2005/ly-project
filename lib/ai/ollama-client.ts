import { Ollama } from 'ollama';

export interface OllamaConfig {
    baseUrl: string;
    model: string;
    timeout: number;
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

class OllamaClient {
    private client: Ollama;
    private model: string;
    private defaultTemperature: number;

    constructor(config?: Partial<OllamaConfig>) {
        const baseUrl = config?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = config?.model || process.env.OLLAMA_MODEL || 'llama3.3:70b';
        this.defaultTemperature = config?.temperature || parseFloat(process.env.OLLAMA_TEMPERATURE || '0.7');

        this.client = new Ollama({ host: baseUrl });
    }

    /**
     * Check if Ollama service is running and model is available
     */
    async healthCheck(): Promise<boolean> {
        try {
            const models = await this.client.list();
            const modelExists = models.models.some((m) => m.name === this.model);

            if (!modelExists) {
                console.warn(`⚠️  Model ${this.model} not found. Available models:`, models.models.map(m => m.name));
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Ollama health check failed:', error);
            return false;
        }
    }

    /**
     * Generate a completion from a prompt
     */
    async generate(prompt: string, options?: GenerateOptions): Promise<string> {
        try {
            const response = await this.client.generate({
                model: this.model,
                prompt,
                options: {
                    temperature: options?.temperature || this.defaultTemperature,
                    num_predict: options?.max_tokens,
                },
                stream: false,
            });

            return response.response;
        } catch (error) {
            console.error('❌ Ollama generate error:', error);
            throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Chat with conversation history
     */
    async chat(messages: ChatMessage[], options?: GenerateOptions): Promise<string> {
        try {
            const response = await this.client.chat({
                model: this.model,
                messages: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                options: {
                    temperature: options?.temperature || this.defaultTemperature,
                    num_predict: options?.max_tokens,
                },
                stream: false,
            });

            return response.message.content;
        } catch (error) {
            console.error('❌ Ollama chat error:', error);
            throw new Error(`Failed to chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Stream chat responses (for real-time chatbot)
     */
    async *chatStream(messages: ChatMessage[], options?: GenerateOptions): AsyncGenerator<string> {
        try {
            const stream = await this.client.chat({
                model: this.model,
                messages: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                options: {
                    temperature: options?.temperature || this.defaultTemperature,
                    num_predict: options?.max_tokens,
                },
                stream: true,
            });

            for await (const chunk of stream) {
                if (chunk.message.content) {
                    yield chunk.message.content;
                }
            }
        } catch (error) {
            console.error('❌ Ollama stream error:', error);
            throw new Error(`Failed to stream chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get model information
     */
    async getModelInfo(): Promise<any> {
        try {
            return await this.client.show({ model: this.model });
        } catch (error) {
            console.error('❌ Failed to get model info:', error);
            return null;
        }
    }
}

// Export singleton instance
export const ollamaClient = new OllamaClient();

// Export class for custom instances
export default OllamaClient;
