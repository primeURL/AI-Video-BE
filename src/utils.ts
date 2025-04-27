import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_API, // Your R2 endpoint
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });


  export const uploadToR2 = async (stream: any, key : any, contentType : any) => {
    console.log('inside r2 upload')
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.BUCKET_NAME, // Replace with your R2 bucket
        Key: key,
        Body: stream,
        ContentType: contentType,
      },
    });
  
    return upload.done(); // Returns a Promise
  };

  export  function extractAndCleanScript(script :string) {
    // Extract <script>...</script> content
    const scriptRegex = /<script>([\s\S]*?)<\/script>/i; // Case-insensitive regex
    const scriptMatch = script.match(scriptRegex);
    let scriptText = scriptMatch ? scriptMatch[1].trim() : script;
  
    // If no script tags found, assume the entire input is the script content
    if (!scriptMatch) {
        console.warn("No <script> tags found, treating input as script content.");
        scriptText = script.trim();
    }
  
    // Extract quizzes
    const quizRegex = /<quiz>\s*({[\s\S]*?})\s*<\/quiz>/gi; // Capture JSON object
    const quizzes = [];
    let match;
  
    while ((match = quizRegex.exec(scriptText)) !== null) {
        let rawJson = match[1].trim();
  
        // Fix JSON: wrap keys in quotes, remove trailing commas, handle timestamp
        try {
            rawJson = rawJson
                .replace(/([{,]\s*)(\w+)(?=\s*:)/g, '$1"$2"') // Wrap unquoted keys
                .replace(/,\s*}/g, '}')                        // Remove trailing comma before }
                .replace(/,\s*]/g, ']')                        // Remove trailing comma before ]
                .replace(/'/g, '"')                            // Replace single quotes with double quotes
                .replace(/"timestamp":\s*(\d+:\d+)/g, (match, time) => {
                    // Convert MM:SS or SS to seconds or keep as string
                    if (time.includes(':')) {
                        const [minutes, seconds] = time.split(':').map(Number);
                        return `"timestamp": ${minutes * 60 + seconds}`;
                    }
                    return `"timestamp": ${time}`;
                });
  
            const parsedQuiz = JSON.parse(rawJson);
            quizzes.push(parsedQuiz);
        } catch (err) {
            console.error("Failed to parse quiz JSON:", rawJson, err);
        }
    }
  
    // Remove quiz content from script and clean up
    scriptText = scriptText
        .replace(quizRegex, '')             // Remove quiz blocks
        .replace(/<quiz>|<\/quiz>/gi, '')   // Remove stray quiz tags
        .replace(/\n+/g, '\n')              // Normalize newlines
        .replace(/\s+/g, ' ')               // Collapse extra spaces
        .replace(/(Let Me Introduce.*?)\s/g, '$1\n') // Restore key section breaks
        .replace(/(Subtopic \d+:.*?)\s/g, '$1\n')
        .replace(/(Here is the summary.*?)\s/g, '$1\n')
        .trim();
  
    return {
        scriptText,
        quizQuestions: quizzes
    };
  }