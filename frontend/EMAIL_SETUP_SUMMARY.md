# Real Email Setup - Quick Summary

## 🎯 What You Need

To send **REAL emails** to users when you invite them, you need to configure EmailJS.

## ⚡ Quick Setup (5 Minutes)

### 1. Sign Up for EmailJS
- Go to: **https://www.emailjs.com/**
- Click "Sign Up" (free account - 200 emails/month)
- Verify your email

### 2. Get Your Credentials

**Service ID:**
- Dashboard → Email Services → Add Service (Gmail recommended)
- Copy the Service ID (e.g., `service_abc123`)

**Template ID:**
- Dashboard → Email Templates → Create New Template
- Use this template:
  - **Subject**: `You've been invited to join "{{page_name}}" on Beam`
  - **Content**: 
    ```
    Hello!
    
    {{inviter_name}} has invited you to join "{{page_name}}".
    
    Click here: {{invitation_link}}
    ```
- Copy the Template ID (e.g., `template_xyz789`)

**Public Key:**
- Dashboard → Account → General → Public Key
- Copy the Public Key

### 3. Add to .env File

Open `frontend/.env` and add:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**Replace with your actual values!**

### 4. Restart Server

```bash
cd frontend
npm run dev
```

## ✅ Test It

1. Create a page
2. Invite someone with a real email
3. **Check their inbox** - they should receive the email!

## 🎉 Done!

Now real emails will be sent automatically when you invite users!

---

## 📧 What Happens

**Before Setup:**
- Shows invitation link in alert
- Link copied to clipboard
- You manually share the link

**After Setup:**
- ✅ Real email sent automatically
- ✅ User receives email in inbox
- ✅ Email contains invitation link
- ✅ User clicks link to accept
- ✅ Everything automatic!

---

## ❓ Troubleshooting

**Email not sending?**
- Check EmailJS dashboard for errors
- Verify all 3 IDs are correct in `.env`
- Make sure you restarted the server
- Check browser console for errors

**Email in spam?**
- Normal for free services
- Check spam/junk folder
- For production, use professional email service

---

**Need help?** See `QUICK_EMAIL_SETUP.md` for detailed steps.
