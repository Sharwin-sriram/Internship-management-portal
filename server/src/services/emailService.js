import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "../utils/logger.js";

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  FRONTEND_URL,
} = env;

class EmailService {
  constructor() {
    // Configure SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email, token, userName) {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4CAF50; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .warning { color: #d32f2f; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || "User"},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4CAF50;">${resetUrl}</p>
              <p class="warning">⚠️ This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Internship Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${userName || "User"},
        
        We received a request to reset your password. Click the link below to create a new password:
        
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(
        `Failed to send password reset email to ${email}: ${error.message}`,
      );
      throw new Error("Failed to send password reset email");
    }
  }

  async sendPasswordResetConfirmation(email, userName) {
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: "Password Successfully Reset",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || "User"},</p>
              <p>Your password has been successfully reset.</p>
              <p>If you did not make this change, please contact our support team immediately.</p>
              <p>For security reasons, we recommend:</p>
              <ul>
                <li>Using a strong, unique password</li>
                <li>Enabling two-factor authentication if available</li>
                <li>Not sharing your password with anyone</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Internship Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Successful
        
        Hello ${userName || "User"},
        
        Your password has been successfully reset.
        
        If you did not make this change, please contact our support team immediately.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(
        `Password reset confirmation sent to ${email}: ${info.messageId}`,
      );
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(
        `Failed to send confirmation email to ${email}: ${error.message}`,
      );
      // Don't throw error for confirmation emails
      return { success: false };
    }
  }

  async sendInterviewInvitation({
    to,
    studentName,
    companyName,
    interview,
    meetingLink,
    instructions,
  }) {
    if (!to) {
      logger.warn("Interview invitation email skipped: no recipient");
      return { success: false };
    }

    const when = new Date(interview.scheduled_at).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: `Interview Invitation — ${companyName || "Company"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2297FA;">Interview Invitation</h2>
          <p>Hello ${studentName || "Candidate"},</p>
          <p><strong>${companyName}</strong> has scheduled a <strong>${interview.interview_type}</strong> interview (Round ${interview.round_number}).</p>
          <ul>
            <li><strong>When:</strong> ${when}</li>
            <li><strong>Type:</strong> ${interview.interview_type}</li>
            ${meetingLink ? `<li><strong>Meeting link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>` : ""}
          </ul>
          ${instructions ? `<p><strong>Instructions:</strong><br/>${instructions}</p>` : ""}
          <p><a href="${FRONTEND_URL}/dashboard/student/interviews" style="display:inline-block;padding:12px 20px;background:#2297FA;color:#fff;text-decoration:none;border-radius:8px;">View invitation</a></p>
        </div>
      `,
      text: `Interview invitation from ${companyName}. When: ${when}. Type: ${interview.interview_type}. ${meetingLink ? `Link: ${meetingLink}` : ""}`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Interview invitation email sent to ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Interview invitation email failed: ${error.message}`);
      return { success: false };
    }
  }

  async sendInterviewResponseNotice({
    to,
    companyName,
    action,
    interview,
    reason,
  }) {
    if (!to) return { success: false };

    const labels = {
      accept: "accepted",
      decline: "declined",
      reschedule: "requested a reschedule for",
    };

    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: `Interview update — candidate ${labels[action] || action}`,
      html: `
        <p>The candidate has <strong>${labels[action]}</strong> the Round ${interview.round_number} interview.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p><a href="${FRONTEND_URL}/dashboard/company/calendar">Open calendar</a></p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      logger.error(`Interview response email failed: ${error.message}`);
      return { success: false };
    }
  }

  async sendInterviewReminder({ to, name, interview, hoursBefore }) {
    if (!to) return { success: false };

    const when = new Date(interview.scheduled_at).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: `Reminder: Interview in ${hoursBefore} hour(s)`,
      html: `
        <p>Hello ${name || "there"},</p>
        <p>This is a reminder that you have an interview in <strong>${hoursBefore} hour(s)</strong>.</p>
        <p><strong>When:</strong> ${when}</p>
        <p><strong>Type:</strong> ${interview.interview_type}</p>
        ${interview.meeting_link ? `<p><a href="${interview.meeting_link}">Join meeting</a></p>` : ""}
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      logger.error(`Interview reminder email failed: ${error.message}`);
      return { success: false };
    }
  }

  /**
   * Student email verification (prove ownership of address on file).
   */
  async sendStudentEmailVerification({ to, name, verificationUrl }) {
    if (!to || !verificationUrl) {
      return { success: false, message: "Missing recipient or link." };
    }

    if (!EMAIL_USER || !EMAIL_PASS) {
      logger.warn(
        "Email credentials not configured. Cannot send verification email.",
      );
      return {
        success: false,
        message: "Email is not configured on this server.",
      };
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: "Verify your student email — InternHub",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2297fa 0%, #6b6bd4 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 24px; background-color: #f9f9f9; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2297fa;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
            }
            .muted { font-size: 14px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 22px;">Verify your email</h1>
            </div>
            <div class="content">
              <p>Hello ${name || "there"},</p>
              <p>Confirm that this email belongs to you to complete <strong>student verification</strong> on InternHub.</p>
              <p style="text-align: center; margin: 28px 0;">
                <a class="button" href="${verificationUrl}">Verify my email</a>
              </p>
              <p class="muted">This link expires in 24 hours. If you did not request this, you can ignore this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Verify your student email on InternHub:\n${verificationUrl}\n\nLink expires in 24 hours.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Student verification email sent to ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Student verification email failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async sendOfferLetter(to, payload) {
    if (!to) {
      logger.warn("Offer letter email skipped: no recipient");
      return { success: false };
    }

    const name = payload?.name || "Candidate";
    const company =
      payload?.offerDetails?.company || payload?.companyName || "Company";
    const position =
      payload?.offerDetails?.position || payload?.position || "Intern";
    const salary = payload?.offerDetails?.salary;
    const expiryDate = payload?.expiryDate
      ? new Date(payload.expiryDate).toLocaleDateString("en-IN")
      : null;
    const offerLetterUrl = payload?.offerLetterUrl;

    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: `Offer Letter - ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
          <h2 style="color: #2297FA;">Congratulations, ${name}!</h2>
          <p>We are pleased to share your internship offer letter.</p>
          <ul>
            <li><strong>Company:</strong> ${company}</li>
            <li><strong>Position:</strong> ${position}</li>
            ${salary ? `<li><strong>Stipend:</strong> ₹${salary} per month</li>` : ""}
            ${expiryDate ? `<li><strong>Offer valid till:</strong> ${expiryDate}</li>` : ""}
          </ul>
          ${
            offerLetterUrl
              ? `<p><a href="${offerLetterUrl}" style="display:inline-block;padding:10px 16px;background:#2297FA;color:#fff;text-decoration:none;border-radius:8px;">View Offer Letter</a></p>`
              : ""
          }
          <p>Please review and respond within the validity period.</p>
        </div>
      `,
      text: `Congratulations ${name}! You have received an internship offer from ${company} for ${position}.${salary ? ` Stipend: INR ${salary} per month.` : ""}${expiryDate ? ` Offer valid till ${expiryDate}.` : ""}${offerLetterUrl ? ` View letter: ${offerLetterUrl}` : ""}`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Offer letter email sent to ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Offer letter email failed: ${error.message}`);
      throw new Error("Failed to send offer letter email");
    }
  }

  async verifyConnection() {
    try {
      // Skip verification if email credentials are not configured
      if (!EMAIL_USER || !EMAIL_PASS) {
        logger.warn(
          "Email credentials not configured. Email service disabled.",
        );
        return false;
      }

      await this.transporter.verify();
      logger.info("Email service connection verified");
      return true;
    } catch (error) {
      logger.error(`Email service connection failed: ${error.message}`);
      return false;
    }
  }
}

export default new EmailService();
