import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 26, className = "", as }) => {
  const MotionTag = as ? motion[as] : motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
};

export const Stagger = ({ children, className = "", delay = 0 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-60px" }}
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: 0.08, delayChildren: delay } },
    }}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = "", y = 24 }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y },
      show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
    }}
  >
    {children}
  </motion.div>
);
