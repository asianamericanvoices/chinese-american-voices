/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: [
      'images.unsplash.com',
      'your-supabase-project.supabase.co',
      'via.placeholder.com'
    ]
  }
}

module.exports = nextConfig
