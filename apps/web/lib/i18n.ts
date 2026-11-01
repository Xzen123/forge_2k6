/**
 * Multilingual UI translations for Civic Pulse.
 * Supports English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu.
 */

export type SupportedLanguage =
  | "en"
  | "hi"
  | "bn"
  | "ta"
  | "te"
  | "mr"
  | "gu"
  | "kn"
  | "ml"
  | "pa"
  | "or"
  | "ur";

export interface TranslationStrings {
  // Navigation & Pillars
  nav_title: string;
  pillar_1: string;
  pillar_2: string;
  pillar_3: string;
  pillar_4: string;
  twenty_two_langs: string;

  // Search & Inputs
  input_placeholder: string;
  check_eligibility: string;
  verifying: string;
  reset: string;
  try_live_queries: string;
  upload_circular: string;
  voice_input: string;

  // Live Agent Trace
  live_trace_title: string;
  steps_completed: string;

  // Attributes Sidebar
  extracted_attributes: string;
  live_session: string;
  state: string;
  category: string;
  annual_income: string;
  education_occ: string;
  gender: string;
  age: string;

  // Citations Sidebar
  statutory_citations: string;
  grounded_count: string;
  open_gazette: string;
  fetched: string;

  // Results & Verdicts
  evaluation_result: string;
  eligible_verified: string;
  whatsapp_brief: string;
  generating: string;
  listen_tts: string;
  stop_audio: string;
  synthesizing_audio: string;
  verified_claims_title: string;
  missing_info_needed: string;
  submit_answer: string;

  // Voice Explainer
  voice_explainer_title: string;
  voice_explainer_sub: string;
  spoken_script_label: string;
  play_voice: string;
  pause_voice: string;
  speed: string;
}

const EN_STRINGS: TranslationStrings = {
  nav_title: "Policy Explainer (Pillar 1)",
  pillar_1: "Pillar 1: Policy",
  pillar_2: "Pillar 2: SLA Triage",
  pillar_3: "Pillar 3: Agent",
  pillar_4: "Pillar 4: Forensics",
  twenty_two_langs: "22 Constitutional Languages",

  input_placeholder: "Type or speak your background (e.g. 22-year student in Bihar, income ₹2 Lakh)...",
  check_eligibility: "Check Eligibility",
  verifying: "Verifying...",
  reset: "Reset",
  try_live_queries: "Try live queries:",
  upload_circular: "Upload Circular",
  voice_input: "Voice",

  live_trace_title: "Live Agent Trace Execution",
  steps_completed: "steps completed",

  extracted_attributes: "EXTRACTED ATTRIBUTES",
  live_session: "Live Session",
  state: "State",
  category: "Category",
  annual_income: "Annual Income",
  education_occ: "Education / Work",
  gender: "Gender",
  age: "Age",

  statutory_citations: "LIVE STATUTORY CITATIONS",
  grounded_count: "Grounded",
  open_gazette: "Open Gazette",
  fetched: "Fetched",

  evaluation_result: "Evaluation Result",
  eligible_verified: "Eligible (Verified)",
  whatsapp_brief: "WhatsApp Brief",
  generating: "Generating...",
  listen_tts: "Listen (Sarvam AI)",
  stop_audio: "Stop Audio",
  synthesizing_audio: "Synthesizing...",
  verified_claims_title: "Statutory Verified Claims",
  missing_info_needed: "Missing Statutory Information Needed:",
  submit_answer: "Submit Answer",

  voice_explainer_title: "Regional Voice Explainer",
  voice_explainer_sub: "Plain-language natural neural speech synthesized without bureaucratic jargon",
  spoken_script_label: "Spoken Solution Script",
  play_voice: "Play Sarvam Voice",
  pause_voice: "Pause Audio",
  speed: "Speed",
};

