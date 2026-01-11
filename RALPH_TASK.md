---
task: Build a simple web-based todo list app
test_command: "npm run dev"
---

# Task: Simple Todo List Web App

Build a beautiful, simple todo list web app using Next.js and Tailwind CSS.

## Requirements

1. Single page app at the root route (`/`)
2. Users can add new todos
3. Users can mark todos as complete (strikethrough)
4. Users can delete todos
5. Todos persist in localStorage
6. Clean, modern UI with nice styling

## Success Criteria

1. [ ] App runs without errors on `npm run dev`
2. [ ] Page shows a heading "My Todos" and an input field
3. [ ] Typing a todo and pressing Enter adds it to the list
4. [ ] Clicking a todo toggles its completed state (strikethrough)
5. [ ] Each todo has a delete button that removes it
6. [ ] Todos persist after page refresh (localStorage)

## Technical Notes

- Use the existing Next.js setup (already installed)
- Keep it simple - all logic can live in `app/page.tsx`
- Use Tailwind for styling (already configured)
- Use React hooks for state management

---

## Ralph Instructions

1. Work on the next incomplete criterion (marked [ ])
2. Check off completed criteria (change [ ] to [x])
3. Run the dev server to test changes
4. Commit your changes frequently
5. When ALL criteria are [x], output: `<ralph>COMPLETE</ralph>`
6. If stuck on the same issue 3+ times, output: `<ralph>GUTTER</ralph>`
