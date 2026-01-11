---
task: Add dark mode toggle to the todo app
test_command: "npm run dev"
---

# Task: Dark Mode Toggle

Add a dark/light mode toggle to the existing todo list app.

## Requirements

1. Toggle button in the top-right corner
2. Saves preference to localStorage
3. Respects system preference on first load
4. Smooth transition between modes

## Success Criteria

1. [ ] Toggle button visible in top-right corner (sun/moon icon)
2. [ ] Clicking toggle switches between light and dark themes
3. [ ] Light mode has a clean white/gray aesthetic
4. [ ] Theme preference persists after page refresh (localStorage)
5. [ ] On first visit, respects system color scheme preference

## Technical Notes

- The existing app uses Tailwind CSS with dark: variants
- Keep all logic in `app/page.tsx` for simplicity
- Use `window.matchMedia('(prefers-color-scheme: dark)')` for system preference
- Store theme in localStorage key: `ralph-theme`

---

## Ralph Instructions

1. Read the existing `app/page.tsx` first to understand current implementation
2. Work on the next incomplete criterion (marked [ ])
3. Check off completed criteria (change [ ] to [x])
4. Run the dev server to test changes visually
5. Commit your changes frequently with descriptive messages
6. When ALL criteria are [x], output: `<ralph>COMPLETE</ralph>`
7. If stuck on the same issue 3+ times, output: `<ralph>GUTTER</ralph>`
