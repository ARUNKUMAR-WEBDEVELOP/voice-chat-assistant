# Backend Setup

## 1. API key (OpenAI)

1. Copy the example env file:

   ```
   copy .env.example .env
   ```

2. Get your OpenAI key from: https://platform.openai.com/api-keys

3. Open `.env` in live-transcribe-backend and add your key (no quotes):

   ```
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

4. **Restart** the Django server after saving `.env`.

5. Test: Open http://localhost:8000/api/health/ - should show `api_key_loaded: true`.

**Important:** Never commit `.env`. It is in .gitignore.
