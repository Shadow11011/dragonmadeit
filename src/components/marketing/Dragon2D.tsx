"use client";

import { motion } from "framer-motion";

function FireBreath() {
  return (
    <g className="dragon-fire-group">
      {/* Fire breath — layered flame shapes with animated gradients */}
      <path
        d="M168 108 Q185 100, 210 95 Q230 88, 255 92 Q240 95, 250 100 Q235 98, 225 103 Q210 100, 200 108 Q190 105, 180 110Z"
        fill="url(#fireGradient1)"
        className="dragon-fire-outer"
        style={{ filter: "blur(1.5px)" }}
      />
      <path
        d="M168 108 Q182 102, 205 98 Q220 93, 240 96 Q228 99, 235 103 Q222 100, 215 106 Q205 103, 195 109 Q185 106, 175 111Z"
        fill="url(#fireGradient2)"
        className="dragon-fire-mid"
        style={{ filter: "blur(0.8px)" }}
      />
      <path
        d="M168 108 Q178 104, 195 101 Q208 97, 222 100 Q212 102, 218 105 Q208 103, 202 108 Q195 106, 188 110Z"
        fill="url(#fireGradient3)"
        className="dragon-fire-inner"
      />
      {/* Fire sparks */}
      <circle cx="245" cy="94" r="2" fill="#ffd700" className="dragon-spark dragon-spark-1" />
      <circle cx="250" cy="100" r="1.5" fill="#ff8c00" className="dragon-spark dragon-spark-2" />
      <circle cx="238" cy="88" r="1.8" fill="#ff4500" className="dragon-spark dragon-spark-3" />
      <circle cx="230" cy="105" r="1.2" fill="#ffd700" className="dragon-spark dragon-spark-4" />
      <circle cx="255" cy="96" r="1" fill="#ff8c00" className="dragon-spark dragon-spark-5" />
    </g>
  );
}

