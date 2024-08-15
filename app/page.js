"use client"  
import { useState, useEffect } from "react"
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
export default function Home() {
  const [messages, setMessages] = useState([]); 
  const [userInput, setUserInput] = useState("")
  const [chat, setChat] = useState(null); 
  const [theme, setTheme] = useState("light"); 
  const [error, setError] = useState(null); 

  const MODEL_NAME = "gemini-1.5-flash"; 
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY); 

  const generationConfig = {
    temperature: 0.9, // randomness
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048
  }; 

  // safety settings for chatbot to abide by 
  const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  ]; 

  // 
  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = await genAI.getGenerativeModel({model: MODEL_NAME }).startChat({
          generationConfig,
          safetySettings,
          history: messages.map((msg) => ({
            text: msg.text,
            role: msg.role, 
          })),
        });
        setChat(newChat);
      } catch (error) {
        setError("Failed to initalize chat. Please try again."); 
      }
    }; 
    initChat(); 
  }, []); 

  const handleSendMessage = async () => {
    /* try {
      // 
    } catch (error) {
      setError("Failed to send message. Please try again. ")
    }*/ 
    const userMessage = {
      text: userInput,
      role: "user",
      timestamp: new Date(),
    }; 

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput(""); 

    if (chat) {
      const result = await chat.sendMessage(userInput);
      const botMessage = {
        text: result.response.text(),
        role: "bot",
        timestamp: new Date(),
      }; 

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value); 
  }; 

  const getThemeColors = () => {
    switch (theme) {
      case "light":
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800"
        }; 
      case "dark":
        return {
          primary: "bg-gray-900",
          secondary: "bg-gray-800",
          accent: "bg-yellow-500",
          text: "text-gray-100",
        };
      default:
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800",
        }; 
    }
  }; 

  // prevents new line from being added in the input field
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      handleSendMessage(); 
    }
  }; 

  // get theme colors for the current theme 
  const { primary, secondary, accent, text } = getThemeColors(); 

  return (
    <div className={`flex flex-col h-screen p-4 ${primary}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className={`text-2xl font-bold ${text}`}>Gemini Assistant</h1>
        <div className="flex space-x-2">
          <label htmlFor="theme" className={`text-sm ${text}`}> Theme: </label>
          <select
            id="theme"
            value={theme}
            onChange={handleThemeChange}
            
            className={`p-1 rounded-md border ${secondary} ${text}`}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div> 
      </div>
      <div className={`flex-1 overflow-y-auto ${secondary} rounded-md p-2`}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`p-2 rounded-lg ${
                msg.role === "user" ? `${accent} text-white` : `${primary} ${text}` 
              }`}
            > {msg.text} </span>
            <p className={`text-cs ${text} mt-1`}>
              {msg.role === "bot" ? "Bot" : "You"} - {" "} 
              {msg.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <div className="flex items-center mt-4">
        <input
          type="text"
          placeholder="Enter your message here"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className={`flex-1 p-2 rounded-l-md border-t border-b border-l focus:outline-none focus:border-${accent}`}
        />
        <button
          onClick={handleSendMessage}
          className={`p-2 ${accent} text-white rounded-r-md hover:bg-opacity-80 focus:outline-none `}
        >
          Send
        </button>
      </div>
    </div>
  ); 
}
