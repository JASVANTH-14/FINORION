import { useState, useRef } from 'react';
import { Search, Download, Upload, Shield, Activity, Brain, Network, FileCheck } from 'lucide-react';
import { performScreening } from './services/screeningService';
import { getDeviceIP } from './utils/ipUtils';
import { generatePDFReport } from './utils/pdfGenerator';
import ResultsDisplay from './components/ResultsDisplay';
import { ScreeningResult } from './lib/supabase';

function App() {
  const [customerName, setCustomerName] = useState('');
  const [customerCountry, setCustomerCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScreening = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerCountry.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const deviceIp = await getDeviceIP();
      const screeningResult = await performScreening(
        customerName.trim(),
        customerCountry.trim(),
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
    generatePDFReport(result, logoUrl || undefined);
  };

  const handleReset = () => {
    setResult(null);
    setCustomerName('');
    setCustomerCountry('');
  };

  return (
    <div className="min-h-screen bg-[#112836] text-white">
      <header className="border-b-2 border-[#0A988B] bg-[#112836]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-[#0A988B]" />
            <div>
              <h1 className="text-3xl font-bold tracking-wide">FINORION</h1>
              <p className="text-sm text-gray-400">Advanced Sanction Screening Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-12 h-12 object-contain rounded-lg border-2 border-[#0A988B]"
              />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A988B] hover:bg-[#0A988B]/80 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              {logoUrl ? 'Change Logo' : 'Upload Logo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="border border-[#0A988B] rounded-lg p-4 bg-[#112836]/50 backdrop-blur-sm hover:bg-[#112836]/70 transition-all">
            <Brain className="w-8 h-8 text-[#0A988B] mb-2" />
            <h3 className="text-sm font-semibold">Context-Aware</h3>
            <p className="text-xs text-gray-400">Intelligent Screening</p>
          </div>
          <div className="border border-[#0A988B] rounded-lg p-4 bg-[#112836]/50 backdrop-blur-sm hover:bg-[#112836]/70 transition-all">
            <Shield className="w-8 h-8 text-[#0A988B] mb-2" />
            <h3 className="text-sm font-semibold">Explainable AI</h3>
            <p className="text-xs text-gray-400">Clear Reasoning</p>
          </div>
          <div className="border border-[#0A988B] rounded-lg p-4 bg-[#112836]/50 backdrop-blur-sm hover:bg-[#112836]/70 transition-all">
            <Activity className="w-8 h-8 text-[#0A988B] mb-2" />
            <h3 className="text-sm font-semibold">Adaptive Learning</h3>
            <p className="text-xs text-gray-400">Continuous Improvement</p>
          </div>
          <div className="border border-[#0A988B] rounded-lg p-4 bg-[#112836]/50 backdrop-blur-sm hover:bg-[#112836]/70 transition-all">
            <Network className="w-8 h-8 text-[#0A988B] mb-2" />
            <h3 className="text-sm font-semibold">Network Detection</h3>
            <p className="text-xs text-gray-400">Graph-Based Analysis</p>
          </div>
          <div className="border border-[#0A988B] rounded-lg p-4 bg-[#112836]/50 backdrop-blur-sm hover:bg-[#112836]/70 transition-all">
            <FileCheck className="w-8 h-8 text-[#0A988B] mb-2" />
            <h3 className="text-sm font-semibold">AML + Sanctions</h3>
            <p className="text-xs text-gray-400">Comprehensive Check</p>
          </div>
          <div className="border border-[#0A988B] rounded-lg p-4 bg-[#112836]/50 backdrop-blur-sm hover:bg-[#112836]/70 transition-all">
            <Activity className="w-8 h-8 text-[#0A988B] mb-2" />
            <h3 className="text-sm font-semibold">Real-Time Engine</h3>
            <p className="text-xs text-gray-400">Micro Decisions</p>
          </div>
        </div>

        <div className="border-2 border-[#0A988B] rounded-lg p-6 bg-[#112836]/50 backdrop-blur-sm mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Search className="w-7 h-7 text-[#0A988B]" />
            Sanction Screening
          </h2>

          <form onSubmit={handleScreening} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 bg-[#112836] border-2 border-[#0A988B]/50 rounded-lg focus:border-[#0A988B] focus:outline-none transition-all text-white placeholder-gray-500"
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
                  className="w-full px-4 py-3 bg-[#112836] border-2 border-[#0A988B]/50 rounded-lg focus:border-[#0A988B] focus:outline-none transition-all text-white"
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
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#0A988B] hover:bg-[#0A988B]/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
                  className="px-6 py-3 border-2 border-[#0A988B] text-[#0A988B] hover:bg-[#0A988B] hover:text-white font-semibold rounded-lg transition-all duration-200"
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
                className="bg-[#0A988B] hover:bg-[#0A988B]/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF Report
              </button>
            </div>

            <ResultsDisplay result={result} />
          </>
        )}
      </main>

      <footer className="border-t-2 border-[#0A988B] mt-12 py-6 bg-[#112836]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>Finorion - Advanced AI-Powered Sanction Screening & AML Compliance Platform</p>
          <p className="mt-2">Powered by Real-Time Micro Decision Engine</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
