# Production Email Setup Guide for Vaxify

This guide explains how to configure the email system for production environments using secure Environment Variables.

## 1. How Configuration Works

The application is configured to look for the following Environment Variables. If they are not found, it defaults to `localhost:1025` (MailHog) for development safety.

| Environment Variable | Description      | Example (AWS SES)                    | Example (Brevo)        |
| -------------------- | ---------------- | ------------------------------------ | ---------------------- |
| `MAIL_HOST`          | SMTP Server Host | `email-smtp.us-east-1.amazonaws.com` | `smtp-relay.brevo.com` |
| `MAIL_PORT`          | SMTP Server Port | `587`                                | `587`                  |
| `MAIL_USERNAME`      | SMTP Username    | `AKIA...` (Not your IAM Ref)         | `user@example.com`     |
| `MAIL_PASSWORD`      | SMTP Password    | `BAs...` (Not your IAM Secret)       | `xsmtp-...`            |
| `MAIL_AUTH`          | Enable Auth      | `true`                               | `true`                 |
| `MAIL_TLS`           | Enable TLS       | `true`                               | `true`                 |

---

## 2. Setting Up an Email Provider

### Option A: AWS SES (Recommended for Production)

Since you are already using AWS for S3, this is the best choice.

1.  **Go to AWS Console** -> **Amazon Simple Email Service (SES)**.
2.  **Identities**: Verify the email address you want to send _FROM_ (e.g., `admin@vaxify.com` or your personal email for testing).
    - _Note: In "Sandbox Mode", you must also verify every email you send TO._
3.  **SMTP Settings**:
    - Go to **SMTP Settings** in the left sidebar.
    - Note the `Server Name` (e.g., `email-smtp.us-east-1.amazonaws.com`). This is your `MAIL_HOST`.
4.  **Create Credentials**:
    - Click **Create SMTP credentials**.
    - Give it a name.
    - **IMPORTANT**: Copy the **SMTP Username** and **SMTP Password** immediately. These are DIFFERENT from your standard AWS Access Keys.

### Option B: Brevo (Formerly Sendinblue) - Easiest Free Tier

1.  Sign up at [Brevo.com](https://www.brevo.com).
2.  Go to **Transactional** -> **Settings** -> **Configuration**.
3.  Copy the **SMTP Server** (`smtp-relay.brevo.com`), **Port** (`587`), and **Login**.
4.  Click **Get Your API Key** (or Master Password) to generate the password.

---

## 3. Running in Production

### If using Docker (Recommended)

Pass the environment variables when starting the container.

```bash
docker run -d \
  -p 8080:8080 \
  -e MAIL_HOST=email-smtp.us-east-1.amazonaws.com \
  -e MAIL_PORT=587 \
  -e MAIL_USERNAME=YOUR_SMTP_USERNAME \
  -e MAIL_PASSWORD=YOUR_SMTP_PASSWORD \
  -e MAIL_AUTH=true \
  -e MAIL_TLS=true \
  --name vaxify-backend \
  vaxify-backend-image
```

### If using Java JAR directly

```bash
export MAIL_HOST=email-smtp.us-east-1.amazonaws.com
export MAIL_PORT=587
export MAIL_USERNAME=YOUR_SMTP_USERNAME
export MAIL_PASSWORD=YOUR_SMTP_PASSWORD
export MAIL_AUTH=true
export MAIL_TLS=true

java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### If using Systemd (Linux Service)

Edit your service file (`/etc/systemd/system/vaxify.service`):

```ini
[Service]
Environment="MAIL_HOST=email-smtp.us-east-1.amazonaws.com"
Environment="MAIL_PORT=587"
Environment="MAIL_USERNAME=YOUR_SMTP_USERNAME"
Environment="MAIL_PASSWORD=YOUR_SMTP_PASSWORD"
...
```

## 4. Troubleshooting

- **Authentication Failed**: ensure you are using the specific _SMTP_ password, not your account login password.
- **Connection Timed Out**: Ensure your server's firewall (Security Group) allows outbound traffic on port 587.
- **Emails not arriving**: Check your Spam folder. In AWS SES Sandbox, ensure the "To" address is also verified.
