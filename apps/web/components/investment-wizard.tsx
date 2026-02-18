"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  DollarSign,
  MapPin,
  Home,
  User,
  Shield,
} from "lucide-react";
import updateUserMetadata from "@/lib/clerk/updateMetadata";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Investment Goals",
    icon: Target,
    description: "Let's start with what you're looking for.",
  },
  {
    id: 2,
    title: "Financial Profile",
    icon: DollarSign,
    description:
      "This helps us find options that match your budget and comfort zone.",
  },
  {
    id: 3,
    title: "Location Preferences",
    icon: MapPin,
    description: "Help us narrow down the right regions for you.",
  },
  {
    id: 4,
    title: "Property Preferences",
    icon: Home,
    description: "We'll tailor recommendations based on what types you prefer.",
  },
  {
    id: 5,
    title: "Experience & Expectations",
    icon: User,
    description:
      "Just a few more optional questions to improve recommendations.",
  },
];

export default function InvestmentWizard({ userId }: { userId: string }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    // Step 1
    primaryGoal: "",
    holdingPeriod: "",
    riskLevel: "",
    // Step 2
    totalBudget: "",
    personalSavings: "",
    homeLoan: "",
    borrowingCapacity: "",
    cashflowExpectations: "",
    cashflowAmount: "",
    // Step 3
    regions: [] as string[],
    remoteInvesting: "",
    areaPreference: "",
    // Step 4
    propertyType: [] as string[],
    bedrooms: "",
    propertyAge: "",
    // Step 5
    previousExperience: "",
    involvement: "",
    coInvestment: "",
  });
  const router = useRouter();

  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!formData.primaryGoal)
        newErrors.primaryGoal = "Please select a goal.";
      if (!formData.holdingPeriod)
        newErrors.holdingPeriod = "Select a holding period.";
      if (!formData.riskLevel)
        newErrors.riskLevel = "Choose your risk comfort.";
    }

    if (currentStep === 2) {
      if (!formData.totalBudget)
        newErrors.totalBudget = "Enter your total budget.";
      if (!formData.personalSavings)
        newErrors.personalSavings = "Enter your savings.";
      if (!formData.homeLoan)
        newErrors.homeLoan = "Specify your home loan intent.";
      if (formData.homeLoan === "Yes" && !formData.borrowingCapacity) {
        newErrors.borrowingCapacity = "Provide borrowing capacity.";
      }
      if (!formData.cashflowExpectations) {
        newErrors.cashflowExpectations = "Select a cashflow preference.";
      }
      if (formData.cashflowExpectations === "Yes" && !formData.cashflowAmount) {
        newErrors.cashflowAmount = "Specify cashflow amount.";
      }
    }

    if (currentStep === 3) {
      if (formData.regions.length === 0)
        newErrors.regions = "Select at least one region.";
      if (!formData.remoteInvesting)
        newErrors.remoteInvesting = "Answer this question.";
      if (!formData.areaPreference)
        newErrors.areaPreference = "Choose a preference.";
    }

    if (currentStep === 4) {
      if (formData.propertyType.length === 0)
        newErrors.propertyType = "Choose at least one type.";
      if (!formData.bedrooms)
        newErrors.bedrooms = "Specify preferred bedroom count.";
      if (!formData.propertyAge) newErrors.propertyAge = "Choose property age.";
    }

    if (currentStep === 5) {
      if (!formData.previousExperience)
        newErrors.previousExperience = "Select an option.";
      if (!formData.involvement)
        newErrors.involvement = "Choose your involvement level.";
      if (!formData.coInvestment)
        newErrors.coInvestment = "Answer this question.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    // Here you would typically send formData to your backend or API
    console.log("Form Data Submitted:", formData);
    if (!validateStep()) return;
    try {
      await updateUserMetadata(userId, {
        userPreferences: { 
          ...formData,
          experienceLevel: "",
          areaType: "",
        },
        onboardingComplete: true,
        subscriptionPlan: "free-trial", // Default to free trial for new users
        subscriptionEndDate: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 14 days from now,
        application_id: "" as any,
      });
      toast.success("Your preferences have been saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving form data:", error);
      toast.error(
        "There was an error saving your preferences. Please try again."
      );
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                What is your primary investment goal?
              </Label>
              <RadioGroup
                value={formData.primaryGoal}
                onValueChange={(value) => updateFormData("primaryGoal", value)}
                className={cn(errors.primaryGoal && "border-red-500")}
              >
                {[
                  "Long-term capital appreciation",
                  "Rental income",
                  "Flip & sell in short term",
                  "Diversify portfolio",
                  "Buy-to-live, but want it to be a good investment",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.primaryGoal && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.primaryGoal}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                How long do you plan to hold this property?
              </Label>
              <RadioGroup
                value={formData.holdingPeriod}
                onValueChange={(value) =>
                  updateFormData("holdingPeriod", value)
                }
                className={cn(errors.holdingPeriod && "border-red-500")}
              >
                {[
                  "Less than 1 year",
                  "1-3 years",
                  "3-5 years",
                  "5-10 years",
                  "10+ years",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.holdingPeriod && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.holdingPeriod}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                What level of risk are you comfortable with?
              </Label>
              <RadioGroup
                value={formData.riskLevel}
                onValueChange={(value) => updateFormData("riskLevel", value)}
                className={cn(errors.riskLevel && "border-red-500")}
              >
                {[
                  "Low (stable, slower growth areas)",
                  "Moderate",
                  "High (emerging or speculative markets)",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.riskLevel && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.riskLevel}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="budget"
                className="text-base font-medium text-gray-900"
              >
                What is your total investment budget (AUD)?
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 500000"
                value={formData.totalBudget}
                onChange={(e) => updateFormData("totalBudget", e.target.value)}
                className={cn("border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500", errors.totalBudget && "border-red-500")}
              />
              {errors.totalBudget && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.totalBudget}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="savings"
                className="text-base font-medium text-gray-900"
              >
                How much of this budget is from personal savings?
              </Label>
              <Input
                id="savings"
                type="number"
                placeholder="e.g., 100000"
                value={formData.personalSavings}
                onChange={(e) =>
                  updateFormData("personalSavings", e.target.value)
                }
                className={cn("border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500", errors.personalSavings && "border-red-500")}
              />
              {errors.personalSavings && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.personalSavings}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Do you plan to take a home loan?
              </Label>
              <RadioGroup
                value={formData.homeLoan}
                onValueChange={(value) => updateFormData("homeLoan", value)}
                className={cn(errors.homeLoan && "border-red-500")}
              >
                {["Yes", "No", "Not sure yet"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.homeLoan && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.homeLoan}
                </p>
              )}
            </div>

            {formData.homeLoan === "Yes" && (
              <div className="space-y-2">
                <Label
                  htmlFor="borrowing"
                  className="text-base font-medium text-gray-900"
                >
                  What's your borrowing capacity (estimated)?
                </Label>
                <Input
                  id="borrowing"
                  type="number"
                  placeholder="e.g., 400000"
                  value={formData.borrowingCapacity}
                  onChange={(e) =>
                    updateFormData("borrowingCapacity", e.target.value)
                  }
                  className={cn("border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500", errors.borrowingCapacity && "border-red-500")}
                />
                {errors.borrowingCapacity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.borrowingCapacity}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Any monthly cashflow expectations or limits (e.g. rent must
                cover loan)?
              </Label>
              <RadioGroup
                value={formData.cashflowExpectations}
                onValueChange={(value) =>
                  updateFormData("cashflowExpectations", value)
                }
                className={cn(errors.cashflowExpectations && "border-red-500")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Yes"
                    id="cashflow-yes"
                    className="border-cyan-500 text-cyan-600"
                  />
                  <Label htmlFor="cashflow-yes" className="text-sm font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="No"
                    id="cashflow-no"
                    className="border-cyan-500 text-cyan-600"
                  />
                  <Label htmlFor="cashflow-no" className="text-sm font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
              {formData.cashflowExpectations === "Yes" && (
                <>
                <Input
                  placeholder="Specify your cashflow requirements"
                  value={formData.cashflowAmount}
                  onChange={(e) =>
                    updateFormData("cashflowAmount", e.target.value)
                  }
                  className={cn("border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500", errors.cashflowAmount && "border-red-500")}
                />
                {errors.cashflowAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cashflowAmount}
                  </p>
                )}
                </>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Which regions are you open to investing in?
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "NSW",
                  "VIC",
                  "QLD",
                  "SA",
                  "WA",
                  "ACT",
                  "TAS",
                  "New Zealand (North/South Island)",
                ].map((region) => (
                  <div key={region} className="flex items-center space-x-2">
                    <Checkbox
                      id={region}
                      checked={formData.regions.includes(region)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("regions", [
                            ...formData.regions,
                            region,
                          ]);
                        } else {
                          updateFormData(
                            "regions",
                            formData.regions.filter((r) => r !== region)
                          );
                        }
                      }}
                      className={cn("border-cyan-500 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600", errors.regions && "border-red-500")}
                    />
                    <Label htmlFor={region} className={cn("text-sm font-normal", errors.regions && "text-red-500")}>
                      {region}
                    </Label>
                  </div>
                ))}
                {errors.regions && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.regions}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Are you open to interstate or remote investing?
              </Label>
              <RadioGroup
                value={formData.remoteInvesting}
                onValueChange={(value) =>
                  updateFormData("remoteInvesting", value)
                }
                className={cn(errors.remoteInvesting && "border-red-500")}
              >
                {["Yes", "No"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.remoteInvesting && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.remoteInvesting}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Do you prefer:
              </Label>
              <RadioGroup
                value={formData.areaPreference}
                onValueChange={(value) =>
                  updateFormData("areaPreference", value)
                }
                className={cn(errors.areaPreference && "border-red-500")}
              >
                {[
                  "Metro areas",
                  "Suburbs",
                  "Regional towns",
                  "No preference",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.areaPreference && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.areaPreference}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                What kind of property are you looking for?
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "Apartment / Unit",
                  "Townhouse",
                  "Detached house",
                  "Duplex",
                  "Land (for future build)",
                ].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.propertyType.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("propertyType", [
                            ...formData.propertyType,
                            type,
                          ]);
                        } else {
                          updateFormData(
                            "propertyType",
                            formData.propertyType.filter((t) => t !== type)
                          );
                        }
                      }}
                      className={cn("border-cyan-500 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600", errors.propertyType && "border-red-500")}
                    />
                    <Label htmlFor={type} className={cn("text-sm font-normal", errors.propertyType && "text-red-500")}>
                      {type}
                    </Label>
                  </div>
                ))}
                {errors.propertyType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.propertyType}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="bedrooms"
                className="text-base font-medium text-gray-900"
              >
                Bedrooms preferred:
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="1"
                max="5"
                placeholder="e.g., 3"
                value={formData.bedrooms}
                onChange={(e) => updateFormData("bedrooms", e.target.value)}
                className={cn("border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500", errors.bedrooms && "border-red-500")}
              />
              {errors.bedrooms && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bedrooms}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Do you want newly built or existing homes?
              </Label>
              <RadioGroup
                value={formData.propertyAge}
                onValueChange={(value) => updateFormData("propertyAge", value)}
                className={cn(errors.propertyAge && "border-red-500")}
              >
                {["Only new", "Only existing", "Open to both"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.propertyAge && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.propertyAge}
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Have you invested in property before?
              </Label>
              <RadioGroup
                value={formData.previousExperience}
                onValueChange={(value) =>
                  updateFormData("previousExperience", value)
                }
                className={cn(errors.previousExperience && "border-red-500")}
              >
                {["Yes", "No"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.previousExperience && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.previousExperience}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                How involved do you want to be?
              </Label>
              <RadioGroup
                value={formData.involvement}
                onValueChange={(value) => updateFormData("involvement", value)}
                className={cn(errors.involvement && "border-red-500")}
              >
                {[
                  "Very hands-on",
                  "Just want updates and returns",
                  "Somewhere in between",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.involvement && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.involvement}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Would you be open to co-investment or fractional ownership?
              </Label>
              <RadioGroup
                value={formData.coInvestment}
                onValueChange={(value) => updateFormData("coInvestment", value)}
                className={cn(errors.coInvestment && "border-red-500")}
              >
                {["Yes", "No", "Maybe"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={option}
                      className="border-cyan-500 text-cyan-600"
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.coInvestment && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.coInvestment}
                </p>
              )}
            </div>

            <div className="mt-8 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
              <div className="flex items-center space-x-2 text-cyan-800">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Privacy Note</span>
              </div>
              <p className="text-sm text-cyan-700 mt-2">
                Your information is secure. We'll never share your financial
                details without your permission.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4">
            <span className="text-2xl">&#128736;</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Onboarding Questionnaire
          </h1>
          <p className="text-gray-600">
            Break it down into sections so it feels easy and personalized.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  step.id === currentStep
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-500 text-white"
                    : step.id < currentStep
                    ? "bg-cyan-100 border-cyan-300 text-cyan-600"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4 mx-auto">
              <StepIcon className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">{renderStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 disabled:opacity-50 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === steps.length ? (
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8"
              onClick={handleSave}
            >
              Complete Setup
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
