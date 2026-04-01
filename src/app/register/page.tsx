"use client";
import Link from "next/link";
import {useState, FormEvent} from "react";
import { useRouter } from "next/navigation";
import { registerUser} from "@/src/services/auth";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const[password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await registerUser(name, email, password);
           
            router.push("/dashboard");
        } catch (err: any) {
            setError(err?.message || "Something went wrong.");
            
        } finally {
            setLoading(false);
        }


    }   
 
 return (
    <main className="flex min-h-screen items-center justofy-center bg-gray-100 px4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
            <h1 className="mb-2 text-3xl font-bold">Create Account</h1>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border px-3 py-2 rounded-lg"
                    required 
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-fullborder px-3 py-2 rounfed-lg"
                        required
                        minLength={8}
                        />

                        <input
                        type="email"
                        placeholder="Email"
                        value={email}  
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-fullborder px-3 py-2 rounfed-lg"
                        required
                        />
                        {error && <p className="text-red-600 text-sm">{error}</p>}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-2 rounded-lg"
                        >
                            {loading ? "Creating..." : "Register"}
                            </button>
                            <p className="mt-4 text-center text-sm text-gray-600">
  Already have an account?{" "}
  <Link href="/login" className="font-semibold text-black underline">
    Login
  </Link>
</p>
        </form>

        </div>
    </main>
    
 );
}