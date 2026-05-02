'use client';

import { Calendar, CircleCheck, Mail, MapPin, MessageSquare, Phone, Send, X } from 'lucide-react';
import { useState } from 'react';

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

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    name: '',
    email: '',
    company: '',
    preferredDate: '',
    preferredTime: '',
    timeZone:
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || ''
        : '',
    notes: '',
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSubmitted, setScheduleSubmitted] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setScheduleData((prev) => ({ ...prev, [name]: value }));
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
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

  const handleScheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setScheduleLoading(true);
    setScheduleError('');

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send scheduling request');
      }

      setScheduleSubmitted(true);
      setScheduleData((prev) => ({
        ...prev,
        preferredDate: '',
        preferredTime: '',
        notes: '',
      }));

      setTimeout(() => {
        setScheduleSubmitted(false);
        setScheduleOpen(false);
      }, 2500);
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Failed to send request. Please try again.');
      console.error(err);
    } finally {
      setScheduleLoading(false);
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
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Contact Form */}
          <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-[#1E293B] to-[#0F172A] p-4 sm:p-6 md:p-8">
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
                    <div className="text-slate-200">contact@elvoriatech.com</div>
                    <div className="text-slate-200">info@elvoriatech.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Phone</div>
                    <div className="text-slate-200">+1 (555) 123-4567</div>
                    <div className="text-slate-400 text-sm">Mon-Fri, 9AM-6PM EST</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Office</div>
                    <div className="text-slate-200">123 Innovation Drive</div>
                    <div className="text-slate-200">San Francisco, CA 94103</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#06B6D4]/30 bg-linear-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 p-4 sm:p-6 md:p-8">
              <h4 className="text-xl font-bold text-[#F8FAFC] mb-4">Quick Actions</h4>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setScheduleError('');
                    setScheduleOpen(true);
                  }}
                  className="w-full px-6 py-4 bg-[#1E293B] border border-slate-700 rounded-lg hover:border-[#06B6D4] transition-all flex items-center gap-3 group"
                >
                  <Calendar className="w-5 h-5 text-[#06B6D4]" />
                  <span className="text-[#F8FAFC] group-hover:text-[#06B6D4] font-semibold">
                    Schedule 30-Min Consultation
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('elvoria:open-proposal-chat', {
                        detail: { source: 'contact_technical_proposal' },
                      })
                    );
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                  className="w-full px-6 py-4 bg-[#1E293B] border border-slate-700 rounded-lg hover:border-[#8B5CF6] transition-all flex items-center gap-3 group"
                >
                  <MessageSquare className="w-5 h-5 text-[#8B5CF6]" />
                  <span className="text-[#F8FAFC] group-hover:text-[#8B5CF6] font-semibold">
                    Request Technical Proposal
                  </span>
                </button>
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

      {scheduleOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Schedule a consultation"
          onClick={() => setScheduleOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl text-white">Schedule a free consultation</h3>
                  <p className="text-slate-400 mt-1">
                    Pick a preferred time and we’ll email you to confirm.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setScheduleOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              </div>

              {scheduleSubmitted && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">
                  <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-400" strokeWidth={2} aria-hidden />
                  <span>Request sent! We&apos;ll confirm shortly.</span>
                </div>
              )}

              {scheduleError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
                  {scheduleError}
                </div>
              )}

              <form onSubmit={handleScheduleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm mb-2 text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={scheduleData.name}
                      onChange={handleScheduleChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:border-purple-500 focus:outline-none text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-slate-300">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={scheduleData.email}
                      onChange={handleScheduleChange}
                      required
                      placeholder="john@company.com"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:border-purple-500 focus:outline-none text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-slate-300">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={scheduleData.company}
                    onChange={handleScheduleChange}
                    placeholder="Your Company"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:border-purple-500 focus:outline-none text-slate-200 placeholder:text-slate-500"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-1">
                    <label className="block text-sm mb-2 text-slate-300">Date *</label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={scheduleData.preferredDate}
                      onChange={handleScheduleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:border-purple-500 focus:outline-none text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm mb-2 text-slate-300">Time *</label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={scheduleData.preferredTime}
                      onChange={handleScheduleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:border-purple-500 focus:outline-none text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm mb-2 text-slate-300">Time zone</label>
                    <input
                      type="text"
                      name="timeZone"
                      value={scheduleData.timeZone}
                      onChange={handleScheduleChange}
                      placeholder="e.g. Europe/Berlin"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:border-purple-500 focus:outline-none text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-slate-300">Notes</label>
                  <textarea
                    name="notes"
                    rows={4}
                    value={scheduleData.notes}
                    onChange={handleScheduleChange}
                    placeholder="What would you like to discuss?"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:border-purple-500 focus:outline-none text-slate-200 placeholder:text-slate-500 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={scheduleLoading}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {scheduleLoading ? 'Sending...' : 'Request time'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleOpen(false)}
                    className="flex-1 px-6 py-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
