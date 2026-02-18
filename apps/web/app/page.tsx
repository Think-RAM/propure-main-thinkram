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