export function Dragon2D() {
  return (
    <motion.div
      className="dragon-2d-container"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <svg
        viewBox="0 0 320 280"
        className="dragon-2d-svg"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Dragon silhouette breathing fire"
        role="img"
      >
        <defs>
          {/* Fire gradients */}
          <linearGradient id="fireGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff4500" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ff8c00" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="fireGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#ffd700" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="fireGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="1" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </linearGradient>

          {/* Dragon body gradient */}
          <linearGradient id="dragonBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a0808" />
            <stop offset="50%" stopColor="#0d0505" />
            <stop offset="100%" stopColor="#1a0808" />
          </linearGradient>

          {/* Glow filter for the dragon */}
          <filter id="dragonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feFlood floodColor="#ff4500" floodOpacity="0.3" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Eye glow filter */}
          <filter id="eyeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feFlood floodColor="#ffd700" floodOpacity="0.8" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Fire glow filter */}
          <filter id="fireGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feFlood floodColor="#ff4500" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow aura */}
        <ellipse
          cx="160"
          cy="155"
          rx="120"
          ry="100"
          fill="none"
          stroke="#ff4500"
          strokeWidth="0.5"
          opacity="0.15"
          className="dragon-aura"
        />
        <ellipse
          cx="160"
          cy="155"
          rx="140"
          ry="115"
          fill="none"
          stroke="#ff8c00"
          strokeWidth="0.3"
          opacity="0.08"
          className="dragon-aura-outer"
        />

        {/* === LEFT WING (behind body) === */}
        <g className="dragon-wing dragon-wing-left" style={{ transformOrigin: "115px 130px" }}>
          {/* Main wing membrane */}
          <path
            d="M115 130
               Q95 95, 45 55
               Q38 48, 30 52
               Q22 58, 28 68
               Q15 72, 12 82
               Q8 92, 18 100
               Q10 105, 8 115
               Q5 128, 20 130
               Q30 130, 55 140
               Q80 148, 110 145Z"
            fill="#0d0404"
            stroke="#ff4500"
            strokeWidth="0.3"
            strokeOpacity="0.2"
          />
          {/* Wing bone structure */}
          <path d="M115 130 Q95 95, 45 55" stroke="#1a0808" strokeWidth="1.5" fill="none" />
          <path d="M115 130 Q85 100, 28 68" stroke="#1a0808" strokeWidth="1.2" fill="none" />
          <path d="M115 130 Q75 110, 18 100" stroke="#1a0808" strokeWidth="1" fill="none" />
          <path d="M115 130 Q65 125, 20 130" stroke="#1a0808" strokeWidth="0.8" fill="none" />
          {/* Wing claw tips */}
          <circle cx="30" cy="52" r="1.5" fill="#ff4500" opacity="0.6" />
          <circle cx="12" cy="82" r="1.5" fill="#ff4500" opacity="0.5" />
          <circle cx="8" cy="115" r="1.5" fill="#ff4500" opacity="0.4" />
        </g>

        {/* === RIGHT WING (behind body) === */}
        <g className="dragon-wing dragon-wing-right" style={{ transformOrigin: "185px 130px" }}>
          {/* Main wing membrane */}
          <path
            d="M185 130
               Q205 95, 255 55
               Q262 48, 270 52
               Q278 58, 272 68
               Q285 72, 288 82
               Q292 92, 282 100
               Q290 105, 292 115
               Q295 128, 280 130
               Q270 130, 245 140
               Q220 148, 190 145Z"
            fill="#0d0404"
            stroke="#ff4500"
            strokeWidth="0.3"
            strokeOpacity="0.2"
          />
          {/* Wing bone structure */}
          <path d="M185 130 Q205 95, 255 55" stroke="#1a0808" strokeWidth="1.5" fill="none" />
          <path d="M185 130 Q215 100, 272 68" stroke="#1a0808" strokeWidth="1.2" fill="none" />
          <path d="M185 130 Q225 110, 282 100" stroke="#1a0808" strokeWidth="1" fill="none" />
          <path d="M185 130 Q235 125, 280 130" stroke="#1a0808" strokeWidth="0.8" fill="none" />
          {/* Wing claw tips */}
          <circle cx="270" cy="52" r="1.5" fill="#ff4500" opacity="0.6" />
          <circle cx="288" cy="82" r="1.5" fill="#ff4500" opacity="0.5" />
          <circle cx="292" cy="115" r="1.5" fill="#ff4500" opacity="0.4" />
        </g>

        {/* === BODY === */}
        <g filter="url(#dragonGlow)">
          {/* Main body shape */}
          <path
            d="M130 180
               Q120 170, 115 150
               Q112 135, 118 120
               Q125 108, 140 105
               Q150 103, 160 108
               Q170 103, 180 105
               Q195 108, 202 120
               Q208 135, 205 150
               Q200 170, 190 180
               Q175 195, 160 195
               Q145 195, 130 180Z"
            fill="url(#dragonBodyGrad)"
            stroke="#ff4500"
            strokeWidth="0.4"
            strokeOpacity="0.15"
          />

          {/* Chest/belly scales highlight */}
          <path
            d="M145 140 Q150 135, 160 135 Q170 135, 175 140 Q170 145, 160 148 Q150 145, 145 140Z"
            fill="#1a0808"
            opacity="0.6"
          />
          <path
            d="M147 150 Q152 147, 160 147 Q168 147, 173 150 Q168 153, 160 155 Q152 153, 147 150Z"
            fill="#1a0808"
            opacity="0.5"
          />
          <path
            d="M149 160 Q154 157, 160 157 Q166 157, 171 160 Q166 163, 160 164 Q154 163, 149 160Z"
            fill="#1a0808"
            opacity="0.4"
          />
        </g>

        {/* === NECK === */}
        <path
          d="M145 120
             Q140 108, 142 95
             Q145 85, 150 80
             Q155 76, 160 78
             Q165 76, 170 80
             Q175 85, 178 95
             Q180 108, 175 120Z"
          fill="url(#dragonBodyGrad)"
          stroke="#ff4500"
          strokeWidth="0.3"
          strokeOpacity="0.1"
        />

        {/* Neck scale details */}
        <path d="M152 100 Q155 98, 160 98 Q165 98, 168 100" stroke="#1a0808" strokeWidth="0.5" fill="none" opacity="0.5" />
        <path d="M150 92 Q155 90, 160 90 Q165 90, 170 92" stroke="#1a0808" strokeWidth="0.5" fill="none" opacity="0.5" />
        <path d="M152 108 Q156 106, 160 106 Q164 106, 168 108" stroke="#1a0808" strokeWidth="0.5" fill="none" opacity="0.4" />

        {/* === HEAD === */}
        <g>
          {/* Head shape — angular, reptilian */}
          <path
            d="M142 80
               Q138 72, 140 62
               Q143 52, 150 50
               Q155 48, 160 50
               Q165 48, 170 50
               Q177 52, 180 62
               Q182 72, 178 80
               Q172 85, 160 86
               Q148 85, 142 80Z"
            fill="url(#dragonBodyGrad)"
            stroke="#ff4500"
            strokeWidth="0.4"
            strokeOpacity="0.2"
          />

          {/* Snout / jaw — open, facing right */}
          <path
            d="M170 65
               Q178 60, 185 58
               Q190 56, 192 58
               Q188 62, 185 64
               Q180 66, 175 70"
            fill="url(#dragonBodyGrad)"
            stroke="#ff4500"
            strokeWidth="0.3"
            strokeOpacity="0.15"
          />

          {/* Lower jaw — open for fire */}
          <path
            d="M170 72
               Q178 76, 185 76
               Q190 76, 192 74
               Q188 70, 182 68"
            fill="url(#dragonBodyGrad)"
            stroke="#ff4500"
            strokeWidth="0.3"
            strokeOpacity="0.15"
          />

          {/* Jaw interior (mouth open) */}
          <path
            d="M170 65 Q180 64, 185 64 Q188 66, 185 68 Q180 70, 175 70 Q172 68, 170 66Z"
            fill="#2a0505"
            opacity="0.8"
          />
          {/* Teeth */}
          <path d="M175 65 L176 67 L177 65" fill="#e4e4e7" opacity="0.6" />
          <path d="M180 64.5 L181 66.5 L182 64.5" fill="#e4e4e7" opacity="0.5" />
          <path d="M176 70 L177 68 L178 70" fill="#e4e4e7" opacity="0.5" />

          {/* Left horn */}
          <path
            d="M148 52 Q142 38, 135 28 Q133 25, 136 27 Q140 30, 145 42 Q146 46, 148 50"
            fill="#1a0808"
            stroke="#ff4500"
            strokeWidth="0.4"
            strokeOpacity="0.3"
          />
          {/* Right horn */}
          <path
            d="M172 52 Q168 38, 162 30 Q160 27, 163 28 Q167 32, 170 42 Q171 46, 172 50"
            fill="#1a0808"
            stroke="#ff4500"
            strokeWidth="0.4"
            strokeOpacity="0.3"
          />

          {/* Brow ridge */}
          <path
            d="M145 60 Q150 56, 158 56 Q162 56, 165 58"
            stroke="#1a0808"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />

          {/* Left eye */}
          <ellipse cx="153" cy="62" rx="3.5" ry="2.5" fill="#ffd700" filter="url(#eyeGlow)" className="dragon-eye" />
          <ellipse cx="154" cy="62" rx="1.5" ry="2.2" fill="#0a0a0f" className="dragon-pupil" />

          {/* Right eye (smaller, 3/4 view) */}
          <ellipse cx="167" cy="61" rx="2.5" ry="2" fill="#ffd700" filter="url(#eyeGlow)" className="dragon-eye" />
          <ellipse cx="167.5" cy="61" rx="1" ry="1.8" fill="#0a0a0f" className="dragon-pupil" />

          {/* Nostril */}
          <ellipse cx="183" cy="60" rx="1" ry="0.8" fill="#2a0808" />

          {/* Head spines / ridge */}
          <path d="M155 48 L153 42 L157 47" fill="#1a0808" opacity="0.7" />
          <path d="M160 47 L159 40 L163 46" fill="#1a0808" opacity="0.6" />
          <path d="M165 48 L165 42 L168 47" fill="#1a0808" opacity="0.5" />
        </g>

        {/* === FIRE BREATH === */}
        <g filter="url(#fireGlow)">
          <FireBreath />
        </g>

        {/* === FRONT LEGS / CLAWS === */}
        <g>
          {/* Left front leg */}
          <path
            d="M135 175 Q130 190, 128 205 Q127 212, 122 215 Q120 216, 118 214 Q116 212, 120 210 Q125 208, 126 200"
            fill="url(#dragonBodyGrad)"
            stroke="#ff4500"
            strokeWidth="0.3"
            strokeOpacity="0.15"
          />
          {/* Left front claws */}
          <path d="M122 215 L118 218" stroke="#ff4500" strokeWidth="0.8" strokeOpacity="0.4" />
          <path d="M122 215 L120 219" stroke="#ff4500" strokeWidth="0.8" strokeOpacity="0.4" />
          <path d="M122 215 L124 219" stroke="#ff4500" strokeWidth="0.8" strokeOpacity="0.4" />

          {/* Right front leg */}
          <path
            d="M180 175 Q185 190, 187 205 Q188 212, 193 215 Q195 216, 197 214 Q199 212, 195 210 Q190 208, 189 200"
            fill="url(#dragonBodyGrad)"
            stroke="#ff4500"
            strokeWidth="0.3"
            strokeOpacity="0.15"
          />
          {/* Right front claws */}
          <path d="M193 215 L197 218" stroke="#ff4500" strokeWidth="0.8" strokeOpacity="0.4" />
          <path d="M193 215 L195 219" stroke="#ff4500" strokeWidth="0.8" strokeOpacity="0.4" />
          <path d="M193 215 L191 219" stroke="#ff4500" strokeWidth="0.8" strokeOpacity="0.4" />
        </g>

        {/* === HIND LEGS / CLAWS === */}
        <g>
          {/* Left hind leg */}
          <path
            d="M140 188 Q132 200, 125 215 Q122 222, 118 228 Q115 232, 112 230 Q110 227, 115 224 Q120 220, 122 215"
            fill="url(#dragonBodyGrad)"
            stroke="#ff4500"
            strokeWidth="0.3"
            strokeOpacity="0.12"
          />
          <path d="M118 228 L113 231" stroke="#ff4500" strokeWidth="0.7" strokeOpacity="0.3" />
          <path d="M118 228 L116 232" stroke="#ff4500" strokeWidth="0.7" strokeOpacity="0.3" />

          {/* Right hind leg */}
          <path
            d="M180 188 Q188 200, 195 215 Q198 222, 202 228 Q205 232, 208 230 Q210 227, 205 224 Q200 220, 198 215"
            fill="url(#dragonBodyGrad)"
            stroke="#ff4500"
            strokeWidth="0.3"
            strokeOpacity="0.12"
          />
          <path d="M202 228 L207 231" stroke="#ff4500" strokeWidth="0.7" strokeOpacity="0.3" />
          <path d="M202 228 L204 232" stroke="#ff4500" strokeWidth="0.7" strokeOpacity="0.3" />
        </g>

        {/* === TAIL === */}
        <path
          d="M145 185
             Q130 195, 110 210
             Q90 225, 65 235
             Q50 240, 38 238
             Q30 236, 28 232
             Q26 228, 32 226
             Q38 225, 45 228"
          fill="none"
          stroke="url(#dragonBodyGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          className="dragon-tail"
        />
        {/* Tail spade */}
        <path
          d="M32 226 Q25 220, 22 224 Q20 228, 25 232 Q30 235, 32 230Z"
          fill="#0d0404"
          stroke="#ff4500"
          strokeWidth="0.3"
          strokeOpacity="0.2"
        />
        {/* Tail highlight */}
        <path
          d="M145 185 Q130 195, 110 210 Q90 225, 65 235 Q50 240, 38 238"
          fill="none"
          stroke="#ff4500"
          strokeWidth="0.5"
          strokeOpacity="0.12"
          strokeLinecap="round"
        />

        {/* === BACK SPINES === */}
        <g opacity="0.6">
          <path d="M155 105 L152 95 L158 104" fill="#1a0808" />
          <path d="M160 103 L158 92 L163 102" fill="#1a0808" />
          <path d="M165 105 L164 94 L168 104" fill="#1a0808" />
          <path d="M158 118 L155 110 L161 117" fill="#0d0404" />
          <path d="M163 117 L162 108 L166 116" fill="#0d0404" />
        </g>
      </svg>

      <style>{`
        .dragon-2d-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          filter: drop-shadow(0 0 30px rgba(255, 69, 0, 0.15))
                  drop-shadow(0 0 60px rgba(255, 69, 0, 0.08));
        }

        .dragon-2d-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        /* Wing flap animation */
        .dragon-wing-left {
          animation: wingFlapLeft 4s ease-in-out infinite;
        }
        .dragon-wing-right {
          animation: wingFlapRight 4s ease-in-out infinite;
        }

        @keyframes wingFlapLeft {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-6deg); }
          50% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        @keyframes wingFlapRight {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(6deg); }
          50% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }

        /* Breathing / idle animation on the whole body group */
        .dragon-2d-svg {
          animation: dragonBreathe 5s ease-in-out infinite;
        }
        @keyframes dragonBreathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.008) translateY(-2px); }
        }

        /* Fire breath flicker */
        .dragon-fire-outer {
          animation: fireFlicker1 0.8s ease-in-out infinite alternate;
        }
        .dragon-fire-mid {
          animation: fireFlicker2 0.6s ease-in-out infinite alternate;
        }
        .dragon-fire-inner {
          animation: fireFlicker3 0.5s ease-in-out infinite alternate;
        }

        @keyframes fireFlicker1 {
          0% { opacity: 0.6; transform: scaleX(0.95) translateX(-2px); }
          100% { opacity: 1; transform: scaleX(1.08) translateX(3px); }
        }
        @keyframes fireFlicker2 {
          0% { opacity: 0.7; transform: scaleX(0.97) translateX(-1px); }
          100% { opacity: 1; transform: scaleX(1.05) translateX(2px); }
        }
        @keyframes fireFlicker3 {
          0% { opacity: 0.8; transform: scaleX(0.98); }
          100% { opacity: 1; transform: scaleX(1.03) translateX(1px); }
        }

        /* Fire sparks */
        .dragon-spark {
          opacity: 0;
          animation: sparkFloat 2s ease-out infinite;
        }
        .dragon-spark-1 { animation-delay: 0s; }
        .dragon-spark-2 { animation-delay: 0.4s; }
        .dragon-spark-3 { animation-delay: 0.8s; }
        .dragon-spark-4 { animation-delay: 1.2s; }
        .dragon-spark-5 { animation-delay: 1.6s; }

        @keyframes sparkFloat {
          0% { opacity: 0; transform: translate(0, 0) scale(1); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translate(15px, -20px) scale(0.3); }
        }

        /* Eye glow pulse */
        .dragon-eye {
          animation: eyePulse 3s ease-in-out infinite;
        }
        @keyframes eyePulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
          /* Blink */
          70% { opacity: 0.9; }
          72% { opacity: 0.2; }
          74% { opacity: 0.9; }
        }

        /* Aura pulse */
        .dragon-aura {
          animation: auraPulse 4s ease-in-out infinite;
        }
        .dragon-aura-outer {
          animation: auraPulse 4s ease-in-out infinite 0.5s;
        }
        @keyframes auraPulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.03); }
        }

        /* Tail sway */
        .dragon-tail {
          animation: tailSway 6s ease-in-out infinite;
          transform-origin: 145px 185px;
        }
        @keyframes tailSway {
          0%, 100% { transform: rotate(0deg); }
          33% { transform: rotate(1.5deg); }
          66% { transform: rotate(-1deg); }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .dragon-2d-container {
            max-width: 320px;
          }
        }
        @media (min-width: 1024px) {
          .dragon-2d-container {
            max-width: 560px;
          }
        }
      `}</style>
    </motion.div>
  );
}
