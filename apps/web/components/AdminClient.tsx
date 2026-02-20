"use client";
import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, X, Clock, AlertCircle, CheckCircle, User, Activity, CreditCard, FileText, Download, Eye, Ban, LogIn, Key } from 'lucide-react';
import { generateActorToken, getAllUsers, suspendUser, unsuspendUser } from "@/lib/clerk/currentUser";
import { use } from "react";
import { toast } from "sonner";
import { useUser, useSignIn, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export interface UserSubscription {
      subscriptionPlan: string | null;
      subscriptionEndDate: number | null;
      billingHistory: Record<string, unknown>;
}

export interface UserChatSessionsCount {
      TotalChat: number;
      LastChat: string | null; // ISO string or null
}

export interface UserPublicMetadata {
      [key: string]: unknown;
      userPreferences?: unknown;
      subscriptionPlan?: string;
      onboardingComplete?: boolean;
      subscriptionEndDate?: number;
      notifSettings?: unknown;
      isAdmin?: boolean;
}

export interface ClerkUser {
      id: string;
      email: string;
      name: string;
      imageUrl: string;
      status: string;
      createdAt: number;
      lastLogin: number;
      subscription: UserSubscription;
      chatSessionsCount: UserChatSessionsCount;
      publicMetadata: UserPublicMetadata;
}

type AdminClientProps = {
      ClerkUser: ClerkUser[]; // ideally replace `any` with a proper type
};

async function createActorToken(actorId: string, userId: string) {
      const res = await generateActorToken(actorId, userId) // The Server Action to generate the actor token

      if (!res.ok) console.log('Error', res.message)

      return res.token
}

export default function AdminClient({ ClerkUser }: AdminClientProps) {

      const { signOut } = useClerk();
      const { isLoaded, signIn, setActive } = useSignIn()
      const router = useRouter()
      const { isSignedIn, user } = useUser()

      const [users, setUsers] = useState<ClerkUser[]>(Array.isArray(ClerkUser) ? ClerkUser : []);
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState('all');
      const [subscriptionFilter, setSubscriptionFilter] = useState('all');
      const [selectedUser, setSelectedUser] = useState<ClerkUser | null>(null);
      const [activeTab, setActiveTab] = useState('profile');
      const [showSuspendModal, setShowSuspendModal] = useState(false);
      const [impersonating, setImpersonating] = useState(null);
      const [impersonationTime, setImpersonationTime] = useState(1800);
      const [suspendReason, setSuspendReason] = useState("Policy Violation");
      const [suspendDetails, setSuspendDetails] = useState("");
      const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
      // Filter users
      const filteredUsers = users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            const matchesSubscription = subscriptionFilter === 'all' || user.subscription.subscriptionPlan === subscriptionFilter;
            return matchesSearch && matchesStatus && matchesSubscription;
      });

      // Impersonation timer
      React.useEffect(() => {
            if (impersonating) {
                  const timer = setInterval(() => {
                        setImpersonationTime(prev => {
                              if (prev <= 1) {
                                    setImpersonating(null);
                                    return 1800;
                              }
                              return prev - 1;
                        });
                  }, 1000);
                  return () => clearInterval(timer);
            }
      }, [impersonating]);


      async function impersonateUser(actorId: string, userId: string) {
            if (!isLoaded) return

            const actorToken = await createActorToken(actorId, userId)

            // Sign in as the impersonated user
            if (actorToken) {

                  await signOut()

                  try {
                        const { createdSessionId } = await signIn.create({
                              strategy: 'ticket',
                              ticket: actorToken,
                        })

                        await setActive({ session: createdSessionId })

                        router.push('/')
                  } catch (err) {
                        // See https://clerk.com/docs/guides/development/custom-flows/error-handling
                        // for more info on error handling
                        console.error(JSON.stringify(err, null, 2))
                  }
            }
      }

      const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      function formatAustralianDate(ts: number | string) {
            if (!ts) return "—";

            const date = new Date(Number(ts));

            const datePart = date.toLocaleDateString("en-AU", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  timeZone: "Australia/Sydney",
            });

            const timePart = date.toLocaleTimeString("en-AU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Australia/Sydney",
            });

            return `${datePart} (${timePart})`;
      }


      const getStatusColor = (status: string) => {
            switch (status) {
                  case 'active': return 'bg-green-100 text-green-800';
                  case 'suspended': return 'bg-red-100 text-red-800';
                  default: return 'bg-gray-100 text-gray-800';
            }
      };

      const getSubscriptionBadge = (sub: string | null) => {
            switch (sub) {
                  case 'premium': return 'bg-purple-100 text-purple-800';
                  case 'basic': return 'bg-blue-100 text-blue-800';
                  case 'free-trial': return 'bg-gray-100 text-gray-800';
                  default: return 'bg-gray-50 text-gray-600';
            }
      };

      return (
            <div className="min-h-screen bg-gray-50">
                  {/* Impersonation Banner */}
                  {/* {impersonating && (
                        <div className="bg-yellow-500 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                              <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-semibold">Impersonating: {impersonating.name} ({impersonating.email})</span>
                                    <span className="bg-yellow-600 px-3 py-1 rounded text-sm">
                                          <Clock className="w-4 h-4 inline mr-1" />
                                          {formatTime(impersonationTime)}
                                    </span>
                              </div>
                              <button
                                    onClick={() => setImpersonating(null)}
                                    className="bg-white text-yellow-600 px-4 py-2 rounded font-semibold hover:bg-yellow-50"
                              >
                                    Exit Impersonation
                              </button>
                        </div>
                  )} */}

                  {/* Header */}
                  <header className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                              <p className="text-sm text-gray-600 mt-1">Manage users, subscriptions, and account actions</p>
                        </div>
                  </header>

                  <div className="max-w-7xl mx-auto px-6 py-6">
                        {/* Search and Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                              <div className="flex gap-4 flex-wrap">
                                    <div className="flex-1 min-w-[300px]">
                                          <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                      type="text"
                                                      placeholder="Search by email, name, or account ID..."
                                                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                      value={searchTerm}
                                                      onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                          </div>
                                    </div>

                                    <select
                                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                          value={statusFilter}
                                          onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                          <option value="all">All Status</option>
                                          <option value="active">Active</option>
                                          <option value="suspended">Suspended</option>
                                    </select>

                                    <select
                                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                          value={subscriptionFilter}
                                          onChange={(e) => setSubscriptionFilter(e.target.value)}
                                    >
                                          <option value="all">All Subscriptions</option>
                                          <option value="premium">Premium</option>
                                          <option value="basic">Basic</option>
                                          <option value="free-trial">Free</option>
                                    </select>
                              </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                              <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                          <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subscription</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                          </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                          {filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                      <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                                                                        {user.imageUrl ? (<img src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full" />) : (user.name.charAt(0).toUpperCase())}
                                                                  </div>
                                                                  <div>
                                                                        <div className="font-semibold text-gray-900">{user.name}</div>
                                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                                  </div>
                                                            </div>
                                                      </td>
                                                      <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                                  {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                                                                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                            </span>
                                                      </td>
                                                      <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionBadge(user.subscription.subscriptionPlan)}`}>
                                                                  {user.subscription.subscriptionPlan ? user.subscription.subscriptionPlan.charAt(0).toUpperCase() + user.subscription.subscriptionPlan.slice(1) : 'NO PLAN'}
                                                            </span>
                                                      </td>
                                                      <td className="px-6 py-4 text-sm text-gray-600">{formatAustralianDate(user.lastLogin)}</td>
                                                      <td className="px-6 py-4 text-right">
                                                            <button
                                                                  onClick={() => setSelectedUser(user)}
                                                                  className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                                                            >
                                                                  View
                                                            </button>
                                                            <button className="text-gray-400 hover:text-gray-600">
                                                                  <MoreVertical className="w-5 h-5" />
                                                            </button>
                                                      </td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                              <p className="text-sm text-gray-600">Showing {filteredUsers.length} of {users.length} users</p>
                              <div className="flex gap-2">
                                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                          Previous
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                          1
                                    </button>
                                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                          Next
                                    </button>
                              </div>
                        </div>
                  </div>

                  {/* User Detail Modal */}
                  {selectedUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
                              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                    {/* Modal Header */}
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-lg">
                                                      {selectedUser.imageUrl ? (<img src={selectedUser.imageUrl} alt={selectedUser.name} className="w-12 h-12 rounded-full" />) : (selectedUser.name.charAt(0).toUpperCase())}
                                                </div>
                                                <div>
                                                      <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                                                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                                </div>
                                          </div>
                                          <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                                                <X className="w-6 h-6" />
                                          </button>
                                    </div>

                                    {/* Tabs */}
                                    <div className="border-b border-gray-200">
                                          <div className="flex gap-6 px-6">
                                                {['profile', 'subscription', 'activity', 'audit'].map((tab) => (
                                                      <button
                                                            key={tab}
                                                            onClick={() => setActiveTab(tab)}
                                                            className={`py-3 border-b-2 font-medium text-sm ${activeTab === tab
                                                                  ? 'border-blue-600 text-blue-600'
                                                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                                                                  }`}
                                                      >
                                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                      </button>
                                                ))}
                                          </div>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                                          {activeTab === 'profile' && (
                                                <div className="space-y-6">
                                                      <div className="grid grid-cols-2 gap-6">
                                                            <div>
                                                                  <label className="text-sm font-semibold text-gray-600">Account ID</label>
                                                                  <p className="mt-1 text-gray-900">{selectedUser.id}</p>
                                                            </div>
                                                            <div>
                                                                  <label className="text-sm font-semibold text-gray-600">Registration Date</label>
                                                                  <p className="mt-1 text-gray-900">{formatAustralianDate(selectedUser.createdAt)}</p>
                                                            </div>
                                                            {/* <div>
                                                                  <label className="text-sm font-semibold text-gray-600">Phone</label>
                                                                  <p className="mt-1 text-gray-900">{selectedUser.phone}</p>
                                                            </div> */}
                                                            <div>
                                                                  <label className="text-sm font-semibold text-gray-600">Last Login</label>
                                                                  <p className="mt-1 text-gray-900">{formatAustralianDate(selectedUser.lastLogin)}</p>
                                                            </div>
                                                            {/* <div className="col-span-2">
                                                                  <label className="text-sm font-semibold text-gray-600">Address</label>
                                                                  <p className="mt-1 text-gray-900">{selectedUser.address}</p>
                                                            </div> */}
                                                      </div>
                                                </div>
                                          )}

                                          {activeTab === 'subscription' && (
                                                <div className="space-y-6">
                                                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                                                            <div className="flex items-center justify-between">
                                                                  <div>
                                                                        <p className="text-sm text-gray-600">Current Plan</p>
                                                                        <p className="text-2xl font-bold text-gray-900 capitalize">{selectedUser.subscription.subscriptionPlan ? selectedUser.subscription.subscriptionPlan : "No Plan"}</p>
                                                                  </div>
                                                                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${selectedUser.subscription.subscriptionPlan ? getSubscriptionBadge(selectedUser.subscription.subscriptionPlan) : ''}`}>
                                                                        {selectedUser.subscription.subscriptionPlan ? "Active" : "Inactive"}
                                                                  </span>
                                                            </div>
                                                      </div>

                                                      <div>
                                                            <h3 className="font-semibold text-gray-900 mb-3">Billing History</h3>
                                                            <div className="space-y-2">
                                                                  {Array.isArray(selectedUser.subscription.billingHistory) && selectedUser.subscription.billingHistory.length > 0 ? (
                                                                        (selectedUser.subscription.billingHistory as any[]).map((bill, idx) => (
                                                                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                                    <div>
                                                                                          <p className="font-medium text-gray-900">{bill.plan}</p>
                                                                                          <p className="text-sm text-gray-600">{bill.date}</p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                          <p className="font-semibold text-gray-900">{bill.amount}</p>
                                                                                          <span className={`text-xs ${bill.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                                                                                                {bill.status.toUpperCase()}
                                                                                          </span>
                                                                                    </div>
                                                                              </div>
                                                                        ))
                                                                  ) : (
                                                                        <p className="text-gray-500 text-center py-4">No billing history available</p>
                                                                  )}
                                                            </div>
                                                      </div>
                                                </div>
                                          )}

                                          {activeTab === 'activity' && (
                                                <div className="space-y-4">
                                                      <div className="flex items-center justify-between">
                                                            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                                                            {/* <span className="text-sm text-gray-600">{selectedUser.activityCount} total events</span> */}
                                                      </div>
                                                      <div className="space-y-3">
                                                            {/* {selectedUser.activity.map((act, idx) => (
                                                                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${act.type === 'login' ? 'bg-blue-100' :
                                                                              act.type === 'payment' ? 'bg-green-100' :
                                                                                    act.type === 'suspension' ? 'bg-red-100' :
                                                                                          'bg-purple-100'
                                                                              }`}>
                                                                              {act.type === 'login' ? <LogIn className="w-5 h-5 text-blue-600" /> :
                                                                                    act.type === 'payment' ? <CreditCard className="w-5 h-5 text-green-600" /> :
                                                                                          act.type === 'suspension' ? <Ban className="w-5 h-5 text-red-600" /> :
                                                                                                <Activity className="w-5 h-5 text-purple-600" />}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                              <p className="font-medium text-gray-900">{act.details}</p>
                                                                              <p className="text-sm text-gray-500">{formatAustralianDate(act.timestamp)}</p>
                                                                        </div>
                                                                  </div>
                                                            ))} */}
                                                            {/* Show latest chat info from Clerk data */}
                                                            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                                                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                                                                        <Activity className="w-5 h-5 text-blue-600" />
                                                                  </div>
                                                                  <div className="flex-1">
                                                                        <p className="font-medium text-gray-900">
                                                                              Last Chat Updated
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                              {selectedUser.chatSessionsCount?.LastChat
                                                                                    ? formatAustralianDate(selectedUser.chatSessionsCount.LastChat)
                                                                                    : "No chat history"}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                              Total Chats: {selectedUser.chatSessionsCount?.TotalChat ?? 0}
                                                                        </p>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                </div>
                                          )}

                                          {activeTab === 'audit' && (
                                                <div className="text-center py-8 text-gray-500">
                                                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                                      <p>No audit logs available for this user</p>
                                                </div>
                                          )}
                                    </div>

                                    {/* Modal Actions */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                                          {selectedUser.status === 'active' ? (
                                                <button
                                                      onClick={() => {
                                                            setShowSuspendModal(true);
                                                      }}
                                                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
                                                >
                                                      <Ban className="w-4 h-4" />
                                                      Suspend Account
                                                </button>
                                          ) : (
                                                <button
                                                      onClick={() => setShowUnsuspendModal(true)}
                                                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
                                                >
                                                      <CheckCircle className="w-4 h-4" />
                                                      Unsuspend Account
                                                </button>
                                          )}
                                          <button
                                                onClick={async () => {
                                                      // setImpersonating(selectedUser);
                                                      // setImpersonationTime(1800);
                                                      if (!isSignedIn) {
                                                            // Handle signed out state
                                                            return null
                                                      }
                                                      setSelectedUser(null);
                                                      await impersonateUser(user.id, selectedUser.id)
                                                }}
                                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 flex items-center gap-2"
                                          >
                                                <Eye className="w-4 h-4" />
                                                Impersonate User
                                          </button>
                                          {/* <button
                                                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                onClick={async ()=>{

                                                }}
                                          >
                                                <Key className="w-4 h-4" />
                                                Reset Password
                                          </button> */}
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* Suspend Modal */}
                  {showSuspendModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                          <h3 className="text-lg font-semibold text-gray-900">Suspend User Account</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                                                <select
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      required
                                                      value={suspendReason}
                                                      onChange={e => setSuspendReason(e.target.value)}
                                                >
                                                      <option>Policy Violation</option>
                                                      <option>Security Concern</option>
                                                      <option>User Request</option>
                                                      <option>Payment Issue</option>
                                                      <option>Other</option>
                                                </select>
                                          </div>
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                                                <textarea
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      rows={3}
                                                      placeholder="Provide additional context..."
                                                      required
                                                      value={suspendDetails}
                                                      onChange={e => setSuspendDetails(e.target.value)}
                                                ></textarea>
                                          </div>
                                          {/* <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                                      <option>7 days</option>
                                                      <option>30 days</option>
                                                      <option>90 days</option>
                                                      <option>Permanent</option>
                                                </select>
                                          </div> */}
                                          {/* <div className="flex items-center gap-2">
                                                <input type="checkbox" id="notify" className="rounded" />
                                                <label htmlFor="notify" className="text-sm text-gray-700">Notify user via email</label>
                                          </div> */}
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end rounded-b-[1rem]">
                                          <button
                                                onClick={() => setShowSuspendModal(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                                          >
                                                Cancel
                                          </button>
                                          <button
                                                disabled={!suspendReason || !suspendDetails.trim() || !selectedUser}
                                                onClick={async () => {
                                                      if (!selectedUser) return;
                                                      setShowSuspendModal(false);
                                                      setSelectedUser(null);
                                                      await suspendUser(selectedUser.id);
                                                      setUsers(prev =>
                                                            prev.map(u =>
                                                                  u.id === selectedUser.id ? { ...u, status: "suspended" } : u
                                                            )
                                                      );
                                                      toast.success(`User ${selectedUser.name} has been suspended.`);
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                                                style={{ opacity: !suspendReason || !suspendDetails.trim() || !selectedUser ? 0.5 : 1, cursor: !suspendReason || !suspendDetails.trim() || !selectedUser ? "not-allowed" : "pointer" }}
                                          >
                                                Confirm Suspension
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}

                  {showUnsuspendModal && selectedUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                          <h3 className="text-lg font-semibold text-gray-900">Unsuspend User Account</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                          <p className="text-gray-700">
                                                Are you sure you want to <span className="font-semibold text-green-700">unban</span> <span className="font-semibold">{selectedUser.name}</span>?
                                          </p>
                                          <p className="text-sm text-gray-500">
                                                This will restore their access to the platform.
                                          </p>
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                                          <button
                                                onClick={() => setShowUnsuspendModal(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                                          >
                                                Cancel
                                          </button>
                                          <button
                                                onClick={async () => {
                                                      if (!selectedUser) return;
                                                      setShowUnsuspendModal(false);
                                                      setSelectedUser(null);
                                                      setUsers(prev =>
                                                            prev.map(u =>
                                                                  u.id === selectedUser.id ? { ...u, status: "active" } : u
                                                            )
                                                      );
                                                      await unsuspendUser(selectedUser.id);
                                                      toast.success(`User ${selectedUser.name} has been unsuspended.`);
                                                }}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                                          >
                                                Confirm Unsuspend
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}

function signOut() {
      throw new Error('Function not implemented.');
}
