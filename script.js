/* =========================================================
   JU COLLEGE PASS / FAIL CHECKER
   ---------------------------------------------------------
   PASS CONDITIONS:

   1. Calculated Total >= 40
   2. End Sem >= 35

   Formula:

   ((InSem 1 + InSem 2) / 2.66)
   + Assignment
   + (End Sem / 2)

   ========================================================= */


const PASS_MARK = 40;
const MIN_ENDSEM = 35;


const MAX_MARKS = {

  insem1: 40,

  insem2: 40,

  assign: 20,

  endsem: 100

};


const INPUT_IDS = [

  "insem1",
  "insem2",
  "assign",
  "endsem"

];


const BAR_IDS = {

  insem1: "bar1",

  insem2: "bar2",

  assign: "bar3",

  endsem: "bar4"

};


const inputs = {};


INPUT_IDS.forEach(id => {

  inputs[id] =
    document.getElementById(id);

});


/* =========================================================
   RESULT ELEMENTS
   ========================================================= */

const resultCard =
  document.getElementById("resultCard");

const resultBadge =
  document.getElementById("resultBadge");

const resultEmoji =
  document.getElementById("resultEmoji");

const resultLabel =
  document.getElementById("resultLabel");

const resultScore =
  document.getElementById("resultScore");

const resultSub =
  document.getElementById("resultSub");

const ringFg =
  document.getElementById("ringFg");

const ringScore =
  document.getElementById("ringScore");


const bkInsem =
  document.getElementById("bkInsem");

const bkAssign =
  document.getElementById("bkAssign");

const bkEnd =
  document.getElementById("bkEnd");

const bkTotal =
  document.getElementById("bkTotal");


const targetTitle =
  document.getElementById("targetTitle");

const targetMessage =
  document.getElementById("targetMessage");

const targetProgress =
  document.getElementById("targetProgress");

const targetTip =
  document.getElementById("targetTip");


const CIRCUMFERENCE =
  2 * Math.PI * 65;


let lastMode = "idle";


/* =========================================================
   NUMBER READER
   ========================================================= */

function getValue(id) {

  const value =
    inputs[id].value.trim();

  if (value === "") {

    return NaN;

  }

  return Number(value);

}


/* =========================================================
   BAR COLOR
   ========================================================= */

function getBarColor(percent) {

  if (percent < 0.4) {

    return "var(--fail)";

  }

  if (percent < 0.7) {

    return "var(--warn)";

  }

  return "var(--pass)";

}


/* =========================================================
   UPDATE INPUT BAR
   ========================================================= */

function updateInput(id) {

  const input =
    inputs[id];

  const value =
    getValue(id);

  const max =
    MAX_MARKS[id];

  const bar =
    document.getElementById(
      BAR_IDS[id]
    );


  input.classList.remove(
    "valid",
    "invalid"
  );


  if (Number.isNaN(value)) {

    bar.style.width = "0%";

    return;

  }


  if (
    value < 0 ||
    value > max
  ) {

    input.classList.add(
      "invalid"
    );

  } else {

    input.classList.add(
      "valid"
    );

  }


  const safeValue =
    Math.max(
      0,
      Math.min(value, max)
    );


  const percent =
    safeValue / max;


  bar.style.width =
    `${percent * 100}%`;

  bar.style.background =
    getBarColor(percent);

}


/* =========================================================
   READ ALL MARKS
   ========================================================= */

