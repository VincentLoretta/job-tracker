import { ID } from "appwrite";
import {account} from "../lib/appwrite";


export async function registerUser(
    name: string,
    email: string,
    password: string

) {
    return account.create(ID.unique(), email, password, name);
}

export async function loginUser(email: string, password: string){
    return account.createEmailPasswordSession(email, password);
}

export async function logoutUser() {
    return account.deleteSession("current");
}

export async function  getCurrentUser() {
    try {
        return await account.get();
    } catch {
        return null;
    }
}