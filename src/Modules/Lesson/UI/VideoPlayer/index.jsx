import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Loader } from "lucide-react";
import css from "./style.module.css";

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#]{11})/
  );
  return m ? m[1] : null;
};

let _ytReady = false;
let _ytQueue = [];
const loadYTApi = (cb) => {
  if (_ytReady) return cb();
  _ytQueue.push(cb);
  if (document.getElementById("yt-api")) return;
  const s = document.createElement("script");
  s.id = "yt-api";
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
  window.onYouTubeIframeAPIReady = () => {
    _ytReady = true;
    _ytQueue.forEach(fn => fn());
    _ytQueue = [];
  };
};

// ── Хугацаа форматлах ────────────────────────────────────────────
const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

// ════════════════════════════════════════════════════════════════
//  YouTube Player
// ════════════════════════════════════════════════════════════════
const YouTubePlayer = ({ videoId, onComplete, completed }) => {
  const wrapRef    = useRef(null);  // fullscreen container
  const divRef     = useRef(null);  // YT.Player суурь div
  const playerRef  = useRef(null);
  const pollRef    = useRef(null);
  const maxRef     = useRef(0);     // хамгийн хол fraction
  const firedRef   = useRef(completed || false);
  const hideRef    = useRef(null);

  const [playing,      setPlaying]      = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [volume,       setVolume]       = useState(80);
  const [muted,        setMuted]        = useState(false);
  const [watchedPct,   setWatchedPct]   = useState(0);
  const [reachedEnd,   setReachedEnd]   = useState(completed || false);
  const [ready,        setReady]        = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen,   setFullscreen]   = useState(false);

  // ── Player init ──────────────────────────────────────────────
  useEffect(() => {
    let destroyed = false;
    loadYTApi(() => {
      if (destroyed || !divRef.current) return;
      playerRef.current = new window.YT.Player(divRef.current, {
        videoId,
        playerVars: {
          controls:       0,
          disablekb:      1,
          rel:            0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline:    1,
          fs:             0,
          origin:         window.location.origin,
        },
        events: {
          onReady(e) {
            if (destroyed) return;
            setDuration(e.target.getDuration());
            e.target.setVolume(80);
            setReady(true);
          },
          onStateChange(e) {
            if (destroyed) return;
            const S = window.YT.PlayerState;
            if (e.data === S.PLAYING) {
              setPlaying(true);
              startPoll();
            } else {
              setPlaying(false);
              stopPoll();
            }
            if (e.data === S.ENDED) fire();
          },
        },
      });
    });
    return () => {
      destroyed = true;
      stopPoll();
      try { playerRef.current?.destroy(); } catch (_) {}
    };
  }, [videoId]);

  const startPoll = () => {
    stopPoll();
    pollRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      const ct  = p.getCurrentTime();
      const dur = p.getDuration() || 1;
      setCurrentTime(ct);
      setDuration(dur);
      const frac = ct / dur;
      if (frac > maxRef.current) {
        maxRef.current = frac;
        const pct = Math.round(frac * 100);
        setWatchedPct(pct);
        if (pct >= 95) fire();
      }
    }, 250);
  };

  const stopPoll = () => clearInterval(pollRef.current);

  const fire = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setReachedEnd(true);
    onComplete?.();
  };

  // ── Controls ─────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p?.getPlayerState) return;
    if (p.getPlayerState() === window.YT.PlayerState.PLAYING) p.pauseVideo();
    else p.playVideo();
  }, []);

  const handleBarClick = (e) => {
    const p = playerRef.current;
    if (!p || !duration) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    const safe  = Math.min(ratio, maxRef.current);
    p.seekTo(safe * duration, true);
    setCurrentTime(safe * duration);
  };

  const handleVolume = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    playerRef.current?.setVolume(val);
    val === 0 ? playerRef.current?.mute() : playerRef.current?.unMute();
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) { p.unMute(); p.setVolume(volume || 50); setMuted(false); }
    else        { p.mute();   setMuted(true); }
  };

  // ── Fullscreen ───────────────────────────────────────────────
  const toggleFs = () => {
    if (!document.fullscreenElement) wrapRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // ── Auto-hide controls ────────────────────────────────────────
  const resetHide = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideRef.current);
    if (playing) hideRef.current = setTimeout(() => setShowControls(false), 3000);
  }, [playing]);
  useEffect(() => {
    if (!playing) setShowControls(true);
    return () => clearTimeout(hideRef.current);
  }, [playing]);

  const playedFrac = duration ? currentTime / duration : 0;

  return (
    <div
      ref={wrapRef}
      className={[css.wrapper, fullscreen ? css.fsMode : ""].filter(Boolean).join(" ")}
      onMouseMove={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* YT.Player div placeholder */}
      <div ref={divRef} className={css.ytBox} />

      {/* Click blocker — YouTube native UI-г бүрэн хаана */}
      <div className={css.blocker} onClick={togglePlay} />

      {!ready && (
        <div className={css.loadBox}>
          <Loader size={38} className={css.spin} />
        </div>
      )}

      {!playing && ready && (
        <div className={css.bigPlay} onClick={togglePlay}>
          <div><Play size={44} fill="white" color="white" /></div>
        </div>
      )}

      {/* Controls */}
      <div
        className={[css.controls, showControls ? css.show : ""].filter(Boolean).join(" ")}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className={css.bar} onClick={handleBarClick}>
          <div className={css.barBg} />
          <div className={css.barMax}  style={{ width: (maxRef.current * 100) + "%" }} />
          <div className={css.barPlay} style={{ width: (playedFrac   * 100) + "%" }} />
          <div className={css.thumb}   style={{ left:  (playedFrac   * 100) + "%" }} />
        </div>

        <div className={css.row}>
          <div className={css.left}>
            <button className={css.btn} onClick={togglePlay}>
              {playing ? <Pause size={20}/> : <Play size={20} fill="white" color="white"/>}
            </button>
            <div className={css.vol}>
              <button className={css.btn} onClick={toggleMute}>
                {muted || volume === 0 ? <VolumeX size={20}/> : <Volume2 size={20}/>}
              </button>
              <input
                type="range" min={0} max={100} step={2}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className={css.volSlider}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <span className={css.time}>{fmt(currentTime)} / {fmt(duration)}</span>
          </div>
          <div className={css.right}>
            <div className={css.pill}>
              <div className={css.pillFill} style={{ width: watchedPct + "%" }} />
              <span className={css.pillLabel}>{watchedPct}%</span>
            </div>
            <button className={css.btn} onClick={toggleFs}>
              {fullscreen ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}
            </button>
          </div>
        </div>
      </div>

      {reachedEnd && (
        <div className={css.banner}>
          ✓ Бичлэгийг үзэж дууслаа{completed ? " (тэмдэглэгдсэн)" : ""}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  Native Video Player
// ════════════════════════════════════════════════════════════════
const NativePlayer = ({ src, onComplete, completed }) => {
  const wrapRef   = useRef(null);
  const videoRef  = useRef(null);
  const barRef    = useRef(null);
  const hideRef   = useRef(null);
  const maxRef    = useRef(0);
  const firedRef  = useRef(completed || false);

  const [playing,      setPlaying]      = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [volume,       setVolume]       = useState(0.8);
  const [muted,        setMuted]        = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [watchedPct,   setWatchedPct]   = useState(0);
  const [reachedEnd,   setReachedEnd]   = useState(completed || false);
  const [fullscreen,   setFullscreen]   = useState(false);

  const fire = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setReachedEnd(true);
    onComplete?.();
  };

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const ct   = v.currentTime;
    const dur  = v.duration || 1;
    setCurrentTime(ct);
    const frac = ct / dur;
    if (frac > maxRef.current) {
      maxRef.current = frac;
      const pct = Math.round(frac * 100);
      setWatchedPct(pct);
      if (pct >= 95) fire();
    }
  }, []);

  // Ухраахыг хориглох
  const handleSeeking = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const frac = v.currentTime / (v.duration || 1);
    if (frac > maxRef.current + 0.01) {
      v.currentTime = maxRef.current * (v.duration || 1);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  }, []);

  const handleBarClick = (e) => {
    const v = videoRef.current;
    if (!v || !barRef.current) return;
    const rect  = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    const safe  = Math.min(ratio, maxRef.current);
    v.currentTime = safe * v.duration;
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val); setMuted(val === 0);
    if (videoRef.current) videoRef.current.volume = val;
  };

  const toggleMute = () => {
    const newM = !muted;
    setMuted(newM);
    if (videoRef.current) videoRef.current.muted = newM;
  };

  const toggleFs = () => {
    if (!document.fullscreenElement) wrapRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const resetHide = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideRef.current);
    if (playing) hideRef.current = setTimeout(() => setShowControls(false), 3000);
  }, [playing]);
  useEffect(() => {
    if (!playing) setShowControls(true);
    return () => clearTimeout(hideRef.current);
  }, [playing]);

  const playedFrac = duration ? currentTime / duration : 0;

  return (
    <div
      ref={wrapRef}
      className={[css.wrapper, fullscreen ? css.fsMode : ""].filter(Boolean).join(" ")}
      onMouseMove={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        className={css.video}
        onLoadedMetadata={() => { setDuration(videoRef.current?.duration || 0); setLoading(false); }}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); fire(); }}
        playsInline
      />

      {loading && (
        <div className={css.loadBox}>
          <Loader size={38} className={css.spin} />
        </div>
      )}

      {!playing && !loading && (
        <div className={css.bigPlay}>
          <div><Play size={44} fill="white" color="white" /></div>
        </div>
      )}

      <div
        className={[css.controls, showControls ? css.show : ""].filter(Boolean).join(" ")}
        onClick={e => e.stopPropagation()}
      >
        <div ref={barRef} className={css.bar} onClick={handleBarClick}>
          <div className={css.barBg} />
          <div className={css.barMax}  style={{ width: (maxRef.current * 100) + "%" }} />
          <div className={css.barPlay} style={{ width: (playedFrac   * 100) + "%" }} />
          <div className={css.thumb}   style={{ left:  (playedFrac   * 100) + "%" }} />
        </div>

        <div className={css.row}>
          <div className={css.left}>
            <button className={css.btn} onClick={togglePlay}>
              {playing ? <Pause size={20}/> : <Play size={20} fill="white" color="white"/>}
            </button>
            <div className={css.vol}>
              <button className={css.btn} onClick={toggleMute}>
                {muted || volume === 0 ? <VolumeX size={20}/> : <Volume2 size={20}/>}
              </button>
              <input
                type="range" min={0} max={1} step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className={css.volSlider}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <span className={css.time}>{fmt(currentTime)} / {fmt(duration)}</span>
          </div>
          <div className={css.right}>
            <div className={css.pill}>
              <div className={css.pillFill} style={{ width: watchedPct + "%" }} />
              <span className={css.pillLabel}>{watchedPct}%</span>
            </div>
            <button className={css.btn} onClick={toggleFs}>
              {fullscreen ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}
            </button>
          </div>
        </div>
      </div>

      {reachedEnd && (
        <div className={css.banner}>
          ✓ Бичлэгийг үзэж дууслаа{completed ? " (тэмдэглэгдсэн)" : ""}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  Export — URL-аас автоматаар сонгоно
// ════════════════════════════════════════════════════════════════
const VideoPlayer = ({ src, onComplete, completed }) => {
  const ytId = getYouTubeId(src);
  if (ytId) return <YouTubePlayer videoId={ytId} onComplete={onComplete} completed={completed} />;
  return <NativePlayer src={src} onComplete={onComplete} completed={completed} />;
};

export default VideoPlayer;