"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Check, Globe } from "lucide-react";
import { RegionalFolkCard, FolkArtType, FolkSvgDefs } from "@/components/ui/RegionalFolkCard";
import { detectUserLocation, getRecommendedLanguageForState } from "@/lib/location";

export interface Language {
  code: string;
  native: string;
  english: string;
  script: string;
  heading: string;
  subheading: string;
}

export interface Profession {
  id: FolkArtType;
  nativeTitle: string;
  englishTitle: string;
  description: string;
  schemePill: string;
  artType: FolkArtType;
}

export interface CitizenProfile {
  languageCode: string;
  languageNative: string;
  languageEnglish: string;
  profession: string;
  onboardedAt: number;
}

/**
 * All 22 Languages of the Eighth Schedule to the Constitution of India
 * with localized vernacular headings for Step 2 persona selection
 */
export const SCHEDULED_LANGUAGES: Language[] = [
  {
    code: "hi",
    native: "हिंदी",
    english: "Hindi",
    script: "देवनागरी",
    heading: "अपना मुख्य कार्यक्षेत्र / पेशा चुनें",
    subheading: "आपके व्यवसाय के अनुसार सटीक सरकारी योजनाएं और लाभ प्रदर्शित किए जाएंगे।",
  },
  {
    code: "bn",
    native: "বাংলা",
    english: "Bengali",
    script: "বাংলা",
    heading: "আপনার প্রধান পেশা নির্বাচন করুন",
    subheading: "আপনার জীবিকা অনুযায়ী সরকারি প্রকল্প এবং অনুদানের তালিকা প্রদর্শিত হবে।",
  },
  {
    code: "te",
    native: "తెలుగు",
    english: "Telugu",
    script: "తెలుగు",
    heading: "మీ ప్రధాన వృత్తిని ఎంచుకోండి",
    subheading: "మీ జీవనోపాధికి సంబంధించిన చట్టబద్ధమైన సంక్షేమ పథకాలను పొందండి.",
  },
  {
    code: "mr",
    native: "मराठी",
    english: "Marathi",
    script: "देवनागरी",
    heading: "तुमचा मुख्य व्यवसाय निवडा",
    subheading: "तुमच्या उपजीविकेनुसार थेट शासकीय योजना आणि हक्कांची माहिती मिळवा.",
  },
  {
    code: "ta",
    native: "தமிழ்",
    english: "Tamil",
    script: "தமிழ்",
    heading: "உங்கள் முதன்மை தொழிலைத் தேர்ந்தெடுக்கவும்",
    subheading: "உங்கள் வாழ்வாதாரத்திற்கான அதிகாரப்பூர்வ அரசு நலத்திட்டங்களை அறியவும்.",
  },
  {
    code: "ur",
    native: "اردو",
    english: "Urdu",
    script: "اردو",
    heading: "اپنا بنیادی پیشہ منتخب کریں",
    subheading: "اپنے شعبے کے مطابق مستند سرکاری فلاحی اسکیموں تک رسائی حاصل کریں۔",
  },
  {
    code: "gu",
    native: "ગુજરાતી",
    english: "Gujarati",
    script: "ગુજરાતી",
    heading: "તમારો મુખ્ય વ્યવસાય પસંદ કરો",
    subheading: "તમારી આજીવિકા મુજબ સત્તાવાર સરકારી સહાય અને યોજનાઓ મેળવો.",
  },
  {
    code: "kn",
    native: "ಕನ್ನಡ",
    english: "Kannada",
    script: "ಕನ್ನಡ",
    heading: "ನಿಮ್ಮ ಪ್ರಮುಖ ವೃತ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    subheading: "ನಿಮ್ಮ ಕಸುಬಿಗೆ ತಕ್ಕಂತೆ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಸವಲತ್ತುಗಳು ಮತ್ತು ಯೋಜನೆಗಳು.",
  },
  {
    code: "ml",
    native: "മലയാളം",
    english: "Malayalam",
    script: "മലയാളം",
    heading: "നിങ്ങളുടെ പ്രധാന തൊഴിൽ തിരഞ്ഞെടുക്കുക",
    subheading: "നിങ്ങളുടെ ഉപജീവനവുമായി ബന്ധപ്പെട്ട സർക്കാർ ക്ഷേമപദ്ധതികൾ അറിയുക.",
  },
  {
    code: "or",
    native: "ଓଡ଼ିଆ",
    english: "Odia",
    script: "ଓଡ଼ିଆ",
    heading: "ଆପଣଙ୍କର ମୁଖ୍ୟ ବୃତ୍ତି ବାଛନ୍ତୁ",
    subheading: "ଆପଣଙ୍କ ଜୀବିକା ଅନୁସାରେ ସରକାରୀ ଯୋଜନା ଓ ସୁବିଧା ବିଷୟରେ ଜାଣନ୍ତୁ।",
  },
  {
    code: "pa",
    native: "ਪੰਜਾਬੀ",
    english: "Punjabi",
    script: "ਗੁਰਮੁਖੀ",
    heading: "ਆਪਣਾ ਮੁੱਖ ਪੇਸ਼ਾ ਚੁਣੋ",
    subheading: "ਤੁਹਾਡੇ ਕਾਰੋਬਾਰ ਅਨੁਸਾਰ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਭਲਾਈ ਸਕੀਮਾਂ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।",
  },
  {
    code: "as",
    native: "অসমীয়া",
    english: "Assamese",
    script: "অসমীয়া",
    heading: "আপোনাৰ মূল বৃত্তি বাছনি কৰক",
    subheading: "আপোনাৰ জীৱিকা অনুসৰি প্ৰাসঙ্গিক চৰকাৰী আঁচনিসমূহ বিচাৰি লওক।",
  },
  {
    code: "mai",
    native: "मैथिली",
    english: "Maithili",
    script: "मिथिलाक्षर / देवनागरी",
    heading: "अपना मुख्य काज / पेशा चुनु",
    subheading: "अहाँक जीविकोपार्जन हेतु सरकारी योजना आ अधिकारक जानकारी।",
  },
  {
    code: "sat",
    native: "ᱥᱟᱱᱛᱟᱲᱤ",
    english: "Santali",
    script: " Ol Chiki",
    heading: "ᱟᱢᱟᱜ ᱢᱩᱬᱩᱛ ᱠᱟᱹᱢᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ",
    subheading: "ᱟᱢᱟᱜ ᱟᱹᱥᱩᱞ ᱞᱟᱹᱜᱤᱫ ᱥᱚᱨᱠᱟᱨᱤ ᱟᱹᱭᱫᱟᱹᱨᱤ ᱟᱨ ᱜᱚᱲᱚ ᱡᱚᱡᱚᱱᱟ.",
  },
  {
    code: "ks",
    native: "کٲشُر",
    english: "Kashmiri",
    script: "نستعلیق",
    heading: "پَنُن بُنیٲدی پِیشہٕ ژارِو",
    subheading: "پَننِس کٲم-کاجَس مُطٲبِق سرکٲری فلاحی سکیٖمَن ہُنٛد حِساب لٔگِو.",
  },
  {
    code: "ne",
    native: "नेपाली",
    english: "Nepali",
    script: "देवनागरी",
    heading: "आफ्नो मुख्य पेशा चयन गर्नुहोस्",
    subheading: "तपाईंको जीविकोपार्जन अनुसार सरकारी योजना र सुविधाहरू।",
  },
  {
    code: "kok",
    native: "कोंकणी",
    english: "Konkani",
    script: "देवनागरी",
    heading: "तुमचो मुखेल वेवसाय वेंचून काढा",
    subheading: "तुमच्या उपजीविके खातीर सरकारी येवजण्यो आनी लाभांची म्हायती.",
  },
  {
    code: "sd",
    native: "سنڌي",
    english: "Sindhi",
    script: "عربي-سنڌي",
    heading: "پنهنجو مکيه پيشو چونڊيو",
    subheading: "پنهنجي گذر سفر مطابق سرڪاري سهولتن ۽ اسڪيمن جي ڄاڻ وٺو.",
  },
  {
    code: "doi",
    native: "डोगरी",
    english: "Dogri",
    script: "देवनागरी",
    heading: "अपना मुक्ख पेशा चुनो",
    subheading: "तुंदी आजीविका मुताबरक सरकारी योजनाएं ते हक्कें दी जानकारी.",
  },
  {
    code: "mni",
    native: "মৈতৈলোন্",
    english: "Manipuri",
    script: "মৈতৈ মায়েক",
    heading: "নহাক্কী মরুওইবা থবক খল্লু",
    subheading: "নহাক্কী পুন্সি হিংনবগীদমক চুনবা সরকারগী কান্নবা থৌরাং খঙবীয়ু.",
  },
  {
    code: "brx",
    native: "बड़ो",
    english: "Bodo",
    script: "देवनागरी",
    heading: "नोंथांनि गाहाय हाबिलाखौ सायख'",
    subheading: "नोंथांनि जिविउ मोननायनि सरकारि आंसोलफोर आरो हेफाजाबनि खोथा.",
  },
  {
    code: "sa",
    native: "संस्कृतम्",
    english: "Sanskrit",
    script: "देवनागरी",
    heading: "स्वकीय-मुख्य-व्यवसायं चिनोतु",
    subheading: "भवतः आजीविकानुगुणं सर्वकारस्य कल्याणकारी-योजनानाम् अवगमनम्.",
  },
];

