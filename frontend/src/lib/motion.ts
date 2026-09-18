export const editorialEase = [0.22, 1, 0.36, 1] as const;

export const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

export const viewportOnce = { once: true, amount: 0.28 } as const;
