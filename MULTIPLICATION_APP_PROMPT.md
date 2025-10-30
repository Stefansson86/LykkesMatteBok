# Prompt for Creating a Multiplication Learning Game

Create a fun and interactive multiplication learning game for children in Swedish, similar to "Lykkes Mattebok" but focused exclusively on multiplication practice.

## Core Requirements

### Game Mechanics
- **Operation**: Multiplication only (e.g., "3 × 4")
- **Number Range**: Start with multiplication tables 1-10
- **Answer Options**: 2×2 grid (4 answer choices) - one correct, three plausible incorrect answers
- **Lives System**: 3 hearts/lives - game ends after 3 mistakes
- **Streak Tracking**:
  - Current streak counter (consecutive correct answers)
  - Best streak saved in localStorage between sessions
- **Feedback System**:
  - Immediate visual feedback (green for correct, red for wrong)
  - Display correct answer when player makes a mistake
  - Encouraging Swedish messages after each answer

### User Interface

#### Layout Components
1. **Banner**: Title with emojis - "📚 Lykkes Multiplikationsboken ✨" or similar creative name
2. **Stats Header**:
   - Current streak with star emoji ⭐
   - Best streak with trophy emoji 🏆
   - Lives display with heart emojis ❤️ (fade out when lost)
3. **Question Box**: Large, prominent display of the multiplication problem
4. **Answer Grid**: 2×2 grid of buttons with answer choices
5. **Feedback Area**: Space for positive/corrective messages
6. **Game Over Modal**: Shows final streak, encouragement, and restart button

#### Visual Design
- **Child-friendly aesthetic**: Rounded corners, playful font (Comic Sans MS or similar)
- **Colorful theme**: Use vibrant colors for buttons and backgrounds
- **Purple/blue color scheme** with accents
- **Answer buttons**:
  - Default: Purple/lavender (#a29bfe)
  - Hover: Darker purple with lift effect
  - Correct: Green (#55efc4) with pulse animation
  - Wrong: Red (#ff7675) with shake animation
- **Responsive**: Works on desktop, tablet, and mobile

### Game Logic

#### Problem Generation
- Generate two random numbers (1-10)
- Create multiplication equation (e.g., "7 × 3")
- Calculate correct answer
- Generate 3 unique plausible wrong answers (within reasonable range of correct answer)
- Shuffle all 4 answers randomly in the grid

#### Answer Validation
- When player clicks an answer:
  - Disable all buttons
  - Show visual feedback on selected button
  - If correct:
    - Increment streak
    - Update best streak if exceeded
    - Show positive message in Swedish
    - Wait 1.5 seconds, then generate new problem
  - If wrong:
    - Increment strikes counter
    - Show correct answer by highlighting it
    - Fade out one heart
    - Show corrective message
    - If strikes < 3: Wait 2 seconds, generate new problem
    - If strikes = 3: Wait 2 seconds, show game over modal

#### Game Over
- Display final streak count
- Show encouraging message based on performance:
  - 0 correct: "Ingen fara! Multiplikation tar lite tid att lära sig. 🌱"
  - 1-4 correct: "Bra början! Fortsätt öva på dina multiplikationstabeller! 🌟"
  - 5-9 correct: "Jättebra! Du håller på att bli expert på multiplikation! 🎈"
  - 10+ correct: "Fantastiskt! Du är en riktig multiplikationschampion! 🏆"
- Offer "Försök igen!" button to restart

### Technical Implementation

#### File Structure
```
multiplication-game/
├── index.html      # HTML structure
├── styles.css      # Styling and animations
├── script.js       # Game logic
└── README.md       # Documentation
```

#### Technology Stack
- **HTML5**: Semantic structure
- **CSS3**:
  - Flexbox and Grid for layout
  - CSS animations (pulse, shake, fade-in)
  - Media queries for responsiveness
- **Vanilla JavaScript** (ES6+):
  - No frameworks or libraries
  - localStorage API for saving best streak
  - DOM manipulation
  - Event listeners

#### Key Features to Implement
1. **Random number generation** with proper range (1-10)
2. **Answer generation algorithm** that creates plausible incorrect answers
3. **Fisher-Yates shuffle** for randomizing answer positions
4. **localStorage integration** for persistent best streak
5. **Animation system**:
   - Correct answer pulse
   - Wrong answer shake
   - Heart fade-out
   - Modal fade-in
6. **Responsive design** with mobile breakpoints

### Swedish Language Elements

#### Positive Feedback Messages (when correct)
- "Rätt! 🎉"
- "Jättebra! ⭐"
- "Perfekt! 🌟"
- "Härligt! 🎈"
- "Superbt! 💪"
- "Fantastiskt! 🚀"

#### UI Text
- Title: "Lykkes Multiplikationsboken" or creative variation
- Streak label: "Rad:"
- Best label: "Bästa:"
- Feedback for wrong answer: "Rätt svar är [number]"
- Game over heading: "🎉 Bra försök! 🎉"
- Result message: "Du klarade en rad på [streak]!"
- Restart button: "Försök igen!"

### Additional Considerations

#### Answer Generation Strategy
For multiplication, wrong answers should be:
- Other products from nearby multiplication tables
- Off-by-one-table errors (e.g., for 7×3, include 7×2 or 7×4)
- Common mistakes (e.g., 6×7=42, but offer 41, 43, 48 as alternatives)
- Keep wrong answers in range (1-100) and unique

#### Difficulty Progression Ideas (Optional)
- Start with easier tables (2, 5, 10)
- Progress to harder tables (7, 8, 9)
- Mix easy and hard after certain streak milestones
- Add time pressure for advanced mode

#### Accessibility
- Large, tappable buttons (min 40px padding)
- High contrast colors
- Clear, readable fonts (min 1.2em for body text)
- Emoji-enhanced visual feedback

### Expected Behavior

1. On page load:
   - Load best streak from localStorage
   - Display initial problem
   - All 3 hearts visible
   - Streak starts at 0

2. During gameplay:
   - Player clicks answer
   - Immediate visual feedback
   - Appropriate delay before next question
   - Hearts fade as mistakes accumulate
   - Streak increments only on correct answers

3. On game over:
   - Modal appears after 3rd mistake
   - Shows final score and encouragement
   - Restart button resets game (but preserves best streak)

### Deliverables

Create a complete, working game with:
- Clean, commented code
- Responsive design
- Smooth animations
- Engaging user experience
- Swedish language throughout
- Ready to deploy to GitHub Pages

The game should be educational, encouraging, and fun for children learning multiplication tables!
