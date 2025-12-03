'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { Badge } from '@/components/ui/badge';
import { useGetApiDebts } from '@/lib/api/generated/debts/debts';
import { useGetApiConversations } from '@/lib/api/generated/conversations/conversations';
import { useGetApiReminders } from '@/lib/api/generated/reminders/reminders';
import { useQueryClient } from '@tanstack/react-query';

export default function DashboardPage() {
  const { isConnected } = useSocket();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: debts, isLoading: debtsLoading } = useGetApiDebts();
  const { data: conversations, isLoading: conversationsLoading } = useGetApiConversations();
  const { data: reminders, isLoading: remindersLoading } = useGetApiReminders();

  // Calculate stats
  const totalDebts = debts?.length || 0;
  const unpaidDebts = debts?.filter((debt: any) => debt.status === 'unpaid').length || 0;
  const activeConversations = conversations?.length || 0;
  const totalReminders = reminders?.length || 0;

  // Real-time updates via Socket.io
  useSocketEvent('debt:created', () => {
    queryClient.invalidateQueries({ queryKey: ['getApiDebts'] });
  });

  useSocketEvent('debt:updated', () => {
    queryClient.invalidateQueries({ queryKey: ['getApiDebts'] });
  });

  useSocketEvent('debt:deleted', () => {
    queryClient.invalidateQueries({ queryKey: ['getApiDebts'] });
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">BPJS Debt Collector Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage debt collection conversations and reminders</p>
          </div>
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Debts</CardDescription>
              <CardTitle className="text-3xl">
                {debtsLoading ? '-' : totalDebts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {debtsLoading ? 'Loading...' : 'All debt records'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Unpaid Debts</CardDescription>
              <CardTitle className="text-3xl">
                {debtsLoading ? '-' : unpaidDebts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {debtsLoading ? 'Loading...' : 'Pending payments'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Conversations</CardDescription>
              <CardTitle className="text-3xl">
                {conversationsLoading ? '-' : activeConversations}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {conversationsLoading ? 'Loading...' : 'Telegram chats'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Reminders Sent</CardDescription>
              <CardTitle className="text-3xl">
                {remindersLoading ? '-' : totalReminders}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {remindersLoading ? 'Loading...' : 'Total sent'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage users and their information</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Debts</CardTitle>
              <CardDescription>View and manage debt records</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Monitor chatbot conversations</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
