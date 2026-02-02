// "use client";

// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Target, TrendingUp, MapPin, Network } from "lucide-react";
// import { motion } from "framer-motion";
// import LampContainer from "@/components/lamp-container";
// import { useState } from "react";
// import AustraliaMap from "@/components/maps/australia-map";
// import { useRouter } from "next/navigation";

// export default function Home() {
//   const [selectedCity, setSelectedCity] = useState("All");
//   const [showSuburbs, setShowSuburbs] = useState(false);
//   const router = useRouter();

//   // Group locations by major city regions
//   const cityGroups = {
//     All: "All Locations",
//     Sydney: "Sydney Region",
//     Melbourne: "Melbourne Region",
//     Brisbane: "Brisbane",
//     Perth: "Perth",
//     Adelaide: "Adelaide",
//     Hobart: "Hobart",
//     Darwin: "Darwin",
//     Canberra: "Canberra",
//   };

//   // List of suburbs that are in the map data
//   const sydneySuburbs = ["Sydney CBD", "Bondi", "Parramatta"];
//   const melbourneSuburbs = ["Melbourne CBD", "St Kilda", "Footscray"];
//   const otherCities = [
//     "Brisbane CBD",
//     "Perth CBD",
//     "Adelaide CBD",
//     "Hobart CBD",
//     "Darwin CBD",
//     "Canberra CBD",
//   ];

//   return (
//     <div className="flex min-h-screen flex-col">
//       {/* Header */}
//       <header className="sticky top-0 z-50 w-full glass">
//         <div className="container flex h-16 items-center justify-between">
//           <div className="flex items-center gap-2 hover-lift">
//             <Image
//               src="/logo.png"
//               alt="Propure Logo"
//               width={150}
//               height={50}
//               className=" object-cover"
//             />
//             <span className="text-3xl font-bold font-heading text-[#0c3c5d]">
//               Propure
//             </span>
//           </div>
//           <Button
//             className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 hover-lift"
//             onClick={() => router.push("/dashboard")}
//           >
//             Check the Demo
//           </Button>
//         </div>
//       </header>

//       <main className="flex-1">
//         {/* Hero Section with Lamp Effect */}
//         <section className="w-full">
//           <LampContainer>
//             <motion.div
//               initial={{ opacity: 0.5, y: 100 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{
//                 delay: 0.3,
//                 duration: 0.8,
//                 ease: "easeInOut",
//               }}
//               className="flex flex-col items-center max-w-xl mx-auto text-center"
//             >
//               <motion.h1
//                 initial={{ opacity: 0.5, y: 100 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{
//                   delay: 0.3,
//                   duration: 0.8,
//                   ease: "easeInOut",
//                 }}
//                 className="mt-8 bg-gradient-to-br from-[#6af0e2] to-[#0293f5] py-4 bg-clip-text text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent whitespace-nowrap font-heading"
//               >
//                 Pure Insights, Smart Investments
//               </motion.h1>

//               <motion.p
//                 initial={{ opacity: 0, y: 25 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{
//                   delay: 0.5,
//                   duration: 0.5,
//                   ease: "easeInOut",
//                 }}
//                 className="mt-4 text-slate-300 text-lg max-w-xl"
//               >
//                 Leverage cutting-edge artificial intelligence to uncover
//                 high-growth opportunities and build your Australian property
//                 portfolio with data-driven confidence.
//               </motion.p>

//               <motion.div
//                 initial={{ opacity: 0, y: 25 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{
//                   delay: 0.7,
//                   duration: 0.5,
//                   ease: "easeInOut",
//                 }}
//                 className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-md"
//               >
//                 <Input
//                   type="email"
//                   placeholder="your.email@example.com"
//                   className="glass border-border/50 text-[#0f0c4388] placeholder:text-black/60 focus:ring-2 focus:ring-white/20"
//                 />
//                 <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 whitespace-nowrap hover-lift">
//                   Join the Waitlist
//                 </Button>
//               </motion.div>

