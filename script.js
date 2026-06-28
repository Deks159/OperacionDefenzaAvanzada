const COLORS = [
  { id: "verde", name: "Verde" },
  { id: "azul", name: "Azul" },
  { id: "rojo", name: "Rojo" },
  { id: "amarillo", name: "Amarillo" },
];

const MIN_STEPS = 1;
const MAX_STEPS = 15;
const DEFAULT_STEPS = 10;
const STORAGE_KEY = "adivinador-colores-v2";

let state = {
  totalSteps: DEFAULT_STEPS,
  sequence: [],
  failedByStep: Array.from({ length: DEFAULT_STEPS }, () => []),
  selectedColor: null,
  message: "Paso 1: elige un color para probar.",
  messageType: "neutral",
};

const els = {
  progressText: document.getElementById("progressText"),
  progressFill: document.getElementById("progressFill"),
  statusBox: document.getElementById("statusBox"),
  colorButtons: document.getElementById("colorButtons"),
  selectedText: document.getElementById("selectedText"),
  markCorrect: document.getElementById("markCorrect"),
  markWrong: document.getElementById("markWrong"),
  suggestionText: document.getElementById("suggestionText"),
  sequenceList: document.getElementById("sequenceList"),
  wrongList: document.getElementById("wrongList"),
  copySequence: document.getElementById("copySequence"),
  undoLast: document.getElementById("undoLast"),
  resetGame: document.getElementById("resetGame"),
  totalStepsInput: document.getElementById("totalStepsInput"),
  applyTotalSteps: document.getElementById("applyTotalSteps"),
  settingsNote: document.getElementById("settingsNote"),
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    const totalSteps = clampSteps(parsed.totalSteps || DEFAULT_STEPS);

    state = {
      ...state,
      ...parsed,
      totalSteps,
      sequence: Array.isArray(parsed.sequence)
        ? parsed.sequence.slice(0, totalSteps)
        : [],
      failedByStep: normalizeFailedSteps(parsed.failedByStep, totalSteps),
      selectedColor: null,
    };

    updateCompletedMessageIfNeeded();
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function clampSteps(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return DEFAULT_STEPS;

  return Math.min(MAX_STEPS, Math.max(MIN_STEPS, Math.trunc(number)));
}

function normalizeFailedSteps(value, totalSteps = state.totalSteps) {
  if (!Array.isArray(value)) {
    return Array.from({ length: totalSteps }, () => []);
  }

  return Array.from({ length: totalSteps }, (_, index) => {
    const step = value[index];
    return Array.isArray(step) ? step : [];
  });
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      totalSteps: state.totalSteps,
      sequence: state.sequence,
      failedByStep: state.failedByStep,
      message: state.message,
      messageType: state.messageType,
    })
  );
}

function currentStepIndex() {
  return state.sequence.length;
}

function currentFailedColors() {
  return state.failedByStep[currentStepIndex()] || [];
}

function availableColors() {
  const failed = currentFailedColors();
  return COLORS.filter((color) => !failed.includes(color.id));
}

function colorName(id) {
  return COLORS.find((color) => color.id === id)?.name || id;
}

function selectColor(id) {
  if (currentStepIndex() >= state.totalSteps) return;
  if (currentFailedColors().includes(id)) return;

  state.selectedColor = id;
  state.message = `Paso ${currentStepIndex() + 1}: seleccionaste ${colorName(id)}. Márcalo como correcto o incorrecto.`;
  state.messageType = "neutral";
  render();
}

function markCorrect() {
  if (!state.selectedColor || currentStepIndex() >= state.totalSteps) return;

  state.sequence.push(state.selectedColor);
  state.selectedColor = null;

  updateCompletedMessageIfNeeded();

  if (state.sequence.length < state.totalSteps) {
    state.message = `Correcto. Ahora vas en el paso ${state.sequence.length + 1}.`;
    state.messageType = "good";
  }

  saveState();
  render();
}

function updateCompletedMessageIfNeeded() {
  if (state.sequence.length >= state.totalSteps) {
    state.message = `Secuencia completa: ya tienes los ${state.totalSteps} colores correctos.`;
    state.messageType = "done";
  }
}

function markWrong() {
  if (!state.selectedColor || currentStepIndex() >= state.totalSteps) return;

  const step = currentStepIndex();
  const failed = state.failedByStep[step];

  if (!failed.includes(state.selectedColor)) {
    failed.push(state.selectedColor);
  }

  const wrongName = colorName(state.selectedColor);
  state.selectedColor = null;

  const remaining = availableColors();

  if (remaining.length === 0) {
    state.message = `Ya descartaste todos los colores del paso ${step + 1}. Revisa si marcaste algo mal o usa Deshacer/Reiniciar.`;
    state.messageType = "bad";
  } else {
    state.message = `${wrongName} fue incorrecto. Repite la secuencia guardada y prueba otro color restante.`;
    state.messageType = "bad";
  }

  saveState();
  render();
}

function undoLast() {
  if (state.sequence.length === 0) {
    state.message = "No hay colores correctos para deshacer.";
    state.messageType = "neutral";
    render();
    return;
  }

  const removed = state.sequence.pop();
  state.selectedColor = null;
  state.message = `Se deshizo ${colorName(removed)}. Vuelve a probar el paso ${state.sequence.length + 1}.`;
  state.messageType = "neutral";

  saveState();
  render();
}

function resetGame() {
  const confirmed = confirm("¿Seguro que quieres borrar toda la secuencia y los colores descartados?");
  if (!confirmed) return;

  state.sequence = [];
  state.failedByStep = Array.from({ length: state.totalSteps }, () => []);
  state.selectedColor = null;
  state.message = "Paso 1: elige un color para probar.";
  state.messageType = "neutral";

  saveState();
  render();
}

