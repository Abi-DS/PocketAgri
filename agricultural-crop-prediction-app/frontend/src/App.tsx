import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Show loading state while initializing
  if (loginStatus === 'initializing') {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {isAuthenticated ? <Dashboard /> : <LandingPage />}
        </main>
        <Footer />
        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="mx-auto max-w-4xl">
          <img
            src="/assets/generated/farmer-hero.dim_800x600.jpg"
            alt="Farmer in field"
            className="mx-auto mb-8 h-64 w-full rounded-2xl object-cover shadow-lg"
          />
          <h1 className="mb-4 text-5xl font-bold text-foreground">
            Smart Farming with AI
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Make informed decisions about crop selection, disease management, and field monitoring
            through AI-powered predictions and analysis.
          </p>
          <button
            onClick={login}
            disabled={isLoggingIn}
            className="rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50"
          >
            {isLoggingIn ? 'Logging in...' : 'Get Started'}
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
          Powerful Features for Modern Farmers
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            image="/assets/generated/crop-field.dim_600x400.jpg"
            title="Crop Prediction"
            description="AI-powered recommendations for optimal crops based on weather and soil conditions."
          />
          <FeatureCard
            image="/assets/generated/diseased-leaf.dim_400x400.jpg"
            title="Disease Detection"
            description="Upload crop images to identify diseases and get treatment recommendations."
          />
          <FeatureCard
            image="/assets/generated/weather-station.dim_500x400.jpg"
            title="Field Mapping"
            description="Pin and manage multiple fields with real-time weather and soil data."
          />
          <FeatureCard
            image="/assets/generated/soil-sample.dim_400x400.jpg"
            title="AI Chatbot"
            description="Get expert advice on planting, pest control, and soil management."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ image, title, description }: { image: string; title: string; description: string }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
      <img src={image} alt={title} className="h-48 w-full object-cover" />
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
