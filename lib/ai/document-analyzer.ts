import { ollamaClient, ChatMessage } from './ollama-client';
import { z } from 'zod';

// Analysis result schema for validation
const AnalysisResultSchema = z.object({
    authenticityScore: z.number().min(0).max(100),
    riskLevel: z.enum(['low', 'medium', 'high']),
    flags: z.array(z.string()),
    contentSummary: z.string(),
    detectedAnomalies: z.array(
        z.object({
            type: z.string(),
            severity: z.enum(['low', 'medium', 'high']),
            description: z.string(),
            location: z.string().optional(),
        })
    ),
    recommendations: z.array(z.string()),
    confidence: z.number().min(0).max(100),
});

export type DocumentAnalysisResult = z.infer<typeof AnalysisResultSchema> & {
    processingTime: number;
};

export interface AnalyzeDocumentOptions {
    documentText: string;
    documentType?: 'certificate' | 'id' | 'contract' | 'other';
    metadata?: {
        fileName?: string;
        fileType?: string;
        uploadDate?: Date;
    };
}

/**
 * Specialized prompts for different document types
 */
const SYSTEM_PROMPTS = {
    certificate: `You are an expert document analyst specializing in educational and professional certificates. 
Analyze the document for authenticity by checking:
- Signature placement and quality
- Seal/stamp authenticity
- Date consistency and format
- Institutional formatting standards
- Language and grammar quality
- Security features presence`,

    id: `You are an expert document analyst specializing in identity documents.
Analyze the document for authenticity by checking:
- Photo quality and consistency
- Data field consistency (dates, numbers)
- Security features (holograms, watermarks)
- Font and formatting standards
- Document structure compliance`,

    contract: `You are an expert legal document analyst.
Analyze the contract for authenticity and completeness by checking:
- Legal language patterns
- Clause completeness and structure
- Signature blocks
- Date consistency
- Standard contract formatting
- Missing or unusual clauses`,

    other: `You are an expert document analyst.
Analyze this document for authenticity and integrity by checking:
- Overall formatting consistency
- Content coherence
- Unusual patterns or anomalies
- Signs of tampering or manipulation
- Professional quality standards`,
};

/**
 * Main document analysis function using Llama 3.3
 */
export async function analyzeDocument(
    options: AnalyzeDocumentOptions
): Promise<DocumentAnalysisResult> {
    const startTime = Date.now();

    try {
        // Check Ollama health
        const isHealthy = await ollamaClient.healthCheck();
        if (!isHealthy) {
            throw new Error('Ollama service is not available or model is not loaded');
        }

        const documentType = options.documentType || 'other';
        const systemPrompt = SYSTEM_PROMPTS[documentType];

        const analysisPrompt = `${systemPrompt}

Document Text:
"""
${options.documentText}
"""

Document Metadata:
- File Name: ${options.metadata?.fileName || 'Unknown'}
- File Type: ${options.metadata?.fileType || 'Unknown'}
- Upload Date: ${options.metadata?.uploadDate?.toISOString() || 'Unknown'}

Please analyze this document and provide a detailed assessment in JSON format with the following structure:
{
  "authenticityScore": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "flags": ["<flag1>", "<flag2>"],
  "contentSummary": "<brief summary>",
  "detectedAnomalies": [
    {
      "type": "<anomaly type>",
      "severity": "<low|medium|high>",
      "description": "<detailed description>",
      "location": "<where in document>"
    }
  ],
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  "confidence": <number 0-100>
}

Respond ONLY with valid JSON, no additional text.`;

        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: 'You are a professional document authenticity analyzer. Respond only with valid JSON.',
            },
            {
                role: 'user',
                content: analysisPrompt,
            },
        ];

        // Get AI response
        const response = await ollamaClient.chat(messages, {
            temperature: 0.3, // Lower temperature for more consistent analysis
            max_tokens: 2000,
        });

        // Parse and validate response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from AI response');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);
        const validatedResult = AnalysisResultSchema.parse(parsedResponse);

        const processingTime = Date.now() - startTime;

        return {
            ...validatedResult,
            processingTime,
        };
    } catch (error) {
        console.error('❌ Document analysis error:', error);

        // Return a safe fallback result
        return {
            authenticityScore: 0,
            riskLevel: 'high',
            flags: ['Analysis failed - manual review required'],
            contentSummary: 'Unable to analyze document due to technical error',
            detectedAnomalies: [
                {
                    type: 'system_error',
                    severity: 'high',
                    description: error instanceof Error ? error.message : 'Unknown error occurred',
                },
            ],
            recommendations: ['Manual review recommended', 'Retry analysis after checking Ollama service'],
            confidence: 0,
            processingTime: Date.now() - startTime,
        };
    }
}

/**
 * Quick authenticity check (faster, less detailed)
 */
export async function quickAuthenticityCheck(documentText: string): Promise<number> {
    try {
        const prompt = `Rate the authenticity of this document from 0-100 based on formatting, language quality, and professional appearance. Respond with ONLY a number, no explanation.

Document:
"""
${documentText.substring(0, 1000)}
"""

Authenticity Score (0-100):`;

        const response = await ollamaClient.generate(prompt, {
            temperature: 0.2,
            max_tokens: 10,
        });

        const score = parseInt(response.trim());
        return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
    } catch (error) {
        console.error('❌ Quick check error:', error);
        return 50; // Default uncertain score
    }
}