const HI_STRINGS: TranslationStrings = {
  nav_title: "नीति एवं योजना व्याख्याता (स्तंभ 1)",
  pillar_1: "स्तंभ 1: नीति एवं योजना",
  pillar_2: "स्तंभ 2: शिकायत एवं निवारण",
  pillar_3: "स्तंभ 3: स्वायत्त एजेंट",
  pillar_4: "स्तंभ 4: सत्यता सत्यापन",
  twenty_two_langs: "22 संवैधानिक भाषाएं",

  input_placeholder: "अपनी स्थिति लिखें या बोलें (उदा. बिहार में 22 वर्षीय छात्र, वार्षिक आय ₹2 लाख)...",
  check_eligibility: "पात्रता जांचें",
  verifying: "सत्यापित हो रहा है...",
  reset: "रीसेट",
  try_live_queries: "लाइव प्रश्न आजमाएं:",
  upload_circular: "परिपत्र अपलोड करें",
  voice_input: "आवाज",

  live_trace_title: "लाइव एजेंट निष्पादन ट्रेस",
  steps_completed: "चरण पूर्ण हुए",

  extracted_attributes: "निकाले गए नागरिक विवरण",
  live_session: "लाइव सत्र",
  state: "राज्य",
  category: "श्रेणी / वर्ग",
  annual_income: "वार्षिक पारिवारिक आय",
  education_occ: "शिक्षा / कार्यक्षेत्र",
  gender: "लिंग",
  age: "उम्र",

  statutory_citations: "आधिकारिक गजट एवं कानूनी संदर्भ",
  grounded_count: "प्रमाणित संदर्भ",
  open_gazette: "गजट खोलें",
  fetched: "प्राप्त किया",

  evaluation_result: "मूल्यांकन परिणाम",
  eligible_verified: "पात्र (सत्यापित)",
  whatsapp_brief: "व्हाट्सएप सारांश",
  generating: "तैयार हो रहा है...",
  listen_tts: "ऑडियो सुनें (सर्वम एआई)",
  stop_audio: "ऑडियो रोकें",
  synthesizing_audio: "आवाज तैयार हो रही है...",
  verified_claims_title: "सत्यापित कानूनी दावे एवं अधिकार",
  missing_info_needed: "आवश्यक सांविधिक जानकारी दर्ज करें:",
  submit_answer: "उत्तर जमा करें",

  voice_explainer_title: "क्षेत्रीय वाणी व्याख्याता (Sarvam AI)",
  voice_explainer_sub: "बिना किसी सरकारी उलझन के सरल क्षेत्रीय भाषा में न्यूरल आवाज",
  spoken_script_label: "बोला जाने वाला समाधान सारांश",
  play_voice: "ऑडियो चलाएं",
  pause_voice: "रोकें",
  speed: "गति",
};

const BN_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "নীতি ও সরকারি প্রকল্প নির্দেশিকা (স্তম্ভ ১)",
  pillar_1: "স্তম্ভ ১: প্রকল্প ও নীতি",
  pillar_2: "স্তম্ভ ২: অভিযোগ নিষ্পত্তি",
  pillar_3: "স্তম্ভ ৩: ডিজিটাল এজেন্ট",
  pillar_4: "স্তম্ভ ৪: সত্যতা যাচাই",
  twenty_two_langs: "২২টি সাংবিধানিক ভাষা",

  input_placeholder: "আপনার বিবরণ লিখুন বা বলুন (যেমন: বাংলায় ২২ বছরের পড়ুয়া, আয় ২ লক্ষ টাকা)...",
  check_eligibility: "যোগ্যতা যাচাই করুন",
  verifying: "যাচাই করা হচ্ছে...",
  reset: "রিসেট",
  try_live_queries: "জনপ্রিয় প্রশ্ন:",
  upload_circular: "বিজ্ঞপ্তি আপলোড",
  voice_input: "ভয়েস",

  extracted_attributes: "নাগরিকের তথ্যাবলী",
  state: "রাজ্য",
  category: "শ্রেণী",
  annual_income: "বার্ষিক পারিবারিক আয়",
  education_occ: "শিক্ষা / পেশা",
  gender: "লিঙ্গ",
  age: "বয়স",

  statutory_citations: "সরকারি গ্যাজেট ও সূত্র",
  open_gazette: "গ্যাজেট দেখুন",
  evaluation_result: "মূল্যায়ন ফলাফল",
  eligible_verified: "যোগ্য (প্রমাণিত)",
  whatsapp_brief: "হোয়াটসঅ্যাপ ব্রিফ",
  listen_tts: "অডিও শুনুন (সর্বম এআই)",
  stop_audio: "বন্ধ করুন",
  synthesizing_audio: "প্রস্তুত হচ্ছে...",
  verified_claims_title: "আইনসম্মত নিশ্চিত অধিকার",
  voice_explainer_title: "মাতৃভাষায় অডিও নির্দেশিকা",
  spoken_script_label: "কথ্য সমাধান বিবরণী",
  play_voice: "অডিও শুনুন",
  pause_voice: "থামুন",
};

