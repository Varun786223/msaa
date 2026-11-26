import { CalibrationLongitudinal } from './components/CalibrationLongitudinal';
import { ClinicalValidation } from './components/ClinicalValidation';
import { FusionConfounders } from './components/FusionConfounders';
import { HeroFlashlight } from './components/HeroFlashlight';
import { LiveAnalyserWorkspace } from './components/LiveAnalyserWorkspace';
import { Navbar } from './components/Navbar';
import { PrivacyVaultFooter } from './components/PrivacyVaultFooter';
import { SensingSuite } from './components/SensingSuite';
import { LiveEngineProvider } from './context/LiveEngineContext';

export default function App() {
  return (
    <LiveEngineProvider>
      <div className="min-h-screen bg-[#FFFFFF] text-[#1F2A38] overflow-x-clip">
        <Navbar />
        <main>
          <HeroFlashlight />
          <SensingSuite />
          <FusionConfounders />
          <CalibrationLongitudinal />
          <ClinicalValidation />
          <PrivacyVaultFooter />
        </main>
        <LiveAnalyserWorkspace />
      </div>
    </LiveEngineProvider>
  );
}
