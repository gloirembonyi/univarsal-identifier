



'use client'

import Navigation from '@/components/Navigation';
import Link from 'next/link';
//import PlantC from '../../components/PlantC';
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { FaArrowRight, FaCamera, FaUpload } from 'react-icons/fa'

const PlantIdentifierStyles = () => (
  <style jsx global>{`
    /* Existing animations */

    @keyframes neonPulse {
      0%, 100% { text-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff; }
      50% { text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff; }
    }

    .neon-text {
      animation: neonPulse 2s infinite;
    }

    .neon-button {
      box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff;
      transition: all 0.3s ease;
    }

    .neon-button:hover {
      box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff;
    }

    /* Add a subtle parallax effect */
    .parallax {
      background-attachment: fixed;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    }

    /* Custom scrollbar styles for Firefox */
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(82, 183, 136, 0.5) rgba(255, 255, 255, 0.1);
    }

    /* Optional: Styles for other browsers (won't affect Firefox) */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(82, 183, 136, 0.5);
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(82, 183, 136, 0.7);
    }
  `}</style>
)
export default function PlantIdentifier() {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<{ plantInfo: string, healthAssessment: string } | null>(null)
  const [translatedResult, setTranslatedResult] = useState<{ plantInfo: string, healthAssessment: string } | null>(null)
  const [showTranslateOptions, setShowTranslateOptions] = useState(false)
  const [showAllTopIssues, setShowAllTopIssues] = useState(false)
  const [showAllDetectedIssues, setShowAllDetectedIssues] = useState(false)
  const translateMenuRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [diseasesIssues, setDiseasesIssues] = useState<{ [key: string]: { count: number, lastUpdated: number } }>({})
  const [showIdentificationResults, setShowIdentificationResults] = useState(false);
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const savedDiseasesIssues = localStorage.getItem('diseasesIssues')
    if (savedDiseasesIssues) {
      setDiseasesIssues(JSON.parse(savedDiseasesIssues))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('diseasesIssues', JSON.stringify(diseasesIssues))
  }, [diseasesIssues])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // For the camera capture function:
  const handleCameraCapture = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function(stream) {
          const videoElement = document.createElement('video');
          videoElement.srcObject = stream;
          videoElement.setAttribute('playsinline', 'true');
          videoElement.style.position = 'fixed';
          videoElement.style.top = '0';
          videoElement.style.left = '0';
          videoElement.style.width = '100%';
          videoElement.style.height = '100%';
          videoElement.style.objectFit = 'cover';
          videoElement.style.zIndex = '9999';
          const captureButton = document.createElement('button');
          captureButton.textContent = 'Capture';
          captureButton.style.position = 'fixed';
          captureButton.style.bottom = '20px';
          captureButton.style.left = '50%';
          captureButton.style.transform = 'translateX(-50%)';
          captureButton.style.zIndex = '10000';
          captureButton.style.padding = '10px 20px';
          captureButton.style.backgroundColor = '#52B788';
          captureButton.style.color = 'white';
          captureButton.style.border = 'none';
          captureButton.style.borderRadius = '5px';
          captureButton.style.cursor = 'pointer';
  
          document.body.appendChild(videoElement);
          document.body.appendChild(captureButton);
  
          videoElement.play();
  
          captureButton.onclick = () => {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            canvas.getContext('2d')?.drawImage(videoElement, 0, 0);
            const imageDataUrl = canvas.toDataURL('image/jpeg');
          
            // Ensure imageDataUrl is a string
            if (typeof imageDataUrl === 'string') {
              setImage(imageDataUrl);
            } else {
              console.error('Failed to capture image: imageDataUrl is not a string');
            }
          
            // Clean up
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(videoElement);
            document.body.removeChild(captureButton);
          };
        })
        .catch(function(error) {
          console.error("Camera error: ", error);
        });
    } else {
      console.error("getUserMedia is not supported");
    }
  };

  const identifyPlant = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyCr9LRa1zi5rwwTlibFmRu2r0rbug8S-Ow')
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            {
              text: `Identify this plant and provide a comprehensive analysis. Pay close attention to the plant's health status and provide an accurate assessment. Format the response as follows:
      
              Plant Information:
              1. Name: [Common name(s), Scientific name]
              2. Distribution: [Geographic regions where the plant is commonly found]
              3. Growth Rate: [Slow/Moderate/Fast]
              4. Soil Requirements: [pH range, texture, drainage preferences]
              5. USDA Hardiness Zones: [If applicable]
              6. Light Requirements: [Full sun/Partial shade/Full shade]
              7. Water Needs: [Low/Moderate/High]
              8. Maturity and Harvest:
                 - Time to maturity: [Estimate]
                 - Harvesting period: [If applicable]
              
              Plant Assessment:
              health: [Good/Bad/Ambiguous]
              
              If health is Good:
              1. Justification: [Concise explanation for the good health assessment]
              2. Positive Indicators:
                 - [List 3-4 key visual indicators of health]
              3. Maintenance Tips:
                 - [Provide 3-4 specific care instructions for optimal health]
              
              If health is Bad:
              1. Diseases/Issues:
                 - [List identified problems, clearly naming each]
              2. Symptoms:
                 - [List 3-4 visible symptoms indicating poor health]
              3. Potential Causes:
                 - [Suggest 2-3 likely reasons for the observed issues]
              4. Mitigation Strategies:
                 - [Outline 3-4 clear, actionable steps to address the problems]
              
              If health is Ambiguous:
              1. Observations:
                 - [List 3-4 notable observations about the plant's appearance]
              2. Potential Concerns:
                 - [List any potential issues that cannot be conclusively determined]
              3. Recommended Actions:
                 - [Provide 3-4 steps for further assessment or precautionary care]
      
              Please provide a detailed yet concise response, focusing on the most relevant information for each section. Consider the plant's current growth stage and typical characteristics when assessing its health. Be as accurate as possible in determining the health status.`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: image.split(',')[1]
              }
            }
          ]
        }]
      });
  
      const processedText = result.response.text().replace(/(\*\*|\#\#)/g, '');
      const [plantInfo, healthAssessment] = processedText.split('Plant Assessment:');

      setResult({
        plantInfo: plantInfo.trim(),
        healthAssessment: 'Plant Assessment:\n' + healthAssessment.trim()
      });
      setTranslatedResult({
        plantInfo: plantInfo.trim(),
        healthAssessment: 'Plant Assessment:\n' + healthAssessment.trim()
      });
      

       // Extract and count only Diseases/Issues
      const healthAssessmentSection = processedText.split('Plant Assessment:')[1];
      const diseasesIssuesSection = healthAssessmentSection.split('Diseases/Issues:')[1]?.split('Symptoms:')[0];
      if (diseasesIssuesSection) {
        const issues = diseasesIssuesSection.split(/[-\d.]/)  // Split by hyphens, numbers, or periods
          .map(issue => issue.split(':')[0].trim())
          .filter(issue => issue && !issue.match(/^\d+$/));  // Remove empty strings and standalone numbers
        
        const currentTime = Date.now();
        setDiseasesIssues(prevIssues => {
          const newIssues = { ...prevIssues };
          issues.forEach(issue => {
            if (issue in newIssues) {
              newIssues[issue] = { count: newIssues[issue].count + 1, lastUpdated: currentTime };
            } else {
              newIssues[issue] = { count: 1, lastUpdated: currentTime };
            }
          });
          return newIssues;
        });
      }

      setShowIdentificationResults(true);
      setAnimate(true);
    } catch (error) {
      const errorMessage = `Error identifying plant: ${error instanceof Error ? error.message : String(error)}`
      setResult({ plantInfo: errorMessage, healthAssessment: '' });
      setTranslatedResult({ plantInfo: errorMessage, healthAssessment: '' });
    }
    setLoading(false)
  }

  const closeIdentificationResults = () => {
    setAnimate(false);
    setTimeout(() => {
      setShowIdentificationResults(false);
      setResult(null);
      setTranslatedResult(null);
      setImage(null);
    }, 300);
  };
