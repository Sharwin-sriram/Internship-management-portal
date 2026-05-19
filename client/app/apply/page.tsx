import ApplyForm from "./ApplyForm";

export const metadata = {
  title: "Career Application — InternHub",
  description: "Submit your official application for the internship or job position.",
};

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-gray-50 font-sans selection:bg-slate-900 selection:text-white">
      {/* Simple Corporate Header */}
      <header className="bg-white border-b border-gray-300 relative z-10">
        <div className="max-w-5xl mx-auto px-6 md:px-12 flex items-center justify-between py-6">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-9 h-9 bg-slate-950 flex items-center justify-center rounded-none border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
              <span className="text-white font-black text-lg tracking-tighter">I</span>
            </div>
            <span className="text-slate-950 font-black text-xl tracking-widest uppercase">
              InternHub
            </span>
          </div>

          {/* Simple Navigation */}
          <nav className="flex items-center gap-8">
            <a
              href="/"
              className="text-gray-500 hover:text-slate-950 text-xs font-black uppercase tracking-widest transition-colors"
            >
              Home
            </a>
            <a
              href="/signin"
              className="text-gray-500 hover:text-slate-950 text-xs font-black uppercase tracking-widest transition-colors"
            >
              Sign In
            </a>
            <a
              href="/apply"
              className="hidden sm:inline-block px-5 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black uppercase tracking-widest border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] transition-all rounded-none"
            >
              Apply Now
            </a>
          </nav>
        </div>
      </header>

      {/* Spacious Hero Text */}
      <div className="text-center px-6 pt-20 pb-12 max-w-3xl mx-auto select-none">
        <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-widest uppercase mb-4">
          CAREERS PORTAL
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">
          Internship & Job Application System
        </p>
        <div className="w-16 h-1 bg-slate-950 mx-auto mb-8 rounded-none"></div>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-medium">
          Fill out the secure application form below. Please ensure all required academic details and skill sets are filled out accurately.
        </p>
      </div>

      {/* Spacious Centered Form Container */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pb-32">
        <ApplyForm />
      </div>
    </main>
  );
}
