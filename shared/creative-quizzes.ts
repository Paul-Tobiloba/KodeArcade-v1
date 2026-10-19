export function creativeQuizItems(grade: number): [string, string, string, string, string][] {
  return [
    ['What happens when a sprite-click event is registered?', 'Its response waits until the sprite is clicked', 'Its body runs continuously straight away', 'It deletes the other instructions', 'Registration prepares a response. The click triggers the body later.'],
    ['A character reaches the border and triggers a bounce response. What changes?', 'The direction used by the next movement', 'The number of times Play has been pressed', 'The stored score automatically becomes zero', 'A bounce reflects the heading. In this studio the current movement stops at the border.'],
    ['Which block asks whether two characters are touching?', 'A Sensing block that produces true or false', 'A background block', 'A say block', 'Touch sensing produces a Boolean. An IF can use that value to select a response.'],
    ['Score is 2 + 3. What is the result of (score > 4) AND true?', 'True', 'False', 'The number 5', 'Score is 5, so the comparison is true. AND combines two true Boolean values to give true.'],
    grade >= 5 ? ['Why pass an argument to a movement helper function?', 'To reuse the same instructions with different input values', 'To make its body run before the function is called', 'To avoid checking its result', 'A parameter receives the argument for each call, so one helper can serve different distances.'] : ['Why put a greeting in a function?', 'To name and reuse the same actions', 'To run it without ever calling it', 'To stop all future events', 'A function stores a named group. Calling it runs the group when it is needed.'],
  ];
}