const TA_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "அரசு நலத்திட்ட வழிகாட்டி (தூண் 1)",
  pillar_1: "தூண் 1: திட்டங்கள்",
  pillar_2: "தூண் 2: குறைதீர்ப்பு",
  pillar_3: "தூண் 3: தானியங்கி முகவர்",
  pillar_4: "தூண் 4: உண்மை சரிபார்ப்பு",
  twenty_two_langs: "22 அரசியலமைப்பு மொழிகள்",

  input_placeholder: "உங்கள் நிலையை தட்டச்சு செய்யவும் அல்லது பேசவும்...",
  check_eligibility: "தகுதி சரிபார்க்கவும்",
  verifying: "சரிபார்க்கிறது...",
  reset: "மீட்டமை",
  try_live_queries: "மாதிரி கேள்விகள்:",
  upload_circular: "சுற்றறிக்கை பதிவேற்றுக",
  voice_input: "குரல்",

  extracted_attributes: "பிரித்தெடுக்கப்பட்ட விவரங்கள்",
  state: "மாநிலம்",
  category: "பிரிவு",
  annual_income: "ஆண்டு வருமானம்",
  education_occ: "கல்வி / தொழில்",
  gender: "பாலினம்",
  age: "வயது",

  statutory_citations: "அரசாணை மற்றும் சான்றுகள்",
  open_gazette: "அரசாணை பார்க்க",
  evaluation_result: "மதிப்பீட்டு முடிவு",
  eligible_verified: "தகுதியானவர் (சரிபார்க்கப்பட்டது)",
  whatsapp_brief: "வாட்ஸ்அப் அட்டை",
  listen_tts: "ஆடியோ கேட்க (Sarvam AI)",
  stop_audio: "நிறுத்து",
  synthesizing_audio: "உருவாக்குகிறது...",
  verified_claims_title: "சட்டப்பூர்வ உரிமைகள்",
  voice_explainer_title: "பிராந்திய குரல் வழிகாட்டி",
  spoken_script_label: "பேசப்படும் தீர்வு உரை",
  play_voice: "குரலைக் கேள்",
  pause_voice: "இடைநிறுத்து",
};

const TE_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "ప్రభుత్వ సంక్షేమ పథకాల వివరణకర్త (స్తంభం 1)",
  pillar_1: "స్తంభం 1: పథకాలు",
  pillar_2: "స్తంభం 2: పరిష్కారం",
  pillar_3: "స్తంభం 3: ఏజెంట్",
  pillar_4: "స్తంభం 4: నిర్ధారణ",
  twenty_two_langs: "22 రాజ్యాంగ భాషలు",

  input_placeholder: "మీ వివరాలను టైప్ చేయండి లేదా మాట్లాడండి...",
  check_eligibility: "అర్హతను తనిఖీ చేయండి",
  verifying: "ధృవీకరిస్తోంది...",
  reset: "రీసెట్",
  try_live_queries: "ప్రశ్నల ఉదాహరణలు:",

  extracted_attributes: "గుర్తించిన పౌర వివరాలు",
  state: "రాష్ట్రం",
  category: "వర్గం",
  annual_income: "వార్షిక ఆదాయం",
  education_occ: "విద్య / వృత్తి",
  gender: "లింగం",
  age: "వయస్సు",

  statutory_citations: "అధికారిక గెజిట్ సూచనలు",
  open_gazette: "గెజిట్ తెరవండి",
  evaluation_result: "ఫలితం",
  eligible_verified: "అర్హులు (ధృవీకరించబడింది)",
  whatsapp_brief: "వాట్సాప్ కార్డ్",
  listen_tts: "ఆడియో వినండి (Sarvam AI)",
  stop_audio: "ఆపు",
  synthesizing_audio: "సిద్ధమవుతోంది...",
  verified_claims_title: "చట్టబద్ధమైన హక్కులు",
  voice_explainer_title: "ప్రాంతీయ వాయిస్ వివరణ",
  spoken_script_label: "పరిష్కార సారాంశం",
  play_voice: "ఆడియో ప్లే చేయండి",
  pause_voice: "ఆపు",
};