function getScores() {

  const raw = {};

  INPUT_IDS.forEach(id => {

    raw[id] =
      getValue(id);

  });


  const safe = {

    insem1:
      Number.isNaN(raw.insem1)
        ? 0
        : Math.min(
            Math.max(raw.insem1, 0),
            40
          ),

    insem2:
      Number.isNaN(raw.insem2)
        ? 0
        : Math.min(
            Math.max(raw.insem2, 0),
            40
          ),

    assign:
      Number.isNaN(raw.assign)
        ? 0
        : Math.min(
            Math.max(raw.assign, 0),
            20
          ),

    endsem:
      Number.isNaN(raw.endsem)
        ? 0
        : Math.min(
            Math.max(raw.endsem, 0),
            100
          )

  };


  const anyFilled =
    Object.values(raw)
      .some(
        value =>
          !Number.isNaN(value)
      );


  const hasInvalid =
    INPUT_IDS.some(id => {

      const value =
        raw[id];

      return (
        !Number.isNaN(value) &&
        (
          value < 0 ||
          value > MAX_MARKS[id]
        )
      );

    });


  /* -------------------------------------------------------
     ORIGINAL CALCULATION
     ------------------------------------------------------- */

  const insemContribution =
    (
      safe.insem1 +
      safe.insem2
    ) / 2.66;


  const endContribution =
    safe.endsem / 2;


  const total =
    insemContribution +
    safe.assign +
    endContribution;


  return {

    raw,

    safe,

    anyFilled,

    hasInvalid,

    insemContribution,

    endContribution,

    total

  };

}


/* =========================================================
   RESULT MODE
   ========================================================= */

function getMode(total, endsem) {

  /*
     BOTH CONDITIONS ARE REQUIRED.

     Total >= 40
     AND
     End Sem >= 35
  */

  if (
    total < PASS_MARK ||
    endsem < MIN_ENDSEM
  ) {

    return "fail";

  }


  if (total < 60) {

    return "warn";

  }


  return "pass";

}


/* =========================================================
   ANIMATE EMOJI
   ========================================================= */

function setEmoji(emoji) {

  if (
    resultEmoji.textContent === emoji
  ) {

    return;

  }


  resultEmoji.style.animation =
    "none";

  void resultEmoji.offsetWidth;

  resultEmoji.style.animation =
    "";

  resultEmoji.textContent =
    emoji;

}


/* =========================================================
   TARGET INFORMATION
   ========================================================= */

function updateTarget(
  scores,
  mode
) {

  if (mode === "idle") {

    targetTitle.textContent =
      "Passing requirements";

    targetMessage.innerHTML =
      `You need a calculated total of at least
       <strong>40</strong> and an End Sem score
       of at least <strong>35</strong>.`;

    targetProgress.style.width =
      "0%";

    targetTip.textContent =
      "Total ≥ 40 AND End Sem ≥ 35";

    return;

  }


  const total =
    scores.total;

  const endsem =
    scores.safe.endsem;


  /* -------------------------------------------------------
     FAIL
     ------------------------------------------------------- */

  if (mode === "fail") {

    const totalDeficit =
      Math.max(
        0,
        PASS_MARK - total
      );


    const endSemDeficit =
      Math.max(
        0,
        MIN_ENDSEM - endsem
      );


    /*
      Every additional End Sem mark
      contributes 0.5 to the total.

      Therefore:

      Required End Sem marks
      = deficit × 2
    */

    const requiredForTotal =
      Math.ceil(
        totalDeficit * 2
      );


    const requiredForMinimumEndSem =
      endSemDeficit;


    const additionalEndSem =
      Math.max(
        requiredForTotal,
        requiredForMinimumEndSem
      );


    const targetEndSem =
      endsem +
      additionalEndSem;


    /* ---------------------------------------------
       CASE 1:
       End Sem is below mandatory 35
       --------------------------------------------- */

    if (endsem < MIN_ENDSEM) {

      targetTitle.textContent =
        "⚠️ End Sem minimum not reached";

      targetMessage.innerHTML =
        `Your End Sem score is
        <strong>${endsem.toFixed(2)}/100</strong>.
        You must score at least
        <strong>35/100</strong> in End Sem to pass.`;

      targetTip.textContent =
        `You need ${endSemDeficit.toFixed(0)}
        more End Sem marks to reach 35.`;

    }


    /* ---------------------------------------------
       CASE 2:
       End Sem >= 35 BUT TOTAL < 40
       --------------------------------------------- */

    else {

      targetTitle.textContent =
        "🎯 More marks needed";

      targetMessage.innerHTML =
        `Your End Sem requirement is satisfied.
        You need approximately
        <strong>${totalDeficit.toFixed(2)}</strong>
        more calculated marks to reach 40.`;

      targetTip.textContent =
        `End Sem is already ${endsem.toFixed(2)}/100.
        Current total: ${total.toFixed(2)}.`;

    }


    targetProgress.style.width =
      `${Math.min(
        (endsem / MIN_ENDSEM) * 100,
        100
      )}%`;


    return;

  }


  /* -------------------------------------------------------
     PASS
     ------------------------------------------------------- */

  if (mode === "warn") {

    targetTitle.textContent =
      "✅ Passed — but borderline";

    targetMessage.innerHTML =
      `Both requirements are satisfied.
      You are
      <strong>${(total - PASS_MARK).toFixed(2)}</strong>
      marks above the passing score.`;

    targetTip.textContent =
      "Keep improving your score.";

  }


  if (mode === "pass") {

    targetTitle.textContent =
      "🎉 Passing requirements met";

    targetMessage.innerHTML =
      `Excellent! Your total is
      <strong>${total.toFixed(2)}</strong>
      and your End Sem score is
      <strong>${endsem.toFixed(2)}</strong>.`;

    targetTip.textContent =
      "Total ≥ 40 AND End Sem ≥ 35 ✓";

  }


  targetProgress.style.width =
    `${Math.min(
      (total / PASS_MARK) * 100,
      100
    )}%`;

}


