import MainLayout from '@/layouts/MainLayout';

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-center">Google OAuth login will be implemented in Phase 2</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}