const turns = 1.96;
const microAdjustMarks = 6;
let fullTurns = Math.floor(turns);
let marks = Math.round((turns - fullTurns) * microAdjustMarks);
if (marks === microAdjustMarks) {
    fullTurns += 1;
    marks = 0;
}
console.log(`${fullTurns}T ${marks}M`);
