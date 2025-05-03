import SpeechToText from "@/components/SpeechToText";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="app-container">
        <header className="text-center mb-8 md:mb-12 fade-in">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 app-title">
            Speech to Text Converter
          </h1>
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 max-w-xl mx-auto shadow-sm">
            <p className="text-slate-700 font-medium">
              Click the microphone button and speak. Your speech will be converted to text in real-time.
            </p>
          </div>
        </header>
        
        <main className="space-y-8 fade-in" style={{ animationDelay: "0.1s" }}>
          <SpeechToText />
        </main>
        
        <footer className="mt-16 text-center text-slate-500 text-sm fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="bg-white/40 backdrop-blur-sm rounded-full py-2 px-4 inline-block">
            <p>Made with modern web technologies. Compatible with Chrome, Firefox, Safari, and Edge.</p>
            <p className="mt-1">Microphone access required for speech recognition.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
