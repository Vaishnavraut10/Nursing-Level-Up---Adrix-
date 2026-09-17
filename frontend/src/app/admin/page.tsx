export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin/users" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Users</a>
              <a href="/admin/courses" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Courses</a>
              <a href="/admin/tests" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Tests</a>
              <a href="/admin/results" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Results</a>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Active Courses</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">MCQ Tests</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}