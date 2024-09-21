import redis from 'redis';

const client = redis.createClient();
client.on('error', (err) => console.error('Redis Error', err));

export const setUserStatus = (userId: string, status: string) => {
    client.set(`user:${userId}:status`, status);
};

export const getUserStatus = (userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        client.get(`user:${userId}:status`, (err, status) => {
            if (err) reject(err);
            resolve(status);
        });
    });
};