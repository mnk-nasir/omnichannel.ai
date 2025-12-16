import { SandboxChat } from "@/components/SandboxChat";
import Link from 'next/link';

export default function SandboxPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Info */}
        <div className="flex flex-col justify-center space-y-4">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Omnichannel AI Contact Center</h1>
          <p className="text-lg text-neutral-600">
            Phase 2 Sandbox. Test the AI Brain by sending a message below. 
            The message will be routed through the Node.js Gateway and into the Redis queue, just like a real WhatsApp message.
          </p>
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm mt-4">
            <h3 className="font-semibold text-neutral-900 mb-2">Simulated Business Setup</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li><span className="font-medium text-neutral-800">Business Name:</span> Demo Company Inc.</li>
              <li><span className="font-medium text-neutral-800">Knowledge Base:</span> Default FAQ Document</li>
              <li><span className="font-medium text-neutral-800">Gateway Status:</span> <span className="text-green-600 font-medium">● Connected</span></li>
            </ul>
          </div>
          <div className="mt-6 flex space-x-4">
             <Link href="/dashboard" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-colors cursor-pointer">
                Go to SaaS Dashboard
             </Link>
          </div>
        </div>

        {/* Right Side: Sandbox Widget */}
        <div className="flex items-center justify-center">
           <SandboxChat />
        </div>
      </div>
    </main>
  );
}
