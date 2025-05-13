
export const getFadedColor = (name) => {
    const colors = [
        "#cbd87d", // Faded Olive Green
        "#ffffff", // Light Gray
        "#282828", // Dark Gray (Almost Black)
        "#a6a0d2"  // Muted Purple
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length; // Restrict to 4 colors
    return colors[index];
};




