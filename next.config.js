/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use serverExternalPackages to handle better-sqlite3 on the server side
  serverExternalPackages: ["better-sqlite3"],
};

module.exports = nextConfig; 