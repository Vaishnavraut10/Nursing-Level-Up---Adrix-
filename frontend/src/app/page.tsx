import MainLayout from '@/layouts/MainLayout';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function Home() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to NurseLearn
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive platform for nursing education and MCQ practice
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card 
            title="Quality Courses"
            description="Access expert-designed nursing courses"
          >
            <p className="text-gray-600">Comprehensive curriculum covering all essential nursing topics.</p>
          </Card>
          
          <Card 
            title="MCQ Practice"
            description="Test your knowledge with interactive MCQs"
          >
            <p className="text-gray-600">Practice with thousands of questions and get instant feedback.</p>
          </Card>
          
          <Card 
            title="Track Progress"
            description="Monitor your learning journey"
          >
            <p className="text-gray-600">Detailed analytics to help you improve and succeed.</p>
          </Card>
        </div>
        
        <div className="text-center">
          <Button size="lg">
            Get Started
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}