/**
 * Citizen Personas framed in contemporary Indian folk traditions
 */
export const CITIZEN_PERSONAS: Profession[] = [
  {
    id: "farmer",
    nativeTitle: "कृषक / किसान",
    englishTitle: "Farmer / Agriculturalist",
    description: "पीएम-किसान (₹6,000 वार्षिक सहायता), फसल बीमा योजना, केसीसी रियायती ऋण एवं खाद सब्सिडी।",
    schemePill: "PM-Kisan · KCC",
    artType: "farmer",
  },
  {
    id: "artisan",
    nativeTitle: "शिल्पकार / विश्वकर्मा",
    englishTitle: "Artisan & Handicraft Maker",
    description: "पीएम विश्वकर्मा टूलकिट ₹15,000 अनुदान, ₹3 लाख तक 5% संपार्श्विक-मुक्त ऋण व डिजिटल इन्सेंटिव।",
    schemePill: "Vishwakarma · Mudra",
    artType: "artisan",
  },
  {
    id: "student",
    nativeTitle: "छात्र / शोधार्थी",
    englishTitle: "Student & Youth Aspirant",
    description: "पोस्ट-मैट्रिक छात्रवृत्ति, 100% शिक्षण शुल्क प्रतिपूर्ति, मेधासॉफ्ट एवं मासिक डीबीटी गुजारा भत्ता।",
    schemePill: "DBT Scholarship · UGC",
    artType: "student",
  },
  {
    id: "msme",
    nativeTitle: "व्यापारी / दुकानदार",
    englishTitle: "Small Trader / MSME Unit",
    description: "मुद्रा ऋण (शिशु, किशोर, तरुण), पीएमईजीपी 35% पूंजी सब्सिडी एवं सीजीटीएमएसई क्रेडिट गारंटी।",
    schemePill: "MSME · PMEGP · Mudra",
    artType: "msme",
  },
  {
    id: "daily_wage",
    nativeTitle: "श्रमिक / कामगार",
    englishTitle: "Gig & Construction Worker",
    description: "ई-श्रम कार्ड ₹2 लाख दुर्घटना बीमा, मातृत्व सहायता, बीओसीडब्ल्यू कल्याण बोर्ड श्रमिक पेंशन।",
    schemePill: "e-Shram · BOCW Board",
    artType: "daily_wage",
  },
  {
    id: "senior",
    nativeTitle: "वरिष्ठ नागरिक",
    englishTitle: "Senior Citizen & Pensioner",
    description: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन, आयुष्मान भारत 70+ ₹5 लाख प्रतिवर्ष मुफ्त स्वास्थ्य सुरक्षा।",
    schemePill: "Ayushman 70+ · NSAP",
    artType: "senior",
  },
];