const MR_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "शासकीय योजना व धोरण मार्गदर्शक (स्तंभ १)",
  pillar_1: "स्तंभ १: योजना व धोरण",
  pillar_2: "स्तंभ २: तक्रार निवारण",
  pillar_3: "स्तंभ ३: डिजिटल एजंट",
  pillar_4: "स्तंभ ४: सत्यता पडताळणी",
  twenty_two_langs: "२२ घटनात्मक भाषा",

  input_placeholder: "तुमची माहिती टाइप करा किंवा बोला (उदा. महाराष्ट्रातील विद्यार्थी)...",
  check_eligibility: "पात्रता तपासा",
  verifying: "पडताळणी सुरू आहे...",
  reset: "रीसेट",
  try_live_queries: "उदाहरणे:",

  extracted_attributes: "नागरिक तपशील",
  state: "राज्य",
  category: "प्रवर्ग",
  annual_income: "वार्षिक उत्पन्न",
  education_occ: "शिक्षण / व्यवसाय",
  gender: "लिंग",
  age: "वय",

  statutory_citations: "शासकीय राजपत्र व संदर्भ",
  open_gazette: "राजपत्र उघडा",
  evaluation_result: "मूल्यांकन निकाल",
  eligible_verified: "पात्र (सत्यापित)",
  whatsapp_brief: "व्हॉट्सॲप सारांश",
  listen_tts: "ऑडिओ ऐका (Sarvam AI)",
  stop_audio: "थांबवा",
  synthesizing_audio: "तयार होत आहे...",
  verified_claims_title: "कायदेशीर हक्क व लाभ",
  voice_explainer_title: "प्रादेशिक आवाज मार्गदर्शक",
  spoken_script_label: "थेट उपाय सारांश",
  play_voice: "आवाज सुरू करा",
  pause_voice: "थांबवा",
};

const GU_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "સરકારી યોજના અને અધિકાર માર્ગદર્શક (સ્તંભ ૧)",
  pillar_1: "સ્તંભ ૧: યોજનાઓ",
  pillar_2: "સ્તંભ ૨: ફરિયાદ નિવારણ",
  pillar_3: "સ્તંભ ૩: સ્વાયત્ત એજન્ટ",
  pillar_4: "સ્તંભ ૪: સત્યતા ચકાસણી",
  twenty_two_langs: "૨૨ બંધારણીય ભાષાઓ",

  input_placeholder: "તમારી વિગત લખો અથવા બોલો...",
  check_eligibility: "પાત્રતા ચકાસો",
  verifying: "ચકાસણી ચાલુ છે...",
  reset: "રીસેટ",

  extracted_attributes: "નાગરિક વિગતો",
  state: "રાજ્ય",
  category: "વર્ગ",
  annual_income: "વાર્ષિક આવક",
  education_occ: "શિક્ષણ / વ્યવસાય",
  gender: "જાતિ",
  age: "ઉંમર",

  statutory_citations: "સત્તાવાર ગેઝેટ અને સંદર્ભ",
  open_gazette: "ગેઝેટ જુઓ",
  evaluation_result: "પરિણામ",
  eligible_verified: "પાત્ર (ચકાસાયેલ)",
  whatsapp_brief: "વોટ્સએપ કાર્ડ",
  listen_tts: "ઓડિયો સાંભળો (Sarvam AI)",
  stop_audio: "બંધ કરો",
  synthesizing_audio: "તૈયાર થઈ રહ્યું છે...",
  verified_claims_title: "કાયદેસર માન્ય અધિકારો",
  voice_explainer_title: "પ્રાદેશિક અવાજ માર્ગદર્શિકા",
  spoken_script_label: "બોલાયેલ ઉપાય સારાંશ",
  play_voice: "અવાજ સાંભળો",
  pause_voice: "અટકાવો",
};

