// app/profile/components/Preferences.tsx
'use client';

import { useState } from 'react';
import { musicGenres } from '../lib/types';

export default function Preferences() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [videoQuality, setVideoQuality] = useState<'sd' | 'hd' | '4k'>('hd');
  const [audioQuality, setAudioQuality] = useState<'normal' | 'high' | 'lossless'>('high');
  const [autoDownload, setAutoDownload] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newContent: true,
    promotions: false,
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="space-y-6">
      {/* Content Preferences */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Content Preferences
          </h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Favorite Music Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {musicGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video Quality
              </label>
              <select
                value={videoQuality}
                onChange={(e) => setVideoQuality(e.target.value as any)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                <option value="sd">SD (480p)</option>
                <option value="hd">HD (1080p)</option>
                <option value="4k">4K Ultra HD</option>
              </select>
            </div>

            {/* Audio Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audio Quality
              </label>
              <select
                value={audioQuality}
                onChange={(e) => setAudioQuality(e.target.value as any)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                <option value="normal">Normal (128kbps)</option>
                <option value="high">High (320kbps)</option>
                <option value="lossless">Lossless</option>
              </select>
            </div>
          </div>

          {/* Auto Download */}
          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoDownload}
                onChange={(e) => setAutoDownload(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Auto-download new episodes from followed podcasts
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Notification Preferences
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Privacy Settings
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show my activity to other users
            </span>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Allow personalized recommendations
            </span>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors font-medium">
          Save Preferences
        </button>
      </div>
    </div>
  );
}