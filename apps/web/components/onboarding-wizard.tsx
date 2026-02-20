"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Wrench,
  PieChart,
  Building2,
  Building,
  Home,
  LandPlot,
  ArrowRight,
  ArrowLeft,
  Check,
  Bot,
  Target,
  BarChart3,
  Map,
  Radar,
  Shield,
  Construction,
} from "lucide-react";
import updateUserMetadata from "@/lib/clerk/updateMetadata";
import { useClerk, useUser } from "@clerk/nextjs";

// Types
interface FormData {
  investmentGoal: string;
  totalBudget: number;
  availableDeposit: number;
  annualIncome: string;
  regions: string[];
  areaType: string;
  propertyType: string;
  bedrooms: string;
  experienceLevel: string;

  holdingPeriod: string;
  riskLevel: string;
  homeLoan: string;
  borrowingCapacity: string;
  cashflowExpectations: string;
  cashflowAmount: string;
  remoteInvesting: string;
  propertyAge: string;
  involvement: string;
  coInvestment: string;
  areaPreference: string;
  previousExperience: string;
}

const TOTAL_STEPS = 5;

const INVESTMENT_GOALS = [
  {
    id: "cash-flow",
    title: "Cash Flow",
    description: "Generate regular passive income through rental returns",
    icon: DollarSign,
  },
  {
    id: "growth",
    title: "Capital Growth",
    description: "Build wealth through long-term property appreciation",
    icon: TrendingUp,
  },
  {
    id: "renovation",
    title: "Renovation/Flip",
    description: "Add value through renovations and sell for profit",
    icon: Wrench,
  },
  {
    id: "diversify",
    title: "Diversification",
    description: "Spread investment risk across property portfolio",
    icon: PieChart,
  },
  {
    id: "development",
    title: "Development",
    description: "Subdivision and construction projects for maximum returns",
    icon: Construction,
  },
  {
    id: "smsf",
    title: "SMSF Investment",
    description: "Superannuation-compliant property acquisition",
    icon: Shield,
  },
];

const REGIONS = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const AREA_TYPES = [
  { id: "metro", title: "Metro", description: "Capital city areas" },
  { id: "suburban", title: "Suburban", description: "Outer suburbs" },
  { id: "regional", title: "Regional", description: "Regional centers" },
];

const PROPERTY_TYPES = [
  { id: "house", title: "House", description: "Detached family home", icon: Home },
  { id: "apartment", title: "Apartment", description: "Unit or apartment", icon: Building },
  { id: "townhouse", title: "Townhouse", description: "Attached dwelling", icon: Building2 },
  { id: "land", title: "Land", description: "Vacant land", icon: LandPlot },
];

const BEDROOM_OPTIONS = ["1 Bed", "2 Beds", "3 Beds", "4+ Beds"];

const EXPERIENCE_LEVELS = [
  {
    id: "beginner",
    title: "First-time Investor",
    description: "I'm new to property investing and want to learn",
  },
  {
    id: "some",
    title: "Some Experience",
    description: "I own 1-2 investment properties",
  },
  {
    id: "experienced",
    title: "Experienced Investor",
    description: "I have a portfolio of 3+ properties",
  },
  {
    id: "professional",
    title: "Professional",
    description: "I invest in property full-time",
  },
];

const FEATURE_PREVIEWS = [
  {
    icon: Bot,
    title: "Personalized AI Recommendations",
    description:
      "Chat with our AI advisor to discover properties that match your unique investment goals and financial profile.",
    tag: "AI-Powered",
  },
  {
    icon: Radar,
    title: "Spider Chart Risk Assessment",
    description:
      "Visualize property risk across multiple dimensions: market volatility, liquidity, tenant demand, and location stability.",
    tag: "Visual Analysis",
  },
  {
    icon: Target,
    title: "Strategy-Specific Property Scoring",
    description:
      "Every property gets scored based on your chosen strategy, whether it's cash flow, capital growth, or renovation potential.",
    tag: "Personalized",
  },
  {
    icon: BarChart3,
    title: "Market Health Indicators",
    description:
      "Track suburb-level metrics including vacancy rates, rental yields, price trends, and demographic data in real-time.",
    tag: "Live Data",
  },
];

