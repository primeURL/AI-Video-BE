import mongoose  from "mongoose";


const quizSchema = new mongoose.Schema({
    timestamp: Number,
    question: String,
    options: [String],
    correct: String
  });

const schema = new mongoose.Schema({
    scriptTitle: String,
    scriptContent : String,
    videoType : String,
    videoId: String,
    videoDuration : String,
    status: String,
    videoUrl: String,
    audioUrl: String,
    publicUrl : String,
    fileName : String,
    quiz: [quizSchema]
  }, 
  {
    timestamps: true,
  },);

  export const Video = mongoose.model('video', schema);