const KN_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "ಸರ್ಕಾರಿ ಯೋಜನೆ ಮತ್ತು ನೀತಿ ಮಾರ್ಗದರ್ಶಿ (ಸ್ತಂಭ 1)",
  pillar_1: "ಸ್ತಂಭ 1: ಯೋಜನೆಗಳು",
  pillar_2: "ಸ್ತಂಭ 2: ಪರಿಹಾರ ವೇದಿಕೆ",
  pillar_3: "ಸ್ತಂಭ 3: ಡಿಜಿಟಲ್ ಏಜೆಂಟ್",
  pillar_4: "ಸ್ತಂಭ 4: ಸತ್ಯ ಪರಿಶೀಲನೆ",
  twenty_two_langs: "22 ಸಾಂವಿಧಾನಿಕ ಭಾಷೆಗಳು",
  input_placeholder: "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ ಅಥವಾ ಮಾತನಾಡಿ (ಉದಾ: ಕರ್ನಾಟಕದಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿ)...",
  check_eligibility: "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
  verifying: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
  reset: "ಮರುಹೊಂದಿಸಿ",
  extracted_attributes: "ನಾಗರಿಕ ವಿವರಗಳು",
  state: "ರಾಜ್ಯ",
  category: "ವರ್ಗ",
  annual_income: "ವಾರ್ಷಿಕ ಆದಾಯ",
  education_occ: "ಶಿಕ್ಷಣ / ಉದ್ಯೋಗ",
  gender: "ಲಿಂಗ",
  age: "ವಯಸ್ಸು",
  statutory_citations: "ಅಧಿಕೃತ ಗೆಜೆಟ್ ಉಲ್ಲೇಖಗಳು",
  evaluation_result: "ಮೌಲ್ಯಮಾಪನ ಫಲಿತಾಂಶ",
  eligible_verified: "ಅರ್ಹತೆ ದೃಢಪಟ್ಟಿದೆ",
  whatsapp_brief: "ವಾಟ್ಸಾಪ್ ಸಾರಾಂಶ",
  voice_explainer_title: "ಪ್ರಾದೇಶಿಕ ಧ್ವನಿ ವಿವರಣೆ (Sarvam AI)",
  spoken_script_label: "ಪರಿಹಾರ ಧ್ವನಿ ವಿವರಣೆ",
  play_voice: "ಧ್ವನಿ ಕೇಳಿ",
  pause_voice: "ವಿರಾಮ",
};

const ML_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "സർക്കാർ പദ്ധതിയും നയ നിർദേശവും (സ്തംഭം 1)",
  pillar_1: "സ്തംഭം 1: പദ്ധതികൾ",
  pillar_2: "സ്തംഭം 2: പരിഹാര വേദി",
  pillar_3: "സ്തംഭം 3: ഡിജിറ്റൽ ഏജന്റ്",
  pillar_4: "സ്തംഭം 4: സത്യ പരിശോധന",
  twenty_two_langs: "22 ഭരണഘടനാ ഭാഷകൾ",
  input_placeholder: "നിങ്ങളുടെ വിവരങ്ങൾ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ പറയുക...",
  check_eligibility: "അർഹത പരിശോധിക്കുക",
  verifying: "പരിശോധിക്കുന്നു...",
  reset: "റീസെറ്റ്",
  extracted_attributes: "പൗര വിവരങ്ങൾ",
  state: "സംസ്ഥാനം",
  category: "വിഭാഗം",
  annual_income: "വാർഷിക വരുമാനം",
  education_occ: "വിദ്യാഭ്യാസം / ജോലി",
  gender: "ലിംഗം",
  age: "പ്രായം",
  statutory_citations: "ഔദ്യോഗിക ഗസറ്റ് റഫറൻസുകൾ",
  evaluation_result: "മൂല്യനിർണ്ണയ ഫലം",
  eligible_verified: "അർഹത തെളിയിക്കപ്പെട്ടു",
  whatsapp_brief: "വാട്ട്സ്ആപ്പ് സംഗ്രഹം",
  voice_explainer_title: "പ്രാദേശിക ശബ്ദ വിവരണം (Sarvam AI)",
  spoken_script_label: "പരിഹാര ശബ്ദ വിവരണം",
  play_voice: "ശബ്ദം കേൾക്കുക",
  pause_voice: "നിർത്തുക",
};

