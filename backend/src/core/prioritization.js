const PRIORITY_SCORES = {
  high: 300,
  medium: 200,
  low: 100,
};

function normalizeOptionalNumericValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizePriority(priority) {
  if (priority === "high" || priority === "medium" || priority === "low") {
    return priority;
  }

  return "low";
}

function getPriorityScore(priority) {
  return PRIORITY_SCORES[normalizePriority(priority)];
}

function getReferenceValue(entry = {}) {
  return (
    entry.reference ||
    entry.sectionRef ||
    entry.assetRef ||
    entry.clusterKey ||
    entry.competitorRef ||
    entry.keyword ||
    null
  );
}

function getTypeValue(entry = {}) {
  return entry.type || "priority_item";
}

function createPriorityKey(entry = {}) {
  return [
    entry.moduleKey || "unknown_module",
    getTypeValue(entry),
    getReferenceValue(entry) || "no_reference",
  ].join(":");
}

function comparePriorityEntries(left, right) {
  const scoreDelta =
    getPriorityScore(right?.priority) - getPriorityScore(left?.priority);
  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  const leftBusinessValue = normalizeOptionalNumericValue(left?.businessValue);
  const rightBusinessValue = normalizeOptionalNumericValue(right?.businessValue);
  if (leftBusinessValue !== null || rightBusinessValue !== null) {
    if (leftBusinessValue === null) {
      return 1;
    }

    if (rightBusinessValue === null) {
      return -1;
    }

    if (rightBusinessValue !== leftBusinessValue) {
      return rightBusinessValue - leftBusinessValue;
    }
  }

  const leftModule = left?.moduleKey || "";
  const rightModule = right?.moduleKey || "";
  if (leftModule !== rightModule) {
    return leftModule.localeCompare(rightModule);
  }

  const leftType = getTypeValue(left);
  const rightType = getTypeValue(right);
  if (leftType !== rightType) {
    return leftType.localeCompare(rightType);
  }

  const leftReference = getReferenceValue(left) || "";
  const rightReference = getReferenceValue(right) || "";
  return leftReference.localeCompare(rightReference);
}

function dedupePriorityEntries(entries = []) {
  const entryMap = new Map();

  entries.forEach((entry) => {
    const normalizedEntry = {
      ...entry,
      priority: normalizePriority(entry?.priority),
      businessValue: normalizeOptionalNumericValue(entry?.businessValue),
      reference: getReferenceValue(entry),
      type: getTypeValue(entry),
    };
    const entryKey = createPriorityKey(normalizedEntry);
    const existingEntry = entryMap.get(entryKey);

    if (!existingEntry) {
      entryMap.set(entryKey, normalizedEntry);
      return;
    }

    if (comparePriorityEntries(normalizedEntry, existingEntry) < 0) {
      entryMap.set(entryKey, normalizedEntry);
    }
  });

  return Array.from(entryMap.values());
}

function orderPriorityEntries(entries = []) {
  return dedupePriorityEntries(entries).sort(comparePriorityEntries);
}

function orderActionEntries(actions = []) {
  return [...actions].sort((left, right) => {
    const priorityDelta = comparePriorityEntries(left, right);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const leftAction = left?.action || "";
    const rightAction = right?.action || "";
    return leftAction.localeCompare(rightAction);
  });
}

module.exports = {
  comparePriorityEntries,
  dedupePriorityEntries,
  getPriorityScore,
  normalizePriority,
  orderActionEntries,
  orderPriorityEntries,
};