//               <motion.p
//                 initial={{ opacity: 0 }}
//                 whileInView={{ opacity: 1 }}
//                 transition={{
//                   delay: 0.9,
//                   duration: 0.5,
//                   ease: "easeInOut",
//                 }}
//                 className="text-sm mt-4 text-slate-400"
//               >
//                 Be among the first to access the future of property investment.
//                 Launching 2025.
//               </motion.p>
//             </motion.div>
//           </LampContainer>
//         </section>

//         {/* Problem/Solution Section */}
//         <section className="py-16 bg-[#F8F9FA]">
//           <div className="container">
//             <div className="grid md:grid-cols-2 gap-8">
//               <div className="glass p-8 rounded-xl smooth-shadow hover:shadow-lg transition-all">
//                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 hover-lift">
//                   <svg
//                     className="w-6 h-6 text-primary"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold mb-3 font-heading text-primary">
//                   Navigating the Australian Property Market Feels Overwhelming?
//                 </h3>
//                 <p className="text-muted-foreground">
//                   Scattered data, biased advice, and unpredictable shifts make
//                   confident investing difficult.
//                 </p>
//               </div>
//               <div className="bg-white p-8 rounded-xl shadow-sm">
//                 <div className="w-12 h-12 rounded-full bg-[#4FD1C5]/10 flex items-center justify-center mb-4">
//                   <svg
//                     className="w-6 h-6 text-[#4FD1C5]"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold mb-3 font-heading text-[#4FD1C5]">
//                   Propure: Your Intelligent Advantage
//                 </h3>
//                 <p className="text-[#343A40]">
//                   We harness AI to cut through the noise, providing clear,
//                   actionable insights tailored to your investment goals.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Key Features Section */}
//         <section className="py-16">
//           <div className="container">
//             <h2 className="text-3xl font-bold text-center mb-12 font-heading text-[#0B3C5D]">
//               Unlock Your Investment Edge
//             </h2>
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <Card className="transition-all duration-300 hover:shadow-lg">
//                 <CardContent className="p-6">
//                   <div className="w-12 h-12 rounded-full bg-[#0B3C5D]/10 flex items-center justify-center mb-4">
//                     <Target className="w-6 h-6 text-[#0B3C5D]" />
//                   </div>
//                   <h3 className="text-lg font-bold mb-2 font-heading text-[#0B3C5D]">
//                     AI-Driven Opportunity Identification
//                   </h3>
//                   <p className="text-[#343A40] text-sm">
//                     Discover undervalued properties and high-yield suburbs
//                     identified by our proprietary AI algorithms analyzing
//                     thousands of data points.
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card className="transition-all duration-300 hover:shadow-lg">
//                 <CardContent className="p-6">
//                   <div className="w-12 h-12 rounded-full bg-[#4FD1C5]/10 flex items-center justify-center mb-4">
//                     <TrendingUp className="w-6 h-6 text-[#4FD1C5]" />
//                   </div>
//                   <h3 className="text-lg font-bold mb-2 font-heading text-[#4FD1C5]">
//                     Predictive Market Analytics
//                   </h3>
//                   <p className="text-[#343A40] text-sm">
//                     Forecast potential capital growth, rental yields, and market
//                     volatility with forward-looking models trained on historical
//                     Australian data.
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card className="transition-all duration-300 hover:shadow-lg">
//                 <CardContent className="p-6">
//                   <div className="w-12 h-12 rounded-full bg-[#0B3C5D]/10 flex items-center justify-center mb-4">
//                     <MapPin className="w-6 h-6 text-[#0B3C5D]" />
//                   </div>
//                   <h3 className="text-lg font-bold mb-2 font-heading text-[#0B3C5D]">
//                     Hyperlocal Insight Engine
//                   </h3>
//                   <p className="text-[#343A40] text-sm">
//                     Drill down into specific suburbs with granular data on
//                     demographics, infrastructure projects, zoning changes, and
//                     localised trends.
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card className="transition-all duration-300 hover:shadow-lg">
//                 <CardContent className="p-6">
//                   <div className="w-12 h-12 rounded-full bg-[#4FD1C5]/10 flex items-center justify-center mb-4">
//                     <Network className="w-6 h-6 text-[#4FD1C5]" />
//                   </div>
//                   <h3 className="text-lg font-bold mb-2 font-heading text-[#4FD1C5]">
//                     Seamless Investment Journey
//                     <span className="text-xs ml-2 text-[#FF6F61]">
//                       (Coming Soon)
//                     </span>
//                   </h3>
//                   <p className="text-[#343A40] text-sm">
//                     Access integrated support – from shortlisting and due
//                     diligence assistance to connecting with vetted mortgage
//                     brokers and property managers.
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </section>

