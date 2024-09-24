import redis from 'redis';

const client = redis.createClient();
client.on('error', (err) => console.error('Redis Error', err));

export const setUserStatus = (userId: string, status: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        client.set(`user:${userId}:status`, status, (err) => {
            if (err) {
                console.error(`Failed to set status for user ${userId}:`, err);
                return reject(err);
            }
            resolve();
        });
    });
};

export const getUserStatus = (userId: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        client.get(`user:${userId}:status`, (err, status) => {
            if (err) {
                console.error(`Failed to get status for user ${userId}:`, err);
                return reject(err);
            }
            resolve(status);
        });
    });
};