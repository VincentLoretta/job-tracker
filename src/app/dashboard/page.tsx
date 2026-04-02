"use client";

import { FormEvent, useEffect, useState } from "react";
import { Models } from "appwrite";
import { useRouter } from "next/navigation";
import { getCurrentUser, logoutUser } from "@/src/services/auth";
import {
  createJob,
  deleteJob,
  getJobs,
  JobStatus,
  updateJob,
} from "@/src/services/jobs";

type User = {
  $id: string;
  email: string;
};

type JobDoc = Models.Document & {
  company: string;
  role: string;
  status: JobStatus;
  dateApplied?: string;
  notes?: string;
};

const emptyForm = {
  company: "",
  role: "",
  status: "applied" as JobStatus,
  dateApplied: "",
  notes: "",
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<JobDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | JobStatus>("all");

  const [company, setCompany] = useState(emptyForm.company);
  const [role, setRole] = useState(emptyForm.role);
  const [status, setStatus] = useState<JobStatus>(emptyForm.status);
  const [dateApplied, setDateApplied] = useState(emptyForm.dateApplied);
  const [notes, setNotes] = useState(emptyForm.notes);

  useEffect(() => {
    async function loadDashboard() {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser({
        $id: currentUser.$id,
        email: currentUser.email,
      });

      try {
        const response = await getJobs(currentUser.$id);
        setJobs(response.documents as unknown as JobDoc[]);
      } catch (err: any) {
        setError(err?.message || "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function resetForm() {
    setCompany(emptyForm.company);
    setRole(emptyForm.role);
    setStatus(emptyForm.status);
    setDateApplied(emptyForm.dateApplied);
    setNotes(emptyForm.notes);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) return;

    setError("");
    setSaving(true);

    try {
      if (editingJobId) {
        const updatedJob = await updateJob(editingJobId, {
          company,
          role,
          status,
          dateApplied,
          notes,
        });

        setJobs((prev) =>
          prev.map((job) =>
            job.$id === editingJobId
              ? (updatedJob as unknown as JobDoc)
              : job
          )
        );

        setEditingJobId(null);
      } else {
        const newJob = await createJob({
          userId: user.$id,
          company,
          role,
          status,
          dateApplied,
          notes,
        });

        setJobs((prev) => [newJob as unknown as JobDoc, ...prev]);
      }

      resetForm();
    } catch (err: any) {
      setError(err?.message || "Failed to save job.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  async function handleDelete(jobId: string) {
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.$id !== jobId));
    } catch (err: any) {
      setError(err?.message || "Failed to delete job.");
    }
  }

  function handleEdit(job: JobDoc) {
    setEditingJobId(job.$id);
    setCompany(job.company);
    setRole(job.role);
    setStatus(job.status);
    setDateApplied(job.dateApplied || "");
    setNotes(job.notes || "");
    setError("");
  }

  function handleCancelEdit() {
    setEditingJobId(null);
    resetForm();
    setError("");
  }

  const filteredJobs =
    filter === "all" ? jobs : jobs.filter((job) => job.status === filter);

  const totalJobs = jobs.length;
  const appliedCount = jobs.filter((job) => job.status === "applied").length;
  const interviewCount = jobs.filter((job) => job.status === "interview").length;
  const offerCount = jobs.filter((job) => job.status === "offer").length;

  function getStatusBadge(status: JobStatus) {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-700";
      case "interview":
        return "bg-amber-100 text-amber-700";
      case "offer":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6 animate-fade-in">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Welcome Back
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Job Tracker Dashboard
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                Track applications, interviews, and offers in one clean workspace.
              </p>
              <p className="text-sm text-slate-500">
                Signed in as{" "}
                <span className="font-medium text-slate-700">{user?.email}</span>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Jobs</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalJobs}</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-700">Applied</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{appliedCount}</p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">Interviews</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {interviewCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Offers</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{offerCount}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                {editingJobId ? "Edit Job" : "Add New Job"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {editingJobId
                  ? "Update the selected application."
                  : "Save a new application to your tracker."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role
                </label>
                <input
                  type="text"
                  placeholder="Frontend Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JobStatus)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-900"
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date Applied
                </label>
                <input
                  type="date"
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  placeholder="Recruiter message, interview notes, salary range..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-900"
                  rows={5}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 hover:scale-[1.01] disabled:opacity-50"
              >
                {saving ? "Saving..." : editingJobId ? "Update Job" : "Add Job"}
              </button>

              {editingJobId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Job List</h2>
                <p className="mt-1 text-sm text-slate-500">
                  View and manage your tracked applications.
                </p>
              </div>

              <div className="sm:w-52">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Filter Applications
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as "all" | JobStatus)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-900"
                >
                  <option value="all">All</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">
                  No jobs found for this filter yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job.$id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold text-slate-900">
                            {job.company}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${getStatusBadge(
                              job.status
                            )}`}
                          >
                            {job.status}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-slate-700">{job.role}</p>

                        {job.dateApplied && (
                          <p className="text-sm text-slate-500">
                            Applied on {job.dateApplied}
                          </p>
                        )}

                        {job.notes && (
                          <p className="rounded-xl bg-white px-3 py-3 text-sm text-slate-600">
                            {job.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(job)}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 hover:scale-[1.02]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(job.$id)}
                          className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 hover:scale-[1.02]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}