//         {/* Interactive Market Trends Section */}
//         <section className="py-16 bg-[#F8F9FA]">
//           <div className="container">
//             <h2 className="text-3xl font-bold text-center mb-4 font-heading text-[#0B3C5D]">
//               Explore Australian Market Dynamics
//               <span className="text-sm ml-2 text-[#FF6F61]">(Demo)</span>
//             </h2>
//             <p className="text-center text-[#343A40] mb-12 max-w-2xl mx-auto">
//               Get a glimpse of how Propure visualizes complex data.
//               <span className="text-sm text-[#343A40]/70 block mt-1">
//                 This is a simplified demonstration. Full interactive features
//                 launching soon.
//               </span>
//             </p>

//             <div className="glass p-4 rounded-xl smooth-shadow hover:shadow-lg transition-all">
//               <div className="mb-4">
//                 <div className="flex justify-between items-center mb-2">
//                   <h3 className="text-md font-semibold text-[#0B3C5D]">
//                     Filter by Location
//                   </h3>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setShowSuburbs(!showSuburbs)}
//                     className="text-xs"
//                   >
//                     {showSuburbs ? "Show Cities" : "Show Suburbs"}
//                   </Button>
//                 </div>

//                 {!showSuburbs ? (
//                   <div className="flex flex-wrap gap-2 justify-start">
//                     {(
//                       Object.keys(cityGroups) as Array<keyof typeof cityGroups>
//                     ).map((city) => (
//                       <div
//                         key={city}
//                         className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${
//                           selectedCity === city
//                             ? "border-transparent bg-primary text-primary-foreground"
//                             : "text-foreground border-border"
//                         } hover-lift`}
//                         onClick={() => setSelectedCity(city)}
//                       >
//                         {cityGroups[city]}
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <div className="mb-2">
//                       <h4 className="text-xs font-semibold text-[#0B3C5D] mb-1">
//                         Sydney Suburbs
//                       </h4>
//                       <div className="flex flex-wrap gap-2">
//                         {sydneySuburbs.map((suburb) => (
//                           <div
//                             key={suburb}
//                             className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${
//                               selectedCity === suburb
//                                 ? "border-transparent bg-[#FF6F61] text-white"
//                                 : "text-foreground border-border"
//                             } hover-lift`}
//                             onClick={() => setSelectedCity(suburb)}
//                           >
//                             {suburb}
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="mb-2">
//                       <h4 className="text-xs font-semibold text-[#0B3C5D] mb-1">
//                         Melbourne Suburbs
//                       </h4>
//                       <div className="flex flex-wrap gap-2">
//                         {melbourneSuburbs.map((suburb) => (
//                           <div
//                             key={suburb}
//                             className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${
//                               selectedCity === suburb
//                                 ? "border-transparent bg-[#FF6F61] text-white"
//                                 : "text-foreground border-border"
//                             } hover-lift`}
//                             onClick={() => setSelectedCity(suburb)}
//                           >
//                             {suburb}
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <h4 className="text-xs font-semibold text-[#0B3C5D] mb-1">
//                         Other Major Cities
//                       </h4>
//                       <div className="flex flex-wrap gap-2">
//                         {otherCities.map((city) => (
//                           <div
//                             key={city}
//                             className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${
//                               selectedCity === city
//                                 ? "border-transparent bg-[#FF6F61] text-white"
//                                 : "text-foreground border-border"
//                             } hover-lift`}
//                             onClick={() => setSelectedCity(city)}
//                           >
//                             {city}
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="mt-3">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setSelectedCity("All")}
//                         className="text-xs text-[#0B3C5D]"
//                       >
//                         Reset All Filters
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <AustraliaMap selectedCity={selectedCity} />