const PA_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "ਸਰਕਾਰੀ ਸਕੀਮ ਅਤੇ ਨੀਤੀ ਗਾਈਡ (ਥੰਮ੍ਹ 1)",
  pillar_1: "ਥੰਮ੍ਹ 1: ਸਕੀਮਾਂ",
  pillar_2: "ਥੰਮ੍ਹ 2: ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਣ",
  pillar_3: "ਥੰਮ੍ਹ 3: ਡਿਜੀਟਲ ਏਜੰਟ",
  pillar_4: "ਥੰਮ੍ਹ 4: ਸੱਚਾਈ ਪੜਤਾਲ",
  twenty_two_langs: "22 ਸੰਵਿਧਾਨਕ ਭਾਸ਼ਾਵਾਂ",
  input_placeholder: "ਆਪਣਾ ਵੇਰਵਾ ਲਿਖੋ ਜਾਂ ਬੋਲੋ...",
  check_eligibility: "ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਕਰੋ",
  verifying: "ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...",
  reset: "ਰੀਸੈੱਟ",
  extracted_attributes: "ਨਾਗਰਿਕ ਵੇਰਵੇ",
  state: "ਰਾਜ",
  category: "ਸ਼੍ਰੇਣੀ",
  annual_income: "ਸਾਲਾਨਾ ਆਮਦਨ",
  education_occ: "ਸਿੱਖਿਆ / ਕੰਮ",
  gender: "ਲਿੰਗ",
  age: "ਉਮਰ",
  statutory_citations: "ਅਧਿਕਾਰਤ ਗਜ਼ਟ ਹਵਾਲੇ",
  evaluation_result: "ਨਤੀਜਾ",
  eligible_verified: "ਯੋਗ (ਤਸਦੀਕਸ਼ੁਦਾ)",
  whatsapp_brief: "ਵਟਸਐਪ ਸੰਖੇਪ",
  voice_explainer_title: "ਖੇਤਰੀ ਆਵਾਜ਼ ਗਾਈਡ (Sarvam AI)",
  spoken_script_label: "ਹੱਲ ਵੌਇਸ ਸਕ੍ਰਿਪਟ",
  play_voice: "ਆਵਾਜ਼ ਚਲਾਓ",
  pause_voice: "ਰੋਕੋ",
};

const OR_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "ସରକାରୀ ଯୋଜନା ଓ ନୀତି ନିର୍ଦ୍ଦେଶିକା (ସ୍ତମ୍ଭ ୧)",
  pillar_1: "ସ୍ତମ୍ଭ ୧: ଯୋଜନା",
  pillar_2: "ସ୍ତମ୍ଭ ୨: ଅଭିଯୋଗ ସମାଧାନ",
  pillar_3: "ସ୍ତମ୍ଭ ୩: ଡିଜିଟାଲ ଏଜେଣ୍ଟ",
  pillar_4: "ସ୍ତମ୍ଭ ୪: ସତ୍ୟ ଯାଞ୍ଚ",
  twenty_two_langs: "୨୨ ସମ୍ବିଧାନିକ ଭାଷା",
  input_placeholder: "ଆପଣଙ୍କ ବିବରଣୀ ଲେଖନ୍ତୁ କିମ୍ବା କୁହନ୍ତୁ...",
  check_eligibility: "ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରନ୍ତୁ",
  verifying: "ଯାଞ୍ଚ ଚାଲିଛି...",
  reset: "ପୁନଃସେଟ୍",
  extracted_attributes: "ନାଗରିକ ବିବରଣୀ",
  state: "ରାଜ୍ୟ",
  category: "ବର୍ଗ",
  annual_income: "ବାର୍ଷିକ ଆୟ",
  education_occ: "ଶିକ୍ଷା / ପେଶା",
  gender: "ଲିଙ୍ଗ",
  age: "ବୟସ",
  statutory_citations: "ସରକାରୀ ଗେଜେଟ ସନ୍ଦର୍ଭ",
  evaluation_result: "ଫଳାଫଳ",
  eligible_verified: "ଯୋଗ୍ୟ (ପ୍ରମାଣିତ)",
  whatsapp_brief: "ହ୍ୱାଟ୍ସଆପ୍ ସାରାଂଶ",
  voice_explainer_title: "ଆଞ୍ଚଳିକ ଧ୍ୱନି ନିର୍ଦ୍ଦେଶିକା (Sarvam AI)",
  spoken_script_label: "ସମାଧାନ ଧ୍ୱନି ସ୍କ୍ରିପ୍ଟ",
  play_voice: "ଅଡିଓ ଶୁଣନ୍ତୁ",
  pause_voice: "ବନ୍ଦ କରନ୍ତୁ",
};

