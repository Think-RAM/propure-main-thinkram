import { Calendar, FileText, CreditCard, Users, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "Inspection",
    icon: Calendar,
    description: "See the property in person and assess its condition",
  },
  {
    title: "Reports",
    icon: FileText,
    description: "Review inspection and appraisal reports",
  },
  {
    title: "Finance",
    icon: CreditCard,
    description: "Secure financing and finalize loan approval",
  },
  {
    title: "Agent",
    icon: Users,
    description: "Work with your real estate agent to complete the purchase",
  },
];

export default function NextSteps() {
  return (
    <section className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <CheckCircle className="text-teal-400" size={20} />
        <h2 className="text-lg font-semibold">Next Steps</h2>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((s) => (
          <Card
            key={s.title}
            className="
              group cursor-pointer
              bg-neutral-900 border-neutral-950
              hover:border-teal-500/50
              transition-all duration-200
            "
          >
            <CardContent className="p-5 text-center space-y-3">
              {/* Icon (IMPORTANT - matches original feel) */}
              <div
                className="
                  w-12 h-12 mx-auto rounded-xl
                  bg-neutral-800 flex items-center justify-center
                  text-teal-400
                  transition-all
                  group-hover:bg-teal-500 group-hover:text-white
                "
              >
                <s.icon size={20} />
              </div>

              {/* Title */}
              <p className="font-medium text-white">{s.title}</p>

              {/* Description */}
              <p className="text-sm text-neutral-400 leading-relaxed">
                {s.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}