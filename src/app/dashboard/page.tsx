"use client";

import { useRouter } from "next/navigation";
import { logoutUser, getCurrentUser } from "@/src/services/auth";
import { useState, useEffect, FormEvent } from "react";
import { createJob, deleteJob, getJobs,  JobStatus, updateJob } from "@/src/services/jobs";
import { Models } from "appwrite";
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
export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<JobDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | JobStatus >("all");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<JobStatus>("applied");
  const [dateApplied, setDateApplied] = useState ("");
  const [notes, setNotes] = useState("");



  useEffect(() => {
    async function loadDashboard() {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const safeUser: User = {
        $id: currentUser.$id,
        email: currentUser.email,
      };

      setUser(safeUser);

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

    setCompany("");
    setRole("");
    setStatus("applied");
    setDateApplied("");
    setNotes("");
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

async function handleDelete(jobId:string) {
  try {
    await deleteJob(jobId);
    setJobs((prev) => prev.filter((job) => job.$id !== jobId));
  } catch (err: any) {
    setError(err?.message || "Failed to delete job.");
    
  }
  
}

 function handleEdit(job:JobDoc) {
  setEditingJobId(job.$id);
  setCompany(job.company);
  setRole(job.role);
  setStatus(job.status);
  setDateApplied(job.dateApplied || "");
  setNotes(job.notes || "");
}

function handleCancelEdit() {
  setEditingJobId(null);
  setCompany("");
  setRole("");
  setStatus("applied");
  setDateApplied("");
  setNotes("");
  setError("");

}
const filteredJobs =
  filter === "all"
  ? jobs
  : jobs.filter((job) => job.status === filter);
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Dashboard</h1>
            <p className="text-sm text-gray-600">Logged in as {user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Add Job</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                required
              />

              <input
                type="text"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                required
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>

              <input
                type="date"
                value={dateApplied}
                onChange={(e) => setDateApplied(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />

              <textarea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                rows={4}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-black py-2 text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : editingJobId ? "Update Job" : "Add Job"}
              </button>
              {editingJobId && (
                <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full rounde-lg border py-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-4">
              <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "all" | JobStatus)
              }
              className="rounded birder px-3 py-2"
              >
                <option value="all"> All</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer"> Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <h2 className="mb-4 text-x1 font-semibold">
              Job List
              </h2>

            {jobs.length === 0 ? (
              <p className="text-gray-600">No jobs yet.</p>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.$id} className="rounded-xl border p-4">
                    <h3 className="text-lg font-semibold">{job.company}</h3>
                    <p className="text-sm text-gray-700">{job.role}</p>
                    <p className="text-sm">Status: {job.status}</p>
                    {job.dateApplied && (
                      <p className="text-sm">Applied: {job.dateApplied}</p>
                    )}
                    {job.notes && (
                      <p className="mt-2 text-sm text-gray-600">{job.notes}</p>
                    )}
                    <button
                    onClick={() => handleEdit(job)}
                    className="mt-2 mr-2 rounded bg-blue-500 px-3 py-1 text-white"
                    >
                      Edit
                    </button>


                    <button
                    onClick={() => handleDelete(job.$id)}
                    className="mt-2 rounded bg-read-500 px-3 py-1 text-white"
                    >
                      Delete
                    </button>
                   
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
} 