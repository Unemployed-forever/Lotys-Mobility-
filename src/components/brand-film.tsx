"use client";
import { VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
const VIDEO_URL = "/media/lotys-film.mp4";
const POSTER_URL = "/media/lotys-poster.jpg";
const SOURCE_URL = "https://www.pexels.com/video/a-mechanic-working-at-the-garage-8987272/";
const chapters = ["Ihre Fahrzeuge bleiben im Einsatz.", "Termine, Rückfragen und Zuständigkeiten an einem Ort.", "Sie sehen, was als Nächstes ansteht."];
export default function BrandFilm() {
  const ref = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [time, setTime] = useState(0);
  const [loop, setLoop] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) observer.disconnect();
    }, { rootMargin: "400px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const video = ref.current;
    if (!video || !visible) return;
    if (reduced) { video.pause(); return; }
    if (video.preload === "none") video.preload = "metadata";
    void video.play().catch(() => {});
  }, [reduced, visible]);
  const elapsed = loop * 28 + time;
  return <section ref={sectionRef} aria-labelledby="brand-film-heading" className="mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:-mt-16 lg:px-8"><div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl shadow-emerald-950/20"><div className="relative aspect-video min-h-[300px] overflow-hidden bg-slate-900"><video ref={ref} muted playsInline preload="none" poster={POSTER_URL} aria-label="Stummer Lotys Mobility Markenfilm" className="absolute inset-0 h-full w-full object-cover opacity-65" onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)} onEnded={() => { setLoop((value) => (value + 1) % 2); if (ref.current && !reduced) { ref.current.currentTime = 0; void ref.current.play().catch(() => {}); } }}>{visible ? <source src={VIDEO_URL} type="video/mp4" /> : null}</video><div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/45 to-transparent" aria-hidden="true" /><div className="absolute inset-x-0 bottom-0 p-6 sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Einblick in die operative Fuhrparkbetreuung</p><h2 id="brand-film-heading" className="mt-3 max-w-xl text-2xl font-extrabold text-white sm:text-4xl">{chapters[elapsed < 18 ? 0 : elapsed < 36 ? 1 : 2]}</h2><p className="mt-3 max-w-lg text-sm text-slate-200">Bildmaterial: Stockvideo, keine Aufnahme eines Lotys-Kunden.</p></div><div className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs text-white"><VolumeX className="mr-1 inline h-3.5 w-3.5" /> Ohne Ton</div></div><div className="flex items-center justify-between gap-4 p-4 text-xs text-slate-400 sm:px-6"><span>{reduced ? "Standbild gemäß Ihrer Einstellung für reduzierte Bewegung" : "Automatischer Markenfilm · ca. 56 Sekunden je Sequenz"}</span><a href={SOURCE_URL} target="_blank" rel="noreferrer" className="shrink-0 text-emerald-400 underline">Video: Artem Podrez / Pexels</a></div></div></section>;
}