export function CitizenOnboardingGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLang, setSelectedLang] = useState<Language>(SCHEDULED_LANGUAGES[0]);
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [detectedLoc, setDetectedLoc] = useState<{
    state: string;
    language: { code: string; native: string; english: string };
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("civic_user_profile");
      if (!stored) {
        setIsOpen(true);
      }
    } catch {
      // LocalStorage unavailable fallback
    }

    // Auto-detect user's location & recommended 22-language match
    detectUserLocation().then((loc) => {
      if (loc) {
        setDetectedLoc(loc);
        const match = SCHEDULED_LANGUAGES.find((l) => l.code === loc.language.code);
        if (match) {
          setSelectedLang(match);
        }
      }
    });

    // Listen for custom trigger to re-open language & persona switcher anytime
    const handleReopen = () => {
      setStep(1);
      setIsOpen(true);
    };
    window.addEventListener("civic_reopen_onboarding", handleReopen);
    return () => window.removeEventListener("civic_reopen_onboarding", handleReopen);
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
    setStep(2);
  };

  const handlePersonaSelect = (professionId: FolkArtType) => {
    setSelectedProfession(professionId);
    const profile: CitizenProfile = {
      languageCode: selectedLang.code,
      languageNative: selectedLang.native,
      languageEnglish: selectedLang.english,
      profession: professionId,
      onboardedAt: Date.now(),
    };

    try {
      localStorage.setItem("civic_user_profile", JSON.stringify(profile));
      // Dispatch custom event to sync with active page contexts
      window.dispatchEvent(new CustomEvent("civic_profile_updated", { detail: profile }));
    } catch (e) {
      console.warn("Unable to persist citizen profile to localStorage", e);
    }

    // Smooth exit
    setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  return (
    <>
      <AnimatePresence>
        {mounted && isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-amber-900/30 dark:border-amber-400/25 bg-amber-50/95 dark:bg-zinc-950/95 p-4 sm:p-7 md:p-8 shadow-2xl shadow-amber-950/20 dark:shadow-black/60 custom-scrollbar"
            >
              {/* Universal Folk SVG Defs for Madhubani filigrees & Hatching */}
              <FolkSvgDefs />

              {/* STEP 1: All 22 Scheduled Indian Languages Grid */}
              {step === 1 ? (
                <div className="space-y-6">
                  {/* Header with National Constitutional Seal Tag */}
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-600/30">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>भारत का संविधान · 8वीं अनुसूची · 22 संवैधानिक भाषाएं</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 dark:text-zinc-50 tracking-[-0.035em]">
                      अपनी भाषा चुनें · Select Your Language
                    </h2>

                    <p className="text-xs sm:text-sm font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Access verified statutory schemes, gazettes, and legal rights in your native constitutional tongue with zero hallucination.
                    </p>
                  </div>

                  {/* Location-Aware Domicile Recommendation Banner */}
                  {detectedLoc && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-600/30 text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                        <span className="text-xl">📍</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Detected Domicile: {detectedLoc.state}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-semibold">
                              Auto-detected
                            </span>
                          </div>
                          <span className="text-xs text-amber-700 dark:text-amber-300 block mt-0.5">
                            Recommended Regional Language: <strong>{detectedLoc.language.native} ({detectedLoc.language.english})</strong>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const match = SCHEDULED_LANGUAGES.find((l) => l.code === detectedLoc.language.code);
                          if (match) handleLanguageSelect(match);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Continue in {detectedLoc.language.native}</span>
                      </button>
                    </div>
                  )}

                  {/* 22-Cell Language Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 pt-2">
                    {SCHEDULED_LANGUAGES.map((lang) => {
                      const isCurrent = selectedLang.code === lang.code;
                      const isDomicile = detectedLoc?.language.code === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageSelect(lang)}
                          className={`group relative flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                            isCurrent
                              ? "border-amber-700 dark:border-amber-400 bg-amber-100/90 dark:bg-zinc-900 shadow-sm ring-1 ring-amber-600/30"
                              : isDomicile
                              ? "border-amber-500/60 bg-amber-50/80 dark:bg-zinc-900/80 shadow-xs"
                              : "border-amber-900/15 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 hover:border-amber-600/50 dark:hover:border-amber-400/50 hover:bg-amber-100/40 dark:hover:bg-zinc-900"
                          }`}
                        >
                          {isDomicile && (
                            <span className="absolute top-1.5 right-1.5 text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                              📍 Domicile
                            </span>
                          )}
                          <span className="text-base sm:text-lg font-serif font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                            {lang.native}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
                            {lang.english}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
                            {lang.script}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* STEP 2: Localized Citizen Persona via RegionalFolkCard */
                <div className="space-y-6">
                  {/* Navigation Back Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-amber-900/10 dark:border-amber-400/15">
                    <button
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 transition-colors cursor-pointer group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                      <span>← भाषा बदलें / Change Language ({selectedLang.native})</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>चरण 2 / 2: नागरिक प्रोफाइल</span>
                    </div>
                  </div>

                  {/* Vernacular Step Header */}
                  <div className="text-center max-w-2xl mx-auto space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-normal">
                      {selectedLang.heading}
                    </h2>
                    <p className="text-xs sm:text-sm font-sans text-zinc-600 dark:text-zinc-400 leading-normal">
                      {selectedLang.subheading}
                    </p>
                  </div>

                  {/* 6 Regional Folk Personas Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5 pt-1">
                    {CITIZEN_PERSONAS.map((persona) => (
                      <RegionalFolkCard
                        key={persona.id}
                        {...persona}
                        selected={selectedProfession === persona.id}
                        onClick={() => handlePersonaSelect(persona.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Primary Children Rendered Transparently */}
      {children}
    </>
  );
}

export default CitizenOnboardingGate;