const AS_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "চৰকাৰী আঁচনি আৰু নীতি নিৰ্দেশিকা (স্তম্ভ ১)",
  pillar_1: "স্তম্ভ ১: আঁচনিসমূহ",
  pillar_2: "স্তম্ভ ২: অভিযোগ নিষ্পত্তি",
  pillar_3: "স্তম্ভ ৩: ডিজিটেল এজেণ্ট",
  pillar_4: "স্তম্ভ ৪: সত্যতা পৰীক্ষণ",
  twenty_two_langs: "২২টা সাংবিধানিক ভাষা",
  input_placeholder: "আপোনাৰ তথ্য লিখক বা কওক...",
  check_eligibility: "যোগ্যতা পৰীক্ষা কৰক",
  verifying: "পৰীক্ষা কৰি থকা হৈছে...",
  reset: "ৰিছেট",
  extracted_attributes: "নাগৰিকৰ তথ্য",
  state: "ৰাজ্য",
  category: "শ্ৰেণী",
  annual_income: "বাৰ্ষিক আয়",
  education_occ: "শিক্ষা / বৃত্তি",
  gender: "লিংগ",
  age: "বয়স",
  statutory_citations: "চৰকাৰী গেজেট প্ৰসংগ",
  evaluation_result: "ফলাফল",
  eligible_verified: "যোগ্য (প্ৰমাণিত)",
  whatsapp_brief: "হোৱাটছএপ চমু বিৱৰণ",
  voice_explainer_title: "আঞ্চলিক কণ্ঠ নিৰ্দেশিকা (Sarvam AI)",
  spoken_script_label: "সমাধান কণ্ঠ চিত্ৰনাট্য",
  play_voice: "কণ্ঠ শুনক",
  pause_voice: "ৰখাওক",
};

const UR_STRINGS: TranslationStrings = {
  ...HI_STRINGS,
  nav_title: "سرکاری اسکیم اور پالیسی گائیڈ (ستون 1)",
  pillar_1: "ستون 1: اسکیمیں",
  pillar_2: "ستون 2: شکایات کا ازالہ",
  pillar_3: "ستون 3: ڈیجیٹل ایجنٹ",
  pillar_4: "ستون 4: سچائی کی تصدیق",
  twenty_two_langs: "22 آئینی زبانیں",
  input_placeholder: "اپنی تفصیل درج کریں یا بولیں...",
  check_eligibility: "اہلیت چیک کریں",
  verifying: "تصدیق ہو رہی ہے...",
  reset: "ری سیٹ",
  extracted_attributes: "شہری تفصیلات",
  state: "ریاست",
  category: "زمرہ",
  annual_income: "سالانہ آمدنی",
  education_occ: "تعلیم / پیشہ",
  gender: "جنس",
  age: "عمر",
  statutory_citations: "سرکاری گزٹ حوالہ جات",
  evaluation_result: "نتیجہ",
  eligible_verified: "اہل (تصدیق شدہ)",
  whatsapp_brief: "واٹس ایپ خلاصہ",
  voice_explainer_title: "علاقائی آواز رہنمائی (Sarvam AI)",
  spoken_script_label: "حل شدہ صوتی سکرپٹ",
  play_voice: "آواز سنیں",
  pause_voice: "روکیں",
};

const TRANSLATIONS: Record<string, TranslationStrings> = {
  en: EN_STRINGS,
  hi: HI_STRINGS,
  bn: BN_STRINGS,
  ta: TA_STRINGS,
  te: TE_STRINGS,
  mr: MR_STRINGS,
  gu: GU_STRINGS,
  kn: KN_STRINGS,
  ml: ML_STRINGS,
  pa: PA_STRINGS,
  or: OR_STRINGS,
  as: AS_STRINGS,
  ur: UR_STRINGS,
  mai: { ...HI_STRINGS, nav_title: "नीति एवं योजना व्याख्याता (मैथिली)", twenty_two_langs: "२२ संवैधानिक भाषा" },
  ne: { ...HI_STRINGS, nav_title: "नीति तथा सरकारी योजना मार्गदर्शक (नेपाली)", twenty_two_langs: "२२ संवैधानिक भाषाहरू" },
  kok: { ...MR_STRINGS, nav_title: "सरकारी येवजण आनी धोरण मार्गदर्शक (कोंकणी)", twenty_two_langs: "२२ संविधाक भासो" },
  ks: { ...UR_STRINGS, nav_title: "کٲشُر سکیم رہنمائی", twenty_two_langs: "22 آئینی زبانیں" },
};

export function getTranslation(langCode: string): TranslationStrings {
  const code = (langCode || "en").toLowerCase();
  const prefix = code.slice(0, 2);
  return (
    TRANSLATIONS[code] ||
    TRANSLATIONS[prefix] ||
    TRANSLATIONS["hi"] ||
    EN_STRINGS
  );
}

