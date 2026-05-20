'use client';

import { Calendar, CircleCheck, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ContactInquiryPreset } from '@/lib/elvoriaEvents';
import { OpenProposalChatTrigger } from './OpenProposalChatTrigger';
import { ScheduleConsultationTrigger } from './ScheduleConsultationTrigger';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: 'Select a service',
    budget: 'Select budget range',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function onOpenInquiry(e: Event) {
      const ce = e as CustomEvent<ContactInquiryPreset>;
      const preset = ce.detail ?? {};
      setFormData((prev) => ({
        ...prev,
        projectType: preset.projectType ?? prev.projectType,
        budget: preset.budget ?? prev.budget,
        message: prev.message.trim() ? prev.message : preset.messageSeed ?? prev.message,
      }));
    }
    window.addEventListener('elvoria:open-contact-inquiry', onOpenInquiry);
    return () => window.removeEventListener('elvoria:open-contact-inquiry', onOpenInquiry);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as {
        error?: string;
        autoReplyEnabled?: boolean;
        autoReplySent?: boolean;
        autoReplyError?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      if (data.autoReplyEnabled && !data.autoReplySent) {
        setError(
          data.autoReplyError
            ? `Message received, but we could not send a confirmation email: ${data.autoReplyError}`
            : 'Message received, but we could not send a confirmation email. Check spam or contact us directly.'
        );
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        projectType: 'Select a service',
        budget: 'Select budget range',
        message: ''
      });

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-background py-16 sm:py-20 md:py-24 dark:bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <div className="mb-5 inline-block rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3 py-1.5 sm:mb-6 sm:px-4 sm:py-2">
            <span className="text-xs font-semibold text-[#06B6D4] sm:text-sm">GET IN TOUCH</span>
          </div>
          <h2 className="mb-5 bg-linear-to-r from-foreground to-[#06B6D4] bg-clip-text text-3xl font-bold text-transparent sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Start Your Project
          </h2>
          <p className="mx-auto max-w-3xl text-base font-light text-muted-foreground sm:text-lg md:text-xl">
            Let&apos;s discuss how we can architect your global digital transformation
          </p>
          <OpenProposalChatTrigger
            source="contact_start_project"
            className="group mx-auto mt-6 inline-flex items-center gap-2 rounded-lg border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/15 sm:mt-8 sm:text-base dark:text-[#F8FAFC]"
            aria-label="Start your project with AI proposal chat"
          >
            <MessageSquare className="h-5 w-5 text-[#8B5CF6]" aria-hidden />
            <span>Start with AI proposal chat</span>
          </OpenProposalChatTrigger>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Contact Form */}
          <div
            id="project-inquiry-form"
            className="scroll-mt-24 rounded-2xl border border-slate-700/50 bg-linear-to-br from-[#1E293B] to-[#0F172A] p-4 sm:p-6 md:p-8 ring-offset-2 transition-[box-shadow] focus-within:ring-2 focus-within:ring-[#06B6D4]/40"
          >
            <h3 className="mb-4 text-xl font-bold text-[#F8FAFC] sm:mb-6 sm:text-2xl">Project Inquiry</h3>

            {submitted && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-400" strokeWidth={2} aria-hidden />
                <span>Message sent successfully! We&apos;ll get back to you soon.</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700 rounded-lg focus:border-[#06B6D4] focus:outline-none text-[#F8FAFC] placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700 rounded-lg focus:border-[#06B6D4] focus:outline-none text-[#F8FAFC] placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700 rounded-lg focus:border-[#06B6D4] focus:outline-none text-[#F8FAFC] placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700 rounded-lg focus:border-[#06B6D4] focus:outline-none text-[#F8FAFC] placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Project Type</label>
                <select 
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700 rounded-lg focus:border-[#06B6D4] focus:outline-none text-[#F8FAFC]">
                  <option>Select a service</option>
                  <option>AI & Generative AI Solutions</option>
                  <option>SaaS Product Development</option>
                  <option>Web Development</option>
                  <option>Mobile App Development</option>
                  <option>Cloud & DevOps</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Budget Range</label>
                <select 
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700 rounded-lg focus:border-[#06B6D4] focus:outline-none text-[#F8FAFC]">
                  <option>Select budget range</option>
                  <option>€10K - €25K</option>
                  <option>€25K - €50K</option>
                  <option>€50K - €100K</option>
                  <option>€100K - €250K</option>
                  <option>€250K+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Project Details *</label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your project, goals, and timeline..."
                  className="w-full px-4 py-3 bg-[#0F172A] border border-slate-700 rounded-lg focus:border-[#06B6D4] focus:outline-none text-[#F8FAFC] placeholder:text-slate-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-linear-to-r from-[#06B6D4] to-[#3B82F6] rounded-lg hover:shadow-xl hover:shadow-[#06B6D4]/30 transition-all flex items-center justify-center gap-2 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">{loading ? 'Sending...' : 'Submit Inquiry'}</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-[#1E293B] to-[#0F172A] p-4 sm:p-6 md:p-8">
              <h3 className="text-2xl font-bold text-[#F8FAFC] mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Email</div>
                    <a
                      href="mailto:info@elvoriatech.com"
                      className="text-slate-200 hover:text-[#06B6D4] transition-colors"
                    >
                      info@elvoriatech.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Contact</div>
                    <a
                      href="mailto:contact@elvoriatech.com"
                      className="text-slate-200 hover:text-[#06B6D4] transition-colors"
                    >
                      contact@elvoriatech.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Office</div>
                    <div className="text-slate-200">Koblenz, Germany</div>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="schedule-consultation"
              className="scroll-mt-24 rounded-2xl border border-[#06B6D4]/30 bg-linear-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 p-4 sm:p-6 md:p-8"
            >
              <h4 className="text-xl font-bold text-[#F8FAFC] mb-4">Quick Actions</h4>

              <div className="space-y-3">
                <ScheduleConsultationTrigger className="w-full px-6 py-4 bg-[#1E293B] border border-slate-700 rounded-lg hover:border-[#06B6D4] transition-all flex items-center gap-3 group">
                  <Calendar className="w-5 h-5 text-[#06B6D4]" />
                  <span className="text-[#F8FAFC] group-hover:text-[#06B6D4] font-semibold">
                    Schedule 30-Min Consultation
                  </span>
                </ScheduleConsultationTrigger>

                <OpenProposalChatTrigger className="group flex w-full items-center gap-3 rounded-lg border border-slate-700 bg-[#1E293B] px-6 py-4 transition-all hover:border-[#8B5CF6]">
                  <MessageSquare className="h-5 w-5 text-[#8B5CF6]" />
                  <span className="font-semibold text-[#F8FAFC] group-hover:text-[#8B5CF6]">
                    Request Technical Proposal
                  </span>
                </OpenProposalChatTrigger>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-[#1E293B] to-[#0F172A] p-4 sm:p-6 md:p-8">
              <h4 className="text-xl font-bold text-[#F8FAFC] mb-4">Response Time</h4>
              <p className="text-slate-300 mb-4">
                Enterprise inquiries receive priority attention. Our solution architects typically
                respond within 4 business hours.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-[#06B6D4] rounded-full animate-pulse"></div>
                <span>Engineering team available Mon–Fri, 9:00–18:00 CET</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
