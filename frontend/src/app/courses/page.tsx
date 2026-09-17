import MainLayout from '@/layouts/MainLayout';
import Card from '@/components/Card';

export default function CoursesPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Nursing Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            title="Fundamentals of Nursing"
            description="Comprehensive introduction to nursing practice"
          >
            <p className="text-gray-600 mb-4">Learn the essential skills and knowledge needed for nursing practice.</p>
          </Card>
          
          <Card 
            title="Medical-Surgical Nursing"
            description="Advanced nursing care for adult patients"
          >
            <p className="text-gray-600 mb-4">Master the care of patients with various medical and surgical conditions.</p>
          </Card>
          
          <Card 
            title="Pediatric Nursing"
            description="Specialized care for infants and children"
          >
            <p className="text-gray-600 mb-4">Develop expertise in caring for pediatric patients and their families.</p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}