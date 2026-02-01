import { useState } from 'react';
import { Search, Download, Shield, Activity, Brain, Network, FileCheck } from 'lucide-react';
import { performScreening } from './services/screeningService';
import { getDeviceIP } from './utils/ipUtils';
import { generatePDFReport } from './utils/pdfGenerator';
import ResultsDisplay from './components/ResultsDisplay';
import { ScreeningResult } from './lib/supabase';
import logoImage from '/public/whatsapp_image_2025-12-16_at_19.41.38_61d2c9de.jpg';

function App() {
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCountry, setCustomerCountry] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);

  const handleScreening = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId.trim() || !customerName.trim() || !customerCountry.trim() || !entityType.trim() || !dateOfBirth.trim() || !accountNumber.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const deviceIp = await getDeviceIP();
      const screeningResult = await performScreening(
        customerId.trim(),
        customerName.trim(),
        customerCountry.trim(),
        entityType.trim(),
        dateOfBirth,
        accountNumber.trim(),
        deviceIp
      );

      setResult(screeningResult);
    } catch (error) {
      console.error('Screening failed:', error);
      alert('Failed to perform screening. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;
    generatePDFReport(result);
  };

  const handleReset = () => {
    setResult(null);
    setCustomerId('');
    setCustomerName('');
    setCustomerCountry('');
    setEntityType('');
    setDateOfBirth('');
    setAccountNumber('');
  };

  return (
    <div className="min-h-screen bg-cyberbg text-white">
      <header className="border-b-2 border-neongreen bg-cyberbg/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src={logoImage}
              alt="Finorion Logo"
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-wide">FINORION</h1>
              <p className="text-sm opacity-70">Advanced Sanction Screening Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="border border-neongreen rounded-lg p-4 bg-cyberbg/50 backdrop-blur-sm hover:bg-cyberbg/70 transition-all">
            <Brain className="w-8 h-8 text-neongreen mb-2" />
            <h3 className="text-sm font-semibold">Context-Aware</h3>
            <p className="text-xs opacity-70">Intelligent Screening</p>
          </div>
          <div className="border border-neongreen rounded-lg p-4 bg-cyberbg/50 backdrop-blur-sm hover:bg-cyberbg/70 transition-all">
            <Shield className="w-8 h-8 text-neongreen mb-2" />
            <h3 className="text-sm font-semibold">Explainable AI</h3>
            <p className="text-xs text-gray-400">Clear Reasoning</p>
          </div>
          <div className="border border-neongreen rounded-lg p-4 bg-cyberbg/50 backdrop-blur-sm hover:bg-cyberbg/70 transition-all">
            <Activity className="w-8 h-8 text-neongreen mb-2" />
            <h3 className="text-sm font-semibold">Adaptive Learning</h3>
            <p className="text-xs opacity-70">Continuous Improvement</p>
          </div>
          <div className="border border-neongreen rounded-lg p-4 bg-cyberbg/50 backdrop-blur-sm hover:bg-cyberbg/70 transition-all">
            <Network className="w-8 h-8 text-neongreen mb-2" />
            <h3 className="text-sm font-semibold">Network Detection</h3>
            <p className="text-xs opacity-70">Graph-Based Analysis</p>
          </div>
          <div className="border border-neongreen rounded-lg p-4 bg-cyberbg/50 backdrop-blur-sm hover:bg-cyberbg/70 transition-all">
            <FileCheck className="w-8 h-8 text-neongreen mb-2" />
            <h3 className="text-sm font-semibold">AML + Sanctions</h3>
            <p className="text-xs opacity-70">Comprehensive Check</p>
          </div>
          <div className="border border-neongreen rounded-lg p-4 bg-cyberbg/50 backdrop-blur-sm hover:bg-cyberbg/70 transition-all">
            <Activity className="w-8 h-8 text-neongreen mb-2" />
            <h3 className="text-sm font-semibold">Real-Time Engine</h3>
            <p className="text-xs opacity-70">Micro Decisions</p>
          </div>
        </div>

        <div className="border-2 border-neongreen rounded-lg p-6 bg-cyberbg/50 backdrop-blur-sm mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Search className="w-7 h-7 text-neongreen" />
            Sanction Screening
          </h2>

          <form onSubmit={handleScreening} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter customer ID"
                  className="w-full px-4 py-3 bg-cyberbg border-2 border-neongreen/50 rounded-lg focus:border-neongreen focus:outline-none transition-all text-white placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 bg-cyberbg border-2 border-neongreen/50 rounded-lg focus:border-neongreen focus:outline-none transition-all text-white placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerCountry}
                  onChange={(e) => setCustomerCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-cyberbg border-2 border-neongreen/50 rounded-lg focus:border-neongreen focus:outline-none transition-all text-white"
                  disabled={isLoading}
                >
                  <option value="">Select country</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="China">China</option>
                  <option value="India">India</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Mexico">Mexico</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Russia">Russia</option>
                  <option value="Iran">Iran</option>
                  <option value="North Korea">North Korea</option>
                  <option value="Syria">Syria</option>
                  <option value="Venezuela">Venezuela</option>
                  <option value="Yemen">Yemen</option>
                  <option value="Belarus">Belarus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Entity Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full px-4 py-3 bg-cyberbg border-2 border-neongreen/50 rounded-lg focus:border-neongreen focus:outline-none transition-all text-white"
                  disabled={isLoading}
                >
                  <option value="">Select entity type</option>
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                  <option value="Business">Business</option>
                  <option value="Financial Institution">Financial Institution</option>
                  <option value="Government">Government</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 bg-cyberbg border-2 border-neongreen/50 rounded-lg focus:border-neongreen focus:outline-none transition-all text-white"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full px-4 py-3 bg-cyberbg border-2 border-neongreen/50 rounded-lg focus:border-neongreen focus:outline-none transition-all text-white placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-neongreen hover:bg-neongreen_dark disabled:bg-gray-600 disabled:cursor-not-allowed text-cyberbg font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Screening...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Run Screening
                  </>
                )}
              </button>

              {result && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 border-2 border-neongreen text-neongreen hover:bg-neongreen hover:text-cyberbg font-semibold rounded-lg transition-all duration-200"
                >
                  New Screening
                </button>
              )}
            </div>
          </form>
        </div>

        {result && (
          <>
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleDownloadReport}
                className="bg-neongreen hover:bg-neongreen_dark text-cyberbg font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF Report
              </button>
            </div>

            <ResultsDisplay result={result} />
          </>
        )}
      </main>

      <footer className="border-t-2 border-neongreen mt-12 py-6 bg-cyberbg/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>Finorion - Advanced AI-Powered Sanction Screening & AML Compliance Platform</p>
          <p className="mt-2">Powered by Real-Time Micro Decision Engine</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
