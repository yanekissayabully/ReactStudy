function print(sectionId, label, value) {
  const box = document.getElementById(sectionId);
  const line = document.createElement("div");
  line.className = "line";

  const text = typeof value === "string" ? value : JSON.stringify(value);
  line.innerHTML = `<span class="label">${label}:</span> ${text}`;
  box.appendChild(line);

  console.log(label + ":", value);
}



(function task1() {
  const name = "Расул";
  const age = 21;
  const isActive = true;
  const courses = ["Реакт", "СЕО", "КС2"];
  const address = { city: "Алматы", street: "Брусиловского 159" };

  const nothing = null;       
  let notDefinedYet;          

  print("out1", "name", name);
  print("out1", "typeof name", typeof name);
  print("out1", "age", age);
  print("out1", "typeof age", typeof age);
  print("out1", "isActive", isActive);
  print("out1", "typeof isActive", typeof isActive);
  print("out1", "courses", courses);
  print("out1", "typeof courses", typeof courses);
  print("out1", "address", address);
  print("out1", "typeof address", typeof address);
  print("out1", "nothing (null)", nothing);
  print("out1", "typeof nothing", typeof nothing);
  print("out1", "notDefinedYet", notDefinedYet);
  print("out1", "typeof notDefinedYet", typeof notDefinedYet);

  print("out1", "primitive / reference", "name, age, isActive — примитивы; courses, address — reference types (объекты)");

  const sentence = `Студент ${name}, возраст ${age}, изучает ${courses.length} курса, живёт в ${address.city}.`;
  print("out1", "template literal", sentence);

  document.getElementById("a1-1").textContent =
    "let можно переприсвоить, const нет (сама привязка имени фиксируется, но содержимое объекта/массива менять можно).";
  document.getElementById("a1-2").textContent = typeof null + " это как бы историческая ошибка в JS, null на самом деле не object.";
  document.getElementById("a1-3").textContent = "string, number, boolean, null, undefined, symbol, bigint.";
})();


/* ==========================================================
   2 — Arrays
   ========================================================== */
(function task2() {
  const numbers = [3, 7, 2, 10, 5];

  const doubled = numbers.map(n => n * 2);
  const above5 = numbers.filter(n => n > 5);
  const firstAbove5 = numbers.find(n => n > 5);
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  const has10 = numbers.includes(10);

  print("out2", "original", numbers);
  print("out2", "doubled (map)", doubled);
  print("out2", "above5 (filter)", above5);
  print("out2", "firstAbove5 (find)", firstAbove5);
  print("out2", "sum (reduce)", sum);
  print("out2", "includes 10", has10);
  print("out2", "original after all ops (unchanged)", numbers);
})();


/* ==========================================================
   3 — Arrays of Objects
   ========================================================== */
(function task3() {
  const students = [
    { id: 1, name: "Anna", grade: 85 },
    { id: 2, name: "John", grade: 62 },
    { id: 3, name: "Sara", grade: 91 },
    { id: 4, name: "Mike", grade: 55 },
  ];

  const passThreshold = 70;

  const passing = students.filter(s => s.grade >= passThreshold);
  const names = students.map(s => s.name);
  const studentById3 = students.find(s => s.id === 3);
  const topStudent = students.reduce((best, s) => (s.grade > best.grade ? s : best), students[0]);
  const average = students.reduce((acc, s) => acc + s.grade, 0) / students.length;
  const withPassed = students.map(s => ({ ...s, passed: s.grade >= passThreshold }));

  print("out3", "students", students);
  print("out3", "passing (grade >= 70)", passing);
  print("out3", "names", names);
  print("out3", "student id=3", studentById3);
  print("out3", "topStudent", topStudent);
  print("out3", "average", average.toFixed(2));
  print("out3", "withPassed (new array)", withPassed);
  print("out3", "original students (unchanged)", students);
})();


/* ==========================================================
   4 — Objects
   ========================================================== */
(function task4() {
  const user = {
    id: 1,
    name: "Alice",
    age: 25,
    address: { city: "Almaty", street: "Abay 10" },
  };

  print("out4", "user", user);
  print("out4", "user.name", user.name);
  print("out4", "user.address.city", user.address.city);

  user.age = 26; // change
  print("out4", "after age change", user.age);

  user.email = "alice@mail.com"; // add
  print("out4", "after adding email", user);

  delete user.address.street; // remove
  print("out4", "after removing street", user);

  const { name, age } = user;
  print("out4", "destructured name/age", { name, age });

  const { address: { city } } = user;
  print("out4", "nested destructure city", city);

  const { name: userName } = user;
  print("out4", "renamed during destructuring (userName)", userName);
})();