/* =========================================================
   RESET RESULT DISPLAY
   ========================================================= */

function resetDisplay() {

  lastMode =
    "idle";


  resultCard.className =
    "glass-card result-card idle";


  resultBadge.textContent =
    "WAITING";


  setEmoji("🎓");


  resultLabel.className =
    "result-label";

  resultLabel.textContent =
    "Awaiting Marks";


  resultScore.className =
    "result-score idle";

  resultScore.textContent =
    "—";


  resultSub.textContent =
    "Enter your marks to calculate your result.";


  ringFg.style.strokeDashoffset =
    CIRCUMFERENCE;

  ringFg.style.stroke =
    "var(--accent)";


  ringScore.textContent =
    "—";


  bkInsem.textContent =
    "—";

  bkAssign.textContent =
    "—";

  bkEnd.textContent =
    "—";

  bkTotal.textContent =
    "—";


  updateTarget(
    {},
    "idle"
  );

}


/* =========================================================
   MAIN CALCULATOR
   ========================================================= */

function calculate() {

  INPUT_IDS.forEach(
    updateInput
  );


  const scores =
    getScores();


  if (!scores.anyFilled) {

    resetDisplay();

    return;

  }


  /* -------------------------------------------------------
     INVALID INPUT
     ------------------------------------------------------- */

  if (scores.hasInvalid) {

    resultCard.className =
      "glass-card result-card fail";


    resultBadge.textContent =
      "CHECK INPUT";


    setEmoji("⚠️");


    resultLabel.className =
      "result-label fail";

    resultLabel.textContent =
      "Invalid Marks";


    resultScore.className =
      "result-score fail";

    resultScore.textContent =
      "—";


    resultSub.textContent =
      "Please enter marks within the allowed maximum.";


    ringFg.style.strokeDashoffset =
      CIRCUMFERENCE;

    ringFg.style.stroke =
      "var(--fail)";

    ringScore.textContent =
      "—";


    return;

  }


  /* -------------------------------------------------------
     CALCULATE
     ------------------------------------------------------- */

  const total =
    Math.round(
      scores.total * 100
    ) / 100;


  const mode =
    getMode(
      total,
      scores.safe.endsem
    );


  /* -------------------------------------------------------
     BREAKDOWN
     ------------------------------------------------------- */

  bkInsem.textContent =
    scores.insemContribution
      .toFixed(2);


  bkAssign.textContent =
    scores.safe.assign
      .toFixed(2);


  bkEnd.textContent =
    scores.endContribution
      .toFixed(2);


  bkTotal.textContent =
    total.toFixed(2);


  /* -------------------------------------------------------
     SCORE RING
     ------------------------------------------------------- */

  const percentage =
    Math.min(
      total / 100,
      1
    );


  ringFg.style.strokeDashoffset =
    CIRCUMFERENCE -
    percentage * CIRCUMFERENCE;


  ringScore.textContent =
    total.toFixed(1);


  /* -------------------------------------------------------
     RESULT CONFIG
     ------------------------------------------------------- */

  const resultConfig = {

    pass: {

      emoji: "😄",

      label:
        "PASS — WELL DONE!",

      badge:
        "PASSED",

      message:
        "Both passing requirements are satisfied."

    },


    warn: {

      emoji: "🥲",

      label:
        "PASS — BORDERLINE",

      badge:
        "BORDERLINE",

      message:
        "You passed, but your score is close to the threshold."

    },


    fail: {

      emoji: "😢",

      label:
        "FAIL — BACK",

      badge:
        "BACK",

      message:
        "One or more passing requirements are not satisfied."

    }

  };


  const config =
    resultConfig[mode];


  /* -------------------------------------------------------
     UPDATE CARD
     ------------------------------------------------------- */

  resultCard.className =
    `glass-card result-card ${mode}`;


  resultBadge.textContent =
    config.badge;


  setEmoji(
    config.emoji
  );


  resultLabel.className =
    `result-label ${mode}`;


  resultLabel.textContent =
    config.label;


  resultScore.className =
    `result-score ${mode}`;


  resultScore.textContent =
    total.toFixed(2);


  resultSub.textContent =
    config.message;


  /* -------------------------------------------------------
     RING COLOR
     ------------------------------------------------------- */

  ringFg.style.stroke =

    mode === "pass"
      ? "var(--pass)"

      : mode === "warn"
        ? "var(--warn)"

        : "var(--fail)";


  /* -------------------------------------------------------
     TARGET PANEL
     ------------------------------------------------------- */

  updateTarget(
    {
      ...scores,
      total
    },
    mode
  );


  /* -------------------------------------------------------
     ANIMATIONS
     ------------------------------------------------------- */

  if (
    mode !== lastMode
  ) {

    if (
      mode === "pass"
    ) {

      launchConfetti();

    }


    if (
      mode === "fail"
    ) {

      resultCard.classList.remove(
        "shake"
      );

      void resultCard.offsetWidth;

      resultCard.classList.add(
        "shake"
      );

    }


    lastMode =
      mode;

  }

}


