"use client";
import Link from "next/link";
import {useState, FormEvent} from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/src/services/auth";

export default function LoginPage() {

    const router  = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading,setLoading] = useState(false);
    const [error, setError] = useState("");

     async function handleSubmit (e:FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await loginUser(email,password);
           router.push("/dashboard");
        } catch (err: any) {
            setError(err?.message || "Login Failed")
        } finally {
            setLoading(false);

        }
    }

    return(
        <main className= "flex min=h-screen items-center justify-center bg-gray-100 px-4">
            <div className = "w-full max w-md rounded-2xl bg-white p-8 shadow-md">
                <h1 className="mb-2 text-3xl text-gray-600"></h1>
                <p className="mb-6 text-sm text-gray-600">
                    Log in to manage your job applications.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 clock text-sm font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className= "w-full rounded-lg border px-3 py-2 outline-non focus:ring-2 focus:ring-black"
                        required
                        />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium" >Password</label>
                    <input  
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border px-3 py-2 outline-non focus:ring-2 focus:ring-black"
                        required
                        />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg black py-2 text-white transition hover:opacity-90 disaabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}

                </button>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-semibold text-black underline">
                    Register</Link>
                </p>
                </form>
            </div>
        </main>
    )



}