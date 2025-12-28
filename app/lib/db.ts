import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
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
    status: 'incomplete' | 'pending' | 'approved' | 'rejected';
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
    skills: string[]; // Skills required for the job - used for AI matching
    jobType: string; // Daily Wage, Contract, Permanent, Part-time, Seasonal
    isPublic: boolean;
    moderationStatus?: 'auto-approved' | 'flagged' | 'manual' | 'rejected';
    moderationReason?: string;
    scheduledAt: Timestamp | null;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Available skills for job targeting (matches Flutter app)
export const AVAILABLE_SKILLS = [
    'Agriculture',
    'Construction',
    'Tailoring',
    'Driving',
    'Carpentry',
    'Plumbing',
    'Electrician',
    'Weaving',
    'Fishing',
    'Masonry',
    'Cooking',
    'Security',
];

// Job types (matches Flutter app)
export const JOB_TYPES = [
    'Daily Wage',
    'Contract',
    'Permanent',
    'Part-time',
    'Seasonal',
];

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
        status: isAdmin ? 'approved' : 'incomplete', // Changed from 'pending' to 'incomplete'
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
    // Temporarily removed orderBy to avoid index requirement
    const q = query(usersRef, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => doc.data() as UserProfile);
    // Sort in memory instead
    return users.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

export const getApprovedUsers = async (): Promise<UserProfile[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('status', '==', 'approved'));
    const snapshot = await getDocs(q);
    // Filter out admin users - only count regular approved users
    return snapshot.docs.map(doc => doc.data() as UserProfile).filter(u => u.role !== 'admin');
};

export const getAllJobs = async (): Promise<Job[]> => {
    const jobsRef = collection(db, 'jobs');
    const snapshot = await getDocs(jobsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
};

export const approveUser = async (uid: string) => {
    await updateUserProfile(uid, { status: 'approved' });
};

export const rejectUser = async (uid: string) => {
    await updateUserProfile(uid, { status: 'rejected' });
};

// Job functions
export const createJob = async (userId: string, jobData: Partial<Job>) => {
    // Fetch user profile from users collection to get employer name
    const userProfile = await getUserProfile(userId);

    const jobsRef = collection(db, 'jobs');
    const job = {
        ...jobData,
        userId,
        employerName: userProfile?.displayName || userProfile?.company || 'Unknown Employer',
        employerPhoto: userProfile?.photoURL || '',
        recruiterId: userId,
        isPublic: false,
        scheduledAt: null,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(jobsRef, job);
    return { id: docRef.id, ...job };
};

export const getUserJobs = async (userId: string): Promise<Job[]> => {
    const jobsRef = collection(db, 'jobs');
    // Temporarily removed orderBy to avoid index requirement
    const q = query(jobsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
    // Sort in memory instead
    return jobs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

export const updateJob = async (jobId: string, data: Partial<Job>) => {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, {
        ...data,
        updatedAt: Timestamp.now()
    });
};

export const getJobById = async (jobId: string): Promise<Job | null> => {
    const jobRef = doc(db, 'jobs', jobId);
    const jobDoc = await getDoc(jobRef);

    if (jobDoc.exists()) {
        return { id: jobDoc.id, ...jobDoc.data() } as Job;
    }
    return null;
};

export const getPublicJobs = async (): Promise<Job[]> => {
    const jobsRef = collection(db, 'jobs');
    // Temporarily removed orderBy to avoid index requirement
    const q = query(jobsRef, where('isPublic', '==', true));
    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
    // Sort in memory instead
    return jobs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

// Worker Rating System
export const incrementWorkerRating = async (workerId: string) => {
    const workerRef = doc(db, 'workers', workerId);
    const workerDoc = await getDoc(workerRef);

    if (workerDoc.exists()) {
        const currentRating = workerDoc.data().rating || 0;
        await updateDoc(workerRef, {
            rating: currentRating + 1,
            updatedAt: Timestamp.now()
        });
    }
};

// Application Management
export const getJobApplications = async (jobId: string) => {
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('jobId', '==', jobId));
    const snapshot = await getDocs(q);

    // Fetch worker profiles for each application
    const applications = await Promise.all(
        snapshot.docs.map(async (appDoc) => {
            const appData = appDoc.data();
            const workerId = appData.workerId;

            // Fetch worker profile
            let workerProfile = null;
            if (workerId) {
                const workerRef = doc(db, 'workers', workerId);
                const workerDoc = await getDoc(workerRef);
                if (workerDoc.exists()) {
                    workerProfile = workerDoc.data();
                }
            }

            return {
                id: appDoc.id,
                ...appData,
                workerProfile
            };
        })
    );

    return applications;
};

export const acceptApplication = async (applicationId: string) => {
    const appRef = doc(db, 'applications', applicationId);
    const appDoc = await getDoc(appRef);

    if (appDoc.exists()) {
        const appData = appDoc.data();
        const workerId = appData.workerId;
        const jobId = appData.jobId;

        // Update application status
        await updateDoc(appRef, {
            status: 'accepted',
            acceptedAt: Timestamp.now()
        });

        // Auto-increment worker rating
        await incrementWorkerRating(workerId);

        // Send email notification via API (server-side)
        try {
            await fetch('/api/applications/send-status-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId,
                    status: 'accepted'
                }),
            });
        } catch (emailError) {
            console.error('Failed to trigger acceptance email:', emailError);
        }
    }
};

export const rejectApplication = async (applicationId: string) => {
    const appRef = doc(db, 'applications', applicationId);
    const appDoc = await getDoc(appRef);

    if (appDoc.exists()) {
        const appData = appDoc.data();
        const workerId = appData.workerId;
        const jobId = appData.jobId;

        // Update status
        await updateDoc(appRef, {
            status: 'rejected',
            rejectedAt: Timestamp.now()
        });

        // Send email notification via API (server-side)
        try {
            await fetch('/api/applications/send-status-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId,
                    status: 'rejected'
                }),
            });
        } catch (emailError) {
            console.error('Failed to trigger rejection email:', emailError);
        }
    }
};

export const getJobApplicationCount = async (jobId: string): Promise<number> => {
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('jobId', '==', jobId));
    const snapshot = await getDocs(q);
    return snapshot.size;
};

export const deleteJob = async (jobId: string) => {
    const jobRef = doc(db, 'jobs', jobId);
    await deleteDoc(jobRef);
};
