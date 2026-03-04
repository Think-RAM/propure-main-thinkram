import { RoutesTable } from "@/components/RoutesTable";
import { StatusMenu } from "@/components/StatusMenu";

export default function AdminLocations() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Locations Management</h1>
          <p className="mt-2 text-gray-600">
            View and bulk update the status of routes across different suburbs
            and postcodes.
          </p>
        </div>

        {/* Status Menu */}
        <div className="mb-6 flex justify-end">
          <StatusMenu />
        </div>

        {/* Routes Table */}
        <div className="bg-white">
          <RoutesTable />
        </div>
      </div>
    </main>
  );
}