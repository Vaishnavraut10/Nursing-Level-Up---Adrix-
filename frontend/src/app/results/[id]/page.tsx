import MainLayout from '@/layouts/MainLayout';

export default function ResultPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Test Results</h1>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <p className="text-gray-600">Your test results will be displayed here.</p>
        </div>
      </div>
    </MainLayout>
  );
}