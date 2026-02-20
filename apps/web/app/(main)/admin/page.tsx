// "use client";
// import React, { useEffect, useState } from 'react';
// import { Search, Filter, MoreVertical, X, Clock, AlertCircle, CheckCircle, User, Activity, CreditCard, FileText, Download, Eye, Ban, LogIn, Key } from 'lucide-react';
// import { getAllUsers } from "@/lib/clerk/currentUser";
// import { use } from "react";
// // Dummy user data
// const dummyUsers = [
//   {
//     id: 'USR-12345',
//     email: 'john.doe@email.com',
//     name: 'John Doe',
//     status: 'active',
//     subscription: 'premium',
//     registrationDate: '2024-01-15',
//     lastLogin: '2026-01-22 10:30 AM',
//     avatar: 'JD',
//     phone: '+1 (555) 123-4567',
//     address: '123 Main St, New York, NY 10001',
//     activityCount: 245,
//     billingHistory: [
//       { date: '2026-01-01', amount: '$29.99', status: 'paid', plan: 'Premium Monthly' },
//       { date: '2025-12-01', amount: '$29.99', status: 'paid', plan: 'Premium Monthly' },
//       { date: '2025-11-01', amount: '$29.99', status: 'paid', plan: 'Premium Monthly' }
//     ],
//     activity: [
//       { type: 'login', timestamp: '2026-01-22 10:30 AM', details: 'Login from Chrome on Windows' },
//       { type: 'feature', timestamp: '2026-01-22 09:15 AM', details: 'Used AI Chat - 15 messages' },
//       { type: 'payment', timestamp: '2026-01-01 08:00 AM', details: 'Subscription renewed - $29.99' }
//     ]
//   },
//   {
//     id: 'USR-12346',
//     email: 'jane.smith@email.com',
//     name: 'Jane Smith',
//     status: 'suspended',
//     subscription: 'basic',
//     registrationDate: '2024-03-22',
//     lastLogin: '2026-01-20 03:45 PM',
//     avatar: 'JS',
//     phone: '+1 (555) 987-6543',
//     address: '456 Oak Ave, San Francisco, CA 94102',
//     activityCount: 128,
//     billingHistory: [
//       { date: '2026-01-01', amount: '$9.99', status: 'paid', plan: 'Basic Monthly' },
//       { date: '2025-12-01', amount: '$9.99', status: 'failed', plan: 'Basic Monthly' }
//     ],
//     activity: [
//       { type: 'suspension', timestamp: '2026-01-21 11:00 AM', details: 'Account suspended - Policy violation' },
//       { type: 'login', timestamp: '2026-01-20 03:45 PM', details: 'Login from Safari on macOS' }
//     ]
//   },
//   {
//     id: 'USR-12347',
//     email: 'bob.wilson@email.com',
//     name: 'Bob Wilson',
//     status: 'active',
//     subscription: 'free',
//     registrationDate: '2025-11-05',
//     lastLogin: '2026-01-22 08:15 AM',
//     avatar: 'BW',
//     phone: '+1 (555) 456-7890',
//     address: '789 Pine Rd, Austin, TX 78701',
//     activityCount: 42,
//     billingHistory: [],
//     activity: [
//       { type: 'login', timestamp: '2026-01-22 08:15 AM', details: 'Login from Firefox on Linux' },
//       { type: 'feature', timestamp: '2026-01-21 07:30 PM', details: 'Used Document Scanner' }
//     ]
//   },
//   {
//     id: 'USR-12348',
//     email: 'alice.johnson@email.com',
//     name: 'Alice Johnson',
//     status: 'active',
//     subscription: 'premium',
//     registrationDate: '2023-08-12',
//     lastLogin: '2026-01-22 11:00 AM',
//     avatar: 'AJ',
//     phone: '+1 (555) 234-5678',
//     address: '321 Elm St, Seattle, WA 98101',
//     activityCount: 892,
//     billingHistory: [
//       { date: '2026-01-01', amount: '$29.99', status: 'paid', plan: 'Premium Monthly' }
//     ],
//     activity: [
//       { type: 'login', timestamp: '2026-01-22 11:00 AM', details: 'Login from Chrome on macOS' }
//     ]
//   }
// ];

// const App = () => {
//   const [users, setUsers] = useState(dummyUsers);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [subscriptionFilter, setSubscriptionFilter] = useState('all');
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [activeTab, setActiveTab] = useState('profile');
//   const [showSuspendModal, setShowSuspendModal] = useState(false);
//   const [impersonating, setImpersonating] = useState(null);
//   const [impersonationTime, setImpersonationTime] = useState(1800);

