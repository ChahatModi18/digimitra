import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Send,
  Building2,
  RotateCcw,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useAuth } from "../../context/AuthContext";

interface FeedbackRatingSectionProps {
  currentLang?: "en" | "hi";
  businessName?: string;
  sourcePage?: string;
}

interface StarPickerProps {
  label: string;
  rating: number;
  onRatingChange: (val: number) => void;
  required?: boolean;
}

const StarPicker: React.FC<StarPickerProps> = ({
  label,
  rating,
  onRatingChange,
  required = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const labels = ["", "Needs Work (1/5)", "Fair (2/5)", "Good (3/5)", "Very Good (4/5)", "Outstanding (5/5)"];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#241C15]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-[11px] font-semibold text-[#F0592A]">
          {labels[hoverRating || rating] || "Select rating"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 rounded-lg hover:bg-orange-50 transition transform hover:scale-110 focus:outline-none"
              title={`${star} Star`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  filled
                    ? "fill-[#F5A623] text-[#F5A623] drop-shadow-xs"
                    : "text-stone-300 hover:text-orange-300"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const FeedbackRatingSection: React.FC<FeedbackRatingSectionProps> = ({
  currentLang = "en",
  businessName,
  sourcePage = "roadmap",
}) => {
  const { user } = useAuth();

  const [overallRating, setOverallRating] = useState<number>(5);
  const [assessmentRating, setAssessmentRating] = useState<number>(5);
  const [roadmapRating, setRoadmapRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [selectedHelpedOptions, setSelectedHelpedOptions] = useState<string[]>([
    "Clear 3-phase transformation roadmap",
  ]);
  const [recommendLikelihood, setRecommendLikelihood] = useState<string>("definitely");
  const [submitterName, setSubmitterName] = useState<string>(
    user?.full_name || businessName || "MSME Business Owner"
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const STORAGE_KEY = "digimitra_user_feedbacks";

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep existing state or display confirmation
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const helpedOptions = [
    {
      id: "Clear 3-phase transformation roadmap",
      en: "Clear 3-phase transformation roadmap",
      hi: "स्पष्ट 3-चरणीय परिवर्तन रोडमैप मिला",
    },
    {
      id: "Discovered official government schemes (Udyam, ONDC, CGTMSE)",
      en: "Discovered official government schemes (Udyam, ONDC, CGTMSE)",
      hi: "सरकारी योजनाओं (उद्यम, ओएनडीसी, सीजीटीएमएसई) की सही जानकारी मिली",
    },
    {
      id: "Evaluated 9 operational dimensions objectively",
      en: "Evaluated 9 operational dimensions objectively",
      hi: "9 परिचालन आयामों का निष्पक्ष डिजिटल मूल्यांकन हुआ",
    },
    {
      id: "Recommended practical tools (Vyapar, Tally, WhatsApp Business)",
      en: "Recommended practical tools (Vyapar, Tally, WhatsApp Business)",
      hi: "व्यावहारिक ऐप्स और टूल्स (व्यापार, टैली, व्हाट्सएप) का सुझाव मिला",
    },
    {
      id: "No commercial vendor bias or paid promotions",
      en: "No commercial vendor bias or paid promotions",
      hi: "बिना किसी प्रायोजित विज्ञापन के निष्पक्ष मार्गदर्शन",
    },
  ];

  const toggleHelpedOption = (id: string) => {
    setSelectedHelpedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submission = {
      id: `FB-${Date.now()}`,
      submitterName,
      businessName: businessName || "Local Enterprise",
      overallRating,
      assessmentRating,
      roadmapRating,
      selectedHelpedOptions,
      recommendLikelihood,
      feedbackText: feedbackText.trim(),
      sourcePage,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.unshift(submission);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not save feedback to localStorage:", err);
    }

    setIsSubmitted(true);
    setSubmittedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFeedbackText("");
  };

  if (isSubmitted) {
    return (
      <Card
        variant="default"
        className="p-6 sm:p-8 bg-gradient-to-br from-[#FFF4ED] via-white to-[#FAF1E8] border border-[#F0592A]/30 shadow-md text-center space-y-4 animate-fadeIn"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-[#1B7A6E] flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <Badge variant="success" size="md">
            {currentLang === "hi" ? "समीक्षा सफलतापूर्वक दर्ज!" : "Rating & Feedback Recorded"}
          </Badge>
          <h3 className="text-lg font-extrabold text-[#241C15]">
            {currentLang === "hi"
              ? "DigiMitra को रेटिंग देने के लिए धन्यवाद!"
              : "Thank You for Your Valuable Rating & Feedback!"}
          </h3>
          <p className="text-xs text-[#6B5D52] max-w-md mx-auto">
            {currentLang === "hi"
              ? `आपकी ${overallRating}-स्टार रेटिंग और बहुमूल्य सुझाव भारतीय एमएसएमई डिजिटल प्लेटफॉर्म को बेहतर बनाने में मदद करेंगे। (समय: ${submittedAt})`
              : `Your ${overallRating}-star rating and suggestions help refine DigiMitra for millions of small business owners across India. (Logged at ${submittedAt})`}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-5 h-5 ${
                s <= overallRating ? "fill-[#F5A623] text-[#F5A623]" : "text-stone-300"
              }`}
            />
          ))}
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {currentLang === "hi" ? "अन्य प्रतिक्रिया दें" : "Submit Another Feedback"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="default"
      className="p-6 sm:p-8 bg-white border border-[#EDE2D8] shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE2D8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FFF4ED] text-[#F0592A] border border-[#F0592A]/20">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-[#241C15]">
              {currentLang === "hi"
                ? "हमें रेटिंग और प्रतिक्रिया दें (Rate & Feedback)"
                : "Rate Your Experience & Share Feedback"}
            </h3>
          </div>
          <p className="text-xs text-[#6B5D52] mt-1">
            {currentLang === "hi"
              ? "बताएं कि इस एप्लिकेशन ने आपके व्यवसाय को कैसे लाभ पहुंचाया और इसे कितना उपयोगी पाया।"
              : "Tell us how this application helped your enterprise and how we can make it even better."}
          </p>
        </div>
        <Badge variant="brand" size="sm">
          Community Voice
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating Questionnaire Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE2D8]/80">
          <StarPicker
            label={currentLang === "hi" ? "समग्र अनुभव (Overall Experience)" : "Overall Application Experience"}
            rating={overallRating}
            onRatingChange={setOverallRating}
            required
          />
          <StarPicker
            label={currentLang === "hi" ? "9-आयाम मूल्यांकन उपयोगिता" : "Usefulness of 9-Dimension Scoring"}
            rating={assessmentRating}
            onRatingChange={setAssessmentRating}
          />
          <StarPicker
            label={currentLang === "hi" ? "रोडमैप व सुझावों की व्यावहारिकता" : "Actionability of Roadmaps & Tools"}
            rating={roadmapRating}
            onRatingChange={setRoadmapRating}
          />
        </div>

        {/* Questionnaire: How Did DigiMitra Help You? */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#241C15] block">
            {currentLang === "hi"
              ? "इस एप्लिकेशन ने आपके व्यवसाय की किस प्रकार सहायता की? (बहुविकल्पीय)"
              : "How did this application help your enterprise? (Select all that apply)"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {helpedOptions.map((opt) => {
              const isChecked = selectedHelpedOptions.includes(opt.id);
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => toggleHelpedOption(opt.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                    isChecked
                      ? "bg-[#FFF4ED] border-[#F0592A] text-[#241C15] font-bold shadow-xs"
                      : "bg-white border-[#EDE2D8] text-[#6B5D52] hover:border-stone-400"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                      isChecked
                        ? "bg-[#F0592A] border-[#F0592A] text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span>{currentLang === "hi" ? opt.hi : opt.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommendation Likelihood */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#241C15] block">
            {currentLang === "hi"
              ? "क्या आप अन्य दुकानदार / एमएसएमई मित्रों को DigiMitra की अनुशंसा करेंगे?"
              : "How likely are you to recommend DigiMitra to other MSME business owners?"}
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "definitely", en: "Definitely (10/10)", hi: "बिल्कुल (10/10)" },
              { id: "likely", en: "Very Likely", hi: "संभवतः हाँ" },
              { id: "neutral", en: "Neutral", hi: "शायद" },
              { id: "not_now", en: "Not right now", hi: "अभी नहीं" },
            ].map((choice) => (
              <button
                type="button"
                key={choice.id}
                onClick={() => setRecommendLikelihood(choice.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  recommendLikelihood === choice.id
                    ? "bg-[#1B7A6E] text-white border-[#1B7A6E]"
                    : "bg-white text-[#6B5D52] border-[#EDE2D8] hover:border-stone-400"
                }`}
              >
                {currentLang === "hi" ? choice.hi : choice.en}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Text Area Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#241C15]">
              {currentLang === "hi"
                ? "आपके विचार व सुझाव (Feedback Box)"
                : "Your Feedback & Suggestions (In your own words)"}
            </label>
            <span className="text-[11px] text-[#9C8F84]">
              {feedbackText.length} / 500 words
            </span>
          </div>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value.slice(0, 500))}
            rows={3}
            placeholder={
              currentLang === "hi"
                ? "लिखें कि इस एप्लिकेशन ने आपको किस तरह लाभ दिया, क्या नया सीखने को मिला या क्या सुधार चाहिए..."
                : "Write a few sentences on how this application helped your store, what worked best, or any improvements you'd like to see..."
            }
            className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#EDE2D8] focus:outline-none focus:border-[#F0592A] focus:ring-1 focus:ring-[#F0592A] bg-white text-[#241C15] placeholder-stone-400"
          />
        </div>

        {/* Submitter Name & Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#EDE2D8]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-[#9C8F84]" />
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="Your Name or Enterprise Name"
              className="text-xs px-3 py-2 rounded-lg border border-[#EDE2D8] bg-white text-[#241C15] font-semibold focus:outline-none focus:border-[#F0592A] w-full sm:w-60"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            rightIcon={<Send className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-sm"
          >
            {currentLang === "hi" ? "रेटिंग व प्रतिक्रिया भेजें" : "Submit Rating & Feedback"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
