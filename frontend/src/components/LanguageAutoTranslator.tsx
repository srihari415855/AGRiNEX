"use client";

import React, { useEffect, useRef } from "react";
import { useApp } from "@/lib/AppContext";

// Comprehensive bidirectional phrase translation map for instant DOM-level translation
const TRANSLATIONS: Record<string, { hi: string; kn: string }> = {
  // Navigation & Core App
  "Dashboard": { hi: "डैशबोर्ड", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
  "Digital Twin": { hi: "डिजिटल ट्विन", kn: "ಡಿಜಿಟಲ್ ಟ್ವಿನ್" },
  "Zones": { hi: "वलय (ज़ोन)", kn: "ವಲಯಗಳು" },
  "Soil Analysis": { hi: "मृदा परीक्षण एवं विश्लेषण", kn: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ" },
  "Crop Health": { hi: "फसल स्वास्थ्य एवं रोग निदान", kn: "ಬೆಳೆ ಆರೋಗ್ಯ" },
  "What Should I Grow?": { hi: "मुझे क्या उगाना चाहिए?", kn: "ಏನು ಬೆಳೆಯಬೇಕು?" },
  "Weather": { hi: "मौसम पूर्वानुमान", kn: "ಹವಾಮಾನ" },
  "Smart Irrigation": { hi: "स्मार्ट सिंचाई स्वचालन", kn: "ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ" },
  "What-If Simulation": { hi: "क्या-हो-अगर सिमुलेशन", kn: "ಏನಾದರೆ ಸಿಮ್ಯುಲೇಶನ್" },
  "Market Intelligence": { hi: "मंडी भाव व बाज़ार", kn: "ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಮಂಡಿ ದರಗಳು" },
  "Market & Mandi Prices": { hi: "मंडी भाव व बाज़ार", kn: "ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಮಂಡಿ ದರಗಳು" },
  "Find Buyers": { hi: "सत्यापित थोक खरीदार", kn: "ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ" },
  "Production": { hi: "उत्पादन एवं फसल कटाई", kn: "ಉತ್ಪಾದನೆ ಮತ್ತು ಸುಗ್ಗಿ" },
  "Profitability": { hi: "लाभप्रदता एवं वित्तीय विश्लेषण", kn: "ಲಾಭದಾಯಕತೆ" },
  "Analytics": { hi: "सटीक कृषि विश्लेषण", kn: "ವಿಶ್ಲೇಷಣೆ" },
  "Ask AGRiNEX": { hi: "पूछें एग्रीनेक्स", kn: "AGRiNEX ಕೇಳಿ" },
  "Reports": { hi: "समेकित मास्टर रिपोर्ट", kn: "ವರದಿಗಳು" },
  "Devices": { hi: "IoT सेंसर व उपकरण", kn: "ಸಾಧನಗಳು" },
  "Settings": { hi: "सेटिंग्स", kn: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು" },
  "Farm Intelligence": { hi: "स्मार्ट कृषि प्रणाली", kn: "ಕೃಷಿ ಸಲಹೆ" },
  "A Digital Mirror of Your Actual Farm": { hi: "आपके वास्तविक खेत का डिजिटल दर्पण", kn: "ನಿಮ್ಮ ನಿಜ ಜಮೀನಿನ ಡಿಜಿಟಲ್ ಪ್ರತಿಬಿಂಬ" },
  "Add Farm": { hi: "खेत जोड़ें", kn: "ಜಮೀನು ಸೇರಿಸಿ" },
  "Edit Farm Details": { hi: "खेत विवरण संपादित करें", kn: "ಜಮೀನಿನ ವಿವರ ಸಂಪಾದಿಸಿ" },
  "Save Farm Details": { hi: "खेत विवरण सहेजें", kn: "ವಿವರಗಳನ್ನು ಉಳಿಸಿ" },
  "Switch Farm:": { hi: "खेत बदलें:", kn: "ಜಮೀನು ಬದಲಾಯಿಸಿ:" },
  "Active Farm": { hi: "सक्रिय खेत", kn: "ಸಕ್ರಿಯ ಜಮೀನು" },
  "AI Ground Truth Active": { hi: "AI वास्तविक डेटा सक्रिय", kn: "AI ನೈಜ ದತ್ತಾಂಶ ಸಕ್ರಿಯ" },
  "Live Weather": { hi: "लाइव मौसम", kn: "ಲೈವ್ ಹವಾಮಾನ" },
  "Recent Field Alerts": { hi: "हालिया खेत चेतावनियां", kn: "ಇತ್ತೀಚಿನ ಎಚ್ಚರಿಕೆಗಳು" },
  "Quick Actions": { hi: "त्वरित कार्य", kn: "ತ್ವರಿತ ಕಾರ್ಯಗಳು" },
  "No urgent alerts": { hi: "कोई गंभीर चेतावनी नहीं", kn: "ಯಾವುದೇ ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ" },
  "All zones are operating within optimal parameters": { hi: "सभी ज़ोन सामान्य व सुरक्षित स्थिति में हैं", kn: "ಎಲ್ಲಾ ವಲಯಗಳು ಸೂಕ್ತ ಸ್ಥಿತಿಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ" },
  
  // Soil & Vision Analysis
  "AI Vision Diagnostic Report": { hi: "फ़ोटो डायग्नोस्टिक रिपोर्ट", kn: "ದೃಶ್ಯ ತಪಾಸಣಾ ವರದಿ" },
  "Analysis Report": { hi: "विश्लेषण रिपोर्ट", kn: "ವಿಶ್ಲೇಷಣಾ ವರದಿ" },
  "Soil & Crop Details": { hi: "मिट्टी व फसल विवरण", kn: "ಮಣ್ಣು ಮತ್ತು ಬೆಳೆ ವಿವರಗಳು" },
  "Treatment & Care": { hi: "उपचार व देखभाल", kn: "ಚಿಕಿತ್ಸೆ ಮತ್ತು ಆರೈಕೆ" },
  "Seasonal Advisory": { hi: "मौसमी सलाह", kn: "ಋತುಮಾನದ ಸಲಹೆ" },
  "Real-Time Farm Telemetry Synchronized": { hi: "खेत का वास्तविक टेलीमेट्री समय समन्वित", kn: "ನೈಜ ಕೃಷಿ ಟೆಲಿಮೆಟ್ರಿ ಸಮಯ ಸಿಂಕ್ ಆಗಿದೆ" },
  "Take Photo": { hi: "फ़ोटो खींचें", kn: "ಫೋಟೊ ತೆಗೆಯಿರಿ" },
  "Upload Photo": { hi: "फ़ोटो अपलोड करें", kn: "ಫೋಟೊ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" },
  "Analyze": { hi: "विश्लेषण करें", kn: "ವಿಶ್ಲೇಷಿಸಿ" },
  "Analyzing...": { hi: "विश्लेषण हो रहा है...", kn: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." },
  "No image selected": { hi: "कोई फ़ोटो नहीं चुनी गई", kn: "ಯಾವುದೇ ಚಿತ್ರ ಆಯ್ಕೆಯಾಗಿಲ್ಲ" },
  "Saved in Database": { hi: "डेटाबेस में सुरक्षित", kn: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ" },
  "Saved Diagnostic History": { hi: "सहेजे गए डायग्नोस्टिक रिकॉर्ड", kn: "ಉಳಿಸಲಾದ ತಪಾಸಣಾ ಇತಿಹಾಸ" },
  "View Full Diagnostic Details": { hi: "पूर्ण डायग्नोस्टिक विवरण देखें", kn: "ಪೂರ್ಣ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ" },
  "Preserved in database": { hi: "डेटाबेस में सुरक्षित", kn: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ರಕ್ಷಿಸಲಾಗಿದೆ" },
  "Included in Consolidated Master Report": { hi: "समेकित मास्टर रिपोर्ट में शामिल", kn: "ಏಕೀಕೃತ ವರದಿಯಲ್ಲಿ ಒಳಗೊಂಡಿದೆ" },
  "Delete log": { hi: "रिकॉर्ड हटाएं", kn: "ದಾಖಲೆ ಅಳಿಸಿ" },
  "Take a clear photo of representative soil in good lighting.": { hi: "अच्छी रोशनी में खेत की मिट्टी की स्पष्ट फ़ोटो लें।", kn: "ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣಿನ ಸ್ಪಷ್ಟ ಫೋಟೊ ತೆಗೆಯಿರಿ." },
  "Take a clear photo of the affected leaf or plant.": { hi: "रोगग्रस्त पत्ती या पौधे की स्पष्ट फ़ोटो लें।", kn: "ರೋಗ ಪೀಡಿತ ಎಲೆ ಅಥವಾ ಸಸ್ಯದ ಸ್ಪಷ್ಟ ಫೋಟೊ ತೆಗೆಯಿರಿ." },
  "Take a clear photo of your harvest for quality observation.": { hi: "गुणवत्ता जांच हेतु फसल उपज की स्पष्ट फ़ोटो लें।", kn: "ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆಗಾಗಿ ಕಟಾವು ಮಾಡಿದ ಬೆಳೆಯ ಫೋಟೊ ತೆಗೆಯಿರಿ." },
  
  // Status Badges & Metrics
  "Healthy": { hi: "स्वस्थ", kn: "ಆರೋಗ್ಯಕರ" },
  "Needs Attention": { hi: "ध्यान देने योग्य", kn: "ಗಮನ ಅಗತ್ಯ" },
  "Critical": { hi: "गंभीर", kn: "ಗಂಭೀರ" },
  "Irrigating": { hi: "सिंचाई जारी", kn: "ನೀರಾವರಿ ನಡೆಯುತ್ತಿದೆ" },
  "No data": { hi: "डेटा उपलब्ध नहीं", kn: "ಮಾಹಿತಿ ಇಲ್ಲ" },
  "LIVE": { hi: "लाइव", kn: "ಲೈವ್" },
  "SIMULATED": { hi: "सिम्युलेटेड", kn: "ಅನುಕರಿಸಿದ" },
  "RECENT": { hi: "हालिया", kn: "ಇತ್ತೀಚಿನ" },
  "ESTIMATED": { hi: "अनुमानित", kn: "ಅಂದಾಜು" },
  "AI IMAGE ANALYSIS": { hi: "फ़ोटो विश्लेषण", kn: "ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ" },
  "PHOTO ANALYSIS": { hi: "फ़ोटो विश्लेषण", kn: "ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ" },
  "AI RECOMMENDATION": { hi: "फसल अनुशंसा", kn: "ಬೆಳೆ ಶಿಫಾರಸು" },
  "CROP RECOMMENDATION": { hi: "फसल अनुशंसा", kn: "ಬೆಳೆ ಶಿಫಾರಸು" },
  
  // Weather & Irrigation
  "Temperature": { hi: "तापमान", kn: "ತಾಪಮಾನ" },
  "Humidity": { hi: "आर्द्रता (नमी)", kn: "ಆರ್ದ್ರತೆ" },
  "Wind Speed": { hi: "हवा की गति", kn: "ಗಾಳಿಯ ವೇಗ" },
  "Precipitation": { hi: "वर्षा", kn: "ಮಳೆ" },
  "Forecast": { hi: "पूर्वानुमान", kn: "ಮುನ್ಸೂಚನೆ" },
  "Last updated": { hi: "अंतिम अद्यतन", kn: "ಕೊನೆಯ ನವೀಕರಣ" },
  "Start Irrigation": { hi: "सिंचाई शुरू करें", kn: "ನೀರಾವರಿ ಪ್ರಾರಂಭಿಸಿ" },
  "Stop Irrigation": { hi: "सिंचाई बंद करें", kn: "ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ" },
  "Irrigate": { hi: "सिंचाई करें", kn: "ನೀರು ನೀಡಿ" },
  "Duration (min)": { hi: "अवधि (मिनट)", kn: "ಅವಧಿ (ನಿಮಿಷ)" },
  "Soil moisture low": { hi: "मिट्टी में नमी कम है", kn: "ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ" },
  
  // Crop & Soil Intelligence
  "Recommend Crops": { hi: "फसलें सुझाएं", kn: "ಬೆಳೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಿ" },
  "Generating...": { hi: "तैयार हो रहा है...", kn: "ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ..." },
  "Water Requirement": { hi: "पानी की आवश्यकता", kn: "ನೀರಿನ ಅಗತ್ಯತೆ" },
  "Soil Compatibility": { hi: "मिट्टी अनुकूलता", kn: "ಮಣ್ಣಿನ ಹೊಂದಾಣಿಕೆ" },
  "Season Suitability": { hi: "मौसम उपयुक्तता", kn: "ಋತು ಹೊಂದಾಣಿಕೆ" },
  "Est. cost/acre": { hi: "अनुमानित लागत/एकड़", kn: "ಅಂದಾಜು ವೆಚ್ಚ/ಎಕರೆ" },
  "Margin": { hi: "शुद्ध लाभ", kn: "ಲಾಭದ ಪ್ರಮಾಣ" },
  "Risks": { hi: "प्रमुख जोखिम व कीट", kn: "ಪ್ರಮುಖ ಅಪಾಯಗಳು" },
  "Why": { hi: "कारण", kn: "ಏಕೆ ಶಿಫಾರಸು" },
  "Simulation Result": { hi: "सिमुलेशन परिणाम", kn: "ಸಿಮ್ಯುಲೇಶನ್ ಫಲಿತಾಂಶ" },
  "Scenario": { hi: "परिदृश्य चुनें", kn: "ಸನ್ನಿವೇಶ ಆರಿಸಿ" },
  "Simulate": { hi: "सिमुलेशन चलाएं", kn: "ಅನುಕರಿಸಿ" },
  "No rain for 2 weeks": { hi: "अगले 2 सप्ताह तक बारिश नहीं", kn: "ಮುಂದಿನ 2 ವಾರ ಮಳೆ ಇಲ್ಲ" },
  "Heavy rain (100mm)": { hi: "100mm भारी बारिश (जलभराव)", kn: "100 ಮಿ.ಮೀ ಭಾರಿ ಮಳೆ" },
  "High temperature (40°C+)": { hi: "अत्यधिक तापमान (40°C+ लू)", kn: "ಅಧಿಕ ತಾಪಮಾನ (40°C+)" },
  "Water tank at 20%": { hi: "पानी का टैंक केवल 20% भरा", kn: "ನೀರಿನ ಟ್ಯಾಂಕ್ 20% ಮಾತ್ರ ಇದೆ" },
  "Irrigate all zones now": { hi: "सभी ज़ोन में तत्काल सिंचाई", kn: "ಎಲ್ಲಾ ವಲಯಗಳಿಗೆ ಈಗಲೇ ನೀರು" },
  "Delay irrigation by 3 days": { hi: "सिंचाई में 3 दिन की देरी", kn: "ನೀರಾವರಿ 3 ದಿನ ವಿಳಂಬ" },
  
  // Market & Buyers
  "Mandi Intelligence": { hi: "मंडी बाज़ार भाव", kn: "ಮಂಡಿ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ" },
  "Modal Price": { hi: "मॉडल भाव", kn: "ಸರಾಸರಿ ಧಾರಣೆ" },
  "Min Price": { hi: "न्यूनतम भाव", kn: "ಕನಿಷ್ಠ ಬೆಲೆ" },
  "Max Price": { hi: "अधिकतम भाव", kn: "ಗರಿಷ್ಠ ಬೆಲೆ" },
  "Distance": { hi: "दूरी", kn: "ದೂರ" },
  "Estimated Transport Cost": { hi: "अनुमानित परिवहन खर्च", kn: "ಸಾರಿಗೆ ವೆಚ್ಚ" },
  "Net Profit Index": { hi: "शुद्ध मुनाफा सूचकांक", kn: "ನಿವ್ವಳ ಲಾಭ ಸೂಚ್ಯಂಕ" },
  "Verified Direct Buyers": { hi: "सत्यापित थोक खरीदार", kn: "ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರು" },
  "Offered Price": { hi: "प्रस्तावित मूल्य", kn: "ನೀಡಿದ ಬೆಲೆ" },
  "Min Quantity": { hi: "न्यूनतम मात्रा", kn: "ಕನಿಷ್ಠ ಪ್ರಮಾಣ" },
  "Contact Buyer": { hi: "खरीदार से संपर्क करें", kn: "ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ" },
  
  // Reports & Analytics
  "Official Consolidated Master Report": { hi: "आधिकारिक समेकित मास्टर कृषि रिपोर्ट", kn: "ಅಧಿಕೃತ ಏಕೀಕೃತ ಮಾಸ್ಟರ್ ವರದಿ" },
  "Sync Latest Data": { hi: "ताज़ा डेटा सिंक करें", kn: "ಹೊಸ ದತ್ತಾಂಶ ಸಿಂಕ್ ಮಾಡಿ" },
  "Farm Operational Profile": { hi: "खेत परिचालन प्रोफ़ाइल", kn: "ಜಮೀನಿನ ಕಾರ್ಯಾಚರಣೆ ವಿವರ" },
  "Multi-Zone Digital Twin Telemetry": { hi: "मल्टी-ज़ोन डिजिटल ट्विन टेलीमेट्री", kn: "ಬಹು-ವಲಯ ಡಿಜಿಟಲ್ ಟ್ವಿನ್ ದತ್ತಾಂಶ" },
  "Soil Analysis Diagnostic Log": { hi: "मृदा विश्लेषण डायग्नोस्टिक लॉग", kn: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ ದಾಖಲೆ" },
  "Foliar Crop Health Monitoring": { hi: "फसल स्वास्थ्य एवं रोग निगरानी", kn: "ಬೆಳೆ ಆರೋಗ್ಯ ತಪಾಸಣೆ ದಾಖಲೆ" },
  "Smart Irrigation & Production Log": { hi: "स्मार्ट सिंचाई व फसल उत्पादन रिकॉर्ड", kn: "ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ಹಾಗೂ ಇಳುವರಿ ದಾಖಲೆ" },
  "Agro-Climatic Intelligence": { hi: "कृषि-जलवायु विश्लेषणात्मक खुफिया", kn: "ಕೃಷಿ-ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ" },
  "Recalculate": { hi: "पुनर्गणना करें", kn: "ಮರುಗಣನೆ ಮಾಡಿ" },
  "Save Analytics Report to DB": { hi: "विश्लेषण रिपोर्ट डेटाबेस में सहेजें", kn: "ವಿಶ್ಲೇಷಣಾ ವರದಿಯನ್ನು ಉಳಿಸಿ" },
  "Vigor Index": { hi: "ओज सूचकांक (Vigor)", kn: "ಬೆಳೆ ಚೈತನ್ಯ ಸೂಚ್ಯಂಕ" },
  "Water Efficiency": { hi: "जल दक्षता", kn: "ನೀರಿನ ದಕ್ಷತೆ" },
  "Projected Yield Delta": { hi: "अनुमानित उपज वृद्धि", kn: "ನಿರೀಕ್ಷಿತ ಇಳುವರಿ ಏರಿಕೆ" },
  "Water Conserved": { hi: "बचत किया गया पानी", kn: "ಉಳಿಸಿದ ನೀರು" },
  "Estimated Harvest Output": { hi: "अनुमानित कुल पैदावार", kn: "ಅಂದಾಜು ಒಟ್ಟು ಇಳುವರಿ" },
  
  // Voice & Assistant
  "Voice Assistant": { hi: "आवाज़ सहायक", kn: "ಧ್ವನಿ ಸಹಾಯಕ" },
  "Voice Mode": { hi: "आवाज़ मोड", kn: "ಧ್ವನಿ ಮೋಡ್" },
  "Tap to speak": { hi: "बोलने के लिए माइक दबाएं", kn: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ" },
  "Tap to speak question": { hi: "सवाल बोलने के लिए माइक दबाएं", kn: "ಪ್ರಶ್ನೆ ಕೇಳಲು ಮೈಕ್ ಒತ್ತಿ" },
  "Listening...": { hi: "सुन रहा हूँ...", kn: "ಆಲಿಸುತ್ತಿದೆ..." },
  "Speaking...": { hi: "बोल रहा हूँ...", kn: "ಮಾತನಾಡುತ್ತಿದೆ..." },
  "Stop Speaking": { hi: "बोलना बंद करें", kn: "ಮಾತನಾಡುವುದು ನಿಲ್ಲಿಸಿ" },
  "Stop Mic": { hi: "माइक बंद करें", kn: "ಮೈಕ್ ಆಫ್ ಮಾಡಿ" },
  "Gentle Female AI Voice": { hi: "मधुर AI आवाज़", kn: "ಸ್ಪಷ್ಟ AI ಧ್ವನಿ" },
  "Suggested Inquiries:": { hi: "सुझाए गए प्रश्न:", kn: "ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಶ್ನೆಗಳು:" },
  "Farmer Query": { hi: "किसान का प्रश्न", kn: "ಕೃಷಿಕರ ಪ್ರಶ್ನೆ" },
  "Send": { hi: "भेजें", kn: "ಕಳುಹಿಸಿ" },
  "Listen": { hi: "सुनें", kn: "ಆಲಿಸಿ" },
  "Stop": { hi: "रोकें", kn: "ನಿಲ್ಲಿಸಿ" },
  "Save": { hi: "सहेजें", kn: "ಉಳಿಸಿ" },
  "Cancel": { hi: "रद्द करें", kn: "ರದ್ದುಮಾಡಿ" },
  "Delete": { hi: "हटाएं", kn: "ಅಳಿಸಿ" },
  "Logout": { hi: "लॉग आउट", kn: "ಲಾಗ್ ಔಟ್" }
};

// Build reverse lookup maps for returning back to English
const REVERSE_LOOKUP: Record<string, string> = {};
Object.entries(TRANSLATIONS).forEach(([en, mapping]) => {
  REVERSE_LOOKUP[mapping.hi] = en;
  REVERSE_LOOKUP[mapping.kn] = en;
});

export default function LanguageAutoTranslator() {
  const { lang } = useApp();
  const observerRef = useRef<MutationObserver | null>(null);

  // Instant DOM-level TreeWalker translation
  const translateDOM = (targetLang: string) => {
    if (typeof window === "undefined" || !document.body) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (["script", "style", "noscript", "textarea", "input", "code"].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest("[data-no-translate]")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let currentNode: Node | null = walker.nextNode();
    while (currentNode) {
      const text = currentNode.nodeValue?.trim();
      if (text && text.length > 1) {
        if (targetLang === "en") {
          // Revert to English if previously translated
          if (REVERSE_LOOKUP[text]) {
            currentNode.nodeValue = currentNode.nodeValue!.replace(text, REVERSE_LOOKUP[text]);
          } else {
            // Check substrings
            for (const [native, en] of Object.entries(REVERSE_LOOKUP)) {
              if (text.includes(native)) {
                currentNode.nodeValue = currentNode.nodeValue!.replace(native, en);
              }
            }
          }
        } else {
          // Translate to Hindi or Kannada
          const dest = targetLang === "hi" ? "hi" : "kn";
          if (TRANSLATIONS[text] && TRANSLATIONS[text][dest]) {
            currentNode.nodeValue = currentNode.nodeValue!.replace(text, TRANSLATIONS[text][dest]);
          } else {
            // Check known exact phrases inside longer sentences
            for (const [en, dict] of Object.entries(TRANSLATIONS)) {
              if (text.includes(en) && dict[dest]) {
                currentNode.nodeValue = currentNode.nodeValue!.replace(en, dict[dest]);
              }
            }
          }
        }
      }
      currentNode = walker.nextNode();
    }
  };

  // Google Translate widget activation & cookie bridge
  const activateGoogleTranslate = (targetLang: string) => {
    if (typeof window === "undefined") return;

    try {
      const host = window.location.hostname;
      const val = targetLang === "en" ? "/en/en" : `/en/${targetLang}`;
      document.cookie = `googtrans=${val}; path=/; domain=${host}; max-age=31536000`;
      document.cookie = `googtrans=${val}; path=/; max-age=31536000`;

      // Trigger Google Translate combo box if present
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (select) {
        select.value = targetLang;
        select.dispatchEvent(new Event("change"));
      }
    } catch (e) {
      // Ignore cookie errors on restricted origins
    }
  };

  useEffect(() => {
    // 1. Instant zero-latency TreeWalker translation
    translateDOM(lang);
    activateGoogleTranslate(lang);

    // 2. Set document language attribute
    document.documentElement.lang = lang;

    // 3. MutationObserver to translate any newly mounted DOM components
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (lang !== "en") {
      let timeoutId: any = null;
      observerRef.current = new MutationObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          translateDOM(lang);
        }, 80);
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    // 4. Dispatch global custom event for components
    window.dispatchEvent(new CustomEvent("agrinex_lang_changed", { detail: { lang } }));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lang]);

  return (
    <>
      {/* Hidden Google Translate Mount Element */}
      <div id="google_translate_element" style={{ display: "none" }} />
      <style jsx global>{`
        .goog-te-banner-frame,
        .goog-te-balloon-frame,
        #goog-gt-tt,
        .goog-tooltip,
        .goog-tooltip:hover {
          display: none !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        .skiptranslate {
          display: none !important;
        }
        font {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
}
