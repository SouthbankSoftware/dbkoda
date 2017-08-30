import fp from 'find-free-port';

export default function(startPortRange, endPortRange, host) {
  return new Promise((resolve, reject) => {
    fp(startPortRange, endPortRange, host, (err, freePort) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(freePort);
      }
    });
  });
}
