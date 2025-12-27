import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    addDoc
} from 'firebase/firestore';
import { db } from './firebase';

// User types
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    bio: string;
    company: string;
    phone: string;
    location: string;
    role: 'user' | 'admin';
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Job types
export interface Job {
    id?: string;
    userId: string;
    title: string;
    description: string;
    location: string;
    salary: string;
    requirements: string;
    isPublic: boolean;
    scheduledAt: Timestamp | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Admin email
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@signalx.com';

// User functions
export const createUserProfile = async (uid: string, email: string, displayName: string, photoURL: string = '') => {
    const isAdmin = email === ADMIN_EMAIL;
    const userRef = doc(db, 'users', uid);
    const userData: UserProfile = {
        uid,
        email,
        displayName,
        photoURL,
        bio: '',
        company: '',
        phone: '',
        location: '',
        role: isAdmin ? 'admin' : 'user',
        status: isAdmin ? 'approved' : 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };
    await setDoc(userRef, userData);
    return userData;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now()
    });
};

export const getPendingUsers = async (): Promise<UserProfile[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
};

export const approveUser = async (uid: string) => {
    await updateUserProfile(uid, { status: 'approved' });
};

export const rejectUser = async (uid: string) => {
    await updateUserProfile(uid, { status: 'rejected' });
};

// Job functions
export const createJob = async (userId: string, jobData: Partial<Job>) => {
    const jobsRef = collection(db, 'jobs');
    const job = {
        ...jobData,
        userId,
        isPublic: false,
        scheduledAt: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(jobsRef, job);
    return { id: docRef.id, ...job };
};

export const getUserJobs = async (userId: string): Promise<Job[]> => {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
};

export const updateJob = async (jobId: string, data: Partial<Job>) => {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, {
        ...data,
        updatedAt: Timestamp.now()
    });
};

export const getPublicJobs = async (): Promise<Job[]> => {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, where('isPublic', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
};
