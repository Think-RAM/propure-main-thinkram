"use client";
import {
  Check,
  Zap,
  Rocket,
  Brain,
  Clock,
  Users,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/use-subscription";
import { Plan, ProductPlanPriceId } from "@/types/types";
import { toast } from "sonner";
import getCheckoutSession from "@/lib/stripe/getStripeCheckout";
import { getStripe } from "@/lib/stripe";

const plans = [
  {
    id: "free-trial",
    name: "Free Trial",
    icon: Clock,
    price: { usd: "$0" },
    duration: "14 Days",
    description: "Perfect for first-time users exploring the platform.",
    popular: false,
    features: [
      "Smart onboarding questionnaire",
      "Access to 5 property recommendations",
      "View predicted price growth, rent, and fair market value",
      "Filter properties by region & budget",
      "Limited access to suburb insights",
      "Save up to 3 properties in watchlist",
      "Email support",
    ],
  },
  {
    id: "starter-plan",
    name: "Starter",
    icon: Rocket,
    price: { usd: "$9" },
    duration: "per month",
    description: "Best for casual investors and first-time buyers.",
    popular: true,
    features: [
      "Everything in Trial, plus:",
      "50 property recommendations per month",
      "Unlimited watchlist & notes",
      "Access to suburb-level heatmaps (growth & yield)",
      "Compare properties side-by-side",
      "Property scorecard with AI summary (growth + rent + fit score)",
      "Download property reports (PDF)",
      "Priority email support",
      "Early access to new features",
    ],
  },
  {
    id: "pro-plan",
    name: "Pro",
    icon: Brain,
    price: { usd: "$29" },
    duration: "per month",
    description: "Ideal for serious investors and wealth builders.",
    popular: false,
    features: [
      "Everything in Starter, plus:",
      "Unlimited AI-powered recommendations",
      "Personal investment dashboard (track goals & portfolio)",
      "AI-based suburb matcher (predict high-growth suburbs)",
      "Custom filters (e.g., near schools, low vacancy suburbs, rental ROI filters)",
      "Access to future 1-click buying flow (Phase 2)",
      'AI property concierge: ask questions like "Find me a 3BHK in suburbs with 5%+ yield under $80L"',
      "WhatsApp or in-app chat support",
      "Export data to Excel / CSV",
    ],
  },
];

export default function SubscriptionPage({ userId }: { userId: string }) {
  const { isSubscriptionLoaded, currentPlan, isExpired } =
    useSubscription([]);

  const handleCheckout = async (planId: Plan) => {
    if (!isSubscriptionLoaded) {
      return;
    }
    try {
      // Logic to upgrade the plan
      const checkoutSession = await getCheckoutSession(ProductPlanPriceId[planId], userId);
      const stripe = await getStripe();
      if (!checkoutSession || !stripe) {
        throw new Error("Failed to create checkout session or load Stripe.");
      }
      const { error } = await stripe?.redirectToCheckout({
        sessionId: checkoutSession,
      });
      if (error) {
        console.error("Stripe checkout error:", error);
        toast.error("Failed to redirect to checkout. Please try again.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error(
        "An error occurred while processing your request. Please try again later."
      );
      return;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      <Button
        className="absolute top-4 right-4 z-50 hover:bg-transparent"
        variant="ghost"
        onClick={() => window.history.back()}
      >
        <X className="h-6 w-6 text-slate-500" />
      </Button>
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-cyan-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              Pricing & Subscription Plans
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the perfect plan to accelerate your property investment
            journey
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "border-2 border-cyan-500 shadow-lg scale-105"
                    : "border border-slate-200 hover:border-cyan-300"
                }
                ${
                  currentPlan === plan.id &&
                  !isExpired &&
                  "border-green-600 shadow-lg scale-105"
                }
                  ${
                    currentPlan === plan.id &&
                    isExpired &&
                    "border-red-600 shadow-lg scale-105"
                  }

                    `}
              >
                {plan.popular && currentPlan !== plan.id && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyan-500 hover:bg-cyan-600">
                    Most Popular
                  </Badge>
                )}

                {currentPlan === plan.id && !isExpired && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600">
                    Active Plan
                  </Badge>
                )}
                {currentPlan === plan.id && isExpired && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-red-600">
                    Expired Plan
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        plan.popular ? "bg-cyan-100" : "bg-slate-100"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          plan.popular ? "text-cyan-600" : "text-slate-600"
                        }`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {plan.name} Plan
                  </CardTitle>
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-slate-500">
                        {plan.price.usd}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{plan.duration}</p>
                  </div>
                  <CardDescription className="mt-4 text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                        <span
                          className={`text-sm ${
                            feature.includes("Everything in")
                              ? "font-semibold text-slate-700"
                              : "text-slate-600"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    className={`w-full
                      ${
                        plan.popular && currentPlan !== plan.id
                          ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                          : "bg-white hover:bg-cyan-50 text-cyan-600 border border-cyan-600"
                      }
                      ${
                        currentPlan === plan.id && !isExpired
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : ""
                      }
                      ${
                        currentPlan === plan.id && isExpired
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : ""
                      }
                    `}
                    size="lg"
                    disabled={
                      ((currentPlan === plan.id && !isExpired) ||
                        (plan.id === "free-trial" &&
                          currentPlan &&
                          !isExpired)) ??
                      false
                    }
                    onClick={() => handleCheckout(plan.id as Plan)}
                  >
                    {currentPlan === plan.id && !isExpired
                      ? "Current Plan"
                      : currentPlan === plan.id && isExpired
                      ? "Renew Plan"
                      : plan.id === "free-trial"
                      ? currentPlan && !isExpired
                        ? "Trial Used"
                        : "Start Free Trial"
                      : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-cyan-100">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-6 w-6 text-cyan-600" />
              <h3 className="text-xl font-semibold text-slate-900">
                Why Choose Our Platform?
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="bg-cyan-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-cyan-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  AI-Powered Insights
                </h4>
                <p className="text-sm text-slate-600">
                  Advanced algorithms analyze market trends and predict property
                  performance
                </p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-cyan-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Real-Time Data
                </h4>
                <p className="text-sm text-slate-600">
                  Access up-to-date market information and property valuations
                </p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-cyan-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Expert Support
                </h4>
                <p className="text-sm text-slate-600">
                  Get guidance from our team of property investment experts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ or Contact */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            Have questions about our plans? We're here to help.
          </p>
          <Button
            variant="outline"
            className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 bg-transparent"
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