/* ==========================================================
   5 — Values and References
   ========================================================== */
(function task5() {
  let original = { name: "Alice", score: 10 };
  let copy = original; // это НЕ копия, а ссылка на тот же объект

  copy.score = 99;
  print("out5", "original after copy.score change (same object!)", original);
  print("out5", "explanation", "copy = original не копирует объект, а копирует ссылку. Оба имени указывают на один и тот же объект в памяти.");

  original = { name: "Alice", score: 10 };
  const realCopy = { ...original }; // настоящая копия верхнего уровня
  realCopy.score = 50;
  print("out5", "original after spread copy change", original);
  print("out5", "realCopy", realCopy);

  const user = { name: "Alice", address: { city: "Almaty" } };
  const userCopy = { ...user };
  userCopy.address.city = "Astana";
  print("out5", "userCopy.address.city changed", userCopy.address.city);
  print("out5", "original user.address.city (also changed!)", user.address.city);
  print("out5", "why", "spread копирует только верхний уровень (shallow copy). Вложенный объект address — та же ссылка в обеих копиях.");

  const user2 = { name: "Alice", address: { city: "Almaty" } };
  const properCopy = { ...user2, address: { ...user2.address } };
  properCopy.address.city = "Astana";
  print("out5", "proper deep-ish copy: original stays", user2.address.city);
  print("out5", "proper deep-ish copy: copy changed", properCopy.address.city);
})();


/* ==========================================================
   6 — Functions
   ========================================================== */
function isEven(number) {
  return number % 2 === 0;
}

const getFullName = (firstName, lastName) => `${firstName} ${lastName}`;

function calculatePrice(price, quantity) {
  return price * quantity;
}

const calculateDiscount = (price, percent) => price - (price * percent) / 100;

const getMax = (a, b) => (a > b ? a : b);

(function task6() {
  print("out6", "isEven(4)", isEven(4));
  print("out6", "isEven(7)", isEven(7));
  print("out6", "getFullName('John','Doe')", getFullName("John", "Doe"));
  print("out6", "calculatePrice(100, 3)", calculatePrice(100, 3));
  print("out6", "calculateDiscount(200, 10)", calculateDiscount(200, 10));
  print("out6", "getMax(5, 12)", getMax(5, 12));
  print("out6", "note", "isEven написан как обычная function, getFullName — как arrow function (см. код в script.js).");
})();


/* ==========================================================
   7 — Functions as Values
   ========================================================== */
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function calculate(a, b, operation) {
  return operation(a, b);
}

(function task7() {
  print("out7", "calculate(5,3,add)", calculate(5, 3, add));
  print("out7", "calculate(5,3,multiply)", calculate(5, 3, multiply));

  document.getElementById("a7-1").textContent = "Да, функция — это обычное значение, её можно присвоить переменной.";
  document.getElementById("a7-2").textContent = "Да, функции можно передавать как аргументы (это и есть функции высшего порядка).";
  document.getElementById("a7-3").textContent = "add — это ссылка на саму функцию, add() — это вызов функции, результат её выполнения.";
})();


/* ==========================================================
   8 — Scope
   ========================================================== */
(function task8() {
  const message = "global";
  print("out8", "global message", message);

  function showScopes() {
    let message = "function";
    print("out8", "inside function, message", message);

    if (true) {
      let message = "block";
      print("out8", "inside if-block, message", message);
    }

    print("out8", "back in function, message", message); // всё ещё "function"
  }
  showScopes();
  print("out8", "back in global, message", message); // всё ещё "global"

  {
    var varInBlock = "var value";
    let letInBlock = "let value";
    const constInBlock = "const value";
  }

  print("out8", "varInBlock outside the block", varInBlock); // доступна, var не блочная
  try {
    print("out8", "letInBlock outside the block", letInBlock);
  } catch (e) {
    print("out8", "letInBlock outside the block", "ReferenceError — " + e.message);
  }

  document.getElementById("a8-1").textContent = "Переменная видна во всём файле/скрипте.";
  document.getElementById("a8-2").textContent = "Переменная видна только внутри функции, где объявлена.";
  document.getElementById("a8-3").textContent = "Переменная (let/const) видна только внутри { } блока, где объявлена.";
  document.getElementById("a8-4").textContent =
    "var — функциональная область видимости, игнорирует блоки; let/const — блочная область видимости; const дополнительно запрещает переприсваивание.";
})();


/* ==========================================================
   9 — Closure
   ========================================================== */
function createCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

function createAdder(value) {
  return function (num) {
    return value + num;
  };
}

