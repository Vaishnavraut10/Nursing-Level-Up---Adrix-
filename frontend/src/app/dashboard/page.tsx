import MainLayout from '@/layouts/MainLayout';
import Card from '@/components/Card';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="My Courses" description="View your enrolled courses">
            <p className="text-gray-600">You have 0 enrolled courses.</p>
          </Card>
          
          <Card title="Recent Tests" description="Your recent MCQ test attempts">
            <p className="text-gray-600">No recent test attempts.</p>
          </Card>
          
          <Card title="Progress" description="Track your learning progress">
            <p className="text-gray-600">Start learning to see your progress.</p>
          </Card>
          
          <Card title="Results" description="View your test results">
            <p className="text-gray-600">No results available yet.</p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}