//   // Filter users
//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.id.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
//     const matchesSubscription = subscriptionFilter === 'all' || user.subscription === subscriptionFilter;
//     return matchesSearch && matchesStatus && matchesSubscription;
//   });

//   // Impersonation timer
//   React.useEffect(() => {
//     if (impersonating) {
//       const timer = setInterval(() => {
//         setImpersonationTime(prev => {
//           if (prev <= 1) {
//             setImpersonating(null);
//             return 1800;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//       return () => clearInterval(timer);
//     }
//   }, [impersonating]);

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'suspended': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getSubscriptionBadge = (sub) => {
//     switch(sub) {
//       case 'premium': return 'bg-purple-100 text-purple-800';
//       case 'basic': return 'bg-blue-100 text-blue-800';
//       case 'free': return 'bg-gray-100 text-gray-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Impersonation Banner */}
//       {impersonating && (
//         <div className="bg-yellow-500 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5" />
//             <span className="font-semibold">Impersonating: {impersonating.name} ({impersonating.email})</span>
//             <span className="bg-yellow-600 px-3 py-1 rounded text-sm">
//               <Clock className="w-4 h-4 inline mr-1" />
//               {formatTime(impersonationTime)}
//             </span>
//           </div>
//           <button
//             onClick={() => setImpersonating(null)}
//             className="bg-white text-yellow-600 px-4 py-2 rounded font-semibold hover:bg-yellow-50"
//           >
//             Exit Impersonation
//           </button>
//         </div>
//       )}

//       {/* Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
//           <p className="text-sm text-gray-600 mt-1">Manage users, subscriptions, and account actions</p>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-6 py-6">
//         {/* Search and Filters */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
//           <div className="flex gap-4 flex-wrap">
//             <div className="flex-1 min-w-[300px]">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search by email, name, or account ID..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>
            
//             <select
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//             >
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="suspended">Suspended</option>
//             </select>

//             <select
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               value={subscriptionFilter}
//               onChange={(e) => setSubscriptionFilter(e.target.value)}
//             >
//               <option value="all">All Subscriptions</option>
//               <option value="premium">Premium</option>
//               <option value="basic">Basic</option>
//               <option value="free">Free</option>
//             </select>
//           </div>
//         </div>

//         {/* Users Table */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subscription</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredUsers.map((user) => (
//                 <tr key={user.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
//                         {user.avatar}
//                       </div>
//                       <div>
//                         <div className="font-semibold text-gray-900">{user.name}</div>
//                         <div className="text-sm text-gray-500">{user.email}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
//                       {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
//                       {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionBadge(user.subscription)}`}>
//                       {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
//                   <td className="px-6 py-4 text-right">
//                     <button
//                       onClick={() => setSelectedUser(user)}
//                       className="text-blue-600 hover:text-blue-800 font-medium mr-3"
//                     >
//                       View
//                     </button>
//                     <button className="text-gray-400 hover:text-gray-600">
//                       <MoreVertical className="w-5 h-5" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="mt-4 flex items-center justify-between">
//           <p className="text-sm text-gray-600">Showing {filteredUsers.length} of {users.length} users</p>
//           <div className="flex gap-2">
//             <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
//               Previous
//             </button>
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
//               1
//             </button>
//             <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* User Detail Modal */}
//       {selectedUser && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
//             {/* Modal Header */}
//             <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-lg">
//                   {selectedUser.avatar}
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
//                   <p className="text-sm text-gray-600">{selectedUser.email}</p>
//                 </div>
//               </div>
//               <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             {/* Tabs */}
//             <div className="border-b border-gray-200">
//               <div className="flex gap-6 px-6">
//                 {['profile', 'subscription', 'activity', 'audit'].map((tab) => (
//                   <button
//                     key={tab}
//                     onClick={() => setActiveTab(tab)}
//                     className={`py-3 border-b-2 font-medium text-sm ${
//                       activeTab === tab
//                         ? 'border-blue-600 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700'
//                     }`}
//                   >
//                     {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Tab Content */}
//             <div className="p-6 overflow-y-auto max-h-[60vh]">
//               {activeTab === 'profile' && (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <label className="text-sm font-semibold text-gray-600">Account ID</label>
//                       <p className="mt-1 text-gray-900">{selectedUser.id}</p>
//                     </div>
//                     <div>
//                       <label className="text-sm font-semibold text-gray-600">Registration Date</label>
//                       <p className="mt-1 text-gray-900">{selectedUser.registrationDate}</p>
//                     </div>
//                     <div>
//                       <label className="text-sm font-semibold text-gray-600">Phone</label>
//                       <p className="mt-1 text-gray-900">{selectedUser.phone}</p>
//                     </div>
//                     <div>
//                       <label className="text-sm font-semibold text-gray-600">Last Login</label>
//                       <p className="mt-1 text-gray-900">{selectedUser.lastLogin}</p>
//                     </div>
//                     <div className="col-span-2">
//                       <label className="text-sm font-semibold text-gray-600">Address</label>
//                       <p className="mt-1 text-gray-900">{selectedUser.address}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {activeTab === 'subscription' && (
//                 <div className="space-y-6">
//                   <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-600">Current Plan</p>
//                         <p className="text-2xl font-bold text-gray-900 capitalize">{selectedUser.subscription}</p>
//                       </div>
//                       <span className={`px-4 py-2 rounded-full text-sm font-medium ${getSubscriptionBadge(selectedUser.subscription)}`}>
//                         Active
//                       </span>
//                     </div>
//                   </div>

//                   <div>
//                     <h3 className="font-semibold text-gray-900 mb-3">Billing History</h3>
//                     <div className="space-y-2">
//                       {selectedUser.billingHistory.length > 0 ? (
//                         selectedUser.billingHistory.map((bill, idx) => (
//                           <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                             <div>
//                               <p className="font-medium text-gray-900">{bill.plan}</p>
//                               <p className="text-sm text-gray-600">{bill.date}</p>
//                             </div>
//                             <div className="text-right">
//                               <p className="font-semibold text-gray-900">{bill.amount}</p>
//                               <span className={`text-xs ${bill.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
//                                 {bill.status.toUpperCase()}
//                               </span>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <p className="text-gray-500 text-center py-4">No billing history available</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {activeTab === 'activity' && (
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3 className="font-semibold text-gray-900">Recent Activity</h3>
//                     <span className="text-sm text-gray-600">{selectedUser.activityCount} total events</span>
//                   </div>
//                   <div className="space-y-3">
//                     {selectedUser.activity.map((act, idx) => (
//                       <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
//                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                           act.type === 'login' ? 'bg-blue-100' :
//                           act.type === 'payment' ? 'bg-green-100' :
//                           act.type === 'suspension' ? 'bg-red-100' :
//                           'bg-purple-100'
//                         }`}>
//                           {act.type === 'login' ? <LogIn className="w-5 h-5 text-blue-600" /> :
//                            act.type === 'payment' ? <CreditCard className="w-5 h-5 text-green-600" /> :
//                            act.type === 'suspension' ? <Ban className="w-5 h-5 text-red-600" /> :
//                            <Activity className="w-5 h-5 text-purple-600" />}
//                         </div>
//                         <div className="flex-1">
//                           <p className="font-medium text-gray-900">{act.details}</p>
//                           <p className="text-sm text-gray-500">{act.timestamp}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {activeTab === 'audit' && (
//                 <div className="text-center py-8 text-gray-500">
//                   <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//                   <p>No audit logs available for this user</p>
//                 </div>
//               )}
//             </div>

//             {/* Modal Actions */}
//             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
//               <button
//                 onClick={() => {
//                   setShowSuspendModal(true);
//                 }}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
//               >
//                 <Ban className="w-4 h-4" />
//                 Suspend Account
//               </button>
//               <button
//                 onClick={() => {
//                   setImpersonating(selectedUser);
//                   setImpersonationTime(1800);
//                   setSelectedUser(null);
//                 }}
//                 className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 flex items-center gap-2"
//               >
//                 <Eye className="w-4 h-4" />
//                 Impersonate User
//               </button>
//               <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
//                 <Key className="w-4 h-4" />
//                 Reset Password
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Suspend Modal */}
//       {showSuspendModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">Suspend User Account</h3>
//             </div>
//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
//                 <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
//                   <option>Policy Violation</option>
//                   <option>Security Concern</option>
//                   <option>User Request</option>
//                   <option>Payment Issue</option>
//                   <option>Other</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
//                 <textarea
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   rows="3"
//                   placeholder="Provide additional context..."
//                 ></textarea>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
//                 <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
//                   <option>7 days</option>
//                   <option>30 days</option>
//                   <option>90 days</option>
//                   <option>Permanent</option>
//                 </select>
//               </div>
//               <div className="flex items-center gap-2">
//                 <input type="checkbox" id="notify" className="rounded" />
//                 <label htmlFor="notify" className="text-sm text-gray-700">Notify user via email</label>
//               </div>
//             </div>
//             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
//               <button
//                 onClick={() => setShowSuspendModal(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   setShowSuspendModal(false);
//                   setSelectedUser(null);
//                 }}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
//               >
//                 Confirm Suspension
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;

import { getAllUsers } from "@/lib/clerk/currentUser";
import AdminClient from "@/components/AdminClient";

export default async function AdminPage() {
  const users = await getAllUsers();

  return <AdminClient ClerkUser={users} />;
}
