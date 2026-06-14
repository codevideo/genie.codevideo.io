import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold">
                <span className="genie-text">CodeVideo</span>
                <span className="text-gray-400 ml-1">Genie</span>
              </span>
            </div>
            <p className="text-gray-500 max-w-sm">
              AI-powered programming tutorials. Learn any concept with personalized video content generated in seconds.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-gray-500 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="https://studio.codevideo.io" target="_blank" className="text-gray-500 hover:text-white transition-colors">
                  Studio
                </Link>
              </li>
              <li>
                <Link href="https://github.com/codevideo" target="_blank" className="text-gray-500 hover:text-white transition-colors">
                  GitHub
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="https://codevideo.io" target="_blank" className="text-gray-500 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:hi@fullstackcraft.com" className="text-gray-500 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="https://codevideo.substack.com" target="_blank" className="text-gray-500 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Full Stack Craft LLC. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm">
            Built with 💜 for developers who love to learn
          </p>
        </div>
      </div>
    </footer>
  )
}