/* =========================================================
   RESET ALL
   ========================================================= */

function resetAll() {

  INPUT_IDS.forEach(id => {

    inputs[id].value =
      "";

    inputs[id].classList.remove(
      "valid",
      "invalid"
    );

  });


  Object.values(BAR_IDS)
    .forEach(barId => {

      document.getElementById(
        barId
      ).style.width =
        "0%";

    });


  resetDisplay();

}


/* =========================================================
   SAMPLE MARKS
   ========================================================= */

function loadSample() {

  inputs.insem1.value =
    "30";

  inputs.insem2.value =
    "32";

  inputs.assign.value =
    "17";

  inputs.endsem.value =
    "68";


  calculate();

}


/* =========================================================
   EVENTS
   ========================================================= */

INPUT_IDS.forEach(id => {

  inputs[id].addEventListener(
    "input",
    calculate
  );


  inputs[id].addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        calculate();

      }

    }
  );

});


document
  .getElementById("resetBtn")
  .addEventListener(
    "click",
    resetAll
  );


document
  .getElementById("sampleBtn")
  .addEventListener(
    "click",
    loadSample
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.ctrlKey &&
      event.key === "Enter"
    ) {

      calculate();

    }

  }
);


/* =========================================================
   DARK / LIGHT MODE
   ========================================================= */

const themeButton =
  document.getElementById(
    "themeBtn"
  );


const savedTheme =
  localStorage.getItem(
    "ju-theme"
  );


if (
  savedTheme === "light"
) {

  document.documentElement
    .dataset.theme =
    "light";

  themeButton.textContent =
    "🌙";

}


