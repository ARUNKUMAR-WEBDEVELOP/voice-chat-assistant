# Backend Setup

## 1. API key (OpenAI)

1. Copy the example env file:
   ```
   copy .env.example .env
   ```

2. Get your OpenAI key from: https://platform.openai.com/api-keys

3. Open `.env` and add your key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

4. Restart the Django server after changing `.env`.

**Important:** Never commit `.env` or share your API key. `.env` is in .gitignore.
