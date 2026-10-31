"use client";

import React from "react";

export type FolkArtType = "farmer" | "artisan" | "student" | "msme" | "daily_wage" | "senior";

export interface RegionalFolkCardProps {
  id: string;
  nativeTitle: string;
  englishTitle: string;
  description: string;
  schemePill: string;
  artType: FolkArtType;
  onClick: () => void;
  selected?: boolean;
}

/**
 * Global SVG Definitions for Madhubani Hatching, Dots, Haveli Arch, and Faces
 * Rendered inline so any RegionalFolkCard can reference them seamlessly.
 */
export function FolkSvgDefs() {
  return (
    <svg width="0" height="0" className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
      <defs>
        {/* Madhubani 45-degree line-hatching pattern */}
        <pattern id="folk-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#2b1a12" strokeWidth="1" opacity="0.5" />
        </pattern>

        {/* Traditional Mithila dot stippling pattern */}
        <pattern id="folk-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.3" fill="#2b1a12" opacity="0.6" stroke="none" />
        </pattern>

        {/* Authentic Haveli Arch Clip Path */}
        <clipPath id="folk-arch">
          <path d="M8 240V104A92 92 0 0 1 192 104V240Z" />
        </clipPath>

        {/* Traditional Mithila / Madhubani Stylized Face Symbol */}
        <symbol id="folk-face" viewBox="0 0 60 70">
          <ellipse cx="30" cy="34" rx="22" ry="28" fill="currentColor" stroke="#2b1a12" strokeWidth="1.6" />
          <path
            d="M12 28Q21 20 28 28Q21 34 12 28ZM32 28Q39 20 48 28Q39 34 32 28Z"
            fill="#ffffff"
            stroke="#2b1a12"
            strokeWidth="1.3"
          />
          <circle cx="21" cy="28" r="2.4" fill="#2b1a12" />
          <circle cx="39" cy="28" r="2.4" fill="#2b1a12" />
          <path
            d="M11 21Q21 15 29 21M31 21Q39 15 49 21M30 31v10q-4 3-6 0M23 52q7 4 14 0"
            fill="none"
            stroke="#2b1a12"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </symbol>

        {/* Madhubani Filigree Corner Symbol */}
        <symbol id="folk-corner" viewBox="0 0 26 26">
          <path
            d="M2 24V2h22M7 24V7h17M2 2c6 0 9 3 9 9-6 0-9-3-9-9Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="14" cy="14" r="2" fill="currentColor" />
        </symbol>

        {/* Sacred Matsya / Fish Motif Symbol */}
        <symbol id="folk-fish" viewBox="0 0 24 12">
          <path
            d="M2 6Q10 -1 18 6Q10 13 2 6ZM18 6L24 1V11Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="7" cy="5" r="1" fill="currentColor" />
        </symbol>

        {/* Sacred Lotus Bud (Kamal Kalika) Symbol */}
        <symbol id="folk-bud" viewBox="0 0 12 16">
          <path
            d="M6 1Q11 6 6 14Q1 6 6 1ZM6 14V2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </symbol>
      </defs>
    </svg>
  );
}

/**
 * 6 Authentic Madhubani & Haveli Arch Vector Art Portraits
 */
