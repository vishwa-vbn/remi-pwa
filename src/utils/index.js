export const getFadedColor = (name) => {
  const colors = [
    "#cbd87d", // Faded Olive Green
    "#ffffff", // Light Gray
    "#282828", // Dark Gray (Almost Black)
    "#a6a0d2", // Muted Purple
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length; // Restrict to 4 colors
  return colors[index];
};



export const sheetVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
};

export const keywordActions = {
    confirm: ["confirm", "yes", "okay", "sure", "yep", "accept", "agree", "save"],
    change: ["change", "edit", "no", "redo", "retry", "modify", "revise"],
    enhance: ["enhance", "improve", "better", "refine", "polish"],
    original: ["original", "use original", "keep", "my version"],
    select: ["select", "choose", "pick"],
    skip: ["skip", "none", "nothing", "pass"],
    cancel: ["cancel", "stop", "discard", "quit", "exit"],
    alertOn: ["yes", "enable", "on", "alert on"],
    alertOff: ["no", "disable", "off", "alert off"],
  };

  export const cleanResponseText = (text) =>
    text
      .replace(/[*_~#+=|{}[\]()\\<>^$@!%]/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
