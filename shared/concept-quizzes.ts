import type { RelativeQuizItem as Item } from './relative-quizzes.js';
export const conceptQuizTopics = ['operators', 'boolean', 'functions'] as const;
export function conceptQuizItems(topic: string, grade: number): Item[] {
  if (topic === 'operators') return [
    ['In 4 + 3, which part is the operator?', '+', '4', '3', 'The plus sign names the operation. Four and three are its operands.'],
    ['What does the expression 2 + 3 * 2 produce?', '8', '10', '12', 'Multiplication is evaluated before addition: three times two is six, then two plus six is eight.'],
    ['What does (2 + 3) * 2 produce?', '10', '8', '7', 'Parentheses group the addition first. Five is then multiplied by two.'],
    grade >= 5 ? ['What does 11 % 4 produce?', '3', '2', '2.75', 'Two complete groups of four use eight. The remainder is eleven minus eight, which is three.'] : ['Why does swapping the operands of 8 - 3 change the answer?', 'Subtraction depends on operand order', 'Every operator gives the same answer when swapped', 'Subtraction always produces zero', 'Eight minus three is five, while three minus eight is negative five.'],
    grade >= 4 ? ['Why is dividing by zero invalid?', 'There is no defined quotient for division by zero', 'Zero is a Boolean', 'The result is always one', 'A zero divisor cannot form a valid division. Check the second operand before dividing.'] : ['What is an expression?', 'Values and operators combined to produce a value', 'Only the name of a character', 'A command that must move something', 'An arithmetic expression calculates a value, which another instruction can store or use.'],
  ];
  if (topic === 'boolean') return [
    ['What values can a Boolean have?', 'True or false', 'Any number from one to ten', 'Only a function name', 'A Boolean represents one of two truth values: true and false.'],
    ['When is A AND B true?', 'Only when both A and B are true', 'Whenever exactly one is true', 'Whenever both are false', 'AND requires both operands to be true; one false operand makes the result false.'],
    ['When is A OR B true?', 'When at least one operand is true, including both', 'Only when exactly one operand is true', 'Only when both are false', 'Inclusive OR accepts either true operand or two true operands. It is not exclusive OR.'],
    ['What is NOT false?', 'True', 'False', 'Zero', 'NOT reverses the truth value. It does not convert a Boolean to a number.'],
    grade >= 4 ? ['What does 4 >= 4 AND 2 != 3 produce?', 'True', 'False', '4', 'The inclusive comparison is true, and two is not equal to three. AND combines two true operands.'] : ['What does 2 == 3 produce?', 'False', 'True', '5', 'Equality asks whether the two values are the same; it does not add them or assign them.'],
  ];
  if (topic === 'functions') return [
    ['Does defining a function immediately run its body?', 'No; a call runs the stored instructions', 'Yes; the body always runs once', 'Only when the name is short', 'A definition stores the function. Execution enters its body when the function is called.'],
    ['What is a main benefit of a named function?', 'Reuse one definition instead of copying its instructions', 'Guarantee that every program has no bugs', 'Make every operation run simultaneously', 'Functions group and name reusable work. Their behaviour still needs testing.'],
    grade >= 5 ? ['In double(value), called as double(3), which is the argument?', '3', 'value', 'double', 'The caller supplies argument three. The definition receives it through the parameter named value.'] : ['A function body shows 1 then 2. What does calling it twice show?', '1, 2, 1, 2', '1, 1, 2, 2', '1, 2', 'Each call runs the complete ordered body, so the pair is repeated together.'],
    grade >= 5 ? ['How is RETURN different from showing a number?', 'RETURN sends a result to the caller; SHOW displays output', 'They always have identical effects', 'SHOW always stops the function', 'A caller can use a returned value in an expression. Displaying a value alone does not return it.'] : ['How does a function differ from a loop?', 'A function names reusable work; a loop controls repetition', 'Every function repeats forever', 'A loop must define a function', 'A function describes a reusable task. A loop controls how often its body executes, and may call a function.'],
    grade >= 5 ? ['double(value) returns value * 2. What is double(2) + double(3)?', '10', '6', '5', 'The independent calls return four and six. The caller adds the returned numbers to get ten.'] : ['If a shared function body changes, what do later calls use?', 'The changed definition', 'A permanently copied old body', 'No instructions at all', 'Calls reuse the current definition rather than independent copies of its body.'],
  ];
  return [];
}
// Revision 3 corrects the focus: assess the module concept, not route mechanics.
export function topicQuizItems(topic: string, grade: number): Item[] {
  if (conceptQuizTopics.includes(topic as typeof conceptQuizTopics[number])) return conceptQuizItems(topic, grade);
  const items: Record<string, Item[]> = {
    sequences: [
      ['What is a sequence in a program?', 'Instructions arranged in an order', 'A collection with no order', 'A random choice of instructions', 'A sequence specifies which instruction runs first, next and last.'],
      ['Why can changing instruction order change a result?', 'Later instructions may depend on what earlier ones did', 'Computers automatically sort instructions', 'Every instruction is independent', 'Execution follows the sequence; an earlier action can change the state used by a later one.'],
      ['Which is an example of a dependency?', 'Put on socks before putting on shoes', 'Choose any two unrelated colours', 'Read two independent labels', 'Putting on shoes depends on having put socks on first. The order carries meaning.'],
      grade < 4 ? ['For screen-direction commands, what does move up mean?', 'Move towards the top of the screen', 'Turn left without moving', 'Move towards the bottom', 'Screen-direction commands refer to the screen, independently of the character’s facing.'] : ['How do a turn and a forward movement differ?', 'A turn changes facing; forward changes position', 'Both always change position', 'Forward always turns left', 'Directions and order belong to this combined module. A turn changes orientation without travelling.'],
      ['What is a useful way to check a sequence before running it?', 'Trace each instruction in order and predict the result', 'Count only the colours', 'Read only the final instruction', 'Tracing includes intermediate state, helping you spot an ordering mistake before testing.'],
    ],
    statements: [
      ['What is a statement?', 'An instruction a program can carry out', 'Only a stored number', 'Only a function name without a call', 'A statement tells the program to perform an action, such as an assignment or command call.'],
      ['What is an argument in a command call?', 'An input value supplied by the caller', 'The name used to receive an input in a definition', 'The number of lines in a program', 'Arguments supply actual values at a call. Parameters name the inputs in a definition.'],
      ['In paint("blue", 3), how many arguments are supplied?', 'Two', 'One', 'Three', 'The caller supplies a colour and a number. The number three is a value, not the argument count.'],
      ['Why can changing an argument change the result without changing the command?', 'The same operation can use different input values', 'Arguments replace every other instruction', 'A command ignores its inputs', 'A command describes an operation; its arguments supply the values that operation uses.'],
      ['How are parameters and arguments related?', 'Parameters receive the argument values for a call', 'They are always the same written name', 'Parameters are output messages', 'A definition names parameters. Each call passes argument values that those parameters receive.'],
    ],
    loops: [
      ['What is the body of a loop?', 'The instructions that repeat', 'Only the repeat count', 'All instructions before the loop', 'The loop body is the enclosed group executed on each repetition.'],
      ['A loop repeats a body with two instructions three times. How many body instructions execute?', 'Six', 'Three', 'Five', 'Both instructions execute on each pass: two times three is six.'],
      ['Repeat 3 times means which of these?', 'Three total passes through the body', 'One pass plus three extra passes', 'An unlimited number of passes', 'The count specifies total repetitions, not additional repeats after an uncounted first pass.'],
      ['What happens to an instruction after a completed loop?', 'It runs after all loop repetitions', 'It runs inside every repetition automatically', 'It is always skipped', 'Only instructions inside the body repeat. The next instruction runs after the loop finishes.'],
      grade >= 5 ? ['An outer loop repeats twice and its inner loop repeats three times. How often does the inner body run?', 'Six times', 'Five times', 'Three times', 'Each outer pass runs three inner passes, giving two times three total executions.'] : ['When is a loop useful?', 'When the same instruction pattern must repeat', 'When no action repeats', 'Only when a program has no order', 'A loop expresses repetition without copying the same body many times.'],
    ],
    debugging: [
      ['What is debugging?', 'Finding, repairing and retesting a problem', 'Adding random code until it looks longer', 'Avoiding every failed test', 'Debugging uses evidence from behaviour to identify and repair a problem, then verify the repair.'],
      ['Where is a useful place to start tracing a wrong result?', 'The first point where actual behaviour differs from the plan', 'Only the last line, every time', 'Only a comment’s spelling', 'The first unexpected state often reveals the instruction that introduced the error.'],
      ['Why make one useful change at a time?', 'It is easier to connect the changed behaviour to the repair', 'One change guarantees there are no more bugs', 'Testing several changes is forbidden', 'A small controlled change makes its effect easier to understand; it still needs testing.'],
      ['What should happen after a repair?', 'Run relevant tests again', 'Assume the code must now work', 'Remove the expected result', 'Retesting checks both the intended repair and whether it affected previously working behaviour.'],
      ['A program runs but gives the wrong total. Is that still a bug?', 'Yes; valid syntax does not guarantee correct logic', 'No; only syntax errors are bugs', 'No; every running program is correct', 'A logic error can produce an incorrect result even when all instructions are syntactically valid.'],
    ],
    conditionals: [
      ['What determines whether an IF body runs?', 'The condition’s truth value when checked', 'The program’s number of lines', 'The name of a character', 'IF evaluates its condition at execution time and runs the body only when the condition is true.'],
      ['In IF/ELSE, what happens when the condition is false?', 'The ELSE branch runs', 'Both branches run', 'The IF branch runs', 'IF/ELSE selects one branch: IF for true, ELSE for false.'],
      ['Does an IF/ELSE normally execute both branches for one check?', 'No; it chooses one branch', 'Yes; IF always runs first and ELSE afterwards', 'Only when the branches are short', 'The branches are alternatives selected by a single condition result.'],
      ['Why can the same condition produce a different result later?', 'The values or state it reads may have changed', 'Conditions always alternate randomly', 'Repeating a check always makes it true', 'A condition is evaluated using current values, which earlier instructions may have updated.'],
      ['Which test set best checks a two-branch conditional?', 'Cases that make the condition true and false', 'Only one easy true case', 'Only counting the instructions', 'Testing both outcomes checks whether each branch performs the intended work.'],
    ],
    variables: [
      ['What does a variable store?', 'A value associated with a name', 'Only instructions to repeat', 'Only a permanent result that cannot change', 'A variable names a stored value that a program can read and update.'],
      ['Set score to 4, then set score to 1. What is stored?', '1', '5', '4', 'Assignment replaces the old value with the new value; it does not add them.'],
      ['Score is 2. Change it by 3. What is stored?', '5', '3', '2', 'Updating by three adds three to the current value: two plus three equals five.'],
      ['Does reading a variable normally remove its value?', 'No; reading alone leaves the value unchanged', 'Yes; every read resets it', 'Only if its name is short', 'A read retrieves a value. An explicit update is needed to change it.'],
      ['Why initialize a variable before using it?', 'To establish the starting value the program expects', 'To prevent all future logic errors', 'To turn it into a function', 'Initialization gives later reads and updates a defined starting value.'],
    ],
    lists: [
      ['What does a list represent?', 'An ordered collection of values', 'Only one named property', 'An instruction that always repeats', 'List items have an order and can be selected by their positions.'],
      ['In steps = [4, 2, 7], what is at index 1?', '2', '4', '7', 'Zero-based indexing makes the first item index zero and the second item index one.'],
      ['How does append differ from replacing an indexed item?', 'Append grows the list; replacement changes an existing position', 'Both always grow the list', 'Replacement removes all other items', 'Appending creates a last position; assignment at an existing index keeps the length unchanged.'],
      ['A list has three items. Which indexes are valid in this lab?', '0, 1 and 2', '1, 2 and 3', '0, 1, 2 and 3', 'Zero-based positions for three items run from zero through two. Index three is outside the list.'],
      ['Does reading the first item remove it from a list?', 'No; a read leaves the list unchanged', 'Yes; reading always shifts the other items', 'Only if the item is zero', 'Reading retrieves a value without changing the list length or item order.'],
    ],
    objects: [
      ['What does a data object group together?', 'Related values under named properties', 'Only instructions inside a loop', 'Only values selected by numeric positions', 'Properties give meaningful names to related values, rather than identifying only their list positions.'],
      ['Robot has speed 2 and energy 3. What does reading speed return?', '2', '3', '5', 'The property name selects its own value, not a different property or the sum of all values.'],
      ['If speed changes to 1, what happens to energy 3?', 'It remains 3 unless separately updated', 'It becomes 1 automatically', 'It disappears', 'Updating one property does not update other independent properties.'],
      ['How do a list index and an object property differ?', 'An index selects a position; a property name identifies a role', 'Both must be numbers', 'Both delete the selected value', 'Lists organize items by ordered positions; objects identify values by property names.'],
      ['Does this module’s named data object imply a full class system?', 'No; named data and classes are different levels of abstraction', 'Yes; every object requires inheritance', 'Yes; every property is a method', 'This module introduces named data properties. It does not implement classes, inheritance or methods.'],
    ],
    project: [
      ['What should you establish before building a coding project?', 'The goal and constraints', 'Only the maximum code length', 'Only the final colour', 'A useful plan identifies what must happen and the requirements the solution must satisfy.'],
      ['What is decomposition?', 'Breaking a task into smaller, manageable parts', 'Copying all code without understanding it', 'Deleting the goal', 'Smaller parts can be understood, implemented and tested before combining them.'],
      ['How can you evaluate a proposed improvement?', 'Compare its tested behaviour with the requirements', 'Assume fewer blocks always means better', 'Count only the comments', 'An improvement must preserve correct behaviour, not merely alter appearance or length.'],
      ['Why test more than one relevant case?', 'Different inputs or states can expose different problems', 'One passing case proves every case', 'Testing changes the requirements', 'A solution that handles one case may still fail under another valid situation.'],
      ['What is evidence that a project meets its goal?', 'Its tests and behaviour satisfy every stated requirement', 'It is longer than another program', 'It looks exactly like someone else’s code', 'Verified behaviour against the requirements is stronger evidence than length or visual similarity.'],
    ],
  };
  return items[topic] ?? [];
}
