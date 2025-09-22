# OpenShift AI Chat Application

A full-stack chat application that provides a web interface for interacting with AI models deployed on OpenShift AI (KServe/ModelMesh) inference endpoints.

## Features

- **Multi-model support**: Switch between different AI models via dropdown
- **Dual API compatibility**: Supports both KServe V2 and OpenAI-compatible endpoints
- **Secure proxy**: API keys and tokens never exposed to frontend
- **Real-time chat**: Clean, responsive chat interface
- **Error handling**: Comprehensive error handling with user-friendly messages
- **TypeScript**: Full type safety throughout the application

## Architecture

- **Frontend**: Next.js 13+ (App Router) with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes acting as proxy to OpenShift AI endpoints
- **Authentication**: Bearer token authentication passed through to inference endpoints
- **State management**: React hooks for chat state and model selection

## Setup

### 1. Environment Configuration

Copy the example environment file and configure your models:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the `MODELS` configuration with your OpenShift AI endpoints:

```bash
MODELS='[
  {
    "id": "your-model-id",
    "label": "Your Model Display Name",
    "mode": "v2",
    "baseUrl": "https://your-openshift-cluster/v2/models/your-model/infer",
    "authHeader": "Authorization",
    "authToken": "Bearer your-inference-token"
  }
]'
```

### 2. Getting OpenShift AI Credentials

#### Finding Your Inference Endpoint:
1. Log into your OpenShift AI dashboard
2. Navigate to **Data Science Projects** → Your Project
3. Go to **Models** tab and find your deployed model
4. Copy the **Inference endpoint** URL

#### Getting Authentication Token:
1. In OpenShift console, go to **User Management** → **Service Accounts**
2. Create a service account with inference permissions, or
3. Use your personal access token from **Copy login command**

### 3. Installation and Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### 4. Production Build

```bash
npm run build
npm start
```

## API Modes

### KServe V2 Protocol (`"mode": "v2"`)

For models using the KServe V2 inference protocol:

**Request format:**
```json
{
  "inputs": [{
    "name": "text",
    "shape": [1],
    "datatype": "BYTES", 
    "data": ["Your prompt here"]
  }]
}
```

**Expected response:**
```json
{
  "outputs": [{
    "name": "text",
    "shape": [1],
    "datatype": "BYTES",
    "data": ["Model response here"]
  }]
}
```

### OpenAI Compatible (`"mode": "openai"`)

For models using OpenAI-compatible chat completions:

**Request format:**
```json
{
  "model": "your-model-id",
  "messages": [
    {"role": "user", "content": "Your message"}
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

**Expected response:**
```json
{
  "choices": [{
    "message": {
      "content": "Model response here"
    }
  }]
}
```

## Configuration Options

### Model Configuration Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the model |
| `label` | string | Display name shown in UI |
| `mode` | "v2" \| "openai" | API protocol mode |
| `baseUrl` | string | Full inference endpoint URL |
| `authHeader` | string | Authentication header name (usually "Authorization") |
| `authToken` | string | Full auth token including "Bearer " prefix |

### Example Configurations

#### Llama 2 on KServe V2:
```json
{
  "id": "llama2-7b-chat",
  "label": "Llama 2 7B Chat",
  "mode": "v2",
  "baseUrl": "https://llama2-chat-myproject.apps.cluster.example.com/v2/models/llama2-chat/infer",
  "authHeader": "Authorization",
  "authToken": "Bearer sha256~abc123..."
}
```

#### vLLM OpenAI Compatible:
```json
{
  "id": "mistral-7b-instruct", 
  "label": "Mistral 7B Instruct v0.2",
  "mode": "openai",
  "baseUrl": "https://mistral-7b-myproject.apps.cluster.example.com/v1/chat/completions",
  "authHeader": "Authorization", 
  "authToken": "Bearer sha256~def456..."
}
```

## API Endpoints

### `GET /api/models`
Returns available models for selection.

**Response:**
```json
{
  "models": [
    {"id": "model-1", "label": "Model 1"},
    {"id": "model-2", "label": "Model 2"}
  ]
}
```

### `POST /api/chat`
Sends chat messages to selected model.

**Request:**
```json
{
  "modelId": "llama2-chat",
  "messages": [
    {"role": "user", "content": "Hello!"},
    {"role": "assistant", "content": "Hi there!"},
    {"role": "user", "content": "How are you?"}
  ]
}
```

**Response:**
```json
{
  "content": "I'm doing well, thank you for asking!"
}
```

## Error Handling

The application handles several error scenarios:

- **401 Unauthorized**: Invalid or expired authentication tokens
- **404 Not Found**: Model not found or endpoint unavailable  
- **502 Bad Gateway**: Network issues or inference service down
- **500 Internal Server Error**: Configuration or parsing errors

All errors are displayed as toast notifications in the UI.

## Development

### Project Structure
```
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat inference proxy
│   │   └── models/route.ts    # Models list endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main chat interface
├── components/
│   ├── ui/
│   │   └── toast.tsx          # Toast notification system
│   ├── chat-interface.tsx     # Main chat component
│   ├── chat-input.tsx         # Message input component
│   ├── chat-message.tsx       # Message bubble component
│   └── model-selector.tsx     # Model selection dropdown
├── lib/
│   ├── api-client.ts          # OpenShift AI client
│   ├── models.ts              # Model configuration utilities
│   └── utils.ts               # Utility functions
├── types/
│   └── chat.ts                # TypeScript type definitions
└── .env.example               # Environment configuration template
```

### Adding New Models

1. Add model configuration to your `.env.local` `MODELS` array
2. Ensure the model is deployed and accessible in OpenShift AI
3. Test the inference endpoint manually with curl if needed
4. Restart the development server to pick up new environment variables

### Custom Authentication

If your setup requires custom authentication headers:

```json
{
  "authHeader": "X-Custom-Auth",
  "authToken": "custom-token-format"
}
```

## Troubleshooting

### Common Issues

**"No models configured"**: 
- Check `.env.local` file exists and `MODELS` is valid JSON
- Restart development server after configuration changes

**Authentication errors (401)**:
- Verify your service account has inference permissions
- Check token hasn't expired
- Ensure "Bearer " prefix is included in `authToken`

**Network errors (502)**:
- Verify OpenShift AI cluster is accessible
- Check inference endpoint URLs are correct
- Test endpoints manually with curl

**Model not responding**:
- Check model is running and scaled up in OpenShift AI console
- Verify model supports the expected input/output format
- Check OpenShift AI logs for inference errors

### Testing Endpoints Manually

KServe V2:
```bash
curl -X POST "https://your-endpoint/v2/models/model-name/infer" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"inputs":[{"name":"text","shape":[1],"datatype":"BYTES","data":["Hello"]}]}'
```

OpenAI Compatible:
```bash
curl -X POST "https://your-endpoint/v1/chat/completions" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"model":"model-name","messages":[{"role":"user","content":"Hello"}]}'
```