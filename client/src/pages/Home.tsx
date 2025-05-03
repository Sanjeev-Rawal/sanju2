import SpeechToText from "@/components/SpeechToText";

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Speech to Text Converter
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Click the microphone button and speak. Your speech will be converted to text in real-time.
          </p>
        </header>
        
        <main className="space-y-8">
          <SpeechToText />
        </main>
        
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Made with modern web technologies. Compatible with Chrome, Firefox, Safari, and Edge.</p>
          <p className="mt-1">Microphone access required for speech recognition.</p>
        </footer>
      </div>
    </div>
  );
}