const STRATEGY_TRADEOFFS = [
  {
    id: "cash-flow",
    title: "Cash Flow",
    pros: ["Regular rental income", "Lower risk in stable markets"],
    cons: ["Limited capital growth", "Sensitive to vacancy rates"],
  },
  {
    id: "growth",
    title: "Capital Growth",
    pros: ["Long-term appreciation", "Potential for high returns"],
    cons: ["Lower immediate cash flow", "Market cycles impact value"],
  },
  {
    id: "renovation",
    title: "Renovation/Flip",
    pros: ["Add value quickly", "Potential for fast profit"],
    cons: ["Requires expertise", "Higher risk, more effort"],
  },
  {
    id: "diversify",
    title: "Diversification",
    pros: ["Spread risk", "Flexible portfolio"],
    cons: ["Complex management", "Diluted returns"],
  },
  {
    id: "development",
    title: "Development",
    pros: ["High upside", "Create new assets"],
    cons: ["Complex, capital intensive", "Regulatory hurdles"],
  },
  {
    id: "smsf",
    title: "SMSF",
    pros: ["Tax advantages", "Retirement planning"],
    cons: ["Strict compliance", "Limited borrowing"],
  },
];

// Format currency
const formatCurrency = (value: number) =>
  "$" + value.toLocaleString("en-AU");

