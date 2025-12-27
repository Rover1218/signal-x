// Parse Cloudinary URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
export function parseCloudinaryUrl(url: string) {
    // Format: cloudinary://api_key:api_secret@cloud_name
    const match = url.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (match) {
        return {
            apiKey: match[1],
            apiSecret: match[2],
            cloudName: match[3]
        };
    }
    return null;
}

export function getCloudinaryCloudName(): string {
    const url = process.env.NEXT_PUBLIC_CLOUDINARY_URL || '';
    const parsed = parseCloudinaryUrl(url);
    return parsed?.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
}

export function getCloudinaryConfig() {
    const url = process.env.NEXT_PUBLIC_CLOUDINARY_URL || '';
    return parseCloudinaryUrl(url);
}
