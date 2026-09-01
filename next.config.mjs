import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The @camada/* packages are file: symlinks to sibling checkouts; widen Turbopack's
  // project root to the directory containing them so it will resolve through the links.
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
};

export default nextConfig;
