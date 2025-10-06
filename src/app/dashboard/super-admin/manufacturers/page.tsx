/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useManufacturers, useManufacturerManagement } from "@/hooks/use-manufacturer";
import { type Manufacturer } from "@/app/api/service/manufacturerService";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/text-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountries } from "@/hooks/use-countries";
import { fallbackCountries } from "@/data/countries";

// Zod schema for form validation
const manufacturerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  code: z.string().min(1, "Code is required").max(20, "Code must be less than 20 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  isActive: z.boolean().default(true),
});

type ManufacturerFormData = z.infer<typeof manufacturerSchema>;

export default function Manufacturers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [manufacturerToDelete, setManufacturerToDelete] = useState<string | null>(null);
    const limit = 10;
      const { countries, loading: countriesLoading, error: countriesError } = useCountries();
const availableCountries = (countries && countries.length > 0)
  ? countries
  : fallbackCountries;

  const { toast } = useToast();

  // Form setup
  const form = useForm<ManufacturerFormData>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      country: "",
      isActive: true,
    },
  });

  // Fetch manufacturers using custom hook
  const { data: manufacturersData, isLoading, error, refetch } = useManufacturers({
    page: currentPage,
    limit,
    search: searchTerm,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  // Mutations using custom hook
  const { createMutation, updateMutation, deleteMutation, isCreating, isUpdating, isDeleting } =
    useManufacturerManagement();

  // Error handling function for specific status codes
  const getErrorMessage = (error: any): string => {
    if (error?.response?.status === 409 || error?.status === 409) {
      return error?.response?.data?.message || "A manufacturer with this email already exists.";
    }
    return error?.response?.data?.message || error?.message || "Unknown error";
  };

  // Event handlers
  const handleOpenModal = (manufacturer?: Manufacturer) => {
    if (manufacturer) {
      setEditingManufacturer(manufacturer);
      form.reset({
        name: manufacturer.name,
        code: manufacturer.code,
        email: manufacturer.email,
        phone: manufacturer.phone,
        address: manufacturer.address || "",
        country: manufacturer.country,
        isActive: manufacturer.isActive,
      });
    } else {
      setEditingManufacturer(null);
      form.reset({
        name: "",
        code: "",
        email: "",
        phone: "",
        address: "",
        country: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingManufacturer(null);
    form.reset();
  };

  const handleSubmit = (data: ManufacturerFormData) => {
    if (editingManufacturer) {
      updateMutation.mutate(
        { id: editingManufacturer.id, data },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Manufacturer updated successfully!",
              variant: "default",
            });
            handleCloseModal();
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: `Failed to update manufacturer: ${getErrorMessage(error)}`,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Manufacturer created successfully!",
            variant: "default",
          });
          handleCloseModal();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to create manufacturer: ${getErrorMessage(error)}`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    setManufacturerToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (manufacturerToDelete) {
      deleteMutation.mutate(manufacturerToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Manufacturer deleted successfully!",
            variant: "default",
          });
          setIsDeleteDialogOpen(false);
          setManufacturerToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to delete manufacturer: ${getErrorMessage(error)}`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((manufacturersData?.meta.itemCount || 0) / limit);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Building2 className="h-6 w-6" />
            Manage Manufacturers
          </h1>
          <p className="text-muted-foreground">
            Manage pharmaceutical manufacturers and their information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Manufacturer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search manufacturers by name or code..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manufacturers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Manufacturers ({manufacturersData?.meta.itemCount || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading manufacturers...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">Failed to load manufacturers</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : manufacturersData?.data.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No manufacturers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first manufacturer."}
              </p>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Manufacturer
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Code</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manufacturersData?.data.map((manufacturer) => (
                    <TableRow key={manufacturer.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{manufacturer.name}</div>
                          <div className="text-sm text-muted-foreground">{manufacturer.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {manufacturer.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {manufacturer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Globe className="h-3 w-3" />
                            {manufacturer.country}
                          </div>
                          {manufacturer.address && (
                            <div className="flex items-start gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mt-0.5" />
                              <span className="line-clamp-2">{manufacturer.address}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={manufacturer.isActive ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}
                        >
                          {manufacturer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(manufacturer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(manufacturer.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * limit) + 1} to{" "}
                    {Math.min(currentPage * limit, manufacturersData?.meta.itemCount || 0)} of{" "}
                    {manufacturersData?.meta.itemCount || 0} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                        if (pageNum > totalPages) return null;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingManufacturer ? "Edit Manufacturer" : "Add New Manufacturer"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...form.register("name")} placeholder="Enter manufacturer name" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" {...form.register("code")} placeholder="Enter manufacturer code" />
              {form.formState.errors.code && (
                <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter email address"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...form.register("phone")} placeholder="Enter phone number" />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

             <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                value={form.watch("country")}
                onValueChange={(value) => form.setValue("country", value)}
                >
                <SelectTrigger>
                    <SelectValue placeholder={countriesLoading ? "Loading countries..." : "Select country"} />
                </SelectTrigger>
                <SelectContent>
                    {countriesError && (
                    <div className="p-2 text-destructive text-sm">
                        Failed to load countries
                    </div>
                    )}
                    {availableCountries.map((country) => (
                    <SelectItem key={country.alpha3Code} value={country.name}>
                        {country.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                {form.formState.errors.country && (
                <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...form.register("address")}
                placeholder="Enter full address"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                id="isActive"
                checked={form.watch("isActive")}
                onCheckedChange={(checked) => form.setValue("isActive", checked)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {editingManufacturer ? "Update" : "Create"} Manufacturer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the manufacturer and remove all
              associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              Delete Manufacturer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}