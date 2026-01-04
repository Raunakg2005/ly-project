import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface EmailRequest {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { to, subject, html, from }: EmailRequest = await request.json();

        // Validate required fields
        if (!to || !subject || !html) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, html' },
                { status: 400 }
            );
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Send email
        const info = await transporter.sendMail({
            from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
        });

        console.log('Email sent:', info.messageId);

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
