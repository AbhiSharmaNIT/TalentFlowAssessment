// src/lib/storage.js
// Persist jobs & UI overrides in IndexedDB using localforage.
// Install if needed: npm i localforage

import localforage from "localforage";

/** ---------- LocalForage base config ---------- */
localforage.config({
  name: "talentflow",
  storeName: "tf_store",
  description: "TalentFlow local cache",
});

/** ---------- Stores ---------- */
// Full job objects that the user created/edited (used to overlay server data)
export const jobsStore = localforage.createInstance({
  name: "talentflow",
  storeName: "jobs",
});

// Small per-job overrides the server doesn't remember (e.g., status after drag)
export const jobOverridesStore = localforage.createInstance({
  name: "talentflow",
  storeName: "job_overrides",
});

// Assessments store
export const assessmentsStore = localforage.createInstance({
  name: "talentflow",
  storeName: "assessments",
});

// 🔒 NEW: Track permanently-deleted assessment IDs so they never get re-imported
export const deletedAssessmentsStore = localforage.createInstance({
  name: "talentflow",
  storeName: "deleted_assessments",
});

/** ---------- Job persistence helpers ---------- */
export async function saveJob(job) {
  if (!job || job.id == null) return;
  await jobsStore.setItem(String(job.id), job);
}

export async function saveJobs(jobs = []) {
  await Promise.all(
    jobs
      .filter((j) => j && j.id != null)
      .map((j) => jobsStore.setItem(String(j.id), j))
  );
}

export async function getJob(id) {
  if (id == null) return null;
  return jobsStore.getItem(String(id));
}

export async function getAllSavedJobs() {
  const jobs = [];
  await jobsStore.iterate((value) => {
    if (value) jobs.push(value);
  });
  return jobs;
}

export async function loadJobs() {
  return getAllSavedJobs();
}

export async function removeJob(id) {
  if (id == null) return;
  await jobsStore.removeItem(String(id));
}

export async function clearAllJobs() {
  await jobsStore.clear();
}

/** ---------- Job status override helpers (Kanban, etc.) ---------- */
export async function setJobStatusOverride(id, status) {
  if (id == null) return;
  await jobOverridesStore.setItem(String(id), { status });
}

export async function clearJobStatusOverride(id) {
  if (id == null) return;
  await jobOverridesStore.removeItem(String(id));
}

export async function getAllJobStatusOverrides() {
  const map = {};
  await jobOverridesStore.iterate((val, key) => {
    map[key] = val;
  });
  return map;
}

/** ---------- Assessment persistence helpers ---------- */

/**
 * Save/overwrite a single assessment.
 * Generates a local id if server hasn't given one.
 */
export async function saveAssessment(assessment) {
  if (!assessment) return;
  const id =
    assessment.id != null
      ? String(assessment.id)
      : (assessment._localId ??= `local-${crypto.randomUUID()}`);
  const stored = {
    ...assessment,
    id: assessment.id ?? id,
    createdAt: assessment.createdAt ?? Date.now(),
  };
  await assessmentsStore.setItem(id, stored);
  return stored;
}

/** Save many assessments at once */
export async function saveAssessments(list = []) {
  await Promise.all(list.map((a) => saveAssessment(a)));
}

/** Load a single assessment by id */
export async function getAssessment(id) {
  if (!id) return null;
  return assessmentsStore.getItem(String(id));
}

/** Load all saved assessments, newest first */
export async function getAllAssessments() {
  const assessments = [];
  await assessmentsStore.iterate((value) => {
    if (value) assessments.push(value);
  });
  return assessments.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Remove one assessment (by id) */
export async function removeAssessment(id) {
  if (!id) return;
  await assessmentsStore.removeItem(String(id));
}

/** Clear all assessments (only call on manual reset) */
export async function clearAllAssessments() {
  await assessmentsStore.clear();
}

/**
 * Robust local deletion for assessments created both online and offline.
 * Removes by `id` and `_localId` (if present) so nothing lingers in IndexedDB.
 * Usage: await deleteAssessmentFromStorage(assessmentOrId)
 */
export async function deleteAssessmentFromStorage(aOrId) {
  let id = null, localId = null;

  if (typeof aOrId === "object" && aOrId !== null) {
    id = aOrId.id != null ? String(aOrId.id) : null;
    localId = aOrId._localId != null ? String(aOrId._localId) : null;
  } else if (aOrId != null) {
    id = String(aOrId);
  }

  if (id) {
    try { await assessmentsStore.removeItem(id); } catch {}
  }
  if (localId && localId !== id) {
    try { await assessmentsStore.removeItem(localId); } catch {}
  }
}

/** ---------- NEW: Permanent deletion tracking ---------- */

// Mark an assessment id as deleted so server seeds won't re-add it on refresh
export async function markAssessmentDeleted(id) {
  if (!id) return;
  await deletedAssessmentsStore.setItem(String(id), true);
}

// Check if an id is marked deleted
export async function isAssessmentDeleted(id) {
  if (!id) return false;
  return (await deletedAssessmentsStore.getItem(String(id))) === true;
}

// Get all deleted ids as strings
export async function getAllDeletedAssessments() {
  const ids = [];
  await deletedAssessmentsStore.iterate((value, key) => {
    if (value === true) ids.push(String(key));
  });
  return ids;
}