export function MadhubaniPortrait({ type }: { type: FolkArtType }) {
  switch (type) {
    case "farmer":
      return (
        <svg
          viewBox="0 0 200 240"
          className="w-full h-auto max-w-[210px] mx-auto select-none"
          role="img"
          aria-label="Farmer with sickle in a golden wheat field"
        >
          <g clipPath="url(#folk-arch)">
            <rect width="200" height="240" fill="#e3a82b" stroke="none" />
            <path d="M25 240V150M45 240V162M155 240V158M176 240V146" fill="none" stroke="#2b1a12" strokeWidth="1.6" />
            <g fill="#7a9a2e" stroke="#2b1a12" strokeWidth="1.6">
              <ellipse cx="25" cy="144" rx="4" ry="10" />
              <ellipse cx="45" cy="156" rx="4" ry="10" />
              <ellipse cx="155" cy="152" rx="4" ry="10" />
              <ellipse cx="176" cy="140" rx="4" ry="10" />
            </g>
            <rect x="90" y="128" width="20" height="24" fill="#c98a5e" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M52 240L60 154Q100 138 140 154L148 240Z" fill="#f4e8cc" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M52 240L60 154Q100 138 140 154L148 240Z" fill="url(#folk-hatch)" stroke="none" />
            <path d="M100 146V240M86 150l14 20 14-20" fill="none" stroke="#2b1a12" strokeWidth="1.6" />
            <use href="#folk-face" x="70" y="68" width="60" height="70" color="#c98a5e" />
            <path d="M64 84Q100 30 136 84Q100 68 64 84Z" fill="#c4562e" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M72 76Q100 54 128 76M68 82Q100 66 132 82" fill="none" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M142 176Q184 168 178 118Q170 156 138 166Z" fill="#cfd4d6" stroke="#2b1a12" strokeWidth="1.6" />
          </g>
          <path d="M8 240V104A92 92 0 0 1 192 104V240" fill="none" stroke="#2b1a12" strokeWidth="1.8" />
          <path d="M15 240V105A85 85 0 0 1 185 105V240" fill="none" stroke="#2b1a12" strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );

    case "artisan":
      return (
        <svg
          viewBox="0 0 200 240"
          className="w-full h-auto max-w-[210px] mx-auto select-none"
          role="img"
          aria-label="Woman artisan shaping a clay pot on a wheel"
        >
          <g clipPath="url(#folk-arch)">
            <rect width="200" height="240" fill="#b9472a" stroke="none" />
            <g fill="#f2c94c" stroke="#2b1a12" strokeWidth="1.4">
              <circle cx="30" cy="60" r="7" />
              <circle cx="170" cy="60" r="7" />
              <circle cx="24" cy="110" r="5" />
              <circle cx="176" cy="110" r="5" />
            </g>
            <rect x="90" y="124" width="20" height="24" fill="#d09468" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M46 240L56 150Q100 134 144 150L154 240Z" fill="#2c3e8f" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M46 240L56 150Q100 134 144 150L154 240Z" fill="url(#folk-dots)" stroke="none" />
            <use href="#folk-face" x="70" y="64" width="60" height="70" color="#d09468" />
            <circle cx="86" cy="114" r="2.6" fill="#f2c94c" stroke="#2b1a12" strokeWidth="1" />
            <path
              d="M62 100Q64 40 100 40Q136 40 138 100Q130 70 100 66Q70 70 62 100Z"
              fill="#e8d8a8"
              stroke="#2b1a12"
              strokeWidth="1.6"
            />
            <path d="M62 100Q58 150 70 170M138 100Q142 150 130 170" fill="none" stroke="#2b1a12" strokeWidth="1.6" />
            <ellipse cx="100" cy="208" rx="48" ry="9" fill="#6b3a22" stroke="#2b1a12" strokeWidth="1.6" />
            <path
              d="M72 208Q64 180 82 172Q82 164 90 162H110Q118 164 118 172Q136 180 128 208Z"
              fill="#e07b4a"
              stroke="#2b1a12"
              strokeWidth="1.6"
            />
            <path
              d="M72 208Q64 180 82 172Q82 164 90 162H110Q118 164 118 172Q136 180 128 208Z"
              fill="url(#folk-hatch)"
              stroke="none"
            />
            <g fill="none" stroke="#2b1a12" strokeWidth="1.6">
              <ellipse cx="66" cy="184" rx="9" ry="4" />
              <ellipse cx="66" cy="190" rx="9" ry="4" />
              <ellipse cx="134" cy="184" rx="9" ry="4" />
              <ellipse cx="134" cy="190" rx="9" ry="4" />
            </g>
          </g>
          <path d="M8 240V104A92 92 0 0 1 192 104V240" fill="none" stroke="#2b1a12" strokeWidth="1.8" />
          <path d="M15 240V105A85 85 0 0 1 185 105V240" fill="none" stroke="#2b1a12" strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );

    case "student":
      return (
        <svg
          viewBox="0 0 200 240"
          className="w-full h-auto max-w-[210px] mx-auto select-none"
          role="img"
          aria-label="Student with books and tablet under tree of knowledge"
        >
          <g clipPath="url(#folk-arch)">
            <rect width="200" height="240" fill="#1f7a74" stroke="none" />
            <path
              d="M100 120V30M100 70Q70 60 56 34M100 70Q130 60 144 34M100 96Q64 90 40 70M100 96Q136 90 160 70"
              fill="none"
              stroke="#f2c94c"
              strokeWidth="2"
            />
            <g fill="#f2c94c" stroke="#2b1a12" strokeWidth="1.4">
              <ellipse cx="56" cy="32" rx="5" ry="9" />
              <ellipse cx="144" cy="32" rx="5" ry="9" />
              <ellipse cx="40" cy="68" rx="5" ry="9" />
              <ellipse cx="160" cy="68" rx="5" ry="9" />
            </g>
            <rect x="90" y="130" width="20" height="22" fill="#b97d54" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M50 240L58 154Q100 138 142 154L150 240Z" fill="#f4e8cc" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M58 154L76 240H50ZM142 154L124 240H150Z" fill="#1d2d5a" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M58 154L76 240H50ZM142 154L124 240H150Z" fill="url(#folk-hatch)" stroke="none" />
            <use href="#folk-face" x="70" y="70" width="60" height="70" color="#b97d54" />
            <path
              d="M68 90Q66 60 100 58Q134 60 132 90Q124 72 100 72Q76 72 68 90Z"
              fill="#2b1a12"
              stroke="#2b1a12"
              strokeWidth="1.6"
            />
            <rect x="104" y="170" width="46" height="34" rx="3" fill="#f2c94c" stroke="#2b1a12" strokeWidth="1.6" />
            <rect x="109" y="175" width="36" height="24" fill="#1d2d5a" stroke="#2b1a12" strokeWidth="1" />
            <rect x="46" y="196" width="60" height="12" fill="#c4562e" stroke="#2b1a12" strokeWidth="1.6" />
            <rect x="50" y="184" width="54" height="12" fill="#e8d8a8" stroke="#2b1a12" strokeWidth="1.6" />
          </g>
          <path d="M8 240V104A92 92 0 0 1 192 104V240" fill="none" stroke="#2b1a12" strokeWidth="1.8" />
          <path d="M15 240V105A85 85 0 0 1 185 105V240" fill="none" stroke="#2b1a12" strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );

    case "msme":
      return (
        <svg
          viewBox="0 0 200 240"
          className="w-full h-auto max-w-[210px] mx-auto select-none"
          role="img"
          aria-label="Shopkeeper holding traditional brass scales"
        >
          <g clipPath="url(#folk-arch)">
            <rect width="200" height="240" fill="#e8892b" stroke="none" />
            <rect x="0" y="196" width="200" height="44" fill="#a9482b" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M0 196H200V240H0Z" fill="url(#folk-dots)" stroke="none" />
            <rect x="90" y="128" width="20" height="24" fill="#c98a5e" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M48 240L58 152Q100 136 142 152L152 240Z" fill="#f4e8cc" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M100 146V240" fill="none" stroke="#2b1a12" strokeWidth="1.6" />
            <g fill="#a9482b" stroke="#2b1a12" strokeWidth="1.2">
              <path d="M72 176l8 8-8 8-8-8ZM128 176l8 8-8 8-8-8ZM86 210l8 8-8 8-8-8ZM114 210l8 8-8 8-8-8Z" />
            </g>
            <use href="#folk-face" x="70" y="66" width="60" height="70" color="#c98a5e" />
            <path d="M68 78Q100 44 132 78L130 70Q100 56 70 70Z" fill="#f4e8cc" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M82 52H118L122 74H78Z" fill="#f4e8cc" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M82 62H118" fill="none" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M40 150H160" fill="none" stroke="#2b1a12" strokeWidth="3" />
            <path d="M100 140V156" fill="none" stroke="#2b1a12" strokeWidth="2" />
            <path d="M40 150L28 180H52ZM160 150L148 180H172Z" fill="#d9a441" stroke="#2b1a12" strokeWidth="1.6" />
            <path
              d="M40 150L30 178M40 150L50 178M160 150L150 178M160 150L170 178"
              fill="none"
              stroke="#2b1a12"
              strokeWidth="1.6"
            />
          </g>
          <path d="M8 240V104A92 92 0 0 1 192 104V240" fill="none" stroke="#2b1a12" strokeWidth="1.8" />
          <path d="M15 240V105A85 85 0 0 1 185 105V240" fill="none" stroke="#2b1a12" strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );

    case "daily_wage":
      return (
        <svg
          viewBox="0 0 200 240"
          className="w-full h-auto max-w-[210px] mx-auto select-none"
          role="img"
          aria-label="Rural builder with hammer under Warli sun"
        >
          <g clipPath="url(#folk-arch)">
            <rect width="200" height="240" fill="#a9482b" stroke="none" />
            <circle cx="100" cy="42" r="14" fill="#f2c94c" stroke="#2b1a12" strokeWidth="1.6" />
            <path
              d="M100 20V8M100 76V64M78 42H66M134 42H122M84 26l-8-8M116 26l8-8M84 58l-8 8M116 58l8 8"
              fill="none"
              stroke="#f2c94c"
              strokeWidth="2.4"
            />
            <rect x="90" y="132" width="20" height="22" fill="#a6704a" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M48 240L56 156Q100 140 144 156L152 240Z" fill="#7e8a4a" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M48 240L56 156Q100 140 144 156L152 240Z" fill="url(#folk-hatch)" stroke="none" />
            <path d="M100 150V240" fill="none" stroke="#2b1a12" strokeWidth="1.6" />
            <use href="#folk-face" x="70" y="72" width="60" height="70" color="#a6704a" />
            <path
              d="M66 92Q68 60 100 58Q132 60 134 92Q120 76 100 76Q80 76 66 92Z"
              fill="#f4e8cc"
              stroke="#2b1a12"
              strokeWidth="1.6"
            />
            <path d="M72 84Q100 70 128 84" fill="none" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M152 214L168 140" fill="none" stroke="#2b1a12" strokeWidth="5" />
            <rect
              x="148"
              y="126"
              width="34"
              height="18"
              rx="2"
              fill="#3b3b3b"
              stroke="#2b1a12"
              strokeWidth="1.6"
              transform="rotate(14 165 135)"
            />
            <path d="M0 224H200V240H0Z" fill="#3b3b3b" stroke="#2b1a12" strokeWidth="1.6" />
          </g>
          <path d="M8 240V104A92 92 0 0 1 192 104V240" fill="none" stroke="#2b1a12" strokeWidth="1.8" />
          <path d="M15 240V105A85 85 0 0 1 185 105V240" fill="none" stroke="#2b1a12" strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );

    case "senior":
      return (
        <svg
          viewBox="0 0 200 240"
          className="w-full h-auto max-w-[210px] mx-auto select-none"
          role="img"
          aria-label="Elderly couple on a traditional charpai"
        >
          <g clipPath="url(#folk-arch)">
            <rect width="200" height="240" fill="#d9b48a" stroke="none" />
            <g fill="#8b2f3a" stroke="#2b1a12" strokeWidth="1.4">
              <path d="M100 30c10 10 10 22 0 32-10-10-10-22 0-32Z" />
              <path d="M40 70c8 8 8 18 0 26-8-8-8-18 0-26ZM160 70c8 8 8 18 0 26-8-8-8-18 0-26Z" />
            </g>
            <path d="M34 240L40 140Q70 126 96 140L100 240Z" fill="#8b2f3a" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M34 240L40 140Q70 126 96 140L100 240Z" fill="url(#folk-hatch)" stroke="none" />
            <path d="M104 240L106 140Q132 126 164 140L170 240Z" fill="#f4e8cc" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M106 150H166M106 160H166" fill="none" stroke="#2b1a12" strokeWidth="1.6" />
            <rect x="57" y="116" width="16" height="20" fill="#c08c64" stroke="#2b1a12" strokeWidth="1.6" />
            <rect x="127" y="116" width="16" height="20" fill="#c08c64" stroke="#2b1a12" strokeWidth="1.6" />
            <use href="#folk-face" x="46" y="66" width="44" height="52" color="#c08c64" />
            <path
              d="M40 86Q42 52 68 50Q94 52 96 86Q92 66 68 64Q44 66 40 86Q36 120 50 140L40 140Z"
              fill="#8b2f3a"
              stroke="#2b1a12"
              strokeWidth="1.6"
            />
            <use href="#folk-face" x="116" y="66" width="44" height="52" color="#c08c64" />
            <path
              d="M114 80Q120 58 138 58Q156 58 162 80Q150 68 138 68Q126 68 114 80Z"
              fill="#ffffff"
              stroke="#2b1a12"
              strokeWidth="1.6"
            />
            <path d="M126 104Q138 112 150 104Q138 108 126 104Z" fill="#ffffff" stroke="#2b1a12" strokeWidth="1.4" />
            <rect x="8" y="190" width="184" height="12" rx="3" fill="#6b3a22" stroke="#2b1a12" strokeWidth="1.6" />
            <path d="M18 202V234M182 202V234" fill="none" stroke="#2b1a12" strokeWidth="5" />
            <path d="M8 190H192V202H8Z" fill="url(#folk-hatch)" stroke="none" />
            <path d="M8 214H192" fill="none" stroke="#2b1a12" strokeWidth="1.4" strokeDasharray="4 4" />
          </g>
          <path d="M8 240V104A92 92 0 0 1 192 104V240" fill="none" stroke="#2b1a12" strokeWidth="1.8" />
          <path d="M15 240V105A85 85 0 0 1 185 105V240" fill="none" stroke="#2b1a12" strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );
  }
}

/**
 * Reusable Folk-Bordered Citizen Card Component
 */
export function RegionalFolkCard({
  nativeTitle,
  englishTitle,
  description,
  schemePill,
  artType,
  onClick,
  selected = false,
}: RegionalFolkCardProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`${nativeTitle} - ${englishTitle}`}
      className={`group text-left w-full relative rounded-[14px] border-2 transition-all duration-300 p-2 overflow-hidden cursor-pointer flex flex-col justify-between ${selected
          ? "border-[#b8791f] dark:border-[#e0a33a] bg-[#fbf3df] dark:bg-[#251d16] shadow-lg ring-2 ring-[#b8791f]/40 dark:ring-[#e0a33a]/40"
          : "border-[#2b1a12] dark:border-[#f1e3c4]/30 bg-[#fbf3df]/90 dark:bg-[#251d16]/90 hover:bg-[#fbf3df] dark:hover:bg-[#251d16] hover:border-[#b8791f] dark:hover:border-[#e0a33a] shadow-md hover:shadow-xl"
        }`}
    >
      {/* 4 Madhubani Corner Filigrees via SVG Symbol */}
      <svg className="absolute w-[26px] h-[26px] top-[-2px] left-[-2px] text-[#b8791f] dark:text-[#e0a33a] pointer-events-none">
        <use href="#folk-corner" />
      </svg>
      <svg className="absolute w-[26px] h-[26px] top-[-2px] right-[-2px] text-[#b8791f] dark:text-[#e0a33a] scale-x-[-1] pointer-events-none">
        <use href="#folk-corner" />
      </svg>
      <svg className="absolute w-[26px] h-[26px] bottom-[-2px] left-[-2px] text-[#b8791f] dark:text-[#e0a33a] scale-y-[-1] pointer-events-none">
        <use href="#folk-corner" />
      </svg>
      <svg className="absolute w-[26px] h-[26px] bottom-[-2px] right-[-2px] text-[#b8791f] dark:text-[#e0a33a] scale-[-1] pointer-events-none">
        <use href="#folk-corner" />
      </svg>

      {/* Inner Geometric Dashed Gold Trim */}
      <div className="border-[1.5px] border-dashed border-[#b8791f]/40 dark:border-[#e0a33a]/40 rounded-[9px] p-3 sm:p-4 w-full h-full flex flex-col justify-between text-center">
        <div>
          {/* Authentic Madhubani Portrait in Haveli Arch */}
          <div className="w-full mb-3 overflow-hidden flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300">
            <MadhubaniPortrait type={artType} />
          </div>

          {/* Native Script Headline & Subtitle */}
          <h3 className="font-bold text-xl sm:text-2xl text-[#2b1a12] dark:text-[#f1e3c4] group-hover:text-[#b8791f] dark:group-hover:text-[#e0a33a] transition-colors leading-normal">
            {nativeTitle}
          </h3>
          <p className="font-heading font-semibold text-sm text-[#6b4a36] dark:text-[#c9ad88] mt-0.5">
            {englishTitle}
          </p>
          <p className="text-xs font-sans text-[#6b4a36]/90 dark:text-[#c9ad88]/90 mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Stamped Postal Seal Tag Badge */}
        <div className="mt-3.5 pt-2.5 border-t border-[#b8791f]/20 dark:border-[#e0a33a]/20 flex items-center justify-between">
          <span className="inline-block px-2.5 py-0.5 border border-[#b8791f] dark:border-[#e0a33a] rounded-[2px] text-xs font-mono uppercase tracking-wider text-[#b8791f] dark:text-[#e0a33a] bg-[#b8791f]/10 dark:bg-[#e0a33a]/10">
            {schemePill}
          </span>
          <span className="text-xs font-semibold text-[#b8791f] dark:text-[#e0a33a] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            चुनें →
          </span>
        </div>
      </div>
    </button>
  );
}

