// createTask - делает одну задачу с приватным счётчиком через замыкание.
// count и status объявлены внутри функции через let, снаружи мы их не достанем напрямую, только через run / getCount / getStatus / reset.
// Каждый вызов createTask создаёт свои собственные count/status, поэтому у разных задач счётчики не пересекаются.

function createTask(name) {
  let status = "Idle";
  let count = 0;
  let lastTime = 0;

  function run() {
    status = "Running";
    count = count + 1;

    const time = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
    lastTime = time;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isFail = Math.random() < 0.3;

        if (isFail) {
          status = "Failed";
          reject(new Error(name + " Failed"));
        } else {
          status = "Completed";
          resolve(name + " Completed (" + time + "ms)");
        }
      }, time);
    });
  }

  function getCount() {
    return count;
  }

  function getStatus() {
    return status;
  }

  function getLastTime() {
    return lastTime;
  }

  function reset() {
    status = "Idle";
    count = 0;
    lastTime = 0;
  }

  return { name, run, getCount, getStatus, getLastTime, reset };
}


// Таски

const tasks = [
  createTask("Load Users"),
  createTask("Load Posts"),
  createTask("Load Comments"),
];

const tasksDiv = document.getElementById("tasks");

// перерисовываем весь список задач заново каждый раз, когда что-то поменялось
function renderTasks() {
  tasksDiv.innerHTML = "";

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `
      <b>${task.name}</b> — status: ${task.getStatus()}<br>
      <p>runs: ${task.getCount()} | last time: ${task.getLastTime() || "-"}ms</p>
      <button data-index="${index}" class="runBtn">Run</button>
      <button data-index="${index}" class="resetBtn">Reset</button>
      <p class="result" id="result-${index}"></p>
    `;
    tasksDiv.appendChild(div);
  });

  // навешиваем обработчики заново после перерисовки
  document.querySelectorAll(".runBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.index);
      const resultEl = document.getElementById("result-" + i);

      tasks[i]
        .run()
        .then(msg => {
          resultEl.textContent = msg;
          renderTasks();
        })
        .catch(err => {
          resultEl.textContent = err.message;
          renderTasks();
        });

      renderTasks(); // сразу показать показываем ранинг
    });
  });

  document.querySelectorAll(".resetBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.index);
      tasks[i].reset();
      renderTasks();
    });
  });
}

renderTasks();


// запустить все таски

const runAllBtn = document.getElementById("runAllBtn");
const allStatusEl = document.getElementById("allStatus");

runAllBtn.addEventListener("click", async () => {
  allStatusEl.textContent = "Running all tasks...";

  // Promise.allSettled ждёт КАЖДЫЙ промис даже если какой-то упал
  // Promise.all бы остановился на первой же ошибке когда словил реджект, а нам надо дождаться всех и успешных, и упавших.
  const results = await Promise.allSettled(tasks.map(t => t.run()));

  renderTasks();

  const summary = results
    .map((r, i) => tasks[i].name + ": " + (r.status === "fulfilled" ? "Completed" : "Failed"))
    .join(", ");

  allStatusEl.textContent = "All tasks finished — " + summary;
});


// SEQUENTIAL VS CONCURRENT

const seqBtn = document.getElementById("runSeqBtn");
const concBtn = document.getElementById("runConcBtn");
const compareResultEl = document.getElementById("compareResult");

// отдельные задачи с фиксированным временем, чтобы сравнение было честным
function makeFixedTask(name, time) {
  return {
    name,
    run() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.15) reject(new Error(name + " failed"));
          else resolve(name + " done");
        }, time);
      });
    },
  };
}

seqBtn.addEventListener("click", async () => {
  compareResultEl.textContent = "Running sequential...";

  const t1 = makeFixedTask("Load Users", 800);
  const t2 = makeFixedTask("Load Posts", 1200);
  const t3 = makeFixedTask("Load Comments", 600);

  const start = Date.now();

  // await по очереди вторая задача не начнётся, пока не закончится первая
  try { await t1.run(); } catch (e) {}
  try { await t2.run(); } catch (e) {}
  try { await t3.run(); } catch (e) {}

  const time = Date.now() - start;
  compareResultEl.textContent = "Sequential total time: " + time + "ms (примерно 800+1200+600)";
});

concBtn.addEventListener("click", async () => {
  compareResultEl.textContent = "Running concurrent...";

  const t1 = makeFixedTask("Load Users", 800);
  const t2 = makeFixedTask("Load Posts", 1200);
  const t3 = makeFixedTask("Load Comments", 600);

  const start = Date.now();

  // запускаем все три сразу, ждём все через allSettled
  await Promise.allSettled([t1.run(), t2.run(), t3.run()]);

  const time = Date.now() - start;
  compareResultEl.textContent = "Concurrent total time: " + time + "ms (примерно максимум из трёх, 1200)";
});


// EVENT LOOP DEMO

const loopBtn = document.getElementById("runLoopBtn");
const loopResultEl = document.getElementById("loopResult");

function logLoop(text) {
  loopResultEl.textContent += text + "\n";
  console.log(text);
}

loopBtn.addEventListener("click", () => {
  loopResultEl.textContent = "";

  logLoop("1 - start");

  setTimeout(() => logLoop("7 - timeout 1 (macrotask)"), 0);

  Promise.resolve().then(() => logLoop("4 - promise 1 (microtask)"));

  async function demo() {
    logLoop("2 - async before await");
    await Promise.resolve();
    logLoop("5 - async after await (microtask)");
  }
  demo();

  setTimeout(() => logLoop("8 - timeout 2 (macrotask)"), 0);

  Promise.resolve().then(() => logLoop("6 - promise 2 (microtask)"));

  logLoop("3 - end (sync)");

});
