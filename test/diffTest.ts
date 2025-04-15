import { generateDiff } from "../src/lib/diffEngine";

const oldSnap = { user: "John", age: 25, country: "USA" };
const newSnap = { user: "John", age: 26, city: "NY" };

console.log(generateDiff(oldSnap, newSnap));