//               <div className="mt-4 flex justify-between text-xs text-[#343A40]/70">
//                 <span>Low Growth (0-2%)</span>
//                 <div className="w-32 h-2 rounded-full bg-gradient-to-r from-[#E9ECEF] via-[#4FD1C5] to-[#FF6F61]"></div>
//                 <span>High Growth (8%+)</span>
//               </div>

//               <div className="mt-2 text-xs text-center text-[#343A40]/70">
//                 <p>
//                   Click on markers to see detailed growth predictions for
//                   specific suburbs
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Social Proof Section */}
//         <section className="py-16">
//           <div className="container">
//             <h2 className="text-3xl font-bold text-center mb-12 font-heading text-[#0B3C5D]">
//               Be in Good Company
//             </h2>
//             <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
//               <Card className="transition-all duration-300 hover:shadow-lg">
//                 <CardContent className="p-6">
//                   <p className="italic text-[#343A40] mb-4">
//                     "Finding reliable, unbiased property data in Australia is a
//                     challenge. An AI-powered solution is exactly what the market
//                     needs."
//                   </p>
//                   <div className="flex items-center">
//                     <div className="w-10 h-10 rounded-full bg-[#0B3C5D]/10 mr-3"></div>
//                     <div>
//                       <p className="font-semibold text-[#0B3C5D]">
//                         Aspiring Investor
//                       </p>
//                       <p className="text-xs text-[#343A40]/70">Sydney</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card className="transition-all duration-300 hover:shadow-lg">
//                 <CardContent className="p-6">
//                   <p className="italic text-[#343A40] mb-4">
//                     "I'm excited to see how AI can streamline the research
//                     process and uncover hidden gems."
//                   </p>
//                   <div className="flex items-center">
//                     <div className="w-10 h-10 rounded-full bg-[#4FD1C5]/10 mr-3"></div>
//                     <div>
//                       <p className="font-semibold text-[#4FD1C5]">
//                         Experienced Portfolio Holder
//                       </p>
//                       <p className="text-xs text-[#343A40]/70">Melbourne</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             <div className="flex justify-center mt-8 gap-6">
//               <div className="w-16 h-8 bg-[#F8F9FA] rounded flex items-center justify-center text-xs text-[#343A40]/50">
//                 Media 1
//               </div>
//               <div className="w-16 h-8 bg-[#F8F9FA] rounded flex items-center justify-center text-xs text-[#343A40]/50">
//                 Media 2
//               </div>
//               <div className="w-16 h-8 bg-[#F8F9FA] rounded flex items-center justify-center text-xs text-[#343A40]/50">
//                 Media 3
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Roadmap Section */}
//         <section className="py-16 bg-[#F8F9FA]">
//           <div className="container">
//             <h2 className="text-3xl font-bold text-center mb-12 font-heading text-[#0B3C5D]">
//               Shaping the Future of Property Investment
//             </h2>

//             <div className="max-w-3xl mx-auto">
//               <div className="relative">
//                 {/* Timeline line */}
//                 <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-[#E9ECEF] transform md:translate-x-[-0.5px]"></div>

