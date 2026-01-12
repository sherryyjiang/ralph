---
task: Brainstorm and implement 3 design improvements for the todo app
test_command: "npm run dev"
---

# Task: Design Improvement Sprint

Analyze the current todo app, brainstorm 3 meaningful design improvements, then implement them one by one.

## Phase 1: Brainstorming

Before implementing anything, analyze the current app and document 3 design improvements in `.ralph/design-ideas.md`. Consider:
- Visual hierarchy and typography
- Micro-interactions and animations  
- Empty states and loading states
- Accessibility improvements
- Mobile responsiveness
- Delightful details (shadows, gradients, hover effects)

## Success Criteria

### Brainstorming Phase
1. [x] Create `.ralph/design-ideas.md` with 3 specific, actionable design improvements
2. [x] Each idea includes: problem it solves, visual description, and implementation approach

### Implementation Phase  
3. [ ] Implement Design Improvement #1 from the brainstorm doc
4. [ ] Implement Design Improvement #2 from the brainstorm doc
5. [ ] Implement Design Improvement #3 from the brainstorm doc

### Verification Phase
6. [ ] All changes pass linting (npm run lint)
7. [ ] App runs without errors
8. [ ] Commit all changes with descriptive messages

## Technical Notes

- The app is at `app/page.tsx` - a Next.js + Tailwind todo app
- It already has dark/light mode toggle
- Keep all logic in `page.tsx` for simplicity
- Focus on CSS/Tailwind changes, minimal JS changes
- Make each improvement visually distinct and noticeable

---

## Ralph Instructions

1. Read `app/page.tsx` first to understand the current design
2. Create the brainstorm doc BEFORE implementing anything
3. Work through improvements one at a time
4. Commit after each improvement is complete
5. Check off criteria as you complete them
6. When ALL criteria are [x], output: `<ralph>COMPLETE</ralph>`
7. If stuck on the same issue 3+ times, output: `<ralph>GUTTER</ralph>`
