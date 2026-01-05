import React, { useState } from 'react';

const FeatureCard = ({ emoji, title, desc, delay }) => {
  return (
    <div
      className="group relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:bg-white/20 cursor-default overflow-hidden"
      style={{ animationDelay: delay }}
    >
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/0 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{emoji}</div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{title}</h3>
      <p className="text-gray-200 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <div className="min-h-screen bg-cyan-950 text-white overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">

        {/* Dynamic Hero Section */}
        <div className="text-center mb-24 space-y-6">
          <div className="inline-block animate-bounce mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest text-cyan-950 shadow-md">
              Est. 2025
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg">
            Streamline Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 animate-gradient-x">Campus Life</span>.
            <br />
            <span className="italic decoration-wavy underline decoration-cyan-400 text-4xl md:text-6xl block mt-4">Connect. Promote. Register.</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light pt-8">
            Event_Hub is the <strong className="text-cyan-300">one-stop solution</strong> for college students to PR their club's events, showcase their clubs, and seamlessly register for everything happening on campus.
          </p>
        </div>

        {/* Interactive Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#0c4a6e] border border-cyan-800 p-8 rounded-lg shadow-xl">
              <div className="flex space-x-4 mb-6 border-b border-cyan-800 pb-4">
                {['mission', 'vision', 'vibe'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-sm font-semibold uppercase tracking-wider transition-colors ${activeTab === tab
                      ? 'text-cyan-300 border-b-2 border-cyan-300 -mb-[17px]'
                      : 'text-gray-400 hover:text-gray-200'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="min-h-[150px]">
                {activeTab === 'mission' && (
                  <div className="animate-fadeIn">
                    <h3 className="text-2xl font-bold mb-4 text-white">Your Campus, Centralized</h3>
                    <p className="text-cyan-100">
                      Our mission is to bring every club and student together. We help clubs <strong>build their PR</strong> and give students a simple way to <strong>register for events</strong>. Event_Hub is the definitive bridge between you and your campus community.
                    </p>
                  </div>
                )}
                {activeTab === 'vision' && (
                  <div className="animate-fadeIn">
                    <h3 className="text-2xl font-bold mb-4 text-white">Total Event Domination</h3>
                    <p className="text-cyan-100">
                      We envision a campus where every club, committee, and secret society runs in perfect harmony. A world where double-booking is a myth told to frighten first-years.
                    </p>
                  </div>
                )}
                {activeTab === 'vibe' && (
                  <div className="animate-fadeIn">
                    <h3 className="text-2xl font-bold mb-4 text-white">Serious Code, Fun Times</h3>
                    <p className="text-cyan-100">
                      We take our tech stack seriously (React, Node, Mongo - you know the drill), but we don't take ourselves too seriously. Life's too short for boring dashboards.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 translate-y-8">
              <FeatureCard
                emoji="🚀"
                title="Speed"
                desc="Faster than a deadline approaching."
              />
              <FeatureCard
                emoji="🎨"
                title="Design"
                desc="Pixels polished to perfection."
              />
            </div>
            <div className="space-y-4">
              <FeatureCard
                emoji="🔒"
                title="Secure"
                desc="Your data is safe with us (mostly from yourself)."
              />
              <FeatureCard
                emoji="🤝"
                title="Connect"
                desc="Finding your tribe has never been easier."
              />
            </div>
          </div>
        </div>

        {/* The Team / "Batman" Reference */}
        <div className="text-center bg-gradient-to-b from-transparent to-cyan-900/40 rounded-3xl p-12 border border-cyan-900/30 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8">Who is behind this?</h2>
          <div className="flex flex-col items-center">
            {/* <div className="relative w-32 h-32 mb-6 group cursor-pointer">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-20 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative w-full h-full bg-[#082f49] rounded-full flex items-center justify-center border-2 border-cyan-600 group-hover:border-yellow-400 transition-colors overflow-hidden">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🦇</span>
              </div>
            </div> */}
            <h3 className="text-2xl font-bold text-white mb-2">The Developer</h3>
            <a
              href="https://github.com/vanditmehta007"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cyan-300 hover:text-white transition-colors duration-300 font-mono text-sm mb-4 group/link"
            >
              <svg className="w-5 h-5 fill-current group-hover/link:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.05-.015-2.055-3.33.72-4.035-1.605-4.035-1.605-.54-1.38-1.335-1.755-1.335-1.755-1.087-.75.075-.735.075-.735 1.2.09 1.83 1.245 1.83 1.245 1.065 1.815 2.805 1.29 3.495.99.105-.78.42-1.29.765-1.59-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.28-1.545 3.285-1.23 3.285-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>@vanditmehta007</span>
            </a>
            <p className="text-gray-300 max-w-md mx-auto italic">
              "Hello, I am Vandit Mehta."
            </p>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default About;
