import { useRef, useEffect, useState } from "react";

// Mixkit free fashion videos — designed for web embedding, no CORS issues
const VIDEO_SOURCES = [
  "https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-in-colorful-clothes-39780-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-through-colorful-confetti-39779-large.mp4",
];

// Fallback static fashion image (Unsplash, reliable)
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&q=80";

interface VideoHeroProps {
  children: React.ReactNode;
}

const VideoHero = ({ children }: VideoHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Detect slow connections and skip video loading
    const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
    const isSlow = nav.connection && ["slow-2g", "2g"].includes(nav.connection.effectiveType ?? "");
    if (isSlow) {
      setVideoFailed(true);
      return;
    }

    video.play().catch(() => setVideoFailed(true));
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* ── Video background ── */}
      {!videoFailed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlayThrough={() => setVideoLoaded(true)}
          onError={() => setVideoFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          {VIDEO_SOURCES.map((src) => (
            <source key={src} src={src} type="video/mp4" />
          ))}
        </video>
      )}

      {/* ── Fallback image: shows while video loads OR on slow connections ── */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          videoLoaded && !videoFailed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ backgroundImage: `url(${FALLBACK_IMAGE})` }}
      />

      {/* ── Gradient overlays — keeps text readable over any background ── */}
      {/* Left-to-right darkening (lighter on right for visual balance) */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-background/30" />
      {/* Top and bottom fade into site background colour */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80" />

      {/* ── Slot for page content ── */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default VideoHero;