themeButton.addEventListener(
  "click",
  () => {

    const isLight =
      document.documentElement
        .dataset.theme ===
      "light";


    if (isLight) {

      delete document.documentElement
        .dataset.theme;

      localStorage.setItem(
        "ju-theme",
        "dark"
      );

      themeButton.textContent =
        "☀️";

    }

    else {

      document.documentElement
        .dataset.theme =
        "light";

      localStorage.setItem(
        "ju-theme",
        "light"
      );

      themeButton.textContent =
        "🌙";

    }

  }
);


/* =========================================================
   PARTICLES
   ========================================================= */

const canvas =
  document.getElementById(
    "particles"
  );


const ctx =
  canvas.getContext(
    "2d"
  );


let particles = [];

let animationFrame = null;


function resizeCanvas() {

  const ratio =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  canvas.width =
    window.innerWidth *
    ratio;


  canvas.height =
    window.innerHeight *
    ratio;


  canvas.style.width =
    `${window.innerWidth}px`;


  canvas.style.height =
    `${window.innerHeight}px`;


  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );

}


function createParticles() {

  particles =
    Array.from(
      {
        length: 28
      },
      () => ({

        x:
          Math.random() *
          window.innerWidth,

        y:
          Math.random() *
          window.innerHeight,

        radius:
          Math.random() *
          1.7 + .5,

        velocityX:
          (Math.random() - .5) *
          .25,

        velocityY:
          Math.random() *
          .35 + .05,

        opacity:
          Math.random() *
          .5 + .15

      })
    );

}


function drawParticles() {

  ctx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  const accent =
    getComputedStyle(
      document.documentElement
    )
      .getPropertyValue(
        "--accent"
      )
      .trim();


  particles.forEach(
    particle => {

      particle.x +=
        particle.velocityX;

      particle.y +=
        particle.velocityY;


      if (
        particle.y >
        window.innerHeight
      ) {

        particle.y =
          -5;

        particle.x =
          Math.random() *
          window.innerWidth;

      }


      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );


      ctx.globalAlpha =
        particle.opacity;


      ctx.fillStyle =
        accent;


      ctx.fill();

    }
  );


  ctx.globalAlpha =
    1;


  animationFrame =
    requestAnimationFrame(
      drawParticles
    );

}


/* =========================================================
   CONFETTI
   ========================================================= */

function launchConfetti() {

  const colors = [

    "#00e0a0",

    "#786cff",

    "#ff6384",

    "#ffd166",

    "#ffffff"

  ];


  for (
    let i = 0;
    i < 45;
    i++
  ) {

    const piece =
      document.createElement(
        "span"
      );


    piece.style.position =
      "fixed";

    piece.style.left =
      `${Math.random() * 100}vw`;

    piece.style.top =
      `${Math.random() * 20 + 8}vh`;

    piece.style.width =
      `${Math.random() * 7 + 4}px`;

    piece.style.height =
      `${Math.random() * 10 + 5}px`;

    piece.style.background =
      colors[
        Math.floor(
          Math.random() *
          colors.length
        )
      ];

    piece.style.borderRadius =
      "2px";

    piece.style.zIndex =
      "100";

    piece.style.pointerEvents =
      "none";


    document.body.appendChild(
      piece
    );


    const x =
      (Math.random() - .5) *
      280;

    const y =
      250 +
      Math.random() *
      350;


    const rotation =
      360 +
      Math.random() *
      720;


    const animation =
      piece.animate(

        [

          {
            transform:
              "translate(0,0) rotate(0deg)",

            opacity: 1

          },

          {

            transform:
              `translate(${x}px,${y}px) rotate(${rotation}deg)`,

            opacity: 0

          }

        ],

        {

          duration:
            1000 +
            Math.random() *
            800,

          easing:
            "cubic-bezier(.2,.8,.3,1)"

        }

      );


    animation.onfinish =
      () => piece.remove();

  }

}


/* =========================================================
   INITIALIZE
   ========================================================= */

resizeCanvas();

createParticles();

window.addEventListener(
  "resize",
  () => {

    resizeCanvas();

    createParticles();

  }
);


resetDisplay();
