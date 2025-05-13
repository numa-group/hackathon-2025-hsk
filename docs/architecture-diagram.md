# AI Video Analysis Application Architecture

```mermaid
graph TD
    %% Main flow components
    User[User/Mobile Device] -->|Records video| VideoAnalysis[Video Analysis Screen]
    VideoAnalysis -->|Sends video| Backend[Backend Processing]
    Backend -->|Requests analysis| GeminiAI[Gemini 2.5 Pro AI]
    GeminiAI -->|Returns observations| Backend
    Backend -->|Delivers results| VideoAnalysis
    VideoAnalysis -->|Displays insights| User
    
    %% Simple styling
    class User,GeminiAI highlight
```

## Simple Flow

1. User records video using their mobile device
2. Video is sent to the backend for processing
3. Backend communicates with Gemini 2.5 Pro for AI analysis
4. AI identifies maintenance and cleanliness issues
5. Results are returned to the user interface
6. User views analysis with highlighted observations

## Key Features

- Mobile-optimized video recording
- AI-powered analysis of maintenance and cleanliness issues
- Sentiment analysis (positive/negative observations)
- Timestamp-based insights
- User verification of AI observations

## Technology Stack

```mermaid
graph TD
    subgraph "Technology Stack"
        Frontend[Frontend Framework: Next.js]
        UI[UI Components: shadcn/ui]
        Styling[Styling: Tailwind CSS]
        Deployment[Deployment: Vercel]
    end
    
    %% Simple styling
    class Frontend,Deployment highlight
```

- **Framework**: Next.js for both frontend and API routes
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS for responsive design
- **Deployment**: Vercel for seamless deployment and hosting
