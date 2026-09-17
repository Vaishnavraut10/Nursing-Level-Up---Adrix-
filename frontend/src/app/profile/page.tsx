import MainLayout from '@/layouts/MainLayout';
import Card from '@/components/Card';

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
        <div className="max-w-2xl">
          <Card title="Profile Information" description="Manage your account details">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-600">Student Name</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-600">student@example.com</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}