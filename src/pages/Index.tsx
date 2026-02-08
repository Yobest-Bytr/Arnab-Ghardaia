import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(37,99,235,0.1)_0%,rgba(255,255,255,0)_100%)]" />
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Manage Tasks <span className="text-[#2563EB]">Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The collaborative task management platform designed for modern teams. 
            Stay organized, meet deadlines, and achieve more together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-blue-200">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full border-2">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-gray-600">Powerful features to help you stay on top of your work.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Task Creation",
                desc: "Create, organize, and prioritize tasks in seconds with our intuitive interface.",
                icon: CheckCircle2,
                color: "bg-blue-100 text-blue-600"
              },
              {
                title: "Real-time Collaboration",
                desc: "Assign tasks to team members and track progress together in real-time.",
                icon: Users,
                color: "bg-green-100 text-green-600"
              },
              {
                title: "Secure Data",
                desc: "Your data is protected with enterprise-grade security and encrypted backups.",
                icon: ShieldCheck,
                color: "bg-purple-100 text-purple-600"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by thousands of users</h2>
          <div className="bg-blue-600 rounded-[3rem] p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <p className="text-2xl italic mb-8 relative z-10">
              "TaskMaster has completely transformed how our team handles projects. It's simple, fast, and actually fun to use."
            </p>
            <div className="flex items-center justify-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-blue-400 rounded-full" />
              <div className="text-left">
                <p className="font-bold">Sarah Jenkins</p>
                <p className="text-blue-200 text-sm">Product Manager at TechFlow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <CheckSquare className="w-6 h-6 text-blue-500" />
            <span>TaskMaster</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
          <p className="text-sm">© 2024 TaskMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const CheckSquare = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export default Index;