//
  const getTopFiveIssues = () => {
    return Object.entries(diseasesIssues)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([issue, data], index) => ({
        name: issue,
        percentage: (data.count / Object.values(diseasesIssues).reduce((a, b) => a + b.count, 0) * 100).toFixed(0),
        rank: index + 1
      }))
    }
      // Update the state types
 
  // Modify the translateResult function
  const translateResult = async (lang: 'en' | 'fr' | 'rw') => {
    if (!result) return;
  
    setLoading(true);
    try {
      const translateText = async (text: string) => {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, lang }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Translation failed');
        }
        
        const data = await response.json();
        return data.translatedText;
      };

      const translatedPlantInfo = await translateText(result.plantInfo);
      const translatedHealthAssessment = await translateText(result.healthAssessment);


      setTranslatedResult({
        plantInfo: translatedPlantInfo,
        healthAssessment: translatedHealthAssessment
      });
    } catch (error) {
      console.error('Translation error:', error);
      if (error instanceof Error && error.message.includes('Too Many Requests')) {
        setTranslatedResult({
          plantInfo: "Translation limit reached. Please try again later.",
          healthAssessment: "Translation limit reached. Please try again later."
        });
      } else {
        setTranslatedResult({
          plantInfo: `Translation error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
          healthAssessment: `Translation error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const toggleTranslateOptions = () => {
    setShowTranslateOptions(!showTranslateOptions)
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (translateMenuRef.current && !translateMenuRef.current.contains(event.target as Node)) {
        setShowTranslateOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#050414] via-[#1a0f2e] to-[#2a1b3d] text-white font-['Roboto']">
      <PlantIdentifierStyles />
    

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-8 py-8 flex flex-col lg:flex-row gap-8 animate-fadeIn">
        <div className="flex-grow lg:mr-0 space-y-8">
          <div className="bg-[#130a2a]/80 rounded-2xl shadow-lg p-6 backdrop-blur-sm border border-[#ff00ff]/20">
            <div className={`flex ${showIdentificationResults ? 'justify-between' : 'justify-center'} items-center mb-6`}>
              <h2 className={`text-4xl text-[#52B788] font-thin ${showIdentificationResults ? '' : 'text-center'}`}>Plant Identifier</h2>
              {showIdentificationResults && (
                <div className="flex space-x-4">
                  <div className="relative" ref={translateMenuRef}>
                    <button
                      onClick={toggleTranslateOptions}
                      className="px-4 py-2 bg-[#52B788] text-white rounded-md hover:bg-[#3E8E69] transition font-thin">
                        
                      Translate
                    </button>
                    {showTranslateOptions && (
                      <div className="absolute right-0 top-full mt-2 bg-[#081C15] border border-[#52B788] rounded-md shadow-lg z-10">
                        {['en', 'fr', 'rw'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              translateResult(lang as 'en' | 'fr' | 'rw')
                              setShowTranslateOptions(false)
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-[#1B4332] transition disabled:opacity-50 disabled:cursor-not-allowed font-thin"
                            disabled={!result || loading}
                          >
                            {lang === 'en' ? 'English' : lang === 'fr' ? 'French' : 'Kinyarwanda'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={closeIdentificationResults}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-thin"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
            {/* Image Upload and Capture */}
            {!showIdentificationResults && (
              <div className="transition-all duration-300 ease-in-out">
                <div className="flex justify-center space-x-4 mb-6">
                  <label className="bg-[#52B788] text-[#0a0908] px-4 py-2 rounded cursor-pointer hover:bg-[#3E8E69] transition font-thin flex items-center animate-pulse">
                    <FaUpload className="mr-2" />
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button
                    onClick={handleCameraCapture}
                    className="bg-[#52B788] text-[#0a0908] px-4 py-2 rounded hover:bg-[#3E8E69] transition font-thin flex items-center animate-pulse"
                  >
                    <FaCamera className="mr-2" />
                    Take Photo
                  </button>
                </div>
                {/* Uploaded Image and Identify Button */}
                {image && (
                  <div className="flex flex-col items-center mb-6">
                    <Image src={image} alt="Uploaded plant" width={300} height={300} className="rounded-lg shadow-lg mb-4" />
                    <button
                      onClick={identifyPlant}
                      className="bg-[#ff00ff] text-white px-6 py-2 rounded-full hover:bg-[#00ffff] transition-all duration-300 font-thin flex items-center justify-center neon-button"
                      disabled={loading}
                    >
                      {loading ? 'Identifying...' : 'Identify Plant'}
                      <FaArrowRight className="ml-2" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Identification Results */}
            {showIdentificationResults && translatedResult && (
              <div className="transition-all hover:shadow-lg hover:shadow-[#ff00ff]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Plant Information */}
                  <div className="bg-[#0a0520]/80 p-6 rounded-lg shadow-lg backdrop-blur-sm transform transition-all duration-300 overflow-hidden custom-scrollbar">
                    <h3 className="text-2xl font-semibold text-[#52B788] mb-4 border-b border-[#52B788] pb-2 custom-scrollbar">Plant Information</h3>
                    <div className="text-white space-y-3 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                      {translatedResult.plantInfo.split('\n').map((line, index) => {
                        if (line.includes(':')) {
                          const [label, ...content] = line.split(':');
                          return (
                            <div key={index} className="flex items-start hover:bg-[#1a0f2e] p-2 rounded transition-colors duration-300">
                              <p className="font-semibold text-[#52B788] min-w-[140px] flex-shrink-0">{label.trim()}:</p>
                              <p className="ml-2 flex-grow">{content.join(':').trim()}</p>
                            </div>
                          );
                        }
                        return <p key={index} className="text-[#dad7cd]">{line.trim()}</p>;
                      })}
                    </div>
                  </div>

                  {/* Plant Assessment */}
                  <div className="bg-[#0a0520]/80 p-6 rounded-lg shadow-lg backdrop-blur-sm transform transition-all duration-300 overflow-hidden">
                    <h3 className="text-2xl font-semibold text-[#52B788] mb-4 border-b border-[#52B788] pb-2">Plant Assessment</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                      {translatedResult.healthAssessment.split('\n').map((line, index) => {
                        if (line.includes(':')) {
                          const [label, ...content] = line.split(':');
                          const isStatus = label.toLowerCase().includes('health') || 
                                            label.toLowerCase().includes('santé') || 
                                            label.toLowerCase().includes('ubuzima');
                          const isDiseases = label.toLowerCase().includes('diseases') || 
                                            label.toLowerCase().includes('issues');
                          const isPotentialCauses = label.toLowerCase().includes('potential causes');
                          
                          if (isStatus) {
                            const status = content.join(':').trim().toLowerCase();
                            const isGood = status.includes('good') || 
                                          status.includes('bon') || 
                                          status.includes('byiza') ||
                                          status.includes('meza') ||
                                          !status.includes('bad') &&
                                          !status.includes('mauvais') &&
                                          !status.includes('nibibi');
                            return (
                              <div key={index} className="flex items-center bg-opacity-50 p-3 rounded-lg mb-4" style={{backgroundColor: isGood ? 'rgba(34, 197, 94, 0.2)' : isGood === false ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)'}}>
                                <div className={`w-4 h-4 rounded-full mr-3 ${isGood ? 'bg-green-500' : isGood === false ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                <p className="font-semibold text-lg">{label.trim()}:</p>
                                <p className="ml-2 text-lg">{content.join(':').trim()}</p>
                              </div>
                            );
                          } else if (isDiseases || isPotentialCauses) {
                            return (
                              <div key={index} className="mb-4">
                                <p className="font-semibold text-[#52B788] text-lg mb-2">{label.trim()}:</p>
                                <ul className="list-none ml-4 text-white space-y-2">
                                  {content.join(':').split('-').filter(item => item.trim()).map((item, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="text-[#52B788] mr-2">•</span>
                                      <span>{item.trim()}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={index} className="flex items-start hover:bg-[#1a0f2e] p-2 rounded transition-colors duration-300">
                              <p className="font-semibold text-[#52B788] min-w-[140px] flex-shrink-0">{label.trim()}:</p>
                              <p className="text-white ml-2 flex-grow">{content.join(':').trim()}</p>
                            </div>
                          );
                        } else if (line.trim()) {
                          return <p key={index} className="text-[#dad7cd]">{line.trim()}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative h-64 mb-8 rounded-2xl overflow-hidden">
              <Image
                src="/tropical-sunset.jpg" // Add this image to your public folder
                alt="Tropical Sunset"
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050414] to-transparent"></div>
              <h2 className="absolute bottom-6 left-6 text-4xl text-white font-thin z-10 neon-text">Discover Nature's Secrets</h2>
            </div>
          {/* AI Explanation Section */}
          <div className="transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-[#ff00ff]/20">
            <h3 className="text-2xl font-thin text-[#52B788] mb-4">How Our AI Works</h3>
            <p className="text-white font-thin mb-4">
              Our plant identification AI uses advanced machine learning algorithms to analyze images of plants and provide accurate information about their species, health, and care requirements.
            </p>
            <ol className="list-decimal list-inside text-[dad7cd] transition font-thin space-y-2">
              <li>Upload or take a photo of a plant</li>
              <li>Our AI analyzes the image, considering factors like leaf shape, color, and texture</li>
              <li>The AI compares the image to its vast database of plant species</li>
              <li>It provides detailed information about the plant, including its name and care instructions</li>
              <li>The AI also assesses the plant's health and offers suggestions for improvement if needed</li>
            </ol>
         </div>
        </div>
         
        {/* Right Column - Sidebar */}
        <aside className="lg:w-[calc(2/6*100%)] space-y-8 animate-slideInRight">
        {showIdentificationResults && image && (
        <div className="bg-[#130a2a]/60 rounded-2xl shadow-lg p-6 backdrop-blur-md border border-[#ff00ff]/20">
          <Image src={image} alt="Identified plant" width={200} height={200} className="rounded-lg shadow-lg mb-4 mx-auto" />
          <div className="flex justify-center space-x-2 mb-4">
            <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target && target.files && target.files.length > 0) {
                      const file = target.files[0];
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        if (e.target && typeof e.target.result === 'string') {
                          setImage(e.target.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="bg-[#52B788] text-[#0a0908] px-3 py-1 rounded hover:bg-[#3E8E69] transition font-thin text-sm flex items-center cursor-pointer"
              >
                <FaUpload className="mr-1" /> New
              </button>
              <button 
                onClick={handleCameraCapture}
                className="bg-[#52B788] text-[#0a0908] px-3 py-1 rounded hover:bg-[#3E8E69] transition font-thin text-sm flex items-center cursor-pointer"
              >
                <FaCamera className="mr-1" /> Photo
              </button>
              <button 
                onClick={identifyPlant} 
                className="bg-[#52B788] text-[#0a0908] px-3 py-1 rounded hover:bg-[#3E8E69] transition font-thin text-sm flex items-center"
                disabled={loading}
              >
                {loading ? 'ID...' : 'ID'}
                <FaArrowRight className="mr-1" />
              </button>
            </div>
          </div>
        )}
          <div className="bg-[#130a2a]/80 rounded-2xl shadow-lg p-6 backdrop-blur-sm border border-[#ff00ff]/20">
            <h3 className="text-2xl font-thin text-[#52B788] mb-4">Top Plant Issues</h3>
            <div className="space-y-4">

                {getTopFiveIssues().map((issue, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white font-thin">{issue.rank}. {issue.name}</span>
                    <div className="w-1/2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-[#52B788] h-2.5 rounded-full" style={{width: `${issue.percentage}%`}}></div>
                    </div>
                    <span className="text-white font-thin">{issue.percentage}%</span>
                  </div>
                ))}
              </div>

            <button
                onClick={() => setShowAllTopIssues(!showAllTopIssues)}
                className="mt-4 bg-[#52B788] text-white px-4 py-2 rounded hover:bg-[#3E8E69] transition font-thin"
              >
                {showAllTopIssues ? 'Show Less' : 'Show All'}
              </button>

            {showAllTopIssues && (
                <div className="mt-4 space-y-2">
                  {Object.entries(diseasesIssues)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(5)
                    .map(([issue, data], index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-white font-thin">{issue}</span>
                        <span className="text-white font-thin">{data.count} occurrences</span>
                      </div>
                    ))}
                </div>
                
              )}

          </div>

          <div className="bg-[#130a2a]/80 rounded-2xl shadow-lg p-6 backdrop-blur-sm border border-[#ff00ff]/20">
            <h3 className="text-2xl font-thin text-[#52B788] mb-4">Recently Detected Issues</h3>
            <div className="space-y-2">
              {(() => {
                const issueMap = new Map<string, number>();
                return Object.entries(diseasesIssues)
                  .sort(([, a], [, b]) => b.lastUpdated - a.lastUpdated)
                  .reduce((acc: [string, { count: number; lastUpdated: number }][], [issue, data]) => {
                    if (issueMap.has(issue)) {
                      const count = issueMap.get(issue)! + 1;
                      issueMap.set(issue, count);
                      acc.push([`${issue} (${count})`, data]);
                    } else {
                      issueMap.set(issue, 1);
                      acc.push([issue, data]);
                    }
                    return acc;
                  }, [])
                  .slice(0, showAllDetectedIssues ? undefined : 5)
                  .map(([issue, data], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white font-thin">{issue}</span>
                      <span className="text-white font-thin">
                        {new Date(data.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  ));
              })()}
            </div>
            <button
              onClick={() => setShowAllDetectedIssues(!showAllDetectedIssues)}
              className="mt-4 bg-[#52B788] text-white px-4 py-2 rounded hover:bg-[#3E8E69] transition font-thin"
            >
              {showAllDetectedIssues ? 'Show Less' : 'Show All'}
            </button>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0520]/80 text-[#ff00ff] py-12 backdrop-blur-sm border-t border-[#ff00ff]/20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-thin mb-2">About Plant Identifier</h3>
              <p className="font-thin">Our AI-powered plant identification tool helps you discover and learn about various plant species quickly and accurately.</p>
            </div>
            <div>
              <h3 className="text-xl font-thin mb-2">Quick Links</h3>
              <ul className="space-y-2 font-thin">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-thin mb-2">Contact Us</h3>
              <p className="font-thin">Email: info@plantidentifier.com</p>
              <p className="font-thin">Phone: (123) 456-7890</p>
            </div>
          </div>
          <div className="mt-7 text-center">
            <p className="font-thin">&copy; 2024 Plant Identifier. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