/**
 * Traditional Madhubani Border Frame (चौखट)
 * Featuring Matsya (Fish), Lotus Buds, and Hatched Chevrons
 */
export function MadhubaniChaukhatFrame({ className }: { className?: string }) {
  return (
    <div className={`w-full max-w-md mx-auto my-6 text-center ${className || ""}`}>
      <h3 className="font-serif font-normal text-lg sm:text-xl text-[#2b1a12] dark:text-[#f1e3c4] mb-1">
        मधुबनी चौखट · Mithila Border Frame
      </h3>
      <p className="text-xs text-[#6b4a36] dark:text-[#c9ad88] mb-3">
        Sacred fish, lotus buds, hatched chevrons, and kalash corners.
      </p>
      <svg
        viewBox="0 0 320 220"
        className="w-full h-auto text-[#1d6b4f] dark:text-[#4fbf93] select-none"
        role="img"
        aria-label="Madhubani style border frame"
      >
        <rect x="4" y="4" width="312" height="212" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <rect x="9" y="9" width="302" height="202" fill="none" stroke="#b8791f" strokeWidth="1.2" />
        <rect x="30" y="30" width="260" height="160" fill="none" stroke="currentColor" strokeWidth="1.2" />

        <g stroke="#b8791f" strokeWidth="1" fill="none">
          <path d="M30 16l8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10" />
          <path d="M30 204l8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10" />
        </g>

        {/* Matsya / Sacred Fish */}
        <g style={{ color: "currentColor" }}>
          <use href="#folk-fish" x="60" y="34" width="24" height="12" />
          <use href="#folk-fish" x="148" y="34" width="24" height="12" />
          <use href="#folk-fish" x="236" y="34" width="24" height="12" />
          <use href="#folk-fish" x="60" y="174" width="24" height="12" />
          <use href="#folk-fish" x="148" y="174" width="24" height="12" />
          <use href="#folk-fish" x="236" y="174" width="24" height="12" />
        </g>

        {/* Kamal Kalika / Lotus Buds */}
        <g style={{ color: "#b8791f" }}>
          <use href="#folk-bud" x="14" y="60" width="12" height="16" />
          <use href="#folk-bud" x="14" y="100" width="12" height="16" />
          <use href="#folk-bud" x="14" y="140" width="12" height="16" />
          <use href="#folk-bud" x="294" y="60" width="12" height="16" />
          <use href="#folk-bud" x="294" y="100" width="12" height="16" />
          <use href="#folk-bud" x="294" y="140" width="12" height="16" />
        </g>

        <g fill="#b8791f">
          <circle cx="16" cy="16" r="6" />
          <circle cx="304" cy="16" r="6" />
          <circle cx="16" cy="204" r="6" />
          <circle cx="304" cy="204" r="6" />
        </g>

        <path d="M120 110h80M160 100v20" stroke="#b8791f" strokeWidth="1.4" />
        <circle cx="160" cy="110" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

export default RegionalFolkCard;
