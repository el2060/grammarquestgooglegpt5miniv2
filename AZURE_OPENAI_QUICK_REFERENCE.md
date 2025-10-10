# Azure OpenAI GPT-5 Mini - Quick Reference Guide

## Your Configuration

```
Endpoint:    https://clte-menwxn6d-eastus2.cognitiveservices.azure.com/
Model:       gpt-5-mini
Deployment:  gpt-5-mini
API Version: 2024-12-01-preview
```

---

## GPT-5 Mini Requirements

### ✅ What You MUST Do

1. **Token Limit Parameter:**
   ```typescript
   max_completion_tokens: 4096  // ✅ Correct for GPT-5 mini
   max_tokens: 4096             // ❌ Wrong - will fail
   ```

2. **Temperature:**
   ```typescript
   // ✅ Correct - omit or set to 1
   temperature: 1  // OK
   // (omitted)    // OK - defaults to 1

   // ❌ Wrong - will fail
   temperature: 0.7  // Not allowed
   ```

3. **Top-p:**
   ```typescript
   // ✅ Correct - do not include
   // (omitted)

   // ❌ Wrong - will fail
   top_p: 0.9  // Not supported
   ```

### Example API Call

```typescript
const response = await client.chat.completions.create({
  model: "gpt-5-mini",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" }
  ],
  max_completion_tokens: 4096,
  // temperature defaults to 1
  // top_p not supported
});
```

---

## Structured Outputs (JSON Mode)

GPT-5 mini supports structured outputs with strict schema validation:

```typescript
const response = await client.chat.completions.create({
  model: "gpt-5-mini",
  messages: [...],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "my_schema",
      strict: true,  // Enforces exact schema compliance
      schema: {
        type: "object",
        properties: {
          // your schema here
        },
        required: ["field1", "field2"],
        additionalProperties: false
      }
    }
  },
  max_completion_tokens: 4096
});
```

---

## Environment Variables

Your `.env.local` file:

```env
AZURE_OPENAI_ENDPOINT=https://clte-menwxn6d-eastus2.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=AzTixO2EdP2mOr3SUTElW482MyAzF7UYxrag22g7QJLfAyd5NNhEJQQJ99BHACHYHv6XJ3w3AAAAACOGqAzu
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

⚠️ **Security Note:** Never commit `.env.local` to git! Add to `.gitignore`.

---

## Client Initialization

```typescript
import { AzureOpenAI } from "openai";

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  dangerouslyAllowBrowser: true  // Only for client-side apps
});
```

---

## Common Errors & Solutions

### Error: "Invalid parameter: temperature"
```typescript
// ❌ Problem
temperature: 0.5

// ✅ Solution
// Omit temperature or set to 1
```

### Error: "Invalid parameter: top_p"
```typescript
// ❌ Problem
top_p: 0.9

// ✅ Solution
// Remove top_p entirely
```

### Error: "Invalid parameter: max_tokens"
```typescript
// ❌ Problem
max_tokens: 4096

// ✅ Solution
max_completion_tokens: 4096
```

### Error: JSON parsing failed
```typescript
// ✅ Solution: Use structured outputs
response_format: {
  type: "json_schema",
  json_schema: {
    name: "response",
    strict: true,
    schema: { /* your schema */ }
  }
}
```

---

## API Rate Limits

Check your Azure OpenAI resource for rate limits:
- Tokens per minute (TPM)
- Requests per minute (RPM)
- Concurrent requests

Monitor usage at: https://portal.azure.com

---

## Testing Your Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test in browser:**
   - Navigate to http://localhost:3000
   - Try generating a quiz
   - Try analyzing text
   - Check browser console for errors

3. **Check API logs:**
   - Go to Azure Portal
   - Open your OpenAI resource
   - View "Metrics" and "Logs"

---

## Troubleshooting

### Issue: "API key not found"
**Solution:** Restart Vite dev server after changing `.env.local`:
```bash
npm run dev
```

### Issue: CORS errors
**Solution:** Already handled with `dangerouslyAllowBrowser: true`

### Issue: Rate limit exceeded
**Solution:** Check Azure portal for quota limits, consider:
- Reducing `max_completion_tokens`
- Adding exponential backoff retry logic
- Implementing request queuing

### Issue: Slow responses
**Solution:**
- Reduce `max_completion_tokens` (e.g., 2048 for shorter responses)
- Optimize prompts to be more concise
- Consider caching frequent queries

---

## Best Practices

1. **Prompt Engineering:**
   - Be specific and concise
   - Use system prompts for consistent behavior
   - Provide examples in the prompt

2. **Error Handling:**
   ```typescript
   try {
     const result = await callAzureOpenAI(...);
     return result;
   } catch (error) {
     console.error("Azure OpenAI error:", error);
     throw new Error("User-friendly error message");
   }
   ```

3. **Cost Optimization:**
   - Set appropriate `max_completion_tokens`
   - Cache results when possible
   - Use concise prompts

4. **Security:**
   - Never expose API keys in client code (use backend proxy for production)
   - Validate user inputs before sending to API
   - Implement rate limiting on your app

---

## Support & Documentation

- **Azure OpenAI Docs:** https://learn.microsoft.com/en-us/azure/ai-services/openai/
- **OpenAI Node SDK:** https://github.com/openai/openai-node
- **GPT-5 Preview Docs:** Check Azure portal for latest updates
- **Your Resource:** https://portal.azure.com (search for "clte-menwxn6d-eastus2")

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for updates
npm outdated

# Update OpenAI SDK
npm update openai
```

---

## File Structure

```
GRAMMAR1010v2/
├── .env.local                    # Azure OpenAI credentials
├── vite.config.ts                # Build config with env vars
├── package.json                  # Dependencies
├── services/
│   └── azureOpenAIService.ts     # Azure OpenAI integration
├── components/
│   ├── TopicSelector.tsx         # Uses generateQuiz()
│   └── Diagnostics.tsx           # Uses analyze, rewrite, quiz functions
└── types.ts                      # TypeScript interfaces
```

---

## Version Info

- **OpenAI SDK:** 6.3.0
- **Azure API Version:** 2024-12-01-preview
- **Model:** gpt-5-mini
- **Node.js:** Check with `node --version`
- **Vite:** 6.2.0

---

Last Updated: 2025-10-10
