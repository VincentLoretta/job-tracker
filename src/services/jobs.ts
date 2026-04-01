import { ID, Permission, Query, Role } from "appwrite";
import { databases } from "../lib/appwrite";

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_JOB_COLLECTION_ID!;

export type JobStatus = "applied" | "interview" | "offer" | "rejected";

export type Job = {
    $id? : string;
    userId: string;
    company: string;
    role: string;
    status: JobStatus;
    dateApplied?: string;
    notes?: string;
};

export async function createJob(job:Job) {
    return databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        job,
        [
            Permission.read(Role.user(job.userId)),
            Permission.update(Role.user(job.userId)),
            Permission.delete(Role.user(job.userId)),
        ]

    );

    
}

export async function getJobs(userId:string) {
    return databases.listDocuments(databaseId, collectionId, [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
    ]);
}

export async function deleteJob(jobId:string) {
    return databases.deleteDocument(
        databaseId,
        collectionId,
        jobId 

    );
    
}

export async function updateJob(jobId:string,
    data: {
        company: string;
        role: string;
        status: JobStatus;
        dateApplied?: string;
        notes?: string;
    }
) {
    return databases.updateDocument(
        databaseId,
        collectionId,
        jobId,
        data
    );
}