import { API_BASE_URL } from '../api';

export const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:') || path.startsWith('http')) {
        return path;
    }
    // Remove leading slash if it exists and join with API_BASE_URL
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const cleanBase = API_BASE_URL.replace(/\/$/, '');
    return `${cleanBase}/${cleanPath}`;
};