//                 {/* Timeline items */}
//                 <div className="space-y-12">
//                   <div className="relative flex flex-col md:flex-row items-center md:justify-between">
//                     <div className="order-2 md:order-1 w-full md:w-[calc(50%-20px)] md:text-right p-4">
//                       <h3 className="text-lg font-bold text-[#0B3C5D]">
//                         Q1 2025
//                       </h3>
//                       <p className="font-medium">Platform Beta Launch</p>
//                       <p className="text-sm text-[#343A40]/70">
//                         AI Insights Engine, Core Analytics
//                       </p>
//                     </div>
//                     <div className="order-1 md:order-2 z-10 w-8 h-8 rounded-full bg-[#0B3C5D] flex items-center justify-center mb-4 md:mb-0">
//                       <div className="w-3 h-3 rounded-full bg-white"></div>
//                     </div>
//                     <div className="order-3 w-full md:w-[calc(50%-20px)] md:text-left p-4 md:block hidden"></div>
//                   </div>

//                   <div className="relative flex flex-col md:flex-row items-center md:justify-between">
//                     <div className="order-2 md:order-1 w-full md:w-[calc(50%-20px)] md:text-right p-4 md:block hidden"></div>
//                     <div className="order-1 md:order-2 z-10 w-8 h-8 rounded-full bg-[#4FD1C5] flex items-center justify-center mb-4 md:mb-0">
//                       <div className="w-3 h-3 rounded-full bg-white"></div>
//                     </div>
//                     <div className="order-3 w-full md:w-[calc(50%-20px)] md:text-left p-4">
//                       <h3 className="text-lg font-bold text-[#4FD1C5]">
//                         Q2 2025
//                       </h3>
//                       <p className="font-medium">
//                         Advanced Portfolio Tracking & Reporting Tools
//                       </p>
//                       <p className="text-sm text-[#343A40]/70">
//                         Monitor and analyze your investments
//                       </p>
//                     </div>
//                   </div>

//                   <div className="relative flex flex-col md:flex-row items-center md:justify-between">
//                     <div className="order-2 md:order-1 w-full md:w-[calc(50%-20px)] md:text-right p-4">
//                       <h3 className="text-lg font-bold text-[#0B3C5D]">
//                         Q3 2025
//                       </h3>
//                       <p className="font-medium">Integration Marketplace</p>
//                       <p className="text-sm text-[#343A40]/70">
//                         Connect with Brokers, Managers
//                       </p>
//                     </div>
//                     <div className="order-1 md:order-2 z-10 w-8 h-8 rounded-full bg-[#0B3C5D] flex items-center justify-center mb-4 md:mb-0">
//                       <div className="w-3 h-3 rounded-full bg-white"></div>
//                     </div>
//                     <div className="order-3 w-full md:w-[calc(50%-20px)] md:text-left p-4 md:block hidden"></div>
//                   </div>

//                   <div className="relative flex flex-col md:flex-row items-center md:justify-between">
//                     <div className="order-2 md:order-1 w-full md:w-[calc(50%-20px)] md:text-right p-4 md:block hidden"></div>
//                     <div className="order-1 md:order-2 z-10 w-8 h-8 rounded-full bg-[#4FD1C5] flex items-center justify-center mb-4 md:mb-0">
//                       <div className="w-3 h-3 rounded-full bg-white"></div>
//                     </div>
//                     <div className="order-3 w-full md:w-[calc(50%-20px)] md:text-left p-4">
//                       <h3 className="text-lg font-bold text-[#4FD1C5]">
//                         Q4 2025
//                       </h3>
//                       <p className="font-medium">
//                         Full Service Investment Support
//                       </p>
//                       <p className="text-sm text-[#343A40]/70">
//                         End-to-end investment journey assistance
//                       </p>
//                     </div>
//                   </div>

