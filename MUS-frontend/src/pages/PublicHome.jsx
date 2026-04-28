import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useMotionValue, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import PublicHomeHeader from "@/features/publicHome/components/PublicHomeHeader";
import PublicHeroSection from "@/features/publicHome/components/PublicHeroSection";
import PublicRoleSection from "@/features/publicHome/components/PublicRoleSection";
import PublicStatsSection from "@/features/publicHome/components/PublicStatsSection";
import PublicFooterSection from "@/features/publicHome/components/PublicFooterSection";
import PublicHomeCursorFollower from "@/features/publicHome/components/PublicHomeCursorFollower";
import { navLinks, musRolePillars } from "@/features/publicHome/data/content";

gsap.registerPlugin(ScrollTrigger);

const CURSOR_HIDE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "[role='button']",
  "[role='link']",
  "[data-cursor-hide='true']",
].join(",");

const CURSOR_FORCE_SELECTOR = "[data-cursor-force='true']";

const PublicHome = () => {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [cursorVisible, setCursorVisible] = useState(false);

  const handleMouseMove = useCallback((event) => {
    if (reduced) return;
    mouseX.set(event.clientX);
    mouseY.set(event.clientY);
    const target = event.target;
    if (!(target instanceof Element)) {
      setCursorVisible(true);
      return;
    }

    const isForced = Boolean(target.closest(CURSOR_FORCE_SELECTOR));
    const shouldHide = Boolean(target.closest(CURSOR_HIDE_SELECTOR));
    setCursorVisible(isForced || !shouldHide);
  }, [mouseX, mouseY, reduced]);

  const handleMouseEnter = useCallback(() => {
    if (!reduced) setCursorVisible(true);
  }, [reduced]);

  const handleMouseLeave = useCallback(() => {
    setCursorVisible(false);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-anim='nav']", {
        opacity: 0,
        y: -18,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from("[data-role-intro]", {
        opacity: 0,
        y: 24,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-role-section]",
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from("[data-hero='title']", {
        opacity: 0,
        y: 24,
        duration: 0.65,
        ease: "power2.out",
        delay: 0.08,
      });

      gsap.from("[data-hero='subtitle']", {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.18,
      });

      gsap.from("[data-hero='search']", {
        opacity: 0,
        y: 16,
        duration: 0.55,
        ease: "power2.out",
        delay: 0.3,
      });

      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.from("[data-stats-item]", {
        opacity: 0,
        y: 22,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: "[data-stats-item]",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.utils.toArray("[data-count-to]").forEach((el) => {
        const target = Number(el.getAttribute("data-count-to") || 0);
        const suffix = el.getAttribute("data-count-suffix") || "";
        const counter = { value: 0 };

        gsap.to(counter, {
          value: target,
          duration: 1.2,
          ease: "power2.out",
          snap: { value: 1 },
          onUpdate: () => {
            el.textContent = `${Math.round(counter.value)}${suffix}`;
          },
          scrollTrigger: {
            trigger: el.closest("[data-stats-item]") || el,
            start: "top 86%",
            once: true,
          },
        });
      });

      gsap.utils.toArray("[data-float]").forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 === 0 ? 14 : -12,
          x: i % 2 === 0 ? -10 : 8,
          duration: 3.5 + i * 0.7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={rootRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}
    >
      <PublicHomeCursorFollower
        mouseX={mouseX}
        mouseY={mouseY}
        isVisible={cursorVisible}
        reduced={Boolean(reduced)}
      />
      <PublicHomeHeader navLinks={navLinks} />
      <PublicHeroSection />
      <PublicRoleSection pillars={musRolePillars} />
      <PublicStatsSection />
      <PublicFooterSection />
    </Box>
  );
};

export default PublicHome;
