import React, { useState } from 'react';
import { FiSearch, FiMapPin, FiCpu } from 'react-icons/fi';

const SearchForm = ({ onScrape, isLoading }) => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!industry.trim()) {
      setError('Please specify an industry (e.g., gym, restaurant)');
      return;
    }
    if (!location.trim()) {
      setError('Please specify a location (e.g., delhi, mumbai)');
      return;
    }
    setError('');
    onScrape(industry.trim(), location.trim());
  };

  const handleQuickSearch = (ind, loc) => {
    setIndustry(ind);
    setLocation(loc);
    setError('');
    onScrape(ind, loc);
  };

  const suggestions = [
    { label: 'Gym in Delhi', industry: 'gym', location: 'delhi' },
    { label: 'Coaching in Bangalore', industry: 'coaching centre', location: 'bangalore' },
    { label: 'Restaurant in Mumbai', industry: 'restaurant', location: 'mumbai' },
    { label: 'Salon in Bangalore', industry: 'beauty parlour', location: 'bangalore' }
  ];

  return (
    <div class="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-white/5">
      {/* Background gradients */}
      <div class="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <form onSubmit={handleSubmit} class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Industry Input */}
          <div class="space-y-2">
            <label htmlFor="industry" class="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              1. Industry or Business Category
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <FiSearch class="w-5 h-5" />
              </div>
              <input
                id="industry"
                type="text"
                class="premium-input w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                placeholder="e.g. gym, coaching centre, restaurant, salon..."
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Location Input */}
          <div class="space-y-2">
            <label htmlFor="location" class="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              2. Target Location / City
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <FiMapPin class="w-5 h-5" />
              </div>
              <input
                id="location"
                type="text"
                class="premium-input w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                placeholder="e.g. delhi, bangalore, mumbai, pune..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div class="text-red-400 text-xs font-medium flex items-center gap-1.5 animate-pulse">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-red-400"></span>
            {error}
          </div>
        )}

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          {/* Quick Searches */}
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs text-zinc-500 font-medium">Quick suggestions:</span>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickSearch(s.industry, s.location)}
                disabled={isLoading}
                class="text-xs bg-white/5 hover:bg-primary-500/10 border border-white/5 hover:border-primary-500/20 text-zinc-300 hover:text-primary-300 py-1.5 px-3 rounded-full transition-all duration-200"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            class={`relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.15)] group overflow-hidden ${
              isLoading
                ? 'bg-zinc-800 cursor-not-allowed border border-white/5'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] active:scale-95 border border-primary-500/20'
            }`}
          >
            {/* Shimmer overlay */}
            <div class="absolute inset-0 w-1/2 bg-white/10 skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out pointer-events-none"></div>
            
            <FiCpu class={`w-4.5 h-4.5 ${isLoading ? 'animate-spin text-zinc-500' : 'text-primary-200'}`} />
            <span>{isLoading ? 'Scraping Leads...' : 'Scrape Leads'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
