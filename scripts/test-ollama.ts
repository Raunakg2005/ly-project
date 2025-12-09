#!/usr/bin/env ts-node

/**
 * Test Ollama Connection
 * 
 * Run with: npm run test:ollama
 */

import { ollamaClient } from '../lib/ai/ollama-client.js';

async function testOllama() {
    try {
        console.log('🧪 Testing Ollama connection...\n');

        // Health check
        console.log('🔍 Checking Ollama service...');
        const isHealthy = await ollamaClient.healthCheck();

        if (!isHealthy) {
            console.log('❌ Ollama service is not available');
            console.log('\n💡 Make sure:');
            console.log('   1. Ollama is installed: https://ollama.com/download');
            console.log('   2. Llama 3.3 model is pulled: ollama pull llama3.3:70b');
            console.log('   3. Ollama service is running: ollama serve');
            process.exit(1);
        }

        console.log('✅ Ollama service is running\n');

        // Get model info
        console.log('📊 Getting model information...');
        const modelInfo = await ollamaClient.getModelInfo();
        if (modelInfo) {
            console.log(`   Model: ${modelInfo.modelfile || 'llama3.3:70b'}`);
        }

        // Test simple generation
        console.log('\n💬 Testing simple generation...');
        const response = await ollamaClient.generate('Say hello in one word', {
            temperature: 0.1,
            max_tokens: 10,
        });
        console.log(`   Response: "${response.trim()}"`);

        console.log('\n✅ All Ollama tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Ollama test failed:', error);
        process.exit(1);
    }
}

testOllama();
