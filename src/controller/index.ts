import { Request,Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import {Video} from '../models/Video'
import { extractAndCleanScript, uploadToR2 } from "../utils";
import axios from 'axios'

const anthropic = new Anthropic();



const systemPromt = `You are excellent script writer. You are tasked with creating a script for an educational video on the topic provided. The script should be engaging, informative, and include interactive elements. Follow these guidelines to create a comprehensive script.
Script Length should be in range 1000 to 1500 characters`

export const generateVideo = async (req: Request,res:Response)=>{
    try {

        // console.log('req.body',req.body)
        const {content,title,type, password} = req.body;

        if(password !== process.env.PASSWORD){
            res.status(401).json({
                message : "Unauthorized"
            })
            return
        }
        console.log('content',content,title,type)
        let llmResponse = undefined
        if(!content || !title || !type){
            res.status(204).json({
                message : "Please provide all the required fields"
            })
            return
         }
        //  await new Promise((resolve) => setTimeout(resolve, 1000 * 30));
        //  const newVideo2 = await Video.insertMany([{
        //   scriptTitle : title,
        //   fileName : title.replaceAll(' ', '_').toLowerCase(),
        //   scriptContent : 'Sample script',
        //   videoId : '123',
        //   status : 'created'
        // }])
        //  res.status(200).json({
        //    msg : "Video Generation Started",
        //    data : 'newVideo',
        //  })
        //  return;

         if(type === 'script'){
          res.status(204).json({
            message : "Script Not Supported Yet"
          })
          return
         }else if(type === 'topic'){
           let userPrompt = `
            The topic for the educational video is:
            <topic>
                ${title}
            </topic>
    
            Your script should include the following sections:
            1. Short and Engaging Introduction (15 to 30 words)
            2. Main Content with Explanations and Analogies(40 to 60 words)
            3. Short Summary (10 to 20 words)
            4. Add <break time="100ms"/> after each subtopic or sentence completion. 
            6. After Sentence Completion add tag <break time="100ms"/>. 
            5. Include MCQ quizzes after each subtopic (see quiz format below).
            
    
            For each section, follow these instructions:
    
            1. Engaging Introduction:
            - Begin with a hook to capture the viewer's attention
            - Briefly introduce the topic and its importance
            - Outline what the video will cover
    
            2. Main Content:
            - Break down the topic into 1 subtopics
            - For each subtopic:
                a) Provide a clear explanation
                b) Use analogies to make complex concepts more understandable
                c) After each subtopic, create a MCQ quiz question (see quiz instructions below)
    
            3. Summary:
            - Recap the main points covered in the video
    
            4. Quizzes:
            - After each subtopic, include a MCQ quiz question, 4 options and 1 correct answer 
            - Provide the correct answer immediately after the question
            - Include a timestamp for each quiz in the format [MM:SS]
            - Wrap quiz in <quiz> </quiz> tags
    
            Format your output as follows:
            <script>
            Let Me Introduce the topic <break />
            (Write the short introduction here)
    
            Let's start with the Topic
            Subtopic 1: (Title)
            (Explanation, analogies, and examples for subtopic 1)
    
            <quiz>{
                timestamp: 15,
                question: "What do plants absorb from the sun?",
                options: ["Oxygen", "Light", "Water"],
                correct: "Light",
            }</quiz>

            Subtopic 2: (Title)
            (Explanation, analogies, and examples for subtopic 2)
    
            <quiz>{
            timestamp: 15,
            question: "What do plants absorb from the sun?",
            options: ["Oxygen", "Light", "Water"],
            correct: "Light",
            }</quiz>

            (Continue this pattern for all subtopics)
    
            Here is the summary of the video:
            (Write the summary here)
            </script>
    
            Remember to make the content engaging, use clear language, and provide relatable analogies. Ensure that the explanations are thorough but accessible to the target audience. The quizzes should reinforce key concepts from each subtopic.
    
            Your final output should include only the content within the <script> tags, formatted as shown above. Do not include any additional commentary or explanations outside of the script.
        `
          const message = await anthropic.messages.create({
              model: 'claude-3-opus-20240229',
              max_tokens: 1200,
              system : systemPromt,
              messages: [{ role: 'user', content: userPrompt }],
            
            });
          
          //@ts-ignore
           llmResponse = message.content[0].text
         }
       
          // llmResponse = "Here is the script for an educational video on photosynthesis in plants:\n\n<script>\nLet me introduce the fascinating process of photosynthesis in plants. <break time=\"500ms\"/> \nPhotosynthesis is a crucial process that enables plants to convert sunlight into energy, providing the foundation for life on Earth. <break time=\"500ms\"/>\nIn this video, we'll explore how plants harness the power of the sun to create their own food. <break time=\"150ms\"/>\n\nLet's start with the topic\nSubtopic 1: The Ingredients of Photosynthesis\nPlants need three key ingredients for photosynthesis: sunlight, carbon dioxide, and water. <break time=\"500ms\"/>\nImagine the plant as a tiny kitchen, with sunlight as the power source, carbon dioxide as the raw ingredient, and water as the secret sauce. <break time=\"500ms\"/>\nThe plant's leaves act like solar panels, capturing sunlight and kickstarting the photosynthesis process. <break time=\"150ms\"/> \n\n<quiz>\n[Quiz - Timestamp: 01:05]\n{\n  timestamp: 65,\n  question: \"What are the three key ingredients plants need for photosynthesis?\",\n  options: [\"Sunlight, oxygen, and soil\", \"Sunlight, carbon dioxide, and water\", \"Carbon dioxide, water, and nutrients\", \"Oxygen, water, and sunlight\"],\n  correct: \"Sunlight, carbon dioxide, and water\",\n}\n</quiz>\n\nSubtopic 2: The Photosynthesis Process\nInside the plant's leaves are tiny structures called chloroplasts, which contain a green pigment called chlorophyll. <break time=\"500ms\"/>\nChlorophyll absorbs sunlight, which energizes electrons and sets off a chain reaction. <break time=\"500ms\"/>  \nThis energy is used to convert carbon dioxide and water into glucose, a simple sugar that plants use for food. <break time=\"500ms\"/>\nAs a bonus, oxygen is released as a byproduct, which we breathe in. <break time=\"150ms\"/>\n\n<quiz>\n[Quiz - Timestamp: 02:15] \n{\n  timestamp: 135,\n  question: \"What is the green pigment in plant leaves that absorbs sunlight?\",\n  options: [\"Chlorine\", \"Chlorophyll\", \"Chloroplast\", \"Chloroform\"],\n  correct: \"Chlorophyll\",\n}\n</quiz>\n\nHere is a summary of the video:\nPhotosynthesis is the process by which plants use sunlight, carbon dioxide, and water to create their own food. <break time=\"500ms\"/>\nChlorophyll in the plant's leaves absorbs sunlight, triggering a chemical reaction that converts carbon dioxide and water into glucose and releases oxygen as a byproduct. <break time=\"500ms/> \nThis process forms the foundation of life on Earth, providing energy for plants and oxygen for other organisms. <break time=\"150ms\"/>\n</script>"
          const{scriptText,quizQuestions} = extractAndCleanScript(llmResponse)
          // console.log(scriptText,quizQuestions)
     
         
          const options = {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              authorization: `Basic ${process.env.DID_API_KEY}` // Add your API key here if required
            },
            body: JSON.stringify({
              // source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
              source_url: 'https://clips-presenters.d-id.com/v2/alyssa_red_suite_green_screen/46XonMxLFm/LRjggU94ze/image.png',
              script: {
                type: 'text',
                ssml: true, // <-- enable SSML support
                subtitles: 'false',
                provider: {
                  // type: 'playHT',
                  // voice_id: 's3://voice-cloning-zero-shot/1f44b3e7-22ea-4c2e-87d0-b4d9c8f1d47d/sophia/manifest.json'
                  type: 'microsoft',
                  voice_id: 'en-US-AvaMultilingualNeural'
                },
                input: scriptText
              },
              config: {
                stitch : "true",
                fluent: 'true',
                aspect_ratio: '16:9'
              },
               webhook: `${process.env.WEBHOOK_URL}/api/v1/did-webhook`
            })
          };
          const url = process.env.DID_API_URL!
          const response = await fetch(url, options)
          const data = await response.json()
          // console.log('data-->', data)

           const newVideo = await Video.insertMany([{
            scriptTitle : title,
            fileName : title.replaceAll(' ', '_').toLowerCase(),
            publicUrl : `${process.env.R2_DEV_URL}/${title.replaceAll(' ', '_').toLowerCase()}.mp4`,
            scriptContent : scriptText,
            quiz : quizQuestions,
            videoId : data.id,
            status : data.status,
            videoType : type
          }])
          
        res.status(200).json({
           msg : "Video Generation Started",
           data : newVideo,
         })
         return;
         
    } catch (error) {
        res.status(500).json({
            error
        })
    }
   
}

