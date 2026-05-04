"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 15, suffix: "+", label: "Years in ophthalmic care" },
  { value: 50, suffix: "+", label: "Ophthalmic products" },
  { value: 5000, suffix: "+", label: "Patients served" },
  { value: 20, suffix: "+", label: "Cities covered" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}

export default function StatsCounter() {
  return (
    <section className="bg-white py-20 md:py-24 border-b border-black/[0.06]">
      <div className="container-premium">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-black/[0.06]">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-center px-6" style={{ paddingTop: "40px", paddingBottom: "40px" }}
            >
              <p className="font-numeric text-[2.4rem] md:text-[3rem] font-bold text-primary leading-none">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-muted text-[12px] leading-snug" style={{ marginTop: "16px" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