(function task9() {
  const counterA = createCounter();
  print("out9", "counterA()", counterA());
  print("out9", "counterA()", counterA());
  print("out9", "counterA()", counterA());

  const counterB = createCounter();
  print("out9", "counterB() (свой собственный count)", counterB());

  const addFive = createAdder(5);
  print("out9", "addFive(10)", addFive(10));
  print("out9", "addFive(20)", addFive(20));
})();


/* ==========================================================
   10 — Destructuring, Spread and Rest
   ========================================================== */
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

(function task10() {
  const numbers = [10, 20, 30, 40];
  const [first, second, ...rest] = numbers;
  print("out10", "first, second", { first, second });
  print("out10", "rest", rest);

  const user = { id: 1, name: "Anna", age: 21 };
  const { name, age } = user;
  print("out10", "destructured user", { name, age });

  const numbersWith50 = [...numbers, 50];
  print("out10", "numbersWith50 (new array)", numbersWith50);
  print("out10", "original numbers (unchanged)", numbers);

  const olderUser = { ...user, age: 22 };
  print("out10", "olderUser", olderUser);

  const userWithEmail = { ...user, email: "anna@mail.com" };
  print("out10", "userWithEmail", userWithEmail);
  print("out10", "original user (unchanged)", user);

  const arrA = [1, 2, 3];
  const arrB = [4, 5, 6];
  print("out10", "combined arrays", [...arrA, ...arrB]);

  print("out10", "sum(1,2)", sum(1, 2));
  print("out10", "sum(1,2,3,4)", sum(1, 2, 3, 4));
})();


/* ==========================================================
   11 — Optional Chaining and Default Values
   ========================================================== */
(function task11() {
  const userWithAddress = { name: "Anna", address: { city: "Almaty" } };
  const userNoAddress = { name: "John" };

  try {
    print("out11", "userNoAddress.address.city (throws)", userNoAddress.address.city);
  } catch (e) {
    print("out11", "userNoAddress.address.city (throws)", "TypeError — " + e.message);
  }

  print("out11", "userWithAddress.address?.city", userWithAddress.address?.city);
  print("out11", "userNoAddress.address?.city", userNoAddress.address?.city);

  print("out11", "city with ?? fallback", userNoAddress.address?.city ?? "City not specified");

  const values = [0, "", false, null, undefined];
  values.forEach(v => {
    print("out11", `value=${JSON.stringify(v)} => || 'fallback'`, v || "fallback");
    print("out11", `value=${JSON.stringify(v)} => ?? 'fallback'`, v ?? "fallback");
  });

  print("out11", "вывод", "|| подменяет любое falsy (0, '', false тоже), ?? реагирует только на null/undefined.");
})();


/* ==========================================================
   Final Task
   ========================================================== */
const students = [
  { id: 1, name: "Anna", age: 21, grades: [85, 90, 78] },
  { id: 2, name: "John", age: 22, grades: [60, 65, 58] },
  { id: 3, name: "Sara", age: 20, grades: [91, 95, 89] },
  { id: 4, name: "Mike", age: 23, grades: [55, 60, 50] },
  { id: 5, name: "Kate", age: 21, grades: [70, 75, 72] },
];

const PASS_AVERAGE = 60;

function getAverage(grades) {
  return grades.reduce((acc, g) => acc + g, 0) / grades.length;
}

function getStudentAverage(student) {
  return getAverage(student.grades);
}

function getPassedStudents(students) {
  return students.filter(s => getStudentAverage(s) >= PASS_AVERAGE);
}

function getStudentNames(students) {
  return students.map(s => s.name);
}

function findStudent(students, id) {
  return students.find(s => s.id === id);
}

function getTopStudent(students) {
  return students.reduce((best, s) =>
    getStudentAverage(s) > getStudentAverage(best) ? s : best, students[0]);
}

(function finalTask() {
  print("outFinal", "students", students);
  print("outFinal", "getAverage(students[0].grades)", getAverage(students[0].grades).toFixed(2));
  print("outFinal", "getStudentAverage(students[1])", getStudentAverage(students[1]).toFixed(2));
  print("outFinal", "getPassedStudents", getPassedStudents(students).map(s => s.name));
  print("outFinal", "getStudentNames", getStudentNames(students));
  print("outFinal", "findStudent(id=3)", findStudent(students, 3));
  print("outFinal", "getTopStudent", getTopStudent(students).name);

  const summary = students.map(s => ({
    id: s.id,
    name: s.name,
    average: Number(getStudentAverage(s).toFixed(2)),
    passed: getStudentAverage(s) >= PASS_AVERAGE,
  }));
  print("outFinal", "summary [{id,name,average,passed}]", summary);
  print("outFinal", "original students (unchanged)", students);
})();