export const webhookVideoGeneration = async (req: Request,res:Response) => {
    try {
      console.log('Inside Webhook function')
      const data = req.body;
      const record = await Video.findOne({videoId : data.id})
      console.log('record', record)

      if(!record){
        res.status(404).json({
          msg : "Record not found"
        })
        return
      }

      if(record){
        record.status = data.status
        record.videoUrl = data.result_url
        record.audioUrl = data.audio_url
        record.videoDuration = data.duration
        record.updatedAt = new Date()
        const response = await axios({
          method: 'GET',
          url: data.result_url,
          responseType: 'stream',
        });
  
        const contentType = response.headers['content-type'] || 'video/mp4';
  
        await uploadToR2(response.data, `${record.fileName}.mp4`, contentType);
        await record.save()
      }

      // const result_url = 'https://pub-e57d6f472d77443983ae20c2ce67feb5.r2.dev/1744774982238.mp4';

    
      res.status(200).json({
        msg : `Webhook received, Video Generated Successfully and uploaded to R2 bucket, ${record.fileName}`
      })
      return
    } catch (error) {
         res.status(500).json({
            error
        })
        return;
    }
}

export const getAllGeneratedVideos = async(req: Request,res:Response) =>{
    try {
        console.log('getAllGeneratedVideos',getAllGeneratedVideos)
        const videos = await Video.find({}).sort({createdAt : -1})
        res.status(200).json({
            msg : "All Videos",
            data : videos
        })
        return;
    } catch (error) {
        res.status(500).json({
            error
        })
    }
}

export const getGeneratedVideo = async(req: Request,res:Response) =>{
  try {
      const {videoId} = req.params
      const video = await Video.find({videoId : videoId})
      res.status(200).json({
          msg : "Get Video",
          data : video
      })
      return;
  } catch (error) {
      res.status(500).json({
          error
      })
  }
}