export default function OnboardingWizard({ userId }: { userId: string }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [showFeaturePreview, setShowFeaturePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    investmentGoal: "",
    totalBudget: 750000,
    availableDeposit: 150000,
    annualIncome: "",
    regions: [],
    areaType: "",
    propertyType: "",
    bedrooms: "",
    experienceLevel: "",
    holdingPeriod: "",
    riskLevel: "",
    homeLoan: "",
    borrowingCapacity: "",
    cashflowExpectations: "",
    cashflowAmount: "",
    remoteInvesting: "",
    propertyAge: "",
    involvement: "",
    coInvestment: "",
    areaPreference: "",
    previousExperience: "",
  });

  const getRecommendedStrategies = () => {
    const selected = formData.investmentGoal;
    const others = STRATEGY_TRADEOFFS.filter(s => s.id !== selected).slice(0, 2);
    return [
      STRATEGY_TRADEOFFS.find(s => s.id === selected),
      ...others,
    ].filter(Boolean);
  };

  const handleAcceptRecommendations = async () => {
    if (!isLoaded || !user) return;
    await user.reload()
    router.push("/dashboard");
  };

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleRegion = useCallback((region: string) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }));
  }, []);

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    if (!isLoaded || !user) return;
    try {
      console.log("Form Data Submitted:", formData);
      console.log("User ID:", userId);
      await updateUserMetadata(userId, {
        userPreferences: {
          primaryGoal: formData.investmentGoal,
          totalBudget: formData.totalBudget.toString(),
          personalSavings: formData.availableDeposit.toString(),
          regions: formData.regions,
          areaType: formData.areaType,
          propertyType: [formData.propertyType],
          bedrooms: formData.bedrooms,
          experienceLevel: formData.experienceLevel,
          holdingPeriod: "",
          riskLevel: "",
          homeLoan: "",
          borrowingCapacity: "",
          cashflowExpectations: "",
          cashflowAmount: "",
          remoteInvesting: "",
          propertyAge: "",
          involvement: "",
          coInvestment: "",
          // areaType: "",
          // experienceLevel: "",
          areaPreference: "",
          previousExperience: ""
        },
        onboardingComplete: true,
        subscriptionPlan: "free-trial",
        subscriptionEndDate: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
        application_id: "" as any,
      });
      
      toast.success("Your profile has been created successfully!");
      setShowRecommendations(true);
      // router.push("/dashboard");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("There was an error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExperienceSelect = (value: string) => {
    updateField("experienceLevel", value);
    setTimeout(() => setShowFeaturePreview(true), 300);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(13, 115, 119, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(212, 175, 55, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 md:px-10 pt-36 pb-20">

        <div className="flex items-center gap-2 justify-end relative left-60 bottom-4">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-10 h-1 rounded-full transition-all duration-500",
                i + 1 < currentStep
                  ? "bg-emerald-500"
                  : i + 1 === currentStep
                    ? "bg-[#0d7377]"
                    : "bg-[#242b33]"
              )}
            />
          ))}
          <span className="ml-4 text-sm text-[#6b7280]">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Step 1: Investment Goals */}
        {currentStep === 1 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-[#0d7377]/15 rounded-full text-sm text-[#1a9599] font-medium mb-4">
                Step 1 of {TOTAL_STEPS}
              </span>
              <h1 className="font-serif text-4xl font-semibold mb-3">
                What's your investment goal?
              </h1>
              <p className="text-[#9ba3af] text-lg">
                This helps us recommend the right strategy for you
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {INVESTMENT_GOALS.map((goal) => (
                <OptionCard
                  key={goal.id}
                  selected={formData.investmentGoal === goal.id}
                  onClick={() => updateField("investmentGoal", goal.id)}
                  icon={<goal.icon className="w-6 h-6" />}
                  title={goal.title}
                  description={goal.description}
                />
              ))}
            </div>

            <WizardNav onNext={nextStep} showBack={false} />
          </div>
        )}

        {/* Step 2: Financial Profile */}
        {currentStep === 2 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-[#0d7377]/15 rounded-full text-sm text-[#1a9599] font-medium mb-4">
                Step 2 of {TOTAL_STEPS}
              </span>
              <h1 className="font-serif text-4xl font-semibold mb-3">
                Your financial profile
              </h1>
              <p className="text-[#9ba3af] text-lg">
                Help us understand your budget and borrowing capacity
              </p>
            </div>

            {/* Total Budget Slider */}
            <div className="mb-10">
              <label className="block text-sm font-medium text-[#9ba3af] mb-3">
                Total Investment Budget
              </label>
              <div className="text-center mb-6">
                <span className="font-serif text-4xl font-bold text-[#1a9599]">
                  {formatCurrency(formData.totalBudget)}
                </span>
              </div>
              <input
                type="range"
                min={200000}
                max={2000000}
                step={50000}
                value={formData.totalBudget}
                onChange={(e) =>
                  updateField("totalBudget", Number(e.target.value))
                }
                className="w-full h-2 bg-[#242b33] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0d7377]
                  [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#0f1419]
                  [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(13,115,119,0.4)]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0d7377]
                  [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[#0f1419]"
              />
              <div className="flex justify-between text-sm text-[#6b7280] mt-2">
                <span>$200K</span>
                <span>$2M+</span>
              </div>
            </div>

            {/* Available Deposit Slider */}
            <div className="mb-10">
              <label className="block text-sm font-medium text-[#9ba3af] mb-3">
                Available Deposit
              </label>
              <div className="text-center mb-6">
                <span className="font-serif text-4xl font-bold text-[#1a9599]">
                  {formatCurrency(formData.availableDeposit)}
                </span>
              </div>
              <input
                type="range"
                min={20000}
                max={500000}
                step={10000}
                value={formData.availableDeposit}
                onChange={(e) =>
                  updateField("availableDeposit", Number(e.target.value))
                }
                className="w-full h-2 bg-[#242b33] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0d7377]
                  [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#0f1419]
                  [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(13,115,119,0.4)]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0d7377]
                  [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[#0f1419]"
              />
              <div className="flex justify-between text-sm text-[#6b7280] mt-2">
                <span>$20K</span>
                <span>$500K+</span>
              </div>
            </div>

            {/* Annual Income */}
            <div className="mb-12">
              <label className="block text-sm font-medium text-[#9ba3af] mb-3">
                Annual Household Income
              </label>
              <input
                type="text"
                value={formData.annualIncome}
                onChange={(e) => updateField("annualIncome", e.target.value)}
                placeholder="e.g. $150,000"
                className="w-full px-5 py-4 bg-[#1a1f26] border border-white/[0.08] rounded-xl 
                  text-[#f7f9fc] text-base placeholder:text-[#6b7280]
                  focus:outline-none focus:border-[#0d7377] focus:ring-2 focus:ring-[#0d7377]/20
                  transition-all duration-300"
              />
            </div>

            <WizardNav onBack={prevStep} onNext={nextStep} />
          </div>
        )}

        {/* Step 3: Location Preferences */}
        {currentStep === 3 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-[#0d7377]/15 rounded-full text-sm text-[#1a9599] font-medium mb-4">
                Step 3 of {TOTAL_STEPS}
              </span>
              <h1 className="font-serif text-4xl font-semibold mb-3">
                Where are you looking?
              </h1>
              <p className="text-[#9ba3af] text-lg">
                Select the regions you're interested in investing
              </p>
            </div>

            {/* Regions */}
            <div className="mb-10">
              <label className="block text-sm font-medium text-[#9ba3af] mb-4">
                Select Regions (Choose multiple)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => toggleRegion(region)}
                    className={cn(
                      "py-4 rounded-xl text-sm font-medium transition-all duration-300",
                      "border-2",
                      formData.regions.includes(region)
                        ? "bg-[#0d7377]/15 border-[#0d7377] text-[#1a9599]"
                        : "bg-[#1a1f26] border-white/[0.08] text-[#9ba3af] hover:border-[#0d7377]"
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Area Type */}
            <div className="mb-12">
              <label className="block text-sm font-medium text-[#9ba3af] mb-4">
                Area Type Preference
              </label>
              <div className="grid grid-cols-3 gap-4">
                {AREA_TYPES.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => updateField("areaType", area.id)}
                    className={cn(
                      "p-6 rounded-2xl text-left transition-all duration-300",
                      "border-2 relative",
                      formData.areaType === area.id
                        ? "bg-[#0d7377]/10 border-[#0d7377]"
                        : "bg-[#1a1f26] border-white/[0.08] hover:border-[#0d7377] hover:bg-[#0d7377]/5"
                    )}
                  >
                    {formData.areaType === area.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#0d7377] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="w-12 h-12 bg-[#242b33] rounded-xl flex items-center justify-center mb-4">
                      <span className="text-2xl">
                        {area.id === "metro" ? "🏙️" : area.id === "suburban" ? "🏘️" : "🌳"}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{area.title}</h3>
                    <p className="text-sm text-[#9ba3af]">{area.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <WizardNav onBack={prevStep} onNext={nextStep} />
          </div>
        )}

        {/* Step 4: Property Preferences */}
        {currentStep === 4 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-[#0d7377]/15 rounded-full text-sm text-[#1a9599] font-medium mb-4">
                Step 4 of {TOTAL_STEPS}
              </span>
              <h1 className="font-serif text-4xl font-semibold mb-3">
                Property preferences
              </h1>
              <p className="text-[#9ba3af] text-lg">
                What type of property are you looking for?
              </p>
            </div>

            {/* Property Type */}
            <div className="mb-10">
              <label className="block text-sm font-medium text-[#9ba3af] mb-4">
                Property Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                {PROPERTY_TYPES.map((type) => (
                  <OptionCard
                    key={type.id}
                    selected={formData.propertyType === type.id}
                    onClick={() => updateField("propertyType", type.id)}
                    icon={<type.icon className="w-6 h-6" />}
                    title={type.title}
                    description={type.description}
                  />
                ))}
              </div>
            </div>

            {/* Bedrooms */}
            <div className="mb-12">
              <label className="block text-sm font-medium text-[#9ba3af] mb-4">
                Minimum Bedrooms
              </label>
              <div className="grid grid-cols-4 gap-3">
                {BEDROOM_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => updateField("bedrooms", option)}
                    className={cn(
                      "py-4 rounded-xl text-sm font-medium transition-all duration-300",
                      "border-2",
                      formData.bedrooms === option
                        ? "bg-[#0d7377]/15 border-[#0d7377] text-[#1a9599]"
                        : "bg-[#1a1f26] border-white/[0.08] text-[#9ba3af] hover:border-[#0d7377]"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <WizardNav onBack={prevStep} onNext={nextStep} />
          </div>
        )}

        {/* Step 5: Experience Level */}
        {currentStep === 5 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-[#0d7377]/15 rounded-full text-sm text-[#1a9599] font-medium mb-4">
                Step 5 of {TOTAL_STEPS}
              </span>
              <h1 className="font-serif text-4xl font-semibold mb-3">
                Your experience level
              </h1>
              <p className="text-[#9ba3af] text-lg">
                This helps us tailor our recommendations
              </p>
            </div>

            {/* Experience Cards */}
            <div className="space-y-3 mb-12">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleExperienceSelect(level.id)}
                  className={cn(
                    "w-full flex items-center gap-5 p-5 rounded-2xl text-left transition-all duration-300",
                    "border-2",
                    formData.experienceLevel === level.id
                      ? "bg-[#0d7377]/10 border-[#0d7377]"
                      : "bg-[#1a1f26] border-white/[0.08] hover:border-[#0d7377]"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      formData.experienceLevel === level.id
                        ? "border-[#0d7377] bg-[#0d7377]"
                        : "border-white/[0.08]"
                    )}
                  >
                    {formData.experienceLevel === level.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{level.title}</h3>
                    <p className="text-sm text-[#9ba3af]">{level.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Feature Preview */}
            {showFeaturePreview && (
              <div className="animate-in slide-in-from-bottom-8 fade-in duration-600 border-t border-white/[0.08] pt-12">
                <div className="text-center mb-10">
                  <h3 className="font-serif text-3xl font-semibold mb-3">
                    Here's what you'll get
                  </h3>
                  <p className="text-[#9ba3af] text-lg">
                    Powered by AI to help you make smarter investment decisions
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-12">
                  {FEATURE_PREVIEWS.map((feature, index) => (
                    <div
                      key={index}
                      className="group bg-[#1a1f26] border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:border-[#0d7377]/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(13,115,119,0.15)] relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0d7377] to-[#1a9599] scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0d7377]/15 to-[#0d7377]/5 flex items-center justify-center mb-4">
                        <feature.icon className="w-7 h-7 text-[#1a9599]" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-[#9ba3af] leading-relaxed mb-3">
                        {feature.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d7377]/10 rounded-md text-xs font-medium text-[#1a9599]">
                        <Check className="w-3.5 h-3.5" />
                        {feature.tag}
                      </span>
                    </div>
                  ))}

                  {/* Large Interactive Map Preview */}
                  <div className="col-span-2 group bg-[#1a1f26] border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:border-[#0d7377]/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(13,115,119,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0d7377] to-[#1a9599] scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    <div className="flex gap-6 items-start">
                      <div className="flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0d7377]/15 to-[#0d7377]/5 flex items-center justify-center mb-4">
                          <Map className="w-7 h-7 text-[#1a9599]" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2">
                          Interactive Map Layers
                        </h4>
                        <p className="text-sm text-[#9ba3af] leading-relaxed mb-3">
                          Explore properties with customizable map layers showing
                          growth hotspots, rental yield heatmaps, infrastructure
                          projects, school catchments, and flood zones.
                        </p>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d7377]/10 rounded-md text-xs font-medium text-[#1a9599]">
                          <Check className="w-3.5 h-3.5" />
                          Interactive
                        </span>
                      </div>
                      <div className="flex-1 bg-[#242b33] rounded-xl p-6 text-center text-[#6b7280] text-sm min-h-[120px] flex items-center justify-center">
                        <div>
                          <div className="text-5xl mb-3">🌏</div>
                          <div>
                            Dynamic heatmaps & property markers
                            <br />
                            updating in real-time
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <WizardNav
              onBack={prevStep}
              onNext={handleComplete}
              isLastStep
              showComplete={showFeaturePreview}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </main>

      {showRecommendations && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1f26] rounded-2xl border border-white/[0.08] p-10 max-w-4xl w-full shadow-xl">
            <h2 className="font-serif text-3xl font-semibold mb-6 text-[#f7f9fc] text-center">
              Your Recommended Strategies
            </h2>
            <p className="text-[#9ba3af] text-center mb-8">
              Based on your profile, here are 2–3 strategies with key trade-offs:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {getRecommendedStrategies().map(
                (strategy) =>
                  strategy && (
                    <div key={strategy.id} className="bg-[#242b33] rounded-xl p-6 border border-white/[0.08]">
                      <h3 className="text-xl font-semibold mb-2 text-[#1a9599]">{strategy.title}</h3>
                      <div className="mb-2">
                        <span className="font-bold text-[#0d7377]">Pros:</span>
                        <ul className="list-disc ml-5 text-sm text-[#f7f9fc]">
                          {strategy.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                        </ul>
                      </div>
                      <div>
                        <span className="font-bold text-[#d4af37]">Cons:</span>
                        <ul className="list-disc ml-5 text-sm text-[#9ba3af]">
                          {strategy.cons.map((con, i) => <li key={i}>{con}</li>)}
                        </ul>
                      </div>
                    </div>
                  )
              )}
            </div>
            <button
              onClick={handleAcceptRecommendations}
              className="w-full py-4 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-white font-semibold text-lg mt-2"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Option Card Component
interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function OptionCard({ selected, onClick, icon, title, description }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-6 rounded-2xl text-left transition-all duration-300",
        "border-2 relative",
        selected
          ? "bg-[#0d7377]/10 border-[#0d7377]"
          : "bg-[#1a1f26] border-white/[0.08] hover:border-[#0d7377] hover:bg-[#0d7377]/5"
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-[#0d7377] rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="w-12 h-12 bg-[#242b33] rounded-xl flex items-center justify-center mb-4 text-[#9ba3af]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[#9ba3af] leading-relaxed">{description}</p>
    </button>
  );
}

// Wizard Navigation Component
interface WizardNavProps {
  onBack?: () => void;
  onNext: () => void;
  showBack?: boolean;
  isLastStep?: boolean;
  showComplete?: boolean;
  isSubmitting?: boolean;
}

function WizardNav({
  onBack,
  onNext,
  showBack = true,
  isLastStep = false,
  showComplete = false,
  isSubmitting = false,
}: WizardNavProps) {
  return (
    <div className="flex justify-between items-center pt-8 border-t border-white/[0.08]">
      {showBack && onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold
            bg-transparent border border-white/[0.08] text-[#9ba3af]
            hover:border-[#0d7377] hover:text-[#f7f9fc] transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      ) : (
        <div />
      )}

      {isLastStep ? (
        showComplete && (
          <button
            onClick={onNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold
              bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-white
              shadow-[0_4px_20px_rgba(212,175,55,0.3)]
              hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)] hover:-translate-y-0.5
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Complete Setup"}
            <ArrowRight className="w-5 h-5" />
          </button>
        )
      ) : (
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold
            bg-gradient-to-br from-[#0d7377] to-[#095456] text-white
            shadow-[0_4px_20px_rgba(13,115,119,0.3)]
            hover:shadow-[0_8px_30px_rgba(13,115,119,0.4)] hover:-translate-y-0.5
            transition-all duration-300"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