//                   <div className="relative flex flex-col md:flex-row items-center md:justify-between">
//                     <div className="order-2 md:order-1 w-full md:w-[calc(50%-20px)] md:text-right p-4">
//                       <h3 className="text-lg font-bold text-[#FF6F61]">
//                         Beyond
//                       </h3>
//                       <p className="font-medium">
//                         Continuous AI Model Improvement
//                       </p>
//                       <p className="text-sm text-[#343A40]/70">
//                         National Coverage Expansion
//                       </p>
//                     </div>
//                     <div className="order-1 md:order-2 z-10 w-8 h-8 rounded-full bg-[#FF6F61] flex items-center justify-center mb-4 md:mb-0">
//                       <div className="w-3 h-3 rounded-full bg-white"></div>
//                     </div>
//                     <div className="order-3 w-full md:w-[calc(50%-20px)] md:text-left p-4 md:block hidden"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Final CTA Section */}
//         <section className="py-16 bg-gradient-to-r from-[#0B3C5D] to-[#4FD1C5]">
//           <div className="container">
//             <div className="max-w-2xl mx-auto text-center text-white">
//               <h3 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
//                 Ready to Invest Smarter?
//               </h3>
//               <p className="mb-8">
//                 Don't miss out. Join the waitlist for Propure and be the first
//                 to know when we launch. Get early bird benefits and exclusive
//                 content.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
//                 <Input
//                   type="email"
//                   placeholder="your.email@example.com"
//                   className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
//                 />
//                 <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 whitespace-nowrap">
//                   Secure My Early Access
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//       {/* Footer */}
//       <footer className="py-8 bg-primary text-primary-foreground">
//         <div className="container">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div className="flex items-center gap-2 mb-4 md:mb-0 hover-lift">
//               <Image
//                 src="/logo-white.png"
//                 alt="Propure Logo"
//                 width={250}
//                 height={50}
//                 className="object-cover"
//               />
//               <span className="text-3xl font-bold font-heading">Propure</span>
//             </div>
//             <div className="text-sm text-primary-foreground/60">
//               © 2024 Propure. All Rights Reserved.
//             </div>
//             <div className="flex gap-4 mt-4 md:mt-0">
//               <a
//                 href="#"
//                 className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm hover-lift"
//               >
//                 Privacy Policy
//               </a>
//               <a
//                 href="#"
//                 className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm hover-lift"
//               >
//                 Terms of Service
//               </a>
//             </div>
//           </div>
//           <div className="text-center mt-6 text-xs text-primary-foreground/40">
//             Launching in Australia, 2025
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }








import Header from '@/components/main/Header'
import Hero from '@/components/main/Hero'
import Partners from '@/components/main/Partners'
import TrustedData from '@/components/main/TrustedData'
import UserAttraction from '@/components/main/UserAttraction'
import CoreServices from '@/components/main/CoreServices'
import HowItWorks from '@/components/main/HowItWorks'
import FAQ from '@/components/main/FAQ'
import Footer from '@/components/main/Footer'
import FloatingActionButton from '@/components/main/FloatingActionButton'
import MosaicBackground from '@/components/main/MosaicBackground'
import Workspace from '@/components/main/Workspace'
import DataMetrics from '@/components/main/DataMetrics'
import CTASection from '@/components/main/CTASection'
import DataTrust from '@/components/main/DataTrust'
import InvestorLogs from '@/components/main/InvestorLogs'
import SocialProof from '@/components/main/SocialProof'
import UseCases from '@/components/main/UseCases'
import FeatureScrollSpy from '@/components/main/Featurescrollspy'

export default function Home() {
  return (
    <>
      <MosaicBackground />
      <Header path={"/"} />
      <main>
        <Hero />
        <Partners />
        <TrustedData />
        <UserAttraction />
        <Workspace />
        {/* <CoreServices /> */}
        <FeatureScrollSpy />
        <DataMetrics />
        <DataTrust />
        <HowItWorks />
        <UseCases />
        <SocialProof />
        <InvestorLogs />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
      <FloatingActionButton />
    </>
  )
}

