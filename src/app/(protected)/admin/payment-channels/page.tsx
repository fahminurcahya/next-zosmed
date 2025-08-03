"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { formatCurrency, getCategoryInfo, getChannelTypeInfo, SUBSCRIPTION_PLANS, type PaymentChannelData, type PaymentChannelFormData } from "@/types/payment-channel.type";
import { PaymentCategory, PaymentChannelType } from "@prisma/client";
import { Edit, Eye, EyeOff, Loader2, Plus, Trash2, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentChannelForm } from "./_components/form";


const PaymentChannelsAdminPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<PaymentChannelData | undefined>();
  const [filters, setFilters] = useState({
    includeInactive: false,
    type: undefined as PaymentChannelType | undefined,
    category: undefined as PaymentCategory | undefined,
  });

  // Queries
  const {
    data: channelsData,
    refetch: refetchChannels,
    isLoading
  } = api.paymentChannel.listAdmin.useQuery(filters);

  // Mutations
  const deleteMutation = api.paymentChannel.delete.useMutation();
  const toggleStatusMutation = api.paymentChannel.toggleStatus.useMutation();
  const seedDefaultsMutation = api.paymentChannel.seedDefaults.useMutation();

  const channels = channelsData?.data || [];

  const handleEdit = (channel: PaymentChannelData) => {
    setEditingChannel(channel);
    setShowForm(true);
  };

  const handleDelete = async (channel: PaymentChannelData) => {
    if (!confirm(`Are you sure you want to delete ${channel.channelName}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: channel.id });
      toast.success("Payment channel deleted successfully");
      refetchChannels();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete payment channel");
    }
  };

  const handleToggleStatus = async (channel: PaymentChannelData) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: channel.id,
        isActive: !channel.isActive,
      });
      toast.success(`Channel ${!channel.isActive ? 'activated' : 'deactivated'} successfully`);
      refetchChannels();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle channel status");
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("This will create default payment channels. Continue?")) {
      return;
    }

    try {
      const result = await seedDefaultsMutation.mutateAsync();
      toast.success(result.message);
      refetchChannels();
    } catch (error: any) {
      toast.error(error.message || "Failed to seed default channels");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingChannel(undefined);
  };

  const handleFormSuccess = () => {
    refetchChannels();
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Payment Channels</h1>
          <p className="text-muted-foreground">
            Manage payment methods available to your users
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSeedDefaults}
            disabled={seedDefaultsMutation.isPending}
            className="transition-all hover:scale-105"
          >
            {seedDefaultsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Seed Defaults
              </>
            )}
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeInactive"
                  checked={filters.includeInactive}
                  onCheckedChange={(checked) =>
                    setFilters(prev => ({ ...prev, includeInactive: checked }))
                  }
                />
                <Label htmlFor="includeInactive">Include Inactive</Label>
              </div>

              <Select
                value={filters.type || "all"}
                onValueChange={(value) => {
                  setFilters(prev => ({
                    ...prev,
                    type: value === "all" ? undefined : value as PaymentChannelType
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(PaymentChannelType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {getChannelTypeInfo(type).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.category || "all"}
                onValueChange={(value) => {
                  setFilters(prev => ({
                    ...prev,
                    category: value === "all" ? undefined : value as PaymentCategory
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.values(PaymentCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryInfo(category).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground flex items-center">
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  `${channels.length} channel${channels.length !== 1 ? 's' : ''} found`
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Channels Grid */}
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <ChannelCardSkeleton key={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {channels.map((channel: any, index: number) => {
              const typeInfo = getChannelTypeInfo(channel.type);
              const categoryInfo = getCategoryInfo(channel.category);

              return (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="relative hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {channel.logo && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                              style={{
                                backgroundColor: channel.backgroundColor || '#gray'
                              }}
                            >
                              {channel.channelCode.slice(0, 2)}
                            </motion.div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{channel.channelName}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {channel.channelCode}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(channel)}
                              disabled={toggleStatusMutation.isPending}
                            >
                              {toggleStatusMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : channel.isActive ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(channel)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(channel)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Type & Category Badges */}
                      <motion.div
                        className="flex flex-wrap gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Badge className={typeInfo.color}>
                          {typeInfo.icon} {typeInfo.label}
                        </Badge>
                        <Badge variant="outline" className={categoryInfo.color}>
                          {categoryInfo.label}
                        </Badge>
                        {!channel.isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Badge variant="secondary">Inactive</Badge>
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Availability */}
                      <motion.div
                        className="flex gap-4 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center gap-1">
                          <motion.div
                            className={`w-2 h-2 rounded-full ${channel.isOneTimeEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                            animate={{
                              scale: channel.isOneTimeEnabled ? [1, 1.2, 1] : 1,
                            }}
                            transition={{
                              duration: 2,
                              repeat: channel.isOneTimeEnabled ? Infinity : 0,
                              repeatType: "reverse"
                            }}
                          />
                          <span>One-time</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <motion.div
                            className={`w-2 h-2 rounded-full ${channel.isRecurringEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                            animate={{
                              scale: channel.isRecurringEnabled ? [1, 1.2, 1] : 1,
                            }}
                            transition={{
                              duration: 2,
                              repeat: channel.isRecurringEnabled ? Infinity : 0,
                              repeatType: "reverse",
                              delay: 0.5
                            }}
                          />
                          <span>Recurring</span>
                        </div>
                      </motion.div>

                      {/* Limits & Fees */}
                      {(channel.minAmount || channel.maxAmount || channel.processingFee || channel.percentageFee) && (
                        <motion.div
                          className="text-sm space-y-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          {(channel.minAmount || channel.maxAmount) && (
                            <div>
                              <span className="font-medium">Limits: </span>
                              {formatCurrency(channel.minAmount)} - {formatCurrency(channel.maxAmount)}
                            </div>
                          )}
                          {(channel.processingFee || channel.percentageFee) && (
                            <div>
                              <span className="font-medium">Fees: </span>
                              {(channel.processingFee && channel.processingFee > 0) ? formatCurrency(channel.processingFee) : ''}
                              {(channel.percentageFee && channel.percentageFee > 0) ? `${channel.percentageFee}%` : ''}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Plans */}
                      {channel.allowedForPlans.length > 0 && (
                        <motion.div
                          className="text-sm"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <span className="font-medium">Plans: </span>
                          <span className="text-muted-foreground">
                            {channel.allowedForPlans.join(", ")}
                          </span>
                        </motion.div>
                      )}

                      {/* Sort Order */}
                      <motion.div
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        Sort: {channel.sortOrder}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && channels.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardContent className="text-center py-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground mb-4"
              >
                No payment channels found
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Channel
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Form Dialog */}
      <PaymentChannelForm
        channel={editingChannel}
        isOpen={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

// Loading skeleton component
const ChannelCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-20" />
    </CardContent>
  </Card>
);

export default PaymentChannelsAdminPage;

