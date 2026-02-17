import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * GET /api/test-email?to=your@email.com
 * Test email sending functionality with direct Resend call (DEVELOPMENT ONLY)
 */
export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const log = (message: string) => {
    logs.push(message);
    console.log(message);
  };

  try {
    const searchParams = request.nextUrl.searchParams;
    const toEmail = searchParams.get('to');

    log('\n🧪 ========== TEST EMAIL DIAGNOSTIC ==========');
    log(`Timestamp: ${new Date().toISOString()}`);
    log(`Target email: ${toEmail || 'NOT PROVIDED'}`);

    if (!toEmail) {
      return NextResponse.json(
        {
          error: 'Please provide "to" query parameter with email address',
          logs
        },
        { status: 400 }
      );
    }

    // Environment diagnostics
    log('\n📋 Environment Check:');
    log(`- NODE_ENV: ${process.env.NODE_ENV}`);
    log(`- RESEND_API_KEY present: ${!!process.env.RESEND_API_KEY}`);
    log(`- RESEND_API_KEY length: ${process.env.RESEND_API_KEY?.length || 0}`);
    log(`- RESEND_API_KEY starts with: ${process.env.RESEND_API_KEY?.substring(0, 6)}...`);
    log(`- RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL}`);

    if (!process.env.RESEND_API_KEY) {
      log('\n❌ ERROR: No API key found!');
      return NextResponse.json(
        {
          error: 'RESEND_API_KEY is not set',
          logs,
        },
        { status: 500 }
      );
    }

    // Initialize Resend with explicit API key
    log('\n🔧 Initializing Resend client...');
    const resend = new Resend(process.env.RESEND_API_KEY);
    log('✅ Resend client created');

    // Prepare email
    const emailData = {
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: toEmail,
      subject: `Test Email - ${new Date().toLocaleTimeString()}`,
      text: 'This is a test email to verify your email configuration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🧪 Test Email from Dumbbellflow</h2>
          <p>This is a test email sent at <strong>${new Date().toLocaleString()}</strong></p>
          <p>If you received this, your Resend integration is working! 🎉</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">
            Sent from Dumbbellflow Email Test Endpoint<br />
            To: ${toEmail}<br />
            From: ${process.env.RESEND_FROM_EMAIL}
          </p>
        </div>
      `,
    };

    log('\n📧 Email Details:');
    log(`- From: ${emailData.from}`);
    log(`- To: ${emailData.to}`);
    log(`- Subject: ${emailData.subject}`);

    // Send email
    log('\n📤 Sending email via Resend API...');
    const result = await resend.emails.send(emailData);

    log('\n✅ Resend API Response:');
    log(JSON.stringify(result, null, 2));

    if (result.error) {
      log('\n❌ ERROR from Resend API:');
      log(JSON.stringify(result.error, null, 2));

      return NextResponse.json(
        {
          success: false,
          error: 'Resend API returned an error',
          resendError: result.error,
          logs,
        },
        { status: 500 }
      );
    }

    log('\n🎉 SUCCESS! Email queued for delivery');
    log('=========================================\n');

    return NextResponse.json(
      {
        success: true,
        message: 'Email sent successfully!',
        emailId: result.data?.id,
        details: {
          to: toEmail,
          from: emailData.from,
          subject: emailData.subject,
          timestamp: new Date().toISOString(),
        },
        resendResponse: result,
        logs,
      },
      { status: 200 }
    );
  } catch (error) {
    log('\n❌ EXCEPTION THROWN:');
    log(`Error type: ${error?.constructor?.name}`);
    log(`Error message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    if (error instanceof Error && error.stack) {
      log(`Stack trace: ${error.stack}`);
    }
    log('=========================================\n');

    return NextResponse.json(
      {
        success: false,
        error: 'Exception occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
        logs,
      },
      { status: 500 }
    );
  }
}
