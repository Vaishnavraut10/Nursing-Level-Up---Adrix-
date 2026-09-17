import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';

export default function CourseDetailPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Course Details</h1>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <p className="text-gray-600 mb-4">Course details and MCQ tests will be displayed here after payment.</p>
          <Button>Purchase Course</Button>
        </div>
      </div>
    </MainLayout>
  );
}