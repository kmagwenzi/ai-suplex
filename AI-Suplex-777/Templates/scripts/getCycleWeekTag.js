// Returns tag like #7/cycle1/week1 based on cycle start date (March 24, 2026)
const cycleStart = new Date(2026, 2, 24); // month 2 = March
const today = tp.date.now();
const diffDays = Math.floor((today - cycleStart) / (1000 * 60 * 60 * 24));
const weekNum = Math.floor(diffDays / 7) + 1;
const cycleNum = 1;
return `7/cycle${cycleNum}/week${weekNum}`;