async function copySequence() {
  const text = state.sequence.map(colorName).join(" → ");

  if (!text) {
    state.message = "No hay secuencia para copiar todavía.";
    state.messageType = "neutral";
    render();
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    state.message = "Secuencia copiada al portapapeles.";
    state.messageType = "good";
  } catch {
    state.message = `No se pudo copiar automáticamente. Secuencia: ${text}`;
    state.messageType = "neutral";
  }

  render();
}

function applyTotalSteps() {
  const newTotal = clampSteps(els.totalStepsInput.value);
  const oldTotal = state.totalSteps;

  els.totalStepsInput.value = newTotal;

  if (newTotal === oldTotal) {
    state.message = `La misión ya estaba configurada en ${newTotal} colores.`;
    state.messageType = "neutral";
    render();
    return;
  }

  if (state.sequence.length > newTotal) {
    const confirmed = confirm(
      `Ya tienes ${state.sequence.length} colores guardados. Si cambias a ${newTotal}, se recortará la secuencia. ¿Continuar?`
    );

    if (!confirmed) {
      els.totalStepsInput.value = oldTotal;
      return;
    }

    state.sequence = state.sequence.slice(0, newTotal);
  }

  state.totalSteps = newTotal;
  state.failedByStep = normalizeFailedSteps(state.failedByStep, newTotal);
  state.selectedColor = null;

  if (state.sequence.length >= state.totalSteps) {
    updateCompletedMessageIfNeeded();
  } else {
    state.message = `Cantidad actualizada. Ahora la misión pide ${newTotal} colores.`;
    state.messageType = "good";
  }

  saveState();
  render();
}

function renderColorButtons() {
  const failed = currentFailedColors();
  const completed = currentStepIndex() >= state.totalSteps;

  els.colorButtons.innerHTML = "";

  COLORS.forEach((color) => {
    const button = document.createElement("button");
    button.className = `color-btn ${color.id}`;
    button.textContent = color.name;

    if (state.selectedColor === color.id) {
      button.classList.add("selected");
    }

    const disabled = completed || failed.includes(color.id);
    button.disabled = disabled;

    if (failed.includes(color.id)) {
      button.textContent = `${color.name} descartado`;
    }

    button.addEventListener("click", () => selectColor(color.id));
    els.colorButtons.appendChild(button);
  });
}

function renderSequence() {
  els.sequenceList.innerHTML = "";

  if (state.sequence.length === 0) {
    els.sequenceList.classList.add("empty");
    els.sequenceList.textContent = "Todavía no hay colores correctos.";
    return;
  }

  els.sequenceList.classList.remove("empty");

  state.sequence.forEach((id, index) => {
    els.sequenceList.appendChild(createChip(id, `${index + 1}. ${colorName(id)}`));
  });
}

function renderWrongList() {
  els.wrongList.innerHTML = "";

  const failed = currentFailedColors();

  if (currentStepIndex() >= state.totalSteps) {
    els.wrongList.classList.add("empty");
    els.wrongList.textContent = "Misión completada.";
    return;
  }

  if (failed.length === 0) {
    els.wrongList.classList.add("empty");
    els.wrongList.textContent = "Ninguno descartado.";
    return;
  }

  els.wrongList.classList.remove("empty");

  failed.forEach((id) => {
    els.wrongList.appendChild(createChip(id, colorName(id)));
  });
}

function createChip(id, label) {
  const chip = document.createElement("div");
  chip.className = "chip";

  const dot = document.createElement("span");
  dot.className = `dot-${id}`;

  chip.appendChild(dot);
  chip.append(label);

  return chip;
}

function renderSuggestion() {
  if (currentStepIndex() >= state.totalSteps) {
    els.suggestionText.textContent = "Misión completada";
    return;
  }

  const remaining = availableColors();
  els.suggestionText.textContent =
    remaining.length > 0
      ? remaining.map((color) => color.name).join(", ")
      : "Sin colores restantes";
}

function renderSettings() {
  els.totalStepsInput.value = state.totalSteps;
  els.settingsNote.textContent = `Actualmente la misión está configurada en ${state.totalSteps} colores.`;
}

function render() {
  const step = currentStepIndex();
  const percent = (step / state.totalSteps) * 100;

  els.progressText.textContent = `${step} / ${state.totalSteps}`;
  els.progressFill.style.width = `${percent}%`;

  els.statusBox.className = `status ${state.messageType}`;
  els.statusBox.textContent = state.message;

  els.selectedText.textContent = state.selectedColor
    ? `Color seleccionado: ${colorName(state.selectedColor)}`
    : "Color seleccionado: ninguno";

  const hasSelected = Boolean(state.selectedColor);
  const completed = step >= state.totalSteps;

  els.markCorrect.disabled = !hasSelected || completed;
  els.markWrong.disabled = !hasSelected || completed;
  els.undoLast.disabled = state.sequence.length === 0;
  els.copySequence.disabled = state.sequence.length === 0;

  renderSettings();
  renderColorButtons();
  renderSequence();
  renderWrongList();
  renderSuggestion();
}

els.markCorrect.addEventListener("click", markCorrect);
els.markWrong.addEventListener("click", markWrong);
els.undoLast.addEventListener("click", undoLast);
els.resetGame.addEventListener("click", resetGame);
els.copySequence.addEventListener("click", copySequence);
els.applyTotalSteps.addEventListener("click", applyTotalSteps);

els.totalStepsInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyTotalSteps();
  }
});

loadState();
render();
